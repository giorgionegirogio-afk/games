/* =====================================================================
   _143-siti.js — DOVE IL GIOCO CHIAMA DAVVERO UNA TRASCENDENTE
   (voce #143, compito 1 — usato anche dal compito 3)

   PERCHE' NON BASTA UNA GREP. `grep -o "Math\.sin("` conta 161
   occorrenze nel file, ma il file e' fatto per meta' di commenti lunghi
   in italiano che PARLANO di Math.sin — `const len=(x,y)=>Math.hypot(x,y)`
   compare per intero dentro il verbale del #141, e dentro le stringhe
   dell'aiuto. Una toppa che sostituisse quelle occorrenze riscriverebbe
   la documentazione e conterebbe siti che non esistono.

   QUI SI SEPARA IL CODICE DAL RESTO con uno scanner che tiene il conto
   di: commento di riga, commento a blocco, stringa singola, stringa
   doppia, template letterale (con le parentesi ${...} annidate) e
   letterale di espressione regolare. Restituisce la posizione esatta di
   ogni chiamata ESEGUIBILE.

   IL LETTERALE DI ESPRESSIONE REGOLARE e' l'unico caso ambiguo in
   JavaScript (`/` e' divisione o inizio di regex a seconda del token
   precedente). Si decide col token non bianco precedente, che e' la
   regola vera dello standard; e se un giorno sbagliasse, sbaglierebbe
   in un punto senza `Math.` dentro, quindi al piu' salta un sito invece
   di inventarne uno. Chi innesta CONTA i siti e si ferma se il numero
   non e' quello atteso: un sito saltato diventa un rosso, non un
   silenzio.
   ===================================================================== */
'use strict';

/* i nomi che ci interessano: le trascendenti piu' sqrt e pow, che sono
   correttamente arrotondate per IEEE-754 ma vanno contate lo stesso per
   poterlo dire con un numero invece che per sentito dire */
const NOMI = ['sin', 'cos', 'tan', 'exp', 'log', 'atan2', 'hypot', 'pow', 'sqrt'];

/* il token precedente decide se `/` apre una regex o e' una divisione:
   dopo un identificatore, un numero, `)`, `]` o `}` e' divisione. */
function divisionePrecedente(t, i) {
  let j = i - 1;
  while (j >= 0 && /\s/.test(t[j])) j--;
  if (j < 0) return false;
  const c = t[j];
  if (c === ')' || c === ']' || /[A-Za-z0-9_$]/.test(c)) {
    /* `return /re/` e `typeof /re/` sono regex anche se finiscono per
       lettera: si guarda la parola intera. */
    let k = j;
    while (k >= 0 && /[A-Za-z0-9_$]/.test(t[k])) k--;
    const p = t.slice(k + 1, j + 1);
    if (/^(return|typeof|instanceof|in|of|new|delete|void|case|do|else|yield|await)$/.test(p)) return false;
    return true;
  }
  return false;
}

/* trovaSiti(testo) -> [{nome, indice}] con `indice` posizione di 'M' di
   `Math.<nome>(`. Solo le occorrenze che il motore esegue davvero. */
function trovaSiti(t) {
  const siti = [];
  const n = t.length;
  let i = 0;
  /* pila dei template letterali: ogni `${` dentro un template apre un
     livello di codice normale, e la `}` che lo chiude torna al template */
  const pila = [];
  while (i < n) {
    const c = t[i];
    /* commento di riga */
    if (c === '/' && t[i + 1] === '/') { while (i < n && t[i] !== '\n') i++; continue; }
    /* commento a blocco */
    if (c === '/' && t[i + 1] === '*') { i += 2; while (i < n && !(t[i] === '*' && t[i + 1] === '/')) i++; i += 2; continue; }
    /* stringa singola o doppia */
    if (c === '"' || c === "'") {
      const q = c; i++;
      while (i < n && t[i] !== q) { if (t[i] === '\\') i++; if (t[i] === '\n') break; i++; }
      i++; continue;
    }
    /* template letterale */
    if (c === '`') {
      i++;
      for (;;) {
        if (i >= n) break;
        if (t[i] === '\\') { i += 2; continue; }
        if (t[i] === '`') { i++; break; }
        if (t[i] === '$' && t[i + 1] === '{') { pila.push('T'); i += 2; break; }
        i++;
      }
      continue;
    }
    /* chiusura di un ${...} dentro un template: si torna nel template */
    if (c === '}' && pila.length && pila[pila.length - 1] === 'T') {
      pila.pop(); i++;
      /* riprende la scansione del template */
      for (;;) {
        if (i >= n) break;
        if (t[i] === '\\') { i += 2; continue; }
        if (t[i] === '`') { i++; break; }
        if (t[i] === '$' && t[i + 1] === '{') { pila.push('T'); i += 2; break; }
        i++;
      }
      continue;
    }
    /* letterale di espressione regolare */
    if (c === '/' && !divisionePrecedente(t, i)) {
      i++;
      let cls = false;
      while (i < n) {
        if (t[i] === '\\') { i += 2; continue; }
        if (t[i] === '[') cls = true;
        else if (t[i] === ']') cls = false;
        else if (t[i] === '/' && !cls) { i++; break; }
        else if (t[i] === '\n') break;
        i++;
      }
      while (i < n && /[a-z]/.test(t[i])) i++;
      continue;
    }
    /* la chiamata */
    if (c === 'M' && t.startsWith('Math.', i)) {
      /* niente identificatore attaccato prima (es. `xMath.`) */
      if (i > 0 && /[A-Za-z0-9_$.]/.test(t[i - 1])) { i++; continue; }
      const resto = t.slice(i + 5, i + 5 + 12);
      let preso = null;
      for (const nm of NOMI) if (resto.startsWith(nm + '(')) { preso = nm; break; }
      /* `atan2(` prima di `tan(`: l'elenco li ha nell'ordine giusto ma
         `atan2` non comincia per `tan`, quindi nessuna collisione; la
         guardia vale per il futuro. */
      if (preso) { siti.push({ nome: preso, indice: i, fine: i + 5 + preso.length + 1 }); i = i + 5 + preso.length + 1; continue; }
      i++; continue;
    }
    i++;
  }
  return siti;
}

module.exports = { NOMI, trovaSiti };

/* =====================================================================
   LA PROVA DELLO SCANNER — `node strumenti/_143-siti.js --prova`

   PERCHE' UNO SCANNER VA PROVATO A PARTE. Sul gioco vero i conti
   tornano: 161 `Math.sin(` testuali, 161 eseguibili. Un lettore
   potrebbe concluderne che lo scanner funziona; in realta' quel numero
   e' compatibile ANCHE con uno scanner che non guarda niente e prende
   tutto. I due referti si distinguono solo su un testo dove la
   differenza esiste — e questi nove casi sono quel testo.
   ===================================================================== */
if (require.main === module && process.argv.includes('--prova')) {
  const casi = [
    ['codice nudo',      'a=Math.sin(x);', ['sin']],
    ['commento di riga', '// Math.sin(x)\nb=Math.cos(y);', ['cos']],
    ['commento a blocco','/* Math.sin(x) e Math.cos(y) */ c=Math.tan(z);', ['tan']],
    ['stringa doppia',   's="Math.sin(x)"; d=Math.exp(1);', ['exp']],
    ['stringa singola',  "s='Math.cos(x)'; d=Math.log(1);", ['log']],
    ['template',         's=`Math.pow(2,3) ${Math.sqrt(4)} Math.sin(1)`;', ['sqrt']],
    ['regex',            'r=/Math.sin\\(/g; e=Math.atan2(1,2);', ['atan2']],
    ['divisione',        'q=a/b; f=Math.hypot(1,2); g=c/d;', ['hypot']],
    ['solo commento',    '/* solo Math.sin(x) */', []],
  ];
  let rossi = 0;
  for (const [n, t, att] of casi) {
    const s = trovaSiti(t).map(x => x.nome);
    const ok = s.length === att.length && s.every((v, i) => v === att[i]);
    if (!ok) rossi++;
    console.log('  ' + (ok ? 'OK  ' : 'NO  ') + n.padEnd(18) + ' -> [' + s.join(',') + ']  atteso [' + att.join(',') + ']');
  }
  console.log('\n' + casi.length + ' controlli, ' + (casi.length - rossi) + ' passati, ' + rossi + ' falliti');
  process.exit(rossi ? 1 : 0);
}
