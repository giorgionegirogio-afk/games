# Nessun innocente accusato (voce #132)

21 settembre 2026. Secondo cantiere dell'onda D. La voce #131 ha fatto
entrare il DUELLO dal dischetto nel nastro: prima di allora una sfida
passata dal dischetto era inverificabile per costruzione. Resta l'altra
meta' del problema, ed e' la piu' insidiosa: **i canali che fanno
divergere la rigiocata di una partita ONESTA**.

Il giudice che l'onda D sta costruendo rigioca il nastro di una sfida e
ne conferma il punteggio. Un giudice che sbaglia in un verso non fa
danno: una partita truccata che passa resta un punto rubato. Un giudice
che sbaglia nell'altro verso toglie punti a chi non ha barato — e quello
e' l'errore piu' caro che una classifica possa fare, perche' non si vede
e non si corregge. Da qui il nome del cantiere.

## I quattro canali, VERIFICATI sul gioco di oggi

Ognuno e' una cosa che decide la partita e che il nastro non porta. Le
righe sono quelle del gioco di oggi (`main` = `3deb807`, 45.073 righe).

### (a) LA MENTALITA' CAMBIATA IN PAUSA

Il bottone della pausa (`CALCETTO-il-gioco.html:40888-40924`) fa girare
`G.ment[0]` fra DIFESA, EQUILIBRIO e ATTACCO **senza nessuna guardia** su
`G.sfida` ne' su `Reg.modo`, e non scrive niente nel registro. E la pausa
in una sfida e' aperta: `setPaused` (`:40796-40807`) guarda solo la
scena, non la modalita'.

RETTIFICA a quanto scritto nel mandato: la mentalita' INIZIALE nel nastro
c'e' gia' — `Reg.scrivi(7, [mentMia, mentSua].concat(...))` (`:43238`),
riletta a `:43422`. Il buco e' il CAMBIO a partita in corso, che per
natura non puo' stare in una riga di testa.

Il commento accanto al gestore (`:40878-40881`) lo diceva gia': «IL FATTO
CHE NON EMETTO: qui nasce un evento buono per il REGISTRO DEI FATTI».

E c'e' una seconda meta', peggiore: **il gestore gira anche durante un
REPLAY**. Chi guarda la partita che ha subito puo' aprire la pausa e
cambiare la mentalita' della squadra di chi l'ha attaccato. Da li' in poi
il replay non e' piu' la partita subita, e il confronto di fine replay
(`S.atteso`, `:43593`) accusa la rosa cresciuta di un altro.

MISURATO (`strumenti/_sonda-132-canali.js`, CPU contro CPU, taglia 5,
2.000 passi, 5 semi): EQUILIBRIO -> ATTACCO **diverge 5 semi su 5**, primo
scarto al passo 80 in tutti e cinque, punteggio finale diverso in 2 su 5
(a 3.000 passi: 5 su 5).

### (b) IL CARATTERE DELLA CPU DIPENDE DAL NOME

`G.car = [CAR_NEUTRO, caratterePer(G.oppName)]` (`:11356`). Il NOME della
squadra avversaria decide il carattere (`caratterePer`, `:9384`, sulla
tabella `CARATTERE` di dieci squadre, `:9328-9383`), e il nome nel nastro
non c'e'.

In una sfida `G.oppName` viene dal server e **non dallo stesso posto nei
due capi**: chi attacca lo prende da `a.nome` (`:43270`, la squadra che
il server gli ha dato); chi guarda lo prende da `dif.nome`, col ripiego
`SAVE.teamName` se il server non ha piu' la riga del difensore
(`:43465`). Basta un cambio di nome fra la partita e il replay — o quel
ripiego — perche' la stessa sequenza di comandi muova una CPU diversa.

L'effetto e' confinato e per questo curabile: `caratterePer` non tocca il
generatore dei sorteggi (`rosaAvversaria`, `:9805-9833`, ha il suo
xorshift locale seminato dal nome; i tratti fisici, `:10847-10865`,
idem), e `formaSquadre` (`:9622`) salta le rose vere perche' guarda
`p.piatto`. Quel che cambia e' `manopole(1)` (`:9408-9409`), cioe' la
testa della CPU.

MISURATO: avversario anonimo contro avversario chiamato `GASOMETRO`,
stesso seme, **diverge 5 semi su 5** (primo scarto al passo 80 in quattro
casi, 60 nel quinto), punteggio finale diverso in **4 su 5**.

### (c) L'ASIMMETRIA DI SCALA — tre risposte diverse allo stesso numero

Un attributo di rosa entra nella partita da quattro porte, e nessuna
concorda con le altre:

| dove | `:riga` | regola | `250` diventa | `NaN` diventa | `62,5` diventa |
|---|---|---|---|---|---|
| `loadSave` | `10170` | `s.rosa=j.rosa` — **nessun controllo** | 250 | NaN | 62,5 |
| `setupPlayers` | `10791`, `10816` | copia grezza | 250 | NaN | 62,5 |
| `impaccaRosa` (il nastro) | `42934` | `max(1,min(99, v\|0))` | 99 | 1 | 62 |
| `startMatch` (opts) | `11300`, `11310` | `round`, clamp 1..99, ripiego 62 | 99 | 62 | 63 |

La riga che apre il buco e' `:10170`: `if(Array.isArray(j.rosa) && (j.rosa.length===4||j.rosa.length===5)) s.rosa=j.rosa;`
— il salvataggio e' l'unico ingresso di `SAVE.rosa` che non guarda i
numeri, in un blocco (`:10047-10180`) che per ogni altra chiave dichiara
«un salvataggio manomesso non puo' chiedere una quarta intensita'».

Percio' in una sfida — dove `Sfida.gioca` NON passa `mia.rosa`
(`:43268`), quindi `G.miaRosa` resta null e `setupPlayers` legge
`SAVE.rosa` grezza — **la partita si gioca con 250 e il nastro registra
99**. Registrato e rigiocato sono due cose diverse.

MISURATO: un solo attributo a 250 invece che a 99 fa divergere **5 semi
su 5**, primo scarto al passo 80, punteggio finale diverso in 2 su 5 (5
su 5 a 3.000 passi).

### (d) IL REGISTRO TACE QUANDO TRONCA, E UN NASTRO VUOTO PASSA

`Reg.scrivi` (`:13419`): `if(this.righe.length > 40000) return;` — si
ferma **in silenzio**. Un nastro troncato non e' distinguibile da uno
intero: stessa forma, stessa versione di motore, stesso tutto. In
rilettura i comandi finiscono a meta' partita, i pollici si fermano, il
punteggio non torna — e `chiudiSfida` (`:43593`) da' la colpa alla rosa
cresciuta di chi ha attaccato. Innocente, accusato.

MISURATO (stessa sonda): il registro scrive una riga per dito per
fotogramma.

| dita sullo schermo | comandi per passo | il tetto arriva a |
|---|---|---|
| 1 | 1,00 | 663 s |
| 3 | 3,01 | 222 s |
| 6 | 6,01 | 111 s |
| 10 | 10,02 | 67 s |

Una sfida dura 90 s, piu' 40 s di golden goal, piu' la serie dal
dischetto: **con sei dita il tetto cade DENTRO una sfida onesta**, con
dieci dentro i tempi regolamentari. Non e' un caso di scuola, e' un
telefono tenuto con due mani.

E l'altra meta': un nastro **vuoto** passa il controllo. `Sfida.guarda`
(`:43323-43333`) fa `let righe = testo ? 0 : -1`, poi `righe =
Reg.deserializza(testo)`; un testo non vuoto ma senza comandi (`'1|2||'`,
cinque caratteri) da' `righe === 0`, che non e' `< 0`: si accetta, si
rigioca una partita senza un dito, e il punteggio non torna quasi mai.
Di nuovo la causa vera («il nastro e' vuoto») sostituita da quella
sbagliata.

## Le cure

Tutte e quattro **additive**: un tipo di riga nuovo, un campo in coda a
una riga che c'era gia', una funzione sola al posto di tre regole
diverse. Nessuna tocca `step()` ne' l'ordine dei `dado()`.

### (a) La mentalita' e' una MOSSA, e le mosse si registrano

Riga di tipo **8**: `[tick, 8, ms, chi, ment]`.

- il gestore della pausa scrive la riga (`Reg.scrivi` filtra da se': se il
  registro non sta scrivendo non succede niente, e fuori dalla sfida il
  registro e' spento);
- `Reg.esegui` (`:13533`) impara il ramo `tipo === 8` e posa la
  mentalita' com'era;
- **in rilettura il pollice di chi guarda non decide**: il gestore esce
  subito se `Reg.modo === 2`, ed e' la stessa guardia che le quattro
  porte di `Touch5` hanno gia' («IN RILETTURA LE DITA VERE SONO
  IGNORATE»). Il bottone si spegne da se' (`disabled`), cosi' non e' un
  bottone che non fa niente: e' un bottone che dichiara di non essere tuo.

REGISTRATA E NON IMPEDITA, e la ragione va scritta. `sponde:'gabbia'` e
`miraGuidata:'pieno'` sono forzate (`:43251`, `:43261`) perche' sono
proprieta' del MOTORE, e due telefoni devono averle identiche o la stessa
sfida gira su due motori diversi. La mentalita' non e' il motore: e' una
mossa di chi gioca, come un tocco. Una mossa si annota, non si vieta —
togliere una scelta di partita a chi attacca per far comodo al giudice
sarebbe far pagare all'innocente il conto del cantiere.

L'ORA E' GIA' GIUSTA, e vale la pena dirlo perche' qui un fotogramma di
scarto non darebbe un rosso vistoso. `Reg.passo()` e' la prima riga di
`step()` e incrementa `tick` alla fine: un click dato nella pausa dopo il
passo k porta `tick = k+1`; in rilettura `passo()` lo rimette in scena
all'inizio del passo k+1, cioe' esattamente il primo passo che dal vivo
ha visto la mentalita' nuova.

### (b) Nel nastro va l'INDICE, non il nome

`CAR_NOMI` — l'elenco ordinato delle chiavi di `CARATTERE` — e due
funzioni gemelle: `indiceCarattere(nome)` (nome -> 0..9, -1 se nessuno) e
`carPerIndice(i)` (indice -> la tabella, `CAR_NEUTRO` se -1).

L'indice si scrive **in coda alla riga di tipo 7**, dopo le due rose. In
coda e non in testa perche' la lettura e' posizionale: `spaccaRosa`
restituisce gia' `fine`, quindi `dati[p2.fine]` e' l'indice se c'e' e
niente se il nastro e' vecchio — retrocompatibile alla lettura, come la
versione di motore lo fu per la voce #107.

`startMatch` prende `opts.opp.car` quando c'e', e quando non c'e' ricade
su `caratterePer(G.oppName)`, cioe' su quello che fa oggi. E **`Sfida.gioca`
passa lo stesso `opts.opp.car` che scrive nel nastro**: chi registra e chi
rigioca attraversano la stessa porta, cosi' combaciano per costruzione
invece che per fortuna — la dottrina che la voce #131 ha applicato alla
mira.

ZERO DATI PERSONALI: nel nastro entra un numero fra -1 e 9, non il nome
di nessuno. E' la stessa regola gia' scritta per il tipo 7 («COSA NON
ENTRA: i nomi, le tinte, i motivi delle maglie», `:42918`).

DA DICHIARARE: da oggi **l'ordine di `CARATTERE` e' un FORMATO**. Chi
riordina la tabella cambia il significato dei nastri gia' scritti e deve
alzare `MOTORE_V`. Il commento va accanto alla tabella, non qui.

### (c) La scala si posa ALLA SORGENTE

Una funzione sola, `attrRosa(v, d)` — arrotonda, stringe in 1..99,
ripiega su 62 se il numero non e' un numero — usata da tutti e tre i
posti che oggi rispondono in tre modi diversi: `loadSave` (`:10170`),
`impaccaRosa` (`:42934`), `startMatch` (`:11300`, `:11310`).

E' la dottrina gia' scritta nel gioco per il pixel intero (`:43497`) e
applicata dalla voce #131 al duello: **si quantizza dove nasce il dato**.
Con `SAVE.rosa` pulita alla nascita, `setupPlayers` puo' continuare a
leggerla grezza — e la partita giocata e il nastro scritto sono lo stesso
numero per costruzione, non per coincidenza.

FUORI: il `nome` di un uomo di rosa resta non validato al caricamento.
Non sposta la partita (entra in `p.nome` e nei tratti fisici, che sono
disegno) e allargare qui vorrebbe dire toccare una riga che non ha un
test in questo cantiere.

### (d) Il nastro dichiara la propria troncatura, e vuoto non passa

Riga di tipo **9**: `[tick, 9, ms]`, nessun argomento, tre caratteri.
`Reg.scrivi` la scrive UNA volta quando tocca il tetto (`Reg.troncato`
fa da guardia) e poi torna a tacere come prima.

`Sfida.guarda` impara due rifiuti nuovi, tutti e due con la causa vera:

- un nastro con la riga di tipo 9 — «questa partita ha prodotto piu'
  comandi di quanti il nastro ne tenga»;
- un nastro con zero comandi — «il nastro di questa partita e' vuoto».

L'esito della partita **si manda lo stesso**: il punteggio e' quello che
e' successo davvero, e non lo decide il nastro. E' il REPLAY che si
rifiuta, ed e' esattamente la scelta gia' presa due volte in questa
funzione (motore diverso, `:43359`; marchio di tipo 5, `:43397`): meglio
non mostrarla che mostrarne un'altra. Un «non posso verificarla»
dichiarato costa un film; una verifica sbagliata costa punti a un
innocente.

FUORI: alzare il tetto. Quaranta mila righe sono una guardia contro un
ciclo, non una taratura, e sceglierne un'altra vorrebbe dire misurare il
peso del nastro in rete. Qui si rende la troncatura VISIBILE, che e' il
difetto.

## MOTORE_V: si misura, non si deduce

Oggi vale 2 (`:13262`), e la voce #131 ce l'ha lasciato dopo averlo
misurato (30 nastri su 30 identici).

La catena che dice «resta 2»: tutte e quattro le cure sono additive — due
tipi di riga nuovi (8 e 9) che un nastro vecchio non ha, un campo in coda
al tipo 7 che un nastro vecchio non ha, e una funzione di scala che su un
salvataggio sano e' l'identita' (`nuovaRosa` fa `50+((c*26)|0)`,
`faiCrescereRosa` fa `++` e si ferma a 99: interi in 1..99).

Ma e' un'inferenza, e un'inferenza non basta per una costante che decide
quali partite si rifiutano. **Si misura a due versioni**
(`fuori/gioco-132-base.html` + `--gioco`, il modo di casa): N nastri
registrati sul gioco di oggi, rigiocati sul curato, impronta per
impronta, punteggio e conto dei sorteggi. Identici N su N -> resta 2, e
la misura si scrive accanto al numero. Anche UN solo scarto -> sale a 3.

## I cancelli di questo cantiere

- `_t-ment-nastro.js` (C1): nasce ROSSO — la mentalita' cambiata a meta'
  partita non torna in rilettura, e in un replay il pollice di chi guarda
  cambia la partita di un altro.
- `_crit-ment-muta.js`: il falso che registra la mentalita' ma NON la
  rimette in scena (`esegui` senza il ramo 8). Il banco deve bocciarlo.
- `_t-carattere-nastro.js` (C2): nasce ROSSO — stesso nastro, due nomi
  avversari, due partite.
- `_crit-car-nome.js`: il falso che scrive l'indice nel nastro ma in
  rilettura continua a leggere il NOME. Il banco deve bocciarlo.
- `_t-rosa-scala.js` (C3): nasce ROSSO — un attributo fuori scala nel
  salvataggio fa giocare un numero e registrarne un altro.
- `_crit-rosa-meta.js`: il falso che stringe la scala nel nastro ma non
  alla sorgente (cioe' il gioco di oggi con una vernice). Il banco deve
  bocciarlo.
- `_t-nastro-tronco.js` (C4): nasce ROSSO — un nastro troncato e uno
  vuoto passano per buoni.
- `_crit-tronco-muto.js`: il falso che marca la troncatura ma non la
  rifiuta. Il banco deve bocciarlo.
- `_t-132-motorev.js` (C5): due versioni, N nastri.
- `_q-duello-impronta.js`: **44 su 44 a OGNI compito**, dal C0 alla fine.
  E' la rete di sicurezza lasciata dalla voce #131.
- Batteria INTERA a ogni compito (lezione 22), a gruppi con `--solo`.

## Vincoli

- Il gioco si tocca SOLO via attrezzo a ancore (`strumenti/_t-*.js` /
  `_toppa-*.js` con `--out`/`--dentro`), mai con una modifica diretta.
- Ogni difetto ha prima un test fallito (mandato S13.3).
- Commenti di codice senza lettere accentate (e', puo', gia').
- Le affermazioni superate si rettificano a edizioni, in chiaro, con data
  e voce accanto.
- Banchi a taglia 5, `sponde:'gabbia'`, `miraGuidata:'pieno'`; ordine
  sacro `startMatch(...)` PRIMA, `setCpuVsCpu(true)` DOPO.
- Un numero con la dispersione fuori soglia non si trascrive da nessuna
  parte.

## Fuori perimetro

- Costruire il GIUDICE vero: e' il cantiere dopo, e questo gli toglie di
  mezzo i falsi positivi.
- Alzare il tetto delle 40.000 righe (vedi sopra).
- Validare il NOME di un uomo di rosa al caricamento (vedi sopra).
- La rosa che il SERVER rilegge viva invece di conservarne una copia:
  e' del server, sta scritto a `:42926-42929` e resta li'.
- Il tasto registrato e morto (`Reg.esegui` non ridispaccia i keydown
  fuori dal duello): difetto del tipo 4, dichiarato dalla voce #131 e non
  allargato qui.
- Estendere il determinismo pieno alle taglie 7/11 (voci #98/#129).
