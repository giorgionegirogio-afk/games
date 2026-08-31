/* =====================================================================
   _t-sfida-onesta.js — SETTE CORTESIE CHE LA SFIDA NON FACEVA
   (31 agosto 2026, dal registro delle incoerenze del manuale, fascio
   «sfida-onesta»: qui si curano annunci, accenti e segni di cortesia —
   la simulazione, la rete e i sorteggi non cambiano di una virgola).

   1. #duelMsg e' dichiarato «per i lettori di schermo» (il CSS lo
      ritaglia a un pixel) ma senza aria-live un testo cambiato dentro
      un nodo gia' presente non viene MAI annunciato: adesso ha
      role="status" e aria-live="polite". E il colore che l'esito gli
      tingeva addosso era vestire un invisibile: tolto.
   2. TUTTI i messaggi JS del dominio SFIDA usavano l'apostrofo al posto
      dell'accento (e', piu', puo', da', li', ne', succedera') mentre
      l'HTML statico usa le accentate vere: censiti con Grep riga per
      riga e curati uno per uno — perche(), aggiorna(), dipingi(), i
      verdetti di guarda() e del replay, i toast. E la frase «un'altra
      persona» scritta da aggiorna() sostituiva con l'apostrofo dritto
      il tipografico che la stessa frase ha nell'HTML (un&rsquo;altra):
      al primo giro di rete la schermata cambiava apostrofo sotto gli
      occhi. Adesso e' un’altra anche da JS.
   3. Invio nel campo del codice di trasferimento (sfCodIn) non faceva
      niente: adesso vale USA IL CODICE, stesso gestore del bottone.
   4. CERCA AVVERSARIO e GUARDA ignoravano il tocco in silenzio finche'
      il flag occupato era alzato: adesso chi alza o abbassa il flag
      passa da impegna(), che veste e sveste i bottoni con la classe
      .sf-occupato — mezzo spenti finche' il giro di rete non e' finito.
   5. Le partite scartate dalla coda per errore definitivo sparivano
      senza una parola: adesso nel punto esatto in cui svuotaCoda le
      butta parte un toast onesto, col punteggio e il motivo.
   6. usaCodice cambiava identita' ma non azzerava punti/posto/forza:
      la tessera mostrava i numeri del vecchio proprietario fino al
      giro di rete successivo. Si azzerano dove l'identita' cambia,
      prima di ridipingere.
   7. apriCodice scriveva il messaggio d'aiuto DENTRO il campo readonly
      del codice, travestito da codice: adesso sta in un piccolo sotto
      il campo (#sfCodAiuto), e il campo resta vuoto se non c'e'
      identita'.

   uso:  node strumenti/_t-sfida-onesta.js --out fuori/sfida-onesta.html
         node strumenti/_t-sfida-onesta.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/sfida-onesta.html'));

const ANCORE = [

/* 1 — il duello si annuncia davvero, e smette di tingere l'invisibile */
{
  nome: '1a/7 duelMsg con aria-live e role',
  cerca:
`      <div id="duelMsg"></div>`,
  metti:
`      <!-- annunciato DAVVERO: senza aria-live un testo cambiato dentro
           un nodo gia' presente non viene mai letto dai lettori di
           schermo (31 agosto 2026) -->
      <div id="duelMsg" role="status" aria-live="polite"></div>`,
},
{
  nome: '1b/7 via il colore morto dell\'esito',
  cerca:
`        ui.duelMsg.textContent=M[s.outcome];
        ui.duelMsg.style.color = s.outcome==='gol'
          ? TEAMCOL[s.shooter]
          : (s.outcome==='parata'?'#f2f5ef':'#ffb020');`,
  metti:
`        /* niente colore: #duelMsg e' largo un pixel e ritagliato via
           dal clip, esiste solo per i lettori di schermo — tingerlo era
           vestire un invisibile (31 agosto 2026) */
        ui.duelMsg.textContent=M[s.outcome];`,
},

/* 2 — le accentate vere in tutti i messaggi JS della sfida */
{
  nome: '2a/7 perche(): la sfida è spenta',
  cerca: `    if(errore === 'spenta')  return 'La sfida e\\' spenta in questa copia del gioco: manca l\\'indirizzo del server.';`,
  metti: `    if(errore === 'spenta')  return 'La sfida è spenta in questa copia del gioco: manca l\\'indirizzo del server.';`,
},
{
  nome: '2b/7 perche(): non è più ammessa',
  cerca: `    if(errore === 'bandito') return 'Questa squadra non e\\' piu\\' ammessa in classifica.';`,
  metti: `    if(errore === 'bandito') return 'Questa squadra non è più ammessa in classifica.';`,
},
{
  nome: '2c/7 aggiorna(): se c\'è campo',
  cerca: `      this.stato('Sto guardando se c\\'e\\' campo...');`,
  metti: `      this.stato('Sto guardando se c\\'è campo...');`,
},
{
  nome: '2d/7 aggiorna(): un’altra col tipografico, come l\'HTML',
  cerca: `      this.stato('Attacca la squadra di un\\'altra persona: non deve essere online, non deve nemmeno aver aperto il gioco oggi.');`,
  metti: `      this.stato('Attacca la squadra di un’altra persona: non deve essere online, non deve nemmeno aver aperto il gioco oggi.');`,
},
{
  nome: '2e/7 dipingi(): il seme che dà il server',
  cerca: `              : 'una partita sola, col seme che da\\' il server') + '</small>';`,
  metti: `              : 'una partita sola, col seme che dà il server') + '</small>';`,
},
{
  nome: '2f/7 dipingi(): quando succederà',
  cerca: `      box.innerHTML = '<div class="sf-vuota">Nessuno ti ha ancora attaccato. Quando succedera\\' lo troverai qui, con la partita da rivedere.</div>';`,
  metti: `      box.innerHTML = '<div class="sf-vuota">Nessuno ti ha ancora attaccato. Quando succederà lo troverai qui, con la partita da rivedere.</div>';`,
},
{
  nome: '2g/7 guarda(): non si può più rivedere',
  cerca: `      this.stato('Questa partita non si puo\\' piu\\' rivedere: il server non ha la rosa di chi ti ha attaccato.', true);`,
  metti: `      this.stato('Questa partita non si può più rivedere: il server non ha la rosa di chi ti ha attaccato.', true);`,
},
{
  nome: '2h/7 guarda(): il nastro è di una forma ignota',
  cerca: `      this.stato('Il nastro di questa partita non si riesce ad aprire: e\\' di una forma che questo gioco non sa leggere.', true);`,
  metti: `      this.stato('Il nastro di questa partita non si riesce ad aprire: è di una forma che questo gioco non sa leggere.', true);`,
},
{
  nome: '2i/7 guarda(): è passata da un piazzato',
  cerca:
`      this.stato('Questa partita e\\' passata da un calcio piazzato, e i comandi del duello dal ' +
                 'dischetto il registro non li annota ancora: rivederla darebbe una partita diversa ' +
                 'da quella che hai subito, quindi non te la faccio vedere. Il risultato e\\' quello qui sotto.', true);`,
  metti:
`      this.stato('Questa partita è passata da un calcio piazzato, e i comandi del duello dal ' +
                 'dischetto il registro non li annota ancora: rivederla darebbe una partita diversa ' +
                 'da quella che hai subito, quindi non te la faccio vedere. Il risultato è quello qui sotto.', true);`,
},
{
  nome: '2j/7 classifica: è ancora vuota',
  cerca: `      box.innerHTML = '<div class="sf-vuota">La classifica e\\' ancora vuota. Gioca la prima sfida e ci sei.</div>';`,
  metti: `      box.innerHTML = '<div class="sf-vuota">La classifica è ancora vuota. Gioca la prima sfida e ci sei.</div>';`,
},
{
  nome: '2l/7 usaCodice: questo telefono è quella squadra',
  cerca: `      toast('scopa','SQUADRA RIPRESA','Adesso questo telefono e\\' quella squadra.');`,
  metti: `      toast('scopa','SQUADRA RIPRESA','Adesso questo telefono è quella squadra.');`,
},
{
  nome: '2m/7 chiudiSfida: il replay è finito diverso',
  cerca:
`        Sfida.stato('Il replay non ha ricostruito la partita: e\\' finito ' + ga + '-' + gd +
                    ' e quella vera era ' + S.atteso[0] + '-' + S.atteso[1] + '. La squadra di chi ti ha ' +
                    'attaccato e\\' cambiata da allora, e il server ne tiene una copia sola, quella di oggi.', true);`,
  metti:
`        Sfida.stato('Il replay non ha ricostruito la partita: è finito ' + ga + '-' + gd +
                    ' e quella vera era ' + S.atteso[0] + '-' + S.atteso[1] + '. La squadra di chi ti ha ' +
                    'attaccato è cambiata da allora, e il server ne tiene una copia sola, quella di oggi.', true);`,
},
{
  nome: '2n/7 fermaReplayAlDischetto: si è fermata, da lì non si può',
  cerca:
`  Sfida.stato('Questa partita si e\\' fermata su un calcio piazzato: il registro non annota ancora ' +
              'i comandi del duello dal dischetto, e da li\\' in poi non si puo\\' rivedere. ' +
              'Il risultato resta quello scritto qui sotto.', true);`,
  metti:
`  Sfida.stato('Questa partita si è fermata su un calcio piazzato: il registro non annota ancora ' +
              'i comandi del duello dal dischetto, e da lì in poi non si può rivedere. ' +
              'Il risultato resta quello scritto qui sotto.', true);`,
},
{
  nome: '2o/7 abbandonaSfida: né in bene né in male',
  cerca: `  if(!S.replay) toast('fischietto','SFIDA ABBANDONATA','Non e\\' stata mandata: non conta ne\\' in bene ne\\' in male.');`,
  metti: `  if(!S.replay) toast('fischietto','SFIDA ABBANDONATA','Non è stata mandata: non conta né in bene né in male.');`,
},
/* (la voce 2k, «Ancora nessuna identita'», si cura dentro la 7b:
   il testo cambia di posto E di accento in una mossa sola) */

/* 3 — Invio nel campo del codice vale USA IL CODICE */
{
  nome: '3/7 Invio conferma il codice',
  cerca:
`$('btnSfCodUsa').addEventListener('click', ()=>{ Audio5.unlock(); Sfida.usaCodice(); });`,
  metti:
`$('btnSfCodUsa').addEventListener('click', ()=>{ Audio5.unlock(); Sfida.usaCodice(); });
/* Invio nel campo del codice vale USA IL CODICE: chi incolla e preme
   Invio non deve andare a cercare il bottone (31 agosto 2026) */
$('sfCodIn').addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); Audio5.unlock(); Sfida.usaCodice(); } });`,
},

/* 4 — il flag occupato si vede: la classe, il vestitore, i sei passaggi */
{
  nome: '4a/7 il vestito CSS dei bottoni occupati',
  cerca: `.sfriga .fbtn{padding:5px 10px;font-size:11px;margin:0}`,
  metti:
`.sfriga .fbtn{padding:5px 10px;font-size:11px;margin:0}
/* MENTRE LA RETE GIRA SI VEDE: CERCA AVVERSARIO e GUARDA ignoravano il
   tocco in silenzio finche' il flag occupato di Sfida era alzato. Il
   bottone occupato adesso e' mezzo spento e non prende il dito; la
   classe la mette e la toglie Sfida.impegna (31 agosto 2026) */
.sf-occupato{opacity:.45;pointer-events:none}`,
},
{
  nome: '4b/7 impegna(): chi alza il flag veste i bottoni',
  cerca:
`const Sfida = {
  /* un tocco alla volta: due CERCA AVVERSARIO in fila prenderebbero due
     impegni dal server e il primo dei due morirebbe senza partita */
  occupato: false,`,
  metti:
`const Sfida = {
  /* un tocco alla volta: due CERCA AVVERSARIO in fila prenderebbero due
     impegni dal server e il primo dei due morirebbe senza partita */
  occupato: false,
  /* IL FLAG SI DEVE VEDERE (31 agosto 2026): mentre la rete girava,
     CERCA AVVERSARIO e GUARDA ignoravano il tocco senza dare un segno.
     Chi alza o abbassa il flag passa di qui: i bottoni si vestono e si
     svestono di .sf-occupato, mezzo spenti finche' il giro non finisce. */
  impegna(v){
    this.occupato = !!v;
    const c = $('btnSfidaCerca');
    if(c) c.classList.toggle('sf-occupato', this.occupato);
    const l = $('sfLista');
    if(l) l.querySelectorAll('[data-guarda]').forEach(b => b.classList.toggle('sf-occupato', this.occupato));
  },`,
},
{
  nome: '4c/7 aggiorna() alza il flag vestendo',
  cerca:
`  async aggiorna(){
    if(this.occupato) return;
    this.occupato = true;
    try{`,
  metti:
`  async aggiorna(){
    if(this.occupato) return;
    this.impegna(true);
    try{`,
},
{
  nome: '4d/7 aggiorna() lo abbassa svestendo',
  cerca:
`    }finally{
      this.occupato = false;
    }`,
  metti:
`    }finally{
      this.impegna(false);
    }`,
},
{
  nome: '4e/7 cerca() alza il flag vestendo',
  cerca:
`    if(this.occupato) return;
    if(!Rete.base){ this.stato(this.perche('spenta'), true); return; }
    this.occupato = true;
    this.stato('Sto cercando una squadra della tua forza...');`,
  metti:
`    if(this.occupato) return;
    if(!Rete.base){ this.stato(this.perche('spenta'), true); return; }
    this.impegna(true);
    this.stato('Sto cercando una squadra della tua forza...');`,
},
{
  nome: '4f/7 cerca() lo abbassa svestendo',
  cerca:
`    this.occupato = false;
    if(!r || !r.ok){ this.stato(this.perche(r && r.errore), true); return; }
    this.gioca(r);`,
  metti:
`    this.impegna(false);
    if(!r || !r.ok){ this.stato(this.perche(r && r.errore), true); return; }
    this.gioca(r);`,
},
{
  nome: '4g/7 guarda() alza il flag vestendo',
  cerca:
`    if(this.occupato) return;
    if(!Rete.base){ this.stato(this.perche('spenta'), true); return; }
    this.occupato = true;
    this.stato('Sto prendendo la partita...');`,
  metti:
`    if(this.occupato) return;
    if(!Rete.base){ this.stato(this.perche('spenta'), true); return; }
    this.impegna(true);
    this.stato('Sto prendendo la partita...');`,
},
{
  nome: '4h/7 guarda() lo abbassa svestendo',
  cerca:
`    this.occupato = false;
    if(!r || !r.ok || !r.sfida){ this.stato(this.perche(r && r.errore), true); return; }`,
  metti:
`    this.impegna(false);
    if(!r || !r.ok || !r.sfida){ this.stato(this.perche(r && r.errore), true); return; }`,
},
{
  nome: '4i/7 dipingi(): i bottoni nuovi nascono gia\' vestiti',
  cerca:
`    box.querySelectorAll('[data-guarda]').forEach(b => {
      b.addEventListener('click', () => { Audio5.unlock(); Audio5.beep(520); this.guarda(b.dataset.guarda|0); });
    });`,
  metti:
`    box.querySelectorAll('[data-guarda]').forEach(b => {
      /* ridipinta mentre la rete gira: i bottoni nascono gia' vestiti */
      if(this.occupato) b.classList.add('sf-occupato');
      b.addEventListener('click', () => { Audio5.unlock(); Audio5.beep(520); this.guarda(b.dataset.guarda|0); });
    });`,
},

/* 5 — la partita buttata dalla coda lo dice */
{
  nome: '5/7 il toast della partita scartata',
  cerca: `      if(definitivo){ m.coda.shift(); persistSave(); continue; }`,
  metti:
`      if(definitivo){
        m.coda.shift(); persistSave();
        /* LA PARTITA SI BUTTA QUI, e chi l'ha giocata deve saperlo:
           prima spariva dalla coda in silenzio (31 agosto 2026) */
        try{
          toast('fischietto','PARTITA NON CONSEGNATA',
                'Il ' + (riga.gol_a|0) + '-' + (riga.gol_d|0) + ' non sarà mai consegnato: il server ' +
                'l\\'ha rifiutato per sempre (' + String(r.errore||'ignoto') + '). Le altre in coda vanno avanti.');
        }catch(e){}
        continue;
      }`,
},

/* 6 — la nuova identita' non porta i numeri della vecchia */
{
  nome: '6/7 usaCodice azzera punti/posto/forza',
  cerca:
`    const m = this.mem();
    m.id = p[0]; m.segreto = p[1]; m.coda = [];
    persistSave();
    return true;`,
  metti:
`    const m = this.mem();
    m.id = p[0]; m.segreto = p[1]; m.coda = [];
    /* i numeri del VECCHIO proprietario non seguono la squadra: punti,
       posto e forza li ridara' il server alla prossima apertura, e fino
       ad allora la tessera dice «—», non i suoi (31 agosto 2026) */
    m.punti = 0; m.posto = 0; m.forza = 0;
    persistSave();
    return true;`,
},

/* 7 — l'aiuto esce dal campo readonly */
{
  nome: '7a/7 il piccolo sotto il campo del codice',
  cerca:
`      <input id="sfCodMio" readonly spellcheck="false" aria-label="il tuo codice di trasferimento">`,
  metti:
`      <input id="sfCodMio" readonly spellcheck="false" aria-label="il tuo codice di trasferimento">
      <div class="sf-nota hidden" id="sfCodAiuto"></div>`,
},
{
  nome: '7b/7 apriCodice: il campo resta un campo',
  cerca:
`  apriCodice(){
    const c = Rete.codiceTrasferimento();
    const e = $('sfCodMio');
    if(e) e.value = c || 'Ancora nessuna identita\\': apri la sfida una volta con la rete accesa.';
    const i = $('sfCodIn'); if(i) i.value = '';
    show($('sfidaCodice'));
  },`,
  metti:
`  apriCodice(){
    const c = Rete.codiceTrasferimento();
    const e = $('sfCodMio');
    /* il campo readonly contiene IL CODICE o niente: l'aiuto ci stava
       DENTRO travestito da codice, e chi provava a copiarlo si portava
       via una frase (31 agosto 2026). Adesso sta nel piccolo sotto. */
    if(e) e.value = c || '';
    const n = $('sfCodAiuto');
    if(n){
      n.textContent = c ? '' : 'Ancora nessuna identità: apri la sfida una volta con la rete accesa.';
      n.classList.toggle('hidden', !!c);
    }
    const i = $('sfCodIn'); if(i) i.value = '';
    show($('sfidaCodice'));
  },`,
},

];

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
  process.exit(1);
}
const attesi = [
  /* dominio SFIDA senza piu' apostrofi-accento: ogni \' superstite nel
     file e' un'elisione vera (l', c', un') — contate, non stimate */
  ["e\\'", 0], ["a\\'", 0], ["o\\'", 0], ["i\\'", 0],
  ['La sfida è spenta', 1],
  ['non è più ammessa in classifica', 1],
  ["c\\'è campo", 1],
  ['un’altra persona: non deve essere online', 1],
  ['col seme che dà il server', 1],
  ['Quando succederà lo troverai qui', 1],
  ['non si può più rivedere', 1],
  ['è di una forma che questo gioco non sa leggere', 1],
  ['Il risultato è quello qui sotto', 1],
  ['La classifica è ancora vuota', 1],
  ['Adesso questo telefono è quella squadra', 1],
  ['è cambiata da allora', 1],
  ['si è fermata su un calcio piazzato', 1],
  ['da lì in poi non si può rivedere', 1],
  ['né in bene né in male', 1],
  /* il duello annunciato, senza il colore morto (restano i DUE
     textContent: l'azzeramento all'apertura e l'esito) */
  ['aria-live="polite"', 1],
  ['role="status"', 1],
  ['ui.duelMsg.style.color', 0],
  ['ui.duelMsg.textContent', 2],
  /* il flag occupato passa SEMPRE dal vestitore: tre alzate, tre
     abbassate, zero assegnamenti diretti superstiti */
  ['this.impegna(true)', 3],
  ['this.impegna(false)', 3],
  ['this.occupato = true', 0],
  ['this.occupato = false', 0],
  /* la classe: 1 regola CSS + 1 nel commento di impegna + 2 toggle
     dentro impegna + 1 add in dipingi */
  ['sf-occupato', 5],
  /* Invio, il toast della coda, l'azzeramento, l'aiuto fuori dal campo */
  ["$('sfCodIn').addEventListener('keydown'", 1],
  ['PARTITA NON CONSEGNATA', 1],
  ['m.punti = 0; m.posto = 0; m.forza = 0;', 1],
  ['sfCodAiuto', 2],
  ['Ancora nessuna identità: apri la sfida una volta con la rete accesa.', 1],
  ["Ancora nessuna identita\\'", 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
