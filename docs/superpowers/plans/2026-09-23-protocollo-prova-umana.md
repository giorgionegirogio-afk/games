# PROTOCOLLO DELLA PROVA UMANA IN CIECO — gamba C del metro del ritardo

**Voce #141, compito 4. Data: 23 settembre 2026.**
Strumento: `strumenti/_prova-umana-ritardo.js`.
Spec e soglie: `docs/superpowers/specs/2026-09-23-metro-ritardo-design.md` §1.

---

## STATO: **NON ESEGUITA. IN ATTESA DEL COMMITTENTE.**

L'implementatore del #141 ha **costruito** lo strumento, l'aggancio nel gioco
(`__test.ritardo(K)`) e questo protocollo, e **si è fermato lì**.

La gamba C è l'unica delle quattro capace di pronunciare la parola
**«ingiocabile»**, ed è l'unica che un banco non può fare al posto di una
persona. **Fingerla sarebbe il peggiore dei verdetti falsi**, perché sarebbe
l'unico a parlare a nome di chi gioca. Non è stata sostituita con
un'opinione, non è stata dedotta dalla gamba A, e il verdetto del #141 porta
scritto che manca.

**Che cosa cambierebbe nel verdetto se l'uomo dicesse no** sta in fondo a
questo documento, §6.

---

## 1. Che cosa si misura, e perché in cieco

Sei partite da 90 secondi. Prima di ognuna lo strumento pesca un **K** dal
mazzo **{0, 3, 6, 9, 12, 18}** — uno solo per ciascuno, in ordine mescolato —
e **non lo dice**. Dopo ognuna chiede due cose:

1. **«Quanto è stata tua?»** — da 1 a 5.
2. **«La rigiocheresti?»** — sì / no.

**Perché in cieco.** Un ritardo dichiarato si giudica prima di sentirlo. Chi
sa di giocare a 300 ms trova tardo anche lo zero; chi sa di essere a zero
perdona i 300. La cecità non è teatro: è la sola cosa che rende confrontabili
sei voti della stessa persona.

**Perché l'ordine si sigilla prima.** Lo strumento scrive nel verbale
l'**impronta** dell'ordine pescato (SHA-256 troncato) **prima della prima
partita**, e l'ordine in chiaro **solo alla fine**. Così nessuno — nemmeno chi
ha scritto lo strumento — può riordinare le partite dopo aver visto i voti.

**Perché una partita di riscaldamento che non conta.** Il primo giro con
qualunque gioco si giudica peggio degli altri. Se cadesse su un K, quel K
porterebbe il prezzo del riscaldamento invece del proprio.

---

## 2. LA COSA PIÙ IMPORTANTE: **si gioca col dito, non con la tastiera**

`__test.ritardo(K)` accoda **le quattro porte di `Touch5`** — start, move,
chiudi, azzera — e basta. La tastiera non passa di lì: entra dritta in
`Keys[e.code]` dentro i due gestori di keydown/keyup
(`CALCETTO-il-gioco.html:12698` e `:12734`) e **non subisce nessun ritardo**.

Quindi una partita giocata coi tasti sentirebbe **zero ritardo a qualunque
K**, e il voto direbbe «bellissimo» di una cosa che non è stata provata. È il
modo più facile di rendere falsa questa gamba.

**Lo strumento non si fida:** registra il nastro di ogni partita e conta le
righe. Se trova **righe di tastiera** (tipo 4), o meno di **50 righe di
tocco**, **scarta il voto** e dice perché.

**Come si gioca, allora:**
- dal **telefono**, sulla stessa rete: lo strumento apre un server e stampa
  l'indirizzo (`http://<ip>:8777/CALCETTO-il-gioco.html`);
- oppure su un portatile con **schermo sensibile**.

---

## 3. Come si esegue, passo per passo

```bash
# 1. il gioco deve avere l'aggancio (lo strumento lo verifica e si ferma se manca)
node strumenti/_toppa-141-ritardo.js CALCETTO-il-gioco.html /tmp/g.html   # solo se serve riapplicarla

# 2. si parte
node strumenti/_prova-umana-ritardo.js --verbale prova-umana-2026-09-23.txt

# 3. si legge il verbale (anche dopo, senza rigiocare)
node strumenti/_prova-umana-ritardo.js --rivela prova-umana-2026-09-23.txt
```

Lo strumento:
1. apre il server e stampa l'indirizzo per il telefono;
2. scrive il **sigillo** nel verbale;
3. fa il riscaldamento (non votato);
4. per ogni partita: imposta K in silenzio, aspetta l'Invio a fine partita,
   controlla il nastro, chiede i due voti, li scrive **senza il K**;
5. alla fine rivela l'ordine, stampa la tavola per K e il verdetto.

**Il verbale resta cieco fino all'ultima partita.** Il K non viene scritto
accanto ai voti mano a mano: così nemmeno chi lo leggesse di straforo
potrebbe inquinare i voti che mancano.

---

## 4. La soglia, dichiarata prima (spec §1, 23 settembre 2026)

> **SOGLIA-UMANA** — mediana «è stata mia» **≥ 4/5** su ogni K provato, e
> **zero** «non riproverei». Se l'uomo dice no, i numeri non contano.

Con una sola persona e una partita per K la mediana **è** il voto singolo:
lo strumento lo dice, non lo nasconde. Se il committente vuole una mediana
vera, si rifà il mazzo due o tre volte (`--mazzo` accetta ripetizioni) in
sedute diverse.

---

## 5. Le cinque cose che questa prova **non** misura

1. **Non misura la rete.** `__test.ritardo` non ha rete di mezzo: è il
   ritardo del **gioco**, e basta. D_rete è il cantiere **#143**.
2. **Non misura lo stallo.** Un lockstep che rispetta D e si ferma tre volte
   al minuto è ingiocabile lo stesso, e questa prova non lo vedrebbe.
3. **Non misura l'avversario umano.** Si gioca contro la CPU: un avversario
   vero cambia il giudizio in tutte e due le direzioni.
4. **Non misura l'adattamento lungo.** Sei partite da 90 secondi sono nove
   minuti: chi gioca per un'ora impara ad anticipare molto di più.
5. **Non è una media di popolazione.** È il giudizio **del committente**, che
   per questo progetto è la cosa giusta da misurare — ma va scritto così e
   non come «i giocatori dicono».

---

## 6. CHE COSA CAMBIEREBBE NEL VERDETTO SE L'UOMO DICESSE NO

Questa è la parte che va letta insieme al verdetto del #141.

**Se a K = 12 (200 ms) la mediana scende sotto 4/5, o compare un «non
riproverei»:**

- **La SOGLIA-D cade.** `D_gioco ≥ 12 tick` non è più raggiungibile, e con
  essa cade il margine che la rende utile: senza margine ogni pacchetto sopra
  la mediana diventa uno stallo (spec §1, SOGLIA-D).
- **Il lockstep a ritardo fisso non è più ammesso come forma pura.** Restano
  tre strade, e vanno considerate in quest'ordine:
  1. **D più piccola** (6 tick = 100 ms, il numero di `rete/LEGGIMI.md:167-170`).
     Diventa realizzabile **solo se** il #143 misura una rete che lo regge
     con margine — cosa che oggi nessuno sa, perché nel repo non esiste un
     solo RTT misurato.
  2. **Il 1v1 a turni** del progetto d'onda §5.3: rigori, punizioni,
     uno-contro-uno. Il duello ha già il suo orologio e tre verbi già
     semantici, e **sta dentro l'architettura di oggi** — nessun servizio
     nuovo, nessuna chiave, nessun buco in RLS. Non è il gioco che il
     committente ha chiesto; è quello che l'infrastruttura che abbiamo sa
     consegnare.
  3. **Il server autoritativo**, col prezzo scritto in chiaro nel progetto
     d'onda §5.2: una flotta di browser headless sempre accesi, un sesto
     servizio, una bolletta che non è più zero, e la postura «zero permessi,
     zero conti, nessuna chiave nell'HTML» da riesaminare tutta.
- **Non cadrebbe niente del lavoro già fatto.** Il determinismo, il nastro,
  il giudice dentro il file, i cinque canali del #132, l'astensione del #139
  e il comando semantico del #142 servono a **tutti** i rami (progetto
  d'onda §5.3).

**Se invece a K = 12 la mediana è ≥ 4/5 e nessuno dice «non riproverei»**, la
gamba C è verde e il verdetto del #141 dipende dalle altre tre — in
particolare dalla **gamba D**, che oggi è **rossa** e che è l'unica che può
dire no prima di tutte.
