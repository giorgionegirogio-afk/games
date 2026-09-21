# Il giudice (voce #133)

22 settembre 2026. Terzo cantiere dell'onda D, e il suo cuore. Il mandato
(§10.5, `_analisi/MAPPA-MANDATO.md:462-465`) chiede il **verificatore
differito delle sfide**: «la classifica si ripulisce da sola» e' scritto
in `rete/LEGGIMI.md` da mesi, e oggi e' una promessa architetturale, non
un fatto misurato. La colonna `verificata` esiste in
`rete/schema.sql:112`, il commento «lo alza il verificatore differito»
esiste alla riga 38, e il lavoratore che rigioca davvero la partita non
esiste: zero righe di codice.

Le due voci precedenti hanno pagato il conto che rendeva impossibile
scriverlo. La #131 ha messo il **duello dal dischetto** dentro al nastro
(righe di tipo 6): prima, ogni sfida finita ai rigori era inverificabile
per costruzione. La #132 ha chiuso i **cinque canali** per cui la
rigiocata di una partita ONESTA poteva divergere (mentalita' cambiata in
pausa, carattere dal nome, asimmetria di scala della rosa, troncatura
silenziosa del registro, rumore bianco che pescava dal dado seminato).

Restava da costruire la cosa.

## La decisione d'architettura: il giudice vive NEL FILE

Il verificatore **non e' un secondo motore da scrivere lato server**. Un
secondo motore e' la peggiore idea possibile per questo problema: due
implementazioni della stessa fisica divergono per costruzione, e la
divergenza toglierebbe punti a innocenti invece di trovare bari.

`Sfida.guarda` (`CALCETTO-il-gioco.html:43539-43774`) gia' oggi fa
esattamente il lavoro del giudice: prende un nastro, lo rigioca sul
motore vero, e a fine partita confronta il punteggio uscito con quello
dichiarato (`chiudiSfida`, grep `S.atteso`, `:43898`). Quello che le
manca non e' la capacita': e' che la capacita' sta dentro a una
schermata. `guarda(id)` chiede la rete, dipinge una lista, cambia scena,
scrive cartelli, e a fine partita fa un `toast`.

**Il giudice e' quella stessa capacita' resa chiamabile senza schermo.**
Il costo grosso e' gia' pagato: `window.__test.registra/nastro/rigioca`
esistono (`:44575`, `:44598`, `:44599`), `__test.simulate(seconds)`
(`:45073`) fa avanzare la partita a passo fisso senza `rAF`, e
`strumenti/_q-sfida.js` guida due pagine come due telefoni da mesi. Un
verificatore lato server e' allora un browser headless che apre il file,
chiama una funzione e legge una stringa.

## `giudica(nastro, atteso, opz)` — la forma

```js
window.__test.giudica(nastro, atteso, { seme, taglia })
  -> { verdetto, causa, gol, atteso, passi, tetto, motoreV, righe, taglia, seme }
```

- `nastro` — il testo del nastro, quello che `Reg.serializza` produce e
  che il server conserva nella colonna `replay`. Si accetta anche
  l'oggetto-riga del server (`{replay|nastro, seme, taglia, gol_a,
  gol_d}`), perche' e' la forma in cui il dato esiste davvero.
- `atteso` — `[gol_a, gol_d]`, il punteggio DICHIARATO da chi ha giocato.
- `opz.seme`, `opz.taglia` — il seme e la taglia **non stanno nel
  nastro**: li da' il server (`/api/avversario` li assegna, `/api/sfida`
  li rilegge). Mancanti o storti, il giudice non puo' decidere.

## I cinque verdetti

| verdetto | quando | puo' muovere punti |
|---|---|---|
| `TORNA` | il punteggio rigiocato coincide con quello dichiarato | no |
| `NON TORNA` | coincide male | **si', ed e' l'unico** |
| `INCOMPLETO` | il nastro non basta a decidere | no |
| `ALTRO MOTORE` | `MOTORE_V` diverso da quello del nastro | no |
| `NON FINISCE` | la rigiocata non arriva alla fine entro il tetto | no |

`INCOMPLETO` raccoglie sette cause distinte, e ognuna e' un `causa:`
diverso perche' un verdetto che non sa dire perche' manda a cercare nel
posto sbagliato:

| `causa` | il nastro |
|---|---|
| `nastro-assente` | vuoto, nullo, non una stringa |
| `nastro-illeggibile` | `Reg.deserializza` ha lanciato (marcatore di formato sbagliato) |
| `nastro-vuoto` | forma perfetta, zero comandi (`1\|2\|\|`) |
| `nastro-troncato` | porta la riga di tipo 9 (voce #132) |
| `duello-marchiato` | porta la riga di tipo 5 (nastri di prima della voce #131) |
| `rose-assenti` | nessuna riga di tipo 7, o troppo corta |
| `carattere-assente` | tipo 7 senza l'indice di carattere in coda (voce #132) |
| `duello-senza-righe` | la rigiocata e' arrivata a un duello di cui il nastro non ha i comandi |
| `seme-assente` / `taglia-assente` | il chiamante non li ha dati |

Le prime otto si decidono PRIMA di far partire la partita; l'ultima
(`duello-senza-righe`) solo durante, perche' e' il caso che il gioco gia'
conosce (`startFreeKick`, `:23074-23076`) e che oggi sfocia in
`fermaReplayAlDischetto` — una funzione tutta schermo.

## Il contratto del giudice

**1. Forza `sponde:'gabbia'` e `miraGuidata:'pieno'`.** Come gia' fanno
`Sfida.gioca` (`:43497`, `:43507`) e `Sfida.guarda` (`:43752`, `:43759`).
Non e' un dettaglio: sono due impostazioni LOCALI del telefono
(`SAVE.sponde`, `SAVE.miraGuidata`), e un giudice che seguisse le sue
rigiocherebbe il nastro su un motore diverso da quello con cui la partita
fu giocata. Il verdetto direbbe `NON TORNA` per colpa del MOTORE invece
che per colpa della rosa — cioe' toglierebbe punti a un innocente.

**2. Legge le rose DAL NASTRO, mai dal profilo vivo.** La rosa di
carriera cresce a ogni partita per disegno (`faiCrescereRosa`): leggere
quella viva significa giudicare un'ALTRA partita. Il nastro porta gia'
entrambe le rose e le due mentalita' nella riga di tipo 7 (`:43484`), e
dalla voce #132 porta anche l'indice di carattere del difensore in coda.

E qui il giudice e' **piu' stretto di `Sfida.guarda`**: dove quella, se
la testa di tipo 7 manca o e' malformata, ripiega sul profilo di oggi
(`:43719-43730`) — meglio un film approssimato che nessun film — il
giudice si rifiuta e dice `INCOMPLETO`. Un film approssimato costa
niente; un verdetto approssimato costa punti.

Stessa ragione per `carattere-assente`: senza l'indice in coda,
`startMatch` ricade su `caratterePer(G.oppName)` (`:11477`), cioe' sul
NOME — che nel nastro non c'e' e che chi difende puo' cambiare quando
vuole. E' il canale (b) della voce #132, misurato divergere 5 semi su 5.

**3. Non muove MAI un punto su un verdetto diverso da `NON TORNA`.**
`INCOMPLETO`, `ALTRO MOTORE` e `NON FINISCE` sono «non lo so», non «hai
barato». E' il principio del cantiere #132 portato dentro al giudice: la
funzione non tocca nulla di suo (non manda in rete, non scrive il
salvataggio, non muove punti), e chi la chiama ha un solo verdetto su cui
gli sia lecito agire.

**4. E' deterministico e ripetibile.** Due chiamate sullo stesso nastro
nella stessa pagina danno lo stesso verdetto, gli stessi gol e lo stesso
numero di passi. Questo e' un cancello, non una speranza: e' la
proprieta' che rende il verificatore differito ri-eseguibile.

## Il tetto: `tettoFotogrammi(taglia)`, non un numero fisso

La voce #130 ha misurato che il tetto dei fotogrammi di una partita
dipende dalla taglia: `TETTI_PER_TAGLIA = {5: 18000, 7: 21000, 11:
27000}` (`strumenti/_q-invarianti.js:658-668`). Un giudice con un tetto
tarato su taglia 5 boccerebbe con `NON FINISCE` ogni sfida legittima a
taglia 11 — che e' di nuovo togliere punti a un innocente, per la terza
volta e per una terza ragione.

Il giudice vive nel file, quindi la tavola va nel file: la stessa, con la
stessa lettera di testa a rimando. Il cancello `_q-giudice.js` legge
`tettoFotogrammi` da `_q-invarianti.js` e la confronta con quella del
gioco: due tavole che possono divergere in silenzio sono peggio di una
sola.

## Il primo compito e' il banco che condanna, non il giudice

Cinque falsi, **cinque verdetti diversi**. Un banco che non distingue i
verdetti fra loro attesta invece di misurare, e vale meno di niente.

| falso | che cosa cambia | verdetto atteso |
|---|---|---|
| `_crit-giudice-gonfio.js` | il punteggio dichiarato, gonfiato di un gol | `NON TORNA` |
| `_crit-giudice-mozzo.js` | il nastro tagliato a meta' (e il marchio di tipo 9 aggiunto a mano) | `INCOMPLETO` |
| `_crit-giudice-motore.js` | la versione in testa al nastro, portata a 99 | `ALTRO MOTORE` |
| `_crit-giudice-vuoto.js` | il nastro svuotato dei comandi, forma intatta | `INCOMPLETO` |
| `_crit-giudice-lento.js` | il gioco, con `chiudiSfida` che non chiude mai | `NON FINISCE` |

Piu' i falsi del contratto: `_crit-giudice-rosa.js` (testa di tipo 7
tolta -> `INCOMPLETO/rose-assenti`), `_crit-giudice-seme.js` (seme
diverso -> `NON TORNA`, e questo e' il falso che prova che il giudice
rigioca DAVVERO invece di leggere il punteggio da qualche parte).

**LEZIONE GIA' PAGATA DUE VOLTE IN QUESTA ONDA.** Nel #131 una prova
passava sia col gioco giusto sia col falso: leggeva un contatore su una
pagina che non aveva mai giocato. Nel #132 il revisore ha costruito un
arrotondamento «in un solo verso» che lasciava verde l'asse principale e
cadeva solo sul secondo. Percio' ogni falso di questo cantiere:

- deve **passare** le prove di forma (il giudice esiste, risponde, da' un
  verdetto della tavola dei cinque);
- deve **cadere** sulla prova di sostanza, e su QUELLA sola;
- e il banco deve dire quale falso ha dato quale verdetto, non «uno dei
  falsi e' caduto».

## Il rischio piu' grande, e come si misura

Un giudice che dice `NON TORNA` su una partita onesta toglie punti a un
innocente. E' l'errore piu' caro che una classifica possa fare, perche'
non si vede e non si corregge.

Percio' il compito 3 non e' una prova ma una **misura**: N sfide vere
(due pagine, server finto, dita simulate, il copione fisso di
`_sfida-due-telefoni.js`), i loro nastri giudicati, e il conto dichiarato
di quanti `TORNA`. **Se anche una sola partita onesta da' `NON TORNA`, il
cantiere si ferma e si indaga la causa**: e' un canale non ancora chiuso,
ed e' una scoperta piu' importante del giudice stesso.

Tre canali sospetti gia' identificati, da misurare apposta perche' il
banco normale non li vedrebbe:

- **i nomi.** Il nastro non porta i nomi delle due squadre — e' un dato
  di una persona — quindi il giudice rigioca con dei segnaposti. I nomi
  entrano in `rosaAvversaria` (`:9853`, xorshift locale seminato dal
  nome) e in `G.oppName`. Dalla voce #132 il carattere viene dall'indice
  e non dal nome; resta da confermare che i nomi generati siano soltanto
  cosmetici.
- **l'audio.** Un giudice lato server non ha un gesto che sblocchi il
  contesto audio; un telefono ce l'ha. La voce #132 ha curato il canale
  (`Audio5.noiseBuf` usa `Math.random`, `:10334`), ma la cura si
  ri-misura qui, dalla parte del giudice: stesso nastro, pagina con audio
  e pagina senza.
- **la finestra.** `rebuildCrowd`/`paintField` consumavano il PRNG di
  gioco in proporzione al campo (voce #98); la voce #129 li ha spostati
  su `DECO` (`:8631-8655`), un generatore separato. Se la cura tiene, la
  dimensione della finestra del giudice non sposta un verdetto.

## MOTORE_V: si misura, non si deduce

Oggi vale 2 (`:13407`). La catena che dice «resta 2» per questo cantiere
e' corta: il giudice e' **additivo** — una funzione nuova, una voce nuova
in `window.__test`, e due rami `if` che si accendono solo quando
`G.sfida.giudizio` e' vero, cioe' mai in una partita vera.

Ma e' un'inferenza, e un'inferenza non basta per una costante che decide
quali partite si rifiutano — lo hanno scritto il #131 e il #132 prima di
misurare lo stesso. Si misura a due versioni
(`fuori/gioco-133-base.html` + `--gioco`, il modo di casa): N nastri
registrati sul gioco di prima e rigiocati sul curato, impronta per
impronta, punteggio e conto dei sorteggi. Identici N su N -> resta 2, e
la misura si scrive accanto al numero. Anche UN solo scarto -> sale a 3.

## I cancelli di questo cantiere

- `_q-giudice.js` (C1, nasce ROSSO: `giudica` non esiste) — il banco che
  condanna. Registrato in `strumenti/tutti.js` con `conta:true`: i due
  cantieri precedenti hanno pagato questo rilievo in revisione, e non si
  ripete.
- `_crit-giudice-*.js` — i sette falsi qui sopra.
- `_t-giudice-onesto.js` (C3) — la misura del tasso di falsi `NON TORNA`.
- `_t-133-motorev.js` (C4) — due versioni, N nastri.
- `_q-duello-impronta.js`: **44 su 44 a OGNI compito**, dal C0 alla fine.
  E' la rete di sicurezza lasciata dalla voce #131.
- I quattro cancelli dei canali della voce #132 (`_q-ment-nastro`,
  `_q-carattere-nastro`, `_q-rosa-scala`, `_q-nastro-tronco`) verdi a
  ogni compito.
- Batteria INTERA a ogni compito (lezione 22), a gruppi con `--solo`.

## Vincoli

- Il gioco si tocca SOLO via attrezzo a ancore (`strumenti/_t-*.js` /
  `_toppa-*.js` con `--out`/`--dentro`), mai con una modifica diretta.
- Ogni difetto ha prima un test fallito (mandato S13.3).
- Commenti di codice senza lettere accentate (e', puo', gia').
- Le affermazioni superate si rettificano a edizioni, in chiaro, con data
  e voce accanto.
- Banchi a taglia 5 (il terreno ancorato), ma il giudice si prova anche a
  7 e a 11 e il risultato si dichiara.
- Ordine sacro: `startMatch(...)` PRIMA, `setCpuVsCpu(true)` DOPO.
- Un numero con la dispersione fuori soglia non si trascrive da nessuna
  parte.

## Fuori perimetro

- **Il lavoratore lato server.** Questo cantiere costruisce la
  CAPACITA' (`giudica`) e la prova; il ciclo che pesca le righe con
  `verificata=0`, apre un browser headless, chiama `giudica` e scrive
  `verificata=-1` con `muovi_punti(-delta)` e' il cantiere dopo. La
  ragione e' di misura, non di pigrizia: un lavoratore si prova contro un
  database, e questo si prova contro il motore.
- **Il punteggio di sospetto continuo** (`rete/schema.sql`, colonna
  `sospetto`): dipende dal giudice, non lo precede.
- **Alzare il tetto delle 40.000 righe del registro** — fuori dal #132,
  resta fuori di qui.
- **Estendere il determinismo pieno alle taglie 7/11** (voci #98/#129):
  il giudice si MISURA a 7 e a 11, non le cura.
- **I nomi nel nastro.** Se la misura del C3 mostrasse che i nomi
  spostano una partita, il rimedio non e' metterli nel nastro (sono dati
  di una persona): sarebbe togliere al motore la dipendenza dal nome. E'
  un cantiere suo.
