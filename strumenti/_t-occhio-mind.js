/* =====================================================================
   _t-occhio-mind.js -- I DUE CANALI D'OCCHIO (voce #117, compito 4, MIND
   v1). Rende VISIBILI gli stati che il compito 2 ha gia' derivato dai
   fatti (p.umore, p.nervi, G.spinta[team]): NESSUNA DECISIONE, solo
   DISEGNO e AUDIO. (a) p.mesto -- gia' esistente dal gol subito (addGoal
   ~11497, faiCambio ~12416) -- si accende ANCHE dai fatti negativi del
   giocatore. (b) la folla (Audio5.crowdLevel/curvaTamburo, ~17111) segue
   G.spinta della squadra che attacca. (c) un banner (showBanner, la
   stessa funzione di PALO/GOL) sui cambi di scalino di G.spinta.

   MODELLO: strumenti/_t-stati-mind.js (l'ANCORE con cerca/metti, il
   guardiano che rifiuta se `cerca' non compare ESATTAMENTE una volta).

   (a) p.mesto DAI FATTI. Il registro EMETTE DAVVERO solo tre `che' con un
   attore preciso nell'esito che si prestano a un lutto (grep gli `che' in
   emettiFatto, voce #117 compito 1): fallo (la VITTIMA, f.esito.vittima),
   giallo/espulsione (l'AMMONITO, f.chi), legno (il TIRATORE, f.chi =
   b.lastTouch al momento dell'emissione). "tiro sbagliato da buona
   posizione" del progetto NON e' nel vocabolario del registro -- non si
   inventa un fatto nuovo, si dichiara la deviazione e si usa cio' che
   c'e' (fallo/giallo/espulsione/legno). Il gol subito resta l'ALTRO
   trigger di p.mesto, gia' esistente, INTOCCATO (righe ~11486-11503):
   questo attrezzo aggiunge una funzione NUOVA e SEPARATA, non tocca la
   regia del gol.

   UN UOMO PER VOLTA PER SQUADRA: se un compagno di squadra e' GIA' mesto
   (p.mesto>0, qualunque la fonte -- anche il gol subito), il fatto nuovo
   NON accende un secondo mesto. SCELTA DICHIARATA (il progetto lascia la
   scelta aperta): NON si sostituisce col piu' recente, si aspetta che il
   primo si spenga -- piu' semplice, deterministico, e non fa sparire una
   posa a meta' gesto per un fatto arrivato un fotogramma dopo.

   LA DURATA E' FUNZIONE DI p.umore, TETTO 3,0 s:
     clamp(1.2 - 1.8*p.umore, 0.3, 3.0)
   A umore=0 la durata e' 1,2 s -- la STESSA costante gia' in uso altrove
   per il mesto (faiCambio, ~12416): a stato neutro questo trigger non
   introduce un numero arbitrario diverso. umore=-1 (il fondo) tocca
   ESATTAMENTE il tetto 3,0; umore=+1 (fiducia piena) scende al minimo
   0,3 -- un lampo, non un lutto. p.umore si legge COSI' COM'E' al
   momento del fatto, nella STESSA passata in cui applicaImpattoFatto
   (compito 2) ha gia' processato lo stesso fatto: per giallo/espulsione
   questo e' il p.umore GIA' abbassato dal cartellino (la durata riflette
   il tonfo appena incassato); per fallo/legno, che non toccano l'umore
   della vittima/tiratore, riflette il morale generale del giocatore in
   quel momento -- comunque "funzione di p.umore", non un numero fisso.

   DOVE VIVE: una funzione nuova, applicaOcchioMestoDaFatto(f), chiamata
   ACCANTO ad applicaImpattoFatto(G.fatti[fi]) nello STESSO ciclo in fondo
   a step() (mai un secondo giro che rilegga G.fatti): stesso fatto,
   stessa passata, come applicaImpattoFatto stessa impone (vedi la sua
   lettera di testa in _t-stati-mind.js sul doppio conteggio).

   (b) LA FOLLA SEGUE LA SPINTA. Il sito unico che chiama
   Audio5.crowdLevel (la reattivita' folla-vs-pallone, ogni 0,3 s di
   gioco) somma 0,35*max(0,G.spinta[squadra che attacca]) al livello gia'
   calcolato (prox + crowdHype): una squadra in difficolta' (spinta<0)
   NON spegne la folla, la accende solo chi sta creando (max(0,...)). "La
   squadra che attacca" e' squadraDelPallone() (~14587, gia' definita: il
   possesso, -1 se la palla e' libera e non ha mai toccato nessuno -- in
   quel caso il contributo di spinta e' zero, nessuna squadra "attacca").
   La curva/tamburo (curvaTamburo) batte ANCHE quando questa stessa
   spinta supera 0,6, in OR con le condizioni gia' in casa (prox>0.55 /
   golden / minuti finali). SOLO AUDIO: nessuna decisione legge questo
   numero, il due-versioni lo prova (0/60 atteso).

   (c) IL BANNER SUGLI SCALINI DI SPINTA. G.spinta sale e scende con
   continuita' (l'EMA di decayoSpinta, compito 2): un banner ad OGNI
   fotogramma sopra soglia sarebbe un banner ogni fotogramma finche' resta
   li' sopra. G.spintaScalino[team] tiene l'ULTIMO SCALINO raggiunto (0 =
   sotto zero, 1 = zero o sopra, 2 = 0,4 o sopra -- la soglia che il
   progetto stesso porta come esempio) e il banner parte SOLO quando lo
   scalino CRESCE (la salita dichiarata dal progetto), mai sulla discesa
   -- la discesa aggiorna comunque il tracciato, cosi' una nuova salita
   puo' ri-accendere il banner. Scalino 1 (il recupero di morale, la
   squadra torna a testa alta dopo essere stata spinta indietro) ->
   "TESTA ALTA"; scalino 2 (la spinta vera, la stessa soglia 0,4
   dell'esempio del progetto) -> "CI CREDONO". Se in un solo fotogramma
   la spinta salta direttamente da sotto zero a 0,4+ (scalino 0->2, un
   caso limite con un EMA continuo), si mostra il banner dello scalino
   PIU' ALTO raggiunto -- scelta dichiarata, non i due banner in sequenza.
   showBanner e' la STESSA funzione di PALO/GOL/FALLO: nessuna coda
   propria, nessuna precedenza sugli altri banner (un evento di gioco
   importante nello stesso fotogramma vince per ultima scrittura -- lo
   stesso comportamento che PALO/FALLO/CARTELLINO hanno gia' fra loro).
   Vive in fondo a step(), DOPO decayoSpinta(dt): quel punto del file gira
   SOLO a scena 'play'/'golden' (il ramo di step() che porta fin li' esce
   prima per ogni altra scena), quindi G.spinta avanza e il controllo
   scalino gira nella stessa finestra, senza bisogno di una guardia scena
   propria.

   SAVE.moto (MOVIMENTO RIDOTTO): questo attrezzo non aggiunge NESSUN
   lampo/scossa/particella -- solo un trigger di posa (mesto, gia'
   esistente, la sua resa a schermo non cambia) e due banner testuali
   (showBanner, che gia' oggi non si spegne con SAVE.moto per PALO/GOL/
   FALLO). "I banner testuali restano, i lampi no" e' quindi rispettato
   per costruzione: non c'e' nessun lampo nuovo da spegnere.

   NESSUNA NUOVA SUPERFICIE __test: t.G e' gia' un riferimento VIVO a G
   (lo shorthand "G, Duel, Tut," in fondo a __test, gia' sfruttato da
   _t-stati-mind.js e _t-canale-mind.js) -- t.G.players[i].mesto, t.G.spinta,
   t.G.banner/bannerT sono gia' leggibili senza aggiungere un getter. Le
   variabili di modulo bare (FW, Audio5, squadraDelPallone) sono a loro
   volta leggibili da page.evaluate: STESSA REALTA' di window.__test.G
   (verificato empiricamente prima di scrivere questo attrezzo: window
   condivide l'ambiente lessicale globale dello script di pagina con
   qualunque valutazione successiva nello stesso contesto). Il banco
   TESTIMONE (_q-umore.js) le usa cosi', senza chiedere altro al gioco.

   5 ancore (dichiarazione G.spintaScalino, azzeramento in startMatch, le
   tre funzioni nuove accanto ad applicaImpattoFatto/decayoSpinta, il
   ciclo di step() che le chiama, la formula della folla+curva).

   ZERO dado() NUOVO: le tre funzioni leggono solo stati gia' calcolati
   (p.umore, G.spinta, G.ball, G.timeLeft) e chiamano solo showBanner/
   Audio5, mai un sorteggio. Il guardiano lo verifica contro il conteggio
   della sorgente.

   uso:  node strumenti/_t-occhio-mind.js --in fuori/x.html --out fuori/y.html
         node strumenti/_t-occhio-mind.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/occhio-mind.html'));

const ANCORE = [

{
  nome: '1. dichiarazione iniziale su G: spintaScalino accanto a spinta/fattiVisti/fattiTot',
  cerca:
`  spinta:[0,0], fattiVisti:0, fattiTot:0, // gli stati (voce #117, compito 2): derivati dai fatti, vedi applicaImpattoFatto
  rec:[], recT:0, moviola:null,`,
  metti:
`  spinta:[0,0], fattiVisti:0, fattiTot:0, // gli stati (voce #117, compito 2): derivati dai fatti, vedi applicaImpattoFatto
  spintaScalino:[0,0],                   // il canale d'occhio (voce #117, compito 4): l'ultimo scalino di G.spinta mostrato per squadra, vedi controllaBannerSpinta
  rec:[], recT:0, moviola:null,`,
},

{
  nome: '2. azzeramento in startMatch: G.spintaScalino accanto a G.spinta',
  cerca:
`  G.fatti.length=0;
  G.spinta=[0,0]; G.fattiVisti=0; G.fattiTot=0;
  G.rec.length=0; G.recT=0;`,
  metti:
`  G.fatti.length=0;
  G.spinta=[0,0]; G.fattiVisti=0; G.fattiTot=0;
  G.spintaScalino=[0,0];                 // il canale d'occhio (voce #117, compito 4): azzerato con gli altri stati
  G.rec.length=0; G.recT=0;`,
},

{
  nome: '3. le tre funzioni nuove, fra applicaImpattoFatto e decayoSpinta',
  cerca:
`    case 'sfugge':
      if(p) p.umore = clampStato(p.umore - 0.15*molt, -1, 1);
      break;
  }
}
function decayoSpinta(dt){`,
  metti:
`    case 'sfugge':
      if(p) p.umore = clampStato(p.umore - 0.15*molt, -1, 1);
      break;
  }
}

/* =====================================================================
   IL CANALE D'OCCHIO -- p.mesto DAI FATTI (voce #117, compito 4). Vedi
   la lettera di testa di strumenti/_t-occhio-mind.js per il perche' di
   ogni scelta (i tre "che" scelti, il tetto di un uomo per squadra, la
   durata funzione di p.umore). SOLO DISEGNO: nessun sorteggio qui dentro,
   nessuna decisione toccata -- il due-versioni lo prova. */
function applicaOcchioMestoDaFatto(f){
  let idx=-1;
  switch(f.che){
    case 'fallo':
      if(f.esito && Number.isInteger(f.esito.vittima)) idx=f.esito.vittima;
      break;
    case 'giallo': case 'espulsione':
      idx=f.chi;
      break;
    case 'legno':
      idx=f.chi;                        // il tiratore: b.lastTouch al momento dell'emissione
      break;
    default: return;                    // gol/autorete: gia' coperti dal trigger esistente del gol
  }
  if(idx<0 || idx>=G.players.length) return;
  const p=G.players[idx];
  if(!p || p.out>0) return;
  /* UN UOMO PER VOLTA PER SQUADRA: se un compagno (o lui stesso) e'
     gia' mesto -- qualunque la fonte, anche il gol subito -- questo
     fatto non ne accende un secondo. Non si sostituisce col piu'
     recente (scelta dichiarata): si aspetta che il primo si spenga. */
  for(const q of G.players) if(q.team===p.team && q.mesto>0) return;
  p.mesto = clamp(1.2 - 1.8*p.umore, 0.3, 3.0);
}

/* IL BANNER SUGLI SCALINI DI SPINTA (voce #117, compito 4). Vedi la
   lettera di testa dell'attrezzo per la tavola degli scalini e la
   scelta del banner "piu' alto" sul salto in un solo fotogramma. SOLO
   DISEGNO (showBanner, la stessa funzione di PALO/GOL): nessuna
   decisione legge G.spintaScalino, il due-versioni lo prova. */
function scalinoDiSpinta(v){ return v>=0.4 ? 2 : (v>=0 ? 1 : 0); }
function controllaBannerSpinta(){
  if(!G.spinta || !G.spintaScalino) return;
  const TESTI = {1:'TESTA ALTA', 2:'CI CREDONO'};
  for(let team=0; team<2; team++){
    const nuovo = scalinoDiSpinta(G.spinta[team]);
    const vecchio = G.spintaScalino[team];
    if(nuovo>vecchio && TESTI[nuovo]) showBanner(TESTI[nuovo], TEAMCOL[team], 1.2);
    G.spintaScalino[team]=nuovo;
  }
}
function decayoSpinta(dt){`,
},

{
  nome: '4. il ciclo di step(): applicaOcchioMestoDaFatto accanto a applicaImpattoFatto, controllaBannerSpinta dopo decayoSpinta',
  cerca:
`  const fattiNuovi = G.fattiTot - G.fattiVisti;
  if(fattiNuovi > 0){
    const daLeggere = Math.min(fattiNuovi, G.fatti.length);
    for(let fi=G.fatti.length-daLeggere; fi<G.fatti.length; fi++) applicaImpattoFatto(G.fatti[fi]);
    G.fattiVisti = G.fattiTot;
  }
  decayoSpinta(dt);
}`,
  metti:
`  const fattiNuovi = G.fattiTot - G.fattiVisti;
  if(fattiNuovi > 0){
    const daLeggere = Math.min(fattiNuovi, G.fatti.length);
    for(let fi=G.fatti.length-daLeggere; fi<G.fatti.length; fi++){
      applicaImpattoFatto(G.fatti[fi]);
      /* IL CANALE D'OCCHIO (voce #117, compito 4): p.mesto dai fatti
         negativi, vedi applicaOcchioMestoDaFatto qui sopra. Stessa
         passata, stesso fatto -- mai un ciclo a parte che rilegga
         G.fatti una seconda volta. */
      applicaOcchioMestoDaFatto(G.fatti[fi]);
    }
    G.fattiVisti = G.fattiTot;
  }
  decayoSpinta(dt);
  controllaBannerSpinta();              // il canale d'occhio (voce #117, compito 4): il banner sugli scalini
}`,
},

{
  nome: '5. la folla segue la spinta: crowdLevel + curvaTamburo',
  cerca:
`  /* folla reattiva: sale quando l'azione si avvicina alle porte */
  G.crowdSndT-=dt;
  if(G.crowdSndT<=0){
    G.crowdSndT=0.3;
    const b=G.ball;
    const prox = Math.max(0, 1-Math.min(b.x, FW-b.x)/300);
    Audio5.crowdLevel(1 + prox*0.9 + G.crowdHype*0.4);
    /* LA CURVA: tamburo nei momenti caldi, tace a meta' campo */
    if(shopAttivo('curva'))
      Audio5.curvaTamburo(prox>0.55 || G.golden || G.timeLeft<=15);
  }`,
  metti:
`  /* folla reattiva: sale quando l'azione si avvicina alle porte */
  G.crowdSndT-=dt;
  if(G.crowdSndT<=0){
    G.crowdSndT=0.3;
    const b=G.ball;
    const prox = Math.max(0, 1-Math.min(b.x, FW-b.x)/300);
    /* LA FOLLA SEGUE LA SPINTA (voce #117, compito 4): squadraDelPallone()
       dice chi attacca (il possesso; -1 se la palla e' libera e non ha
       mai toccato nessuno -- nessuna squadra "attacca", contributo zero).
       Si somma SOLO la spinta POSITIVA di quella squadra (max(0,...)):
       una squadra in difficolta' non spegne la folla, la accende solo
       chi sta creando. SOLO AUDIO: nessuna decisione legge questo
       numero, il due-versioni lo prova. */
    const teamAttacco = squadraDelPallone();
    const spintaAttacco = (teamAttacco>=0 && G.spinta) ? Math.max(0, G.spinta[teamAttacco]) : 0;
    Audio5.crowdLevel(1 + prox*0.9 + G.crowdHype*0.4 + 0.35*spintaAttacco);
    /* LA CURVA: tamburo nei momenti caldi, tace a meta' campo -- ora
       batte ANCHE quando la spinta della squadra che attacca supera
       0,6 (voce #117, compito 4), oltre alle condizioni gia' in casa. */
    if(shopAttivo('curva'))
      Audio5.curvaTamburo(prox>0.55 || G.golden || G.timeLeft<=15 || spintaAttacco>0.6);
  }`,
},

];

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}

/* CONTEGGI A DELTA. */
const conta = (testo, s) => testo.split(s).length - 1;
const rotti = [];
if (conta(out, 'spintaScalino:[0,0],') !== 1) rotti.push('la dichiarazione di G.spintaScalino non e\' presente esattamente una volta');
if (conta(out, 'G.spintaScalino=[0,0];') !== 1) rotti.push('l\'azzeramento di G.spintaScalino in startMatch non e\' presente esattamente una volta');
if (conta(out, 'function applicaOcchioMestoDaFatto(f){') !== 1) rotti.push('applicaOcchioMestoDaFatto non e\' presente esattamente una volta');
if (conta(out, 'function scalinoDiSpinta(v){') !== 1) rotti.push('scalinoDiSpinta non e\' presente esattamente una volta');
if (conta(out, 'function controllaBannerSpinta(){') !== 1) rotti.push('controllaBannerSpinta non e\' presente esattamente una volta');
if (conta(out, 'applicaOcchioMestoDaFatto(G.fatti[fi]);') !== 1) rotti.push('la chiamata a applicaOcchioMestoDaFatto nel ciclo di step() non e\' presente esattamente una volta');
if (conta(out, 'controllaBannerSpinta();') !== 1) rotti.push('la chiamata a controllaBannerSpinta() dopo decayoSpinta non e\' presente esattamente una volta');
if (conta(out, '0.35*spintaAttacco') !== 1) rotti.push('il termine di folla 0.35*spintaAttacco non e\' presente esattamente una volta');
if (conta(out, 'spintaAttacco>0.6') !== 1) rotti.push('la soglia 0.6 della curva non e\' presente esattamente una volta');
if (conta(out, 'p.mesto = clamp(1.2 - 1.8*p.umore, 0.3, 3.0);') !== 1) rotti.push('la formula della durata del mesto dai fatti non e\' presente esattamente una volta');
if (conta(out, 'for(const p of G.players){ if(p.team===team) p.celeb=2.4; }') !== 1) rotti.push('IL TRIGGER DELL\'ESULTANZA (p.celeb sul gol) non e\' piu\' presente tal quale: non doveva essere toccato');
if (conta(out, 'dado()') !== conta(src, 'dado()')) rotti.push('il numero di chiamate a dado() e\' cambiato: zero dado() nel codice nuovo e\' un vincolo assoluto');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
