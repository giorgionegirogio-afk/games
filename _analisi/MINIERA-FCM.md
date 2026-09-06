# LA MINIERA — le soluzioni del concorrente come fatti liberi

1 settembre 2026. Sei scavi su `fcm-estratto/` (146.694 stringhe del motore,
13 fascicoli indice, il verbale dal vivo, la mappa delle differenze), su
mandato del committente del 31 agosto: «hai un gioco di paragone, non serve
reinventare la ruota». I fascicoli grezzi con TUTTE le righe di prova stanno
negli esiti degli scavi (questa e' la sintesi operativa; ogni fatto citato
qui porta la riga della miniera o la fonte).

LA LINEA LEGALE, ribadita: idee, meccaniche, strutture, numeri di taratura
e flussi NON sono coperti da diritto d'autore; l'espressione si' (testi alla
lettera, nomi, marchi, grafica, audio). Qui si adotta il COME FUNZIONA,
riscritto con parole nostre. Nulla di `fcm-estratto/` entra nel repository.

I GRADI DI PROVA: **misurato** = stringa/osservazione con riga citata;
**dedotto** = inferenza dichiarata dal nome del parametro; **da-fonte-web** =
seconda mano, dichiarata. Le stringhe del binario provano che un impianto
ESISTE, mai quanto vale un numero: i numeri di taratura restano dei nostri
banchi.

---

## 1. DIVISIONI (scavo 1) — il progetto ONDA-1 si conferma e si asciuga

Come lo fa lui: scala a formula (divisionReward × divisionScale ×
divisionExtraScale, :7029/:12487/:54695) su gruppi (divisionGroups :18228);
TRE scale parallele, una per modalita', con cicli separati (SAS/H2H/MANAGER
+ WEEKID :110281-110286/:108411-108413); promozione/discesa/retrocessione =
tre cerimonie sonore distinte (:104479-104481); 27 gradini in ~6 fasce con
+1/-1 stelle e pavimento «mai sotto Pro V» (da-fonte-web, mappa :133-137).

Adottiamo:
- **9 gradini in 3 fasce × 3** (non 27: da lui ogni gradino cambia
  l'avversario perche' pesca nella popolazione PvP; da noi lo spazio
  avversario e' 3 livelli di CPU — 27 gradini sarebbero 24 vuoti).
- **Premi a formula, 3 manopole**: premio(g) = arrotonda(12 × 1,25^(g−1) ×
  1,4^(fascia−1)) → 12, 15, 26, 33, 41, 72, 90, 112 = 401 monete (i ~405
  gia' stanziati), salto automatico all'ingresso di fascia.
- **Pavimento di FASCIA** (il «mai sotto Pro V» generalizzato, senza
  orologio): la fascia conquistata e' per sempre, il gradino si difende.
  Una riga: pavimenti agli indici 0, 3, 6.
- **Cerimonia a due livelli**: gradino = toast + riga di fine partita;
  cambio di FASCIA = overlay in stile trofei con suono distinto.
- **Una scala per verbo** (2 giocatori fuori, SFIDA fuori): non piu' una
  scelta da motivare — e' il pattern misurato delle tre scale separate.
- **Niente stagione/azzeramento, mai**: il reset a 28 giorni serve al PvP
  (ricalibrare la popolazione); offline non ha ragione d'essere. Cade ogni
  futura onda «stagione della scala».

Taglio: ~0,5 giornate su 4,5, piu' due domande chiuse a costo zero.

## 2. ASSALTO (scavo 2) — il formato collaudato, gia' risolto

Come lo fa lui (VS Attack/SAS): l'unita' e' il POSSESSO PRESCRITTO caricato
da tabelle (prescribedPossessionList :8449, possessiongroups.xml :21888),
qualita' dell'occasione a definizioni (:9923), tre gradi + ripartenza
(COLOR_HUD_LOW/GOOD/GREAT_CHANCES + COUNTER :104109-104111), avversario
assente risolto dall'IA (sasOpponentAiScore :74132), azzeramento totale fra
occasioni (attackModeReset :22717), spareggi enumerati (SILVER_GOAL /
GOLDEN_GOAL / PENALTIES / NO_OVERTIME :112017-112020), tappe 1,2,3,10,20,
50,100,200,250 (:40530...:13873). 90 s e 10-15 occasioni: da-fonte-web.

Adottiamo (i punti portanti; il dettaglio sta nello scavo):
- `G.matchCtx='assalto'`, taglia 5, orologio unico 90 s che non si ferma.
- Mazzo FISSO nel file: 12 pose = 3 gradi × 3 corridoi + 3 riserve; nomi
  nostri GRANDE / BUONA / COSTRUITA / RIPARTENZA; mescolato con dado() sul
  solo percorso assalto.
- `posaScenario(entry)` = gemello parametrizzato di `resetKickoff`
  (:10476-10518), che gia' fa posa completa, latch e consegna palla.
- Avversario fuori scena: una pescata pesata sui tassi di conversione
  MISURATI del nostro stesso CPU (banco 100 corse per posa).
- Spareggio: una GRANDE a testa, poi `avviaRigori()` che gia' esiste.
- Trofei a 1, 3, 10, 20, 50; l'ASSALTO nutre le divisioni come amichevole.

Taglio: da 8-9 giornate stimate alla cieca a **~6**, e il rischio «mettere
le mani dentro l'avvio» declassato: la chirurgia temuta e' un gemello di
resetKickoff.

## 3. IL TACCUINO DEL CAMPETTO (scavo 3) — il ritmo del ritorno, senza paura

Come lo fa lui: obiettivi giornalieri a modello dati (UserDailyAchievementIds
:21482, currentProgress/progressToUnlock :9332/:14116), finestre a ID di
periodo (currentDaily/WeeklyPeriodId :73732/:33832 — il reset non e' un
evento, e' un CAMBIO DI ID), prima vittoria a premio (firstWinReward :27128),
pallino sul menu (dailyActivitiesBadgeInfo :108509). E il fatto che pesa di
piu': **nel motore non esiste la serie di giorni** (grep streak = 1 sola
stringa, failureStreak :62993) — nemmeno lui vende la paura della catena.

Adottiamo: 3 obiettivi del giorno (40 monete totali) + 2 della settimana
(120), pescati da lista fissa con generatore seminato dall'ID di periodo
(mai dado()); pagamento IMMEDIATO in applyMatchRewards con riga etichettata
sulla lavagnetta; pannello TACCUINO in bacheca + gesso sulla voce; prima
vittoria del giorno +12. NON adottiamo (patto di casa): scadenze a
countdown, premi per il solo accesso, serie di giorni, riscossione manuale,
valute dedicate, pass, notifiche d'inattivita', pubblicita'.

Costo: ~2,5 giornate se fatto DOPO il contenuto 3 dell'onda (riusa riga di
fine partita, whitelist, modello di banco). La marca «no-per-scelta» della
mappa (riga 8727) va aggiornata a «con-lavoro» su mandato del committente.

## 4. I COMANDI (scavo 4) — la strada B confermata dall'architettura

Il fatto che chiude #82: il loro strato touch e' una macchina a EVENTI
discreti di possesso giudicato (PossessionChangeEvaluation :49288,
startNewPossessionTransition :46161, ascoltatori :125379-125383), non
frontiere geometriche per fotogramma. La nostra porta sul cambio di lato
(`squadraDelPallone`) e' la versione a costo zero dello stesso giudizio —
spedita oggi ESATTAMENTE come da progetto, senza tarature aggiunte. Il loro
ri-armo e' cosi' invadente che la palestra ha un comando per spegnerlo
(lxDisableTouchControllerReset :19482).

Adozioni piccole a valle, **FATTE il 6 settembre 2026** (voce #88, nove
compiti, batteria e sorteggi verdi): (a) l'autoswitch segue il ricevente
designato (b.passTo/b.crossTo, alla USER_ASSIGNMENT_REQUEST_PASSRECEIVER
:61724) — sei righe in switchControlled; misurato, comando al destinatario
da 38 a 17 fotogrammi (0,63 s -> 0,28 s, soglia 0,5 s). (b) Il registro del
cambio non e' un campo tipizzato nuovo (come proposto qui, sul modello di
lxDidManualSwitchOccur :28392): l'esecutore ha trovato che il timer gia' in
casa `G.swLock[t]` fa lo stesso lavoro da guardia di precedenza — il cambio
manuale vince sempre nella sua finestra di 0,75 s, e solo a finestra
scaduta l'autoswitch al destinatario torna a contare (commento "IL CAMBIO
MANUALE VINCE SEMPRE" dentro switchControlled). Scelta piu' onesta della
proposta: niente stato duplicato da tenere sincronizzato con quello che
gia' esisteva. Per il futuro: coni di ricerca per verbo e punteggio a due
pesi (TAP_TO_PASS/GESTURE_SEARCH_ANGLE_* :8188..., FORWARD_WEIGHT/DIST_WEIGHT
:37150/:50564); doppio tocco solo bufferizzato a fotogrammi
(InputBufferDoubleTapHold :59502).

Taglio: 1,5-2 giornate (il banco comparativo A/B non serve piu'; la
«stabilizzazione del contesto» promessa dal verbale non e' piu' un lavoro).

## 5. IL GIOCO AEREO (scavo 5) — il progetto a tre stadi REGGE

Come lo fa lui: la corsa in area e' un INCARICO designato
(CrossRunAssignment :52772), SEPARATO dall'appoggio (SupportPlayer :52776,
ShortPassSupportAssignment :57292); ~9 varianti tipizzate di cross
(CROSS_LOW/GROUND/EARLY... :43855-:77212); NESSUNA stringa nearpost/farpost
(0 su 146.694): il bersaglio e' una POSIZIONE libera cercata
(PASS::LowCross::SearchPosition :32729, PAFindSpaceQuery :19496); minaccia
a mappe di influenza (:59393...); ricezione = battaglia modellata
(mIsInBattleForAirBall :10531, JumpingScore :43812).

Verdetto su PROGETTO-GIOCO-AEREO: **stadio A confermato** (la guardia
«solo la punta» = la separazione degli incarichi, in una riga); **stadio B
confermato** (crossVolo a T variabile = la versione a un parametro dei tipi
di cross basso); **stadio C declassato a improbabile** (lui non allarga la
raccolta, abbassa il volo — nessuna stringa di scaling esiste). Semi per
dopo: il cross NELLO SPAZIO (bersaglio-punto) e il duello aereo a punteggio
(progetto a se', promuovibile a dal-pacchetto).

Taglio: ~1 giornata sul percorso di #72.

## 6. GLI SCHERMI (scavo 6) — il nuovo si segna, l'annuncio sta a fine partita

Come lo fa lui: registro locale dei VISTI per contenuto (NEW_KITS :108389,
OBJECT_CHECKMARK_ANIMATED :108367), badge come stato derivato azzerato alla
visita (:108333), popup che si contano per limitarsi (MOTD_AUTO_POPUP_TIMES
:108328), riporto a un tocco (openDeepLinkActivityPage :23553), tutorial
per-funzionalita' una-tantum (W_TUT_* :108528...), catena fissa di fine
partita (MATCH_SUMMARY_REPORT :59290, victoryLevel0/1/2 :71411...).

Adottiamo: registro visti additivo (SAVE v4) + segno di GESSO sulla voce
BACHECA che muore all'apertura; toast toccabili che aprono la schermata
giusta; coachmark una-volta-sola su #divisioni; fine partita UNICO
annunciatore di progressione (max 2 righe sotto la lavagnetta, scavalcabili
con l'input); anteprima del premio della prossima promozione. NON adottiamo:
lucchetti sul menu, whitelist del toccabile, pallino rosso al primo avvio,
notifiche programmate, tutorial pagato. Il nostro tutorial a registro e'
GIA' conforme (TUT_APERTURE=3 = il loro AUTO_POPUP_TIMES): zero lavoro.

Taglio: −0,25 sulla schermata GIOCA (via la riga di fondale col gradino),
~1 giornata di scope futuro chiusa in anticipo; +0,75 per le tre adozioni.

---

## IL PIANO COMPRESSO (prima → dopo la miniera)

| cantiere | alla cieca | con la miniera |
|---|---|---|
| #82 isteresi del disco | ½ g + 1,5-2 g di banchi comparativi | **fatta oggi** (porta spedita, batteria §6 in corsa) |
| #72 gioco aereo (A+B+C) | ~2,5 g | ~1,5 g (C declassato) |
| Onda 1: divisioni+record+abbandono+schermate | 10 g | ~9,25 g (formula premi, pavimento di fascia, niente fondale) |
| Taccuino del campetto | ~5 g da solo | ~2,5 g (dopo il contenuto 3) |
| ASSALTO (onda 2) | 8-9 g | ~6 g (formato risolto, posa = gemello di resetKickoff) |
| **totale percorso** | **~26-27 g** | **~19-20 g** |

Prerequisito trasversale invariato: la misura VERA del tasso monete/partita
(punto 6.8 dell'onda) — serve una volta per scala, mensola e taccuino.

## RETTIFICHE DOVUTE ALLA MAPPA (legge degli studi a edizioni)

1. Le tappe VS Attack includono anche 2 e 200 (:47200, :64906): la mappa ne
   elenca 7.
2. «GoldenGoal non esiste nel motore» vale solo per la grafia attaccata:
   GOLDEN_GOAL sta nell'enum OvertimeFormat (:112018).
3. «Missioni giornaliere: no-per-scelta» → «con-lavoro» (mandato del 31/8),
   con rimando allo scavo 3; le voci-merito «niente calendario» vanno
   riscritte come «giornaliero senza scadenza ne' perdita» quando il
   taccuino entrera'.
4. La riga D «Duello aereo» si promuove da dedotto a dal-pacchetto
   (mIsInBattleForAirBall :10531 e famiglia).
