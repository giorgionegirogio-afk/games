# LA MOVIOLA FLUIDA — progetto deciso (voce #85, con le voci #68 e #98 a bordo)

**7 settembre 2026.** Il committente ha sciolto oggi le tre decisioni aperte,
scegliendo per tutte la raccomandazione delle analisi. Le analisi che
sostengono questo progetto — con ogni affermazione ancorata a `file:riga` e
ogni scatto misurato, non stimato — sono `_analisi/MOVIOLA-OGGI.md` (il
motore del replay e la misura dello scatto) e `_analisi/PROVA-E-DIAGNOSI.md`
(il mistero della prova E, sciolto): NON vengono ripetute qui.

## Il reclamo del committente (testuale, dal mandato originario)

«il replay dei goal va a scatti» e «nel replay si vede tutta l'azione fino al
goal di rovesciata, quindi anche il dripling le finte e le azioni con tante
catene di possesso palla e dripling».

## I fatti misurati che governano il progetto

1. **Metà del reclamo è già risolta** (commit `21ff404`, 1° settembre): la
   finestra registrata è 9 s con risalita all'ultimo cambio di possesso
   (`REC_HZ=20, REC_SEC=9`).
2. **Lo scatto è vero e ha una causa precisa**: la moviola registra a 20 Hz e
   disegna a 60; `disegnaMoviola()` interpola posizione/direzione/ampiezza ma
   COPIA di peso i cronometri dei gesti (`kickT/kickB/charge/chargeT/slide/
   dive/rove/roveT1`) dal campione: un gesto resta congelato 4-5 fotogrammi
   di schermo mentre il corpo scorre (misurato, seme 20260907).
3. **Cinque campi di posa non vengono nemmeno registrati** nel campione:
   `contrasto, presaT, gkManiT, rinvT, recover` — un gol da contrasto o
   parata mostra la posa SBAGLIATA nel replay, non solo scattosa.
4. **La prova E di `_q-replay.js` («registrare non cambia il gioco») si
   dichiara NULLA** perché `Touch5.stick[0].ox/oy` (l'origine del joystick
   sintetico) sopravvive da una partita all'altra sulla stessa pagina: non è
   azzerata da `startMatch()`. Stessa famiglia dei cronometri curati il 31
   agosto, mai estesa al tocco. La firma (due partite identiche sulla stessa
   pagina che divergono sempre allo stesso campione) è la stessa della voce
   #98 (determinismo rotto a taglia 7 e 11).
5. **Il nastro delle sfide è un sistema indipendente** da `G.rec` (buffer di
   disegno locale): niente di questo progetto tocca il formato del nastro
   (la voce #96 non è coinvolta).

## Le tre decisioni del committente (7 settembre 2026)

1. **Lo scatto si cura con ENTRAMBE le cure**: (a) interpolare i cronometri
   dei gesti in `disegnaMoviola`, con le guardie sui reset (un cronometro che
   riparte fra due campioni non va spalmato: se il valore successivo è
   minore del precedente si scatta al nuovo, niente blend attraverso il
   riavvio); (b) registrare i cinque campi mancanti nel campione e
   ripristinarli nel replay.
2. **La finestra resta 9 s / ultimo cambio di possesso, `REC_HZ` resta 20**:
   la misura c'è già; se in gioco vero sembrerà corta si riapre con una
   misura, non con un'impressione.
3. **La cura profonda di Touch5 va in questo ramo**: `startMatch()` azzera lo
   stato residuo del tocco (completando la bisezione già avviata su QUALE
   campo esatto), con cautela dichiarata su pausa/ripresa. Chiude la voce
   #68, sblocca la prova E, e con ogni probabilità cura la voce #98 — da
   MISURARE, non da presumere.

## Soglie di accettazione

1. **Scatto**: nel replay di un gol a seme dichiarato, nessun cronometro di
   gesto resta bit-identico per **≥3 fotogrammi di schermo consecutivi**
   mentre la posizione dello stesso corpo avanza (oggi: 4-5). Misurato da un
   banco che PRIMA condanna il gioco di oggi.
2. **Campi mancanti**: i cinque campi sono nel campione e ripristinati; il
   banco li verifica presenti e variabili durante una scena che li esercita
   (un contrasto, una presa). Condanna sul gioco di oggi: assenti.
3. **Prova E**: dà un verdetto vero (verde/rosso, mai più NULLA) e sta verde:
   registrare non cambia il gioco.
4. **Determinismo**: `_q-determinismo` a taglia 5 resta 10/10 a ogni compito.
   Dopo la cura Touch5 si misura anche a `--taglia 7` e `--taglia 11` e
   l'esito SI DICHIARA: se verdi, la #98 è chiusa da questo ramo; se restano
   rossi, la #98 si ridimensiona con la componente residua documentata.
5. **Sorteggi**: questo ramo NON dichiara divergenze — registrazione e
   disegno sono osservazione pura, e l'azzeramento di Touch5 in `startMatch`
   non tocca i percorsi CPU-contro-CPU (verificato in diagnosi: le corse
   CPU pure restano identiche). Ogni compito prova l'identità al bit; una
   divergenza qualunque è un difetto, non un rosso da dichiarare.
6. **L'occhio umano**: una moviola registrata a seme dichiarato prima/dopo
   (sequenza di fotogrammi salvata in `fuori/`), guardata e descritta nel
   rapporto.

## Fuori perimetro

- Il formato del nastro delle sfide (#96), la lunghezza della finestra, il
  passo di registrazione (decisione 2).
- Le rifiniture della pulsantiera (#97), la copertura della batteria a 11
  (#99).

## Vincoli globali (di casa, invariati)

- Ogni modifica al gioco passa da un **attrezzo a àncore** (`_t-*.js`) con
  `cerca`/`metti` esatti e conteggi `attesi`; si cerca per nome, mai per
  riga.
- Ogni prova nuova deve **saper condannare** prima di essere creduta.
- Commenti nel codice in italiano senza lettere accentate; documenti con gli
  accenti veri. Un commit per compito, col verbale nel messaggio.
- La lezione dei letterali di boot (voce #86 compito 5): ogni stato che
  diventa per-partita o per-taglia va controllato ANCHE alla dichiarazione e
  al primo avvio, perché `setTaglia`/`startMatch` hanno guardie che al boot
  non mordono.
