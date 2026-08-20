/* =====================================================================
   _q-aereo.js — IL CANCELLO DEL GIOCO AEREO.

   LA DOMANDA. Sopra Z_SOPRA_TESTA (26) il pallone di questo gioco passa
   e basta: il divieto e' una riga sola dentro il ciclo di raccolta
   (`if(b.z>Z_SOPRA_TESTA) continue;`). Conseguenza dichiarata dal
   censimento del 20 agosto: niente colpo di testa, niente stop di petto,
   e i cross che la CPU adesso batte davvero non li gioca nessuno.
   Questo file misura QUANTI palloni alti vengono giocati per aria, e —
   che e' la meta' che impedisce di esagerare — quanti vengono giocati da
   chi non potrebbe.

   COSA LEGGE, E PERCHE' NON E' UNA BANDIERA.
   Non legge G.stats, non legge un contatore scritto dal codice che
   giudica, non chiede al gioco se ha fatto un colpo di testa. Legge
   l'EFFETTO sul pallone, dall'esterno di step():

     un pallone LIBERO sopra quota 26, lontano dai pali e dalle sponde,
     la cui velocita' cambia di piu' di quanto gravita' e attrito
     spieghino, E' STATO COLPITO DA UN CORPO.

   Sul gioco di oggi quell'evento e' impossibile per costruzione — il
   solo codice che tocca un pallone sopra 26 sono le sponde e i pali, ed
   e' per questo che l'evento si conta solo lontano da loro. Percio' il
   numero di oggi non e' "piccolo": e' ZERO, e lo e' per una ragione che
   si legge nel sorgente.

   TRE BANCHI, e il secondo e il terzo sono quelli che tengono onesto il
   primo.

     A/B. BANCO DEI CROSS. Si servono N cross deterministici con la
        balistica DEL GIOCO (si chiama doCross, non una mia formula), a
        distanze che coprono tutto l'arco di quote che il gioco sa
        produrre (apice da 21,8 a 39,4 — misurati). Si conta quanti
        vengono giocati per aria da un corpo IN PIEDI (A) e quanti
        vengono spazzati da uno steso a terra (B: la scivolata che non
        chiede la quota, e che oggi e' l'unico gesto del gioco che tocchi
        un pallone alto senza chiedere permesso).
     C. BANCO DEI PALLONI IRRAGGIUNGIBILI. Gli stessi cross, ma con la
        quota raddoppiata: apice minimo 87, piu' alto di qualunque
        fronte. Nessuno deve toccarli. E' il controllo simmetrico: senza
        di lui "il gioco aereo esiste" si soddisfa rendendo tutti
        calamite.
     D/E. PARTITE VERE, CPU contro CPU, semi fissi: quanti palloni alti
        vengono giocati invece di atterrare (D), e quanti gol nascono per
        aria — se diventano la maggioranza l'equilibrio e' rotto (E).
     F. La stessa misura rigiocata su pagine nuove con gli stessi semi.

   TRE CLASSI, e vanno tenute separate o il numero mente.
     · IL PORTIERE sotto quota 34 fa il suo mestiere: il gioco glielo
       concede per scritto (tentaPresa, `if(b.z>Z_SOPRA_PORTIERE) return`).
       Contare le sue prese alte dava dodici "colpi di testa" su un gioco
       in cui la parola non compare.
     · UNO STESO A TERRA non gioca un pallone alto: se lo fa e' il buco.
     · IL FOTOGRAMMA CONGELATO non e' un contatto: ci sono passi in cui
       step() esce presto e il pallone non viene integrato affatto.

   IL CONTROLLO NEGATIVO (obbligatorio: uno strumento mai visto fallire
   non e' uno strumento). Con --negativo si installa NELLA PAGINA, SOTTO
   la sonda, una calamita finta: dopo ogni passo, se il pallone e' libero
   e alto, il non-portiere piu' vicino entro 140 unita' se lo prende, a
   QUALUNQUE quota. Deve succedere questo: A diventa VERDE (la sonda vede
   i palloni giocati per aria: non e' cieca) e C diventa ROSSO (il tetto
   vede l'abuso: non e' una decorazione). Se non succede, questo file lo
   dichiara e esce con 1.

   uso:
     node strumenti/_q-aereo.js                       (il gioco di oggi)
     node strumenti/_q-aereo.js --gioco fuori/prova.html
     node strumenti/_q-aereo.js --negativo            (controllo negativo)
     node strumenti/_q-aereo.js --battute 60 --partite 20 --taglia 5
     node strumenti/_q-aereo.js --solo-banco          (salta le partite)
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

/* ---------------------------------------------------------------------
   LE SOGLIE, tutte dichiarate qui e nessuna nascosta nel codice.
   --------------------------------------------------------------------- */
const Q_ALTO = 26;      // Z_SOPRA_TESTA: sopra qui oggi il pallone passa e basta
const Q_TETTO = 50;     // nessun corpo puo' giocare un pallone piu' alto di cosi'
const G_A = 0.30;       // banco A: frazione minima di cross giocati per aria
const G_C = 0.20;       // partite: frazione minima di cross alti giocati per aria
const G_TESTA = 0.40;   // partite: frazione massima di gol nati di testa

function servitore(prova) {
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
   LA SONDA, che gira dentro la pagina. Avvolge step() e NON pesca un
   solo numero casuale: la partita misurata e' la partita non misurata.
   ===================================================================== */
const SONDA = `(() => {
  if (window.__qa) return 'gia';
  const Q_ALTO=${Q_ALTO}, Q_TETTO=${Q_TETTO};
  const S={};
  const azzera=()=>{
    S.frames=0;
    S.aereoCorpo=0;       // pallone alto TOCCATO da un corpo in piedi (soglia sensibile)
    S.aereoForte=0;       // ...e GIOCATO davvero: rimandato via, o preso
    S.aereoScivolata=0;   // ...da uno steso a terra: la scivolata che spazza
    S.aereoPortiere=0;    // ...dal PORTIERE sotto Z_SOPRA_PORTIERE: e' il suo mestiere
    S.presiAria=0;        // ...e preso in possesso mentre era alto
    S.quote=[];           // la quota di ogni evento aereo
    S.quoteSciv=[];
    S.violaTetto=0;       // eventi aerei sopra Q_TETTO: NON DEVONO ESISTERE
    S.altiFrame=0;
    S.golTesta=0; S.golAltro=0;
    S.ultimo='';          // 'aereo' | 'altro' : che cosa ha toccato il pallone per ultimo
    S.zMax=0;
    S.punti=[0,0];
    S.calciAlti=[];       // quote a cui kickBall e' riuscito su un pallone LIBERO
  };
  azzera();

  /* kickBall E' L'IMBUTO DI TUTTI I CALCI DEL GIOCO, e non chiede la
     quota: lo si avvolge per SAPERE a che altezza il piede sta
     colpendo. Non e' una bandiera del gioco, e' il registro di una
     chiamata — e serve a distinguere "il gioco aereo esiste" da "il
     piede arriva dappertutto". */
  const _kick = window.kickBall;
  window.kickBall = function(p,nx,ny,speed,spin){
    const b=G.ball, z=b.z, libero=b.owner<0;
    const r=_kick.apply(this, arguments);
    if(r && libero && z>Q_ALTO) S.calciAlti.push(+z.toFixed(1));
    return r;
  };

  /* FW, FH, GOAL_H sono dichiarati con let: vivono nel lessico globale e
     si leggono come identificatori NUDI, non come proprieta' di window.
     Scriverli window.FW dava undefined e la guardia dei bordi non
     scattava mai — un cancello che non boccia perche' non sa dove sono
     le sponde. */
  const _step = window.step;

  window.step = function(){
    const b=G.ball;
    const p={ o:b.owner, x:b.x, y:b.y, z:b.z, vx:b.vx, vy:b.vy, vz:b.vz, pf:b.perfectT };
    const s0=[G.score[0],G.score[1]];
    _step.apply(this, arguments);
    if(!(G.scene==='play'||G.scene==='golden'||G.scene==='goal')) return;
    S.frames++;
    if(b.z>S.zMax) S.zMax=b.z;
    if(b.owner<0 && b.z>Q_ALTO) S.altiFrame++;
    /* --- L'EFFETTO. Fra due passi, un pallone libero in volo cambia
       SOLO vz, e di 560/60 = 9,3333 esatti: l'attrito e' dell'erba e si
       paga solo a terra (updateBall lo dichiara). Qualunque altro
       cambiamento e' un corpo. Si esclude la fascia vicino a pali e
       sponde, dove il gioco tocca il pallone a qualunque quota, e i
       palloni a effetto (b.perfectT), l'unico moto libero con una
       accelerazione orizzontale. --- */
    let aereo=false;
    /* IL FOTOGRAMMA CONGELATO NON E' UN CONTATTO. Ci sono passi in cui
       il pallone non viene integrato affatto — step() esce presto sul
       cambio di scena, e la moviola gli riscrive la posizione dal
       nastro. In quei passi la velocita' verticale NON cala di 9,3333, e
       una differenza rispetto alla gravita' attesa e' esattamente cio'
       che questo cancello cerca: quattro fotogrammi immobili a quota
       32,8 venivano contati come quattro colpi di testa su un gioco che
       la parola non ce l'ha. Un pallone che non si e' mosso di un
       millesimo non e' stato colpito da nessuno. */
    if(p.x===b.x && p.y===b.y && p.z===b.z && p.vz===b.vz) return;
    /* LA QUOTA SI CHIEDE DOPO IL PASSO, e la scelta e' misurata.
       updateBall integra z all'inizio del passo e SOLO DOPO decide chi
       tocca il pallone: un pallone a 26,4 PRIMA del passo e' a 22,9
       quando il muro dei corpi lo esamina. Chiedendola prima, il
       cancello contava come gioco aereo il rimpallo di sempre (tre
       eventi su ventiquattro su un gioco che la parola non ce l'ha);
       chiedendola prima E dopo, si perdeva il fotogramma in cui il
       pallone ATTRAVERSA la soglia salendo — ed e' proprio quello in cui
       la calamita del controllo negativo colpiva, che infatti restava
       invisibile. Chiesta DOPO, il rimpallo esce (22,9 < 26) e
       l'attraversamento entra (26,4 > 26). */
    if(p.o<0 && b.z>Q_ALTO && !(p.pf>0)){
      const bordo = b.x<44 || b.x>FW-44 || b.y<34 || b.y>FH-34 || p.x<44 || p.x>FW-44 || p.y<34 || p.y>FH-34;
      if(!bordo){
        const dvz=Math.abs(b.vz-(p.vz-560/60));
        const dv=Math.abs(b.vx-p.vx)+Math.abs(b.vy-p.vy);
        if(b.owner>=0 || dv>1.5 || dvz>3){
          aereo=true;
          /* CHI L'HA TOCCATA ERA IN PIEDI O ERA A TERRA? Si guarda il
             corpo piu' vicino al pallone e il suo stato di SCIVOLATA,
             che e' uno stato della simulazione di sempre — non una
             bandiera scritta dalla toppa che qui si giudica. Serve
             perche' il gioco di oggi UNA cosa ai palloni alti la fa
             gia': "palla libera: la scivolata la spazza" non chiede la
             quota, e un uomo steso a terra spazza un pallone che gli
             vola sopra la testa. */
          let vicino=null, dm=1e9;
          for(const q of G.players){
            if(q.out>0) continue;
            const d=Math.hypot(q.x-p.x, q.y-p.y);
            if(d<dm){ dm=d; vicino=q; }
          }
          const steso = !!(vicino && dm<46 && (vicino.slide>=0 || vicino.recover>0));
          /* IL PORTIERE NON E' UN BUCO: il gioco gli concede per scritto
             tutto cio' che sta sotto Z_SOPRA_PORTIERE (34), e tentaPresa
             lo dichiara con una riga sua. Le sue prese e le sue respinte
             alte sono il mestiere, non il gioco aereo che qui si cerca —
             contarle avrebbe dato dodici "colpi di testa" su un gioco che
             la parola non ce l'ha. Sopra 34 pero' torna nel conto di
             tutti, perche' li' nemmeno lui arriva. */
          const portiere = !!(vicino && dm<46 && vicino.role==='gk' && Math.max(p.z,b.z)<=34);
          /* DUE SOGLIE, e servono a due domande diverse.
             Per il controllo SIMMETRICO ("nessuno tocchi cio' che non
             puo' raggiungere") la soglia dev'essere sensibile: 1,5
             unita' al secondo. Per la domanda positiva ("il pallone alto
             viene GIOCATO") no: sul gioco di oggi restano due eventi
             ogni dieci partite che passano la soglia sensibile e non
             sono nessuno che gioca (rimpalli al limite dell'integrazione
             numerica), e un cancello che si dichiara verde su due eventi
             di rumore non e' un cancello. Un pallone davvero giocato
             cambia velocita' di centinaia di unita': la soglia e' 30. */
          const forte = (b.owner>=0) || dv>30;
          if(b.owner>=0) S.presiAria++;
          if(portiere) S.aereoPortiere++;
          else if(steso){ S.aereoScivolata++; S.quoteSciv.push(+Math.max(p.z,b.z).toFixed(1)); }
          else { S.aereoCorpo++; if(forte){ S.aereoForte++; S.quote.push(+Math.max(p.z,b.z).toFixed(1)); } }
          if(Math.max(p.z,b.z)>Q_TETTO) S.violaTetto++;
        }
      }
    }
    /* chi ha toccato il pallone per ULTIMO: serve solo a dire di che
       cosa e' nato un gol, e si aggiorna su qualunque discontinuita' */
    if(aereo) S.ultimo='aereo';
    else if(b.owner!==p.o) S.ultimo='altro';
    else if(p.o<0){
      const dvz=Math.abs(b.vz-(p.vz-560/60));
      const dv=Math.abs(b.vx-p.vx)+Math.abs(b.vy-p.vy);
      if(p.z<=0.6 || dv>1.5 || dvz>3) S.ultimo='altro';
    }
    if(G.score[0]!==s0[0] || G.score[1]!==s0[1]){
      if(S.ultimo==='aereo') S.golTesta++; else S.golAltro++;
      S.ultimo='';
    }
    S.punti=[G.score[0],G.score[1]];
  };

  /* ===================================================================
     IL BANCO: una battuta di cross deterministica, servita con la
     BALISTICA DEL GIOCO (doCross), non con una formula mia.
     alto>1 moltiplica la sola quota: e' il banco dei palloni
     irraggiungibili.
     =================================================================== */
  window.__qaBattuta = (k, alto) => {
    const P=G.players, b=G.ball;
    const mov = P.filter(q=>q.role!=='gk');
    const A = mov.filter(q=>q.team===0), D = mov.filter(q=>q.team===1);
    if(A.length<2 || D.length<1) return null;
    const crossatore=A[0], bersaglio=A[1], difensore=D[0];
    /* la distanza copre tutto l'arco che doCross sa produrre:
       T=clamp(dist/430, 0,5, 0,75) e l'apice vale 70*T*T */
    const dist = 240 + (k%8)*27;              // 240..429
    const lato = (k%2)?1:-1;
    const gx = FW;
    /* il bersaglio al secondo palo, con uno scarto deterministico */
    const bx = gx-56, by = FH/2 + lato*(GOAL_H*0.28) + ((k%5)-2)*7;
    bersaglio.x=bx; bersaglio.y=by; bersaglio.vx=0; bersaglio.vy=0;
    bersaglio.fx=-1; bersaglio.fy=0; bersaglio.slide=-1; bersaglio.recover=0;
    bersaglio.rove=-1; bersaglio.charge=-1; bersaglio.kickCd=0; bersaglio.out=0;
    if(bersaglio.aer!==undefined) bersaglio.aer=-1;
    /* il crossatore sulla fascia, a 'dist' dal bersaglio */
    const ang = Math.atan2(by-(FH/2 + lato*FH*0.42), bx-(gx-dist));
    crossatore.x = clamp(bx - dist*Math.cos(ang), 40, FW-40);
    crossatore.y = clamp(by - dist*Math.sin(ang), 30, FH-30);
    crossatore.vx=0; crossatore.vy=0; crossatore.slide=-1; crossatore.recover=0;
    crossatore.rove=-1; crossatore.charge=-1; crossatore.kickCd=0; crossatore.out=0;
    if(crossatore.aer!==undefined) crossatore.aer=-1;
    /* un difensore contende, sempre allo stesso scarto */
    difensore.x=clamp(bx+16+((k%3)*6),40,FW-40); difensore.y=clamp(by+18-((k%4)*9),30,FH-30);
    difensore.vx=0; difensore.vy=0; difensore.slide=-1; difensore.recover=0;
    difensore.rove=-1; difensore.charge=-1; difensore.kickCd=0; difensore.out=0;
    if(difensore.aer!==undefined) difensore.aer=-1;
    /* tutti gli altri fuori dai piedi, a meta' campo */
    let n=0;
    for(const q of P){
      if(q===crossatore||q===bersaglio||q===difensore) continue;
      if(q.role==='gk') continue;
      q.x=FW*0.5; q.y=40+((n++)%9)*((FH-80)/9); q.vx=0; q.vy=0;
      q.slide=-1; q.recover=0; q.rove=-1; q.charge=-1; q.kickCd=0;
      if(q.aer!==undefined) q.aer=-1;
    }
    b.owner=G.players.indexOf(crossatore);
    b.x=crossatore.x; b.y=crossatore.y; b.z=0; b.vx=0; b.vy=0; b.vz=0;
    b.passTo=-1; b.crossTo=-1; b.perfectT=0; b.curve=0;
    const dx=bx-crossatore.x, dy=by-crossatore.y, l=Math.max(1,Math.hypot(dx,dy));
    window.doCross(crossatore, dx/l, dy/l, [bx,by], G.players.indexOf(bersaglio));
    if(alto>1) b.vz*=alto;               // il banco dei palloni irraggiungibili
    return { apice: +(b.z + b.vz*b.vz/1120).toFixed(1), vz:+b.vz.toFixed(1) };
  };

  window.__qa = { azzera, leggi(){ return JSON.parse(JSON.stringify(S)); } };
  return 'ok';
})()`;

/* --------------------------------------------------------------------- */
async function apri(br, porta, seme, negativo) {
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1 });
  const pag = await ctx.newPage();
  /* IL SEME SI RIMETTE A ZERO PRIMA DI OGNI PARTITA, e non e' una
     cintura: e' la cura. Seminato solo all'avvio, il generatore arriva a
     startMatch con un numero di estrazioni che dipende da quanto la
     pagina ha consumato durante il caricamento — e quel numero NON e'
     lo stesso a ogni giro (una cottura pigra che parte o non parte
     sposta tutta la sequenza). Misurato: senza risemina, tre partite
     rigiocate con gli stessi semi davano 8/0/0/1-1 la prima volta e
     0/0/0/1-3 la seconda. Con la risemina i due vettori coincidono. */
  await pag.addInitScript(s => {
    let x = s >>> 0 || 1;
    const p = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x >>> 0; };
    Math.random = () => p() / 4294967296;
    window.__risemina = k => { x = (k >>> 0) || (s >>> 0) || 1; };
  }, seme);
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 25000 });
  /* ===================================================================
     IL CONTROLLO NEGATIVO — una calamita finta, grossolana e dichiarata:
     dopo ogni passo, se il pallone e' libero e alto, chiunque entro 140
     unita' se lo prende, a QUALUNQUE quota. Va installata PRIMA della
     sonda: la sonda avvolge step() e legge lo stato DOPO la chiamata
     interna, quindi una calamita montata SOPRA di lei agirebbe dopo la
     lettura e resterebbe invisibile — misurato, zero eventi visti.
     Sotto di lei, la sonda la vede nello stesso passo.
     Cio' che deve succedere: il cancello A diventa VERDE (la sonda vede
     i palloni giocati per aria: non e' cieca) e il cancello C diventa
     ROSSO (il tetto vede l'abuso: non e' una decorazione).
     =================================================================== */
  if (negativo) await pag.evaluate(`(() => {
    const _s = window.step;
    window.step = function(){
      _s.apply(this, arguments);
      const b=G.ball;
      if(b.owner<0 && b.z>26){
        /* al PORTIERE no: la sonda gli concede per scritto tutto cio' che
           sta sotto 34, e una calamita che gliela mette in mano non
           metterebbe alla prova niente */
        let mi=-1, dm=1e9;
        for(let i=0;i<G.players.length;i++){
          const q=G.players[i];
          if(q.out>0 || q.role==='gk') continue;
          const d=Math.hypot(q.x-b.x, q.y-b.y);
          if(d<dm){ dm=d; mi=i; }
        }
        if(mi>=0 && dm<140){ b.owner=mi; b.vx=0; b.vy=0; b.vz=0; }
      }
    };
  })()`);
  await pag.evaluate(SONDA);
  return { ctx, pag };
}

async function banco(br, porta, seme, negativo, battute, taglia, alto) {
  const { ctx, pag } = await apri(br, porta, seme, negativo);
  const r = await pag.evaluate(([n, t, alt, sm]) => {
    window.__risemina(sm);
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1, { size: t });
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
    window.__test.setCpuVsCpu(true);
    window.__test.simulate(2.0);           // esce dal calcio d'inizio
    const out = { serviti: 0, apici: [], giocati: 0, atterrati: 0, quote: [], sciv: 0, quoteSciv: [], violaTetto: 0 };
    for (let k = 0; k < n; k++) {
      /* IL CRONOMETRO SI RIMETTE PRIMA DI OGNI BATTUTA. Quarantotto
         battute da 2,8 s fanno 134 secondi di simulazione contro una
         partita di 90: senza questa riga il banco finiva la partita a
         meta' e le ultime venti battute non venivano servite affatto —
         simulate() esce da sola quando la scena e' 'end'. */
      window.__test.setTimeLeft(85);
      for (let g = 0; g < 60 && window.__test.state !== 'play'; g++) window.__test.simulate(0.1);
      window.__qa.azzera();
      const info = window.__qaBattuta(k, alt);
      if (!info) break;
      out.serviti++; out.apici.push(info.apice);
      window.__test.simulate(2.6);
      const s = window.__qa.leggi();
      out.gk = (out.gk || 0) + s.aereoPortiere;
      if (s.aereoForte > 0) { out.giocati++; out.quote.push(...s.quote); }
      else out.atterrati++;
      if (s.aereoScivolata > 0) { out.sciv++; out.quoteSciv.push(...s.quoteSciv); }
      out.violaTetto += s.violaTetto;
      /* il pallone si rimette in mezzo: una battuta non deve ereditare
         la scena della precedente */
      const b = window.__test.ball;
      b.owner = -1; b.x = 575; b.y = 280; b.z = 0; b.vx = 0; b.vy = 0; b.vz = 0;
      window.__test.simulate(0.2);
    }
    return out;
  }, [battute, taglia, alto, seme]);
  await ctx.close();
  return r;
}

async function partite(br, porta, seme0, negativo, n, taglia) {
  const tot = { cross: 0, corpo: 0, sciv: 0, presiAria: 0, violaTetto: 0, quote: [], quoteSciv: [], calciAlti: [],
                golTesta: 0, gol: 0, altiFrame: 0, frames: 0, zMax: 0, vettore: [] };
  for (let k = 0; k < n; k++) {
    const { ctx, pag } = await apri(br, porta, seme0 + k, negativo);
    const r = await pag.evaluate(([t, sm]) => {
      window.__risemina(sm);
      window.__test.dismissSplash && window.__test.dismissSplash();
      window.__test.startMatch(1, 1, { size: t });
      window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
      window.__test.setCpuVsCpu(true);
      window.__qa.azzera();
      window.__test.simulate(95);
      const s = window.__qa.leggi();
      s.cross = (G.stats.cross[0] | 0) + (G.stats.cross[1] | 0);
      return s;
    }, [taglia, seme0 + k]);
    tot.cross += r.cross;
    tot.corpo += r.aereoForte; tot.tocchi = (tot.tocchi || 0) + r.aereoCorpo;
    tot.sciv += r.aereoScivolata; tot.presiAria += r.presiAria;
    tot.gk = (tot.gk || 0) + r.aereoPortiere;
    tot.violaTetto += r.violaTetto;
    tot.quote.push(...r.quote); tot.quoteSciv.push(...r.quoteSciv); tot.calciAlti.push(...r.calciAlti);
    tot.golTesta += r.golTesta; tot.gol += r.golTesta + r.golAltro;
    tot.altiFrame += r.altiFrame; tot.frames += r.frames;
    tot.zMax = Math.max(tot.zMax, r.zMax);
    tot.vettore.push(`${r.aereoForte}/${r.aereoScivolata}/${r.golTesta}/${r.punti[0]}-${r.punti[1]}`);
    await ctx.close();
  }
  return tot;
}

(async () => {
  const GIOCO = arg('gioco', process.env.GIOCO_PROVA || 'CALCETTO-il-gioco.html');
  const NEG = haFlag('negativo');
  const BATTUTE = +arg('battute', 48);
  const NPART = +arg('partite', 14);
  const TAGLIA = +arg('taglia', 5);
  const SEME = +arg('seme', 20260803);
  const soloBanco = haFlag('solo-banco');
  const prova = path.isAbsolute(GIOCO) ? GIOCO : path.join(RADICE, GIOCO);
  if (!fs.existsSync(prova)) { console.error('non trovo ' + prova); process.exit(2); }
  const srv = await servitore(prova);
  const br = await chromium.launch();
  const esiti = [];
  const seg = (nome, ok, testo) => { esiti.push({ nome, ok }); console.log(`  ${ok ? 'VERDE' : 'ROSSO'}  ${nome}: ${testo}`); };

  console.log(`\n=== _q-aereo.js — ${GIOCO}${NEG ? '   [CONTROLLO NEGATIVO: calamita finta installata]' : ''} ===`);
  console.log(`    taglia ${TAGLIA}, ${BATTUTE} battute al banco, ${NPART} partite, semi ${SEME}..${SEME + NPART - 1}\n`);

  /* ---- A: il banco dei cross ---- */
  const A = await banco(br, srv.porta, SEME, NEG, BATTUTE, TAGLIA, 1);
  const apMin = Math.min(...A.apici), apMax = Math.max(...A.apici);
  const frA = A.serviti ? A.giocati / A.serviti : 0;
  console.log(`  BANCO A — ${A.serviti} cross serviti, apice da ${apMin} a ${apMax}`);
  console.log(`     giocati da un corpo in piedi ${A.giocati}, atterrati ${A.atterrati}` +
              (A.quote.length ? `, quote dei colpi: min ${Math.min(...A.quote)} mediana ${mediana(A.quote)} max ${Math.max(...A.quote)}` : ''));
  console.log(`     spazzati da uno STESO A TERRA (la scivolata che non chiede la quota): ${A.sciv}, toccati dal portiere sotto 34: ${A.gk || 0}` +
              (A.quoteSciv.length ? `  quote ${Math.min(...A.quoteSciv)}..${Math.max(...A.quoteSciv)}` : ''));
  seg('A  il gioco aereo esiste', frA >= G_A,
      `${(100 * frA).toFixed(1)}% dei cross giocati per aria da un corpo in piedi (cancello >= ${(100 * G_A).toFixed(0)}%)`);
  seg('B  nessuno spazza dal basso un pallone che gli vola sopra', A.sciv === 0,
      `${A.sciv} palloni sopra quota ${Q_ALTO} raggiunti da un uomo a terra (cancello: 0)`);

  /* ---- C: i palloni irraggiungibili ---- */
  const B = await banco(br, srv.porta, SEME, NEG, Math.min(BATTUTE, 24), TAGLIA, 2.0);
  const apB = B.apici.length ? Math.min(...B.apici) : 0;
  console.log(`\n  BANCO C — ${B.serviti} cross con la quota raddoppiata, apice minimo ${apB}`);
  seg('C  nessuno gioca cio\' che non puo\' raggiungere', B.giocati === 0 && B.sciv === 0 && B.violaTetto === 0,
      `${B.giocati + B.sciv} giocati per aria, ${B.violaTetto} eventi sopra quota ${Q_TETTO} (cancello: 0 e 0)`);

  let C = null;
  if (!soloBanco) {
    /* ---- C: le partite vere ---- */
    C = await partite(br, srv.porta, SEME, NEG, NPART, TAGLIA);
    console.log(`\n  PARTITE — ${NPART} a taglia ${TAGLIA}: ${C.cross} cross, ${C.gol} gol, quota massima toccata ${C.zMax.toFixed(1)}`);
    console.log(`     fotogrammi col pallone libero sopra ${Q_ALTO}: ${C.altiFrame} su ${C.frames}`);
    console.log(`     tocchi aerei di un corpo in piedi (soglia sensibile 1,5): ${C.tocchi || 0}`);
    console.log(`     GIOCATI per aria (soglia 30 o possesso): ${C.corpo}` +
                (C.quote.length ? `  quote ${Math.min(...C.quote)}..${Math.max(...C.quote)} (mediana ${mediana(C.quote)})` : ''));
    console.log(`     toccati dal portiere sotto quota 34 (il suo mestiere, dichiarato da tentaPresa): ${C.gk || 0}`);
    console.log(`     spazzati da uno steso a terra: ${C.sciv}` +
                (C.quoteSciv.length ? `  quote ${Math.min(...C.quoteSciv)}..${Math.max(...C.quoteSciv)}` : ''));
    console.log(`     kickBall riuscito su un pallone LIBERO sopra ${Q_ALTO}: ${C.calciAlti.length}` +
                (C.calciAlti.length ? `  quote ${Math.min(...C.calciAlti)}..${Math.max(...C.calciAlti)} (mediana ${mediana(C.calciAlti)})` : ''));
    const frC = C.altiFrame ? C.corpo / (C.altiFrame / 60) : 0;   // eventi al secondo di volo alto
    seg('D  in partita vera i palloni alti si giocano', C.corpo > 0 && C.sciv === 0,
        `${C.corpo} palloni alti giocati in piedi (cancello > 0) e ${C.sciv} spazzati da terra (cancello: 0)`);
    const frT = C.gol ? C.golTesta / C.gol : 0;
    seg('E  la testa non e\' diventata l\'unica azione', frT <= G_TESTA && C.violaTetto === 0,
        `${C.golTesta} gol su ${C.gol} nati per aria = ${(100 * frT).toFixed(0)}% (cancello <= ${(100 * G_TESTA).toFixed(0)}%), ` +
        `${C.violaTetto} eventi sopra quota ${Q_TETTO} (cancello: 0)`);
  }

  /* ---- E: la ripetibilita' ---- */
  const R1 = await partite(br, srv.porta, SEME, NEG, 3, TAGLIA);
  const R2 = await partite(br, srv.porta, SEME, NEG, 3, TAGLIA);
  const ug = R1.vettore.join('|') === R2.vettore.join('|');
  console.log(`\n  RIPETIBILITA' — tre partite rigiocate su pagine nuove con gli stessi semi`);
  console.log(`     ${R1.vettore.join('  ')}\n     ${R2.vettore.join('  ')}`);
  seg('F  la misura si ripete', ug, ug ? 'i due vettori coincidono' : 'i due vettori DIFFERISCONO: la misura non vale');

  const rossi = esiti.filter(e => !e.ok).length;
  console.log(`\n  ${esiti.length} cancelli, ${esiti.length - rossi} verdi, ${rossi} rossi\n`);
  await br.close(); srv.chiudi();
  if (NEG) {
    /* nel controllo negativo il cancello DEVE essere rosso: se e' verde,
       lo strumento non sa vedere il guasto e non serve a niente */
    const A_ok = esiti.find(e => /^A/.test(e.nome));
    const C_ok = esiti.find(e => /^C/.test(e.nome));
    const bene = !!(A_ok && A_ok.ok && C_ok && !C_ok.ok);
    console.log(bene
      ? "  CONTROLLO NEGATIVO SUPERATO: con la calamita finta A e' diventato VERDE (la sonda vede i palloni giocati per aria) e C e' diventato ROSSO (il tetto vede l'abuso)."
      : '  CONTROLLO NEGATIVO FALLITO: atteso A verde e C rosso, visti A ' + (A_ok && A_ok.ok ? 'verde' : 'rosso') + ' e C ' + (C_ok && C_ok.ok ? 'verde' : 'rosso') + '. Questo strumento non vede.');
    process.exit(bene ? 0 : 1);
  }
  process.exit(rossi === 0 ? 0 : 1);
})();

function mediana(a) { const b = a.slice().sort((x, y) => x - y); return b.length ? b[b.length >> 1] : 0; }
