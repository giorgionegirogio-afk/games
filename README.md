# Due giochi, zero connessione

Due prototipi giocabili per il telefono, ognuno in **un solo file HTML** che
funziona senza rete: nessun account, nessun server, nessuna pubblicità, nessuna
libreria da scaricare. Font, carte, suoni e grafica stanno tutti dentro il file.

👉 **[Provali qui](https://giorgionegirogio-afk.github.io/games/)**

| | |
|---|---|
| **CIRCOLO** | Scopa, Scopone, Briscola e Briscola a coppie. Quattro varianti regionali (napoletana, scopa d'assi, sbarazzina, rebello), quattro livelli di avversario, tavolo a quattro, torneo, mescolamento verificabile e sfida via link. |
| **CALCETTO** | Novanta secondi, tre contro tre più portiere. Tiro col timing, scivolata che può costare il cartellino, falli a accumulo come nel futsal, rigori, moviola, stagione a campionato e mercato dei giocatori. |

## Come si provano

- **Sul telefono, come app vera:** scarica `apk/CIRCOLO.apk` e `apk/CALCETTO.apk`.
  Due app da ~100 kB che **non chiedono nessun permesso** — nemmeno internet.
- **Senza installare niente:** apri il file `.html` con Chrome. Funziona lo stesso.
- **Come app web:** dalla pagina qui sopra, *Installa app*.

Istruzioni per esteso, con le trappole: **[COME-INSTALLARE.md](COME-INSTALLARE.md)**.

## Cosa c'è dentro

| Cartella | Cosa |
|---|---|
| `CIRCOLO-il-gioco.html`, `CALCETTO-il-gioco.html` | I due giochi, per intero, un file ciascuno |
| `apk/` | Le due app Android pronte |
| `android/` | Come sono fatte: il guscio Java e la build senza gradle |
| `app/`, `sw.js`, `index.html` | La versione installabile dal browser |

Gli APK si ricostruiscono con `cd android && python costruisci.py`: la catena è
`aapt2 → javac → d8 → zipalign → apksigner`, tutta locale, niente gradle e
niente da scaricare al volo. `python verifica.py` fa 32 controlli sui file
finiti, fra cui che l'HTML dentro l'APK sia byte per byte identico al sorgente.

## Stato

Prototipi di collaudo. **Il multigiocatore online non c'è ancora**: si gioca
contro il telefono, in due sullo stesso apparecchio, oppure a distanza con il
link di sfida di CIRCOLO, che manda all'avversario le tue identiche carte.

Tutto quello che salvi resta sul dispositivo.
