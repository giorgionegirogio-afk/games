# ELENCO DI CIÒ CHE MANCA — CALCETTO, 24 settembre 2026

**Come leggerlo.** Ordinato per **quanto si vede**, non per dominio: in cima le cose la cui assenza si nota nei primi dieci secondi di una partita, in fondo quelle che vede solo un arbitro. Ogni voce porta una sigla:

- **(A)** = **l'hai escluso tu** (o l'ha escluso un programma che hai approvato). Le elenco lo stesso, perché «iper realistico» riapre quelle decisioni.
- **(B)** = **lo sapevamo ed è scritto** in `_analisi/MAPPA-MANDATO.md`, `MANUALE.md` §A, `_analisi/DIFFERENZE-FC-MOBILE.md` o in un commento del gioco. Nota ma non fatta.
- **(C)** = **non ci ha pensato nessuno.** Non compare in nessun documento né commento. **Questa è la risposta vera alla tua domanda: sono 71 voci su 118.**

File: `C:\Users\Utenteee\Desktop\GitHub\games\CALCETTO-il-gioco.html` (abbreviato «gioco:riga»). Ho ri-verificato a mano nel codice le 23 affermazioni più pesanti prima di scriverle; le tre che non ho potuto confermare, e le quattro che ho dovuto correggere, stanno in fondo in chiaro.

---

## LIVELLO 1 — SI VEDE NEI PRIMI DIECI SECONDI

**1. (C) LA PORTA È ALTA 52 E NIENTE DEL GIOCO ARRIVA A 52.** Gravità 560. Quota massima per sorgente: tiro **15,1** · pallonetto **37,5** · cross **39,4** · colpo di testa **47,4**. L'unica cosa che supera 52 è il pugno del portiere, che va via dalla porta. *Prova: gioco:4649 (`GOAL_Z=52`), :20985 (`b.vz-=560*dt`), :16864 (`vz=min(130,(speed-460)*0.4)`), :18225, :17926 — verificate riga per riga; il culmine è aritmetica (vz²/1120).* **Non esistono l'angolo alto, il sette, il tiro sotto la traversa. I due terzi alti della porta non sono tirabili.** È la causa a monte di una decina di voci più sotto.

**2. (C) IL RAMO «PALLA ALTA» NON SCATTA MAI: OGNI PALLONE CHE ENTRA NELLA BOCCA È GOL, A QUALUNQUE QUOTA.** `ballWalls` calcola `const alta = b.z > GOAL_Z` e, se vero, chiama `ballOverBar`. Con il massimo raggiungibile a 39,4 quel booleano è **sempre falso**: `ballOverBar` è codice morto. *Prova: gioco:22069-22077 (letto oggi).* Un gol e un pallone in tribuna sono, oggi, lo stesso evento.

**3. (C) LA TRAVERSA È DI FATTO IRRAGGIUNGIBILE.** Il ramo TRAVERSA chiede `|b.z-52|<7` sul filo della porta. Nessuna traiettoria del gioco entra in quella finestra tranne un colpo di testa battuto all'estremo (Z_TESTA_MAX=46) proprio sulla linea. *Prova: gioco:22079-22093, :4697.* Il banner «TRAVERSA!», la scossa, il gelo e il suono del legno esistono e non si spendono quasi mai.

**4. (C) NESSUN CORPO HA UNA QUOTA: NESSUNO SALTA, MAI.** L'oggetto giocatore ha x, y, vx, vy, ax, ay e **nessun campo z**. Il colpo di testa si decide sulla quota del *pallone* e sulla distanza orizzontale. Niente stacco, niente tempismo, niente elevazione, niente altezza dell'uomo. *Prova: gioco:11700-11790, :20999-21012 — verificato per assenza di `p.z` in tutto il file.* **Il duello aereo non può diventare vero in nessuna forma: è la radice, non un dettaglio.**

**5. (C) IL DUELLO AEREO LO VINCE L'ORDINE DELL'ARRAY.** Nella finestra di quota il ciclo scorre `G.players` dall'indice 0 e fa `break` sul primo a portata: non il più alto, non chi salta prima. *Prova: gioco:20999-21012.* A parità di distanza vince sempre lo stesso uomo, partita dopo partita.

**6. (C) IL PORTIERE PERDE LE MANI PER UN QUARTO DELLA PARTITA — DIFETTO VERO, MISURATO.** `updatePlayerFisica` esce al ramo `if(p.role==='gk'){ updateKeeper(p,dt); return; }` (gioco:20130) e il decremento di `p.kickCd` sta **alla riga dopo** (:20131). L'unico decremento del portiere vive dentro `if(b.owner===indice)` (:21493). Quindi `rinvioPortiere` lascia `kickCd=0,4` con `b.owner=-1` e **quel valore resta congelato per sempre**, e la guardia `if(p.kickCd<=0)` a :21490 spegne `tentaPresa`: il portiere in piedi smette di usare le mani. *Misurato: 24,4% dei fotogrammi-portiere, valori congelati esattamente a 0,400 e 0,180, e una striscia di 38,0 s su 90 con entrambi i portieri senza mani. Prova: gioco:20130-20131, :21488-21496, :21774 — riletto oggi.* **Questo non è un pezzo mancante, è un pezzo rotto.**

**7. (C) IL PORTIERE INTERVIENE MENO DI QUANTO SUBISCA.** 20 partite CPU contro CPU a taglia 5: **56 gol contro 33 interventi totali dei due portieri** (presa 11, respinta 14, sfugge 6, pugni 2) — 2,8 gol e 1,65 parate a partita. Nel calcio il rapporto è rovesciato. *Prova: sonda usa-e-getta, taglia 5, semi 20260803+.* È il numero che dice da solo che il portiere non sta facendo il suo mestiere.

**8. (C) L'USCITA DEL PORTIERE È INVERSA AL PERICOLO.** `uscita = clamp(dl*0.10, 16, GK_AREA_X*0.62)`, dove `dl` è la distanza palla-porta: palla a 800 → esce 80; attaccante a 100 → **torna a 16 dalla linea**. E non esce mai lateralmente dalla bocca: copre 163 unità sulle 432 dell'area. *Prova: gioco:21461-21464, :21473.* Non esistono l'uno-contro-uno, l'uscita sul cross, il tuffo ai piedi, la presa alta in mezzo all'area. **Metà del lavoro di un portiere è fuori dalla porta, e lì non va mai.**

**9. (C) IL PORTIERE NON SI PREPARA MAI: SI MUOVE SOLO DOPO CHE IL TIRO È PARTITO.** Il ramo che arma il tuffo pretende `sp>300 && versoPorta && b.owner<0`. Un filtrante lento, una palla in profondità, un rimpallo verso la porta non lo muovono di un'unità. *Prova: gioco:21404-21406.* Senza anticipo ogni parata è una reazione tardiva.

**10. (C) IL TUFFO È PIATTO E CE N'È UNO SOLO.** `p.diveDX/p.diveDY` vivono solo su x e y: nessuna componente verticale. Non esistono tuffo alto, basso, in avanti, all'indietro. E fra quota 34 e quota 52 c'è una fascia — il 35% dell'altezza della porta — dove nessun portiere può intervenire per costruzione. *Prova: gioco:21341-21343, :21448-21449, :4696, :4649.*

**11. (B) L'UNICA SORGENTE DI FALLO IN 50.340 RIGHE È LA SCIVOLATA.** `G.stats.falli[...]++` compare **una volta sola**, dentro `checkSlideContact`. *Prova: `grep -n 'stats.falli' → :20640, :20737, :20793, un solo incremento (:20737) — verificato oggi. Dichiarato in MAPPA-MANDATO.md, sezione «Manca».* Spinta, trattenuta, sgambetto senza scivolata, carica, gomitata, salto addosso: nessuna può mai produrre un fallo, benché la fisica di contatto esista già e respinga i corpi ogni fotogramma. **È la radice di quasi tutto il resto: senza altri falli non esistono rigori da trattenuta, punizioni da spinta, gialli per proteste.**

**12. (C) SI PUÒ FALCIARE UN AVVERSARIO CHE NON HA LA PALLA, SENZA NESSUNA CONSEGUENZA.** Tutto il ramo del fallo vive dentro `if(carrier && carrier.team!==p.team)`. Se in quell'istante il pallone non è posseduto dall'uomo colpito, la scivolata non è fallo, non è cartellino, non è niente: si scende al ramo «palla libera, la scivolata la spazza». *Prova: gioco:20698-20701 e :20851-20859.* Questo è esattamente il tipo di buco che chiami pigrizia: apre il gioco sleale impunito.

**13. (C) IL CONTRASTO IN PIEDI FALLITO NON È MAI FALLO, ED È DECISO A DADI.** `provaContrasto` tira `dado()`, e se perde scrive `return 'fallito'` e mette un cooldown. Nel calcio vero l'entrata in piedi fuori tempo è la fonte più comune di punizione in assoluto. *Prova: gioco:18667.*

**14. (C) VENTIDUE UOMINI IDENTICI: STESSA ALTEZZA, STESSA CORSA, STESSA ATTESA, TUTTI DESTRI.** `CORPI` ha `g:1.00` su tutte e quattro le righe (statura spenta per scelta pagata a un cancello di contrasto); `poseCorsa` non riceve nessun parametro del giocatore e la frequenza è una costante (2,6 giri/s); l'unica differenza fra due figure affiancate è lo sfasamento di fase e ±0,064 rad di braccio. E `poseCalcio` arma **sempre** HIPR: non esiste un mancino, non esiste una specchiatura in tutto il file. *Prova: gioco:5166-5206, :5790, :37225, :36962, :5945-5946.* (B) per l'altezza e la corsa — dichiarate. **(C) per il piede: nessun documento del repo nomina il piede forte.**

**15. (B/C) IN CAMPO L'UOMO NON HA VOLTO, MANI, COLLETTO, SUOLA: È SPENTO TUTTO.** Volto, dita, colletto, ciuffo, riccio, fascetta, secondo filo di volume stanno dietro `lodOn = hPx*lodK >= LOD_PX` con `LOD_PX=120`, mentre in partita la figura vale **~47**. Quindi in campo l'uomo è: tronco trapezio + barra fianchi + collo + disco-testa + disco-capelli + 10 capsule + numero. *Prova: gioco:7755, :8163 (`lodOn=hPx*lodK>=LOD_PX`, letto oggi), :37389-37390.* **Un solo interruttore spegne sette dettagli per il 95% del tempo di gioco.** (B) per il volto, già censito; (C) per il fatto che sia un interruttore solo.

**16. (B) NESSUNO GUARDA MAI IL PALLONE.** NECK e HEAD non hanno un grado di libertà proprio di imbardata: `rigAngolo` gira **tutto** il corpo con un solo angolo, e `cenno()` è solo beccheggio sagittale. *Prova: gioco:37005-37022, :5531-5536.* **È la voce più redditizia dell'intero elenco: un angolo in più sul collo e ventidue teste smettono di guardare dritto davanti a sé.**

**17. (C) IL DIFENSORE CHE ARRETRA È DISEGNATO MENTRE SPRINTA VIA DAL PALLONE.** Il corpo è sempre disegnato nella direzione di marcia, e il registro delle clip ha solo fermo/camminata/corsa/frenata: non esistono la corsa all'indietro né il passo laterale. *Prova: gioco:19894, :20458-20463, :7471-7512.* Si vede in ogni azione difensiva, cioè in metà partita.

**18. (B+C) LA STANCHEZZA NON SI VEDE E NON ENTRA IN NESSUN GESTO TECNICO.** `fiato` e `cond` toccano **solo** velocità di punta, ciclo dello scatto, scudo, finestra di presa della scivolata, acciacco — e accorciano la falcata. **Non toccano**: potenza del tiro, precisione del tiro, passaggio, primo tocco, riflessi del portiere. E non esiste nessuna posa di stanchezza: niente mani sui fianchi, niente busto piegato, niente petto che si alza. *Prova: gioco:20343-20376, :18235, :18447, :21203, :21399, :19806, :7339.* **La partita dura 90 secondi e nessun corpo racconta di averli corsi, e il minuto 85 non sporca una giocata più del minuto 5.**

**19. (C) IL PASSAGGIO NON PUÒ SBAGLIARE.** `eseguiPassUmano` sceglie il compagno più smarcato, calcola l'anticipo sulla corsa e calcia esattamente lì. Zero errore angolare, zero peso, zero pressione, zero stanchezza, zero attributi. L'unico modo di perdere un passaggio è che sbagli il primo tocco chi lo riceve. *Prova: gioco:16958-16976.* **È l'azione più frequente della partita e l'unica del gioco con probabilità di riuscita 1.**

**20. (C) LA PRECISIONE DEL TIRO NON CONOSCE NÉ LA DISTANZA NÉ LA PRESSIONE.** Dentro la finestra di tempismo l'errore è **zero a qualunque distanza**; fuori finestra è un angolo fisso, identico da 30 unità e da 600, con o senza un avversario addosso, in corsa o da fermo. *Prova: gioco:18311-18313, :18352.* Un tiro dalla propria metà campo nella finestra giusta è preciso come un tap-in.

**21. (B) NESSUNA ANIMAZIONE NASCE DAL CONTATTO FRA DUE CORPI.** La separazione è `push=(P_R*2-d)/2` divisa a metà: non guarda velocità, non guarda masse, non distingue chi è fermo da chi arriva a 223 unità al secondo. Nessuna spalla a spalla, nessun braccio addosso, nessuno che cade, nessuno stato «a terra» come esito di un contatto. *Prova: gioco:20469-20475.* **Il duello è la scena che il gioco fotografa di più e non ha nemmeno il contatto.**

**22. (C) IL PUBBLICO NON FISCHIA MAI E NON APPLAUDE MAI.** Il livello di folla è **una sola manopola continua**: `crowdLevel(1 + prox*0.9 + crowdHype*0.4 + 0.35*spintaAttacco)`. Una parata strepitosa, una rovesciata sbagliata, un tunnel non muovono niente di diverso dal volume. *Prova: gioco:19218; `grep -i applaus` = 0.* Il pubblico sa fare solo più rumore o meno rumore, mai un rumore di **segno** diverso.

**23. (B) NON ESISTE NESSUNA TELECRONACA.** Zero riscontri per `telecronac` in tutto il file. Il racconto è un banner a slot unico dove ogni evento sovrascrive il precedente. *Prova: gioco:9604; MAPPA-MANDATO.md §6 lo quota già (bus eventi 1 g, due voci 2 g).*

**24. (C) IL REPLAY ESISTE SOLO PER IL GOL.** `avviaMoviola()` è chiamata da **un solo punto**, dentro la scena 'goal'. Nessuna moviola su una parata, un palo, un'occasione, un'entrata dura — **mentre l'anello `G.rec` registra 9 secondi in continuo ed è già pronto**. *Prova: gioco:19160-19167; `_analisi/MOVIOLA-OGGI.md` §1.* Si butta via tutto tranne il gol.

**25. (B+C) NESSUN PASSO, NESSUN TACCHETTO, NESSUN RESPIRO.** `Audio5` ha whistle, kick, clack, roar, post, net, slideS, jingleTick, swell, perfect, curvaTamburo, coro, beep, uiTick, crowdLevel. Ventidue uomini corrono in silenzio. E **la parata non ha un suono suo**: usa `clack(true)`, l'urto generico. *Prova: gioco:11228, :21741.* Il tappeto sonoro di una partita è fatto per metà di passi.

---

## LIVELLO 2 — SI VEDE IN UNA PARTITA INTERA

**26. (B+C) LA PUNIZIONE È UNA SCHERMATA, SEMPRE ALLA DISTANZA DEL RIGORE, E LA BARRIERA NON ESISTE.** `startFreeKick(shooterTeam, foulTeam)` **non riceve mai una posizione**: un fallo sul limite e un rigore hanno identica geometria, e il commento del gioco lo dichiara. La parola «barriera» ha **zero occorrenze in tutto il file** (verificato oggi). L'unica cosa che esiste è `punizioneRapida`, che respinge radialmente gli avversari a `90*KPASSO` = 3,1 m a taglia 5, 5,3 m a 11, contro i 9,15 m IFAB (−42%). *Prova: gioco:24572, :20623-20626, :20588-20609 (riletto oggi).* **Niente muro, niente uomini da contare, niente distanza da far rispettare, niente rincorsa, niente piazzamento, niente sanzione per chi non arretra.**

**27. (C) NON ESISTE LA DISTINZIONE FRA PUNIZIONE DIRETTA E INDIRETTA.** La funzione si chiama `punizioneRapida` e il commento la chiama «punizione a due», ma **nulla nel codice impone un secondo tocco**: il pallone va ai piedi del fallito con `kickCd=0.25` e da lì può tirare in porta. `punizione indiretta` = 0 occorrenze. *Prova: gioco:20588-20594 (riletto oggi).* Tutta la casistica indiretta del calcio — retropassaggio, sei secondi, gioco pericoloso, ostruzione — **non ha nemmeno il contenitore in cui esistere.**

**28. (C) LA PUNIZIONE NON SI BATTE MAI SU UN PALLONE FERMO.** `punizioneRapida` non posa il pallone: lo **assegna** (`b.owner=indexOf(fallito)`), quindi è già ai piedi e si muove con l'uomo. La Regola 13 pretende pallone fermo. *Prova: gioco:20592.*

**29. (C) IL RIGORE PARATO NON RIMBALZA MAI: VENTIDUE UOMINI SI TELETRASPORTANO.** All'uscita del duello, se l'esito non è gol, il codice chiama `resetKickoff()` e consegna il pallone al difensore più arretrato a 130 unità dalla linea. *Prova: gioco:24547-24563, riletto oggi.* **Niente ribattuta, niente tap-in, niente angolo sulla parata, niente pallone vivo.** E l'esito «fuori» cade nello **stesso ramo** della parata: due esiti regolamentari diversi collassati in uno (niente rinvio dal fondo).

**30. (C) UNA PARATA NON CONCEDE MAI UN CALCIO D'ANGOLO.** Tutti e tre gli esiti che non bloccano spingono il pallone **verso il centro del campo**. Il gioco ha gli angoli dalla voce #87 e il portiere non ne produce nemmeno uno. *Prova: gioco:21655-21657, :21703-21705, :21714-21716.* «In angolo!» è la parata più comune del calcio vero.

**31. (C) LA SERIE DI RIGORI È A MORTE IMPROVVISA DAL PRIMO TIRO — E LO SCHERMO PROMETTE CINQUE PALLINI.** `if(R.tiri[0]===R.tiri[1] && R.tiri[0]>0 && R.seg[0]!==R.seg[1])` chiude la serie dopo **ogni** coppia: chi segna il primo e vede sbagliare l'altro ha già vinto. Il pannello disegna comunque `Math.max(5, ...)` pallini. *Prova: gioco:20494-20508 (riletto oggi), :24587.* **Lo schermo dice una cosa e la regola ne fa un'altra: è una bugia visibile.** In più: a parità perfetta dopo nove tiri per parte, `R.seg[0]>=R.seg[1]?0:1` fa **vincere sempre la squadra 0**.

**32. (C) NELLA SERIE DI RIGORI NON ESISTE L'ORDINE DEI RIGORISTI.** Il duello vive a livello di squadra, non di uomo, e il commento lo dichiara: «il gioco di oggi non tiene un indice del rigorista». *Prova: gioco:20514-20517.* Niente quinto rigorista, niente drammaturgia, e niente regola per cui ogni eleggibile deve tirare prima che qualcuno tiri due volte.

**33. (C) LA DOPPIA AMMONIZIONE ALLO STESSO GIOCATORE NON ESPELLE NESSUNO.** Il conto che decide è **di squadra**: `(G.stats.gialli[p.team] % CARTELLINI_PER_ESPULSIONE)===0`. `p.gialli` viene incrementato e mostrato, ma **non è mai letto da nessuna decisione**. Conseguenze: due gialli a due uomini diversi mandano fuori uno di loro; tre gialli allo stesso uomo possono lasciarlo in campo; ed esce sempre l'ultimo ammonito, non il recidivo. *Prova: gioco:20535-20541, riletto oggi.* **È una regola che ogni spettatore conosce a memoria ed è sostituita da un'altra cosa.**

**34. (C) LA RIMESSA LATERALE È SBAGLIATA A TUTTE LE TAGLIE, IN DUE MODI OPPOSTI, E LE DUE METÀ SI CONTRADDICONO FRA LORO.** Il **motore** la batte col piede (`segnaTocco(bi, true)`, con il commento «LA RIMESSA E' UN PIEDE», gioco:21942, riletto oggi) e **non guarda mai TAGLIA**. L'**animazione** è sempre a due mani sopra la testa (`poseRimessa`, gioco:6741, «voce #87 compito 3»), anch'essa senza varianti per taglia. Risultato: **a taglia 11**, su campo IFAB, la meccanica è un kick-in futsal mentre il corpo mima la rimessa giusta; **a taglia 5**, dove tutto il resto è futsal, il corpo mima una rimessa IFAB mentre la meccanica è giusta. *Nessun documento nota la contraddizione: le due lenti l'avevano vista una metà per uno.*

**35. (C) IL RINVIO DAL FONDO È UN LANCIO CON LE MANI, NON UN CALCIO.** `posaBattutaRinvio` mette il pallone fra le mani (`segnaTocco(bi, false)`, col commento «è una ripresa di mano, non un calcio», gioco:22058, riletto oggi), poi il flusso automatico chiama `rinvioPortiere`, che è distribuzione di mano dal centro esatto della porta a x=58. Per IFAB (Regola 16) è un **calcio da terra** dentro l'area di porta. E **l'umano non lo batte mai**: il commento dichiara «il rinvio del portiere è sempre automatico, umano o CPU che sia». *Prova: gioco:22028-22060, :21745-21777.*

**36. (A → di fatto C) IL FUORIGIOCO NON ESISTE A TAGLIA 11, DOVE LA GABBIA NON C'È PIÙ, E LA MOTIVAZIONE SCRITTA È SCADUTA.** L'hai escluso tu il 17 settembre («Restano fuori salvo mandato futuro: … fuorigioco», `_analisi/MAPPA-MANDATO.md`:796-798, riletto oggi), ma la **motivazione tecnica** è una sola in tutti i documenti: «la gabbia (sponde che rimbalzano) è esplicitamente la scelta che lo cancella» (MAPPA-MANDATO.md:99, riletto oggi). Quella premessa **è falsa a undici**: `G.campoVero = (TAGLIA===11) || ...` (gioco:12108, verificato oggi) accende sempre il campo vero — sponde spente, rimesse, angoli e rinvii accesi, campo in scala IFAB (1490 unità = 68,0 m). `fuorigioco` nel gioco: 1 occorrenza, ed è una metafora sul gesso. `offside`: 0. **Nessuna edizione della casa rettifica questa scadenza.** A 11 contro 11 su campo regolamentare l'assenza del fuorigioco è la prima cosa che un occhio di calcio vede.

**37. (C) NON ESISTE IL TOCCO DI PRIMA CHE NON SIA UN TIRO.** Il volo si arma solo se `p.chargeKind==='tiro'`: la carica del passaggio e della scivolata sono escluse per costruzione. Niente passaggio di prima, niente uno-due al volo, niente velo, niente smistamento. «di tacco»: **zero occorrenze nel gioco e in tutti i documenti**. *Prova: gioco:21085-21095.* Il gioco a un tocco è il ritmo del calcetto, e qui c'è solo la cannonata al volo.

**38. (C) IL PRIMO TOCCO NON HA DIREZIONE.** Due soli esiti: perfetto (pallone incollato a CARRY_DIST) o sporco (versore ruotato a caso, 22-42% della velocità). **Manca il terzo, che nel calcio moderno è il gesto centrale: lo stop orientato** — verso la porta, via dall'avversario, di collo esterno. *Prova: gioco:21174-21240.* Ricevere, oggi, non è una decisione.

**39. (B) UN SOLO GESTO DI DRIBBLING.** Lo strappo con due esiti più la finta automatica di disegno. Nessun repertorio comandabile, nessun concatenamento, nessun costo del concatenare, nessun tunnel, nessun fallimento della finta. *Prova: gioco:5022-5034.*

**40. (C) IL COLPO DI TESTA È UNO SOLO, AUTOMATICO, SENZA MIRA E SENZA ATTRIBUTI.** Una traiettoria, `b.vz=40` fisso, nessun comando. Non esistono il colpo di testa all'indietro, di smistamento, in tuffo, il liberatorio verso la fascia, quello difensivo verso il proprio portiere. *Prova: gioco:20869-20896.*

**41. (C) LA QUOTA NON È MAI UNA SCELTA: NASCE DALLA VELOCITÀ.** `if(speed>=500) b.vz=min(130,(speed-460)*0.4)` (gioco:16864, riletto oggi). Un passaggio teso da 520 si alza da solo; un tocco morbido non può scavalcare nessuno; l'angolo di partenza non esiste come grandezza. **È la radice della voce 1.** E il pallonetto ha **due quote scritte a mano** (205 col tempismo perfetto, 175 altrimenti), indipendenti da distanza, portiere e potenza caricata (:18224-18232).

**42. (C) L'ESPULSO NON VIENE DISEGNATO AFFATTO, E NON SI SIEDE DA NESSUNA PARTE.** Chi esce viene teletrasportato a `y=-P_R*2.4` e il ciclo di disegno lo salta con un `continue`. Nessun uomo che esce, nessuna protesta, nessun corpo che lascia il rettangolo. *Prova: gioco:34860, :20115, :12020.*

**43. (B+C) IL CAMBIO NON SI VEDE MAI AVVENIRE, ED È FUORI REGOLAMENTO.** `panchinaPasso` cambia da solo, «due sguardi al secondo», scegliendo l'uomo più lontano dal pallone **a gioco vivo**. Nessun pulsante, nessuna finestra, nessuna interruzione, nessun corpo che entra o esce. Il commento lo dichiara come scelta di regia. *Prova: gioco:13699-13733.* **(B)** per il fatto, **(C)** per la conseguenza: la mappa che leggeresti per sapere cosa manca dice che le sostituzioni non esistono, e invece esistono e sono fuori regolamento.

**44. (C) LE SOSTITUZIONI SONO TRE, E IL COMMENTO AMMETTE DA SOLO CHE È LA REGOLA VECCHIA.** `const CAMBI_MAX = 3; // tre per squadra, come nel calcio prima del 2020` (gioco:4874, verificato oggi). Dal 2020 sono cinque in tre finestre; nel futsal — che il gioco dichiara come proprio codice — sono illimitate e volanti.

**45. (C) LA PANCHINA È UN OGGETTO DI SCENA VUOTO E I SEI RINCALZI NON HANNO CORPO.** Una panca di legno e due borsoni, solo nei temi GABBIA e NOTTURNO, e nessuno seduto sopra. I rincalzi sono oggetti `{nome}` e basta. *Prova: gioco:29564-29573, :11988.* **Una panchina vuota a bordo campo è più falsa di nessuna panchina.**

**46. (C) IL CONTEGGIO DEI FALLI DI SQUADRA NON SI VEDE MAI, BENCHÉ AL TERZO SCATTI LA PUNIZIONE.** La regola c'è (`falli>=3` → banner «TERZO FALLO: SI TIRA!») ma non è mostrata nell'HUD: chi gioca non sa mai quanto manca. *Prova: gioco:20640, :20793-20795, :38751-38758.* **(B)** — è una decisione presa in casa e scritta nel gioco, **ma tu non sei mai stato interpellato**. Nel calcio a 5 il conto dei falli è mezza tattica.

**47. (C) IL CUMULO DEI FALLI SCATTA AL TERZO INVECE CHE AL SESTO, E NON SI AZZERA MAI.** La regola futsal è il sesto fallo accumulato, col conto azzerato a fine primo tempo. Qui non ci sono tempi e `G.stats.falli` è azzerato **solo** in `startMatch`. *Prova: gioco:20793, :12133.* La soglia è una scelta di ritmo difendibile; il mancato azzeramento no, e non è dichiarato.

**48. (C) IL SECONDO DISCHETTO DEL FUTSAL È DIPINTO SUL CAMPO E NON È MAI UN PUNTO DI BATTUTA.** `dischetto2:288` esiste solo a taglia 5, è disegnato dal pennello, e `grep dischetto2` trova **solo la definizione e il disegno**: nessun consumatore nel motore. Il cumulo manda comunque al duello sul dischetto del rigore. *Prova: gioco:4532, :4544, :31339-31342, :20793 — verificato oggi.* **È vernice che promette una regola che il motore non ha: chi conosce il futsal la legge come un errore.**

**49. (C) IL CALCIO D'INIZIO NON RISPETTA NÉ IL CERCHIO NÉ IL SECONDO TOCCO.** `resetKickoff` consegna il pallone **già ai piedi** del battitore (`G.ball.owner=...` + `segnaTocco(..., true)`): nessun controllo che gli avversari siano fuori dal cerchio, il pallone non deve essere calciato per essere in gioco, il battitore può partire in dribbling. Il cerchio è dipinto e non vincola nessuno — anzi, con mentalità ATTACCO a taglia 5 le caselle avanzate cadono **dentro** il cerchio. *Prova: gioco:12044-12080, :11785-11800, :4544.* È la ripresa più vista del gioco: una a ogni gol.

**50. (C) LE DIVISE NON SI SPORCANO MAI E IL CAMPO NON SI CONSUMA.** Nessun fango, nessuna erba dopo una scivolata, nessun sudore sul tessuto, nessuna maglia fuori dai pantaloncini; le zolle sono particelle a vita breve e l'usura del gesso è cotta una volta sola col seme. *Prova: gioco:22386, :31232; `sudore` nel gioco = 1 occorrenza, ed è il cuoio del pallone nel negozio (:26707).* **Un campo e una maglia identici al minuto 1 e al minuto 90 sono la cosa che tradisce di più la simulazione.**

**51. (C) I GUANTI DEL PORTIERE NON ESISTONO — E IL COMMENTO DEL GIOCO DICE IL CONTRARIO.** Il commento di `drawPlayer` afferma che la squadra del portiere «gliela dicono l'anello sul torso e i guantoni» (gioco:37235-37238, riletto oggi). **`rigLook` non ha né il campo guanti né l'anello** (gioco:36960-36990, letto oggi): gli avambracci del portiere sono `c:'pelle'` come quelli di tutti. L'unico «guanto» del file è un'icona SVG del trofeo (:9533). **Il portiere è l'unico ruolo con una sagoma propria e gli manca il suo segno più ovvio; e il commento manda fuori strada chi ci tornerà.**

**52. (C) LE MANICHE IN SECONDA TINTA SONO PROMESSE DALL'ANTEPRIMA DEL KIT E NON ARRIVANO MAI IN CAMPO.** Il pannello dipinge maniche e colletto in `c2` **per ogni pattern, incondizionatamente** (gioco:27093-27107, riletto oggi); in campo i segmenti del braccio sono `c:'maglia'` (`SEGS`, :7628-7631, letto oggi) e il colletto sta sotto `lodOn`. Il commento sopra l'anteprima dichiara «l'anteprima è una promessa che il campo mantiene»: su maniche e colletto **è falsa**. Conseguenza mai registrata: il pattern 0 diventa tinta piatta in campo, e **un kit che si chiama ROSSONERO si vede come una tinta unita salmone** (due kit su otto più due squadre CPU). **È una promessa commerciale su un pacchetto che si compra.**

**53. (C) LA FASCIA DA CAPITANO NON ESISTE.** Il capitano è già calcolato (il più forte dei suoi) e già presentato con una targa prima del fischio: sul corpo non ha **niente**, né in campo né nel ritratto. *Prova: gioco:12458-12470, :42214; `fascia da capitano` = 0 in tutto il repo.* Costa un tratto sul bicipite e distingue una figura su cinque.

**54. (C) IL NOME SULLA SCHIENA NON C'È, E IL NUMERO È DIPINTO IDENTICO DAVANTI E DIETRO.** Il gioco ha cognomi veri per tutta la rosa e li mostra ovunque tranne che sulla maglia; il glifo del numero si ancora all'80% del segmento pelvi-collo e si dipinge **senza nessun controllo del verso**: chi ti corre incontro porta il numero di schiena sul petto, alla stessa dimensione. *Prova: gioco:10664, :37403-37545.*

**55. (C) L'ESPRESSIONE È STATICA PER SEMPRE E LA BARBA ESISTE SOLO NEL RITRATTO.** `trattiVolto` sorteggia serio/sorriso/grinta **dal seme del nome** e `ritratto()` non riceve nessuno stato: lo stesso uomo ha la stessa faccia quando segna, quando subisce, quando viene ammonito. E sorteggia **quattro barbe**, disegnate nel ritratto e **mai portate in campo** (`rigLook` non ha il campo barba), benché il codice dichiari «il ritratto è lo stesso uomo che corre». *Prova: gioco:27508-27532, :27641-27665, :11614-11622, :36960-36984.*

**56. (B) L'ESULTANZA NON HA GEOGRAFIA.** Il marcatore resta dov'è, i compagni non lo raggiungono, nessuno corre sotto la curva né verso la bandierina. Quattro esultanze pescate da `(idx+minuto)%3`, nessuna scelta di chi gioca, nessun abbraccio, nessun mucchio, nessun batti-cinque. *Prova: gioco:37046-37077, :11181.*

**57. (B) IL CORPO DICE DUE COSE SOLE: GIOIA (2,4 s) E DELUSIONE (2,4 s).** Nessuno stato emotivo continuo: `grep fiducia|ansia|paura|rabbia|frustra|nervos|tensione` = zero occorrenze pertinenti. Niente protesta, niente mani ai fianchi, niente incitamento, niente rabbia dopo un errore. *Prova: gioco:37078, :7511; MAPPA-MANDATO.md:179.*

---

## LIVELLO 3 — LO VEDE CHI CONOSCE IL CALCIO

**58. (C) LA LINEA NON È UNA LINEA, E SBAGLIA IN DUE VERSI OPPOSTI NELLO STESSO BLOCCO.** Il **gol** si conta a `b.x < -4`, un letterale che non è il raggio del pallone a nessuna taglia (B_R vale 8 a 5 e 7, 2,5 a 11): a taglia 5 si conta con metà pallone ancora fuori, a 11 si conta tardi. Il **fuori** scatta a `b.y<B_R`, cioè quando il pallone è **ancora tutto dentro**, mentre l'IFAB lo vuole fuori solo quando ha superato la linea **interamente**. *Prova: gioco:22070-22074 (riletto oggi), :22106, :22116, :22133, :22146.* **È il numero più importante del calcio, ed è un letterale; e ogni rimessa, ogni angolo e ogni rinvio nasce da una decisione sbagliata per costruzione.**

**59. (C) IL PORTIERE PUÒ RIPRENDERE CON LE MANI IL PROPRIO RINVIO — MA OGGI IL DIFETTO 6 LO MASCHERA.** La guardia del retropassaggio è `b.toccoPiede===true && lt>=0 && lt!==ki && ...` (gioco:21596, riletto oggi): se l'ultimo toccatore è il portiere **stesso**, la presa è lecita, e `rinvioPortiere` lo mette proprio come ultimo toccatore. La Regola 12 lo vieta. **Oggi non succede solo perché `kickCd` resta congelato e `tentaPresa` non viene mai chiamata.** *Avvertenza operativa: chi ripara il difetto 6 senza toccare anche la riga 21596 apre il buco della Regola 12 lo stesso giorno.*

**60. (C) IL PORTIERE NON GUARDA MAI SE IL PALLONE È DENTRO L'AREA.** `tentaPresa` decide solo per geometria del corpo (ellisse GK_REACH) e quota, e **non chiama mai `dentroArea()`**. Il portiere è clampato dentro l'area, il **pallone** no: con il corpo sul limite e un tuffo, la mano può chiudersi su un pallone fuori area. Per la Regola 12 conta la posizione del pallone. *Prova: gioco:21531-21545, :21258, :21361.*

**61. (C) IL PORTIERE NON PUÒ USCIRE DALL'AREA, MAI.** Due clamp in `updateKeeper` lo tengono dentro `GK_AREA_X` in ogni condizione. Niente portiere che spazza fuori area, niente portiere-libero, **niente portiere di movimento** (che il futsal — il regolamento che il gioco dichiara suo — richiederebbe), niente portiere che sale sul corner all'ultimo minuto. *Prova: gioco:21361, :21472.*

**62. (C) I SEI SECONDI DEL PORTIERE (E I QUATTRO DEL FUTSAL) NON ESISTONO, E IL GIOCO FA IL CONTRARIO.** Dopo la presa `p.kickCd=0.9` e il rinvio parte **da solo**: nessun conteggio, nessuna violazione, nessuna punizione indiretta. *Prova: gioco:21644, :21494.* La mappa dichiara «la sostanza della regola è già rispettata»: **non è vero — un obbligo a nove decimi è l'opposto della regola**, perché il portiere non può mai temporeggiare, che è esattamente ciò che la regola serve a impedire. Classifico la riga della mappa come **(A) da rettificare**.

**63. (C) IL FALLO DI MANO NON ESISTE, NÉ VECCHIO NÉ NUOVO.** Nessuna collisione braccio-pallone, nessuna distinzione braccio aderente/staccato, nessun gol annullato per mano, nessun rigore per mano in area. Le occorrenze di «braccio» sono tutte cinematica del rig. *Prova: `grep 'fallo di mano|tocco di mano|handball'` = 0; gioco:5434-5600.* **È la regola più discussa del calcio moderno e non ha nemmeno un aggancio.** (Nominata nel «Manca» della mappa insieme a spinta e trattenuta, mai spec'ata: **(B) a metà, (C) per la regola nuova sul braccio, che nessun documento nomina.**)

**64. (C) OSTRUZIONE, GIOCO PERICOLOSO E PIEDE ALTO: ZERO OCCORRENZE NEL GIOCO E IN TUTTI I DOCUMENTI.** L'ostruzione è per giunta la controparte naturale dello **scudo**, che il gioco ha già (`scudoAttivo`, :13581) e che non produce mai nessuna infrazione. *Prova: `grep -icE 'ostruzione|gioco pericoloso|piede alto'` su gioco e documenti = 0.*

**65. (C) IL FALLO TATTICO NON HA CONSEGUENZA E IL DOGSO NON ESISTE COME CATEGORIA.** Il cartellino si decide su un criterio binario: `const cattivo = daDietro || !inTempo`. Fermare una ripartenza o negare una chiara occasione da rete non pesano nulla in più. Il regolamento ha quattro livelli. *Prova: gioco:20736; `fallo tattico` = 0.*

**66. (B) IL CARTELLINO ROSSO DIRETTO NON ESISTE.** `infliggiCartellino` ha un solo esito (giallo) e un solo effetto aggiuntivo (l'espulsione temporanea al conto pari di squadra). Nessuna condotta violenta, nessun fallo grave, nessuna espulsione immediata. *Prova: gioco:20535-20562, riletto oggi.*

**67. (C) NESSUN CARTELLINO PER CONDOTTA NON VIOLENTA.** `infliggiCartellino` è chiamata da **due soli punti**, entrambi legati alla scivolata cattiva: proteste, ritardo della ripresa, esultanza irregolare, ingresso senza permesso, simulazione — nessuna esiste. *Prova: `grep -n 'infliggiCartellino('` → :20535 (definizione), :20584, :20790.* **Il metro disciplinare del gioco ha un colore solo.**

**68. (C) L'ESPULSO NON RIENTRA SUL GOL SUBITO.** `p.out = ESPULSIONE_SEC` (12 s) scorre e basta; `addGoal` non tocca mai `p.out`. Nel futsal FIFA l'inferiorità finisce **anche** quando chi è in dieci subisce rete. *Prova: gioco:20547, :12597-12630.* **Metà di una regola dichiarata è peggio di nessuna regola.**

**69. (C) LA PERDITA DI TEMPO NON ESISTE E NON È PUNIBILE — ANZI, IL GIOCO PREMIA CHI TEMPOREGGIA.** `BATTUTA_HOLD = 3.0` è dichiarato «anti-stallo», e alla scadenza **la battuta parte da sola**. Nel futsal i quattro secondi scaduti danno il pallone all'avversario; nel calcio il ritardo è ammonizione. *Prova: gioco:21807, :19247-19251.* Una soglia che esiste già e sarebbe una regola con due righe.

**70. (C) NON ESISTE IL DIVIETO DI SEGNARE DIRETTAMENTE DA RIMESSA E DA RINVIO.** `addGoal` non guarda mai `G.battuta` né il tipo dell'ultima ripresa, e nessuna variabile di «ultima ripresa» sopravvive alla battuta. *Prova: gioco:12597 — verificato per assenza.*

**71. (C) I 9,15 M NON VALGONO NEMMENO SUL CALCIO D'ANGOLO.** `posaBattutaAngolo` piazza i marcatori a **18 unità** dall'attaccante e **non allontana nessuno dalla bandierina**: a taglia 11 i 9,15 m sarebbero 200 unità. *Prova: gioco:21969-22022.*

**72. (C) IL CALCIO D'ANGOLO È SEMPRE UN CROSS SUL DISCHETTO.** Umano o CPU, il ramo 'angolo' forza `doCross` con bersaglio **fisso** al dischetto di rigore. Niente angolo corto, niente scarico, niente rasoterra sul primo palo, niente traiettoria scelta. *Prova: gioco:19252-19270.* E sull'angolo **il portiere è posato a 8 unità dalla linea e da lì non legge niente** (:22019): l'angolo senza uscita del portiere è un angolo senza duello.

**73. (C) IL VANTAGGIO NON È SEGNALATO NÉ REVOCABILE.** La finestra c'è ed è ben fatta (0,5 s di valutazione, 2,5 s di durata), ma manca il segnale — il braccio dell'arbitro — e manca la seconda metà della regola: nel calcio l'arbitro può tornare sul fallo se il vantaggio si rivela illusorio. Qui a VANT_T il fallo è perdonato per sempre, e il commento lo dichiara. *Prova: gioco:21816-21817, :19290-19294.* **Avviso: `MAPPA-MANDATO.md`:84 elenca ancora il vantaggio sotto «Manca». È falso dal #107: il documento che leggeresti per sapere cosa manca dice il falso su questo punto.**

**74. (C) L'ARCO DELL'AREA (LA «D») È DIPINTO E NON TIENE FUORI NESSUNO SUL RIGORE.** Conseguenza del rigore-duello: nessun controllo che i giocatori siano fuori dall'area, dietro il pallone e fuori dalla D; e quindi nessuna invasione, nessuna ripetizione del rigore. *Prova: gioco:4544-4548, :24572.*

**75. (C) IL DUELLO DAL DISCHETTO È UNA SCENA, NON FISICA, E LA FINTA DEL PORTIERE È SOLO DISEGNO.** L'esito è `dado()<clamp(reflex,0.02,0.97)` (gioco:24395-24406, riletto oggi). Il tutorial promette «il portiere ondeggia, accenna finte e sceglie il tuffo di nascosto: chi legge l'altro, vince» (:4058) — ma `resolve()` confronta unicamente `keeperZone` con `zone`. **È una promessa a schermo che il codice non mantiene**, ed è il momento in cui il gioco smette di essere una simulazione.

**76. (C) NON ESISTE LA PAPERA.** L'unico errore del portiere è SFUGGE, che è un esito di **tiro** respinto male. Non c'è l'errore su un cross, l'uscita a vuoto, il pallone che passa sotto il corpo, l'autorete del portiere, la presa sbagliata su un pallone lento. E il modello d'errore è una riga: `err=(1-D.save)*rnd(-46,46)` — **non dipende dal portiere, dipende dalla difficoltà della CPU**. *Prova: gioco:21692-21711, :21443-21445.* L'hai chiesta per nome e non c'è.

**77. (C) IL PORTIERE NON HA UNA CLIP DI RIALZATA.** Dopo il tuffo c'è `p.recover=0,30`, uno squash, e poi è di nuovo in piedi. *Prova: gioco:19929-19934, :21369.* **È il fotogramma in cui si vede che il portiere è un cartone e non un corpo.**

**78. (B) LA POSA «PARA» È IL VERBO MENO LEGGIBILE DEL GIOCO.** 63,3% di fotogrammi illeggibili su 13.560 misurati, 8,1 px di asse sagittale, contro il 3,3% di «tira». Causa isolata: il portiere si tuffa lungo la bocca della porta, la porta è verticale sullo schermo, la vista non ruota mai. *Prova: `PUNTO-DEL-LAVORO.md`:339 — dichiarata «in lavorazione».* **È letteralmente la grafica dei giocatori che hai chiesto finita.**

**79. (B) DUE ATTRIBUTI SU QUATTRO DEL PORTIERE SONO FINTI.** **PRESA** (`p.tackle`) **non è letta da nessuna riga del motore** — il codice lo scrive in chiaro — ed è una barra che cresce a vuoto nella schermata ROSA dopo ogni partita. **RIFLESSI** (`p.tecnica`) è letto in **un posto solo**: quanto corpo il portiere tira su da terra dopo il tuffo. Non tocca reazione, lettura, velocità del tuffo, portata, soglia di presa, uscita. *Prova: gioco:10439-10449, :21399, :21307-21320.* **L'interfaccia promette una progressione che non esiste.**

**80. (C) OGNI CONTATTO DEL PORTIERE È UNA «PARATA» NEL TABELLINO.** `G.stats.parate[p.team]++` sta **in cima** a `tentaPresa`, prima di sapere l'esito e senza mai chiedere se il pallone andava in porta — e alimenta il trofeo GUANTONE (50 parate). *Prova: gioco:21613, riletto oggi; :10628.* Il numero che il giocatore legge a fine partita non è quello che crede.

**81. (C) IN PARTITA NON VIENE MAI EMESSO UN FATTO 'PARATA'.** I quattro fatti del portiere sono presa/pugni/respinta/sfugge; 'parata' esiste solo dentro il duello. *Prova: gioco:21646, :21691, :21711, :21727 contro :24525.* **È il prerequisito del cantiere telecronaca, e nasce storto.**

**82. (C) SI PUÒ ENTRARE IN SCIVOLATA SUL PORTIERE CHE HA LA PALLA IN MANO E RUBARGLIELA PULITA.** Dopo la presa `b.owner` è il portiere e il pallone gli viene messo davanti come a qualunque portatore; `checkSlideContact` **non guarda mai il ruolo** del portatore. Regola 12: contrastare un portiere che controlla con le mani è infrazione. *Prova: gioco:21643, :20907-20932, :20695-20740.* E in generale **il portiere non è mai protetto**: nessun fallo sul portiere, nessuna carica, nessuna precedenza sul pallone alto.

**83. (C) IL PORTIERE NON COMMETTE MAI FALLI, NON SI STANCA, NON SI ACCIACCA, NON SI SOSTITUISCE.** `updatePlayerFisica` esce sul ramo del portiere **prima** del blocco del fiato; `panchinaPasso` salta `role==='gk'`; `daEspellere` esclude il portiere. Non esiste il rigore causato dal portiere, che nel calcio vero è uno degli eventi più carichi. *Prova: gioco:20130, :13716, :20541.* In più: un portiere **ammonito** fa avanzare il conto di squadra e manda fuori **un compagno** al posto suo (:20536-20541).

**84. (B) UNA SOLA DISTRIBUZIONE, SEMPRE AUTOMATICA, SEMPRE AL PIÙ AVANZATO.** Nessuna rimessa con le mani, nessun lancio lungo, nessun rotolamento corto al difensore, nessun rinvio di collo pieno, nessuna palla appoggiata al piede. *Prova: gioco:21745-21778.* **La ripartenza dal portiere è un terzo delle azioni di una partita, e non è mai una decisione di chi gioca.**

**85. (C) L'UMANO NON PUÒ MAI CONTROLLARE IL PROPRIO PORTIERE.** Il cambio manuale e quello automatico escludono entrambi `role==='gk'`. *Prova: gioco:19490, :19634.* **Un ruolo intero del calcio è fuori dalle mani del giocatore.**

**86. (C) L'AUTORETE PER DEVIAZIONE È IMPOSSIBILE.** Un tiro sotto 420 u/s **attraversa i corpi** senza lasciare un tocco, quindi un tiro deviato da un difensore resta, nel tabellino e nel registro dei fatti, un gol dell'attaccante. *Prova: gioco:12579-12594, :21055.* **«Deviato» non esiste come categoria, e il gol deviato è uno dei modi più comuni di segnare.**

**87. (C) UNDICI COSTANTI DEL CORPO E DELLA PORTA NON SCALANO CON LA TAGLIA.** `setTaglia` ricuoce ATTR_K, TIRO_ATTR, P_R, B_R, SLIDE_BALL_R, GOAL_H, GY0/GY1, POSTI, GK_AREA_X, GK_PUGNO_SCALA e i pavimenti di zoom. Restano letterali: **KICK_R=26, CARRY_DIST=16, TOCCO_PRESS=46, POST_R=5,5, GOAL_Z=52, GOAL_D=34, Z_SOPRA_TESTA=26, Z_SOPRA_PORTIERE=34, Z_TESTA_MAX=46, GK_REACH=26, la gravità 560.** A 11 P_R scende da 13 a 5: il raggio di calciabilità passa da 2 a 5,2 raggi di corpo, e il corpo disteso del portiere copre il 66% della semiluce a 5 e il **30%** a 11. *Prova: gioco:22510-22540 (setTaglia letto per intero), :4648-4650, :4695-4697, :21258.* **A undici contro undici la calciabilità e la parata sono un altro gioco, senza che nessuno l'abbia deciso, e nessun banco lo sorveglia.**

**88. (C) A TAGLIA 5 — QUELLA DI SERIE — IL PALLONE È LARGO 56 cm E L'UOMO 90.** Con `VERNICI[5]` misurate sul regolamento (dischetto 173 = 6 m) la scala è 28,75 unità/metro: B_R=8 dà un pallone di 0,557 m (il futsal è 0,20) e P_R=13 un uomo di 0,904 m (una spalla vera è 0,45). La tavola `CORPI` dichiara le misure vere **solo a 11**. *Prova: gioco:4711, :4544, :4510 + aritmetica.* **Ogni rapporto che regge la simulazione — calciabilità, urti, presa, primo tocco — è tarato su una taglia fuori scala, e quella è la taglia di serie.** E la quota «sopra le teste» (26) vale 0,90 m: **la finestra aerea del gioco è all'altezza del bacino.**

**89. (C) LA FINESTRA DEL FALLO NON SCALA COME SCALANO I CORPI.** Il fallo nasce solo se `dc < P_R*2+4`: 30 unità su 1150 a taglia 5, **14 su 2300** a taglia 11. La finestra utile in frazione di campo si riduce di circa quattro volte. *Prova: gioco:20701, :4511-4520 + aritmetica.* **Inferenza, non misura: se confermata da una passata di `_eventi.js`, a undici contro undici la disciplina è quasi inesistente.**

**90. (C) LA DISTANZA DI RISPETTO SULLA BATTUTA NON SCALA COL CAMPO.** `BATTUTA_RAGGIO = 60` è usato grezzo, mentre la punizione usa `90*KPASSO`. A taglia 11 il campo raddoppia e il raggio resta 60 (2,74 m). *Prova: gioco:21809, :21953 contro :20597 e :32093 (SLIDE_BALL_R correttamente ricotto).* **Incoerenza interna già condannata da una lezione della casa, su una ripresa che ora esiste a tutte le taglie.**

**91. (B) QUATTRO ATTRIBUTI IN TUTTO, E TRE SPOSTANO MENO DEL 15%.** vel (±12%), tiro (±10% di potenza), tecnica (±22% sul raggio di presa pulita), tackle. Nessun attributo di passaggio, testa, forza, resistenza, aggressività, posizionamento, portiere. **Nessuno di questi entra nel rig**: le frequenze delle 27 clip sono costanti identiche per tutti e 22. Un giocatore tecnico e uno scarso calciano con lo stesso identico corpo alla stessa identica velocità. *Prova: gioco:10670-10675, :7471-7512, :37138-37141.*

**92. (B) NESSUNA DIFFERENZA DI VELOCITÀ O ACCELERAZIONE PER RUOLO, E NESSUNA POSTURA DI RUOLO.** `P_SPEED=168` e `P_ACC=900` unici per tutti; a parte il portiere, un difensore centrale, un regista e una punta hanno la stessa sagoma, la stessa attesa e la stessa corsa. *Prova: gioco:4834, :4878, :37215.* **Senza velocità di ruolo il modulo è geometria e non calcio.**

**93. (B) PIEDE DEBOLE: NON ESISTE.** `segnaTocco` porta un booleano `piede` che distingue solo piede/non-piede, **mai destro/sinistro**. *Prova: gioco:12547.* È il modo più economico di rendere diversi due giocatori, ed è dichiarato fattibile.

**94. (C) NESSUNA ETÀ, NESSUNA MUSCOLATURA, NESSUN SEGNO PARTICOLARE.** I tratti del seme sono quattro (corporatura, pelle, capelli, taglio): niente capelli grigi, niente stempiatura, niente ruga, niente tatuaggi o cicatrici — **mentre una squadra CPU si chiama «CASE NUOVE: squadra di ragazzini» e un'altra «TORRE VECCHIA: vecchi volponi»**. E ogni arto è una capsula a larghezza costante: nessun deltoide, nessun quadricipite, nessun polpaccio. *Prova: gioco:11614-11622 contro :10106 e :10118; :7628-7637.* **La promessa è già scritta nel nome delle squadre e il corpo non la mantiene.**

**95. (C) IL BUSTO HA LA STESSA LARGHEZZA DI FRONTE E DI PROFILO, E NON RUOTA MAI.** `troncoQuad` disegna un trapezio con W_PETTO 0,345 fisso, **senza nessuna dipendenza dallo yaw**; e la controrotazione spalle/bacino è calcolata (twist 0,14/0,17) ma sposta solo i punti d'attacco: PELVIS-CHEST-NECK-HEAD stanno su una colonna rigida, quindi **la torsione del busto è calcolata e poi buttata via**. *Prova: gioco:7725-7738, :5563, :5507-5522.* È il difetto che fa leggere «cartoncino ruotato» invece di «corpo».

**96. (C) L'OMBRA DI UN GIOCATORE NON CADE MAI SU UN ALTRO GIOCATORE.** `drawOmbreGiocatori` è una passata unica che gira **prima** di tutti i corpi: le ombre finiscono sempre sotto, mai addosso. In un gruppo di sei uomini sotto un sole radente non ce n'è uno che oscuri il compagno. *Prova: gioco:34879-34883, :36479.*

**97. (B) IL SECONDO FILO DI VOLUME È SPENTO IN PARTITA PER COSTO.** Un cilindro si legge perché ha due bordi diversi; in campo ne ha uno solo. Misurato: +1,3% un filo, +9,2% due, budget +8%. *Prova: gioco:8573-8619.* **È metà del volume, rinunciata su una misura che il banco appaiato non sapeva nemmeno prendere.**

**98. (B) NESSUNA MASCHERA DI FUSIONE PER PARTE DEL CORPO, NESSUNA CLIP INTERROMPIBILE, NESSUNA DEFORMAZIONE VERSO IL BERSAGLIO.** `CLIPS[nome].pose(u)` scrive tutti e 18 i giunti in un colpo: non si può far correre le gambe e alzare il braccio insieme. E il piede calcia dove dice la clip, non dove sta il pallone (il pallone del portatore sta davanti al **bacino**, a quota zero, indipendente dalla clip e dalla fase del passo). *Prova: gioco:7471-7512, :20907-20935, :36982.* **È il vincolo architetturale che impedisce quasi tutto il resto di questo elenco, ed è la ragione per cui il contatto piede-pallone non si vede mai davvero.**

**99. (C) IL CAMPO NON CAMBIA MAI LATO E IL SORTEGGIO NON LO FA SCEGLIERE.** `G.kickTeam = dado()<0.5?0:1` decide **solo chi batte**: la squadra 0 attacca la porta a +x per tutta la partita, in ogni partita. Nel calcio chi vince il sorteggio sceglie la porta. *Prova: gioco:12121.* **(C)** — è conseguenza dell'esclusione dei due tempi, ma nessun documento l'ha mai scritta.

**100. (B) NON C'È NESSUN CALCOLO DI RECUPERO E NON ESISTE IL MINUTO DI GIOCO.** L'orologio scala e basta (si ferma nelle scene non giocate); nessun accumulo, nessun cartello, nessun «+N». Il tabellino segna i gol in **mm:ss di partita reale** e l'eroe di fine partita scrive `minuto='90'` a mano. *Prova: gioco:19196, :19329, :12638, :12741.* Un tabellino che dice «gol al 00:47» non è il tabellino di una partita di calcio. E **«tempo effettivo» ha zero occorrenze in tutto il repo**: la scelta attuale è difendibile, ma è stata presa senza mai nominare la regola vera.

---

## LIVELLO 4 — LO VEDE UN ARBITRO, UN TECNICO O UN FISICO

**101. (B) ZERO ATTRITO DELL'ARIA:** in volo il pallone conserva tutta la velocità orizzontale. Ogni parabola è più lunga del vero. *Prova: gioco:20969-20981.*

**102. (B) TRE MODELLI DI PREVISIONE DEL VOLO SONO RIMASTI ALLA FISICA DI PRIMA:** `puntoCaduta`, `crossFinestra`, `crossVarcoLibero` mettono ancora l'attrito nel volo — errore misurato 22% a 0,5 s, 31% a 0,75 s. **La CPU e il portiere decidono su un punto di caduta sbagliato di 80-107 unità.** *Prova: censimento `DIFFERENZE-FC-MOBILE.md`:2125-2129, non ri-misurato in questa passata.*

**103. (B) LA VELOCITÀ DEL TIRO PAGA L'ATTRITO ANCHE SUL TRATTO IN VOLO:** dichiarato all'arrivo 330, misurato 597-777. **La lettura del portiere sbaglia del 20-25% proprio sui tiri che decidono.** *Prova: gioco:18210-18212, :16864.*

**104. (B) IL RIMBALZO NON TOGLIE NIENTE A vx E vy, E NON C'È MATERIA:** tre restituzioni scritte a mano (0,42 terra, 0,82 sponde, 0,78 pali), uguali a ogni velocità, nessun attrito statico/dinamico, nessun passaggio da scivolamento a rotolamento. *Prova: gioco:20996, :22110, :22178.* **(C)** per il fatto che il rimbalzo si spenga **a gradino** (`b.vz<-90 ? -b.vz*0.42 : 0`): manca la coda di micro-rimbalzi con cui muore ogni pallone alto vero, e con lei il tempo in cui il pallone è contendibile.

**105. (B) LO SWEPT ESISTE PER UN SOLO OGGETTO** (i pali). Corpo e sponde sono test puntuali e pagano il tunneling; non ci sono sotto-passi di integrazione. *Prova: gioco:22161-22175 contro :21062.*

**106. (B) L'EFFETTO A GIRO È UN NUMERO SOLO, SU UN ASSE SOLO (quello dello schermo), SOLO SUL TIRO PERFETTO E SOLO PER 0,5-0,6 s.** Non si sceglie, non si dosa, non esiste sul passaggio né sul cross, e ogni tocco lo azzera. Il parametro `spinY` di `kickBall` è **morto in tutte e quattordici le chiamate**. *Prova: gioco:21021-21025, :16831, :16852.* **È il gesto identitario del calcio da videogioco e qui è un premio automatico del tempismo.**

**107. (C) LA ROTAZIONE DEL PALLONE HA IL VERSO SBAGLIATO:** `b.rot += ...*(b.vx>=0?1:-1)` — un pallone che va verso l'alto dello schermo ruota come se andasse a destra, e un effetto a giro non cambia la rotazione di un grado. *Prova: gioco:21027, :20935.*

**108. (C) LE SPONDE DELLA GABBIA NON HANNO ALTEZZA:** `ballWalls` non guarda mai `b.z` fuori dalla luce della porta. Un cross a quota 39 rimbalza contro una parete invisibile alta all'infinito, e a campo vero un pallone che esce raso terra e uno a mezz'aria sono lo stesso evento. *Prova: gioco:22106-22151.*

**109. (C) UN GIOCATORE IN SCIVOLATA MURA COME UN DISCO IN PIEDI:** l'unica guardia del muro è `p.out>0`, quindi chi è per terra respinge il pallone con lo stesso cerchio pieno. *Prova: gioco:21055-21075, riletto oggi.* È il motivo per cui una scivolata mancata può comunque parare un tiro.

**110. (C) IL MURO SI APPLICA ANCHE AL PORTIERE, SENZA DISTINZIONE DALLE MANI**, e gli congela `kickCd=0,18` (vedi difetto 6). Due meccaniche in concorrenza sullo stesso corpo, nessuna delle due dichiara l'altra. *Prova: gioco:21055-21071, verificato oggi.*

**111. (C) IL PALLONE NON SI FERMA MAI:** l'attrito è esponenziale e non ha soglia di quiete. Formalmente ogni pallone è sempre in movimento: **la categoria «palla ferma», che ogni ripresa del calcio presuppone, non esiste.** *Prova: gioco:20978.* (Non morde nel gioco: lo elenco per completezza.)

**112. (C) IL FISCHIO HA DUE SOLE FORME** (uno lungo, due corti), identiche per fallo, kickoff, fine partita e rigori. Nessun fischio distinto per l'ammonizione o per il rigore. *Prova: gioco:11301-11317.* Due righe di codice, e l'orecchio le distingue subito.

**113. (C) NESSUN METRO DI SEVERITÀ DELL'ARBITRO, NESSUN «LASCIAR CORRERE»:** `grep severit` = 0. **Due partite non si distinguono mai per come vengono arbitrate.**

**114. (C) NON ESISTE LA PALLA A DUE.** `palla a due` e `dropball`: zero occorrenze (verificato oggi). Nessuna ripresa dopo un'interruzione straordinaria, e la regola 2019 (pallone all'ultima squadra in possesso, al portiere in area) non ha oggetto.

**115. (C) MANCA LA SECONDA METÀ DELLA REGOLA DEL RETROPASSAGGIO (il ripassaggio ripetuto del futsal), E IL RETROPASSAGGIO DI TESTA/PETTO/COSCIA AGGIRA TUTTO.** `tentaPresa` non ha nessun concetto di metà campo né nessuno stato «ho già rilasciato». *Prova: gioco:21531-21600.*

**116. (C) IL PORTIERE NON COMUNICA CON LA DIFESA.** `portiereDi()` è letta da **tre soli punti** (angolo, rinvio, cancello del cross): nessun difensore consulta mai dove sta il proprio portiere per decidere se spazzare o lasciar correre. *Prova: gioco:21322 e :22019, :22037, :23591.*

**117. (C) IL FISCHIO FINALE ARRIVA A METÀ AZIONE, ANCHE SU UN TIRO IN VOLO.** L'IFAB prevede almeno il prolungamento per l'esecuzione di un rigore. *Prova: gioco:19330-19346.*

**118. (C) NÉ TIME-OUT DI SQUADRA, NÉ CAMBIO VOLANTE, NÉ QUATTRO SECONDI SULLE RIPRESE — le tre regole che rendono il futsal il futsal.** Zero occorrenze in tutto il repo per ciascuna. **Il gioco dichiara il futsal come proprio regolamento in tutto il resto.**

**Contorno minore, tutte (C) salvo dove indicato:** niente raccattapalle e niente pallone di riserva (zero riscontri nel repo — a campo vero la palla esce davvero e la ripresa è magica) · niente striscioni, fumogeni, steward, fotografi · niente settore ospiti, nessuno che arriva tardi o va via prima · cartelloni mai dinamici · i pali non vibrano (la rete e la camera sì) · nessun tabellone dentro lo stadio né maxischermo **(B)** · nessun speaker e nessun coro col nome del marcatore **(B)** · nessuna ombra dello stadio che avanza sul campo **benché l'ora del giorno avanzi già e i fari si accendano** · nessuna stretta di mano, scambio di maglie, giro di campo · nessun minuto di raccoglimento · parastinchi, scarpini colorati, manica lunga, numero sui pantaloncini, stemma e sponsor sulla divisa: nessuno esiste (le scarpe sono `#15181a` per tutti e ventidue) · `b.saveRolled` è scritto in dodici posti e **letto in zero**, relitto del vecchio portiere a dadi · `tryKeeperSave(b)` è una funzione vuota lasciata in piedi.

---

## COSE CHE HAI ESCLUSO TU — E CHE «IPER REALISTICO» RIAPRE

Non le nascondo dietro la tua firma: se il traguardo cambia, le decisioni vanno rimesse sul tavolo. Citazioni riverificate oggi in `_analisi/MAPPA-MANDATO.md`.

| # | Cosa | Citazione | Perché riaprirla |
|---|---|---|---|
| A1 | **Fuorigioco** | :796-798, «Restano fuori salvo mandato futuro: … fuorigioco» | **La motivazione tecnica è scaduta** (voce 36): a 11 la gabbia non c'è. Va riaperta o almeno rettificata in chiaro. |
| A2 | **Due tempi + sostituzioni vere** | :796-798 | Una delle due cose escluse **è stata poi fatta a metà** (cambi automatici, voce 43) e la mappa non lo sa. Senza due tempi restano orfani: falli mai azzerati, nessun recupero di fiato, nessun cambio di campo. |
| A3 | **Arbitro come corpo in campo** | :796-798 + :106 «il fischio-come-suono-più-banner già ottiene l'effetto funzionale» | Vero per il *funzionamento*, falso per il *realismo percepito*: l'arbitro è in ogni inquadratura di una partita vera. E la palla che lo colpisce, la palla a due e il segnale del vantaggio (voci 73, 114) **non sono mai stati nominati da nessuno: quelli sono (C).** |
| A4 | **Infortuni completi** | :796-798, con avviso che i tier di gravità sono calibrati su un'altra compressione | L'avviso è corretto sui numeri importati. Ma **l'uomo a terra mentre il gioco prosegue** costa poco e si vede molto. |
| A5 | **Cerimoniale pre-partita** | «non appartiene a un motore Canvas 2D con partite da 90-180 secondi… Non propongo nulla» | Escluso dal **mappatore**, ratificato in blocco. Dentro c'era anche **«meteo/ora del giorno che tocca la fisica del pallone»**: tu la parola «vento» non l'hai mai pronunciata. **È esclusa per procura, non per scelta detta — e se vuoi l'iper realismo è la prima riga da riaprire** (voci 50, meteo). |
| A6 | **VAR scenografico, moviola sulla linea** | :770-776 | Su 90 secondi interromperebbe più di quanto racconti. La moviola attuale è un replay del gol, non una revisione. Coerente lasciarlo fuori. |
| A7 | **Espulsione definitiva → temporanea (12 s)** | :97, motivata con la durata della partita | Difesa con misure. **Ma il rosso diretto (voce 66) resta un buco riconosciuto**, e la doppia ammonizione personale (voce 33) non è mai stata decisa da nessuno: è solo sbagliata. |
| A8 | **Tempi supplementari → golden goal a 40 s** | :101 | Il golden goal è stato **abolito dall'IFAB nel 2004**. Scelta di ritmo difendibile, ma da sapere che è un anacronismo dichiarato, come i tre cambi (voce 44). |
| A9 | **Trappola del fuorigioco e linea difensiva** | :108 | Esclusa **per conseguenza** di A1. Se A1 si riapre, questa cade con lei. |
| A10 | **Guardalinee** | `DIFFERENZE-FC-MOBILE.md`:1000: «senza fuorigioco e **senza rimesse** il guardalinee non avrebbe niente da segnalare» | **Metà della motivazione è caduta: le rimesse esistono dal cantiere #87.** La riga oggi dice il falso. |

---

## QUATTRO COSE CHE HO SCARTATO O CORRETTO

Mi è stato chiesto di essere esatto, non solo severo.

1. **«Il pallone passa attraverso il portiere» (difetto 6) è impreciso.** Il MURO del corpo (gioco:21055-21071, letto oggi) **non ha guardia di ruolo**, quindi il portiere continua a respingere i tiri **sopra 420 u/s e sotto quota 26** anche col `kickCd` congelato. Quel che perde sono le **mani** (`tentaPresa`). C'è però un caso in cui è trasparente davvero: subito dopo il proprio rinvio la guardia `pi===b.lastTouch && p.kickCd>0` lo esclude anche dal muro, e **siccome `kickCd` non scende quell'esclusione dura finché non tocca il pallone qualcun altro.** Il difetto resta grave; la frase andava corretta.
2. **Il buco della Regola 12 sul portiere che riprende il proprio rinvio (voce 59) oggi non è raggiungibile**, perché lo maschera il difetto 6. Due difetti che si coprono a vicenda. Chi ripara l'uno senza toccare l'altro apre il buco lo stesso giorno.
3. **La «contraddizione» fra le due lenti sulla rimessa non era una contraddizione**: una guardava il motore (piede), l'altra l'animazione (due mani). Sono le due metà dello stesso difetto, e unite dicono una cosa peggiore di entrambe (voce 34).
4. **Non ho ri-misurato tre numeri e lo dichiaro**: l'errore del 22%/31% di `puntoCaduta` (voce 102), i 597-777 u/s all'arrivo del tiro (voce 103), e lo sfarfallio del portiere fra attesa e camminata (>600 volte a partita). Vengono da censimenti precedenti; le righe del gioco possono essere slittate. E la voce 89 (finestra del fallo per taglia) è **un'inferenza aritmetica, non una misura**: prima di agirci serve una passata di `_eventi.js`.

---

## LE DIECI COSE CHE CAMBEREBBERO DI PIÙ L'IMPRESSIONE DI REALISMO

1. **Dare una quota vera al tiro e al gioco aereo** (voci 1-5, 41). Oggi la porta è alta 52 e il tiro arriva a 15: non esistono incrocio, traversa, palla alta. È la singola assenza che più fa dire «non è calcio», e a valle ne sistema otto.
2. **Riparare il `kickCd` del portiere e rifargli l'uscita** (voci 6, 8, 9). Il portiere è senza mani per un quarto della partita e torna sulla linea proprio quando l'attaccante arriva: due righe e una formula, e il ruolo smette di essere un birillo.
3. **Un secondo verbo falloso: la trattenuta/spinta sul portatore** (voci 11, 12, 13). Con un solo fallo in tutto il calcio non esistono rigori, punizioni vere, gialli per proteste. È la radice di venti voci.
4. **L'angolo di imbardata del collo** (voce 16). Un solo grado di libertà, e ventidue teste smettono di guardare dritto davanti a sé. È il rapporto costo/resa più alto dell'elenco.
5. **Accendere il LOD a distanza di partita, o portare in campo tre dei sette dettagli che spegne** (voce 15). Oggi l'uomo in campo non ha volto, mani, colletto né barba: tutto il lavoro fatto sul ritratto non si vede mai.
6. **Errore sul passaggio e stanchezza dentro i gesti tecnici** (voci 18, 19, 20). Un'azione che non può sbagliare non è una partita, e una partita di 90 secondi in cui il minuto 85 è identico al minuto 5 non ha una fine.
7. **La barriera e la punizione giocata in campo** (voci 26, 27, 28). Metà dei calci piazzati del calcio è oggi una schermata alla distanza del rigore. È il momento più fotografato del calcio.
8. **La ribattuta sul rigore parato e l'angolo sulla parata** (voci 29, 30). Due esiti che nessun gioco di calcio si permette di non avere, e che oggi teletrasportano ventidue uomini.
9. **Il pubblico che fischia e applaude, e il replay su parata/palo/occasione** (voci 22, 24). Il materiale c'è già — `crowdLevel`, `G.rec`, `emettiFatto` — e si sta buttando via.
10. **La corsa all'indietro e una postura di ruolo** (voci 17, 92). Il difensore che arretra sprintando via dal pallone si vede in metà partita, ogni partita.

---

## CHE COSA È IMPOSSIBILE IN UN CANVAS 2D DALL'ALTO PROCEDURALE

Non come scusa: come vincolo da sapere **prima** di promettere.

- **La profondità fra due corpi.** L'ordine di disegno è un painter's algorithm sull'y: una gamba non può passare dietro la gamba di un avversario e davanti al suo busto. Fra figure l'occlusione parziale non è ottenibile senza cambiare renderer.
- **Il volto come recitazione.** A 47 unità di figura un volto è tre pixel. Espressione, sguardo e mimica possono vivere **solo** nel ritratto, nel duello e nel primo piano del gol — e lì oggi non vivono, il che è un difetto (voce 55), ma in campo resteranno sempre fuori portata.
- **Ombre proprie calcolate.** Un braccio che fa ombra sul busto richiede una proiezione per posa: il lavoro del #152 (tabelle di azimut e accesso ambientale cotte da Blender) è **la migliore approssimazione possibile qui**, ed è già fatta. Oltre quella non si va senza un motore 3D.
- **La fisica dei corpi con massa, caduta e smorzamento.** Ventidue corpi articolati con inerzia in JavaScript a 60 fps su telefono non stanno nel budget. **Quel che è ottenibile e oggi manca è molto meno costoso**: distinguere chi arriva lanciato da chi è fermo, e uno stato «a terra» come esito di un contatto.
- **Un motore di parole vero.** Una telecronaca a due voci con contesto è un progetto a sé; ma il **bus di eventi** esiste già (`emettiFatto`), e senza di lui ogni riga di racconto nascerà storta (voce 81).
- **La scala del tempo.** Una partita da 90-180 secondi reali non può contenere due tempi, intervallo, cinque sostituzioni ragionate e un recupero calcolato **senza comprimere il tempo in modo dichiarato**. Oggi `durataPartita()` è letteralmente secondi=secondi: finché è così, metà del regolamento non ha dove stare. **Questa è la decisione da prendere per prima, perché comanda A2, il recupero, il cumulo dei falli e il minuto di gioco.**

Tutto il resto di questo elenco — le regole, il portiere, la barriera, l'errore sul passaggio, l'imbardata del collo, la quota del tiro, i falli da contatto — **è ottenibile in questo motore.** Non è impossibile. Non è stato fatto.

---

## LA VERITÀ SCOMODA

**Hai ragione, e la prova non è un'opinione: è la forma di questo elenco.**

Il lavoro fatto finora ha privilegiato **ciò che un banco di prova sa misurare** su **ciò che un occhio vede**, e lo ha fatto in modo sistematico, non per caso. Tre prove.

**La prima.** La statura diversa fra i giocatori — la cosa che hai chiesto per nome — **esiste nel codice ed è spenta**: `CORPI` ha `g:1.00` su tutte e quattro le righe. È stata spenta perché una sonda del contrasto perdeva fino a 0,6 di rapporto su una figura. Il meccanismo è rimasto scritto, il cancello è verde, e i tuoi ventidue uomini sono alti uguali. **Una misura ha vinto contro un requisito tuo, e nessuno te l'ha chiesto.** La stessa cosa è successa al secondo filo di volume, spento per un budget dell'8% su un banco appaiato che non sapeva nemmeno prendere quella misura.

**La seconda.** Su 118 voci, **71 sono (C): non compaiono in nessun documento né commento.** Eppure questo repo ha `MANUALE.md` con un registro completo, `PUNTO-DEL-LAVORO.md` giorno per giorno, `MAPPA-MANDATO.md`, `DIFFERENZE-FC-MOBILE.md` con 158 voci di fisica numerate. **La documentazione è eccellente su ciò che è stato deciso e cieca su ciò che nessuno ha guardato.** Nessuno ha mai confrontato `GOAL_Z=52` con i `vz` che il gioco produce. Nessuno ha convertito `Z_SOPRA_TESTA=26` in metri. Nessuno ha misurato quante parate fa un portiere per gol subito, finché non gliel'ho chiesto oggi. Sono tutte domande da tre minuti, e sono **le domande di chi guarda una partita**, non di chi fa girare un cancello.

**La terza, la più dura.** Quattro verbi — strappo, scudo, contrasto in piedi, cross umano — **non escono mai in CPU contro CPU**, e tutte le misure di casa girano in CPU contro CPU. Il portiere è senza mani per il 24% dei fotogrammi da chissà quando, e nessun cancello l'ha visto **perché nessun cancello guarda il portiere come lo guarda un giocatore**. La batteria conta i gol, verifica il determinismo, sorveglia gli invarianti — e non ha mai chiesto «questa partita sembra una partita di calcio?».

Dove il metodo è stato messo al servizio di quello che si vede, ha prodotto le cose migliori del gioco: la voce #152 sulla frenata, la luce dalle tabelle Blender, la folla con l'ola e le sciarpe, la rete che trattiene, il gesso consumato, l'ora che avanza. **Non è il metodo il problema. È il bersaglio.** Un banco misura ciò che gli dici di misurare, e per mesi gli è stato detto di misurare la correttezza e la ripetibilità — che sono le cose giuste per non rompere il gioco, e sono le cose sbagliate per farlo somigliare al calcio.

**Una cosa in tua difesa e una contro.** In tua difesa: le esclusioni che hai firmato il 17 settembre erano ragionevoli per un gioco da 90 secondi in gabbia, e non sono la causa di questo elenco — 71 voci su 118 non le tocca nessuna. **Contro di te, una sola**: il cantiere #87 ha portato il campo vero a undici e ha invalidato la premessa del fuorigioco senza che nessuno se ne accorgesse, e le rettifiche a edizioni — la regola di casa — non sono state fatte. Se apri `MAPPA-MANDATO.md` oggi per decidere, **leggi almeno tre righe false**: che il vantaggio manca (esiste), che le sostituzioni non esistono (esistono), che la gabbia cancella il fuorigioco (a undici non c'è gabbia). **La casa ha scritto la regola giusta sulle rettifiche e non l'ha applicata a sé stessa.** Prima di spendere una giornata su questo elenco, quelle tre righe vanno corrette, altrimenti il prossimo cantiere nasce su una mappa che mente.