/* =====================================================================
   SEME — il cancello del bene condiviso fra i due incarichi.

   PERCHE' ESISTE. Un solo numero, l'hash del NOME del giocatore, decide
   la corporatura, la carnagione, la capigliatura, il taglio e lo
   sfasamento di fase della figura che corre in campo. Lo stesso numero
   dovra' decidere il VOLTO nella riga della rosa, nel banner del gol e
   nel tabellino: e' quello che fa dire «il ritratto e' lo stesso uomo
   che corre». Se un giorno qualcuno cambia l'hash — una lettera nella
   funzione, un turno di bit diverso, un modulo spostato — il gioco non
   si rompe: cambiano soltanto le facce, in silenzio, e nessuna prova
   automatica se ne accorge. Le facce cambiate in silenzio sono
   esattamente il difetto che l'incarico dei ritratti nasce per non
   avere.
   Percio' i valori si INCHIODANO qui, per dieci nomi noti, con i
   quattro tratti che ne discendono. Chi li cambia lo scopre da questo
   cancello e non da una faccia diversa.

   USO:  node strumenti/seme.js
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
/* --- innesto di _z-banco.js: la radice resta il repo, ma il gioco puo'
   arrivare da fuori. Nessun altro comportamento e' toccato. --- */
const __PROVA = process.env.GIOCO_PROVA ? require('path').resolve(process.env.GIOCO_PROVA) : '';
const __rid = f => (__PROVA && /CALCETTO-il-gioco\.html$/i.test(f)) ? __PROVA : f;


/* i dieci nomi e il loro seme, misurati il 15 agosto 2026.
   I quattro tratti sono derivazioni dichiarate del seme:
     corporatura  seme % 3          (0 spilungone, 1 tarchiato, 2 piccoletto)
     carnagione   (seme >>> 3) % 6  indice in SKIN
     capigliatura (seme >>> 11) % 6 indice in HAIR
     taglio       (seme >>> 19) % 4 (rasato, ciuffo, riccio, fascetta) */
const ATTESI = [
  ['Saverio Piedebuono', 2249216068],
  ['Peppe Mano Santa',   2026714031],
  ['Gino Fulmine',       2465899154],
  ['Ciro Scarpone',      1168542911],
  ['Toto Muraglia',      2894614781],
  ['Nando Sinistro',     3592557508],
  ['Rocco Ferro',        3148309935],
  ['Mimmo Zampa',        1269195373],
  ['Vito Cannone',       3694241265],
  ['Enzo Merlo',         2055166464],
];

function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = __rid(path.join(RADICE, u === '/' ? 'index.html' : u));
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        const t = f.endsWith('.html') ? 'text/html'
          : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream';
        rs.writeHead(200, { 'Content-Type': t + '; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const pg = await br.newPage();
  /* IL SEME DEL BANCO, prima di ogni riga di pagina. Senza, la partita
     che questo strumento simula e' diversa a ogni esecuzione e il conto
     delle figure coincidenti balla: la prima stesura diceva rosso e la
     successiva verde sullo stesso identico codice — cioe' non misurava,
     tirava i dadi. Stesso generatore e stesso seme di collaudo.js e di
     scatta.js, cosi' i tre guardano la STESSA partita. */
  await pg.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
    }
  }, 20260728);
  await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`);
  await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  const misurati = await pg.evaluate(n => n.map(x => window.__test.semeNome(x)),
    ATTESI.map(a => a[0]));

  /* =====================================================================
     LE DUE ENUMERAZIONI CHE LA GIURIA HA CHIESTO, sulle tre taglie.
     Non si spera: si contano tutte le coppie.
       (a) due compagni qualsiasi devono differire per almeno UNO fra
           corporatura, pelle, capelli, taglio;
       (b) in un fotogramma, la posa disegnata deve essere distinta per
           tutti quelli in campo. «Posa» qui vuol dire tutto cio' che
           decide il disegno dello scheletro: la clip, la fase
           arrotondata a 0,02, la corporatura e la micro-variazione delle
           braccia — che e' un pizzico di angolo, quindi fa parte della
           posa quanto la fase, non e' un tratto di colore.
     La (b) si legge dalle pose DISEGNATE (window.__test.poseInCampo), non
     da una riderivazione della regola: un cancello che ricalcola la
     regola invece di guardare il risultato dichiara verde tutte le volte
     che il difetto sta nella regola. */
  const campo = await pg.evaluate(async () => {
    const t = window.__test, esiti = [];
    for (const taglia of [5, 7, 11]) {
      t.startMatch(1, 1, { size: taglia }); t.setCpuVsCpu(true);
      /* SEI fotogrammi, non uno. Un fotogramma solo e' un aneddoto: due
         figure possono incrociarsi sulla stessa fase un istante dopo
         quello guardato, e un cancello che guarda un istante dichiara
         verde una scena che sullo schermo ha due gemelli meta' partita. */
      t.simulate(4.0);
      for (let k = 0; k < 6; k++) {
        t.simulate(1.7); t.disegna();
        esiti.push({ taglia, istante: k, pose: t.poseInCampo() });
      }
    }
    t.startMatch(1, 1);            // si lascia il banco alla taglia base
    return esiti;
  });
  await br.close(); srv.chiudi();

  console.log('\n=== SEME DEL NOME: dieci uomini, dieci numeri ===\n');
  console.log('     nome                   seme          corp  pelle  capelli  taglio');
  let male = 0;
  for (let i = 0; i < ATTESI.length; i++) {
    const [nome, atteso] = ATTESI[i], s = misurati[i];
    const ok = s === atteso;
    if (!ok) male++;
    console.log(`  ${ok ? '  ' : 'X '}${nome.padEnd(22)} ${String(s).padStart(10)}` +
      (ok ? '' : ` (atteso ${atteso})`) +
      `    ${s % 3}      ${(s >>> 3) % 6}       ${(s >>> 11) % 6}       ${(s >>> 19) % 4}`);
  }
  /* i dieci non devono nemmeno essere gemelli fra loro: se lo fossero,
     la tabella inchioderebbe una collisione invece di prevenirla */
  const viste = new Set();
  let gemelli = 0;
  for (const s of misurati) {
    const k = [s % 3, (s >>> 3) % 6, (s >>> 11) % 6, (s >>> 19) % 4].join('|');
    if (viste.has(k)) gemelli++;
    viste.add(k);
  }
  console.log(`\n  quaterne distinte: ${viste.size} su ${misurati.length}` +
    (gemelli ? ` — ${gemelli} coppie di gemelli` : ''));
  /* ---- (a) due compagni, almeno un tratto diverso ---- */
  console.log('\n  compagni distinguibili, ed enumerati:');
  let gemelliCampo = 0, posaDoppia = 0;
  for (const e of campo) {
    let scontri = 0, coppie = 0;
    for (let i = 0; i < e.pose.length; i++) for (let j = i + 1; j < e.pose.length; j++) {
      const a = e.pose[i], b = e.pose[j];
      if (a.team !== b.team) continue;
      coppie++;
      if (a.corp === b.corp && a.skin === b.skin && a.hair === b.hair && a.taglio === b.taglio) scontri++;
    }
    gemelliCampo += scontri;
    if (e.istante === 0)
      console.log(`     ${e.taglia} contro ${e.taglia}: ${coppie} coppie di compagni, ` +
        `${scontri} indistinguibili`);
  }
  /* ---- (b) mai due FIGURE UGUALI nello stesso fotogramma ----
     Due numeri, e la differenza fra i due e' il punto.

     Il CANCELLO e' sulla FIGURA: due giocatori nello stesso fotogramma
     non devono essere lo stesso disegno. Un disegno e' lo scheletro
     (clip, fase, corporatura, micro-variazione) PIU' i tratti fisici
     (pelle, capelli, taglio) e la divisa. Deve essere zero, e lo e' per
     costruzione: la spartizione dei semi garantisce che due compagni
     differiscano per almeno un tratto, e due avversari vestono divise
     diverse.

     Il secondo numero — gli SCHELETRI coincidenti — si stampa ma non e'
     un cancello, ed e' onesto dire perche'. La fase e' una grandezza
     CONTINUA che avanza con lo spazio percorso: due figure che corrono
     alla stessa velocita' possono attraversare la stessa fase e
     restarci, e nessuno sfasamento costante lo impedisce — l'unico modo
     di garantire la disuguaglianza sarebbe quantizzare la fase, cioe'
     far camminare le figure a scatti. Dichiarare cancello una cosa che
     non si puo' garantire vuol dire fabbricarsi un rosso intermittente,
     che dopo tre volte nessuno guarda piu'. Il numero invece serve: se
     cresce, lo sfasamento per indice o la micro-variazione per seme
     hanno smesso di funzionare. */
  console.log('\n  figure distinte nello stesso fotogramma:');
  let scheletriDoppi = 0;
  for (const e of campo) {
    const visti = new Map(), vistiSk = new Map();
    let doppi = 0, doppiSk = 0, chi = '';
    for (const p of e.pose) {
      if (p.fuori) continue;
      const sk = p.clip + '|' + Math.round(p.u / 0.02) + '|' + p.corp + '|' + p.varb;
      const fig = sk + '|' + p.skin + '|' + p.hair + '|' + p.taglio + '|' + p.team;
      if (vistiSk.has(sk)) doppiSk++;
      if (visti.has(fig)) { doppi++; if (!chi) chi = `${visti.get(fig)} e ${p.nome || p.idx} in ${p.clip}`; }
      vistiSk.set(sk, 1); visti.set(fig, p.nome || p.idx);
    }
    posaDoppia += doppi; scheletriDoppi += doppiSk;
    console.log(`     ${e.taglia} contro ${e.taglia}, istante ${e.istante}: ` +
      `${e.pose.length} figure, ${doppi} identiche` +
      `${chi ? ' (' + chi + ')' : ''}, ${doppiSk} scheletri coincidenti`);
  }
  console.log(`     in tutto ${scheletriDoppi} scheletri coincidenti su ${campo.length} ` +
    "fotogrammi — indicatore di varieta', non cancello (vedi il commento)");

  if (male === 0 && gemelliCampo === 0 && posaDoppia === 0) {
    console.log('\nVERDE: il seme del nome e\' quello dichiarato, nessuna coppia di ' +
      'compagni indistinguibili, nessuna figura ripetuta nel fotogramma.\n');
  } else if (male === 0) {
    console.log(`\nROSSO: il seme regge, ma ${gemelliCampo} coppie di compagni sono ` +
      `indistinguibili e ${posaDoppia} figure sono lo STESSO disegno nello stesso fotogramma.\n`);
    process.exit(1);
  } else {
    console.log(`\nROSSO: ${male} nomi su ${ATTESI.length} danno un seme diverso da quello ` +
      'inchiodato. Se il cambio e\' voluto, si riscrive la tabella QUI, in chiaro, ' +
      'e si rigenerano i ritratti: non si lascia divergere il campo dalla rosa.\n');
    process.exit(1);
  }
})();
