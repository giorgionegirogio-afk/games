# La prova dei dieci minuti, giocata dalla macchina

23 agosto 2026, su ordine del committente. OnePlus 6, build 1390941,
dita scritte sul dispositivo d'ingresso del kernel (`_vetro.js`),
comandi SOLO attraverso il vetro — le funzioni del gioco si sono usate
per leggere lo stato e per entrare in partita, mai per comandare.
Banco: `strumenti/_prova-dieci.js`. Filmato: `fuori/prova-dieci-macchina.mp4`
(297 quadri, uno ogni 2 s). Referto grezzo: `fuori/prova-dieci/referto.json`.

**Cosa questa prova NON puo' dire, e resta al committente**: se i
comandi sono PIACEVOLI e se si IMPARANO. Una macchina non scopre:
esegue un copione. Le due domande del documento originale che vivono
su quella differenza (1 e in parte 5) qui hanno solo la meta'
misurabile.

---

## I numeri dei dieci minuti

- **365 tocchi consegnati alla pagina, 0 rubati da Android**
  (touchcancel: zero). La cura L0.3 regge dieci minuti di dita vere,
  non venti tocchi di banco.
- **250 verbi chiesti dai dischi, 133 consegnati.** Il tasso va letto
  PER VERBO, perche' meta' dei «no» sono il banco che preme nel
  momento sbagliato (vedi sotto):
    TIRA 10/10 · FILTRANTE 7/7 · CROSS 8/8 · PRESSA 25/25 ·
    CAMBIO 20/20 · PASSA 15/19 · CONTRASTA 48/152 · SCIVOLATA 0/9
- **La macchina ha segnato 8 gol** (e ne ha presi 15: difende con un
  copione ingenuo, ed e' giusto cosi' — la CPU Normale non e' un
  fantoccio). Tabellino: 16 tiri, 11 cross, 2 filtranti.
- **8 cambi di possesso col dito destro GIU'**: il ri-armo di L1.1 ha
  sempre dato il verbo nuovo senza alzare il dito. Nessun incastro,
  nessuna carica orfana. (Domanda 4 del documento: alle mani non
  succede niente — si continua a tenere, e il disco cambia mestiere
  da solo.)

## Le due domande a meta'

**Domanda 5 — il pollice sinistro.** Il copione l'ha tenuto GIU' PER
TUTTI I DIECI MINUTI, come l'ipotesi di progetto. La levetta ha
risposto in 22 controlli su 29; i 7 mancati NON sono attribuibili al
gioco: il canale kernel del banco si e' riallineato 35 volte in dieci
minuti (limite noto di `_vetro.js` su questo telefono), e ogni
riallineamento rimette le dita da capo. Cio' che la macchina puo'
dire: **nessuna perdita di levetta e' stata osservata fuori dalle
finestre di riallineamento del banco.** Se un pollice UMANO la tenga
giu' davvero, resta la domanda aperta del documento originale.

**Domanda 3 — «premuto e non e' successo quello che mi aspettavo».**
Per la macchina: 117 su 250. Ma 104 di questi sono CONTRASTA premuto
col pallone oltre il raggio di calcio — e li' il contratto L1.2 dice
che il piede resta teso 0,18 s aspettando di arrivarci: premere in
anticipo E' l'uso previsto. Il residuo vero e' sotto.

## Le due scoperte

1. **CONTRASTA da lontano tace, e non dice mai di no.** Quando la
   finestra dei 0,18 s scade senza che il pallone sia mai arrivato a
   portata, non e' successo NIENTE e nessun segno lo dice — il rifiuto
   rosso di L3.1 copre il corpo non in condizione, non la distanza.
   Candidata onesta: il segno del no ALLO SCADERE della finestra a
   vuoto. Da pesare contro il rumore (scatterebbe spessissimo).
2. **SCIVOLATA: 0 consegne su 9 richieste dal disco.** Sul banco lo
   stesso disco consegna (cancello `_q-l16` prova E: scivolata al
   fotogramma 3, verde oggi). L'ipotesi piu' probabile e' la corsa del
   CONTESTO DEL BANCO STESSO: fra la lettura della posizione del disco
   e l'arrivo del dito passano 50-150 ms, e se il possesso cambia il
   disco premuto e' un altro. NON ASSOLTA: va rimisurata con un banco
   che registri l'atto risolto NEL momento del tocco (la spia c'e':
   Touch5.btnTouch). Fino ad allora e' un'accusa aperta.

## Il canale, dichiarato

35 riallineamenti del tubo verso /dev/input in dieci minuti: il banco
delle dita e' rumoroso su questo telefono (il suo stesso cappello lo
dichiara). Ogni numero qui sopra che dipende da un dito continuo
(levetta, tenute lunghe) porta quel rumore dentro.
