## VOTO: **5 / 10**

Diviso onestamente: la **diagnosi vale 8**, la **prescrizione vale 4**. Come documento che devo implementare, è un 5 — costruito così com'è scritto, il gioco *peggiora* sulle due cose che su un telefono contano più di tutte: il tempo di risposta e il gioco a un pollice.

---

## LE TRE COSE MIGLIORI

**1. M3 è un difetto vero, riproducibile, e in produzione adesso.**
Verificato: `C:\Users\Utenteee\Desktop\GitHub\games\CALCETTO-il-gioco.html:8968` registra `touchcancel` → `Touch5.end` → `release` → `doPass`. Non c'è nessuna distinzione fra distacco e annullamento. Vale da solo il documento: una tendina delle notifiche regala il pallone, e nessuno dei cancelli esistenti lo vedeva. Anche M2 regge alla lettura: `:8825` (`d<=bt.r+10`) e `:8836` (`d<=bt.r+18`) stanno nello stesso ciclo col GRANDE per primo, quindi la mezzaluna morta esiste per costruzione.

**2. La Legge 3 (nessun ingresso legge una velocità) è ingegneristicamente corretta e toglie codice.**
`:8882-8896` è già una toppa che il file stesso confessa. Sotto una WebView Android in affanno la fusione dei `touchmove` non è un caso limite, è il caso normale a scena piena. Classificare su *posizione al touchstart* + *posizione al touchend* + *durata* è l'unico schema che sopravvive alla fusione. Spariscono 14 campioni, la finestra dei 90 ms, la soglia a 650 px/s e la deroga: è l'unica voce del documento con costo negativo.

**3. La condanna della bussola è una scoperta nuova, non un'opinione.**
Il codice a `:24979-24993` riserva alla levetta solo il **riquadro** `lvX0..lvY1` di `STICK_FULL`: il cerchio, non il fusto. Il documento trova quello che il codice non aveva in elenco, e lo trova con un conto (il cuneo) invece che a occhio. Stesso metodo per il rifiuto del cambio a icona sulla minimappa: tre conti indipendenti che convergono. Quello è il modo giusto di dire di no a una feature.

---

## LE TRE COSE CHE SI ROMPONO

### 1. Tutto si risolve al RILASCIO: ogni verbo del gioco prende ~100 ms in più. Il cambio giocatore, che oggi è istantaneo, diventa l'ingresso più lento del gioco.

Oggi, `:8825-8834`: `doSlide`, `doFiltrante`, `cambiaGiocatore` partono **al touchstart**. Solo `shot` aspetta il rilascio. Il filtrante poi matura in `PASS_CAR_U = 0,05 s` (`:11897`). Bilancio attuale dito-giù → palla-via: **~50 ms + ≤1 fotogramma**.

Con lo schema: durata del tap (60–150 ms) + rilascio + 50 ms di `anticipa` + ≤33 ms di fotogramma a 30 fps = **145–233 ms**. Tre volte tanto, sul verbo più usato.

**Il caso concreto.** 5v5, il loro esterno rientra sul mio secondo palo. Premo il PICCOLO per passare al difensore in copertura. Oggi `cambiaGiocatore` (`:9956`) gira nello stesso fotogramma del touchstart. Con lo schema gira 150 ms dopo — e nel frattempo l'uomo che volevo marcare non è più dov'era quando ho scelto. Peggio: `R_ARMA` parte da **22 px**, e se il pollice rotola di 25 px durante quel tap io non ottengo il cambio ciclico, ottengo il **cambio direzionale**; e se in quel settore non c'è nessun compagno, non ottengo **niente**. Oggi il cambio ciclico non fallisce mai. La tabella §4 dà a questa voce costo «0». Il costo è 150 ms e un esito nullo nuovo di zecca, sul verbo difensivo più critico che esista.

Corollario che il documento non vede: la §6.3 dichiara che «il fallimento è sempre benigno». È vero **solo sul PICCOLO**. Sul GRANDE in contesto IO ogni fallimento è *tira*, cioè perdere palla; in contesto LORO ogni fallimento è *contrasta*, cioè rischiare il fallo. La legge è enunciata come globale e vale su metà del sistema.

### 2. Due giocatori è un pollice a testa. Svuotare `release()` uccide l'unico repertorio completo a un pollice che il gioco abbia.

`2 GIOCATORI` è un bottone di menu vero (`:2463`), `G.mode=2` (`:7767`), schermo diviso a `x < innerWidth/2` (`:8812`), e i comandi si specchiano (`:8774`, `:25398`). Due persone tengono lo stesso telefono: **ciascuna ha una mano sola**, e quella mano deve fare levetta *e* dischi.

Oggi funziona per un motivo solo: `Touch5.release()` (`:8875-8965`) mette **tutto** sulla levetta — flick verso porta = tiro, flick trasversale in metà offensiva = cross, flick senza palla = scivolata, rilascio semplice = passaggio. È l'unico schema a un pollice completo del progetto. La §3.2.1 dice: «Il rilascio non fa niente. Mai. `Touch5.release()` diventa vuota.»

**Il caso concreto.** 2P, giocatore 0 tiene il bordo sinistro. Vuole tirare. Deve staccare il pollice dalla levetta, percorrere gli ~80 px fino al disco GRANDE specchiato a (64,352), premere, tenere 500–800 ms per la finestra di `SHOT_MIN/SHOT_MAX` (`:3077`), rilasciare. Per tutto quel secondo il suo uomo è in **stato a zero dita** — cioè fermo, per regola §3.2.3. E la §7 lo scrive da sé: «una mano sola: i dischi funzionano, la levetta no: si difende, non si attacca.» Quindi la §7 dichiara che il 2P non può attaccare, e poi indica come «il punto più debole del progetto» la posizione della bussola.

E c'è un secondo effetto: con `release()` vuota, **l'anello di esclusione `R_ESCL` non ha più nessuna ragione di esistere.** Il commento a `:8834-8836` dice esattamente perché c'è: «se no il rilascio potrebbe partire come flick». Niente flick, niente motivo. Il documento spende la §6.1 — la macchina delle due passate — per riparare un difetto (M2) che una sua *altra* modifica cancella gratis eliminando quelle due righe. E la riparazione proposta introduce un caso nuovo: il punto (795,7 · 344,9) è **10 px fuori dalla presa del GRANDE e 9 px fuori dal bordo dipinto del PICCOLO** — visivamente in mezzo ai due dischi — e adesso batte un passaggio. Se serve davvero una precedenza, è quella normalizzata (`d/r` minimo: 1,30 contro 1,395, vince il piccolo, e degrada bene ovunque), non «la presa batte l'esclusione».

### 3. L'effetto dopo il calcio non ha il gancio che il documento crede, e quello che c'è lo sovrascrive appena riparato.

`:10710-10714`:
```js
if(b.perfectT>0){
  b.perfectT-=dt;
  b.vy += b.curve*dt;
  b.curve*=Math.pow(0.2,dt);
}
```
`b.curve` **non si integra mai** se non dentro `b.perfectT>0`. Il documento dice «~10 righe + 2 di correzione d'asse» e non nomina il cancello.

**Il caso concreto, in due rami e sono rotti tutti e due.**
- Non tocco `perfectT`: curvo la levetta dopo un appoggio, e non succede assolutamente niente. L'aftertouch è codice morto su ogni passaggio, cross e tiro non perfetto — cioè su tutto tranne un tiro su venti.
- Accendo `perfectT` per far girare il ramo: `perfectT` **non è un flag di fisica, è la firma visiva del tiro perfetto**. Lo leggono `:24520` (`drawBallAt(..., perfectT>0, ...)`), `:10736` (la scia marcata `p:`), `:22184` e `:22357`. Ogni retropassaggio buttato via si accende come un tiro perfetto, con la sua scia.

E sul solo calcio dove `perfectT` è legittimo (`:10805`: `b.perfectT=0.5; b.curve=(p.y<FH/2?1:-1)*180`), scrivere `b.curve` per 0,45 s **cancella l'effetto a giro del tiro perfetto** — esattamente la cosa che `PUNTO-DEL-LAVORO.md` dichiara riparata («18 arrivi su 19 fuori dallo specchio, per costruzione»). Pollice al centro, `dot = 0`, curva **zero**: la meccanica che ha portato il voto da 6,4 a 8,2 si spegne da sola.

Terzo colpo, dentro lo stesso documento: la §3.2 dimezza il peso della levetta sulla corsa per 0,45 s dopo ogni calcio; la §4 vende il **passa-e-vai** come «PICCOLO + sprint alla levetta al rilascio». Le due voci si contendono lo stesso mezzo secondo e lo stesso pollice. Non è un compromesso dichiarato: è una contraddizione non vista.

---

## ALTRI QUATTRO, VERIFICATI (brevi)

- **L'aptico non esiste sul prodotto.** `buzz()` (`:6500`) chiama `navigator.vibrate`. `android/lavoro_calcetto/AndroidManifest.xml` dichiara, in chiaro e con un commento orgoglioso, **zero permessi**. Senza `android.permission.VIBRATE` la chiamata è un no-op silenzioso — il `try/catch` non se ne accorge nemmeno. Il documento fonda su di essa il tick a 150 ms, il tick a 600 ms e la frase «l'unico canale che un dito non può coprire». Sul file .apk quel canale non c'è. O si aggiunge il permesso (e allora «zero permessi» non è più vero, ed era un argomento di vendita), o due dei cinque dispositivi di scoperta della §5 vanno cancellati.
- **La casa nuova della bussola non ci sta a 640×360.** Con la formula del gioco (`:15895-15901`): `BAR_H=44`, `fB=1`, `skB=11,76`, `BAR_X1 = round(320+230+6+11,76+14) = 582`. Restano **58 px** a destra, e la bussola ne chiede 80. A sinistra ne restano 70, di cui 44 sono la pausa. Il documento ammette di non aver verificato 640×360 e dice «là la geometria è aritmetica»: l'aritmetica dice di no. I 195 px liberi esistono solo a 915.
- **Il cancello 1 fallisce per costruzione sulle sue stesse 100 prove avversarie.** §6.2 congela il contesto al touchstart; l'etichetta invece si ridisegna ogni fotogramma da `touchBtnLayout` (`:8773-8806`), che legge `possessoTeam(t)` **vivo**. Nei 250 ms attorno a un cambio di possesso il disco dice `CONTRASTA` mentre il verbo congelato è `TIRA`. È letteralmente il difetto di `HUD_POSA` che il cancello nasce per catturare, reintrodotto dalla regola di congelamento. O si congela anche l'etichetta (e allora mente all'occhio), o si risolve al rilascio (e allora il congelamento non serve). Il documento non sceglie.
- **La direzione a 4 settori è un declassamento, non un acquisto.** Oggi `eseguiFiltrante` (`:9143`) mira con la levetta: **analogica, 360°**, e sceglie il compagno per `dot` migliore. Lo schema la porta a 4 coni da 90° risolti da `smarcato()` — cioè dalla stessa funzione che già sceglie da sola. In un 5v5 con quattro compagni di movimento, «AVANTI» ne contiene spesso due, e il dito non li distingue: il giocatore non ha comandato, ha solo autorizzato. E il **cambio direzionale** eredita un ordinamento angolare calcolato attorno al **pallone** (`:9959-9961`), non attorno all'uomo comandato: quando difendo a 20 unità dalla palla, l'angolo dal pallone è numericamente instabile e non è il sistema di riferimento in cui il pollice sta pensando.
- *(bonus)* **Il tetto di prestazione proposto non è misurabile con lo strumento che lo nomina.** `strumenti/prestazione-base.json` dice `media 22,96 · p95 33,4 · meta 16,7`: il p95 è **già** sopra il sedicesimo, e a filo del trentesimo di secondo. La regola «se la didascalia costa più di 0,4 ms sul p95 si rifiuta» chiede di risolvere l'1,2% di una statistica di coda con una misura appaiata che `PUNTO-DEL-LAVORO.md` dichiara incerta a ±0,9% **sulla media**. E la cura giusta non è rifiutare la didascalia: sono sette parole fisse (sei verbi + ANNULLA) — si pre-rasterizzano una volta in altrettante bitmap e si blittano, costo ~0. Il documento propone di buttare la feature invece di scriverla bene.

---

## LA SINGOLA MODIFICA CHE ALZEREBBE DI PIÙ IL VOTO

**Togliere la direzione dai dischi. Il pollice destro smette di essere un dispositivo di puntamento: ogni disco porta solo *verbo + durata*. La direzione resta dove già è e dove è già analogica — la levetta, letta all'istante del calcio, come fanno oggi `eseguiFiltrante` (`:9143`) e `releaseCharge` (`:9238`).**

È una modifica sola e ne paga sei:

1. **La latenza torna quella di oggi.** Se non c'è un raggio da misurare al rilascio, il verbo può ripartire al **touchstart** com'è adesso (`:8825`) e la durata modula un calcio che è già nella sua finestra di `anticipa`. Il cambio giocatore torna istantaneo. Nessuno dei 26 verbi paga i 100 ms.
2. **Il 2P sopravvive**, perché non c'è più nessun motivo di svuotare `release()`: la levetta resta il repertorio completo a un pollice, e i dischi diventano la scorciatoia del giocatore a due mani invece della sua unica strada.
3. **Sparisce tutta la §3.5.** Niente freccia di gesso, niente didascalia, niente linea di mira sul pallone — cioè niente disegno nuovo, niente costo di testo per fotogramma, e niente HUD nuovo piantato sopra la bocca della porta, che è lo stesso peccato per cui i dischi sono stati spostati nell'angolo (`:8770-8790`).
4. **Il cancello 3 diventa banale invece che impossibile**: il verbo è già annunciato dall'etichetta sul disco, prima della pressione, non durante.
5. **Il conflitto etichetta/congelamento evapora**, perché non c'è più niente da congelare: si preme e parte.
6. **La mira torna a 360°** invece di 4 coni, cioè la cosa che il documento voleva comprare — passaggi comandati invece che autorizzati — la si ottiene *non* facendo la modifica.

Il prezzo, e lo dico chiaro perché il documento lo aveva già dichiarato come §8.2: **non si mira e non si corre insieme**. È una perdita vera. Ma è una perdita che il gioco già ha, che i giocatori già conoscono, e che costa meno dei 100 ms, del 2P morto e dei quattro tracciati sul pallone.

Restano da fare comunque, e da fare **prima** di qualunque schema: il `touchcancel` (`:8968`) e la cancellazione della lettura di velocità (`:8882-8896`). Quelli due sono giusti, sono piccoli, e valgono da soli mezzo punto.