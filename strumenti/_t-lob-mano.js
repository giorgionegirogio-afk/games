/* =====================================================================
   _t-lob-mano.js — IL GESTO DEL PALLONETTO, CON UN POLLICE VERO SUL
   VETRO DI UN TELEFONO VERO.

   PERCHE' ESISTE, ED E' UNA CRITICA A ME STESSO. La toppa del
   pallonetto e' stata provata da due banchi, e tutti e due sono
   BROWSER: _t-pollice.js monta eventi touch in Chromium, e
   _t-lob-indietro.js scrive direttamente in Touch5.stick. Nessuno dei
   due tocca vetro. Il critico l'ha detto meglio di come l'avevo scritto
   io: dopo la toppa, per scavalcare il portiere bisogna stare
   INDIETREGGIANDO ad almeno meta' velocita', NELLA META' CAMPO
   AVVERSARIA, NELL'ISTANTE ESATTO del rilascio — e nessuna mano aveva
   mai provato se quella coincidenza si riesce a fare. Un robot che
   scrive nello stick ci riesce sempre per definizione: non ha latenza,
   non ha attrito, non ha un dito che scivola.

   QUESTO BANCO PUO' BOCCIARE LA TOPPA, ed e' l'unico modo in cui vale
   qualcosa. Se il pollice indietro sul vetro vero non produce
   pallonetti, il gesto e' irraggiungibile e la toppa va rifatta.

   COSA E' VERO E COSA E' SCRITTO — dichiarato, perche' la differenza e'
   tutto:
     VERO   le due dita. Vanno sul dispositivo di ingresso del kernel
            (strumenti/_vetro.js) con la taratura misurata di
            strumenti/pollici-taratura.json. Il gioco non sa di essere
            misurato: legge gli stessi eventi che legge da un pollice.
     VERO   il tempo. La carica dura 0,65 s di orologio, non di
            simulazione, e il gioco gira alla sua velocita' sul suo
            schermo.
     SCRITTO  la POSA di partenza: prima di ogni ripetizione l'uomo
            comandato viene piazzato in un punto noto con la palla al
            piede. Non e' barare sull'ingresso — e' togliere di mezzo il
            flusso della partita, che qui non e' la domanda. La domanda
            e' se il CANALE regge il gesto.
     SCRITTO  il conteggio: una sonda avvolge fireShot e registra il
            tiro solo se il tabellino lo registra, insieme al valore che
            il gioco ha davvero letto dalla levetta in quell'istante
            (mx) e alla lunghezza del vettore. Contare le chiamate
            invece dei tiri gonfia i pallonetti: e' gia' successo.

   LE DUE DIREZIONI, e servono tutte e due:
     avanti    il pollice punta la porta che si attacca. E' la posa in
               cui il difetto vecchio faceva pallonetto SEMPRE. Dopo la
               toppa deve dare zero — e se non lo da', la toppa non
               funziona sul vetro.
     indietro  il pollice tira via dalla porta nell'istante del
               rilascio. E' il GESTO NUOVO. Prima della toppa era
               pallonetto per via dello sprint; dopo deve restare
               pallonetto per via dell'indietro. Se qui esce zero, il
               gesto non e' raggiungibile con una mano.

   uso:
     node strumenti/_t-lob-mano.js --etichetta PRIMA --prove 8
     node strumenti/_t-lob-mano.js --etichetta DOPO --raggio 80
   Il gioco e' quello INSTALLATO sul telefono: questo file non installa
   niente e non tocca il repo. Si installa a mano con
   `adb install -r <apk>`, e si dichiara quale.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const PACCHETTO = 'it.dopolavoro.calcetto';
const ATTIVITA = 'it.dopolavoro.gioco.Gioco';
const TARA = path.join(__dirname, 'pollici-taratura.json');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const pausa = ms => new Promise(r => setTimeout(r, ms));

function trovaAdb() {
  const sdk = (process.env.ANDROID_SDK || process.env.ANDROID_HOME || path.join(process.env.USERPROFILE || '', 'Android', 'Sdk')).replace(/\\/g, '/');
  for (const c of ['adb', sdk + '/platform-tools/adb.exe', sdk + '/platform-tools/adb']) {
    try { execFileSync(c, ['version'], { stdio: 'pipe', timeout: 20000 }); return c; } catch (e) { }
  }
  return null;
}
const { Vetro } = require('./_vetro.js');

function apriFilo(url) {
  return new Promise((ok, no) => {
    const ws = new WebSocket(url); let n = 0, morto = false; const att = new Map();
    const sc = setTimeout(() => no(new Error('la WebView non risponde')), 20000);
    ws.onclose = () => { morto = true; for (const [, r] of att) r({ morto: true }); att.clear(); };
    ws.onerror = () => { clearTimeout(sc); if (!morto) { morto = true; no(new Error('websocket rifiutato')); } };
    ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && att.has(m.id)) { att.get(m.id)(m); att.delete(m.id); } };
    ws.onopen = () => {
      clearTimeout(sc);
      ok({
        manda(m, p = {}, q = 60000) { if (morto) return Promise.resolve({ morto: true }); const id = ++n; try { ws.send(JSON.stringify({ id, method: m, params: p })); } catch (e) { return Promise.resolve({ morto: true }); } return new Promise(r => { att.set(id, r); setTimeout(() => { if (att.has(id)) { att.delete(id); r({ scaduto: true }); } }, q); }); },
        async js(e) { const r = await this.manda('Runtime.evaluate', { expression: e, returnByValue: true }); return r.result && r.result.result ? r.result.result.value : undefined; },
        chiudi() { try { ws.close(); } catch (e) { } },
      });
    };
  });
}

/* LA SONDA. Conta sul tiro che il tabellino registra, non sulla
   chiamata, e porta via anche quello che il gioco HA LETTO dalla
   levetta in quell'istante: se il pallonetto non esce, la colonna mx
   dice se e' colpa del dito o della regola. */
const SONDA = `(()=>{ if(window.__lm) return 'gia';
  window.__lm = {tiri:0, lob:0, campioni:[]};
  const _f = window.fireShot;
  window.fireShot = function(p,nx,ny,q,lob){
    const t0 = G.stats.tiri[p.team];
    const r = _f.apply(this, arguments);
    if(p.team===0 && G.stats.tiri[0]!==t0){
      let mx=0, l=0;
      try{ const m=humanMove(0); mx=m[0]; const s=Touch5.stick[0]; l=Math.hypot(s.dx||0,s.dy||0); }catch(e){}
      window.__lm.tiri++; if(lob) window.__lm.lob++;
      window.__lm.campioni.push({lob:!!lob, mx:Math.round(mx*100)/100, l:Math.round(l),
                                 x:Math.round(p.x), meta:p.x>FW/2});
    }
    return r;
  };
  return 'ok'; })()`;

/* la posa: uomo comandato nella propria meta' offensiva, palla al piede */
const POSA = `(()=>{ const t=window.__test, G=t.G;
  t.setPaused(false);
  if(G.ctrl[0]<0) G.ctrl[0] = G.players.findIndex(p=>p.team===0 && p.role!=='gk');
  const pi=G.ctrl[0]; if(pi<0) return 'nessun comandato';
  const p=G.players[pi], b=G.ball;
  for(const q of G.players){ if(q.charge>=0){ q.charge=-1; q.chargeGo=null; } }
  p.x = FW*0.72; p.y = FH/2; p.vx=0; p.vy=0; p.out=0;
  b.owner=pi; b.x=p.x+8; b.y=p.y; b.vx=0; b.vy=0; b.vz=0; b.z=0; b.passTo=-1;
  return G.scene; })()`;

(async () => {
  const PROVE = Math.max(1, +arg('prove', 8) | 0);
  const RAGGIO = +arg('raggio', 80);
  const ETI = arg('etichetta', 'OGGI');
  const CARICA = +arg('carica', 650);

  const adb = trovaAdb(); if (!adb) { console.error('adb non trovato'); process.exit(2); }
  const lista = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 });
  const disp = lista.split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!disp.length) { console.error('nessun telefono collegato e autorizzato'); process.exit(2); }
  const dev = disp[0];
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });
  if (!fs.existsSync(TARA)) { console.error('manca la taratura: node strumenti/pollici.js'); process.exit(2); }
  const T = JSON.parse(fs.readFileSync(TARA, 'utf8'));
  const versoPannello = (cx, cy) => ({ px: T.indietro.a * cx + T.indietro.b * cy + T.indietro.c, py: T.indietro.d * cx + T.indietro.e * cy + T.indietro.f });

  console.log(`\n=== PALLONETTO A MANO — ${ETI} ===`);
  console.log(`  --    ${dev} · ${PROVE} prove per direzione · pollice a ${RAGGIO} px · carica ${CARICA} ms`);

  sh('shell', 'am', 'force-stop', PACCHETTO);
  sh('shell', 'am', 'start', '-W', '-n', `${PACCHETTO}/${ATTIVITA}`);
  await pausa(4200);
  const u = sh('shell', 'cat', '/proc/net/unix');
  const presa = (u.match(/@(webview_devtools_remote\S*)/) || [])[1];
  if (!presa) { console.error('la WebView non espone il socket di debug'); process.exit(2); }
  try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { }
  sh('forward', 'tcp:9222', 'localabstract:' + presa);
  await pausa(600);
  const l = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const c = await apriFilo(l.find(t => t.type === 'page').webSocketDebuggerUrl);
  for (let i = 0; i < 50; i++) { if (await c.js('!!window.__test')) break; await pausa(300); }

  const marca = await c.js(`(()=>{const s=document.body.innerHTML;return 0;})()`);
  await c.js(`window.__test.dismissSplash&&window.__test.dismissSplash();
              if(window.__test.save) window.__test.save.tutorialDone=1;
              window.__test.startMatch(1,1,{size:5});1`);
  await pausa(3400);
  if (await c.js(SONDA) !== 'ok') { console.error('la sonda non si e\' installata'); process.exit(1); }

  /* la REGOLA che il gioco applica davvero, letta dal gioco stesso:
     serve a sapere se sto misurando la base o la toppa senza fidarmi
     dell'etichetta che ho scritto io sulla riga di comando */
  const regola = await c.js(`(()=>{ const s = String(window.releaseCharge||'');
     const m = s.match(/fireShot\\([^;]*\\);/); return m ? m[0].slice(0,120) : 'non trovata'; })()`);
  console.log('  --    la riga che il gioco esegue: ' + regola);

  const VW = await c.js('innerWidth'), VH = await c.js('innerHeight');
  if (Math.abs(VW - T.viewport.w) > 2 || Math.abs(VH - T.viewport.h) > 2)
    console.log(`  NO    la taratura e' di ${T.viewport.w}x${T.viewport.h}, la pagina e' ${VW}x${VH}: le coordinate non valgono`);
  const CASA = { x: VW * 0.18, y: VH * 0.66 };
  const btn = JSON.parse(await c.js(`JSON.stringify(window.__test.pulsanti(0)||[])`));
  if (!btn.length) { console.error('il gioco non dichiara i pulsanti'); process.exit(1); }
  const grande = btn.reduce((a, b) => (b.r || 0) > (a.r || 0) ? b : a, btn[0]);
  console.log(`  --    vista ${VW}x${VH} · levetta a riposo (${CASA.x.toFixed(0)},${CASA.y.toFixed(0)}) · grande @(${grande.x.toFixed(0)},${grande.y.toFixed(0)}) r=${(grande.r||0).toFixed(0)}`);

  const vetro = new Vetro(adb, dev);
  await pausa(400);

  /* UN GIRO A VUOTO, BUTTATO VIA E DICHIARATO. Misurato: il PRIMO
     appoggio del pollice sinistro dopo l'avvio dell'applicazione non
     viene adottato dalla levetta — il gioco registra il tiro con
     |stick| = 0 mentre il dito e' a 80 px. Succede una volta sola, alla
     prima prova della prima direzione, e con questo giro a vuoto il
     cancello di validita' smette di bocciare corse per la ragione sbagliata.
     Non e' una correzione dei numeri: e' una ripetizione che NON viene
     contata, prima che il conteggio cominci. */
  {
    const casaP = versoPannello(CASA.x, CASA.y);
    await c.js(POSA);
    vetro.giu(0, casaP.px, casaP.py); await pausa(70);
    for (const f of [0.5, 1]) { const q = versoPannello(CASA.x + RAGGIO * f, CASA.y); vetro.muovi(0, q.px, q.py); await pausa(60); }
    await pausa(200); vetro.su(0); await pausa(200);
    await c.js(`window.__lm.tiri=0; window.__lm.lob=0; window.__lm.campioni=[];1`);
    console.log('  --    un giro a vuoto buttato via (il primo appoggio non viene adottato)');
  }

  const esiti = [];
  for (const dir of ['avanti', 'indietro']) {
    await c.js(`window.__lm.tiri=0; window.__lm.lob=0; window.__lm.campioni=[];1`);
    let posaNo = 0, muto = 0;
    for (let i = 0; i < PROVE; i++) {
      const scena = await c.js(POSA);
      if (scena === undefined) { muto++; console.log(`  NO    prova ${i + 1} (${dir}): la WebView non ha risposto alla posa`); }
      else if (scena !== 'play' && scena !== 'kickoff') { posaNo++; console.log(`  --    prova ${i + 1} (${dir}): scena '${scena}'`); }
      await pausa(120);
      /* il pollice sinistro: appoggiato a casa e TRASCINATO, come un dito
         vero — non teletrasportato, cosi' lo stick "che segue" fa quello
         che farebbe in partita */
      const casaP = versoPannello(CASA.x, CASA.y);
      vetro.giu(0, casaP.px, casaP.py);
      await pausa(70);
      const segno = dir === 'avanti' ? +1 : -1;   // la squadra 0 attacca +x
      for (const f of [0.35, 0.7, 1]) {
        const q = versoPannello(CASA.x + segno * RAGGIO * f, CASA.y);
        vetro.muovi(0, q.px, q.py);
        await pausa(45);
      }
      await pausa(140);
      /* il pollice destro: preme il pulsante grande e lo tiene */
      const g = versoPannello(grande.x, grande.y);
      vetro.giu(1, g.px, g.py);
      await pausa(CARICA);
      vetro.su(1);
      await pausa(320);
      vetro.su(0);
      await pausa(160);
    }
    const grezzo = await c.js(`JSON.stringify(window.__lm)`);
    if (grezzo === undefined) {
      console.error(`FALLITO: dopo le ${PROVE} prove '${dir}' la WebView non risponde piu' (${muto} pose mute).` +
        '\nNiente da leggere: la misura di questa direzione NON ESISTE, e non la invento.');
      process.exit(1);
    }
    esiti.push({ dir, posaNo, muto, ...JSON.parse(grezzo) });
  }

  vetro.su(1); vetro.su(0);
  await pausa(300);
  const rotture = vetro.rotture;
  vetro.chiudi();
  try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { }
  c.chiudi();

  console.log(`\n  direzione   prove   tiri   pallonetti    mx medio   |stick| medio   in meta' avversaria`);
  for (const e of esiti) {
    const n = e.campioni.length || 1;
    const mx = e.campioni.reduce((a, b) => a + b.mx, 0) / n;
    const ll = e.campioni.reduce((a, b) => a + b.l, 0) / n;
    const meta = e.campioni.filter(x => x.meta).length;
    console.log('  ' + e.dir.padEnd(11) + String(PROVE).padStart(5) + String(e.tiri).padStart(7) +
      String(e.lob).padStart(13) + mx.toFixed(2).padStart(12) + ll.toFixed(0).padStart(16) +
      `${meta}/${e.campioni.length}`.padStart(21));
  }
  console.log('\n  mx e\' quello che il gioco HA LETTO dalla levetta nell\'istante del tiro, non');
  console.log('  quello che il dito credeva di fare: per la squadra 0 il pallonetto chiede mx < -0,5.');
  /* ---------------------------------------------------------------
     IL CANCELLO DI VALIDITA', e non e' un ornamento: e' costato una
     corsa. Alla seconda ripetizione questo banco ha stampato «indietro
     0 pallonetti» — che letto da solo boccia la toppa — mentre la
     colonna mx diceva 0,00 e |stick| diceva 0: il pollice sinistro non
     era mai arrivato al gioco. Un banco che conta i pallonetti senza
     controllare che la levetta fosse tirata puo' produrre uno ZERO
     qualunque cosa faccia il codice, e quello zero sembra un risultato.
     Qui la corsa e' VALIDA solo se ogni tiro registrato e' partito con
     la levetta oltre meta' corsa e con |mx| oltre la soglia della
     regola: altrimenti non si legge niente e si esce con codice 1. */
  const SOGLIA_STICK = 40;
  const guasti = [];
  for (const e of esiti) {
    if (!e.campioni.length) { guasti.push(`${e.dir}: nessun tiro registrato`); continue; }
    const fiacchi = e.campioni.filter(x => x.l < SOGLIA_STICK).length;
    if (fiacchi) guasti.push(`${e.dir}: ${fiacchi} tiri su ${e.campioni.length} con |stick| sotto ${SOGLIA_STICK} px — il pollice sinistro non e' arrivato al gioco`);
    const deboli = e.campioni.filter(x => Math.abs(x.mx) < 0.5).length;
    if (deboli) guasti.push(`${e.dir}: ${deboli} tiri su ${e.campioni.length} con |mx| sotto 0,5 — la levetta non era dove il dito credeva`);
    const fuori = e.campioni.filter(x => !x.meta).length;
    if (fuori) guasti.push(`${e.dir}: ${fuori} tiri su ${e.campioni.length} fuori dalla meta' campo avversaria — la posa non ha tenuto`);
  }
  const persi = esiti.reduce((a, e) => a + (PROVE - e.tiri), 0);
  if (persi) console.log(`  --    ${persi} pressioni su ${PROVE * 2} non hanno prodotto un tiro registrato: quel tanto di misura manca (i tiri contati restano validi).`);
  const pose = esiti.reduce((a, e) => a + e.posaNo, 0);
  if (pose) console.log(`  --    ${pose} pose partite fuori da 'play'.`);
  if (rotture) console.log(`  NO    il canale del vetro si e' riallineato ${rotture} volte.`);
  if (guasti.length) {
    console.log('\n  NO    CORSA NON VALIDA, e i numeri qui sopra NON SI LEGGONO:');
    for (const g of guasti) console.log('        ' + g);
    process.exit(1);
  }
  console.log('\n  OK    corsa valida: ogni tiro contato e\' partito con la levetta oltre ' + SOGLIA_STICK +
    ' px, |mx| oltre 0,5, nella meta\' campo avversaria.');
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
