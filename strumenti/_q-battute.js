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

   IL SEME: 20260917, il seme dichiarato del cantiere (voce #87), default
   del flag --seme (cambiabile da riga di comando). Fissato sia sul
   generatore di pagina (semeFisso, per qualunque Math.random() cosmetico
   letto all'avvio) sia sul generatore interno del gioco (__test.semina,
   quello che governa dado() quando SEME.on e' acceso — sono DUE
   generatori indipendenti, vedi dado() in CALCETTO-il-gioco.html:
   "if(!SEME.on) return Math.random()").

   LA TAGLIA: 5 di default (flag --taglia), instradata in ogni
   startMatch(1,1,{size:...}) delle scene. Il sotto-caso a 11 della prova
   INTERRUTTORE resta un letterale esplicito: quella prova verifica
   proprio l'obbligo a campo vero quando la taglia e' 11, non deve
   seguire il flag.

   ZERO dado() NUOVI in questo file: le scene si costruiscono scrivendo
   direttamente lo stato del pallone (owner/x/y/z/vx/vy/vz) e chiamando
   segnaTocco(idx), la stessa funzione che il gioco chiama a ogni
   contatto vero — non si inventa un canale nuovo, si usa quello che
   gia' esiste per dichiarare "chi ha toccato per ultimo".

   uso:  node strumenti/_q-battute.js
         node strumenti/_q-battute.js --gioco fuori/calcetto-base-7ed570a.html
         node strumenti/_q-battute.js --taglia 7 --seme 123
   esce 0 se tutte le prove sono verdi, 1 se almeno una e' rossa,
   2 se il banco stesso e' esploso (pagina, hook mancante, eccezione),
   3 riservato a "prova nulla" sul modello di _q-replay.js/_q-l16.js —
   nessuna delle sette prove di oggi lo usa: ciascuna o misura o e' rossa
   per costruzione, non c'e' un caso "non misurabile" distinto dal rosso.

   IL DENOMINATORE E' CONDIZIONALE: il riepilogo finale legge "N prove su
   M" con M pari al numero di prove dichiarate qui sopra (11, a regime).
   Se pero' durante la corsa la pagina lancia un'eccezione, si aggiunge
   una prova in piu' ("BANCO — nessuna eccezione di pagina", sempre
   rossa) e il riepilogo passa a N/12: compare solo a cancello gia' rosso
   per conto suo, mai come unica causa del rosso.

   RETTIFICA (17 settembre 2026, compito 3): la riga 20-21 qui sopra
   diceva "questo file non cambia piu' dopo, sono le prove che smettono
   di fallire" — era la promessa del compito 1, superata dal piano
   stesso: il compito 3 aggiunge DUE prove nuove (il piano lo prevede
   esplicitamente, "Modificare: strumenti/_q-battute.js, due prove
   nuove"), le sette di sopra restano scritte come allora e non
   cambiano una virgola:
     8. BATTUTA-UMANA — squadra 0 umana, rimessa al team 0: attesa la
        finestra viva (state torna 'play' con battuta ancora pendente),
        poi un tocco sintetico sul disco PASSA (pattern del COPIONE di
        _q-replay.js). Entro 0,5s la battuta deve sciogliersi.
     9. RISPETTO — CPU contro CPU: dalla comparsa della battuta allo
        scioglimento (o al tetto di 5s), nessun avversario deve mai
        scendere sotto 40 unita' di distanza dal battitore (la guardia
        in aiDecide, voce #87 compito 3).
   Il file era a nove prove; l'exit code 3 resta non usato da nessuna.

   RETTIFICA (17 settembre 2026, sera — correzione di revisione compito
   3, decisione del committente sul rilievo "imposto dal piano"). La via
   chargeClip per la clip di rimessa (prove 8/9 qui sopra non la
   toccavano) si e' rivelata cieca in partita vera: la carica umana dura
   0-3 fotogrammi e la battuta CPU (eseguiAiPass -> kickBall diretto) non
   passa affatto dalla carica — la clip non arrivava mai a schermo per
   davvero. La cura (strumenti/_t-rimessa-clip.js) sposta la clip su un
   cronometro di solo disegno, p.rimT, armato da kickBall quando il
   battitore consuma una rimessa, sul modello di rinvT/rinvioPortiere.
   QUESTO FILE GUADAGNA LA DECIMA PROVA, la condanna dedicata:
    10. CLIP-RIMESSA — CPU contro CPU, campo vero, rimessa alla fascia
        nord (stessa geometria della prova 2/9): dal fotogramma in cui
        G.battuta si azzera (la battuta e' consumata, il calcio e'
        partito), il battitore deve mostrare la clip 'rimessa' per
        almeno 6 fotogrammi consecutivi, letta via __test.poseInCampo()
        (idx+team del battitore, catturati mentre la battuta e' ancora
        pendente, sono la chiave stabile: il campo esiste gia' e basta,
        nessuna estensione dell'hook).
   Il file e' adesso a dieci prove; l'exit code 3 resta non usato.

   NOTA su BATTUTA-UMANA (prova 8): resta VERDE anche sul codice di prima
   di questa stessa correzione (il pre-cura del compito 3) — preme il
   disco PASSA e misura la finestra viva del compito 2 (t.state torna
   'play' con t.battuta ancora pendente), non il difetto di chargeClip
   che questa rettifica cura. La condanna che avrebbe fermato quella
   regressione la portano TIRA-SPENTO (prova 7, sulla guardia off) e
   CLIP-RIMESSA (prova 10 qui sopra, sulla clip stessa).

   RETTIFICA (voce #87, compito 4 — il fondo e' vero: l'angolo e il
   rinvio). FONDO-ANGOLO e FONDO-RINVIO (prove 3/4, scritte al compito 1
   e rosse fino ad oggi) diventano verdi con questo compito: ballWalls()
   sa ormai smistare il fondo fuori dalla luce fra angolo e rinvio, e
   posaBattuta() sa piazzarli entrambi. QUESTO FILE GUADAGNA L'UNDICESIMA
   PROVA, la condanna dedicata all'angolo giocato (non solo assegnato):
    11. ANGOLO-IN-AREA — CPU contro CPU, campo vero, taglia 5 (stessa
        geometria di FONDO-ANGOLO): dalla RIPRESA (il fotogramma in cui
        G.battuta si azzera, lo stesso riferimento di CLIP-RIMESSA)
        entro 2,5s la palla deve entrare nel rettangolo d'area della
        porta attaccata (VERNICE.areaProf/areaSemi da t.proporzioni(),
        la stessa formula del disegno del campo) oppure essere toccata
        da un corpo che si trova dentro quel rettangolo (raggio KICK_R).
        Nata rossa sul gioco pre-compito 4 (l'angolo non esiste: la
        battuta di tipo 'angolo' non compare mai), verde sul curato.
   Il file e' adesso a undici prove; l'exit code 3 resta non usato.
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

const SEME_CANTIERE = 20260917;   // il seme dichiarato della voce #87, default del flag --seme
const TAGLIA_BANCO = +arg('taglia', 5);   // taglia delle scene (INTERRUTTORE resta a 5/11 espliciti)
const SEME = +arg('seme', SEME_CANTIERE);

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
  await pag.addInitScript(semeFisso, SEME);
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
      const r = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'campo'; t.startMatch(1, 1, { size: taglia });
        const campoA5 = t.campoVero;
        t.save.sponde = 'gabbia'; t.startMatch(1, 1, { size: taglia });
        const gabbiaA5 = t.campoVero;
        t.save.sponde = 'gabbia'; t.startMatch(1, 1, { size: 11 });
        const gabbiaA11 = t.campoVero;
        return { campoA5, gabbiaA5, gabbiaA11 };
      }, { seme: SEME, taglia: TAGLIA_BANCO });
      const ok = r.campoA5 === true && r.gabbiaA5 === false && r.gabbiaA11 === true;
      di(ok, '1. INTERRUTTORE — G.campoVero fotografa SAVE.sponde, e a 11 e\' sempre vero',
        'sponde=campo,taglia=' + TAGLIA_BANCO + ' -> campoVero=' + r.campoA5 + ' (atteso true)   ' +
        'sponde=gabbia,taglia=' + TAGLIA_BANCO + ' -> campoVero=' + r.gabbiaA5 + ' (atteso false)   ' +
        'sponde=gabbia,taglia=11 -> campoVero=' + r.gabbiaA11 + ' (atteso true)');
    }

    /* ===================================================================
       PROVA 2 — RIMESSA. Campo vero, palla libera sparata fuori dalla
       fascia nord con ultimo tocco della squadra 0: attesa scena
       'battuta', tipo 'rimessa', squadra 1 (l'opposta). */
    {
      const setup = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'campo';
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
        return SCENA_FASCIA(0);
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
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
      const setup = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'campo';
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
        return SCENA_FONDO(0);
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
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
      const setup = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'campo';
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
        return SCENA_FONDO(1);
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
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
      const setup = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'gabbia';
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
        return SCENA_FASCIA(0);
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
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
       PROVA 6 — ANTI-STALLO (voce #87, correzione revisione compito 2).
       La stesura precedente pretendeva t.battuta===null esattamente al
       PRIMO fotogramma con t.state!=='battuta' — un'assunzione PIU'
       FORTE dello spec, che misurava "si risolve all'uscita di scena",
       non "il fermo e' breve e la palla non resta mai bloccata". Con
       quella misura sbagliata l'implementazione aveva convenienza a
       tenere l'intera finestra dentro la scena 'battuta' (fermo + hold
       insieme, fino a 3,8 s) pur di far coincidere i due eventi sullo
       stesso fotogramma: il difetto che la revisione ha condannato.

       Questa versione misura le DUE promesse vere dello spec, dalla
       PRIMA comparsa della battuta di rimessa (t.battuta non-null, tipo
       'rimessa' — la stessa attesa della prova 2, ASPETTA_BATTUTA):
         (a) FERMO BREVE — entro 1,2 s di simulazione t.state==='play'
             (soglia di spec: rimessa ~0,8 s; 1,2 s da' margine di
             misura senza coprire il difetto condannato, che era 3,8 s
             e quindi restrebbe rossissimo anche con questo margine);
         (b) SCIOGLIMENTO — entro 5 s totali t.battuta===null E palla
             viva (b.owner>=0 oppure la sua velocita' supera 50).
       Le due soglie si misurano nello stesso giro di simulazione,
       accumulando il tempo trascorso dalla comparsa della battuta. */
    {
      const setup = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'campo';
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
        return SCENA_FASCIA(0);
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (setup.errore) { di(false, '6. ANTI-STALLO', 'BANCO: scena non costruita — ' + setup.errore); }
      else {
        const rBattuta = await pag.evaluate(ASPETTA_BATTUTA);
        if (!rBattuta.vista || !rBattuta.battuta || rBattuta.battuta.tipo !== 'rimessa') {
          di(false, '6. ANTI-STALLO — fermo breve (<=1,2s) e scioglimento (<=5s), palla viva',
            'la battuta di rimessa non e\' mai comparsa in 2 s: nessun fermo da cui misurare fermo breve o scioglimento');
        } else {
          const rDopo = await pag.evaluate(`
            (function(){
              const t = window.__test;
              const n = 300; // 5 s dalla prima comparsa della battuta di rimessa
              let fermoT = null;
              for(let i=0;i<n;i++){
                t.simulate(1/60);
                const tempo = (i+1)/60;
                if(fermoT===null && t.state==='play') fermoT = tempo;
                if(t.battuta===null){
                  const b = t.ball;
                  const viva = (b.owner>=0) || Math.hypot(b.vx,b.vy) > 50;
                  return { fermoT, sciolta:true, tempoScioglimento:tempo, viva };
                }
              }
              return { fermoT, sciolta:false, tempoScioglimento:null, viva:null };
            })()
          `);
          const fermoOk = rDopo.fermoT !== null && rDopo.fermoT <= 1.2;
          const sciogliOk = rDopo.sciolta && rDopo.tempoScioglimento <= 5 && rDopo.viva === true;
          const ok = fermoOk && sciogliOk;
          di(ok, '6. ANTI-STALLO — fermo breve (<=1,2s) e scioglimento (<=5s), palla viva',
            '(a) FERMO BREVE: state=play a ' + (rDopo.fermoT === null ? 'MAI' : rDopo.fermoT.toFixed(3) + 's') + ' (soglia 1,2s)   ' +
            '(b) SCIOGLIMENTO: ' + (rDopo.sciolta ? ('battuta=null a ' + rDopo.tempoScioglimento.toFixed(3) + 's, palla viva=' + rDopo.viva) : 'MAI sciolta in 5s') + ' (soglia 5s)');
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
      const setup = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'campo';
        t.setCpuVsCpu(false);
        t.startMatch(1, 1, { size: taglia });
        return SCENA_FASCIA(1);
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
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

    /* ===================================================================
       PROVA 8 — BATTUTA-UMANA (voce #87, compito 3). Campo vero, squadra
       0 umana (setCpuVsCpu(false)), rimessa al team 0 (stessa geometria
       di TIRA-SPENTO: ultimo tocco della squadra 1). Si aspetta prima la
       comparsa della battuta, poi la FINESTRA VIVA (t.state torna 'play'
       con t.battuta ancora pendente — la correzione del compito 2), poi
       si preme il disco PASSA con un tocco sintetico secco (pattern del
       COPIONE di _q-replay.js: Touch5.start seguito da Touch5.chiudi
       nello stesso istante, sulle coordinate vere lette da
       __test.pulsanti(0)). Entro 0,5 s la battuta deve sciogliersi
       (t.battuta===null) — kickBall e' l'imbuto che la azzera a ogni
       battuta vera, da qualunque via arrivi. */
    {
      const setup = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'campo';
        t.setCpuVsCpu(false);
        t.startMatch(1, 1, { size: taglia });
        return SCENA_FASCIA(1);
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (setup.errore) { di(false, '8. BATTUTA-UMANA', 'BANCO: scena non costruita — ' + setup.errore); }
      else {
        const rBattuta = await pag.evaluate(ASPETTA_BATTUTA);
        if (!rBattuta.vista || !rBattuta.battuta || rBattuta.battuta.team !== 0) {
          di(false, '8. BATTUTA-UMANA — PASSA scioglie la rimessa entro 0,5s',
            'la battuta al team 0 non e\' mai comparsa in 2s: ' + JSON.stringify(rBattuta.battuta));
        } else {
          const r = await pag.evaluate(`
            (function(){
              const t = window.__test;
              const nFermo = 90; // fino a 1,5s per lasciare il fermo minimo (soglia di spec 0,8-1,2s)
              let uscita = false;
              for(let f=0; f<nFermo; f++){
                t.simulate(1/60);
                if(t.state==='play' && t.battuta){ uscita = true; break; }
              }
              if(!uscita) return { uscita:false };
              const celle = t.pulsanti(0);
              const passa = celle.find(c=>c.act==='pass');
              if(!passa) return { uscita:true, passa:null };
              const id = 777001;
              Touch5.start(id, passa.x, passa.y);
              Touch5.chiudi(id, false);
              const n = 30; // 0,5s dal tocco
              for(let f=0; f<n; f++){
                t.simulate(1/60);
                if(t.battuta===null){
                  return { uscita:true, passa:true, sciolta:true, fotogramma:f,
                           ownerDopo:t.ball.owner, velDopo:Math.hypot(t.ball.vx,t.ball.vy) };
                }
              }
              return { uscita:true, passa:true, sciolta:false, ownerDopo:t.ball.owner };
            })()
          `);
          const ok = r.uscita && r.passa && r.sciolta === true;
          di(ok, '8. BATTUTA-UMANA — PASSA scioglie la rimessa entro 0,5s',
            !r.uscita ? 'la scena non e\' mai tornata a play con battuta pendente in 1,5s'
              : !r.passa ? 'BANCO: cella act:pass non trovata in t.pulsanti(0)'
              : r.sciolta ? ('battuta sciolta al fotogramma ' + r.fotogramma + ' dal tocco, owner=' + r.ownerDopo + ', velocita=' + r.velDopo.toFixed(1))
                          : ('battuta MAI sciolta in 0,5s dal tocco, owner=' + r.ownerDopo));
        }
      }
    }

    /* ===================================================================
       PROVA 9 — RISPETTO (voce #87, compito 3). CPU contro CPU, campo
       vero, rimessa alla fascia nord (stessa geometria della prova 2).

       PERCHE' SI MISURA IL BERSAGLIO (aiTX/aiTY) E NON LA POSIZIONE VERA:
       misurato a mano prima di scrivere la prova (diagnosi frame-per-
       frame, non committata) — la finestra CPU-contro-CPU e' cortissima
       (il fermo dura ~0,8s congelato, poi la CPU batte al suo timer
       ~0,5s dopo: sul file curato, in questa scena, restano vivi 5-25
       fotogrammi, 0,08-0,4s), troppo poco perche' un inseguitore si
       sposti fisicamente di piu' di pochi metri anche mirando dritto
       al bersaglio — la distanza VERA resta larga (>240 unita') sia sul
       gioco curato sia su quello senza la guardia, e non condanna mai:
       misura il tempo che manca, non il rispetto. La guardia in
       aiDecide invece decide un'altra cosa, subito e senza aspettare il
       moto: DOVE punta il passo del difensore (p.aiTX/p.aiTY, lo stesso
       campo che muove il corpo un fotogramma dopo). Sul gioco pre-cura,
       misurato: un avversario punta a 1,7 unita' dal battitore (lo sta
       aggredendo, anche se il tempo non basta per arrivarci) — sul
       gioco curato lo stesso bersaglio non scende mai sotto 140 unita'.
       La prova misura quindi, a ogni fotogramma della finestra, la
       distanza minima fra OGNI bersaglio-passo di un avversario
       (squadra diversa dal battitore, portiere escluso: la sua meta e'
       un'altra funzione) e la posizione VERA del battitore: deve
       restare sempre >= 40 unita'.

       L'ORDINE setCpuVsCpu/startMatch E' INVERTITO rispetto alle altre
       prove di questo file (qui prima startMatch, poi setCpuVsCpu):
       startMatch riscrive SEMPRE G.cpu=[false,...] in testa a se
       stesso, quindi un setCpuVsCpu(true) chiamato PRIMA viene
       cancellato in silenzio e la squadra 0 resta "umana" (ferma, senza
       tocchi). Le prove 2/5/6 non se ne accorgono perche' non guardano
       il moto della squadra 0; questa si', e senza l'inversione
       misurerebbe una squadra congelata invece di una CPU vera
       (misurato: con l'ordine vecchio il "vic" di prova non si muove
       di un pixel per l'intera finestra). */
    {
      const setup = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'campo';
        t.startMatch(1, 1, { size: taglia });
        t.setCpuVsCpu(true);
        return SCENA_FASCIA(0);
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (setup.errore) { di(false, '9. RISPETTO', 'BANCO: scena non costruita — ' + setup.errore); }
      else {
        const rBattuta = await pag.evaluate(ASPETTA_BATTUTA);
        if (!rBattuta.vista || !rBattuta.battuta) {
          di(false, '9. RISPETTO — nessun avversario punta entro 40 unita\' dal battitore per tutta la finestra',
            'la battuta di rimessa non e\' mai comparsa in 2s: nessuna finestra da misurare');
        } else {
          const r = await pag.evaluate(`
            (function(){
              const t = window.__test;
              const n = 300; // 5s, lo stesso tetto di ANTI-STALLO
              let minTarget = Infinity, chi = -1, frameMin = -1, risolta = false, fineFotogramma = n;
              for(let f=0; f<n; f++){
                t.simulate(1/60);
                if(!t.battuta){ risolta = true; fineFotogramma = f; break; }
                const bat = t.players[t.battuta.battitore];
                if(!bat) continue;
                for(let i=0;i<t.players.length;i++){
                  const q = t.players[i];
                  if(q.team === t.battuta.team || q.role==='gk' || q.aiTX===undefined) continue;
                  const d = Math.hypot(q.aiTX-bat.x, q.aiTY-bat.y);
                  if(d < minTarget){ minTarget = d; chi = i; frameMin = f; }
                }
              }
              return { minTarget, chi, frameMin, risolta, fineFotogramma };
            })()
          `);
          const ok = r.minTarget >= 40;
          di(ok, '9. RISPETTO — nessun avversario punta entro 40 unita\' dal battitore per tutta la finestra',
            'bersaglio (aiTX/aiTY) piu\' vicino osservato: ' + (r.minTarget === Infinity ? 'nessun fotogramma misurato' : r.minTarget.toFixed(1) + ' unita\' (giocatore ' + r.chi + ') al fotogramma ' + r.frameMin) +
            '  (finestra ' + (r.risolta ? ('sciolta al fotogramma ' + r.fineFotogramma) : ('MAI sciolta in ' + n + ' fotogrammi')) + ')');
        }
      }
    }

    /* ===================================================================
       PROVA 10 — CLIP-RIMESSA (rettifica del 17 settembre, correzione di
       revisione compito 3). CPU contro CPU, campo vero, rimessa alla
       fascia nord (stessa geometria delle prove 2/9). La condanna: dal
       fotogramma in cui G.battuta si azzera (la battuta e' consumata,
       kickBall ha fatto partire il pallone) il battitore deve mostrare
       la clip 'rimessa' per almeno 6 fotogrammi CONSECUTIVI.

       L'IDENTITA' DEL BATTITORE si cattura mentre t.battuta e' ancora
       pendente (t.players[t.battuta.battitore].idx/.team): dopo che la
       battuta si scioglie t.battuta e' null e l'indice del battitore
       si perde da li', ma idx+team restano un giocatore stabile per
       tutta la partita e sono la chiave con cui si cerca la sua riga
       dentro __test.poseInCampo().

       LA LETTURA E' t.disegna()+t.poseInCampo(), non t.players[i].
       poseClip direttamente: poseInCampo() e' l'hook dichiarato dal
       brief, ed espone gia' idx/team/clip — verificato leggendone la
       definizione (CALCETTO-il-gioco.html, vicino a 42866): basta cosi',
       nessuna estensione. t.simulate() fa avanzare la fisica ma NON
       ridisegna (il suo stesso commento lo dice): senza t.disegna() ad
       ogni fotogramma, poseClip resterebbe quello dell'ultimo rendering
       vero e la misura leggerebbe uno stato vecchio — lo stesso pattern
       gia' in uso in strumenti/seme.js (t.simulate(...); t.disegna();
       prima di leggere t.poseInCampo()). */
    {
      const setup = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'campo';
        t.startMatch(1, 1, { size: taglia });
        t.setCpuVsCpu(true);
        return SCENA_FASCIA(0);
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (setup.errore) { di(false, '10. CLIP-RIMESSA', 'BANCO: scena non costruita — ' + setup.errore); }
      else {
        const rBattuta = await pag.evaluate(ASPETTA_BATTUTA);
        if (!rBattuta.vista || !rBattuta.battuta) {
          di(false, '10. CLIP-RIMESSA — 6 fotogrammi consecutivi di clip \'rimessa\' dal calcio',
            'la battuta di rimessa non e\' mai comparsa in 2s: nessuna finestra da misurare');
        } else {
          const ident = await pag.evaluate(() => {
            const t = window.__test;
            const bp = t.battuta ? t.players[t.battuta.battitore] : null;
            return bp ? { idx: bp.idx, team: bp.team } : null;
          });
          if (!ident) {
            di(false, '10. CLIP-RIMESSA — 6 fotogrammi consecutivi di clip \'rimessa\' dal calcio',
              'BANCO: il battitore e\' gia\' sparito prima di poterne leggere idx/team');
          } else {
            const r = await pag.evaluate(({ idx, team }) => {
              const t = window.__test;
              const n = 300; // 5s, lo stesso tetto di ANTI-STALLO/RISPETTO
              let fClear = -1;
              const trace = [];
              for (let f = 0; f < n; f++) {
                t.simulate(1 / 60);
                t.disegna();
                if (fClear < 0 && t.battuta === null) fClear = f;
                if (fClear >= 0) {
                  const pose = t.poseInCampo().find(p => p.idx === idx && p.team === team);
                  trace.push(pose ? pose.clip : null);
                  if (trace.length >= 6) break;
                }
              }
              return { fClear, trace };
            }, ident);
            const ok = r.fClear >= 0 && r.trace.length === 6 && r.trace.every(c => c === 'rimessa');
            di(ok, '10. CLIP-RIMESSA — 6 fotogrammi consecutivi di clip \'rimessa\' dal calcio',
              r.fClear < 0 ? ('G.battuta non si e\' mai azzerato in ' + 300 + ' fotogrammi (5s)')
                : ('battuta azzerata al fotogramma ' + r.fClear + ', clip nei 6 fotogrammi seguenti: [' + r.trace.join(', ') + ']'));
          }
        }
      }
    }

    /* ===================================================================
       PROVA 11 — ANGOLO-IN-AREA (voce #87, compito 4). CPU contro CPU,
       campo vero, taglia 5 (SCENA_FONDO(0): fondo sinistro fuori luce,
       ultimo tocco della difesa - team 0 - la STESSA geometria di
       FONDO-ANGOLO, prova 3, che qui produce un angolo per il team 1 sul
       quadrante nord-ovest). La condanna: dalla RIPRESA - il fotogramma
       in cui G.battuta si azzera, il calcio d'angolo e' partito davvero,
       lo stesso riferimento di CLIP-RIMESSA (prova 10) - entro 2,5s la
       palla entra nel rettangolo d'area della porta attaccata, OPPURE
       viene toccata da un corpo (un giocatore qualunque) che si trova
       dentro quel rettangolo nello stesso istante.

       IL RETTANGOLO D'AREA si legge da t.proporzioni() (VERNICE.areaProf/
       areaSemi), la STESSA formula del disegno del campo (gRett, vicino a
       CALCETTO-il-gioco.html:28198: x da 0 a AREA_W per la porta
       sinistra, o da FW-AREA_W a FW per la destra; y da FH/2-AREA_H/2 a
       FH/2+AREA_H/2, con AREA_H=areaSemi*2) - non un numero scritto a
       mano. IL RAGGIO DI CONTATTO e' KICK_R (26 unita', letto anch'esso
       da t.proporzioni()), la stessa soglia con cui kickBall decide se un
       calcio e' calciabile: "un corpo in area tocca la palla" vuol dire
       che un giocatore dentro il rettangolo sta a quella distanza o meno
       dal pallone. */
    {
      const setup = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.save.sponde = 'campo';
        t.startMatch(1, 1, { size: taglia });
        t.setCpuVsCpu(true);
        return SCENA_FONDO(0);
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (setup.errore) { di(false, '11. ANGOLO-IN-AREA', 'BANCO: scena non costruita — ' + setup.errore); }
      else {
        const rBattuta = await pag.evaluate(ASPETTA_BATTUTA);
        if (!rBattuta.vista || !rBattuta.battuta || rBattuta.battuta.tipo !== 'angolo') {
          di(false, '11. ANGOLO-IN-AREA — la palla entra in area (o vi viene toccata) entro 2,5s dalla ripresa',
            'l\'angolo non e\' mai comparso in 2s: ' + JSON.stringify(rBattuta.battuta));
        } else {
          const atkTeam = rBattuta.battuta.team;
          const r = await pag.evaluate(({ atkTeam }) => {
            const t = window.__test;
            const prop = t.proporzioni();
            const gx = atkTeam === 0 ? prop.FW : 0;
            const x0 = gx === 0 ? 0 : prop.FW - prop.VERNICE.areaProf;
            const x1 = x0 + prop.VERNICE.areaProf;
            const y0 = prop.FH / 2 - prop.VERNICE.areaSemi;
            const y1 = prop.FH / 2 + prop.VERNICE.areaSemi;
            const KICK_R = prop.KICK_R;
            const dentro = (v, a, c) => v >= a && v <= c;
            const n = 450; // margine ampio: attesa fClear + 2,5s di misura vera
            let fClear = -1, esito = null;
            for (let f = 0; f < n; f++) {
              t.simulate(1 / 60);
              if (fClear < 0) {
                if (t.battuta === null) fClear = f;
                continue;
              }
              const tempo = (f - fClear + 1) / 60;
              const b = t.ball;
              const ballInArea = dentro(b.x, x0, x1) && dentro(b.y, y0, y1);
              const corpoInArea = t.players.some(q =>
                dentro(q.x, x0, x1) && dentro(q.y, y0, y1) && Math.hypot(q.x - b.x, q.y - b.y) <= KICK_R);
              if (ballInArea || corpoInArea) { esito = { fotogramma: f, tempo, ballInArea, corpoInArea }; break; }
              if (tempo > 2.5) break;
            }
            return { fClear, esito };
          }, { atkTeam });
          const ok = r.fClear >= 0 && r.esito !== null;
          di(ok, '11. ANGOLO-IN-AREA — la palla entra in area (o vi viene toccata) entro 2,5s dalla ripresa',
            r.fClear < 0 ? 'G.battuta non si e\' mai azzerato in 7,5s: nessuna ripresa da cui misurare'
              : (r.esito ? ('entrata al fotogramma ' + r.esito.fotogramma + ', ' + r.esito.tempo.toFixed(3) + 's dalla ripresa (ballInArea=' + r.esito.ballInArea + ', corpoInArea=' + r.esito.corpoInArea + ')')
                         : 'mai entrata ne\' toccata in area entro 2,5s dalla ripresa'));
        }
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
