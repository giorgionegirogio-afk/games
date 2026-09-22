# La sfida di carta — piano (voce #135)

Progetto: `docs/superpowers/specs/2026-09-22-sfida-di-carta-design.md`.
Base: `main` = `602a13e`. Ramo: `voce-135-sfida-di-carta`. Cantiere di
MOTORE e di SCHERMATA: si tocca **solo** `CALCETTO-il-gioco.html`, e solo
per ancore. Niente server, niente `rete/`: e' la funzione che esiste per
non averne bisogno. Cinque compiti (0..4), un commit ciascuno.

## Vincoli globali

1. **Il gioco si tocca solo via attrezzo a ancore.** Ogni compito che
   modifica `CALCETTO-il-gioco.html` porta il suo `strumenti/_toppa-*.js`
   che cerca una stringa-ancora unica, la sostituisce, e scrive con
   `--out` una copia o con `--dentro` il gioco stesso, specchio
   byte-per-byte. Mai un Edit diretto.
2. **Ogni funzione nuova ha prima un TEST che nasce ROSSO**, e ogni
   affermazione ha il suo FALSO (`_crit-*.js`) che dimostra che il banco
   discrimina. Il falso va costruito nel caso peggiore: deve PASSARE le
   prove di forma e CADERE su quella di sostanza.
3. **Le reti di sicurezza verdi a OGNI compito**: `_q-duello-impronta`
   44/44, `_q-giudice` 21/21, `_q-sigillo` 14/14, `_q-ment-nastro` 6/6,
   `_q-carattere-nastro` 4/4, `_q-rosa-scala` 4/4, `_q-nastro-tronco`
   5/5, piu' `_q-rete`, `_q-sfida` e `senza-rete`. Se una si muove di un
   numero ci si ferma e si riferisce.
4. **Batteria INTERA a ogni compito** (lezione 22), a gruppi con `--solo`.
5. Commenti senza lettere accentate.
6. Banchi a taglia 5; ordine sacro `startMatch(...)` PRIMA,
   `setCpuVsCpu(true)` DOPO.
7. Codici di uscita: 0 verde, 1 gioco rosso, 2 banco esploso, 3 prova
   nulla.
8. `MOTORE_V` resta **2**. Non si tocca il nastro ne' la simulazione.
9. **Il divieto di sicurezza** della spec: nel codice non entrano ne'
   l'id ne' il segreto ne' un solo dato personale, e il codice non si
   confonde col codice di trasferimento in nessuno dei due versi. Se un
   compito finisse per volerne uno, ci si ferma.

## Compito 0 — spec e piano

Questo documento e la spec. Niente codice nel gioco; tre sonde
usa-e-getta in `fuori/`, che non sono cancelli.

Misure di partenza, prese prima di toccare qualunque cosa:

- `_q-duello-impronta.js` **44/44** · `_q-giudice.js` **21/21** ·
  `_q-sigillo.js` **14/14** · `_q-ment-nastro` 6/6 ·
  `_q-carattere-nastro` 4/4 · `_q-rosa-scala` 4/4 · `_q-nastro-tronco`
  5/5 · `senza-rete` 6/6. Tutti VERDI.
- `fuori/_sonda-135-base.js`: la piega della schermata SFIDA oggi
  (`CERCA` chiude a 220 su 915x412 e su 800x360, a 298 su 380x640; la
  prima riga a 329 con cinque righe; la barra a 372 a lista vuota) e —
  la misura che regge tutto il cantiere — **quattro viste e quattro
  salvataggi diversi giocano la stessa identica partita** a parita' di
  seme e impostazione (tre semi, punteggio, sorteggi, dodici impronte,
  attributi e panchine: tutto uguale).
- `fuori/_sonda-135-bottone.js`: i tre posti possibili per l'ingresso,
  misurati. La voce SOPRA la lista rompe `_q-sigillo` B3 (prima riga a
  375 su una piega di 360); la voce SOTTO la lista non muove niente di
  quel che il cancello sorveglia.
- `fuori/_sonda-135-codice.js`: il formato. **79 caratteri**, identici su
  1000 sfide a caso; impacca-e-spacca identita' 1000/1000; controllo a
  quattro simboli **100% esaustivo** su una cifra cambiata (2294/2294) e
  su due scambiate (2614/2614), 100% su 297.558 mutazioni a caso, contro
  il 97,52% di un controllo a un carattere solo.

Commit `(voce #135, compito 0)`.

## Compito 1 — il banco che condanna, e i falsi

**Test primo:** `strumenti/_q-carta.js`, che nasce ROSSO perche' nel
gioco non c'e' niente: `window.__test.carta` non esiste.

Quattro gruppi (vedi la spec per il dettaglio):

- **A) il codice** — impacca/spacca identita', lunghezza, controllo
  esaustivo, rifiuti (motore diverso, versione diversa, troncato, lettera
  fuori alfabeto), e le due serrature contro il codice di trasferimento.
- **B) niente identita' dentro** — due pagine con id, segreto, nome
  squadra e nomi di rosa diversi che costruiscono la stessa sfida devono
  dare lo **stesso codice, carattere per carattere**; il codice non
  contiene id, segreto ne' nomi; leggere un codice non cambia
  l'identita' del telefono.
- **C) due telefoni, la stessa partita** — lo stesso codice a CPU contro
  CPU su viste e salvataggi diversi; e chi CREA gioca la stessa partita
  di chi RICEVE.
- **D) la schermata e la rete che non c'e'** — il pannello, le cause, la
  piega, zero richieste di rete in tutto il giro.

**I cinque falsi** (`_crit-carta-segreto`, `-nomi`, `-controllo`,
`-locale`, `-lungo`), ciascuno una copia del gioco costruita da un
attrezzo a ancore che scrive in `fuori/`. Ognuno deve passare tutte le
prove tranne la sua. Al compito 1 i falsi non si possono ancora provare
(non c'e' la cura da guastare): si scrivono al compito 2, subito dopo la
cura, e il compito 1 lascia il banco rosso su tutti e quattro i gruppi.

Reti di sicurezza + batteria intera (il gioco non e' stato toccato: e' la
misura che dice che il banco nuovo non ha disturbato nessuno).
Commit `(voce #135, compito 1)`.

## Compito 2 — il codice si genera e si legge

`strumenti/_toppa-carta-codice.js`. Tutto quello che non ha schermo:

- l'alfabeto (`CARTA_ALF`, `CARTA_VAL`) e la versione del formato
  (`CARTA_VER = 1`);
- `impaccaCarta(o)` e `spaccaCarta(testo)` — il formato della spec, campo
  per campo, col controllo a quattro simboli;
- `rosaDiCarta(seme, media)` e `nomiDiCarta(seme, chi)` — l'avversario e
  i venti nomi, **senza mai leggere `SAVE`**: e' la riga che decide se il
  codice e' funzione della sola partita;
- `Sfida.cartaNuova()` — pesca il seme, costruisce l'avversario, apre la
  partita;
- `Sfida.cartaGioca(o)` — la stessa apertura a partire da un codice
  letto;
- il ramo `S.carta` di `chiudiSfida` — costruisce il codice col punteggio
  vero, e sul lato di chi riceve confronta col punteggio da battere;
- `window.__test.carta = { impacca, spacca, nuova, gioca, ultimo }`, la
  porta del banco.

I gruppi **A**, **B** e **C** di `_q-carta` diventano verdi. Il gruppo D
resta rosso (non c'e' ancora un bottone).

Subito dopo la cura si scrivono e si provano i **cinque falsi**: ognuno
deve essere bocciato dalla sua prova e passare le altre. Un falso che
passa tutto e' un difetto del banco, e si ripara prima di andare avanti.

Reti di sicurezza + batteria intera. Commit `(voce #135, compito 2)`.

## Compito 3 — due telefoni, la stessa partita

Il compito della MISURA, non della funzione: la funzione c'e' gia' dal
compito 2, qui si dimostra che regge.

- il gruppo C di `_q-carta` sale a viste e salvataggi realistici: rose
  vere (nomi dalle tabelle del gioco) e diverse fra i due telefoni,
  perche' `rosaAvversaria` legge `SAVE.rosa` per non ripetere i cognomi e
  quello e' il canale che entra dalla finestra;
- si misura anche il giro completo CREA → codice → INCOLLA → rigioca, con
  un dito umano a copione invece che CPU contro CPU: e' la prova che il
  punteggio da battere e' confrontabile;
- il falso `_crit-carta-locale.js` deve cadere proprio qui, e si dimostra
  che cade.

Se qualcosa non torna ci si ferma e si riferisce: questo e' il compito
che puo' dire «la sfida di carta non si puo' fare», e va detto invece che
aggirato.

Reti di sicurezza + batteria intera. Commit `(voce #135, compito 3)`.

## Compito 4 — la schermata, la batteria, il verbale

- `strumenti/_toppa-carta-schermata.js`: la voce `SFIDA DI CARTA` sotto
  la lista (posto (c) della spec, misurato), il pannello `sfidaCarta` col
  codice da copiare e il campo da incollare, e le righe che dicono che
  cosa c'e' da battere e com'e' finita. Piu' la riga che dichiara il
  limite: una sfida di carta non porta una prova.
- il gruppo D di `_q-carta` diventa verde, compresa la misura della
  piega.
- `_q-carta` registrato in `strumenti/tutti.js` con `conta:true` e il suo
  cappello (perche' esiste, che cosa nessun altro cancello vede).
- Batteria INTERA a gruppi, referto trascritto.
- `MANUALE.md` §A, voce #135 in cima al registro.
- `PUNTO-DEL-LAVORO.md`, la riga della giornata.

Commit `(voce #135, compito 4)`.

## Quello che fa fermare il cantiere

- Una rete di sicurezza che si muove di un numero.
- Il gruppo B che non discrimina: se `_crit-carta-segreto` passa, il
  banco non protegge niente e il cantiere ha costruito una serratura di
  cartone.
- Due telefoni che NON giocano la stessa partita: senza quello la sfida
  di carta non e' una sfida.
- Un codice che non sta in un messaggio.
