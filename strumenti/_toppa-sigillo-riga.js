/* =====================================================================
   _toppa-sigillo-riga.js — IL VERDETTO SI VEDE
   (voce #134, compito 2b).

   IL DIFETTO: la colonna `verificata` adesso arriva fino al telefono
   (compito 1) e non la guarda nessuno. `Sfida.dipingi` stampa quattro
   cose per riga — il pallino delle non guardate, il nome di chi ha
   attaccato, la riga piccola col risultato in parole, il punteggio e il
   bottone GUARDA — e della verifica, niente. Una pulizia che non si vede
   non e' una promessa mantenuta: e' la stessa promessa scritta piu' in
   piccolo.

   LA CURA: CINQUE PAROLE, una famiglia sola, cosi' che non ci sia un
   vocabolario da imparare.

     verificata = 0    DA VERIFICARE       lo dice il server
     verificata = 1    VERIFICATA          lo dice il server
     verificata = -1   NON TORNA           lo dice il server
     il replay torna   TORNA               lo dice questo telefono
     non giudicabile   NON VERIFICABILE    lo dice questo telefono

   PERCHE' «DA VERIFICARE» E NON «DA GUARDARE», che e' la parola scritta
   nello schema: nella stessa riga ci sono gia' un pallino ambra e un
   filo di sinistra acceso che vogliono dire «questa non l'hai ancora
   guardata», e il bottone accanto dice GUARDA. Una terza cosa che dice
   «da guardare» parlerebbe di un'altra faccenda con le stesse parole.

   PERCHE' «TORNA» E NON «VERIFICATA» quando lo dice il telefono: sono
   due fatti diversi. VERIFICATA vuol dire «il server l'ha controllata e
   i conti stanno in piedi»; TORNA vuol dire «il replay che hai appena
   visto finisce come dice il tabellone». Chi difende e' parte in causa:
   il suo telefono puo' dire che cosa ha visto, non puo' timbrare la
   classifica.

   NESSUN INNOCENTE ACCUSATO, ANCHE NELLE PAROLE: NON TORNA e' l'unico
   verdetto che puo' muovere punti, e dev'essere l'unica parola che
   accusa. INCOMPLETO, ALTRO MOTORE e NON FINISCE sono «non lo so» e
   diventano NON VERIFICABILE, con la causa vera nella riga di stato.

   L'AUTORITA' E' DEL SERVER: il sigillo di questo telefono si vede SOLO
   dove il server dice 0, cioe' «non lo so ancora». Se ha gia' deciso —
   1 o -1 — resta quello che dice lui.

   E STA SOTTO IL NOME, non in una fascia in cima. La fascia di
   riepilogo («3 da verificare, 1 non torna») e' la tentazione di questo
   cantiere e spingerebbe la prima riga sotto la piega su un telefono in
   orizzontale: e' il difetto gia' pagato del TORNEO, grep «LE OTTO
   SQUADRE SOPRA LA PIEGA».

   uso:  node strumenti/_toppa-sigillo-riga.js --out fuori/x.html
         node strumenti/_toppa-sigillo-riga.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const dentro = process.argv.includes('--dentro');
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = dentro ? inFile : path.resolve(RADICE, arg('out', 'fuori/gioco-sigillo-riga.html'));

/* ----------------------------------------------------------- 1) CSS */
const A1 = `.sfriga .fbtn{padding:5px 10px;font-size:11px;margin:0}`;
const B1 = `.sfriga .fbtn{padding:5px 10px;font-size:11px;margin:0}
/* IL SIGILLO DELLA VERIFICA (voce #134). Il verdetto del giudice arriva
   fin qui dal database (colonna \`verificata\`, GET /api/sfida) e questa
   riga e' l'unica cosa che lo fa vedere.
   STA SOTTO IL NOME, dentro la colonna che gia' scorre: una fascia di
   riepilogo in cima alla lista spingerebbe la prima riga sotto la piega
   su un telefono in orizzontale (difetto gia' pagato, grep «LE OTTO
   SQUADRE SOPRA LA PIEGA»). Misurato a 800x360: la prima riga chiudeva
   a 308 su una piega di 360, e questa riga in piu' costa un'interlinea.
   IL COLORE NON PORTA NIENTE DA SOLO — e' la regola di casa sull'alto
   contrasto: il segno e' la PAROLA, la tinta e' un aiuto. */
.sfsig{display:inline-block;margin-top:3px;max-width:100%;font-family:var(--cond);font-weight:700;
  font-size:9px;letter-spacing:.14em;text-transform:uppercase;padding:1px 5px;
  border:1px solid var(--linea);color:var(--grigio);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sfsig.si{color:var(--gesso);border-color:var(--gesso)}
.sfsig.no{color:var(--ambra);border-color:var(--ambra)}`;

/* ------------------------------------------- 2) la memoria dei verdetti */
const A2 = `  vistoQui: {},`;
const B2 = `  vistoQui: {},
  /* I VERDETTI DI QUESTA SESSIONE (voce #134). {id: {verdetto, causa}},
     coi cinque nomi del giudice — TORNA, NON TORNA, INCOMPLETO, ALTRO
     MOTORE, NON FINISCE.
     NON PARTE PER LA RETE, ed e' una scelta e non una pigrizia: chi ha
     subito la sfida ha un interesse diretto a che quel risultato cada, e
     un endpoint che accettasse «il mio telefono dice che il tuo replay
     non torna» sarebbe una leva per togliere punti a un innocente —
     esattamente il danno che tutta l'onda D esiste per evitare. Il
     verdetto che muove punti lo dara' il lavoratore differito, che una
     squadra in classifica non ce l'ha. */
  giudicato: {},`;

/* --------------------------------------- 3) le due porte del sigillo */
const A3 = `  /* -------------------------------------------------------- dipingere */`;
const B3 = `  /* =====================================================================
     LE CINQUE PAROLE, E CHI HA L'ULTIMA (voce #134).

     L'AUTORITA' E' DEL SERVER: il sigillo di questo telefono si vede
     SOLO dove il server dice 0, cioe' «non lo so ancora». Sovrascrivere
     un -1 del verificatore differito con un «non verificabile» di questo
     telefono vorrebbe dire nascondere l'unico verdetto che conta.
     E NON TORNA E' L'UNICA PAROLA CHE ACCUSA: gli altri tre «no» del
     giudice (INCOMPLETO, ALTRO MOTORE, NON FINISCE) vogliono dire «non
     lo so», e chi li scrive come un'accusa fa il danno che il cantiere
     #132 ha passato cinque canali a togliere di mezzo.
     ===================================================================== */
  sigillo(s){
    const v = (s && s.verificata) | 0;
    if(v === 1)  return { parola:'VERIFICATA', tinta:'si' };
    if(v === -1) return { parola:'NON TORNA',  tinta:'no' };
    const g = this.giudicato[(s && s.id) | 0];
    if(!g) return { parola:'DA VERIFICARE', tinta:'' };
    if(g.verdetto === 'TORNA')     return { parola:'TORNA',     tinta:'si' };
    if(g.verdetto === 'NON TORNA') return { parola:'NON TORNA', tinta:'no' };
    return { parola:'NON VERIFICABILE', tinta:'' };
  },
  /* la chiamano Sfida.guarda (sui rifiuti, prima del film) e chiudiSfida
     (a fine replay, quando il confronto col punteggio dichiarato e' gia'
     stato fatto): i due posti da cui un verdetto puo' uscire */
  sigilla(id, verdetto, causa){
    this.giudicato[id | 0] = { verdetto:String(verdetto || ''), causa:String(causa || '') };
    try{ this.dipingi(); }catch(e){}
  },

  /* -------------------------------------------------------- dipingere */`;

/* ------------------------------------------------- 4) la riga dipinta */
const A4 = `      h += '<div class="sfriga' + (nuova ? ' nuova' : '') + '">' +
             '<span class="sfp" aria-hidden="true"></span>' +
             '<div class="sfchi"><b>' + esc(chi) + '</b><small>' +
               esc(verdetto + ' · ' + (s.taglia|0) + ' contro ' + (s.taglia|0) +
                   (quandoFa(s.giocata) ? ' · ' + quandoFa(s.giocata) : '')) + '</small></div>' +`;
const B4 = `      const sig = this.sigillo(s);
      h += '<div class="sfriga' + (nuova ? ' nuova' : '') + '">' +
             '<span class="sfp" aria-hidden="true"></span>' +
             '<div class="sfchi"><b>' + esc(chi) + '</b><small>' +
               esc(verdetto + ' · ' + (s.taglia|0) + ' contro ' + (s.taglia|0) +
                   (quandoFa(s.giocata) ? ' · ' + quandoFa(s.giocata) : '')) + '</small>' +
               '<span class="sfsig ' + sig.tinta + '">' + esc(sig.parola) + '</span></div>' +`;

/* ------------------------------------------------------------------ */
const src = fs.readFileSync(inFile, 'utf8');
const coppie = [[A1, B1], [A2, B2], [A3, B3], [A4, B4]];
const guai = [];
coppie.forEach(([a], i) => {
  const n = src.split(a).length - 1;
  if (n !== 1) guai.push('ancora ' + (i + 1) + ': trovata ' + n + ' volte invece di 1');
});
if (guai.length) { console.error('FALLITO:\n  ' + guai.join('\n  ')); process.exit(1); }

let out = src;
for (const [a, b] of coppie) out = out.replace(a, b);

const attesi = [
  ['.sfsig{display:inline-block', 1],
  ['giudicato: {},', 1],
  ['sigillo(s){', 1],
  ['sigilla(id, verdetto, causa){', 1],
  ["'<span class=\"sfsig '", 1],
  ["parola:'DA VERIFICARE'", 1],
  ["parola:'NON VERIFICABILE'", 1],
  ["parola:'NON TORNA'", 2],       /* il -1 del server e il verdetto locale */
  /* quel che NON deve cambiare */
  ['const MOTORE_V = 2;', 1],
  ['function vagliaNastro(righe){', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  la riga della lista porta il sigillo: quattro ancore, +' + (out.length - src.length) + ' byte');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    prova:  node strumenti/_q-sigillo.js' + (dentro ? '' : ' --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/')));
