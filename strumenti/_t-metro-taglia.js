/* =====================================================================
   _t-metro-taglia.js -- IL TEST CHE NASCE ROSSO SUL FALSO POSITIVO
   (voce #130, compito 1, mandato S13.3: "ogni bug ha prima un test
   fallito").

   IL DIFETTO. Il verbale #129 dichiarava "seme 20260924 a taglia 11
   bloccato in freekick a 18000 fotogrammi, PRE-ESISTENTE, difetto di
   gioco". MISURATO DI NUOVO (fuori/_misura-seme-20260924.js): la
   partita NON e' bloccata, raggiunge 'end' al fotogramma ~19502 (325s)
   con punteggio 2-1, dopo una serie a rigori. Il rosso era il TETTO
   flat (TETTO_FOTOGRAMMI=18000, tarato sul caso peggiore di TAGLIA 5)
   applicato a una taglia dove la partita di regolamento dura gia' 180s
   invece di 90s -- non un difetto del gioco.

   QUESTO TEST. Gioca il seme 20260924 a taglia 11 (ordine giusto:
   startMatch poi setCpuVsCpu) fino a 'end' (tetto locale largo, 40000
   fotogrammi, solo per non girare all'infinito su una vera regressione
   futura), poi confronta la durata osservata:
     A) contro il TETTO FLAT storico (TETTO_FOTOGRAMMI, 18000 a taglia 5,
        importato invariato per backcompat) -- CI SI ASPETTA che la
        durata lo superi: e' la controprova che il numero flat, se
        applicato a 11, condannerebbe questa partita sana. Non e' un
        cancello che deve restare verde: e' la fotografia del difetto.
     B) contro tettoFotogrammi(11) (la cura di questo compito) -- QUESTO
        e' il cancello vero: la durata NON deve superarlo.

   PRIMA della cura, tettoFotogrammi non esiste ancora in
   _q-invarianti.js: il controllo B esce ROSSO per assenza della
   funzione (dichiarato, non un'eccezione muta). DOPO la cura, B e'
   VERDE: il falso positivo sparisce senza nascondere un hang vero (quel
   controllo resta compito di _q-soak.js --bugiardo durata, non di
   questo file).

   uso: node strumenti/_t-metro-taglia.js
   esce 0 se la cura e' applicata e la partita rientra nel tetto per
   taglia, 1 se la cura manca o non basta, 2 se il banco esplode.
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { semeFisso } = require('./_posa.js');
const invarianti = require('./_q-invarianti.js');

const RADICE = path.resolve(__dirname, '..');
const SEME = 20260924, TAGLIA = 11, TETTO_LOCALE = 40000;

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

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '\n         ' + det : '')); };

(async () => {
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));

  console.log('=== IL METRO PRIMA DEL GIUDICE -- test-condanna (voce #130) ===');
  console.log('    seme ' + SEME + ', taglia ' + TAGLIA + ', tetto locale ' + TETTO_LOCALE);

  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => {
      const t = window.__test;
      t.dismissSplash && t.dismissSplash();
      if (t.save) t.save.tutorialDone = 1;
    });

    const r = await pag.evaluate(({ seme, taglia, tetto }) => {
      const t = window.__test;
      t.semina(seme);
      if (t.save && typeof window.nuovaRosa === 'function') t.save.rosa = window.nuovaRosa();
      t.startMatch(1, 1, { size: taglia });
      t.setCpuVsCpu(true);
      const G = t.G;
      let fotogrammi = 0;
      for (; fotogrammi < tetto; fotogrammi++) {
        t.simulate(1 / 60);
        if (t.state === 'end') { fotogrammi++; break; }
      }
      return { fotogrammi, statoFinale: t.state, punteggio: G.score.slice(), rigori: !!G.rigori };
    }, { seme: SEME, taglia: TAGLIA, tetto: TETTO_LOCALE });

    console.log('  MISURATO: ' + r.fotogrammi + ' fotogrammi (' + (r.fotogrammi / 60).toFixed(1) +
      's), stato finale \'' + r.statoFinale + '\', punteggio ' + r.punteggio.join('-') + ', rigori=' + r.rigori);

    di(r.statoFinale === 'end', 'la partita raggiunge \'end\' (NON e\' bloccata in freekick, contrariamente al verbale #129)',
      'stato finale \'' + r.statoFinale + '\'');

    /* A) IL TETTO FLAT STORICO -- deve essere superato: e' la fotografia
       del difetto, non un cancello che deve restare verde. */
    const TETTO_FLAT = invarianti.TETTO_FOTOGRAMMI;
    const sforaFlat = r.fotogrammi > TETTO_FLAT;
    di(sforaFlat, 'A) IL TETTO FLAT (' + TETTO_FLAT + ', tarato su taglia 5) e\' sforato da questa partita sana a taglia 11',
      r.fotogrammi + ' > ' + TETTO_FLAT + ' -- un banco che usasse il tetto flat a taglia 11 la condannerebbe come falso positivo');

    /* B) IL CANCELLO VERO -- tettoFotogrammi deve esistere e coprire
       questa partita. */
    if (typeof invarianti.tettoFotogrammi !== 'function') {
      di(false, 'B) tettoFotogrammi(taglia) esiste in _q-invarianti.js',
        'LA CURA NON E\' ANCORA APPLICATA: _q-invarianti.js esporta solo TETTO_FOTOGRAMMI (costante flat)');
    } else {
      const tettoPerTaglia = invarianti.tettoFotogrammi(TAGLIA);
      const dentro = r.fotogrammi <= tettoPerTaglia;
      di(dentro, 'B) tettoFotogrammi(11)=' + tettoPerTaglia + ' copre la partita (IL CANCELLO VERO)',
        r.fotogrammi + ' <= ' + tettoPerTaglia + (dentro ? '' : ' -- IL TETTO PER TAGLIA NON BASTA ANCORA'));
    }

    if (ecc.length) di(false, 'BANCO -- nessuna eccezione di pagina', 'eccezione: ' + ecc[0]);
  } catch (e) {
    console.error('FALLITO (banco): ' + e.message);
    await browser.close(); srv.chiudi();
    process.exit(2);
  }

  await ctx.close(); await browser.close(); srv.chiudi();
  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' -- ' + (rossi ? 'ROSSO (la cura manca o non basta)' : 'VERDE (la cura c\'e\' e basta)'));
  process.exit(rossi ? 1 : 0);
})();
