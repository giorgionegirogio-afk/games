# Due giochi, senza rete

Due giochi completi per il telefono, ognuno in **un solo file HTML** che
funziona senza rete: nessun account, nessuna pubblicità, nessuna libreria da
scaricare. Font, carte, suoni e grafica stanno tutti dentro il file. Solo la
**SFIDA in rete** di CALCETTO, se la apri tu, usa un server.

👉 **[Provali qui](https://giorgionegirogio-afk.github.io/games/)**

| | |
|---|---|
| **CIRCOLO** | Scopa, Scopone, Briscola e Briscola a coppie. Le varianti della Scopa (napoletana con la Napola, Asso piglia tutto, a quindici, più Re bello e Ultima presa), fino a quattro livelli di avversario (da Principiante a Maestro), tavolo a quattro, torneo, mescolamento verificabile e sfida via link. |
| **CALCETTO** | Calcio da campetto: 5 contro 5 in gabbia (portiere compreso), e anche 7 contro 7 e 11 contro 11. Partite da 90 secondi a 5 contro 5 (a scelta 120 o 180; a 7 e 11 il tempo cresce col campo), tiro col timing, scivolata che può costare il cartellino, falli ad accumulo (dal terzo di squadra si tira dal dischetto), rigori, moviola, torneo, stagione a campionato, divisioni, record personali, 24 trofei e un negozio a monete. Sfide: SFIDA DI CARTA (un codice da incollare, senza rete), SFIDA in rete e SFIDA DAL DISCHETTO (queste due chiedono un server). Figure fotografiche (generate con Gemini «Nano Banana», vedi `NOTICE`) o disegnate, a scelta. Niente mercato: la rosa si guarda e cresce giocando. |

## Come si provano

- **Sul telefono, come app vera:** scarica `apk/CIRCOLO.apk` (173 kB) e
  `apk/CALCETTO.apk` (4,2 MB). **Non chiedono nessun permesso** — nemmeno
  internet: per questo, nell'app, la SFIDA in rete di CALCETTO dice «serve la
  rete» e basta.
- **Senza installare niente:** apri il file `.html` con Chrome. Funziona lo stesso.
- **Come app web:** dalla pagina qui sopra, *Installa app* (se il bottone non
  compare, dal menu di Chrome scegli *Aggiungi a schermata Home*).

Istruzioni per esteso, con le trappole: **[COME-INSTALLARE.md](COME-INSTALLARE.md)**.

## Cosa c'è dentro

| Cartella | Cosa |
|---|---|
| `CIRCOLO-il-gioco.html`, `CALCETTO-il-gioco.html` | I due giochi, per intero, un file ciascuno |
| `apk/` | Le due app Android pronte |
| `android/` | Come sono fatte: il guscio Java e la build senza gradle |
| `app/`, `sw.js`, `index.html` | La versione installabile dal browser |
| `rete/` | Il server della SFIDA in rete di CALCETTO (oggi in pausa) e la sua informativa sulla privacy |
| `MANUALE.md`, `NOTICE` | Il manuale di CALCETTO, riga per riga dal codice, e l'inventario dei diritti: di chi è ogni byte |
| `strumenti/` | I banchi di prova: partite simulate e misure (servono Node e playwright; per giocare non servono) |
| `docs/` | Specifiche e piani di lavoro, datati |

Gli APK si ricostruiscono con `cd android && python costruisci.py`: la catena è
`aapt2 → javac → d8 → zipalign → apksigner`, tutta locale, niente gradle e
niente da scaricare al volo. `python verifica.py` fa 48 controlli (24 per ogni
app) sui file finiti, fra cui che l'HTML dentro l'APK sia byte per byte
identico al sorgente.

## Stato

Due giochi completi, che funzionano senza rete: si gioca contro il telefono, in
due sullo stesso apparecchio, oppure a distanza con il link di sfida di CIRCOLO
(che manda all'avversario le tue identiche carte) e con la SFIDA DI CARTA di
CALCETTO (un codice da incollare).

La **SFIDA in rete** di CALCETTO — contro la squadra di un'altra persona, più la
SFIDA DAL DISCHETTO — è pronta nel file web e aspetta il suo server,
`calcetto-rete`, che oggi è in pausa. Nell'app Android, che non ha il permesso
internet, dice «serve la rete» e basta.

Tutto quello che salvi resta sul dispositivo, salvo la SFIDA in rete se la usi:
manda al server il nome della squadra, i colori e i numeri dei giocatori
([informativa sulla privacy](rete/public/privacy.html)).
