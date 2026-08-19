/* Applica la toppa proposta a una COPIA di folla.js (strumenti/_folla-toppa.js),
   preservando i fine-riga CRLF dell'originale. Non tocca folla.js.
   uso: node strumenti/_applica-toppa.js */
const fs = require('fs'), path = require('path');
const dir = __dirname;
const src = fs.readFileSync(path.join(dir, 'folla.js'), 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const r = s => s.split('\n').join(NL);

const TOPPE = [
  // 1 — la seconda finestra, alta venti unita' di piu'
  [ r(`    return (y1 - y0 >= 16) ? { x: 0, y: y0, w: 915, h: y1 - y0 } : null;
  });

  const esiti = [];`),
    r(`    return (y1 - y0 >= 16) ? { x: 0, y: y0, w: 915, h: y1 - y0 } : null;
  });

  /* LA SAGOMA SI MISURA IN UN'ALTRA FINESTRA, E COMINCIA VENTI UNITA' PIU'
     IN ALTO. Non e' un capriccio: NELLO SCOPPIO LA FOLLA SALTA. Il salto
     vale 3,0 + 1,8 x hype unita' di mondo (drawCrowd, riga 17780:
     yo = -Math.max(0,w)*(3.0+hype*1.8)), cioe' 7,2 a hype 2,35, piu' 2,4
     per chi sta in piedi (d.st): quasi DIECI delle trentotto unita' della
     finestra di sopra. Cosi' l'anello di tribuna che sta in cima esce dal
     bordo alto mentre le braccia entrano dal basso, e la misura addebita
     alla FORMA cio' che ha perso per TRASLAZIONE.
     Misurato scomponendo il fotogramma — le drawImage dell'atlante
     intercettate da fuori, riga dell'atlante e y forzate una alla volta —
     a 915x412@2, 17 agosto 2026, con la finestra 70-108 e la soglia 430:
       solo braccia (salto annullato)   +10,5%
       solo salto  (braccia abbassate)   -5,1%
       tutt'e due insieme                -1,3%   <- il rosso
       tribuna congelata (controllo)     -1,1%
     Con la finestra 50-108 e la soglia 380 il termine di sola traslazione
     si annulla (-0,0%) e resta la forma: +15,2% contro un controllo
     negativo di -0,2%.
     LA FINESTRA DI SOPRA NON SI TOCCA: fra 50 e 70 passano le gambe
     penzoloni dei ragazzini del muretto (drawSponda a FH+48), che si
     muovono da sole e regalerebbero il primo controllo. */
  const RS = await pag.evaluate(() => {
    const v = window.__test.view;
    const y0 = Math.max(0, Math.round(v.Ay + (FH + 50) * v.S2));
    const y1 = Math.min(VH, Math.round(v.Ay + (FH + 108) * v.S2));
    return (y1 - y0 >= 16) ? { x: 0, y: y0, w: 915, h: y1 - y0 } : null;
  });

  const esiti = [];`) ],

  // 2 — la guardia comprende la finestra nuova
  [ r(`  if (!R) {`), r(`  if (!R || !RS) {`) ],

  // 3 e 4 — la sagoma si legge nella finestra nuova
  [ r(`    const A0 = await pixel(R);`), r(`    const A0 = await pixel(RS);`) ],
  [ r(`    const A1 = await pixel(R);`), r(`    const A1 = await pixel(RS);`) ],

  // 5 — la soglia scende da 430 a 380
  [ r(`      /* SOGLIA ALTA, non media: sotto i 430 di somma RGB ci sono anche il
         fondale, la recinzione e le case, che non c'entrano niente e
         diluirebbero il segnale. Sopra restano teste e MANI — e le mani,
         quando le braccia salgono, sono pixel chiari che prima non
         c'erano da nessuna parte. */
      if (A0[i] + A0[i + 1] + A0[i + 2] > 430) px0++;
      if (A1[i] + A1[i + 1] + A1[i + 2] > 430) px1++;`),
    r(`      /* SOGLIA ALTA, non media: sotto i 380 di somma RGB ci sono anche il
         fondale, la recinzione e le case, che non c'entrano niente e
         diluirebbero il segnale. Sopra restano teste e MANI — e le mani,
         quando le braccia salgono, sono pixel chiari che prima non
         c'erano da nessuna parte.
         DA 430 A 380, e il numero non e' di gusto. 430 era la soglia del
         16 agosto; da onda 5 la gradinata sta in ombra e la mano, larga
         quattro pixel dopo la riduzione dell'atlante, cade fra 300 e 430:
         a 430 restavano fuori proprio i pixel che il gol aggiunge. A 380
         il termine di sola traslazione si annulla e resta la forma. */
      if (A0[i] + A0[i + 1] + A0[i + 2] > 380) px0++;
      if (A1[i] + A1[i + 1] + A1[i + 2] > 380) px1++;`) ],

  // 6 — la taratura si rifa', con la data
  [ r(`Misurato il 16 agosto 2026, banco a 915x412@2:
     tribuna viva     2,09% di pixel diversi · +34,6% di sagoma al gol
     tribuna dipinta  0,73% di pixel diversi ·  +0,3% di sagoma al gol`),
    r(`Misurato il 16 agosto 2026, banco a 915x412@2:
     tribuna viva     2,09% di pixel diversi · +34,6% di sagoma al gol
     tribuna dipinta  0,73% di pixel diversi ·  +0,3% di sagoma al gol
   RIFATTA IL 17 AGOSTO 2026 (finestra della sagoma 50-108, soglia 380),
   perche' la vecchia coppia finestra/soglia misurava anche il salto della
   folla e non solo la sua forma:
     tribuna viva     1,38% di pixel diversi · +14,3% di sagoma al gol
     tribuna congelata dall'esterno       ·  -0,1% di sagoma al gol
   Il congelamento si fa senza toccare il gioco: si intercettano le
   drawImage dell'atlante della tribuna e si rimettono la riga a braccia
   giu' e la y di riposo (vedi strumenti/_folla-toppa.js --gela).`) ],
];

let out = src, n = 0;
for (const [a, b] of TOPPE) {
  const c = out.split(a).length - 1;
  if (c !== 1) { console.error('TROVATO ' + c + ' volte, mi fermo:\n' + a.slice(0, 90)); process.exit(1); }
  out = out.replace(a, b); n++;
}

/* --dentro: applica le sei toppe a folla.js STESSO e si ferma qui, senza
   l'attrezzatura del controllo negativo (che e' roba da banco di prova e
   non deve finire nel cancello vero). */
if (process.argv.includes('--dentro')) {
  fs.writeFileSync(path.join(dir, 'folla.js'), out);
  console.log('applicate ' + n + ' toppe a strumenti/folla.js');
  process.exit(0);
}

/* il --gela e' l'attrezzatura del controllo negativo: NON fa parte della
   toppa proposta, serve solo a dimostrare che il cancello sa fallire */
const GELA_TESTA = r(`/* --gela = CONTROLLO NEGATIVO (solo in questa copia di prova). Spegne la
   reazione della folla DA FUORI, senza toccare il gioco: intercetta le
   drawImage dell'atlante della tribuna e, nel fotogramma dello scoppio,
   rimette la riga a braccia giu' (riga %3) e la y che quel tifoso aveva a
   riposo. Un cancello che passa anche cosi' non e' un cancello. */
const GELA = process.argv.includes('--gela');

(async () => {`);
out = out.replace(r(`(async () => {`), GELA_TESTA);

out = out.replace(r(`  const R = await pag.evaluate(() => {`), r(`  if (GELA) await pag.evaluate(() => {
    const c = document.getElementById('gioco').getContext('2d');
    const orig = c.drawImage;
    window.__gelo = { modo: 'off', reg: [], k: 0 };
    c.drawImage = function (img, ...a) {
      const g = window.__gelo;
      if (img && img.width === 26 * 8 && img.height === 26 * 6 && a.length === 8) {
        if (g.modo === 'registra') g.reg.push(a[5]);
        else if (g.modo === 'gela') { a[1] = a[1] % (3 * 26);
          if (g.k < g.reg.length) a[5] = g.reg[g.k]; g.k++; }
      }
      return orig.apply(this, [img, ...a]);
    };
  });

  const R = await pag.evaluate(() => {`));

out = out.replace(r(`    const A0 = await pixel(RS);
    await pag.evaluate(() => {
      /* 0,25 s dopo il gol: dentro lo scoppio, quando la tribuna e' su */
      window.__test.G.crowdHype = 2.35;
      window.__test.disegna();
    });`), r(`    if (GELA) await pag.evaluate(() => {
      window.__gelo.modo = 'registra'; window.__gelo.reg = []; window.__gelo.k = 0;
      window.__test.disegna(); window.__gelo.modo = 'off';
    });
    const A0 = await pixel(RS);
    await pag.evaluate(g => {
      /* 0,25 s dopo il gol: dentro lo scoppio, quando la tribuna e' su */
      if (g) { window.__gelo.modo = 'gela'; window.__gelo.k = 0; }
      window.__test.G.crowdHype = 2.35;
      window.__test.disegna();
      if (g) window.__gelo.modo = 'off';
    }, GELA);`));

/* per poter misurare anche le versioni vecchie messe di fianco */
out = out.replace(r("  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });"),
  r("  const GIOCO = process.argv.find(a => a.endsWith('.html')) || 'CALCETTO-il-gioco.html';\n  await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil: 'load' });"));

fs.writeFileSync(path.join(dir, '_folla-toppa.js'), out);
console.log('scritto strumenti/_folla-toppa.js —', n, 'toppe + attrezzatura --gela');
