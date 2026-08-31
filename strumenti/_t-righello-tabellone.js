/* =====================================================================
   _t-righello-tabellone.js — IL FOTOGRAMMA SENZA IL TABELLONE
   (29 agosto 2026).

   PERCHE' ESISTE. La voce 36 del confronto con FC Mobile si chiama, per
   esteso, «quanto schermo mangia l'interfaccia, MISURATO SUI RIQUADRI
   CHE IL GIOCO DICHIARA». E' scritto nel titolo: quel numero — 14,0%
   medio, di cui 6,1 punti di tabellone — nasce da __test.zoneInterfaccia,
   cioe' dalla parola del gioco. In questa casa e' gia' successo tre
   volte che un cancello leggesse la dichiarazione e desse verde a un
   gioco costruito per mentirgli (l'ultima il 28 agosto: _crit8-bugiarda.js
   dichiarava la pastiglia dei dischi vuota e la dipingeva piena, e
   _q-dischi.js la promuoveva otto controlli su otto).

   Questa toppa apre l'altra strada, la stessa che _t-senza-dischi.js ha
   aperto per i comandi: disegnare DUE VOLTE lo stesso fotogramma, con la
   lavagnetta e senza, e contare i pixel che cambiano. Cio' che cambia
   l'ha dipinto il tabellone; tutto il resto e' mondo.

   NON E' UNA CURA E NON VA SPEDITA DENTRO IL GIOCO. E' il righello con
   cui strumenti/_q-tabellone.js misura, e il cancello se la innesta da
   se' sulla COPIA SERVITA — cosi' misura con lo stesso metro il gioco di
   oggi e quello curato, che e' l'unico modo perche' un prima/dopo
   significhi qualcosa.

   TRE GANCI:
     SENZA_TAB          drawHUD salta il blocco della lavagnetta — e solo
                        quello: minimappa, chevron, avvisi e targhette
                        restano, perche' il termine di paragone deve
                        differire per una cosa sola.
     senzaTabellone(v)  l'interruttore.
     veloTabellone(v)   legge e SCRIVE TAB_VELO. Serve perche' il velo si
                        muove a ogni disegno (velaTabellone ha il suo
                        ripiego G.renderDT||0.016, che il congelamento
                        del banco non ferma): senza poterlo rimettere
                        dov'era, due disegni identici non danno zero e il
                        righello non ha lo zero.

   COSA NON TOCCA: l'ingresso, la simulazione, il conto dei sorteggi.
   Non c'e' un dado() in piu' ne' in meno — verificato a ogni
   applicazione, qui sotto.

   uso:  node strumenti/_t-righello-tabellone.js --out fuori/righello.html
         node strumenti/_t-righello-tabellone.js --elenco
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

/* 1 — la bandiera nasce accanto a quella dei dischi: sono la stessa
   specie di interruttore, e chi cerca l'una deve inciampare nell'altra */
{
  nome: '1/4 la bandiera SENZA_TAB accanto a SENZA_DISCHI',
  cerca: `let SENZA_DISCHI=false;`,
  metti:
`let SENZA_DISCHI=false;
/* =====================================================================
   IL TABELLONE TOLTO DAL FOTOGRAMMA — solo resa, e serve a MISURARE
   (29 agosto 2026, strumenti/_t-righello-tabellone.js).

   Stessa specie di SENZA_DISCHI qui sopra, stesso motivo: la superficie
   che la lavagnetta ruba allo schermo si CONTA sui pixel che cambiano
   fra il fotogramma con e quello senza, non si chiede al gioco. La
   dichiarazione (zoneInterfaccia) resta, e serve: e' l'altra meta' del
   controllo, perche' un pannello che dipinge fuori dal riquadro che
   dichiara e' esattamente la bugia che questo righello sa vedere.
   ===================================================================== */
let SENZA_TAB=false;`,
},

/* 2 — drawHUD salta la lavagnetta, e solo lei */
{
  nome: '2/4 drawHUD salta il blocco della lavagnetta (apertura)',
  cerca:
`  ctx.save();
  /* ===================================================================
     LA LAVAGNETTA SI VELA, LE CIFRE NO.`,
  metti:
`  ctx.save();
  /* IL RIGHELLO: col fotogramma senza lavagnetta si misura a pixel
     quanto schermo mangia. Il blocco resta indentato com'era — questa e'
     una toppa da banco, e un rientro nuovo su duecento righe farebbe
     sparire la toppa vera dentro il diff. Le due strade escono dallo
     stesso ctx.restore(), quindi lo stato della tela e' identico nei due
     casi: chi disegna dopo (avvisi, chevron, bussola) non si accorge di
     niente, e i pixel che cambiano sono soltanto quelli del tabellone. */
  if(SENZA_TAB){ ctx.restore(); }else{
  /* ===================================================================
     LA LAVAGNETTA SI VELA, LE CIFRE NO.`,
},

/* 3 — e si richiude dove la lavagnetta finisce */
{
  nome: '3/4 drawHUD salta il blocco della lavagnetta (chiusura)',
  cerca:
`  ctx.fillStyle='rgba(255,222,164,.10)'; ctx.fillRect(px0,H-1,PW,1);
  ctx.restore();                       // fine del velo della lavagnetta`,
  metti:
`  ctx.fillStyle='rgba(255,222,164,.10)'; ctx.fillRect(px0,H-1,PW,1);
  ctx.restore();                       // fine del velo della lavagnetta
  }                                    // fine di if(SENZA_TAB){...}else{`,
},

/* 4 — i due ingressi, accanto a quelli dei dischi */
{
  nome: '4/4 __test.senzaTabellone e __test.veloTabellone',
  cerca: `  senzaDischi(v){ SENZA_DISCHI=!!v; return SENZA_DISCHI; },`,
  metti:
`  senzaDischi(v){ SENZA_DISCHI=!!v; return SENZA_DISCHI; },
  /* =====================================================================
     IL FOTOGRAMMA SENZA IL TABELLONE, E IL VELO IN MANO A CHI MISURA.

       senzaTabellone(true); disegna()  -> il mondo, senza la lavagnetta
       veloTabellone()                  -> il velo com'e' adesso
       veloTabellone(v)                 -> lo rimette dov'era

     Il secondo esiste per una ragione sola e vale la pena scriverla: il
     velo si muove A OGNI DISEGNO, perche' velaTabellone avanza di un
     passo con il ripiego (G.renderDT||0.016) e il congelamento del banco
     — che azzera renderDT — non lo ferma. Un banco che disegni due volte
     lo stesso fotogramma trova quindi due tabelloni di opacita' diversa
     e crede di aver misurato qualcosa. Con questo gancio lo rimette
     dov'era, come gia' fa con la camera e con G.miniY.
     ===================================================================== */
  senzaTabellone(v){ SENZA_TAB=!!v; return SENZA_TAB; },
  veloTabellone(v){ if(v!==undefined) TAB_VELO=+v; return TAB_VELO; },`,
},

];

/* =====================================================================
   I CONTROLLI DOPO LA SOSTITUZIONE: non «ho scritto», ma «c'e', ed e'
   uno solo». Una toppa applicata due volte si vede qui.
   ===================================================================== */
const ATTESI = [
  ['let SENZA_TAB=false;', 1],
  ['  if(SENZA_TAB){ ctx.restore(); }else{', 1],
  ['  }                                    // fine di if(SENZA_TAB){...}else{', 1],
  ['  senzaTabellone(v){ SENZA_TAB=!!v; return SENZA_TAB; },', 1],
  ['  veloTabellone(v){ if(v!==undefined) TAB_VELO=+v; return TAB_VELO; },', 1],
  ['let SENZA_DISCHI=false;', 1],
];

const conta = (s, re) => (s.match(re) || []).length;

function applica(src) {
  if (src.indexOf('senzaTabellone(v){ SENZA_TAB=!!v;') >= 0) return { out: src, ancore: 0, gia: true };
  let out = src;
  const mancanti = [];
  for (const a of ANCORE) {
    const n = out.split(a.cerca).length - 1;
    if (n !== 1) { mancanti.push(a.nome + ': trovato ' + n + ' volte'); continue; }
    out = out.replace(a.cerca, a.metti);
  }
  if (mancanti.length) throw new Error('ancoraggi non trovati esattamente una volta:\n  · ' + mancanti.join('\n  · '));
  const rotti = ATTESI.filter(([s, n]) => (out.split(s).length - 1) !== n)
    .map(([s, n]) => JSON.stringify(s) + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
  if (rotti.length) throw new Error('dopo la sostituzione:\n  ' + rotti.join('\n  '));
  /* LA LEGGE SUI SORTEGGI, contata due volte come in _t-senza-dischi.js:
     sul letterale (le chiamate vere) e con la rete larga \bdado\s*\( */
  const d0 = conta(src, /dado\(/g), d1 = conta(out, /dado\(/g);
  const l0 = conta(src, /\bdado\s*\(/g), l1 = conta(out, /\bdado\s*\(/g);
  const r0 = conta(src, /Math\.random\s*\(/g), r1 = conta(out, /Math\.random\s*\(/g);
  if (d0 !== d1 || l0 !== l1) throw new Error('dado() ' + d0 + ' -> ' + d1 + ' (largo ' + l0 + ' -> ' + l1 + ')');
  if (r0 !== r1) throw new Error('Math.random ' + r0 + ' -> ' + r1);
  return { out, ancore: ANCORE.length, gia: false, dado: d1, random: r1 };
}

module.exports = { ANCORE, applica };

/* ------------------------------------------------------------ comando */
if (require.main === module) {
  if (haFlag('elenco')) {
    console.log('_t-righello-tabellone.js — ' + ANCORE.length + ' ancoraggi:');
    for (const a of ANCORE) console.log('  · ' + a.nome);
    process.exit(0);
  }
  if (haFlag('dentro')) { console.error('FALLITO: --dentro non e\' ammesso in questa casa. Si prova su copia con --out.'); process.exit(2); }

  const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
  if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }
  let outFile = arg('out', '');
  if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.righello-tab.html';
  outFile = path.resolve(RADICE, outFile);
  if (outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

  const src = fs.readFileSync(inFile, 'utf8');
  let r;
  try { r = applica(src); }
  catch (e) { console.error('FALLITO: ' + e.message); process.exit(1); }
  if (r.gia) { console.error('FALLITO: ' + inFile + ' ha gia\' i ganci.'); process.exit(1); }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, r.out);
  console.log('OK  ' + r.ancore + ' ancoraggi applicati · dado() ' + r.dado + ' invariate · Math.random ' + r.random + ' invariate');
  console.log('    da   ' + inFile + '  (' + src.length + ' caratteri)');
  console.log('    a    ' + outFile + '  (' + r.out.length + ' caratteri)');
}
