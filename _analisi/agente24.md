**VOTO: 5,5 / 10**

Sopra il 5 perché lo strato base (levetta = corro, disco grande = tiro, disco piccolo = passo) è leggibile in una decina di secondi e non punisce chi stacca il dito. Molto sotto l'8 perché tutto quello che c'è oltre lo strato base è invisibile, si accende da solo, e quando sbaglia il gioco non risponde niente — che per me, che non ho mai giocato, è indistinguibile da un gioco rotto.

**Tempo per capire cosa fare:** ~8 secondi per il ciclo base (due parole scritte sui dischi, due taglie diverse). **Mai**, senza un manuale, per i 26 verbi: nella prima ora ne userei 4.
**Comandi sbagliati nei primi 5 minuti:** su ~80 pressioni del pollice destro stimo **25-35 esiti diversi da quello che volevo** — di cui ~20 sono la soglia dei 150 ms, 3-8 sono la soglia dei 600 ms (verbo diverso, non parametro diverso), e una manciata sono pressioni a cui il gioco non risponde affatto.
**Cosa mi fa chiudere:** non la difficoltà. Il silenzio.

---

## LE TRE COSE MIGLIORI

**1. Alzare il pollice non costa niente — `release()` vuota, `touchcancel` = annulla, stato a zero dita neutro (§3.2).**
È la cosa che più di ogni altra distingue un gioco che posso imparare da uno che mi punisce mentre imparo. Io stacco le dita in continuazione: per guardare il campo, perché mi arriva una notifica, perché non so cosa fare. Nello schema di oggi quello mi costa il pallone (M3: 4 prove su 4, la palla parte a 423-511 u/s con `passTo` valorizzato). Un principiante non capisce mai che è colpa della tendina delle notifiche: capisce che «il gioco mi ruba la palla a caso». Questo è l'unico modo di perdere che non si perdona, ed è eliminato per costruzione.

**2. Due dischi di taglia diversa con sopra una parola, non un'icona.**
40 e 30 di raggio a 95 px di distanza: li distinguo al tatto senza guardare, e la parola («TIRA», «PASSA») elimina la decodifica delle icone che è il costo di ingresso di ogni gioco sportivo su telefono. Il ciclo base si legge senza tutorial. Aggiungo che la geometria che li tiene nell'angolo — leva corta, ombra corta, 0 % della bocca della porta coperta (§1.3) — la sento anche se non la so nominare: non perdo mai di vista la porta in cui sto tirando. È il tipo di beneficio che il giocatore non nota, che è il modo giusto di essere notato.

**3. Nessun ingresso legge una velocità (Legge 3) + la legge dei pareggi (§6.3).**
I miei gesti da principiante sono lenti, incerti, e cominciano con mezzo secondo di esitazione col dito già appoggiato. In quasi tutti i giochi a swipe questo si traduce in «non è successo niente»: sotto soglia. Qui la lentezza non è mai un errore. E quando sbaglio la direzione ottengo il passaggio semplice invece di un disastro: il fallimento scende di grado invece di cambiare di segno. Sono le due proprietà che mi permettono di giocare male senza smettere di giocare.

---

## LE TRE COSE CHE SI ROMPONO

**1. Il silenzio: tre modi diversi, tutti indistinguibili da un gioco che si è piantato.**
Lo schema produce «non succede niente» per tre cause non correlate, nessuna delle quali è annunciata:

- *Il verbo morto al cambio di contesto.* §6.3: il contesto si congela al touchstart e «se non ha più senso (`TIRA` senza palla) **non parte niente**». Caso concreto: sto per tirare, il difensore mi tocca la palla 80 ms prima che il mio dito arrivi. Premo. Niente. Ripremo subito, convinto di aver mancato il disco: adesso l'etichetta dice CONTRASTA e il mio giocatore si butta in scivolata a tre metri dalla palla. Due pressioni, due esiti che non ho chiesto, zero spiegazioni.
- *Lo smorzatore a 180 ms (§7).* Il comportamento naturale di chi non ha mai giocato, sotto pressione, è **martellare** il tasto passaggio. La seconda pressione entro 180 ms viene mangiata in silenzio. Il documento lo dichiara come prezzo («due passaggi deliberati a raffica sono impossibili») ma lo dichiara al progettista, non a me.
- *Il corridoio morto fra i due dischi.* §6.1 ripara M2 (bene, ed è una riparazione vera da quattro righe), ma il corridoio resta: fra le due prese ci sono 4,76 px, e stanno dentro tutte e due le corone di esclusione. Il pollice che riposa sul GRANDE e allunga verso il PICCOLO — cioè il gesto più frequente dell'intero schema — se arriva corto non trova né presa né levetta né vibrazione. Muore.

Tre cause diverse, un solo output: nessuno. Nei primi cinque minuti io non costruisco la teoria «ho sbagliato»; costruisco la teoria «il touch di questo gioco fa schifo». Ed è quella che mi fa chiudere.

**2. Ogni modificatore è a scelta implicita: si accende da solo perché il dito sta comunque lì.**
Non esiste in tutto lo schema un input «pulito». La durata modula sempre, la direzione si arma con 22 px di rollio, l'aftertouch legge una levetta che io tengo premuta *sempre*, perché la levetta è anche la corsa.

- *Caso concreto, i 600 ms.* Ho due avversari addosso, guardo il pallone, stocco il disco piccolo e — perché sono in panico — lo tengo 0,65 s. Non ho fatto un passaggio pesato: ho fatto un **verbo diverso**, la CHIAMATA. Il compagno parte, la palla vola trenta metri, perdo il possesso. Differenza fra l'esito che volevo e quello che ho avuto: 50 millisecondi di dito.
- *Caso concreto, l'aftertouch.* Sto correndo in diagonale verso destra, tengo la levetta avanti-destra perché sto correndo, tiro. Per 0,45 s la componente perpendicolare scrive `CURVA_MAX = 170` sulla palla. Il mio tiro esce fuori dal palo, e contemporaneamente il mio giocatore rallenta (peso della corsa a 0,5) proprio mentre volevo seguire l'azione. Due effetti che non ho chiesto da un input che non sapevo di stare dando. L'annuncio «MUOVI LA LEVETTA: EFFETTO» compare **una volta sola nella vita del salvataggio**: se in quel momento guardavo il portiere, la spiegazione dei miei prossimi mille tiri storti è persa per sempre.

Il conto «26 verbi contro i 6 di DLS» è presentato come un vantaggio. Dalla mia parte del telefono è il contrario: userò 4 verbi e pagherò l'ambiguità di 26.

**3. Il canale che dovrebbe salvare tutto questo non c'è, proprio dove serve.**
Lo schema ha tre canali di ritorno e tutti e tre cadono nel caso peggiore.

- *L'aptico non esiste su metà dei telefoni.* §5 punto 3 chiama il tick a 150 ms «l'unico canale che un dito non può coprire» e ci appende l'apprendimento della soglia tap/tenuta. Ma `buzz()` è `navigator.vibrate` (`CALCETTO-il-gioco.html:6500`): **su iOS l'API non esiste**, e c'è pure `SAVE.vib!==false` che la spegne. Su ogni iPhone la soglia dei 150 ms e quella dei 600 ms non si vedono, non si sentono e non si annunciano.
- *La ghiera è sotto il dito.* Il documento lo scrive e lo liquida con «ma è ridondante». Non è ridondante: quando l'aptico manca è l'unica altra cosa che esiste, e sta sotto il polpastrello.
- *La didascalia è appesa al pallone, e la premessa dell'ancoraggio è falsa.* La Legge 2 poggia su «la camera lo tiene nel terzo centrale». Il gioco dice il contrario nel proprio codice: l'ultimo clamp della camera (`CALCETTO-il-gioco.html:21226-21230`, `G.cam.x=clamp(G.cam.x, w.x0, w.x1)`) riporta l'inquadratura dentro la finestra del mondo dipinto, e il commento sopra (`:21205-21225`) lo dichiara in chiaro — «Dove la finestra e il terzo centrale non stanno insieme — pallone appiccicato alla linea di fondo, mondo dipinto finito — vince la finestra» — e riporta la misura: «in due [istanti su otto] il pallone spinto nel terzo ESTERNO». Caso concreto: attacco sulla fascia destra, palla vicina alla linea laterale nel terzo offensivo, la camera è al muro, il pallone finisce in basso a destra. La freccia da 60-76 px e la didascalia 26 px sopra il pallone cadono **dentro il cuneo del mio pollice destro**, che in quel momento è appoggiato sul disco a (851, 352). È esattamente la situazione in cui la direzione (il cross, «TRASCINA IN FASCIA») è il verbo che mi serve, ed è la situazione in cui l'annuncio è sotto la mia mano. Stessa cosa su corner, rimesse e retropassaggi al portiere. Il cancello 2 protegge il pallone dal pollice; **nessun cancello protegge la didascalia dal pollice**, e il cancello 3 ne misura il contrasto, non l'occlusione.
- *E non c'è nessun posto dove andare a rileggere.* Il tutorial diventa sette lampi da due parole, uno solo per salvataggio, senza una pagina «comandi» da nessuna parte. Se perdo il lampo, il verbo non esiste più.

---

## LA SINGOLA MODIFICA CHE ALZEREBBE DI PIÙ IL VOTO

**La didascalia deve essere viva dal `touchstart`, non dall'armamento della direzione — e deve dire sempre cosa succede se lascio adesso, compreso quando la risposta è «niente».**

Concretamente, tre precisazioni sulla stessa singola cosa:

1. **Quando:** dal momento in cui il dito tocca il disco fino al distacco, aggiornata in continuo. Oggi (§3.5) compare solo «appena la direzione è armata», cioè dopo 22 px di trascinamento — quindi nel 90 % delle mie pressioni, che sono tocchi secchi senza trascinamento, non compare mai. La sequenza che devo poter leggere mentre il dito è giù è: `PASSAGGIO CORTO` → (150 ms) `PASSAGGIO TESO` → (600 ms) `CHIAMATA IN PROFONDITÀ` → `...IN FASCIA` / `ANNULLA` / `NIENTE`.
2. **Dove:** non a 26 px fissi sopra il pallone, ma **specchiata sul lato del pallone opposto al pollice vivo**, e spostata nella banda alta libera quando il pallone cade dentro il cuneo. La posizione dei tocchi il gioco ce l'ha già.
3. **Cosa:** anche il fallimento. `NIENTE` in grigio quando il verbo congelato non ha più senso, e la stessa parola quando la seconda pressione cade nello smorzatore dei 180 ms.

**Perché è questa e non un'altra.** Lo schema ha già comprato e pagato la proprietà più preziosa che esista per uno che non ha mai giocato: **il rilascio non fa niente, quindi posso sempre abortire**. Oggi quella proprietà è sprecata, perché non posso vedere che cosa starei abortendo. Rendere la previsione continua trasforma le tre soglie invisibili (22 px, 150 ms, 600 ms) in stati che vedo arrivare e da cui posso ritirarmi prima di impegnarmi — e trasforma il silenzio in una parola. Cura la rottura 1 per intero, rende correggibile la 2, e rende superfluo l'aptico che su iPhone non c'è (rottura 3).

Costa poco perché il pezzo è già progettato e già a bilancio (§10 ha perfino la regola di scarto: se la didascalia costa più di 0,4 ms sul p95, si tiene solo la freccia — regola che a quel punto andrebbe rovesciata: **si scarta la freccia e si tiene la didascalia**, perché la freccia è ridondante col dito e la didascalia no). E il cancello 3 non va riscritto: va solo esteso a campionare l'annuncio **per tutta la durata della pressione** invece che nel solo istante del rilascio.

Con questa modifica sola, e senza toccare nient'altro, passerei da 5,5 a circa 7. Per arrivare all'8 servirebbe anche che i modificatori smettessero di accendersi da soli — in particolare l'aftertouch, che dovrebbe richiedere un movimento *nuovo* della levetta dopo il calcio, non la posizione che stavo già tenendo.