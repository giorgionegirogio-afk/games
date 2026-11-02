/* =====================================================================
   _t-159-silhouette-sprite.js -- IL BANCO DELLA SAGOMA MISURA LA FIGURA
   CHE IL GIOCATORE GUARDA (voce #159, spec §2.5, agente S).

   IL DIFETTO, LETTO SUL CODICE. Dal #158 in campo si vedono gli SPRITE
   fotografici: drawPlayers chiama Sprite3D.disegna(ctx, p.x, cy, hb,
   yaw, 'alto', clip, tSec, look, true, pxs, filo) e ricade su
   Rig3D.disegna solo se quella risponde false (atlante non decodificato,
   clip senza fotogrammi). Il banco ?banco=silhouette pero' disegnava le
   dieci celle SOLO con Rig3D.disegna: il cancello silhouette.js
   (inchiostro, strozzature, forma, scavo, identita') misurava da
   settimane una figura che in partita e' il ripiego, e il suo 6/10 «dal
   giro 4 del #157» parlava delle capsule, non dell'uomo fotografico.

   TRE PROVE, tutte sulla stessa pagina e sullo stesso foglio a contatto
   che il banco stampa in console ([silhouette-png]):

     1. FIGURE ACCESE (?banco=silhouette, SAVE.figure al suo default 1).
        Il JSON del banco deve DICHIARARE figura:'sprite' e il titolo
        della pagina deve dirlo; e la maschera (alfa > 128) di OGNI cella
        del foglio deve essere IDENTICA, pixel per pixel, a quella che
        Sprite3D.disegna produce chiamata con gli stessi argomenti della
        partita (camera 'alto', RIG_H nel contesto scalato di P_DIS, tSec
        = u/freq, look tutto nero). Il test disegna da se' lo sprite E il
        rig e pretende anche che i due differiscano: un'uguaglianza fra
        due figure uguali non proverebbe niente. Oggi il banco disegna il
        rig: la dichiarazione manca e la maschera combacia col rig, non
        con lo sprite -> ROSSA.
     2. ?figure=0. La misura vecchia deve restare disponibile: il JSON
        dichiara figura:'rig' e ogni cella combacia con Rig3D.disegna.
        Oggi la maschera e' gia' quella del rig (la cella combacia) ma la
        dichiarazione manca -> ROSSA per la sola dichiarazione.
     3. ATLANTE ASSENTE. La pagina viene servita con il blocco di testo
        <script type="text/plain" id="sprite-src"> svuotato (in memoria,
        su disco non cambia un byte): Sprite3D.carica() non trova i byte
        e l'atlante non diventa mai pronto. Il banco deve aspettare al
        massimo 10 s, poi disegnare il rig e DICHIARARLO: «ATLANTE NON
        PRONTO» nel titolo e nel motivo del JSON, figura:'rig', celle che
        combaciano col rig. Oggi disegna il rig senza dire niente ->
        ROSSA. (Questa prova dura dieci secondi per costruzione.)

   ORDINE SACRO: qui non si avvia nessuna partita (il banco della sagoma
   disegna su un canvas a parte), quindi non c'e' startMatch ne'
   setCpuVsCpu da ordinare. Il seme fisso di _posa.js e' installato
   comunque, per la forma dei banchi di casa: il disegno di una posa a
   fase fissa non estrae niente.

   ZERO dado() dal banco: disegna e confronta maschere.

   uso:  node strumenti/_t-159-silhouette-sprite.js
         node strumenti/_t-159-silhouette-sprite.js --gioco fuori/159/CALCETTO-sil.html
         node strumenti/_t-159-silhouette-sprite.js --attesa 30000 --solo 1,2
   esce 0 verde · 1 rosso (il gioco) · 2 banco esploso · 3 prova nulla
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const SEME = +arg('seme', 20261102);
const ATTESA_MS = +arg('attesa', 30000);     // il banco aspetta l'atlante fino a 10 s, poi misura: 30 s bastano a tutte e tre
const SOLO = String(arg('solo', '1,2,3')).split(',').map(Number);

/* il server di casa: serve il repo, scambia il gioco con --gioco, e per la
   prova 3 applica una trasformazione in memoria al SOLO file del gioco */
function servi(prova) {
  let trasforma = null;
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      const eGioco = /CALCETTO-il-gioco\.html$/i.test(f);
      if (prova && eGioco) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      if (eGioco && trasforma) { res.end(trasforma(fs.readFileSync(f, 'utf8'))); return; }
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close(), imposta: t => { trasforma = t; } }));
  });
}

/* LA PROVA 3 SI COSTRUISCE COSI': il blocco sprite-src perde i suoi byte.
   Se l'ancora non c'e' esattamente una volta la prova non puo' costruirsi
   e lo dice (uscita 2), invece di misurare una pagina che non e' quella
   che credeva. */
function senzaAtlante(testo) {
  const apre = '<script type="text/plain" id="sprite-src">';
  if (testo.split(apre).length - 1 !== 1) return null;
  const i = testo.indexOf(apre) + apre.length, j = testo.indexOf('</script>', i);
  if (j < 0) return null;
  return testo.slice(0, i) + testo.slice(j);
}

/* DENTRO LA PAGINA: il foglio del banco (dal PNG in console) contro due
   fogli disegnati qui, uno con Sprite3D e uno con Rig3D, con GLI STESSI
   argomenti che il banco e la partita usano. Torna, per cella, quanti
   pixel di maschera differiscono dallo sprite, dal rig, e fra i due. */
async function CONFRONTA(url) {
  const PROVA = [
    { clip: 'fermo', u: 0.20, nome: 'sta fermo' }, { clip: 'camminata', u: 0.15, nome: 'cammina' },
    { clip: 'corsa', u: 0.32, nome: 'corre' }, { clip: 'tiro', u: 0.30, nome: 'carica il tiro' },
    { clip: 'tiro', u: 0.62, nome: 'ha appena tirato' }, { clip: 'scivolata', u: 0.35, nome: 'scivola in contrasto' },
    { clip: 'tuffo', u: 0.42, nome: 'il portiere si tuffa' }, { clip: 'attesaGK', u: 0.25, nome: 'il portiere aspetta' },
    { clip: 'esultanza', u: 0.30, nome: 'esulta' }, { clip: 'delusione', u: 0.55, nome: "e' deluso" },
  ];
  const COL = 5, CW = 104, CH = 124, W = COL * CW, H = 2 * CH, YAW = 0.95;
  const NERO = '#000';
  const nero = { maglia: NERO, maglia2: NERO, pantaloncini: NERO, calze: NERO, risvolto: NERO,
    pelle: NERO, capelli: NERO, scarpe: NERO, palla: null, taglio: 0, corp: 3, varb: 0,
    _lume: NERO, _ombra: NERO, _nero: true,
    _ombS: { maglia: NERO, maglia2: NERO, calze: NERO, pantaloncini: NERO, pelle: NERO } };
  function foglio(conSprite) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d', { willReadFrequently: true });
    const esiti = [];
    for (let i = 0; i < PROVA.length; i++) {
      const cx = (i % COL) * CW + CW / 2, cy = ((i / COL) | 0) * CH + CH - 14;
      const tSec = PROVA[i].u / Rig3D.CLIPS[PROVA[i].clip].freq;
      g.save(); g.translate(cx, cy); g.scale(P_DIS, P_DIS); g.translate(-cx, -cy);
      let fatto = false;
      if (conSprite) fatto = Sprite3D.disegna(g, cx, cy, RIG_H, YAW, 'alto', PROVA[i].clip, tSec, nero, true, P_DIS, 0);
      if (!fatto) Rig3D.disegna(g, cx, cy, RIG_H, YAW, 'alto', PROVA[i].clip, tSec, nero, true, P_DIS);
      g.restore(); esiti.push(!!fatto);
    }
    return { dati: g.getImageData(0, 0, W, H).data, esiti };
  }
  const im = new Image();
  await new Promise((ok, ko) => { im.onload = ok; im.onerror = () => ko(new Error('PNG del banco illeggibile')); im.src = url; });
  if (im.width !== W || im.height !== H) return { errore: 'il foglio del banco misura ' + im.width + 'x' + im.height + ' invece di ' + W + 'x' + H };
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
  const banco = g.getImageData(0, 0, W, H).data;
  const S = foglio(true), R = foglio(false);
  const maschera = (d, i) => {
    const x0 = (i % COL) * CW, y0 = ((i / COL) | 0) * CH, m = new Uint8Array(CW * CH);
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) m[y * CW + x] = d[((y0 + y) * W + x0 + x) * 4 + 3] > 128 ? 1 : 0;
    return m;
  };
  const diff = (a, b) => { let n = 0; for (let k = 0; k < a.length; k++) if (a[k] !== b[k]) n++; return n; };
  const celle = [];
  for (let i = 0; i < PROVA.length; i++) {
    const mb = maschera(banco, i), ms = maschera(S.dati, i), mr = maschera(R.dati, i);
    celle.push({ nome: PROVA[i].nome, vsSprite: diff(mb, ms), vsRig: diff(mb, mr), spriteVsRig: diff(ms, mr), spriteOk: S.esiti[i] });
  }
  return { celle, titolo: document.title, stato: Sprite3D.stato() };
}

(async () => {
  const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('PROVA NULLA: manca il gioco ' + provaAbs); process.exit(3); }
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  console.log('\n=== IL BANCO DELLA SAGOMA MISURA LA FIGURA CHE SI VEDE (voce #159, S) ===  ' +
              (provaAbs || 'CALCETTO-il-gioco.html (repo)') + '  -- seme ' + SEME);
  let rossi = 0, esploso = null;
  const verdetto = (ok, nome, dett) => { console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (dett ? '  ' + dett : '')); if (!ok) rossi++; };

  /* una passata: apre la pagina col banco, aspetta la riga [silhouette],
     legge il JSON e il PNG, e fa il confronto dentro la pagina */
  async function passata(query) {
    const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    await pag.addInitScript(semeFisso, SEME);
    const righe = [], ecc = [];
    pag.on('console', m => righe.push(m.text()));
    pag.on('pageerror', e => ecc.push(e.message));
    const t0 = Date.now();
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?banco=silhouette${query}&t=${Date.now()}`, { waitUntil: 'load' });
    let riga = null;
    while (!(riga = righe.find(r => r.startsWith('[silhouette] '))) && Date.now() - t0 < ATTESA_MS) await pag.waitForTimeout(100);
    const attesa = Date.now() - t0;
    let out;
    if (!riga) out = { errore: 'banco muto dopo ' + attesa + ' ms', righe: righe.slice(0, 8) };
    else if (riga.includes('fallito')) out = { errore: riga };
    else {
      const d = JSON.parse(riga.slice(13));
      const png = righe.find(r => r.startsWith('[silhouette-png] '));
      if (!png) out = { errore: 'la pagina non ha mandato il foglio a contatto' };
      else {
        const c = await pag.evaluate(CONFRONTA, png.slice(png.indexOf('data:'))).catch(er => ({ errore: er.message }));
        out = Object.assign({ d, attesa, atlante: righe.filter(r => r.startsWith('[silhouette-atlante]')) }, c);
      }
    }
    out.eccezioni = ecc;
    await ctx.close();
    return out;
  }
  const dettCelle = c => c.celle.map(k => `${k.nome}: sprite ${k.vsSprite} rig ${k.vsRig} (s/r ${k.spriteVsRig})`).join(' | ');

  try {
    /* PROVA 1 -- FIGURE ACCESE */
    if (SOLO.includes(1)) {
      console.log('\n  PROVA 1 -- FIGURE ACCESE: il banco dichiara e disegna lo sprite della partita');
      const e = await passata('');
      if (e.errore) esploso = 'PROVA 1: ' + e.errore + (e.righe ? ' ' + JSON.stringify(e.righe) : '');
      else {
        verdetto(e.d.figura === 'sprite', 'il JSON dichiara figura:\'sprite\'', 'figura=' + JSON.stringify(e.d.figura) + ' motivo=' + JSON.stringify(e.d.motivo) + ' (attesa ' + e.attesa + ' ms, atlante pronto=' + e.stato.pronto + ')');
        verdetto(/silhouette: sprite/.test(e.titolo), 'il titolo della pagina dichiara la figura', 'titolo=' + JSON.stringify(e.titolo));
        verdetto(e.celle.every(k => k.spriteOk), 'Sprite3D.disegna risponde true su tutte e dieci le clip del provino', e.celle.filter(k => !k.spriteOk).map(k => k.nome).join(', ') || 'tutte');
        verdetto(e.celle.every(k => k.spriteVsRig > 0), 'lo sprite e il rig danno maschere diverse (il confronto discrimina)', 'min s/r ' + Math.min(...e.celle.map(k => k.spriteVsRig)) + ' px');
        verdetto(e.celle.every(k => k.vsSprite === 0), 'ogni cella del foglio e\' la maschera di Sprite3D, pixel per pixel', dettCelle(e));
        if (e.eccezioni.length) verdetto(false, 'nessuna eccezione di pagina', e.eccezioni.join(' | '));
      }
    }
    /* PROVA 2 -- ?figure=0 */
    if (!esploso && SOLO.includes(2)) {
      console.log('\n  PROVA 2 -- ?figure=0: la misura vecchia sul rig resta disponibile e dichiarata');
      const e = await passata('&figure=0');
      if (e.errore) esploso = 'PROVA 2: ' + e.errore + (e.righe ? ' ' + JSON.stringify(e.righe) : '');
      else {
        verdetto(e.d.figura === 'rig', 'il JSON dichiara figura:\'rig\'', 'figura=' + JSON.stringify(e.d.figura) + ' motivo=' + JSON.stringify(e.d.motivo));
        verdetto(/silhouette: rig/.test(e.titolo), 'il titolo della pagina dichiara il rig', 'titolo=' + JSON.stringify(e.titolo));
        verdetto(e.celle.every(k => k.vsRig === 0), 'ogni cella del foglio e\' la maschera di Rig3D, pixel per pixel', dettCelle(e));
        if (e.eccezioni.length) verdetto(false, 'nessuna eccezione di pagina', e.eccezioni.join(' | '));
      }
    }
    /* PROVA 3 -- ATLANTE ASSENTE */
    if (!esploso && SOLO.includes(3)) {
      console.log('\n  PROVA 3 -- ATLANTE ASSENTE (sprite-src svuotato in memoria): dopo 10 s il rig, DICHIARATO');
      const sorgente = fs.readFileSync(provaAbs || path.join(RADICE, 'CALCETTO-il-gioco.html'), 'utf8');
      if (senzaAtlante(sorgente) === null) esploso = 'PROVA 3: il blocco <script type="text/plain" id="sprite-src"> non c\'e\' esattamente una volta: la prova non puo\' costruirsi';
      else {
        srv.imposta(senzaAtlante);
        const e = await passata('');
        srv.imposta(null);
        if (e.errore) esploso = 'PROVA 3: ' + e.errore + (e.righe ? ' ' + JSON.stringify(e.righe) : '');
        else {
          verdetto(e.stato.pronto === false, 'l\'atlante davvero non e\' pronto (la prova e\' costruita bene)', 'pronto=' + e.stato.pronto);
          verdetto(e.attesa >= 10000 && e.attesa < ATTESA_MS, 'il banco ha aspettato almeno 10 s prima di ripiegare', e.attesa + ' ms');
          verdetto(e.d.figura === 'rig', 'il JSON dichiara figura:\'rig\'', 'figura=' + JSON.stringify(e.d.figura));
          verdetto(/ATLANTE NON PRONTO/.test(e.d.motivo || ''), 'il motivo dice ATLANTE NON PRONTO', 'motivo=' + JSON.stringify(e.d.motivo));
          verdetto(/ATLANTE NON PRONTO/.test(e.titolo), 'il titolo della pagina dice ATLANTE NON PRONTO', 'titolo=' + JSON.stringify(e.titolo));
          verdetto(e.atlante.length >= 1, 'la console porta la riga [silhouette-atlante]', e.atlante.join(' | ') || 'nessuna');
          verdetto(e.celle.every(k => k.vsRig === 0), 'ogni cella del foglio e\' la maschera di Rig3D, pixel per pixel', dettCelle(e));
          if (e.eccezioni.length) verdetto(false, 'nessuna eccezione di pagina', e.eccezioni.join(' | '));
        }
      }
    }
  } catch (e) { esploso = e.message; }
  await browser.close(); srv.chiudi();
  if (esploso) { console.log('\nBANCO ESPLOSO: ' + esploso); process.exit(2); }
  console.log('\n' + (rossi ? 'ROSSO: ' + rossi + ' asserzioni fallite' : 'VERDE: tutte le asserzioni passano'));
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('BANCO ESPLOSO:', e.message); process.exit(2); });
