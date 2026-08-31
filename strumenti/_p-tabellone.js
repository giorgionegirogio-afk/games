/* =====================================================================
   _p-tabellone.js — IL BANCO DELLA LAVAGNETTA: quanti pixel mangia, e
   quanti ne spreca in aria (29 agosto 2026).

   Non chiede al gioco quanto e' grande il tabellone: glielo TOGLIE dal
   fotogramma (strumenti/_t-righello-tabellone.js, innestato qui in
   memoria sulla copia servita) e conta i pixel che cambiano. Poi guarda
   DENTRO quei pixel e misura la cosa che non si vede da una
   dichiarazione: quanta ardesia e' vuota.

   COSA STAMPA, per il file che gli si passa:
     dipinti     pixel che il tabellone cambia, in media per fotogramma,
                 e in percentuale di schermo
     riquadro    il rettangolo DIPINTO (bbox del confronto) e quello
                 DICHIARATO da zoneInterfaccia: devono coincidere
     vuoto       la corsa piu' lunga di colonne d'ardesia senza inchiostro
                 dentro il pannello — l'aria che il pannello si porta
                 dietro
     velo        in quanti fotogrammi la lavagnetta si e' velata
     sottoBar    in quanti fotogrammi il comandato passa nella fascia
                 orizzontale del tabellone (BAR_X0-24 .. BAR_X1+24), che
                 e' la fascia in cui il punto 6-quater di updateCamera
                 gli abbassa la camera addosso
     coperti     uomini per fotogramma con almeno un quarto di sagoma
                 sotto la lavagnetta (da __test.copertura({uomini:true}))

   uso:
     node strumenti/_p-tabellone.js --gioco fuori/cmd-tabellone-base.html
     node strumenti/_p-tabellone.js --gioco fuori/cmd-tabellone.html --passi 1200
     ... --foto fuori/tab-dopo.png   (scatta la banda alta)
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RIGHELLO = require('./_t-righello-tabellone.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const GIOCO = path.resolve(RADICE, arg('gioco', 'CALCETTO-il-gioco.html'));
const VW = +arg('vw', 915), VH = +arg('vh', 412);
const PASSI = +arg('passi', 1200), OGNI = +arg('ogni', 20);
const TAGLIA = +arg('taglia', 11), SEME = +arg('seme', 20260829);
const FOTO = arg('foto', '');
const NOMI = arg('nomi', '');

let SRC = fs.readFileSync(GIOCO, 'utf8');
let NOTA = '';
try {
  const r = RIGHELLO.applica(SRC);
  SRC = r.out;
  NOTA = r.gia ? 'i ganci del righello erano gia\' dentro'
               : 'righello innestato sulla copia servita (' + r.ancore + ' ancoraggi, dado() ' + r.dado + ' invariate)';
} catch (e) { console.error('PROVA NULLA: il righello non si aggancia — ' + e.message); process.exit(3); }

const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.woff2': 'font/woff2' };
function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = path.join(RADICE, u === '/' ? 'index.html' : u);
      if (/CALCETTO-il-gioco\.html$/i.test(f)) {
        rs.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(SRC); return;
      }
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        rs.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* l'orologio del gioco in mano al banco: senza, due file vedono due
   partite diverse e il confronto non vale niente */
const BANCO = () => {
  const PASSO = 1000 / 60;
  let t = 0, coda = [], muto = false;
  window.requestAnimationFrame = cb => { if (muto) return 0; coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  window.__banco = { passo(n) {
    n = Math.max(0, Math.round(+n || 0));
    for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO; for (const f of c) { try { f(t); } catch (e) {} } }
    return t;
  } };
};

const MISURA = `async (cfg) => {
  const t = window.__test, B = window.__banco, G = t.G;
  try { t.dismissSplash && t.dismissSplash(); } catch(e){}
  B.passo(4);
  /* la quiete prima del seme: document.fonts.load ricuoce la tessitura
     del campo quando le pare, e quella cottura tira sorteggi */
  t.semina(1);
  { let fermi=0;
    for (let giri=0; giri<20 && fermi<2; giri++){
      const a=t.sorteggi;
      await new Promise(r=>setTimeout(r,300));
      fermi = (t.sorteggi===a) ? fermi+1 : 0;
    } }
  t.semina(cfg.seme); t.setCpuVsCpu(true);
  t.startMatch(1, 1, { size: cfg.taglia });
  if (cfg.nomi) { const n=cfg.nomi.split('|'); G.teamName=n[0]||G.teamName; G.oppName=n[1]||G.oppName; }
  for (let i=0;i<900;i++){ B.passo(1); if (t.state==='play') break; }

  if (typeof t.senzaTabellone!=='function' || typeof t.veloTabellone!=='function')
    return JSON.stringify({errore:'i ganci del righello non ci sono'});

  const cv = document.getElementById('gioco');
  const cg = cv.getContext('2d');
  const K = cv.width / cfg.VW;
  const RIG_H=34, P_DIS=1.18, RIG_PIEDI=10;
  const sorteggi0 = t.sorteggi;

  /* IL DISEGNO FERMO (la cura di _posa.js): render() chiama updateCamera
     prima di dipingere, e updateCamera e' un inseguimento — ogni
     disegna() sposterebbe ogni pixel. Con renderDT a zero il passo di
     ogni inseguimento vale zero; camera, G.miniY e il VELO del tabellone
     si rimettono a mano perche' hanno il loro ripiego e lo zero non li
     ferma. */
  const fermo = (senza) => {
    const c=G.cam, sc={x:c.x,y:c.y,z:c.z}, mini=G.miniY, velo=t.veloTabellone();
    const desc=Object.getOwnPropertyDescriptor(G,'renderDT');
    Object.defineProperty(G,'renderDT',{get:()=>0,set:()=>{},configurable:true});
    try { if(senza) t.senzaTabellone(true); t.disegna(); }
    finally { if(senza) t.senzaTabellone(false);
      delete G.renderDT; if(desc) Object.defineProperty(G,'renderDT',desc); else G.renderDT=1/60;
      c.x=sc.x; c.y=sc.y; c.z=sc.z; G.miniY=mini; t.veloTabellone(velo); }
  };
  const tutto = () => cg.getImageData(0,0,cv.width,cv.height).data;
  /* DUE DISEGNI IDENTICI NON DANNO LO STESSO BITMAP, e non e' il gioco
     che si muove: su 377.000 pixel se ne trovano fino a DUE che ballano
     di UNA unita' su 255 (misurato il 29 agosto 2026: [25,27,37] contro
     [24,27,37] sulla folla, [81,70,59] contro [80,69,58]). E'
     l'arrotondamento della tela. Il righello conta percio' le differenze
     di almeno DUE su 255: con quella soglia lo zero e' esatto, e nessun
     pixel di lavagnetta — che sta a decine di unita' dal manto — sfugge. */
  const muta = (A,B,i) => Math.abs(A[i]-B[i])>=2||Math.abs(A[i+1]-B[i+1])>=2||Math.abs(A[i+2]-B[i+2])>=2;

  const z = { frames:0, campioni:0, zero:0, zeroPeggio:0,
              dipinti:[], visibili:[], vuoti:[], vuotiPieno:[], veloVelati:0,
              fuoriRiquadro:0, fuoriEsempi:[], bbox:[], dich:[],
              sottoBar:0, sottoBarTetto:0, copertiTot:0, copertiPeggio:0,
              velo:[], sorteggiSpesi:0, nomi:[G.teamName,G.oppName] };

  for (let pas=0; pas<cfg.passi; pas++) {
    if (pas % 240 === 0) await new Promise(r=>setTimeout(r,0));
    B.passo(1);
    if (t.state!=='play') continue;
    z.frames++;

    /* la fascia orizzontale del tabellone e il comandato: e' la fascia in
       cui il punto 6-quater di updateCamera gli mette un soffitto */
    {
      const zz = t.zoneInterfaccia().find(q=>q.tipo==='tabellone');
      const v = G.view;
      if (zz && v && v.S2) {
        const i = G.ctrl[0];
        const p = (i>=0) ? G.players[i] : null;
        if (p && p.out<=0) {
          const sx = p.x*v.S2+v.Ax;
          const testa = (p.y+RIG_PIEDI-RIG_H*P_DIS)*v.S2+v.Ay;
          if (sx>zz.x0-24 && sx<zz.x1+24) { z.sottoBar++;
            if (testa < zz.y1+10) z.sottoBarTetto++; }
        }
      }
    }
    /* uomini con almeno un quarto di sagoma sotto la lavagnetta */
    {
      const f = t.copertura({uomini:true}).filter(r=>r.pannello==='tabellone' && r.soggetto==='uomo' && r.quota>=0.25);
      z.copertiTot += f.length;
      if (f.length>z.copertiPeggio) z.copertiPeggio=f.length;
    }
    if (t.veloTabellone()<0.999) z.veloVelati++;

    if (pas % cfg.ogni) continue;

    /* ---------------- IL RIGHELLO A PIXEL ---------------- */
    const s0 = t.sorteggi;
    const velo = t.veloTabellone();
    fermo(false); const A = tutto();
    /* LO ZERO DEL RIGHELLO: due disegni identici devono dare zero */
    fermo(false); const A2 = tutto();
    let zdiff=0;
    for (let i=0;i<A.length;i+=4) if(muta(A,A2,i)) zdiff++;
    if (zdiff>z.zeroPeggio) z.zeroPeggio=zdiff;
    z.zero += zdiff?1:0;
    fermo(true);  const S = tutto();

    const dich = t.zoneInterfaccia().find(q=>q.tipo==='tabellone') || {x0:0,y0:0,x1:0,y1:0,alfa:0};
    let n=0, nv=0, bx0=1e9, by0=1e9, bx1=-1e9, by1=-1e9, fuori=0;
    const W=cv.width, H=cv.height;
    for (let y=0;y<H;y++){
      for (let x=0;x<W;x++){
        const i=(y*W+x)*4;
        if(!muta(A,S,i)) continue;
        n++;
        /* VISIBILI: il piede sfumato del pannello svanisce a zero, e
           contare come «schermo mangiato» un pixel spostato di uno su
           255 sarebbe generoso al contrario. Si conta a parte cio' che
           cambia di almeno 8 su 255 in un canale. */
        if(Math.abs(A[i]-S[i])>=8||Math.abs(A[i+1]-S[i+1])>=8||Math.abs(A[i+2]-S[i+2])>=8) nv++;
        if(x<bx0)bx0=x; if(x>bx1)bx1=x; if(y<by0)by0=y; if(y>by1)by1=y;
        /* fuori dal riquadro dichiarato (piu' i 12 px di piede sfumato,
           che il gioco dichiara come parte della lavagnetta nel suo
           disegno ma non nel rettangolo: si concedono, e si dice) */
        const cx=x/K, cy=y/K;
        if(cx<dich.x0-1||cx>dich.x1+1||cy<dich.y0-1||cy>dich.y1+13){
          fuori++;
          if(z.fuoriEsempi.length<5) z.fuoriEsempi.push({x:+cx.toFixed(1),y:+cy.toFixed(1)});
        }
      }
    }
    if(fuori>0) z.fuoriRiquadro++;
    z.dipinti.push(n/(K*K));
    z.visibili.push(nv/(K*K));
    z.velo.push(+velo.toFixed(3));
    z.bbox.push(n? {x0:+(bx0/K).toFixed(1), y0:+(by0/K).toFixed(1), x1:+((bx1+1)/K).toFixed(1), y1:+((by1+1)/K).toFixed(1)} : null);
    z.dich.push({x0:dich.x0,y0:dich.y0,x1:dich.x1,y1:dich.y1,alfa:dich.alfa});

    /* ---- L'ARIA DENTRO IL PANNELLO ----
       Riga per riga si prende la MEDIANA della luminanza fra le colonne
       del pannello: e' l'ardesia, perche' l'inchiostro e' minoranza. Una
       colonna che non si scosta mai dalla mediana di piu' di 16 e' aria.
       Si guarda sopra il listello di legno (il suo gradiente e'
       orizzontale, quindi li' la mediana non vuol dire niente) e dentro i
       due montanti. */
    if (n>0) {
      const X0=Math.round((dich.x0+3)*K), X1=Math.round((dich.x1-3)*K);
      const Y0=Math.round(1*K), Y1=Math.round((dich.y1-Math.max(3,Math.round(dich.y1*0.10))-1)*K);
      const cols=X1-X0, rows=Y1-Y0;
      if(cols>10 && rows>4){
        const lum=new Float32Array(cols*rows);
        for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
          const i=(((Y0+r)*W)+(X0+c))*4;
          lum[r*cols+c]=0.2126*A[i]+0.7152*A[i+1]+0.0722*A[i+2];
        }
        const med=new Float32Array(rows);
        const buf=new Float32Array(cols);
        for(let r=0;r<rows;r++){ for(let c=0;c<cols;c++) buf[c]=lum[r*cols+c];
          const s=Array.prototype.slice.call(buf).sort((a,b)=>a-b); med[r]=s[s.length>>1]; }
        const inchiostro=new Uint8Array(cols);
        for(let c=0;c<cols;c++){ let k=0;
          for(let r=0;r<rows;r++) if(Math.abs(lum[r*cols+c]-med[r])>16) k++;
          inchiostro[c]= k>=2 ? 1:0; }
        let run=0, peggio=0;
        for(let c=0;c<cols;c++){ if(inchiostro[c]) run=0; else { run++; if(run>peggio) peggio=run; } }
        const vuoto=peggio/K;
        z.vuoti.push(+vuoto.toFixed(1));
        if(velo>0.999) z.vuotiPieno.push(+vuoto.toFixed(1));
      }
    }
    z.campioni++;
    z.sorteggiSpesi += t.sorteggi - s0;
  }
  z.sorteggiTot = t.sorteggi - sorteggi0;
  z.VW=cfg.VW; z.VH=cfg.VH; z.K=K;
  z.punteggio=[G.score[0],G.score[1]];
  return JSON.stringify(z);
}`;

const med = a => a.length ? +(a.reduce((s, x) => s + x, 0) / a.length).toFixed(2) : null;
const max = a => a.length ? Math.max.apply(null, a) : null;

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  await ctx.addInitScript(BANCO);
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => document.fonts.ready);

  const cfg = JSON.stringify({ VW, VH, passi: PASSI, ogni: OGNI, taglia: TAGLIA, seme: SEME, nomi: NOMI });
  const raw = await pag.evaluate(`(${MISURA})(${cfg})`);
  const z = JSON.parse(raw);
  if (z.errore) { console.error('PROVA NULLA: ' + z.errore); await br.close(); srv.chiudi(); process.exit(3); }

  const SCH = VW * VH;
  console.log('=== IL BANCO DELLA LAVAGNETTA ===');
  console.log('  gioco     ' + path.relative(RADICE, GIOCO) + '   [' + NOTA + ']');
  console.log('  finestra  ' + VW + 'x' + VH + '  ·  ' + TAGLIA + 'v' + TAGLIA + '  ·  seme ' + SEME + '  ·  nomi ' + JSON.stringify(z.nomi));
  console.log('  fotogrammi ' + z.frames + ' in gioco, ' + z.campioni + ' campionati (uno ogni ' + OGNI + ')');
  console.log('');
  console.log('  dipinti   ' + med(z.dipinti) + ' px medi  (' + (100 * med(z.dipinti) / SCH).toFixed(2) + '% di schermo)   picco ' + max(z.dipinti) + ' px (' + (100 * max(z.dipinti) / SCH).toFixed(2) + '%)');
  console.log('  visibili  ' + med(z.visibili) + ' px medi  (' + (100 * med(z.visibili) / SCH).toFixed(2) + '% di schermo)   [cambiati di almeno 8 su 255]');
  const d0 = z.dich[0] || {};
  console.log('  dichiarato ' + JSON.stringify(d0) + '  = ' + ((d0.x1 - d0.x0) * (d0.y1 - d0.y0)) + ' px2 (' + (100 * (d0.x1 - d0.x0) * (d0.y1 - d0.y0) / SCH).toFixed(2) + '%)');
  console.log('  dipinto    ' + JSON.stringify(z.bbox[0]));
  console.log('  fuori dal riquadro dichiarato: ' + z.fuoriRiquadro + ' campioni su ' + z.campioni + (z.fuoriEsempi.length ? '  es. ' + JSON.stringify(z.fuoriEsempi.slice(0, 3)) : ''));
  console.log('  vuoto     ' + med(z.vuoti) + ' px medi, peggiore ' + max(z.vuoti) + ' px   (a velo pieno: medio ' + med(z.vuotiPieno) + ', peggiore ' + max(z.vuotiPieno) + ')');
  console.log('  velo      velata in ' + z.veloVelati + ' fotogrammi su ' + z.frames + ' (' + (100 * z.veloVelati / Math.max(1, z.frames)).toFixed(1) + '%)');
  console.log('  sottoBar  ' + z.sottoBar + '/' + z.frames + ' (' + (100 * z.sottoBar / Math.max(1, z.frames)).toFixed(1) + '%), col soffitto addosso ' + z.sottoBarTetto);
  console.log('  coperti   ' + (z.copertiTot / Math.max(1, z.frames)).toFixed(3) + ' uomini per fotogramma, peggiore ' + z.copertiPeggio);
  console.log('  righello  zero non nullo in ' + z.zero + ' campioni su ' + z.campioni + ' (peggiore ' + z.zeroPeggio + ' px)');
  console.log('  sorteggi  ' + z.sorteggiSpesi + ' spesi dal righello su ' + z.sorteggiTot + ' della partita');
  if (errori.length) console.log('  ERRORI DI PAGINA: ' + errori.slice(0, 3).join(' | '));

  if (FOTO) {
    await pag.screenshot({ path: path.resolve(RADICE, FOTO), clip: { x: 0, y: 0, width: VW, height: 70 } });
    console.log('  foto      ' + FOTO);
  }
  console.log('\nJSON ' + JSON.stringify({
    dipintiMedi: med(z.dipinti), dipintiPerc: +(100 * med(z.dipinti) / SCH).toFixed(2),
    visibiliPerc: +(100 * med(z.visibili) / SCH).toFixed(2),
    dichiarato: d0, vuotoPeggiore: max(z.vuoti), vuotoPienoPeggiore: max(z.vuotiPieno),
    sottoBarPerc: +(100 * z.sottoBar / Math.max(1, z.frames)).toFixed(1),
    velatiPerc: +(100 * z.veloVelati / Math.max(1, z.frames)).toFixed(1),
    copertiPerFrame: +(z.copertiTot / Math.max(1, z.frames)).toFixed(3),
    zeroRotto: z.zero, frames: z.frames, campioni: z.campioni, punteggio: z.punteggio,
  }));
  await br.close(); srv.chiudi();
})();
