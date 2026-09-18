/* =====================================================================
   _t-sfide-sponde.js — LE SFIDE NON DEVONO DIPENDERE DALLE SPONDE DEL
   DISPOSITIVO (voce #87, onda di correzione della revisione finale,
   18 settembre 2026). Attrezzo a ancore per due rilievi della stessa
   revisione, C1 (CRITICO) e I5 (Importante) — un solo attrezzo perche'
   toccano lo stesso file e la stessa serata di lavoro, non perche' siano
   la stessa causa.

   =====================================================================
   C1 — IL DIFETTO, misurato dalla revisione e non dedotto.

   startMatch (CALCETTO-il-gioco.html:~10791) fotografa G.campoVero da
   SAVE.sponde, il salvataggio DEL DISPOSITIVO che gioca — mai da un
   parametro della chiamata. Le due partenze di sfida (Sfida.gioca e
   Sfida.guarda, ~41811 e ~41950 prima di questa toppa) passano a
   startMatch la taglia (size: taglia) ma NON la sponda: a 5/7, due
   telefoni con SAVE.sponde diversa (uno in GABBIA, l'altro a CAMPO
   VERO) rigiocano la STESSA sfida — stesso seme, stessa taglia, stesso
   nastro — su due motori diversi. ballWalls() a campo vero ferma la
   palla su ogni fascia e ogni fondo (rimessa/angolo/rinvio); in gabbia
   rimbalza sempre: due partite diverse, non due esecuzioni della stessa.
   chiudiSfida() (~42044) confronta il punteggio ottenuto con S.atteso e,
   se non tornano, attribuisce lo scarto SOLO al profilo di chi ha
   attaccato cresciuto nel frattempo (§ "IL REPLAY SI CONTROLLA DA SOLO"):
   una spiegazione vera per il caso che copre, ma cieca al caso nuovo,
   che non è la rosa cambiata ma il motore diverso sotto i piedi.

   LA CURA, minima e reversibile (decisione del controllore):
   1. startMatch onora opts.sponde quando presente: 'gabbia' vince
      sempre su SAVE.sponde, 'campo' vince sempre su SAVE.sponde, nessun
      opts.sponde segue SAVE.sponde come prima (il percorso amichevole/
      torneo/stagione, che non passa mai opts.sponde, resta identico al
      bit — vedi la corsa dedicata nel commento in fondo). A 11 il campo
      vero resta forzato comunque, opts o non opts: la riga di GIOCA lo
      blocca gia' a schermo, e non c'e' ragione di lasciare a una sfida
      un varco che il menu stesso nega.
   2. Sfida.gioca e Sfida.guarda passano sempre sponde:'gabbia' a
      startMatch. A 5/7 la gabbia e' identica al bit su ogni telefono per
      costruzione (voce #87, compito 2 — GABBIA 0/40 dal merge-base,
      _c3-sorteggi): e' la sponda giusta per una sfida finche' le sponde
      non viaggiano col nastro. A 11 questa riga non cambia niente
      (G.campoVero resta forzato true dalla guardia di taglia).

   SEGUITO REGISTRATO: **#105**, le sponde nel nastro della sfida — per
   quando si vorranno sfide a campo vero anche a 5/7, servirebbe che la
   riga della sfida si portasse dietro la sponda con cui fu giocata,
   come gia' fa con seme/taglia/rose (§ "L'ORDINE DELLE TRE RIGHE" in
   Sfida.gioca).

   NOTA SULLA VOCE #96 (gia' a registro, correzione della revisione
   finale): il cancello di pubblicazione #96 copre la VERSIONE DEL
   MOTORE — un nastro registrato col motore di ieri che non si riproduce
   piu' su quello di oggi (ballWalls/resetKickoff cambiati). C1 e' un
   caso DIVERSO: stessa versione del motore su tutti e due i telefoni,
   ma un'IMPOSTAZIONE PER DISPOSITIVO (SAVE.sponde) che il motore leggeva
   dal posto sbagliato. Le due cose si somigliano (tutte e due finiscono
   in "il replay non torna") ma non sono la stessa voce, e non si
   chiudono con lo stesso lavoro: #96 vuole la versione nel nastro, C1
   voleva che le sfide non leggessero piu' il salvataggio locale — fatto
   qui.

   =====================================================================
   I5 — IL RIPIEGO «NESSUN BATTITORE», lo stesso buco gia' chiuso su
   ballOverBar dopo un rilievo CRITICO, riaperto qui per tre porte.

   Le tre pose della battuta (posaBattuta, posaBattutaAngolo,
   posaBattutaRinvio — CALCETTO-il-gioco.html, tutte e tre subito sotto
   pallaFuori) cercano un uomo di movimento della squadra che deve
   battere e, se non lo trovano (rosa azzerata da espulsioni o
   infortuni, un caso limite ma non impossibile), fanno "if(!bt) return;"
   e tornano senza fare nulla. G.battuta pero' e' gia' stato scritto da
   pallaFuori PRIMA di chiamare posaBattuta(), con battitore:-1: senza
   una guardia dopo la posa, quello stato resta li' PER SEMPRE — palla
   ferma, owner invariato, nessun cronometro che lo scioglie, la scena
   'battuta' che passa a 'play' al suo tempo (duraBattuta(), un timer
   indipendente da G.battuta) ma con un G.battuta pendente che nessuno
   piu' guarda.

   LA CURA e' CENTRALE, non nelle tre pose: dopo la chiamata a
   posaBattuta() dentro pallaFuori, se G.battuta e' ancora li' con
   battitore<0 (nessuna delle tre pose ha trovato un uomo), la palla
   torna libera (b.owner=-1) e G.battuta si azzera — esattamente il
   ripiego che ballOverBar (poco piu' sotto nello stesso file) gia' usa
   quando "deep" risulta null. La scena 'battuta' resta comunque per il
   fermo breve gia' impostato (showBanner/setScene sotto questa guardia
   non cambiano), poi il gioco torna a 'play' con una palla libera invece
   che con una battuta fantasma. Zero dado() nuovi.

   =====================================================================
   LEGGE DEI SORTEGGI, verificata dopo aver scritto questo attrezzo (non
   prima, seguendo la disciplina di casa "provata su una copia fuori dal
   repo"): il percorso amichevole/CPU-contro-CPU non passa mai
   opts.sponde a startMatch, quindi C1 non lo tocca; I5 e' un ramo morto
   in quel percorso salvo rose azzerate, che i banchi di batteria non
   costruiscono. Confronto a due versioni (fuori/fw-base.html, la copia
   di questo stesso file al commit 48c35fd, PRIMA di questa toppa, contro
   CALCETTO-il-gioco.html DOPO): atteso 0/60 partite divergenti a
   taglia 5/7/11 — vedi il rapporto del compito per il numero vero.

   uso:  node strumenti/_t-sfide-sponde.js --out fuori/sfide-sponde.html
         node strumenti/_t-sfide-sponde.js --in fuori/fw-base.html --out fuori/_check.html
         node strumenti/_t-sfide-sponde.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/sfide-sponde.html'));

const ANCORE = [

{
  nome: '1/4 (C1) startMatch onora opts.sponde nella fotografia di G.campoVero',
  cerca:
`  /* LA FOTOGRAFIA DI SPONDE, a taglia ormai nota (voce #87, compito 1).
     A 11 il campo vero e' sempre acceso, qualunque cosa dica SAVE.sponde
     (la riga di GIOCA lo blocca gia' a schermo, questa e' la seconda
     guardia lato motore, quella che non si aggira toccando il
     salvataggio a mano). Letta una volta sola, mai da SAVE a partita in
     corso: vive su G come G.mode/G.diff, per tutta la partita. */
  G.campoVero = (TAGLIA===11) || SAVE.sponde==='campo';`,
  metti:
`  /* LA FOTOGRAFIA DI SPONDE, a taglia ormai nota (voce #87, compito 1).
     A 11 il campo vero e' sempre acceso, qualunque cosa dica SAVE.sponde
     (la riga di GIOCA lo blocca gia' a schermo, questa e' la seconda
     guardia lato motore, quella che non si aggira toccando il
     salvataggio a mano). Letta una volta sola, mai da SAVE a partita in
     corso: vive su G come G.mode/G.diff, per tutta la partita.
     OPTS.SPONDE VINCE SU SAVE.SPONDE quando presente (rilievo C1 della
     revisione finale, voce #87). Senza questa riga la fotografia leggeva
     sempre il salvataggio DEL DISPOSITIVO: due telefoni con SAVE.sponde
     diversa rigiocavano la stessa sfida su un motore diverso (uno in
     gabbia, l'altro a campo vero), e chiudiSfida spiegava lo scarto di
     punteggio solo col profilo cambiato, mai col motore diverso. Le
     chiamate di sfida (Sfida.gioca/Sfida.guarda) ora passano sempre
     opts.sponde:'gabbia' a 5/7 - questa riga e' quello che le rende
     efficaci. A 11 il campo vero resta forzato comunque, opts o non
     opts (seguito #105: le sponde nel nastro, per sfide a campo vero
     anche a 5/7). */
  G.campoVero = (TAGLIA===11) ||
    (opts.sponde==='gabbia' ? false : opts.sponde==='campo' ? true : SAVE.sponde==='campo');`,
},
{
  nome: '2/4 (C1) Sfida.gioca passa sponde:\'gabbia\' a startMatch',
  cerca:
`    Reg.scrivi(7, [mentMia, mentSua].concat(impaccaRosa(SAVE.rosa), impaccaRosa(a.rosa)));
    startMatch(1, SFIDA_DIFF, {
      size: taglia,
      /* LA MIA POSTURA VIENE DALLA MIA INDOLE, non da SAVE.mentalita, e`,
  metti:
`    Reg.scrivi(7, [mentMia, mentSua].concat(impaccaRosa(SAVE.rosa), impaccaRosa(a.rosa)));
    startMatch(1, SFIDA_DIFF, {
      size: taglia,
      /* LA GABBIA, SEMPRE, A 5/7 (rilievo C1 della revisione finale, voce
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
      /* LA MIA POSTURA VIENE DALLA MIA INDOLE, non da SAVE.mentalita, e`,
},
{
  nome: '3/4 (C1) Sfida.guarda (replay) passa sponde:\'gabbia\' a startMatch',
  cerca:
`    startMatch(1, SFIDA_DIFF, {
      size: taglia,
      /* chi ha attaccato prende il posto di chi gioca: e' la sua rosa che
         il nastro muove */`,
  metti:
`    startMatch(1, SFIDA_DIFF, {
      size: taglia,
      /* LA GABBIA, SEMPRE, A 5/7 (rilievo C1, vedi il commento gemello in
         Sfida.gioca). Il replay rigioca i comandi del nastro sul motore
         di OGGI di questo stesso telefono: se seguisse la SAVE.sponde
         locale invece della sponda con cui la sfida fu giocata davvero,
         un replay potrebbe divergere per il motore, non solo per la
         rosa cresciuta - e la spiegazione qui sotto (S.atteso) imputa
         gia' tutto alla rosa. A 5/7 la sfida e' sempre stata gabbia
         (vedi sopra): rigiocarla in gabbia e' rigiocarla com'era. */
      sponde: 'gabbia',
      /* chi ha attaccato prende il posto di chi gioca: e' la sua rosa che
         il nastro muove */`,
},
{
  nome: '4/4 (I5) pallaFuori: nessun battitore trovato -> palla libera, G.battuta=null',
  cerca:
`  G.battuta = { tipo, team, battitore:-1, x, y, hold:BATTUTA_HOLD };
  posaBattuta();
  /* RINVIO E' GRIGIO DI CASA (voce #87, compito 4), lo stesso hex di`,
  metti:
`  G.battuta = { tipo, team, battitore:-1, x, y, hold:BATTUTA_HOLD };
  posaBattuta();
  /* NESSUN BATTITORE TROVATO (rilievo I5 della revisione finale, voce
     #87): le tre pose (posaBattuta/posaBattutaAngolo/posaBattutaRinvio)
     fanno tutte "if(!bt) return;" quando la squadra che deve battere non
     ha un uomo di movimento disponibile (rosa azzerata da espulsioni/
     infortuni) - senza questa guardia G.battuta restava pendente per
     sempre con battitore:-1, la palla ferma, l'owner invariato: lo
     stesso buco che ballOverBar chiudeva gia' (:19468 circa) dopo un
     rilievo CRITICO. Cura CENTRALE qui invece che nelle tre pose: la
     scena 'battuta' resta comunque per il fermo breve appena impostato
     sotto, poi si torna a play con la palla libera, esattamente come fa
     ballOverBar quando "deep" e' null. Zero dado(). */
  if(G.battuta && G.battuta.battitore<0){
    b.owner=-1;
    G.battuta=null;
  }
  /* RINVIO E' GRIGIO DI CASA (voce #87, compito 4), lo stesso hex di`,
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

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
