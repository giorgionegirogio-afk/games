# Il banco fotosensibile ancorato a WCAG — piano (voce #114)

Progetto: `docs/superpowers/specs/2026-09-19-fotosensibile-wcag-design.md`.
Base: `main` = `ebf6bb1`. Ramo: `voce-114-fotosensibile-wcag`.
Cantiere di BANCO (non tocca il gioco). Tre compiti, un commit per compito, piu'
revisione finale + fusione.

## Vincoli globali
1. **Non si tocca `CALCETTO-il-gioco.html`**. Se il banco corretto scopre una
   violazione WCAG vera del gioco, FERMARSI e riferire (diventa un cantiere diverso).
2. Ogni nuova regola/soglia del banco NASCE in grado di CONDANNARE: un caso sintetico
   che viola la soglia deve uscire ROSSO, altrimenti la regola non misura.
3. I numeri clinici col riferimento e la data (vedi spec, sezione soglie). Nessun
   numero clinico inventato.
4. Verdetto sul gioco riproducibile a seme fisso (`semeFisso` da `_posa.js`).
5. `_q-fotosensibile` e' un file `strumenti/*.js`: edit diretto (non e' il gioco).
6. Commenti senza accentate; un commit per compito; verbale in MANUALE (voce #114).

## Ancore (da riverificare col grep)
- `strumenti/_q-fotosensibile.js`: `__luce()` :151-162 (la metrica); `trovaLampi`
  :178-200 e `frequenzaMassima` :202-213 (rilevatore+finestra); `PROMINENZA_MIN=1,5`
  :222; il `--controllo` 4 Hz :279-297/:322-324; le 3 scene :330-345; il verdetto
  `<=3` :380; il limite dichiarato :63-81.
- Il gioco (SOLA lettura, per capire cosa il banco osserva): crowd flash
  `CALCETTO-il-gioco.html:~30049-30069`; duello `~37650-37669`; gol lampo+raggi
  `~39960-39994` (dietro `SAVE.moto`); tinte squadra `TEAMRGB ~39987`.

## Compito 1 — La metrica e il rilevatore WCAG
**Obiettivo.** (a) Riscrivere `__luce()`: per ogni pixel, linearizza gamma per canale
(`c8/255`; `/12,92` se `<=0,04045`, altrimenti `((..+0,055)/1,055)^2,4`), poi pesa
`0,2126R+0,7152G+0,0722B`, media sull'area campionata → luminanza relativa 0-1. (b)
Sostituire `trovaLampi`+`PROMINENZA_MIN` con il rilevatore WCAG: sulla serie di
luminanza relativa nel tempo, trova gli estremi locali (picchi/valli); una coppia di
transizioni opposte e' un FLASH quando l'ampiezza e' >=0,10 (10% di 1,0) E la
luminanza del piu' scuro dei due estremi e' <0,80. `frequenzaMassima` invariata nel
principio (finestra di 1 s, conteggio flash), verdetto `<=3` per 2.3.1.
**Cancelli.**
- `--controllo` (4 Hz a schermo intero) RICALIBRATO sulla nuova metrica → resta
  ROSSO (>3 flash/s). LEGGI l'output (quanti flash/s misura ora).
- Le 3 scene del gioco (crowd, duel, gol; moto on/off) → il banco gira e da' un
  verdetto; a questo compito, senza il criterio d'area, il gol a schermo intero
  potrebbe contare come flash — MA a <1/s per costruzione (festa lunga), quindi
  ancora VERDE sul conteggio. Se una scena diventasse rossa QUI (prima dell'area),
  indaga: potrebbe essere un flash reale >3 Hz (scoperta da riferire) o un artefatto
  del rilevatore (troppo sensibile agli estremi di quantizzazione).
- Nasce in grado di condannare: il controllo rosso lo dimostra.
**Definizione di fatto.** Metrica WCAG vera, rilevatore a coppie di transizioni,
controllo ricalibrato rosso, le 3 scene col loro verdetto letto, un commit.

## Compito 2 — Il criterio d'area e il red flash
**Obiettivo.** (a) **Area**: per ogni fotogramma, calcola la frazione di pixel del
canvas che cambiano di >=0,10 di luminanza relativa rispetto al fotogramma
precedente (l'area "che lampeggia"). Un flash conta per 2.3.1 solo se quell'area
supera la soglia WCAG. Soglia: proxy del "25% di un campo di 10 gradi" — deriva dalla
risoluzione di riferimento WCAG (341x256 su 1024x768: 25% = ~21824 px del riferimento)
scalata alla frazione di schermo equivalente, e DICHIARA l'approssimazione nel
commento (il risultato pratico e' robusto: folla/duello <2% → esenti, gol schermo
intero → qualifica). (b) **Red flash**: sulla serie, rileva coppie di transizioni
dove uno stato ha `R/(R+G+B)>=0,8` e la differenza fra i due stati supera 0,2 nel
CIE 1976 UCS (u'v'); stessa finestra di 1 s e soglia <=3.
**Cancelli (casi di condanna nati apposta, in `--controllo` o scene sintetiche).**
- flash GRANDE sintetico (schermo intero) a >3 Hz → ROSSO (area+frequenza).
- flash PICCOLO (sotto la soglia d'area) a >3 Hz → VERDE (esenzione d'area) — dimostra
  che l'area esenta davvero (folla/duello).
- RED flash sintetico (rosso saturo) a >3 Hz → ROSSO.
- Le 3 scene del gioco: folla/duello ora ESENTI per area (verde); gol confermato
  entro le soglie (verde per tempo). Le tinte-squadra rosse e i raggi del gol NON
  violano il red flash (verifica; se violano, e' una scoperta da riferire).
**Definizione di fatto.** Area e red flash implementati, ciascuno con un caso rosso
che condanna e uno verde che esenta/passa; le 3 scene col verdetto corretto. Un commit.

## Compito 3 — Verifica, ricalibrazione, verbale
**Obiettivo.** La verifica AUTOREVOLE promessa dallo spec: il gioco vero PASSA tutte
le soglie WCAG (3 flash/s + area + red flash) sulle scene reali (gol ravvicinati,
sera, dischetto; moto on/off), a seme fisso. Se PASSA: chiudi #114. Se NON passa:
FERMATI e riferisci (diventa cantiere di gioco). Batteria (`tutti.js`) con il banco
aggiornato (resta `conta`? verifica come era registrato; deve restare verde sul
gioco e il controllo rosso). Verbale in MANUALE (voce #114): le soglie con FONTI e
DATE, la metrica corretta (luminanza relativa vera), il criterio d'area con
l'approssimazione dichiarata, il red flash, la chiusura di #114, il verdetto onesto
(banco piu' corretto/severo; gioco verificato non-violante; la riserva metodologica
del proxy whole-canvas ora RISOLTA dal criterio d'area vero). Rettifica a edizioni la
vecchia frase del #112 ("nessuno strobo forte oltre 3 Hz" → ora "conforme a WCAG
2.3.1 sulle scene provate, con i limiti dichiarati").
**Cancelli.** Batteria verde (col banco WCAG); il gioco passa le soglie WCAG
riprodotto; verbale coi numeri veri. Un commit.

## Chiusura
Revisione finale del ramo (modello capace): riproduce il controllo rosso e le scene
verdi, verifica che la metrica sia luminanza relativa VERA (non byte grezzi), che
ogni nuova regola condanni un caso sintetico, che l'approssimazione d'area sia
dichiarata e il risultato robusto, che il verbale citi le fonti datate senza numeri
inventati. Se «Ready to merge: YES»: fast-forward, smoke, push, ramo eliminato,
ledger aggiornato. Poi si apre #113 (mira guidata), come deciso dal committente.
