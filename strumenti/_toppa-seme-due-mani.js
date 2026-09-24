/* =====================================================================
   _toppa-seme-due-mani.js — L'IMPEGNO SUL SALUTO
   (voce #150, compito 2)

   Applica al gioco lo schema in due tempi del #146 — impegno prima,
   rivelazione poi — al NONCE DELL'APPUNTAMENTO, che fino a ieri viaggiava
   in chiaro. Ogni ancoraggio si pretende UNA VOLTA SOLA: un ancoraggio
   trovato zero o due volte ferma la toppa invece di lasciarla scrivere
   nel posto sbagliato.

   CHE COSA CURA. Il seme della serie nasce «a due mani» (dsMescola dei
   due nonce) e decide anche chi tira per primo. Ma il nonce stava dentro
   il saluto, in chiaro: chi entra per secondo lo legge, ne macina
   quattromila finche' non trova quello che gli da' il seme che vuole, e
   solo allora parla. MISURATO dal #149 (10 su 10) e rimisurato dal #150
   (400 su 400). E non e' solo il bit del primo tiratore: e' l'INTERO
   seme, cioe' il dado di tutta la partita.

   LE OTTO RIPARAZIONI:

     1  dsImpegnoSaluto — lo STESSO schema di dsImpegno, sulla stessa
        dsSha256 verificata su 409 casi. Non se ne inventa un secondo:
        due schemi d'impegno nello stesso protocollo sono due superfici
        da sorvegliare invece di una.
     2  lo stato impara suoNonce e mandatoN, e una FASE nuova.
     3  mioSaluto manda l'IMPEGNO del nonce, non il nonce.
     4  leggi() impara la busta 'N' e smette di chiudere l'appuntamento
        appena vede il saluto.
     5  manda() rivela il nonce SOLO a chi ha gia' imbucato il proprio
        impegno — e' la riga che tiene il seme a due mani.
     6  chiudiAppuntamento si divide in due: leggiSaluto (versione e
        motore) e la chiusura vera, che pretende che l'impegno ricomponga.
     7  giro() chiude l'appuntamento quando i due tempi sono compiuti.
     8  trattiene() e le parole del pannello conoscono la fase nuova.

   uso:  node strumenti/_toppa-seme-due-mani.js [CALCETTO-il-gioco.html]
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const FILE = process.argv[2] ? path.resolve(RADICE, process.argv[2])
                             : path.join(RADICE, 'CALCETTO-il-gioco.html');
if (!fs.existsSync(FILE)) { console.error('TOPPA NON APPLICATA: non esiste ' + FILE); process.exit(1); }
let t = fs.readFileSync(FILE, 'utf8');

const COPPIE = [];

/* --------------------------------------------------------------- 0 */
/* LA VERSIONE SI MUOVE CON IL PROTOCOLLO, nello stesso atto. Il piano
   la teneva nel compito dopo: sbagliato, e la prova e' stata immediata —
   col saluto a due tempi e DISCHETTO_V ancora a 1, un telefono nuovo e
   uno vecchio si sarebbero dati appuntamento credendo di parlarsi, e il
   nuovo avrebbe accusato il vecchio di 'saluto-non-torna' invece di dire
   «versione diversa». Un protocollo che cambia e un numero che non si
   muove e' esattamente l'accusa falsa che questa casa non vuole. */
COPPIE.push([
`const DISCHETTO_V = 1;`,
`const DISCHETTO_V = 2;`]);

/* --------------------------------------------------------------- 1 */
COPPIE.push([
`function dsImpegno(t, lato, mossa, nonce){
  return dsSha256('D1|' + t + '|' + lato + '|' + dsTestoMossa(mossa) + '|' + nonce).slice(0,32);
}`,
`function dsImpegno(t, lato, mossa, nonce){
  return dsSha256('D1|' + t + '|' + lato + '|' + dsTestoMossa(mossa) + '|' + nonce).slice(0,32);
}
/* =====================================================================
   L'IMPEGNO DEL SALUTO (voce #150) — lo stesso schema, sul nonce.

   COM'ERA. Il nonce dell'appuntamento viaggiava dentro il saluto, in
   chiaro, e il commento accanto diceva che a impedire la scelta era la
   riga «si chiude quando tutti e due hanno parlato». NON LO IMPEDIVA:
   impediva che il GIOCO chiudesse prima, non che un pari scritto a mano
   RITARDASSE il proprio saluto. La cassetta e' pubblica; chi entra per
   secondo legge il nonce dell'altro, ne macina quattromila finche' non
   trova quello che gli porta il seme che vuole, e solo allora parla. Il
   gioco non aveva modo di sapere che aveva aspettato.
   MISURATO: 400 appuntamenti su 400 vinti dal baro (_q-dischetto-seme).

   NON E' UN SECONDO SCHEMA D'IMPEGNO, e' lo stesso: la dsSha256 e'
   quella confrontata con Node su 409 casi (cancello sha256), e la regola
   che lo regge e' quella del #146 — la rivelazione parte solo se
   l'impegno dell'altro e' gia' in casa.

   IL LATO STA DENTRO LA STRINGA, e non e' un vezzo. Senza, il baro
   copierebbe l'impegno dell'altro, aspetterebbe la sua rivelazione e
   rivelerebbe lo STESSO nonce: il seme diventerebbe dsMescola(n, n),
   cioe' un numero che l'onesto non ha scelto da solo. Col lato dentro,
   la copia non ricompone e cade su 'saluto-non-torna'.

   IL PREFISSO E' 'DS1|' E NON 'D1|': due stringhe con lo stesso prefisso
   non devono mai poter essere la stessa: un impegno del saluto non deve
   poter essere riusato come impegno di un tiro.
   ===================================================================== */
function dsImpegnoSaluto(lato, nonce){
  return dsSha256('DS1|' + lato + '|' + nonce).slice(0,32);
}`]);

/* --------------------------------------------------------------- 2 */
COPPIE.push([
`      mioNonce: '', mioSaluto: null, suoSaluto: null,`,
`      mioNonce: '', suoNonce: '', mandatoN: false,
      mioSaluto: null, suoSaluto: null,`]);

/* --------------------------------------------------------------- 3 */
COPPIE.push([
`  mioSaluto(){
    return {
      v: DISCHETTO_V,
      mv: MOTORE_V,
      imp: improntaMotore(),
      rosa: impaccaRosa(SAVE.rosa),
      n: dsCaso(8),
    };
  },`,
`  /* IL SALUTO NON PORTA PIU' IL NONCE (voce #150): porta il suo IMPEGNO.
     Il nonce resta in casa e si rivela dopo, con la busta 'N', e solo a
     chi si e' impegnato a sua volta. */
  mioSaluto(){
    const S = this.s;
    S.mioNonce = dsCaso(8);
    return {
      v: DISCHETTO_V,
      mv: MOTORE_V,
      imp: improntaMotore(),
      rosa: impaccaRosa(SAVE.rosa),
      hn: dsImpegnoSaluto(S.lato, S.mioNonce),
    };
  },`]);

/* il nonce non si ripesca piu' dal saluto: ce lo ha messo mioSaluto */
COPPIE.push([
`    S.mioSaluto = this.mioSaluto();
    S.mioNonce = S.mioSaluto.n;
    const r = await this.filoOra.manda({ k:'S', r:'a', t:0, d:S.mioSaluto });`,
`    S.mioSaluto = this.mioSaluto();
    const r = await this.filoOra.manda({ k:'S', r:'a', t:0, d:S.mioSaluto });`]);
COPPIE.push([
`    S.mioSaluto = this.mioSaluto();
    S.mioNonce = S.mioSaluto.n;
    const r = await this.filoOra.manda({ k:'S', r:'b', t:0, d:S.mioSaluto });`,
`    S.mioSaluto = this.mioSaluto();
    const r = await this.filoOra.manda({ k:'S', r:'b', t:0, d:S.mioSaluto });`]);

/* --------------------------------------------------------------- 4 */
COPPIE.push([
`    if(m.k === 'S'){ if(!S.suoSaluto){ this.chiudiAppuntamento(m.d); return true; } return false; }`,
`    /* IL SALUTO NON CHIUDE PIU' NIENTE (voce #150): porta un impegno, e
       un impegno da solo non fa un seme. Chiude la busta 'N', quando i
       due tempi sono compiuti tutti e due. */
    if(m.k === 'S'){ if(!S.suoSaluto){ this.leggiSaluto(m.d); return true; } return false; }
    if(m.k === 'N'){ if(!S.suoNonce){ S.suoNonce = (m.d && m.d.n) || ''; return true; } return false; }`]);

/* --------------------------------------------------------------- 5 */
COPPIE.push([
`  async manda(){
    const S = this.s;
    const t = S.tiro;
    /* l'impegno, appena c'e' */`,
`  async manda(){
    const S = this.s;
    /* LA SECONDA RIGA CHE VALE META' DEL CANTIERE (voce #150), ed e' la
       gemella di quella dei tiri: il nonce si rivela SOLO a chi ha gia'
       imbucato il proprio impegno. Toglila e chi parla per secondo si
       sceglie il seme, cioe' la partita. */
    if(S.suoSaluto && !S.mandatoN){
      const r = await this.filoOra.manda({ k:'N', r:S.lato, t:0, d:{ n:S.mioNonce } });
      if(r && r.ok && !r.perso) S.mandatoN = true;
    }
    const t = S.tiro;
    /* l'impegno, appena c'e' */`]);

/* --------------------------------------------------------------- 6 */
COPPIE.push([
`  chiudiAppuntamento(suo){
    const S = this.s;
    S.suoSaluto = suo;
    if(suo.v !== DISCHETTO_V){ S.fase='fine'; S.causa='versione-diversa'; return; }
    if(suo.mv !== MOTORE_V){ S.fase='fine'; S.causa='motore-diverso'; return; }
    const na = S.lato === 'a' ? S.mioNonce : suo.n;
    const nb = S.lato === 'a' ? suo.n : S.mioNonce;
    S.seme = dsMescola(na, nb);`,
`  /* IL PRIMO TEMPO: si guarda con chi si ha a che fare, e nient'altro.
     Qui il seme non si puo' ancora fare, perche' il nonce dell'altro non
     c'e': c'e' solo il suo impegno. */
  leggiSaluto(suo){
    const S = this.s;
    S.suoSaluto = suo;
    if(suo.v !== DISCHETTO_V){ S.fase='fine'; S.causa='versione-diversa'; return; }
    if(suo.mv !== MOTORE_V){ S.fase='fine'; S.causa='motore-diverso'; return; }
    S.fase = 'attesa-nonce';
  },

  /* IL SECONDO TEMPO: la rivelazione e' arrivata e la mia e' partita.
     Prima di fare il seme, l'impegno deve ricomporre — ed e' il secondo
     dei due soli punti del protocollo in cui non c'e' un dubbio ma un
     hash che non torna (l'altro e' impegno-non-torna, sui tiri). */
  chiudiAppuntamento(){
    const S = this.s;
    const suo = S.suoSaluto;
    if(dsImpegnoSaluto(S.lato === 'a' ? 'b' : 'a', S.suoNonce) !== suo.hn){
      S.fase='fine'; S.causa='saluto-non-torna'; return;
    }
    const na = S.lato === 'a' ? S.mioNonce : S.suoNonce;
    const nb = S.lato === 'a' ? S.suoNonce : S.mioNonce;
    S.seme = dsMescola(na, nb);`]);

/* --------------------------------------------------------------- 7 */
COPPIE.push([
`    await this.manda();
    this.avanza();`,
`    await this.manda();
    /* L'APPUNTAMENTO SI CHIUDE QUI, E QUANDO I DUE TEMPI SONO COMPIUTI
       TUTTI E DUE (voce #150): la mia rivelazione e' partita e la sua e'
       arrivata. Non prima — e stavolta e' vero, perche' la mia non parte
       se il suo impegno non e' in casa. */
    if(S.fase === 'attesa-nonce' && S.mandatoN && S.suoNonce) this.chiudiAppuntamento();
    this.avanza();`]);

/* --------------------------------------------------------------- 8 */
COPPIE.push([
`    return S.fase === 'scegli' || S.fase === 'attesa-impegno' ||
           S.fase === 'attesa-pari' || S.fase === 'pronto';`,
`    return S.fase === 'scegli' || S.fase === 'attesa-impegno' ||
           S.fase === 'attesa-pari' || S.fase === 'attesa-nonce' ||
           S.fase === 'pronto';`]);

COPPIE.push([
`    if(S.fase === 'fine' || S.fase === 'attesa-pari' || S.fase === 'pronto') return;`,
`    if(S.fase === 'fine' || S.fase === 'attesa-pari' ||
       S.fase === 'attesa-nonce' || S.fase === 'pronto') return;`]);

COPPIE.push([
`    if(S.fase === 'attesa-pari') return 'Sfida aperta. Manda il codice e aspetta che l’altro entri.';`,
`    if(S.fase === 'attesa-pari') return 'Sfida aperta. Manda il codice e aspetta che l’altro entri.';
    if(S.fase === 'attesa-nonce') return 'Ci siete tutti e due: si sta tirando a sorte in due, e nessuno dei due può barare.';`]);

COPPIE.push([
`      'impegno-non-torna':  'La mossa rivelata non è quella che era stata chiusa: la serie si ferma qui.',`,
`      'impegno-non-torna':  'La mossa rivelata non è quella che era stata chiusa: la serie si ferma qui.',
      'saluto-non-torna':   'Il numero rivelato per il sorteggio non è quello che era stato chiuso: la serie non parte.',`]);

for (const [cerca, metti] of COPPIE) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) {
    console.error('TOPPA NON APPLICATA: un ancoraggio e\' stato trovato ' + n + ' volte (ne serve 1).');
    console.error('  ' + cerca.split('\n')[0].trim().slice(0, 90));
    process.exit(1);
  }
  t = t.replace(cerca, metti);
}

/* le prove di applicazione: ogni pezzo una volta sola, e le tre righe
   vecchie sparite. Una toppa che non si controlla e' una toppa che si
   crede. */
const PROVE = [
  ['const DISCHETTO_V = 2;', 1],
  ['const DISCHETTO_V = 1;', 0],
  ['function dsImpegnoSaluto(lato, nonce){', 1],
  ["hn: dsImpegnoSaluto(S.lato, S.mioNonce),", 1],
  ["if(m.k === 'N'){ if(!S.suoNonce){", 1],
  ['if(S.suoSaluto && !S.mandatoN){', 1],
  ["S.causa='saluto-non-torna'; return;", 1],
  ['leggiSaluto(suo){', 1],
  ['chiudiAppuntamento(){', 1],
  ["if(S.fase === 'attesa-nonce' && S.mandatoN && S.suoNonce) this.chiudiAppuntamento();", 1],
  ["'saluto-non-torna':   'Il numero rivelato", 1],
  /* e quel che NON deve piu' esserci */
  ['S.mioNonce = S.mioSaluto.n;', 0],
  ['n: dsCaso(8),', 0],
  ['chiudiAppuntamento(suo){', 0],
  ['this.chiudiAppuntamento(m.d);', 0],
];
for (const [ago, quante] of PROVE) {
  const n = t.split(ago).length - 1;
  if (n !== quante) {
    console.error('TOPPA NON APPLICATA: «' + ago.slice(0, 60) + '» compare ' + n + ' volte, ne servono ' + quante);
    process.exit(1);
  }
}

fs.writeFileSync(FILE, t);
console.log('toppa seme-due-mani applicata a ' + path.relative(RADICE, FILE) + ' (' + COPPIE.length + ' ancoraggi)');
