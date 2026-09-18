/* =====================================================================
   _t-rivedi-tutorial.js — LA LEZIONE HA UNA MANIGLIA PER RIAPRIRLA.

   Toppa cerca/sostituisci nel formato di casa (modello _t-crediti.js).
   Legge CALCETTO-il-gioco.html (o --in), sostituisce DUE ancoraggi
   ESATTI e scrive la copia in --out. Senza --out scrive accanto
   all'originale un file col suffisso .rivedi-tut.html: MAI
   sull'originale, se non con --dentro. Se anche un solo ancoraggio non
   compare ESATTAMENTE UNA VOLTA si ferma con codice 1, dice quale, e
   non scrive niente.

   ---------------------------------------------------------------------
   IL PERCHE'. Il tutorial vero (l'oggetto Tut, non la schermata COME SI
   GIOCA) parte una volta sola nella vita di un salvataggio: alla prima
   amichevole 1 giocatore, e smette di riproporsi dopo la terza apertura
   (TUT_APERTURE) o dopo essere arrivato in fondo (Tut.finish). Chi lo
   chiude per sbaglio, o lo salta perche' ha fretta la prima volta, non
   ha piu' modo di rivederlo: l'unica via era azzerare TUTTO il
   salvataggio, monete e trofei compresi. Questa voce (voce #112,
   compito 3) apre una porta piu' piccola: RIVEDI IL TUTORIAL, nel
   pannello dell'ingranaggio (id=extra), accanto a COME SI GIOCA.

   COSA FA IL BOTTONE, e niente di piu': azzera SAVE.tutorialDone e
   SAVE.tutorialVisto, poi persiste. NON chiama Tut.start() — non tocca
   la macchina del tutorial per niente. La lezione vera riparte da sola,
   alla guardia che il gioco ha gia' dentro startMatch (:11156):
   amichevole 1 giocatore, nessuna CPU al posto mio, nessuna sfida.
   Questo bottone non scavalca quella guardia, la lascia intatta: si
   limita a togliere il permesso negato (tutorialDone) e a resettare la
   conta delle aperture (tutorialVisto), cosi' la prossima amichevole 1p
   la trova di nuovo a zero invece che gia' alla terza.

   LA TRAPPOLA CHE QUESTA TOPPA EVITA (ricognizione, voce #112):
   azzerare SOLO tutorialDone non basterebbe. Tut.start() scrive
   `SAVE.tutorialVisto = (SAVE.tutorialVisto|0) + 1; if(tutorialVisto >=
   TUT_APERTURE) SAVE.tutorialDone = true;` PRIMA di mostrare qualunque
   cosa (:40512-40513): se tutorialVisto fosse rimasto a 3 o piu', la
   primissima Tut.start() della nuova amichevole richiuderebbe la porta
   nello stesso istante in cui l'ha aperta. Da qui l'handler azzera
   ENTRAMBI i flag, sempre insieme.

   COSA AGGIUNGE, e niente altro:
     1. una voce RIVEDI IL TUTORIAL nella schermata dell'ingranaggio
        (#extra), accanto a COME SI GIOCA — non nel pannello PREFERENZE
        (id=impostazioni): la ricognizione indica extra, ed e' li' che
        vive gia' COME SI GIOCA, il vicino piu' naturale;
     2. il gestore di clic, accanto a quello di btnHow: azzera i due
        flag, persiste, mostra un toast di conferma onesto (non
        promette una lezione immediata: la promessa e' "alla prossima
        amichevole a un giocatore", non "adesso").

   COSA NON TOCCA: la macchina Tut (start/stop/finish restano
   identiche), la guardia di startMatch (:11156), defaultSave(). Zero
   dado(), zero stato che la CPU legge, zero schermata nuova da
   registrare in SCREENS (il bottone vive in una schermata che esiste
   gia'). Nessun banco a seme fisso puo' accorgersene finche' nessuno
   preme il bottone.

   uso:
     node strumenti/_t-rivedi-tutorial.js --elenco
     node strumenti/_t-rivedi-tutorial.js --out fuori/rivedi-tut.html
     node strumenti/_t-rivedi-tutorial.js --in altro.html --out x.html
     node strumenti/_t-rivedi-tutorial.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const ANCORE = [

/* 1 — la voce nel menu dell'ingranaggio, accanto a COME SI GIOCA.
   Sottotitolo ONESTO: non promette un tutorial immediato, dice quando
   arriva davvero (la prossima amichevole a un giocatore). */
{
  nome: '1/2 la voce RIVEDI IL TUTORIAL nella schermata #extra',
  cerca:
`      <button class="voce" id="btnHow">COME SI GIOCA <small>regole e comandi</small></button>
      <!-- la porta della licenza:`,
  metti:
`      <button class="voce" id="btnHow">COME SI GIOCA <small>regole e comandi</small></button>
      <!-- RIVEDI IL TUTORIAL (voce #112, compito 3). Azzera SOLO i due
           flag del salvataggio (tutorialDone e tutorialVisto): la
           lezione vera (Tut) la accende da sola la guardia dentro
           startMatch (:11156) alla prossima amichevole 1 giocatore.
           Il sottotitolo lo dice chiaro per non promettere un tutorial
           che parte subito, sopra questa stessa schermata. -->
      <button class="voce" id="btnRivediTut">RIVEDI IL TUTORIAL <small>lo rivedi alla prossima amichevole a un giocatore</small></button>
      <!-- la porta della licenza:`,
},

/* 2 — il gestore di clic, accanto a quello di COME SI GIOCA. Modello
   esatto: SAVE.tutorialDone=false; SAVE.tutorialVisto=0; persistSave();
   poi il toast di casa (funzione toast(), la stessa di TUTORIAL
   COMPLETATO in Tut.finish, :40606). */
{
  nome: '2/2 il gestore di RIVEDI IL TUTORIAL',
  cerca:
`$('btnHow').addEventListener('click', ()=>{ Audio5.unlock(); goScreen(ui.howto); });`,
  metti:
`$('btnHow').addEventListener('click', ()=>{ Audio5.unlock(); goScreen(ui.howto); });
/* RIVEDI IL TUTORIAL (voce #112, compito 3). ENTRAMBI i flag, sempre
   insieme: azzerare solo tutorialDone non basterebbe, perche'
   Tut.start() lo rimetterebbe a true alla primissima apertura se
   tutorialVisto fosse rimasto a TUT_APERTURE o piu' (vedi :40513).
   Questo handler non chiama Tut.start(): non tocca la macchina del
   tutorial, si limita a togliere il permesso negato. La guardia che
   decide SE e QUANDO il tutorial riparte resta quella di sempre,
   dentro startMatch. */
$('btnRivediTut').addEventListener('click', ()=>{
  Audio5.unlock();
  SAVE.tutorialDone=false; SAVE.tutorialVisto=0;
  persistSave();
  toast('laurea','TUTORIAL RIAPERTO','Lo rivedi alla prossima amichevole a un giocatore.');
});`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-rivedi-tutorial.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.rivedi-tut.html';
outFile = path.resolve(outFile);
if (!dentro && outFile === inFile) {
  console.error('FALLITO: --out coincide con --in. Senza --dentro non si scrive sull\'originale.');
  process.exit(2);
}

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n, a }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi che non compaiono esattamente una volta — niente e\' stato scritto.');
  for (const m of mancanti) {
    console.error(`  · ${m.nome}: trovato ${m.n} volte`);
    console.error('    testo cercato:\n' + m.a.cerca.split('\n').map(r => '      ' + r).join('\n'));
  }
  process.exit(1);
}
/* controlli dopo la sostituzione: i ganci che il gioco e il banco si
   aspettano di trovare */
const attesi = [
  ['id="btnRivediTut"', 1],
  ["$('btnRivediTut')", 1],
  ['RIVEDI IL TUTORIAL', 3],   // il bottone + i due commenti (voce e gestore)
  ['TUTORIAL RIAPERTO', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => `${s.slice(0, 50)} atteso ${n}, trovato ${out.split(s).length - 1}`);
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${ANCORE.length} ancoraggi applicati`);
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
console.log('    ora: node strumenti/_q-accessibile.js   deve dare 5/5');
