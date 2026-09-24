/* =====================================================================
   _t-148-motorev.js — MOTORE_V VA ALZATO? LA MISURA, NEI TRE VERSI
   (voce #148, compito 3)

   LA DOMANDA, ESATTA. Il #148 mette nel nastro di una serie dal
   dischetto tre righe che prima non c'erano — le rose (7), lo schermo
   (10), l'impronta del motore (11) — e un secondo numero dentro la riga
   15. Nessuna delle quattro cose e' un comando, e il criterio di casa
   dice che MOTORE_V sale «quando una cura cambia l'esito di sequenze di
   comandi identiche».

   MA QUI IL CRITERIO NON BASTA, E IL CANTIERE LO SA GIA'. I tipi 7, 10 e
   11 il gioco di ieri li CONOSCE: non li butta, li legge, e rigioca
   esattamente la stessa cosa. Il verso 2 nella forma del #146 — «il
   gioco di ieri legge le stesse righe meno quelle dei tipi che non
   conosce» — qui non misura il pericolo, perche' non ci sono tipi
   nuovi. Lo scarto atteso e' ZERO.

   IL PERICOLO STA UN PIANO PIU' SU, E VUOLE UN TERZO VERSO. Quel che il
   #148 ha cambiato non e' come si LEGGE un nastro: e' come si GIUDICA.
   Il gioco di ieri, davanti a un nastro del dischetto di oggi, trova le
   rose al loro posto, le testimonianze al loro posto e l'impronta che
   torna: il vaglio passa. E poi rigioca la serie come una PARTITA
   QUALUNQUE, perche' il ramo che apre i rigori nasce oggi. MISURATO
   prima della cura (strumenti/_sonda-148-differita.js): NON TORNA,
   atteso [4,3], rigiocato [3,2], 8462 passi.

   E' parola per parola il caso del #144 — «senza il numero, un telefono
   rimasto indietro direbbe NON TORNA a un onesto invece di ALTRO
   MOTORE» — solo che li' il guasto si vedeva nelle righe lette e qui si
   vede solo nel verdetto. Percio' il terzo verso non e' un di piu': e'
   il verso che decide.

   I TRE VERSI

     VERSO 1 — LA CURA E' NEUTRA sui nastri della SFIDA ASINCRONA?
       Nastri registrati sul merge-base, rigiocati sul curato. Lo misura
       `_t-144-motorev.js`, che esiste gia': qui si lancia lui invece di
       riscriverlo peggio.

     VERSO 2 — IL GIOCO DI IERI LEGGE LO STESSO NASTRO ALLO STESSO MODO?
       Un nastro di una serie vera del curato, rigiocato (non giudicato)
       dai due giochi. Lo scarto di righe atteso e' ZERO — i tipi non
       sono nuovi — e le due partite devono restare identiche campione
       per campione. Col suo TESTIMONE: un nastro sporcato in un comando
       DEVE dare una partita diversa, se no «identiche» vuol dire «il
       banco non guarda».

     VERSO 3 — E CHE VERDETTO DA' IL GIUDICE DI IERI?
       Lo stesso nastro, lo stesso punteggio dichiarato, i due giudici.
       Il curato deve dire TORNA. Se quello di ieri dice NON TORNA,
       MOTORE_V DEVE salire: NON TORNA toglie i punti a due persone.

   IL MERGE-BASE DI QUESTO CANTIERE E' 01265bc, e va estratto prima:
     git show 01265bc:CALCETTO-il-gioco.html > fuori/148-prima.html

   uso:  node strumenti/_t-148-motorev.js [--vecchio fuori/148-prima.html]
   esce  0 se MOTORE_V puo' restare 4 · 1 se deve salire ·
         2 se un banco e' esploso · 3 prova nulla
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { chromium } = require('playwright');
const T = require('./_dischetto-due-telefoni.js');

const RADICE = T.RADICE;
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const VECCHIO_REL = arg('vecchio', 'fuori/148-prima.html');
const VECCHIO = path.resolve(RADICE, VECCHIO_REL);
const NUOVO = arg('nuovo') ? path.resolve(RADICE, arg('nuovo')) : path.join(RADICE, 'CALCETTO-il-gioco.html');

if (!fs.existsSync(VECCHIO)) {
  console.error('PROVA NULLA: manca il gioco del merge-base: ' + VECCHIO_REL);
  console.error('  si costruisce con:  git show 01265bc:CALCETTO-il-gioco.html > ' + VECCHIO_REL);
  process.exit(3);
}
if (!fs.existsSync(NUOVO)) { console.error('PROVA NULLA: manca il gioco curato: ' + NUOVO); process.exit(3); }

const esiti = [];
const di = (ok, nome, det) => { esiti.push(!!ok); console.log((ok ? '  OK  ' : '  NO  ') + nome + (det ? '   [' + det + ']' : '')); };

/* l'impronta e' quella di _q-determinismo.js, di _t-144-motorev.js e di
   _t-146-motorev.js, parola per parola: due banchi che dicono «e' la
   stessa partita» devono guardare la stessa cosa, o uno dei due mente
   senza saperlo */
const IMPRONTA = `(() => {
  const b=G.ball;
  let s = [Math.round(b.x*100), Math.round(b.y*100), Math.round((b.z||0)*100),
           Math.round(b.vx*100), Math.round(b.vy*100), b.owner, b.lastTouch,
           G.score[0], G.score[1], Math.round(G.timeLeft*100)];
  for(const p of G.players) s.push(Math.round(p.x*100), Math.round(p.y*100), p.out|0);
  return s.join(',');
})()`;

const RIGIOCA = `(function(seme, nastro, passi, IMPR){
  const t = window.__test;
  const leggi = new Function('return ' + IMPR);
  t.semina(seme);
  t.startMatch(1, 1, { size:5 });
  let righe = -1, errore = null;
  try{ righe = t.rigioca(nastro); }catch(e){ errore = String(e && e.message || e); }
  const impronte = [];
  for(let f = 0; f < passi; f++){
    if(t.state === 'end') break;
    if(t.state === 'freekick') t.Duel.update(1/60);
    else t.simulate(1/60);
    if(f % 30 === 0) impronte.push(leggi());
  }
  return { righe, errore, impronte, gol:[G.score[0],G.score[1]], scena: t.state,
           motoreV: t.registroMotoreV };
})`;

const primoScarto = (a, b) => {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
};

async function suPagina(browser, porta, fn) {
  const P = await T.apri(browser, porta);
  try { return await fn(P); } finally { await P.ctx.close(); }
}
const rigiocaSu = (browser, porta, nastro, seme) => suPagina(browser, porta, P =>
  P.pag.evaluate(([R, s, n, IMPR]) => (new Function('return ' + R))()(s, n, 3000, IMPR),
                 [RIGIOCA, seme, nastro, IMPRONTA]));
const giudicaSu = (browser, porta, nastro, atteso, seme) => suPagina(browser, porta, P =>
  P.pag.evaluate(([n, a, s]) => {
    const v = window.__test.giudica(n, a, { seme: String(s), taglia: 5 });
    return { verdetto: v.verdetto, causa: v.causa, gol: v.gol, passi: v.passi, righe: v.righe };
  }, [nastro, atteso, seme]));

/* un comando del duello cambiato: la zona del primo tiro diventa
   un'altra. E' un comando vero, quindi una partita diversa deve
   uscirne — e' il testimone del verso 2. */
function sporcaUnComando(nastro) {
  const p = String(nastro).split('|');
  const pezzi = (p[3] || '').split(';');
  for (let i = 0; i < pezzi.length; i++) {
    const v = pezzi[i].split(',');
    if (v[1] === '6' && v[5] === '0' && v.length > 6) {
      v[6] = String((Number(v[6]) + 1) % 3);
      pezzi[i] = v.join(',');
      return p[0] + '|' + p[1] + '|' + p[2] + '|' + pezzi.join(';');
    }
  }
  return null;
}

(async () => {
  console.log('\nMOTORE_V — la misura nei TRE versi (voce #148)');
  console.log('  ieri:   ' + VECCHIO_REL);
  console.log('  oggi:   ' + path.relative(RADICE, NUOVO));

  /* ================================================= VERSO 1, delegato */
  console.log('\n===== VERSO 1 — la cura e\' neutra? (nastri di ieri sul curato) =====');
  const r1 = spawnSync(process.execPath, ['strumenti/_t-144-motorev.js', '--vecchio', VECCHIO_REL],
                       { cwd: RADICE, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  process.stdout.write(r1.stdout || '');
  if (r1.stderr) process.stderr.write(r1.stderr);
  const u1 = r1.status;

  const browser = await chromium.launch();
  let esploso = null, sgV = null, sgN = null, cc = null;
  try {
    sgN = await T.serviGioco(NUOVO);
    sgV = await T.serviGioco(VECCHIO);
    cc = await T.serviCassetta({ frenoAcceso: false });

    /* IL NASTRO VERO: una serie dal dischetto giocata fra due telefoni
       sul gioco CURATO. Non un nastro costruito a mano — un nastro
       costruito a mano proverebbe il banco. */
    const A = await T.apri(browser, sgN.porta);
    const B = await T.apri(browser, sgN.porta);
    await T.collega(A, cc.porta, 'ALFA'); await T.collega(B, cc.porta, 'BETANOVE');
    await T.entra(A); await T.entra(B);
    const r = await A.pag.evaluate(async () => await window.__test.dischetto.crea());
    await B.pag.evaluate(async s => await window.__test.dischetto.entra(s), r.stanza);
    const mt = t => ({ ruolo: 't', z: t % 3, u: ((t * 317) % 1600) - 800, v: 200 + ((t * 211) % 600), ps: 30 + (t * 7) % 40 });
    const mp = t => ({ ruolo: 'p', z: (t * 2 + 1) % 3 });
    for (let g = 0; g < 400; g++) {
      const [sa, sb] = await Promise.all([
        A.pag.evaluate(() => window.__test.dischetto.stato),
        B.pag.evaluate(() => window.__test.dischetto.stato)]);
      if (sa.fase === 'fine' && sb.fase === 'fine') break;
      for (const [P, s] of [[A, sa], [B, sb]]) {
        if (s.fase === 'scegli') await P.pag.evaluate(m => window.__test.dischetto.scegli(m),
          s.ruolo === 't' ? mt(s.tiro) : mp(s.tiro));
      }
      await Promise.all([
        A.pag.evaluate(async () => await window.__test.dischetto.giro()),
        B.pag.evaluate(async () => await window.__test.dischetto.giro())]);
    }
    const preso = await A.pag.evaluate(() => {
      const st = window.__test.dischetto.stato;
      return { nastro: window.__test.nastro(), seme: st.seme, fase: st.fase, causa: st.causa,
               seg: [st.serie.seg[0] | 0, st.serie.seg[1] | 0], esiti: window.__test.dischetto.esiti.length };
    });
    await A.ctx.close(); await B.ctx.close();

    const tipi = {};
    for (const z of (preso.nastro.split('|')[3] || '').split(';')) {
      if (!z) continue;
      const t = Number(z.split(',')[1]);
      tipi[t] = (tipi[t] || 0) + 1;
    }
    console.log('\n===== IL NASTRO =====');
    di(preso.fase === 'fine' && preso.causa === 'finita' && tipi[7] === 1 && tipi[10] === 1 && tipi[11] === 1,
       'una serie vera, finita, con le tre righe nuove',
       'serie ' + preso.seg.join('-') + ' · ' + preso.esiti + ' tiri · per tipo ' + JSON.stringify(tipi));
    if (!(tipi[7] === 1 && tipi[10] === 1 && tipi[11] === 1))
      throw new Error('il gioco curato non ha scritto le tre righe: non c\'e\' niente da misurare');

    /* ============================================ VERSO 2 — la lettura */
    console.log('\n===== VERSO 2 — il gioco di ieri legge lo stesso nastro? =====');
    const SEME = 20260924;
    const suNuovo = await rigiocaSu(browser, sgN.porta, preso.nastro, SEME);
    const suVecchio = await rigiocaSu(browser, sgV.porta, preso.nastro, SEME);
    di(!suVecchio.errore, '2a) il gioco di ieri non si schianta sul nastro di oggi',
       suVecchio.errore || 'nessuna eccezione');
    /* LO SCARTO ATTESO E' ZERO, e non e' il criterio rilassato: e' lo
       stesso criterio del #147 («esattamente il numero di righe dei tipi
       nuovi») applicato a un caso in cui i tipi nuovi sono ZERO. I tipi
       7, 10 e 11 il gioco di ieri li conosce da mesi. */
    di(suVecchio.righe === suNuovo.righe,
       '2b) e ne legge ESATTAMENTE le stesse: nessun tipo qui e\' nuovo per lui',
       'ieri ' + suVecchio.righe + ' · oggi ' + suNuovo.righe + ' · tipi nuovi 0');
    const sc = primoScarto(suVecchio.impronte, suNuovo.impronte);
    di(sc === -1, '2c) e finisce nella STESSA partita, campione per campione',
       sc === -1 ? (suNuovo.impronte.length + ' campioni identici') : ('primo scarto al campione ' + sc + ' su ' + suNuovo.impronte.length));
    di(suVecchio.gol.join('-') === suNuovo.gol.join('-'), '2d) stesso punteggio rigiocato',
       'ieri ' + suVecchio.gol.join('-') + ' · oggi ' + suNuovo.gol.join('-'));
    const sporcato = sporcaUnComando(preso.nastro);
    if (sporcato) {
      const sN2 = await rigiocaSu(browser, sgN.porta, sporcato, SEME);
      const sc2 = primoScarto(sN2.impronte, suNuovo.impronte);
      di(sc2 !== -1, 'TESTIMONE) un nastro sporcato in un comando DA\' una partita diversa',
         sc2 === -1 ? 'IDENTICA: il confronto non distingue niente, e i quattro OK sopra non valgono'
                    : ('primo scarto al campione ' + sc2));
    } else {
      di(false, 'TESTIMONE) non si e\' riusciti a sporcare un comando: la misura non si da\'');
    }

    /* ============================================ VERSO 3 — il giudizio */
    console.log('\n===== VERSO 3 — e che verdetto da\' il giudice di ieri? =====');
    const gN = await giudicaSu(browser, sgN.porta, preso.nastro, preso.seg, preso.seme);
    const gV = await giudicaSu(browser, sgV.porta, preso.nastro, preso.seg, preso.seme);
    di(gN.verdetto === 'TORNA', '3a) il giudice di OGGI conferma la serie onesta',
       gN.verdetto + (gN.causa ? '/' + gN.causa : '') + ' · atteso ' + preso.seg.join('-') +
       ' · rigiocato ' + JSON.stringify(gN.gol) + ' · passi ' + gN.passi);
    di(gV.verdetto !== 'NON TORNA', '3b) e quello di IERI non accusa nessuno',
       gV.verdetto + (gV.causa ? '/' + gV.causa : '') + ' · rigiocato ' + JSON.stringify(gV.gol) +
       ' · passi ' + gV.passi);
  } catch (e) {
    esploso = e;
  } finally {
    try { await browser.close(); } catch (x) {}
    try { if (sgN) sgN.chiudi(); } catch (x) {}
    try { if (sgV) sgV.chiudi(); } catch (x) {}
    try { if (cc) cc.chiudi(); } catch (x) {}
  }

  if (esploso) {
    console.error('\nIL BANCO E\' ESPLOSO: ' + (esploso && esploso.message));
    console.error(esploso && esploso.stack);
    process.exit(2);
  }

  const rossi = esiti.filter(x => !x).length;
  console.log('\n===== IL VERDETTO SU MOTORE_V (voce #148) =====');
  console.log('  verso 1 (delegato a _t-144-motorev.js): uscita ' + u1);
  console.log('  versi 2 e 3: ' + (esiti.length - rossi) + ' su ' + esiti.length + (rossi ? ('  ROSSI: ' + rossi) : ''));
  if (u1 === 3) { console.log('  PROVA NULLA: il verso 1 non ha misurato niente.'); process.exit(3); }
  if (u1 === 2) { console.log('  UN BANCO E\' ESPLOSO: non si conclude niente.'); process.exit(2); }
  if (u1 === 0 && rossi === 0) {
    console.log('  MOTORE_V PUO\' RESTARE 4.');
    process.exit(0);
  }
  console.log('  MOTORE_V DEVE SALIRE A 5.');
  process.exit(1);
})();
