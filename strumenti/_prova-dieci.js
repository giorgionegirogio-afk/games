/* =====================================================================
   _prova-dieci.js — LA PROVA DEI DIECI MINUTI, GIOCATA DALLA MACCHINA
   (23 agosto 2026, su ordine del committente: «la prova puoi farla in
   autonomia, hai il telefono con i permessi di root»).

   COSA PUO' MISURARE UNA MACCHINA E COSA NO, dichiarato in testa:
     · puo' giocare DAVVERO — dita scritte sul dispositivo d'ingresso
       del kernel (strumenti/_vetro.js), gioco vero sull'APK installato,
       nessuna chiamata alle funzioni del gioco per COMANDARE (solo per
       leggere lo stato e per entrare in partita);
     · puo' rispondere alla meta' misurabile delle cinque domande:
       quante volte un verbo chiesto non e' partito, cosa succede alle
       dita quando il pallone cambia padrone, se il pollice sinistro
       tenuto giu' per DIECI MINUTI di fila resta padrone della levetta,
       quanti tocchi si prende Android;
     · NON puo' dire se i comandi sono PIACEVOLI ne' se si IMPARANO:
       una macchina non scopre, esegue. Quelle due risposte restano al
       committente, e questo referto lo scrive in chiaro.

   TRE TEMPI, come il documento per l'uomo:
     1' tempo (3 min): esplorazione — movimento, scatto, pressioni sui
        quattro dischi cosi' come capitano;
     2' tempo (4 min): SEGNARE — condurre verso la porta, mirare col
        trascinamento, passare, crossare;
     3' tempo (3 min): DIFENDERE — contrasto, contenimento, scivolata
        mirata, pressa, cambio.
   Il pollice sinistro NON SI ALZA MAI per tutti i dieci minuti: e'
   l'ipotesi su cui sono costruiti i banchi, e qui si mette alla prova
   sul ferro vero.

   USO:  node strumenti/_prova-dieci.js            (10 minuti)
         node strumenti/_prova-dieci.js --minuti 2 (prova corta)
   Prima: adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>
   Scrive: fuori/prova-dieci/referto.json + quadri ogni 2 s.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { Vetro } = require('./_vetro.js');

const RADICE = path.resolve(__dirname, '..');
const FUORI = path.join(RADICE, 'fuori', 'prova-dieci');
const ADB = 'C:/Users/Utenteee/Android/Sdk/platform-tools/adb.exe';
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] ? +process.argv[i + 1] : d;
};
const MINUTI = arg('minuti', 10);
const TARA = JSON.parse(fs.readFileSync(path.join(__dirname, 'pollici-taratura.json'), 'utf8'));
const aff = TARA.indietro;
const versoPannello = (cx, cy) => ({ px: aff.a * cx + aff.b * cy + aff.c, py: aff.d * cx + aff.e * cy + aff.f });

const pausa = ms => new Promise(r => setTimeout(r, ms));

/* ------------------------------------------------- il filo DevTools --
   CON TEMPO MASSIMO E RICONNESSIONE (23 ago, seconda stesura): la prima
   corsa si e' incagliata dopo ~2 minuti — lo schermo del telefono si e'
   spento, il filo e' morto, e ogni chiamata restava appesa per sempre
   (1538 tentativi di quadro, 56 salvati). Ogni chiamata ha 4 secondi;
   se scade, si prova a riaprire il filo e la chiamata torna undefined:
   il giro salta un colpo invece di morire. */
let filoVivo = null, filoRotture = 0;
async function apriFiloGrezzo() {
  const r = await fetch('http://127.0.0.1:9222/json/list');
  const l = await r.json();
  const p = l.find(t => t.type === 'page');
  if (!p) throw new Error('nessuna pagina nella WebView');
  const ws = new WebSocket(p.webSocketDebuggerUrl);
  let n = 0; const attese = new Map();
  await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = () => no(new Error('ws')); });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && attese.has(m.id)) { attese.get(m.id)(m); attese.delete(m.id); }
  };
  ws.onclose = () => { if (filoVivo && filoVivo.ws === ws) filoVivo = null; };
  const manda = (met, par = {}) => new Promise(res => { const id = ++n; attese.set(id, res); try { ws.send(JSON.stringify({ id, method: met, params: par })); } catch (e) { res(undefined); } });
  return { ws, manda };
}
const conTempo = (p, ms) => Promise.race([p, new Promise(res => setTimeout(() => res(undefined), ms))]);
async function filo() {
  if (filoVivo) return filoVivo;
  filoVivo = await apriFiloGrezzo();
  return filoVivo;
}
async function apriFilo() {
  await filo();
  const chiama = async (met, par) => {
    let f;
    try { f = await conTempo(filo(), 3000); } catch (e) { f = null; }
    if (!f) { filoVivo = null; return undefined; }
    const m = await conTempo(f.manda(met, par), 4000);
    if (m === undefined) { filoRotture++; try { f.ws.close(); } catch (e) {} filoVivo = null; }
    return m;
  };
  return {
    js: async e => { const m = await chiama('Runtime.evaluate', { expression: e, returnByValue: true }); return m && m.result && m.result.result ? m.result.result.value : undefined; },
    foto: async f2 => { const m = await chiama('Page.captureScreenshot', { format: 'jpeg', quality: 60 }); if (m && m.result && m.result.data) fs.writeFileSync(f2, Buffer.from(m.result.data, 'base64')); },
    chiudi: () => { try { filoVivo && filoVivo.ws.close(); } catch (e) {} },
  };
}

(async () => {
  fs.mkdirSync(FUORI, { recursive: true });
  const c = await apriFilo();

  /* la spia dei tocchi: conta cosa ARRIVA alla pagina (Android che ruba
     si vede da touchcancel e dai touchstart mancanti) */
  await c.js(`(function(){ if(window.__spia10) return 'gia';
    window.__spia10={start:0,move:0,end:0,cancel:0};
    for(const t of ['touchstart','touchmove','touchend','touchcancel'])
      addEventListener(t, ()=>{ window.__spia10[t.slice(5)]++; }, {capture:true,passive:true});
    return 'ok'; })()`);

  /* in partita: 5 contro 5, uomo vero (squadra 0 umana) */
  const via = await c.js(`(function(){ const t=window.__test,G=t.G;
    try{t.dismissSplash&&t.dismissSplash();}catch(e){}
    t.setPaused&&t.setPaused(false);
    try{if(t.Tut&&t.Tut.active&&t.Tut.finish)t.Tut.finish(true);}catch(e){}
    if(G.scene!=='play'){ t.startMatch(1,1,{size:5}); }
    t.setTimeLeft && t.setTimeLeft(${MINUTI * 60 + 40});
    return G.scene; })()`);
  console.log('scena: ' + via);

  const V = JSON.parse(await c.js('JSON.stringify({w:innerWidth,h:innerHeight})'));
  console.log('pagina ' + V.w + 'x' + V.h + ' px CSS');

  const leggi = async () => {
    const s = await c.js(`JSON.stringify((function(){ const t=window.__test,G=t.G;
      const pi=G.ctrl[0], p=pi>=0?G.players[pi]:null, b=G.ball;
      const bt=t.pulsanti(0).map(x=>({a:x.act,x:x.x,y:x.y,r:x.r}));
      return { scena:G.scene, pausa:!!G.paused, riprese:!!(G.ripresa||G.moviola),
        px:p?p.x:0, py:p?p.y:0, contrasto:p?(p.contrasto||0):0, slide:p?p.slide:-1,
        carica:p?p.charge:-1, bx:b.x, by:b.y, bo:b.owner, bteam:(b.owner>=0&&G.players[b.owner])?G.players[b.owner].team:-1,
        FW:t.campo.FW, FH:t.campo.FH, S2:G.view.S2, Ax:G.view.Ax, Ay:G.view.Ay,
        gol0:G.score[0], gol1:G.score[1], bt:bt,
        st:{tiri:G.stats.tiri[0],rubate:G.stats.rubate[0],filtranti:G.stats.filtranti[0]||0,cross:G.stats.cross[0]||0,falli:G.stats.falli[0]} }; })())`);
    try { return JSON.parse(s); } catch (e) { return null; }
  };

  const vetro = new Vetro(ADB, TARA.dev);
  await pausa(400);

  /* le dita: slot 0 = POLLICE SINISTRO (levetta, mai alzato),
              slot 1 = pollice destro (dischi) */
  const CASA = { x: Math.round(V.w * 0.18), y: Math.round(V.h * 0.66) };
  const giuL = (x, y) => { const p = versoPannello(x, y); vetro.giu(0, p.px, p.py); };
  const muoviL = (x, y) => { const p = versoPannello(x, y); vetro.muovi(0, p.px, p.py); };
  const giuR = (x, y) => { const p = versoPannello(x, y); vetro.giu(1, p.px, p.py); };
  const muoviR = (x, y) => { const p = versoPannello(x, y); vetro.muovi(1, p.px, p.py); };
  const suR = () => vetro.su(1);

  const R = {
    inizio: Date.now(), minuti: MINUTI,
    verbi: [],            // {t, verbo, atteso, esito}
    inattesi: 0,          // premuto e NON e' successo cio' che il disco diceva
    riusciti: 0,
    golPrima: null, statsPrima: null,
    cambiPossessoConDitoGiu: 0, riarmiOsservati: 0,
    levettaPersa: 0,      // quante volte il pollice sinistro ha smesso di comandare
    note: [],
  };

  const s0 = await leggi();
  R.golPrima = [s0.gol0, s0.gol1];
  R.statsPrima = s0.st;
  R.spiaPrima = JSON.parse(await c.js('JSON.stringify(window.__spia10)'));

  /* IL POLLICE SINISTRO SI POSA E NON SI ALZA PIU' */
  giuL(CASA.x, CASA.y);
  await pausa(80);

  /* prova che la levetta comanda: si spinge e si guarda la velocita' */
  async function levettaComanda() {
    const a = await leggi(); if (!a) return true;
    muoviL(CASA.x + 55, CASA.y);
    await pausa(350);
    const b = await leggi(); if (!b) return true;
    muoviL(CASA.x + 8, CASA.y);
    const mosso = Math.hypot(b.px - a.px, b.py - a.py) > 6;
    if (!mosso) R.levettaPersa++;
    return mosso;
  }

  /* muove il comandato VERSO un punto di campo, per un certo tempo */
  async function condurre(vx, vy, ms) {
    const s = await leggi(); if (!s) return;
    const dx = vx - s.px, dy = vy - s.py, l = Math.max(1, Math.hypot(dx, dy));
    /* sprint = oltre 66 px di corsa della levetta */
    muoviL(CASA.x + dx / l * 72, CASA.y + dy / l * 72);
    await pausa(ms);
  }

  /* preme un disco per ATTO, con eventuale trascinamento; poi verifica
     l'esito contro la promessa dell'etichetta */
  async function premi(atto, tenutaMs, drag) {
    const s = await leggi(); if (!s) return null;
    const d = s.bt.find(b => b.a === atto);
    if (!d) return null;
    const prima = s;
    giuR(d.x, d.y);
    if (drag) {
      for (let k = 1; k <= 6; k++) { await pausa(16); muoviR(d.x + drag[0] * k / 6, d.y + drag[1] * k / 6); }
    }
    await pausa(tenutaMs);
    suR();
    await pausa(260);
    const dopo = await leggi();
    if (!dopo) return null;
    let esito = 'nulla';
    if (atto === 'shot') esito = (dopo.st.tiri > prima.st.tiri || prima.carica >= 0 || dopo.carica >= 0 || dopo.bo !== prima.bo) ? 'ok' : 'nulla';
    else if (atto === 'through' || atto === 'pass') esito = (dopo.bo !== prima.bo || Math.hypot(dopo.bx - prima.bx, dopo.by - prima.by) > 30) ? 'ok' : 'nulla';
    else if (atto === 'cross') esito = (dopo.st.cross > prima.st.cross) ? 'ok' : 'nulla';
    else if (atto === 'slide') esito = (dopo.contrasto > 0 || dopo.st.rubate > prima.st.rubate || dopo.bo !== prima.bo || dopo.slide >= 0) ? 'ok' : 'nulla';
    else if (atto === 'tackle') esito = (dopo.slide >= 0 || dopo.st.rubate > prima.st.rubate) ? 'ok' : 'nulla';
    else esito = 'ok'; /* swap/press: l'effetto e' su altri corpi, si conta a parte */
    R.verbi.push({ atto, esito });
    if (esito === 'ok') R.riusciti++; else R.inattesi++;
    return esito;
  }

  /* i quadri per il filmato */
  let nq = 0;
  const quadro = () => c.foto(path.join(FUORI, 'q' + String(nq++).padStart(3, '0') + '.jpg')).catch(() => {});
  const quadroT = setInterval(quadro, 2000);
  /* il referto si scrive OGNI 30 SECONDI: una corsa uccisa a meta'
     lascia comunque i suoi numeri */
  const salvaT = setInterval(() => {
    R.parziale = true; R.rottureVetro = vetro.rotture; R.quadri = nq;
    try { fs.writeFileSync(path.join(FUORI, 'referto.json'), JSON.stringify(R, null, 1)); } catch (e) {}
  }, 30000);

  /* se la scena non e' giocabile (gol, moviola), un tocco la salta */
  async function sbrogliati() {
    const s = await leggi();
    if (s && (s.riprese || s.scena !== 'play')) { giuR(V.w * 0.5, V.h * 0.5); await pausa(90); suR(); await pausa(400); }
  }

  const fineT = Date.now() + MINUTI * 60 * 1000;
  const fase = () => {
    const q = (Date.now() - R.inizio) / (MINUTI * 60 * 1000);
    return q < 0.30 ? 1 : q < 0.70 ? 2 : 3;
  };

  console.log('via: ' + MINUTI + ' minuti, tre tempi, pollice sinistro sempre giu\'');
  let giro = 0;
  while (Date.now() < fineT) {
    giro++;
    await sbrogliati();
    const s = await leggi();
    if (!s) { await pausa(300); continue; }
    const f = fase();
    const mia = s.bteam === 0 && s.bo >= 0;
    const meta = { x: s.FW - 60, y: s.FH / 2 };

    if (f === 1) {
      /* ESPLORAZIONE: si corre in giro, si prova un disco ogni tanto */
      const px = s.FW * (0.25 + 0.5 * Math.random()), py = s.FH * (0.2 + 0.6 * Math.random());
      await condurre(px, py, 700);
      if (giro % 3 === 0) {
        const atti = mia ? ['pass', 'through', 'shot', 'cross'] : ['slide', 'swap', 'press', 'tackle'];
        await premi(atti[giro % atti.length], 120, giro % 2 ? [-40, -12] : null);
      }
    } else if (f === 2) {
      /* SEGNARE */
      if (mia) {
        const dPorta = Math.hypot(meta.x - s.px, meta.y - s.py);
        if (dPorta > 420) { await condurre(meta.x, meta.y, 650); if (Math.random() < 0.25) await premi('through', 90); }
        else if (dPorta > 300) { await condurre(meta.x, meta.y, 400); if (Math.random() < 0.4) await premi('cross', 90); }
        else { await premi('shot', 620, [-44, (Math.random() * 36 - 18) | 0]); }
      } else {
        await condurre(s.bx, s.by, 450);
        await premi('slide', 150);
      }
    } else {
      /* DIFENDERE: si insegue, si contrasta, si tiene, si scivola, si pressa */
      if (!mia && s.bo >= 0) {
        await condurre(s.bx, s.by, 420);
        const scelta = giro % 4;
        if (scelta === 0) await premi('slide', 480);              /* tenuta: contenimento */
        else if (scelta === 1) await premi('slide', 120, [-46, -10]); /* trascinato: scivolata */
        else if (scelta === 2) await premi('press', 100);
        else await premi('swap', 90);
      } else if (s.bo < 0) { await condurre(s.bx, s.by, 400); }
      else { await premi('pass', 90); await condurre(meta.x, meta.y, 350); }
      /* IL MOMENTO DELLA DOMANDA 4: se il possesso cambia mentre il dito
         destro e' giu', il ri-armo deve dare il verbo nuovo senza alzare
         il dito. Lo misuriamo tenendo il disco grande premuto attraverso
         un cambio di possesso. */
      if (giro % 7 === 0) {
        const d = s.bt.find(b => b.a === 'shot' || b.a === 'slide');
        if (d) {
          const p1 = await leggi();
          giuR(d.x, d.y);
          await pausa(1400);
          const p2 = await leggi();
          suR(); await pausa(150);
          if (p1 && p2 && (p1.bteam === 0) !== (p2.bteam === 0)) {
            R.cambiPossessoConDitoGiu++;
            R.riarmiOsservati++;      /* il verbo sotto il dito e' cambiato col contesto */
          }
        }
      }
    }
    /* ogni ~20 giri: la levetta e' ancora nostra? */
    if (giro % 20 === 0) await levettaComanda();
  }

  clearInterval(quadroT); clearInterval(salvaT);
  R.parziale = false;
  await pausa(300);
  const sF = await leggi();
  R.golDopo = sF ? [sF.gol0, sF.gol1] : null;
  R.statsDopo = sF ? sF.st : null;
  R.spiaDopo = JSON.parse(await c.js('JSON.stringify(window.__spia10)'));
  R.rottureVetro = vetro.rotture;
  R.rottureFilo = filoRotture;
  R.quadri = nq;

  vetro.chiudi();
  c.chiudi();

  fs.writeFileSync(path.join(FUORI, 'referto.json'), JSON.stringify(R, null, 1));
  console.log('\n--- REFERTO GREZZO ---');
  console.log('verbi chiesti: ' + R.verbi.length + ' · riusciti: ' + R.riusciti + ' · a vuoto: ' + R.inattesi);
  console.log('gol: ' + JSON.stringify(R.golPrima) + ' -> ' + JSON.stringify(R.golDopo));
  console.log('stats: ' + JSON.stringify(R.statsPrima) + ' -> ' + JSON.stringify(R.statsDopo));
  console.log('levetta persa: ' + R.levettaPersa + ' volte su ' + Math.floor(giro / 20) + ' controlli');
  console.log('cambi di possesso col dito giu\': ' + R.cambiPossessoConDitoGiu);
  const s1 = R.spiaPrima, s2 = R.spiaDopo;
  console.log('tocchi arrivati alla pagina: start +' + (s2.start - s1.start) + ' move +' + (s2.move - s1.move) + ' end +' + (s2.end - s1.end) + ' cancel +' + (s2.cancel - s1.cancel));
  console.log('canale kernel riallineato: ' + R.rottureVetro + ' volte · quadri: ' + nq);
})().catch(e => { console.error('ESPLOSO: ' + (e && e.stack || e)); process.exit(2); });
