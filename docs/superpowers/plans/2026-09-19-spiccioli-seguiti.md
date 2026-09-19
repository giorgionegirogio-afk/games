# Spiccioli di seguito: #120, #116, #115 e la documentazione (voce #122)

19 settembre 2026. Cantierino di CHIUSURA PENDENZE MINORI, deciso dal committente
dopo #117/#121. La ricognizione del 19/9 ha mappato i seguiti aperti e distinto le
pendenze minori (chiudibili qui) dalle feature (rimandate). Base: `main` =
`39810c4`. Ramo: `voce-122-spiccioli-seguiti`. Progetto e piano insieme: le cure
sono piccole, isolate, e i loro design vengono dalla ricognizione.

## Cosa si chiude qui (e cosa NO)
DENTRO (pendenze minori):
- **#120** — bug del BANCO `audio.js` (non del gioco): lo scenario parata non azzera
  `b.lastTouch`/`b.toccoPiede`, la guardia del retropassaggio (#107) rifiuta il
  tiro, nessun esito di `tentaPresa` scatta, niente `Audio5.clack`. Cura: una riga
  nel banco. Il gioco e' sano (`clack` e' chiamato incondizionatamente a
  `CALCETTO-il-gioco.html:19650`).
- **#116 (il numero fantasma)** — il sottotesto del bottone SOTTOTITOLI
  («fischio, gol, palo — a video», `CALCETTO-il-gioco.html:3677` e `:42096`) suggerisce
  che il flag governi anche gol/palo, mentre governa solo i fischi. Cura: due
  stringhe oneste (es. «fischio — a video»).
- **#115** — l'anello del fiato: la freccia di direzione (disegnata sopra, stessa
  ellisse) puo' coprire ~53 gradi dell'arco lime quando la corsa cade nella zona
  accesa. Cura: ordine di disegno o freccia semi-trasparente, piu' 1-2 misure in
  piu' nel banco (`_q-accessibile`) oltre ai due estremi.
- **Documentazione** — `PUNTO-DEL-LAVORO.md` e' fermo a `48921bd` (non riflette
  #121); manca il verbale del banco anti-regressione `_q-cpu-ordine` (compito 3 di
  #121), che di fatto CHIUDE **#110** ("il banco che non congela"). Si allinea la
  documentazione al vero e si dichiara #110 chiuso.

FUORI (feature/cantieri veri, rimandati, NON toccati qui):
- **#113** MIRA GUIDATA a due pesi (~2 g, tocca l'intent-resolution del gameplay).
- **#114** ancorare `PROMINENZA_MIN` a una soglia clinica (WCAG/Harding) — richiede
  ricerca e una scelta di taratura, non una riga.
- **#109** il corpo del portiere che scala col campo — richiede un censimento a
  tutto il file.

## Vincoli
- Ogni tocco al GIOCO (#116, #115) passa da un attrezzo a ancore (`_t-*.js`,
  `--out` dry-run poi `--dentro`), scritto PRIMA di applicare. #120 tocca solo un
  banco (`audio.js`): edit diretto.
- Le cure sono di CONTORNO: due-versioni **0/60 a tutte le taglie** e
  `_q-determinismo` intatto (nessuna tocca `dado()` o una decisione CPU). E' la
  firma: un solo sorteggio divergente sarebbe un difetto.
- Ogni banco/misura nuova nasce ROSSA sul gioco/banco di prima.
- Commenti senza accentate; un commit per compito; verbale in MANUALE (voce #122).

## Compito 1 — #120: la parata ritrova il suo clack (banco)
Edit diretto in `strumenti/audio.js`, scenario "parata del portiere" (~:849-861):
azzera `b.lastTouch=-1; b.toccoPiede=false;` accanto agli altri azzeramenti del
pallone, PRIMA che `tentaPresa` giri (cosi' la guardia del retropassaggio non
rifiuta il tiro come autopassaggio). Cancelli: `node strumenti/audio.js` → la
prova "parata del portiere" torna VERDE (era 27/28, ora 28/28), `clack:true`
emesso. Il gioco NON e' toccato (`git diff CALCETTO-il-gioco.html` vuoto). Un
commit.

## Compito 2 — #116 e #115: due rifiniture del gioco (via attrezzi)
- **#116**: attrezzo `_t-sott-onesto.js`, le due stringhe `:3677` e `:42096`
  («fischio, gol, palo — a video» → un testo che nomina solo cio' che il flag
  governa davvero, es. «fischio — a video»). Verifica: il testo nuovo compare 2
  volte, il vecchio 0.
- **#115**: attrezzo `_t-freccia-fiato.js`, che risolve la sovrapposizione
  freccia-vs-anello (ordine di disegno: disegnare l'anello del fiato DOPO la
  freccia, o la freccia a bassa alfa dove attraversa il lime). Verifica per pixel
  (getImageData) che l'anello del fiato resti leggibile anche quando la corsa cade
  nella zona accesa, con 1-2 quote intermedie oltre i due estremi gia' provati nel
  banco `_q-accessibile`.
Cancelli: due-versioni 0/60 (disegno+testo puri), `_q-determinismo` intatto,
`_q-accessibile` verde con la prova ANELLO-FIATO estesa, `istantanea` non
regredita. Attrezzi a specchio byte-per-byte. Un commit.

## Compito 3 — la documentazione al vero
- Verbale in MANUALE (voce #122): le tre cure coi numeri del banco accanto.
- Aggiungi al MANUALE la voce mancante del banco `_q-cpu-ordine` (compito 3 di
  #121) e dichiara **#110 CHIUSO** (l'anti-regressione che chiedeva ora esiste).
- Aggiorna `PUNTO-DEL-LAVORO.md` allo stato vero: onda A chiusa, MIND v1 (#117) e
  pulizia #108 (#121) incassati, #119/#108/#110 chiusi, seguiti aperti residui
  (#113/#114/#109/#118, #120/#116/#115 chiusi qui).
Cancelli: nessuno di gioco (solo documenti). Un commit.

## Chiusura
Revisione finale del ramo (verifica: gioco toccato solo da #116/#115 e solo di
contorno, due-versioni 0/60, i banchi verdi, il verbale vero). Fast-forward,
smoke, push, ramo eliminato, ledger aggiornato.
