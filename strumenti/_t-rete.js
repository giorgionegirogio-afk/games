/* =====================================================================
   _t-rete.js — IL MOTORE DELLA SFIDA ASINCRONA (27 agosto 2026).

   COSA AGGIUNGE: la parte del gioco che parla col server. Solo il
   motore, nessuna schermata — le schermate stanno in _t-rete-ui.js,
   e la divisione non e' estetica: il motore si prova a numeri, i pixel
   no, e mescolarli vorrebbe dire non provare nessuno dei due.

   LA REGOLA CHE VIENE PRIMA DI TUTTE: OFFLINE E' IL MODO NORMALE.
   Senza rete il gioco non cambia di una virgola — nessuna attesa,
   nessuna schermata di errore, nessun «connessione richiesta». Ogni
   chiamata qui dentro ha un tetto di tempo e un ripiego, e nessuna sta
   sulla strada di un fotogramma. Se il server e' spento, il giocatore
   non lo scopre: trova soltanto una voce di menu che non promette
   niente.

   PERCHE' BASTANO POCHI BYTE. Il gioco e' deterministico dato il seme
   (misurato: 10 controlli su 10, _q-determinismo.js) e sa registrare i
   comandi (8 su 8, _q-replay.js, 7,5 kB al minuto). Quindi una partita
   si manda per intero — non il punteggio, la PARTITA — e chi la riceve
   la puo' guardare e la puo' verificare rigiocandola.

   COME SI TIENE L'IDENTITA'. Nessuna email, nessun conto Google: al
   primo contatto il server rilascia un identificatore e un segreto, il
   telefono se li tiene nel salvataggio, e il server non sa nient'altro.
   E' quel che tiene l'APK a zero permessi. Il prezzo — se perdi il
   telefono perdi la squadra — si dice al giocatore prima, accanto al
   codice di trasferimento, non dopo.

   LA COSA CHE SI SBAGLIA SEMPRE, e qui e' scritta al contrario: SI SALVA
   PRIMA DI SPEDIRE. Un esito entra nella coda del salvataggio e solo
   dopo parte verso il server. Se l'applicazione muore a meta' — e su
   Android muore, e' misurato in questo progetto con am force-stop — al
   riavvio l'esito e' ancora li' e riparte. L'ordine opposto sembra piu'
   pulito e perde le partite.

   uso:  node strumenti/_t-rete.js --out fuori/rete.html
         node strumenti/_t-rete.js --dentro
         node strumenti/_t-rete.js --elenco
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const BLOCCO = String.raw`
/* =====================================================================
   LA RETE — la sfida asincrona, e niente di piu' (27 agosto 2026).

   «Attacca la squadra di qualcun altro.» Lui non deve essere sveglio,
   non deve essere online, non deve nemmeno aver aperto il gioco oggi: si
   scarica il suo profilo — nome, colori, undici, indole tattica — e si
   gioca contro la sua rosa mossa dalla CPU. Il risultato entra in
   classifica, e lui la partita la potra' GUARDARE, perche' gliela
   mandiamo per intero in qualche kB.

   TUTTO QUESTO E' UN DI PIU'. Il gioco resta quello di prima: offline,
   in aereo, con una tacca, col server spento. Nessuna funzione qui
   dentro puo' fermare un fotogramma, e nessuna dice al giocatore che gli
   manca qualcosa.
   ===================================================================== */
const Rete = {
  /* La radice del server. Sta in una costante e non sparsa nel codice
     perche' il giorno del trasloco si cambia una riga. Vuota = rete
     spenta, e il gioco si comporta esattamente come si comportava prima
     che questa toppa esistesse. */
  base: 'https://calcetto-rete.vercel.app',

  /* Lo stato, e sono tre parole:
       ignota  non si e' ancora provato
       su      l'ultimo contatto e' andato
       giu     l'ultimo contatto e' fallito */
  stato: 'ignota',
  ultimoErrore: '',
  inCorso: 0,

  /* -------------------------------------------------------- l'identita' */
  mem(){
    if(!SAVE.rete) SAVE.rete = { id:'', segreto:'', coda:[], nome:'', punti:0, posto:0, visto:0 };
    if(!Array.isArray(SAVE.rete.coda)) SAVE.rete.coda = [];
    return SAVE.rete;
  },
  get haIdentita(){ return !!(this.mem().id && this.mem().segreto); },

  /* ------------------------------------------------------- una chiamata */
  /* IL TETTO DI TEMPO E' LA COSA IMPORTANTE. Una richiesta senza tetto,
     su una rete mobile che non risponde, resta appesa per minuti: e se
     qualcuno l'aspettasse, il gioco sarebbe fermo. Otto secondi, poi si
     rinuncia e si va avanti. Nessuna chiamata di questo oggetto viene
     mai aspettata da un fotogramma. */
  async chiama(via, metodo, corpo){
    if(!this.base) return { ok:false, errore:'spenta' };
    const m = this.mem();
    const taglio = new AbortController();
    const orologio = setTimeout(() => taglio.abort(), 8000);
    this.inCorso++;
    try{
      const t = {};
      if(m.id && m.segreto) t.Authorization = 'Calcetto ' + m.id + '.' + m.segreto;
      if(corpo) t['Content-Type'] = 'application/json';
      const r = await fetch(this.base + via, {
        method: metodo || 'GET', headers: t, signal: taglio.signal,
        body: corpo ? JSON.stringify(corpo) : undefined,
        /* niente biscotti, niente credenziali del browser: l'identita' e'
           quella dell'intestazione e nient'altro */
        credentials: 'omit', cache: 'no-store', mode: 'cors',
      });
      const testo = await r.text();
      let v = null;
      if(testo){ try{ v = JSON.parse(testo); }catch(e){ v = null; } }
      if(!r.ok){
        this.stato = 'su';   /* il server risponde: la RETE c'e', e' la richiesta che non va */
        this.ultimoErrore = (v && v.errore) || ('http ' + r.status);
        return { ok:false, errore:this.ultimoErrore, stato:r.status };
      }
      this.stato = 'su';
      return v || { ok:true };
    }catch(e){
      this.stato = 'giu';
      this.ultimoErrore = e && e.name === 'AbortError' ? 'lenta' : 'assente';
      return { ok:false, errore:this.ultimoErrore };
    }finally{
      clearTimeout(orologio);
      this.inCorso--;
    }
  },

  /* ------------------------------------------------------------ entrare */
  /* Si chiama una volta all'apertura, e non blocca niente: se va male, il
     gioco e' gia' partito e nessuno se ne accorge. */
  async entra(){
    const m = this.mem();
    if(this.haIdentita){
      const r = await this.chiama('/api/entra', 'POST', { id:m.id });
      if(r.ok){
        m.visto = Date.now();
        if(r.punti){ m.punti = r.punti.punti|0; }
        persistSave();
      }
      return r;
    }
    const r = await this.chiama('/api/entra', 'POST', {});
    if(r.ok && r.id && r.segreto){
      m.id = r.id; m.segreto = r.segreto;
      m.visto = Date.now();
      persistSave();
    }
    return r;
  },

  /* --------------------------------------------------- la mia vetrina */
  /* Il profilo si pubblica quando la rosa cambia, non a ogni partita:
     l'unica cosa che il server deve sapere e' com'e' la squadra oggi.
     La FORZA non si manda — la ricalcola lui dalla rosa, e deve farlo,
     se no il modo piu' veloce di salire in classifica sarebbe
     dichiararsi debole. */
  async pubblica(){
    if(!this.haIdentita) return { ok:false, errore:'senza-identita' };
    const m = this.mem();
    const nome = (m.nome || SAVE.squadraNome || 'LA MIA SQUADRA').toString().slice(0, 18);
    const rosa = (SAVE.rosa || []).map(r => ({
      nome: r.nome, vel: r.vel|0, tiro: r.tiro|0, tecnica: r.tecnica|0, tackle: r.tackle|0,
      partite: r.partite|0, gol: r.gol|0,
    }));
    if(rosa.length < 4) return { ok:false, errore:'rosa-corta' };
    const r = await this.chiama('/api/squadra', 'PUT', {
      nome, rosa, taglia: TAGLIA,
      colori: this.mieiColori(),
      indole: this.miaIndole(),
    });
    if(r.ok && r.forza) { m.forza = r.forza|0; persistSave(); }
    return r;
  },

  /* I colori veri della mia squadra, letti da dove il gioco li tiene.
     Se un giorno cambiassero posto, cambia solo questa funzione. */
  mieiColori(){
    try{
      const k = KIT_UMANO || {};
      const q = v => (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)) ? v : null;
      return {
        maglia: q(k.maglia) || '#d8322c',
        calzoncini: q(k.calz) || q(k.calzoncini) || '#1b1b1f',
        riga: q(k.riga) || q(k.maglia) || '#d8322c',
        portiere: q(k.gk) || '#2b2b2b',
      };
    }catch(e){
      return { maglia:'#d8322c', calzoncini:'#1b1b1f', riga:'#d8322c', portiere:'#2b2b2b' };
    }
  },

  /* =====================================================================
     L'INDOLE — sei numeri che dicono COME gioca chi possiede la squadra.

     E' la cosa che fa la differenza fra «una sfida contro di lui» e «la
     CPU col suo nome sopra», e la seconda uno la riconosce in tre
     minuti e non ci torna piu'.

     Si ricava dalle SUE partite, non da un menu: nessuno sa dire di se'
     stesso «pressing 61». I sei numeri stanno in SAVE e crescono a media
     mobile: ogni partita sposta il profilo di un decimo, quindi dieci
     partite lo formano e una partita strana non lo stravolge.
     ===================================================================== */
  indoleMem(){
    const m = this.mem();
    if(!m.indole) m.indole = { pressing:50, linea:50, larghezza:50, ritmo:50, rischio:50, durezza:50, n:0 };
    return m.indole;
  },
  /* si chiama a fine partita, con le statistiche di quella partita */
  imparaIndole(){
    if(G.cpu[0]) return;                  /* se non giocava lui, non e' lui */
    const S = G.stats, o = this.indoleMem();
    const mio = 0;
    const somma = a => (a[0]|0) + (a[1]|0);
    const tiri = (S.tiri && S.tiri[mio]|0) || 0;
    const durata = Math.max(1, durataPartita());
    /* sei misure, ognuna portata su 0..100 con una scala dichiarata */
    const q = (v, basso, alto) => Math.max(0, Math.min(100, Math.round((v - basso) / (alto - basso) * 100)));
    const nuovo = {
      /* quanto va a prendere l'avversario: contrasti tentati al minuto */
      pressing:  q(((S.rubate && S.rubate[mio]|0) + (S.falli && S.falli[mio]|0)) / (durata/60), 0, 12),
      /* quanto alza la squadra: non c'e' una statistica, si usa la meta'
         campo in cui e' stato il pallone quando l'aveva lui */
      linea:     q(G.linMedia !== undefined ? G.linMedia : 50, 0, 100),
      /* quanto allarga: passaggi lunghi sul totale */
      larghezza: q((S.cross && S.cross[mio]|0) / Math.max(1, (S.passaggi && S.passaggi[mio]|0)) * 100, 0, 30),
      /* quanto corre: tiri al minuto */
      ritmo:     q(tiri / (durata/60), 0, 12),
      /* quanto rischia: filtranti sul totale dei passaggi */
      rischio:   q((S.filtranti && S.filtranti[mio]|0) / Math.max(1, (S.passaggi && S.passaggi[mio]|0)) * 100, 0, 25),
      /* quanto entra duro: falli sui contrasti */
      durezza:   q((S.falli && S.falli[mio]|0) / Math.max(1, ((S.rubate && S.rubate[mio]|0) + (S.falli && S.falli[mio]|0))) * 100, 0, 60),
    };
    /* MEDIA MOBILE A UN DECIMO. Dieci partite formano il profilo, una
       partita storta non lo cancella. Al primo giro pesa tutto, se no
       chi ha giocato una volta sola sarebbe un cinquanta pieno che non
       assomiglia a nessuno. */
    const peso = o.n === 0 ? 1 : 0.1;
    for(const k in nuovo) if(Number.isFinite(nuovo[k])) o[k] = Math.round(o[k]*(1-peso) + nuovo[k]*peso);
    o.n = (o.n|0) + 1;
    persistSave();
  },
  miaIndole(){
    const o = this.indoleMem();
    return { pressing:o.pressing|0, linea:o.linea|0, larghezza:o.larghezza|0,
             ritmo:o.ritmo|0, rischio:o.rischio|0, durezza:o.durezza|0 };
  },

  /* ------------------------------------------------------- l'avversario */
  /* Il seme lo da' il SERVER, e con lui un impegno unico: da quel momento
     esiste una sola partita che questo giocatore puo' mandare. E' cio'
     che impedisce di provarne dieci in locale e spedire solo quella
     vinta 7-0 — e sta nel database, non in un controllo di qui, perche'
     il codice del gioco e' dentro un APK che chiunque puo' cambiare. */
  async avversario(taglia){
    if(!this.haIdentita){ const e = await this.entra(); if(!e.ok) return e; }
    return this.chiama('/api/avversario?taglia=' + (taglia|0 || 5), 'GET');
  },

  /* ------------------------------------------------------------ l'esito */
  /* SI SALVA PRIMA DI SPEDIRE. La partita entra nella coda del
     salvataggio, il salvataggio si scrive, e SOLO DOPO si prova a
     mandarla. Se l'applicazione muore adesso — e su Android muore — al
     riavvio la partita e' ancora qui e riparte da sola.
     L'ordine opposto sembra piu' pulito e perde le partite. */
  async manda(seme, taglia, gol_a, gol_d, nastro){
    const m = this.mem();
    /* venti in coda e non piu': se il server e' giu' da una settimana,
       un salvataggio gonfio e' un altro modo di perdere tutto */
    if(m.coda.length >= 20) m.coda.shift();
    const riga = { seme:String(seme), taglia:taglia|0, gol_a:gol_a|0, gol_d:gol_d|0,
                   replay:String(nastro||''), quando:Date.now() };
    m.coda.push(riga);
    persistSave();
    return this.svuotaCoda();
  },

  /* Si chiama all'apertura e dopo ogni partita. Manda una riga alla
     volta, in ordine: se la prima non passa, le altre aspettano — sono
     partite, e l'ordine in cui sono state giocate conta per i punti. */
  async svuotaCoda(){
    const m = this.mem();
    if(!m.coda.length) return { ok:true, coda:0 };
    if(!this.haIdentita){ const e = await this.entra(); if(!e.ok) return e; }
    let mandate = 0, ultima = null;
    while(m.coda.length){
      const riga = m.coda[0];
      const r = await this.chiama('/api/sfida', 'POST', riga);
      ultima = r;
      if(r.ok){
        m.coda.shift(); mandate++;
        if(typeof r.punti === 'number') m.punti = r.punti|0;
        persistSave();
        continue;
      }
      /* =================================================================
         QUANDO SI BUTTA VIA UNA PARTITA, E QUANDO NO.

         Un errore di RETE (assente, lenta) e' passeggero: la partita
         resta in coda e riparte alla prossima apertura.
         Un errore di MERITO — impegno scaduto, impegno inesistente,
         partita gia' inviata — non guarira' mai: quella riga va tolta,
         se no resta in testa alla coda per sempre e blocca tutte le
         partite dietro di lei. E' il modo classico di perdere una
         settimana di risultati per una partita di mezz'ora fa.
         ================================================================= */
      const definitivo = ['nessun-impegno','seme-non-tuo','impegno-scaduto','gia-inviata',
                          'gol','replay-mancante','replay-forma','replay-vuoto','replay-grosso',
                          'bandito','ignoto'].includes(r.errore);
      if(definitivo){ m.coda.shift(); persistSave(); continue; }
      break;
    }
    return { ok:mandate>0 || !m.coda.length, mandate, coda:m.coda.length, ultima };
  },

  /* ------------------------------------------------------- la classifica */
  async classifica(quanti){
    if(!this.haIdentita){ const e = await this.entra(); if(!e.ok) return e; }
    return this.chiama('/api/classifica?quanti=' + (quanti|0 || 100), 'GET');
  },
  async sfideSubite(){
    if(!this.haIdentita) return { ok:false, errore:'senza-identita' };
    return this.chiama('/api/sfida', 'GET');
  },
  async replay(id){
    if(!this.haIdentita) return { ok:false, errore:'senza-identita' };
    return this.chiama('/api/classifica?replay=' + (id|0), 'GET');
  },

  /* ----------------------------------------------------- il trasferimento */
  /* Non c'e' un conto, quindi non c'e' un «accedi da un altro telefono».
     C'e' un codice da copiare: identificatore e segreto in una riga, con
     un carattere di controllo perche' chi lo trascrive a mano se ne
     accorga di aver sbagliato. Il gioco lo mostra UNA volta e dice a che
     serve. */
  codiceTrasferimento(){
    const m = this.mem();
    if(!this.haIdentita) return '';
    const grezzo = m.id + '.' + m.segreto;
    let s = 0;
    for(let i=0;i<grezzo.length;i++) s = (s*31 + grezzo.charCodeAt(i)) >>> 0;
    return grezzo + '.' + (s % 46656).toString(36).toUpperCase().padStart(3,'0');
  },
  accettaTrasferimento(codice){
    const p = String(codice||'').trim().split('.');
    if(p.length !== 3) return false;
    const grezzo = p[0] + '.' + p[1];
    let s = 0;
    for(let i=0;i<grezzo.length;i++) s = (s*31 + grezzo.charCodeAt(i)) >>> 0;
    if((s % 46656).toString(36).toUpperCase().padStart(3,'0') !== p[2].toUpperCase()) return false;
    const m = this.mem();
    m.id = p[0]; m.segreto = p[1]; m.coda = [];
    persistSave();
    return true;
  },
};
`;

const ANCORE = [

/* =====================================================================
   0 — LA RETE ENTRA NEL SALVATAGGIO, e ci e' voluta una prova rossa.

   loadSave() rilegge SOLO LE CHIAVI CONOSCIUTE. Non e' una dimenticanza:
   e' una difesa scritta e commentata («un salvataggio manomesso non puo'
   iniettare chiavi nuove»), e va rispettata, non aggirata. La prima
   stesura di questa toppa scriveva SAVE.rete e chiamava persistSave, e
   funzionava — finche' non si riapriva il gioco. Misurato dal banco
   (_q-rete.js): dopo un ricaricamento, identita' persa e partita in coda
   sparita. Cioe' esattamente il guasto che la coda esisteva per evitare.

   Quindi la chiave si dichiara qui, e si rilegge con la stessa
   disciplina del resto del blocco: tipi controllati, tetti su tutto,
   nessun campo che passi senza essere guardato. Un salvataggio manomesso
   non deve poter iniettare un replay da dieci megabyte ne' una coda di
   diecimila partite.
   ===================================================================== */
{
  nome: '0/4 la chiave `rete` nasce nel salvataggio di serie',
  cerca: `    inviti:{u:{},v:{}},
    ach:{},`,
  metti: `    inviti:{u:{},v:{}},
    /* =====================================================================
       LA RETE. Tutto quel che il telefono deve ricordare della sfida
       asincrona, e non e' molto: chi sono per il server, e le partite che
       non sono ancora riuscito a mandargli.

       \`id\` e \`segreto\` sono l'identita' anonima: nessuna email, nessun
       conto Google. Il server non sa nient'altro di chi gioca, ed e' cio'
       che tiene l'APK a zero permessi. Se il telefono si perde si perde
       la squadra — il gioco lo dice prima, accanto al codice di
       trasferimento, non dopo.

       \`coda\` sono le partite giocate e non ancora consegnate. Esiste
       perche' su Android l'applicazione muore quando vuole, e una partita
       vinta in metropolitana deve arrivare al server la prossima volta
       che c'e' campo. Venti al massimo: un salvataggio gonfio e' un altro
       modo di perdere tutto.

       \`indole\` sono i sei numeri che dicono come gioca chi possiede
       questa squadra, e vanno con lei quando qualcuno la attacca: senza,
       la sfida sarebbe «la CPU col tuo nome sopra», e uno lo riconosce in
       tre minuti. Si imparano dalle partite, non da un menu. */
    rete:{ id:'', segreto:'', coda:[], nome:'', punti:0, posto:0, visto:0, forza:0,
           indole:{ pressing:50, linea:50, larghezza:50, ritmo:50, rischio:50, durezza:50, n:0 } },
    ach:{},`,
},

/* 0b — e si rilegge con la disciplina del blocco in cui vive */
{
  nome: '0b/4 il salvataggio rilegge `rete`, guardando ogni campo',
  cerca: `    if(j.ach&&typeof j.ach==='object') for(const a of ACH){ if(j.ach[a.id]) s.ach[a.id]=true; }`,
  metti: `    /* LA RETE, riletta come tutto il resto: solo chiavi conosciute, tipi
       controllati, tetti su tutto. Un salvataggio manomesso non puo'
       iniettare un replay da dieci megabyte, ne' una coda di diecimila
       partite, ne' un identificatore che non sia un identificatore. */
    if(j.rete&&typeof j.rete==='object'){
      const r=j.rete, d=s.rete;
      if(typeof r.id==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r.id)) d.id=r.id;
      if(typeof r.segreto==='string' && r.segreto.length<=96 && /^[A-Za-z0-9_-]+$/.test(r.segreto)) d.segreto=r.segreto;
      if(typeof r.nome==='string') d.nome=r.nome.slice(0,18);
      for(const k of ['punti','posto','visto','forza'])
        if(typeof r[k]==='number' && isFinite(r[k])) d[k]=Math.max(0,r[k]|0);
      if(r.indole&&typeof r.indole==='object')
        for(const k in d.indole){
          const n=r.indole[k];
          if(typeof n==='number'&&isFinite(n)) d.indole[k]=Math.max(0,Math.min(k==='n'?9999:100,n|0));
        }
      if(Array.isArray(r.coda)){
        for(const x of r.coda.slice(0,20)){
          if(!x||typeof x!=='object') continue;
          if(typeof x.seme!=='string'||!/^[0-9]{1,16}$/.test(x.seme)) continue;
          if([5,7,11].indexOf(x.taglia|0)<0) continue;
          if(typeof x.replay!=='string'||x.replay.length<40||x.replay.length>65536) continue;
          if(!/^[A-Za-z0-9_\\-=+/|,;.]+$/.test(x.replay)) continue;
          d.coda.push({ seme:x.seme, taglia:x.taglia|0,
                        gol_a:Math.max(0,Math.min(30,x.gol_a|0)), gol_d:Math.max(0,Math.min(30,x.gol_d|0)),
                        replay:x.replay, quando:(typeof x.quando==='number'&&isFinite(x.quando))?x.quando|0:0 });
        }
      }
    }
    if(j.ach&&typeof j.ach==='object') for(const a of ACH){ if(j.ach[a.id]) s.ach[a.id]=true; }`,
},

/* 1 — il motore nasce prima della porta di servizio che lo espone */
{
  nome: '1/4 il motore della rete, dichiarato prima di __test',
  cerca: `window.__test = {
  get state(){ return G.scene; },`,
  metti: BLOCCO + `
window.__test = {
  get state(){ return G.scene; },`,
},

/* 2 — i ganci: il banco deve poter far finta di essere il server */
{
  nome: '2/4 __test apre la rete al banco',
  cerca: `  registra(){ Reg.accendi(); },`,
  metti: `  registra(){ Reg.accendi(); },
  /* LA RETE, aperta al banco. \`base\` si puo' riscrivere per puntare a un
     server finto in locale: e' il solo modo di provare la sfida
     asincrona senza dipendere da Internet, e un banco che dipende da
     Internet e' un banco che un giorno diventa rosso da solo. */
  get rete(){ return Rete; },
  reteBase(v){ Rete.base = String(v||''); return Rete.base; },
  reteStato(){ return { stato:Rete.stato, errore:Rete.ultimoErrore, inCorso:Rete.inCorso,
                        identita:Rete.haIdentita, coda:Rete.mem().coda.length,
                        punti:Rete.mem().punti|0, indole:Rete.miaIndole() }; },`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-rete.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.rete.html';
outFile = path.resolve(RADICE, outFile);
if (!dentro && outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  console.error('');
  console.error('L\'ancoraggio 2 cerca il registro dei comandi: _t-rete.js va DOPO _t-registro.js.');
  process.exit(1);
}

const attesi = [
  ['const Rete = {', 1],
  ['async svuotaCoda(){', 1],
  ['codiceTrasferimento(){', 1],
  ['  get rete(){ return Rete; },', 1],
  /* il tetto di tempo e' la riga che tiene il gioco vivo senza rete: se
     sparisse, una richiesta appesa fermerebbe chi la aspetta */
  ['setTimeout(() => taglio.abort(), 8000)', 1],
  /* e questa e' la riga dell'ordine giusto: prima si salva, poi si manda */
  ['    m.coda.push(riga);\n    persistSave();\n    return this.svuotaCoda();', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s.slice(0, 60) + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));

const pRete = out.indexOf('const Rete = {');
const pTest = out.indexOf('window.__test = {');
if (!(pRete >= 0 && pRete < pTest)) rotti.push('il motore non e\' dichiarato prima di __test');

if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('');
console.log('LA PROVA:  node strumenti/_q-rete.js --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
