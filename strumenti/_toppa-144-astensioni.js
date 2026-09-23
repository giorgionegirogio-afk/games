/* =====================================================================
   _toppa-144-astensioni.js — LE TRE ASTENSIONI DELLO SCHERMO SI
   CONDIZIONANO, NON SI TOLGONO
   (voce #144, compito 4)

   IL PROBLEMA, e ha due corni. Dal #133 e dal #139 il giudice si astiene
   su tre cause quando lo schermo non torna: `schermo-ignoto` (il nastro
   non dice su che finestra si e' giocato), `schermo-diverso` (lo dice e
   non e' la mia), `schermo-cambiato` (e' cambiata a meta' partita, e
   quella non si ripara in NESSUNA finestra — e' il prezzo dichiarato dal
   #139: un nastro con la barra dell'URL comparsa resta aperto per
   sempre).

   Adesso che il comando e' un ATTO e non un pixel, quelle tre cause non
   hanno piu' senso per i nastri nuovi: un nastro di atti non si accorge
   che e' comparsa la barra dell'URL. Ma:

     · TOGLIERLE renderebbe giudicabili i nastri VECCHI, che giudicabili
       non sono: quelli i pixel ce li hanno ancora dentro, e su una
       finestra diversa rigiocano un'altra partita. Sarebbe la peggiore
       delle due: si tornerebbe ad accusare, e proprio la gente che il
       #133 aveva smesso di accusare;
     · TENERLE COM'ERANO renderebbe inutile tutta la cura: i nastri nuovi
       continuerebbero ad astenersi per uno schermo che non conta piu'.

   LA SCELTA, e si legge in una riga: **il nastro si astiene sullo
   schermo se e solo se porta un PIXEL**, cioe' se ha almeno una riga di
   tipo 0 o di tipo 1. Non e' una data, non e' una versione, non e' un
   flag: e' una proprieta' del NASTRO, che si legge guardandolo. Un
   nastro costruito a mano con un pixel dentro si astiene; un nastro di
   soli atti no. E il ripiego delle quattro porte — un movimento che
   arriva per un dito di cui non si e' visto l'atto si scrive come pixel
   (tipo 1) invece di buttarlo — ricade da solo dalla parte giusta: quel
   nastro porta un pixel, quindi quel nastro si astiene.

   LA RIGA 10 RESTA. La misura della finestra si continua a scrivere:
   non decide piu' niente, ma costa cinque numeri per cambio e un referto
   deve poter dire su che telefono si e' giocato. Un dato che non decide
   non e' un dato inutile.

   uso:  node strumenti/_toppa-144-astensioni.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
const agg = (nome, cerca, sostituisci) => CAMBI.push({ nome, cerca, sostituisci });

/* ------------------------------------------------------------------
   1) la domanda: questo nastro porta ancora un pixel?
   ------------------------------------------------------------------ */
agg('nastroHaPixel', `function improntaDelNastro(){
  try{
    for(const r of Reg.righe) if(r[1] === 11) return (r[3]|0) >>> 0;
  }catch(e){}
  return 0;
}`,
`function improntaDelNastro(){
  try{
    for(const r of Reg.righe) if(r[1] === 11) return (r[3]|0) >>> 0;
  }catch(e){}
  return 0;
}

/* =====================================================================
   QUESTO NASTRO PORTA ANCORA UN PIXEL? (voce #144)

   E' la domanda che decide se le tre astensioni dello schermo hanno
   qualcosa da dire. Un nastro di soli ATTI (tipi 12 e 13) non si
   accorge ne' della finestra, ne' del pollice, ne' della tacca: i suoi
   comandi dicono QUALE DISCO e non QUALE PUNTO, e il punto se lo rifa'
   chi rilegge con la propria geometria. Un nastro con dentro anche un
   solo tipo 0 o tipo 1 invece porta un pixel di un altro telefono, e su
   una finestra diversa quel pixel preme un'altra cosa.

   SI GUARDA IL NASTRO, NON LA SUA ETA'. Una guardia per versione — «i
   nastri dopo il tal giorno non si astengono» — direbbe la cosa giusta
   quasi sempre e quella sbagliata nei casi che contano: un nastro
   costruito a mano, un nastro cominciato a meta', un nastro in cui il
   ripiego delle quattro porte ha dovuto scrivere un pixel perche' il
   touchstart di un dito era andato perso. Tutti e tre portano un pixel,
   e tutti e tre devono astenersi.

   La legge in due: il giudice, per sapere se astenersi, e la staffetta,
   per sapere se quel nastro chiede una finestra sua. Una funzione sola,
   perche' i due capi devono guardare la stessa cosa (e' la stessa
   ragione di schermiDelNastro e di improntaDelNastro).
   ===================================================================== */
function nastroHaPixel(){
  try{
    for(const r of Reg.righe) if(r[1] === 0 || r[1] === 1) return true;
  }catch(e){}
  return false;
}`);

/* ------------------------------------------------------------------
   2) schermo-ignoto, solo se c'e' un pixel da collocare
   ------------------------------------------------------------------ */
agg('schermo-ignoto condizionato', `  const sc = schermiDelNastro();
  if(!sc.length) return no('INCOMPLETO','schermo-ignoto');
  out.schermo = sc[0];
  out.schermi = sc;`,
`  const sc = schermiDelNastro();
  out.schermo = sc.length ? sc[0] : null;
  out.schermi = sc;
  /* =====================================================================
     E LE TRE ASTENSIONI DELLO SCHERMO VALGONO SOLO PER I NASTRI CHE
     PORTANO UN PIXEL (voce #144).

     Il canale dei pixel era il SESTO, e non passava dai sorteggi: un
     comando era un punto sullo schermo, e su un altro schermo lo stesso
     punto premeva altro. Adesso un comando e' un ATTO — squadra, esito,
     disco, e il punto di posa in unita' della geometria dei comandi — e
     chi rilegge il punto se lo rifa' con la PROPRIA geometria. Un nastro
     cosi' non si accorge ne' della finestra, ne' del pollice, ne' della
     tacca: MISURATO (strumenti/_q-schermi.js) lo stesso nastro rigioca
     lo stesso punteggio su 800x360, 844x390, 915x412, 1280x720, col
     pollice al massimo e con la tacca di un telefono.

     LE TRE CAUSE RESTANO, e non e' pigrizia: i nastri di PRIMA i pixel
     ce li hanno ancora dentro, e per loro tutto quel che il #133 e il
     #139 hanno scritto qui sotto vale parola per parola. Togliere le
     astensioni li renderebbe giudicabili senza renderli verificabili, e
     si tornerebbe ad accusare gente onesta — che e' esattamente la cosa
     che quelle due voci sono costate.

     E IL PREZZO DEL #139 DECADE PER I NASTRI NUOVI: «un nastro con la
     finestra mossa resta aperto per sempre» era vero finche' il comando
     era un punto. Un nastro di atti non si accorge che e' comparsa la
     barra dell'URL.
     ===================================================================== */
  const pixel = nastroHaPixel();
  if(pixel && !sc.length) return no('INCOMPLETO','schermo-ignoto');`);

/* ------------------------------------------------------------------
   3) schermo-cambiato e schermo-diverso, idem
   ------------------------------------------------------------------ */
agg('schermo-cambiato e schermo-diverso condizionati',
`  if(sc.length > 1) return no('INCOMPLETO','schermo-cambiato');
  if(sc[0][0] !== (innerWidth|0) || sc[0][1] !== (innerHeight|0)) return no('INCOMPLETO','schermo-diverso');`,
`  if(pixel && sc.length > 1) return no('INCOMPLETO','schermo-cambiato');
  if(pixel && (sc[0][0] !== (innerWidth|0) || sc[0][1] !== (innerHeight|0))) return no('INCOMPLETO','schermo-diverso');`);

/* ------------------------------------------------------------------
   4) e il banco puo' chiederlo senza frugare in Reg
   ------------------------------------------------------------------ */
agg('__test.nastroHaPixel', `  /* e quella scritta nel nastro appena deserializzato, 0 se non c'e' */
  get nastroImpronta(){ return improntaDelNastro(); },`,
`  /* e quella scritta nel nastro appena deserializzato, 0 se non c'e' */
  get nastroImpronta(){ return improntaDelNastro(); },
  /* VERO se il nastro appena deserializzato porta ancora un PIXEL (voce
     #144): e' la domanda che decide se le tre astensioni dello schermo
     hanno qualcosa da dire, e la chiedono il banco e la staffetta. */
  get nastroHaPixel(){ return nastroHaPixel(); },`);

/* ------------------------------------------------------------------
   IL CANCELLO: o tutti gli ancoraggi sono unici, o non si scrive niente.
   ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-144-astensioni.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(c.nome + ': ancoraggio trovato ' + n + ' volte (ne serve esattamente 1)'); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
fs.writeFileSync(usc, t);
console.log('toppa applicata: ' + CAMBI.length + ' cambi, ' + ing + ' -> ' + usc);
