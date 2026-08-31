/* =====================================================================
   _t-testa-corpo.js — IL COLPO DI TESTA HA UN CORPO (29 agosto 2026).

   LA DIAGNOSI, in tre righe di codice che chiunque puo' rileggere.
   Il colpo di testa come MECCANICA esiste dal 28 agosto (commit 8e46b4f,
   «il pallone alto smette di passare e basta»): updateBall cerca chi sta
   sotto un pallone fra quota 26 e 46, e chiama colpoDiTesta, che cambia
   la velocita' del pallone, conta il tiro nel tabellino, suona il colpo.
   Tutto vero. Ma colpoDiTesta scrive  q.kickCd / q.kickT / q.kickB  e
   NON scrive mai  q.kickClip. Dieci righe piu' in la', rigStato legge:

       if(p.kickT>0 || p.kickB>0){
         const c = p.kickClip||'passaggio', ...

   Il  ||'passaggio'  e' il ripiego, ed e' quello che va in scena: il
   giocatore INCORNA CON LA GAMBA. Il pallone parte dalla fronte, il
   corpo fa il gesto del passaggio rasoterra. Non e' una posa brutta:
   e' la posa SBAGLIATA, cioe' il caso in cui il gioco mente su cio'
   che sta accadendo. E' il caso capofila della famiglia F2 dello scavo
   (_analisi/ONDA-ANIMAZIONE.md, «i gesti senza corpo», 12 voci): una
   meccanica che esiste, muove il pallone e conta nel tabellino — e il
   corpo non lo dice.

   PERCHE' NON C'E' IL SALTO, ed e' una scelta, non una dimenticanza.
   La finestra di quota e' 26..46 e la costante si chiama Z_TESTA_MAX
   con scritto accanto «fin qui un corpo IN PIEDI gioca il pallone di
   testa». Il gioco non ha (ancora) lo stacco aereo: nessuno salta,
   nessuno vola. Disegnare qui una posa in volo vorrebbe dire mettere in
   scena un salto che la fisica non fa — lo stesso peccato di adesso, al
   contrario. Quindi la posa e' quella vera: si carica sulle gambe, si
   inarca indietro, FRUSTA di collo e busto, e si rialza sulle punte
   nell'attimo del contatto. La crescita verticale della figura non
   viene da un volo, viene da +0,16 di bacino sulle punte: sullo schermo
   e' la stessa cosa, ed e' onesta.

   LA CURA — quattro ancoraggi, nessun dado(), nessun ramo nuovo nella
   fisica:
     1. poseTesta(u) e pallaTesta(u,o): la clip nuova. Vive nel piano
        sagittale come le altre, con il contatto alla fase 0,36.
     2. CLIPS.testa: la registra (senza questa, CLIPS[clip] e'
        undefined e il gioco muore al primo colpo di testa).
     3. RIG_CALCI.testa = 0,30: la fase da cui parte il seguito. Come
        per le altre quattro, quello che sta PRIMA di 0,30 si vede solo
        nel provino, perche' il colpo di testa non ha carica (nessuno lo
        annuncia: il pallone arriva e il collo frusta).
     4. colpoDiTesta scrive q.kickClip='testa'.

   NESSUN RESIDUO, e si vede da dove: kickClip viene RISCRITTO da ogni
   calcio coi piedi (riga «Qui passa OGNI calcio del gioco»), quindi il
   valore 'testa' non sopravvive al gesto successivo. Non serve pulirlo.

   IL SEGUITO NON CAMBIA DURATA. colpoDiTesta gia' metteva kickT=0.2 e
   kickB=0.24 — cioe' i cronometri del seguito erano gia' accesi, e sono
   proprio loro che oggi fanno percorrere la clip del passaggio. Questa
   patch non tocca un solo numero della fisica: cambia SOLTANTO quale
   posa quei cronometri percorrono. Il pallone si muove uguale al bit.

   LA GABBIA DELLE PROPORZIONI. La somma armOut+armApri resta sotto
   0,222 (= UA·sin(1,05) con le braccia piu' corte): il massimo qui e'
   0,06+0,15 = 0,21 in carica. Sopra quel numero la scatola degli angoli
   TAGLIA il braccio invece di allargarlo — sta scritto in poseCalcio, e
   costa un provino cieco scoprirlo a mano.

   TUTTE LE CURVE TORNANO AL VALORE DI PARTENZA (la regola di casa: giro
   senza scatti). Verificato a mano, coefficiente per coefficiente, in
   fondo a ogni riga: la somma algebrica dei termini a u=0,99 e' il
   valore base. Se qualcuno cambia un numero, deve rifare quella somma.

   uso:  node strumenti/_t-testa-corpo.js --out fuori/testa.html
         node strumenti/_t-testa-corpo.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/testa.html'));

const ANCORE = [

/* 1 — la posa nuova, subito dopo le quattro di calcio */
{
  nome: '1/4 poseTesta e pallaTesta',
  cerca:
`function poseTiro(u){ poseCalcio(u,Q_TIRO); }`,
  metti:
`function poseTiro(u){ poseCalcio(u,Q_TIRO); }

/* IL COLPO DI TESTA — e' un gesto di COLLO, non di gamba.
   Le quattro clip qui sopra passano tutte da poseCalcio, che e' un
   motore parametrico costruito attorno a UNA GAMBA CHE FRUSTA: ha
   q.back, q.fwd, q.kneeImp, la gamba d'appoggio piantata accanto alla
   palla. Nessuno di quei parametri descrive una testa. Provare a
   piegare poseCalcio al colpo di testa avrebbe voluto dire aggiungere
   sei campi che le altre quattro leggono come zero — e una posa nuova
   scritta a mano costa meno di un motore che finge.

   I QUATTRO TEMPI, e il contatto sta al terzo:
     0,08-0,30  CARICA   ginocchia flesse, busto e collo INDIETRO,
                         braccia aperte a bilanciere
     0,30-0,365 FRUSTATA busto e collo scattano avanti, il bacino sale
                         sulle punte: la figura CRESCE nel momento in
                         cui deve arrivare al pallone
     0,36       CONTATTO la gaussiana imp, larga 0,035
     0,365-0,58 SEGUITO  il busto continua, le braccia scendono
     0,62-0,97  RIENTRO  tutto torna al valore di partenza

   In partita si vede da 0,30 in poi (RIG_CALCI.testa), perche' il
   colpo di testa non ha carica: il pallone arriva e basta. La carica
   e' disegnata lo stesso — serve al provino, e serve il giorno che
   qualcuno dara' un anticipo a questo gesto. */
function poseTesta(u){
  const car = sm(u,0.08,0.30);          // il caricamento
  const fru = sm(u,0.30,0.365);         // la frustata
  const seg = sm(u,0.365,0.58);         // il seguito
  const rit = sm(u,0.62,0.97);          // il rientro
  const di=(u-0.36)/0.035, imp=Math.exp(-di*di);      // l'attimo del colpo
  const p=u-0.36, osc = p>0 ? Math.sin(p*9)*Math.exp(-5*p) : 0;
  /* IL BACINO SALE SULLE PUNTE nella frustata: e' la sola crescita
     verticale che questa camera concede a un uomo che non salta.
     somma a u=0,99:  -0,10+0,16-0,05-0,01 = 0  ->  0,93 */
  const pelvY = 0.93 - 0.10*car + 0.16*fru - 0.05*seg - 0.01*rit + 0.012*osc;
  /* lean positivo = busto AVANTI (la convenzione di poseFrenata, dove
     il peso indietro e' -0,38).  somma: -0,30+0,62+0,10-0,42 = 0 */
  const lean = -0.30*car + 0.62*fru + 0.10*seg - 0.42*rit + 0.06*osc;
  /* il CENNO del collo: corpo() lo moltiplica per CENNO (=4), quindi
     0,108 qui sono 0,43 rad di frustata vera. E' il numero piu' grande
     della posa perche' e' il gesto.  somma: -0,052+0,108-0,030-0,026 = 0 */
  const cenno = -0.052*car + 0.108*fru - 0.030*seg - 0.026*rit + 0.010*osc;
  corpo(pelvY,0,lean,cenno);
  const sl=Math.sin(lean), cl=Math.cos(lean);
  const shY=pelvY+0.44*cl, shZ=0.44*sl;
  /* BRACCIA A BILANCIERE: salgono in carica (chi stacca di testa apre
     le braccia per non cadere), la destra piu' della sinistra — due
     braccia simmetriche sono un disegno solo.
     somme:  0,62-0,50-0,12 = 0   e   0,38-0,20-0,10-0,08 = 0 */
  const aR = 0.62*car - 0.50*seg - 0.12*rit + 0.06*osc;
  const aL = 0.38*car - 0.20*fru - 0.10*seg - 0.08*rit;
  /* I GOMITI SI DIVIDONO, come in poseCalcio e per la stessa ragione:
     due flessioni uguali sono due tratti paralleli, cioe' una forma
     sola in maschera nera. Il destro si STENDE, il sinistro TIENE.
     somme:  0,30 +0,55-0,35-0,20 = 0,30   e   0,55 -0,13+0,30-0,17 = 0,55

     IL SINISTRO NON PUO' CHIUDERSI IN CARICA, e il perche' e' un conto,
     non un gusto. braccio() impone  eMin = 0,12 + 0,29·|out/UA| : un
     braccio APERTO non ha il gomito chiuso. In carica out arriva a 0,21
     e UA vale 0,27·b, quindi eMin sale fino a 0,357 con le braccia piu'
     corte (b 0,95). La prima scrittura di questa posa metteva il gomito
     sinistro a 0,30 proprio li' — sotto la soglia — e il clamp lo
     riscriveva: 648 tagli su 4096 valutazioni (1024 fasi x 4
     corporature), che il banco ?gabbia mostrava come «testa 40».
     Alzato a 0,42 in carica: ZERO tagli su tutte e quattro. La
     differenza fra i due gomiti resta 0,43 rad, larga abbastanza da
     restare due forme. */
  const eR = 0.30 + 0.55*car - 0.35*seg - 0.20*rit;
  const eL = 0.55 - 0.13*car + 0.30*seg - 0.17*rit;
  /* out: 0,06 base, 0,21 al massimo della carica. LA GABBIA e' 0,222.
     somma:  0,06 +0,15-0,09-0,06 = 0,06 */
  const out = 0.06 + 0.15*car - 0.09*seg - 0.06*rit;
  braccio(SHR,ELR,HAR,  SHW, shY, shZ, aR,eR, out, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ, aL,eL, out,-1);
  const hz=0.06*sl;
  /* LE GAMBE A COMPASSO, sfasate fra loro: la destra si carica di piu'
     e si distende di piu' (e' quella che spinge), la sinistra tiene.
     Al contatto il ginocchio destro e' a 0,217 — praticamente teso:
     e' l'uomo sulle punte.
     somme:  -0,22+0,30-0,02-0,06 = 0   |   0,22 +0,42-0,46+0,08-0,04 = 0,22
             0,16-0,24+0,12-0,04 = 0    |   0,26 +0,34-0,38+0,10-0,06 = 0,26 */
  const aGd = -0.22*car + 0.30*fru - 0.02*seg - 0.06*rit;
  const kGd = 0.22 + 0.42*car - 0.46*fru + 0.08*seg - 0.04*rit;
  const aGs =  0.16*car - 0.24*fru + 0.12*seg - 0.04*rit;
  const kGs = 0.26 + 0.34*car - 0.38*fru + 0.10*seg - 0.06*rit;
  const apr = 0.05*car - 0.03*seg - 0.02*rit;         // somma: 0
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, hz, aGd,kGd,  HIPW+apr);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, hz, aGs,kGs, -HIPW-apr);
}
/* la palla del colpo di testa: SCENDE dall'alto davanti alla figura in
   caduta vera (quadratica), viene incornata alla quota della fronte
   (~1,67 a bacino alzato) e riparte AVANTI e IN GIU' — perche' e' quello
   che fa il gioco: colpoDiTesta rimette b.vz=40, cioe' bassa e viva,
   mai un pallonetto. La schiacciata dura 0,035 attorno al contatto. */
function pallaTesta(u,o){
  const ti=0.36;
  if(u<ti){ const f=u/ti;
    o[0]=0.05; o[1]=1.67+1.05*(1-f)*(1-f); o[2]=1.30-1.16*f;
  }else{ const f=(u-ti)/(1-ti), e=1-(1-f)*(1-f);
    o[0]=0.05; o[2]=0.14-3.10*e;
    let y=1.67-0.30*f-1.90*f*f; if(y<RPALLA)y=RPALLA; o[1]=y;
  }
  const dw=Math.abs(u-ti);
  o[3]=dw<0.035?0.42*(1-dw/0.035):0;
}`,
},

/* 2 — la clip entra nel catalogo. Senza questa riga CLIPS['testa'] e'
       undefined e il gioco muore alla prima palla alta. */
{
  nome: '2/4 CLIPS.testa registrata',
  cerca:
`  tiro:      {freq:0.7, pose:poseTiro,      palla:function(u,o){pallaCalcio(u,Q_TIRO,o);}},`,
  metti:
`  tiro:      {freq:0.7, pose:poseTiro,      palla:function(u,o){pallaCalcio(u,Q_TIRO,o);}},
  /* freq 1,0 di proposito: in partita la fase e' st.u/freq, e con 1,0
     la fase disegnata E' quella che rigStato calcola — nessuna
     conversione da rifare a mente quando si legge poseTesta. */
  testa:     {freq:1.0, pose:poseTesta,     palla:pallaTesta},`,
},

/* 3 — la fase da cui parte il seguito in partita */
{
  nome: '3/4 RIG_CALCI.testa',
  cerca:
`const RIG_CALCI = { passaggio:0.31, filtrante:0.27, cross:0.32, tiro:0.35 };`,
  metti:
`const RIG_CALCI = { passaggio:0.31, filtrante:0.27, cross:0.32, tiro:0.35, testa:0.30 };`,
},

/* 4 — e finalmente colpoDiTesta dice al rig chi e' */
{
  nome: '4/4 colpoDiTesta dichiara la clip',
  cerca:
`  segnaTocco(qi);
  q.kickCd=0.5; q.kickT=0.2; q.kickB=0.24;`,
  metti:
`  segnaTocco(qi);
  q.kickCd=0.5; q.kickT=0.2; q.kickB=0.24;
  /* LA RIGA CHE MANCAVA. Senza di lei rigStato ripiega su 'passaggio'
     e l'uomo incorna con la gamba. Non tocca la fisica: kickT e kickB
     qui sopra erano gia' accesi, cambia solo QUALE posa percorrono.
     Nessuna pulizia dopo: ogni calcio coi piedi riscrive kickClip. */
  q.kickClip='testa';`,
},

];

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n, a }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}
const attesi = [
  ['function poseTesta(u){', 1],
  ['function pallaTesta(u,o){', 1],
  ['testa:     {freq:1.0, pose:poseTesta,     palla:pallaTesta},', 1],
  ['tiro:0.35, testa:0.30 };', 1],
  ["q.kickClip='testa';", 1],
  // il ripiego resta dov'era: e' giusto che ci sia, ma adesso il colpo
  // di testa non ci cade piu' dentro
  ["p.kickClip||'passaggio'", 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
