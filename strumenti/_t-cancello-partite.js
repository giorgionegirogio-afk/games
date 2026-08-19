/* =====================================================================
   _t-cancello-partite.js — LA MEDIA NON PUO' PIU' NASCONDERE LE PARTITE
   ROSSE.

   Toppa cerca/sostituisci su strumenti/collaudo.js (o --in). Sostituisce
   DUE ancoraggi ESATTI e scrive la copia in --out. Senza --out scrive
   accanto all'originale un file col suffisso .partite.js: mai
   sull'originale, se non con --dentro. Se anche un solo ancoraggio non
   compare ESATTAMENTE UNA VOLTA si ferma con codice 1, dice quale, e non
   scrive niente.

   uso:
     node strumenti/_t-cancello-partite.js --out fuori/collaudo.js
     node strumenti/_t-cancello-partite.js --dentro
     node strumenti/_t-cancello-partite.js --elenco

   ---------------------------------------------------------------------
   IL FATTO. Il controllo sul contrasto maglia/erba campiona TRE partite
   a semi dichiarati, mette tutti i pixel in un mucchio unico e stampa il
   rapporto del mucchio. Le tre partite una per una le stampa solo il
   DETTAGLIO, cioe' quando il controllo e' gia' fallito (o quando si
   chiede a mano con DETTAGLI=1). Percio' finche' il mucchio sta sopra la
   soglia, nessuno vede quante partite stanno sotto.
   Misurato il 19 agosto 2026 sul file di partenza, alla soglia di 3:1:
     P1 vista normale     2,61:1   2,05 / 4,57 / 2,13    2 su 3 sotto
     P2 vista normale     4,07:1   3,26 / 4,79 / 2,79    1 su 3 sotto
     P1 daltonismo        3,42:1   2,84 / 6,09 / 2,98    2 su 3 sotto
     P2 daltonismo        4,82:1   4,06 / 5,61 / 3,32    0 su 3 sotto
   Tre righe su quattro erano VERDI con almeno una partita rossa, e una
   di quelle tre aveva la maggioranza delle partite sotto la soglia. E la
   storia dice esattamente questo: prima della toppa che ha spostato il
   consumo dei sorteggi, P1 stava a 4,13 di media e il cancello era
   verde — con il difetto gia' dentro, e nessuno che lo potesse vedere.

   ---------------------------------------------------------------------
   LA CURA, E PERCHE' QUESTA E NON L'ALTRA.

   Le due strade erano: (a) far guardare al cancello il CASO PEGGIORE,
   cioe' bocciare quando la peggiore delle tre partite sta sotto la
   soglia; (b) fargli DICHIARARE quante partite singole stanno sotto.
   Questa toppa fa la (b), e la (a) e' stata provata e MISURATA prima di
   scartarla — non scartata per comodita'.

   Perche' la (a) non si puo' consegnare oggi. Con la sonda
   strumenti/_sonda-divise.js --cancello, che rifa' questo stesso
   protocollo su OGNI divisa del gioco (otto kit, dieci squadre di
   quartiere, la CPU, la coppia dell'alto contrasto), il conto e':
     ventuno configurazioni, DICIASSETTE con almeno una partita sotto
     3:1 sul file di partenza, e QUINDICI ancora dopo aver alzato le
     cinque divise piu' scure (strumenti/_t-divise.js).
   Il motivo non e' il colore delle maglie: e' che il rapporto dipende
   moltissimo da DOVE cade l'azione nel fotogramma. Sulle stesse tre
   partite la seconda vale sistematicamente il doppio delle altre due
   (4,57 contro 2,05 e 2,13 sulla stessa identica grafica). Per portare
   la peggiore delle tre sopra 3:1 servirebbe ogni divisa a luminanza
   nominale Y >= 0,70 — cioe' solo bianchi, gialli e lime: nessun rosso,
   nessun viola, nessun arancio, nessun celeste carico. Un cancello che
   nasce rosso e che per diventare verde chiede di ridipingere il gioco
   di pastello non e' una rete di sicurezza: e' un cancello spento il
   giorno dopo.

   COSA CAMBIA DAVVERO, ALLORA. La riga che il cancello stampa —
   SEMPRE, verde o rossa, senza DETTAGLI=1 — porta adesso tre numeri
   invece di uno: il mucchio, la PEGGIORE delle partite, e quante
   partite stanno sotto la soglia. Sulla riga che ha guidato alla cieca
   la notte del 16 si sarebbe letto
     contrasto maglia/erba, P1 in vista normale: 4,13:1 nel mucchio,
     peggiore partita X:1, 2 partite su 3 sotto il minimo (minimo 3:1)
   e nessuno l'avrebbe chiamata sana.

   LA SOGLIA NON SI MUOVE (resta SOGLIA_CONTRASTO = 3) E LA TOLLERANZA
   NON SI ALLARGA: la condizione di promozione e' identica a prima —
   capsula d'ombra valida, campioni abbastanza, mucchio >= soglia. Questa
   toppa aggiunge informazione, non permesso. Non puo' far passare
   niente che prima non passasse, e non puo' bocciare niente che prima
   passasse: e' verificabile leggendo la riga di 'ok', che non e'
   toccata.

   ---------------------------------------------------------------------
   NOTA DI SCRITTURA: gli ancoraggi qui sotto contengono backtick e
   ${...}, perche' il codice del cancello e' fatto di template literal.
   Per questo NON sono scritti come template literal ma come array di
   righe uniti da newline: un backtick dentro un template chiude la
   stringa e rompe il file, ed e' un errore che si paga una volta sola.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const R = a => a.join('\n');            // righe -> testo, senza template literal

const ANCORE = [

/* 1 — la riga che il cancello stampa */
{
  nome: '1/2 il controllo del contrasto: la riga porta il peggiore e il conto delle rosse',
  cerca: R([
    '    for (const s of mis.squadre) {',
    "      const chi = 'P' + (s.sq + 1);",
    '      /* pochi campioni non sono un esito buono: sarebbe un controllo che',
    '         passa perche\' non ha guardato niente. La soglia dei fotogrammi sale',
    '         con le partite: quattro su tre partite vorrebbe dire che due sono',
    '         andate quasi tutte perse. */',
    '      const abbastanza = s.nMaglia >= 200 && s.nErba >= 200 && mis.fotogrammi >= 3 * mis.partite;',
    '      const ok = mis.ombraHook && abbastanza && s.rapporto >= SOGLIA_CONTRASTO;',
    '      const disp = s.singole.length',
    '        ? ` — le ${s.singole.length} partite, una per una: ` + s.singole.map(v => v.toFixed(2)).join(\' / \')',
    "        : '';",
    '      verifica(ok,',
    '        `contrasto maglia/erba, ${chi} in ${modo.nome}: ` +',
    "        (s.rapporto == null ? 'non misurabile' : s.rapporto.toFixed(2) + ':1') +",
    "        ` (minimo ${SOGLIA_CONTRASTO}:1)` + (mis.guasto ? ' [GUASTO=1: maglia dipinta color erba]' : ''),",
    '        `maglia ${s.maglia} su erba ${s.erba}; ` +',
    '        `${s.nMaglia} campioni di maglia e ${s.nErba} d\'erba su ${mis.fotogrammi} fotogrammi ` +',
    '        `in ${mis.partite} partite` + disp +',
    "        (abbastanza ? '' : ' — TROPPO POCHI: la misura non ha guardato abbastanza pixel'));",
    '    }',
  ]),
  metti: R([
    '    for (const s of mis.squadre) {',
    "      const chi = 'P' + (s.sq + 1);",
    '      /* pochi campioni non sono un esito buono: sarebbe un controllo che',
    '         passa perche\' non ha guardato niente. La soglia dei fotogrammi sale',
    '         con le partite: quattro su tre partite vorrebbe dire che due sono',
    '         andate quasi tutte perse. */',
    '      const abbastanza = s.nMaglia >= 200 && s.nErba >= 200 && mis.fotogrammi >= 3 * mis.partite;',
    '      const ok = mis.ombraHook && abbastanza && s.rapporto >= SOGLIA_CONTRASTO;',
    '      const disp = s.singole.length',
    '        ? ` — le ${s.singole.length} partite, una per una: ` + s.singole.map(v => v.toFixed(2)).join(\' / \')',
    "        : '';",
    '      /* =================================================================',
    '         IL MUCCHIO NON BASTA A RACCONTARE TRE PARTITE, e il 19 agosto 2026',
    '         lo ha dimostrato: 2,61:1 di mucchio con le tre partite a 2,05 /',
    '         4,57 / 2,13, cioe\' DUE SU TRE sotto il minimo. Con l\'altro seme',
    '         (quello di prima della toppa sui sorteggi) lo stesso identico',
    '         gioco stampava 4,13 e il cancello era verde, con lo stesso difetto',
    '         dentro. Una media regge una partita brillante e due scure senza',
    '         far rumore: e\' il modo in cui questa misura ha guidato alla cieca',
    '         una notte intera.',
    '         Da qui in poi la riga porta TRE numeri e li porta SEMPRE, verde o',
    '         rossa, senza bisogno di DETTAGLI=1: il mucchio, la PEGGIORE delle',
    '         partite, e quante partite stanno sotto la soglia. Chi legge vede',
    '         la dispersione invece di doverla immaginare.',
    '         LA CONDIZIONE DI PROMOZIONE NON E\' TOCCATA (vedi la riga di "ok"',
    '         qui sopra: capsula valida, campioni abbastanza, mucchio sopra la',
    '         soglia) e SOGLIA_CONTRASTO resta 3. Questa e\' informazione, non',
    '         permesso: non fa passare niente che prima non passasse.',
    '         PERCHE\' NON SI BOCCIA SULLA PEGGIORE, che era l\'altra strada.',
    '         Provata e misurata con strumenti/_sonda-divise.js --cancello, che',
    '         rifa\' questo protocollo su ogni divisa del gioco: DICIASSETTE',
    '         configurazioni su ventuno hanno almeno una partita sotto 3:1, e',
    '         restano quindici anche dopo aver alzato le cinque divise piu\'',
    '         scure. La causa non e\' il colore ma DOVE cade l\'azione nel',
    '         fotogramma: sulle stesse tre partite la seconda vale il doppio',
    '         delle altre due a grafica identica. Bocciare sulla peggiore',
    '         chiederebbe ogni divisa a Y nominale >= 0,70, cioe\' solo bianchi,',
    '         gialli e lime — un cancello che nasce rosso e che per diventare',
    '         verde chiede di ridipingere il gioco di pastello viene spento la',
    '         settimana dopo, e allora non misura piu\' niente.',
    '         ================================================================= */',
    '      const sotto = s.singole.filter(v => v != null && v < SOGLIA_CONTRASTO).length;',
    '      const peggiore = s.singole.length ? Math.min.apply(null, s.singole.filter(v => v != null)) : null;',
    '      verifica(ok,',
    '        `contrasto maglia/erba, ${chi} in ${modo.nome}: ` +',
    "        (s.rapporto == null ? 'non misurabile' : s.rapporto.toFixed(2) + ':1 nel mucchio') +",
    "        (peggiore == null || !isFinite(peggiore) ? '' : `, peggiore partita ${peggiore.toFixed(2)}:1`) +",
    '        (s.singole.length ? `, ${sotto} ' + 'partite su ${s.singole.length} sotto il minimo` : \'\') +',
    "        ` (minimo ${SOGLIA_CONTRASTO}:1)` + (mis.guasto ? ' [GUASTO=1: maglia dipinta color erba]' : ''),",
    '        `maglia ${s.maglia} su erba ${s.erba}; ` +',
    '        `${s.nMaglia} campioni di maglia e ${s.nErba} d\'erba su ${mis.fotogrammi} fotogrammi ` +',
    '        `in ${mis.partite} partite` + disp +',
    "        (abbastanza ? '' : ' — TROPPO POCHI: la misura non ha guardato abbastanza pixel'));",
    '    }',
  ]),
},

/* 2 — il commento in testa alla misura, che dichiarava i valori di partenza */
{
  nome: '2/2 i valori di partenza dichiarati nel commento: rettifica in chiaro',
  cerca: R([
    '     Il cancello passa, e l\'allarme della notte del 16 era un artefatto',
    '     della misura, non una regressione del colore. Ma il margine e\' sottile',
    '     e va detto: la squadra 1 in daltonismo scende a 3,14 nella peggiore',
    '     delle tre partite, e la rosa in vista normale a 2,99. Sono numeri da',
    '     tenere d\'occhio, non da festeggiare.',
  ]),
  metti: R([
    '     Il cancello passa, e l\'allarme della notte del 16 era un artefatto',
    '     della misura, non una regressione del colore. Ma il margine e\' sottile',
    '     e va detto: la squadra 1 in daltonismo scende a 3,14 nella peggiore',
    '     delle tre partite, e la rosa in vista normale a 2,99. Sono numeri da',
    '     tenere d\'occhio, non da festeggiare.',
    '',
    '     RETTIFICA, 19 agosto 2026. "Numeri da tenere d\'occhio" era ancora',
    '     troppo tranquillo, e i valori qui sopra sono scaduti. Rimisurati oggi',
    '     sullo stesso banco, con le stesse tre partite:',
    '       vista normale     P1 2,61:1 (2,05 / 4,57 / 2,13)   2 su 3 sotto',
    '                         P2 4,07:1 (3,26 / 4,79 / 2,79)   1 su 3 sotto',
    '       daltonismo        P1 3,42:1 (2,84 / 6,09 / 2,98)   2 su 3 sotto',
    '                         P2 4,82:1 (4,06 / 5,61 / 3,32)   0 su 3 sotto',
    '     Nessuna modifica ha introdotto il calo: una toppa ha cambiato il',
    '     consumo dei sorteggi e il gioco ha cominciato a pescare coppie di',
    '     divise che prima non uscivano mai. Il difetto c\'era sempre, e a',
    '     nasconderlo era il seme — piu\' esattamente, il fatto che una MEDIA di',
    '     tre partite resta verde con due partite rosse dentro. Da qui la riga',
    '     che il controllo stampa dichiara anche la peggiore delle partite e',
    '     quante stanno sotto la soglia, e la tabella completa di TUTTE le',
    '     divise del gioco (non solo le due in campo) la fa',
    '     strumenti/_sonda-divise.js.',
  ]),
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-cancello-partite.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'strumenti', 'collaudo.js')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.js$/i, '') + '.partite.js';
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
    console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
    console.error('    testo cercato:\n' + m.a.cerca.split('\n').map(r => '      ' + r).join('\n'));
  }
  process.exit(1);
}
/* controlli DOPO la sostituzione: la soglia non si e' mossa, la condizione
   di promozione non e' stata toccata, e i due numeri nuovi ci sono */
const attesi = [
  ['const SOGLIA_CONTRASTO = 3;', 1],
  ['const ok = mis.ombraHook && abbastanza && s.rapporto >= SOGLIA_CONTRASTO;', 1],
  ['const sotto = s.singole.filter(v => v != null && v < SOGLIA_CONTRASTO).length;', 1],
  ['peggiore partita ', 1],
  ['sotto il minimo`', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
/* e il file toppato deve essere JavaScript valido: un backtick fuori posto
   dentro un template literal non si vede a occhio, si vede qui */
try { new (require('vm').Script)(out, { filename: outFile }); }
catch (e) { console.error('FALLITO: il file toppato non compila — ' + e.message); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte, ' + (out.length - src.length >= 0 ? '+' : '') + (out.length - src.length) + ')');
