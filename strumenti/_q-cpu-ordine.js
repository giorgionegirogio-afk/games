/* =====================================================================
   _q-cpu-ordine.js -- LA RETE CHE COGLIE IL PROSSIMO BANCO ROTTO
   (voce #121, compito 3, seguito #108).

   IL PERCHE'. L'artefatto #108: `startMatch` riscrive
   `G.cpu=[false, G.mode===2?false:true]` INCONDIZIONATAMENTE
   (CALCETTO-il-gioco.html:10953). Un `setCpuVsCpu(true)` chiamato
   PRIMA di `startMatch` viene annullato in silenzio -- la squadra 0
   resta "umana immobile", non batte le punizioni, e una partita
   CPU-CPU intera si incastra nella scena 'freekick' (diagnosi #119).
   I compiti 1 e 2 di questo cantiere hanno corretto l'ordine nei tre
   banchi di batteria che lo sbagliavano (_q-battute, _q-regole,
   _q-umore) -- ma _q-umore era nato rotto DOPO il censimento originale
   di #108, e nessuno se n'e' accorto finche' non ha causato l'hang
   #119. Un censimento e' una fotografia: non vede quel che nasce
   dopo. Questo banco e' la rete che coglie il PROSSIMO, invece del
   censimento del passato -- misura il COMPORTAMENTO del gioco
   sull'ordine delle due chiamate, non l'elenco dei banchi noti.

   DUE PROVE, sullo stesso gioco (CALCETTO-il-gioco.html):

   1. ORDINE-GIUSTO (deve essere VERDE -- e' il contratto che ogni
      banco CPU-CPU deve rispettare, lo stesso di posaFerma in
      _posa.js): `t.semina(seme); t.startMatch(1,1,{size:5});
      t.setCpuVsCpu(true);` -- setCpuVsCpu DOPO startMatch. Si
      verifica che G.cpu risulti [true,true] (non solo cpu[0]), poi si
      guida la partita fotogramma per fotogramma (t.simulate(1/60))
      fino a t.state==='end' o al tetto di sicurezza TETTO_FOTOGRAMMI
      (18000 fotogrammi/300s, IMPORTATO da _q-invarianti.js -- voce
      #127 compito 2): la partita DEVE raggiungere
      'end' entro il tetto, senza restare incastrata in 'freekick'
      (il sintomo #108/#119). Raggiungere 'end' entro il tetto e non
      restare bloccata sono la STESSA misura: se la scena restasse
      incollata a 'freekick', il tetto scadrebbe prima di 'end' e lo
      stato finale letto sarebbe 'freekick', non 'end' -- lo stato
      finale si stampa sempre, cosi' un futuro blocco su un'ALTRA scena
      si leggerebbe comunque a occhio.

   2. ORDINE-SBAGLIATO (CONTROLLO DISCRIMINANTE -- non un contratto da
      rispettare, una CONDANNA dell'ordine sbagliato):
      `t.semina(seme); t.setCpuVsCpu(true); t.startMatch(1,1,{size:5});`
      -- setCpuVsCpu PRIMA di startMatch. startMatch riscrive
      G.cpu=[false,...] incondizionatamente, quindi l'intento appena
      espresso da setCpuVsCpu viene annullato in silenzio: G.cpu[0]
      deve risultare false. VERDE QUI significa che L'ARTEFATTO #108
      ESISTE ANCORA NEL GIOCO -- quindi l'ordine giusto (prova 1) resta
      OBBLIGATORIO per chi scrive un banco CPU-CPU nuovo. Se un domani
      il gioco venisse reso a-prova-d'ordine (la cura lato-gioco gia'
      proposta in MANUALE:870-875, che il committente NON ha scelto in
      questo cantiere -- vedi
      docs/superpowers/specs/2026-09-19-pulizia-108-design.md), questa
      prova diventerebbe ROSSA: ed e' il segnale GIUSTO, non un guasto
      di questo banco -- vorrebbe dire che la premessa "l'ordine conta"
      e' cambiata e va riverificata da chi tocchera' questo file allora.

   LA PROVA 2 NON E' UNA TAUTOLOGIA. Dimostra che la prova 1 misura
   qualcosa di reale: l'ordine SBAGLIATO produce davvero
   G.cpu[0]===false sul gioco di oggi. Se la prova 2 fosse rossa (
   l'ordine sbagliato smettesse di fare danno), la prova 1 da sola
   dimostrerebbe che l'ordine giusto e' SUFFICIENTE, non che sia
   NECESSARIO -- ed e' esattamente la distinzione che una prova
   anti-regressione onesta deve dichiarare, non nascondere.

   PERCHE' NON BASTA IL CENSIMENTO. Il censimento di #108 (~22 file
   d'archivio + i tre banchi corretti da questo cantiere) e' un elenco
   chiuso: dice "questi file sbagliavano l'ordine", non "l'ordine
   conta ancora". Questo banco non elenca file -- interroga il gioco
   direttamente, sullo stesso schema in ENTRAMBE le direzioni, ogni
   volta che gira in batteria: nessun quarto banco puo' nascere rotto
   senza che la prova 1 lo veda (se un domani _q-cpu-ordine stesso
   sbagliasse l'ordine, sarebbe la prova 1 a dirlo, non un revisore a
   contarlo a mano).

   IL SEME: 20260919 (la data del piano d'esecuzione del cantiere, voce
   #121), default del flag --seme, installato con semeFisso() di
   _posa.js -- lo stesso telaio di casa di _q-battute.js/_q-regole.js/
   _q-umore.js. ZERO dado()/SEME propri in questo file: ogni semina
   passa da semeFisso.

   uso:  node strumenti/_q-cpu-ordine.js
         node strumenti/_q-cpu-ordine.js --gioco fuori/qualcosa.html
         node strumenti/_q-cpu-ordine.js --taglia 5 --seme 20260919
   esce 0 se le due prove sono nello stato atteso (1 verde come
   contratto, 2 verde come condanna), 1 se una prova e' rossa, 2 se il
   banco stesso e' esploso (pagina, hook mancante, eccezione), 3 se
   l'uso e' sbagliato.
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { semeFisso } = require('./_posa.js');
/* TETTO_FOTOGRAMMI -- IMPORTATO (voce #127, onda C -- 3, compito 2, 20
   settembre 2026), NON PIU' UNA COPIA LOCALE. Fino a questo compito
   questo file teneva un proprio "const TETTO_FOTOGRAMMI = 13200" scritto
   a mano, mai importato da _q-invarianti.js -- nonostante il refactor
   #126 avesse gia' esportato la stessa costante e _q-fuzzer.js/
   _q-soak.js la importassero gia' da allora: un secondo numero magico
   duplicato per la STESSA cosa, scoperto mentre si ricalibrava il tetto
   per il rigore a oltranza (vedi _q-invarianti.js per il perche' del
   nuovo valore -- questo file non ha bisogno di saperlo, gli basta
   importarlo). Corretto qui: un'unica fonte, come gli altri due banchi. */
const { TETTO_FOTOGRAMMI } = require('./_q-invarianti.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('uso: node strumenti/_q-cpu-ordine.js [--gioco file.html] [--taglia 5] [--seme N]');
  process.exit(3);
}

const SEME_CANTIERE = 20260919;   // la data del piano d'esecuzione del cantiere (voce #121), default del flag --seme
const TAGLIA_BANCO = +arg('taglia', 5);
const SEME = +arg('seme', SEME_CANTIERE);
/* TETTO_FOTOGRAMMI e' importato (vedi la nota accanto al require, in
   testa al file): 18000 fotogrammi/300s da voce #127 compito 2, ben
   oltre la durata di una qualunque amichevole vera E oltre il caso
   peggiore del rigore a oltranza -- non piu' un numero locale. */

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
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
  const provaRel = arg('gioco', '');
  const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== LA RETE CHE COGLIE IL PROSSIMO BANCO ROTTO (voce #121, seguito #108) ===  ' +
              (provaAbs || 'CALCETTO-il-gioco.html (repo)') + '  taglia ' + TAGLIA_BANCO + '  seme ' + SEME);

  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(({ seme }) => {
      const t = window.__test;
      t.semina(seme);
      t.dismissSplash && t.dismissSplash();
      if (t.save) t.save.tutorialDone = 1;
    }, { seme: SEME });

    /* ===================================================================
       PROVA 1 -- ORDINE-GIUSTO. setCpuVsCpu(true) DOPO startMatch: il
       contratto che ogni banco CPU-CPU deve rispettare (vedi posaFerma
       in _posa.js, il modello di casa, e il commento aggiunto li' da
       questo stesso compito). Tutto in un solo page.evaluate, come gli
       altri banchi di casa: la partita gira fotogramma per fotogramma
       fino a 'end' o al tetto, senza rumore di rete in mezzo. */
    const rGiusto = await pag.evaluate(({ taglia, seme, tetto }) => {
      const t = window.__test;
      t.semina(seme);
      t.startMatch(1, 1, { size: taglia });
      t.setCpuVsCpu(true);
      const cpuSubito = t.G.cpu.slice();

      let fotogrammi = 0;
      for (; fotogrammi < tetto && t.state !== 'end'; fotogrammi++) {
        t.simulate(1 / 60);
      }
      const statoFinale = t.state;
      return { cpuSubito, fotogrammi, statoFinale, raggiuntoEnd: statoFinale === 'end' };
    }, { taglia: TAGLIA_BANCO, seme: SEME, tetto: TETTO_FOTOGRAMMI });

    const cpuOk = Array.isArray(rGiusto.cpuSubito) && rGiusto.cpuSubito[0] === true && rGiusto.cpuSubito[1] === true;
    di(cpuOk, '1a. ORDINE-GIUSTO -- dopo startMatch poi setCpuVsCpu(true), G.cpu e\' [true,true]',
      'G.cpu=' + JSON.stringify(rGiusto.cpuSubito));

    di(rGiusto.raggiuntoEnd, '1b. ORDINE-GIUSTO -- una partita CPU-CPU a seme fisso raggiunge \'end\' entro ' + TETTO_FOTOGRAMMI + ' fotogrammi, senza restare bloccata',
      'fotogrammi simulati: ' + rGiusto.fotogrammi + '  stato finale: \'' + rGiusto.statoFinale + '\'' +
      (rGiusto.raggiuntoEnd ? '' : '  -- NON ha raggiunto \'end\' entro il tetto (sintomo #108/#119 se lo stato e\' \'freekick\')'));

    /* ===================================================================
       PROVA 2 -- ORDINE-SBAGLIATO (controllo discriminante). Si
       risemina per ripartire da uno stato pulito (stesso seme della
       prova 1: qui non si simula nessun fotogramma, la semina serve
       solo a rendere deterministico setTaglia/startMatch). setCpuVsCpu
       (true) PRIMA di startMatch: l'artefatto #108. */
    const rSbagliato = await pag.evaluate(({ taglia, seme }) => {
      const t = window.__test;
      t.semina(seme);
      t.setCpuVsCpu(true);
      t.startMatch(1, 1, { size: taglia });
      return { cpuDopo: t.G.cpu.slice() };
    }, { taglia: TAGLIA_BANCO, seme: SEME });

    const artefattoPresente = Array.isArray(rSbagliato.cpuDopo) && rSbagliato.cpuDopo[0] === false;
    di(artefattoPresente, '2. ORDINE-SBAGLIATO (controllo discriminante) -- setCpuVsCpu(true) PRIMA di startMatch viene annullato: G.cpu[0]===false',
      'G.cpu=' + JSON.stringify(rSbagliato.cpuDopo) +
      (artefattoPresente
        ? '  -- l\'artefatto #108 esiste ancora nel gioco: l\'ordine giusto (prova 1) resta obbligatorio nei banchi CPU-CPU'
        : '  -- ATTENZIONE: l\'artefatto #108 non sembra piu\' presente. Il gioco potrebbe essere stato reso a-prova-d\'ordine: la premessa di questo banco va riverificata (vedi il cappello del file) prima di dichiarare questa prova un guasto'));

    if (ecc.length) { di(false, 'BANCO -- nessuna eccezione di pagina', 'eccezione: ' + ecc[0]); }
  } catch (e) {
    console.error('FALLITO: ' + e.message);
    await browser.close(); srv.chiudi();
    process.exit(2);
  }

  await ctx.close(); await browser.close(); srv.chiudi();
  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' -- ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  process.exit(rossi ? 1 : 0);
})();
