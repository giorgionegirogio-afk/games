/* =====================================================================
   _eventi.js — QUANTO SUCCEDE, in novanta secondi.

   PERCHE' ESISTE. Fino a oggi tutti gli strumenti di questa cartella
   misurano l'IMMAGINE: il contrasto della maglia sul manto, la
   temperatura del prato, la posa delle figure, il tempo di avvio, il
   costo di un fotogramma. Nessuno misura il GIOCO. La giuria ha votato
   6,2 su una frase sola — «la partita non produce abbastanza eventi:
   due tiri contro uno, e la sensazione e' di aver guardato» — e quella
   frase veniva da un tabellino, cioe' da un campione di uno.

   Questo strumento conta, su N partite CPU contro CPU a semi dichiarati,
   le cose che fanno alzare gli occhi: tiri, tiri nello specchio, parate
   (prese e respinte separate, perche' la respinta genera la ribattuta),
   legni, muri di corpo, contrasti, palloni vaganti contesi, cambi di
   possesso, gol, e il tempo in cui la palla non e' di nessuno.
   Stampa mediana, quartili ed estremi. E' un METRO, non un cancello:
   non boccia niente, dice dove sta il gioco.

   COME NON MENTE, ed e' la parte che conta.
     1. IL CASO E' GOVERNATO. Math.random e' sostituito con xorshift32 a
        seme fisso prima che la pagina esegua una riga, e ri-seminato a
        ogni partita (stesso impianto di equita.js e scatta.js).
     2. IL CICLO DI DISEGNO E' SPENTO. La fisica avanza SOLO dentro
        __test.simulate, a blocchi, senza mai disegnare: cosi' la stessa
        partita esce identica a se stessa e vale mezzo secondo di banco.
     3. LA SONDA NON TOCCA IL CASO. Conta avvolgendo sei funzioni
        globali del gioco (step, updateBall, showBanner, startSlide,
        fireShot, hitWall) e leggendo G.stats. Nessun wrapper pesca un
        numero casuale, quindi la partita misurata e' esattamente la
        partita non misurata — ed e' l'autodiagnosi qui sotto a dirlo,
        non questa frase.
     4. AUTODIAGNOSI INCORPORATA. Alla fine lo strumento rigioca le
        prime partite su una pagina NUOVA con gli stessi semi e confronta
        il vettore di eventi voce per voce. Se anche una differisce, la
        misura non e' riproducibile e lo strumento lo DICE, uscendo con
        codice 1. Uno strumento che attesta invece di misurare e' peggio
        di nessuno strumento: qui il modo di accorgersene e' dentro.

   LA PRIMA FOTOGRAFIA, per chi verra' dopo (18 agosto 2026, 50 partite,
   CPU contro CPU, Normale, semi 20260803..852, mediane). E' il metro
   ancorato: se un giorno questi numeri non si riproducono piu' sulla
   stessa versione, e' lo strumento che si e' rotto, non il gioco.

                                    prima dell'onda   dopo _toppa-eventi
     tiri per partita                     11,0              10,0
     tiri che finiscono in porta           19%               ~45%
     parate                                1,0               3,0
       di cui respinte                     0,0               2,0
     legni (palo/traversa), media         0,40              0,96
     GOL nei 90 secondi, media            0,40              1,42
     partite 0-0 al 90'                    73%               20%
     partite decise ai rigori              67%               18%
     durata gioco vivo                 131,8 s            92,2 s
     MOMENTI DA PORTA al minuto           0,91              3,26
     EVENTI AL MINUTO (tutti)             56,5              57,1

   E la cosa che nessuno stava guardando: PRIMA, in cinquanta partite,
   ZERO reti su azione. Tutte le partite finivano 0-0 e si decidevano
   dal dischetto. Otto fermi immagine su otto a reti inviolate non erano
   sfortuna del campione: erano il gioco.

   IL 7 E L'11 SONO MESSI PEGGIO, e questa passata non li ha risolti
   (12 partite per taglia, mediane, prima -> dopo):
     7 contro 7    momenti da porta   0,8 -> 1,7    0-0 al 90'  92% -> 83%
     11 contro 11  momenti da porta   0,0 -> 0,0    0-0 al 90' 100% -> 100%
   Sull'11 contro 11 NON esiste un solo evento davanti alla porta: zero
   parate, zero legni, zero reti, ne' prima ne' dopo, con 8 tiri a
   partita. E' un difetto separato e piu' grave, e la causa non e' la
   stessa (la zona di tiro qui e' gia' tagliata a 500 unita' assolute
   dalla toppa, e i tiri partono). Chi lo prende in mano cominci da qui
   invece che da un'ipotesi: `--taglia 11`.

   uso:
     node strumenti/_eventi.js                          30 partite, seme 20260803
     node strumenti/_eventi.js --partite 40 --seme 7
     node strumenti/_eventi.js --gioco /fuori/prova.html --etichetta DOPO
     node strumenti/_eventi.js --json fuori/dopo.json   salva il crudo
     node strumenti/_eventi.js --contro fuori/prima.json   stampa il delta
     node strumenti/_eventi.js --diff 2                 difficolta' Duro
     node strumenti/_eventi.js --taglia 11              la partita 11 contro 11
     node strumenti/_eventi.js --confronta a.json b.json   due fotografie gia' prese
     node strumenti/_eventi.js --no-diagnosi            salta l'autodiagnosi
     node strumenti/_eventi.js --cancello               da metro a CANCELLO:
                                                        soglie di pavimento, uscita 0/1
   La variabile d'ambiente GIOCO_PROVA vale come --gioco.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* il server serve il repo; se e' dichiarato un gioco di prova, la
   richiesta del file di gioco va li' (stessa regola di _banco.js) */
function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if ((!f.startsWith(RADICE) && f !== prova) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* =====================================================================
   LA SONDA — vive dentro la pagina. Avvolge quattro funzioni globali del
   gioco e non pesca mai un numero casuale.

   PERCHE' SI PUO' AVVOLGERE. Il gioco e' uno <script> classico: le sue
   dichiarazioni `function nome(){}` di primo livello diventano PROPRIETA'
   dell'oggetto globale, e le chiamate interne le risolvono a ogni
   invocazione passando di li'. Riscrivere window.step cambia quindi anche
   lo step che chiama simulate(). Le `const` (G, DIFF, Audio5) non sono
   proprieta' del globale ma restano LEGGIBILI per nome: si leggono, non
   si toccano.

   COSA SIGNIFICA OGNI VOCE
     muri      un corpo si e' messo davanti a una cannonata (>420 u/s) e
               l'ha respinta senza prenderne il possesso. E' il contrasto
               che nel tabellino non compare mai e a schermo si vede.
     vaganti   intervalli in cui la palla non e' di nessuno per almeno un
               quinto di secondo CON un uomo per parte entro 90 unita':
               cioe' la corsa a chi arriva prima. Gli intervalli senza
               nessuno intorno (rinvio lungo, palla che rotola) non
               contano: non sono un evento, sono un trasferimento.
     cambi     quante volte il pallone passa da una squadra all'altra
               (si guarda il possesso vero, non il tocco).
     liberoP   percentuale del tempo di gioco in cui la palla non e' di
               nessuno. E' il termometro del caos.
   ===================================================================== */
const SONDA = `(() => {
  if (window.__ev) return 'gia-installata';
  const S = {};
  const azzera = () => {
    S.frames=0; S.liberoFrames=0; S.rimpalli=0; S.vaganti=0; S.intervalli=0;
    S.cambi=0; S.scivolate=0; S.banner={}; S.sponde=0;
    S._ultimoTeam=-1; S._liberoDa=-1; S._conteso=false;
    S._muroOra=false; S._spondaOra=false;
    S.golRegol=null; S.golden=false;
    /* dove finiscono i tiri: la domanda che nessuna statistica del gioco
       sa rispondere, perche' G.stats.inPorta conta l'INTENZIONE (la
       direzione chiesta a fireShot) e non l'esito. */
    S.esiti={gol:0,parata:0,legno:0,murato:0,sponda:0,raccolto:0,spento:0};
    S._tiro=null;
  };
  azzera();

  const _step = window.step;
  const _updateBall = window.updateBall;
  const _showBanner = window.showBanner;
  const _startSlide = window.startSlide;
  const _fireShot = window.fireShot;
  const _hitWall = window.hitWall;

  window.showBanner = function(t){ S.banner[t]=(S.banner[t]||0)+1; return _showBanner.apply(this, arguments); };
  window.startSlide = function(){ S.scivolate++; return _startSlide.apply(this, arguments); };
  window.hitWall = function(){ S.sponde++; S._spondaOra=true; return _hitWall.apply(this, arguments); };

  /* IL TIRO VIVO. Da fireShot fino al primo esito. Il pallonetto non
     entra: ha una traiettoria sua e si risolve con la quota. */
  window.fireShot = function(p,nx,ny,q,lob){
    const r=_fireShot.apply(this, arguments);
    if(!lob) S._tiro={t:0, team:p.team, gol0:G.score[0]+G.score[1],
                      par0:(G.stats.parate[0]|0)+(G.stats.parate[1]|0)};
    return r;
  };

  /* IL RIMPALLO SUL CORPO. La condizione e' esattamente quella del ramo
     di updateBall: palla senza padrone prima e dopo, ultimo tocco
     cambiato, velocita' in ingresso oltre 420. Il tiro al volo soddisfa
     le stesse tre e si distingue solo perche' incrementa G.stats.volee:
     e' l'unica ambiguita', ed e' chiusa a numeri. */
  window.updateBall = function(dt){
    const b=G.ball, own0=b.owner, lt0=b.lastTouch;
    const sp0=Math.sqrt(b.vx*b.vx+b.vy*b.vy);
    const vol0=(G.stats.volee[0]|0)+(G.stats.volee[1]|0);
    _updateBall.call(this, dt);
    const vol1=(G.stats.volee[0]|0)+(G.stats.volee[1]|0);
    if(own0<0 && b.owner<0 && b.lastTouch!==lt0 && sp0>420 && vol1===vol0){ S.rimpalli++; S._muroOra=true; }
  };

  window.step = function(){
    S._muroOra=false; S._spondaOra=false;
    const bn0={p:S.banner['PALO!']||0, t:S.banner['TRAVERSA!']||0, a:S.banner['ALTA!']||0};
    _step.apply(this, arguments);
    if(G.golden && !S.golden){ S.golden=true; S.golRegol=[G.score[0],G.score[1]]; }
    if(!(G.scene==='play'||G.scene==='golden')){
      /* la scena 'goal' chiude un tiro vivo: la rete e' arrivata */
      if(S._tiro && G.scene==='goal'){ S.esiti.gol++; S._tiro=null; }
      return;
    }
    S.frames++;
    const b=G.ball;

    /* --- esito del tiro vivo, al primo evento che lo chiude --- */
    if(S._tiro){
      const T=S._tiro; T.t++;
      const gol1=G.score[0]+G.score[1];
      const par1=(G.stats.parate[0]|0)+(G.stats.parate[1]|0);
      const legno=((S.banner['PALO!']||0)>bn0.p)||((S.banner['TRAVERSA!']||0)>bn0.t);
      if(gol1>T.gol0)            { S.esiti.gol++;      S._tiro=null; }
      else if(par1>T.par0)       { S.esiti.parata++;   S._tiro=null; }
      else if(legno)             { S.esiti.legno++;    S._tiro=null; }
      else if(S._muroOra)        { S.esiti.murato++;   S._tiro=null; }
      else if(S._spondaOra || (S.banner['ALTA!']||0)>bn0.a) { S.esiti.sponda++; S._tiro=null; }
      else if(b.owner>=0)        { S.esiti.raccolto++; S._tiro=null; }
      else if(T.t>6 && Math.sqrt(b.vx*b.vx+b.vy*b.vy)<150) { S.esiti.spento++; S._tiro=null; }
      else if(T.t>210)           { S.esiti.spento++;   S._tiro=null; }
    }

    if(b.owner>=0){
      const t=G.players[b.owner].team;
      if(S._ultimoTeam>=0 && t!==S._ultimoTeam) S.cambi++;
      S._ultimoTeam=t;
      if(S._liberoDa>=0){
        if(S.frames-S._liberoDa>=12 && S._conteso) S.vaganti++;
        S._liberoDa=-1; S._conteso=false;
      }
    }else{
      S.liberoFrames++;
      if(S._liberoDa<0){ S._liberoDa=S.frames; S.intervalli++; S._conteso=false; }
      if(!S._conteso){
        let a=false,c=false;
        for(const p of G.players){
          if(p.out>0) continue;
          const dx=p.x-b.x, dy=p.y-b.y;
          if(dx*dx+dy*dy < 8100){ if(p.team===0) a=true; else c=true; }
        }
        if(a&&c) S._conteso=true;
      }
    }
  };

  window.__ev = {
    azzera,
    leggi(){
      const bn = n => S.banner[n]||0;
      const st = G.stats;
      const due = a => [ (a&&a[0])|0, (a&&a[1])|0 ];
      return {
        gol: due(G.score),
        golRegol: S.golRegol || due(G.score),
        tiri: due(st.tiri),
        specchio: due(st.inPorta),
        perfetti: due(st.perfetti),
        parate: due(st.parate),
        rubate: due(st.rubate),
        falli: due(st.falli),
        volee: due(st.volee),
        pallonetti: due(st.pallonetti),
        possesso: due(st.possesso),
        prese: bn('PRESA!'),
        respinte: bn('RESPINTA!'),
        pali: bn('PALO!'),
        traverse: bn('TRAVERSA!'),
        alte: bn('ALTA!'),
        rubatePulite: bn('RUBATA PULITA!'),
        alVolo: bn('AL VOLO!'),
        esiti: Object.assign({}, S.esiti),
        rimpalli: S.rimpalli,
        sponde: S.sponde,
        vaganti: S.vaganti,
        intervalliLiberi: S.intervalli,
        cambi: S.cambi,
        scivolate: S.scivolate,
        frames: S.frames,
        liberoFrames: S.liberoFrames,
        rigori: G.rigori ? { tiri: G.rigori.tiri.slice(), seg: G.rigori.seg.slice() } : null
      };
    }
  };
  return 'ok';
})()`;

/* --------------------------------------------------------------- statistica */
const mediana = a => { const b = a.slice().sort((x, y) => x - y); const n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
const quart = (a, q) => { const b = a.slice().sort((x, y) => x - y); const i = (b.length - 1) * q; const lo = Math.floor(i), hi = Math.ceil(i); return b[lo] + (b[hi] - b[lo]) * (i - lo); };
const media = a => a.reduce((s, x) => s + x, 0) / a.length;

function riga(nome, vals, dec) {
  const d = dec === undefined ? 1 : dec;
  const f = x => x.toFixed(d).padStart(6);
  return '  ' + nome.padEnd(28) + f(mediana(vals)) + '  ' + f(quart(vals, 0.25)) + '-' + f(quart(vals, 0.75)).trim().padEnd(6) +
    '  ' + f(Math.min(...vals)) + '-' + f(Math.max(...vals)).trim().padEnd(6) + '  ' + f(media(vals));
}

/* --------------------------------------------------------------- una passata */
async function gioca(browser, porta, partite, semeBase, diff, etichetta, taglia) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));

  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
    }
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, semeBase);

  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
  });
  const inst = await pag.evaluate(SONDA);
  if (inst !== 'ok') throw new Error('la sonda non si e\' installata: ' + inst);

  const out = [];
  const inizio = Date.now();
  for (let i = 0; i < partite; i++) {
    const r = await pag.evaluate(([seme, diff, taglia]) => {
      const t = window.__test;
      window.__caso.semina(seme);
      window.__ev.azzera();
      t.startMatch(1, diff, taglia !== 5 ? { size: taglia } : undefined);
      t.setCpuVsCpu(true);
      let sim = 0;
      while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      const e = window.__ev.leggi();
      e.scena = t.state; e.simulati = sim;
      return e;
    }, [(semeBase + i) >>> 0, diff, taglia]);
    out.push(r);
    if (partite >= 20 && (i + 1) % 10 === 0) console.log(`  --    ${etichetta}: ${i + 1}/${partite} partite`);
  }
  const ms = Date.now() - inizio;
  await ctx.close();
  return { partite: out, ms, errori };
}

/* --------------------------------------------------------------- derivati */
const DT = 1 / 60;
function derivati(p) {
  const somma = a => (a[0] | 0) + (a[1] | 0);
  const legni = p.pali + p.traverse;
  const parate = somma(p.parate);
  const tiri = somma(p.tiri);
  const e = p.esiti || {};
  const contrasti = somma(p.rubate) + somma(p.falli) + p.rimpalli;
  /* GLI EVENTI, IN DUE FAMIGLIE, e la separazione non e' cosmetica.
     La somma unica e' dominata dalla RISSA: 79 palloni vaganti e 21
     rimpalli a partita contro 1 parata e 0 gol. In quella somma si puo'
     azzerare la porta e non accorgersene — che e' precisamente quello
     che era successo. Quindi:
       DA PORTA  tiri, parate, legni, reti: le cose per cui si alza la
                 testa, e le uniche che una partita puo' non avere.
       DI CAMPO  rimpalli, contrasti, palloni vaganti: la trama. C'era
                 gia' tutta, e va sorvegliata perche' non cali.
     La somma resta stampata per continuita', ma il numero da guardare
     e' il primo. */
  const eventiPorta = tiri + parate + legni + somma(p.golRegol || p.gol);
  const eventiCampo = p.rimpalli + somma(p.rubate) + somma(p.falli) + p.vaganti;
  const eventi = eventiPorta + eventiCampo;
  const minuti = Math.max(0.001, p.frames * DT / 60);
  const gr = p.golRegol || p.gol;
  return {
    tiri, specchio: somma(p.specchio), gol: somma(p.gol), parate,
    golRegol: somma(gr), zeroZero: (somma(gr) === 0 ? 1 : 0),
    aiRigori: p.rigori ? 1 : 0,
    prese: p.prese, respinte: p.respinte, legni, pali: p.pali, traverse: p.traverse,
    rimpalli: p.rimpalli, sponde: p.sponde,
    rubate: somma(p.rubate), falli: somma(p.falli), scivolate: p.scivolate,
    contrasti, vaganti: p.vaganti, cambi: p.cambi,
    tGol: e.gol | 0, tParata: e.parata | 0, tLegno: e.legno | 0,
    tMurato: e.murato | 0, tSponda: e.sponda | 0, tRaccolto: e.raccolto | 0, tSpento: e.spento | 0,
    liberoP: p.frames ? p.liberoFrames / p.frames * 100 : 0,
    durata: p.frames * DT,
    eventi, eventiMin: eventi / minuti,
    eventiPorta, portaMin: eventiPorta / minuti,
    eventiCampo, campoMin: eventiCampo / minuti,
    /* i MOMENTI DA PORTA veri: solo cio' che si e' concluso davanti alla
       rete — una rete, una parata, un legno. Il tiro che muore a
       centrocampo non ne fa parte, ed e' il punto. */
    momenti: somma(p.golRegol || p.gol) + parate + legni,
    momentiMin: (somma(p.golRegol || p.gol) + parate + legni) / minuti,
    intento: tiri ? somma(p.specchio) / tiri * 100 : 0,
    /* la PRECISIONE VERA: quanti tiri arrivano alla porta, cioe' finiscono
       in rete o fra le mani del portiere. Quella del tabellino conta
       l'intenzione e non l'esito, e per questo dice il doppio. */
    precisione: tiri ? ((e.gol | 0) + (e.parata | 0)) / tiri * 100 : 0
  };
}

const VOCI = [
  ['tiri (totali)', 'tiri', 1],
  ['  esito: GOL', 'tGol', 2],
  ['  esito: parata', 'tParata', 2],
  ['  esito: legno', 'tLegno', 2],
  ['  esito: murato dal corpo', 'tMurato', 1],
  ['  esito: sponda (fuori)', 'tSponda', 1],
  ['  esito: raccolto/spento', 'tRaccolto', 1],
  ['  precisione VERA %', 'precisione', 0],
  ['  precisione tabellino %', 'intento', 0],
  ['gol totali (rigori compresi)', 'gol', 1],
  ['gol nei 90 secondi', 'golRegol', 2],
  ['  partite 0-0 nei 90 s', 'zeroZero', 2],
  ['  partite decise ai rigori', 'aiRigori', 2],
  ['parate', 'parate', 1],
  ['  prese (azione finita)', 'prese', 1],
  ['  respinte (ribattuta)', 'respinte', 1],
  ['legni (palo+traversa)', 'legni', 2],
  ['rimpalli sul corpo', 'rimpalli', 1],
  ['rubate pulite', 'rubate', 1],
  ['falli', 'falli', 1],
  ['scivolate tentate', 'scivolate', 1],
  ['contrasti (rub+fal+rimp)', 'contrasti', 1],
  ['palloni vaganti contesi', 'vaganti', 1],
  ['cambi di possesso', 'cambi', 1],
  ['palla di nessuno %', 'liberoP', 1],
  ['durata gioco vivo (s)', 'durata', 1],
  ['MOMENTI DA PORTA', 'momenti', 1],
  ['MOMENTI DA PORTA AL MINUTO', 'momentiMin', 2],
  ['eventi da porta al minuto', 'portaMin', 1],
  ['eventi di campo al minuto', 'campoMin', 1],
  ['EVENTI AL MINUTO (tutti)', 'eventiMin', 1]
];

function stampa(nome, righe) {
  const d = righe.map(derivati);
  console.log(`\n=== ${nome} — ${d.length} partite ===`);
  console.log('  ' + 'voce'.padEnd(28) + 'mediana' + '   quartili' + '        estremi' + '        media');
  for (const [et, k, dec] of VOCI) console.log(riga(et, d.map(x => x[k]), dec));
  return d;
}

function confronta(prima, dopo) {
  console.log(`\n=== DELTA (mediane) ===`);
  console.log('  ' + 'voce'.padEnd(28) + '  prima    dopo   delta');
  for (const [et, k, dec] of VOCI) {
    const a = mediana(prima.map(x => x[k])), b = mediana(dopo.map(x => x[k]));
    const d = dec === undefined ? 1 : dec;
    const seg = b - a >= 0 ? '+' : '';
    console.log('  ' + et.padEnd(28) + a.toFixed(d).padStart(7) + b.toFixed(d).padStart(8) +
      (seg + (b - a).toFixed(d)).padStart(8) + (a ? ('  ' + (seg + ((b - a) / a * 100).toFixed(0) + '%')) : ''));
  }
}

/* --confronta prima.json dopo.json — mette a confronto due fotografie
   gia' prese, senza rigiocare niente. Le mediane si ricalcolano dal
   crudo, quindi due file salvati con versioni diverse di questo
   strumento restano confrontabili se il crudo non e' cambiato. */
{
  const i = process.argv.indexOf('--confronta');
  if (i > 0 && process.argv[i + 1] && process.argv[i + 2]) {
    const A = JSON.parse(fs.readFileSync(path.resolve(process.argv[i + 1]), 'utf8'));
    const B = JSON.parse(fs.readFileSync(path.resolve(process.argv[i + 2]), 'utf8'));
    const dA = A.crudo.map(derivati), dB = B.crudo.map(derivati);
    console.log(`\n=== ${A.etichetta} (${dA.length} partite, seme ${A.semeBase}) contro ${B.etichetta} (${dB.length} partite, seme ${B.semeBase}) ===`);
    stampa(A.etichetta, A.crudo);
    stampa(B.etichetta, B.crudo);
    confronta(dA, dB);
    process.exit(0);
  }
}

(async () => {
  const partite = Math.max(1, +arg('partite', 30) | 0);
  const semeBase = +arg('seme', 20260803);
  const diff = Math.max(0, Math.min(2, +arg('diff', 1) | 0));
  /* la taglia della partita: 5, 7 o 11. La fisica del pallone NON scala
     col campo, quindi il gioco a 11 e' un'altra misura, non la stessa. */
  const taglia = [5, 7, 11].includes(+arg('taglia', 5)) ? +arg('taglia', 5) : 5;
  const etichetta = arg('etichetta', 'FOTOGRAFIA');
  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = prova ? path.resolve(prova) : '';
  const fileJson = arg('json', '');
  const contro = arg('contro', '');
  const diagnosi = !haFlag('no-diagnosi');

  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('FALLITO: gioco di prova inesistente: ' + provaAbs); process.exit(1); }

  const srv = await servi(provaAbs);
  const browser = await chromium.launch();

  console.log(`\n=== EVENTI — ${partite} partite CPU contro CPU, semi ${semeBase}..${semeBase + partite - 1}, difficolta' ${['Facile', 'Normale', 'Duro'][diff]}, ${taglia} contro ${taglia} ===`);
  console.log('  --    gioco: ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));

  const A = await gioca(browser, srv.porta, partite, semeBase, diff, etichetta, taglia);
  console.log(`  --    ${(A.ms / 1000).toFixed(1)} s in tutto = ${(A.ms / partite / 1000).toFixed(2)} s a partita`);

  const nonFinite = A.partite.filter(p => p.scena !== 'end');
  if (nonFinite.length) console.log(`  NO    ${nonFinite.length} partite non arrivano al fischio finale`);
  if (A.errori.length) console.log(`  NO    eccezioni: ${A.errori[0]}`);

  const d = stampa(etichetta, A.partite);

  /* --- AUTODIAGNOSI: la stessa misura, su una pagina nuova --- */
  let diagOK = true;
  if (diagnosi) {
    const n = Math.min(3, partite);
    const B = await gioca(browser, srv.porta, n, semeBase, diff, 'diagnosi', taglia);
    const chiavi = ['tiri', 'specchio', 'gol', 'parate', 'legni', 'muri', 'rubate', 'falli', 'vaganti', 'cambi', 'eventi'];
    const dB = B.partite.map(derivati);
    const diff2 = [];
    for (let i = 0; i < n; i++) for (const k of chiavi) if (d[i][k] !== dB[i][k]) diff2.push(`partita ${i} voce ${k}: ${d[i][k]} contro ${dB[i][k]}`);
    diagOK = diff2.length === 0;
    console.log(`\n  ${diagOK ? 'OK  ' : 'NO  '} autodiagnosi: ${n} partite rigiocate su pagina nuova danno lo stesso vettore di eventi`);
    if (!diagOK) console.log('        ' + diff2.slice(0, 5).join('\n        ') +
      '\n        la misura non e\' riproducibile: lo strumento e\' cieco e non va creduto');
  }

  await browser.close(); srv.chiudi();

  if (fileJson) {
    fs.writeFileSync(path.resolve(fileJson), JSON.stringify({ etichetta, partite, semeBase, diff, gioco: provaAbs || 'repo', crudo: A.partite }, null, 1));
    console.log(`\n  --    crudo salvato in ${fileJson}`);
  }
  if (contro) {
    const prima = JSON.parse(fs.readFileSync(path.resolve(contro), 'utf8'));
    console.log(`\n  --    confronto con ${prima.etichetta} (${prima.partite} partite, seme ${prima.semeBase})`);
    confronta(prima.crudo.map(derivati), d);
  }

  /* ============================== IL CANCELLO (--cancello) ==============
     Da metro a cancello, ed e' la voce 7 del §3.8 del censimento del 20
     agosto: «_eventi.js, l'unico strumento che misura il GIOCO invece
     dell'immagine, non e' nella batteria». Le soglie sono ANCORATE a una
     misura, non a un gusto — fotografia del 20 agosto 2026, 20 partite,
     semi 20260803..822, Normale, 5 contro 5, file md5 30279089de83:
       tiri mediana 11,0 · MOMENTI DA PORTA mediana 6,0 · partite 0-0 nei
       90 s: 2 su 20 · EVENTI AL MINUTO mediana 56,0.
     Le soglie stanno MOLTO sotto il misurato, apposta: questo cancello
     non giudica il ritmo fine (per quello ci sono il metro e --contro),
     giudica che la promessa di fondo — «la partita produce eventi, e la
     porta esiste» — non venga rotta in silenzio. Ogni toppa alla
     simulazione sposta questi numeri al bit: un cancello stretto qui
     diventerebbe rumoroso, e un cancello rumoroso viene disattivato la
     prima volta che sbaglia. Meglio un pavimento largo che regge. */
  if (haFlag('cancello')) {
    const med = k => mediana(d.map(x => x[k]));
    const quotaZero = d.length ? d.filter(x => x.zeroZero).length / d.length * 100 : 100;
    const SOGLIE_CANCELLO = [
      /* [nome, valore misurato ora, prova, soglia scritta, ancora del 20 ago] */
      ['tiri per partita (mediana)', med('tiri'), v => v >= 4, '>= 4', 'misurato 11,0'],
      ['MOMENTI DA PORTA (mediana)', med('momenti'), v => v >= 2, '>= 2', 'misurato 6,0'],
      ['partite 0-0 nei 90 s', quotaZero, v => v <= 50, '<= 50%', 'misurato 10%'],
      ['EVENTI AL MINUTO (mediana)', med('eventiMin'), v => v >= 30, '>= 30', 'misurato 56,0'],
    ];
    console.log('\n=== CANCELLO — il pavimento degli eventi ===');
    let rosse = 0;
    for (const [nome, val, prova, attesa, ancora] of SOGLIE_CANCELLO) {
      const ok = prova(val);
      if (!ok) rosse++;
      console.log(`  ${ok ? 'OK  ' : 'NO  '} ${nome}: ${val.toFixed(1)}  (soglia ${attesa}, ancora del 20 ago: ${ancora})`);
    }
    console.log(`\n${SOGLIE_CANCELLO.length} soglie, ${SOGLIE_CANCELLO.length - rosse} passate, ${rosse} fallite`);
    /* l'autodiagnosi rotta non e' un rosso del gioco: e' il banco che non
       si fida di se' stesso. Codici di casa: 2 = il banco e' esploso. */
    if (!diagOK) {
      console.log('  ??   la misura non e\' riproducibile: il verdetto qui sopra NON VA LETTO (uscita 2)');
      process.exit(2);
    }
    if (nonFinite.length || A.errori.length) process.exit(1);
    process.exit(rosse ? 1 : 0);
  }

  if (!diagOK || nonFinite.length || A.errori.length) process.exit(1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
