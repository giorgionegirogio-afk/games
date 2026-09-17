/* =====================================================================
   _q-battute.js — LE BATTUTE HANNO UN GIUDICE CHE LE ASPETTA (voce #87,
   compito 1, primo compito del ramo voce-87-rimesse-angoli).

   IL PERCHE'. Il cantiere #87 porta al campo le rimesse laterali, gli
   angoli e i rinvii dal fondo (SAVE.sponde==='campo'), con una scena
   nuova ('battuta') e la battuta comandata coi verbi di casa. Questo
   compito non scrive ancora quel meccanismo: scrive SOLO l'interruttore
   (vedi strumenti/_t-sponde-interruttore.js) e QUESTO banco, che nasce
   apposta per condannare cio' che manca. Sette prove, e la disciplina di
   casa e' che un banco che nascesse verde su tutto non avrebbe misurato
   niente: qui la condanna e' il prodotto del compito, non un incidente.

   DOPO CHE L'INTERRUTTORE E' DENTRO restano rosse 5 prove su 7 — RIMESSA,
   FONDO-ANGOLO, FONDO-RINVIO, ANTI-STALLO, TIRA-SPENTO — perche'
   ballWalls(), la scena 'battuta' e la pulsantiera del battitore non
   esistono ancora. Restano verdi INTERRUTTORE (il compito di oggi) e
   GABBIA (la soglia 1 del piano: il gioco di oggi non deve mai rompersi).
   I compiti successivi porteranno le cinque rosse al verde, una alla
   volta — questo file non cambia piu' dopo, sono le prove che smettono
   di fallire.

   LE SETTE PROVE (nomi vincolanti del cantiere, dal piano):
     1. INTERRUTTORE — SAVE.sponde fotografato in G.campoVero da
        startMatch, letto da __test.campoVero. A 11 sempre vero.
     2. RIMESSA — palla libera sparata fuori dalla fascia nord a campo
        vero: attesa scena 'battuta', tipo 'rimessa', squadra opposta
        all'ultimo tocco.
     3. FONDO-ANGOLO — palla fuori dalla luce sul fondo sinistro, ultimo
        tocco della difesa (team 0, che difende quella porta): attesa
        tipo 'angolo', squadra opposta (1).
     4. FONDO-RINVIO — stessa scena, ultimo tocco dell'attacco (team 1):
        attesa tipo 'rinvio', squadra della difesa (0).
     5. GABBIA — la soglia 1: default (nessun tocco a save.sponde),
        stessa scena della prova 2, MAI scena 'battuta' e il pallone
        rimbalza com'e' sempre rimbalzato (coefficiente ~0,82, letto al
        fotogramma del rimbalzo, non dedotto).
     6. ANTI-STALLO — dopo la prova 2, la battuta deve sciogliersi da
        sola entro qualche secondo: se la scena 'battuta' non si vede
        mai (oggi), la prova non puo' che essere rossa: non misura un
        anti-stallo che non ha nulla da cui uscire.
     7. TIRA-SPENTO — a campo vero, un giocatore, un'uscita che da'
        rimessa alla squadra umana (0): __test.pulsanti(0) deve portare
        una cella act:'shot' con off===true durante la finestra. Oggi
        'shot' non porta nemmeno la chiave off (CALCETTO-il-gioco.html,
        vicino a riga 12631) — rossa per costruzione.

   IL SEME: 20260917, il seme dichiarato del cantiere (voce #87). Fissato
   sia sul generatore di pagina (semeFisso, per qualunque Math.random()
   cosmetico letto all'avvio) sia sul generatore interno del gioco
   (__test.semina, quello che governa dado() quando SEME.on e' acceso —
   sono DUE generatori indipendenti, vedi dado() in CALCETTO-il-gioco.html:
   "if(!SEME.on) return Math.random()").

   ZERO dado() NUOVI in questo file: le scene si costruiscono scrivendo
   direttamente lo stato del pallone (owner/x/y/z/vx/vy/vz) e chiamando
   segnaTocco(idx), la stessa funzione che il gioco chiama a ogni
   contatto vero — non si inventa un canale nuovo, si usa quello che
   gia' esiste per dichiarare "chi ha toccato per ultimo".

   uso:  node strumenti/_q-battute.js
         node strumenti/_q-battute.js --gioco fuori/calcetto-base-7ed570a.html
   esce 0 se tutte le prove sono verdi, 1 se almeno una e' rossa,
   2 se il banco stesso e' esploso (pagina, hook mancante, eccezione),
   3 riservato a "prova nulla" sul modello di _q-replay.js/_q-l16.js —
   nessuna delle sette prove di oggi lo usa: ciascuna o misura o e' rossa
   per costruzione, non c'e' un caso "non misurabile" distinto dal rosso.
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

const SEME_CANTIERE = 20260917;   // il seme dichiarato della voce #87

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

/* =====================================================================
   LE DUE SCENE, INIETTATE UNA VOLTA SOLA NELLA PAGINA (window.SCENA_*)
   invece di essere ridichiarate a ogni evaluate: sono funzioni che
   VIVONO lato browser (leggono G/segnaTocco per riferimento bare, come
   fa gia' _q-proporzioni.js con tentaPresa), quindi vanno DEFINITE
   dentro la pagina, non nel processo Node — un refuso gia' pagato in
   una stesura precedente di questo file (chiamarle da Node non le
   avrebbe mai trovate: ReferenceError a runtime, non un rosso onesto).

   FASCIA NORD (prove 2, 5, 6, 7): pallone libero (owner=-1) al centro
   campo in larghezza, appena sotto la fascia superiore, lanciato verso
   l'alto a velocita' alta: esce dalla fascia (o rimbalza, in GABBIA) in
   pochi fotogrammi.

   FONDO SINISTRO FUORI LUCE (prove 3, 4): il quadrante d'uscita e' sopra
   la luce della porta (GY0 letto dal vivo via __test.campo, mai un
   numero scritto a mano); la difesa di quella porta e' la squadra 0
   (formation(): gl=0 per team 0, CALCETTO-il-gioco.html:10442).

   In entrambe l'ultimo tocco si dichiara con segnaTocco(idx), la stessa
   funzione che il gioco chiama a ogni contatto vero — non un canale
   nuovo inventato per il banco.
   ===================================================================== */
function INIETTA_SCENE() {
  window.SCENA_FASCIA = function (teamUltimoTocco) {
    const t = window.__test;
    const camp = t.campo;
    const idx = t.players.findIndex(p => p.team === teamUltimoTocco);
    if (idx < 0) return { errore: 'nessun giocatore trovato per la squadra ' + teamUltimoTocco };
    Object.assign(t.ball, { owner: -1, x: camp.FW / 2, y: 40, vx: 0, vy: -500, z: 0, vz: 0 });
    segnaTocco(idx);
    return { ok: true };
  };
  window.SCENA_FONDO = function (teamUltimoTocco) {
    const t = window.__test;
    const camp = t.campo;
    const idx = t.players.findIndex(p => p.team === teamUltimoTocco);
    if (idx < 0) return { errore: 'nessun giocatore trovato per la squadra ' + teamUltimoTocco };
    Object.assign(t.ball, { owner: -1, x: 60, y: camp.GY0 - 80, vx: -500, vy: 0, z: 0, vz: 0 });
    segnaTocco(idx);
    return { ok: true };
  };
}

/* =====================================================================
   ASPETTA CHE LA SCENA DIVENTI 'battuta' (o il tetto di fotogrammi
   scada, 2 s = 120 fotogrammi). Non e' un test in se': e' l'attesa
   comune a 2/3/4/6. Fatta sul lato pagina (un evaluate solo, non 120
   andate e ritorni) per non pagare il costo di rete di Playwright a
   ogni fotogramma.

   E' una STRINGA AUTOINVOCANTE (IIFE), non una funzione da passare come
   secondo argomento a page.evaluate: quando pageFunction e' una
   stringa, Playwright la valuta cosi' com'e' — un secondo argomento
   verrebbe ignorato, e "(function(x){...})" senza chiamata restituisce
   il VALORE FUNZIONE, che Playwright non sa serializzare e riporta
   undefined al lato Node (bug gia' pagato in una stesura precedente:
   `r.vista` esplodeva perche' r era undefined). Qui la IIFE si chiama
   da se', con la durata gia' scritta dentro. */
const ASPETTA_BATTUTA = `
(function(){
  const t = window.__test;
  const n = 120; // 2 s a 60 Hz
  for(let i=0;i<n;i++){
    t.simulate(1/60);
    if(t.state==='battuta') return { vista:true, fotogramma:i, battuta:t.battuta };
  }
  return { vista:false, fotogramma:n, battuta:t.battuta };
})()`;

(async () => {
  const provaRel = arg('gioco', '');
  const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME_CANTIERE);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== LE BATTUTE HANNO UN GIUDICE CHE LE ASPETTA ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));

  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => {
      const t = window.__test;
      t.dismissSplash && t.dismissSplash();
      if (t.save) t.save.tutorialDone = 1;
    });
    /* le due scene vivono lato pagina, iniettate una volta sola dopo che
       il gioco (e segnaTocco) sono gia' caricati */
    await pag.evaluate(INIETTA_SCENE);

    /* ===================================================================
       PROVA 1 — INTERRUTTORE. Nessuna simulazione: la fotografia avviene
       dentro startMatch, in modo sincrono. Tre sotto-condizioni, un solo
       verdetto (e' UNA prova nel conto delle sette).
       Prima dell'attrezzo __test.campoVero non esiste: leggerlo da'
       undefined, che non e' ===true ne' ===false — la prova esce rossa
       per costruzione, com'e' giusto (l'ordine dichiarato dal piano:
       prima l'attrezzo, poi la condanna che conta e' 2,3,4,6,7). */
    {
      const r = await pag.evaluate((seme) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'campo'; t.startMatch(1, 1, { size: 5 });
        const campoA5 = t.campoVero;
        t.save.sponde = 'gabbia'; t.startMatch(1, 1, { size: 5 });
        const gabbiaA5 = t.campoVero;
        t.save.sponde = 'gabbia'; t.startMatch(1, 1, { size: 11 });
        const gabbiaA11 = t.campoVero;
        return { campoA5, gabbiaA5, gabbiaA11 };
      }, SEME_CANTIERE);
      const ok = r.campoA5 === true && r.gabbiaA5 === false && r.gabbiaA11 === true;
      di(ok, '1. INTERRUTTORE — G.campoVero fotografa SAVE.sponde, e a 11 e\' sempre vero',
        'sponde=campo,taglia=5 -> campoVero=' + r.campoA5 + ' (atteso true)   ' +
        'sponde=gabbia,taglia=5 -> campoVero=' + r.gabbiaA5 + ' (atteso false)   ' +
        'sponde=gabbia,taglia=11 -> campoVero=' + r.gabbiaA11 + ' (atteso true)');
    }

    /* ===================================================================
       PROVA 2 — RIMESSA. Campo vero, palla libera sparata fuori dalla
       fascia nord con ultimo tocco della squadra 0: attesa scena
       'battuta', tipo 'rimessa', squadra 1 (l'opposta). */
    {
      const setup = await pag.evaluate((seme) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'campo';
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: 5 });
        return SCENA_FASCIA(0);
      }, SEME_CANTIERE).catch(e => ({ errore: e.message }));
      if (setup.errore) { di(false, '2. RIMESSA', 'BANCO: scena non costruita — ' + setup.errore); }
      else {
        const r = await pag.evaluate(ASPETTA_BATTUTA);
        const ok = r.vista && r.battuta && r.battuta.tipo === 'rimessa' && r.battuta.team === 1;
        di(ok, '2. RIMESSA — fascia nord, ultimo tocco team 0, attesa battuta rimessa/team 1',
          r.vista ? ('battuta vista al fotogramma ' + r.fotogramma + ': ' + JSON.stringify(r.battuta))
                  : ('MAI vista la scena battuta in ' + r.fotogramma + ' fotogrammi (2 s)'));
      }
    }

    /* ===================================================================
       PROVA 3 — FONDO-ANGOLO. Campo vero, palla fuori dalla luce sul
       fondo sinistro, ultimo tocco della difesa (team 0): attesa
       tipo 'angolo', squadra 1. */
    {
      const setup = await pag.evaluate((seme) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'campo';
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: 5 });
        return SCENA_FONDO(0);
      }, SEME_CANTIERE).catch(e => ({ errore: e.message }));
      if (setup.errore) { di(false, '3. FONDO-ANGOLO', 'BANCO: scena non costruita — ' + setup.errore); }
      else {
        const r = await pag.evaluate(ASPETTA_BATTUTA);
        const ok = r.vista && r.battuta && r.battuta.tipo === 'angolo' && r.battuta.team === 1;
        di(ok, '3. FONDO-ANGOLO — fondo sinistro fuori luce, ultimo tocco team 0 (difesa), attesa angolo/team 1',
          r.vista ? ('battuta vista al fotogramma ' + r.fotogramma + ': ' + JSON.stringify(r.battuta))
                  : ('MAI vista la scena battuta in ' + r.fotogramma + ' fotogrammi (2 s)'));
      }
    }

    /* ===================================================================
       PROVA 4 — FONDO-RINVIO. Stessa scena, ultimo tocco dell'attacco
       (team 1): attesa tipo 'rinvio', squadra 0 (la difesa). */
    {
      const setup = await pag.evaluate((seme) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'campo';
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: 5 });
        return SCENA_FONDO(1);
      }, SEME_CANTIERE).catch(e => ({ errore: e.message }));
      if (setup.errore) { di(false, '4. FONDO-RINVIO', 'BANCO: scena non costruita — ' + setup.errore); }
      else {
        const r = await pag.evaluate(ASPETTA_BATTUTA);
        const ok = r.vista && r.battuta && r.battuta.tipo === 'rinvio' && r.battuta.team === 0;
        di(ok, '4. FONDO-RINVIO — stessa scena, ultimo tocco team 1 (attacco), attesa rinvio/team 0',
          r.vista ? ('battuta vista al fotogramma ' + r.fotogramma + ': ' + JSON.stringify(r.battuta))
                  : ('MAI vista la scena battuta in ' + r.fotogramma + ' fotogrammi (2 s)'));
      }
    }

    /* ===================================================================
       PROVA 5 — GABBIA (la soglia 1 del piano). Save.sponde riportato
       esplicitamente al valore di default ('gabbia': e' la STESSA cosa
       di non toccarlo affatto, solo piu' robusto a un ordine di prove
       diverso), stessa scena della 2: MAI 'battuta', e il pallone deve
       rimbalzare col coefficiente di sempre (~0,82), misurato al
       fotogramma del rimbalzo — non dedotto dal codice, letto dal vivo. */
    {
      const setup = await pag.evaluate((seme) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'gabbia';
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: 5 });
        return SCENA_FASCIA(0);
      }, SEME_CANTIERE).catch(e => ({ errore: e.message }));
      if (setup.errore) { di(false, '5. GABBIA', 'BANCO: scena non costruita — ' + setup.errore); }
      else {
        const r = await pag.evaluate(`
          (function(){
            const t = window.__test;
            let vyPrima = t.ball.vy, rimbalzo = null, vistaBattuta = false;
            for(let f=0; f<120; f++){
              t.simulate(1/60);
              if(t.state==='battuta'){ vistaBattuta = true; break; }
              const vyDopo = t.ball.vy;
              if(rimbalzo===null && vyPrima<0 && vyDopo>0) rimbalzo = { prima:vyPrima, dopo:vyDopo };
              vyPrima = vyDopo;
            }
            return { vistaBattuta, rimbalzo };
          })()
        `);
        const rap = r.rimbalzo ? Math.abs(r.rimbalzo.dopo) / Math.abs(r.rimbalzo.prima) : null;
        const ok = !r.vistaBattuta && r.rimbalzo !== null && rap >= 0.75 && rap <= 0.90;
        di(ok, '5. GABBIA — soglia 1: MAI battuta, rimbalzo intatto (~0,82) sulla fascia nord',
          'battuta vista: ' + r.vistaBattuta + '   rimbalzo: ' +
          (r.rimbalzo ? ('vy ' + r.rimbalzo.prima.toFixed(1) + ' -> ' + r.rimbalzo.dopo.toFixed(1) + ', rapporto ' + rap.toFixed(3) + ' (banda 0.75-0.90)') : 'MAI osservato in 120 fotogrammi'));
      }
    }

    /* ===================================================================
       PROVA 6 — ANTI-STALLO. Riparte dalla stessa scena della prova 2:
       se la battuta non si vede mai (oggi), non c'e' nessun anti-stallo
       da misurare — la prova e' rossa per la stessa ragione della 2, non
       per un difetto suo. Se un giorno la battuta comparira', il
       verdetto vero e' "si scioglie da sola, palla viva" entro 5 s in
       piu' dopo averla vista. */
    {
      const setup = await pag.evaluate((seme) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'campo';
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: 5 });
        return SCENA_FASCIA(0);
      }, SEME_CANTIERE).catch(e => ({ errore: e.message }));
      if (setup.errore) { di(false, '6. ANTI-STALLO', 'BANCO: scena non costruita — ' + setup.errore); }
      else {
        const rBattuta = await pag.evaluate(ASPETTA_BATTUTA);
        if (!rBattuta.vista) {
          di(false, '6. ANTI-STALLO — la battuta deve sciogliersi da sola, palla viva',
            'la scena battuta non si e\' mai vista in 2 s: non c\'e\' nessun fermo da cui uscire, quindi nessun anti-stallo da misurare oggi');
        } else {
          const rDopo = await pag.evaluate(`
            (function(){
              const t = window.__test;
              const n = 300; // 5 s
              for(let i=0;i<n;i++){
                t.simulate(1/60);
                if(t.state!=='battuta'){
                  const b = t.ball;
                  const viva = (b.owner>=0) || Math.hypot(b.vx,b.vy) > 50;
                  return { sciolta:true, fotogramma:i, battuta:t.battuta, viva };
                }
              }
              return { sciolta:false, fotogramma:n, battuta:t.battuta };
            })()
          `);
          const ok = rDopo.sciolta && rDopo.battuta === null && rDopo.viva === true;
          di(ok, '6. ANTI-STALLO — la battuta deve sciogliersi da sola, palla viva',
            rDopo.sciolta ? ('scena lasciata al fotogramma ' + rDopo.fotogramma + ', battuta=' + JSON.stringify(rDopo.battuta) + ', palla viva=' + rDopo.viva)
                          : ('la scena battuta e\' rimasta ferma per 5 s in piu\', mai sciolta'));
        }
      }
    }

    /* ===================================================================
       PROVA 7 — TIRA-SPENTO. Campo vero, un giocatore (squadra 0 umana),
       un'uscita che da' rimessa alla squadra 0 (ultimo tocco della
       squadra 1, stessa geometria della fascia nord). Durante una
       finestra di 2 s si campiona __test.pulsanti(0) a ogni fotogramma:
       la cella 'shot' deve comparire con off===true. Oggi 'shot' non
       porta MAI la chiave off (CALCETTO-il-gioco.html, vicino a riga
       12631: `tira ? {act:'shot',...} : {act:'slide',...,off:...}`) —
       rossa per costruzione, qualunque cosa succeda alla palla. */
    {
      const setup = await pag.evaluate((seme) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'campo';
        t.setCpuVsCpu(false);
        t.startMatch(1, 1, { size: 5 });
        return SCENA_FASCIA(1);
      }, SEME_CANTIERE).catch(e => ({ errore: e.message }));
      if (setup.errore) { di(false, '7. TIRA-SPENTO', 'BANCO: scena non costruita — ' + setup.errore); }
      else {
        const r = await pag.evaluate(`
          (function(){
            const t = window.__test;
            let trovato = false, campioni = 0, esempi = [];
            for(let f=0; f<120 && !trovato; f++){
              t.simulate(1/60);
              const celle = t.pulsanti(0);
              const shot = celle.find(c=>c.act==='shot');
              if(shot){
                campioni++;
                if(esempi.length<1) esempi.push(shot);
                if(shot.off===true) trovato = true;
              }
            }
            return { trovato, campioni, esempi };
          })()
        `);
        di(r.trovato, '7. TIRA-SPENTO — un giocatore, rimessa al team 0, TIRA spento (act:shot, off:true) nella finestra',
          r.trovato ? 'trovata cella shot con off:true'
                    : ('mai off:true su ' + r.campioni + ' fotogrammi con cella shot presente; esempio: ' + JSON.stringify(r.esempi[0] || null)));
      }
    }

    if (ecc.length) { di(false, 'BANCO — nessuna eccezione di pagina', 'eccezione: ' + ecc[0]); }
  } catch (e) {
    console.error('FALLITO: ' + e.message);
    await browser.close(); srv.chiudi();
    process.exit(2);
  }

  await ctx.close(); await browser.close(); srv.chiudi();
  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' — ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  process.exit(rossi ? 1 : 0);
})();
