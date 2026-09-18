/* =====================================================================
   _t-vantaggio-sentinel.js -- attrezzo RETROATTIVO (m6, onda di
   correzione della revisione finale, voce #107, 18 settembre 2026).

   NASCITA A POSTERIORI, DICHIARATA. Questo attrezzo non e' nato insieme
   al suo commit: riproduce, dopo il fatto, l'hunk di gioco della
   CHIUSURA ARBITRALE del compito 3 (`832cff2`, "Un fallo su venti
   riguadagna la grazia: il sentinel non chiude piu' la finestra") --
   il commit che ha scritto quell'hunk a mano, senza un attrezzo ad
   ancore. Lo stesso precedente della coda della revisione finale di
   #87 per `_t-sfide-sponde.js` (postilla b: "la verifica byte-per-byte
   prova che l'attrezzo riproduce l'edit gia' fatto, non che l'edit sia
   nato ancorato"): la garanzia qui e' PIU' DEBOLE di un attrezzo che
   ha applicato per davvero la modifica. Questo file serve a due cose,
   non a rigiocare la storia: (1) lasciare un attrezzo committato per
   una modifica che oggi ne era priva, come richiesto dalla convenzione
   di casa; (2) dimostrare, con una verifica a specchio, che l'hunk
   riprodotto e' byte-identico a quello vero.

   L'HUNK (W1, checkSlideContact, CALCETTO-il-gioco.html ~18352 su
   `832cff2`): la guardia del ramo del fischio immediato passa da
   "if(G.vantaggio)" a "if(G.vantaggio && G.vantaggio.team>=0)" -- senza
   quella guardia il sentinel {team:-1,...,card} che VANT_T lascia
   dietro di se' dopo un vantaggio CONCESSO per intero veniva letto come
   "vantaggio gia' pendente", e un fallo su venti (5,0% in base, 4,7%
   sulla correzione di revisione) fischiava SUBITO invece di aprire la
   propria finestra. Il commento sopra la riga si allarga per spiegarlo;
   il codice cambia di un solo confronto (" && G.vantaggio.team>=0").

   VERIFICA A SPECCHIO (fatta prima di committare questo attrezzo, non
   promessa): l'antenato diretto di `832cff2` e' `b241c43` (verificato,
   `git log -1 832cff2^`) -- l'attrezzo applicato a
   `git show b241c43:CALCETTO-il-gioco.html` deve dare, sull'hunk, lo
   STESSO testo di `git show 832cff2:CALCETTO-il-gioco.html`.
   Un secondo controllo, quello che il compito chiedeva alla lettera:
   l'hunk di `832cff2` e quello di `700f775` (la micro-coda successiva,
   che non tocca piu' questa guardia) sono a loro volta BYTE-IDENTICI --
   il commit successivo non ha piu' toccato questa riga, quindi lo
   stesso hunk sopravvive intatto da `832cff2` a `700f775` e oltre, fino
   a HEAD. Le due verifiche insieme (b241c43->832cff2 riprodotta
   dall'attrezzo; 832cff2==700f775 sull'hunk) coprono la richiesta senza
   fingere che l'attrezzo sia stato eseguito contro un commit che non
   ne aveva bisogno (700f775 ha gia' l'hunk: l'ancora "prima" non ci si
   trova piu', per costruzione -- e' la prova che il testo e' rimasto
   quello scritto da `832cff2`, non un fallimento dell'attrezzo).

   uso:  node strumenti/_t-vantaggio-sentinel.js --in fuori/m6-b241c43.html --out fuori/m6-riprodotto.html
         (mai --dentro su HEAD: l'ancora "prima" non esiste piu' nel
         gioco di oggi, la guardia e' gia' quella nuova da `832cff2`)
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const inFile = path.resolve(RADICE, arg('in', 'fuori/m6-b241c43.html'));
const outFile = haFlag('dentro') ? path.resolve(RADICE, 'CALCETTO-il-gioco.html') : path.resolve(RADICE, arg('out', 'fuori/vantaggio-sentinel.html'));

const ANCORE = [

{
  nome: 'checkSlideContact: W1, la guardia del fischio immediato vuole anche G.vantaggio.team>=0',
  cerca:
`           STESSA decisione area/cumulo di sempre -- il ramo qui sotto
           e' carattere per carattere quello che checkSlideContact
           faceva PRIMA di questo compito (RETTIFICA voce #107, compito
           1, per l'area vera al posto di zonaCalda: invariata). */
        if(G.vantaggio){
          scaricaCardVantaggio();`,
  metti:
`           STESSA decisione area/cumulo di sempre -- il ramo qui sotto
           e' carattere per carattere quello che checkSlideContact
           faceva PRIMA di questo compito (RETTIFICA voce #107, compito
           1, per l'area vera al posto di zonaCalda: invariata).
           W1 (chiusura arbitrale, voce #107 compito 3, 18 settembre
           2026): la guardia qui sotto vuole ANCHE G.vantaggio.team>=0,
           come il blocco di valutazione in step() (riga 16980) gia'
           chiede. Senza quella guardia, il sentinel {team:-1,...} che
           VANT_T lascia dietro di se' (riga 17057, cartellino ancora
           da scaricare dopo un vantaggio CONCESSO per intero) e' un
           G.vantaggio troncato ma non nullo: il fallo successivo lo
           leggeva come "vantaggio gia' pendente" e fischiava SUBITO
           invece di aprire la propria finestra. Misurato dall'arbitro:
           un fallo su venti (5,0% in base, 4,7% su questa correzione)
           riguadagna cosi' la grazia che gli spettava. */
        if(G.vantaggio && G.vantaggio.team>=0){
          scaricaCardVantaggio();`,
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
  console.error('  (atteso su HEAD/700f775 e successivi: l\'hunk e\' gia\' quello nuovo -- vedi il commento in testa al file)');
  process.exit(1);
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggio applicato');
console.log('    da   ' + inFile + '  (' + src.length + ' caratteri)');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri)');
