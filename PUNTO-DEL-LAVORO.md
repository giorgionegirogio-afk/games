# Dove siamo, e cosa manca

Aggiornato al **20 settembre 2026**. Questo file serve a riprendere senza
rileggere niente altro.

## La giornata del 20 settembre, in breve

| | cosa |
|---|---|
| 1 | **#125 CANTIERE CHIUSO — L'ONDA C COMINCIA (invariant-checker)** (due compiti dal merge-base `a7561d0`, primo anello dell'onda C del mandato — `_analisi/MAPPA-MANDATO.md` righe 574-641, 753-760; spec `docs/superpowers/specs/2026-09-20-invarianti-design.md`, piano `docs/superpowers/plans/2026-09-20-invarianti.md`). Nuovo banco `strumenti/_q-invarianti.js`: nove invarianti del mandato (Appendice A) verificate su partite CPU-CPU a seme fisso (20260920, taglia 5, 8 semi, 56.984 fotogrammi campionati, **9/9 verde**) — NaN/Infinity, owner valido, punteggio monotono, timeLeft monotono, durata<=13200 fotogrammi (INV-15), i cronometri-fratelli (recT/vantaggio/possOwner/possT/pulse/crowdSndT/swLock/swTimer) al riposo dopo startMatch (LA PIÙ A RISCHIO: cinque regressioni pagate a mano #86/#87/#107/#117/#122), il clamp fiato/cond in [0,100], >=2 uomini di movimento in campo, e la palla mai sotto il piano/velocità entro un tetto calibrato (1353 u/s orizzontale, 402 u/s verticale, empirico su 30 semi/222.282 fotogrammi, non teorico). Ciascuna nata rossa sul proprio bugiardo (`--bugiardo nan|owner|punteggio|timeleft|durata|fiato|movimento|ballz|ballvel`). **È UN BANCO, non codice nel motore**: legge G vivo via `__test`, zero costo a runtime, zero rischio nel motore — la mappa citava l'opzione "in-motore sotto flag" come non decisa, resta un seguito se il fuzzer lo chiederà |
| 2 | **#124 CHIUSO — il cambio di base di misura dei sorteggi, dichiarato.** `strumenti/_c3-sorteggi.js` faceva l'errore #108 (`setCpuVsCpu(true)` prima di `startMatch`, annullato in silenzio): la squadra 0 restava "umana immobile". Cura: scambio di due righe, sul modello di #121. I totali dei sorteggi cambiano perché la squadra 0 ora è CPU vera — **300.424 sorteggi (ordine vecchio) → 322.283 (ordine nuovo)** su 15 partite identiche: cambio di METODO di misura dichiarato, non un difetto; i confronti storici restano validi (simmetrici), i numeri nuovi non sono comparabili ai vecchi |
| 3 | **LA MAPPA INV-01..15 (mandato, Appendice A) dichiarata onestamente in `MANUALE.md`**: QUI (INV-02 parziale, INV-15), QUI ADATTATA (INV-03: ">=2 uomini di movimento" invece di "mai <7"), QUI parziale (INV-05 timeLeft, INV-11 clamp fiato/cond), ALTROVE (INV-01 `_q-determinismo`, INV-08 parziale `_q-regole`, INV-10 parziale `_q-umore`, INV-12 due-versioni/disegno-puro), RIMANDATA al fuzzer/soak (INV-04, INV-06, INV-07), N/A (INV-09 fuorigioco, INV-13/14 rete/submission — CALCETTO è locale). **Tre caveat a registro, candidati fuzzer**: (a) `G.swLock`/`G.swTimer` scritti solo da input umano, la prova 6 è debole su quei due campi in CPU-CPU; (b) il tetto della prova 9 (velocità palla, TETTO_VEL_PALLA=1353, margine 1,5x) è tarato empiricamente su CPU-CPU di serie, non ancorato a `TIRO_TETTO` — ancorare a `TIRO_TETTO+spin` sarebbe più difendibile, seguito; (c) INV-08 ("conteggi cartellino non decrescono") e INV-11 ("fatica non cresce durante i fermi") sono scoperte-ma-non-testate. **La non-scoperta sulla palla**: nessuna violazione P0 (z>=0 strutturale, velocità clampata dal gioco), il ramo "furto col corpo" che sembrava violare il tetto è una correzione per-frame non-volo, escluso di proposito dalla prova (lezione #112/#114) |
| 4 | **Batteria**: `_q-invarianti` registrato in `strumenti/tutti.js` (`conta:true`, modello regole/umore/cpu-ordine/accessibile, OK in 12s, corre in compagnia). Batteria intera rilanciata: **34 cancelli eseguiti in 588s di orologio (2,3 volte più veloce che in fila), 33 cancelli che contano tutti VERDI**; `audio.js` (lento, escluso dalla corsa di default) verificato a parte **28/28 VERDE** (stato dichiarato dal #122, non toccato qui); il solo informativo `istantanea.js` (non conta) **NO 46/56**, contro un riferimento del 20 agosto che era una prova NULLA — lo stesso schema già dichiarato dalle voci #113/#114/#122, non un peggioramento di questo cantiere — **«VERDE CON RISERVA»** complessivo. `git diff CALCETTO-il-gioco.html` vuoto per l'intero cantiere. Verbale completo in `MANUALE.md` §A registro, voce #125 |
| 5 | **LO STATO VERO A META' GIORNATA**: **onda B chiusa** (#117/#121/#122/#114/#113, righe della giornata del 19). **Onda C avviata**: **#125 CHIUSO** (riga 1-4, invariant-checker, primo anello) insieme al seguito **#124 CHIUSO** (riga 2, il cambio di base di misura dei sorteggi). RIGA SUPERATA dalla riga 5 della sezione "20 settembre, seconda parte" sotto (il fuzzer #126 ha girato, trovato due P0, e il cantiere dedicato #128 le ha curate) |

## La giornata del 20 settembre, seconda parte

| | cosa |
|---|---|
| 1 | **#126 (fuzzer, onda C-2) primo giro: DUE VIOLAZIONI VERE trovate** (spec/piano `docs/superpowers/specs/2026-09-20-crepe-fuzzer-design.md`, `docs/superpowers/plans/2026-09-20-crepe-fuzzer.md`). Comandi casuali deterministici via `Reg`+`Touch5` (voce #126, onda C-2, compito 1) hanno reso ROSSE due delle nove invarianti di `_q-invarianti.js` (#125): il cross-proiettile (`doCross`, dist non limitato — misurato 1433,8 u/s contro `TIRO_TETTO=860`) e il battitore espulso (`resetKickoff`, nessun controllo `out<=0` sulla scelta dell'idx1 — owner finiva su un giocatore appena espulso). Il committente ha scelto: cantiere DEDICATO (**#128**) per curare entrambe le P0 (mandato §13.3: «ogni bug ha prima un test fallito»), il fuzzer resta sospeso e riprende dopo, rebasato sul gioco curato |
| 2 | **#128 CANTIERE CHIUSO — le due crepe del fuzzer curate** (tre compiti dal merge-base `bc2d802`). **P0-1 doCross**: `Math.min(TIRO_TETTO, dist/T)` nella chiamata a `kickBall` (attrezzo `_t-crepe-docross.js`) — il cross oltre il tetto ricade prima invece di volare come un proiettile, il cross normale (399,07 u/s) invariato. **P0-2 resetKickoff**: `&& p.out<=0` sulla scelta del battitore + fallback `diMovimentoInCampo(kt)[0]` (attrezzo `_t-crepe-kickoff.js`) — un espulso non riceve mai più `G.ball.owner`, il kickoff normale invariato. Entrambe nate ROSSE sul test dedicato (prova 10/DOCROSS e 11/KICKOFF-ESPULSO di `_q-invarianti.js`), VERDI dopo la cura — **`_q-invarianti` 11/11** |
| 3 | **MOTORE_V: 1 → 2** (compito 3, attrezzo `_t-crepe-motorev.js`): le due cure cambiano l'esito di sequenze di comandi identiche (misurato: seme 20260812 diverge al fotogramma 1059 sul cross lungo; seme 20260836 dà 3-4 invece di 1-2 sul kickoff dopo espulsione) — un nastro vecchio rigiocato sul motore curato darebbe un'altra partita. `Sfida.guarda` (meccanismo della voce #107, invariato) lo rileva e rifiuta con causa vera e zero penalità, **verificato coi numeri**: `_q-regole.js` prova 13/NASTRO-VERSIONE estesa con un CASO C (nastro a MOTORE_V=1 esplicito, rigiocato sul gioco a MOTORE_V=2, rifiutato) — e un buco proprio nella prova B della stessa prova, un valore inchiodato (`===1`) che si sarebbe rotto da solo proprio oggi, trovato e chiuso (`>0`, non più legato al numero). **Due-versioni dichiarato per taglia**: doCross **16/60** (`_c3-sorteggi`, taglie 5/7/11), resetKickoff **1/120** (sequenza CPU-CPU) — diverge per costruzione, `_q-determinismo` resta **10/10** |
| 4 | **Il residuo di determinismo cross-partita: artefatto A TAGLIA 5, non un bug del gioco A QUELLA TAGLIA — a 7/11 è un canale VERO e SEPARATO, la voce #98, ora con causa isolata** (correzione di revisione: la diagnosi originaria generalizzava oltre quanto misurato). Durante la diagnosi di P0-2 la stessa coppia di semi dava partite diverse a seconda di quante ne precedevano sulla stessa pagina. Isolato **a taglia 5**: la simulazione resta deterministica rispetto a {seme, comandi} (byte-identica fresca contro dopo-N-partite, a parità di `startMatch`); il canale che sopravvive, a quella taglia, è quello dei TOCCHI (input-a-dita, documentato dal gioco stesso accanto a `Reg`, ~:13183 — la levetta e i verbi a tenuta non si azzerano da soli fra una partita e la successiva sulla stessa pagina se non lo fa chi chiama); il **soak (#127) non ne è affetto a taglia 5**; il **fuzzer (#126)**, a dita vere, dovrà azzerare `Touch5`/`Reg` fra le partite a quella taglia. **A taglia 7/11 «zero dita» non basta**: `_q-determinismo` dà **8/10** (contro 10/10 a 5) — la voce #98, pre-esistente su `main`. Causa ORA ISOLATA: `startMatch`→`setTaglia`→`rebuildCrowd` (`CALCETTO-il-gioco.html:29922-29949`) consuma `dado()`/`SEME` in proporzione al perimetro del campo sulla prima partita giocata a una data taglia (~114.026 estrazioni in più a taglia 11: `SEME.n` 114.093 contro 67), e lo stream del PRNG di gioco slitta — non è una regressione di questo cantiere. Seguito ingegneristico aperto **#129**. Consegna a #126/#127: girare a taglia 5, o dichiarare la #98 a 7/11 |
| 5 | **LO STATO VERO, oggi**: **onda B chiusa** (riga 5 della prima parte). **Onda C**: **#125 CHIUSO** e **#124 CHIUSO** (righe 1-4 prima parte), **#128 CHIUSO** (righe 1-4 di qui: le due P0 del fuzzer curate, MOTORE_V 1→2, il residuo dei tocchi diagnosticato a taglia 5, la voce #98 a 7/11 isolata). **RESTANO, in ordine**: il **fuzzer #126** (da riprendere rebasato sul gioco curato — i suoi test 9/2 tornano verdi per costruzione — completando duello, INV-04 e batteria, a taglia 5, con la nota sui tocchi da azzerare fra partite), poi il **soak #127** (1000 partite/notte, zero violazioni, a taglia 5). **#123** resta fuori onda, a registro. **Seguiti aperti residui, nessuno bloccante**: **#89, #97, #98 (causa isolata, vedi riga 4), #99, #101, #102, #103, #104, #105, #106, #109, #118, #129 (nuovo: la cura ingegneristica del PRNG di `rebuildCrowd`/`setTaglia`)** |
| 6 | **Batteria**: `node strumenti/tutti.js` — **34 cancelli eseguiti in 949s di orologio (2,3 volte più veloce che in fila), i 33 che contano tutti VERDI** (`abbandono`/`audio`/`volti`/`avvio`/`avvio-telefono` esclusi dalla corsa di default); `audio.js` verificato a parte **28/28 VERDE** (stato dichiarato dal #122); il solo informativo `istantanea.js` **NO 46/56**, contro un riferimento del 20 agosto che era una prova NULLA — lo stesso schema già dichiarato da #113/#114/#122/#125, non un peggioramento di qui — **«VERDE CON RISERVA»**. `git diff CALCETTO-il-gioco.html` per l'intero cantiere: due ancore nel compito 1 (clamp doCross), due nel compito 2 (condizione+fallback resetKickoff), una nel compito 3 (MOTORE_V). Verbale completo in `MANUALE.md` §A registro, voce #128 |

## La giornata del 19 settembre, in breve

| | cosa |
|---|---|
| 1 | **#117 CANTIERE CHIUSO — MIND v1** (il registro dei fatti e il modello emotivo, sei compiti dal merge-base `f352af5`, prima voce dell'onda B del mandato: `_analisi/MAPPA-MANDATO.md` §2, spec `docs/superpowers/specs/2026-09-19-mind-v1-design.md`). `G.fatti` (registro passivo, 15 tipi di evento), `p.umore`/`p.nervi`/`G.spinta` (tre stati derivati dai fatti, zero `dado()`), il canale `manopolaDi(p)` (passErr/slideP/standoff modulati per giocatore, mai sull'input umano), i due canali d'occhio (mesto dai fatti, folla+banner sulla spinta). `p.celeb`/`p.mesto` erano già due stati emotivi: il MIND li rende l'espressione di stati continui, non li inventa. Banco `strumenti/_q-umore.js` nato ROSSO con la sola prova REGISTRO, arrivato a **30 prove su 30** (REGISTRO/STATI/CANALE/TETTI/TESTIMONE/SPECCHIO/INPUT-SACRO), le due versioni bugiarde (`_crit-mind-tetto.js`, `_crit-mind-muto.js`) condannate ciascuna sulla propria prova |
| 2 | **Giocabilità misurata, DENTRO BANDA**: `_eventi.js`, `f352af5` contro la punta, 300 partite CPU-CPU per versione (semi 20260803..20261102, taglia 5): gol/90s media 2,72→2,63 (**-3,3%**, ben dentro il ±20% del committente), MOMENTI DA PORTA/min -2,8%, EVENTI/min -0,3%. **Nota di metodo**: la MEDIANA di gol/90s è instabile a piccoli N (+50% a N=30, -33% a N=100, -17% a N=300, segni opposti sulla STESSA coppia di versioni) — è rumore di campionamento su un conteggio a piccoli interi, non il gioco: la MEDIA è l'indicatore stabile qui. L'hang #119 (freekick, preesistente) non si è manifestato in 860 partite campionate su nessuna delle due versioni |
| 3 | **UNA REGRESSIONE TROVATA E RIPARATA RILANCIANDO LA BATTERIA INTERA** (quinta occorrenza della lezione ricorrente, la 22 in fondo a questo file: #86/#87/#107/#112 ne avevano già pagata una). `strumenti/_q-replay.js` è uscito ROSSO sulla prova E ("registrare non cambia il gioco"): accendere il registro del nastro spostava la fisica della stessa partita a seme fisso dal fotogramma 80. Bisecato ai quattro compiti: verde su `cb23512`/`53007c5` (compiti 1-2), rosso da `8824222` (compito 3) in poi. Causa vera PRE-ESISTENTE: `G.swLock`/`G.swTimer` (isteresi del cambio-giocatore automatico) non erano MAI azzerati da `startMatch` — il sesto cronometro fratello di `G.recT`/`G.vantaggio` (già riparati il 31 agosto e a #107). Si vede solo dal compito 3 perché `manopolaDi(p)` è la prima lettura a far dipendere una decisione della CPU da quale giocatore specifico è sotto controllo umano. **Irrilevante per ogni misura CPU-CPU** (verificato: numeri di giocabilità e sorteggi identici cifra per cifra prima/dopo la cura) — riguarda solo la squadra umana di una sfida vera. Curato (`strumenti/_t-swlock-reset.js`, un ancoraggio, zero sorteggi nuovi): `_q-replay.js` torna **10/10**. L'altro rosso della stessa corsa, `audio.js` (parata del portiere → crowdLevel×8-9 jingleTick), è **PRE-ESISTENTE** su `f352af5`, scollegato dal MIND: seguito **#120** aperto, non curato qui. Batteria intera rilanciata DOPO la cura: **36 cancelli eseguiti, 33 con verdetto valido che conta, 32 verdi, 1 rosso** (`audio.js`, pre-esistente) |
| 4 | **La divergenza dei sorteggi, dichiarata per taglia** (`_c3-sorteggi.js`, `f352af5` contro la punta, per costruzione — il canale del compito 3 cambia le decisioni della CPU): taglia 5 **18/20**, taglia 7 **19/20**, taglia 11 **20/20**, totale **57/60**. `_q-determinismo --partite 4` resta **13/13** (l'invariante del multigiocatore, intatta). Verbale completo in `MANUALE.md` §A registro, voce #117 |
| 5 | **RESTANO, in ordine**: **#118 (MIND v2)** — contagio nel tempo, peso del capitano, regolazione senza intervallo, la striscia del momento post-partita, il volto che cambia, il dischetto sotto pressione, l'HUD dell'umore (il "Fuori perimetro" dello spec §6); la **voce #89** (meccaniche dei verbi, cantiere della decomposizione del 1° settembre). **Seguiti nuovi**: **#119** (l'hang del freekick, ~metà delle partite CPU-CPU a taglia 5 bloccate, cantiere dedicato), **#120** (il rosso pre-esistente di `audio.js`, mai indagato prima perché mai emerso finché la batteria intera non è stata rilanciata). **Seguiti aperti, nessuno bloccante**: **#97, #98, #99, #101, #102, #103, #104, #105, #106, #108/#110, #109, #113, #114, #115, #118, #119, #120** — RIGA SUPERATA dalle righe 6-8 sotto (#108/#110/#119/#120 chiusi, #116 nato e chiuso) |
| 6 | **#121 CANTIERE CHIUSO — pulizia #108** (seguito #108, quattro commit `1a863e5..39810c4`, **in `main`**, stesso giorno): applica la cura #108 (ordine `setCpuVsCpu`/`startMatch` — la chiamata che ARMA la CPU deve venire DOPO quella che AVVIA la partita, mai prima) ai tre banchi di batteria che la sbagliavano. Compito 1: `_q-battute.js` (5 siti) e `_q-regole.js` (15 siti) — la PROVA 1 di quest'ultimo riscritta (I4b) per reggere l'esito lecito del vantaggio-in-area con la CPU vera (gol della squadra offesa prima del rigore ritardato), **16/16** verde. Compito 2: `_q-umore.js` (5 siti, RISCHIO CONCRETO dichiarato dal progetto — le prove TETTI/TESTIMONE misuravano su una sola CPU vera invece di due), **30/30** verde, nuovi massimi osservati per le tre manopole del MIND (nessun tetto della formula superato — solo il massimo osservato cambia, vedi `MANUALE.md` voce #117 punto 3). Compito 3: nuovo banco anti-regressione `strumenti/_q-cpu-ordine.js` (**3/3**, verbale mancante fino ad oggi — aggiunto in `MANUALE.md` dalla riga 8 sotto), che interroga il COMPORTAMENTO del gioco sull'ordine delle due chiamate ad ogni corsa in batteria, invece di elencare i file noti di un censimento — **CHIUDE #110** ("il banco che non congela"). La correzione dell'ordine nei tre banchi elimina anche il sintomo diagnosticato da **#119**: con l'ordine giusto, 0 partite su 31 restano bloccate in `freekick` (diagnosi esperimento A, coerente con le partite CPU-CPU vere misurate nei compiti 1-2) — **#119 CHIUSO**. **#108 CHIUSO** su tutti e tre i banchi di batteria (restano ~22 strumenti d'archivio col vecchio ordine, fuori batteria, fuori perimetro — censimento in `MANUALE.md` voce #107, I4). Due-versioni non applicabile (nessuna cura tocca il gioco: `CALCETTO-il-gioco.html` non toccato in nessuno dei tre compiti) |
| 7 | **#122 CANTIERINO CHIUSO — spiccioli di seguito** (tre compiti dal merge-base `470149a`, chiusura di pendenze minori decisa dal committente dopo #117/#121; piano `docs/superpowers/plans/2026-09-19-spiccioli-seguiti.md`): **#120** (il rosso pre-esistente di `audio.js`, riga 3 sopra) curato NEL BANCO — lo scenario "parata del portiere" ora azzera `b.lastTouch`/`b.toccoPiede` prima di simulare (la guardia del retropassaggio, voce #107, rifiutava il tiro come autopassaggio), `audio.js` **28/28** (era 27/28); il gioco non è toccato. **#116** ("il numero fantasma", nato e chiuso nello stesso cantierino): il sottotesto di SOTTOTITOLI non promette più gol/palo che il flag `SAVE.sott` non governa — "fischio — a video". **#115**: la freccia di direzione non copre più l'arco del fiato (ordine di disegno invertito dentro `anelloComandato`, nessuna geometria toccata), con `_q-accessibile.js` esteso a un confronto DIFFERENZIALE (fiato 55/70, freccia dentro/fuori la zona accesa) che nasce rosso sul gioco PRE-#115 (diff 0,0333) e verde dopo (diff 0,0000) — un confronto assoluto con la tolleranza delle altre righe non l'avrebbe scoperto (il cuneo della freccia si restringe verso la punta, dove vive l'arco: l'overlap vero è molto più stretto dei ~53° nominali della base). Cancelli: due-versioni (`_c3-sorteggi`, base `470149a`, taglie 5/7/11) **0/60**; `_q-determinismo` **10/10** intatto; `_q-accessibile.js` **7/7**; `istantanea.js` — stesso schema OK/NO prima/dopo (47 OK, 10 NO). Attrezzi a specchio (`_t-sott-onesto.js`, `_t-freccia-fiato.js`) verificati byte per byte. Verbale in `MANUALE.md` §A registro, voce #122 |
| 8 | **LO STATO VERO, oggi** (questa riga sostituisce la riga 5: `PUNTO-DEL-LAVORO.md` era fermo al commit `48921bd`, prima delle quattro righe sopra). **Onda A CHIUSA** da tempo (#86/#85/#87/#107/#112, più le pendenze minori #120/#116/#115 appena chiuse dalla riga 7). **Onda B INIZIATA**: **MIND v1** (#117, riga 1, **in `main`**) e una prima pulizia già incassata (**#121**, riga 6, **in `main`**). **CHIUSI da questa giornata**: #108, #110, #119 (riga 6), #120, #116, #115 (riga 7). **Seguiti aperti residui, nessuno bloccante**: **#109** (il corpo del portiere che scala col campo — richiede un censimento a tutto il file), **#118** (MIND v2 — contagio nel tempo, peso del capitano, regolazione senza intervallo, la striscia del momento post-partita, il volto che cambia, il dischetto sotto pressione, l'HUD dell'umore). **#114 CHIUSO** dalla riga 9 sotto (banco fotosensibile ancorato a WCAG), nuovo seguito **#123**. **#113 CHIUSO** dalla riga 10 sotto (mira guidata a due pesi — chiude insieme al #114 la coppia di accessibilità), nuovo seguito **#124**. Restano fuori dal mandato, mai assorbiti, nessuno bloccante: **#89** (meccaniche dei verbi), **#97, #98, #99, #101, #102, #103, #104, #105, #106** |
| 9 | **#114 CANTIERE CHIUSO — il banco fotosensibile ancorato a WCAG** (tre compiti dal merge-base `ebf6bb1`, seguito del #112: spec `docs/superpowers/specs/2026-09-19-fotosensibile-wcag-design.md`, piano `docs/superpowers/plans/2026-09-19-fotosensibile-wcag.md`). `strumenti/_q-fotosensibile.js` misura ora in luminanza relativa WCAG vera (linearizzazione gamma per canale, non più byte sRGB grezzi), rileva i flash come coppie di transizioni opposte (ampiezza >=0,10, scuro <0,80, finestra 1 s, verdetto <=3 flash/s = 3 Hz — non più `PROMINENZA_MIN=1,5` tarato sul gioco), applica il criterio d'area WCAG (0,006 sr / 25% di un campo di 10°, proxy 2,7751% del canvas dalla risoluzione di riferimento 341x256@1024x768) come filtro a valle, e prova il red flash (R/(R+G+B)>=0,80 + Δu'v'>0,2, CIE 1976 UCS). **Verifica autorevole**: le sei scene reali (gol ravvicinati, sera, dischetto; moto on/off) tutte VERDI a seme fisso — nessuna supera 3 flash/s su nessun canale (il gol resta a 1 flash/s nonostante il 33% di area di picco, per il tetto strutturale della durata della festa; folla/duello restano sotto la soglia di ampiezza, un ordine di grandezza sotto 0,10); `--controllo` condanna GRANDE (4 Hz schermo intero, 5/s di picco) e RED FLASH (4 Hz, #ff0000, 5/s su entrambi i canali) ed ESENTA PICCOLO (quadratino sotto soglia d'area, 4 Hz, 15 flash rilevati e tutti esenti) — il banco discrimina, non attesta. Saturazione rossa massima misurata su tutte le tinte del gioco: **0,623**, sotto la soglia 0,80. **IL LIMITE DICHIARATO**: il banco misura sulla media whole-canvas — (a) l'area è prevalentemente formale per QUESTO gioco (folla/duello già sotto soglia di ampiezza prima del filtro); (b) resta un buco teorico generale (un lampo fra ~2,77% e ~10% dello schermo ad alta frequenza sfuggirebbe alla media, che non lo vedrebbe nemmeno come flash) — il gioco di oggi non ha una sorgente in quella fascia, ma un analizzatore WCAG completo richiederebbe il rilevamento PER-REGIONE per chiuderlo — **seguito #123**; (c) il red flash soffre dello stesso limite (b) e non ha un filtro d'area proprio. Rettifica a edizioni della frase del #112 («nessuno strobo forte oltre 3 Hz», soglia tarata) fatta in chiaro in `MANUALE.md`, con la data accanto, senza cancellare il vecchio testo. Batteria (`strumenti/tutti.js`, `fotosensibile` già registrato `conta:true` dal #112, invariato) eseguita per intero: **31/31 cancelli che contano tutti VERDI** (`fotosensibile` OK in 42s), `audio.js` (lento, escluso dalla corsa di default) verificato a parte **28/28 VERDE** (il rosso pre-esistente del #120 resta curato dal #122, nessun residuo), il solo informativo `istantanea.js` (non conta) «NO» contro un riferimento nullo del 20 agosto (pattern già noto, non un peggioramento di questo cantiere) — «VERDE CON RISERVA» complessivo. `git diff CALCETTO-il-gioco.html` vuoto in tutto il cantiere. Verbale completo in `MANUALE.md` §A registro, voce #114 |
| 10 | **#113 CANTIERE CHIUSO — la mira guidata a due pesi** (tre compiti dal merge-base `d3169d3`, seguito §9.2 del mandato; spec `docs/superpowers/specs/2026-09-19-mira-guidata-design.md`, piano `docs/superpowers/plans/2026-09-19-mira-guidata.md`), **CHIUDE INSIEME AL #114 (riga 9) LA COPPIA DI ACCESSIBILITÀ** scelta dal committente dopo il MIND/#121. Scelta **(A)** dichiarata: due pesi sullo SCOPE di `switchControlled` (il salto di controllo post-passaggio di #88), non (B) un aiuto geometrico né (C) un ibrido — la geometria tarata di #88 (cono filtrante, errore angolare del tiro, 297 tiri misurati) resta intatta. `SAVE.miraGuidata` in `{'pieno','essenziale'}`, default 'pieno' (salvataggi vecchi bit-identici), letto una volta in `startMatch`; 'essenziale' restringe il salto ai soli cross, lasciando i passaggi corti senza salto anticipato; le sfide (`Sfida.gioca`/`guarda`) forzano 'pieno' come già fanno con `sponde:'gabbia'`. **Giocabilità misurata** (seme 113001, taglia 5): col peso 'pieno' cross e passaggio saltano ENTRAMBI al fotogramma 13; con 'essenziale' il cross salta ancora al 13 (nessun nuovo fastidio), il passaggio NON salta più entro soglia (20 fotogrammi) — il controllo passa al compagno solo al fotogramma 32, per il fallback naturale pre-#88, non per la mira guidata: il fastidio previsto da #88 §4.2 sui passaggi corti è risolto senza perdere l'aiuto sul cross. **MOTORE_V NON incrementato**: PIENO-IDENTICO (`_q-mira.js`) dà **0 differenze su 60 fotogrammi, due scene** fra `fuori/base113.html` e il curato col peso 'pieno' — resta a **1**. **SFIDA-DETERMINISTICA verificata dal vivo**: con `SAVE.miraGuidata` locale='essenziale', dopo `Sfida.gioca` sintetica `G.miraGuidata` legge 'pieno' (il SAVE locale è ignorato); `_q-replay` prova B resta **verde, 120 campioni** a peso fissato. **CPU-cecità**: `switchControlled` salta già le CPU per costruzione (guardia `G.ctrl[t]<0`, da #88); il gate ufficiale pieno-contro-pieno (base113/curato) è **0/60 in ENTRAMBI gli ordini** di `setCpuVsCpu` — un confronto DIVERSO (pieno-contro-essenziale, non il gate) fatto con l'ordine sbagliato del tool aveva mostrato 58/60 al compito 1, artefatto della squadra "umana ferma" che resta dentro la guardia; **nuovo seguito #124** (correggere l'ordine dentro `_c3-sorteggi.js` stesso, sul modello della cura #121). **Batteria**: `_q-mira.js` (5/5: SCOPE, SCOPE-BASE113, PIENO-IDENTICO, MIRA-UI-STILE, MIRA-ARIA) registrato in `strumenti/tutti.js` (`conta:true`, modello `regole`/`accessibile`/`umore`/`cpu-ordine`); batteria intera rilanciata (`strumenti/tutti.js`, corsa di default): **33 cancelli eseguiti, 32 che contano tutti VERDI** (`mira` OK in 12s), `audio.js` (lento, escluso dalla corsa di default) verificato a parte **28/28 VERDE** (stato dichiarato dal #122, non toccato qui), il solo informativo `istantanea.js` (non conta) «NO» **46/56** contro il registro del 20 agosto — lo stesso schema già dichiarato dalle voci #114/#122 (il riferimento era una prova NULLA, non un peggioramento di questo cantiere) — «VERDE CON RISERVA» complessivo. `_q-determinismo --partite 4` **13/13** intatto. `git diff CALCETTO-il-gioco.html` vuoto per l'intero cantiere: il gioco non è mai stato toccato dal compito 3. Verbale completo in `MANUALE.md` §A registro, voce #113. **Seguiti aperti residui, nessuno bloccante**: **#109, #118**, più **#124** nuovo di questa riga; **restano fuori dal mandato**: **#89, #97, #98, #99, #101, #102, #103, #104, #105, #106, #123** |

## La giornata del 18 settembre, terza parte

| | cosa |
|---|---|
| 1 | **#112 CANTIERE CHIUSO — L'ONDA A SI CHIUDE** (spiccioli di UX e accessibilità, sei compiti dal merge-base `73c1c64`, ultima voce dell'onda A del mandato). Le sei cure, tutte di puro contorno (zero `dado()`, zero stato che la CPU legge): **1.** `aria-pressed` sincronizzato sui **5** interruttori `.voce.sw`, banner dichiarato in `zoneInterfaccia()`. **2.** `SAVE.vibInt` a tre valori (leggera/normale/forte), `buzz()` scala la durata — corretta in revisione una riga CSS mancante (prova **VIBRAZIONE-STILE** nuova). **3.** RIVEDI IL TUTORIAL azzera entrambi i flag (`tutorialDone`+`tutorialVisto`), sottotitolo onesto, il tutorial vero riparte alla guardia esistente. **4.** Sottotitoli degli eventi sonori (`SAVE.sott`): le chiamate mancanti aggiunte ai 4 fischi muti (inizio/fine/le due ripresa), gli altri **9 siti di codice** con banner preesistente intatti (**correzione di revisione del compito 6**: 13 `Audio5.whistle(` totali − 4 curate = 9; RIMESSA/ANGOLO/RINVIO sono un solo sito di codice con tre varianti testuali, non tre siti). **5.** L'anello del fiato: arco lime dentro `anelloComandato`, proporzionale a `p.fiato`, misurato pixel per pixel (0 / 0,419 / 0,828 a fiato 0/40/80) — **seguito #115** per i due residui (freccia che copre il lime, leggibilità della quota intermedia). **6.** Banco nuovo `strumenti/_q-fotosensibile.js`: luminanza a schermo intero su tre sorgenti (folla, dischetto, il lampo+9 raggi del gol — l'unico a coprire tutto lo schermo), sei scene tutte verdi (picco 1 lampo/finestra di 1s contro un tetto di 3), `--controllo` a 4 Hz condannato (picco 5) — la prova che il banco discrimina. Registrato in batteria insieme a `_q-accessibile.js` (7/7, mai registrato prima d'ora). **LIMITE DEL BANCO, dichiarato** (correzione di revisione del compito 6): filtra per ESCURSIONE (`PROMINENZA_MIN=1,5`) prima di contare la frequenza — cieco a strobo piu' deboli a QUALUNQUE frequenza, tarato sul gioco di oggi, non su una soglia clinica; garantisce «nessuno strobo FORTE oltre 3 Hz», non «fotosensibile-safe» in assoluto — seguito **#114** per ancorarla a WCAG/Harding |
| 2 | **UNA REGRESSIONE TROVATA E CURATA chiudendo il cantiere**: la prima esecuzione della batteria INTERA su questo ramo (nessun compito di #112 aveva `disposizione.js` fra i cancelli sorvegliati) ha trovato `disposizione.js` **ROSSO** — **correzione di revisione del compito 6**: verde sul merge-base, poi **ROSSO da fine compito 4 in poi** (compreso fine compito 5: il compito 4 ha introdotto SOTTOTITOLI e nessun compito successivo l'ha mai rimossa, quindi non poteva tornare verde da sola), fino alla cura di oggi (compito 6) — il compito 5 non aveva `disposizione.js` nel proprio elenco di cancelli da sorvegliare, e per questo non se n'è accorto (è proprio la lezione 22 sotto). Causa vera: la terza voce (SOTTOTITOLI) aggiunta alla sezione «Accessibilità» del pannello IMPOSTAZIONI l'ha resa dispari, orfana nella griglia a due colonne. Il CSS aveva già una cura generica pronta e mai applicata (`.setwrap>.sola`); curata con un ancoraggio di una riga (`strumenti/_t-sottotitoli-sola.js`), zero `dado()`, due-versioni ancora 0/60 |
| 3 | **IL DUE-VERSIONI 0/60 DELL'INTERO CANTIERE #112**, la firma del contorno: `_c3-sorteggi.js` dal merge-base `73c1c64`, taglie 5/7/11, **0 partite su 60 con un conto diverso** (567.871=567.871) — nessuna delle sei cure ha spostato un sorteggio. `_q-determinismo --partite 4` **13/13**. Verbale completo in `MANUALE.md` §A registro, voce #112, coi due Minori del compito 4 chiusi nel testo (GOL/PALO restano sempre visibili, il flag copre solo i fischi; il sottotesto del bottone può trarre in inganno, chiarito) |
| 4 | **ONDA A DICHIARATA CHIUSA.** Le cinque voci del programma approvato dal committente sono tutte curate: **#86** (vernice/proporzioni ufficiali, 7 settembre), **#85** (moviola fluida, 7 settembre), **#87** (rimesse/angoli, 18 settembre), **#107** (regole a leva corta + versione motore nel nastro, chiude anche #96, 18 settembre), **#112** (spiccioli di UX, 18 settembre). **RESTANO, in ordine**: l'**onda B** (il registro dei fatti, P0 prerequisito, e **MIND v1** — mappa completa in `_analisi/MAPPA-MANDATO.md` §2) e la **voce #89** (meccaniche dei verbi: filtrante, cross e rovesciata sul modello del paragone — cantiere della decomposizione del 1° settembre, non assorbito dal programma del mandato). Seguito nominato **#113** (MIRA GUIDATA a due pesi sull'intent-resolution di #88, mandato §9.2, 2 g — tocca il gameplay, fuori perimetro del contorno); **seguito #115** (correzione di revisione del compito 6: numerato invece che lasciato in prosa) per i due residui dall'anello del fiato (compito 5, non bloccanti): la freccia di direzione può coprire ~53° di lime nella zona accesa; la leggibilità della quota intermedia non è misurata oltre i due estremi. **Seguiti aperti, nessuno bloccante**: **#97, #98, #99, #101, #102, #103, #104, #105, #106, #108/#110, #109, #113, #114, #115** (**#96 CHIUSO** dalla voce #107, **#111 CHIUSO** dalla stessa voce) |

## La giornata del 18 settembre, seconda parte

| | cosa |
|---|---|
| 1 | **#107 CANTIERE CHIUSO** (le regole a leva corta, prima voce dell'onda A del mandato, quattro compiti dal merge-base `cabf7e4`). Il rigore legge l'area vera invece della fascia fissa `zonaCalda` (divergenza pura nella banda-y, per costruzione a ogni taglia); il portiere rifiuta il retropassaggio di un compagno (`b.toccoPiede`, 17 siti censiti + guardia, respinta-da-corpo — divergenza dichiarata 3/20-7/20-2/20 per taglia); il vantaggio esiste (finestra `VANT_T=2,5s` da moto libero, fischio ritardato dal punto salvato, cartellino in differita) con la CONTABILITÀ ARBITRALE rettificata: **~1 finestra/partita**, sfumato ~65%, **pieno 26-27%**, morti-lampo **30%→0%** (taratura F1), il sentinel curato **5%→0%** (W1, chiusura arbitrale), il cartellino che non si perde più (micro-coda), falli **~1,0/partita**. Banco `_q-regole.js` da 4 a **13/13** prove nei quattro compiti |
| 2 | **#96 CANCELLO DI PUBBLICAZIONE: CHIUSA.** Il nastro delle sfide porta `MOTORE_V` (nuova costante, nasce a 1 perché #87 e #107 hanno già cambiato il motore prima che esistesse) in un campo di testa del serializzato; `Sfida.guarda` confronta la versione PRIMA di `startMatch` e, se non combacia (o manca: nastri di prima di oggi = versione 0), chiude con la CAUSA VERA invece dell'accusa sbagliata al profilo cresciuto — zero penalità: nessuna partita si avvia, nessun punto, nessun invio al server. Prova NASTRO-VERSIONE (tredicesima di `_q-regole.js`), nata rossa 12/13 sulla base pre-cura. **L'APK SI SBLOCCA** |
| 3 | **SEGUITO #108 nato** (dalla chiusura arbitrale del compito 3, portato qui in MANUALE/PUNTO come richiesto): LA TRAPPOLA DEL BANCO CONGELATO — `setCpuVsCpu(true)` chiamato prima di `startMatch(...)` viene annullato in silenzio da `G.cpu` scritto dentro `startMatch`, e la squadra 0 resta un "umano" immobile invece di una CPU vera. **RETTIFICA (onda di correzione della revisione finale, riga 6 sotto): il censimento vero è 25 strumenti**, non dieci — COMPRESI `_q-regole.js` (15 siti a HEAD — erano 11 a `b837824`: le prove nuove di quest'onda ne hanno aggiunti 4) e `_q-battute.js` (5 siti), entrambi IN BATTERIA (`conta:true`), non solo banchi diagnostici isolati (`_c3-sorteggi.js`/`_crit8-*`/`_crit10-*` erano solo gli esempi citati, mai il conto intero). I loro confronti due-versioni RESTANO validi (simmetrici), ma nessuno di quegli scenari era mai stato CPU-CPU vero, e applicare la cura oggi farebbe cadere la PROVA 1 di `_q-regole.js` (RESA ROBUSTA dalla riga 6, I4b). Proposta di cura lato gioco (`setCpuVsCpu` a prova d'ordine) con la nota sulla comparabilità storica — **decisione del committente**, non applicata; seguito raffinato in **#110** (riga 6). La LEZIONE: un banco che congela una squadra misura il banco, non il gioco (vedi «Le regole pagate» sotto) |
| 4 | **RESTANO, in ordine**: il prossimo dell'**onda A** sono gli **spiccioli UX** (tutorial, anello del fiato, aria-label, cursore vibrazione, ~3 g) — ultima voce dell'onda A, che con #107 chiuso è quasi tutta incassata. Poi l'**onda B**: il registro dei fatti (P0, prerequisito) e **MIND v1** (mappa completa in `_analisi/MAPPA-MANDATO.md` §2). **Resta la voce #89** (meccaniche dei verbi, cantiere della decomposizione del 1° settembre, non assorbito dal programma). **Seguiti aperti, nessuno bloccante**: **#97, #98, #99, #101, #102, #103, #104, #105, #106, #108/#110, #109** (**#96 CHIUSO** dalla riga 2 sopra, **#111 CHIUSO** dalla riga 6 sotto) |
| 5 | **RETTIFICA — correzione di revisione del compito 4 (voce #107), stessa giornata**: il ri-verdetto ha trovato **due affermazioni false** nel rapporto del compito 4 — «27 cancelli che contano» e «`proporzioni` esce BANCO, pre-esistente e non una regressione». Colpevole: il BANCO, non il gioco. Lo scenario PUGNI di `strumenti/_q-proporzioni.js` teletrasportava il pallone 4000 volte senza mai azzerare `b.lastTouch`/`b.toccoPiede`, restati il tocco di un compagno del calcio d'inizio; la guardia del retropassaggio (giusta, compito 2) rifiutava quindi le mani per sempre — 0/4000. Nata in **81d8c59 (compito 2 di QUESTO cantiere)**, non pre-esistente: invisibile perché la batteria intera non era stata rilanciata fra il compito 2 e il compito 4. Cura nel banco (arma `b.lastTouch` su un avversario prima di ogni tentativo): **30/30 verde su HEAD e su `81d8c59`**, il gioco non era mai stato colpevole. Numero vero della batteria: **28 cancelli che contano, tutti verdi** (2+11+8+7), non 27. Zero `dado()` toccati (`_c3-sorteggi.js`, base compito 4 contro HEAD: 0/60). Lezione 21 in «Le regole pagate» sotto. Verbale in `MANUALE.md` §A registro, voce #107 |
| 6 | **ONDA DI CORREZIONE DELLA REVISIONE FINALE su #107** (18 settembre, un commit): **C1 CRITICO curato** — il raggio di respinta del retropassaggio (`tentaPresa`) restava dentro il cerchio della raccolta generica a taglia 11 (`P_R+B_R=7,5` contro `KICK_R*0.8=20,8`: il retropassaggio non mordeva mai a quella taglia; a 5/7 il margine era 0,2 unità, un rasoio); cura `Math.max((P_R+B_R)*dist_, KICK_R*0.8+0.5)`. **I2**: `startMatch` non azzerava `G.vantaggio` — un sentinel col cartellino pendente sopravviveva a una partita nuova e ammoniva un innocente al kickoff; curato (`G.vantaggio=null`). **I3**: `setScene` scaricava il cartellino anche con una finestra VIVA — la palla ferma in finestra dava un 5,1% "silenzioso" (nessun fischio, nessuna punizione); curato estraendo `eseguiSfumato()` e facendola richiamare anche da `pallaFuori()` PRIMA della rimessa — il fallo originario vince sulla rimessa, come la regola vera; questo chiude anche il seguito **#111** (mai rimasto aperto). **I4**: censimento vero di #108 corretto a **25 strumenti** (riga 3 sopra), e la PROVA 1 di `_q-regole.js` riscritta per non dipendere più da quell'artefatto (I4b: "scena attraversata", non "stato finale") — seguito raffinato in **#109/#110** (riga 4). **I5**: commento nuovo, il vantaggio si apre ANCHE in area (nessun codice cambiato, misurato ~0/21 casi PIENI in area). Banco `_q-regole.js` **13→16 prove** (CARD-NON-ATTRAVERSA, PALLA-FUORI-IN-FINESTRA, VANTAGGIO-IN-AREA), tutte verdi; a taglia 11 le prove 3/7 diventano verdi (C1), e SOLA la prova 6 resta rossa per un artefatto di SCALA nel banco stesso (dichiarato nel commento del file, non curato: fuori perimetro) — **RETTIFICA (ri-verdetto, micro-onda finale, 18 settembre 2026)**: questa riga diceva prima «6/8 restano rosse» a taglia 11, misurato falso due volte a seme fisso — la prova 8 è verde a quella taglia, resta rossa solo a taglia 7 (dove restano rosse sia 6 sia 8, stesso artefatto). Cancelli: `_q-regole` 16/16 (`--taglia 5`), **15/16** (`--taglia 11`, sola prova 6) e 14/16 (`--taglia 7`, prove 6/8); `_q-determinismo --partite 4` 13/13; `_q-battute` 11/11; `_q-replay` 10/10; `_q-proporzioni` 30/30; `_q-precedenza` 9/9; sorteggi dal `b837824` DIVERGONO per costruzione (7/60: taglia 5 3/20, taglia 7 2/20, taglia 11 2/20); batteria in 4 spezzoni **28 cancelli che contano, tutti verdi**. Verbale in `MANUALE.md` §A registro, voce #107 |

## La giornata del 17-18 settembre, in breve

| | cosa |
|---|---|
| 1 | **IL MANDATO È AGLI ATTI.** Il committente ha consegnato un mandato di miglioramento scritto come lo spec di un gioco 3D ambizioso (`_analisi/MANDATO-STADIUM-ROAR.md`) e ha chiarito: serve a MIGLIORARE CALCETTO, non ad aprire un gioco nuovo. Otto mappatori hanno tradotto ogni area del mandato nell'idioma di casa in `_analisi/MAPPA-MANDATO.md`: cosa c'è già (molto: determinismo a seme, identità come espressione, stati emotivi cel/mesto, IA a macchina di stati...), cosa manca, proposte con giornate stimate, esclusioni motivate. Il cantiere #87 già in corso si è rivelato ESATTAMENTE la §6.6 del mandato (rimesse/angoli/rinvii). **PROGRAMMA APPROVATO dal committente (17/9, notte)**: onda **A** (incassare subito, ~6-8 g: #87, regole a leva corta, versione motore nel nastro, spiccioli UX) → **B** (il pilastro nuovo, ~12 g: registro dei fatti + MIND v1, il modello emotivo/psicologico) → **C** (qualità permanente, ~7 g) → **D** (competizione, ~8-12 g), più **onda E** (live 1v1, lockstep-prima) in coda, con progetto d'architettura dedicato quando si aprirà |
| 2 | **#87 CANTIERE CHIUSO** (rimesse laterali, calci d'angolo, rinvio dal fondo). Cinque compiti più il verbale, dal merge-base `7ed570a` fino alla coda della revisione finale (riga 5 sotto): un interruttore solo (`SAVE.sponde`, gabbia di serie a 5/7, campo vero a scelta, **obbligatorio a 11**), scena `battuta` con fermo breve (~0,8-1,5 s) e finestra viva (hold 3 s), battitore comandato coi verbi di casa (PASSA/CROSS/FILTRANTE, TIRA spento), clip su `p.rimT` fino in moviola. Banco dedicato `_q-battute.js` nato 2/7, arrivato **11/11**, ora IN BATTERIA. GABBIA **0/40** dal merge-base (identica al bit a 5/7); a 11 **18/20 DIVERGE dichiarato** (campo vero obbligatorio, causa unica). Giocabilità (`_eventi.js` contro il pre-ramo): 11 e 5-campo-vero **entrambi 88,9%** di momenti-da-porta/minuto (soglia ≥80%), 0-0 al 5-10% (soglia ≤33%) — nessuna manopola da tarare. Batteria intera verde, **27 cancelli che contano** in 4 spezzoni. **Regressione trovata E curata dalla batteria stessa**: la riga SPONDE (compito 1) aveva riaperto il difetto storico del 28 agosto su `#btnCambiaCampo` (dietro la barra fissa della schermata GIOCA, 5/722 bersagli in `tocco.js`) mangiando gli ultimi 2 px di margine che quella toppa aveva lasciato; curata SOLO CSS (`_t-gioca-sponde-fit.js`, zero `dado()`, bersaglio del pollice 42→37 px, dichiarato in stile edizioni nel commento del gioco). Verbale in `MANUALE.md` §A registro, voce #87 |
| 3 | **Seguiti nuovi**: **#102** (piazzati evoluti — portiere che sale sul corner disperato, pressione per fase, dal paragone MINIERA scavo 7 — più la regia panoramica dell'angolo a 11); **#103** (la coda dell'angolo: gol olimpico, statistica corner in lavagnetta); **#104** (la battuta è scena di partita anche per il disegno: sei liste + `forceWinMatch` in una sola `fermoDiPartita(s)`, soglia FERMO BREVE proporzionale a `duraBattuta()`, l'HUD non deve lampeggiare a ogni rimessa); **#105** (le sponde viaggiano col nastro delle sfide, per sfide a campo vero a 5/7); **#106** (`tocco.js` misura la raggiungibilità ma non la TAGLIA del bersaglio — il 37px del compito 5 resta senza pavimento misurato). **Nota corretta (revisione finale)**: la voce **#96** (cancello di pubblicazione) copre la VERSIONE DEL MOTORE — i nastri di ieri non si rigiocano a 11/campo vero perché il motore è cambiato; il caso IMPOSTAZIONE-PER-DISPOSITIVO (due telefoni sulla stessa versione ma con SPONDE diversa in locale) è un difetto diverso, **C1**, ora curato forzando LA GABBIA nelle sfide a 5/7 (seguito #105 per quando si vorranno sfide a campo vero anche lì) |
| 4 | **RESTANO, in ordine**: il prossimo dell'**onda A** è **le regole a leva corta** (§6.7/§6.5 del mandato: il rigore legge l'area vera invece della fascia `zonaCalda`, ½ g; il portiere non prende più il retropassaggio con le mani, 1 g; il vantaggio — non ogni fallo ferma il gioco, 2 g) **+ la versione del motore nel nastro** (1 g, chiude la voce #96 e sblocca il prossimo APK) **+ gli spiccioli UX** (tutorial, anello del fiato, aria-label, cursore vibrazione, ~3 g). Poi l'**onda B**: il registro dei fatti (P0, prerequisito) e **MIND v1** (due umori e una spinta, il canale `manopole(t,p)`, i due canali d'occhio, il banco `_q-umore.js` nato rosso) — mappa completa in `_analisi/MAPPA-MANDATO.md` §2. **Resta anche la voce #89** (meccaniche dei verbi: filtrante, cross e rovesciata sul modello del paragone) — un cantiere della decomposizione del committente del 1° settembre, non assorbito dal programma del mandato (l'eventuale assorbimento lo annota a parte il controllore). **Seguiti aperti, nessuno bloccante**: **#96, #97, #98, #99, #101, #102, #103, #104, #105, #106** (RETTIFICA, sezione "18 settembre, seconda parte" sopra: **#96 CHIUSA** dalla voce #107, **#108 nato**) |
| 5 | **ONDA DI CORREZIONE DELLA REVISIONE FINALE su #87** (18 settembre): **C1 CRITICO curato** — `startMatch` leggeva sempre `SAVE.sponde` del dispositivo, mai `opts.sponde`; a 5/7 due telefoni con SPONDE diversa rigiocavano la stessa sfida su un motore diverso, e `chiudiSfida` spiegava lo scarto solo col profilo cambiato. Cura: `startMatch` onora `opts.sponde` quando presente, e le due partenze di sfida passano `sponde:'gabbia'` — le sfide a 5/7 giocano sempre la gabbia, per costruzione identica su ogni telefono (a 11 restano già allineate, il campo vero è obbligatorio). **I5 Importante curato (a metà — vedi la coda sotto)** — le tre pose di battuta (`posaBattuta`/`posaBattutaAngolo`/`posaBattutaRinvio`) lasciavano `G.battuta` pendente per sempre quando non trovavano un battitore (rose azzerate); cura centrale in `pallaFuori`: palla libera, `G.battuta=null`. Testo: 3 rilievi Importanti e cinque minori chiusi in `MANUALE.md`/`strumenti/_q-battute.js`/`strumenti/_t-gioca-sponde-fit.js` (numeri e liste disallineati fra file, nessun cambio di comportamento). Via attrezzo a àncore `strumenti/_t-sfide-sponde.js` — **due postille del ri-verdetto**: (a) l'attrezzo non è una ricetta completa di quel commit, una riga di solo testo (M3) resta un edit a mano fuori dall'attrezzo; (b) la verifica byte-per-byte prova che l'attrezzo riproduce l'edit già fatto, non che l'edit sia nato ancorato — garanzia più debole, annotata come tale. Cancelli: `_q-battute` 11/11, `_q-determinismo --partite 4` 13/13, `_c3-sorteggi` (fw-base contro HEAD, taglie 5/7/11) 0/60, `tocco.js` 722/722, `_q-precedenza` 9/9 |
| 6 | **CODA DELLA REVISIONE FINALE su #87** (18 settembre, un commit in più): il ri-verdetto ha bocciato la cura I5 della riga sopra — **bloccante**. La guardia liberava l'owner ma non riportava la palla dentro la banda: a campo vero `ballWalls()` gira ogni fotogramma sulla fisica libera del pallone, quindi il varco si ripresentava al fotogramma dopo, `pallaFuori()` veniva richiamata, la guardia riliberava di nuovo — scena `play`/`battuta` alternata a fotogrammi alterni, misurato **169 ingressi in scena battuta su 400 fotogrammi prima della cura, 1 dopo** (sonda dedicata, rosa di movimento tutta fuori). Il commento era anche falso («resta per il fermo breve»): `duraBattuta()` torna 0 con `G.battuta` nullo, e `setScene('play')` scatta subito — nessun fermo da conservare. Cura: un `clamp` riporta la palla dentro la banda (come `ballOverBar` quando "deep" è null, stesso principio non la stessa riga) PRIMA di azzerare; commento riscritto con la storia vera. Rilievo minore in coda: `_q-battute.js` PROVA 1 guadagna la quarta sotto-condizione che misura la via vera delle sfide — `startMatch(1,1,{size:11,sponde:'gabbia'})` → `campoVero===true`. Via attrezzo `strumenti/_t-battuta-ripiego.js` (1 ancoraggio). Cancelli: `_q-battute` 11/11, `_q-determinismo --partite 4` 13/13, `_c3-sorteggi` (coda precedente contro HEAD, taglie 5/7/11) 0/60, `_q-precedenza` 9/9, sonda 169→1 |

## La giornata del 7 settembre, in breve

| | cosa |
|---|---|
| 1 | **#86 CANTIERE CHIUSO.** In sette compiti, un solo commit ciascuno: il campo, il gesso, la porta e — a 11 — i corpi entrano nella scala dei campi veri (IFAB/FIFA Futsal/UISP), misurati contro `_analisi/MISURE-UFFICIALI.md` da un banco nato ROSSO 4/24 il 6 settembre e arrivato a **27/27**. Porta nel tetto ±20% a tutte le taglie, area disegnata=applicata dalla stessa costante, forma e corpi dell'11 nel tetto ±15% (diametro giocatore +11,3%, pallone +3,8%). Batteria intera verde (25 cancelli che contano, incluso `proporzioni` da oggi in batteria), sorteggi identici al bit dove il piano lo promette: `_q-determinismo` 10/10; il due-versioni COMPLESSIVO del ramo DIVERGE per costruzione (58/60 partite, 542.275→601.224 sorteggi) — dichiarato, non nascosto; le tre corse SEPARATE per taglia danno 60/60, e lo scarto della corsa combinata è il non-determinismo PRE-esistente a taglia 7 e 11 (voce #98, fuori perimetro), non una cura parziale. Verbale in `MANUALE.md` §A registro, voce #86 |
| 2 | **#85 LA MOVIOLA FLUIDA: CANTIERE CHIUSO** (con le voci #68 e #98 a bordo). Cinque compiti in commit `3c560d6..3372268` — dal banco che nasce rosso al verbale, con le due code di revisione dei compiti 2 e 4 (`d48058c`, `6beea19`); dopo diagnosi `15410bf` e piano `90fe5b9`: i cronometri dei gesti (kickT/kickB/charge/slide/dive/rove...) smettono di restare congelati nel replay mentre il corpo avanza — SCATTO **5→0** fotogrammi congelati su 16 transizioni attive, seme 20260907 — e i cinque campi di posa mancanti (contrasto/presaT/gkManiT/rinvT/recover) entrano nel campione e nel disegno (+19.800 numeri a taglia 11, ~396 kB di RAM per eccesso, mai serializzati). La cura profonda di `Touch5` in `startMatch` CHIUDE LA VOCE #68 (la prova E di `_q-replay.js` torna verde, mai più NULLA — la bisezione aveva smentito il sospetto iniziale `stick.ox/oy`: le cause vere erano `stick.active/id/dx/dy/hist` e il verbo a tenuta orfano `atti/btnTouch`) e MISURA la voce #98: a 7/11 resta **8/10 identico prima e dopo la cura** (il seme 20260803 diverge già fra due pagine fresche in CPU-contro-CPU, zero Touch5) — **#98 si RIDIMENSIONA**, non si chiude: è un difetto vero del motore, indipendente dal tocco. Batteria intera verde (26 cancelli che contano, incluso il nuovo `replay` da oggi con dentro le prove SCATTO/CAMPI/E). Sorteggi identici al bit: `_q-determinismo` 10/10; due-versioni COMPLESSIVO (base `3bced51`) **0 partite divergenti su 60** (601.370=601.370) — il primo ramo di questa voce che chiude senza dichiararne. Nota onesta sull'occhio: la cura arriva al rig ma nell'episodio campionato (fine-calcio, ampiezza piccola) la differenza a occhio è impercettibile (diff pixel quasi pari, 23,8% contro 23,77%); la verifica su un gesto ampio o in gioco vero resta aperta. Verbale in `MANUALE.md` §A registro, voce #85 |
| 3 | **#100 CURATA** (decisione del committente, 7 settembre: «allungare il rinvio in proporzione così da renderlo più realistico al calcio vero»). Il rinvio a pugno del portiere, che con l'area vera di #86 poteva cadere dentro l'area a 7 e a 11 (242 contro 268 e 361), torna sempre fuori area a ogni taglia: le due componenti orizzontali del pugno scalano per `GK_PUGNO_SCALA = VERNICE.areaProf/VERNICI[5].areaProf` (`strumenti/_t-rinvio-scala.js`), il tempo di volo resta invariato. A 5 fattore 1, **taglia identica al bit** (242-590 invariato); a 7 (1,549) **375-914**; a 11 (2,087) **505-1231** unità (23-56 m). Tre prove nuove per taglia in `strumenti/_q-proporzioni.js` (27→30, tutte verdi), RED dimostrato sul gioco pre-cura (`fuori/base-100.html`: rosso a 7 e 11, verde a 5) e GREEN sul gioco curato. Due-versioni (`_c3-sorteggi`): 0/20 identiche a 5, DIVERGE 1/20 a 7 e a 11 (l'evento è raro in CPU contro CPU: il pugno scatta solo dopo una presa forte). Verbale in `MANUALE.md` §A registro, voce #86 |
| 4 | **Restano due cantieri della stessa decomposizione** (committente, 1° settembre): **rimesse laterali e calci d'angolo** (#87), **meccaniche dei verbi** — filtrante, cross e rovesciata sul modello del paragone (#89) |
| 5 | **Cancelli/seguiti aperti, nessuno bloccante**: **#96** (pubblicazione, già cancello: il prossimo APK aspetta la versione del motore nel nastro delle sfide — copre ora anche i rami #86 e #85); **#97** (raccomandazioni non bloccanti della revisione di #88: guardia sul rinnovo, bersaglio della tenuta con prova K allargata); **#98** (RIDIMENSIONATA dal ramo #85, non chiusa: `_q-determinismo --taglia 7/11` resta 8/10 identico prima e dopo la cura Touch5 — il seme 20260803 diverge già fra due pagine fresche in CPU-contro-CPU, zero Touch5: difetto vero del motore, dossier in `_analisi/PROVA-E-DIAGNOSI.md`); **#99** (la batteria è cieca a taglia 11: portare in batteria almeno un cancello che giri a 11 e ricostruire lo strumento di spazzata che la decisione 1 di #86 assumeva esistente — in parte bloccata da #98). **La voce #68 esce dai misteri: CHIUSA** dal ramo #85 (cura `Touch5.azzera()` in `startMatch`, voce #85 sopra) |

## La giornata del 6 settembre, in breve

| | cosa |
|---|---|
| 1 | **#88 LA PULSANTIERA: CANTIERE CHIUSO.** In nove compiti, un solo commit ciascuno: la faccia dei dischi dipende dal possesso (`squadraDelPallone()`) invece che da una soglia geometrica, le celle si spengono invece di travestirsi da un altro verbo, il comando segue il destinatario dichiarato del passaggio, il raddoppio è una tenuta. Le sei soglie del progetto approvato tutte VERDI su `strumenti/_q-volo.js` (11/11): TIRA nel volo del cross 9%→100%, faccia bugiarda in 6 s d'inseguimento 3→0, comando al destinatario 38→17 fotogrammi (0,63 s→0,28 s), volée 0→1, celle accese che rifiutano l'atto 147→0 (e la direzione opposta, prova G, 0/361), furti a dita vere invariati (19/20 e 17/20 prima, 17/20 e 17/20 dopo). Batteria intera verde (24 cancelli che contano), sorteggi identici al bit: `_q-determinismo` 10/10, `_c3-sorteggi` 0 partite divergenti su 60, `_crit10-sorteggi` verde. Verbale completo in `MANUALE.md` § A registro, voce #88 |
| 2 | **Restano quattro cantieri della stessa decomposizione** (decisa dal committente il 1° settembre, `docs/superpowers/specs/2026-09-01-pulsantiera-contesto-design.md` §7), nessuno ancora iniziato: **vernice del campo** in scala ufficiale (#86), **residuo della moviola** — i cronometri dei gesti non interpolati (#85), **rimesse laterali e calci d'angolo** (#87), **meccaniche dei verbi** — filtrante, cross e rovesciata rifatti sul modello del paragone (#89) |
| 3 | **#96 CANCELLO DI PUBBLICAZIONE** (rischio 6 del §6 dello spec): la fusione di #88 può avvenire ora, ma il **prossimo APK non deve partire** finché il nastro delle sfide non porta la versione del motore, o il messaggio di `chiudiSfida` non dichiara entrambe le cause possibili (profilo cambiato **oppure** motore cambiato) — le sfide si rigiocano da {seme, taglia, gol, nastro}, quindi i nastri registrati col motore di ieri non si riproducono più, e oggi quel messaggio attribuisce lo scarto solo al profilo cambiato |

## La giornata del 1 settembre, in breve

| | cosa |
|---|---|
| 1 | **LA MINIERA** (`_analisi/MINIERA-FCM.md`): su mandato del committente («non reinventare la ruota»), sei minatori hanno estratto le soluzioni del concorrente come fatti liberi — divisioni, formato ASSALTO, ritmo del ritorno, comandi, gioco aereo, schermi — con righe di prova e gradi. **Il percorso scende da ~26-27 a ~19-20 giornate.** Quattro rettifiche già scritte nella mappa delle differenze |
| 2 | **#82 CURATA e verificata**: la porta del ri-armo sul cambio di lato (`_t-isteresi-disco.js`). Sonda 11/20 → ~18/20 con zero falliti per sfarfallio; `giocata` 20/20; `_q-riarmo` 7/7 ×3; duelli a seme fisso identici al bit prima/dopo. Verbale: `PROGETTO-ISTERESI-DISCO.md` §8 |
| 3 | **Sei banchi accusavano l'innocente**, cinque per rotture PREESISTENTI: giocata (scivolata accreditata all'uomo sbagliato dopo l'autoswitch), precedenza (taglio delle costanti + finto di Reg), riarmo (campionatore a blocchi, garante del raddoppio, perno del portatore). Tutti riparati con verbale |
| 4 | **#72 pronta a partire**: `_t-aereo.js` scritto e provato a vuoto (8 ancoraggi, stadi A+B); fotografia PRIMA presa (`fuori/aereo-prima-*.json`, cross 0,3/0,0/0,0) |
| 5 | La direttiva del committente è in memoria permanente (`minare-il-paragone`): prima di progettare, scavare il pacchetto di paragone |

## Il prossimo passo, in ordine

1. ~~La #72~~ FATTA in sei stadi (1 settembre, sera): cross 0,3/0,0/0,0 →
   1,0/1,0/0,2, batteria verde; il residuo (bersaglio [2,6], «con uomo» 0)
   è la voce #84 — l'appuntamento del cross, progetto a parte.
2. ~~Onda 1~~ I TRE CONTENUTI SONO DENTRO (1 settembre, notte), in
   ordine 2→1→3 come da progetto: l'ABBANDONO vale 0-3 a tavolino in
   torneo e stagione (banco 14/14); le DIVISIONI a 3 fasce × 3 con premi
   a formula, pavimento di fascia e schermata in bacheca (banco 18/18,
   _q-meta col modello aggiornato 80/80); RECORD con la data + la
   seconda mensola da 15 a 24 trofei (banco 12/12). I tre banchi sono in
   batteria (tutti.js). RESTA dell'onda: la misura del tasso
   monete/partita (§6.8 — prerequisito della taratura FINE dei premi),
   la giuria dei dieci minuti sul rischio-frustrazione, e il collaudo a
   mano su telefono.
3. Taccuino del campetto (~2,5 g, ora che il contenuto 3 c'è) e ASSALTO
   (~6 g, onda 2 — la scala ha un posto dove versare).
4. Play Console: bloccata alla creazione dell'account (2FA + 25 € +
   identità sono solo del committente); AAB 1402079 pronto.

**Ramo:** `main`. **Il gioco adesso:** ~2,36 MB, `targetSdk` **36** (da oggi
Play rifiuta le app nuove sotto Android 16 — verificato e schivato il giorno
stesso). **Cancelli:** batteria verde, `verifica.py` 48/48.

## La giornata del 29-31 agosto, in breve

| | cosa |
|---|---|
| 1 | **Il MANUALE** (`MANUALE.md`): 269 voci censite dal codice da undici lettori, con appendice di **98 incoerenze** — 10 curate lo stesso giorno |
| 2 | **La STAGIONE moriva alla seconda apertura** (TypeError) e per quel crash RISULTATI DELL'ULTIMA GIORNATA non era mai esistito: curata |
| 3 | **Il duello dal dischetto era un fermo-immagine** (0 campioni su 2408 cambiati in 700 ms): ora ha un orologio di solo disegno (22/2408) |
| 4 | **Sette «TORNA AL MENU» bugiardi**, «quattro dischi» che erano cinque, «Z contrasta» che era la scivolata, trofei e podio disonesti nei testi: parole vere |
| 5 | **I cinque cronometri** che sopravvivevano a `startMatch` (voce #65): azzerati, distribuzioni identiche al byte su 100+100 partite |
| 6 | **`giocata.js`** sbagliava 2-3 volte su 10 in entrambe le versioni: tre difetti del banco curati (due orologi, comando dal rilascio, portatore ripuntato) — 70/70 su dieci corse, e in pausa fallisce ancora come deve |
| 7 | **`folla.js`** divideva per un fondo a fase fissa: mediato su 8 fasi, 9,6% identico su entrambe le versioni |
| 8 | **Pacchetto Play**: `SCHEDA-STORE.md` coi testi pronti, privacy in `rete/public/privacy.html` (da deployare), icona 512, fotografie in `fuori/store/`, `PUBBLICARE.md` coi passi del giorno |
| 9 | Le lezioni di metodo sono in memoria persistente (`concludere-solo-da-misure`): oggi hanno pagato quattro volte, due contro di me |

## La giornata del 26-27 agosto, in otto righe

| | cosa | misura |
|---|---|---|
| 1 | **L'11 contro 11 non aveva un difetto d'intelligenza: aveva un difetto di OROLOGIO.** Sei cure d'IA bocciate in fila con lo stesso profilo erano l'indizio. Novanta secondi su un campo largo il doppio sono mezza partita | 0-0 dal **50% al 22%** (100 partite); i gol *al minuto* restano identici |
| 2 | Il **tiro non aspetta più il difensore**: la carica durava 0,30-0,46 s anche a contatto, e il marcatore arrivava durante | precisione VERA 7 → 11%, parate 0,38 → 0,49 |
| 3 | **Cinque toppe ferme dal 20 agosto** entrano: torneo e stagione a 7 e a 11, la licenza OFL a bordo, il salvataggio che sopravvive, l'audio che tace in tasca, zero nomi di concorrenti | il cancello del meta-gioco: «il chiodo del 5v5 è saltato» |
| 4 | **Le reti vanno a chi le fa** (erano tutte all'uomo di indice 1) | 20 gol su **4** marcatori invece che su 1 |
| 5 | **La lavagnetta dice tutto quello che il saldo incassa** (i premi dei trofei si pagavano fuori lista) | partite col conto storto: 4 su 14 → **0** |
| 6 | **Il passaggio si mira col dito** (L1.4), e la linea di guida lo promette | `_q-linea` 5/5, `_q-l16` 6/6, `giocata` 7/7 |
| 7 | **L'avvio era già a posto**: lo sforo veniva dal banco rallentato 4× | **1861 ms** sul telefono vero contro un tetto di 2000 |
| 8 | **Due strumenti ciechi e uno rumoroso** trovati e curati: il contrasto delle divise (dispersione 0,86 su soglia 3,00), quattro banchi che sceglievano il disco per raggio, `_q-riarmo` che oscilla su due prove | tutti verificati ancora verdi sul gioco di ieri |

---

## Il verdetto, e come si muove

Il committente ha chiesto: **giuria di 26 giudici, il nostro 8-9 e i competitor 3-4.**

| momento | voto | note |
|---|---|---|
| sei appelli piatti | 6,4 | prima dell'interrogatorio |
| dopo 4 onde | 7,1 | luce, figure, leggibilità, scene madri |
| dopo la correttiva | 7,3 | 6 difetti su 10 spariti |
| dopo l'onda 6 | 7,9 | la sera, il campo vissuto, il quadro pieno |
| **dopo la passata del pollice** | **8,2** | il gioco impara a segnare |

Il giudice quantifica **~8,6** con le voci che restano, e mette il 9 dietro due
cose sole: **le pose** e **il centro del quadro**.

Le altre due lenti, lo stesso giorno: **7,3** (chi gioca col pollice, era 6,4) e
**6,2** (l'ancoraggio ai concorrenti). Il gioco vale molto più fotografato che
giocato — ed è la frase che ha riordinato tutto il lavoro:

> «Il gioco vince su tutto quello che si può fotografare e perde su quello che
> si prova col pollice.»

---

## La scoperta che vale più di tutte: in questo gioco non si segnava

Misurato su 50 partite a semi dichiarati con `strumenti/_eventi.js`, che è il
**primo strumento del progetto che misura il gioco invece dell'immagine**:

```
prima:  ZERO gol su azione in 50 partite · 73% di 0-0 al 90' · 67% ai rigori
        11 tiri a partita, 79 palloni vaganti — il caos c'era, mancava la conseguenza
dopo:   1,42 gol a partita · 20% di 0-0 · 18% ai rigori
        parate 1 -> 3 · legni 0,40 -> 0,96 · momenti da porta al minuto 0,91 -> 3,26
```

**La causa era aritmetica.** Con l'attrito `b.vx *= 0.35^dt` un pallone percorre
al massimo `v0/1,0498` unità. Il tiro partiva a 313 u/s → 298 unità di corsa,
contro una distanza mediana di tiro di 326: **non arrivava in porta nemmeno a
campo vuoto**, zero volte su ventisette. E il tiro perfetto mirava al palo con
l'effetto a giro nello stesso verso della mira: 18 arrivi su 19 fuori dallo
specchio, per costruzione. Più due difetti del portiere: armava il tuffo su una
*distanza* invece che su un *tempo*, e mentre si rialzava il suo corpo spariva.

L'equità **migliora**: lo squilibrio fra le due squadre scende da +0,330 a
+0,195 reti, perché la lotteria dei rigori decideva due partite su tre.

---

## Undici strumenti ciechi trovati in due giorni

La regola di casa era «uno strumento che attesta invece di misurare è peggio di
nessuno strumento», e valeva dieci casi. Adesso ventuno. **Quattro delle sei
critiche più dure della giuria erano artefatti dei nostri strumenti.**

| # | strumento | la bugia |
|---|---|---|
| 11 | `prestazione.js` | confronta con un riferimento preso a banco libero: col server di sviluppo del committente acceso segnava +100% dove il costo vero era +11%. Cura: **misura appaiata**, i due file alternati sullo stesso banco nello stesso minuto |
| 12 | `silhouette.js` | chiedeva a un corpo disteso visto di fronte di essere più largo che alto: servirebbe un uomo lungo 1,62 m in orizzontale. 12 combinazioni su 120 irraggiungibili, tetto vero 108 |
| 13 | `folla.js` | sommava forma **e traslazione** con segno opposto: la folla salta di 10 unità su una finestra alta 38, e l'anello di tribuna esce dal bordo alto mentre le braccia entrano dal basso |
| 14 | `silhouette.js` (bis) | dichiarava «8 su 10 nominabili» mentre tre **provini ciechi** con persone diverse ne riconoscevano da zero a due |
| 15 | `scatta.js` (HUD) | forzava il possesso «così la foto non dipende da chi ha la palla»: ha mostrato alla giuria otto fotogrammi in cui i pulsanti dicevano TIRA senza palla |
| 16 | `scatta.js` (fine) | fabbricava il tabellino con `forceGoal`: ha ingannato la giuria **due volte in direzioni opposte** — prima «tre conclusioni in novanta secondi», poi «ogni tiro entra, precisione 100%» |
| 17 | `istantanea.js` (campioni) | **gli otto istanti erano sei.** Pescati uniformi, potevano cadere vicinissimi; e il passo era `max(0, bersaglio − orologio)`, quindi un istante spostato avanti per uscire da una celebrazione faceva cadere il successivo **alle sue spalle**, passo zero, stessa tela rimisurata. Non identica: i due ridisegni del riferimento avevano intanto mosso la camera di due fotogrammi senza aggiornare la trasformazione letta dallo strumento — **è per questo che «nell'istante 8 la palla non c'era»**. Il cronometro stampato tornava indietro (t=39,0 s dopo t=40,1 s) |
| 18 | `istantanea.js` (palla) | l'**atteso** era il numero falso: deduceva il raggio da `B_R` (8) mentre il gioco disegna a `B_R × B_DIS = 10,72` e lo dichiara in `__test.pallaRaggio()`, hook scritto apposta e mai letto. I 48 px erano la palla. Ma il sospetto era fondato per costruzione: il buco perdonato valeva 3,2 unità dove il gioco ne lascia 2,6 |
| 19 | `istantanea.js` (denominatore) | «erba vuota» misurata sul **quadro intero**, dove sotto l'interfaccia erba non ce n'è né può essercene. Corretto sull'area giocabile: **il tetto si alza, non si abbassa** — lo stesso quadro passa da 29,2% a 33,4%, e il caso peggiore da 41,7% a 47,8%, due punti dal tetto dove ne aveva otto |
| 20 | `avvio.js` (colonna «analisi») | la sua intestazione dice: «ANALISI = navigationStart → DOMContentLoaded. È il costo di **leggere e compilare** il file: la fase che cresce col peso». Ma DOMContentLoaded non scatta a compilazione finita: scatta quando ogni script in linea ha finito di **eseguire**. Misurato spezzando quel numero in quattro (`strumenti/_sonda-avvio.js`): leggere e compilare sono il **15,6%**. Il tetto in kilobyte, che ha governato il progetto per settimane, sorvegliava un sesto della stanza |
| 22 | `istantanea.js` (misura 7) | **il cancello nato da un rilievo vero, che non misura il rilievo.** Il tetto è irraggiungibile per aritmetica: una figura rompe 1,98 celle, quindi stare sotto il 40% chiede **9,7 figure in un riquadro di 273×123 unità** dove il 5v5 ne ha dieci in tutto il campo. Non conta i corpi: una manovra che porta i corpi al centro da 12 a 21 lascia il numero **identico al decimale**. E ha un verde falso — il «fotogramma manifesto» al 6,3% è prato deserto che passa perché la tinta del manto sotto i fari è 89° contro una soglia a 90 |
| 21 | `_identita.js` | **la stessa ferita, entrata da una seconda porta.** Nato copiando il campionamento di `istantanea.js`, ne ha ereditato il difetto insieme al resto: istanti 4 e 5 tutti e due al secondo 38 con la stessa coppia peggiore al decimale, 7 e 8 tutti e due al 49. Sei fotogrammi che si dichiaravano otto, e uno «0 su 52 giocatori» che contava due volte tredici uomini. Corretto, il difetto delle divise era **peggiore** di quanto dichiarato (coppia peggiore 5,5 e non 9,3) e il guadagno più grande. **Una ferita chiusa in un file e lasciata aperta in quello accanto è una ferita aperta** |

Più due nati e riparati in giornata: `tutti.js` misurava tempi su un banco ancora
caldo, e l'attrezzo dei nomi dichiarava successo senza aver misurato nulla.

I tre casi di `istantanea.js` hanno una lezione in comune che vale da sola:
**un banco che si guarda allo specchio trova cose che nessun cancello trova.**
Adesso lo strumento misura la propria indipendenza — differenza media assoluta di
luminanza fra ogni coppia di istanti, 94.348 campioni per coppia — e nel banco
c'è un **gemello sporco** permanente: lo stesso fotogramma rimisurato dopo i
ridisegni del riferimento, cioè esattamente la coppia che il banco produceva da
sé. Vale 5,12 contro una soglia di 7,0, e viene riconosciuto. La coppia più
vicina fra istanti veri adesso vale 9,29 con il 35% di quadro cambiato; con il
campionamento vecchio la corsa **fallisce** e dice quali coppie sono la stessa
foto.

**Il metodo che li ha trovati**: il **provino cieco**. Una persona che non
conosce la chiave di risposta e a cui è vietato cercarla. Costa un minuto, e ha
spostato il lavoro tre volte in direzioni che nessuna misura indicava.

---

## Il metodo che va veloce

`strumenti/tutti.js`: tutti i cancelli **insieme**, quattro alla volta.
**357 secondi invece di 960.** Ma il guadagno vero è un altro: eseguendoli
*tutti* ha scoperto in un colpo tre cancelli rossi che nessuno cercava.

Tre cose che rendono onesto quel comando:
- **l'impronta del file prima e dopo**: se cambia, il referto è **NULLO**. Un
  lavoratore che scrive mentre un verificatore misura produce due numeri che
  descrivono file diversi, e nessuno se ne accorge;
- **i cancelli cronometrici girano da soli**, dopo, a campo libero: `giocata` e
  `avvio` misurano tempi e sotto contesa bocciano il gioco per un ritardo che
  non è suo;
- **la misura del carico**: cronometra un lavoro aritmetico fisso e lo confronta
  col più veloce mai visto. Sopra 1,5× declassa il verdetto da condanna a
  sospetto.

E la forma di lavoro che ha funzionato: **diagnosi in parallelo, scrittura in
fila.** N specialisti in sola lettura, ognuno su un difetto, che consegnano una
toppa cerca/sostituisci provata su una copia fuori dal repo e che *si rifiuta di
scrivere* se un ancoraggio non si trova esattamente una volta. Poi le applico in
fila. Prima: tre ore per giro.

---

## Cosa resta per il 9, in ordine di resa (parole del giudice)

| | | decimi |
|---|---|---|
| 1 | **Le pose che dicono il verbo — ed è UN VERBO SOLO.** Misurato su 13.560 fotogrammi di verbo: `tira` 3,3% di fotogrammi illeggibili, `scivola` 6,1%, `esulta` 39,1% (ma vive sulla quota, 72-79 px), **`para` 63,3%** con 8,1 px di asse sagittale. La causa in una riga: **il portiere si tuffa lungo la bocca della porta, la porta è verticale sullo schermo, e la vista non ruota mai.** Ed è **la posa**, non la camera: la clip `tuffo` ha dz 1,382 contro dy 0,605, mentre `cielo` e `pugno` hanno dy 1,56-1,59 e si leggono sempre. Le tre strade già chiuse con numeri: il beccheggio (σ2 non contiene l'elevazione; e a 16° la figura si stringe del 22,5% e il tuffo si accorcia al 43-54%), l'ombra (due provini ciechi: 1 su 10, poi 0 su 10; zero pixel sopra 3:1 contro l'erba), e l'ingrandimento (il rapporto gesto/tratto è **invariante di scala**, verificato a k da 0,5 a 3). In lavorazione: riscrivere il tuffo sull'asse della quota | 1,5 |
| 2 | ~~L'11 contro 11 che non tira mai~~ **CHIUSO in due tempi.** Primo tempo (23 ago): l'attrito non sapeva quanto è grande il campo — `k = −ln(0,35) = 1,0498` per unità percorsa dà corsa massima 819 unità su un campo lungo 2300, cioè il 36% contro il 71% del 5v5; e i «sette tiri a partita» erano rigori. Secondo tempo (26 ago): **non era l'intelligenza, era il cronometro.** Sei cure di IA bocciate una dopo l'altra con lo stesso profilo (i tiri calano, i gol seguono) erano l'indizio: 90 secondi su un campo largo il doppio sono metà partita, perché le gambe restano 168 u/s e l'attraversata costa 13,7 s contro 6,8. Col gioco **spedito**, cambiando **solo** la durata, lo 0-0 passa dal 50% al 25% — e i gol al minuto restano identici (0,43 contro 0,42). Nasce `durataPartita()`: 90 · 126 · 180 s, cioè i tre valori che il menu già offriva. Cancello: 0-0 al **23%** contro la soglia 33 | fatto |
| 3 | **Il centro del quadro**: cancello nuovo, rosso in 5 istanti su 8 (43-75% contro un tetto del 40%) | 0,4 |
| 4 | ~~**L'avvio**~~ **CHIUSO il 26 agosto sul TELEFONO VERO: 1861 ms contro un tetto di 2000, 7 avvii buoni su 7, dispersione 14,3% (OnePlus A6003).** Lo sforo di 870 ms era misurato sul banco a 4×, che è un telefono che non esiste: `avvio-telefono.js` misura da icona premuta a pallone toccabile sul dispositivo, e passa. Resta valida la cura già applicata (il manto si cuoceva due volte, la seconda da `document.fonts.ready` dentro l'avvio della partita) | fatto |
| 5 | **HUD e bussola** che non mangino mai il protagonista (restano due casi nell'11v11) | 0,2 |
| 6 | La coda: la palla al petto invece che ai piedi, la palla che si separa dallo stato durante il tiro, l'etichetta «AVVERSARIO IN 2 9"» spezzata | 0,3 |

E una cosa fuori elenco, che il giudice chiama il traguardo vero: **il fermo
immagine casuale dell'azione che valga quanto la lavagnetta di fine partita.**

---

## I cancelli (ultima esecuzione completa)

```
collaudo 36/36 · misura 7/7 · senza-rete 6/6 · equità 4/4 (0,000 al bit)
giocata 8/8 (da solo: è cronometrico) · folla 4/4 · seme · gabbia · volti · silhouette
avvio: ~10 s a 4× contro 2 s — aperto
prestazione: solo in modo appaiato (--contro HEAD); il modo assoluto non è credibile qui

istantanea.js, su otto istanti davvero indipendenti — 46 misure su 56:
  erba senza soggetti 4/8   palla 8/8   altezza figura 8/8   temperatura 8/8
  ombre 5/8   centro a sera 7/8   CENTRO ABITATO 6/8  (era 3/8 col metro rotto)
banco degli strumenti: 11 prove su 11, VERDE per la prima volta
```

**Il totale è sceso da 48 a 46 e non è una regressione: è severità.** Quel 48
conteneva un cancello del terzo centrale che nessuna inquadratura poteva
superare, e una misura dell'erba comprata dallo stesso difetto di tinta —
`hueMin: 90` buttava via il 9,95% del manto e **il 50,1% dei pixel sotto la
pozza dei fari**. Portata a 60 (l'unico avvallo dell'istogramma sta a 58-60° e
il pavimento tiene il 99,1% del manto), l'erba vuota vera esce: **57-63%
dell'area giocabile contro un tetto di 50**. È un difetto nuovo *visibile*, non
un difetto nuovo. Da ri-giustificare: quel tetto del 50% era tarato sulla
definizione di prato vecchia, più stretta.

Nessun totale di questo strumento si confronta riga per riga con quelli di ieri:
il campionamento stratificato ha spostato tutti gli otto bersagli, e la famiglia
di tinta del prato è cambiata. Si confrontano i verdetti, non le colonne.

## Come si riprende

```bash
cd C:/Users/Utenteee/Desktop/GitHub/games
node strumenti/tutti.js --tutto --insieme 4      # tutta la batteria, in parallelo
node strumenti/giocata.js --tutte                 # da solo: cronometrico
node strumenti/_eventi.js                         # il gioco, non l'immagine
node strumenti/prestazione.js --contro HEAD       # l'unico confronto onesto qui
python android/costruisci.py && python android/verifica.py
```

## Le regole pagate

1. Le passate correttive rendono più di quelle creative.
2. Un solo «peggio» è bloccante.
3. I cancelli li esegue chi giudica, non chi lavora.
4. **Uno strumento che attesta invece di misurare è peggio di nessuno
   strumento** — ventuno casi. E quando ne ripari uno, **cerca subito la
   stessa ferita negli strumenti che l'hanno copiato**: `_identita.js` aveva
   ereditato il campionamento difettoso di `istantanea.js` insieme al resto.
5. Un agente morto non è un via libera: i workflow si fermano su null.
6. Il metro si rettifica con data e fonte quando la realtà lo supera.
7. Prima di accusare il metro, interrogalo.
8. **Prima di chiamare regressione un numero rosso, misura quanto valeva
   sull'ultimo commit.** Costa trenta secondi; tre diagnosi su quattro, in una
   giornata, non erano regressioni.
9. **Un cancello che approssima un giudizio umano va tarato contro giudizi
   umani veri, ripetuti, da persone che non conoscono la risposta.**
10. **Il cancello viene superato per la via più corta, e la cosa che
    rappresentava non arriva.** «Palla trovabile» ottenuto accendendo la palla;
    «contrasto 3:1» ottenuto sbiancando la maglia invece di spostarne la tinta —
    e quel blocco ha impedito alla sera di arrivare per mesi.
11. **Guarda dove campiona il cancello.** «Erba vuota 8/8» valeva sul quadro
    intero; sul terzo centrale, dove cade l'occhio, il prato è vuoto per due terzi.
12. **Misura il gioco, non solo l'immagine.** Sedici strumenti guardavano
    fotografie: nessuno si era accorto che non si segnava mai.
13. **Fai misurare al banco la propria indipendenza.** Otto campioni erano sei, e
    nessuna delle sette misure poteva accorgersene: guardavano tutte il
    contenuto, nessuna guardava *se stessa*. Il difetto si è visto solo quando lo
    strumento ha confrontato i propri campioni fra loro.
14. **Guarda il denominatore, non solo la soglia.** «Erba vuota» si misurava
    anche sotto l'interfaccia, dove erba non può esserci. La guardia giusta non è
    un numero ma una struttura: il numeratore non si tocca, così dichiarare più
    interfaccia fa **salire** la percentuale. Una dichiarazione che può solo
    nuocere a chi la fa non ha bisogno di essere creduta.
15. **Un numero con la dispersione fuori soglia non si scrive da nessuna
    parte.** L'avvio ha portato per due giorni l'etichetta «~10 s contro un
    tetto di 2 s», e a banco scarico vale **2870 ms con dispersione 2,2%**.
    Le tre misure precedenti — 10203, 8872, 6140 — erano tutte il banco. Il
    guaio non è stato misurare male: è stato **trascrivere** un numero che
    lo strumento aveva già dichiarato non valido, e poi ragionarci sopra.
17. **Un provino cieco con una persona sola non risolve una differenza
    piccola.** Due giudici, lo stesso foglio, la stessa chiave: il primo dà
    la posa nuova 1 su 10 contro 4 su 10 della vecchia, il secondo 6 su 10
    contro 5. In tutto hanno nominato 5 tuffi contro 11 — la varianza **fra
    le persone** è più grande della differenza fra le cose confrontate. Con
    un solo giudice avremmo scritto «peggiorata» o «migliorata» a seconda di
    chi capitava. Il referto giusto è «questa misura non sa distinguerle»,
    e va detto con la forbice accanto.
18. **Un provino cieco ha bisogno di un testimone.** Nel foglio a sola ombra
    dieci celle su venti erano capsule lisce, che per costruzione non possono
    dire niente. La persona le ha dichiarate tutte e dieci «non nominabile»:
    solo per questo le altre dieci risposte valgono qualcosa. Senza testimone,
    «zero verbi riconosciuti» e «la persona non ci teneva» sono lo stesso
    referto. E va detto in anticipo che alcune celle potrebbero non essere
    nominabili, se no si inventa — nel primo provino, senza avvertenza, sono
    uscite due sole parole per venti immagini.
19. **Un falso troppo gentile non prova niente.** Il primo anello dipinto per
    ingannare il cancello metteva lo zoccolo nero sul varco: nessun raggio ci
    arrivava, e il cancello «passava» la prova senza averla affrontata. Un falso
    va costruito nel *caso peggiore*, con la stessa geometria del gioco.
20. **Un banco che congela una squadra misura il banco, non il gioco.**
    `setCpuVsCpu(true)` chiamato prima di `startMatch(...)` viene annullato
    in silenzio da `G.cpu` scritto dentro `startMatch` stesso: la squadra 0
    restava un "umano" immobile per tutta la partita, e un vantaggio pieno
    misurato a 0/260 (o 0% su 260 finestre) non era una proprietà del
    gioco — era l'assenza di un avversario vero. La contabilità arbitrale
    vera (ordine giusto, `startMatch` poi `setCpuVsCpu`) dava 26-27%, non
    zero. L'idioma sbagliato viveva, committato, in dieci strumenti
    (voce #107, seguito #108): un confronto due-versioni fatto sotto lo
    stesso banco congelato resta valido perché simmetrico, ma lo scenario
    che misura non era mai stato quello dichiarato.
21. **Un teletrasporto che non azzera lo stato derivato eredita l'ultimo
    evento vero, e un banco può restare bloccato lì per sempre.** Lo
    scenario PUGNI di `strumenti/_q-proporzioni.js` (voce #107) chiamava
    `startMatch` una volta e poi spostava il pallone addosso al portiere
    4000 volte di fila senza mai riscrivere `b.lastTouch`/`b.toccoPiede`:
    restavano il tocco di piede di un compagno del calcio d'inizio, e la
    guardia del retropassaggio (giusta, nata nel compito 2 della stessa
    voce) rifiutava le mani ad ogni singolo tentativo — 0/4000, su tutte
    le taglie, per sempre, perché nessun evento nuovo toccava mai quello
    stato. Il gioco non era colpevole (30/30 verde anche sul commit dove
    la guardia è nata, `81d8c59`, col banco curato). E una seconda
    lezione dentro la prima: **«pre-esistente» va verificato contro
    l'ORIGINE, non contro il commit immediatamente precedente.** Il
    compito 4 aveva confrontato l'uscita rossa solo con la propria base
    (`700f775`, già dopo la guardia) e l'aveva dichiarata pre-esistente
    al cantiere — falso: la guardia, e quindi il guasto, erano nati
    DENTRO lo stesso cantiere, due compiti prima, e nessuno aveva
    rilanciato la batteria intera nel frattempo per accorgersene.
22. **In un cantiere a più compiti, rilanciare la batteria INTERA a ogni
    compito, non solo i cancelli nominati dal piano.** Una regressione
    di contorno colpisce un banco che il compito in corso non ha motivo
    di guardare, e resta invisibile fino alla batteria di chiusura — non
    un caso isolato: **almeno cinque occorrenze nel programma**: **#86**
    (il collaudo/i diritti FIFA), **#87** (il banco del tocco), **#107**
    (le proporzioni — è la lezione 21 sopra, il sottocaso "pre-esistente
    verificato contro il commit sbagliato"), **#112** (`disposizione.js`,
    riga 2 sopra: rosso da fine compito 4, mai rilanciato fino alla
    batteria di chiusura del compito 6), **#117** (`_q-replay.js` prova
    E, nato al compito 3: `G.swLock`/`G.swTimer` mai azzerati da
    `startMatch`, il sesto cronometro fratello di `G.recT`/`G.vantaggio`
    — trovato e riparato al compito 6, vedi la voce #117 in cima a questo
    file). La lezione 21 copre solo quel sottocaso specifico; questa è la
    lezione generale che lo contiene: la batteria intera, non i soli
    cancelli che il piano del compito nomina, è l'unico modo di
    accorgersi di una regressione che cade fuori dal proprio elenco.
