/* =====================================================================
   _toppa-146-appuntamento.js — L'APPUNTAMENTO DAL DISCHETTO
   (voce #146, compito 2)

   DUE ANCORE, e niente altro:
     1. fra la fine di `const Rete` e `window.__test = {`, dove entra
        tutto il motore nuovo;
     2. la prima riga dentro `window.__test`, dove entra la maniglia.

   CHE COSA ENTRA, e perche' ogni pezzo e' li'.

   SHA-256 A MANO. Il gioco e' un file solo: zero dipendenze, zero rete,
   e `crypto.subtle` e' asincrona e non e' garantita su file://. Sessanta
   righe di SHA-256 sono il prezzo di un impegno che regge, e si pagano
   una volta.

   IL SEME A DUE MANI. `dsMescola(na, nb)` e' la ragione per cui nessuno
   dei due puo' scegliersi la partita: quando scegli il tuo nonce non
   conosci quello dell'altro, e il seme e' l'hash dei due. Lo stesso
   numero decide chi tira per primo, cosi' nemmeno quello lo sceglie una
   persona.

   LA TAGLIA E' 5, E NON E' UNA SEMPLIFICAZIONE. Il determinismo pieno
   vale a taglia 5: a 7 e 11 `rebuildCrowd` consuma PRNG in proporzione
   al campo e lo stream slitta (voce #98, causa isolata, seguito #129).
   Una sfida in cui i due telefoni non vedono la stessa partita non e'
   una sfida.

   IL FILO. Il duello non parla alla cassetta: parla a un filo con
   quattro verbi. Ce ne sono due, e il secondo NON e' un lusso:
     cassetta  il trasporto vero, ordinato, indicizzato dal server;
     sballato  lo stesso, ma con i messaggi RITARDATI e MESCOLATI.
   Il sballato serve a misurare oggi la proprieta' che servira' il
   giorno in cui qualcuno attacchera' un DataChannel: WebRTC in questa
   casa sarebbe `maxRetransmits:0`, cioe' senza ordine garantito. Se il
   protocollo reggesse solo su un filo ordinato, il posto per WebRTC
   sarebbe una parola e non un posto.

   IL CODICE E' IL NOME DELLA CASSETTA, e nient'altro: sei caratteri
   dell'alfabeto della carta (#135), nessun conto, nessuna identita' che
   viaggia. L'identita' serve solo al freno, ed e' quella che il gioco
   ha gia'.

   E NIENTE PARTE DA SOLO. Tutto qui dentro e' definizione: la prima
   richiesta parte quando un dito preme, e mai prima.

   uso:  node strumenti/_toppa-146-appuntamento.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CERCA = `};

window.__test = {
  get state(){ return G.scene; },`;

const CODICE = String.raw`};

/* =====================================================================
   LA SFIDA DAL DISCHETTO (voce #146) — l'appuntamento e il filo.

   Il cantiere per intero sta in docs/superpowers/specs/
   2026-09-24-sfida-dal-dischetto-design.md. Qui il minimo che serve a
   chi legge questa riga: due persone si danno appuntamento con un
   codice corto, concordano da sole seme e primo tiratore, e poi si
   tirano i rigori. Il trasporto e' una CASSETTA — un buca-lettere
   indicizzato letto a polling — e non un lockstep, perche' il #145 ha
   misurato che la coda della rete italiana arriva a raffica e a 600
   invii al minuto la partita si fermerebbe 9-17 volte al minuto contro
   una soglia di meno di una. Un duello sono pochi scambi: lo stesso
   difetto costa 0,017 stalli per duello.
   ===================================================================== */
const DISCHETTO_V = 1;

/* La durata vera di un tiro, dichiarata dal gioco e non indovinata dal
   banco: e' il numero con cui «richieste per tiro» diventa «richieste
   al minuto» e si confronta col tetto del freno. */
const DISCHETTO_SEC_TIRO = 10;

/* ---------------------------------------------------------- SHA-256 */
/* A mano perche' il gioco e' un file solo. crypto.subtle sarebbe piu'
   corta ma e' asincrona e su file:// non e' garantita, e questo gioco
   gira anche da file://. */
const DS_K = (function(){
  const k = [], p = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,
             137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311];
  for(let i=0;i<64;i++) k.push(Math.floor((Math.cbrt(p[i]) % 1) * 4294967296) >>> 0);
  return k;
})();
const DS_H0 = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];

function dsSha256(testo){
  const b = [];
  for(let i=0;i<testo.length;i++){
    const c = testo.charCodeAt(i);
    if(c < 128) b.push(c);
    else if(c < 2048){ b.push(192|(c>>6), 128|(c&63)); }
    else { b.push(224|(c>>12), 128|((c>>6)&63), 128|(c&63)); }
  }
  const len = b.length;
  b.push(0x80);
  while(b.length % 64 !== 56) b.push(0);
  const bit = len * 8;
  b.push(0,0,0,0, (bit>>>24)&255, (bit>>>16)&255, (bit>>>8)&255, bit&255);

  const h = DS_H0.slice();
  const w = new Array(64);
  const rr = (x,n) => ((x>>>n) | (x<<(32-n))) >>> 0;
  for(let i=0;i<b.length;i+=64){
    for(let t=0;t<16;t++) w[t] = ((b[i+t*4]<<24) | (b[i+t*4+1]<<16) | (b[i+t*4+2]<<8) | b[i+t*4+3]) >>> 0;
    for(let t=16;t<64;t++){
      const s0 = (rr(w[t-15],7) ^ rr(w[t-15],18) ^ (w[t-15]>>>3)) >>> 0;
      const s1 = (rr(w[t-2],17) ^ rr(w[t-2],19) ^ (w[t-2]>>>10)) >>> 0;
      w[t] = (w[t-16] + s0 + w[t-7] + s1) >>> 0;
    }
    let [a,bb,c,d,e,f,g,hh] = h;
    for(let t=0;t<64;t++){
      const S1 = (rr(e,6) ^ rr(e,11) ^ rr(e,25)) >>> 0;
      const ch = ((e & f) ^ ((~e) & g)) >>> 0;
      const t1 = (hh + S1 + ch + DS_K[t] + w[t]) >>> 0;
      const S0 = (rr(a,2) ^ rr(a,13) ^ rr(a,22)) >>> 0;
      const mj = ((a & bb) ^ (a & c) ^ (bb & c)) >>> 0;
      const t2 = (S0 + mj) >>> 0;
      hh=g; g=f; f=e; e=(d+t1)>>>0; d=c; c=bb; bb=a; a=(t1+t2)>>>0;
    }
    h[0]=(h[0]+a)>>>0; h[1]=(h[1]+bb)>>>0; h[2]=(h[2]+c)>>>0; h[3]=(h[3]+d)>>>0;
    h[4]=(h[4]+e)>>>0; h[5]=(h[5]+f)>>>0; h[6]=(h[6]+g)>>>0; h[7]=(h[7]+hh)>>>0;
  }
  return h.map(x => x.toString(16).padStart(8,'0')).join('');
}

/* ------------------------------------------- il caso, e non il seme */
/* I nonce NON escono da SEME: SEME e' la partita, e deve restare
   riproducibile. Escono dal caso vero del browser. */
function dsCaso(byte){
  const v = new Uint8Array(byte);
  if(window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(v);
  else for(let i=0;i<byte;i++) v[i] = (Math.random()*256)|0;
  return Array.from(v).map(x => x.toString(16).padStart(2,'0')).join('');
}

/* LA MOSSA SI SCRIVE IN UN MODO SOLO. Un impegno e' l'hash di una
   stringa: se i due lati la scrivessero con i campi in ordine diverso,
   nessun impegno ricomporrebbe mai e la colpa sembrerebbe del
   protocollo invece che della scrittura. */
function dsTestoMossa(m){
  if(!m) return '-';
  if(m.ruolo === 'p') return 'p' + (m.z|0);
  return 't' + (m.z|0) + ',' + (m.u|0) + ',' + (m.v|0) + ',' + (m.ps|0);
}
function dsImpegno(t, lato, mossa, nonce){
  return dsSha256('D1|' + t + '|' + lato + '|' + dsTestoMossa(mossa) + '|' + nonce).slice(0,32);
}
/* il seme a due mani: quando scegli il tuo nonce non conosci quello
   dell'altro, quindi nessuno dei due puo' cercarsi una partita comoda */
function dsMescola(na, nb){
  return (parseInt(dsSha256('D1|' + na + '|' + nb).slice(0,8), 16) >>> 0) || 1;
}

/* ------------------------------------------------------------ IL FILO */
/* Quattro verbi, e il duello non sa quale filo ha sotto. Oggi ce ne
   sono due e nessuno dei due e' WebRTC: il #145 ha misurato che WebRTC
   passa da una rete fissa ma NON ha potuto misurarlo sul CGNAT mobile
   (misura S5, dichiarata mancante), e un trasporto la cui riuscita non
   si puo' misurare non si costruisce. Il filo «sballato» misura oggi la
   proprieta' che servirebbe quel giorno: un DataChannel a
   maxRetransmits:0 consegna senza ordine garantito. */
const FiloCassetta = {
  nome: 'cassetta',
  apri(stanza){ this.stanza = stanza; this.da = 0; },
  async manda(m){
    return Rete.chiama('/api/dischetto', 'POST',
      { stanza: this.stanza, k: m.k, r: m.r, t: m.t, d: m.d });
  },
  async ritira(){
    const r = await Rete.chiama('/api/dischetto?stanza=' + this.stanza + '&da=' + this.da, 'GET');
    if(!r || !r.ok) return { ok:false, errore: (r && r.errore) || 'assente', msg: [] };
    /* L'INDICE E' DEL SERVER, e per questo un ritiro perso e' un
       non-evento: non si e' mosso niente, e il ritiro dopo riporta anche
       quel che questo non ha visto. */
    if(r.i > this.da) this.da = r.i;
    return { ok:true, msg: r.msg || [] };
  },
  chiudi(){ this.stanza = ''; this.da = 0; },
};

/* lo stesso filo, ma i messaggi arrivano in ritardo e in disordine */
const FiloSballato = {
  nome: 'sballato',
  apri(stanza){ FiloCassetta.apri.call(this, stanza); this.coda = []; this.giro = 0; },
  manda(m){ return FiloCassetta.manda.call(this, m); },
  async ritira(){
    const r = await FiloCassetta.ritira.call(this);
    if(!r.ok) return r;
    for(const m of r.msg) this.coda.push(m);
    this.giro++;
    /* tiene in tasca un giro su due, e quando consegna rovescia
       l'ordine: chi regge questo reggerebbe un DataChannel */
    if(this.giro % 2 === 1 && this.coda.length) return { ok:true, msg: [] };
    const fuori = this.coda.slice().reverse();
    this.coda = [];
    return { ok:true, msg: fuori };
  },
  chiudi(){ FiloCassetta.chiudi.call(this); this.coda = []; },
};

/* ------------------------------------------------------ IL DISCHETTO */
const Dischetto = {
  filoOra: FiloCassetta,
  s: null,

  vuoto(){
    return {
      fase: 'spento', stanza: '', lato: '',
      mioNonce: '', mioSaluto: null, suoSaluto: null,
      seme: 0, primo: '', taglia: 5, suaRosa: '',
      tiro: 0, ruolo: '', mossa: null, nonce: '',
      serie: { seg: [0,0], tiri: [0,0] },
      fine: null, causa: '', rete: 'ignota',
      esiti: [], secPerTiro: DISCHETTO_SEC_TIRO,
      motoreV: MOTORE_V, impronta: improntaMotore(),
      mutoDa: 0, visti: [],
    };
  },

  /* posare la propria mossa. Il corpo vero nasce col compito 3: qui
     c'e' la porta, perche' il banco possa gia' chiamarla senza
     schiantarsi su un undefined — e perche' un banco che si schianta
     stampa «il banco e' esploso» invece di «il gioco e' rosso». */
  scegli(){ return false; },

  /* APRIRE IL PANNELLO NON E' PARLARE ALLA RETE. Il cancello F del
     banco conta il delta dopo l'apertura, e deve restare zero. */
  apri(){ if(!this.s) this.s = this.vuoto(); return true; },

  filo(quale){
    this.filoOra = (quale === 'sballato') ? FiloSballato : FiloCassetta;
    return this.filoOra.nome;
  },

  /* ---------------------------------------------------- il codice */
  /* Sei caratteri dell'alfabeto della carta: trenta bit, nessun conto,
     nessuna identita' dentro. E' IL NOME DELLA CASSETTA, e nient'altro:
     chi lo legge sa dove sta la posta, non chi la scrive. */
  coniaCodice(){
    const v = new Uint8Array(6);
    if(window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(v);
    else for(let i=0;i<6;i++) v[i] = (Math.random()*256)|0;
    let c = '';
    for(let i=0;i<6;i++) c += CARTA_ALF[v[i] % CARTA_ALF.length];
    return c;
  },

  mioSaluto(){
    return {
      v: DISCHETTO_V,
      mv: MOTORE_V,
      imp: improntaMotore(),
      rosa: impaccaRosa(SAVE.rosa),
      n: dsCaso(8),
    };
  },

  async crea(){
    this.s = this.vuoto();
    const S = this.s;
    S.stanza = this.coniaCodice();
    S.lato = 'a';
    this.filoOra.apri(S.stanza);
    S.mioSaluto = this.mioSaluto();
    S.mioNonce = S.mioSaluto.n;
    const r = await this.filoOra.manda({ k:'S', r:'a', t:0, d:S.mioSaluto });
    S.rete = Rete.stato;
    if(!r || !r.ok) { S.fase = 'fine'; S.causa = 'rete'; return { ok:false, errore:(r&&r.errore)||'rete', stanza:S.stanza }; }
    S.fase = 'attesa-pari';
    return { ok:true, stanza: S.stanza };
  },

  async entra(codice){
    const c = String(codice||'').trim().toUpperCase();
    if(!/^[0-9A-Z]{6}$/.test(c)) return { ok:false, errore:'codice-storto' };
    this.s = this.vuoto();
    const S = this.s;
    S.stanza = c;
    S.lato = 'b';
    this.filoOra.apri(c);
    S.mioSaluto = this.mioSaluto();
    S.mioNonce = S.mioSaluto.n;
    const r = await this.filoOra.manda({ k:'S', r:'b', t:0, d:S.mioSaluto });
    S.rete = Rete.stato;
    if(!r || !r.ok) { S.fase = 'fine'; S.causa = 'rete'; return { ok:false, errore:(r&&r.errore)||'rete' }; }
    S.fase = 'attesa-pari';
    return { ok:true };
  },

  /* ------------------------------------------------- l'appuntamento */
  /* SI CHIUDE QUANDO TUTTI E DUE HANNO PARLATO, e non prima: e' questa
     riga a impedire che il secondo scelga il proprio nonce sapendo il
     primo. Il nonce si manda PRIMA di guardare, sempre — crea e
     entra mandano il saluto come prima cosa che fanno. */
  chiudiAppuntamento(suo){
    const S = this.s;
    S.suoSaluto = suo;
    if(suo.v !== DISCHETTO_V){ S.fase='fine'; S.causa='versione-diversa'; return; }
    if(suo.mv !== MOTORE_V){ S.fase='fine'; S.causa='motore-diverso'; return; }
    const na = S.lato === 'a' ? S.mioNonce : suo.n;
    const nb = S.lato === 'a' ? suo.n : S.mioNonce;
    S.seme = dsMescola(na, nb);
    S.primo = (S.seme & 1) ? 'b' : 'a';
    S.suaRosa = (suo.rosa || []).join(',');
    S.tiro = 0;
    S.ruolo = this.ruoloDi(0);
    S.fase = 'pronto';
  },

  /* chi tira al tiro T: si alterna, e chi comincia l'ha deciso il seme */
  ruoloDi(t){
    const S = this.s;
    const tira = (t % 2 === 0) ? S.primo : (S.primo === 'a' ? 'b' : 'a');
    return tira === S.lato ? 't' : 'p';
  },

  /* ------------------------------------------------- un giro di rete */
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

  spia(){
    /* che cosa e' visibile ADESSO nella cassetta, dal mio lato. Serve al
       banco per provare che la mossa dell'altro NON e' visibile prima
       dell'impegno: un banco che chiede al gioco «hai barato?» non
       misura niente, uno che guarda la cassetta misura. */
    const S = this.s;
    return { stanza: S ? S.stanza : '', visti: (S && S.visti) ? S.visti.slice() : [] };
  },

  chiudi(){
    if(this.s){ this.s.fase = 'fine'; if(!this.s.causa) this.s.causa = 'chiuso'; }
    try{ this.filoOra.chiudi(); }catch(e){}
  },

  get stato(){
    const S = this.s || this.vuoto();
    return {
      fase: S.fase, stanza: S.stanza, lato: S.lato,
      seme: S.seme, primo: S.primo, taglia: S.taglia, suaRosa: S.suaRosa,
      tiro: S.tiro, ruolo: S.ruolo, serie: S.serie,
      fine: S.fine, causa: S.causa, rete: S.rete,
      secPerTiro: S.secPerTiro, motoreV: S.motoreV, impronta: S.impronta,
    };
  },
};

window.__test = {
  get state(){ return G.scene; },
  /* LA SFIDA DAL DISCHETTO (voce #146). Tutto quel che serve al banco a
     due telefoni: l'appuntamento, il giro di rete a mano (un banco che
     aspetta un orologio misura l'orologio), lo stato e la cassetta
     vista da fuori. */
  get dischetto(){
    return {
      v: DISCHETTO_V,
      apri: () => Dischetto.apri(),
      crea: () => Dischetto.crea(),
      entra: c => Dischetto.entra(c),
      giro: () => Dischetto.giro(),
      scegli: m => Dischetto.scegli(m),
      filo: q => Dischetto.filo(q),
      spia: () => Dischetto.spia(),
      chiudi: () => Dischetto.chiudi(),
      get stato(){ return Dischetto.stato; },
      get esiti(){ return (Dischetto.s && Dischetto.s.esiti) || []; },
    };
  },`;

/* ------------------------------------------------ l'altra ancora: Rete */
const CERCA2 = `  async sfideSubite(){`;
const CODICE2 = `  /* LA CASSETTA (voce #146). Passa dalla porta unica \`chiama\`, quindi
     eredita il tetto di otto secondi, \`credentials:'omit'\` e
     l'intestazione d'identita' che il gioco ha gia': NESSUNA chiave
     nuova, nessun conto nuovo, niente che viaggi che non viaggiasse
     ieri. Il freno di questo endpoint e' \`dis:<id>\` a 60 al minuto —
     gli stessi numeri del fratello piu' largo, nessun privilegio. */
  async dischettoImbuca(stanza, k, r, t, d){
    return this.chiama('/api/dischetto', 'POST', { stanza, k, r, t, d });
  },
  async dischettoRitira(stanza, da){
    return this.chiama('/api/dischetto?stanza=' + stanza + '&da=' + (da|0), 'GET');
  },

  async sfideSubite(){`;

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-146-appuntamento.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');

for (const [cerca, metti, nome] of [[CERCA, CODICE, 'motore'], [CERCA2, CODICE2, 'rete']]) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('TOPPA NON APPLICATA: ancoraggio «' + nome + '» trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
  t = t.replace(cerca, metti);
}

if (t.split('const DISCHETTO_V = 1;').length - 1 !== 1) { console.error('TOPPA NON APPLICATA: DISCHETTO_V non e\' entrato una volta sola'); process.exit(1); }
if (t.split('window.__test = {').length - 1 !== 1) { console.error('TOPPA NON APPLICATA: window.__test non e\' piu\' unico'); process.exit(1); }
fs.writeFileSync(usc, t);
console.log('toppa applicata: appuntamento dal dischetto, ' + ing + ' -> ' + usc);
