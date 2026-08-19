/* =====================================================================
   IL FOGLIO A CONTATTO DELL'OMBRA — venti celle per un provino cieco.

   PERCHE' NON silhouette.js. Quel banco e' stato dimostrato CIECO due
   volte (casi 12 e 14 del registro): dichiarava «8 su 10 nominabili»
   mentre tre provini con persone diverse ne riconoscevano da zero a due.
   Qui non si stampa nessun verdetto e non si calcola nessun proxy
   percettivo: si stampa un FOGLIO, e il verdetto lo da' una persona che
   non conosce la chiave.

   COSA C'E' NEL FOGLIO. Venti celle, cinque per riga. Dieci sono le
   pose del provino con l'ombra COM'E' (la capsula), dieci sono le stesse
   pose con l'ombra di POSA. L'ordine e' MESCOLATO con una permutazione
   dichiarata qui sotto, e la ragione e' brutale: se «prima» e «dopo»
   stanno affiancate, chi guarda vede due volte lo stesso corpo e
   risponde una volta sola. Mescolate, ogni cella e' una domanda
   indipendente. La chiave esce su stdout, MAI nell'immagine.

   IL BANCO NON DISEGNA A MODO SUO. Le figure le disegna Rig3D.disegna,
   la stessa della partita, alla stessa camera 'alto' e alla stessa
   scala (RIG_H x P_DIS = 40 unita'). Le ombre le disegna il gioco: la
   capsula e' ombraLungaTex con lo stesso drawImage di
   drawOmbreGiocatori, l'ombra di posa e' Rig3D.ombraTraccia. Il banco
   sceglie da solo quale ha in casa: sul file senza toppa esce un foglio
   di venti capsule (ed e' il modo di provare che il foglio non bara).

   USO:
     node strumenti/_q-ombra.js --prima BASE.html --dopo TOPPATO.html
                                [--out _pose-ombra.png] [--scala 3]
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
const OUT = path.resolve(arg('out', path.join(RADICE, '_pose-ombra.png')));
const SCALA = +arg('scala', 3);

/* le dieci azioni: le STESSE del provino di silhouette.js, fase per fase,
   perche' i due fogli siano confrontabili e perche' quelle fasi sono gia'
   state scelte «nel punto piu' significativo del gesto» */
const PROVA = [
  { clip: 'fermo', u: 0.20, nome: 'sta fermo' },
  { clip: 'camminata', u: 0.15, nome: 'cammina' },
  { clip: 'corsa', u: 0.32, nome: 'corre' },
  { clip: 'tiro', u: 0.30, nome: 'carica il tiro' },
  { clip: 'tiro', u: 0.62, nome: 'ha appena tirato' },
  { clip: 'scivolata', u: 0.35, nome: 'scivola in contrasto' },
  { clip: 'tuffo', u: 0.42, nome: 'il portiere si tuffa' },
  { clip: 'cross', u: 0.34, nome: 'crossa' },
  { clip: 'esultanza', u: 0.30, nome: 'esulta' },
  { clip: 'parata', u: 0.40, nome: 'para' },
];

/* LA PERMUTAZIONE, DICHIARATA. Venti posizioni: 0-9 sono le celle
   «prima» (indice = posa), 10-19 le celle «dopo» (indice-10 = posa).
   Scritta a mano e fissa: un mescolamento casuale renderebbe la chiave
   diversa a ogni esecuzione, e due provini fatti a giorni di distanza
   non sarebbero piu' confrontabili. Nessuna cella «dopo» sta accanto
   alla sua «prima», ne' in riga ne' in colonna. */
const ORDINE = [14, 3, 17, 6, 11, 0, 19, 8, 12, 5, 16, 2, 10, 7, 13, 4, 18, 1, 15, 9];

const CW = 286, CH = 208, COL = 5, RIG = 4;

/* =====================================================================
   IL BANCO, iniettato nella pagina servita: sul disco non cambia un byte.
   ===================================================================== */
const BANCO = `<script>
if(/[?&]banco=ombra/.test(location.search)){ setTimeout(function(){
 try{
  var PROVA=__PROVA__, CW=__CW__, CH=__CH__, COL=5, RIG=2, S=__S__;
  var cv=document.createElement('canvas');
  cv.width=COL*CW*S; cv.height=RIG*CH*S;
  var g=cv.getContext('2d');
  g.scale(S,S);
  /* il manto: una tinta piatta presa dal gioco, non inventata qui.
     LUCI.erba.base non esiste come costante esportata, quindi si campiona
     la tessitura del campo gia' cotta — se non c'e', si ripiega su una
     tinta dichiarata. */
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
  g.fillStyle=fondo; g.fillRect(0,0,COL*CW,RIG*CH);

  var GEO=window.__test.ombraCapsula();
  var rot=Math.atan2(GEO.uy,GEO.ux), C=Math.cos(rot), Sr=Math.sin(rot);
  var LUNG=GEO.lungRiposo, OMA=__ALFA__;
  var perMetro=(GEO.perMetro!==undefined)?GEO.perMetro:LUNG/1.83;
  var LARG=(GEO.larg!==undefined)?GEO.larg:6.6;
  var conPosa=!!(Rig3D.ombraTraccia);
  if(typeof buildOmbraLungaTex==='function' && !ombraLungaTex) buildOmbraLungaTex();

  var look=Object.assign({},Rig3D.lookPredefinito,{palla:null,corp:3,varb:0});

  function cella(i,clip,u){
    var x0=(i%COL)*CW, y0=((i/COL)|0)*CH;
    var cx=x0+CW*0.20, cy=y0+CH*0.40;
    g.save();
    /* OGNI CELLA E' CHIUSA NELLA SUA SCATOLA. Senza, l'ombra lunga di una
       posa finisce nella cella accanto e chi guarda giudica due figure
       insieme: il provino diventa un'altra domanda. */
    g.beginPath(); g.rect(x0,y0,CW,CH); g.clip();
    g.translate(cx,cy); g.scale(P_DIS,P_DIS); g.translate(-cx,-cy);
    /* ---- l'ombra, esattamente come la disegna la partita ---- */
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
    /* la macchia di contatto: c'e' in tutti e due i casi, e' quella che
       dice «il corpo tocca terra» */
    if(typeof buildOmbraTex==='function' && !ombraTex) buildOmbraTex();
    if(ombraTex){ g.globalAlpha=OMA*0.80;
      var cxg=cx, cyg=cy+7.0;
      var CX= cxg*C+cyg*Sr, CY=-cxg*Sr+cyg*C;
      g.drawImage(ombraTex, CX-10, CY-5.6, 20, 11.2); }
    g.globalAlpha=1;
    g.restore();
    /* ---- la figura ---- */
    Rig3D.disegna(g,cx,cy,RIG_H,0.95,'alto',clip,u/Rig3D.CLIPS[clip].freq,look,true,P_DIS*S);
    g.restore();
  }
  for(var i=0;i<PROVA.length;i++) cella(i,PROVA[i].clip,PROVA[i].u);
  console.log('[ombra-foglio] '+JSON.stringify({conPosa:conPosa, geo:GEO}));
  console.log('[ombra-png] '+cv.toDataURL('image/png'));
 }catch(e){ console.log('[ombra-foglio] fallito: '+(e&&e.message)+' | '+(e&&e.stack||'').split('\\n')[1]); }
}, 900); }
</script>`;

function bancoPer() {
  return BANCO
    .replace('__PROVA__', JSON.stringify(PROVA))
    .replace('__CW__', String(CW))
    .replace('__CH__', String(CH))
    .replace('__S__', String(SCALA))
    .replace('__ALFA__', '0.52*(1+0.34*window.__test.ora)');
}

function servi(file) {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      if (u === '/gioco.html') {
        let d = fs.readFileSync(file, 'utf8');
        if (d.split('</body>').length - 1 !== 1) {
          console.error('INIEZIONE IMPOSSIBILE: </body> non compare una volta sola in ' + file);
          process.exit(2);
        }
        d = d.replace('</body>', bancoPer() + '</body>');
        rs.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d); return;
      }
      rs.writeHead(404); rs.end('no');
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

async function foglio(br, file, etichetta) {
  const srv = await servi(file);
  const pg = await br.newPage();
  const righe = [];
  pg.on('console', m => righe.push(m.text()));
  pg.on('pageerror', e => righe.push('ERRORE ' + e.message));
  await pg.goto(`http://127.0.0.1:${srv.porta}/gioco.html?banco=ombra&t=${Date.now()}`);
  await pg.waitForTimeout(2600);
  const r = righe.find(x => x.startsWith('[ombra-foglio] '));
  const png = righe.find(x => x.startsWith('[ombra-png] '));
  if (!r || r.includes('fallito') || !png) {
    console.error(`BANCO MUTO su ${etichetta} (${path.basename(file)}):`);
    for (const x of righe.slice(0, 10)) console.error('   ' + x.slice(0, 200));
    await pg.close(); srv.chiudi(); process.exit(1);
  }
  const meta = JSON.parse(r.slice(15));
  const url = png.slice(png.indexOf('data:'));
  await pg.close(); srv.chiudi();
  return { meta, url };
}

(async () => {
  const br = await chromium.launch();
  const A = await foglio(br, F_PRIMA, 'prima');
  const B = await foglio(br, F_DOPO, 'dopo');
  if (A.meta.conPosa) {
    console.error('IL FILE «prima» HA GIA\' L\'OMBRA DI POSA: il foglio confronterebbe due volte la stessa cosa.');
    await br.close(); process.exit(1);
  }
  if (!B.meta.conPosa) {
    console.error('IL FILE «dopo» NON HA Rig3D.ombraTraccia: la toppa non e\' applicata.');
    await br.close(); process.exit(1);
  }

  /* la composizione: venti celle in 5x4, nell'ordine dichiarato */
  const pg = await br.newPage();
  const dataUrl = await pg.evaluate(async ({ a, b, ORDINE, CW, CH, COL, RIG, S }) => {
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
    /* un filo scuro fra le celle: serve all'occhio per separarle, e non
       dice niente su quale sia quale */
    g.strokeStyle = 'rgba(8,20,12,.55)'; g.lineWidth = Math.max(1, S * 0.7);
    for (let c = 1; c < COL; c++) { g.beginPath(); g.moveTo(c * CW * S, 0); g.lineTo(c * CW * S, cv.height); g.stroke(); }
    for (let r = 1; r < RIG; r++) { g.beginPath(); g.moveTo(0, r * CH * S); g.lineTo(cv.width, r * CH * S); g.stroke(); }
    return cv.toDataURL('image/png');
  }, { a: A.url, b: B.url, ORDINE, CW, CH, COL, RIG, S: SCALA });
  await br.close();

  fs.writeFileSync(OUT, Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64'));
  console.log(`\nFOGLIO A CONTATTO: ${OUT}`);
  console.log(`  ${COL}x${RIG} = ${ORDINE.length} celle, ${CW * SCALA}x${CH * SCALA} px l'una, figura ${(34 * 1.18 * SCALA).toFixed(0)} px.`);
  console.log(`  geometria dell'ombra dichiarata dal gioco: lunghezza ${A.meta.geo.lungRiposo.toFixed(1)} unita', ` +
    `direzione ${(Math.atan2(A.meta.geo.uy, A.meta.geo.ux) * 57.2958).toFixed(1)} gradi.`);
  console.log('\n  CHIAVE DI RISPOSTA — non mostrarla a chi fa il provino:');
  for (let r = 0; r < RIG; r++) {
    const riga = [];
    for (let c = 0; c < COL; c++) {
      const pos = r * COL + c, src = ORDINE[pos];
      riga.push(`${pos + 1}. ${PROVA[src % 10].nome} [${src < 10 ? 'PRIMA' : 'DOPO '}]`);
    }
    console.log('   ' + riga.join('  ·  '));
  }
})();
