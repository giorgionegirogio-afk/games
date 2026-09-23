/* =====================================================================
   _toppa-146-impegno.js — L'IMPEGNO, LA SERIE E LA TESTIMONIANZA
   (voce #146, compito 3)

   UNA ANCORA: lo stub `scegli(){ return false; }` posato dal compito 2,
   che qui diventa la macchina vera.

   IL PROBLEMA, DETTO ESATTO. Se ognuno risolve il proprio duello sul
   proprio telefono, CHI PARLA PER SECONDO VINCE SEMPRE: vede la mossa
   dell'altro e sceglie di conseguenza. Il portiere che sa dove tira il
   tiratore para sempre. Non e' un problema di rete: e' un problema di
   SIMULTANEITA'.

   LA CURA — l'impegno in due tempi, e nessun arbitro acceso.
     1. IMPEGNO      ognuno manda l'hash della propria mossa piu' un
                     nonce da 128 bit. L'hash non dice niente a chi lo
                     legge.
     2. ATTESA       nessuno rivela finche' non ha l'impegno dell'altro.
                     E' UNA SOLA RIGA DI CODICE (`if(!suo) return`) ed
                     e' meta' del cantiere.
     3. RIVELAZIONE  mossa e nonce.
     4. VERIFICA     l'hash deve ricomporre. Se non ricompone, e' l'UNICA
                     strada di questo cantiere che porta a un'accusa.
     5. RISOLUZIONE  tutti e due chiamano le TRE PORTE VERE del duello
                     (pickZone/stopPower/pickKeeper) sulla STESSA
                     partita, e il #143 e il #144 garantiscono che
                     l'esito coincida.

   IL SEME NON LO SCEGLIE NESSUNO, e viene gratis: il seme della partita
   e' l'hash dei due nonce d'appuntamento, e quando scegli il tuo non
   conosci quello dell'altro. Lo stesso numero decide chi tira per primo.

   L'ESITO VIAGGIA IN GROPPA, e non costa un giro. Il controllo «abbiamo
   calcolato la stessa cosa?» non puo' stare nella rivelazione del tiro
   T — quando rivelo non conosco ancora la mossa dell'altro, quindi non
   ho ancora un esito. Percio' la rivelazione del tiro T porta l'esito
   del tiro T-1, e la fine della serie porta l'ultimo. Due messaggi per
   tiro, come prima.

   E SE I DUE ESITI NON COINCIDONO NON SI ACCUSA NESSUNO. Due esiti
   diversi possono nascere da due motori JS diversi — e' esattamente il
   caso che l'impronta del #142 esiste per riconoscere. La serie si
   ferma con `esiti-diversi`, che e' un'astensione. Davanti a un dubbio
   ci si astiene, non si accusa: e' il principio che regge tutta l'onda
   D, e qui si applica alla lettera.

   LA TESTIMONIANZA — la riga di nastro di tipo 14. Non e' un comando:
   i comandi restano le righe di tipo 6, che il gioco scrive gia' da se'
   passando dalle tre porte. La 14 porta l'impegno e il nonce di tutti e
   due i lati, cioe' LA PROVA che la mossa dell'avversario non me la
   sono inventata io. Il giudice la rifa': se un impegno non ricompone,
   NON TORNA.

   SE MOTORE_V DEBBA SALIRE NON LO DECIDE QUESTO FILE: lo decide
   strumenti/_t-146-motorev.js, misurando nei due versi come ha fatto il
   #144. Una riga che non e' un comando non dovrebbe cambiare nessun
   esito, ma «non dovrebbe» non e' un numero.

   uso:  node strumenti/_toppa-146-impegno.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CERCA = `  /* posare la propria mossa. Il corpo vero nasce col compito 3: qui
     c'e' la porta, perche' il banco possa gia' chiamarla senza
     schiantarsi su un undefined — e perche' un banco che si schianta
     stampa «il banco e' esploso» invece di «il gioco e' rosso». */
  scegli(){ return false; },`;

const METTI = String.raw`  /* ---------------------------------------------- posare la propria mossa */
  /* Si sceglie AL BUIO, e la riga che lo garantisce non e' qui: e'
     rivelo(), che non parla finche' non ha l'impegno dell'altro. */
  scegli(m){
    const S = this.s;
    if(!S || S.fase !== 'scegli' || !m) return false;
    const t = S.tiro;
    const q = (v, lo, hi) => Math.max(lo, Math.min(hi, v|0));
    const mia = (S.ruolo === 't')
      ? { ruolo:'t', z:q(m.z,0,2), u:q(m.u,-1000,1000), v:q(m.v,0,1000), ps:q(m.ps,0,200) }
      : { ruolo:'p', z:q(m.z,0,2) };
    S.mieMosse[t] = mia;
    S.mieiNonce[t] = dsCaso(16);
    S.mieiImpegni[t] = dsImpegno(t, S.lato, mia, S.mieiNonce[t]);
    S.fase = 'attesa-impegno';
    return true;
  },

  /* --------------------------------------------- avviare la partita */
  /* LE DUE ROSE STANNO NEGLI STESSI POSTI SUI DUE TELEFONI, e non e' un
     dettaglio: il lato 'a' e' la squadra 0 anche sul telefono di 'b'.
     Se ognuno si mettesse in casa, i due resolve() leggerebbero
     attributi diversi e la stessa mossa darebbe esiti diversi — cioe' la
     partita divergerebbe per costruzione, e la colpa sembrerebbe del
     protocollo. Chi gioca lo vede dai colori, non dalla simulazione. */
  avvia(){
    const S = this.s;
    const mia = impaccaRosa(SAVE.rosa);
    const rA = (S.lato === 'a') ? mia : S.suoSaluto.rosa;
    const rB = (S.lato === 'a') ? S.suoSaluto.rosa : mia;
    const vesti = (imp, sale) => {
      const p = spaccaRosa(imp, 0, null).rosa;
      const nomi = nomiDiCarta(S.seme, p.length, sale);
      return p.map((g, i) => ({ nome: nomi[i] || 'GIOCATORE',
        vel: attrRosa(g.vel), tiro: attrRosa(g.tiro),
        tecnica: attrRosa(g.tecnica), tackle: attrRosa(g.tackle) }));
    };
    const rosaA = vesti(rA, 'CASA'), rosaB = vesti(rB, 'FUORI');
    if(rosaA.length < 4 || rosaB.length < 4){ S.fase='fine'; S.causa='rose-corte'; return false; }

    S.mioTeam = (S.lato === 'a') ? 0 : 1;
    G.sfida = { seme:String(S.seme >>> 0), taglia:5, chi:'DISCHETTO',
                vero:false, replay:false, nomePrima:G.teamName,
                dischetto:{ stanza:S.stanza, lato:S.lato } };
    SEME.accendi(S.seme >>> 0);
    try{ Reg.accendi(); }catch(e){}
    startMatch(1, SFIDA_DIFF, {
      size: 5, sponde: 'gabbia', miraGuidata: 'pieno',
      mia: { n:'CASA',  c1:'#3355aa', c2:'#111820', pat:0, ment:1, rosa:rosaA },
      opp: { n:'FUORI', c1:'#cf3e6b', c2:'#123a80', pat:1, ment:1, rosa:rosaB },
    });
    /* chi tira per primo l'ha deciso il seme, non una persona */
    G.kickTeam = (S.primo === 'a') ? 0 : 1;
    avviaRigori();
    S.tiro = 0;
    S.ruolo = this.ruoloOra();
    S.fase = 'scegli';
    return true;
  },

  ruoloOra(){
    const S = this.s;
    if(!G.rigori) return '';
    return (G.rigori.turno === S.mioTeam) ? 't' : 'p';
  },

  /* ------------------------------------------------ un giro di rete */
  /* Il ritiro prima, l'invio dopo, e in mezzo NIENTE che aspetti un
     orologio: chi chiama decide il ritmo. Un gioco che pilotasse il
     proprio ritmo con un timer costringerebbe il banco a misurare il
     timer invece del protocollo. */
  async giro(){
    const S = this.s;
    if(!S || S.fase === 'spento' || S.fase === 'fine') return { fase: S ? S.fase : 'spento' };
    const r = await this.filoOra.ritira();
    S.rete = Rete.stato;
    let nuovi = 0;
    if(r.ok){ for(const m of (r.msg||[])) if(this.leggi(m)) nuovi++; }
    /* IL 429 NON E' UN GUASTO, E' UN FRENO: si rallenta, non ci si
       ferma. Il gioco lo dice e basta; chi chiama allarga l'attesa. */
    if(!r.ok && r.errore === 'troppe') S.rete = 'lenta';
    S.mutoDa = nuovi ? 0 : (S.mutoDa + 1);

    await this.manda();
    this.avanza();

    /* L'ALTRO CHE NON RISPONDE non e' un colpevole: e' un'incompiuta.
       Assegnare la vittoria a chi resta sarebbe il modo piu' corto per
       vincere facendo cadere la rete dell'altro — lo stesso argomento
       con cui il #137 rifiuto' un endpoint capace di dire "questa sfida
       non torna". */
    if(S.mutoDa > 60 && S.fase !== 'fine'){
      S.fase = 'fine'; S.causa = 'incompiuta'; S.fine = null;
    }
    return { fase: S.fase };
  },

  async manda(){
    const S = this.s;
    const t = S.tiro;
    /* l'impegno, appena c'e' */
    if(S.mieiImpegni[t] && !S.mandatoI[t]){
      const r = await this.filoOra.manda({ k:'I', r:S.lato, t, d:{ h:S.mieiImpegni[t] } });
      /* un imbuco perso si ritenta al giro dopo: la cassetta e'
         idempotente per (stanza, tiro, lato, tipo), quindi il
         ritentativo non fa un doppione e non puo' cambiare idea */
      if(r && r.ok && !r.perso) S.mandatoI[t] = true;
      else return;
    }
    /* LA RIGA CHE VALE META' DEL CANTIERE: non rivelo finche' non ho il
       suo impegno. Toglila e chi parla per secondo vince sempre. */
    if(S.mandatoI[t] && S.suoiImpegni[t] && !S.mandatoR[t]){
      const r = await this.filoOra.manda({ k:'R', r:S.lato, t,
        d:{ m:S.mieMosse[t], n:S.mieiNonce[t], e:(t > 0 ? (S.esiti[t-1] ? S.esiti[t-1].esito : null) : null) } });
      if(r && r.ok && !r.perso) S.mandatoR[t] = true;
    }
  },

  leggi(m){
    const S = this.s;
    S.visti.push({ k:m.k, r:m.r, t:m.t });
    if(m.r === S.lato) return false;          /* l'eco del mio non dice niente */
    if(m.k === 'S'){ if(!S.suoSaluto){ this.chiudiAppuntamento(m.d); return true; } return false; }
    if(m.k === 'I'){ if(!S.suoiImpegni[m.t]){ S.suoiImpegni[m.t] = m.d && m.d.h; return true; } return false; }
    if(m.k === 'R'){
      if(S.sueMosse[m.t]) return false;
      S.sueMosse[m.t] = m.d && m.d.m;
      S.suoiNonce[m.t] = m.d && m.d.n;
      S.suoiEsiti[m.t] = m.d ? m.d.e : null;
      return true;
    }
    if(m.k === 'F'){ S.suaFine = m.d; return true; }
    return false;
  },

  /* ------------------------------------------------------ risolvere */
  avanza(){
    const S = this.s;
    if(S.fase === 'fine' || S.fase === 'attesa-pari' || S.fase === 'pronto') return;
    const t = S.tiro;
    if(!S.mandatoR[t] || !S.sueMosse[t]) return;

    /* 1. L'IMPEGNO DEVE RICOMPORRE. E' l'unico punto di tutto il
       cantiere in cui si accusa qualcuno invece di astenersi: qui non
       c'e' un dubbio, c'e' un hash che non torna. */
    const suo = dsImpegno(t, S.lato === 'a' ? 'b' : 'a', S.sueMosse[t], S.suoiNonce[t]);
    if(suo !== S.suoiImpegni[t]){
      S.fase = 'fine'; S.causa = 'impegno-non-torna'; S.fine = null;
      return;
    }

    /* 2. L'ESITO CHE L'ALTRO HA DICHIARATO PER IL TIRO PRIMA. Se non
       coincide col mio, ci si astiene: puo' essere un motore diverso. */
    if(t > 0 && S.esiti[t-1]){
      const suoE = S.suoiEsiti[t];
      if(suoE && suoE !== S.esiti[t-1].esito){
        S.fase = 'fine'; S.causa = 'esiti-diversi'; S.fine = null;
        return;
      }
    }

    /* 3. LA MOSSA GIUSTA NEL RUOLO GIUSTO */
    const mia = S.mieMosse[t], sua = S.sueMosse[t];
    const mt = (S.ruolo === 't') ? mia : sua;
    const mp = (S.ruolo === 't') ? sua : mia;
    if(!mt || mt.ruolo !== 't' || !mp || mp.ruolo !== 'p'){
      S.fase = 'fine'; S.causa = 'mossa-storta'; S.fine = null;
      return;
    }

    const esito = this.risolviDuello(mt, mp);
    if(!esito) return;                  /* la partita non e' pronta: si riprova */

    /* LA TESTIMONIANZA (tipo 14). Non e' un comando — i comandi sono le
       righe di tipo 6 che le tre porte scrivono da se'. E' la prova che
       la mossa dell'altro non me la sono inventata io, e il giudice la
       rifa'. */
    this.testimonia(t, mia, S.mieiNonce[t], S.mieiImpegni[t], 0);
    this.testimonia(t, sua, S.suoiNonce[t], S.suoiImpegni[t], 1);

    S.esiti.push({ t, ruolo:S.ruolo, esito });
    if(G.rigori) S.serie = { seg: G.rigori.seg.slice(), tiri: G.rigori.tiri.slice() };

    /* 4. AVANTI, o la fine */
    if(!G.rigori || G.scene === 'end'){
      S.fase = 'fine';
      S.causa = 'finita';
      S.fine = this.chiVince();
      this.filoOra.manda({ k:'F', r:S.lato, t:Math.min(40, t+1), d:{ e:esito } });
      return;
    }
    S.tiro = t + 1;
    S.ruolo = this.ruoloOra();
    S.fase = 'scegli';
  },

  /* LE TRE PORTE VERE, e nessuna scorciatoia. Il duello non viene
     simulato di nuovo qui dentro: si chiama pickZone/stopPower/
     pickKeeper esattamente come le chiamerebbe un dito, e per questo le
     righe di tipo 6 escono da se' e il nastro e' rigiocabile senza che
     questo blocco ne sappia niente. */
  risolviDuello(mt, mp){
    if(typeof Duel === 'undefined' || Duel.phase !== 'zone') return null;
    const nPrima = Duel.nDuello;
    Duel.pickZone(mt.z, mt.u/1000, mt.v/1000);
    for(let p=0; p<mt.ps; p++) Duel.update(1/60);
    Duel.stopPower();
    Duel.pickKeeper(mp.z);
    const esito = Duel.outcome || 'fuori';
    /* si lascia finire l'animazione del risultato: e' li' dentro che il
       gioco chiama esitoRigore -> programmaRigore -> startFreeKick, cioe'
       e' il GIOCO a tenere il punteggio della serie, non questo blocco */
    for(let p=0; p<600; p++){
      if(!G.rigori || G.scene === 'end') break;
      if(Duel.phase === 'zone' && Duel.nDuello !== nPrima) break;
      Duel.update(1/60);
    }
    return esito;
  },

  chiVince(){
    const S = this.s;
    if(!S.serie || !S.serie.seg) return null;
    const a = S.serie.seg[0]|0, b = S.serie.seg[1]|0;
    if(a === b) return 'pari';
    return ((a > b) ? 0 : 1) === S.mioTeam ? 'vinta' : 'persa';
  },

  /* la riga di nastro: numeri e basta, come tutte le altre */
  testimonia(t, mossa, nonce, impegno, lato){
    if(!mossa || !nonce || !impegno) return;
    const p = [];
    for(let i=0;i<4;i++) p.push(parseInt(String(impegno).substr(i*8,8),16) >>> 0);
    for(let i=0;i<4;i++) p.push(parseInt(String(nonce).substr(i*8,8),16) >>> 0);
    const m = (mossa.ruolo === 't') ? [0, mossa.z|0, mossa.u|0, mossa.v|0, mossa.ps|0] : [1, mossa.z|0];
    try{ Reg.scrivi(14, [t|0, lato|0].concat(p, m)); }catch(e){}
  },
`;

/* l'appuntamento adesso avvia la partita invece di fermarsi a «pronto» */
const CERCA2 = `    S.tiro = 0;
    S.ruolo = this.ruoloDi(0);
    S.fase = 'pronto';
  },`;
const METTI2 = `    S.fase = 'pronto';
    this.avvia();
  },`;

/* e lo stato vuoto ha i cassetti dei due lati */
const CERCA3 = `      mutoDa: 0, visti: [],
    };
  },`;
const METTI3 = `      mutoDa: 0, visti: [], mioTeam: 0,
      mieMosse: {}, mieiNonce: {}, mieiImpegni: {}, mandatoI: {}, mandatoR: {},
      sueMosse: {}, suoiNonce: {}, suoiImpegni: {}, suoiEsiti: {}, suaFine: null,
    };
  },`;

/* il vecchio giro e il vecchio leggi se ne vanno: li rifa' il nuovo */
const CERCA4 = `  /* ------------------------------------------------- un giro di rete */
  async giro(){
    const S = this.s;
    if(!S || S.fase === 'spento' || S.fase === 'fine') return { fase: S ? S.fase : 'spento' };
    const r = await this.filoOra.ritira();
    S.rete = Rete.stato;
    if(r.ok) for(const m of (r.msg||[])) this.leggi(m);
    return { fase: S.fase };
  },

  leggi(m){
    const S = this.s;
    S.visti.push({ k:m.k, r:m.r, t:m.t });
    if(m.r === S.lato) return;             /* l'eco del mio: non dice niente */
    if(m.k === 'S' && !S.suoSaluto) this.chiudiAppuntamento(m.d);
  },
`;
const METTI4 = '';

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-146-impegno.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');

for (const [cerca, metti, nome] of [[CERCA, METTI, 'scegli'], [CERCA2, METTI2, 'appuntamento'],
                                    [CERCA3, METTI3, 'cassetti'], [CERCA4, METTI4, 'giro-vecchio']]) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('TOPPA NON APPLICATA: ancoraggio «' + nome + '» trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
  t = t.replace(cerca, metti);
}

for (const [k, q] of [['scegli(m){', 1], ['risolviDuello(mt, mp){', 1], ['async giro(){', 1], ['Reg.scrivi(14,', 1]]) {
  const n = t.split(k).length - 1;
  if (n !== q) { console.error('TOPPA NON APPLICATA: dopo la sostituzione «' + k + '» compare ' + n + ' volte (ne servono ' + q + ')'); process.exit(1); }
}
fs.writeFileSync(usc, t);
console.log('toppa applicata: impegno, serie e testimonianza, ' + ing + ' -> ' + usc);
