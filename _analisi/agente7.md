I have everything I need. Writing the report.

# CONFINI LEGALI DI CALCETTO

## 0. Cosa ho misurato davvero, e cosa no

**Misurato** (strumenti eseguiti, output letto):

| Cosa | Come | Esito |
|---|---|---|
| I nomi che il gioco **pronuncia in partita** | `node _nomi.js` (Playwright, gioco vero, 3 taglie) | 32 nomi letti in campo |
| Lo **spazio completo** dei nomi generabili | `node _z-legale-nomi.js` (sonda che ho scritto io, chiama le funzioni vere dentro la pagina) | 137 nomi, 10 squadre, 8 campi, 8 sponsor, 15 trofei, 8 divise, 5 voci di negozio |
| Tutte le stringhe maiuscole del file, esclusi commenti e base64 | script node | 272 candidate, spogliate a mano |
| Marchi reali nel sorgente | grep su 46 termini (fifa, uefa, serie a, juventus, messi, nike, konami…) | 0 nel testo visibile |
| Risorse incorporate | grep `data:` | 2 font woff2, 2 SVG; **0 immagini di terzi, 0 campioni audio** |
| Audio | grep `createOscillator` / `data:audio` / `.mp3` | 11 oscillatori (righe 7214–7446), **zero registrazioni** |
| Rete a runtime | grep URL | **zero** (2 stringhe sono il namespace SVG del W3C) |
| Dipendenze dell'APK | `android/Gioco.java`, `classes.dex` | solo `android.*` — **zero SDK di terzi** |
| Dominio `dopolavoro.it` | `nslookup` | **risolve a 46.37.14.14** — registrato da terzi |
| Licenze dei font | OFL.txt canonici da google/fonts | OFL 1.1, **nessun Reserved Font Name** su nessuno dei due |

**NON misurato**, e va detto:
1. **Nessuna ricerca di anteriorità sui registri.** UIBM, EUIPO/TMview, WIPO Madrid, USPTO: TMview vuole POST, Justia mi ha risposto 403, eSearch dell'EUIPO è una SPA che non si lascia leggere. Tutto quello che dico sui marchi altrui sotto è ragionamento, non un estratto di registro. Una clearance vera è un lavoro a pagamento, e su questo progetto **non è mai stata fatta**.
2. Non ho verificato se i due woff2 **sottoinsiemizzati** conservino i campi `name` 13/14 (licenza) — servirebbe fontTools, non l'ho eseguito.
3. Non ho controllato le regole Play su privacy policy e Play Billing (adiacenti alla monetizzazione, fuori dal mandato).
4. Non sono un avvocato. Questo è un tracciamento di confini per orientare il lavoro, non un parere legale.

---

## 1. COSA È PROTETTO

**Nomi e immagini dei calciatori.** Doppio strato: diritto all'immagine e al nome (in Italia artt. 6–10 c.c., art. 8 CPI per i *nomi notori* — registrabili come marchio solo dall'avente diritto), e negli USA il *right of publicity*. La cosa da capire è che **il nome non serve**: in *Keller v. Electronic Arts* (9th Cir. 2013) EA aveva tolto i nomi e usava solo numero di maglia, altezza, peso, incarnato, stato di provenienza, ruolo — e ha perso lo scudo del Primo Emendamento, perché "ricreare l'atleta nel contesto in cui è diventato famoso" non è trasformativo. Stesso ragionamento in *No Doubt v. Activision*. **La soglia è l'identificabilità, non il nome.**

**Stemmi e loghi di club.** Marchi registrati, spesso anche figurativi 3D. Zero ambiguità.

**Nomi dei club.** Registrati come marchi denominativi. Il caso di scuola è *Manchester United v. Sega/Sports Interactive* (2020): SI sosteneva di **non** aver bisogno di licenza per il solo nome, e non c'è mai stata una sentenza — nell'agosto 2021 hanno transatto e Football Manager ha smesso di scrivere "Manchester United". Lezione: sul nome del club **il diritto è discutibile, ma l'esito pratico lo decide chi può permettersi la causa**, e non sei tu.

**La parola FIFA.** È un marchio, non un genere. EA la usava sotto licenza; quando la FIFA ha chiesto oltre 1 miliardo di dollari per ciclo quadriennale, EA ha rinominato tutto in **EA Sports FC** (2023) tenendosi 19.000 atleti, 700 club, 100 stadi e 30 campionati — cioè ha pagato tutto tranne quelle quattro lettere. Se le quattro lettere valgono da sole quel prezzo, non le si scrive per sbaglio.

**Nomi di competizioni.** "Champions League", "Serie A", "Coppa Italia", "World Cup", "Premier League": marchi.

**Il trofeo della Coppa del Mondo.** Marchio tridimensionale (fra gli altri, MUE 009113391). La **forma** è protetta, non solo il nome. Vale per la "coppa dalle orecchie grandi" della UEFA.

**Divise reali.** Cumulativamente: marchio figurativo (il kit come segno), disegno o modello comunitario, marchio di fatto. Il precedente italiano è **Juventus**: il Tribunale di Torino ha tutelato la maglia a strisce bianconere come **marchio di fatto** ("Be The Stripes"), affermando che la distintività non si perde per il fatto che altre squadre usino strisce simili.

**Stadi reali.** Diritto d'autore sull'opera architettonica. Non è teoria: EA compra le licenze degli stadi e le annuncia ogni anno. L'esterno visibile dalla strada gode in alcune giurisdizioni di libertà di panorama; **l'interno no**, ed è proprio l'interno che un gioco di calcio riproduce.

**Inni, cori, suoni di stadio.** Doppio diritto: composizione (autore) + registrazione (produttore). Esistono librerie che vendono cori e ambienze di stadio proprio per uso commerciale — il che dimostra che il diritto c'è e ha un prezzo. Un coro popolare "di dominio pubblico" spesso non lo è: la melodia lo può essere, l'incisione mai.

**Telecronaca.** La voce del telecronista è una prestazione d'artista + diritto all'identità vocale. Il *testo* delle frasi, se originale, è opera.

**I font.** Distinzione che manda fuori strada quasi tutti: **il disegno del carattere (typeface) negli USA non è protetto da copyright; il file di font sì, come software.** In UE il disegno può essere protetto come disegno/modello. Conseguenza pratica: ridisegnare a mano lettere che *assomigliano* a un carattere è generalmente lecito; copiare il file non lo è mai.

**Il codice, la grafica, i suoni, i testi di un gioco concorrente.** Vedi *Tetris Holding v. Xio* (D.N.J. 2012): Xio aveva riscritto tutto da zero e ha perso lo stesso, perché aveva copiato le dimensioni del campo, l'aspetto dei pezzi, il pezzo-ombra, l'anteprima del prossimo pezzo, il cambio colore all'appoggio. **L'espressione visiva concreta è protetta anche quando il codice è tuo.**

---

## 2. COSA NON È PROTETTO

**Le regole del calcio.** Le Laws of the Game dell'IFAB descrivono un metodo di gioco. Il *testo* del regolamento è un'opera letteraria (non lo si ricopia), ma **fuorigioco, rigore, calcio d'angolo, rimessa, cartellini, 11 contro 11, 90 minuti** non appartengono a nessuno. In Italia la base è l'art. 2 l.d.a.: si protegge la forma espressiva, non l'idea né il metodo.

**Le meccaniche di gioco.** Confermato da tutta la giurisprudenza: mechanics e rules non sono coperti. *Tetris* protegge l'espressione **proprio perché** riconosce che l'idea non lo è.

**Gli schemi di comando e i nomi dei comandi.** *Lotus v. Borland* (1st Cir. 1995, confermato da una Corte Suprema divisa 4-4): una gerarchia di comandi è un **metodo di operazione**, non copyrightabile. Il set di operazioni disponibili e il modo in cui si attivano non si proteggono. *Apple v. Microsoft* ha respinto la teoria del "look and feel" della GUI in blocco.

**Le formazioni e i moduli.** 4-4-2, 3-5-2, catenaccio, gegenpressing: strategie, cioè idee.

**I termini generici del calcio.** Tiro, cross, filtrante, contrasto, scivolata, pressing, sombrero, rovesciata, golden goal, portiere, capitano. E anche i termini tecnici in inglese quando sono descrittivi: *jockey*, *sprint*, *through ball*, *lofted pass*, *sliding tackle*.

**Le combinazioni di colori come tali**, in astratto. AC Milan ha un marchio sullo **stemma**, e ha anche perso un tentativo di registrazione internazionale davanti al Tribunale UE per un conflitto anteriore in Germania. Non risulta — e non ho trovato traccia — di un diritto esclusivo del Milan sul rosso-nero in sé, e non potrebbe averlo: Foggia, Rimini, Casale e decine di altri lo usano da un secolo.

**Il disegno del pallone bianco a pentagoni.** Icosaedro troncato, 1970, ormai *scènes à faire*: se togli i pentagoni, a diciotto pixel non è più un pallone.

**Nomi di luogo, di quartiere, parole comuni della lingua** usate come nomi di squadra immaginaria.

---

## 3. IL CONFINE, SULLE COSE AMBIGUE

**Una divisa a strisce bianconere.** Questo è il caso peggiore che potevi scegliere, ed è quello dove il confine è più netto. Bianconero a strisce verticali, in Italia, su una maglia da calcio, **è un marchio di fatto tutelato**, e il Tribunale di Torino l'ha detto in chiaro. Il confine non passa per il colore: passa per **quanti segnali convergono**. Strisce bianconere + nome che allude a Torino + 11 giocatori + un logo con una stella = un giudice ci arriva in trenta secondi. Strisce bianconere sole, in una tavolozza di otto divise dove ce ne sono altre sette, senza stemma né nome né città, sono un capo d'abbigliamento come un altro. **Regola: nessuna combinazione di colori è vietata; è vietato l'insieme dei segnali che punta a un club.**

**Un nome inventato che assomiglia a uno vero.** Il metro è *Keller*: **identificabilità**. "Cristian Ronardo" con la maglia 7, portoghese, punizione a piedi larghi: identificabile, e il fatto che il nome sia storpiato peggiora le cose perché prova l'intenzione. "Gigi" da solo, su un tizio senza volto in una squadra di quartiere: nessuno. Il confine è la **convergenza di indizi**: nome-eco + ruolo + numero + nazionalità + gesto tecnico distintivo + squadra. Uno solo di questi è rumore. Tre insieme sono un ritratto.

**Il layout di un'interfaccia.** *Lotus* e *Apple v. Microsoft* dicono che l'**organizzazione funzionale** — quali comandi ci sono, come si raggiungono, la gerarchia dei menù — non si protegge. Ma *Tetris* dice che gli **elementi espressivi concreti** dello schermo sì: le icone disegnate, le proporzioni scelte, i colori esatti, le animazioni. Il confine: *"a sinistra lo stick, a destra due bottoni contestuali"* è libero; *"lo stesso bottone, con lo stesso smusso, lo stesso ambra, lo stesso anello a 4 px"* non lo è.

**La disposizione dei pulsanti.** Libera, e per una ragione più forte del diritto d'autore: sui touch è **dettata dal pollice**. Stick a sinistra e azioni a destra è ergonomia, non espressione — è la definizione di *merger*: se c'è un solo modo sensato di esprimere l'idea, l'espressione non si protegge.

**Il vocabolario di FC 25** (rilevante per le prossime onde). *Lotus* vi protegge sui nomi dei comandi: sono metodo di operazione. Ma il confine non è il copyright, è il **marchio**: EA registra i nomi delle *feature* (Ultimate Team, HyperMotion, PlayStyles). Quindi: **"filtrante", "contenimento", "primo tocco" si possono usare tutto il giorno; un nome di feature coniato da EA e messo su un bottone è un'altra cosa.** E c'è un secondo confine, non legale ma commerciale: prendere l'intero set terminologico di FC 25 dentro l'interfaccia trasforma il gioco da "gioco di calcio" a "clone di FC" agli occhi di chiunque, incluso un revisore dello store.

---

## 4. CONTROLLO DI CALCETTO — I REPERTI

### Quello che ho letto (misurato, non riassunto)

**10 squadre** `CALCETTO-il-gioco.html:6881-6892` — GASOMETRO, MOLO 4, BORGO ALTO, CASE NUOVE, PONTE ROSSO, SANTA FURIA, PRATI BASSI, TORRE VECCHIA, STAZIONE FC, MERCATO VERDE. Più DOPOLAVORO (la tua, `:7081`) e DOPOLAVORO F.C. sul tabellone di casa (`:2296`).

**137 nomi di giocatori** generati e letti, non promessi. In campo, oggi: *Genny Sciolto, Alvaro Scarpetta, Bruno il Ragioniere, Memmo Zero Fiato, Gigi Freddo* contro *Nello il Geometra, Duilio Tacco Fino, Tonino Buonanotte, Walter Pettochiaro, Silvio Testadura*. Il serbatoio è 36 nomi propri (`:6936-6940`) × 30 soprannomi (`:6954-6959`) = 1.080 combinazioni.

**8 campi** `:6522, 6724, 6731, 6752, 6759, 6766, 6778, 6788` — L'ORATORIO, IL CORTILE, LA GABBIA, LA SPIAGGIA, IL PARCHEGGIO, LA PALESTRA, IL TETTO, IL TORNEO NOTTURNO.

**8 sponsor** `:15987` — BAR ROXY, OFFICINA GG, PIZZA DA NELLO, CAFFÈ ORBITA, FERRAMENTA BEA, TRASPORTI DINO, GOMME 2000, FORNO LUNA.

**15 trofei** `:6906-6922` e **7 sagome di coppa** `:13976-13983` — coppa, calice, scudetto, sfera, stella, anfora, obelisco.

**8 divise** `:6806-6872`.

### Il verdetto

**Non ho trovato un solo nome reale di calciatore, squadra, stadio, competizione, sponsor o federazione nel testo che il giocatore vede.** Zero. Le squadre sono toponimi di quartiere, i giocatori sono nome proprio + soprannome descrittivo inventato (nessun cognome d'anagrafe), i campi sono luoghi comuni, gli sponsor sono botteghe di paese. Le coppe non somigliano né al trofeo della Coppa del Mondo (due figure che reggono la Terra) né a quella della UEFA (le anse smisurate): le anse qui **nascono sul labbro** e salgono di poco (`:13776`), che è la coppa da torneo di parrocchia. L'icona dell'app è geometrica astratta. Il pallone è bianco con un pentagono (`:22843-22862`), cioè l'archetipo. L'audio è sintetizzato con 11 oscillatori: **non esiste un solo campione di folla, coro o telecronaca nel file**. La rete non viene mai toccata. Nell'APK non c'è una sola libreria di terzi.

Detto in una riga: **il progetto è, sul piano dei contenuti, già pulito.** I reperti che seguono non sono contaminazioni di contenuto — sono tre buchi di *igiene legale* e due ambiguità di grado.

### R1 — I font sono in regola per licenza, ma la licenza non viaggia con loro `:17-30`

Archivo Black e Barlow Condensed sono OFL 1.1 (verificato sugli OFL.txt canonici di google/fonts). **Nessuno dei due ha un Reserved Font Name** — quindi i sottoinsiemi da 14.332 e 7.636 byte incorporati nel file, che sono a tutti gli effetti *Modified Versions* (FAQ 2.6: sottoinsiemizzare è modificare), possono legittimamente conservare i nomi di famiglia. Fin qui tutto bene.

Il problema è cosa accompagna i byte. Oggi ci sono tre righe di commento e un URL. La FAQ ufficiale OFL, **domanda 1.20, parla proprio delle app mobili**: *"you must comply with the terms of the license. At a minimum you must include the copyright statement, the license notice and the license text."* La 1.10 ammette il solo link **quando sta nei metadati del font stesso** — e non ho verificato che i woff2 sottoinsiemizzati conservino quei campi.

In più le due righe di attribuzione non sono gli avvisi canonici:
- il file scrive `Archivo Black © Omnibus-Type`; l'avviso è `Copyright 2017 The Archivo Black Project Authors (https://github.com/Omnibus-Type/ArchivoBlack)`
- il file scrive `Barlow Condensed Bold © Jeremy Tribby`; l'avviso è `Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow)`

**È l'unico punto in cui il progetto è oggi fuori da un obbligo che ha già accettato.** Costa un file di testo e una schermata.

### R2 — Il package è `it.dopolavoro.calcetto`, e dopolavoro.it è di qualcun altro

`android/lavoro_calcetto/AndroidManifest.xml:3`. La convenzione reverse-DNS afferma il controllo del dominio. `nslookup dopolavoro.it` → **46.37.14.14**, attivo, con un certificato che serve `aportatadimouse.it`. Non è violazione di marchio (`dopolavoro` è parola comune e Google non verifica i domini), ma:
- **l'`applicationId` è immutabile dopo la prima pubblicazione su Play.** Per sempre.
- se un giorno il titolare di dopolavoro.it vuole pubblicare un'app, si trova il namespace occupato — ed è la situazione da cui nascono le lettere degli avvocati.

Costo di riparazione **oggi**: cinque minuti. Costo dopo la pubblicazione: si ripubblica come app nuova e si perdono installazioni, recensioni e posizionamento.

### R3 — ROSSONERO: righe verticali rosso-nere con addosso il soprannome del Milan `:6871`

`{ nome:'ROSSONERO', c1:'#ff6a4d', c2:'#1c1c1c', pat:1 }`, e `pat 1` è **palato, cioè righe verticali** (`:6805`, `:29790`). È l'unica cosa in tutto il gioco che punta verso un club vero, e ci punta con due segnali che convergono: la geometria e la parola.

Poi però mi fermo e conto onestamente in senso opposto: *rossonero* è un aggettivo della lingua, condiviso da Milan, Foggia, Rimini, Casale e altre; `#ff6a4d` è un corallo aranciato, non il cremisi del Milan; non c'è stemma, non c'è la parola Milano, non c'è nulla che leghi la maglia a una città. **Il rischio reale è basso.** Ma è l'unico gancio verbale del gioco, e toglierlo costa una parola — CARBONE, BRACE, FUOCO, PECE — senza spostare un pixel. Confronta con il costo della riga d'erba che sta 80 righe sopra, dove per due decimi di luminanza si è scritta mezza pagina di misure.

Nota di controllo: **non esiste una divisa a strisce bianconere nel gioco.** BIANCO è `pat 2`, cioè fascia trasversale, con c2 `#3c4a42` verde-grigio scuro. Il caso più pericoloso non è presente.

### R4 — 13 menzioni di prodotti concorrenti, spedite dentro l'APK

Righe `4983, 5037, 9186, 11311, 11313, 11424, 20043, 20312, 22847, 23132, 24232, 24902, 25365`: Soccer Stars (8 volte), Head Ball 2 (2), Rocket League (2), Score Match, eFootball.

Sono tutte in commento, tutte riferimenti di progettazione, e **non sono un illecito**: citare per riferimento non è uso del marchio in commercio. Ma leggile come le leggerebbe un avversario in causa: *"la ricetta di Soccer Stars: base quasi bianca, pentagono più piccolo, velo d'ombra dimezzato"* (`:22847`), *"in Soccer Stars la pedina attiva ha un anello ciano"* (`:24232`). Sono confessioni scritte di aver copiato una scelta visiva concreta di un prodotto identificato — e le scelte visive concrete sono esattamente ciò che Xio ha perso in *Tetris*. Il file HTML **viaggia in chiaro dentro l'APK**, decomprimibile da chiunque con `unzip`.

La conclusione giusta non è cancellare i commenti — sono documentazione di valore e cancellarli sarebbe distruggere il lavoro. È **riformularli sul fatto, non sul concorrente**: *"un pallone bianco con pentagono al 33% del raggio si legge a diciotto pixel; al 40% no"* dice la stessa identica cosa, è più utile a chi legge, e non nomina nessuno.

### R5 — BAR ROXY `:15987`

L'unico degli otto sponsor con un aggancio a un marchio forte (Roxy/Boardriders, abbigliamento, classe 25). Rischio molto basso: classi merceologiche diverse, "Bar Roxy" è il nome di trecento bar italiani veri, il contesto è chiaramente finzione. **Ma non ho fatto una ricerca sui registri** e non posso dire di più. Se un giorno si vuole dormire tranquilli costa una parola: ROXI, ROSY, RITA.

### R6 — Due scelte di tono, nessun problema legale

**MANI PULITE** (`:6911`) è il nome dell'inchiesta del 1992. Nessuno la possiede, ma in Italia il nome arriva prima del gioco di parole sulle rubate. **DOPOLAVORO** porta un'eco dell'Opera Nazionale Dopolavoro (1925-45), anche se oggi la parola è usata neutralmente ovunque. Segnalo perché è una decisione da prendere consapevolmente, non da scoprire in una recensione.

### R7 — Nel repo non esiste un file di licenza, un avviso di copyright, o una schermata crediti

Verificato: nessun `LICENSE`, `NOTICE`, `THIRD-PARTY`; zero occorrenze di "copyright", "licenza", "diritti" in `README.md`, `COME-INSTALLARE.md`, `PUNTO-DEL-LAVORO.md`. Un gioco che deve essere monetizzabile senza dovere niente a nessuno **deve poterlo dimostrare**, e oggi non ha il foglio in mano.

Nota adiacente: "CALCETTO" è generico. Su Play esistono già Ryval: Calcetto, Kurt | Partite di calcetto, Jessico Calcetto, Fubles. **Non è un problema di violazione — è un problema di reperibilità, e significa anche che il titolo non è difendibile.**

---

## 5. REGOLE OPERATIVE

### Si può fare, sempre
- Regole del calcio complete: fuorigioco, rigori, cartellini, corner, rimesse, tempi supplementari.
- Qualunque meccanica, di FC 25 o di chiunque: jockey, scudo, primo tocco, contenimento, pressing, finte.
- Qualunque **termine generico** del calcio, in italiano o in inglese.
- Qualunque modulo o schema tattico.
- Qualunque disposizione di comandi: stick a sinistra, azioni a destra, minimappa.
- Colori, motivi e strisce sulle divise **come tavolozza**.
- Un pallone bianco a pentagoni.
- Nomi di squadra da toponimo, mestiere, oggetto, quartiere.
- Font OFL, MIT, Apache — **portandosi dietro la licenza**.
- Audio sintetizzato. È già così, e vale come un asset: nessuna licenza, nessun peso, nessun rischio.

### Non si fa, mai
- Nomi, volti, numeri, gesti caratteristici di calciatori reali — **né i loro sosia riconoscibili**.
- Nomi, stemmi, soprannomi ufficiali di club reali.
- Nomi di competizioni, federazioni, campionati reali. **La parola FIFA in nessun punto, nemmeno nei commenti.**
- Riproduzioni di stadi reali, dentro o fuori.
- Inni, cori, registrazioni di folla, telecronaca campionata.
- File di font senza licenza verificata.
- Nomi di *feature* coniati da un concorrente su un elemento di interfaccia.
- Il vestito completo di un club vero: strisce bianconere + nome torinese + stella, o qualunque altra convergenza di tre segnali.

### La regola che decide i casi grigi
Non chiedere *"questo nome è registrato?"*. Chiedi: **"quanti segnali indipendenti puntano nella stessa direzione?"** Colore, motivo, nome, città, ruolo, numero, gesto. Uno è rumore. Due si giustificano. **Tre sono un ritratto, e a quel punto non conta più che tu non abbia scritto il nome.** È esattamente il metro con cui EA ha perso Keller.

### Come si verifica — e perché un grep non basta

Il primo strumento che verrebbe in mente è una lista nera di nomi reali da passare in grep sul file. **Non scrivetelo, o scrivetelo sapendo cosa non fa.** Una lista nera è il cancello perfetto della Regola 2: diventa verde perché nessuno dei nomi *che avete già pensato* è nel file, e non dice niente sul nome nuovo che qualcuno aggiungerà domani. Attesta, non misura.

Quello che invece misura davvero:

**a) L'inventario, automatico.** `node _z-legale-nomi.js` (in `C:/Users/Utenteee/Desktop/GitHub/games/_z-legale-nomi.js`) enumera **tutti** i nomi che il gioco può pronunciare — squadre, 137 giocatori, campi, sponsor, trofei, divise, negozio — chiamando le funzioni vere dentro la pagina. Se un simbolo non è raggiungibile **esce rosso e lo dice**, invece di stampare un elenco vuoto. Questa è la parte che una macchina può fare: *produrre la lista completa*. Costo: ~15 secondi.

**b) Il giudizio, umano.** La lista di (a) si legge con gli occhi, una volta per onda, e su ogni voce si fa la domanda dei tre segnali. Cinque minuti. Questo pezzo non si automatizza, e fingere il contrario è il ventitreesimo caso.

**c) Prima di ogni pubblicazione**, tre controlli che il grep sa fare perché cercano *assenze note*, non presenze ignote:
- `grep -i -E "fifa|uefa|figc|champions|serie a|premier"` → deve dare 0
- `grep -o "data:[a-z0-9/+.-]*;base64"` → devono uscire **solo** i 2 woff2
- `grep -o -E "https?://"` → solo il namespace SVG

**d) Le tre riparazioni una tantum**, in ordine di costo crescente:
1. `LICENSE-FONTS.txt` nel repo con i due avvisi canonici + il testo OFL 1.1 integrale, e una voce CREDITI nel gioco che li mostri. *(un file, una schermata)*
2. `applicationId` su un dominio che possedete o su una forma neutra (`org.calcetto.gioco`). **Prima della prima pubblicazione, o mai più.** *(una riga)*
3. Rinominare ROSSONERO; riformulare i 13 commenti sui concorrenti in termini di fatto misurato. *(una parola + mezz'ora)*

**e) Se un giorno il gioco fa soldi veri**, una clearance sui registri UIBM/EUIPO/TMview per il titolo e per gli otto sponsor. Oggi non è stata fatta e non l'ho potuta fare io: **è l'unico buco di conoscenza che resta, e va scritto nel Punto del Lavoro invece che dimenticato.**

---

## Fonti

[Mishcon — Brands in Sports Video Games](https://www.mishcon.com/news/brands-in-sports-video-games-whyfootball-managermight-be-the-exception) · [A&O Shearman — IP Rights in Football](https://www.aoshearman.com/en/insights/ip-rights-in-football-avoiding-an-own-goal) · [VGC — Football Manager e Manchester United](https://www.videogameschronicle.com/news/football-manager-will-no-longer-use-the-manchester-united-name-following-a-trademark-dispute/) · [Lexology — Man Utd v Sega](https://www.lexology.com/library/detail.aspx?g=d2d81907-6edb-4350-8819-8c85ff2ddaab) · [Tetris Holding v. Xio (Wikipedia)](https://en.wikipedia.org/wiki/Tetris_Holding,_LLC_v._Xio_Interactive,_Inc.) · [Loeb & Loeb — Tetris v. Xio](https://www.loeb.com/en/insights/publications/2012/06/tetris-holding-llc-v-xio-interactive-inc) · [Keller v. EA, 9th Cir. — testo](https://rightofpublicity.com/pdf/cases/KellerVsEAruling7-31-13.PDF) · [Crowell & Moring — Keller](https://www.crowell.com/en/insights/client-alerts/the-ninth-circuit-court-of-appeals-finds-that-the-use-of-college-football-player-s-likeness-in-a-video-game-is-not-protected-by-the-first-amendment-as-a-matter-of-law) · [Jacobacci — Juventus "Be The Stripes"](https://www.jacobacci-law.com/news-and-publications/the-juventus-unregistered-trademark-on-the-be-the-stripes-uniform-en) · [D Young & Co — proteggere il visivo nei videogiochi](https://www.dyoung.com/en/knowledgebank/articles/trademark-design-video-games-visuals) · [Lotus v. Borland (Wikipedia)](https://en.wikipedia.org/wiki/Lotus_Development_Corp._v._Borland_International,_Inc.) · [Apple v. Microsoft, 35 F.3d 1435](https://law.justia.com/cases/federal/appellate-courts/F3/35/1435/605245/) · [WilmerHale — proteggere la GUI](https://www.wilmerhale.com/en/insights/publications/protecting-a-companys-graphical-user-interface-may-6-2002) · [OFL FAQ ufficiale](https://openfontlicense.org/ofl-faq/) · [CDAS — quando serve licenziare un font](https://cdas.com/fonts-and-typfaces-when-do-you-need-to-license/) · [Google Fonts — OFL Archivo Black](https://raw.githubusercontent.com/google/fonts/main/ofl/archivoblack/OFL.txt) · [Google Fonts — OFL Barlow Condensed](https://raw.githubusercontent.com/google/fonts/main/ofl/barlowcondensed/OFL.txt) · [FIFA Brand Protection](https://inside.fifa.com/tournament-organisation/brand-protection) · [FIFA IP Guidelines 2024 (PDF)](https://www.fifadigitalarchive.com/welcome_old/markrequest/Common/documents/FIFA_World_Cup_26tm_IP_Guidelines_English_version_2_0_June_2024.pdf) · [Burges Salmon — EA/FIFA fine licenza](https://www.burges-salmon.com/articles/102hold/ea-sports-to-end-long-standing-licensing-agreement-with-fifa/) · [Winkler Partners — licenze per gli stadi](https://winklerpartners.com/do-sports-video-games-need-a-license-to-simulate-a-stadiums-appearance/) · [Soroker Nordman Riba — cori e copyright](https://sanlaw.legal/roaring-fans-and-copyright-laws/) · [Google Play — Proprietà intellettuale](https://support.google.com/googleplay/android-developer/answer/9888072) · [Google Play — Impersonation](https://support.google.com/googleplay/android-developer/answer/9888374) · [Art. 8 CPI — nomi e segni notori](https://www.brocardi.it/codice-della-proprieta-industriale/capo-ii/sezione-i/art8.html) · [Art. 2598 c.c. — concorrenza sleale](https://www.brocardi.it/codice-civile/libro-quinto/titolo-x/capo-i/sezione-ii/art2598.html) · [IFAB — Laws of the Game](https://www.theifab.com/) · [Courthouse News — AC Milan perde la registrazione internazionale](https://www.courthousenews.com/soccer-powerhouse-ac-milan-loses-bid-for-international-logo/)