/* =====================================================================
   IL FOGLIO A SOLA OMBRA — e la misura del peso visivo.

   PERCHE' ESISTE. Il provino cieco sul foglio `_pose-ombra.png` (corpo
   + ombra) ha dato 1 verbo su 10 prima della toppa e 1 su 10 dopo. Due
   spiegazioni restano in piedi e il foglio di prima non le separa:

     (A) l'ombra non porta il verbo — allora la strada e' chiusa;
     (B) l'ombra il verbo lo porta, ma nessuno la guarda — il corpo e'
         colorato e dettagliato, l'ombra e' verde scuro su verde.

   Si separano cosi': si toglie il corpo. Se il verbo arriva dall'ombra
   SOLA e non arrivava da corpo+ombra, allora (B) e' dimostrata e la cura
   non e' un quinto ridisegno delle pose, e' il peso visivo dei due.

   NIENTE ALTRO E' CAMBIATO rispetto a `_q-ombra.js`: stesse dieci pose
   alle stesse fasi, stessa camera 'alto', stessa scala, stesso manto,
   stessa permutazione a venti celle, stessa clip per cella, stessa
   macchia di contatto. L'unica riga che si spegne e' Rig3D.disegna.
   Le costanti condivise si LEGGONO da `_q-ombra.js` invece di essere
   riscritte qui: una seconda copia di PROVA o di ORDINE renderebbe i due
   fogli inconfrontabili il giorno in cui uno dei due cambia.

   LA MISURA (--misura). Sul foglio che gia' esiste, cella per cella:
   quanto inchiostro mette l'ombra e quanto ne mette il corpo, e con che
   contrasto contro il manto. Le maschere non si indovinano dai colori:
   si ottengono rendendo, NELLA STESSA PASSATA, il manto da solo, il
   manto+ombra e il manto+corpo, e sottraendo. Il rapporto di contrasto
   e' quello che collaudo.js usa per maglia/erba — luminanza relativa
   sRGB e (L1+0,05)/(L2+0,05).

   USO:
     node strumenti/_q-solo-ombra.js --prima BASE.html --dopo TOPPATO.html
          [--out _pose-solo-ombra.png] [--scala 3]
          [--misura] [--foglio _pose-ombra.png]
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const F_PRIMA = path.resolve(arg('prima', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const F_DOPO = path.resolve(arg('dopo', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const OUT = path.resolve(arg('out', path.join(RADICE, '_pose-solo-ombra.png')));
const FOGLIO = path.resolve(arg('foglio', path.join(RADICE, '_pose-ombra.png')));
const SCALA = +arg('scala', 3);
const MISURA = process.argv.includes('--misura');

/* =====================================================================
   LE COSTANTI DEL PROVINO SI LEGGONO DAL FOGLIO ORIGINALE.
   `_q-ombra.js` le dichiara e le stampa; qui si estraggono dal suo
   sorgente invece di ricopiarle. Se domani una fase cambia la', cambia
   anche qui, e i due fogli restano la stessa domanda.
   ===================================================================== */
function daQOmbra() {
  const src = fs.readFileSync(path.join(__dirname, '_q-ombra.js'), 'utf8');
  const pezzo = (apre, chiude) => {
    const i = src.indexOf(apre);
    if (i < 0) throw new Error('non trovo «' + apre + '» in _q-ombra.js');
    const j = src.indexOf(chiude, i);
    return src.slice(i, j + chiude.length);
  };
  const testa = pezzo('const PROVA = [', '];') + '\n' +
    pezzo('const ORDINE = [', '];') + '\n' +
    pezzo('const CW = ', ';') + '\n' +
    'return { PROVA, ORDINE, CW, CH, COL, RIG };';
  return new Function(testa)();
}
const { PROVA, ORDINE, CW, CH, COL, RIG } = daQOmbra();

/* =====================================================================
   IL BANCO. Uguale a quello di `_q-ombra.js` in tutto tranne che rende
   la stessa cella piu' volte, una per MODO, dentro la STESSA passata:
   cosi' il manto e' identico al bit fra i modi e la sottrazione che ne
   ricava le maschere e' esatta, non approssimata.
     fondo  solo il manto            ombra  manto + ombra (niente corpo)
     corpo  manto + corpo            tutto  come il foglio originale
   ===================================================================== */
const BANCO = `<script>
if(/[?&]banco=ombra2/.test(location.search)){ setTimeout(function(){
 try{
  var PROVA=__PROVA__, CW=__CW__, CH=__CH__, COL=5, RIG=2, S=__S__, MODI=__MODI__;
  var fondo='rgb(46,96,50)';
  try{
    var ft=(typeof fieldTex!=='undefined')?fieldTex:null;
    if(ft&&ft.width>4){
      var t2=document.createElement('canvas'); t2.width=1; t2.height=1;
      var g2=t2.getContext('2d',{willReadFrequently:true});
      g2.drawImage(ft, ft.width*0.42, ft.height*0.5, 24,24, 0,0, 1,1);
      var d2=g2.getImageData(0,0,1,1).data;
      fondo='rgb('+d2[0]+','+d2[1]+','+d2[2]+')';
    }
  }catch(e){}

  var GEO=window.__test.ombraCapsula();
  var rot=Math.atan2(GEO.uy,GEO.ux), C=Math.cos(rot), Sr=Math.sin(rot);
  var LUNG=GEO.lungRiposo, OMA=__ALFA__;
  var perMetro=(GEO.perMetro!==undefined)?GEO.perMetro:LUNG/1.83;
  var LARG=(GEO.larg!==undefined)?GEO.larg:6.6;
  var conPosa=!!(Rig3D.ombraTraccia);
  if(typeof buildOmbraLungaTex==='function' && !ombraLungaTex) buildOmbraLungaTex();
  if(typeof buildOmbraTex==='function' && !ombraTex) buildOmbraTex();

  var look=Object.assign({},Rig3D.lookPredefinito,{palla:null,corp:3,varb:0});

  function cella(g,i,clip,u,conOmbra,conCorpo){
    var x0=(i%COL)*CW, y0=((i/COL)|0)*CH;
    var cx=x0+CW*0.20, cy=y0+CH*0.40;
    g.save();
    g.beginPath(); g.rect(x0,y0,CW,CH); g.clip();
    g.translate(cx,cy); g.scale(P_DIS,P_DIS); g.translate(-cx,-cy);
    if(conOmbra){
      g.save();
      g.rotate(rot);
      var fx=cx+GEO.piedeX, fy=cy+GEO.piedeY;
      var X= fx*C+fy*Sr, Y=-fx*Sr+fy*C;
      g.globalAlpha=OMA;
      if(conPosa){
        g.strokeStyle='rgb(14,38,32)'; g.lineCap='round'; g.lineJoin='round';
        g.lineWidth=LARG;
        Rig3D.ombraTraccia(g, X, Y, RIG_H, 0.95, clip, u/Rig3D.CLIPS[clip].freq,
                           3, 0, C, Sr, perMetro, 1);
      }else{
        var sc=GEO.semiCorto;
        g.drawImage(ombraLungaTex, X-LUNG*0.1455, Y-sc, LUNG*1.164, sc*2);
      }
      if(ombraTex){ g.globalAlpha=OMA*0.80;
        var cxg=cx, cyg=cy+7.0;
        var CX= cxg*C+cyg*Sr, CY=-cxg*Sr+cyg*C;
        g.drawImage(ombraTex, CX-10, CY-5.6, 20, 11.2); }
      g.globalAlpha=1;
      g.restore();
    }
    if(conCorpo)
      Rig3D.disegna(g,cx,cy,RIG_H,0.95,'alto',clip,u/Rig3D.CLIPS[clip].freq,look,true,P_DIS*S);
    g.restore();
  }

  var esito={conPosa:conPosa, geo:GEO, fondo:fondo, fogli:{}};
  for(var m=0;m<MODI.length;m++){
    var modo=MODI[m];
    var cv=document.createElement('canvas');
    cv.width=COL*CW*S; cv.height=RIG*CH*S;
    var g=cv.getContext('2d'); g.scale(S,S);
    g.fillStyle=fondo; g.fillRect(0,0,COL*CW,RIG*CH);
    var co=(modo==='ombra'||modo==='tutto'), cc=(modo==='corpo'||modo==='tutto');
    for(var i=0;i<PROVA.length;i++) cella(g,i,PROVA[i].clip,PROVA[i].u,co,cc);
    esito.fogli[modo]=cv.toDataURL('image/png');
  }
  window.__foglioOmbra2=esito;
 }catch(e){ window.__foglioOmbra2={errore:(e&&e.message)+' | '+((e&&e.stack)||'').split('\\n')[1]}; }
}, 900); }
</script>`;

function bancoPer(modi) {
  return BANCO
    .replace('__PROVA__', JSON.stringify(PROVA))
    .replace('__CW__', String(CW))
    .replace('__CH__', String(CH))
    .replace('__S__', String(SCALA))
    .replace('__MODI__', JSON.stringify(modi))
    .replace('__ALFA__', '0.52*(1+0.34*window.__test.ora)');
}

function servi(file, modi) {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      if (u === '/gioco.html') {
        let d = fs.readFileSync(file, 'utf8');
        if (d.split('</body>').length - 1 !== 1) {
          console.error('INIEZIONE IMPOSSIBILE: </body> non compare una volta sola in ' + file);
          process.exit(2);
        }
        d = d.replace('</body>', bancoPer(modi) + '</body>');
        rs.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d); return;
      }
      rs.writeHead(404); rs.end('no');
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

async function meta(br, file, etichetta, modi) {
  const srv = await servi(file, modi);
  const pg = await br.newPage();
  const righe = [];
  pg.on('console', m => righe.push(m.text()));
  pg.on('pageerror', e => righe.push('ERRORE ' + e.message));
  await pg.goto(`http://127.0.0.1:${srv.porta}/gioco.html?banco=ombra2&t=${Date.now()}`);
  let r = null;
  try {
    await pg.waitForFunction(() => !!window.__foglioOmbra2, null, { timeout: 20000 });
    r = await pg.evaluate(() => window.__foglioOmbra2);
  } catch (e) { /* r resta null */ }
  await pg.close(); srv.chiudi();
  if (!r || r.errore) {
    console.error(`BANCO MUTO su ${etichetta} (${path.basename(file)}): ${r ? r.errore : 'nessun esito in 20 s'}`);
    for (const x of righe.slice(0, 10)) console.error('   ' + x.slice(0, 200));
    process.exit(1);
  }
  return r;
}

/* la composizione 5x4 nell'ordine dichiarato: la stessa di `_q-ombra.js`,
   perche' le celle del foglio nuovo devono cadere dove cadono quelle del
   vecchio — altrimenti la chiave non e' la stessa chiave */
async function componi(pg, a, b, conFilo) {
  return pg.evaluate(async ({ a, b, ORDINE, CW, CH, COL, RIG, S, conFilo }) => {
    const carica = u => new Promise(ok => { const im = new Image(); im.onload = () => ok(im); im.src = u; });
    const IA = await carica(a), IB = await carica(b);
    const cv = document.createElement('canvas');
    cv.width = COL * CW * S; cv.height = RIG * CH * S;
    const g = cv.getContext('2d');
    for (let pos = 0; pos < ORDINE.length; pos++) {
      const src = ORDINE[pos];
      const im = src < 10 ? IA : IB, k = src % 10;
      const sx = (k % 5) * CW * S, sy = ((k / 5) | 0) * CH * S;
      const dx = (pos % COL) * CW * S, dy = ((pos / COL) | 0) * CH * S;
      g.drawImage(im, sx, sy, CW * S, CH * S, dx, dy, CW * S, CH * S);
    }
    if (conFilo) {
      g.strokeStyle = 'rgba(8,20,12,.55)'; g.lineWidth = Math.max(1, S * 0.7);
      for (let c = 1; c < COL; c++) { g.beginPath(); g.moveTo(c * CW * S, 0); g.lineTo(c * CW * S, cv.height); g.stroke(); }
      for (let r = 1; r < RIG; r++) { g.beginPath(); g.moveTo(0, r * CH * S); g.lineTo(cv.width, r * CH * S); g.stroke(); }
    }
    return cv.toDataURL('image/png');
  }, { a, b, ORDINE, CW, CH, COL, RIG, S: SCALA, conFilo });
}

function chiave() {
  const fuori = [];
  for (let r = 0; r < RIG; r++) {
    const riga = [];
    for (let c = 0; c < COL; c++) {
      const pos = r * COL + c, src = ORDINE[pos];
      riga.push(`${pos + 1}. ${PROVA[src % 10].nome} [${src < 10 ? 'PRIMA' : 'DOPO '}]`);
    }
    fuori.push('   ' + riga.join('  ·  '));
  }
  return fuori.join('\n');
}

/* =====================================================================
   LA MISURA. Gira in pagina perche' li' c'e' il decodificatore PNG.
   ===================================================================== */
async function misura(pg, foglioVero, mFondo, mOmbra, mCorpo, mTutto) {
  return pg.evaluate(async ({ vero, fondo, ombra, corpo, tutto, CW, CH, COL, RIG, S, SOGLIA }) => {
    const carica = u => new Promise(ok => { const im = new Image(); im.onload = () => ok(im); im.src = u; });
    const dati = async (u) => {
      const im = await carica(u);
      const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
      const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
      return { d: g.getImageData(0, 0, im.width, im.height).data, W: im.width, H: im.height };
    };
    const V = await dati(vero), F = await dati(fondo), O = await dati(ombra), K = await dati(corpo), T = await dati(tutto);
    if (V.W !== F.W || V.H !== F.H) return { errore: `il foglio vero e' ${V.W}x${V.H}, il banco rende ${F.W}x${F.H}` };

    /* =================================================================
       PRIMA DI MISURARE: LE MASCHERE VENGONO DA UNA RESA NUOVA, I COLORI
       DAL FOGLIO VERO. Vale solo se le due immagini sono la STESSA
       GEOMETRIA. Si controlla confrontando il foglio vero con la resa
       'tutto' della stessa passata, e si esclude la fascia dei fili
       (il foglio vero ce li ha, le rese delle maschere no).
       ================================================================= */
    const cwT = CW * S, chT = CH * S, ORLO = 4;
    const suFilo = (x, y) => {
      const mx = x % cwT, my = y % chT;
      return (x >= cwT && (mx < ORLO || mx > cwT - ORLO)) || (y >= chT && (my < ORLO || my > chT - ORLO));
    };
    let allN = 0, allMax = 0, allSopra = 0;
    for (let y = 0; y < V.H; y++) for (let x = 0; x < V.W; x++) {
      if (suFilo(x, y)) continue;
      const i = (y * V.W + x) * 4;
      const d = Math.max(Math.abs(V.d[i] - T.d[i]), Math.abs(V.d[i + 1] - T.d[i + 1]), Math.abs(V.d[i + 2] - T.d[i + 2]));
      allN++; if (d > allMax) allMax = d; if (d > SOGLIA) allSopra++;
    }

    const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const rap = (L1, L2) => (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const mediana = a => { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y); return b[b.length >> 1]; };
    const perc = (a, p) => { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.max(0, Math.round(p * (b.length - 1))))]; };

    const celle = [];
    const cw = cwT, ch = chT;
    /* quanto il MANTO del banco scarta da quello del foglio vero: e' una
       tinta piatta ricampionata a ogni caricamento, e cambia di qualche
       livello. Non tocca la misura — i colori si leggono dal foglio vero
       — ma va dichiarato. */
    let scartoMax = 0, scartoN = 0, scartoTot = 0, scartoSopra = 0;

    for (let pos = 0; pos < COL * RIG; pos++) {
      const x0 = (pos % COL) * cw, y0 = ((pos / COL) | 0) * ch;
      /* il manto della cella: la mediana dei pixel che nel modo 'fondo'
         sono manto — cioe' tutti. Si prende dal FOGLIO VERO, non dal
         banco, perche' e' il foglio vero che va misurato. */
      const rM = [], gM = [], bM = [];
      const Lomb = [], Lcor = [];
      let areaO = 0, areaC = 0, sovrap = 0;
      const rO = [], gO = [], bO = [], rC = [], gC = [], bC = [];
      for (let y = y0; y < y0 + ch; y++) {
        for (let x = x0; x < x0 + cw; x++) {
          if (suFilo(x, y)) continue;
          const i = (y * V.W + x) * 4;
          const dO = Math.max(Math.abs(O.d[i] - F.d[i]), Math.abs(O.d[i + 1] - F.d[i + 1]), Math.abs(O.d[i + 2] - F.d[i + 2]));
          const dC = Math.max(Math.abs(K.d[i] - F.d[i]), Math.abs(K.d[i + 1] - F.d[i + 1]), Math.abs(K.d[i + 2] - F.d[i + 2]));
          const sv = Math.max(Math.abs(V.d[i] - F.d[i]), Math.abs(V.d[i + 1] - F.d[i + 1]), Math.abs(V.d[i + 2] - F.d[i + 2]));
          if (dO < SOGLIA && dC < SOGLIA) {
            /* manto puro: nessuno dei due strati lo tocca */
            rM.push(V.d[i]); gM.push(V.d[i + 1]); bM.push(V.d[i + 2]);
            if (sv > scartoMax) scartoMax = sv;
            if (sv > 0) scartoN++;
            if (sv > SOGLIA) scartoSopra++;
            scartoTot++;
            continue;
          }
          if (dO >= SOGLIA && dC >= SOGLIA) { sovrap++; continue; }  /* il corpo copre l'ombra: non e' di nessuno dei due */
          if (dO >= SOGLIA) { areaO++; rO.push(V.d[i]); gO.push(V.d[i + 1]); bO.push(V.d[i + 2]); }
          else { areaC++; rC.push(V.d[i]); gC.push(V.d[i + 1]); bC.push(V.d[i + 2]); }
        }
      }
      const Lm = lum(mediana(rM), mediana(gM), mediana(bM));
      const cont = (rr, gg, bb) => {
        const out = [];
        for (let k = 0; k < rr.length; k++) out.push(rap(lum(rr[k], gg[k], bb[k]), Lm));
        return out;
      };
      const cO = cont(rO, gO, bO), cC = cont(rC, gC, bC);
      const lO = [], lC = [];
      for (let k = 0; k < rO.length; k++) lO.push(lum(rO[k], gO[k], bO[k]));
      for (let k = 0; k < rC.length; k++) lC.push(lum(rC[k], gC[k], bC[k]));
      const interno = a => {
        const hi = perc(a, 0.9), lo = perc(a, 0.1);
        return (hi == null) ? null : rap(hi, lo);
      };
      celle.push({
        pos: pos + 1,
        manto: [mediana(rM), mediana(gM), mediana(bM)],
        ombra: {
          area: areaO, quota: areaO / (cw * ch),
          colore: [mediana(rO), mediana(gO), mediana(bO)],
          contr: mediana(cO), contrMax: perc(cO, 1), contr90: perc(cO, 0.9),
          sopra3: cO.filter(v => v >= 3).length,
          interno: interno(lO)
        },
        corpo: {
          area: areaC, quota: areaC / (cw * ch),
          colore: [mediana(rC), mediana(gC), mediana(bC)],
          contr: mediana(cC), contrMax: perc(cC, 1), contr90: perc(cC, 0.9),
          sopra3: cC.filter(v => v >= 3).length,
          interno: interno(lC)
        },
        coperti: sovrap
      });
    }
    return {
      celle, scartoMax, scartoN, scartoTot, scartoSopra,
      allineamento: { esaminati: allN, max: allMax, sopraSoglia: allSopra },
      tot: V.W * V.H
    };
  }, {
    vero: foglioVero, fondo: mFondo, ombra: mOmbra, corpo: mCorpo, tutto: mTutto,
    CW, CH, COL, RIG, S: SCALA, SOGLIA: 8
  });
}

/* ===================================================================== */
(async () => {
  const modi = MISURA ? ['fondo', 'ombra', 'corpo', 'tutto'] : ['ombra'];
  const br = await chromium.launch();
  const A = await meta(br, F_PRIMA, 'prima', modi);
  const B = await meta(br, F_DOPO, 'dopo', modi);
  if (A.conPosa) {
    console.error('IL FILE «prima» HA GIA\' L\'OMBRA DI POSA: il foglio confronterebbe due volte la stessa cosa.');
    await br.close(); process.exit(1);
  }
  if (!B.conPosa) {
    console.error('IL FILE «dopo» NON HA Rig3D.ombraTraccia: la toppa non e\' applicata.');
    await br.close(); process.exit(1);
  }

  const pg = await br.newPage();
  const soloOmbra = await componi(pg, A.fogli.ombra, B.fogli.ombra, true);
  fs.writeFileSync(OUT, Buffer.from(soloOmbra.slice(soloOmbra.indexOf(',') + 1), 'base64'));
  console.log(`\nFOGLIO A SOLA OMBRA: ${OUT}`);
  console.log(`  ${COL}x${RIG} = ${ORDINE.length} celle, ${CW * SCALA}x${CH * SCALA} px l'una. Il corpo non e' disegnato.`);
  console.log(`  manto: prima ${A.fondo}, dopo ${B.fondo}.`);
  for (const [et, x] of [['prima', A], ['dopo ', B]])
    console.log(`  ombra ${et}: lunghezza ${x.geo.lungRiposo.toFixed(1)} unita', ` +
      `direzione ${(Math.atan2(x.geo.uy, x.geo.ux) * 57.2958).toFixed(1)} gradi.`);
  console.log('\n  CHIAVE DI RISPOSTA — non mostrarla a chi fa il provino:');
  console.log(chiave());

  if (MISURA) {
    if (!fs.existsSync(FOGLIO)) {
      console.error(`\nNON MISURO: manca ${FOGLIO}.`);
      await br.close(); process.exit(1);
    }
    const vero = 'data:image/png;base64,' + fs.readFileSync(FOGLIO).toString('base64');
    const mF = await componi(pg, A.fogli.fondo, B.fogli.fondo, false);
    const mO = await componi(pg, A.fogli.ombra, B.fogli.ombra, false);
    const mC = await componi(pg, A.fogli.corpo, B.fogli.corpo, false);
    const mT = await componi(pg, A.fogli.tutto, B.fogli.tutto, false);
    const m = await misura(pg, vero, mF, mO, mC, mT);
    if (m.errore) { console.error('\nMISURA FALLITA: ' + m.errore); await br.close(); process.exit(1); }
    fs.writeFileSync(path.join(path.dirname(OUT), '_peso-visivo.json'), JSON.stringify(m, null, 1));
    const al = m.allineamento;
    console.log(`\n\nPESO VISIVO — misurato sui pixel di ${path.basename(FOGLIO)}.`);
    console.log(`  Le maschere vengono da tre rese nella stessa passata (manto, manto+ombra,`);
    console.log(`  manto+corpo) e dalla sottrazione: soglia 8/255 su un canale.`);
    console.log(`  ALLINEAMENTO banco/foglio (fili di separazione esclusi): scarto massimo ` +
      `${al.max}/255, sopra soglia ${al.sopraSoglia} px su ${al.esaminati} (` +
      `${(100 * al.sopraSoglia / al.esaminati).toFixed(3)}%). Sopra qualche decimo di punto` +
      ` percentuale le maschere non descrivono piu' il foglio vero e la misura va buttata.`);
    console.log(`  La tinta del manto si ricampiona a ogni caricamento e non torna mai identica:` +
      ` ${m.scartoN} px su ${m.scartoTot} scartano di almeno 1 livello, solo ${m.scartoSopra} di piu' di 8` +
      ` (e quelli sono i bordi antialiasati, non il manto). Il colore del manto lo da' comunque` +
      ` la mediana del FOGLIO VERO, cella per cella.`);
    console.log('\n  cella  chi           area px    % cella   colore mediano    contrasto/manto   >=3:1     interno');
    for (const c of m.celle) {
      const src = ORDINE[c.pos - 1];
      const et = `${String(c.pos).padStart(2)} ${(src < 10 ? 'PRIMA' : 'DOPO ')} ${PROVA[src % 10].nome}`;
      console.log(`  ${et}`);
      for (const chi of ['ombra', 'corpo']) {
        const s = c[chi];
        const col = s.colore[0] == null ? '    —       ' : `${String(s.colore[0]).padStart(3)},${String(s.colore[1]).padStart(3)},${String(s.colore[2]).padStart(3)}`;
        console.log(`         ${chi.padEnd(6)} ${String(s.area).padStart(8)}  ${(s.quota * 100).toFixed(2).padStart(7)}%   ${col}   ` +
          `${(s.contr == null ? '—' : s.contr.toFixed(2) + ':1').padStart(9)}  ${(s.contrMax == null ? '' : 'max ' + s.contrMax.toFixed(2)).padStart(9)}  ` +
          `${String(s.sopra3).padStart(8)}  ${(s.interno == null ? '—' : s.interno.toFixed(2) + ':1').padStart(8)}`);
      }
      console.log(`         (coperti dal corpo: ${c.coperti} px, manto ${c.manto.join(',')})`);
    }
    /* i totali, separati fra le celle PRIMA e le celle DOPO */
    const somma = (quali) => {
      const g = { aO: 0, aC: 0, s3O: 0, s3C: 0, n: 0, cO: [], cC: [], iO: [], iC: [] };
      for (const c of m.celle) {
        const src = ORDINE[c.pos - 1];
        if ((src < 10) !== (quali === 'PRIMA')) continue;
        g.n++; g.aO += c.ombra.area; g.aC += c.corpo.area;
        g.s3O += c.ombra.sopra3; g.s3C += c.corpo.sopra3;
        if (c.ombra.contr != null) g.cO.push(c.ombra.contr);
        if (c.corpo.contr != null) g.cC.push(c.corpo.contr);
        if (c.ombra.interno != null) g.iO.push(c.ombra.interno);
        if (c.corpo.interno != null) g.iC.push(c.corpo.interno);
      }
      const md = a => a.length ? a.slice().sort((x, y) => x - y)[a.length >> 1] : null;
      return { ...g, mO: md(g.cO), mC: md(g.cC), miO: md(g.iO), miC: md(g.iC) };
    };
    console.log('\n  RIASSUNTO');
    for (const q of ['PRIMA', 'DOPO']) {
      const g = somma(q);
      console.log(`   ${q} (${g.n} celle)  area ombra ${g.aO} px, area corpo ${g.aC} px  → corpo/ombra ${(g.aC / g.aO).toFixed(2)}x`);
      console.log(`         contrasto mediano contro il manto: ombra ${g.mO.toFixed(2)}:1, corpo ${g.mC.toFixed(2)}:1`);
      console.log(`         pixel sopra 3:1 (la soglia di collaudo.js): ombra ${g.s3O}, corpo ${g.s3C}`);
      console.log(`         contrasto INTERNO mediano (p90/p10 dentro la figura): ombra ${g.miO.toFixed(2)}:1, corpo ${g.miC.toFixed(2)}:1`);
    }
    console.log(`\n  dettaglio per cella anche in ${path.join(path.dirname(OUT), '_peso-visivo.json')}`);
  }
  await br.close();
})();
