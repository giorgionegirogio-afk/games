/* =====================================================================
   _z-sotto-dischi.js — BANCO DI LAVORO: quanti UOMINI stanno sotto i
   dischi dei comandi.

   Il righello di casa (__test.copertura) guarda quattro soggetti: la
   palla, il comandato, la porta attaccata e il portiere. Gli altri
   venti uomini in campo non li guarda nessuno — ed e' esattamente il
   difetto fotografato sul OnePlus 6 il 28 agosto (fuori/tel-11.png:
   cinque azzurri sotto PASSAGGIO e TIRA).

   Qui si misura la cosa vera: per ogni fotogramma, per ogni uomo in
   quadro, quanta parte della sua figura finisce sotto un pixel di
   comando ANCORA DIPINTO (alfa >= 0,15, la soglia gia' dichiarata da
   zoneInterfaccia).

   LA FIGURA E' LA SAGOMA, NON L'ANELLO. La scatola larga di
   corpiSchermo (semilarghezza 31, cioe' l'anello del comandato, piu'
   19 unita' sotto i piedi) serve alle SCRITTE DI SCENA, che non devono
   toccare nemmeno il marker. Qui la domanda e' un'altra — «vedo il mio
   uomo?» — e l'uomo e' la sagoma: semilarghezza 16 unita', da
   testa-piedi (RIG_H*P_DIS) fino alla riga dei piedi, cioe' esattamente
   la scatola che velaTabellone gia' usa per la stessa domanda. Contare
   l'anello qui gonfierebbe il difetto del 94% di larghezza in piu'.
   L'area coperta si campiona a passo di 3 px, cosi' l'unione dei dischi
   sovrapposti si conta una volta sola.

   IL BANCO NON TOCCA IL GIOCO: legge G.players e __test.comandiTouch,
   cioe' le stesse posizioni che il gioco ha appena disegnato. Gira in
   CPU contro CPU con la posa dell'HUD accesa (e' il modo in cui questa
   casa fotografa i comandi da sempre), con seme fisso.

   uso:  node strumenti/_z-sotto-dischi.js --gioco fuori/comandi.html
                                           --taglia 11 --sec 40 --semi 1,2,3
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const TAGLIA = +arg('taglia', 11);
const SEC = +arg('sec', 40);
const SEMI = String(arg('semi', arg('seme', '20260828'))).split(',').map(Number);
const VW = +arg('vw', 915), VH = +arg('vh', 412);
const JSONOUT = arg('json', '');
const haFlag = n => process.argv.indexOf('--' + n) > 0;

if (!fs.existsSync(GIOCO)) { console.error('PROVA NULLA: non esiste ' + GIOCO); process.exit(3); }
const ridirigi = f => /CALCETTO-il-gioco\.html$/i.test(f) ? GIOCO : f;

function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = ridirigi(path.join(RADICE, u === '/' ? 'index.html' : u));
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        const t = f.endsWith('.html') ? 'text/html' : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream';
        rs.writeHead(200, { 'Content-Type': t + '; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* ===================================================================
   L'OROLOGIO DEL GIOCO, PRESO IN MANO — copiato da strumenti/scatta.js,
   dove questa casa lo usa da settimane per le fotografie.

   Senza, il banco NON E' RIPETIBILE, e non e' un dettaglio: misurato il
   28 agosto, quattro build a confronto sullo stesso seme davano 8935,
   9094, 8398 e 8398 fotogrammi di gioco — quattro partite diverse, non
   quattro cure. La ragione e' che il ciclo del gioco avanza con
   l'orologio vero: quanti passi di fisica entrano in un secondo dipende
   da quanto ci mette il disegno, e il disegno cambia se cambia il
   disegno. Qui rAF diventa una coda che non parte da sola e
   performance.now segue il passo fisso: __banco.passo(n) fa scorrere n
   fotogrammi da 1/60 esatto, gli stessi per tutti.
   =================================================================== */
const BANCO = () => {
  const PASSO = 1000 / 60;
  let t = 0, coda = [], muto = false;
  window.requestAnimationFrame = cb => { if (muto) return 0; coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  window.__banco = {
    get tempo() { return t; },
    passo(n) {
      n = Math.max(0, Math.round(+n || 0));
      for (let i = 0; i < n; i++) {
        const c = coda; coda = []; t += PASSO;
        for (const f of c) { try { f(t); } catch (e) {} }
      }
      return t;
    },
    zitto() { muto = true; coda.length = 0; },
  };
};

/* =====================================================================
   LA QUIETE PRIMA DEL SEME — e senza, il banco mente lo stesso.

   Anche con l'orologio in mano, due corse identiche divergevano al
   quattrocentottantesimo passo: stessa palla (682,444 / 642,477 in tutte
   e due) e OTTANTASETTEMILA sorteggi di differenza. Il colpevole non e'
   la fisica, e' il CARATTERE: document.fonts.load risolve quando gli
   pare, e la sua promessa ricuoce la tessitura del campo
   (buildFieldTex -> paintField) dentro un requestIdleCallback. Quella
   cottura tira decine di migliaia di numeri dal generatore comune, e da
   li' in poi le due partite pescano da due punti diversi del flusso.

   Percio' si accende il generatore, si aspetta che il conto dei sorteggi
   stia FERMO per due giri di trecento millisecondi — cioe' che la
   cottura sia gia' avvenuta — e solo allora si semina per davvero e si
   comincia. Provato: senza, due corse della stessa build divergono al
   passo 480; con, sono identiche su 1800 passi.
   ===================================================================== */
const MISURA = `async (cfg) => {
  const t = window.__test;
  const B = window.__banco;
  try { t.dismissSplash && t.dismissSplash(); } catch(e){}
  B.passo(4);
  t.semina(1);
  { let fermi=0;
    for (let giri=0; giri<20 && fermi<2; giri++){
      const a=t.sorteggi;
      await new Promise(r=>setTimeout(r,300));
      fermi = (t.sorteggi===a) ? fermi+1 : 0;
    } }
  t.semina(cfg.seme);
  t.setCpuVsCpu(true);
  t.posaHUD(true);
  t.startMatch(1, 1, { size: cfg.taglia });
  let attesa = 0;
  for (let i=0;i<900;i++){ B.passo(1); attesa++; if (t.state==='play') break; }
  const RIG_H = 34, P_DIS = 1.18, RIG_PIEDI = 10;
  const z = { frames:0, uomini:0, tocchi:0, sopra25:0, sopra50:0, pxCorpo:0, pxCoperti:0,
              fotoConTocco:0, fotoCon2:0, fotoCon3:0, peggio:0,
              tocchiMia:0, sopra25Mia:0, alfaSomma:0, alfaN:0, spenti:0, vuote:0,
              areaOpaca:0 };
  /* IL PIXEL E' OPACO SE: sta dentro un disco la cui PASTIGLIA e' ancora
     dipinta (dentro >= 0,15), oppure sta nella GHIERA (la corona fra
     rInt e r), oppure sta dentro il riquadro dell'ETICHETTA. Le tre cose
     le dichiara il gioco in comandiTouch; un gioco che non le dichiara
     e' un disco pieno, e si misura pieno. */
  const opaco = (sx, sy, dischi) => {
    for (const d of dischi) {
      const dx=sx-d.x, dy=sy-d.y, q=dx*dx+dy*dy;
      if (q > d.r*d.r) {
        if (d.lab && sx>=d.lab.x0 && sx<=d.lab.x1 && sy>=d.lab.y0 && sy<=d.lab.y1) return true;
        continue;
      }
      const pieno = (d.dentro===undefined ? 1 : d.dentro) >= 0.15;
      if (pieno) return true;
      const rI = (d.rInt===undefined ? 0 : d.rInt);
      if (q >= rI*rI) return true;                     // la ghiera
      if (d.lab && sx>=d.lab.x0 && sx<=d.lab.x1 && sy>=d.lab.y0 && sy<=d.lab.y1) return true;
    }
    return false;
  };
  /* il ciclo VERO del gioco, un fotogramma alla volta: fisica, camera e
     disegno passano da dove passano sempre, e nessuno di loro sa che
     l'orologio e' fermo in mano al banco */
  for (let pas=0; pas<cfg.passi; pas++) {
    if (pas % 240 === 0) await new Promise(r=>setTimeout(r,0));
    B.passo(1);
    if (t.state !== 'play') continue;
    const v = t.view; if (!v || !v.S2) continue;
    const S2 = v.S2, Ax = v.Ax, Ay = v.Ay;
    const H = RIG_H*P_DIS*S2, w = 16*S2, giu = 0;
    /* SOLO I QUATTRO DISCHI DI COMANDO, non la levetta: la levetta e'
       gia' una pista semitrasparente e sta a sinistra, dove la camera non
       porta mai la squadra che attacca. Con --con-stick entra anche lei,
       e il conto cresce in tutte e due le colonne. */
    const tutti =(t.comandiTouch||[]).filter(q => (q.tipo==='pulsante'||(cfg.stick&&q.tipo==='stick')) && q.r > 0);
    for (const d of tutti){
      const a = (d.alpha===undefined?1:d.alpha);
      z.alfaSomma += a; z.alfaN++;
      if (a < 0.15) z.spenti++;
      else if ((d.dentro===undefined?1:d.dentro) < 0.15) z.vuote++;
    }
    const dischi = tutti.filter(q => (q.alpha===undefined?1:q.alpha) >= 0.15);
    if (!dischi.length) { z.frames++; continue; }
    let bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9;
    for (const d of dischi){ bx0=Math.min(bx0,d.x-d.r); bx1=Math.max(bx1,d.x+d.r);
                             by0=Math.min(by0,d.y-d.r); by1=Math.max(by1,d.y+d.r); }
    /* l'area OPACA dei comandi, campionata come i corpi: e' il prezzo che
       il quadro paga anche quando sotto non c'e' nessuno */
    { let n=0, tt=0;
      for (let sy=by0+1.5; sy<by1; sy+=3) for (let sx=bx0+1.5; sx<bx1; sx+=3){ tt++; if (opaco(sx,sy,dischi)) n++; }
      if (tt) z.areaOpaca += n*9; }
    z.frames++;
    let corpiTocchi = 0;
    for (const p of G.players) {
      if (p.out>0) continue;
      const cx = p.x*S2+Ax, py = (p.y+RIG_PIEDI)*S2+Ay;
      const ax0=Math.max(0,cx-w), ay0=Math.max(0,py-H);
      const ax1=Math.min(cfg.VW,cx+w), ay1=Math.min(cfg.VH,py+giu);
      const area=Math.max(0,ax1-ax0)*Math.max(0,ay1-ay0);
      if (area<=0) continue;
      z.uomini++; z.pxCorpo += area;
      if (ax1<bx0||ax0>bx1||ay1<by0||ay0>by1) continue;   // lontano dai dischi
      const passo = 3;
      let dentro = 0, tot = 0;
      for (let sy=ay0+passo/2; sy<ay1; sy+=passo) for (let sx=ax0+passo/2; sx<ax1; sx+=passo) {
        tot++;
        if (opaco(sx, sy, dischi)) dentro++;
      }
      if (!tot) continue;
      const q = dentro/tot;
      z.pxCoperti += q*area;
      if (q > 0.02) { z.tocchi++; corpiTocchi++; if (p.team===0) z.tocchiMia++; }
      if (q >= 0.25) { z.sopra25++; if (p.team===0) z.sopra25Mia++; }
      if (q >= 0.50) z.sopra50++;
    }
    if (corpiTocchi>0) z.fotoConTocco++;
    if (corpiTocchi>=2) z.fotoCon2++;
    if (corpiTocchi>=3) z.fotoCon3++;
    if (corpiTocchi>z.peggio) z.peggio=corpiTocchi;
  }
  z.attesa = attesa;
  return JSON.stringify(z);
}`;

(async () => {
  const srv = await servi();
  let br;
  try { br = await chromium.launch(); }
  catch (e) { console.error('BANCO ESPLOSO: Chromium non parte — ' + e.message); srv.chiudi(); process.exit(2); }
  const ctx = await br.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  await ctx.addInitScript(BANCO);
  const tot = { frames:0, uomini:0, tocchi:0, sopra25:0, sopra50:0, pxCorpo:0, pxCoperti:0,
                fotoConTocco:0, fotoCon2:0, fotoCon3:0, peggio:0, tocchiMia:0, sopra25Mia:0,
                alfaSomma:0, alfaN:0, spenti:0, vuote:0, areaOpaca:0, attesa:0 };
  for (const seme of SEMI) {
    const pag = await ctx.newPage();
    const err = [];
    pag.on('pageerror', e => err.push(e.message));
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    const cfg = JSON.stringify({ seme, taglia: TAGLIA, passi: Math.round(SEC*60), VW, VH, stick: haFlag('con-stick') });
    const out = JSON.parse(await pag.evaluate(`(${MISURA})(${cfg})`));
    if (err.length) console.log('  (errori di pagina: ' + err.length + ', il primo: ' + err[0].slice(0,90) + ')');
    for (const k in tot) tot[k] = (k === 'peggio') ? Math.max(tot[k], out[k]) : tot[k] + out[k];
    await pag.close();
  }
  await br.close(); srv.chiudi();

  const f = tot.frames || 1;
  const r = {
    gioco: path.basename(GIOCO), taglia: TAGLIA, semi: SEMI, sec: SEC, viewport: VW + 'x' + VH,
    fotogrammi: tot.frames,
    uominiPerFoto: +(tot.uomini/f).toFixed(2),
    tocchiPerFoto: +(tot.tocchi/f).toFixed(3),
    tocchiMiaPerFoto: +(tot.tocchiMia/f).toFixed(3),
    sopra25PerFoto: +(tot.sopra25/f).toFixed(3),
    sopra25MiaPerFoto: +(tot.sopra25Mia/f).toFixed(3),
    sopra50PerFoto: +(tot.sopra50/f).toFixed(3),
    quotaCorpoCoperta: +(100*tot.pxCoperti/(tot.pxCorpo||1)).toFixed(3),
    pxCopertiPerFoto: +(tot.pxCoperti/f).toFixed(1),
    fotoConTocco: +(100*tot.fotoConTocco/f).toFixed(1),
    fotoCon2: +(100*tot.fotoCon2/f).toFixed(1),
    fotoCon3: +(100*tot.fotoCon3/f).toFixed(1),
    peggio: tot.peggio,
    alfaMedia: +(tot.alfaSomma/(tot.alfaN||1)).toFixed(3),
    dischiSpenti: +(100*tot.spenti/(tot.alfaN||1)).toFixed(1),
    pastiglieVuote: +(100*tot.vuote/(tot.alfaN||1)).toFixed(1),
    areaOpacaPerFoto: +(tot.areaOpaca/f).toFixed(0),
  };
  console.log('\n=== UOMINI SOTTO I DISCHI — ' + TAGLIA + ' contro ' + TAGLIA + ', ' + VW + 'x' + VH + ' ===');
  console.log('gioco ' + r.gioco + ' · semi ' + SEMI.join(',') + ' · ' + SEC + ' s ciascuno · ' + tot.frames + ' fotogrammi\n');
  console.log('  uomini in quadro, per fotogramma          ' + r.uominiPerFoto);
  console.log('  uomini TOCCATI da un disco (>2%)          ' + r.tocchiPerFoto + '   (della mia squadra ' + r.tocchiMiaPerFoto + ')');
  console.log('  uomini coperti almeno al 25%              ' + r.sopra25PerFoto + '   (della mia squadra ' + r.sopra25MiaPerFoto + ')');
  console.log('  uomini coperti almeno al 50%              ' + r.sopra50PerFoto);
  console.log('  quota di CORPO in quadro sotto i dischi   ' + r.quotaCorpoCoperta + '%');
  console.log('  pixel di corpo coperti, per fotogramma    ' + r.pxCopertiPerFoto);
  console.log('  fotogrammi con almeno un uomo toccato     ' + r.fotoConTocco + '%');
  console.log('  fotogrammi con almeno DUE                 ' + r.fotoCon2 + '%');
  console.log('  fotogrammi con almeno TRE                 ' + r.fotoCon3 + '%');
  console.log('  peggior fotogramma                        ' + r.peggio + ' uomini sotto i dischi');
  console.log('  alfa media dei dischi                     ' + r.alfaMedia);
  console.log('  dischi SPENTI (alfa<0,15: comando via)    ' + r.dischiSpenti + '%  dei disco-fotogramma');
  console.log('  pastiglie VUOTE (ghiera ed etichetta ok)  ' + r.pastiglieVuote + '%');
  console.log('  area opaca dei comandi, per fotogramma    ' + r.areaOpacaPerFoto + ' px\n');
  if (JSONOUT) fs.writeFileSync(path.resolve(RADICE, JSONOUT), JSON.stringify(r, null, 1));
})();
