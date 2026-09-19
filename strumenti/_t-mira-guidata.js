/* =====================================================================
   _t-mira-guidata.js -- LA MIRA GUIDATA A DUE PESI (voce #113, compito 1,
   interpretazione A scelta dal committente: due AMPIEZZE DI SCOPE del
   salto di controllo di switchControlled, non un aiuto geometrico alla
   precisione del tiro -- quella geometria, #88, resta intatta).

   MODELLO: strumenti/_t-registro-fatti.js / _t-canale-mind.js (l'ANCORE
   con cerca/metti, il guardiano che rifiuta se `cerca' non compare
   ESATTAMENTE una volta, i conteggi a delta dopo la sostituzione).

   COSA FA, sito per sito (7 ancore):
     1. SAVE.miraGuidata:'pieno' in defaultSave(), accanto a sponde
        (voce #87): additivo, un salvataggio vecchio non vede cambiare
        nulla finche' non tocca la riga nuova.
     2. loadSave(): whitelist di sanificazione, stesso modello di sponde
        -- un salvataggio manomesso non puo' chiedere un terzo peso.
     3. startMatch: G.miraGuidata fissato UNA VOLTA da opts.miraGuidata
        (le sfide lo forzano) altrimenti SAVE.miraGuidata altrimenti
        'pieno', esattamente come G.campoVero da opts.sponde qui sopra
        -- mai riletto da SAVE a partita in corso.
     4. switchControlled: quando 'essenziale', il destinatario del salto
        considera SOLO b.crossTo (i palloni alti), non b.passTo (i
        passaggi corti a terra). Il calcolo originale di `dest' NON
        cambia di un carattere -- resta il percorso 'pieno' di sempre;
        il ramo nuovo e' l'IF che calcola `destFinale', e SOLO
        `destFinale' scende nel resto della funzione (dest resta per
        intero quello che era, non e' piu' letto oltre).
     5-6. Sfida.gioca / Sfida.guarda: forzano miraGuidata:'pieno' negli
        opts passati a startMatch, accanto a sponde:'gabbia' -- il SAVE
        locale dei due telefoni e' ignorato, il nastro resta
        deterministico (limite dichiarato: niente mira guidata online).
     7. __test.miraGuidata: fotografa G.miraGuidata per il banco, stesso
        pattern di __test.campoVero.

   ZERO dado() NUOVO: nessun sorteggio in nessuna delle sette ancore,
   solo lettura di stato e un IF che sceglie fra due valori gia' noti
   (dest, -1). Il guardiano lo verifica contro il conteggio della
   sorgente.

   IL RAMO 'pieno' RESTA CARATTERE PER CARATTERE QUELLO DI OGGI: l'ancora
   4 non tocca la riga `const dest = ...' (verificato a delta, sotto),
   ne' le righe che seguivano gia' `dest' -- le stesse righe ora leggono
   `destFinale', che a peso 'pieno' vale sempre `dest' (l'IF non entra
   mai: la sua guardia e' `G.miraGuidata==='essenziale''). A peso
   'pieno' quindi destFinale===dest a ogni fotogramma, e il comportamento
   e' bit-identico al gioco pre-cantiere (verificato dal banco
   _q-mira.js, prova PIENO-IDENTICO).

   LA GUARDIA CPU (:17491, `if(G.ctrl[t]<0) continue') NON e' toccata:
   resta il primo controllo della funzione, sopra tutte le ancore di
   questo attrezzo -- la mira guidata e' scoped all'input UMANO per
   costruzione, senza bisogno di una guardia nuova (per questo il
   due-versioni CPU-CPU e' 0/60 per costruzione a entrambi i pesi).

   uso:  node strumenti/_t-mira-guidata.js --in fuori/x.html --out fuori/y.html
         node strumenti/_t-mira-guidata.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/mira-guidata.html'));

const ANCORE = [

{
  nome: '1. SAVE.miraGuidata:\'pieno\' in defaultSave(), accanto a sponde',
  cerca:
`    /* SPONDE: gabbia (il gioco di oggi, ogni sponda rimbalza) o campo
       vero (rimesse laterali, angoli, rinvii dal fondo). Default gabbia:
       campo additivo, chi gioca oggi non vede cambiare nulla (voce #87,
       compito 1). */
    sponde:'gabbia',`,
  metti:
`    /* SPONDE: gabbia (il gioco di oggi, ogni sponda rimbalza) o campo
       vero (rimesse laterali, angoli, rinvii dal fondo). Default gabbia:
       campo additivo, chi gioca oggi non vede cambiare nulla (voce #87,
       compito 1). */
    sponde:'gabbia',
    /* MIRA GUIDATA: due pesi sullo SCOPE del salto di controllo dopo un
       passaggio/cross con destinatario dichiarato (switchControlled,
       voce #113, interpretazione A). 'pieno' salta per qualunque
       passaggio o cross con destinatario; 'essenziale' restringe il
       salto ai soli cross/palloni alti (b.crossTo), escludendo i
       passaggi corti a terra (b.passTo). NON c'e' uno stato "off": il
       salto e' sempre esistito (voce #88), qui si rende configurabile
       in AMPIEZZA. Default 'pieno' = comportamento di oggi: un
       salvataggio vecchio (senza questo campo) rigioca identico. */
    miraGuidata:'pieno',`,
},

{
  nome: '2. loadSave(): whitelist di sanificazione, stesso modello di sponde',
  cerca:
`    if(j.sponde==='campo'||j.sponde==='gabbia') s.sponde=j.sponde;`,
  metti:
`    if(j.sponde==='campo'||j.sponde==='gabbia') s.sponde=j.sponde;
    /* stesso modello di sponde qui sopra: solo le due chiavi conosciute,
       un salvataggio manomesso non puo' chiedere un terzo peso (voce
       #113, compito 1) */
    if(j.miraGuidata==='pieno'||j.miraGuidata==='essenziale') s.miraGuidata=j.miraGuidata;`,
},

{
  nome: '3. startMatch: G.miraGuidata fissato una volta, come G.campoVero qui sopra',
  cerca:
`  G.campoVero = (TAGLIA===11) ||
    (opts.sponde==='gabbia' ? false : opts.sponde==='campo' ? true : SAVE.sponde==='campo');
  G.mode = mode===2?2:1;`,
  metti:
`  G.campoVero = (TAGLIA===11) ||
    (opts.sponde==='gabbia' ? false : opts.sponde==='campo' ? true : SAVE.sponde==='campo');
  /* LA MIRA GUIDATA, fissata una volta sola come G.campoVero qui sopra
     (voce #113, compito 1): mai riletta da SAVE a partita in corso.
     opts.miraGuidata vince quando presente -- le sfide lo forzano a
     'pieno' (Sfida.gioca/Sfida.guarda, vedi sotto), esattamente come
     opts.sponde vince su SAVE.sponde qui sopra; altrimenti la scelta
     salvata, altrimenti 'pieno' -- il comportamento di sempre. */
  G.miraGuidata = (opts && opts.miraGuidata) || SAVE.miraGuidata || 'pieno';
  G.mode = mode===2?2:1;`,
},

{
  nome: '4. switchControlled: essenziale restringe dest a solo crossTo (pieno invariato)',
  cerca:
`    const inVolo = G.ball.owner<0 && squadraDelPallone()===t;
    const dest = !inVolo ? -1
               : (G.ball.crossTo>=0 ? G.ball.crossTo : (G.ball.passTo>=0 ? G.ball.passTo : -1));
    const qd = dest>=0 ? G.players[dest] : null;
    if(qd && qd.team===t && qd.out<=0 && qd.role!=='gk'){
      best=dest; bd=0;
    } else`,
  metti:
`    const inVolo = G.ball.owner<0 && squadraDelPallone()===t;
    const dest = !inVolo ? -1
               : (G.ball.crossTo>=0 ? G.ball.crossTo : (G.ball.passTo>=0 ? G.ball.passTo : -1));
    /* LA MIRA GUIDATA (voce #113, compito 1): il peso 'essenziale'
       restringe il salto ai soli cross/palloni alti (b.crossTo),
       escludendo i passaggi corti a terra (b.passTo) -- il "fastidio"
       che il progetto #88 (SS4.2) aveva gia' previsto come possibile
       ripiego per chi ha difficolta' motorie. Il calcolo di dest qui
       sopra resta CARATTERE PER CARATTERE quello di oggi: e' il
       percorso 'pieno', invariato -- questo IF e' il SOLO ramo nuovo, e
       tocca solo destFinale (dest non e' piu' letto oltre questo
       punto). Se il destinatario era un passTo puro (crossTo<0) il
       salto non vale per 'essenziale': destFinale torna a -1, e il
       controllo ricade sul compagno piu' vicino al pallone nel ramo
       ELSE qui sotto, come se non ci fosse nessun destinatario
       dichiarato -- esattamente il comportamento pre-#88. */
    let destFinale = dest;
    if(G.miraGuidata==='essenziale' && G.ball.crossTo<0) destFinale = -1;
    const qd = destFinale>=0 ? G.players[destFinale] : null;
    if(qd && qd.team===t && qd.out<=0 && qd.role!=='gk'){
      best=destFinale; bd=0;
    } else`,
},

{
  nome: '5. Sfida.gioca forza miraGuidata:\'pieno\', accanto a sponde:\'gabbia\'',
  cerca:
`      /* LA GABBIA, SEMPRE, A 5/7 (rilievo C1 della revisione finale, voce
         #87). Una sfida la rigioca anche l'altro telefono, che ha la sua
         SAVE.sponde locale: se la battuta seguisse quella, due dispositivi
         diversi giocherebbero la STESSA sfida su due motori diversi (uno
         in gabbia, l'altro a campo vero), e chiudiSfida imputerebbe lo
         scarto di punteggio solo al profilo cresciuto, mai al motore
         diverso. La gabbia e' identica al bit su ogni telefono per
         costruzione (voce #87, compito 2): e' la sponda giusta finche' le
         sponde non viaggiano col nastro (seguito #105). A 11 il campo
         vero resta comunque obbligatorio, opts o non opts. */
      sponde: 'gabbia',`,
  metti:
`      /* LA GABBIA, SEMPRE, A 5/7 (rilievo C1 della revisione finale, voce
         #87). Una sfida la rigioca anche l'altro telefono, che ha la sua
         SAVE.sponde locale: se la battuta seguisse quella, due dispositivi
         diversi giocherebbero la STESSA sfida su due motori diversi (uno
         in gabbia, l'altro a campo vero), e chiudiSfida imputerebbe lo
         scarto di punteggio solo al profilo cresciuto, mai al motore
         diverso. La gabbia e' identica al bit su ogni telefono per
         costruzione (voce #87, compito 2): e' la sponda giusta finche' le
         sponde non viaggiano col nastro (seguito #105). A 11 il campo
         vero resta comunque obbligatorio, opts o non opts. */
      sponde: 'gabbia',
      /* LA MIRA GUIDATA, SEMPRE PIENA, PER LO STESSO MOTIVO (voce #113,
         compito 1). Due telefoni con SAVE.miraGuidata locale diversa
         (uno 'pieno', l'altro 'essenziale') muoverebbero lo stesso
         nastro su due motori diversi -- il salto di controllo umano
         cambia scope. Forzare 'pieno' qui rende il nastro indipendente
         dalla scelta di accessibilita' di ciascun telefono, esattamente
         come sponde:'gabbia' qui sopra. LIMITE dichiarato: la mira
         guidata non vale nelle sfide online (v1), come le sponde prima
         del seguito #105. */
      miraGuidata: 'pieno',`,
},

{
  nome: '6. Sfida.guarda forza miraGuidata:\'pieno\', accanto a sponde:\'gabbia\'',
  cerca:
`      /* LA GABBIA, SEMPRE, A 5/7 (rilievo C1, vedi il commento gemello in
         Sfida.gioca). Il replay rigioca i comandi del nastro sul motore
         di OGGI di questo stesso telefono: se seguisse la SAVE.sponde
         locale invece della sponda con cui la sfida fu giocata davvero,
         un replay potrebbe divergere per il motore, non solo per la
         rosa cresciuta - e la spiegazione qui sotto (S.atteso) imputa
         gia' tutto alla rosa. A 5/7 la sfida e' sempre stata gabbia
         (vedi sopra): rigiocarla in gabbia e' rigiocarla com'era. */
      sponde: 'gabbia',`,
  metti:
`      /* LA GABBIA, SEMPRE, A 5/7 (rilievo C1, vedi il commento gemello in
         Sfida.gioca). Il replay rigioca i comandi del nastro sul motore
         di OGGI di questo stesso telefono: se seguisse la SAVE.sponde
         locale invece della sponda con cui la sfida fu giocata davvero,
         un replay potrebbe divergere per il motore, non solo per la
         rosa cresciuta - e la spiegazione qui sotto (S.atteso) imputa
         gia' tutto alla rosa. A 5/7 la sfida e' sempre stata gabbia
         (vedi sopra): rigiocarla in gabbia e' rigiocarla com'era. */
      sponde: 'gabbia',
      /* LA MIRA GUIDATA, SEMPRE PIENA, PER LO STESSO MOTIVO (voce #113,
         compito 1, vedi il commento gemello in Sfida.gioca): il replay
         deve muoversi sullo stesso scope di controllo con cui la sfida
         fu giocata davvero, non su quello del telefono di chi guarda. A
         5/7 la sfida e' sempre stata 'pieno' (vedi sopra): rigiocarla
         'pieno' e' rigiocarla com'era. */
      miraGuidata: 'pieno',`,
},

{
  nome: '7. __test.miraGuidata, stesso pattern di __test.campoVero',
  cerca:
`  get campoVero(){ return !!G.campoVero; },`,
  metti:
`  get campoVero(){ return !!G.campoVero; },
  /* LA MIRA GUIDATA, per il banco (voce #113, compito 1): fotografa cio'
     che startMatch ha deciso, mai ricalcolata -- lo stesso pattern di
     campoVero qui sopra. */
  get miraGuidata(){ return G.miraGuidata; },`,
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
if (conta(out, `miraGuidata:'pieno',`) !== 1) rotti.push('defaultSave: miraGuidata:\'pieno\' non e\' presente esattamente una volta');
if (conta(out, `miraGuidata: 'pieno',`) !== 2) rotti.push('Sfida.gioca/Sfida.guarda: miraGuidata: \'pieno\' non compare esattamente due volte (una per sfida)');
if (conta(out, `if(j.miraGuidata==='pieno'||j.miraGuidata==='essenziale') s.miraGuidata=j.miraGuidata;`) !== 1) rotti.push('loadSave: la whitelist di miraGuidata non e\' presente esattamente una volta');
if (conta(out, `G.miraGuidata = (opts && opts.miraGuidata) || SAVE.miraGuidata || 'pieno';`) !== 1) rotti.push('startMatch: la fissazione di G.miraGuidata non e\' presente esattamente una volta');
if (conta(out, 'let destFinale = dest;') !== 1) rotti.push('switchControlled: destFinale non e\' dichiarato esattamente una volta');
if (conta(out, `if(G.miraGuidata==='essenziale' && G.ball.crossTo<0) destFinale = -1;`) !== 1) rotti.push('switchControlled: il ramo essenziale non e\' presente esattamente una volta');
if (conta(out, 'const qd = destFinale>=0 ? G.players[destFinale] : null;') !== 1) rotti.push('switchControlled: qd non legge destFinale esattamente una volta');
if (conta(out, 'best=destFinale; bd=0;') !== 1) rotti.push('switchControlled: best non e\' assegnato da destFinale esattamente una volta');
/* IL PERCORSO 'pieno' RESTA CARATTERE PER CARATTERE QUELLO DI OGGI: la
   riga che calcola `dest' non e' cambiata di un carattere (verificata
   qui contro la sorgente PRIMA della sostituzione), e le vecchie righe
   che leggevano `dest' per il resto della funzione sono sparite -- solo
   destFinale le sostituisce. */
const RIGA_DEST =
`    const dest = !inVolo ? -1
               : (G.ball.crossTo>=0 ? G.ball.crossTo : (G.ball.passTo>=0 ? G.ball.passTo : -1));`;
if (conta(out, RIGA_DEST) !== 1) rotti.push('switchControlled: la riga di calcolo di dest non e\' piu\' carattere per carattere quella di oggi');
if (conta(src, RIGA_DEST) !== 1) rotti.push('BANCO: la riga di calcolo di dest non si trova, invariata, anche nella sorgente PRIMA della sostituzione');
if (conta(out, 'const qd = dest>=0 ? G.players[dest] : null;') !== 0) rotti.push('switchControlled: la vecchia riga di qd(dest) e\' ancora presente: il sito non e\' stato aggiornato');
if (conta(out, 'best=dest; bd=0;') !== 0) rotti.push('switchControlled: la vecchia riga best=dest e\' ancora presente: il sito non e\' stato aggiornato');
if (conta(out, `get miraGuidata(){ return G.miraGuidata; },`) !== 1) rotti.push('__test.miraGuidata non e\' presente esattamente una volta');
/* LA GUARDIA CPU NON SI TOCCA: deve restare presente esattamente come
   prima, identica in numero fra src e out (nessuna ancora di questo
   attrezzo la nomina, ma il guardiano lo conferma comunque). */
if (conta(out, 'if(G.ctrl[t]<0) continue;') !== conta(src, 'if(G.ctrl[t]<0) continue;')) rotti.push('la guardia CPU di switchControlled e\' cambiata: fuori perimetro per questo cantiere');
if (conta(out, 'dado()') !== conta(src, 'dado()')) rotti.push('il numero di chiamate a dado() e\' cambiato: zero dado() nuovo e\' un vincolo assoluto');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
