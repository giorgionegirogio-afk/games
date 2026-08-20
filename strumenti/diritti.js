/* =====================================================================
   DIRITTI — il cancello che sorveglia cio' che il gioco puo' e non puo'
   contenere per essere venduto senza dovere niente a nessuno.

   PERCHE' ESISTE. Il controllo prescritto da _analisi/agente7.md §c
   («deve dare 0») il 20 agosto dava 3, e tutti e tre erano rumore:
   «FigC» e «fIGC» dentro i base64 dei font, e «Serie a oltranza» che e'
   italiano lecito (i rigori a oltranza), non il campionato. Un cancello
   che nasce rosso per rumore viene disattivato la prima volta che da'
   fastidio — e' la regola di casa — quindi questo: (1) maschera i
   base64 PRIMA di cercare; (2) pretende la A maiuscola su «Serie A»;
   (3) distingue i commenti dal testo che l'utente vede, con un
   lessatore che si autoverifica e che, se non capisce piu' il file,
   esce 2 invece di mentire.

   COSA GUARDA, e il perche' accanto a ogni voce:
     R1  marchi di federazioni/competizioni/club/giocatori/sponsor
         tecnici: OVUNQUE, anche nei commenti (agente7 §5: «la parola
         FIFA in nessun punto, nemmeno nei commenti»). Ogni termine
         della lista dava 0 sul gioco il 20/8/2026: il cancello nasce
         verde per merito, non per sconto.
     R2  nomi di prodotti concorrenti FUORI dai commenti (interfaccia,
         stringhe, markup): rosso. NEI commenti: solo un conteggio
         informativo, perche' quelle 15 menzioni su 13 righe sono note,
         censite, e hanno una toppa dedicata (_t-menzioni.js) — un rosso
         perpetuo su un fatto gia' deciso insegnerebbe a non guardare.
     R3  censimento dei base64: ogni data:*;base64 deve essere
         font/woff2 e devono essere ESATTAMENTE 2. Un asset incorporato
         nuovo deve passare di qui e dal NOTICE, ed e' giusto che costi.
     R4  censimento degli URL: solo la lista bianca (namespace SVG del
         W3C, i rimandi OFL, i due depositi upstream dei font che la
         schermata CREDITI cita). Un URL nuovo e' o rete o attribuzione
         mancante: in entrambi i casi va dichiarato.
     R5  librerie di terzi: <script src>, require(), import — zero.
     R6  il testo della licenza OFL DENTRO il gioco (condizione 2 della
         OFL: ogni copia porta avviso di copyright E licenza; il nameID
         13 nei woff2 e' stato buttato via col sottoinsieme, misurato
         con fontTools il 20/8/2026). Finche' la toppa _t-crediti.js non
         e' applicata, `--nota-aperta ofl` declassa questo rosso a NOTA
         APERTA stampata sopra il verdetto: il difetto e' vero, capito,
         e la cura e' scritta ma non applicabile finche' sei ancoraggi
         di altri specialisti vivono sull'md5 30279089de83. IL GIORNO IN
         CUI LA TOPPA ENTRA, SI TOGLIE LA DEROGA DALLA BATTERIA.

   COSA NON GUARDA, dichiarato: le tinte delle divise (un giudizio di
   convergenza a tre segnali e' umano, agente7 §5), le melodie (sono
   sintetizzate, ma «riconoscibile» lo decide un orecchio), i registri
   dei marchi (mai interrogati da nessuno su questo progetto). Una lista
   nera ATTESTA, non misura: l'inventario completo dei nomi enumerabili
   resta _z-legale-nomi.js, e si legge con gli occhi una volta per onda.

   CODICI DI CASA: 0 verde · 1 rosso · 2 il banco e' esploso (lessatore
   che non si fida di se' stesso) · 3 prova nulla (file non trovato).

   uso:
     node strumenti/diritti.js                          il gioco del repo
     node strumenti/diritti.js --gioco altro.html       quel file
     node strumenti/diritti.js --nota-aperta ofl        deroga R6 (batteria)
     node strumenti/diritti.js --elenco                 stampa i termini
     node strumenti/diritti.js --controllo-negativo     DEVE saper fallire:
         cinque sabotaggi su una copia FUORI dal repo, ognuno deve fare
         rosso, e il sesto (concorrente DENTRO un commento) NON deve —
         e' la prova d'anti-rumore. Esce 0 solo se tutti si comportano.
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* --------------------------------------------------------------------
   I TERMINI. Ogni voce porta il PERCHE' della sua forma: e' la forma
   che tiene fuori il rumore. Regola: un termine entra nella lista SOLO
   se sul gioco di oggi da' zero — altrimenti non e' un cancello, e' un
   allarme perenne. Verificati tutti a zero il 20/8/2026.
   -------------------------------------------------------------------- */
const TERMINI_OVUNQUE = [
  /* federazioni e competizioni: acronimi e nomi propri, nessun uso
     italiano lecito, quindi maiuscole/minuscole ignorate */
  { n: 'FIFA',           re: /\bfifa\b/gi },
  { n: 'UEFA',           re: /\buefa\b/gi },
  { n: 'FIGC',           re: /\bfigc\b/gi },
  { n: 'Champions',      re: /\bchampions\b/gi },
  { n: 'Premier',        re: /\bpremier\b/gi },
  { n: 'Coppa Italia',   re: /\bcoppa\s+italia\b/gi },
  { n: 'World Cup',      re: /\bworld\s+cup\b/gi },
  { n: 'Europa League',  re: /\beuropa\s+league\b/gi },
  /* Serie A: la A DEVE essere maiuscola e non seguita da lettera.
     «Serie a oltranza» (riga 11472 del gioco, i rigori) e' italiano
     lecito e non deve suonare: e' stato IL falso positivo storico. */
  { n: 'Serie A',        re: /\b[Ss]erie\s+A\b(?![a-zA-Zà-ù])/g },
  /* club: Maiuscola iniziale o TUTTO MAIUSCOLO. In minuscolo sono
     citta' o parole comuni in prosa e sarebbero rumore. */
  { n: 'Juventus',       re: /\b(Juventus|JUVENTUS)\b/g },
  { n: 'Milan',          re: /\b(Milan|MILAN)\b/g },
  { n: 'Inter',          re: /\b(Inter|INTER)\b/g },
  { n: 'Napoli',         re: /\b(Napoli|NAPOLI)\b/g },
  { n: 'Roma',           re: /\b(Roma|ROMA)\b/g },
  { n: 'Lazio',          re: /\b(Lazio|LAZIO)\b/g },
  { n: 'Atalanta',       re: /\b(Atalanta|ATALANTA)\b/g },
  { n: 'Fiorentina',     re: /\b(Fiorentina|FIORENTINA)\b/g },
  { n: 'Barcellona',     re: /\b(Barcell?ona|BARCELL?ONA)\b/g },
  { n: 'Liverpool',      re: /\b(Liverpool|LIVERPOOL)\b/g },
  { n: 'Chelsea',        re: /\b(Chelsea|CHELSEA)\b/g },
  { n: 'Arsenal',        re: /\b(Arsenal|ARSENAL)\b/g },
  { n: 'Bayern',         re: /\b(Bayern|BAYERN)\b/g },
  { n: 'Real Madrid',    re: /\bReal\s+Madrid\b/gi },
  { n: 'PSG',            re: /\bPSG\b/g },
  /* giocatori: «messi» minuscolo e' il participio di mettere («mal
     messi», riga 17941 del gioco): la maiuscola e' l'unico discrimine */
  { n: 'Messi',          re: /\b(Messi|MESSI)\b/g },
  { n: 'Ronaldo',        re: /\b(Ronaldo|RONALDO)\b/g },
  { n: 'Maradona',       re: /\b(Maradona|MARADONA)\b/g },
  { n: 'Neymar',         re: /\b(Neymar|NEYMAR)\b/g },
  { n: 'Mbappe',         re: /\b(Mbapp[eé]|MBAPP[EÉ])\b/g },
  { n: 'Haaland',        re: /\b(Haaland|HAALAND)\b/g },
  /* marchi tecnici: «puma» minuscolo e' un animale, «kappa» una lettera
     greca; adidas si scrive anche minuscolo ed e' inequivocabile */
  { n: 'Nike',           re: /\b(Nike|NIKE)\b/g },
  { n: 'Adidas',         re: /\badidas\b/gi },
  { n: 'Puma',           re: /\b(Puma|PUMA)\b/g },
  { n: 'Kappa',          re: /\b(Kappa|KAPPA)\b/g },
];
/* concorrenti: rossi FUORI dai commenti, contati DENTRO (informativo) */
const CONCORRENTI = [
  { n: 'Soccer Stars',    re: /soccer\s*stars/gi },
  { n: 'Head Ball',       re: /head\s*ball/gi },
  { n: 'Rocket League',   re: /rocket\s*league/gi },
  { n: 'Score Match',     re: /score\s*match/gi },
  { n: 'eFootball',       re: /efootball/gi },
  { n: 'Dream League',    re: /dream\s*league/gi },
  { n: 'Football Strike', re: /football\s*strike/gi },
  { n: 'Mini Football',   re: /mini\s*football/gi },
  { n: 'Retro Bowl',      re: /retro\s*bowl/gi },
];
/* URL ammessi (per prefisso). Il namespace SVG e' sintassi, non rete;
   gli altri quattro sono l'attribuzione OFL che la schermata CREDITI
   e il commento dei font portano per obbligo di licenza. */
const URL_AMMESSI = [
  'http://www.w3.org/2000/svg',
  'https://openfontlicense.org',
  'http://scripts.sil.org/OFL',
  'https://github.com/Omnibus-Type/ArchivoBlack',
  'https://github.com/jpt/barlow',
];
/* R6: le tre stringhe che provano che copyright e licenza viaggiano col
   gioco. Sono ESATTAMENTE i nameID 0 dei due woff2 (letti con fontTools
   il 20/8/2026) piu' il titolo canonico della OFL. */
const OFL_PROVE = [
  'Copyright 2017 The Archivo Black Project Authors (https://github.com/Omnibus-Type/ArchivoBlack)',
  'Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow)',
  'SIL OPEN FONT LICENSE Version 1.1',
];

if (haFlag('elenco')) {
  console.log('diritti.js — termini rossi OVUNQUE (' + TERMINI_OVUNQUE.length + '):');
  for (const t of TERMINI_OVUNQUE) console.log('  · ' + t.n + '   ' + t.re);
  console.log('concorrenti (rossi fuori dai commenti, ' + CONCORRENTI.length + '):');
  for (const t of CONCORRENTI) console.log('  · ' + t.n + '   ' + t.re);
  process.exit(0);
}

/* --------------------------------------------------------------------
   IL LESSATORE. Classifica ogni byte del file: commento (HTML <!-- -->,
   JS // e slash-asterisco, CSS) oppure no. Serve SOLO a R2 (concorrenti) e alle
   note informative: R1 e i censimenti girano sull'intero testo mascherato.
   E' prudente dove il file e' insidioso: il gioco ha UNA regex letterale
   con un apice dentro (riga 30825, replace di [&<>"]), quindi il `/'
   dopo `(` apre uno stato regex, come in ogni lessatore JS onesto.
   E SI AUTOVERIFICA: se le sentinelle escono classificate male, o la
   quota di commento e' assurda, il verdetto e' 2 (banco), non un verde
   o un rosso detto a caso.
   -------------------------------------------------------------------- */
function classifica(src) {
  const N = src.length;
  const commento = new Uint8Array(N); /* 1 = questo byte sta in un commento */
  let i = 0;
  /* stati html */
  const T_HTML = 0, T_HCOM = 1, T_TAG = 2, T_SCRIPT = 3, T_STYLE = 4;
  let st = T_HTML;
  let tagNome = '';
  /* sotto-stati script */
  let js = 'code'; /* code | line | block | sq | dq | tpl | regex | rclass */
  const tplStack = []; /* profondita' delle ${} nei template */
  let prevSign = ''; /* ultimo carattere significativo in code, per la
                        decisione regex-o-divisione */
  const inizioRegexDopo = '(,=:[!&|?;{}~+-*%<>\n';
  while (i < N) {
    const c = src[i], c2 = src.substr(i, 2);
    if (st === T_HTML) {
      if (src.startsWith('<!--', i)) { commento[i]=commento[i+1]=commento[i+2]=commento[i+3]=1; st = T_HCOM; i += 4; continue; }
      if (c === '<') { st = T_TAG; tagNome = ''; i++; continue; }
      i++; continue;
    }
    if (st === T_HCOM) {
      commento[i] = 1;
      if (src.startsWith('-->', i)) { commento[i+1]=commento[i+2]=1; st = T_HTML; i += 3; continue; }
      i++; continue;
    }
    if (st === T_TAG) {
      if (c === '"' || c === "'") { /* attributo: scorri fino alla chiusura */
        const q = c; i++;
        while (i < N && src[i] !== q) i++;
        i++; continue;
      }
      if (c === '>') {
        const nome = tagNome.toLowerCase();
        st = nome === 'script' ? T_SCRIPT : nome === 'style' ? T_STYLE : T_HTML;
        if (st === T_SCRIPT) { js = 'code'; tplStack.length = 0; prevSign = '\n'; }
        i++; continue;
      }
      if (/[a-zA-Z0-9/!-]/.test(c) && tagNome.length < 12) tagNome += c;
      else if (c === ' ' || c === '\t' || c === '\n') { /* il nome e' finito */ }
      i++; continue;
    }
    if (st === T_STYLE) {
      if (src.startsWith('</style', i)) { st = T_TAG; tagNome = '/style'; i += 7; continue; }
      if (c2 === '/*') {
        while (i < N && !src.startsWith('*/', i)) { commento[i] = 1; i++; }
        commento[i] = commento[i+1] = 1; i += 2; continue;
      }
      i++; continue;
    }
    /* T_SCRIPT */
    if (js === 'code') {
      if (src.startsWith('</script', i)) { st = T_TAG; tagNome = '/script'; i += 8; continue; }
      if (c2 === '//') { commento[i]=commento[i+1]=1; js = 'line'; i += 2; continue; }
      if (c2 === '/*') { commento[i]=commento[i+1]=1; js = 'block'; i += 2; continue; }
      if (c === "'") { js = 'sq'; i++; continue; }
      if (c === '"') { js = 'dq'; i++; continue; }
      if (c === '`') { js = 'tpl'; i++; continue; }
      if (c === '/') {
        /* regex o divisione? dopo un valore e' divisione, dopo un
           operatore/apertura e' una regex. E' l'euristica classica. */
        if (inizioRegexDopo.includes(prevSign) || prevSign === '' ||
            /\b(return|typeof|case|in|of|new|do|else)$/.test(prevParola(src, i))) {
          js = 'regex'; i++; continue;
        }
        prevSign = c; i++; continue;
      }
      if (c === '}' && tplStack.length && tplStack[tplStack.length-1] === 0) {
        tplStack.pop(); js = 'tpl'; i++; continue;
      }
      if (c === '{' && tplStack.length) tplStack[tplStack.length-1]++;
      if (c === '}' && tplStack.length) tplStack[tplStack.length-1]--;
      if (!/\s/.test(c)) prevSign = c;
      i++; continue;
    }
    if (js === 'line') { if (c === '\n') { js = 'code'; } else commento[i] = 1; i++; continue; }
    if (js === 'block') {
      commento[i] = 1;
      if (src.startsWith('*/', i)) { commento[i+1] = 1; js = 'code'; prevSign = ')'; i += 2; continue; }
      i++; continue;
    }
    if (js === 'sq') { if (c === '\\') { i += 2; continue; } if (c === "'") { js = 'code'; prevSign = ')'; } i++; continue; }
    if (js === 'dq') { if (c === '\\') { i += 2; continue; } if (c === '"') { js = 'code'; prevSign = ')'; } i++; continue; }
    if (js === 'tpl') {
      if (c === '\\') { i += 2; continue; }
      if (c === '`') { js = 'code'; prevSign = ')'; i++; continue; }
      if (c2 === '${') { tplStack.push(0); js = 'code'; prevSign = '('; i += 2; continue; }
      i++; continue;
    }
    if (js === 'regex') {
      if (c === '\\') { i += 2; continue; }
      if (c === '[') { js = 'rclass'; i++; continue; }
      if (c === '/') { js = 'code'; prevSign = ')'; i++; continue; }
      if (c === '\n') { js = 'code'; /* regex mai chiusa: era divisione */ }
      i++; continue;
    }
    if (js === 'rclass') {
      if (c === '\\') { i += 2; continue; }
      if (c === ']') js = 'regex';
      i++; continue;
    }
  }
  return commento;
}
function prevParola(src, i) {
  let j = i - 1;
  while (j >= 0 && /\s/.test(src[j])) j--;
  let k = j;
  while (k >= 0 && /[a-zA-Z$_]/.test(src[k])) k--;
  return src.slice(k + 1, j + 1);
}

/* --------------------------------------------------------------------
   IL CONTROLLO VERO E PROPRIO. Restituisce {rossi, note, banco} senza
   stampare: cosi' il controllo negativo lo riusa sulle copie sabotate.
   -------------------------------------------------------------------- */
function controlla(src, opz) {
  const rossi = [], note = [];
  /* base64 mascherati PRIMA di tutto: il rumore storico stava li' */
  const b64 = [];
  const mascherato = src.replace(/data:([a-z0-9/+.-]+);base64,[A-Za-z0-9+/=]+/gi,
    (m, mime) => { b64.push(mime.toLowerCase()); return 'data:' + mime + ';base64,#MASCHERATO#'; });

  const rigaDi = (offset) => {
    let r = 1;
    for (let k = 0; k < offset; k++) if (mascherato[k] === '\n') r++;
    return r;
  };

  /* lessatore + autoverifica */
  let commento = null;
  try { commento = classifica(mascherato); } catch (e) { return { banco: 'lessatore esploso: ' + e.message }; }
  let inComm = 0;
  for (let k = 0; k < commento.length; k++) inComm += commento[k];
  const quota = inComm / commento.length;
  if (quota < 0.05 || quota > 0.80)
    return { banco: 'quota di commento assurda (' + (quota*100).toFixed(1) + '%): il lessatore non capisce piu\' questo file' };
  /* sentinelle: se il file le contiene, TUTTE le occorrenze devono
     stare dalla parte attesa. I testi sono scelti perche' possono
     esistere SOLO da quella parte: un'assegnazione .textContent e un
     tag h1 non possono che essere codice/markup, e «pedina di Soccer
     Stars» esiste solo nei due commenti censiti (righe 4997 e 5051).
     La prima versione usava «TORNA AL MENU» e sbagliava LEI, non il
     lessatore: quelle parole appaiono anche in un commento CSS a riga
     211. Una sentinella ambigua non e' una sentinella. */
  const sentinelle = [
    { testo: 'pedina di Soccer Stars', deve: 1 },              /* solo commenti */
    { testo: "textContent='SBLOCCATO", deve: 0 },              /* solo codice JS */
    { testo: 'sotto-titolo">LA BACHECA DEL CAMPETTO', deve: 0 }, /* solo markup */
  ];
  for (const s of sentinelle) {
    let da = 0, p;
    while ((p = mascherato.indexOf(s.testo, da)) >= 0) {
      if (commento[p] !== s.deve)
        return { banco: 'sentinella classificata male ("' + s.testo + '" a offset ' + p + ', attesa ' + (s.deve ? 'commento' : 'non-commento') + '): lessatore inaffidabile' };
      da = p + 1;
    }
  }

  /* R1 — termini rossi ovunque (sul testo mascherato) */
  for (const t of TERMINI_OVUNQUE) {
    t.re.lastIndex = 0; let m;
    while ((m = t.re.exec(mascherato))) rossi.push('R1 «' + t.n + '» riga ' + rigaDi(m.index) + ': …' + estratto(mascherato, m.index) + '…');
  }
  /* R2 — concorrenti: fuori dai commenti rosso, dentro conteggio */
  let commConc = 0;
  for (const t of CONCORRENTI) {
    t.re.lastIndex = 0; let m;
    while ((m = t.re.exec(mascherato))) {
      if (commento[m.index]) commConc++;
      else rossi.push('R2 «' + t.n + '» FUORI da un commento, riga ' + rigaDi(m.index) + ': …' + estratto(mascherato, m.index) + '…');
    }
  }
  note.push('menzioni di concorrenti nei commenti: ' + commConc +
    (commConc ? '  (censite; toppa _t-menzioni.js scritta, applicarla le porta a 0)' : ''));
  /* R3 — censimento base64 */
  if (b64.length !== 2 || b64.some(m => m !== 'font/woff2'))
    rossi.push('R3 base64: attesi ESATTAMENTE 2 font/woff2, trovati [' + b64.join(', ') + ']. Un asset incorporato nuovo va iscritto nel NOTICE e qui.');
  /* R4 — censimento URL */
  const urlRe = /https?:\/\/[^\s"'<>()\\]+/g; let m2;
  while ((m2 = urlRe.exec(mascherato))) {
    const u = m2[0].replace(/[.,;]+$/, '');
    if (!URL_AMMESSI.some(a => u.startsWith(a)))
      rossi.push('R4 URL non in lista bianca, riga ' + rigaDi(m2.index) + ': ' + u);
  }
  /* R5 — librerie. Comment-aware: un <script src> commentato non viene
     caricato e un «import» in una frase italiana di commento sarebbe
     rumore; cio' che il browser ESEGUE non sta mai in un commento. */
  for (const re of [/<script[^>]+\bsrc\s*=/gi, /\brequire\s*\(/g, /\bimport\s*\(/g, /^\s*import\s+[a-zA-Z{"']/gm]) {
    re.lastIndex = 0; let m3;
    while ((m3 = re.exec(mascherato))) {
      if (commento[m3.index]) continue;
      rossi.push('R5 aggancio a una libreria/risorsa esterna, riga ' + rigaDi(m3.index) + ': …' + estratto(mascherato, m3.index) + '…');
    }
  }
  /* R6 — la licenza OFL viaggia col gioco */
  const mancanoOfl = OFL_PROVE.filter(p => !src.includes(p));
  if (mancanoOfl.length) {
    const msg = 'R6 il testo della licenza OFL NON viaggia col gioco (mancano: ' +
      mancanoOfl.map(s => '"' + s.slice(0, 40) + '…"').join(', ') + '). ' +
      'Obbligo OFL cond. 2; nameID 13 assente dai woff2 (misurato). Cura: strumenti/_t-crediti.js';
    if (opz.notaAperta === 'ofl') note.push('NOTA APERTA — ' + msg + ' — deroga dichiarata finche\' la toppa non e\' applicabile');
    else rossi.push(msg);
  }
  /* informativo: le due sole data:image devono restare svg scritte a mano */
  const nImg = (mascherato.match(/data:image\//g) || []).length;
  note.push('data:image nel file: ' + nImg + ' (attese 2, entrambe svg+xml scritte a mano)');
  return { rossi, note };
}
function estratto(s, i) {
  return s.slice(Math.max(0, i - 30), i + 40).replace(/\s+/g, ' ').trim();
}

/* --------------------------------------------------------------------
   CONTROLLO NEGATIVO — un cancello che non e' stato visto fallire non
   e' un cancello. Copia FUORI dal repo, sei sabotaggi, sei attese.
   -------------------------------------------------------------------- */
function controlloNegativo(gioco) {
  const src = fs.readFileSync(gioco, 'utf8');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'diritti-neg-'));
  const casi = [
    { nome: 'club reale nel markup (JUVENTUS)',
      fai: s => s.replace('</body>', '<div>FORZA JUVENTUS</div></body>'),
      attesa: 'rosso' },
    { nome: 'FIFA dentro un commento JS',
      fai: s => s.replace('const NEGOZIO=[', '/* come in FIFA */ const NEGOZIO=[',),
      attesa: 'rosso' },
    { nome: 'script di terzi via CDN',
      fai: s => s.replace('</body>', '<script src="https://cdn.example.com/x.js"></script></body>'),
      attesa: 'rosso' },
    { nome: 'asset base64 nuovo (png)',
      fai: s => s.replace('</body>', '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==" alt=""></body>'),
      attesa: 'rosso' },
    { nome: 'concorrente in una stringa VISIBILE',
      fai: s => s.replace("textContent='SCRIVI I TUOI CARTELLONI'", "textContent='MEGLIO DI Soccer Stars'"),
      attesa: 'rosso' },
    { nome: 'concorrente dentro un COMMENTO (anti-rumore: NON deve suonare)',
      fai: s => s.replace('const NEGOZIO=[', '/* nota: Rocket League fa diversamente */ const NEGOZIO=[',),
      attesa: 'verde' },
  ];
  let bene = 0;
  for (const c of casi) {
    const s2 = c.fai(src);
    if (s2 === src) { console.log('  BANCO  ' + c.nome + ': il sabotaggio non ha trovato il suo aggancio'); continue; }
    const f = path.join(dir, 'sab.html');
    fs.writeFileSync(f, s2);
    const esito = controlla(s2, { notaAperta: 'ofl' });
    const rosso = esito.banco ? 'banco' : (esito.rossi.length ? 'rosso' : 'verde');
    const ok = rosso === c.attesa;
    console.log('  ' + (ok ? 'VISTO ' : 'CIECO ') + ' ' + c.nome + ' -> ' + rosso + (ok ? '' : ' (atteso ' + c.attesa + ')'));
    if (!ok && esito.banco) console.log('         ' + esito.banco);
    if (ok) bene++;
  }
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  console.log(bene === casi.length
    ? 'CONTROLLO NEGATIVO: ' + bene + '/' + casi.length + ' — il cancello sa fallire, e sa anche NON gridare sul rumore.'
    : 'CONTROLLO NEGATIVO FALLITO: ' + bene + '/' + casi.length);
  process.exit(bene === casi.length ? 0 : 1);
}

/* -------------------------------------------------------------------- */
const gioco = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(gioco)) { console.error('PROVA NULLA: non esiste ' + gioco); process.exit(3); }
if (haFlag('controllo-negativo')) controlloNegativo(gioco);
else {
  const src = fs.readFileSync(gioco, 'utf8');
  const esito = controlla(src, { notaAperta: arg('nota-aperta', '') });
  if (esito.banco) { console.error('BANCO: ' + esito.banco); process.exit(2); }
  for (const n of esito.note) console.log('  nota   ' + n);
  if (esito.rossi.length) {
    console.log('DIRITTI: ROSSO — ' + esito.rossi.length + ' violazioni su ' + path.basename(gioco));
    for (const r of esito.rossi) console.log('  ' + r);
    process.exit(1);
  }
  console.log('DIRITTI: verde su ' + path.basename(gioco) + ' — ' + TERMINI_OVUNQUE.length +
    ' termini a zero, concorrenti fuori dai commenti a zero, 2 base64 attesi, URL in lista bianca, zero librerie.');
  process.exit(0);
}
