# La scheda di CALCETTO su Google Play — testi e materiali pronti

Scritto il 31 agosto 2026, il giorno del caricamento. Tutto quello che si
incolla nella Play Console sta qui, già misurato nei limiti che Google
impone. Le decisioni prese e i loro perché stanno in fondo.

---

## Il nome dell'app (massimo 30 caratteri)

    CALCETTO — Dopolavoro FC

24 caratteri. «CALCETTO» da solo è più forte ma rischia di collidere con
altre app omonime nella ricerca; il suffisso dice di chi è.

## Descrizione breve (massimo 80 caratteri)

    Calcio arcade: 5, 7 o 11 in campo. Leggero, offline, senza pubblicità.

71 caratteri.

## Descrizione lunga (massimo 4000 caratteri)

> Sono le sette di sera al campo del dopolavoro. Si accendono i fari, si
> tirano fuori le maglie, e si gioca.
>
> CALCETTO è un gioco di calcio arcade fatto in Italia: partite a 5, a 7
> o a 11, su campi che si sbloccano giocando, con un pallone che si
> comanda col dito e risponde subito.
>
> **COME SI GIOCA**
> Trascini il dito e il giocatore corre. Tocchi il disco del passaggio e
> la palla parte; lo trascini e la mira è tua: rasoterra sul compagno
> smarcato, filtrante nello spazio, cross alto in area se stai correndo
> in fascia. Tieni premuto il tiro e la carica cresce: rilasci al momento
> giusto e l'angolo è tuo. In difesa contieni, contrasti in piedi o
> rischi la scivolata — mirata col dito, come tutto il resto.
>
> **LE MODALITÀ**
> · Amichevole, da solo contro la squadra avversaria o in DUE sullo
>   stesso telefono, metà schermo a testa.
> · Il TORNEO a eliminazione: tabellone, premi in monete, albo d'oro.
> · La STAGIONE: un campionato a giornate, con la classifica che si
>   ricorda di te.
> · La SFIDA in rete: registra una partita e mandala nel mondo — un
>   altro giocatore la rigioca contro la tua squadra, mossa per mossa.
>   Classifica per nazione. (Serve la connessione solo qui.)
> · I RIGORI quando serve un verdetto: barra di potenza, occhio al
>   momento giusto.
>
> **LA TUA SQUADRA**
> Il nome lo scegli tu, le maglie anche. I tuoi cinque uomini crescono
> partita dopo partita, in base a quello che fanno in campo. Le monete
> si guadagnano giocando — vincere paga di più — e si spendono in campi
> nuovi e negli sblocchi della bacheca del campetto: prezzi dichiarati
> una volta, per sempre. I cartelloni a bordo campo sono i negozi del
> quartiere — e volendo li scrivi tu.
>
> **FATTO COME UNA VOLTA, PESA COME UNA VOLTA**
> · Meno di 1 MB. Sì, un megabyte: meno di una foto.
> · Funziona SENZA connessione, in aereo, in cantina, ovunque.
> · ZERO autorizzazioni Android richieste.
> · Niente pubblicità. Niente registrazione. Niente attese.
> · Trofei, statistiche di carriera, moviola dei gol.
> · Accessibilità: modalità per daltonici, riduzione del movimento,
>   comandi regolabili per mano, taglia e distanza.
>
> Sono le sette di sera. Il campo è acceso. Si gioca.

(~1950 caratteri, dentro il limite con margine per ritocchi.)

## Categoria e contatti

| campo | valore |
|---|---|
| categoria | Giochi → Sport |
| tag | calcio |
| email di contatto | giorgionegirogio@gmail.com |
| informativa privacy | `https://calcetto-rete.vercel.app/privacy.html` — la pagina è pronta in `rete/public/privacy.html`, **va deployata** (vedi sotto) |
| acquisti in-app | **No** — la fatturazione è progettata (`android/pagamenti/`) ma NON è dentro questo APK: zero permessi, nessun listino attivo. Si dichiara «no» finché è vero. |
| pubblicità | No |

## Classificazione dei contenuti (questionario IARC)

Le risposte sono tutte «no» tranne dove indicato:
- violenza: no (falli e cartellini di un gioco di calcio, nessuna
  rappresentazione violenta);
- gioco d'azzardo simulato: **no, e senza riserve** — nel gioco non
  esiste nessuna ruota, nessuna cassa premio, nessun elemento a esito
  casuale che costi valuta: il negozio ha solo prezzi fissi dichiarati.
  (Rettifica del 31 agosto: una prima stesura di questa scheda citava
  una «ruota del dopolavoro» — non esiste; l'id `ruota` nel codice è
  l'avviso RUOTA IL TELEFONO. L'ha scoperto il censimento del manuale.)
  Il risultato atteso è PEGI 3.
- acquisti digitali: no (in questo APK);
- interazione fra utenti: la SFIDA scambia nomi di squadra scelti
  dall'utente e replay; non c'è chat libera. Va dichiarato «gli utenti
  possono interagire» solo per lo scambio asincrono.

## Scheda dati (Data Safety) — le risposte

| domanda | risposta |
|---|---|
| L'app raccoglie o condivide dati? | **Sì**, ma solo nella modalità in rete |
| Posizione | no |
| Informazioni personali (nome, email…) | **no** |
| Informazioni finanziarie | no |
| Salute, messaggi, foto, file, rubrica, calendario | no |
| Identificativi dell'app | **sì** — un identificatore casuale generato da noi, non pubblicitario |
| Attività nell'app | **sì** — punteggi e partite, solo se si gioca in rete |
| I dati sono cifrati in transito | **sì** (HTTPS) |
| Si possono far cancellare | **sì**, su richiesta (email nell'informativa) |

## La grafica

| pezzo | stato |
|---|---|
| icona 512×512 | si genera con `node android/icone/icone-android.js` (il 512 è stato aggiunto oggi alla lista delle taglie) |
| immagine in evidenza 1024×500 | da catturare: scena di gioco vera a finestra 1024×500 (vedi sotto) |
| schermate telefono (2-8, min 320 px, 16:9) | da catturare a 1920×1080: menu, partita 5v5, partita 11v11, tabellone del torneo, duello dei rigori, spogliatoio |

Le catture si fanno col gioco vero in Chromium alla risoluzione giusta —
niente montaggi, niente cornici finte: Play penalizza le schermate che
non sono il gioco.

## Che cosa resta da fare a mano nella Play Console (il committente)

1. **Deployare la privacy** (`rete/public/privacy.html`) — un solo
   comando dalla cartella `rete/`, oppure `git push` se il progetto
   Vercel è collegato al repository. Senza l'indirizzo pubblico la
   scheda non si può completare.
2. Play Console → Crea app → nome, lingua predefinita italiano, «Gioco»,
   «Gratis».
3. Compilare la scheda dello store con i testi di questo file.
4. Compilare Data Safety e IARC con le tabelle qui sopra.
5. **Prova chiusa** (obbligatoria per gli account personali nuovi):
   creare la traccia, caricare `apk/CALCETTO.aab`, aggiungere l'elenco
   email dei 12 collaudatori. I 14 giorni partono da quando la prova è
   attiva CON i collaudatori dentro: prima si parte, prima si pubblica.
6. Al primo caricamento la Console chiede di registrare la firma:
   scegliere «usa la chiave di caricamento» e caricare il certificato
   della chiave in `C:/Users/Utenteee/.chiavi-dopolavoro/` (istruzioni
   in `_analisi/PUBBLICARE.md`).

## Le decisioni prese oggi, e perché

- **targetSdk 34 → 36**: da oggi 31 agosto 2026 Play rifiuta le app
  nuove sotto Android 16 (verificato sulla pagina ufficiale del
  supporto). Il guscio era già pronto al bordo-a-bordo; non provato su
  un telefono Android 15/16 — lo dirà la prova chiusa.
- **Niente fatturazione nel primo caricamento**: il permesso BILLING
  cambierebbe tre dichiarazioni della scheda e chiede il conto
  commerciante; entra con un aggiornamento, la prova chiusa non ne ha
  bisogno.
- **La ruota si dichiara nel questionario ma non è azzardo**: gira a
  monete di gioco guadagnate giocando, senza acquisti né denaro.
