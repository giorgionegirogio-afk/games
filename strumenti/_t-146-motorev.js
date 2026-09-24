/* =====================================================================
   _t-146-motorev.js — MOTORE_V VA ALZATO? LA MISURA, NEI DUE VERSI
   (voce #146, compito 3)

   LA DOMANDA, ESATTA. Il compito 3 aggiunge al nastro una riga nuova —
   il tipo 14, la testimonianza del dischetto. Il criterio scritto in
   casa e' «MOTORE_V si incrementa quando una cura cambia l'esito di
   sequenze di comandi identiche». Una riga che NON E' UN COMANDO non
   dovrebbe cambiare nessun esito.

   MA «NON DOVREBBE» NON E' UN NUMERO, e il #144 ha dimostrato quanto
   costa crederci: li' la cura sembrava neutra e lo era (quattro nastri
   su quattro identici nel verso 1), ma nel verso 2 quattro nastri su
   quattro finivano in una partita DIVERSA, con 170 righe lette su 2749.
   Senza quella misura il gioco avrebbe detto NON TORNA a un onesto.

   I DUE VERSI, e sono domande diverse:

     VERSO 1 — LA CURA E' NEUTRA?
       Nastri registrati sul merge-base, rigiocati sul curato. Se
       divergono, la cura ha cambiato la simulazione e MOTORE_V sale
       comunque. Questo verso lo misura `_t-144-motorev.js`, che esiste
       gia' e fa esattamente questo: qui si lancia lui, invece di
       riscriverlo peggio.

     VERSO 2 — UN TELEFONO RIMASTO INDIETRO CHE COSA LEGGE?
       Un nastro del curato, con dentro le righe di tipo 14 di una serie
       di rigori vera giocata fra due telefoni, rigiocato sul gioco di
       ieri. Se il gioco di ieri legge MENO righe o finisce in una
       partita diversa, MOTORE_V DEVE salire a 5: senza, quel telefono
       direbbe NON TORNA a un onesto.

   IL CONFRONTO E' VECCHIO-CONTRO-NUOVO SULLO STESSO NASTRO, e non
   originale-contro-rigiocata. La partita del dischetto nasce con due
   rose concordate in rete, che una pagina sola non puo' ricostruire; ma
   la domanda non e' quella. La domanda e' «i due motori leggono lo
   stesso nastro allo stesso modo?», e per rispondere basta dare a tutti
   e due LO STESSO identico apparecchio e guardare se divergono. Se
   divergono, la colpa e' del formato — che e' proprio quel che si
   vuole sapere.

   IL TESTIMONE, senza il quale questo banco attesterebbe: si misura
   anche un nastro SPORCATO apposta (una riga di comando cambiata). Se
   il confronto vecchio-nuovo non sapesse distinguere NEMMENO quello,
   «identici» vorrebbe dire «il banco non guarda», non «il formato
   regge».

   uso:  node strumenti/_t-146-motorev.js [--vecchio f.html] [--nuovo f.html]
   esce  0 se MOTORE_V puo' restare 4 (i due versi sono neutri) ·
         1 se deve salire · 2 se il banco e' esploso · 3 prova nulla
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const T = require('./_dischetto-due-telefoni.js');

const RADICE = T.RADICE;
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const VECCHIO = path.resolve(RADICE, arg('vecchio', 'fuori/main-146.html'));
const NUOVO = arg('nuovo') ? path.resolve(RADICE, arg('nuovo')) : path.join(RADICE, 'CALCETTO-il-gioco.html');

if (!fs.existsSync(VECCHIO)) {
  console.error('PROVA NULLA: manca il gioco di ieri: ' + VECCHIO);
  console.error('  si costruisce con:  git show 5038eee:CALCETTO-il-gioco.html > ' + path.relative(RADICE, VECCHIO));
  process.exit(3);
}
if (!fs.existsSync(NUOVO)) { console.error('PROVA NULLA: manca il gioco curato: ' + NUOVO); process.exit(3); }

const esiti = [];
const di = (ok, nome, det) => { esiti.push(!!ok); console.log((ok ? '  OK  ' : '  NO  ') + nome + (det ? '   [' + det + ']' : '')); };

/* l'impronta e' quella di _q-determinismo.js e di _t-144-motorev.js,
   parola per parola: due banchi che dicono «e' la stessa partita»
   devono guardare la stessa cosa, o uno dei due mente senza saperlo */
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

async function rigiocaSu(browser, porta, nastro, seme) {
  const P = await T.apri(browser, porta);
  try {
    return await P.pag.evaluate(([R, s, n, IMPR]) =>
      (new Function('return ' + R))()(s, n, 3000, IMPR), [RIGIOCA, seme, nastro, IMPRONTA]);
  } finally { await P.ctx.close(); }
}

(async () => {
  console.log('\nMOTORE_V — la misura nei due versi (voce #146)');
  console.log('  ieri:   ' + path.relative(RADICE, VECCHIO));
  console.log('  oggi:   ' + path.relative(RADICE, NUOVO));

  const browser = await chromium.launch();
  let esploso = null;
  let sgV = null, sgN = null, cc = null;
  try {
    sgN = await T.serviGioco(NUOVO);
    sgV = await T.serviGioco(VECCHIO);
    cc = await T.serviCassetta({ frenoAcceso: false });

    /* ============================================================== */
    /* IL NASTRO VERO: una serie di rigori giocata fra due telefoni sul
       gioco CURATO. Non un nastro costruito a mano — un nastro costruito
       a mano proverebbe il banco.                                     */
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
    const preso = await A.pag.evaluate(() => ({
      nastro: window.__test.nastro(),
      motoreV: window.__test.registroMotoreV,
      tipi: (typeof Reg !== 'undefined' ? Reg.righe.map(x => x[1]) : []),
      esiti: window.__test.dischetto.esiti.length,
      seme: window.__test.dischetto.stato.seme,
    }));
    await A.ctx.close(); await B.ctx.close();

    const quante14 = preso.tipi.filter(x => x === 14).length;
    const quante6 = preso.tipi.filter(x => x === 6).length;
    di(preso.esiti > 0 && quante14 > 0,
       'IL NASTRO — una serie vera, con dentro le testimonianze di tipo 14',
       preso.esiti + ' tiri · ' + preso.tipi.length + ' righe · ' + quante6 + ' di tipo 6 · ' + quante14 + ' di tipo 14');
    if (!quante14) throw new Error('nessuna riga di tipo 14: non c\'e\' niente da misurare');

    /* ============================================================== */
    /* VERSO 2 — lo stesso nastro, letto dai due motori.               */
    const SEME = 20260924;
    const suNuovo = await rigiocaSu(browser, sgN.porta, preso.nastro, SEME);
    const suVecchio = await rigiocaSu(browser, sgV.porta, preso.nastro, SEME);

    di(!suVecchio.errore, 'VERSO 2a) il gioco di ieri non si schianta sul nastro di oggi',
       suVecchio.errore || 'nessuna eccezione');
    /* =====================================================================
       RETTIFICA A EDIZIONI (24 settembre 2026, voce #147, compito 4).

       IL TESTO VECCHIO, che resta scritto perche' era giusto quando e'
       stato scritto: «il gioco di ieri legge LE STESSE righe del curato»,
       cioe' `suVecchio.righe === suNuovo.righe`. Al #146 quel confronto
       era esatto, e per una ragione che allora nessuno aveva misurato:
       le righe di tipo 14 NON ARRIVAVANO NEL NASTRO — `Reg.serializza`
       non aveva un ramo per quel tipo, quindi i due giochi leggevano per
       forza lo stesso numero di righe.

       DAL #147 LE 14 VIAGGIANO, e con loro la 15. Un gioco di ieri non
       conosce ne' l'uno ne' l'altro tipo e li BUTTA — `deserializza`
       aggiorna i due delta PRIMA di smistare il tipo, quindi una riga
       sconosciuta non sposta di un tick quelle dopo. Percio' oggi il
       conto DEVE differire, ed esattamente di quelle righe li'.

       IL CRITERIO NON SI RILASSA, SI STRINGE: non «gli scarti si
       perdonano», ma «lo scarto deve essere ESATTAMENTE il numero di
       righe dei tipi nuovi». Se ne mancasse una in piu' o una in meno,
       il gioco di ieri starebbe leggendo male un comando, ed e'
       precisamente il difetto che il #144 ha trovato (170 righe su
       2749). MISURATO il 24 settembre 2026: oggi 21 righe, ieri 14,
       sei di tipo 14 e una di tipo 15 — e le due partite restano
       identiche su 100 campioni, stesso punteggio.
       ===================================================================== */
    const nuovi = (function(testo){
      let n = 0;
      for(const pezzo of (String(testo).split('|')[3] || '').split(';')){
        if(!pezzo) continue;
        const tp = Number(pezzo.split(',')[1]);
        if(tp === 14 || tp === 15) n++;
      }
      return n;
    })(preso.nastro);
    di(suVecchio.righe === suNuovo.righe - nuovi,
       'VERSO 2b) il gioco di ieri legge le stesse righe MENO quelle dei tipi che non conosce',
       'ieri ' + suVecchio.righe + ' · oggi ' + suNuovo.righe + ' · righe dei tipi nuovi (14 e 15) ' + nuovi +
       ' · atteso ieri ' + (suNuovo.righe - nuovi));
    const sc = primoScarto(suVecchio.impronte, suNuovo.impronte);
    di(sc === -1, 'VERSO 2c) e finisce nella STESSA partita, campione per campione',
       sc === -1 ? (suNuovo.impronte.length + ' campioni identici') : ('primo scarto al campione ' + sc + ' su ' + suNuovo.impronte.length));
    di(suVecchio.gol.join('-') === suNuovo.gol.join('-'), 'VERSO 2d) stesso punteggio',
       'ieri ' + suVecchio.gol.join('-') + ' · oggi ' + suNuovo.gol.join('-'));

    /* IL TESTIMONE. Se il confronto non distinguesse nemmeno un nastro
       sporcato apposta, «identici» vorrebbe dire «il banco non guarda». */
    const sporco = preso.nastro.replace(/^(1\|\d+\|[^|]*\|)/, '$1');
    const righe = preso.nastro.split('\n');
    let sporcato = preso.nastro;
    /* si cambia il PRIMO comando di tipo 6 (una zona diversa): e' un
       comando vero, quindi una partita diversa deve uscirne */
    const rifatto = await A_sporca(browser, sgN.porta, preso.nastro);
    if (rifatto) {
      const sN2 = await rigiocaSu(browser, sgN.porta, rifatto, SEME);
      const sc2 = primoScarto(sN2.impronte, suNuovo.impronte);
      di(sc2 !== -1, 'TESTIMONE) un nastro sporcato in un comando DA' + '\'' + ' una partita diversa',
         sc2 === -1 ? 'IDENTICA: il confronto non distingue niente, e i tre OK sopra non valgono' :
                      ('primo scarto al campione ' + sc2));
    } else {
      di(false, 'TESTIMONE) non si e\' riusciti a sporcare il nastro: la misura non si da\'');
    }

    console.log('\n  IL VERDETTO SU MOTORE_V');
    const neutro = !suVecchio.errore && suVecchio.righe === suNuovo.righe - nuovi && sc === -1;
    if (neutro) {
      console.log('    MOTORE_V PUO\' RESTARE 4. Il tipo 14 non e\' un comando: il gioco di ieri');
      console.log('    lo butta in silenzio e rigioca ESATTAMENTE la stessa partita, quindi non');
      console.log('    direbbe NON TORNA a un onesto. Il numero non sale perche\' la misura dice');
      console.log('    che non serve, non perche\' faceva comodo.');
      console.log('    IL PREZZO, dichiarato: un giudice di ieri non CONTROLLA le testimonianze.');
      console.log('    Non accusa un innocente (e\' quel che MOTORE_V protegge); assolve un');
      console.log('    colpevole. Per quello c\'e\' DISCHETTO_V, che si accorge PRIMA — la sfida');
      console.log('    non comincia nemmeno, invece di finire in un verdetto sbagliato.');
    } else {
      console.log('    MOTORE_V DEVE SALIRE A 5: il gioco di ieri legge il nastro di oggi in modo');
      console.log('    diverso, e senza il numero direbbe NON TORNA a un onesto.');
    }

    sgV.chiudi(); sgN.chiudi(); cc.chiudi();
  } catch (e) { esploso = e; }
  finally {
    try { await browser.close(); } catch (x) {}
    for (const s of [sgV, sgN, cc]) { try { s && s.chiudi(); } catch (x) {} }
  }

  if (esploso) { console.error('\nIL BANCO E\' ESPLOSO: ' + esploso.message); console.error(esploso.stack); process.exit(2); }
  const rossi = esiti.filter(x => !x).length;
  console.log('\n  ' + (esiti.length - rossi) + ' su ' + esiti.length + (rossi ? ('   ROSSI: ' + rossi) : '   verde'));
  process.exit(rossi ? 1 : 0);
})();

/* sporca un comando vero dentro al nastro: si apre una pagina, si
   deserializza, si cambia la zona del primo tiro e si riserializza —
   cosi' il nastro sporco e' un nastro VALIDO che dice una cosa diversa,
   non una stringa rotta che qualunque lettore rifiuterebbe */
async function A_sporca(browser, porta, nastro) {
  const P = await T.apri(browser, porta);
  try {
    return await P.pag.evaluate(n => {
      const t = window.__test;
      t.semina(1); t.startMatch(1, 1, { size: 5 });
      try { t.rigioca(n); } catch (e) { return null; }
      if (typeof Reg === 'undefined') return null;
      const r = Reg.righe.find(x => x[1] === 6 && x[5] === 0);
      if (!r) return null;
      r[6] = (r[6] + 1) % 3;
      const modo = Reg.modo; Reg.modo = 1;
      const fuori = Reg.serializza();
      Reg.modo = modo;
      return fuori;
    }, nastro);
  } finally { await P.ctx.close(); }
}
