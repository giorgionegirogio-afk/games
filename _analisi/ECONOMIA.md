# ECONOMIA — che cosa si vende, a che prezzo, e che cosa non si vende

Aggiornato al 27 agosto 2026.

Il mandato è: «acquisti dentro l'app, come FC Mobile, deve poter funzionare
anche offline», con il vincolo assoluto che il gioco resti libero da
copyright. Questo documento è il progetto. Il codice del ponte sta in
`android/pagamenti/`, l'aritmetica è verificata da `rete/prove/economia.js`
(86 controlli, 86 passati), e ogni numero qui sotto o viene da una misura sul
sorgente o è dichiarato come assunzione.

---

## 0. Da dove si parte, misurato

Oggi CALCETTO ha un'economia intera che funziona e non incassa niente.

| fatto | dove si legge |
|---|---|
| una sola valuta, `SAVE.coins`, e nel salvataggio non ce n'è una seconda | `CALCETTO-il-gioco.html:7388` |
| l'unica sorgente di monete è `addCoinsInternal`, e in positivo la chiamano tre punti di gioco | `:8814`, chiamata da `:8776`, `:33101`, `:33587` |
| le uscite sono due, contate su tutto il file: un campo e un articolo | `:33954`, `:34034` |
| sette costanti di premio, con la taratura dichiarata in commento | `:7330-7332` |
| cinque articoli, prezzo doppio euro/monete, «una volta, per sempre» | `:7339-7355` |
| il bottone in euro non compra: apre un riquadro di testo | `:2717-2726` |
| il patto è scritto dove si legge: «niente pubblicità, niente casse premio, niente attese» | `:2718` |

Il cambio implicito fra le due valute è già coerente su tutte e cinque le
voci: fra **666,7 e 668,9 monete per euro** (2660/3,99, 1330/1,99, 660/0,99,
2000/2,99), media 667,6. È un numero che il gioco non dichiara e che si può
ricavare guardando i cartellini: è già più di quanto faccia FC Mobile, che ha
tredici valute cablate nel motore e nessun cambio dichiarato fra la valuta a
pagamento e le altre.

Quindi non si sta progettando un'economia da zero. Si sta **collegando un
cassiere a un'economia che esiste**, e la parte difficile è non rompere quello
che già funziona.

---

## 1. Che cosa si vende: TEMPO e ASPETTO, mai FORZA

### Il vincolo, e perché lo condivido

I soldi comprano acceleratori (tempo) e cosmetici (aspetto). Non comprano
niente che renda più forti in campo, e in particolare non comprano niente che
non si possa ottenere giocando.

La ragione non è morale, è strutturale, e sta in `rete/LEGGIMI.md`. Il gioco
sta per avere una **classifica Elo** con accoppiamento per forza: `PUT
/api/squadra` pubblica la forza della tua rosa, `GET /api/avversario` cerca una
squadra vicina di forza, `POST /api/sfida` muove i punti. In un impianto così,
vendere forza non «sbilancia» la classifica: la **cancella**, perché la
classifica smette di misurare chi gioca meglio e comincia a misurare chi ha
pagato di più. E una classifica che misura il portafoglio non la guarda
nessuno, quindi si perde anche la ragione per cui la classifica era stata
costruita.

C'è anche un fatto di casa: CALCETTO ha già un **collaudo d'equità**
(`strumenti/equita.js`) che gioca N partite CPU contro CPU appaiate allo stesso
seme, con e senza gli oggetti del negozio, e fallisce se la differenza reti
media supera 0,15 gol a partita. Quella misura è l'unica prova pubblica di
equità che io conosca in un gioco di questo tipo. Vendere forza vuol dire
buttarla.

### L'obiezione che mi faccio da solo, e la correzione che ne esce

Il vincolo così com'è formulato ha una fessura, e va detta perché è larga.

**«Tempo» è sicuro solo se la cosa che si accelera è già innocua.** Vendere
tempo significa vendere monete. Le monete comprano quello che comprano: oggi
campi, divise, cori e cartelloni, e va bene. Ma se domani qualcuno aggiungesse
un pozzo di monete che tocca la rosa — un allenamento a pagamento, un punto
attributo comprabile, una crescita accelerata — quello stesso «acceleratore»
diventerebbe pay-to-win **con un ritardo**, e sarebbe difficile accorgersene
perché il listino non sarebbe cambiato di una riga.

Il punto è preciso e ha un indirizzo: `faiCrescereRosa` (riga 33719) alimenta
gli attributi, gli attributi alimentano `forzaDi` in `rete/api/squadra.js`,
`forzaDi` decide l'accoppiamento e i punti. **La rosa non si compra, in nessuna
forma, nemmeno indiretta, nemmeno lenta.**

Quindi il vincolo si riscrive più stretto, e in questa forma lo firmo:

> Un euro può entrare solo in un pozzo che il collaudo d'equità sorveglia.

Non è una frase: è un cancello. Ogni volta che si aggiunge un pozzo di monete,
`equita.js` deve girare con quel pozzo acceso, o l'euro non ci entra.

### Il difetto da chiudere PRIMA di spedire

E qui c'è la cosa più importante di tutto il documento, ed è una brutta
notizia.

**Il collaudo d'equità oggi non è collegato.** È già registrato in
`_analisi/DIFFERENZE-FC-MOBILE.md` (voce «La prova del pay-to-win zero è
agganciata a un cancello», riga 6010): `strumenti/tutti.js:197` lancia
`equita.js --partite 10` **senza `--conf-b`**, cioè senza accendere gli oggetti
nel lato B. Lo strumento confronta il gioco con se stesso e misura il proprio
determinismo, non l'equità. L'aggancio `__test.attivaOggetti` (riga 34915)
esiste, ma nei 256 file `.js` degli strumenti lo chiama un solo strumento vero.

Finché il gioco non incassava, era un difetto di documentazione: si prometteva
una cosa vera senza misurarla. **Dal giorno in cui incassa diventa un altro
tipo di problema**, perché la promessa «pagare non fa vincere» sarà scritta
accanto a un prezzo. La riparazione è una riga in `tutti.js` e va fatta prima
di qualunque altra cosa di questa cartella.

### La regola operativa, in tre righe

1. Si vendono **diritti** (aspetto: campi, divise, cori, cartelloni) e
   **monete** (tempo). Niente altro.
2. Ogni cosa comprabile in euro ha un prezzo in monete, e le monete si
   guadagnano solo giocando. Il banco lo verifica voce per voce.
3. Niente esce dal telefono. Nessun evento d'acquisto va al nostro server: né
   per statistiche, né per anti-imbroglio, né per «capire i giocatori». Quello
   che si spende lo sanno Google e chi paga.

---

## 2. Le valute: **una**, e resta una

Le monete. Non ce n'è una seconda e non ce ne sarà una seconda.

FC Mobile ne ha **tredici** cablate nel motore (COIN, GEMS, MTX, FIFAVOUCHER,
XP, FANS, STAMINA, TRAINSFER_CURRENCY, MARKETPOINT, TRADE_MARKET_POINT,
LEAGUETOKEN, LEAGUEPOINT_GEN3, DAILYTRAINING_POINT — contate a
`motore-tutte.txt:110363-110374` e `:110478`), più le valute di evento che
cambiano a ogni evento, più un interruttore `SPLIT_CURRIENCIES` che le può
separare ancora. Sulla prima schermata se ne vedono tre, ognuna col suo `+`
che porta al carrello.

Non è disordine, è progetto. Molte valute servono a **rendere impossibile
sapere quanto costa una cosa**: quando fra l'euro e l'oggetto ci sono due
conversioni e un pacchetto, il prezzo non si legge più, si stima. È un
anti-modello, e va copiato al contrario.

Con una valuta sola:

- un prezzo si legge senza tabelle;
- il cambio euro→monete è **un numero solo**, e si può stampare sul cartellino;
- il tetto di magazzino (sezione 6) è calcolabile, perché «quanto resta da
  comprare» è una somma e non un sistema;
- `SAVE.coins` resta un campo, e non serve una migrazione del salvataggio.

E c'è un vincolo che discende direttamente dall'avere un cambio unico
dichiarato, ed è il più importante del listino:

> **Nessun taglio di monete può dare più di 666,7 monete per euro.**

Sopra quella soglia, comprare monete e poi l'articolo costerebbe meno che
comprare l'articolo, e il cartellino in euro diventerebbe una trappola per chi
lo legge e si fida. La soglia non è scelta a mano: è il cambio dell'articolo
peggiore del catalogo, e il banco verifica che i due numeri coincidano — se
domani qualcuno cambia un prezzo del negozio, la soglia si sposta da sola.

---

## 3. Il listino — sette voci

Prezzi di ripiego in euro: **quello che si mostra a chi paga arriva da Google**
(`getFormattedPrice`), perché è l'unico che conosce valuta, IVA e listino del
Paese. Un prezzo cablato è giusto in Italia e sbagliato ovunque altro.

Le ore vengono da due assunzioni dichiarate: **48 monete a partita** (taratura
scritta nel codice, `:7330`, *non misurata su partite vere*) e **20 partite
all'ora** (90 s di partita più lavagnetta e menu, ≈3 minuti l'una). Il prodotto
è **960 monete all'ora**. Le ore sono quindi ±20%, e vanno mostrate come
«circa».

| # | voce | euro | dà | in monete | ore di partite | €/ora |
|---|---|---:|---|---:|---:|---:|
| 1 | IL CAMPETTO COMPLETO | 3,99 | tutti e quattro i pezzi qui sotto, e ciò che verrà | 2.660 | ≈2,8 | 1,44 |
| 2 | PACCHETTO CAMPI | 1,99 | i sette campi oltre l'Oratorio | 1.330 | ≈1,4 | 1,44 |
| 3 | PACCHETTO DIVISE | 1,99 | le divise alternative | 1.330 | ≈1,4 | 1,44 |
| 4 | LA CURVA | 0,99 | cori, tamburo, esultanze | 660 | ≈0,7 | 1,44 |
| 5 | LO SPONSOR DEL CAMPETTO | 2,99 | i cartelloni scrivibili | 2.000 | ≈2,1 | 1,44 |
| 6 | UN SACCHETTO DI MONETE | 1,99 | 1.100 monete | 1.100 | ≈1,1 | **1,74** |
| 7 | UNA CASSETTA DI MONETE | 4,99 | 3.200 monete | 3.200 | ≈3,3 | **1,50** |

Le prime cinque sono il catalogo che il gioco ha già: cambia solo che il
bottone comprerà davvero. Le ultime due sono nuove, e sono l'unica cosa
ricomprabile del listino.

Tre cose vanno notate, perché sono decisioni e non conseguenze.

**I cinque diritti costano tutti la stessa ora** — 1,44 €, entro due centesimi.
Non per caso: condividono il cambio. Se uno se ne staccasse sarebbe un prezzo
sbagliato, non una scelta, e il banco lo trova.

**Le monete costano un'ora PIÙ CARA dei diritti** (1,50 e 1,74 contro 1,44).
È voluto. Chi sa che cosa vuole deve comprare quella cosa, non la valuta che la
compra: il contrario — monete più convenienti dell'oggetto — è la forma
classica del negozio che ti fa comprare due volte. I due tassi sono 552,8 e
641,3 monete per euro, tutti e due sotto la soglia di 666,7.

**Il cartellino dice le ore.** «Ti risparmia circa 3,3 ore di partite» va
scritto accanto al prezzo. È un'informazione che rende visibile una cosa
scomoda: **1,44 € all'ora è il prezzo a cui questo gioco compra il tuo tempo**,
e per la maggior parte delle persone conviene giocare. Dirlo sul cartellino
d'acquisto è l'esatto opposto di quello che fa il resto del settore, costa una
riga, e non l'ho trovato in nessun gioco per telefono.

Il catalogo intero a monete vale **9.860 monete**, cioè circa **205 partite**
o **10,3 ore**. Oggi sono 5.320 monete e ~110 partite: il percorso raddoppia,
e raddoppia perché il catalogo raddoppia.

---

## 4. Una correzione da fare: la scala dei campi

Non è una richiesta del mandato, ma tocca il listino e va sistemata prima, se
no il listino eredita un'incoerenza.

Oggi i sette campi comprati uno per uno costano
150+400+800+1.500+2.500+4.000+6.000 = **15.350 monete**; il PACCHETTO CAMPI ne
costa **1.330** e li dà tutti. **Undici volte e mezza meno.** È già registrato
come difetto nostro in `_analisi/DIFFERENZE-FC-MOBILE.md`. Chi si guadagna i
campi giocando — cioè esattamente la persona che il patto dice di voler
servire — paga undici volte chi compra la scorciatoia.

Scala proposta: **150 / 250 / 350 / 450 / 600 / 750 / 900 = 3.450 monete**,
pacchetto a 1.330. Il pacchetto sconta il 39%, che è uno sconto da pacchetto.
Il banco verifica tre cose: che la scala salga sempre, che il rapporto stia fra
il 25% e il 60%, e che lo sconto sia lo stesso in monete e in euro entro cinque
punti (39% contro 37%). C'è anche la prova che il controllo sa fallire: sulla
scala di oggi il rapporto è 8,7% e il cancello esce rosso.

---

## 5. I pacchetti a sorpresa

Il mandato chiede di progettarli con probabilità dichiarate, garanzia visibile
e ripiego per i mercati dove sono vietati. Li ho progettati per intero. Poi
alla fine di questa sezione spiego perché consiglio di non spedirli, e
l'argomento non viene dal gusto: viene dal ripiego stesso.

### La forma

**LA BUSTINA DEL CAMPETTO** — 300 monete l'una, **solo a monete**. Ventiquattro
pezzi cosmetici, insieme **chiuso**, **mai un doppione**.

L'insieme chiuso è il fatto da cui dipende tutta l'onestà del resto: un insieme
chiuso ha un costo massimo, e il costo massimo si può scrivere sul cartellino.
**24 × 300 = 7.200 monete, circa 7,5 ore di partite, e poi finisce.**

| livello | pezzi | probabilità dichiarata |
|---|---:|---:|
| comune | 12 | 74,00 % |
| raro | 8 | 21,00 % |
| prezioso | 4 | 5,00 % |

### Le probabilità: dichiarate dove si paga, e quelle VERE

Google Play obbliga a dichiarare le probabilità **prima** dell'acquisto per
qualunque meccanica casuale a pagamento. FC Mobile l'obbligo lo assolve: nel
motore c'è `PACK_ODDS_ENABLED` con due soglie di versione minima per
piattaforma. Ma le mette in un sottomenu. Qui vanno **sulla schermata
d'acquisto**, sopra il bottone, in tabella.

Due dettagli che sembrano pedanteria e non lo sono.

**Le probabilità si contano in decimillesimi interi, non in virgola mobile.**
Non è purismo: `0,70 + 0,20 + 0,10` in JavaScript fa `0.9999999999999999`. La
nostra terna (0,74 + 0,21 + 0,05) per fortuna fa 1 esatto, ma *per fortuna* —
dipende da quali tre numeri hai scelto e da nessuna proprietà che controlli. In
interi la somma è 10000 e non c'è niente da sperare. Il banco lo dimostra
invece di raccontarlo.

**Le probabilità mostrate devono essere quelle VERE, non quelle nominali.** Man
mano che un livello si svuota si pesca fra i rimanenti con probabilità
rinormalizzate: finiti i dodici comuni, il «prezioso» non è più al 5,00%, è al
**19,23%**. Mostrare il 5,00% mentre si pesca al 19,23% è falso, e non per
malizia — è quello che succede se la schermata legge la tabella nominale invece
di ricalcolarla. È una bugia che si spedisce per distrazione, e per questo il
banco la cerca in tutte e sette le combinazioni di scorte.

### La garanzia, e si conta alla rovescia in chiaro

**Al più otto aperture senza un «prezioso»: alla nona è certo.** Il contatore
sta sulla schermata d'acquisto — «prezioso garantito fra 3 aperture» — non in
un sottomenu e non in una nota.

Il banco verifica tre cose, e la terza è quella che si sbaglia:

- con il sorteggio più sfavorevole possibile (uno che non regala mai un
  prezioso) la garanzia scatta comunque: corsa massima senza prezioso = 8;
- scatta alla **nona** apertura e non all'ottava — il numero scritto sullo
  schermo è quello vero, non uno arrotondato per generosità;
- il contatore mostrato resta fra 0 e 8 per tutta la collezione, mai sotto e
  mai sopra.

**Quanto vale la garanzia, misurato.** Senza garanzia il primo «prezioso»
costerebbe in media 1/0,05 = 20 aperture. Con la garanzia, misurato su 20.000
collezioni con generatore riproducibile: **7,37 aperture**, cioè **2.210
monete**, cioè **circa 2,3 ore di partite**. La garanzia più che dimezza
l'attesa, e il numero da scrivere sul cartellino è 7,4 — non 20, e non «hai una
possibilità su venti», che è la formulazione che fa spendere.

### Belgio e Paesi Bassi — con una rettifica

Il mandato dice: «in Belgio e Paesi Bassi la vendita di pacchetti casuali è
vietata». **È vero per il Belgio e superato per i Paesi Bassi**, e questo
progetto rettifica in chiaro.

- **Belgio.** La Commissione dei giochi d'azzardo, nel rapporto dell'aprile
  2018, ha concluso che i pacchetti casuali a pagamento rientrano nella legge
  sui giochi d'azzardo e quindi richiedono una licenza che nessun editore di
  videogiochi ha. Gli editori hanno disattivato la vendita in Belgio anziché
  chiederla. **Sostanzialmente vietato: sì.**
- **Paesi Bassi.** L'autorità di vigilanza (Kansspelautoriteit) aveva multato
  EA nel 2019, ma il Consiglio di Stato olandese ha **annullato la sanzione il
  9 marzo 2022**, stabilendo che un pacchetto casuale interno a un gioco non è
  un gioco d'azzardo autonomo. Quindi oggi **non è vietato**, ed è oggetto di
  iniziative legislative che vanno e vengono.
- **Da riverificare prima di pubblicare.** Le fonti di questo paragrafo sono di
  seconda mano e il quadro europeo si muove. Non è un dato su cui costruire un
  prodotto senza ricontrollarlo alla data della pubblicazione.

Detto questo: la conclusione **ingegneristica non cambia**, perché il ripiego
non costa niente e trattare i Paesi Bassi come il Belgio è gratis.

### Il ripiego: LA BACHECA

Dove la bustina non si può vendere — e dove **non si sa dove sia il
giocatore** — al suo posto c'è la bacheca: **gli stessi ventiquattro pezzi, lo
stesso prezzo di una bustina (300 monete), e scegli tu.**

Costo pieno identico: 7.200 monete da tutte e due le parti. Un ripiego che
costasse di più sarebbe una tassa sul domicilio; uno che costasse di meno
renderebbe la bustina una trappola per tutti gli altri. Costare uguale è
l'unica risposta che non chiede scuse a nessuno.

Il Paese arriva da `getBillingConfigAsync` di Play — è il Paese di
**fatturazione**, cioè quello che decide la legge applicabile, e non costa
nessun permesso. Non dalla lingua del telefono (è una preferenza) né dalla SIM
(è un viaggio). Quando non si sa, resta `null`, e la regola è: **senza Paese si
mostra la bacheca.** Sbagliare verso la bacheca non toglie niente a nessuno;
sbagliare verso la bustina vende un prodotto vietato.

### Perché consiglio di non spedire la bustina

Progettando il ripiego è venuto fuori un numero che decide la questione.

Per chi vuole **un pezzo preciso**: la bacheca costa **300 monete**; la bustina
ne costa in media **2.210** (misurato, sezione sopra). Sette volte tanto.
Per chi vuole **tutto**: costano **esattamente uguale**, 7.200 monete.

Cioè: la versione deterministica è **uguale nel caso peggiore e sette volte
migliore nel caso normale**. Non è un ripiego, è la versione migliore. E
dobbiamo costruirla comunque per due Paesi.

A quel punto la bustina resta in piedi per una ragione sola — la sorpresa — e
ne costa tre: rompe una promessa scritta dove il giocatore la legge («niente
casse premio», riga 2718), aggiunge una superficie di conformità che va
riverificata a ogni cambio di legge in ogni mercato, e mette il gioco nella
categoria «contiene oggetti casuali» sulla scheda di Play, che è la stessa
etichetta di FC Mobile.

**Raccomandazione: spedire la bacheca ovunque, e tenere la bustina scritta e
provata ma spenta.** Il codice c'è, il banco la copre, e riaccenderla è un
pomeriggio se il committente decide diversamente. Se resta spenta, cadono anche
le voci 6 e 7 del listino — perché senza un pozzo ricomprabile le monete non
hanno più bisogno di tagli — e la spesa massima nella vita del gioco torna a
3,99 €, cioè esattamente il patto di oggi con un bottone che funziona.

---

## 6. Il tetto di spesa auto-imposto

Il tetto è **doppio**, e quello che conta non è quello in euro.

### Il tetto di magazzino, che è quello vero

**Non si vendono monete che non hanno un pozzo.**

Prima di offrire un taglio si calcola il **residuo**: quanto costa ancora, in
monete, tutto ciò che non possiedi, **sulla strada più economica**. Se hai già
più monete del residuo, il taglio non si vende. Quando il residuo è zero, la
voce sparisce dal negozio e al suo posto c'è una riga: *non c'è più niente da
comprare*.

Perché è meglio di un tetto in euro: un tetto in euro dice «puoi rovinarti fino
a qui». Il tetto di magazzino dice «non c'è niente da comprare», che è una
frase vera e non una concessione. E rende l'eccesso di spesa **impossibile per
costruzione**, non semplicemente limitato — cosa che a FC Mobile non è
accessibile nemmeno volendo, perché il suo catalogo si rinnova dal server e non
finisce mai.

Due dettagli che il banco ha imposto:

- **«strada più economica» va preso alla lettera.** Se mancano tutti e quattro i
  pezzi, il residuo conta 2.660 (il completo) e non 5.320 (la somma). Contando
  la somma venderemmo il doppio delle monete necessarie.
- **lo scarto ammesso è un taglio MINIMO, non un taglio qualunque.** La prima
  stesura della regola diceva solo «hai meno monete del residuo». Con 9.700
  monete in mano e 9.860 di residuo, quella regola lascia passare una cassetta
  da 3.200 e lascia 3.040 monete morte — e su quella fessura la ricerca
  esaustiva del banco ha trovato una strada da **25,90 €**, cioè sopra il tetto
  che avevo scritto. La regola corretta è: si vende un taglio solo se lascia
  meno di un taglio minimo di monete inutilizzabili. **Questa correzione l'ha
  trovata la prova, non io.**

### Il tetto in denaro, che è la cintura di sicurezza

**24,99 € in tutta la vita del gioco.**

Non deve mordere mai. Il banco cerca **esaustivamente** la strada più cara che
il tetto di magazzino consente — tutti i sottoinsiemi di diritti, tutte le
sequenze di tagli — e trova **22,90 €** (via «campi+divise», poi solo
sacchetti). Il margine è 2,09 €. Se un giorno il catalogo cresce e nessuno
rifà il conto, questa riga diventa rossa prima che diventi rosso un giocatore.

Serve per due casi. Il primo è quello: il catalogo che cresce senza che nessuno
guardi. Il secondo è quello che nessuno vuole nominare — la carta del padre in
mano a un bambino per un pomeriggio — e per quel caso il tetto di magazzino fa
già quasi tutto, perché dopo 22,90 € non c'è più niente da vendere. FC Mobile,
per lo stesso problema, ha un apparato intero: `mtxspendlimit`,
`singlepurchasespendlimit`, `PurchaseLimitReachedException`,
`AGE_VERIFICATION_ENABLED`, `UNDER_AGE`, `BLACKLIST_DEVICE_WARN_MTX_ENABLED`.
Con un catalogo finito, tutto quell'apparato non serve.

### Perché conviene anche a noi

- **I rimborsi.** Gli acquisti dei minori sono la prima causa di rimborsi e
  contestazioni di addebito su Play, e ogni contestazione è denaro e reputazione
  presso il fornitore di pagamento. Un tetto a 24,99 € limita l'esposizione a
  una cifra che nessuno contesta.
- **La conformità.** Meno apparato da mantenere, meno cose da riverificare a
  ogni cambio di regole.
- **È una promessa verificabile.** «In questo gioco non si possono spendere più
  di 24,99 €» è una frase che si può scrivere sulla scheda di Play e che un
  banco dimostra. Non ne conosco altre così, e in un mercato dove la recensione
  in evidenza di FC Mobile dice *«it's a micro transaction nightmare»* è la cosa
  che ci distingue meglio di qualunque schermata.
- **La spesa si vede dentro il gioco.** Sulla bacheca del negozio: «hai speso
  12,98 € in questo gioco; ne restano 12,01 prima del tetto». Nessun gioco
  gratuito mostra quanto hai speso. Costa una riga.

---

## 7. Offline

Il mandato dice «deve poter funzionare anche offline». La risposta precisa è:
**comprare no, consegnare sì**, e la distinzione è tecnica, non retorica.

### Il negozio a monete funziona **sempre**

Ed è già così oggi: la bacheca la costruisce `buildNegozioUI` leggendo una
costante del file, e il saldo viene dal salvataggio locale. Il collaudo
`senza-rete.js` apre il gioco con ogni richiesta bloccata e non se ne accorge.
FC Mobile non può fare questo: il suo catalogo e i suoi prezzi arrivano dal
server (`commerce_getItemPriceWithCurrency`, «Cannot purchase while items
refreshing.»), e ha codici d'errore dedicati al negozio che non risponde.
**Questa parte non deve cambiare di una virgola.**

### Gli acquisti in denaro no, e la schermata lo dice in una riga

```
Senza rete non si può pagare. Quello che è già tuo resta tuo,
e le monete guadagnate si spendono lo stesso.
```

Una riga, un motivo, e sotto il negozio a monete aperto e funzionante. Quello
che **non** deve succedere: nessuna rotella che gira, nessun tentativo
automatico ripetuto, nessun riquadro modale, nessun bottone che sembra premibile
e non fa niente. Il bottone in euro è **spento**, non «in caricamento». Il
banco lo verifica: premerlo lo stesso restituisce un rifiuto immediato e non
apre niente.

### Ma la CONSEGNA di un acquisto vecchio funziona senza rete

`queryPurchasesAsync` interroga **l'app di Play sul telefono**, non la rete: la
risposta viene dalla sua cache locale. Quindi un acquisto fatto ieri in
stazione si consegna oggi in galleria, con zero tacche. È questo il fatto su
cui poggia la risposta al mandato, ed è anche il caso più frequente del
guasto che la coda esiste per riparare.

---

## 8. Il consumo degli acquisti — perché un acquisto pagato non si perde

Il guasto: chi paga, Google incassa, e l'app muore prima di aver accreditato.
Senza una coda quell'acquisto è perso — e dopo **tre giorni** Google rimborsa
d'ufficio l'acquisto non riconosciuto, cioè il guasto si chiude da solo, tardi,
e nel modo che fa più danno alla fiducia.

### L'ordine, ed è l'unica cosa da ricordare

> **1. ACCREDITA  →  2. SALVA  →  3. CHIUDI con Play**

In quest'ordine perché **uno solo dei due errori possibili è recuperabile**:

- *accreditato due volte* si impedisce con una chiave di unicità — il
  `purchaseToken`, che Play garantisce unico;
- *consumato senza aver accreditato* non si recupera in nessun modo: il gettone
  sparisce dall'elenco di Play e non resta niente da rigiocare.

Quindi si sbaglia sempre dalla parte che si può correggere. Il lato Java non
consuma e non riconosce niente di sua iniziativa: aspetta che il gioco chiami
`chiudi(gettone)`, e il gioco lo chiama solo dopo aver scritto.

### Dove si salva, e qui c'è una trappola già pagata

**Non nel `localStorage`.** In una WebView Chromium il `localStorage` si scrive
su disco **in differita**: un processo ucciso mentre l'app è in primo piano
perde gli ultimi secondi. È stato misurato in questo progetto con
`am force-stop` (memoria «apk-android-senza-gradle»). Un registro di acquisti
che perde gli ultimi secondi è esattamente il guasto che si voleva impedire.

La copia **durevole** sta in `SharedPreferences` dal lato Java, scritta con
`commit()` (sincrono) e non `apply()` (differito). Il `localStorage` resta la
copia veloce, e quando le due divergono vince Java.

### I quattro stati, e sono quattro perché quattro sono i modi di morire a metà

| stato | significa |
|---|---|
| `attesa` | Play dice PENDING (pagamento in contanti in cartoleria): **non si accredita niente** |
| `visto` | Play lo elenca, noi non abbiamo ancora dato niente |
| `consegnato` | accreditato **e** salvato; Play non lo sa ancora |
| `chiuso` | Play ha consumato o riconosciuto: la pratica è finita |

La riconciliazione gira **a ogni avvio e a ogni ritorno in primo piano**, non
solo dopo un acquisto, ed è idempotente per costruzione.

### I casi che il banco copre, e che sono i casi veri

- lo stesso gettone consegnato tre volte accredita **una volta sola**;
- l'app muore fra consegna e consumo: al riavvio **non** si riaccredita, ma
  **si ritenta la chiusura** — se no scatta il rimborso d'ufficio a tre giorni;
- per ogni gettone la consegna viene **prima** della chiusura, verificato
  sull'ordine reale delle chiamate;
- se la scrittura del registro si perde, si **riaccredita**: si sbaglia dalla
  parte recuperabile;
- un acquisto in attesa non accredita niente, ma resta annotato così la
  schermata può dirlo;
- un gettone **mai visto prima** si consegna (è il caso «app reinstallata» /
  «cambiato telefono», e ignorarlo significa aver preso i soldi senza dare
  niente);
- righe malformate nell'elenco di Play si saltano e **non fermano** le consegne
  buone che vengono dopo.

### Il rovescio, e va detto

Il ripristino su un altro telefono funziona **solo** se l'acquisto passa da
Play, perché è Play a ricordarselo. Le monete e i progressi no: quelli vivono
in `localStorage` e nel `SharedPreferences` di questo telefono, e se si
cancellano i dati dell'app non c'è nessun posto da cui riprenderli. È già vero
oggi (`_analisi/DIFFERENZE-FC-MOBILE.md`, voce «Ripristino degli acquisti su un
altro telefono»), e la rete anonima di `rete/LEGGIMI.md` — con il codice di
dodici caratteri da copiare — è la strada per cui questo si risolve, non i
pagamenti.

---

## 9. Che cosa non ho potuto verificare

- **Niente che riguardi un acquisto vero.** Non c'è l'account sviluppatore
  Google (25 $, non ancora comprato): senza Play Console i sette prodotti non
  esistono, `queryProductDetailsAsync` torna una lista vuota, e non esiste più
  nemmeno un codice di prova statico (tolti dalla libreria di fatturazione dalla
  versione 3). Il dettaglio sta in `android/pagamenti/LEGGIMI.md`, sezione 8.
- **`Pagamenti.java` non è mai stato compilato.** L'AAR della libreria non è nel
  deposito e la catena non tocca la rete. Il file è scritto rispettando la
  trappola di d8 già documentata (solo classi di primo livello, solo tipi
  grezzi), ma «rispetta la regola» non è «compila».
- **Il peso dell'APK con la libreria dentro.** Non c'è un numero, perché non
  l'ho misurato e non volevo mettere una stima accanto a misure vere.
- **Le 48 monete a partita.** È una taratura dichiarata in un commento del
  codice, non una misura su partite giocate. Tutte le ore di questo documento
  ereditano quell'incertezza, e vanno rimisurate con `strumenti/_q-monete-prova.js`
  su un campione vero prima di stamparle su un cartellino.
- **Il quadro legale di Belgio e Paesi Bassi** è di seconda mano e datato al
  marzo 2022 per l'annullamento olandese. Va ricontrollato alla data della
  pubblicazione.
- **Che il collaudo d'equità passi davvero.** Non l'ho eseguito, e come scritto
  nella sezione 1 oggi gira senza `--conf-b`, cioè misura un'altra cosa.

---

## 10. In sintesi, per chi legge solo questo

1. Si vendono **tempo** (monete) e **aspetto** (cosmetici), e il vincolo va
   letto nella forma stretta: *un euro può entrare solo in un pozzo che il
   collaudo d'equità sorveglia*. La rosa non si compra in nessuna forma.
2. **Una valuta**, e un cambio con una soglia: nessun taglio di monete può dare
   più di 666,7 monete per euro, se no il cartellino in euro diventa una
   trappola.
3. **Sette voci**, prezzi da 0,99 a 4,99 €, e sul cartellino ci sono anche le
   ore di partite che si risparmiano — compreso quando la risposta onesta è
   «non comprare, gioca».
4. **Il tetto vero è di magazzino**: non si vendono monete che non hanno un
   pozzo. Quello in denaro (24,99 €) è una cintura, e il banco dimostra che non
   morde: la spesa massima possibile è 22,90 €.
5. **Le bustine sono progettate e provate, e consiglio di tenerle spente**,
   perché la loro alternativa deterministica costa uguale a chi vuole tutto e
   sette volte meno a chi vuole una cosa sola.
6. **Offline**: il negozio a monete sempre; pagare no, con una riga sola; ma la
   consegna di un acquisto vecchio sì, anche a zero tacche.
7. **Accredita, salva, chiudi** — in quest'ordine, con la copia durevole in
   `SharedPreferences` e non nel `localStorage`.
8. **Prima di tutto il resto**, si collega il collaudo d'equità.
