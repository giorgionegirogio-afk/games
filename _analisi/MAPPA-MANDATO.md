# LA MAPPA DEL MANDATO — «Stadium Roar» sopra CALCETTO

17 settembre 2026, sera. Il committente ha consegnato un mandato di
miglioramento scritto come lo spec di un gioco 3D ambizioso
(`_analisi/MANDATO-STADIUM-ROAR.md`, integrale; sezioni spezzate e leggibili
nell'archivio `../stadium-roar/docs/SPEC/`) e ha chiarito: **il mandato serve
a migliorare CALCETTO**, non ad aprire un gioco nuovo.

Questo documento è la traduzione: otto mappatori (più una seconda corsa
sull'area MIND, che alla prima era tornata vuota) hanno confrontato ogni area
del mandato con lo stato VERO del gioco — MANUALE, PUNTO-DEL-LAVORO, MINIERA,
i banchi, il codice a grep — con le regole di casa: ogni giudizio con la
prova accanto; ogni proposta tradotta nell'idioma di CALCETTO (motore JS
deterministico a seme, clip di pose, banchi Node+Playwright, nastri); stime
in giornate; le cose che il committente ha già escluso per scelta restano
segnate come esclusioni, non riproposte.

**Le conferme che valgono oro** (il mandato, senza saperlo, benedice scelte
già fatte in casa): il determinismo a seme come fondamento di replay e
anti-imbroglio (§1.2/§1.9 = i nastri e i banchi di casa); «l'identità di
squadra è espressione, non potenza» (§4/ADR-002 = MANUALE, squadre simmetriche);
«tests before done» e «everything reproducible» (§1.4/§1.9 = la batteria e la
legge «concludere solo da misure»); il modello a livelli col modello più
economico che passa il cancello (§14.1 = la disciplina di routing già in
memoria di casa); il cantiere **#87 in corso è esattamente la §6.6 del
mandato** (rimesse, angoli, rinvii), con spec e piano già committati.

---
## 1. Le regole e la simulazione (mandato §6, App. A e D)

Regole e simulazione della partita - falli/vantaggio, cartellini/espulsioni, rigori/punizioni, sostituzioni, infortuni, stanchezza, orologio/recupero/golden, portiere, invarianti (mandato: 06-simulation.md paragrafi 6.1-6.13, appendix-a-invariants.md, appendix-d-rules-cheatsheet.md). NOTA DI PERIMETRO: rimesse laterali, calci d'angolo e rinvio dal fondo (par. 6.6) sono ESCLUSI da questo mappaggio perche' coperti dal cantiere gia' aperto e pianificato (voce #87, docs/superpowers/specs/2026-09-17-rimesse-e-angoli-design.md e relativo piano): non li ripropongo.

**C'è già:**

- Cartellini e disciplina: fallo da scivolata da dietro/in ritardo = cartellino; al SECONDO cartellino di squadra un uomo esce per un'espulsione TEMPORANEA di 12 secondi (regola futsal dichiarata a schermo), mai il portiere, mai sotto 2 uomini di movimento in campo
  *Prova:* CALCETTO-il-gioco.html: CARTELLINI_PER_ESPULSIONE=2, ESPULSIONE_SEC=12 (dichiarazione ~riga 4419-4420); funzione infliggiCartellino (~17827-17849); MANUALE.md righe 190-191; _analisi/DIFFERENZE-FC-MOBILE.md righe 899-903, verdetto 'pari' (non un buco: e' il regolamento del calcetto scelto apposta)
- Punizioni e rigori: esiste un intero sotto-sistema di duello (Duel) con tiratore a dito/tastiera, portiere umano o CPU, cumulo falli di squadra (dal 3 fallo si tira anche fuori zona calda) e serie di rigori a oltranza a fine golden goal
  *Prova:* MANUALE.md par.6 (righe 144-168); CALCETTO-il-gioco.html righe ~17945-17948 (zonaCalda/cumulo, banner TERZO FALLO: SI TIRA!); _analisi/DIFFERENZE-FC-MOBILE.md righe 845-849, 755-759
- Fine partita senza pareggio: golden goal a 90'' (prossimo gol vince, 40 secondi) poi rigori - sostituisce deliberatamente i tempi supplementari regolamentari per una scelta di ritmo dichiarata, non per lacuna
  *Prova:* MANUALE.md riga 166-168; CALCETTO-il-gioco.html: G.golden=true e soglia goldenT; _analisi/DIFFERENZE-FC-MOBILE.md righe 893-897 (verso pari: e' una scelta di ritmo, non un merito)
- Stanchezza (fatigue) reale: lo sprint consuma fiato, il recupero lo ricarica (piu' forte da fermi), e sotto una soglia il passo del giocatore cala davvero fino al 14% in meno - non e' cosmetico, incide sulla simulazione
  *Prova:* CALCETTO-il-gioco.html righe ~12981-12984 (26 punti/s sprint, 18/11 recupero, fattore 0,86+0,14*(fiato/25)); _analisi/DIFFERENZE-FC-MOBILE.md righe 4513-4517
- Portiere: possesso col pallone breve per costruzione (kickCd forzato a ~0.4-0.9 s prima di essere obbligato a giocarla, mai un hold indefinito), quindi la sostanza della regola possesso-massimo del mandato e' gia' rispettata, anche senza un countdown a schermo
  *Prova:* CALCETTO-il-gioco.html: kickCd=0.9 (riga ~18685, contesto rinvio); rinvioPortiere (originariamente 18465-18493, slittata a ~18782 su HEAD b5656b4 per #85/#86, verificato in _analisi/RIMESSE-E-ANGOLI.md edizione 17/9)
- Orologio della partita: si ferma davvero durante le fasi non giocate (kickoff, gol, punizione) prima ancora di decrementare - per questo un recupero esplicito non serve: non c'e' tempo perso da restituire
  *Prova:* _analisi/DIFFERENZE-FC-MOBILE.md righe 905-909 (if(G.scene!=='play' && G.scene!=='golden') return; sta prima del decremento, righe ~12283/12301-12310)
- Sorteggio di chi comincia ed equita' sul calcio d'inizio dopo gol: G.kickTeam = dado()<0.5?0:1 all'avvio, e dopo ogni gol il calcio d'inizio va a chi ha subito rete - copre in sostanza il coin toss del mandato senza cerimoniale
  *Prova:* CALCETTO-il-gioco.html: riga ~10711 (G.kickTeam = dado()<0.5?0:1), riga ~11121 (G.kickTeam=1-team dopo il gol)
- Invarianti equivalenti gia' sorvegliate da banchi propri (non con gli stessi nomi INV-xx del mandato, ma con la stessa funzione): determinismo a seme, niente uscito-dal-mondo per il pallone in stati particolari (cura della voce #66), conteggio giocatori in campo mai sotto la soglia, batteria unica che li esegue tutti insieme
  *Prova:* PUNTO-DEL-LAVORO.md (sezione I cancelli, strumenti/tutti.js); strumenti/collaudo.js righe 283-315 (cura voce #66); strumenti/_q-determinismo.js per il determinismo (INV-01)

**C'è in parte:**

- Area di rigore vera: il ramo #86 ha gia' disegnato E applicato un'area di rigore in scala ufficiale per taglia (VERNICE.areaProf/areaSemi, usata da dentroArea() e da GK_AREA_X), ma la decisione questo-fallo-e'-rigore non la usa — *stato:* la decisione fallo-duello legge ancora zonaCalda = Math.abs(goalX-p.x) < 260, una fascia 1D sulla sola x, non scalata per taglia e diversa dal rettangolo vero gia' calcolato altrove nello stesso file
  *Prova:* CALCETTO-il-gioco.html: zonaCalda riga ~17945; dentroArea riga ~20150-20152 (usa VERNICE.areaProf/areaSemi); MANUALE.md righe 580-581 (area di rigore ora in scala IFAB/Futsal/UISP)
- Falli: esiste solo UNA sorgente di fallo (la scivolata sporca/da dietro); spinta, trattenuta e mano non fischiano mai, pur esistendo gia' una fisica di contatto corpo-a-corpo — *stato:* il push posizionale fra due giocatori (riga ~13073-13075, dischi che si respingono) e' gia' simulato ma non produce mai un evento di fallo; l'unico incremento di G.stats.falli e' dentro checkSlideContact
  *Prova:* _analisi/DIFFERENZE-FC-MOBILE.md righe 699-703 e 869-873
- Regola del retropassaggio al portiere: il gioco sa gia' chi ha toccato per ultimo (segnaTocco/b.lastTouch, la stessa leva gia' riusata dal cantiere #87 per rimesse/angoli), ma tentaPresa non la consulta mai — *stato:* un compagno puo' sempre passare indietro col piede e il portiere prende comunque con le mani, senza nessun controllo su chi/come e' arrivato il pallone
  *Prova:* _analisi/DIFFERENZE-FC-MOBILE.md righe 863-867; segnaTocco/squadraDelPallone documentati anche in _analisi/RIMESSE-E-ANGOLI.md par.2
- Set piece del fondocampo e delle fasce (rimesse, angoli, rinvio dal fondo) - sezione 6.6 del mandato — *stato:* CANTIERE GIA' APERTO, non e' compito di questa mappatura: spec e piano committati il 17/9/2026 (voce #87) coprono esattamente questa parte del mandato (interruttore SPONDE, scena battuta, verbi PASSA/CROSS, angolo/rinvio) - nessuna proposta nuova qui per non fare doppioni
  *Prova:* docs/superpowers/specs/2026-09-17-rimesse-e-angoli-design.md; docs/superpowers/plans/2026-09-17-rimesse-e-angoli.md

**Manca:** Vantaggio: nessun fallo lascia proseguire il gioco, si fischia sempre · Due tempi, intervallo, cambio di campo/lato (zero righe di logica oggi) · Sostituzioni vere (panchina giocabile): oggi la panchina serve solo a parcheggiare l'espulso temporaneo · Infortuni in qualunque forma: zero occorrenze di 'infortun' nel file · Posa/animazione di stanchezza a fine sforzo: il fiato esiste come numero, non come corpo che lo mostra · Cartellino rosso diretto / falli gravi con conseguenza diversa dal secondo giallo di squadra · Falli da contatto (spinta, trattenuta, mano) oltre alla sola scivolata · Arbitro come figura/corpo in campo: oggi solo un suono (Audio5.whistle) + banner · Recupero a fine tempo come sistema dichiarato e visibile (l'effetto equivalente e' gia' implicito, vedi esiste_gia, ma non e' il sistema che il mandato descrive) · Extra time regolamentare (due tempi supplementari) prima dei rigori - sostituito dal golden goal per scelta di ritmo

**Proposte (tradotte all'idioma di casa):**

- **Il rigore legge l'area vera, non piu' una fascia arbitraria** — mezza g — (6.7 (Fouls, misconduct and sanctions - penalty kick) e appendix-d (area vera))
  Sostituire zonaCalda = Math.abs(goalX-p.x) < 260 con una chiamata a dentroArea(team, p.x, p.y) (la stessa funzione gia' usata da GK_AREA_X e dal cross), cosi' un fallo dentro il vero rettangolo d'area (VERNICE.areaProf/areaSemi, gia' in scala IFAB/Futsal/UISP dal ramo #86) da' rigore, e uno fuori resta punizione - a ogni taglia, senza scatole nuove.
  *Dipendenze:* Nessuna: la geometria (VERNICE, dentroArea) esiste gia' dal compito 5 del ramo #86. Attenzione a non introdurre dado() nel percorso (oggi gia' deterministico) per non far scattare _c3-sorteggi/_q-determinismo.
  *Valore:* Chiude un'incoerenza gia' misurata nel file: l'area e' disegnata E applicata altrove nello stesso motore, ma non nella decisione che piu' conta (fallo-rigore). Costo quasi nullo perche' riusa un pezzo gia' collaudato.
- **Il portiere non prende piu' il retropassaggio col piede** — 1 g — (6.5 (Goalkeeping) / appendix-d (retropassaggio))
  In tentaPresa, prima di afferrare un pallone libero, leggere b.lastTouch (gia' scritto da segnaTocco a ogni contatto, mai scaduto): se l'ultimo tocco e' un compagno di squadra del portiere e la modalita' di consegna e' un passaggio col piede (non un rinvio aereo/di testa), il portiere puo' solo parare/respingere coi piedi, non afferrare con le mani.
  *Dipendenze:* Nessuna struttura nuova: riusa segnaTocco/b.lastTouch, la stessa leva che #87 riusa per rimesse/angoli. Va verificato sui tre soli punti che chiamano tentaPresa (dentro updateKeeper) e sui banchi del portiere.
  *Valore:* Chiude un difetto gia' segnato per nome nel paragone, con un costo basso perche' l'informazione necessaria (chi ha toccato per ultimo) e' gia' in casa e gia' testata da un altro cantiere.
- **Una posa per il fiato corto** — 1-2 g — (6.4 (Player motion and physicality - Fatigue))
  Quando il fiato del giocatore scende sotto la soglia gia' usata dal motore (25%, quella che oggi taglia gia' la velocita'), selezionare per la clip di corsa/camminata una variante con busto piu' chino e frequenza leggermente piu' bassa, sul modello della tavola CLIP gia' in uso (lo stesso pattern con cui #87 aggiunge la clip della rimessa).
  *Dipendenze:* Nessuna sul motore di simulazione (solo disegno + selezione clip). Deve passare gabbia.js come ogni posa nuova (lezione di casa, voce #87 compito 3).
  *Valore:* Chiude una voce dove il paragone dice esplicitamente che CALCETTO perde: il fiato c'e' nei numeri ma non si vede mai nel corpo. Costo basso perche' il meccanismo di fiato esiste gia', manca solo il disegno.
- **Il vantaggio: non ogni fallo ferma la partita** — 2 g — (6.7 (Advantage))
  Quando scatta un fallo, prima di chiamare la punizione valutare per una finestra breve (~1-1,5 secondi reali, coerenti con la scala compressa del gioco) se la squadra che l'ha subito ha gia' un vantaggio chiaro e deterministico (possesso saldo del pallone + direzione verso la porta avversaria, soglie fisse, MAI un sorteggio): se si', non fischiare e continuare; se il vantaggio sfuma entro la finestra, tornare al fallo e fischiare come oggi (fischio ritardato).
  *Dipendenze:* Tocca la stessa zona di codice del fischio-punizione (accanto a checkSlideContact/zonaCalda), diversa dal ramo di #87 (fasce/fondo) quindi non in conflitto diretto, ma da coordinare in sequenza per evitare due cantieri sullo stesso file nello stesso periodo. Vincolo duro: zero dado() nuovi nel ramo di valutazione, per non rompere _c3-sorteggi/_q-determinismo/_crit*-sorteggi (la stessa legge di casa che il piano di #87 cita).
  *Valore:* Porta dentro CALCETTO l'unica voce del capitolo falli segnata manca e a peso alto nel mandato, come regola di decisione pura - non serve disegnare un arbitro-corpo per farla esistere.
- **Due tempi e un intervallo** — 3-5 g — (6.2 (Match structure and clock - half-time))
  Dividere durataPartita() in due meta' uguali; a meta', una scena nuova ferma (intervallo, sullo stesso pattern di scena-ferma di kickoff/battuta di #87: ciclo che esce subito, camera dedicata) con una piccola schermata (nessun cambio tattico complesso, solo eventuale scambio di lato/formazione se si vuole simmetria); ripresa col fischio e resetKickoff() gia' pronto.
  *Dipendenze:* Aspetta la CHIUSURA del cantiere #87 per riusare il pattern di scena-ferma e le sue lezioni sui nomi (es. la collisione gia' pagata fra G.ripresa e una nuova scena - intervallo andrebbe verificato non collidere con niente di esistente prima di committere). Tocca durataPartita() e il menu impostazioni.
  *Valore:* Chiude una voce di peso medio del mandato oggi a zero righe di logica, e apre il punto naturale (il fermo di meta' gara) dove inserire eventuali sostituzioni vere senza spezzare il ritmo di gioco.
- **Sostituzioni vere, appoggiate all'intervallo** — 3-5 g — (6.11 (Substitutions and bench))
  Nella schermata di intervallo (proposta precedente) o con un pulsante rapido a gioco fermo, permettere di far entrare un giocatore di panchina (oggi la panchina esiste solo per parcheggiare l'espulso) al posto di uno in campo; a 5/7 senza limite (stile futsal/street), a 11 con un tetto piccolo.
  *Dipendenze:* Dipende dalla proposta due-tempi per avere un punto di calma dove farle senza rompere il ritmo; richiede dati minimi di rosa panchina che oggi non esistono.
  *Valore:* Alto sulla carta, ma da soppesare col peso reale: vedi avviso dedicato sulla proporzione costo/beneficio in una partita di 90-180 secondi.
- **Un rallentamento visibile dopo un contrasto duro (non un sistema di infortuni)** — 1-2 g — (6.4 (Injuries), ridotta volutamente all'effetto minimo)
  Quando scatta un contatto gia' misurato come duro (scivolata sporca, o urto corpo-palla sopra la soglia sp>420 gia' in uso), applicare per pochi secondi la stessa clip variante di fiato-corto della proposta sulla stanchezza, senza NESSUN sistema di severita'/staff medico/barella: solo un riscontro visibile a un evento che la fisica gia' simula.
  *Dipendenze:* Beneficia della clip di fiato-corto (proposta precedente) per non duplicare il disegno.
  *Valore:* Da' un riscontro ai contrasti duri gia' simulati senza costruire l'impianto sproporzionato del mandato (tiers di gravita', protocollo commozione, barella) che non ha senso alla scala di 90-180 secondi reali.

**Esclusioni già decise o da non importare alla lettera:** 

- Il mandato (par.6.7/6.9) assume l'espulsione come definitiva (la squadra resta in dieci per il resto della gara). CALCETTO ha scelto deliberatamente l'espulsione TEMPORANEA da futsal (12 secondi, l'uomo rientra) perche' in una partita da 90-180 secondi reali un'inferiorita' numerica permanente sarebbe sproporzionata - e' dichiarato a schermo e verificato come scelta, non come mancanza (DIFFERENZE-FC-MOBILE.md righe 833-837, 947-951). Non lo riporto come 'manca'.
- Il fuorigioco (par.6.8 del mandato, regola geometrica completa) e' escluso per scelta di regolamento: la gabbia (sponde che rimbalzano) e' esplicitamente la scelta che lo cancella, coerente col 'futsal in gabbia' (DIFFERENZE-FC-MOBILE.md righe 741-745, 2703-2707). Non lo ripropongo.
- I tempi supplementari regolamentari (par.6.2, due periodi extra prima dei rigori) sono gia' stati sostituiti per scelta di ritmo dal golden goal a 40 secondi (vedi esiste_gia): riaprire questa voce vorrebbe dire disfare una decisione gia' presa e verificata, non colmare una lacuna.

**Avvisi onesti:**

- Sostituzioni vere (par.6.11): il mandato immagina 5 cambi su una partita di ~90 minuti veri; su una partita CALCETTO di 90-180 secondi reali il tempo di gioco residuo dopo un cambio a meta' gara e' pochi secondi. Il valore percepito potrebbe essere basso rispetto al costo (3-5 giornate + dati di rosa panchina nuovi); consiglio di verificarne l'interesse col committente prima di aprire il cantiere, eventualmente misurando con _eventi.js quanto davvero cambierebbe una partita.
- Infortuni completi (par.6.4: tiers di gravita', protocollo commozione, staff medico, barella, il-1-minuto-fuori-campo) non hanno senso per CALCETTO: quelle unita' (1 match-minute, 8 secondi, 10 secondi) sono calibrate sulla compressione dichiarata di Stadium Roar (~11,25x match-minuti in tempo reale); CALCETTO non ha nessun fattore di compressione dichiarato (durataPartita() e' letteralmente secondi=secondi), quindi importare quei numeri alla lettera non avrebbe un ancoraggio. Proposta ridotta a un effetto cosmetico minimo (vedi proposte).
- L'arbitro come attore in campo con corpo, coreografia, VAR, telecamere corporee e severita' regolabile (par.6.9) e' un'importazione letterale dallo spec 3D di Stadium Roar che non appartiene al genere di CALCETTO: il fischio-come-suono-piu'-banner gia' ottiene l'effetto funzionale richiesto (il gioco si ferma e riparte a un fischio udibile), verificato come equivalente ('pari') nel paragone gia' scavato. Non lo traduco in una feature.
- Cerimoniale pre-partita (coin toss ceremoniale, tunnel walk-out, mascotte, stretta di mano, inno, meteo/ora del giorno che tocca la fisica del pallone, par.6.1) non appartiene a un motore Canvas 2D con partite da 90-180 secondi: il costo di produzione (pose, audio, stati nuovi) non e' giustificato dal tempo di gioco che lo conterrebbe. Non propongo nulla su questo punto.
- Trappola del fuorigioco, linea difensiva condivisa e tratti di squadra da fuorigioco (par.6.10, gia' visti nel paragone) non hanno oggetto senza il fuorigioco stesso, gia' escluso per scelta: nessuna proposta consegue.


## 2. Il modello emotivo — MIND (mandato §7, App. B)

MIND — il modello emotivo e psicologico (mandato SPEC §7.1-7.8 + Appendice B, milestone M4), tradotto nell'idioma di CALCETTO: canvas 2D, un file, motore deterministico a seme, rig di pose proprio. (Seconda corsa: il primo mappatore aveva consegnato vuoto.)

**C'è già:**

- Uno stato emotivo per giocatore ESISTE GIÀ e si chiama `celeb`: latch di 2,4 s acceso su TUTTA la squadra che segna. Il mandato §7.4 («celebration events broadcast joy to the whole team») CONFERMA la scelta già fatta.
  *Prova:* CALCETTO-il-gioco.html:10377 (`celeb:0, // esultanza (s residui)`); :11181 (`for(const p of G.players){ if(p.team===team) p.celeb=2.4; }`); decadimento a passo fisso :16620 e :17425
- Il secondo stato ESISTE GIÀ e si chiama `mesto`: 2,4 s al portiere battuto e ai DUE più vicini alla porta violata, 1,2 s a chi si fa male. La regia di casa ha già rifiutato il contagio totale del negativo: «una squadra intera che si dispera in coro sarebbe teatro, non campetto».
  *Prova:* CALCETTO-il-gioco.html:10410; :11182-11197 (la frase citata a :11185); :12107 (`p.mesto=1.2` dentro prendiAcciacco)
- I canali di posa per l'emozione ESISTONO GIÀ nella tavola clip: `esultanza`, `cielo`, `ginocchia`, `pugno`, `delusione`. Il mandato §7.7 chiede «hands on head after a miss» e «head-down walk back»: la clip c'è, le manca il trigger.
  *Prova:* CALCETTO-il-gioco.html:6712-6752 (tavola CLIPS, 26 clip; `delusione` a :6751); descrizione a :11183-11184
- Il selettore di posa legge gli stati emotivi PRIMA di tutto il resto («la festa e il lutto» in cima a rigStato), e la festa cambia anche l'ANGOLO del corpo (tre quarti verso la curva sud). L'architettura «stato → clip + orientamento» c'è già.
  *Prova:* CALCETTO-il-gioco.html:33489-33521; :33456-33463
- La varietà dei gesti emotivi è GIÀ deterministica e senza dado: il marcatore sceglie 1 di 3 su `(idx + minuto) % 3`, i compagni 1 di 4 con fase sfasata. È il precedente che dimostra che un modello emotivo può essere vario SENZA consumare sorteggi.
  *Prova:* CALCETTO-il-gioco.html:33492-33519 («Resta deterministico: stessa partita, stesse figure»); stesso metodo per la punta a :19443-19444
- La FOLLA è già un canale vivo: `G.crowdHype` sale a 2,6 s sul gol, il livello sonoro è funzione della prossimità alle porte più l'hype, il tamburo della curva batte nei momenti caldi.
  *Prova:* CALCETTO-il-gioco.html:8398; :11172; :18958; :16674-16683; :10120
- La CURVA è già un oggetto della bacheca con interruttore IN CAMPO / A RIPOSO: cori, tamburo, coreografia al gol; il profilo della folla cambia forma a cavallo del gol per DIRE che la folla ha visto.
  *Prova:* MANUALE.md:271 e :274; CALCETTO-il-gioco.html:11201; :28701-28717
- Il canale BANNER esiste e serve già a eventi di natura emotiva (ACCIACCO, CAMBIO, GOLDEN GOAL), con testo, colore, durata e invecchiamento a passo fisso.
  *Prova:* CALCETTO-il-gioco.html:8539-8541; :12112; :12174; :16703; :16547
- La CAMERA è già un canale emotivo a quattro voci: scossa d'impatto, fermo immagine nel sacco, rallentatore a curva, ripresa dedicata in camera bassa, moviola.
  *Prova:* CALCETTO-il-gioco.html:19083; :11170; :16566-16580; :16581-16599; :16621-16634; :16637-16648
- Uno STATO DI SQUADRA a macchina di stati esiste già e ripensa 4 volte al secondo: ATTACCO/COSTRUZIONE/DIFESA/PRESSING/CONTESA, più GESTIONE in vantaggio negli ultimi 15 s. Il «time-wasting: leading late» del mandato in casa c'è già, senza emozione.
  *Prova:* CALCETTO-il-gioco.html:19382-19396 (GESTIONE a :19390); :19359 (`BRAIN_HZ = 0.25`)
- Lo STRATO DI MOLTIPLICATORI che il §7.5 chiede esiste già, costruito per il carattere delle squadre di quartiere: `manopole(t)` moltiplica manopole esistenti (attesa×standoff, grinta×slideP, mira×shotFreq, ordine/passErr, linea). Regola di casa scritta: «Non si aggiunge un secondo impianto accanto al primo: si legge il primo due volte».
  *Prova:* CALCETTO-il-gioco.html:9070-9080; :9207-9231 (ritorno anticipato a :9210)
- Le manopole d'arrivo del §7.5 (dispersione, latenza, propensione al fallo, tiro-vs-passaggio, distanza di pressing) esistono già come numeri per difficoltà: `react` 0,42/0,25/0,12 s · `passErr` 0,25/0,12/0,05 · `slideP` 0,04/0,15/0,26 · `shotFreq` 0,55/0,88/0,96 · `standoff` 54/22/0.
  *Prova:* CALCETTO-il-gioco.html:16408-16419 e :16420-16437 (tabella DIFF)
- Stati per giocatore a passo fisso dentro il motore ESISTONO GIÀ: `fiato` (0-100) e `cond` (la fatica lunga). La «Legge 1» di casa impone che ogni cronometro sotto una decisione stia nel passo fisso.
  *Prova:* CALCETTO-il-gioco.html:10382-10388; :17617; :3994 (`DT = 1/60`); :16714-16720
- Il precedente «uno stato che si impara dagli eventi senza dado» esiste ed è l'INDOLE: sei numeri 0-100 calcolati a fine partita e aggiornati a media mobile con peso 1/10.
  *Prova:* CALCETTO-il-gioco.html:9716-9721; :41906-41938 (peso a :41934)
- Il CAPITANO del §7.4/§7.6 esiste già, scelto in modo deterministico (il più forte dei suoi), con targa di presentazione al fischio d'inizio.
  *Prova:* CALCETTO-il-gioco.html:11004-11018; :8378; :38426-38477
- La SOSTITUZIONE come strumento (§7.6) esiste già: il direttore di panchina guarda due volte al secondo, il cambio avviene lontano dal pallone, il rincalzo entra al 94% di chi esce.
  *Prova:* CALCETTO-il-gioco.html:12177-12199; :12133-12148; MANUALE.md:192
- Il determinismo che il §7.5 pretende è già l'architettura di casa: SEME/dado() xorshift32, contatore esposto, nastri, tre banchi di guardia — uno costruisce apposta il «gioco bugiardo» con un sorteggio in più per fotogramma e PRETENDE il rosso.
  *Prova:* CALCETTO-il-gioco.html:8456-8470; :42087; :42117-42119; strumenti/_q-determinismo.js; _c3-sorteggi.js; _crit-festa-dado.js:1-9
- Gli interruttori d'accessibilità che un modello espressivo deve rispettare esistono già: MOVIMENTO COMPLETO/RIDOTTO e MOVIOLA SÌ/NO.
  *Prova:* MANUALE.md:322 e :326; CALCETTO-il-gioco.html:16575; :16594
- Un asse d'espressione facciale esiste già, ma STATICO: `espr` (serio/sorriso/grinta) più tre sopracciglia, pescati dal seme del nome; il volto vero si disegna solo oltre LOD_PX=120 px.
  *Prova:* CALCETTO-il-gioco.html:24110-24112; :24276-24330; :6937-6951

**C'è in parte:**

- Trigger → stato — *stato:* UN SOLO trigger scrive stati emotivi (il gol) più uno secondario (l'acciacco). Parata, palo, fallo subito, cartellino, rubata, rigore: nessuno tocca uno stato.
  *Prova:* Uniche scritture di celeb/mesto: :11181, :11192, :11196-11197, :12107; il resto sono azzeramenti (:10661-10662, :12170, :34612)
- «Ogni stato ha un trigger, un canale di gioco e un'espressione» (§7.2) — *stato:* A METÀ: celeb e mesto hanno trigger ed espressione ma ZERO canale di gioco — dichiarati «stati SOLO di disegno, la fisica non li legge».
  *Prova:* CALCETTO-il-gioco.html:10407-10413
- Momentum di squadra (§7.2) — *stato:* Non esiste come numero; esiste il surrogato a soglia dura (GESTIONE con timeLeft<15 && diff>0). Nessuna gradualità, nessuna memoria.
  *Prova:* CALCETTO-il-gioco.html:19389-19390
- Contagio (§7.4) — *stato:* Solo nella forma istantanea del gol: gioia a TUTTA la squadra in un fotogramma, delusione a tre uomini per distanza. Niente diffusione nel tempo, raggio, peso del capitano.
  *Prova:* :11181 contro :11188-11197
- La folla che rispecchia il momentum (§7.7) — *stato:* Mezzo canale: rispecchia PROSSIMITÀ e gol, non uno stato. Il termine da aggiungere è uno solo.
  *Prova:* :16674-16683
- Tratti per giocatore (§7.2) — *stato:* Esistono quattro attributi (vel, tiro, tecnica, tackle) più fiato/cond/acciacco. Nessun tratto psicologico; la rosa salvata non ne porta.
  *Prova:* :10381; :10382-10388
- Simmetria fra le squadre (§7.5) — *stato:* Decisione contraria e MOTIVATA in casa: la squadra di chi gioca non ha carattere (metà delle manopole l'IA le legge solo per una squadra automatica). La simmetria si verifica sulla FORMULA e a CPU contro CPU.
  *Prova:* :10942-10946 («LA SQUADRA DI CHI GIOCA NON HA CARATTERE, e non e' una dimenticanza»)
- Registro degli eventi (§7.5, §7.8) — *stato:* Non esiste come struttura ma è già PROGETTATO: due segnaposto «FATTO DA EMETTERE (registro dei fatti, in arrivo)» nel codice, più due surrogati funzionanti (nastro Reg, anello G.rec).
  *Prova:* :12109-12111 e :12171-12173; :34344-34388; :42088-42116
- Timeline post-partita (§7.8) — *stato:* Il tabellino ha «il momento della partita» (un punto), non una curva nel tempo.
  *Prova:* MANUALE.md:170-174
- Pressione dal dischetto (§7.1, §7.5) — *stato:* Il duello esiste con mirino e banda; ma la difficoltà è GEOMETRICA, non psicologica: niente compostezza, niente approccio/evitamento, il portiere non «fissa» nessuno.
  *Prova:* MANUALE.md:150-162; CALCETTO-il-gioco.html:20820-20824

**Manca:** Qualunque stato continuo di natura emotiva per giocatore: grep su fiducia|ansia|paura|rabbia|frustra|nervos|tensione = zero occorrenze pertinenti su 42.836 righe · Momentum di squadra come numero, coesione, rischio di crollo (§7.2) · Tratti psicologici (compostezza, leadership, sportività) per giocatore (§7.2) · Qualunque effetto emotivo sul gioco (§7.5): le manopole esistono tutte, nessuna è modulata da uno stato per giocatore · Contagio nel tempo, raggio, peso del capitano, smorzamento dei leader (§7.4) · Ogni forma di regolazione del §7.6: niente intervallo, niente discorso, il capitano è una targa di 1,7 secondi · Clip di protesta, incitamento, abbraccio, mucchio, batti-cinque, spintone: la tavola ha 26 clip e nessuna di queste (:6712-6752) · VAR, rosso, ammonizione per proteste: il giallo c'è, il secondo giallo di squadra vale 12 s di uomo in meno (futsal), il rosso no (MANUALE.md:190-191) · Timeline per-secondo nel record e clip «momento emotivo» (§7.8) · HUD emotivo: nessun glifo, nessuna barra di momentum, nessun bordo pulsante (§7.7) · Documentazione al giocatore: il MANUALE (269 voci) NON nomina mai esultanza, delusione, festa del gol o ripresa dedicata — un canale che esiste da mesi e non è scritto da nessuna parte · Un banco che misuri uno STATO: i banchi della festa misurano giunti e sorteggi, nessuno misura se una figura dice una cosa vera sul suo stato

**Proposte (tradotte all'idioma di casa):**

- **P0 — IL REGISTRO DEI FATTI (prerequisito di tutto)** — 1 g — (§7.5, §7.8)
  Si portano a codice i due segnaposto già presenti ({che, chi, dove, esito, t}) e si emettono i fatti che la partita GIÀ conosce senza calcolare nulla di nuovo: gol, autorete, parata/presa/respinta/sfugge, legno, fallo, giallo, espulsione temporanea, rubata, acciacco, cambio, rigore. Un array in G azzerato da startMatch, tetto dichiarato, ZERO dado(). È il substrato del modello emotivo, della striscia §7.8, della telecronaca e — bonus — del referto di _eventi.js che oggi avvolge sei funzioni globali per contare le stesse cose.
  *Dipendenze:* nessuna
  *Valore:* alto: senza questo nessun banco può dimostrare «storie speculari → stati speculari»
- **v1 — DUE UMORI E UNA SPINTA: gli stati, e nient'altro** — 2 g — (§7.2, §7.3, App. B)
  Tre stati soli, deterministici, zero sorteggi nuovi. Per giocatore: `p.umore` (−1..+1, la sintesi fiducia/morale — in 90 secondi non c'è tempo che si separino in sei numeri) e `p.nervi` (0..1, ansia+frustrazione+rabbia fuse). Per squadra: `G.spinta[t]` (−1..+1), media mobile esponenziale degli impatti firmati dei fatti, mezza vita 20 s di gioco (non 45: la partita dura 90-180 s). Trigger TUTTI da P0, valori dell'Appendice B riscalati, moltiplicatore di tempo continuo `1 + 0,6·(1 − timeLeft/durata)` invece delle soglie a 60'/85'. `celeb` e `mesto` restano e diventano l'ESPRESSIONE di questi stati invece che l'unico stato.
  *Dipendenze:* P0
  *Valore:* alto: è l'ossatura — va spedita insieme ad almeno un canale, se no è uno stato senza espressione (ciò che §7.2 ordina di cancellare)
- **v1 — IL CANALE DI GIOCO, AL SITO UNICO `manopole()`** — 1 g — (§7.5)
  `manopole(t)` diventa `manopole(t, p)` e moltiplica le manopole ESISTENTI per l'umore del singolo, dopo il carattere. Tre voci sole, relative, con tetto: `passErr` ÷ (1 + 0,15·umore); `slideP` × (1 + 0,25·nervi) — il numero del mandato alla lettera; `standoff` × (1 − 0,12·spinta). Il ritorno anticipato a oggetto neutro resta intatto (garanzia di :9194-9201, da conservare parola per parola). MAI sull'input: nessuna cella si spegne per emozione (la ferita della voce #88 non si riapre da una seconda porta).
  *Dipendenze:* v1 stati
  *Valore:* alto: trasforma due latch di disegno in un modello, al costo di una funzione perché lo strato dei moltiplicatori è già in casa
- **v1 — I DUE CANALI D'OCCHIO CHE GIÀ LEGGONO** — 1 g — (§7.7)
  (a) POSE: `mesto` si accende anche dai fatti (tiro sbagliato da buona posizione, fallo senza fischio, cartellino) con durata funzione di `umore`, tetto 3,0 s e UN uomo per volta per squadra — il campetto non è il teatro, regola già scritta in casa. L'esultanza resta com'è (il mandato la CONFERMA). (b) FOLLA: al livello già calcolato si somma `0,35·max(0, spinta di chi attacca)`, e la curva batte anche quando la spinta supera 0,6 — un termine in una riga che esiste (:16680-16683). Gratis: il banner dice il fatto quando lo stato cambia di scalino («TESTA ALTA», «CI CREDONO»). Tutto rispetta MOVIMENTO RIDOTTO.
  *Dipendenze:* v1 stati
  *Valore:* medio-alto: è la parte che si vede a 30 px, l'unica scala che CALCETTO ha davvero
- **v1 — IL BANCO CHE CONDANNA: `strumenti/_q-umore.js`, nato ROSSO** — 2 g — (§7.5, gate M4)
  Cinque prove CPU contro CPU a semi dichiarati, taglia 5, con la dispersione accanto a ogni numero: (1) SPECCHIO — storie speculari → stati speculari al bit (la mirrored-history del mandato, costruita seminando la stessa partita a squadre scambiate); (2) TETTI — su N partite nessuna manopola supera il tetto, col massimo osservato stampato; (3) TESTIMONE — ogni secondo in cui uno stato supera la soglia ha almeno un canale visibile acceso (lo stato muto fallisce, come ordina §7.2); (4) L'INPUT È SACRO — stesso nastro, stesso verbo prima e dopo il modello (impianto di _q-replay); (5) IL GIOCO BUGIARDO — una versione col tetto violato e una collo stato muto, il banco DEVE farsi rosso su entrambe (metodo di _crit-festa-dado). Più i cancelli di sempre: determinismo 10/10, due-versioni dichiarato.
  *Dipendenze:* v1 stati + canali
  *Valore:* alto, non negoziabile: «uno strumento che attesta invece di misurare è peggio di nessuno strumento» — ventuno casi in casa
- **v2 — IL CONTAGIO E IL CAPITANO** — 2 g — (§7.4, §7.6)
  Una riga nel passo di squadra a 0,25 s: ogni compagno entro `RAGGIO = 3·SEP_R` (unità di campo, che scalano con la taglia — non metri) tira l'umore verso la media locale di un decimo (l'aritmetica dell'indole, già pagata). Il capitano pesa doppio e smorza il negativo (il leadership-damping senza un tratto nuovo: il peso È il capitano). Il suo gesto quando `spinta ≤ −0,5`: clip di incitamento — che NON esiste e va fatta, ed è il costo vero — e umore su ai compagni nel raggio, ogni 25 s. Nessun menu: al campetto il capitano non chiede il permesso.
  *Dipendenze:* v1 intera
  *Valore:* medio: trasforma tre numeri in una squadra, ma chiede una clip nuova — la voce più cara del listino di casa
- **v2 — LA REGOLAZIONE SENZA INTERVALLO** — 1 g — (§7.6)
  Niente intervallo in CALCETTO: i tre reset che ESISTONO diventano i surrogati del team-talk, con effetto dichiarato e tetto — il calcio d'inizio dopo un gol (azzera metà dei nervi di entrambe), l'ingresso del rincalzo (entra a umore 0 e nervi 0: la riga esiste a :12170, le manca il significato), la MENTALITÀ cambiata in pausa (il gesto di regolazione umano già in casa). Per la squadra umana la CHIAMATA (L2.3) diventa incitamento: chiamare un compagno gli alza l'umore di poco.
  *Dipendenze:* v2 contagio
  *Valore:* medio: chiude §7.6 senza inventare schermate
- **v2 — LA STRISCIA DEL MOMENTO (timeline post-partita)** — 2 g — (§7.8)
  Si campiona `spinta` una volta al secondo (90-180 campioni, mai serializzati per intero) e si disegna una striscia sotto il tabellino coi fatti come tacche; il «momento emotivo» è il punto di massima pendenza. Paga due volte: dà anche alla moviola un criterio per scegliere COSA rivedere oltre il gol — e il giudice ha messo «il fermo immagine dell'azione che valga quanto la lavagnetta» fuori elenco come traguardo vero.
  *Dipendenze:* P0 + v1 stati
  *Valore:* medio-alto: la voce del mandato che si vede di più senza toccare il campo
- **v2 — IL VOLTO CHE CAMBIA, MA SOLO NEL PRIMO PIANO** — 1 g — (§7.7)
  `espr` e `sopra` esistono già come tratti statici dal seme del nome: si scavalcano con lo stato SOLO dove il volto esiste (oltre LOD_PX=120: ripresa dedicata, duello, ritratto del tabellino). Due assi, sei combinazioni, nessuna blend shape — due tinte d'inchiostro e una virgola. Il banco è volti.js, che già misura coppia per coppia.
  *Dipendenze:* v1 stati
  *Valore:* basso-medio: paga solo nel primo piano, ma è la voce del §7.7 che costa meno
- **v2 — IL DISCHETTO SOTTO PRESSIONE, SENZA TOCCARE IL DITO** — 1 g — (§7.1, §7.5)
  La banda dell'UMANO non si stringe mai per emozione (sarebbe un effetto sull'input, vietato dal mandato stesso e percepito come imbroglio). Si muovono le due cose che non sono il dito: il portiere CPU (anticipo del tuffo scala coi propri nervi, tetto ±10%) e il tiratore CPU (angolo che si accentra coi nervi alti). Canale d'occhio: rincorsa più corta coi nervi alti, folla che tace un attimo prima.
  *Dipendenze:* v1 stati + banco _q-umore già esistente
  *Valore:* medio: il rigore è il momento di massima attenzione — e la casa ha già misurato l'equità della lotteria (+0,330→+0,195 reti): qui si rischia di riaprirla, il banco fa la guardia
- **v2 — L'HUD DELL'UMORE, FACOLTATIVO E SPENTO DI SERIE** — mezza g — (§7.7)
  Glifo sopra il comandato e barra di spinta sotto il punteggio, ma: spento di serie (legge di casa misurata: «HUD e bussola che non mangino mai il protagonista», ancora aperta), e il glifo DICHIARATO nelle zone d'interfaccia (:42179-42198) se no istantanea.js lo conta come ombra sul manto — già successo tre volte su otto istanti. Il «collapse warning» a bordo schermo si esclude: quel bordo è già dell'anello squadra e del pannello uomo-in-meno.
  *Dipendenze:* v1 stati + canali
  *Valore:* basso: utile al collaudo e al debug overlay del gate M4, poco al giocatore

**Esclusioni già decise o da non importare alla lettera:** 

- BLEND SHAPES FACCIALI ≥24 TARGET (§7.7): la figura è nata per 30 px; il volto si disegna solo oltre LOD_PX=120 (:6937-6951) ed è fatto di due tinte d'inchiostro — volti.js ha già misurato che occhi/bocca/sopracciglia muovono il 3% del cartoncino. Il massimo onesto è UN asse a tre valori, nel primo piano soltanto.
- MICRO-BLINK E EYE DARTS (§7.7): gli occhi sono due ellissi piene con riflesso solo sopra raggio 22 (:24280-24294). Non c'è niente da animare.
- DISCORSO DELL'INTERVALLO (§7.6): CALCETTO non ha intervallo (tempo unico, golden goal, dischetto). Si traduce sui reset che esistono, non si importa.
- VAR, ROSSO, AMMONIZIONE PER PROTESTE (App. B): non hanno referente — il giallo c'è, il secondo giallo di squadra vale 12 s di uomo in meno (futsal). Le righe si cancellano, non si tarano.
- IL PROMPT Team/Solo/Rispettosa DENTRO L'ESULTANZA (§7.4): la scena del gol è una regia chiusa che la giuria ha promosso; infilarci un menu la rompe. Se mai, postura scelta PRIMA della partita.
- «±60 ms DI LATENZA» ALLA LETTERA (§7.5): react vale 0,42/0,25/0,12 s — 60 ms sono fra il 14% e il 50% della manopola, mezza difficoltà. Tetto da ri-dichiarare in RELATIVO (±10%) o voce fuori dalla v1.
- CONTAGIO «ENTRO 15 METRI» (§7.4): a taglia 5 quindici metri sono quasi tutto il campo. Raggio in unità di campo che scalano (multipli di SEP_R), non in metri.
- PERDITA DI TEMPO DA ANSIA (§7.5): esiste già come GESTIONE, senza emozione. Aggiungerla sarebbe il secondo impianto accanto al primo — vietato dal commento del carattere.
- MOLTIPLICATORE DI POSTA A 5 SCALINI (§7.3): CALCETTO ha un'altra tassonomia (amichevole/torneo/stagione/sfida/divisioni). Si aggancia a G.matchCtx con al massimo tre scalini.
- docs/MIND.md CON CITAZIONI ACCADEMICHE: le fonti valgono come ancore di progetto; in questo repo la tavola dei numeri va nel MANUALE, voce a registro, con la misura del banco accanto — legge degli studi a edizioni.

**Avvisi onesti:**

- SORTEGGI, primo corollario: il modello NON chiama dado() nemmeno una volta. Precedente scritto due volte nel file (:33493, :19443-19444). Se un giorno servisse un sorteggio, generatore PROPRIO, mai SEME.
- SORTEGGI, secondo corollario (quello che si dimentica): anche senza dado() nuovi, cambiare una SOGLIA cambia i rami e quindi il conto a valle. Il due-versioni DIVERGERÀ per costruzione: si dichiara (precedente #86, 58/60). Il cancello che DEVE restare verde è _q-determinismo 10/10.
- IL NASTRO DELLE SFIDE: un modello emotivo È un cambio di motore — i nastri di ieri non si rigiocano. Deve viaggiare sul cancello #96.
- LA #98 È APERTA: a 7/11 il motore diverge già fra pagine fresche (8/10). Ogni determinismo del modello si misura a taglia 5; a 7/11 si dichiara CONTRO quel fondo.
- LA SIMMETRIA DEL MANDATO NON ALLA LETTERA: in casa c'è la decisione contraria motivata (la squadra di chi gioca non ha carattere, :10942-10946). Si verifica sulla FORMULA e su banco a specchio CPU-CPU, e si scrive così nel verbale.
- MAI SULL'INPUT, E L'INPUT HA UNA STORIA: la voce #88 ha appena chiuso la «faccia bugiarda» dei dischi (147→0). Un modello che spegnesse un verbo per emozione riaprirebbe la ferita da una seconda porta.
- «VISIBILE A SEI POLLICI» È IL PUNTO DEBOLE, NON IL FORTE: esultanza illeggibile al 39,1%, parata al 63,3% (misura della giuria). Stati senza canali leggibili = stati invisibili. La v1 usa i canali che GIÀ leggono; le clip nuove si contano a parte (la voce più cara del listino).
- IL MODELLO NON COMPRA I DECIMI CHE MANCANO: il 9 è dietro le pose e il centro del quadro. La MIND si vende sulle lenti «pollice» (7,3) e «ancoraggio ai concorrenti» (6,2), non sulla fotografia.
- NON CONFONDERE DUE FRUSTRAZIONI: la frustration del mandato è dei calciatori simulati; la «giuria dei dieci minuti sul rischio-frustrazione» di casa riguarda CHI GIOCA. Un crollo della squadra dell'umano può peggiorare la seconda migliorando la prima — nessun banco di simmetria se ne accorge.
- OGNI MISURA CPU CONTRO CPU A SEMI DICHIARATI con la dispersione accanto; e il banco nuovo nasce ROSSO su una versione bugiarda costruita apposta (metodo _crit-festa-dado).
- DOCUMENTAZIONE DA SANARE COMUNQUE: esultanza, delusione, festa e ripresa dedicata non compaiono in nessuna delle 269 voci del MANUALE. Aggiungere il modello senza scriverle = costruire il secondo piano di una casa col primo non censito.


## 3. Leggibilità, pose e regia (mandato §8, App. C)

Leggibilità, animazione e regia — SPEC 08-art-animation.md §8.1/8.3/8.7 + appendix-c-animation-set.md, contro CALCETTO-il-gioco.html (rig Rig3D a pose procedurali, canvas 2D)

**C'è già:**

- Grammatica di pose come dati/funzioni, con fotogramma di contatto pinnato su una fase fissa dichiarata — l'equivalente in casa di 8.8.2.1 (pose grammar, contact frame pinned to a fixed tick), senza bpy/glTF: sono le stesse pose che disegnano la partita.
  *Prova:* CALCETTO-il-gioco.html:6712-6748 (tabella CLIPS, 27 clip: fermo, camminata, corsa, passaggio, cross, tiro, testa, scivolata, contrasto, rovesciata, parata, tuffo, presa, rinvio, esultanza, ecc.); il contatto dichiarato in fase u nei commenti a :5389 ("0,36 CONTATTO"), :6076 ("0,32 CONTATTO"), :6128 ("0,20 CONTATTO")
- Diversi dei 12 principi (8.3) sono già scritti a mano nel codice delle pose: anticipazione/slancio, arco, overshoot-and-settle, squash sulla palla all'impatto — non teoria, pratica misurata a commento.
  *Prova:* CALCETTO-il-gioco.html:5171 ("DEFORMAZIONE: schiacciata della palla nell'attimo d'impatto"), :5605 ("l'arco"), :6422 ("la schiena si inarca"), :6509 ("l'overshoot del pugno")
- Banco SILHOUETTE: leggibilità a 40px calibrata su un vero provino cieco umano (non su un proxy geometrico inventato), con la metrica "scavo" (frazione del guscio convesso occupata da sfondo, soglia 0,33) nata perché il primo proxy dava un verdetto INVERTITO rispetto al giudizio umano vero.
  *Prova:* strumenti/silhouette.js e strumenti/_q-silhouette.js (header, provino 17 agosto 2026: giudice umano nomina 3/10, il banco proxy ne dichiarava 8/10, poi corretto); PUNTO-DEL-LAVORO §"regole pagate" #9 ("un cancello che approssima un giudizio umano va tarato contro giudizi umani veri")
- Banco GABBIA: invariante di lunghezza d'osso su ogni clip × 64 fasi + vincolo "nessun giunto sotto il piano" — copre "solid drawing (no limb intersections, volume preserved)" di 8.3.
  *Prova:* strumenti/gabbia.js (header: "se la cinematica diretta è onesta, la distanza fra due giunti collegati da un OSSO vale sempre la stessa"), strumenti/_q-gabbia.js, strumenti/_q-gabbia-fusa.js
- Banco REGIA: stacchi di camera contati sui pixel veri (non dichiarati), soglia di riferimento 2,16 stacchi/minuto, divieto assoluto di stacco durante gioco attivo, verifica soggetto nel terzo centrale + contrasto ≥3:1 WCAG dopo ogni stacco — è la versione misurata e più severa del CameraDirector "safe-area framing" di 8.7.
  *Prova:* strumenti/_q-regia.js (header completo, 5 verifiche numeriche + 2 controlli negativi N1/N2), strumenti/_p-regia.js, strumenti/_t-regia.js
- Metrica sigma2 (pixel per metro di spostamento sagittale) — lo strumento che ha DIAGNOSTICATO l'entrata #1 di PUNTO-DEL-LAVORO ("para" 63,3% illeggibile: dz 1,382 contro dy 0,605 sul tuffo, causa geometrica non di camera). Non ha equivalente nel mandato: lint.py di stadium-roar lavora su posizioni 3D vere e non vedrebbe un collasso d'asse in una proiezione 2,5D come questa.
  *Prova:* strumenti/_z-verbo.js (formula sigma2 = (hPx/1,9)·|sin(imbardata)|, header completo); PUNTO-DEL-LAVORO §"Cosa resta per il 9" riga 1
- Elevazione di camera calcolata a formula (50°→42°) con dimostrazione numerica dell'effetto su ogni giunto, non "gusto" — risponde all'esigenza di una regia deliberata di 8.7.
  *Prova:* CALCETTO-il-gioco.html:6941-6970 (commento con la derivazione SY = cy-(y·ce+zw·se)·s e il calcolo tan(50°) vs tan(42°))
- Hit-stop già implementato su tackle e gol (parente del "hit-stop 2-4 frames on strong tackles/power shots" di 8.3).
  *Prova:* CALCETTO-il-gioco.html:17904 (G.freeze=0.11 "hit-stop scivolata perfetta"), :8407 (golStop, fermo immagine sul gol)
- 8.8.1 (licenza/manifest per ogni clip, CI che blocca clip senza fonte) è già "vinta per assenza di problema": in CALCETTO le pose sono scritte in casa al 100%, zero mocap/librerie esterne — non c'è nulla da tracciare.
  *Prova:* Nessuna occorrenza di mocap/Mixamo/CMU nel repository CALCETTO; tutte le funzioni pose* sono funzioni JS scritte a mano nel file, non asset importati

**C'è in parte:**

- I 12 principi (8.3) — la copertura è reale ma sparsa e non banked per ciò che riguarda timing/discontinuità. — *stato:* Staging (regia+silhouette) e solid drawing (gabbia) hanno un cancello numerico permanente in batteria. Anticipazione/arco/overshoot/squash sono scritti a mano nelle pose ma nessun banco verifica che restino intatti quando una pose viene riscritta (es. il tuffo, voce #85 #1): oggi la garanzia arriva solo alla prossima corsa di silhouette/z-verbo, che misurano leggibilità e non timing.
  *Prova:* PUNTO-DEL-LAVORO §"Cosa resta per il 9" riga 1 (tuffo in lavorazione, dz/dy)
- Contact-frame accuracy (piede-palla, testa-palla, mani del portiere) — 8.3 "contact accuracy". — *stato:* Il contatto è ancorato: le funzioni palla* (pallaCalcio, pallaTesta, pallaTuffo, pallaRinvio) leggono i parametri Q_* della stessa pose e la palla non fluttua indipendente dal gesto. Ma il numero di fase in cui il contatto avviene esiste solo in un commento per ogni clip, non in una tabella dati leggibile da uno strumento — nessun banco può oggi verificare che il picco di velocità dell'arto cada davvero su quella fase.
  *Prova:* CALCETTO-il-gioco.html:5236-5268 (pallaCalcio, commenti "IL FOTOGRAMMA DI CONTATTO")
- Discontinuità di movimento (velocity discontinuities, 8.8.3) — nella moviola sono state misurate e curate UNA VOLTA (voce #85). — *stato:* Curata con una prova artigianale e non ripetuta a regime: la prova SCATTO ha misurato "0 fotogrammi congelati su 16 transizioni" per otto cronometri specifici (kickT/kickB/charge/…) nel solo contesto della moviola. Non esiste un banco che ripeta la stessa misura su tutte le 27 clip o fuori dalla moviola.
  *Prova:* MANUALE.md righe 462-473 (voce #85, compito 1, prova SCATTO)
- Camera micro-shake (8.3: "su posts/crossbar/goals") — solo metà della coppia hit-stop+shake esiste. — *stato:* Hit-stop esiste (scivolata, gol). Nessuna occorrenza di scossa di camera legata a palo/traversa trovata nel file.
  *Prova:* grep negativo su "shake/trema/scuot" in contesto palo/traversa, CALCETTO-il-gioco.html

**Manca:** La quasi totalità dell'ampiezza di Appendix C fuori dai verbi già coperti: mosse di abilità con nome proprio, presa in 4 direzioni × terra/aria, volée/mezza-volée/tacco/tocco singolo distinti, tackle L/R come clip separate (oggi mirror per segno), duello aereo vinto/perso come esiti distinti, gesti dell'arbitro (cartellino, vantaggio, fallo laterale), spogliatoio/panchina (sostituzione, infortunio, barella, stretta di mano, alzata trofeo). Nessuna di queste ha un modello/animazione nel gioco: i cartellini sono icone UI, l'arbitro non ha una figura disegnata (grep 'arbitro' in CALCETTO-il-gioco.html: solo 'fischio', mai una figura). · Camera micro-shake su palo/traversa (8.3). · Sistema volto/sguardo (8.3 'eyes always alive', saccadi, gaze targets) — assente per scelta di stile, vedi avvisi.

**Proposte (tradotte all'idioma di casa):**

- **Tabella dati dei fotogrammi di contatto (estratta dai commenti al codice)** — mezza g — (8.8.2.1 (contact frame pinned to a fixed tick))
  Portare i numeri oggi scritti solo in commento (es. "0,36 CONTATTO" nel tiro, "0,32" nei pugni, "0,20" nella respinta) in una piccola costante dati unica, ad es. const CONTATTO_U = {tiro:0.36, pugni:0.32, respinta:0.20, ...}, referenziata sia dal disegno sia da un futuro banco. Non tocca la grafica: è una ridenominazione di un numero già vero in un posto che uno strumento può leggere.
  *Dipendenze:* propedeutica alla proposta successiva; nessun'altra dipendenza
  *Valore:* Senza questa tabella qualunque banco di timing dovrebbe re-implementare a mano, per ogni clip, la ricerca del picco di contatto — fragile e duplicato rispetto al gioco vero, esattamente l'errore che _q-silhouette.js si vanta di evitare ('un banco che disegnasse a modo suo direbbe verde su una figura che in campo non esiste').
- **Banco "battito" — discontinuità e scarto del fotogramma di contatto, generalizzato dalla voce #85** — 2 g — (8.8.3/8.8.4 (anim-lint, metriche e soglie))
  Estendere la prova SCATTO one-off della voce #85 a un banco permanente (es. strumenti/battito.js, stesso stampo di _z-verbo.js/gabbia.js: server locale + Playwright + page.evaluate sulla pose() nuda). Per ogni voce di CLIPS: campiona pose(u) a passo fine (es. 240 campioni), calcola la velocità di ogni giunto per differenza finita in unità di schermo proiettate, e verifica (a) sulle clip senza contatto dichiarato nessun salto anomalo di velocità (rapporto picco/mediana oltre soglia dichiarata); (b) sulle clip con contatto dichiarato (leggendo la tabella della proposta precedente) lo scarto in fotogrammi-schermo a 60 fps fra il picco di velocità del giunto che tocca la palla e la fase dichiarata.
  *Dipendenze:* Richiede la proposta della tabella dati; si appoggia allo stesso schema server+Playwright già collaudato in strumenti/_z-verbo.js e strumenti/gabbia.js
  *Valore:* Dà un cancello permanente esattamente dove oggi c'è solo una prova artigianale fatta una volta e mai ripetuta — e soprattutto dà una rete di sicurezza al lavoro già programmato sulla voce #85 #1 (riscrivere poseTuffo sull'asse della quota, 1,5 decimi): quella riscrittura rischia proprio le due classi di difetto che il mandato chiama 'velocity discontinuities' e 'contact-frame timing error', e oggi nessuno strumento di casa le vedrebbe finché non arrivasse un nuovo provino cieco umano su silhouette. Non sostituisce silhouette/z-verbo (leggibilità della sagoma, non timing): li completa su un asse che nessuno dei due copre. Verdetto sull'adattare tools/anim/lint.py 1:1: SOLO parziale — foot-slide e root-drift presuppongono un rig con piedi fisicamente piantati/scivolanti in 3D; il rig di CALCETTO è una proiezione 2,5D parametrica dove il 'piede' non ha una posizione 3D indipendente da riprodurre, quindi quelle due metriche non si traducono senza inventare un concetto estraneo al motore — vanno lasciate fuori, non tradotte a forza.
- **Micro-shake su palo/traversa** — 1 g — (8.3 (camera micro-shake on posts/crossbar/goals))
  Aggiungere uno scarto di camera di 2-4 fotogrammi ad ampiezza dichiarata quando la palla colpisce palo o traversa, sotto le stesse soglie che _q-regia.js già usa per distinguere un movimento di gioco da uno stacco (zoom <10%, pan <88px CSS) così il banco lo legga come 'molla del gioco' e non come un rosso nuovo; se si vuole un'ampiezza sopra soglia, _q-regia.js va esteso PRIMA a riconoscere esplicitamente questo caso come 'scossa dichiarata', non 'stacco'.
  *Dipendenze:* Deve passare (o essere dichiarata a) _q-regia.js, che oggi giudica rosso qualunque salto di camera oltre soglia durante gioco attivo
  *Valore:* Chiude uno dei pochi elementi di 8.3 con zero traccia in casa (hit-stop c'è già su tackle e gol, la scossa su legno no); il momento è già calcolato dal motore (traiettoria gitt/arco), quindi l'aggancio è a basso rischio.

**Esclusioni già decise o da non importare alla lettera:** 

- Il mandato collega la regia anche al fuorigioco (es. camera dedicata su offside in FC Mobile) — DIFFERENZE-FC-MOBILE.md righe 653-655/769-771 conferma che il fuorigioco è escluso per scelta della 'gabbia' di CALCETTO: non riproporlo come default in questa area.

**Avvisi onesti:**

- Il sistema di volto/sguardo di 8.3 (occhi sempre vivi, saccadi, blend con la locomozione, gaze target su palla/avversario/arbitro/folla/compagno) NON ha senso per CALCETTO così com'è: le figure sono silhouette pure, senza volto in partita (DIFFERENZE-FC-MOBILE.md riga 4832: 'nessun volto in partita: la testa è un cerchio pieno di pelle più i capelli'; agente7.md: 'la nostra strada resta la leggibilità stilizzata'). È una scelta di stile documentata, non una lacuna: proporre un sistema facciale tradirebbe l'identità del gioco e andrebbe respinto, non colmato.
- La proposta del committente di adattare 1:1 tools/anim/lint.py va corretta prima di partire: due delle cinque metriche (foot slide, root drift) presuppongono posizioni 3D vere di un piede fisicamente piantato, concetto che il rig 2,5D di CALCETTO non ha. Le altre tre (velocity jump, contact-frame error, joint/sample sanity) si traducono bene e sono la sostanza delle due proposte sopra.
- La cura Voce #87 (rimesse laterali e calci d'angolo, spec/piano già committati) tocca già poseRinvio e prevede camere dedicate per rimessa/angolo — è la sezione 6.6 del mandato, già avviata: non riproporre qui camere o pose per quei calci piazzati.


## 4. Controlli, UX e accessibilità (mandato §9)

Controlli, UX, onboarding, accessibilità — mandato: docs/SPEC/09-controls-ux.md; riscontro in casa: MANUALE.md, pulsantiera-contesto-design.md (voce #88), PUNTO-DEL-LAVORO.md, DIFFERENZE-FC-MOBILE.md, piano #87

**C'è già:**

- Pulsantiera a stato invece che a soglia geometrica (mandato 9.2, 'context-sensitive buttons' e forgiveness/intent-resolution): la faccia dei dischi dipende dal possesso letto da squadraDelPallone(), le celle impossibili si SPENGONO invece di travestirsi da un altro verbo, il comando segue il destinatario dichiarato del passaggio/cross entro 0,28 s, il raddoppio è una tenuta.
  *Prova:* Voce #88 CURATA, sei soglie tutte verdi su strumenti/_q-volo.js (11/11) — docs/superpowers/specs/2026-09-01-pulsantiera-contesto-design.md §4-5; PUNTO-DEL-LAVORO.md, giornata 6 settembre, riga 1
- Levetta a stick virtuale mobile (appare dove atterra il dito), zona morta e curva di accelerazione — corrisponde a 9.2 'floating virtual stick, dead zone, radial acceleration curve'.
  *Prova:* MANUALE.md righe 73-76: 'zona morta 12 px, corsa piena a 46; oltre 70 l'origine insegue il dito'
- Feedback visivo ricco e già mappato uno-a-uno su gran parte di 9.3: linea di tiro (ambra/gesso), arco pallonetto/cross, linea del passaggio, anello di carica, tacca di mira sulla porta, anello ambra con freccia sotto il proprio uomo, anello di gesso con pozza dorata sotto il portatore, cuneo PORTA/targhetta fuori quadro, segno rosso di divieto sul verbo impossibile.
  *Prova:* MANUALE.md righe 106-114 (elenco 'Gli aiuti visivi')
- Haptics granulari legati allo stesso bus di eventi (gol, tiro perfetto, tackle/scivolata, fallo, cartellino, palo, rigore) — copre 9.3 'haptics for kicks/tackles/goals/whistles' meglio del generico enunciato, con pattern diversi per evento, non un buzz uguale per tutto.
  *Prova:* function buzz() CALCETTO-il-gioco.html:8536; chiamate a righe 11202 (gol), 15770/15836/15998/16391 (tiri perfetti), 17851 (contrasto), 17937 (fallo), 18264/18778/18847/18957 (palo/parata); MANUALE.md riga 320
- Riduzione del movimento già rispetta la preferenza di sistema in automatico e disattiva scossa, coriandoli, rallenty al gol e scia — copre 9.7 'reduced motion (disables camera shake, hit-stop...)' con un solo interruttore che governa tutto l'effetto, non uno per uno.
  *Prova:* CALCETTO-il-gioco.html:9893 ('prefers-reduced-motion: reduce' letto da matchMedia), righe 16594-16602 (golSlow), 11771; MANUALE.md riga 322
- Layout mancino: specchia dischi, levetta e bussola — copre 9.7 'left-handed mirror layout'.
  *Prova:* MANUALE.md riga 330 (voce MANO in COMANDI)
- Dimensione e distanza dei dischi regolabili a gradini, con lettura live di diametro/margine/percentuale schermo — copre 9.7 'remappable button positions and sizes' (posizione non si sposta, ma taglia e distanza sì, con misura onesta a video invece di un numero dichiarato a caso).
  *Prova:* MANUALE.md righe 331-335
- Onboarding 'si insegna facendo, non leggendo' (9.1): tutorial di 3 passi che avanza al gesto riuscito o dopo 3 s, saltabile con SALTA, chiude al primo gol.
  *Prova:* MANUALE.md righe 19-24
- Tempo di avvio già ben dentro il tetto del mandato (9.1 'loading ≤4s'): 1861 ms da icona a pallone toccabile su telefono vero, 7/7 avvii buoni, contro un tetto interno di 2000 ms — 16-21× più veloce di FC Mobile.
  *Prova:* PUNTO-DEL-LAVORO.md, giornata 26-27 agosto riga 7 ('L'avvio era già a posto... 1861 ms'); _analisi/DIFFERENZE-FC-MOBILE.md riga 'Tempo di avvio' (1861 ms vs 30-40 s)
- Negozio a 5 carte e patto anti-dark-pattern scritto in cima ('niente pubblicità, niente casse premio, niente attese') — supera 9.1 'max 6 offers... no dark patterns'.
  *Prova:* MANUALE.md righe 260-279
- Nessuna chat testuale libera nel gioco (per costruzione) — coerente con 9.1 'no free-text chat'.
  *Prova:* MANUALE.md §11 SFIDA: nessuna menzione di chat; nessuna occorrenza trovata nel censimento
- Durate di sessione coerenti e scalate per taglia (90″/126″/180″), non arbitrarie — coerente con 9.1 'consistent session lengths'.
  *Prova:* MANUALE.md riga 58 e riga 325
- Il duello dal dischetto ha già mirino trascinabile + finestra di tempismo che si stringe più si mira all'incrocio, e il portiere umano sceglie il lato col dito — copre in parte 9.2 'set-piece controls: aim reticle + power... goalkeeper penalty guess with swipe'.
  *Prova:* MANUALE.md righe 150-161 (§6 Il duello dal dischetto)
- Il cantiere aperto #87 (rimesse/angoli), nella sua sezione già progettata (compito 3), sceglie esplicitamente di dare rimesse/angoli AI VERBI DI CASA (PASSA/CROSS con TIRA spento) invece di un minigioco a parte — cioè conferma per iscritto la stessa filosofia del mandato 9.2 (controlli sui piazzati) ma nell'idioma della pulsantiera già curata, scartando l'alternativa 'minigioco stile Duel'.
  *Prova:* docs/superpowers/specs/2026-09-17-rimesse-e-angoli-design.md §3.C; docs/superpowers/plans/2026-09-17-rimesse-e-angoli.md, Compito 3

**C'è in parte:**

- Accessibilità daltonismo (9.7 'colour-blind kit patterns and markers') — *stato:* parziale: un solo meccanismo (kit fisso), non 'pattern e marker' come chiede il mandato
  *Prova:* ALTO CONTRASTO forza gli ospiti sempre nel kit blu dedicato — copre solo il conflitto di colore squadra-vs-squadra, non pattern/marker aggiuntivi sul corpo o sulla palla. MANUALE.md riga 323
- Etichette per lettore di schermo (9.7 'screen-reader labels on menus') — *stato:* parziale: copertura puntuale, non sulle sette voci del menu principale né sulle schermate
  *Prova:* aria-label esiste solo su risultato finale e due-tre bottoni isolati (ingranaggio, pausa, logo) — CALCETTO-il-gioco.html righe 2863-2864, 2904, 2924, 3066, 3069, 11237
- Vibrazione a intensità (9.3 mandato Stadium Roar: 'haptics mapped from event bus with intensity tiers') — *stato:* il meccanismo sotto c'è già; manca solo il moltiplicatore utente
  *Prova:* CALCETTO ha già il bus di eventi giusto (buzz() con pattern diversi per evento, MANUALE.md riga 320) ma l'unico controllo utente è ON/OFF, non un cursore di intensità
- Controlli sui piazzati (9.2 'set-piece controls') — *stato:* IN CORSO — spec e piano committati (voce #87, sezione 6.6 del mandato), compito 3 non ancora scritto nel gioco: dipendenza diretta per qualunque proposta su controlli di rimesse/angoli
  *Prova:* docs/superpowers/plans/2026-09-17-rimesse-e-angoli.md, Compito 3 (non ancora eseguito: righe 88-121)
- Uno-due / doppio input rapido (9.2 'a second tap within 200ms requests the return ball') — *stato:* esiste un effetto equivalente, ma nasce da un gesto di annullo, non da un doppio tap cronometrato dedicato
  *Prova:* MANUALE.md righe 94-96: annullando il FILTRANTE (dito lontano dal disco), 'il compagno chiamato continua la corsa: è l'uno-due senza palla'
- Indicatore di stamina/fiato visibile (9.3 'stamina ring around the selected player') — *stato:* il dato e un segnale indiretto esistono; manca un anello dedicato leggibile anche a levetta ferma
  *Prova:* p.fiato governa scatto e scudo (CALCETTO-il-gioco.html righe 4180, 17605, 17639-17661) e la pista della levetta 'si accende d'ambra' durante lo scatto (MANUALE.md riga 87)

**Manca:** Livelli di assistenza per il giocatore umano (mandato 9.2 Beginner/Standard/Pro: forza dell'auto-switch, dell'assistenza di mira, scudo automatico). CALCETTO ha solo la difficoltà della CPU (Facile/Normale/Duro, MANUALE.md righe 54-55): governa la macchina, non l'assistenza al proprio pollice. Nessuna voce trovata nel censimento per un equivalente lato giocatore. · Buffering dell'input dichiarato a 150ms e coyote-time nominati come tali (mandato 9.2). Non trovato un meccanismo con questo nome; esistono sostituti concettuali con logica diversa (ri-armo sul cambio di contesto, raggio di annullo R_ANNULLA=96px, rilascio inerte) che non sono la stessa cosa e non vanno confusi nel verbale. · Matchmaking a piazzamento con rating stile Glicko (mandato 9.4/9.5). SFIDA è già in rete ma è 1 partita alla volta contro un avversario assegnato dal server con 'indole' comportamentale e una classifica di posizione, non un ladder competitivo con rating. · Momentum bar ed edge-glow negli ultimi minuti (mandato 9.3). Nessuna traccia nel censimento. · Commentatore narrante, vocale o testuale (mandato 9.4 'narrated by the commentator', 9.7 'subtitles for commentary'). 'LA LAVAGNA DEL COMMENTATORE' nel codice è solo il nome interno della schermata di moviola (traiettoria + marcatore cerchiato): CALCETTO non ha narrazione, solo SFX (Audio5.*) e banner testuali a evento. · Voce 'RIVEDI IL TUTORIAL'. Gap già a registro in casa: 'Il tutorial non è rigiocabile se non azzerando tutto: manca una voce «rivedi il tutorial»' — MANUALE.md righe 756-757. · Kit clash auto-resolve a livello di intera squadra (mandato 9.5). Esiste solo per il portiere (scegliDivisaPortiere, la tinta più lontana dalle due divise e dal prato, CALCETTO-il-gioco.html righe 24543-24582), non per evitare che squadra di casa e ospite indossino colori simili. · Verifica misurata della sicurezza fotosensibile (mandato 9.7 'no full-screen flashes > 3 Hz'). I lampi della tribuna al gol (CROWD_FLASH) esistono ma nessun banco misura la loro frequenza contro una soglia dichiarata.

**Proposte (tradotte all'idioma di casa):**

- **RIVEDI IL TUTORIAL** — mezza g — (9.4)
  Un flag separato (SAVE.tutorialVisto) invece del solo 'tutorial mai fatto/già fatto'; una voce in IMPOSTAZIONI (accanto a COME SI GIOCA) che richiama la stessa scena dei 3 passi senza toccare AZZERA TUTTI I DATI. Nessun verbo nuovo, nessuna clip nuova: si riusa la scena esistente.
  *Dipendenze:* nessuna
  *Valore:* chiude un gap già scritto a registro in MANUALE.md (righe 756-757); risponde allo spirito di 9.4 'contextual tips ... can be disabled' nel verso opposto (poterli rivedere), a costo quasi nullo
- **Anello di fiato attorno al comandato** — 1 g — (9.3)
  Disegno puro attorno al disco/corpo del giocatore selezionato che si svuota leggendo p.fiato (già calcolato per scatto/scudo, CALCETTO-il-gioco.html righe 17605-17661): nessuna fisica nuova, nessun dado() nuovo, solo un cerchio che legge un numero che il motore già tiene.
  *Dipendenze:* nessuna
  *Valore:* soddisfa 'stamina ring' del mandato con un dato già in casa; a rischio quasi zero perché è disegno puro (stesso statuto delle clip di posa: non tocca il due-versioni)
- **Sottotitoli degli eventi sonori (non del commentatore, che non esiste)** — 1-2 g — (9.7)
  Non si inventa un commentatore: si aggiunge un piccolo banner testuale sincronizzato con i 4-5 eventi Audio5.* più importanti (fischio, palo, gol, cartellino) quando VIBRAZIONE/AUDIO sono spenti o con un nuovo interruttore SOTTOTITOLI. Riusa showBanner(), già esistente per ESPULSIONE e altri messaggi.
  *Dipendenze:* nessuna
  *Valore:* traduce onestamente 'subtitles for commentary' nell'unico parlato che CALCETTO ha davvero: l'audio di gioco, non una voce narrante
- **aria-label sulle sette voci del menu principale e sulle PREFERENZE** — 1 g — (9.7)
  Estendere il pattern già usato su ingranaggio/pausa/risultato finale (CALCETTO-il-gioco.html righe 2863-2864, 11237) ai bottoni GIOCA/STAGIONE/TORNEO/SFIDA/SPOGLIATOIO/BACHECA/NEGOZIO e alle righe di IMPOSTAZIONI. Solo markup, zero logica di gioco toccata.
  *Dipendenze:* nessuna
  *Valore:* copre 'screen-reader labels on menus' (9.7) a rischio pressoché nullo: nessun banco di gioco può regredire da un attributo HTML
- **Cursore di intensità della vibrazione (leggera/normale/forte)** — mezza g — (9.3, 9.7)
  Un solo numero SAVE.vibIntensita che moltiplica i pattern già passati a buzz() (CALCETTO-il-gioco.html riga 8536): non si tocca il bus di eventi, si scala l'ampiezza dei millisecondi già scritti per ogni pattern.
  *Dipendenze:* nessuna
  *Valore:* chiude il gap 'solo ON/OFF' segnalato in in_parte, riusando un meccanismo già granulare invece di costruirne uno nuovo
- **Banco fotosensibilità sui lampi della tribuna** — 1 g — (9.7)
  Uno strumento nuovo in strumenti/ (stile _q-*, con verdetto VERDE/ROSSO) che misura la frequenza dei CROWD_FLASH renderizzati (CALCETTO-il-gioco.html righe 28672-28846) su una finestra di 1 secondo e verifica che nessuna area significativa dello schermo superi 3 lampi/secondo.
  *Dipendenze:* nessuna
  *Valore:* trasforma un MANCA in un fatto misurato, coerente con la regola di casa 'concludere solo da misure': se il banco nasce verde, si scrive «verificato»; se nasce rosso, si sa esattamente cosa correggere invece di supporlo
- **Selettore 'MIRA GUIDATA' a due pesi sull'intent-resolution già scritta** — 2 g — (9.2)
  Non tre profili Beginner/Standard/Pro con auto-switch, auto-sprint, scudo automatico tutti separati (sarebbe una riscrittura enorme e rischiosa dei tocchi appena stabilizzati dalla voce #88): un solo interruttore a due pesi che regola quanto aggressivamente 'il comando segue il destinatario' (switchControlled, §4.2 della voce #88) si applica — oggi vale per ogni passaggio con destinatario dichiarato; il peso 'essenziale' lo restringe ai soli cross e palloni alti, come il progetto #88 §4.2 già indica come possibile ripiego se il comportamento attuale risultasse fastidioso sui passaggi corti.
  *Dipendenze:* voce #88 (chiusa, riusata) — nessuna dipendenza su #87
  *Valore:* risponde alla parte vera del mandato (assistenza configurabile) restando dentro un meccanismo già scritto, misurato e coi banchi verdi, invece di aprire un sistema di assist a tre livelli mai richiesto dal committente finora

**Esclusioni già decise o da non importare alla lettera:** 

- 'Offside line preview when making runs (Beginner)' (mandato 9.3): il fuorigioco è escluso PER SCELTA in CALCETTO — la gabbia lo cancella insieme a rimesse e angoli (_analisi/DIFFERENZE-FC-MOBILE.md riga 741: 'fattibile: no-per-scelta'; riga 744: zero occorrenze di 'offside' nel codice). Non va riproposto come default nemmeno per la modalità CAMPO VERO che #87 sta aprendo: il committente non ha chiesto la regola del fuorigioco, solo rimesse e angoli. Se in futuro verrà chiesta, è un cantiere a sé, successivo e dipendente da #87.
- 'Punizione a due, rapida' (il fallo semplice) resta VOLUTAMENTE senza controllo di mira del giocatore ('nessun overlay, nessuna pausa: si riparte' — CALCETTO-il-gioco.html, commento sopra la funzione): il mandato 9.2 chiede 'aim reticle + power + curl' per i piazzati in generale, ma applicarlo anche alla punizione semplice romperebbe la scelta di casa di non spezzare il ritmo su un evento frequente. Il piazzato con controllo del pollice arriva SOLO per rimessa/angolo (voce #87 compito 3), non per ogni fallo.

**Avvisi onesti:**

- 9.5 'Team select (carousel with kit clash auto-resolve)' non ha senso per CALCETTO: non esiste una rosa di squadre fra cui scegliere prima della partita. Il giocatore ha UNA squadra propria (nome, divise, rosa in SPOGLIATOIO) e affronta avversari assegnati (CPU, torneo/stagione, o server per SFIDA); 'kit clash auto-resolve' oggi copre solo la divisa del portiere, non un'intera schermata di selezione squadra che semplicemente non esiste nel gioco.
- 9.4 'poi 5 partite di piazzamento vs bot con IA progressiva; solo allora matchmaking competitivo' presuppone un ladder con rating stile Glicko. SFIDA non è quello: è async, una partita alla volta, con un avversario assegnato dal server in base all'indole comportamentale misurata, non un punteggio di abilità. Costruire un vero sistema di piazzamento/rating sarebbe un progetto di scala enorme (server con storico partite, calcolo rating, matchmaking per fascia) fuori da qualunque cantiere in corso e non richiesto finora dal committente.
- 9.4 'narrated by the commentator' e 9.7 'subtitles for commentary' presuppongono un commentatore che CALCETTO non ha mai avuto: 'LA LAVAGNA DEL COMMENTATORE' nel codice è solo il nome della schermata di moviola (traiettoria della palla + marcatore cerchiato), non una voce che parla. Tradurre alla lettera 'sottotitoli per il commento' richiederebbe prima inventare un sistema di commento (testi, timing, localizzazione) mai preventivato in nessun documento di casa: la proposta P3 sopra traduce lo spirito reindirizzandolo sull'audio di gioco reale, non sul commentatore inesistente.
- 9.5 'daily Cup Weekend banner', 'friends online' richiedono infrastruttura social/live-ops con stato di amici online e eventi a tempo lato server. SFIDA è già l'unica parte in rete e resta deliberatamente minimale (un id anonimo, una coda, un nastro): aggiungere presenza sociale in tempo reale è fuori scala per un gioco che vanta zero server always-on lato gameplay.
- 9.6 'Stretch: portrait one-hand Street layout' è esplicitamente marcato stretch dallo stesso mandato ('solo dopo che lo schema landscape è spedito e testato'). CALCETTO gioca solo in orizzontale (mostra RUOTA IL TELEFONO in verticale, MANUALE.md riga 141-142): introdurre un secondo schema di controllo verticale parallelo sarebbe una seconda pulsantiera intera, in contrasto diretto con la lezione appena pagata dalla voce #88 ('i dischi non cambiano mestiere') — due schemi di controllo raddoppierebbero la superficie da tenere onesta.
- 9.2 'Skill (drag su un piccolo skill-stick: 8 direzioni = 8 mosse skill)' non si traduce bene: CALCETTO ha già UNA finta (lo strappo, inversione secca della levetta, MANUALE.md righe 89-92) che nasce da un gesto naturale del pollice, non da un sotto-stick con 8 mosse da imparare a memoria. Aggiungere 8 skill-move separate romperebbe la promessa 'cinque dischi, due facce ciascuno' appena stabilizzata dalla voce #88 e complicherebbe la pulsantiera invece di chiarirla.


## 5. Online e competizione (mandato §10 e §5)

Multigiocatore, classifica, integrità competitiva (mandato: stadium-roar/docs/SPEC/10-multiplayer.md, 05-progression-social.md)

**C'è già:**

- Rete asincrona end-to-end funzionante: 5 endpoint Vercel (entra, squadra, avversario, sfida, classifica), client interamente collegato, schema Postgres con RLS su tutto e zero privilegi al ruolo anonimo.
  *Prova:* rete/api/entra.js, avversario.js, sfida.js, classifica.js, squadra.js; rete/schema.sql (RLS righe finali); client: CALCETTO-il-gioco.html:41789-42033 (fetch verso /api/entra, /api/squadra, /api/avversario, /api/sfida, /api/classifica)
- Determinismo a seme misurato, base di tutto l'anti-imbroglio: stesso seme -> stessa partita, anche fra due pagine diverse.
  *Prova:* rete/LEGGIMI.md righe 7-19 cita strumenti/_q-determinismo.js, 6/6 controlli su 123 campioni
- Replay/nastro come prova, non un punteggio dichiarato: la sfida porta {seme, taglia, righe di comando}; il difensore GUARDA la partita mossa per mossa.
  *Prova:* rete/schema.sql tabella sfida (colonna replay, righe 90-118); MANUALE.md righe 230-233
- Identità anonima zero-dati-personali: il server conserva solo il digest sha-256 del segreto, mai il segreto in chiaro dopo la creazione; codice di trasferimento fra telefoni.
  *Prova:* rete/api/entra.js righe 51-63; MANUALE.md righe 235-239 e 758
- Rating già in produzione per la sfida online: Elo con K variabile per fascia di punti (40/28/20/14) e bonus di serie fino a +30%.
  *Prova:* rete/api/sfida.js righe 39-49, tabella punti in rete/schema.sql
- Anti-riprova dei semi ('impegno'): un solo seme vivo per attaccante, cancellato atomicamente all'invio dell'esito — impedisce di provare mille semi in locale e mandare solo quello vincente.
  *Prova:* rete/schema.sql tabella impegno (commento righe 120-140); rete/api/avversario.js righe 129-143; rete/api/sfida.js righe 93-101
- Classifica locale (offline, contro CPU) a 9 gradini in 3 fasce × 3, con pavimento di fascia permanente e premi a formula — il sistema di 'leghe' lato offline è già dentro.
  *Prova:* PUNTO-DEL-LAVORO.md riga 42 ('banco 18/18'); _analisi/MINIERA-FCM.md righe 26-53 (progetto ONDA-1 adottato)
- Cancello di pubblicazione #96 già a registro: il prossimo APK non parte finché il nastro delle sfide non porta la versione del motore — esattamente il bisogno di 'versionare i replay' del mandato, già riconosciuto in casa.
  *Prova:* PUNTO-DEL-LAVORO.md riga 22; MANUALE.md righe 659-661
- Ban e sospetto già in schema, controllati a ogni endpoint.
  *Prova:* rete/schema.sql tabella allenatore (colonne sospetto, bandito); usati in rete/api/sfida.js riga 58 e rete/api/avversario.js riga 100
- Rate limiting per ogni endpoint via funzione atomica nel database.
  *Prova:* rete/schema.sql funzione frena(); usata in ogni file di rete/api/*.js
- Bot mai spacciati per avversari veri: quando manca un avversario vicino di forza, il server ne costruisce uno finto ed etichetta esplicitamente 'allenamento, mezzi punti' — mai silenziosamente in classifica vera.
  *Prova:* rete/api/avversario.js righe 15-22 e 125-146; rete/api/sfida.js righe 133-139

**C'è in parte:**

- Verifica differita dei replay ('il verificatore'). — *stato:* la colonna verificata (0/1/-1) esiste nello schema e la validazione leggera (forma, lunghezza, range gol) è scritta; il lavoratore periodico che RIGIOCA davvero la partita e toglie i punti a chi bara non esiste nel repo — zero righe di codice, solo commenti che lo descrivono.
  *Prova:* rete/schema.sql riga 112 (colonna verificata) e riga 38 (commento 'lo alza il verificatore differito'); rete/api/sfida.js righe 16-23 e 103-117 (solo controlli a costo zero); grep 'verificatore' su rete/ trova solo commenti, mai un file eseguibile
- Versione del motore nel nastro (chiusura di #96). — *stato:* decisione presa e a registro come cancello bloccante, non ancora implementata: oggi il messaggio di chiudiSfida attribuisce ogni scarto solo al profilo cambiato, mai al motore cambiato.
  *Prova:* PUNTO-DEL-LAVORO.md riga 22
- Tempo reale in lockstep (peer-to-peer via relay, non server-autoritativo). — *stato:* architettura scritta per intero (trasporto, ritardo di ingresso, degrado in caso di connessione persa) ma zero codice: nessun riferimento a Realtime/WebSocket/lockstep in tutto il file di gioco né in rete/.
  *Prova:* rete/LEGGIMI.md righe 70-78 (disegno); grep 'Realtime|WebSocket|lockstep' su CALCETTO-il-gioco.html e rete/ = 0 risultati
- Sistema di rating. — *stato:* un rating funzionante c'è (Elo con K variabile), ma non è Glicko-2 come chiede il mandato — è una differenza di raffinatezza dichiarata, non un buco.
  *Prova:* rete/api/sfida.js righe 39-49

**Manca:** Classifica amici, codici invito, spettatore, invito a partita privata: grep 'amic|friend' su tutto il file di gioco trova solo la parola 'amichevole' (modalità offline), nessuna feature sociale online. · Fair play score continuo che pesa sul matchmaking: esiste solo un booleano bandito, la colonna sospetto (int) non risulta usata da nessuna query di accoppiamento. · Qualunque forma di server autoritativo Node che simuli la partita in tempo reale: la casa lo esclude per scelta architetturale dichiarata (vedi esclusioni_note). · Snapshot a 20Hz, input a 30Hz, jitter buffer adattivo, riconciliazione client, HUD di rete, gestione disconnessione con IA subentrante: nessuna esiste, perché non esiste ancora nessun trasporto in tempo reale su cui appoggiarle. · Stagioni con snapshot giornalieri e archivio/hall of fame per la classifica ONLINE (quella locale/offline invece ha già stagioni): rete/api/classifica.js oggi è un top-100 + riga propria senza concetto di stagione. · Platform attestation (Play Integrity/App Attest): assente, coerente con la scelta dichiarata 'zero permessi Android'.

**Proposte (tradotte all'idioma di casa):**

- **Il verificatore differito** — 3-5 g — (10.5)
  Uno script Node (stile strumenti/_q-determinismo.js ma lato server) che pesca a campione le righe con verificata=0, rigioca {seme, taglia, comandi} col motore e confronta gol_a/gol_d dichiarati con quelli veri; se non torna, verificata=-1, i punti si tolgono con muovi_punti(delta negato) e sospetto sale. Il grosso del costo è rendere il motore rigiocabile fuori dal canvas/DOM — verificare quanto i banchi Playwright con l'hook window.__test già lo fanno headless.
  *Dipendenze:* nessuna infrastruttura nuova (Vercel/Supabase già in piedi); dipende dal grado in cui il motore è già headless-capace per i banchi esistenti
  *Valore:* rende vera la frase già scritta in LEGGIMI.md ('la classifica si ripulisce da sola') — oggi è una promessa architetturale, non un fatto misurato; chiude il rischio 10.5 'win-trading/boosting'
- **La versione del motore nel nastro** — 1 g — (10.2, 10.5)
  Aggiungere una costante VERSIONE_MOTORE (incrementata a ogni cantiere che tocca la fisica, come già succede per i nastri locali) al replay spedito al server e al confronto in chiudiSfida, distinguendo nel messaggio 'profilo cambiato' da 'motore cambiato' invece di attribuire sempre allo stesso motivo.
  *Dipendenze:* nessuna; riusa lo stesso meccanismo già presente per invalidare i nastri locali (registro di un'altra versione, CALCETTO-il-gioco.html:12948)
  *Valore:* chiude #96, il cancello che oggi blocca la pubblicazione del prossimo APK
- **Classifica amici** — 1-2 g — (05)
  Un parametro o endpoint aggiuntivo su /api/classifica che filtra per una lista di id salvata sul telefono (stessa logica del codice di trasferimento: id scambiati/incollati a mano, zero account); riusa la funzione classifica() già scritta in schema.sql.
  *Dipendenze:* nessuna
  *Valore:* copre 'Leaderboards: friends' del mandato senza introdurre account, coerente col principio zero-dati-personali
- **Fair play score continuo** — 2 g — (05, 10.5)
  Usare davvero la colonna sospetto (già in schema, oggi inutilizzata) per allargare/restringere la banda di accoppiamento in trova_avversario, alimentata dagli esiti del verificatore (proposta 1) invece che da un semplice booleano bandito.
  *Dipendenze:* proposta 1 (serve un segnale reale di scorrettezza da cui derivare il punteggio)
  *Valore:* mandato 05 'Fair play score' e 10.5 'pool separati per abusatori'
- **Glicko-2 al posto dell'Elo a K variabile** — 2-3 g — (10.6, 05)
  Sostituire elo() in rete/api/sfida.js con Glicko-2 vero (rating, deviazione, volatilità: tre colonne in più nella tabella punti, non un nuovo sistema). La deviazione dà più peso alle prime partite di un nuovo giocatore in modo esplicito (oggi solo simulato dal K più alto sotto 1200 punti) e fa decadere la certezza di chi non gioca da mesi.
  *Dipendenze:* nessuna bloccante; tocca solo sfida.js e lo schema
  *Valore:* affinamento richiesto alla lettera dal mandato (10.6); NON è un buco grave — CALCETTO ha già un rating funzionante in produzione
- **Il trasporto lockstep, da disegno a codice** — 6+ g — (10.1, 10.2, 10.3, 10.4)
  Costruire esattamente quanto già scritto in rete/LEGGIMI.md §3: due telefoni allo stesso seme si scambiano comandi via Supabase Realtime (WebSocket), ritardo di ingresso fisso di 6 fotogrammi (100 ms); è peer-to-peer via relay, non server-autoritativo — coerente col principio di casa 'niente server che simuli il calcio'. Serve un canale Realtime per stanza, un protocollo minimo di comandi (il formato esiste già nei nastri) e la gestione del degrado a CPU quando la connessione salta (già descritta, mai scritta).
  *Dipendenze:* nessuna delle proposte 1-5 la blocca, ma 1 e 2 restano comunque necessarie perché anche una partita lockstep finisce come nastro da verificare
  *Valore:* copre quasi per intero 10.1-10.4 del mandato, ma cambia l'architettura, non solo la irrobustisce — vedi avvisi
- **Server-autoritativo Node (solo se il lockstep non basta)** — 6+ g — (10.1, 10.2)
  Solo se il p2p-lockstep si rivela inaffidabile su rete mobile reale (perdita pacchetti, NAT, roaming), far girare lo stesso motore JS anche in Node come arbitro a tick fisso — è la traduzione onesta del 'Match server' Godot del mandato, ma costa una riscrittura minima perché il motore è già deterministico, non un porting da un altro linguaggio/engine.
  *Dipendenze:* proposta 6 (va prima provato il p2p e misurato dove fallisce davvero)
  *Valore:* mandato 10.1-10.2 alla lettera; ma è un'alternativa più cara al lockstep, non un'aggiunta — la casa ha già scritto per iscritto perché non lo vuole di default

**Esclusioni già decise o da non importare alla lettera:** 

- Il mandato (10.1, 10.5) presume che il server non mandi mai il seme al client prima della fine della partita, per impedire pre-simulazione. CALCETTO ha scelto l'opposto per l'asincrono: il seme lo dà il server ma PRIMA della sfida (rete/api/avversario.js righe 12-13, 108-111); la protezione anti-riprova sta nell'IMPEGNO a seme unico e consumabile una sola volta, non nel nascondere il seme. Non riproporre 'nascondere il seme fino a fine partita': romperebbe il modello dell'impegno già collaudato.
- Platform attestation (Play Integrity/App Attest, mandato 10.5) confligge con la scelta dichiarata 'zero permessi Android' (rete/LEGGIMI.md riga 93). Non riproporla senza una decisione esplicita del committente che rinunci a quel principio.
- Niente conto Google/Apple e niente chat sono esclusioni dichiarate per scelta in rete/LEGGIMI.md righe 130-138. Se si costruisce la classifica amici (proposta), va fatta SENZA introdurre un sistema di account.

**Avvisi onesti:**

- L'intero §10 del mandato descrive un'architettura Godot+Nakama+fleet di match-server dedicati (30Hz sim, 20Hz snapshot quantizzato, jitter buffer adattivo, clock sync NTP): per un canvas 2D con determinismo a seme già misurato, questo è sovradimensionato. Conviene tradurre l'IDEA (autorità sul risultato, anti-cheat, riconnessione pulita) e non la MECCANICA (fleet Godot headless) — CALCETTO può ottenere la stessa integrità competitiva a una frazione del costo, come rete/LEGGIMI.md scrive già esplicitamente.
- Il mandato conferma, senza saperlo, tre scelte già fatte in casa — vale oro per il committente: (1) determinismo a seme come base dell'anti-cheat, al posto di un server che simula (10.5 'server authority' incontra LEGGIMI.md 'l'anti-imbroglio è gratis'); (2) verifica dei replay a campione, non su ogni partita (10.5 '5% ranked re-simulated' incontra lo schema con 'verificatore differito... a campione' — stesso principio, percentuale da tarare); (3) bot mai spacciati per avversari veri in classifica, solo in allenamento/placement (10.6 incontra l'etichetta 'allenamento, mezzi punti' già scritta in avversario.js).
- Il punto (a) della richiesta — 'live 1v1 server-autoritativo, quanto costa davvero' — oggi non è una stima di aggiunta: è la stima di costruire da zero un trasporto in tempo reale che non esiste in NESSUNA forma nel codice (solo nel documento di architettura). La domanda onesta da fare al committente prima di stimare oltre la proposta 6: vuole davvero tempo reale (lobby, presenza online, NAT/roaming su reti mobili italiane vere) o basta l'asincrono irrobustito (proposte 1-5, circa 9-13 giornate totali) che copre già la maggioranza di 10.5 e del §05?
- Il rating Glicko-2 (punto c della richiesta) non è un buco grave: CALCETTO ha già un Elo funzionante con K variabile e bonus di serie, in produzione. Passare a Glicko-2 è un affinamento, non un requisito bloccante per l'integrità competitiva — non va presentato al committente come urgenza.


## 6. Telecronaca e audio (mandato §11)

Telecronaca e audio — mandato docs/SPEC/11-audio-commentary.md, tradotto per CALCETTO (canvas 2D, un file HTML, Audio5 sintetico WebAudio, banner testuale showBanner)

**C'è già:**

- SFX per tipo di evento di campo (calcio per potenza, palo, traversa, rete, scivolata, fischio corto/lungo) generati proceduralmente via WebAudio (oscillatori/rumore filtrato, zero asset esterni)
  *Prova:* CALCETTO-il-gioco.html:9977 kick(pow), :9991 clack (sponda/palo), :10036 post(), :10050 net(), :10062 slideS(), :9959 whistle(long) — chiamate in ~35 punti (grep 'Audio5.' restituisce oltre 130 occorrenze)
- Modello di folla reattivo con livello continuo agganciato a un proxy di tensione/momento (crowdHype) e strato a pagamento 'la curva' (tamburo+coro) attivabile in campo/a riposo
  *Prova:* CALCETTO-il-gioco.html:9952 crowdLevel(v), :10002 roar(), :10090 swell(), :10120 curvaTamburo(caldo), :10143 coro(); G.crowdHype dichiarato :8398, alzato a 2.6 sul gol :11172, decaduto nel tempo :16552, letto in crowdLevel :16680; MANUALE.md:271 'LA CURVA | 660 | cori, tamburo, coreografia al gol'
- Musica solo fuori dall'azione: jingle di menu con guardia esplicita 'solo se G.scene===menu', nessuna musica durante la partita
  *Prova:* CALCETTO-il-gioco.html:10076 jingleTick() con 'if(!this.ctx || G.scene!=="menu") return', innescato da setInterval 460ms a riga 10194
- Aptica mappata per evento con interruttore di accessibilità dedicato
  *Prova:* CALCETTO-il-gioco.html:8536 function buzz(p){ if(SAVE.vib!==false && navigator.vibrate) ... }, chiamata con intensità diverse per evento: buzz([35,50,90]) sul gol (:11202), buzz(18/20/25/28/30) su parate/rubate/tiri al volo
- Un banner testuale event-driven già in produzione — l'embrione di telecronaca che il compito chiede di far evolvere: PALO!, TRAVERSA!, TIRO PERFETTO!, FALLO!, CARTELLINO GIALLO, GOLDEN GOAL, RIGORI, RUBATA PULITA! ecc., ciascuno con colore e durata propri
  *Prova:* CALCETTO-il-gioco.html:8539 function showBanner(text,col,dur), con oltre 20 siti di chiamata (righe 11714, 12112, 15768, 15834, 16389, 16703, 17785, 17835, 17849, 17913, 17948, 18263, 18686, 18730, 18749, 18764, 18846, 18956, 18967 fra le altre)
- Registro strutturato del gol già arricchito con tutti i dati che una telecronaca testuale userebbe (chi ha segnato, numero, minuto, autogol, punteggio prima/dopo)
  *Prova:* CALCETTO-il-gioco.html:11148-11149 G.golLog.push({ team, min:G.goalMin, chi:G.goalChi, num:G.goalNum, auto:G.goalAuto, idx:G.goalIdx, s0:G.score[0], s1:G.score[1] })

**C'è in parte:**

- 'Event bus' per audio/aptica/banner — *stato:* reattivo evento-per-evento ma NON un bus: ogni funzione di gioco (addGoal, gestione fallo, gestione parata...) chiama direttamente Audio5.X + showBanner + buzz nello stesso blocco, senza un emettitore centrale a cui abbonarsi. Il banner stesso è UNO slot (G.banner/G.bannerT), non una coda: un secondo evento sovrascrive il primo invece di accodarsi.
  *Prova:* CALCETTO-il-gioco.html:8539-8542 (showBanner scrive tre sole variabili globali G.banner/G.bannerCol/G.bannerT, nessun array); i ~20+ siti di chiamata elencati sopra sono chiamate dirette sparse nel motore di gioco, non un dispatch verso un elenco di abbonati
- Interruzione a priorità ('un gol interrompe tutto') — *stato:* vera per un solo caso, cablato a mano: addGoal azzera esplicitamente il banner corrente prima di far partire la sua festa. Non è un sistema di priorità generale valido per gli altri ~20 tipi di evento fra loro.
  *Prova:* CALCETTO-il-gioco.html:11163 'G.banner=""; G.bannerT=0;' dentro addGoal, con il commento accanto che spiega perché (evitare che PALO! resti sopra la scritta GOL!)
- Contesto per il commento (punteggio, minuto, momento, tratti giocatore, serie) — *stato:* i dati grezzi ci sono a metà: punteggio/minuto/autore sono già in G.golLog e G.score; G.stats tiene contatori di squadra per la partita (tiri, parate, rubate, cartellini...) ma non un modello di 'tratti giocatore' o 'serie' pronto all'uso — andrebbe derivato da golLog/stats, non esiste come stato a sé
  *Prova:* CALCETTO-il-gioco.html:10714 G.stats={ tiri, perfetti, rubate, falli, parate, gialli, espulsi, pallonetti, volee, possesso, inPorta, filtranti, cross, rovesciate } — tutti indicizzati per squadra [0,1], nessuno per singolo giocatore nel tempo

**Manca:** Motore di telecronaca testuale/vocale: zero riscontri nell'intero file per 'telecronac' o 'commentar' — prova: _analisi/DIFFERENZE-FC-MOBILE.md:3773 'CALCETTO-il-gioco.html: grep «telecronac»/«commentar» = 0', confermato a riga 3778 'CALCETTO: Zero voci' · Struttura a due voci (cronaca + colore): non esiste nemmeno come concetto; l'unica cosa nel gioco chiamata 'due voci' sono i due oscillatori sfasati del suono 'perfect' — prova: _analisi/DIFFERENZE-FC-MOBILE.md:3778-3779 · Anti-ripetizione delle frasi: il banner ripete la stessa stringa identica a ogni occorrenza dello stesso evento (es. 'TIRO PERFETTO!' appare parola per parola sia a riga 15834 sia a riga 15996, nessuna variante, nessuna memoria di cosa è già stato mostrato) · Sintesi vocale/pacchetti voce: zero riscontri per speechSynthesis — prova: _analisi/DIFFERENZE-FC-MOBILE.md:3579 'CALCETTO-il-gioco.html: speechSynthesis 0 riscontri, verificato con conteggio, non a occhio' · Localizzazione: il documento HTML dichiara lang="it" fisso e ogni stringa (banner compreso) è un letterale italiano incorporato nel codice, senza tabella stringhe/i18n — prova: _analisi/DIFFERENZE-FC-MOBILE.md:7103 'CALCETTO-il-gioco.html:2 <html lang="it">' · Voce arbitro e richiami dei giocatori in campo ('man on!', 'keeper!', 'time!'): nessuna funzione Audio5 dedicata trovata nel grep completo di Audio5.* · Respiro/affanno a fatica come SFX: 'respiro'/'fiato' compaiono solo nell'animazione visiva dei gesti (es. riga 6580, 6689), mai come suono in Audio5 · Stinger musicale dedicato al risultato finale, distinto dal boato del gol: nessuna funzione tipo 'finale'/'vittoria'/'fanfara' trovata in Audio5 — a fine partita suonano solo gli stessi beep dell'interfaccia (es. riga 39364, 40223)

**Proposte (tradotte all'idioma di casa):**

- **Bus eventi di partita (prerequisito silenzioso del mandato)** — 1 g — (Commentary engine (event-driven) + Haptics (mapped from the same event bus))
  Introdurre un piccolo emettitore (es. oggetto Eventi con emit/on) e migrare i ~20-25 siti che oggi chiamano Audio5.X + showBanner + buzz in blocco (addGoal, gestione fallo/cartellino, parata, palo/traversa, tiro perfetto, rovesciata, rubata, cambio) a passare da 'Eventi.emit("gol",{team,chi,min,auto,s0,s1})' ecc. showBanner/Audio5/buzz restano come sono, ma diventano ABBONATI al bus invece di essere chiamati a mano ovunque: comportamento visibile identico, coperto dai banchi esistenti (regressione attesa zero, verificabile rigiocando i nastri già salvati).
  *Dipendenze:* nessuna per iniziare; va coordinato con la voce #87 (rimesse/angoli) che nel suo piano già committato usa showBanner+whistle per il proprio evento — se il bus parte prima che #87 sia stabile, la migrazione dei suoi call-site va rifatta o l'evento 'rimessa'/'corner' va incluso subito
  *Valore:* senza un bus vero, ogni feature futura (telecronaca, ma anche haptics 'mapped from the same event bus' del mandato) deve duplicare la stessa dozzina di if sparsi nel motore — il bus è ciò che rende il resto del mandato costruibile senza moltiplicare i punti di manutenzione
- **Motore di telecronaca testuale a due voci, con anti-ripetizione e coda a priorità** — 2 g — (Commentary engine: event-driven, two voices, lines selected by event type, anti-repetition memory, priority interruption)
  Un frasario italiano per evento (2-4 varianti per tipo: gol, palo, parata, fallo, cartellino, tiro perfetto...) diviso in 'voce cronaca' (fatto: chi, cosa, minuto — letta da G.golLog/dati evento) e 'voce colore' (reazione: 'che parata!', 'non doveva perdonarlo'), selezionate DETERMINISTICAMENTE dal seme di partita con un indice di rotazione anti-ripetizione (mai la stessa frase due volte di fila per lo stesso evento) — coerente con lo stile di casa 'PARTITURE FISSE, zero Math.random' già usato per la curva (riga 10117). Resa: una fascia di 1-2 righe che affianca (non sostituisce) showBanner; una coda con 3-4 slot dove il gol la svuota e passa sempre per primo, gli altri eventi si accodano invece di sovrascriversi come oggi.
  *Dipendenze:* Bus eventi (proposta precedente): senza, il motore dovrebbe ripetere gli stessi ~20 hook sparsi nel motore di gioco
  *Valore:* è l'unico pezzo del bullet 'Commentary engine' che vale davvero la pena costruire ora: parte da zero (confermato dal grep 0 su telecronaca/commentar) ma il gioco ha già tutti i dati (golLog, punteggio, minuto) e la disciplina di determinismo per farlo bene al primo colpo
- **Innesto del contesto esistente (punteggio, minuto, tensione, serie) nella scelta della frase** — 1 g — (Commentary engine: lines selected by ... context (score, minute, momentum, ..., streaks))
  Una volta che il motore di telecronaca esiste, fargli leggere ciò che il gioco già calcola: G.crowdHype per scegliere il registro (più concitato se alto), differenza reti + G.timeLeft per il tono 'finale in bilico', e una scansione di G.golLog per riconoscere doppiette/triplette dallo stesso idx e cambiare la frase ('ancora lui!'). Nessun nuovo modello di stato: solo lettura di dati già prodotti dal motore.
  *Dipendenze:* Motore di telecronaca (proposta precedente)
  *Valore:* il mandato chiede 'context (score, minute, momentum, emotional state...)': CALCETTO non ha un modello emotivo separato ma ha già i tre segnali grezzi (crowdHype, punteggio, storico gol) — usarli costa una giornata invece di doverli inventare da zero
- **Silenzio deliberato della folla dopo aver subito gol** — 0.5 g — (Crowd: silence as a weapon after conceding)
  Oggi crowdLevel decade naturalmente col tempo (riga 16552) ma non c'è un abbassamento ESPLICITO per la squadra che ha appena subito, distinto dal boato della squadra che segna. Aggiungere, dentro addGoal (o l'evento equivalente sul bus), una chiamata che spinga crowdLevel verso il basso per un paio di secondi PRIMA di lasciarlo tornare al livello di gioco, così il boato del gol è seguito da un vuoto percepibile invece che da un decadimento generico.
  *Dipendenze:* nessuna (indipendente dal bus, è un tweak locale ad addGoal/Audio5.crowdLevel)
  *Valore:* riga per riga del mandato ('silence as a weapon after conceding') che oggi NON è vera in CALCETTO: il boato esiste, il silenzio contrapposto no — è l'unica bugia diretta e puntuale del bullet Crowd, facile da chiudere
- **Stinger di fine partita, distinto dal boato del gol** — 0.5 g — (Music: menu and result stingers only)
  Una nuova funzione Audio5.finale(esito) con la stessa tecnica sintetica già in uso (oscillatori/inviluppi, vedi perfect() o coro()) agganciata al punto in cui oggi parte showEndCoins/la schermata finale, per dare un suono musicale diverso a vittoria/pareggio/sconfitta invece di riusare i beep di interfaccia generici.
  *Dipendenze:* nessuna
  *Valore:* chiude alla lettera il bullet 'Music: menu and result stingers only', oggi vero solo per il menu (jingleTick) e assente per il risultato
- **Voce arbitro/richiami di campo minimi ('via!', fischio d'ammonizione distinto) e respiro a fatica** — 1 g — (Pitch SFX: whistles, referee voice, player calls, breathing when fatigued)
  Due-tre piccoli suoni sintetici aggiuntivi in Audio5 (stessa tecnica di kick/clack/post: oscillatori+inviluppi, zero asset), agganciati agli eventi già esistenti di cartellino e fatica del giocatore (il gioco già calcola l'affanno per l'animazione, riga 6580: 'il respiro di chi ha il fiato corto' — manca solo il suono).
  *Dipendenze:* nessuna, ma va dopo il bus se si vuole agganciarli in modo pulito invece che con un altro if sparso
  *Valore:* riempie due voci minori del bullet Pitch SFX (referee voice, player calls, breathing) che oggi non esistono per niente, a basso costo perché riusa dati di fatica già calcolati per l'animazione

**Esclusioni già decise o da non importare alla lettera:** 

- Nessuna esclusione nota del committente specifica per quest'area (a differenza del fuorigioco, non risulta una scelta pregressa che escluda telecronaca/audio da PUNTO-DEL-LAVORO.md o dal MANUALE): quanto segnalato in 'manca' è un vuoto per assenza di lavoro fatto finora, non per scelta dichiarata di non farlo.

**Avvisi onesti:**

- Il mandato chiede una 'TTS pipeline offline approvata da un umano' per pacchetti voce sintetizzati: non ha senso per CALCETTO com'e' oggi (un file HTML solo, zero pipeline di produzione asset). Se mai valutata, l'unica via compatibile con la casa e' la Web Speech API del browser (gratis, zero asset, ma qualita' robotica) come esperimento separato — non l'ho messa fra le proposte perche' rischia di peggiorare l'esperienza rispetto al solo testo, e non e' quello che il committente ha chiesto di istruire qui.
- Il mandato scrive 'Localised (EN/IT first)' dentro il bullet della telecronaca, ma in CALCETTO la mancanza di i18n e' un problema di TUTTO il gioco (menu, negozio, tabellino, banner...), non una sotto-feature dell'audio: html lang="it" e' fisso e ogni stringa e' un letterale sparso nel file da 2,4 MB. Tradurlo qui dentro come se fosse una riga della telecronaca sarebbe fuorviante: e' un'iniziativa a se', con stima realistica di parecchie giornate solo per estrarre un layer di stringhe dal monolite, PRIMA di poter tradurre qualsiasi cosa.
- Il mandato presuppone implicitamente che un 'event bus' esista gia' lato codice quando dice che l'aptica va 'mapped from the same event bus' della telecronaca: in CALCETTO oggi non esiste ne' un bus per l'audio ne' uno per l'aptica, sono chiamate dirette punto per punto. La proposta del bus eventi non e' quindi un extra opzionale ma il vero collo di bottiglia dietro l'intera sezione 11 del mandato — va reso esplicito, non lasciato implicito come nello spec originale.
- Il bullet 'Music' del mandato parla di musica 'original, generated or licensed royalty-free': CALCETTO non ha mai usato asset musicali esterni, solo sintesi WebAudio in tempo reale (stesso stile di kick/roar/coro). Le proposte sopra rispettano questo vincolo di casa; qualunque proposta che implicasse importare file audio andrebbe segnalata a parte perche' cambia la natura del progetto (file singolo, zero dipendenze binarie).


## 7. QA, prestazioni e metodo (mandato §12-14)

QA, prestazioni, metodo di lavoro

**C'è già:**

- Batteria di banchi automatica e in parallelo: strumenti/tutti.js esegue tutti i cancelli insieme, 4 alla volta (357s contro 960s in serie), con impronta del file prima/dopo che annulla il referto se qualcuno scrive mentre si misura, e cronometri (giocata/avvio) staccati a campo libero
  *Prova:* PUNTO-DEL-LAVORO.md §"Il metodo che va veloce"
- Determinismo a seme gia' testato su tre livelli (stessa pagina, due pagine, con le dita/nastro rigiocato) — e' esattamente il 13.1.4 del mandato (record -> replay -> hash equality)
  *Prova:* strumenti/_q-determinismo.js righe 19-24 (prove A/B/C); PUNTO-DEL-LAVORO.md "_q-determinismo 10/10" voci #85/#86/#88
- Misura del gioco (non solo dell'immagine) su N partite CPU-CPU con statistiche di merito (gol/partita, tiri, parate, legni, 0-0%, rigori%), gia' usata per confronti prima/dopo con soglie/verdetto OK-NO
  *Prova:* strumenti/_eventi.js righe 12,40,563-580 (soglie e OK/NO); PUNTO-DEL-LAVORO.md "La scoperta che vale piu' di tutte" (50 partite, 18 agosto)
- Prestazione misurata SOLO in modo appaiato (stesso banco, stesso minuto, due versioni alternate), mai in assoluto: la misura assoluta e' stata trovata bugiarda (+100% falso dove il costo vero era +11%) e bandita
  *Prova:* PUNTO-DEL-LAVORO.md voce #11 della lista strumenti ciechi; "prestazione: solo in modo appaiato (--contro HEAD)"
- Avvio misurato su un telefono reale (non un banco emulato): 1861ms contro tetto 2000ms, 7/7 avvii buoni, dispersione 14,3%, su OnePlus A6003
  *Prova:* PUNTO-DEL-LAVORO.md riga 209 ("CHIUSO il 26 agosto sul TELEFONO VERO"); strumenti/avvio-telefono.js
- Confronto due-versioni bit-esatto sui sorteggi (numero di chiamate a dado()) fra rami, non solo dentro lo stesso ramo
  *Prova:* MANUALE.md righe 536-544; strumenti/_c3-sorteggi.js, _crit10-sorteggi.js
- Il nastro/registro dei comandi (Reg, window.__test.nastro/rigioca) e' gia' il meccanismo di riproduzione bit-esatta di ogni bug: ogni crash si riproduce da un nastro, non si racconta a parole — e' esattamente la regola 13.3 del mandato
  *Prova:* CALCETTO-il-gioco.html righe 42088-42117 (window.__test.registra/nastro/rigioca); MANUALE.md riga 232-233 ("la sfida viaggia col nastro dei comandi")
- Disciplina di metodo gia' scritta e pagata: non chiamare regressione senza aver misurato il commit precedente; un cancello va tarato con provini ciechi contro giudizio umano; guardare dove campiona un cancello prima di fidarsene
  *Prova:* PUNTO-DEL-LAVORO.md "Le regole pagate" 6-10

**C'è in parte:**

- Bande statistiche gol/tiri per taglia (5/7/11) — *stato:* _eventi.js misura e confronta mediane su 12 partite PER TAGLIA fra prima/dopo un cambiamento, con soglie OK/NO — ma e' uno strumento lanciato a mano su richiesta, non un cancello permanente in tutti.js con bande salvate a riferimento per ciascuna taglia
  *Prova:* strumenti/_eventi.js righe 63-64,76,81 ("--taglia 11" a mano); PUNTO-DEL-LAVORO.md "Come si riprende" elenca _eventi.js separato da tutti.js
- Copertura a taglia 11 — *stato:* la voce #99 e' esplicitamente aperta: "la batteria e' cieca a taglia 11", con lanci --taglia 11 fatti a mano, non in batteria automatica; in parte bloccata dalla #98 (non-determinismo residuo del motore a 7/11)
  *Prova:* MANUALE.md righe 481,604,608 ("la garanzia sull'11 viene dai lanci --taglia 11 fatti a mano"); PUNTO-DEL-LAVORO.md voce #99
- Test su dispositivo fisico reale — *stato:* esiste ed e' preso sul serio (avvio-telefono.js), ma copre UN solo dispositivo (OnePlus A6003); nessuna traccia in MANUALE o PUNTO-DEL-LAVORO di un secondo telefono, di fascia diversa, o di test di durata (10 minuti di partita con log di framerate/batteria)
  *Prova:* PUNTO-DEL-LAVORO.md riga 209; nessun altro nome di dispositivo trovato in MANUALE.md o PUNTO-DEL-LAVORO.md (grep iPhone/Samsung/Xiaomi/Pixel/OnePlus = solo A6003)
- Esercizio del motore oltre l'IA scriptata — *stato:* il motore e' esercitato da molte partite IA-contro-IA a semi diversi (10+ per compito) e dalla prova C con dita reali rigiocate dal nastro, ma non esiste un generatore di input CASUALI/avversariali che martelli il motore per migliaia di tick cercando di rompere invarianti (spam di pulsanti, tocchi simultanei, sequenze assurde)
  *Prova:* strumenti/_q-determinismo.js (3-10 partite per lancio, seme fisso, non input casuali di massa); nessuna corrispondenza trovata per "fuzz"/"property" nei nomi degli 150+ file di strumenti/

**Manca:** Un soak schedulato e non presidiato (nastro notturno) che giri automaticamente su un numero alto di partite per ciascuna taglia e segnali da solo lo scarto dalle bande, invece di essere invocato a mano quando qualcuno se ne ricorda · Un fuzzer/property-test che generi input casuali (non solo semi IA) per migliaia di tick e verifichi un piccolo set di invarianti hard (nessun NaN in posizione palla/giocatori, numero di giocatori in campo = taglia dichiarata, punteggio mai negativo, durata partita entro il tetto atteso) fermandosi al primo rosso con seme+nastro salvati · Un controllo di invarianti ESEGUITO DENTRO al motore mentre gira (non solo confrontato a posteriori fra impronte salvate dai banchi esterni) · Una matrice minima di dispositivi reali oltre il singolo OnePlus A6003 (almeno un secondo telefono di fascia diversa) per sapere se il tetto di 2000ms e il giudizio di prestazione valgono in generale o sono un caso singolo · Un guardrail automatico (hook) che impedisca un push/merge se la batteria non e' stata rilanciata verde, oltre alla disciplina attuale che affida l'esecuzione dei cancelli a chi giudica

**Proposte (tradotte all'idioma di casa):**

- **Soak con bande per taglia, dentro la batteria** — 2 g — (13.1.5 (soak tests, bande statistiche per formato))
  Estendere strumenti/_eventi.js (gia' esistente e gia' capace di dare mediane per taglia) con un file di riferimento versionato che fissa una banda min-max per gol/tiri/parate/legni/0-0%/rigori% per ciascuna delle tre taglie (5/7/11), lanciato su un numero alto di partite (es. 200) per taglia; integrare come cancello opzionale in strumenti/tutti.js (flag --lento, non nella corsa rapida di tutti i giorni) cosi' lo scarto oltre banda diventa un rosso automatico invece di una fotografia una tantum come quella del 18 agosto.
  *Dipendenze:* _eventi.js gia' fa la misura statistica; serve solo strutturare le bande e l'aggancio a tutti.js. Chiude/avanza contestualmente la voce #99 se si aggiunge una corsa reale a taglia 11 (dipende in parte dalla #98, non-determinismo residuo a 7/11, gia' noto e dichiarato)
  *Valore:* oggi la scoperta piu' importante del progetto (zero gol su azione) e' stata trovata a mano, una volta; una banda permanente per taglia la rende un cancello che protegge quel guadagno per sempre, e chiude la lamentela di casa "la batteria e' cieca a taglia 11"
- **Fuzzer di comandi casuali sul motore** — 2 g — (13.1.2 (property-based tests, fuzzing del sim su migliaia di tick))
  Un nuovo strumento (es. strumenti/_q-fuzz.js) che genera sequenze di comandi casuali nel formato del Reg/nastro gia' esistente (non solo IA-vs-IA a seme fisso) e li rigioca per migliaia di tick, verificando un piccolo set di invarianti hard: nessun NaN/Infinity in posizione palla o giocatori, numero di giocatori in campo sempre uguale alla taglia dichiarata, punteggio mai negativo, durata partita entro il tetto atteso +25%. Al primo rosso salva seme+nastro per riproduzione bit-esatta con lo stesso meccanismo di window.__test.rigioca gia' in uso.
  *Dipendenze:* riusa il formato Reg/nastro e window.__test.semina/registra/rigioca gia' esistenti; la prova C di _q-determinismo (dita reali rigiocate dal nastro) e' il precedente piu' vicino da cui partire
  *Valore:* oggi il motore e' esercitato solo da IA-vs-IA e da dita vere (non ripetibili); un fuzzer aggiunge pressione avversariale che l'IA non genera mai (spam di pulsanti, tocchi simultanei, sequenze assurde) — proprio il tipo di rottura che un banco a semi fissi non trova per costruzione
- **Invariant-checker permanente, dentro il motore** — 1 g — (13.1.2 (invariants in Appendix A, verificati durante la simulazione))
  Aggiungere in window.__test (o in un modulo interno attivo sotto un flag di collaudo) un controllo richiamato ogni N tick sui pochi invarianti core del motore (stesso set del fuzzer sopra) che lancia un'eccezione con il tick esatto, invece di scoprire la rottura solo confrontando impronte salvate a fine partita nei banchi esterni.
  *Dipendenze:* nessuna di per se'; e' additivo e si aggancia bene al fuzzer (proposta precedente) come sua rete di sicurezza — senza il fuzzer resta comunque utile durante lo sviluppo manuale dei verbi (#89) e delle rimesse (#87)
  *Valore:* accorcia la distanza fra "quando l'invariante si rompe" e "quando qualcuno se ne accorge": oggi la scoperta e' sempre a posteriori (confronto di impronte), qui diventerebbe immediata e localizzata al tick
- **Un secondo telefono, fascia diversa** — mezza (lavoro di scrittura/adattamento dello script; il resto e' tempo umano col dispositivo in mano, non codice) g — (12 (device tiers Low/Mid/High))
  Ripetere avvio-telefono.js e un banco di 10 minuti di partita con log di framerate/memoria su almeno un secondo dispositivo reale, di fascia diversa dall'OnePlus A6003 (piu' vecchio/piu' lento, o al contrario un flagship recente), per sapere se il tetto dei 2000ms e il giudizio di prestazione di casa valgono in generale o sono un caso singolo.
  *Dipendenze:* hardware fisico — non e' un compito risolvibile solo scrivendo codice; va annotato come azione del committente se non c'e' un secondo telefono disponibile
  *Valore:* oggi ogni giudizio di prestazione ("1861ms su tetto 2000") vale per UN campione; un secondo dispositivo o conferma la generalita' della misura o rivela che era una fortuna di quel telefono specifico
- **Guardia leggera pre-push** — mezza g — (14/13.2 (Definition of Done, CI green come prerequisito))
  Un git hook locale (pre-push, script node/bash puro, niente npm/husky) che lancia node strumenti/tutti.js --tutto --insieme 4 e blocca il push se la batteria e' rossa, lasciando intatta la regola di casa che il giudizio finale spetta a chi giudica, non a chi scrive.
  *Dipendenze:* nessuna
  *Valore:* rete di sicurezza contro l'errore umano di dimenticarsi di lanciare la batteria prima di un push, senza toccare la separazione fra chi scrive e chi giudica gia' scritta nelle regole pagate

**Esclusioni già decise o da non importare alla lettera:** 

- Il mandato (13.1.6, netcode chaos tests con tc netem: loss/jitter/reorder/blackout/reconnection) presuppone PvP in tempo reale con client prediction e interpolazione. CALCETTO esclude questo PER SCELTA: 'Partita in tempo reale contro un altro essere umano a distanza' e 'Canale in tempo reale' sono segnati 'fattibile: no-per-scelta' in _analisi/DIFFERENZE-FC-MOBILE.md (righe 61,103,4943,6605), e senza-rete.js verifica 6/6 che il gioco non apra nessuna connessione online. Le sfide sono asincrone e si rigiocano da {seme, taglia, gol, nastro} (window.__test.nastro/rigioca). Non riproporlo come default: se mai un giorno arrivasse un server autoritativo Node, il problema da testare sarebbe 'il nastro arriva integro o no', non jitter/desync in tempo reale.

**Avvisi onesti:**

- La sezione 12 del mandato (draw calls, triangoli in frame, texture memory, shader cache Godot, Play Asset Delivery/On-Demand Resources, tetto AAB 200MB) non ha senso per CALCETTO: e' un file HTML singolo (~2,4MB) su canvas 2D, non un motore 3D con pipeline di rendering a draw-call. Il tetto di sistema piu' sensato e gia' esistente (avvio-telefono.js, prestazione.js appaiata) e' piu' onesto del concetto astratto di 'draw calls' per un gioco che non ne ha.
- La sezione 14 (20 subagent Claude Code con ruoli tipo animation/tech-art/asset-pipeline/netcode/backend, git worktree paralleli, TASKLOG.jsonl e loop di auto-tuning del routing dei modelli) descrive un'organizzazione a team scalata per un progetto Godot con piu' persone/agenti. Per CALCETTO il metodo di casa (diagnosi in parallelo di N lettori in sola lettura, scrittura in fila; sonnet per il meccanico, il modello grosso solo per architettura e revisione finale — nota 'niente-fable' in memoria) va nella direzione opposta alla proliferazione di ruoli e all'infrastruttura di auto-tuning: non proporre di costruire quell'impalcatura, e' sovradimensionata per un solo file curato da un metodo gia' rodato.
- Il mandato (13.1.8) chiede test su 'ogni tier' con log di batteria/termico. CALCETTO non ha un tetto di consumo batteria dichiarato da nessuna parte (ne' in MANUALE ne' in PUNTO-DEL-LAVORO): prima di proporre un banco che lo misuri, andrebbe deciso se vale la pena per un gioco 2D leggero (il rischio termico di un motore 3D non si applica allo stesso modo).


## 8. Modi, formati e progressione (mandato §3-5)

Modi di gioco, formati, progressione

**C'è già:**

- Tre taglie 5/7/11 con formati che scalano automaticamente su una formula unica (durata, corpo, attrito, distanze) invece di essere fissi
  *Prova:* CALCETTO-il-gioco.html:4017-4034 funzione durataPartita() ("Le altre due taglie la scalano col campo, come TIRO_ATTR scala l'attrito e KPASSO le distanze"); MANUALE.md riga 325 'DURATA PARTITA 90″/120″/180″... a 7 e a 11 il campo è più grande e la durata scala'
- TORNEO: 8 squadre a eliminazione diretta (quarti/semifinale/finale), difficoltà e premio crescenti, albo d'oro
  *Prova:* MANUALE.md righe 196-205 (§9 TORNEO)
- STAGIONE: campionato a 8 squadre andata/ritorno, 14 giornate, classifica vera (G V N P GF GS DR Pt), titolo e podio
  *Prova:* MANUALE.md righe 207-216 (§10 STAGIONE)
- DIVISIONI DEL QUARTIERE: 9 gradini in 3 fasce, premi a formula, pavimento di fascia — già in campo
  *Prova:* MANUALE.md riga 739-742 (banco 18/18); dettaglio formula in _analisi/MINIERA-FCM.md §1
- ABBANDONO contato come sconfitta a tavolino 0-3 in torneo/stagione
  *Prova:* MANUALE.md riga 738 (banco 14/14)
- RECORD personali con data, seconda mensola trofei (15→24)
  *Prova:* MANUALE.md riga 742-743 (banco 12/12)
- SFIDA: modalità asincrona in rete, partite rigiocabili al bit da {seme, taglia, gol, nastro}, CLASSIFICA globale top 100 + riga propria, identità anonima e trasferibile con codice
  *Prova:* MANUALE.md §11, righe 218-241
- Rosa di 5 uomini con 4 attributi (VELOCITÀ, TIRO, TECNICA, CONTRASTO; portiere RIFLESSI/PRESA) che crescono +1 a partita in base a cosa è successo in campo, nessun mercato
  *Prova:* MANUALE.md §12 righe 249-253; CALCETTO-il-gioco.html:9510-9515 (array ATTRIBUTI)
- Identità estetica (divise, campetti) dichiaratamente separata dalla forza di gioco
  *Prova:* MANUALE.md riga 258 'Il campo è estetica: non cambia la fisica'; §13 'Nessun oggetto tocca la fisica o le abilità: lo verifica un banco di prova dedicato'
- Avversarie CPU con un vero parametro di forza scalare e mentalità propria per club (non tutte simmetriche), che pilotano davvero la difficoltà
  *Prova:* CALCETTO-il-gioco.html:9031-9054 (20 club con forza/ment/stile); :10876 G.oppForza; :10526 (52+forza*2.2)

**C'è in parte:**

- "Formati come dati" (data/formats/*.json del mandato) — *stato:* la parametrizzazione per taglia esiste e funziona, ma è sparsa in più formule/costanti indipendenti (durataPartita, P_R/B_R, KPASSO, TIRO_ATTR) invece che in un'unica tabella dichiarativa che ogni modalità legga
  *Prova:* CALCETTO-il-gioco.html:4012-4045; MANUALE.md riga 406 'la taglia che vale anche per torneo e stagione'
- Archetipi di squadra simmetrici (ADR-002 del mandato) — *stato:* ogni club CPU ha forza+mentalità (0/1/2)+testo di stile, ma lo stile è SOLO decorativo — appare una volta in una sottoscritta UI, non guida l'IA — e sono 20 club autorati singolarmente, non 4 template simmetrici a potere uguale
  *Prova:* CALCETTO-il-gioco.html:9031-9054 (definizioni club); :40078 (unico uso di o.stile, in UI)
- Cambio di atteggiamento tattico a partita in corso (radial quick-menu del mandato) — *stato:* esiste un ciclo a 3 stati (Difesa/Equilibrio/Attacco) ma solo dentro la pausa VERA che ferma il gioco, non un menu istantaneo senza fermare nulla
  *Prova:* MANUALE.md righe 135-136 (§5 La pausa: 'MENTALITÀ cicla Difesa/Equilibrio/Attacco a partita in corso')
- ASSALTO (equivalente di un modo a sfide brevi tipo Cup Weekend) — *stato:* progettato nel dettaglio (mazzo di pose, orologio 90s fisso, tappe premio, spareggio) ma zero righe scritte nel motore
  *Prova:* _analisi/MINIERA-FCM.md §2; MANUALE.md riga 745-746 'ASSALTO a onda 2 col formato già risolto dalla miniera'
- Taccuino del campetto (obiettivi giornalieri/settimanali, meta-progressione) — *stato:* progettato (3 obiettivi del giorno + 2 della settimana, pagamento immediato) ma non costruito
  *Prova:* _analisi/MINIERA-FCM.md §3

**Manca:** Modalità FRIENDS con codice invito diretto e rivincita/spettatore: SFIDA oggi pesca un avversario dal server, non permette di sfidare un id scelto (MANUALE §11 non prevede invito) · Rating nascosto (tipo Glicko-2, con deviazione/volatilità) separato dai punti visibili, usato per l'abbinamento: nessuna occorrenza di rating/elo/glicko/matchmaking nel motore (grep a vuoto su CALCETTO-il-gioco.html) · Modalità PRACTICE/allenamento con esercizi liberi (punizioni, rigori, dribbling) fuori da una partita che conta: nessuna occorrenza di allenamento/training/drill come modalità nel motore · Tratti psicologici per giocatore (aggressività, temperamento, leadership, resilienza, ecc.): la rosa ha solo i 4 attributi tecnici, nessun tratto caratteriale · Fair play score che isola i quitter persistenti nella coda di matchmaking: l'ABBANDONO è solo penalità di torneo/stagione (0-3 a tavolino), non tocca la coda di SFIDA · Classifiche segmentate per paese/club/amici: la CLASSIFICA di SFIDA è un'unica top 100 globale più la riga propria

**Proposte (tradotte all'idioma di casa):**

- **Tabella FORMATI unica per taglia×sponde** — 1-2 g — (03-modes-formats.md ("Match formats are data"))
  Raccogliere in un solo oggetto dati (non un file JSON esterno: CALCETTO è un unico HTML, quindi una costante JS in testa al file) i parametri già esistenti ma sparsi per taglia (durata base, corpo P_R/B_R, KPASSO, TIRO_ATTR) e — in vista di #87 — anche la dimensione sponde (gabbia/campo). TORNEO, STAGIONE, SFIDA e il futuro ASSALTO leggono da lì invece di if/else duplicati.
  *Dipendenze:* conviene farla prima di ASSALTO (onda 2) e in coordinamento col cantiere #87 (voce SPONDE), altrimenti la variante campo-vero apre un altro ramo scucito
  *Valore:* riduce il rischio di regressione quando arriva una quarta variabile di formato; rende il prossimo formato un rigo di tabella verificabile a banco, non una caccia a tutte le funzioni che leggono la taglia
- **SFIDA fra amici (codice diretto)** — 2-3 g — (05-progression-social.md (Friends))
  Aggiungere al server Node di rete/ un secondo verbo oltre a CERCA AVVERSARIO casuale: SFIDA UN AMICO, che accetta l'id pubblico di un altro giocatore (letto a voce come già succede per CAMBIO TELEFONO) e crea la stessa partita asincrona {seme, taglia, gol, nastro}, ma mirata invece che pescata. Stesso motore, stessa moviola GUARDA.
  *Dipendenze:* il server Node e il determinismo a seme esistono già; serve solo un endpoint in più e una schermata di inserimento codice
  *Valore:* il mandato conferma che gli amici contano (friend codes, invito, classifica amici); CALCETTO ha già la spina dorsale tecnica ma oggi si può solo essere pescati, mai sfidare qualcuno di preciso
- **ALLENAMENTO: tutorial rigiocabile + campo libero per punizioni/rigori** — 2 g — (03-modes-formats.md (Practice, Tutorial))
  Una voce di menu che riapre il tutorial (oggi bloccato: si rigioca solo azzerando tutto) e aggiunge una modalità senza classifica né monete per esercitarsi sul duello dal dischetto e sulle punizioni con un portiere CPU fisso, riusando avviaRigori() e le clip già esistenti — zero fisica nuova.
  *Dipendenze:* nessuna bloccante; conviene farla insieme al problema già a registro "il tutorial non è rigiocabile" per non toccare due volte la stessa schermata
  *Valore:* chiude un buco reale del mandato (Practice/Tutorial) risolvendo insieme un difetto già scritto a verbale
- **Abbinamento SFIDA per vicinanza di punti** — 1-2 g — (05-progression-social.md (Hidden rating / matchmaking))
  Non un vero Glicko-2 a due strati (sproporzionato per un gioco offline-first senza server pesante), ma un filtro semplice lato server Node: CERCA AVVERSARIO preferisce, quando possibile, una squadra entro una finestra di punti vicina alla propria, allargando la finestra se la coda è vuota — stesso principio dell'"hidden rating ± expanding window" del mandato, senza un secondo numero nascosto da spiegare al giocatore.
  *Dipendenze:* server Node esistente; nessuna modifica al motore di partita
  *Valore:* oggi una SFIDA può appaiare un principiante con una squadra molto più forte senza alcuna correzione; il mandato conferma che il problema è reale, la risposta minima lo attenua senza il costo di un sistema di rating completo

**Esclusioni già decise o da non importare alla lettera:** 

- Reset di stagione periodico con decadimento trofei per la scala ranked (mandato 05: "season reset every 4 weeks with partial trophy decay"): il committente ha già ESCLUSO ogni azzeramento per le DIVISIONI DEL QUARTIERE — '_analisi/MINIERA-FCM.md' §1: 'Niente stagione/azzeramento, mai... Cade ogni futura onda «stagione della scala»'. Il mandato conferma che è un pattern comune nel genere, ma non va riproposto come default per CALCETTO.
- Fuorigioco (adiacente a quest'area perché il mandato 04 tratta regole e formati insieme): escluso per scelta di regolamento (futsal in gabbia), non per lacuna — '_analisi/DIFFERENZE-FC-MOBILE.md' righe 651, 744, 767. Non tocca direttamente 03/04/05 ma è la stessa famiglia di scelte che il mandato darebbe per scontate.

**Avvisi onesti:**

- Il mandato disegna un ranked dove entrambi scelgono da un pool neutro di club a potere identico (ADR-002) — non ha senso alla lettera per CALCETTO: qui la squadra è quella che si fa crescere nel tempo (5 uomini, +1 attributo a partita, 'sola lettura: niente mercato'), non una scelta pre-partita da un pool neutro. Un ranked 'a parità di potenza' richiederebbe congelare temporaneamente gli attributi del giocatore per la sola sfida (rompe 'quello che vedi è quello che hai') oppure abbandonare la crescita: nessuna delle due è compatibile col patto del negozio.
- Il mandato vuole una simulazione che 'non si ferma mai per i menu' (radial quick-menu in tempo reale) — non ha senso per CALCETTO: la pausa qui è dichiaratamente VERA e ferma davvero il gioco per scelta esplicita ('mai uscire per sbaglio', MANUALE riga 347), coerente con un gioco locale 1-2 giocatori sullo stesso device. Avrebbe senso solo per una modalità sincrona in rete, che CALCETTO non ha e non vuole avere (SFIDA è asincrona per scelta).
- Il 'Cup Weekend' del mandato è un evento a calendario ricorrente sopra i formati esistenti: TORNEO copre già la stessa forma strutturale (bracket a eliminazione) offline, senza bisogno di un calendario/server per schedularlo — meglio arricchire TORNEO che aprire un secondo sistema con la stessa forma.
- CONFERME del mandato a scelte già fatte in casa (vale oro): (a) 'Team identity is expression, not power' (04) è esattamente MANUALE riga 258 'il campo è estetica: non cambia la fisica' e il patto del negozio ('nessun oggetto tocca la fisica o le abilità'); (b) i formati come funzione della taglia — CALCETTO scala già durata e fisica per 5/7/11, il mandato formalizza lo stesso principio come dato; (c) la struttura bracket/campionato di TORNEO e STAGIONE è la stessa forma di 'Ranked Pro/Cup Weekend' del mandato, solo altro vocabolario — nessuna sorpresa strutturale.

---

## IL PROGRAMMA PROPOSTO (ordine di resa, da approvare col committente)

### Onda A — incassare subito (≈ 6-8 giornate)
1. **Finire il cantiere #87** (rimesse, angoli, rinvii — 5 compiti, piano già
   committato). È la §6.6 del mandato già avviata: si riprende dal compito 1.
2. **Regole vere a leva corta** (§6.7/§6.5): il rigore legge l'area vera
   invece della fascia `zonaCalda` (½ g — la geometria c'è già dal ramo #86);
   il portiere non prende più il retropassaggio con le mani (1 g —
   `b.lastTouch` c'è già); il vantaggio: non ogni fallo ferma il gioco (2 g).
3. **La versione del motore nel nastro** (1 g, §10.5): chiude la voce #96 e
   sblocca il prossimo APK.
4. **Spiccioli UX a rischio zero** (§9): RIVEDI IL TUTORIAL (½), anello del
   fiato attorno al comandato (1), aria-label sui menu (1), cursore della
   vibrazione (½).

### Onda B — il pilastro nuovo (≈ 12 giornate)
5. **P0 — il registro dei fatti** (1 g): l'UNICO prerequisito condiviso di
   MIND, telecronaca, aptica e striscia §7.8 — i due segnaposto «FATTO DA
   EMETTERE» esistono già nel codice, i fatti sono rami già presi, zero
   `dado()`. (Il «bus eventi» proposto dall'area telecronaca È questo:
   una cosa sola, non due.)
6. **MIND v1** (§7, ≈ 6 g): due umori e una spinta (2 g, stati deterministici
   dai fatti, mezza vita 20 s tarata sui 90-180 s di casa); il canale di
   gioco al sito unico `manopole(t, p)` con tre voci relative e tetti
   (1 g); i due canali d'occhio che già leggono — `mesto` dai fatti, folla
   e banner (1 g); il banco `_q-umore.js` NATO ROSSO con le prove
   SPECCHIO / TETTI / TESTIMONE / L'INPUT-È-SACRO / GIOCO-BUGIARDO (2 g).
7. **Telecronaca testuale sopra il registro** (§11, 3 g): motore a due voci
   con anti-ripetizione e priorità (2 g) + innesto del contesto —
   punteggio, minuto, spinta (1 g).
8. **Espressione** (2 g): la posa del fiato corto (1-2 g) e il silenzio
   della folla dopo il gol subito (½ g) — la riga del mandato oggi più
   platealmente falsa in casa.

### Onda C — qualità permanente (≈ 7 giornate)
9. **Il banco «battito» delle pose** (§8.8): tabella dei fotogrammi di
   contatto (½ g) + banco di discontinuità/contatto generalizzato dalla voce
   #85 (2 g). Serve direttamente la voce da 1,5 decimi («le pose che dicono
   il verbo») e fa da rete al futuro lavoro sul tuffo.
10. **Innesti QA dal mandato** (§13): soak con bande statistiche per taglia
    dentro la batteria (2 g), fuzzer di comandi casuali sul motore (2 g),
    invariant-checker dentro la partita (1 g).

### Onda D — competizione (≈ 8-12 giornate, dopo A-C)
11. **Il verificatore differito delle sfide** (3-5 g, §10.5): «la classifica
    si ripulisce da sola» diventa un fatto misurato, non una promessa.
12. **Amici** (§5): classifica amici (1-2 g), SFIDA con codice diretto
    (2-3 g), abbinamento per vicinanza di punti (1-2 g).
13. **Glicko-2** (2-3 g): affinamento del rating, non un'urgenza — l'Elo di
    casa funziona.

### Fuori dal programma, salvo mandato esplicito del committente
Il live 1v1 (lockstep 6+ g, o server autoritativo 6+ g: cambia
l'architettura, va deciso a parte); due tempi + sostituzioni vere (3-5 g +
3-5 g: da ripesare — su partite da 90-180 secondi reali il rapporto
costo/beneficio è dubbio, avviso del mappatore); infortuni completi, arbitro
come corpo in campo, cerimoniale pre-partita, VAR scenografico; il fuorigioco
(escluso per scelta storica della gabbia — il mandato lo prevede nel profilo
«Pro», resta un'opzione da possedere solo col committente); l'i18n completa
(problema di tutto il gioco, non della telecronaca).

### Le tre domande al committente
1. Approvi l'ordine A → B → C → D (con #87 chiuso per primo)?
2. Il MIND v1 va anticipato sopra le regole a leva corta, o l'onda A resta
   prima?
3. Il live 1v1 e i due-tempi restano fuori finché A-D non sono incassate?

---

## Le decisioni del committente (17 settembre, notte)

1. Programma **APPROVATO** nell'ordine A → B → C → D, col cantiere #87
   chiuso per primo.
2. Il **live 1v1 entra in programma** come **onda E**, in coda alla D:
   progetto d'architettura dedicato (lockstep prima; il server autoritativo
   solo se la misura dice che il lockstep non basta), da aprire col suo
   censimento e il suo spec come ogni cantiere.
3. Restano fuori salvo mandato futuro: due tempi + sostituzioni vere,
   infortuni completi, arbitro come corpo in campo, fuorigioco, i18n
   completa.

## Rettifica del controllore (18 settembre)

La revisione del compito 5 di #87 ha trovato un buco di questa mappa: la
voce **#89** (meccaniche dei verbi — filtrante, cross e rovesciata sul
modello del paragone), cantiere della decomposizione del committente del
1° settembre, non compariva né nelle onde né in «fuori dal programma». Non
è assorbita: il mandato la sfiora (§6.5, il verbario delle azioni) ma
nessuna proposta delle onde A-E la copre. **#89 resta un cantiere a sé**,
da collocare dopo l'onda A (è contenuto di gioco della decomposizione
originaria, come lo era #87) o quando il committente lo chiama; il suo
progetto dovrà scavare `MINIERA-FCM.md` (scavi 4-5: comandi e gioco aereo)
come da direttiva di casa.
