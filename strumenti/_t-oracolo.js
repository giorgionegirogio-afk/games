/* =====================================================================
   _t-oracolo.js — L'ETICHETTA MISURATA CONTRO LA REGOLA CHE IL GIOCO
   SCRIVE DA SE'.

   PERCHE' ESISTE. La sonda precedente (_t-sonda-etichetta.js) contava
   l'etichetta contro «di chi e' la palla», e quella verita' la scriveva
   con la STESSA espressione della toppa che voleva giudicare
   (`owner>=0?owner:passTo`). Un falso negativo a zero, li', e' un
   teorema, non una misura. Qui l'oracolo e' un altro, ed e' quello che
   il gioco dichiara a CALCETTO-il-gioco.html:8776:

       «L'ETICHETTA DICE QUELLO CHE IL DITO FARA', SEMPRE»

   Quindi la verita' NON e' la proprieta' del pallone: e' se il gesto
   promesso dal pulsante PRODUCE QUALCOSA in quell'istante. Si legge
   dalle precondizioni delle quattro azioni, non dalla toppa:

     atto TIRA        startCharge(:9205): c'e' un uomo controllato, non
                      sta scivolando / rialzandosi / in rovesciata, e la
                      palla e' sua oppure entro KICK_R*1,4 — oppure la
                      finestra della rovesciata e' aperta.
     atto FILTRANTE   doFiltrante(:9127): palla sua o entro KICK_R.
     atto CONTRASTA   startSlide(:9501): non sta gia' scivolando ne'
                      rialzandosi, e non ha una carica gia' lanciata.
     atto CAMBIO      cambiaGiocatore(:9956): almeno due uomini di
                      movimento in campo.

   Nessuna di queste espressioni compare in nessuna toppa candidata:
   l'oracolo puo' bocciare tutti i candidati, compreso quello di casa.

   COME NON MENTE, E DOVE INVECE E' UN RIPIEGO.
   * La squadra 0 e' UMANA (G.cpu[0] = false), percio' G.ctrl[0] esiste e
     «l'uomo controllato» ha un significato. In CPU contro CPU
     `ctrlPlayer(0)` e' nullo e questa misura non si puo' nemmeno porre:
     e' il motivo per cui il banco vecchio non poteva vederla.
   * Il dito e' un ROBOT deterministico che scrive nello stick
     (`Touch5.stick[0]`) e chiama startCharge/releaseCharge/doFiltrante/
     doSlide direttamente. Chiama in base allo STATO DEL PALLONE, mai in
     base all'etichetta: cosi' la partita generata e' IDENTICA per tutti
     i candidati, ed e' l'unica condizione che rende onesto confrontarli
     sulla stessa traccia. Un robot che leggesse l'etichetta darebbe a
     ogni candidato una partita diversa.
   * `possessoTeam` non e' letto da nessuna riga di fisica o di IA (unico
     chiamante: touchBtnLayout, :8798), e in questo banco il disegno e'
     spento: cambiare candidato non puo' cambiare la traccia. Questa
     proprieta' e' VERIFICATA dal banco stesso (--diagnosi confronta due
     corse su pagina nuova).
   * RIPIEGO DICHIARATO: il robot non e' una mano. Sa dove va la palla,
     non sbaglia i tempi, e non si e' mai fatto ingannare da un pulsante.
     I valori assoluti vanno letti come ordini di grandezza; il CONFRONTO
     fra candidati sulla stessa traccia e' invece stretto.

   DUE CONTROLLI CHE POSSONO BOCCIARE IL BANCO STESSO.
   1. L'ORACOLO CONTRO LA FUNZIONE VERA. La colonna «promessa» usa un
      predicato riscritto a mano. Ogni volta che il robot preme davvero
      il pulsante grande — e lo preme anche a vuoto, ogni 90 fotogrammi,
      apposta — il predicato viene confrontato con quello che
      startCharge ha FATTO. Zero disaccordi o il banco non vale niente.
   2. I CANDIDATI CONTRO IL CODICE VERO. La prima riga della tabella,
      «gioco», e' `possessoTeam()` del file caricato. Girando il banco su
      un gioco toppato, quella riga deve coincidere con la riga del
      candidato che imita quella toppa. (Fatto: sulla vecchia toppa a+b,
      «gioco» e «passTo» differiscono di 3 fotogrammi su 44.679, cioe'
      lo 0,007%, e la differenza e' l'orologio — G.pulse contro
      l'orologio proprio del banco.)

   COSA STAMPA. Per ogni candidato, sulla stessa traccia:
     promessa mancata   dice TIRA e startCharge non farebbe niente
     occasione persa    potrebbe tirare e dice CONTRASTA
     verbi difensivi negati: quanti fotogrammi e quante AZIONI —
       le finestre da mezzo secondo che si aprono nell'istante in cui il
       pallone ci viene strappato, e in cui CONTRASTA/CAMBIO non ci sono
     sfarfallio         cambi, intervalli sotto 0,25 s e sotto 0,08 s
   Piu' l'anagrafe dei voli di passaggio (durata, velocita', quanti
   finiscono davvero fra i nostri piedi): serve a decidere se `b.passTo`
   va rancido, e a quale taglia.

   uso:
     node strumenti/_t-oracolo.js
     node strumenti/_t-oracolo.js --taglia 11 --partite 6
     node strumenti/_t-oracolo.js --gioco fuori/dopo.html
     node strumenti/_t-oracolo.js --json fuori/or5.json
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

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

/* --------------------------------------------------------------- sonda */
const SONDA = `(() => {
  if (window.__or) return 'gia-installata';
  const T = 0;                       // la squadra umana
  const RAGGIO = 80;                 // il pollice va a fondo corsa, come quello vero
  const SOGLIA_V = 150;              // u/s: sotto, un "passaggio" non e' piu' un passaggio
  const SOGLIA_T = 0.60;             // s di volo: oltre, il bersaglio non e' piu' un bersaglio

  /* ---------------- i candidati. Ognuno ha la sua memoria. ------------ */
  function nuoviCandidati(){
    return [
      /* LA VERITA' DEL FILE CARICATO. Non e' un candidato: e' il controllo
         che i candidati qui sotto siano copie fedeli. Girando questo banco
         su un gioco toppato, la riga "gioco" deve coincidere con la riga
         del candidato che imita quella toppa. Se non coincide, i candidati
         sono finzioni e non si legge nient'altro. */
      { id:'gioco',       desc:'possessoTeam() del file caricato: il controllo di fedelta',
        f:() => !!possessoTeam(T) },
      { id:'oggi',        desc:'owner mio (il gioco di oggi)',
        f:c => c.own===T },
      { id:'passTo',      desc:'owner|passTo + isteresi 0,25 s (toppa a1)',
        s:{v:false,t:-9},
        f(c){ const i = c.own>=0 ? c.own : c.pass; const vero = i===T;
              const s=this.s;
              if(vero!==s.v && (vero || i>=0 || c.pulse-s.t>=0.25)){ s.v=vero; s.t=c.pulse; }
              else if(vero===s.v) s.t=c.pulse;
              return s.v; } },
      { id:'passTo+g',    desc:'come sopra ma il volo scade (>'+SOGLIA_T+' s o <'+SOGLIA_V+' u/s)',
        s:{v:false,t:-9},
        f(c){ const vivo = c.pass>=0 && c.sp>=SOGLIA_V && c.eta<=SOGLIA_T;
              const i = c.own>=0 ? c.own : (vivo ? c.pass : -1); const vero = i===T;
              const s=this.s;
              if(vero!==s.v && (vero || i>=0 || c.pulse-s.t>=0.25)){ s.v=vero; s.t=c.pulse; }
              else if(vero===s.v) s.t=c.pulse;
              return s.v; } },
      { id:'portata',     desc:'owner mio, oppure palla di nessuno a portata di piede',
        f:c => c.own===T ? true : (c.own>=0 ? false : c.aPortata) },
      { id:'portata+pT',  desc:'portata + volo vivo verso di noi',
        f:c => c.own===T ? true : (c.own>=0 ? false : (c.aPortata || (c.pass===T && c.sp>=SOGLIA_V && c.eta<=SOGLIA_T))) },
      { id:'portata+is',  desc:'portata, con 0,25 s di tenuta sulla palla di nessuno',
        s:{v:false,t:-9},
        f(c){ const s=this.s;
              if(c.own>=0){ const vero=c.own===T; if(vero!==s.v){ s.v=vero; } s.t=c.pulse; return s.v; }
              if(c.aPortata){ s.v=true; s.t=c.pulse; return true; }
              if(s.v && c.pulse-s.t<0.25) return true;
              s.v=false; return false; } },
      { id:'oggi&atto',   desc:'owner mio E il piede ci arriva (TAUTOLOGICO sulla colonna promessa)',
        f:c => c.own===T && c.attoTiro },
      { id:'atto',        desc:'la regola nuda di :8776 (TAUTOLOGICO sulla colonna promessa)',
        f:c => c.attoTiro },
    ];
  }

  const S = {};
  const azzera = () => {
    S.f=0; S.clock=0;
    S.own=[0,0,0];                 // nostra / loro / di nessuno
    S.attoTiro=0; S.attoFiltr=0; S.attoSlide=0; S.attoSwap=0;
    S.nostraGK=0; S.nostraLontano=0;
    S.vN=0; S.vDis=0; S.vProve=0;
    S.voli=[]; S._volo=null;
    S.strappi=0; S._strappo=0; S._ownPrec=-2;
    S.cand = nuoviCandidati().map(c => ({
      id:c.id, desc:c.desc, f:c.f, s:c.s,
      lab:0, prom:0, occ:0,
      negLoro:0, negLibera:0,
      strappiSporchi:0, strappiFrames:0,
      cambi:0, run5:0, run15:0, runN:0, _lab:null, _da:0
    }));
  };
  azzera();

  const _step = window.step;
  const idx = p => G.players.indexOf(p);

  /* ---- L'ORACOLO NON E' UN'OPINIONE: SI VERIFICA CONTRO LA FUNZIONE VERA.
     La colonna "promessa" usa un PREDICATO (le precondizioni di
     startCharge riscritte qui). Un predicato riscritto e' una copia, e una
     copia puo' sbagliare. Percio' ogni volta che il robot preme davvero il
     pulsante grande, il predicato viene confrontato con quello che la
     funzione VERA ha fatto: se startCharge apre una carica (o una
     rovesciata) e il predicato diceva di no — o viceversa — e' un
     disaccordo, e il banco lo stampa. Se i disaccordi non sono zero,
     l'oracolo e' rotto e non si legge nient'altro. */
  function predTiro(){
    const p = ctrlPlayer(T); if(!p) return false;
    if(p.slide>=0 || p.recover>0 || p.rove>=0) return false;
    const b=G.ball, pi=idx(p);
    return b.owner===pi || Math.hypot(b.x-p.x,b.y-p.y)<=KICK_R*1.4 || !!finestraRovesciata(p);
  }
  const _sc = window.startCharge;
  window.startCharge = function(t){
    if(t!==T){ return _sc.apply(this, arguments); }
    const p = ctrlPlayer(T);
    if(!p || p.charge>=0){ return _sc.apply(this, arguments); }   // gia' carico: la pressione non dice niente
    const rove0 = p.rove;
    const previsto = predTiro();
    const r = _sc.apply(this, arguments);
    const fatto = (p.charge>=0) || (p.rove>=0 && rove0<0);
    S.vN++; if(previsto !== fatto) S.vDis++;
    return r;
  };

  /* ---------------- il robot: decide dallo STATO, mai dall'etichetta -- */
  let carica=0, attesa=0, prova=0, sciogli=0;
  function robot(){
    const p = ctrlPlayer(T); if(!p) return;
    const b = G.ball, pi = idx(p);
    const gx = FW, gy = FH/2;                 // la squadra 0 attacca +x
    const hoIo = b.owner===pi;
    const mio = (b.owner>=0 && G.players[b.owner] && G.players[b.owner].team===T) ||
                (b.owner<0 && b.passTo>=0 && G.players[b.passTo] && G.players[b.passTo].team===T);
    let dx,dy;
    if(hoIo){ dx=gx-p.x; dy=gy-p.y; }
    else if(mio){ dx=gx-p.x; dy=FH*((pi%2)?0.28:0.72)-p.y; }
    else { dx=b.x-p.x; dy=b.y-p.y; }
    const L=Math.hypot(dx,dy)||1;
    const st=Touch5.stick[T];
    st.active=true; st.id=-1; st.ox=0; st.oy=0; st.dx=dx/L*RAGGIO; st.dy=dy/L*RAGGIO;
    const dP=Math.hypot(gx-p.x, gy-p.y);
    /* la carica lasciata aperta dalla PROVA si scioglie subito dopo, come
       farebbe un dito che preme e molla */
    if(sciogli && S.f>=sciogli){ releaseCharge(T); sciogli=0; carica=0; attesa=S.f+16; }
    if(hoIo){
      if(dP<430){
        if(!carica){ startCharge(T); carica=S.f+21; }
        else if(S.f>=carica){ releaseCharge(T); carica=0; attesa=S.f+16; }
      } else if(S.f>=attesa){ doFiltrante(T, humanSprint(T)); attesa=S.f+54; }
    } else {
      if(carica){ releaseCharge(T); carica=0; attesa=S.f+16; }
      else if(Math.hypot(b.x-p.x,b.y-p.y)<55 && S.f>=attesa){ doSlide(T); attesa=S.f+54; }
    }
    /* LA PROVA CIECA. Ogni 90 fotogrammi il robot preme il pulsante grande
       come se dicesse TIRA, qualunque cosa dica: serve a far cadere la
       verifica del predicato anche sui casi in cui la risposta giusta e'
       «non succede niente». Il momento e' fisso, non dipende
       dall'etichetta, quindi la partita resta la stessa per tutti i
       candidati. */
    if(!carica && !sciogli && S.f>=prova){
      prova=S.f+90; S.vProve++;
      const ch0 = p.charge;
      startCharge(T);
      if(p.charge>=0 && ch0<0){ sciogli=S.f+8; carica=S.f+8; }
    }
  }

  window.step = function(){
    robot();
    _step.apply(this, arguments);
    /* orologio PROPRIO, non G.pulse: G.pulse conta anche i passi fatti
       prima di questa partita e due corse identiche possono differirne di
       un epsilon, che sull'isteresi vale un fotogramma. Qui parte da zero
       a ogni azzera() e sale come G.pulse, cioe' di DT a ogni passo. */
    S.clock += 1/60;
    if(!(G.scene==='play'||G.scene==='golden')) return;
    S.f++;
    const b=G.ball, p=ctrlPlayer(T);
    const own = (b.owner>=0 && G.players[b.owner]) ? G.players[b.owner].team : -1;
    const pass = (b.owner<0 && b.passTo>=0 && G.players[b.passTo]) ? G.players[b.passTo].team : -1;
    const sp = Math.hypot(b.vx,b.vy);
    const dist = p ? Math.hypot(b.x-p.x, b.y-p.y) : 1e9;
    const pi = p ? idx(p) : -1;

    /* --- l'oracolo: cosa otterrebbe il dito, adesso --- */
    const vivo = p && !(p.slide>=0 || p.recover>0 || p.rove>=0);
    const attoTiro   = !!(vivo && (b.owner===pi || dist<=KICK_R*1.4 || finestraRovesciata(p)));
    const attoFiltr  = !!(p && (b.owner===pi || dist<=KICK_R));
    const attoSlide  = !!(p && !(p.slide>=0 || p.recover>0) && !(p.charge>=0 && p.chargeGo));
    let vivi=0; for(const q of G.players) if(q.team===T && q.out<=0 && q.role!=='gk') vivi++;
    const attoSwap   = G.ctrl[T]>=0 && vivi>=2;
    if(attoTiro) S.attoTiro++;
    if(attoFiltr) S.attoFiltr++;
    if(attoSlide) S.attoSlide++;
    if(attoSwap) S.attoSwap++;
    if(own===T) S.own[0]++; else if(own===1-T) S.own[1]++; else S.own[2]++;
    /* perche' il TIRA di oggi non fa niente anche quando la palla e'
       nostra: o ce l'ha il PORTIERE (che non e' mai l'uomo controllato) o
       ce l'ha un compagno fuori dalla portata del piede comandato */
    if(own===T && !attoTiro){
      const o=G.players[b.owner];
      if(o && o.role==='gk') S.nostraGK++; else S.nostraLontano++;
    }

    /* --- anagrafe dei voli verso di NOI --- */
    if(pass===T){
      if(!S._volo) S._volo={da:S.f, pulse:G.pulse, lento:0, spMin:sp, bers:b.passTo};
      S._volo.lento += (sp<SOGLIA_V)?1:0;
      S._volo.spMin = Math.min(S._volo.spMin, sp);
    } else if(S._volo){
      const v=S._volo;
      S.voli.push({dur:S.f-v.da, lento:v.lento, spMin:Math.round(v.spMin),
                   preso: (b.owner>=0 && G.players[b.owner] && G.players[b.owner].team===T)?1:0});
      S._volo=null;
    }
    const eta = S._volo ? (G.pulse-S._volo.pulse) : 0;

    /* --- lo strappo: l'istante in cui il pallone smette di essere nostro - */
    if(S._ownPrec===T && own!==T){ S.strappi++; S._strappo=30; }
    S._ownPrec=own;
    const dentroStrappo = S._strappo>0;
    if(S._strappo>0) S._strappo--;

    const c = { own, pass, sp, eta, pulse:S.clock, aPortata: dist<=KICK_R*1.4, attoTiro };

    for(const k of S.cand){
      const lab = !!k.f(c);
      if(lab) k.lab++;
      if(lab && !attoTiro) k.prom++;
      if(!lab && attoTiro) k.occ++;
      /* verbi difensivi negati: il pulsante dice TIRA e la palla non e'
         nostra, quindi CONTRASTA e CAMBIO non sono premibili */
      if(lab && own!==T){ if(own>=0) k.negLoro++; else k.negLibera++; }
      if(lab && dentroStrappo && own!==T){ k.strappiFrames++; if(S._strappo===29) k.strappiSporchi++; }
      if(k._lab===null){ k._lab=lab; k._da=S.f; }
      else if(lab!==k._lab){ const l=S.f-k._da; k.cambi++; k.runN++;
        if(l<15) k.run15++; if(l<5) k.run5++; k._lab=lab; k._da=S.f; }
    }
  };

  window.__or = { azzera(){ azzera(); carica=0; attesa=0; prova=0; sciogli=0; }, leggi(){
    const v=S.voli;
    const dur=v.map(x=>x.dur).sort((a,b)=>a-b);
    return {
      f:S.f, nostra:S.own[0], loro:S.own[1], libera:S.own[2],
      attoTiro:S.attoTiro, attoFiltr:S.attoFiltr, attoSlide:S.attoSlide, attoSwap:S.attoSwap,
      nostraGK:S.nostraGK, nostraLontano:S.nostraLontano,
      vN:S.vN, vDis:S.vDis, vProve:S.vProve,
      strappi:S.strappi,
      voliN:v.length,
      voliMed: dur.length?dur[(dur.length-1)>>1]:0,
      voliMax: dur.length?dur[dur.length-1]:0,
      voli36: v.filter(x=>x.dur>36).length,     // oltre 0,6 s
      voli60: v.filter(x=>x.dur>60).length,     // oltre 1 s
      voli180:v.filter(x=>x.dur>180).length,    // oltre 3 s
      voliPresi: v.filter(x=>x.preso).length,
      voliLenti: v.reduce((a,x)=>a+x.lento,0),
      voliFrames: v.reduce((a,x)=>a+x.dur,0),
      cand: S.cand.map(k=>({ id:k.id, desc:k.desc, lab:k.lab, prom:k.prom, occ:k.occ,
        negLoro:k.negLoro, negLibera:k.negLibera,
        strappiSporchi:k.strappiSporchi, strappiFrames:k.strappiFrames,
        cambi:k.cambi, run5:k.run5, run15:k.run15, runN:k.runN }))
    };
  }};
  return 'ok';
})()`;

/* --------------------------------------------------------------- corsa */
async function gioca(browser, porta, partite, semeBase, diff, taglia) {
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
  for (let i = 0; i < partite; i++) {
    const r = await pag.evaluate(([seme, diff, taglia]) => {
      const t = window.__test;
      window.__caso.semina(seme);
      window.__or.azzera();
      t.startMatch(1, diff, taglia !== 5 ? { size: taglia } : undefined);
      /* squadra 0 UMANA: nessun setCpuVsCpu. Il pilota e' il robot. */
      let sim = 0;
      while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      return window.__or.leggi();
    }, [(semeBase + i) >>> 0, diff, taglia]);
    out.push(r);
  }
  await ctx.close();
  return { partite: out, errori };
}

function somma(righe) {
  const s = { cand: [] };
  for (const r of righe) {
    for (const k in r) if (k !== 'cand') s[k] = (s[k] || 0) + r[k];
    r.cand.forEach((c, i) => {
      if (!s.cand[i]) s.cand[i] = { id: c.id, desc: c.desc };
      for (const k in c) if (k !== 'id' && k !== 'desc') s.cand[i][k] = (s.cand[i][k] || 0) + c[k];
    });
  }
  return s;
}

const DT = 1 / 60;
function stampa(nome, righe, taglia) {
  const s = somma(righe);
  const f = Math.max(1, s.f);
  const pc = x => (x / f * 100).toFixed(2) + '%';
  console.log(`\n=== ${nome} — ${righe.length} partite, ${taglia} contro ${taglia} ===`);
  console.log(`  fotogrammi di gioco          ${s.f}  (${(s.f * DT).toFixed(0)} s)`);
  console.log(`  palla nostra ${pc(s.nostra)}   loro ${pc(s.loro)}   di nessuno ${pc(s.libera)}`);
  console.log(`  ORACOLO (:8776) — il dito otterrebbe:`);
  console.log(`     un TIRA che fa qualcosa    ${pc(s.attoTiro)}`);
  console.log(`     un FILTRANTE che fa qualcosa ${pc(s.attoFiltr)}`);
  console.log(`     un CONTRASTA che fa qualcosa ${pc(s.attoSlide)}   CAMBIO ${pc(s.attoSwap)}`);
  console.log(`  palla NOSTRA ma il piede non ci arriva  ${pc(s.nostraGK + s.nostraLontano)}` +
    `   (ce l'ha il PORTIERE ${pc(s.nostraGK)}, un compagno lontano ${pc(s.nostraLontano)})`);
  console.log(`  ${s.vDis === 0 ? 'OK  ' : 'NO  '} verifica dell'oracolo: ${s.vN} pressioni vere del pulsante grande ` +
    `(${s.vProve} a vuoto, apposta), ${s.vDis} disaccordi fra il predicato e quello che startCharge ha fatto`);
  console.log(`  voli di passaggio verso di noi ${s.voliN}   (mediana ${(s.voliMed / Math.max(1, righe.length) * DT * 1000).toFixed(0)} ms per partita)`);
  console.log(`     oltre 0,6 s ${s.voli36} · oltre 1 s ${s.voli60} · oltre 3 s ${s.voli180}   finiti fra i nostri piedi ${s.voliPresi}/${s.voliN}`);
  console.log(`     fotogrammi di volo ${s.voliFrames}, di cui con palla sotto 150 u/s ${s.voliLenti} (${(s.voliLenti / Math.max(1, s.voliFrames) * 100).toFixed(0)}%)`);
  console.log(`  strappi (la palla smette di essere nostra) ${s.strappi}`);
  console.log('');
  const H = ['candidato', 'TIRA', 'promessa', 'occasione', 'somma', 'negato/loro', 'negato/lib', 'strappi', 'cambi', '<0,25', '<0,08'];
  const L = [14, 8, 10, 10, 8, 12, 11, 9, 7, 7, 7];
  console.log('  ' + H.map((h, i) => h.padStart(L[i])).join(''));
  for (const c of s.cand) {
    const r = [c.id, pc(c.lab), pc(c.prom), pc(c.occ), pc(c.prom + c.occ),
      pc(c.negLoro), pc(c.negLibera), `${c.strappiSporchi}/${s.strappi}`,
      String(c.cambi), String(c.run15), String(c.run5)];
    console.log('  ' + r.map((x, i) => String(x).padStart(L[i])).join(''));
  }
  console.log('\n  legenda: promessa = dice TIRA e startCharge non farebbe niente;');
  console.log('           occasione = potrebbe tirare e dice CONTRASTA;');
  console.log('           negato = dice TIRA mentre la palla NON e\' nostra, cioe' + "'" + ' CONTRASTA e CAMBIO');
  console.log('           non sono premibili; strappi = di quelle volte che la palla ci viene');
  console.log('           strappata, in quante il verbo difensivo manca nel mezzo secondo dopo.');
  for (const c of s.cand) console.log(`  --  ${c.id.padEnd(12)} ${c.desc}`);
  return s;
}

(async () => {
  const partite = Math.max(1, +arg('partite', 8) | 0);
  const semeBase = +arg('seme', 20260803);
  const diff = Math.max(0, Math.min(2, +arg('diff', 1) | 0));
  const taglia = [5, 7, 11].includes(+arg('taglia', 5)) ? +arg('taglia', 5) : 5;
  const etichetta = arg('etichetta', 'OGGI');
  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = prova ? path.resolve(prova) : '';
  const fileJson = arg('json', '');
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('FALLITO: gioco di prova inesistente: ' + provaAbs); process.exit(1); }

  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  console.log(`\n=== ORACOLO — semi ${semeBase}..${semeBase + partite - 1} ===`);
  console.log('  --    gioco: ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));
  const A = await gioca(browser, srv.porta, partite, semeBase, diff, taglia);
  if (A.errori.length) console.log('  NO    eccezioni: ' + A.errori[0]);
  const s = stampa(etichetta, A.partite, taglia);

  let diagOK = true;
  if (!haFlag('no-diagnosi')) {
    const n = Math.min(3, partite);
    const B = await gioca(browser, srv.porta, n, semeBase, diff, taglia);
    const bad = [];
    for (let i = 0; i < n; i++) {
      for (const k of ['f', 'nostra', 'attoTiro', 'strappi', 'voliN'])
        if (A.partite[i][k] !== B.partite[i][k]) bad.push(`partita ${i} ${k}: ${A.partite[i][k]} contro ${B.partite[i][k]}`);
      A.partite[i].cand.forEach((c, j) => {
        for (const k of ['lab', 'prom', 'occ', 'cambi'])
          if (c[k] !== B.partite[i].cand[j][k]) bad.push(`partita ${i} ${c.id}.${k}: ${c[k]} contro ${B.partite[i].cand[j][k]}`);
      });
    }
    diagOK = !bad.length;
    console.log(`\n  ${diagOK ? 'OK  ' : 'NO  '} autodiagnosi: ${n} partite rigiocate su pagina nuova danno gli stessi conteggi`);
    if (!diagOK) console.log('        ' + bad.slice(0, 5).join('\n        '));
  }
  await browser.close(); srv.chiudi();

  if (fileJson) {
    fs.writeFileSync(path.resolve(fileJson), JSON.stringify({ etichetta, partite, semeBase, taglia, gioco: provaAbs || 'repo', crudo: A.partite }, null, 1));
    console.log(`\n  --    crudo salvato in ${fileJson}`);
  }
  if (!diagOK || A.errori.length) process.exit(1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
