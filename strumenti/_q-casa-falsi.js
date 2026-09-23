/* =====================================================================
   _q-casa-falsi.js — QUATTRO BUGIE NEL CASO PEGGIORE, E UN VERO
   (voce #143, compito 4)

   `_q-motori.js` e `_q-casa.js` dicono che la simulazione e' la stessa
   su tre motori. Questo dice che SE NE ACCORGEREBBERO se non fosse
   vero — e lo dice NOMINANDO QUALE PROVA MORDE QUALE BUGIA, perche'
   «qualcosa e' rosso» non e' una misura.

   LA REGOLA DI CASA: ogni falso deve passare tutte le prove tranne
   quella che lo riguarda. Un falso che rompe tutto non dice quale prova
   morde; un falso troppo gentile non prova niente. Dodici cantieri di
   fila hanno pagato questa lezione in revisione.

   I QUATTRO, e nessuno e' di fantasia:

     solo-hypot   e' la cura che il #141 aveva gia' in mano: la sola
                  `hypot` riscritta. Su pochi semi FUNZIONA. E' il caso
                  peggiore vero, perche' un cancello frettoloso la
                  promuove.
     storta       la libreria giusta con una costante scritta con meno
                  cifre. Uguale su tutti i motori, e sbagliata: passa la
                  SOGLIA del cantiere e deve cadere sullo scarto in ULP.
     una-nativa   369 chiamate su 370. E' il modo normale in cui una
                  toppa sbaglia: non dimentica tutto, dimentica un posto.
     impronta     la cura che si mangia il testimone: anche
                  `improntaMotore()` (voce #142) passa da casa, e
                  l'impronta del motore diventa piatta. Nessuna prova di
                  QUESTO cantiere se ne accorge — a rompersi e' un
                  cantiere di prima.

   E IL VERO: il gioco curato deve passare tutto. Senza il controllo
   positivo, «i falsi cadono» e «cade tutto» sarebbero lo stesso referto.

   uso:  node strumenti/_q-casa-falsi.js
         node strumenti/_q-casa-falsi.js --semi 8
         node strumenti/_q-casa-falsi.js --salta vero
   esce 0 se ogni bugia e' stata morsa dalla prova giusta e il vero
   passa, 1 se una bugia passa, 2 se il banco e' esploso.
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const playwright = require('playwright');
const http = require('http');
const { innesta } = require('./_toppa-143-matematica.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const NSEMI = Math.max(2, parseInt(arg('semi', '8'), 10) || 8);
const SALTA = String(arg('salta', '')).split(',').filter(Boolean);
const MOTORI = String(arg('motori', 'chromium,webkit,firefox')).split(',').map(s => s.trim()).filter(Boolean);
const GIOCO = arg('gioco', process.env.GIOCO_PROVA || 'CALCETTO-il-gioco.html');

const esiti = [];
const morsi = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };

function corri(script, args) {
  const r = spawnSync(process.execPath, [path.join(__dirname, script), ...args],
    { cwd: RADICE, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { stato: r.status, testo: (r.stdout || '') + (r.stderr || '') };
}

/* quanti semi della prova B sono verdi, e quanti rossi */
function semiB(testo) {
  const righe = testo.split('\n');
  const i = righe.findIndex(r => r.startsWith('B) L\'IMPRONTA'));
  const j = righe.findIndex((r, k) => k > i && (r.startsWith('C) LA CURA') || r.startsWith('31 controlli') || /^\d+ controlli/.test(r)));
  const blocco = righe.slice(i + 1, j < 0 ? righe.length : j);
  const semi = {};
  for (const r of blocco) {
    const m = r.match(/^\s*(OK|NO)\s+seme (\d+):/);
    if (m) { if (!(m[2] in semi)) semi[m[2]] = true; if (m[1] === 'NO') semi[m[2]] = false; }
  }
  const tutti = Object.keys(semi);
  return { verdi: tutti.filter(s => semi[s]), rossi: tutti.filter(s => !semi[s]) };
}

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* l'impronta del motore (voce #142) letta su ogni motore */
async function improntePerMotore(porta, file) {
  const out = {};
  for (const nome of MOTORI) {
    const b = await playwright[nome].launch();
    const ctx = await b.newContext({ viewport: { width: 915, height: 412 }, hasTouch: true, locale: 'it-IT' });
    const p = await ctx.newPage();
    await p.goto(`http://127.0.0.1:${porta}/${file}`, { waitUntil: 'load' });
    await p.waitForFunction('window.__test !== undefined', null, { timeout: 40000 });
    out[nome] = await p.evaluate(() => window.__test.improntaMotore());
    await b.close();
  }
  return out;
}

(async () => {
  let srv = null;
  try {
    console.log('=== QUATTRO BUGIE NEL CASO PEGGIORE, E UN VERO — ' + NSEMI + ' semi, ' + MOTORI.join('/') + ' ===\n');
    fs.mkdirSync(path.join(RADICE, 'fuori'), { recursive: true });

    /* ---------------- 0) l'andata e ritorno ---------------- */
    console.log('0) ANDATA E RITORNO — la cura e\' ESATTAMENTE una libreria piu\' un cambio di nome');
    console.log('   (i mutanti nascono dal gioco SGUAINATO, cioe\' dal gioco di prima ricostruito da');
    console.log('    quello di adesso: se la ricostruzione non fosse fedele, ogni falso qui sotto');
    console.log('    misurerebbe la ricostruzione invece della bugia che dice di misurare)');
    {
      const { sguaina } = require('./_toppa-143-matematica.js');
      const oggi = fs.readFileSync(path.join(RADICE, GIOCO), 'utf8');
      let andata = null, tolte = 0, motivo = '';
      try { const s = sguaina(oggi); tolte = s.tolte; andata = innesta(s.testo, {}).testo; }
      catch (e) { motivo = e.message; }
      di(andata === oggi, 'innesta(sguaina(gioco)) e\' il gioco, parola per parola',
         andata === oggi ? tolte + ' chiamate tolte e rimesse' : (motivo || 'il testo non torna uguale'));
    }
    console.log('');

    /* ---------------- 1) solo-hypot ---------------- */
    if (!SALTA.includes('solo-hypot')) {
      console.log('1) SOLO HYPOT — la cura che il #141 aveva in mano: una riga, e su pochi semi funziona');
      const c = corri('_crit-casa-solo-hypot.js', []);
      if (c.stato !== 0) throw Object.assign(new Error('mutante solo-hypot non costruito: ' + c.testo), { banco: true });
      const r = corri('_q-motori.js', ['--semi', String(NSEMI), '--gioco', 'fuori/crit-casa-solo-hypot.html']);
      if (r.stato === 2 || r.stato === 3) throw Object.assign(new Error('_q-motori esploso sul mutante: ' + r.testo.slice(-600)), { banco: true });
      const s = semiB(r.testo);
      di(r.stato === 1, 'la cura parziale NON passa _q-motori (prova B)',
         'semi concordi ' + s.verdi.length + '/' + (s.verdi.length + s.rossi.length) +
         (s.rossi.length ? ', divergono ' + s.rossi.join(' ') : ''));
      if (r.stato === 1) morsi.push('solo-hypot  <- _q-motori prova B (' + s.rossi.length + ' semi su ' + (s.verdi.length + s.rossi.length) + ')');
      /* E LA LEZIONE, MISURATA: con quanti semi questo falso sarebbe passato? */
      let primoRosso = -1;
      const ordinati = Object.keys(s.verdi.concat(s.rossi).reduce((o, k) => (o[k] = 1, o), {})).sort();
      for (let k = 0; k < ordinati.length; k++) if (s.rossi.includes(ordinati[k])) { primoRosso = k; break; }
      console.log('   il primo seme che la smaschera e\' il ' + (primoRosso + 1) + '-esimo (' +
                  (primoRosso >= 0 ? ordinati[primoRosso] : '—') + '): un cancello a ' + primoRosso +
                  ' semi l\'avrebbe promossa. Il numero di semi E\' parte della soglia.');
      console.log('');
    }

    /* ---------------- 2) storta ---------------- */
    if (!SALTA.includes('storta')) {
      console.log('2) STORTA — una costante con meno cifre: uguale su tutti i motori, e sbagliata');
      const c = corri('_crit-casa-storta.js', []);
      if (c.stato !== 0) throw Object.assign(new Error('mutante storta non costruito: ' + c.testo), { banco: true });
      const r = corri('_q-casa.js', ['--sorgente', 'fuori/crit-casa-storta.js', '--motori', MOTORI.join(',')]);
      if (r.stato === 2 || r.stato === 3) throw Object.assign(new Error('_q-casa esploso sul mutante: ' + r.testo.slice(-600)), { banco: true });
      /* la prova C (uguale ovunque) deve restare VERDE: e' quel che rende
         questo falso pericoloso. La prova U deve essere ROSSA. */
      const righe = r.testo.split('\n');
      const iC = righe.findIndex(x => x.startsWith('C) LA CASA E\''));
      const iU = righe.findIndex(x => x.startsWith('U) LO SCARTO'));
      const bloccoC = righe.slice(iC, iU < 0 ? righe.length : iU);
      const bloccoU = righe.slice(iU < 0 ? righe.length : iU);
      const cVerde = iC >= 0 && !bloccoC.some(x => /^\s*NO\s/.test(x));
      const uRosso = bloccoU.some(x => /^\s*NO\s/.test(x));
      const dettU = bloccoU.filter(x => /^\s*NO\s/.test(x)).map(x => x.trim()).slice(0, 2).join(' · ');
      di(cVerde, 'la storta PASSA la SOGLIA (stessi bit sui tre motori): e\' quel che la rende pericolosa',
         cVerde ? 'prova C tutta verde' : 'prova C gia\' rossa — il falso non e\' quello che dice di essere');
      di(uRosso && r.stato === 1, 'la storta cade sullo SCARTO IN ULP (prova U), che esiste solo per lei', dettU || 'nessun NO nella prova U');
      if (uRosso) morsi.push('storta      <- _q-casa prova U (scarto in ULP dalla nativa)');
      console.log('');
    }

    /* ---------------- 3) una-nativa ---------------- */
    if (!SALTA.includes('una-nativa')) {
      console.log('3) UNA NATIVA — 369 chiamate su 370, e quella che manca e\' la distanza');
      const c = corri('_crit-casa-una-nativa.js', []);
      if (c.stato !== 0) throw Object.assign(new Error('mutante una-nativa non costruito: ' + c.testo), { banco: true });
      /* LA GUARDIA STRUTTURALE: senza `lascia`, la toppa deve rifiutarsi */
      let rifiutata = false, motivo = '';
      try {
        const t = fs.readFileSync(path.join(RADICE, 'fuori', 'crit-casa-una-nativa.html'), 'utf8');
        /* si prova a rinnestare il mutante: la libreria c'e' gia', quindi
           l'innesto si rifiuta comunque. La prova vera e' un'altra: si
           rifa' la scansione sul mutante e si conta quel che resta. */
        const { trovaSiti } = require('./_143-siti.js');
        const { PROTETTO, SEGNAPOSTO, DIROTTATE } = require('./_toppa-143-matematica.js');
        const senza = t.replace(PROTETTO, SEGNAPOSTO);
        const restano = trovaSiti(senza).filter(s => DIROTTATE[s.nome]);
        rifiutata = restano.length > 0;
        motivo = restano.length + ' chiamate native fuori dal blocco protetto: ' +
                 restano.map(s => s.nome).join(', ');
      } catch (e) { motivo = e.message; }
      di(rifiutata, 'la guardia strutturale della toppa vede la chiamata dimenticata', motivo);
      if (rifiutata) morsi.push('una-nativa  <- la guardia strutturale di _toppa-143-matematica.js');
      const r = corri('_q-motori.js', ['--semi', String(NSEMI), '--gioco', 'fuori/crit-casa-una-nativa.html']);
      if (r.stato === 2 || r.stato === 3) throw Object.assign(new Error('_q-motori esploso sul mutante: ' + r.testo.slice(-600)), { banco: true });
      const s = semiB(r.testo);
      di(r.stato === 1, 'e la vede anche _q-motori, perche\' questo sito e\' caldissimo',
         'semi concordi ' + s.verdi.length + '/' + (s.verdi.length + s.rossi.length));
      if (r.stato === 1) morsi.push('una-nativa  <- _q-motori prova B');
      console.log('   (un sito FREDDO — il rigore, la rimessa, la taglia 11 — _q-motori non lo vedrebbe:');
      console.log('    per questo la guardia strutturale qui sopra non e\' un di piu\', e\' la rete vera)');
      console.log('');
    }

    /* ---------------- 4) impronta ---------------- */
    if (!SALTA.includes('impronta')) {
      console.log('4) IMPRONTA — la cura si mangia il testimone del #142');
      const c = corri('_crit-casa-impronta.js', []);
      if (c.stato !== 0) throw Object.assign(new Error('mutante impronta non costruito: ' + c.testo), { banco: true });
      srv = await servi();
      const falsa = await improntePerMotore(srv.porta, 'fuori/crit-casa-impronta.html');
      const vals = MOTORI.map(m => falsa[m]);
      const piatta = new Set(vals).size === 1;
      di(piatta, 'col mutante l\'impronta del motore e\' PIATTA (dice sempre «stesso motore»)',
         MOTORI.map(m => m + ' ' + falsa[m]).join(' · '));
      const vera = await improntePerMotore(srv.porta, GIOCO);
      const distinte = new Set(MOTORI.map(m => vera[m])).size === MOTORI.length;
      di(distinte, 'e col gioco vero separa ancora i ' + MOTORI.length + ' motori (il #142 non e\' decaduto)',
         MOTORI.map(m => m + ' ' + vera[m]).join(' · '));
      if (piatta && distinte) morsi.push('impronta    <- il confronto delle impronte del #142 sui tre motori');
      srv.chiudi(); srv = null;
      console.log('');
    }

    /* ---------------- il vero ---------------- */
    if (!SALTA.includes('vero')) {
      console.log('V) IL VERO — il gioco come sta nel repo deve passare');
      const r = corri('_q-motori.js', ['--semi', String(NSEMI), '--gioco', GIOCO]);
      if (r.stato === 2 || r.stato === 3) throw Object.assign(new Error('_q-motori esploso sul vero: ' + r.testo.slice(-600)), { banco: true });
      const s = semiB(r.testo);
      di(r.stato === 0, 'il gioco vero passa _q-motori su ' + NSEMI + ' semi',
         'semi concordi ' + s.verdi.length + '/' + (s.verdi.length + s.rossi.length));
      console.log('');
    }

    console.log('LA LISTA DEI MORSI — quale prova ha fermato quale bugia:');
    for (const m of morsi) console.log('   ' + m);
    console.log('');
    const rossi = esiti.filter(x => !x).length;
    console.log(esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti\n');
    process.exit(rossi ? 1 : 0);
  } catch (e) {
    try { if (srv) srv.chiudi(); } catch (x) {}
    console.error('\nFALLITO (banco): ' + e.message);
    process.exit(2);
  }
})();
