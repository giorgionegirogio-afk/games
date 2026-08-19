**VOTO: 6 / 10**

Sopra la media di igiene (la geometria e la semantica di annullo sono da manuale), ma tre meccaniche producono l'esito sbagliato con una frequenza che un principiante sente nei primi cinque minuti, e una delle tre lo punisce con un fallo.

**Le tre risposte, secche.**
- *In quanto tempo capisco cosa fare?* Muovermi e passare: 20-30 secondi, e sono buoni. Il gioco vero — le quattro bande del passaggio e l'arco d'ambra — non lo imparo in cinque minuti, e forse nemmeno in cinque partite, perché le due cose che lo insegnano (anello r=21 unità di mondo, lancetta) sono disegnate addosso a un corpo che in quel momento sta venendo contrastato, e io sto guardando il pallone.
- *Quante volte sbaglio comando nei primi cinque minuti?* Su ~25 passaggi e ~6 tiri, una ventina di esiti non voluti: ~8 passaggi nella banda sbagliata, ~5 tiri fuori finestra, ~4 scivolate non richieste, 1-2 ingressi ingoiati dalla regola P5. Di questi, cinque o sei mi costano il pallone o un fallo.
- *Cosa mi fa chiudere il gioco?* La scivolata che non ho chiesto, al terzo fallo. E, se la carta 1 indovina male la mano, un gioco specchiato che non so come raddrizzare.

---

## LE TRE COSE MIGLIORI

**1. Alzare il pollice non costa più il pallone.** (§7.1 #1, §6 «una mano sola», P8 `touchcancel`≠`touchend`.) È l'unica classe di fallimento che punisce una cosa che faccio per motivi che non c'entrano col gioco: una notifica, un semaforo, la mano che si riposiziona. Oggi il rilascio della levetta è un passaggio e `touchcancel` fa partire il tiro: cioè il telefono, facendo il telefono, gioca al posto mio. Toglierlo vale più di qualunque verbo nuovo, e la misura 1 con gruppo appaiato è il modo giusto di dimostrarlo — non «meno perdite», ma *differenza* fra dito alzato e dito giù.

**2. I due dischi non si possono confondere, e non è un'intenzione: è un'aritmetica.** 7,6 px di franco fra i cerchi di presa, 27,6 px di erba fra i bordi, il ramo a colonna verticale a 640×360 (senza il quale le prese si sovrappongono di 3,7 px), la geometria letta da `__test.comandiTouch` e non riscritta a mano, e il cancello 3b a **zero** su sei configurazioni. «Ho premuto il pulsante sbagliato» è la prima frase di ogni principiante su un gioco touch, ed è l'unico dei miei errori che qui è stato progettato via invece che sperato via.

**3. Il cambio direzionale al posto del ciclo orario** (#16, §7.1 #7). Da esordiente passo metà partita in difesa a subire, e il ciclo è la cosa che mi fa sentire che non comando la squadra ma la sfoglio. Punto col pollice sinistro, tocco B, sono lì. È l'unico comando dello schema che dà più controllo *e* meno tempo di quello che sostituisce. Nella stessa famiglia metto §3.4a (la palla che si stacca dal piede a 26 unità in scatto contro 10 a passo): è la sola riga del progetto che dà un significato alla levetta sinistra senza chiedermi di imparare niente.

---

## LE TRE COSE CHE SI ROMPONO

**1. La soglia tocco/tenuta a 0,15 s è appoggiata esattamente sopra il tocco naturale — e non ha un cancello che la misuri.**
Il documento cita 133 ms come costo del tap, e poi mette il confine fra «appoggio sicuro» e «passaggio pesato» a 150 ms. Sono 17 ms di margine. `TAP_T = 0.15` è già nel file (`CALCETTO-il-gioco.html:3077`), quindi il numero non è nemmeno nuovo: è ereditato senza essere rimesso in discussione ora che ci pendono quattro esiti invece di due.
*Caso concreto*: minuto 1, centrocampo, voglio appoggiare al compagno a 8 metri. Il mio tocco dura 170 ms. Esce un passaggio a 400 di velocità che gli passa 100 unità oltre e finisce al terzino avversario. Riprovo, va bene. Non capirò mai la differenza, perché la differenza è invisibile e dura 20 ms. Peggio in area: per crossare devo tenere oltre 0,50 s; se tentenno a 0,48 s esce un filtrante raso terra che il portiere raccoglie. Gol o niente, deciso da due centesimi di pollice.
E qui c'è il buco vero: **la §8 non ha nessuna misura sulla capacità umana di centrare le bande del passaggio.** Il cancello 3e inietta 60-120 ms di ritardo sul *tiro*, ma sul passaggio — che è l'azione più frequente della partita e ha tre confini invece di uno — non c'è niente. Il documento ammette in §9 punto 4 che le soglie «sono scelte, non derivate», e poi non costruisce il cancello che le deriverebbe. La fonte d'errore numero uno dello schema è l'unica senza guardiano.
*Corollario che il documento non conta mai*: il canale «durata» spende l'unica risorsa che una partita di calcio non ha. Per esprimere un cross servono 500-900 ms di pollice impegnato, durante i quali il difensore arriva e il bersaglio nel cono si sposta. Un pulsante dedicato costerebbe 133 ms. La §7.2 elenca quello che lo schema non sa fare, ma non elenca questo: **l'azione più lenta da esprimere è quella per cui ho meno tempo.** Che il §3.1 #7 debba inventare la «chiamata in profondità» per riempire il tempo morto della tenuta è la confessione: il gioco sa che quei mezzi secondi sono vuoti.

**2. Smettere di contenere mentre corro = scivolata, e la protezione dichiarata non protegge.**
§3.3 #18: scivolata al rilascio di A se la levetta è stata oltre 46 nei 0,30 s precedenti. Il documento si difende così: *«La freschezza di 0,30 s è il discriminante che impedisce alla scivolata di partire quando smetti semplicemente di contenere con la levetta già a fondo.»* **È il contrario.** Una levetta *tenuta* a fondo soddisfa la condizione di freschezza in ogni istante: è stata oltre 46 nei 0,30 s precedenti sempre, continuamente. Il test esclude solo il caso in cui ho spinto e poi *riportato al centro* più di tre decimi fa — cioè il caso che in difesa non capita mai, perché mentre inseguo un avversario il pollice sinistro sta sul bordo per definizione.
*Caso concreto*: minuto 2. Tengo A per accompagnare l'ala verso la fascia. Lui rientra sul piede forte. Mollo A per rimettermi a correre — il pollice sinistro non ha mai lasciato il bordo — e parto in scivolata. Fallo. Lo rifaccio al minuto 3 e al minuto 4, perché mollare il pulsante *è* il modo naturale di smettere di fare una cosa.
Nello schema **non esiste un gesto per «smetto di contenere senza impegnarmi»**: l'unico modo è centrare prima la levetta, stare fermo tre decimi, e poi rilasciare. Per non fare fallo devo prima fermarmi. Aggravante: `p.contieni` oggi esiste solo per la CPU e solo con `D.standoff>0` (`:11733`), quindi il contenimento umano è codice nuovo che nasce già accoppiato all'azione più punita del calcio.

**3. La carta 1 indovina la mano guardando in che metà appoggio il pollice.**
§6, «Mancino»: la levetta nasce dove poso il dito, e la metà dello schermo decide il verso di tutta l'interfaccia. Ma la carta dice *«Appoggia il pollice e muoviti»* — non dice **quale**.
*Caso concreto*: sono destrimano, prendo il telefono, l'erba libera è a sinistra ma il dito che mi obbedisce meglio è il destro, e nel dubbio uso quello. Il gioco decide che sono mancino e mi specchia dischi, casa della levetta e bussola. Da quel momento gioco con i pulsanti sotto la mano sbagliata, e non so che è successo perché non ho fatto nessuna scelta: ho solo mosso un dito. La revisione è in Impostazioni, che al minuto 1 non ho mai aperto. È l'unica inferenza implicita del documento, arriva al secondo cinque, e quando sbaglia rovina tutta la sessione. Una preferenza che si dichiara facendo la cosa è elegante solo se la cosa è ambigua a costo zero: qui il costo è l'intero schema al contrario.

*Due che hanno sfiorato la lista.* (a) **L'aftertouch punisce il gesto più naturale del dopo-tiro** (#13 + P10): rientro dalla destra curvando la corsa attorno all'ultimo difensore — cioè ruotando la levetta, per definizione — tengo A, rilascio sull'ambra, tiro giusto, e la palla esce di un metro perché la mia corsa stava ancora girando. Ho fatto tutto bene e ho sbagliato, e niente sullo schermo dice che è stato il pollice sinistro. Due volte così e l'anello del tiro smette di significare qualcosa, cioè muore l'unica abilità che lo schema voleva insegnare. Un costo onesto dev'essere visibile; questo non lo è. (b) **P5 ingoia l'ingresso nel momento di massimo panico**: sto caricando il tiro, arriva il difensore, premo PASSA — e non parte nessun passaggio. Il documento lo chiama una regola simmetrica; io lo leggo come «il gioco si è mangiato il comando», che è la frase che precede la chiusura dell'app.

---

## LA MODIFICA CHE ALZEREBBE DI PIÙ IL VOTO

**Spostare il *tipo* di passaggio sulla banda della levetta — lo stesso canale che sul tiro sceglie già precisione / pieno / pallonetto — e lasciare alla durata solo il peso dentro quel tipo.**

Il motivo non è di gusto, è una contraddizione interna che il documento non si accorge di avere. La §4.3 sostiene che l'associazione è *una sola e monotona*. Non è vero: **i due dischi usano i due canali a ruoli scambiati.**

| | cosa sceglie il *tipo* | cosa sceglie la *quantità* |
|---|---|---|
| DISCO A (tiro) | banda della levetta (#10 passo → precisione, #11 scatto → pallonetto) | durata (#9, la finestra d'ambra) |
| DISCO B (passo) | **durata** (#3-#6, quattro bande) | direzione della levetta (il cono) |

Sono due leggi opposte sotto lo stesso pollice, e la frase mnemonica non le distingue. Rendere B simmetrico ad A non aggiunge un'associazione: **ne toglie una**, ed è l'unico intervento che sistema insieme quattro cose. Sparisce la scala 0,15/0,35/0,50/0,90 che la §9 ammette non derivata e la §8 non misura. Il cross torna a costare 133 ms invece di mezzo secondo, cioè diventa disponibile nell'istante in cui serve. L'anello smette di essere una lotteria a quattro settori e diventa una barra di potenza, che è la cosa che un anello che si riempie *sembra già*. E la frase mnemonica diventa vera su tutto lo schema, non su metà: *la levetta dice dove e che cosa, il pollice destro dice quanto*.

Il costo, dichiarato: passare mentre scatto significherebbe sempre «alta», che è un conflitto reale — ma è **esattamente lo stesso conflitto che il tiro accetta già** (per il pallonetto devo essere oltre 66), quindi non è un difetto nuovo, è una legge estesa. Se la misura dice che la levetta non regge due carichi, il ripiego è a una riga: **tenere una sola soglia di durata invece di tre** — tocco = raso terra, tenuta = alta — e lasciare che il filtrante lo scelga il cono. Quattro esiti su un confine solo si imparano; quattro esiti su tre confini da 150 ms si tirano a indovinare.

Con questa modifica, la protezione della scivolata riscritta (serve una condizione sulla *variazione* della levetta negli ultimi 0,3 s, non sulla sua posizione — o un secondo canale che non sia il rilascio di A) e la mano scelta con una domanda esplicita invece che indovinata, questo schema vale 8. Così com'è scritto, vale 6.