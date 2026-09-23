/* =====================================================================
   _t-144-motorev.js — MOTORE_V SI MISURA, NEI DUE VERSI
   (voce #144, compito 3).

   LA DOMANDA. `MOTORE_V` e' la versione del GIOCO scritta in testa a
   ogni nastro, e si alza quando una cura cambia l'esito di sequenze di
   comandi identiche: i nastri del motore vecchio vengono rifiutati con
   causa vera (`ALTRO MOTORE / motore-diverso`) invece che rigiocati
   storti. La voce #144 cambia CHE COSA si registra, non come si calcola:
   `risolvi` e' pura e `applica` e' il corpo di prima riga per riga.
   Quindi il primo criterio, da solo, non scatterebbe.

   Ma il formato cambia, e cambia in modo ASIMMETRICO. Percio' qui si
   misura nei due versi, e si decide col numero in mano invece che con un
   ragionamento:

     VERSO 1  nastri registrati sul gioco VECCHIO (il merge-base) e
              rigiocati sul CURATO. Se l'esito e' identico, la cura e'
              neutra: chi ha gia' un nastro in mano non perde niente, e
              il primo criterio non scatta.
     VERSO 2  nastri registrati sul CURATO e rigiocati sul VECCHIO. Un
              telefono con la versione di ieri — una copia in cache, un
              browser che non ha ancora aggiornato — non conosce i tipi
              12 e 13, li butta in silenzio (`esegui` non ha un ramo) e
              rigioca una partita SENZA COMANDI. Se l'esito e' diverso,
              il secondo criterio scatta: senza un `MOTORE_V` piu' alto
              quel telefono direbbe NON TORNA a un onesto, e NON TORNA
              e' l'unico verdetto che muove punti.

   IL CONTROLLO C'E' IN TUTTI E DUE I VERSI: lo stesso nastro rigiocato
   sul gioco che l'ha scritto. Se quello divergesse, la prova non
   starebbe misurando la compatibilita' fra due versioni ma la
   rigiocabilita' del nastro, che e' un'altra cosa e ha i suoi cancelli.

   NIENTE GIUDICE, NIENTE SERVER: si confronta l'IMPRONTA della partita
   (la stessa di `_q-determinismo.js`: palla, possesso, punteggio,
   cronometro, e posizione, stato e umore di ogni giocatore) campionata
   ogni mezzo secondo di gioco. E' piu' fine di un punteggio — due
   partite diverse possono finire 1-1 — e dice a QUALE campione le due
   strade si separano.

   Le due pagine hanno la STESSA misura di finestra (915x412) e lo stesso
   motore JavaScript (una sola istanza di Chromium): l'unica cosa che
   cambia fra i due lati e' la versione del gioco.

   uso:  node strumenti/_t-144-motorev.js
         node strumenti/_t-144-motorev.js --vecchio fuori/main-144.html --semi 4
   esce 0 se il verso 1 e' neutro, 1 se non lo e', 2 se il banco esplode,
   3 se il gioco vecchio indicato non c'e'.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const B = require('./_sfida-due-telefoni.js');

const RADICE = B.RADICE;
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const VECCHIO = arg('vecchio', 'fuori/main-144.html');
const NUOVO = arg('nuovo', '');
const SEMI = Math.max(1, parseInt(arg('semi', '4'), 10) || 4);
const SEME0 = 20260923;
const PASSI = 2400;          /* quaranta secondi di gioco a passo fisso */
const OGNI = 30;             /* un campione ogni mezzo secondo */
const MISURA = [915, 412];

/* l'impronta e' quella di _q-determinismo.js, parola per parola: due
   banchi che dicono «e' la stessa partita» devono guardare la stessa
   cosa, o uno dei due mente senza saperlo */
const IMPRONTA = `(() => {
  const b=G.ball;
  let s = [Math.round(b.x*100), Math.round(b.y*100), Math.round((b.z||0)*100),
           Math.round(b.vx*100), Math.round(b.vy*100), b.owner, b.lastTouch,
           G.score[0], G.score[1], Math.round(G.timeLeft*100)];
  for(const p of G.players) s.push(Math.round(p.x*100), Math.round(p.y*100), p.out|0,
           Math.round((p.umore||0)*1000), Math.round((p.nervi||0)*1000));
  if(Array.isArray(G.spinta)) s.push(Math.round(G.spinta[0]*1000), Math.round(G.spinta[1]*1000));
  return s.join(',');
})()`;

/* IL COPIONE DELLE DITA, e gira uguale sulle due versioni: preme il
   disco grande al centro e al BORDO della presa, tiene la levetta, e
   chiude. Il bordo c'e' apposta — e' il dito che un pixel spostato
   manda su un altro disco, cioe' quello che separa due formati. */
const REGISTRA = `(function(seme, passi, IMPR){
  const t = window.__test;
  const leggi = new Function('return ' + IMPR);
  t.semina(seme);
  t.startMatch(1, 1, { size:5 });
  t.registra();
  const d = t.pulsanti(0);
  const grande = d[0], piccolo = d[1];
  const LX = 180, LY = 300;
  const impronte = [];
  let giu = false, idL = 1, idB = 2;
  for(let f = 0; f < passi; f++){
    if(t.state === 'end') break;
    if(t.state === 'freekick'){
      const D = t.Duel;
      if(D.phase === 'zone' && D.shooterHuman) D.pickZone(2, 0.74, 0.44);
      else if(D.phase === 'power' && D.shooterHuman) D.stopPower();
      else if(D.phase === 'wait' && D.keeperHuman && D.keeperZone < 0) D.pickKeeper(0);
      t.simulate(1/60);
      if(f % ${OGNI} === 0) impronte.push(leggi());
      continue;
    }
    const a = f * 0.037, rr = 34 + 22 * Math.sin(f * 0.011);
    if(!giu){ Touch5.start(idL, LX, LY); giu = true; }
    else Touch5.move(idL, Math.round(LX + Math.cos(a) * rr), Math.round(LY + Math.sin(a) * rr));
    if(f % 97 === 96){ Touch5.chiudi(idL, false); giu = false; idL += 2; }
    if(f % 71 === 0){ Touch5.start(idB, Math.round(grande.x), Math.round(grande.y)); }
    else if(f % 71 === 18){ Touch5.move(idB, Math.round(grande.x - 26), Math.round(grande.y - 14)); }
    else if(f % 71 === 26){ Touch5.chiudi(idB, false); idB += 2; }
    if(f % 53 === 11){ const j = 900 + f; Touch5.start(j, Math.round(grande.x + 45), Math.round(grande.y)); }
    if(f % 53 === 20){ const j = 900 + f - 9; Touch5.chiudi(j, true); }
    if(f % 37 === 5){ const j = 4000 + f; Touch5.start(j, Math.round(piccolo.x), Math.round(piccolo.y)); Touch5.chiudi(j, false); }
    t.simulate(1/60);
    if(f % ${OGNI} === 0) impronte.push(leggi());
  }
  if(giu) Touch5.chiudi(idL, false);
  return { nastro: t.nastro(), impronte: impronte, gol:[G.score[0],G.score[1]],
           righe: t.registroRighe, scena: t.state,
           tipi: (typeof Reg !== 'undefined' ? Reg.righe.map(r=>r[1]).join(',') : '') };
})`;

const RIGIOCA = `(function(seme, nastro, passi, IMPR){
  const t = window.__test;
  const leggi = new Function('return ' + IMPR);
  t.semina(seme);
  t.startMatch(1, 1, { size:5 });
  let righe = -1;
  try{ righe = t.rigioca(nastro); }catch(e){ return { errore:String(e && e.message || e) }; }
  const impronte = [];
  for(let f = 0; f < passi; f++){
    if(t.state === 'end') break;
    if(t.state === 'freekick') t.Duel.update(1/60);
    else t.simulate(1/60);
    if(f % ${OGNI} === 0) impronte.push(leggi());
  }
  return { righe: righe, impronte: impronte, gol:[G.score[0],G.score[1]], scena: t.state,
           motoreV: t.registroMotoreV };
})`;

const primoScarto = (a, b) => {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
};

async function apri(browser, porta) {
  const P = await B.apri(browser, porta, { width: MISURA[0], height: MISURA[1] });
  return P;
}

(async () => {
  const vec = path.resolve(RADICE, VECCHIO);
  if (!fs.existsSync(vec)) {
    console.error('PROVA NULLA: non esiste il gioco vecchio ' + vec);
    console.error('  si costruisce con:  git show main:CALCETTO-il-gioco.html > ' + VECCHIO);
    process.exit(3);
  }
  const sV = await B.serviGioco(vec);
  const sN = await B.serviGioco(NUOVO ? path.resolve(RADICE, NUOVO) : '');
  let browser;
  const esiti = [];
  const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };
  try {
    browser = await chromium.launch();
    console.log('=== MOTORE_V, MISURATO NEI DUE VERSI (voce #144) ===');
    console.log('    vecchio ' + VECCHIO + '   nuovo ' + (NUOVO || 'CALCETTO-il-gioco.html'));
    console.log('    ' + SEMI + ' semi, ' + PASSI + ' passi, un campione ogni ' + OGNI + ', finestra ' + MISURA.join('x') + '\n');

    const V = await apri(browser, sV.porta);
    const N = await apri(browser, sN.porta);
    const mv = await Promise.all([
      V.pag.evaluate(() => (typeof MOTORE_V !== 'undefined' ? MOTORE_V : -1)),
      N.pag.evaluate(() => (typeof MOTORE_V !== 'undefined' ? MOTORE_V : -1)),
    ]);
    console.log('    MOTORE_V dichiarato: vecchio ' + mv[0] + ', curato ' + mv[1] + '\n');

    /* ------------------------------------------------ VERSO 1 */
    console.log('VERSO 1 — nastri del gioco VECCHIO, rigiocati sul CURATO');
    for (let i = 0; i < SEMI; i++) {
      const s = SEME0 + i;
      const reg = await V.pag.evaluate(([c, s, p, I]) => (new Function('return ' + c))()(s, p, I), [REGISTRA, s, PASSI, IMPRONTA]);
      const ctl = await V.pag.evaluate(([c, s, n, p, I]) => (new Function('return ' + c))()(s, n, p, I), [RIGIOCA, s, reg.nastro, PASSI, IMPRONTA]);
      const cur = await N.pag.evaluate(([c, s, n, p, I]) => (new Function('return ' + c))()(s, n, p, I), [RIGIOCA, s, reg.nastro, PASSI, IMPRONTA]);
      const kC = primoScarto(reg.impronte, ctl.impronte);
      const kN = primoScarto(reg.impronte, cur.impronte);
      di(kC < 0, '  seme ' + s + ': controllo — il nastro si rigioca sul gioco che l\'ha scritto',
         kC < 0 ? reg.impronte.length + ' campioni, ' + reg.gol.join('-') : 'scarto al campione ' + kC);
      di(kN < 0, '  seme ' + s + ': lo stesso nastro sul CURATO',
         kN < 0 ? cur.gol.join('-') + ', ' + cur.righe + ' righe' : 'scarto al campione ' + kN +
                  ', ' + reg.gol.join('-') + ' contro ' + cur.gol.join('-'));
    }

    /* ------------------------------------------------ VERSO 2 */
    console.log('\nVERSO 2 — nastri del gioco CURATO, rigiocati sul VECCHIO');
    let rotti = 0, provati = 0;
    for (let i = 0; i < SEMI; i++) {
      const s = SEME0 + i;
      const reg = await N.pag.evaluate(([c, s, p, I]) => (new Function('return ' + c))()(s, p, I), [REGISTRA, s, PASSI, IMPRONTA]);
      const ctl = await N.pag.evaluate(([c, s, n, p, I]) => (new Function('return ' + c))()(s, n, p, I), [RIGIOCA, s, reg.nastro, PASSI, IMPRONTA]);
      const vec2 = await V.pag.evaluate(([c, s, n, p, I]) => (new Function('return ' + c))()(s, n, p, I), [RIGIOCA, s, reg.nastro, PASSI, IMPRONTA]);
      const kC = primoScarto(reg.impronte, ctl.impronte);
      const kV = primoScarto(reg.impronte, vec2.impronte);
      provati++;
      if (kV >= 0) rotti++;
      di(kC < 0, '  seme ' + s + ': controllo — il nastro si rigioca sul gioco che l\'ha scritto',
         kC < 0 ? reg.impronte.length + ' campioni, ' + reg.gol.join('-') : 'scarto al campione ' + kC);
      console.log('  --  seme ' + s + ': lo stesso nastro sul VECCHIO  [' +
                  (kV < 0 ? 'IDENTICO' : 'scarto al campione ' + kV + ', ' + reg.gol.join('-') +
                   ' contro ' + vec2.gol.join('-') + ', ' + vec2.righe + ' righe lette su ' + reg.righe) + ']');
    }

    console.log('\nIL NUMERO CHE DECIDE: ' + rotti + ' nastri su ' + provati +
                ' registrati sul curato finiscono in una PARTITA DIVERSA sul gioco di ieri.');
    console.log(rotti === provati && provati > 0
      ? '  -> MOTORE_V DEVE SALIRE: senza, quel telefono direbbe NON TORNA a un onesto.'
      : '  -> la rottura non e\' sistematica: rileggere i numeri prima di alzare MOTORE_V.');

    await browser.close(); sV.chiudi(); sN.chiudi();
    const male = esiti.filter(x => !x).length;
    console.log('\n' + (male ? 'ROSSO' : 'VERDE') + ': ' + (esiti.length - male) + '/' + esiti.length + ' prove del VERSO 1 e dei controlli');
    process.exit(male ? 1 : 0);
  } catch (e) {
    console.error('BANCO ESPLOSO: ' + (e && e.stack || e));
    try { if (browser) await browser.close(); } catch (x) {}
    try { sV.chiudi(); sN.chiudi(); } catch (x) {}
    process.exit(2);
  }
})();
