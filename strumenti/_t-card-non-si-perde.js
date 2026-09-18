/* =====================================================================
   _t-card-non-si-perde.js -- MICRO-CODA del compito 3 (voce #107): il
   cartellino in differita non puo' morire sovrascritto.

   IL BUCO (dubbio dichiarato dalla chiusura arbitrale 3b, .git/sdd/
   brief/107-compito-3-report.md, sezione Dubbi). checkSlideContact
   (CALCETTO-il-gioco.html ~18363) apre una finestra NUOVA quando
   G.vantaggio o e' null o e' il sentinel {team:-1,...,card} che VANT_T
   lascia dietro di se' dopo un vantaggio CONCESSO per intero (riga
   17057 -- il cartellino di quel vantaggio resta pendente, in attesa
   della prossima palla ferma). W1 (chiusura arbitrale 3b) ha gia' fatto
   in modo che questa finestra nuova SI APRA DAVVERO (la guardia "G.
   vantaggio.team>=0" al fischio immediato, sopra) -- ma l'assegnazione
   che apre la finestra nuova SOVRASCRIVE G.vantaggio senza mai scaricare
   il sentinel: se il sentinel portava un cartellino dovuto (card!=null),
   quel cartellino sparisce in silenzio, mai inflitto, mai contato nella
   disciplina di squadra.

   LA CURA. PRIMA di costruire il nuovo G.vantaggio, se quello vecchio
   (il sentinel, o comunque cio' che c'era) porta un cartellino pendente,
   lo si scarica: scaricaCardVantaggio() esiste gia' (infligge il
   cartellino se dovuto, poi azzera G.vantaggio -- "sicura da richiamare
   anche quando non c'e' niente da scaricare", commento originale in
   testa alla funzione) ed e' la STESSA funzione che checkSlideContact
   chiama due righe sopra per il ramo del fischio immediato: nessuna
   fonte di verita' nuova, solo un'altra chiamata nel punto giusto.
   La guardia usa "G.vantaggio.card!=null", non la verita' di G.
   vantaggio.card: l'indice di un giocatore puo' essere ZERO, e uno zero
   e' falso in JavaScript -- una guardia scritta come "if(G.vantaggio.
   card)" perderebbe di nuovo il cartellino, silenziosamente, ogni volta
   che il colpevole del PRIMO fallo e' G.players[0]. La stessa idioma
   (!=null) e' gia' quella di scaricaCardVantaggio() stessa (riga 18242):
   un'unica convenzione per "un cartellino e' dovuto", non due.

   uso:  node strumenti/_t-card-non-si-perde.js --out fuori/card-non-si-perde.html
         node strumenti/_t-card-non-si-perde.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/card-non-si-perde.html'));

const ANCORE = [

/* l'unico punto del file dove una finestra NUOVA si apre (il ramo del
   fischio immediato qui sopra, con la guardia team>=0 di W1, non apre
   mai una seconda finestra in parallelo: non lo tocca questo attrezzo). */
{
  nome: 'checkSlideContact: il sentinel col cartellino pendente si scarica prima che la finestra nuova lo sovrascriva',
  cerca:
`        G.vantaggio = { team:carrier.team, x:p.x, y:p.y, t:-(carrier.recover>0?carrier.recover:0), card: cattivo?G.players.indexOf(p):null };
        return;`,
  metti:
`        /* MICRO-CODA (voce #107, micro-coda del compito 3, 18 settembre
           2026): il ramo qui sopra si arriva quando G.vantaggio e' null
           OPPURE il sentinel {team:-1,...,card} lasciato da VANT_T (riga
           17057) -- W1 (chiusura arbitrale 3b) gli fa aprire la propria
           finestra invece di fischiare subito, ma l'assegnazione qui
           sotto SOVRASCRIVE G.vantaggio senza mai controllare se portava
           un cartellino dovuto: quel cartellino spariva in silenzio,
           mai inflitto. card!=null, non la verita' di card: l'indice di
           un giocatore puo' essere zero, e zero e' falso in JavaScript
           -- la stessa guardia che scaricaCardVantaggio() usa gia' su
           se stessa (riga 18242), un'unica convenzione per "un
           cartellino e' dovuto". */
        if(G.vantaggio && G.vantaggio.card!=null) scaricaCardVantaggio();
        G.vantaggio = { team:carrier.team, x:p.x, y:p.y, t:-(carrier.recover>0?carrier.recover:0), card: cattivo?G.players.indexOf(p):null };
        return;`,
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

/* CONTEGGI A DELTA. */
const conta = (testo, s) => testo.split(s).length - 1;
const rotti = [];
if (conta(out, 'if(G.vantaggio && G.vantaggio.card!=null) scaricaCardVantaggio();') !== 1) {
  rotti.push('la guardia nuova non e\' presente esattamente una volta');
}
if (conta(out, 'G.vantaggio = { team:carrier.team, x:p.x, y:p.y, t:-(carrier.recover>0?carrier.recover:0), card: cattivo?G.players.indexOf(p):null };') !== 1) {
  rotti.push('l\'assegnazione della finestra nuova non e\' piu\' presente esattamente una volta: la sostituzione non e\' andata a segno');
}
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggio applicato');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
