/* =====================================================================
   _t-touch5-riadotta.js — IL DITO VIVO NON DIVENTA FANTASMA ALLA
   RIVINCITA (voce #85, correzione alla revisione del compito 2).

   IL RILIEVO. La cura di startMatch (_t-touch5-azzera.js, commit
   8a207e1) azzerava lo stato residuo di Touch5 a martello — active,
   ox/oy/dx/dy, hist, riadotta, tutti a zero o null — per chiudere il
   determinismo fra due partite sulla stessa pagina. Ma endMatch() non
   tocca Touch5, il gestore di btnRivincita in amichevole chiama
   startMatch(G.mode,G.diff) DIRETTAMENTE (niente pausa), e i listener
   touch sul canvas non sono filtrati per scena: un pollice rimasto
   fisicamente giu' sullo stick ATTRAVERSO IL FISCHIO FINALE arrivava a
   quell'azzeramento ancora active=true, e ne usciva con riadotta=null.
   Un dito che non si e' mai alzato non manda un nuovo touchstart: i
   suoi touchmove successivi non trovavano ne' uno stick attivo ne' un
   candidato in pend, e restavano fantasma finche' il dito non si
   alzava davvero. PRIMA di 8a207e1 non succedeva, perche' Touch5 non
   veniva toccato affatto da startMatch e lo stick attivo restava
   attivo.

   MISURATO PRIMA DELLA CURA con fuori/_verifica-rivincita-dito.js sul
   gioco post-8a207e1: dopo il click su RIVINCITA, Touch5.stick[0] esce
   {active:false, id:-1, riadotta:null}; il primo touchmove dello stesso
   dito mai alzato non riaggancia niente (stickActive resta false) e il
   giocatore resta fermo per 30 fotogrammi di touchmove continuo.

   LA CURA instrada lo stesso azzeramento attraverso Touch5.azzera(), la
   funzione che pausa/ripresa gia' usa per lo stesso identico problema
   (cerca "SI TIENE L'ORIGINE" dentro Touch5.azzera): se lo stick era
   attivo la sua origine si consegna a s.riadotta invece di sparire, e
   il primo touchmove del dito ancora giu' lo riaggancia (cerca "LA
   RIADOZIONE" dentro Touch5.move). I due campi che la bisezione del
   compito 2 aveva dimostrato causali restano coperti per intero:
   azzera() spegne la levetta attiva (active, id, dx, dy, hist — la
   stessa lista di prima) e CHIUDE gli atti/btnTouch orfani di un verbo
   a tenuta (chiudiCarica/annullaCarica/chiudiPassaL14) invece di
   limitarsi a cancellarli — quelle chiusure mutano un giocatore della
   partita che sta per finire, sostituito subito dopo da setupPlayers,
   quindi innocue anche al primissimo avvio, quando atti e btnTouch sono
   gia' vuoti. I campi rimasti innocui nella bisezione (ox/oy residuo,
   un candidato orfano in pend) restano innocui dentro azzera(): un
   candidato mai promosso puo' ora anche lui riagganciare un dito fermo,
   lo stesso contratto gia' misurato per pausa/ripresa (91 derive del
   dito appoggiato, controlli C3/C4 di strumenti/_q-precedenza.js).

   PERCHE' LA CURA DEL DETERMINISMO TIENE LO STESSO: le due sonde di
   bisezione (fuori/_diag-levetta-viva.js, fuori/_diag-verbo-tenuto.js)
   aprono la partita 2 con un touchstart VERO, e Touch5.start() cancella
   s.riadotta a martello per QUALUNQUE valore ereditato (cerca "un dito
   nuovo batte sempre quello da riadottare") prima ancora che serva a
   qualcosa: la differenza fra "riadotta=null" di prima e
   "riadotta={ox,oy}" di adesso non arriva mai al primo fotogramma della
   partita successiva, in nessuno dei due percorsi misurati. Restano
   rosse su fuori/base-85c2.html e verdi sul curato, stessi campioni di
   prima (6 e 7).

   NON TOCCA Reg.azzeraComandi() (dentro strumenti/_q-replay.js, sezione
   PARTENZA): quella funzione chiama gia' Touch5.azzera() e poi la
   sovrascrive con lo stesso azzeramento a martello di prima — e' un
   attrezzo di banco preesistente, non introdotto da questo ramo, fuori
   dal perimetro di questa correzione.

   uso:  node strumenti/_t-touch5-riadotta.js --out fuori/touch5-riadotta.html
         node strumenti/_t-touch5-riadotta.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/touch5-riadotta.html'));

const ANCORE = [

/* 1 — dentro startMatch: sostituisce l'azzeramento a martello messo da
   _t-touch5-azzera.js (8a207e1) con Touch5.azzera(), che preserva la
   riadozione per il dito ancora giu' alla rivincita. */
{
  nome: '1/1 startMatch instrada l\'azzeramento di Touch5 attraverso azzera()',
  cerca:
`     NON E' Touch5.azzera(): quella funzione e' per pausa/ripresa e
     tiene apposta l'origine della levetta per la riadozione del
     pollice che torna. Qui la partita e' NUOVA, non ripresa: lo stato
     residuo si azzera per intero, origine compresa. setPaused chiama
     Touch5.azzera() per conto suo e non passa da startMatch, quindi
     questa toppa non tocca il caso "pausa col dito giu', poi ripresa"
     (verificato con sonda dedicata). */
  for(const s of Touch5.stick){
    s.active=false; s.id=-1; s.ox=0; s.oy=0; s.dx=0; s.dy=0;
    s.hist=[]; s.riadotta=null;
  }
  Touch5.pend={}; Touch5.btnTouch={};
  if(Touch5.atti) Touch5.atti={};`,
  metti:
`     LA CORREZIONE ALLA REVISIONE (voce #85, correzione compito 2):
     azzerare a martello spegneva anche s.riadotta, e un pollice rimasto
     fisicamente giu' sullo stick ATTRAVERSO IL FISCHIO FINALE non manda
     un nuovo touchstart quando l'altra mano tocca RIVINCITA — in
     amichevole quel bottone chiama startMatch DIRETTAMENTE, senza
     pausa, ed endMatch() non tocca Touch5. Il dito restava fantasma:
     i suoi touchmove successivi non trovavano ne' uno stick attivo ne'
     un candidato in pend, cosa che PRIMA di questa toppa (quando
     Touch5 non veniva toccato affatto da startMatch) non succedeva.

     LA CURA instrada lo stesso azzeramento attraverso Touch5.azzera(),
     la funzione che pausa/ripresa gia' usa per lo stesso problema
     (cerca "SI TIENE L'ORIGINE" dentro Touch5.azzera): se lo stick era
     attivo la sua origine si consegna a s.riadotta invece di sparire, e
     il primo touchmove del dito ancora giu' lo riaggancia (cerca "LA
     RIADOZIONE" dentro Touch5.move). I due campi che la bisezione sopra
     dimostra causali restano coperti per intero — azzera() spegne la
     levetta attiva (active, id, dx, dy, hist) e CHIUDE gli atti/
     btnTouch orfani di un verbo a tenuta (chiudiCarica/annullaCarica/
     chiudiPassaL14) invece di limitarsi a cancellarli; quelle chiusure
     mutano un giocatore della partita che sta per finire, sostituito
     subito dopo da setupPlayers, quindi innocue anche al primissimo
     avvio, quando atti e btnTouch sono gia' vuoti. I campi rimasti
     innocui nella bisezione (ox/oy residuo, un candidato orfano in
     pend) restano innocui dentro azzera(): un candidato mai promosso
     puo' anche lui riagganciare un dito fermo, lo stesso contratto gia'
     misurato per pausa/ripresa (91 derive del dito appoggiato, C3/C4 di
     _q-precedenza.js).

     LA CURA DEL DETERMINISMO TIENE LO STESSO: le due sonde di bisezione
     (fuori/_diag-levetta-viva.js, fuori/_diag-verbo-tenuto.js) aprono la
     partita 2 con un touchstart VERO, e Touch5.start() cancella
     s.riadotta a martello per qualunque valore ereditato (cerca "un
     dito nuovo batte sempre quello da riadottare") prima ancora che
     serva a qualcosa — la differenza fra "riadotta=null" di prima e
     "riadotta={ox,oy}" di adesso non arriva mai al primo fotogramma
     della partita successiva. Restano rosse su fuori/base-85c2.html e
     verdi sul curato, stessi campioni di prima (6 e 7). Verificato
     anche dal vivo con fuori/_verifica-rivincita-dito.js: dito ancora
     giu' al fischio, click vero su RIVINCITA, primo touchmove dello
     stesso dito mai alzato — lo stick lo riadotta e il giocatore torna
     a muoversi invece di restare fermo. */
  Touch5.azzera();`,
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
/* CONTEGGI A DELTA */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['LA CORREZIONE ALLA REVISIONE (voce #85, correzione compito 2)', 1],
  ['  Touch5.azzera();', 1],
  ['for(const s of Touch5.stick){', -1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso ' + (n>=0?'+':'') + n + ', trovato ' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
