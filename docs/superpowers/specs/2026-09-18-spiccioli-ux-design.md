# Spiccioli di UX e accessibilità — progetto (chiude l'onda A, voce #112)

18 settembre 2026. Ultimo micro-cantiere dell'onda A del programma approvato
(`_analisi/MAPPA-MANDATO.md`, «Le decisioni del committente»): sei cure di UX
e accessibilità già disegnate nella mappa (aree 4 e 6), a rischio quasi zero
perché nessuna tocca la simulazione. Il design è già approvato: questo
documento lo fissa coi numeri della ricognizione del 18 settembre (ancoraggi
verificati sull'HEAD `e358cdb`, da riverificare col grep).

## Il vincolo che governa tutto il cantiere
Nessuna di queste sei cure tocca `dado()`, una decisione di gioco o uno stato
che la CPU legge. Quindi il **due-versioni resta 0/60 a TUTTE le taglie a ogni
compito** (a differenza di #87/#107, dove le regole cambiavano le decisioni):
un solo sorteggio divergente è un difetto. `_q-determinismo` 13/13 a ogni
compito. È la garanzia principale: le cure sono contorno, e il contorno non
sposta il gioco.

## Le sei cure

### 1. Le etichette parlano allo screen reader (mandato §9.7)
I cinque interruttori `.voce.sw` di IMPOSTAZIONI (btnSetAudio/Vib/Moto/Dalt/
Moviola, HTML :3631-3663) portano lo stato ON/OFF solo nel testo e nel colore:
zero `aria-label`, zero `aria-pressed` (grep: 0 occorrenze nel file). Cura:
`aria-pressed` sincronizzato con lo stato in `refreshImpostUI` (:41623-41652,
accanto a ogni `classList.toggle('on', ...)`), sul modello del precedente già
in casa `eroeEnd.setAttribute('aria-label', ...)` (:11412). Le voci del menu
principale hanno già il testo come nome accessibile (ok); si aggiunge
`aria-label` solo dove il `<small>` porta informazione che un lettore
perderebbe. **Prerequisito trascinato qui**: il rettangolo del banner
(disegnato a ~:39667, dove finiscono PALO/GOL/FALLO e — dal compito 4 — i
sottotitoli) NON è dichiarato in `zoneInterfaccia()` (:43370-43454): buco
preesistente che `istantanea.js` conta come ombra sul manto. Si dichiara ora,
prima che i sottotitoli lo rendano frequente.

### 2. La vibrazione ha tre intensità (mandato §9.3/§9.7)
`SAVE.vib` è oggi booleano (default true, :9736); `buzz(p)` (:8616) è l'unico
emettitore (~15 chiamate con ms o array di ms). Cura: `SAVE.vibInt` (0/1/2 =
leggera/normale/forte, default 1), una riga `.diff-row` di tre bottoni in
IMPOSTAZIONI copiata 1:1 dal pattern difficoltà (markup :3656-3660, wiring
:40202-40214), e `buzz()` scala la durata per un fattore (0,5 / 1 / 1,6) prima
di `navigator.vibrate` — così tutti i ~15 punti ereditano l'intensità senza
toccarli. L'interruttore ON/OFF resta (vibInt agisce solo quando la
vibrazione è accesa).

### 3. RIVEDI IL TUTORIAL (mandato §9.4)
Gap già a registro (MANUALE:1426). Il tutorial vero è l'oggetto `Tut`
(:40435+), distinto da COME SI GIOCA (scene howto). Parte solo a
`!SAVE.tutorialDone && G.mode===1 && !G.cpu[0] && !G.sfida` (:11120). Cura: una
voce nel pannello ingranaggio (id=extra, accanto a btnHow :3117) il cui
handler azzera **entrambi** `SAVE.tutorialDone=false` E `SAVE.tutorialVisto=0`
(azzerare solo il primo lo richiuderebbe subito, :40460-40461) + `persistSave`
+ toast. Il sottotitolo è **onesto**: «lo rivedi alla prossima amichevole a un
giocatore» (non promette un tutorial immediato: `Tut.start` vive solo dentro
una partita che soddisfa la guardia). NON si tocca la macchina `Tut`, NON si
invoca `Tut.start` da fuori `kickoff` (romperebbe le sfide deterministiche).

### 4. I sottotitoli degli eventi sonori (mandato §11/§9.7)
Il parlato vero di CALCETTO è l'audio di gioco. Cura: `SAVE.sott` (default 1),
un interruttore `.voce.sw` in IMPOSTAZIONI (sul modello di SAVE.dalt :41753),
e — dietro il flag — un `showBanner` breve sugli eventi sonori chiave. Due
lavori veri, non solo un flag: (a) molti `Audio5.whistle` NON hanno un
`showBanner` adiacente (fischio d'inizio/ripresa :16936, vantaggio :17081):
vanno aggiunte le chiamate mancanti perché il flag abbia cosa mostrare; (b) il
banner è **uno slot, non una coda**: due eventi ravvicinati si sovrascrivono —
per la v1 è accettabile (un evento sonoro urgente vince, come già oggi), si
dichiara. Eventi coperti: FISCHIO (inizio/fine/ripresa), GOL, PALO/TRAVERSA,
FALLO/CARTELLINO (già hanno banner: il flag li lascia passare comunque).

### 5. L'anello del fiato attorno al comandato (mandato §9.3)
`anelloComandato(p)` (:34234) disegna l'anello ambra del comandato;
`anelloContenimento` (:34266) è il **precedente diretto**: archi ciano DENTRO
l'anello ambra, mai sopra, stessa scala e fase. `p.fiato` (0..100) esiste
(:12343, consumo/recupero :18031-18045). Cura: un arco parziale sulla stessa
ellisse, DENTRO `anelloComandato`, proporzionale a `p.fiato/100` (pieno a 100,
sparisce a 0), in una **quarta tinta distinguibile** (non ambra=controllo, non
ciano=contenimento; es. verde-lime a bassa alfa). Vincoli: mai grigio/nero
(`istantanea.js` lo conta come ombra); rispettare `bucoPalla()` restando dentro
la stessa chiamata di `anelloComandato`; non sporgere oltre il raggio da cui
`collaudo.js` campiona l'erba. Disegno DENTRO `anelloComandato` eredita
l'esenzione già in essere (nessuna nuova voce in `zoneInterfaccia`). Default:
mostrato solo per il comandato (non un HUD globale — la lezione «HUD che non
mangi il protagonista» resta rispettata).

### 6. Il banco fotosensibilità (mandato §9.7)
`strumenti/_q-fotosensibile.js` sul calco di `_q-volo.js` (server locale +
Playwright headless + `semina` + `simulate` a passo fisso). Misura la frequenza
dei picchi di luminanza **a schermo intero**, verde se nessun lampo supera
3 Hz. **Tre sorgenti**, non una (il «falso troppo gentile» del mandato che
cita solo la folla): CROWD_FLASH (telefoni della tribuna, :29636), DUEL_FLASH
(tribuna del dischetto, :37204), e — il caso che conta davvero — il **lampo +
i nove raggi a schermo intero del gol** (:39515-39548, l'unico che copre tutto
lo schermo). La sonda prova più gol ravvicinati (serie di rigori) per
verificare che due lampi schermo-intero non cadano a < 1/3 s. Prova su
`SAVE.moto` sia acceso (lampo del gol attivo) sia spento (folla resta accesa).
**Deve saper condannare**: un caso `--controllo` con un lampo iniettato a 4 Hz
esce ROSSO (il falso gentile del §19 delle regole di casa). Seme fisso. Poi in
batteria (`tutti.js`, conta:true), col verbale che chiude l'onda A.

## Fuori perimetro (dichiarato)
La MIRA GUIDATA a due pesi (mandato §9.2, 2 g): tocca l'intent-resolution del
gameplay, è quasi una feature — resta seguito nominato (#113). I sottotitoli
NON diventano un commentatore (quello è l'onda B, telecronaca). L'i18n completa
resta fuori (problema di tutto il gioco). Nessun cambio a `SAVE` che rompa i
salvataggi esistenti: i campi nuovi (`vibInt`, `sott`) nascono con default e
sanificazione additiva in `loadSave`, come `sponde` di #87.

## Le leggi di casa che governano il cantiere
- Ogni cura che tocca il gioco passa da un attrezzo a àncore (--dentro prima di
  applicare); ogni banco nuovo o prova nuova nasce ROSSA sul gioco di oggi.
- `_q-determinismo` 13/13 e **due-versioni 0/60** a ogni compito (il contorno
  non sposta i sorteggi: un difetto qui è un errore, non una divergenza da
  dichiarare).
- Commenti senza accentate; un commit per compito; verbale finale in MANUALE
  (voce #112) e PUNTO, con l'onda A dichiarata CHIUSA.
- Accessibilità misurata, non attestata: un banco che clicca e vede una stringa
  «attesta»; uno che verifica `aria-pressed` sincronizzato, il testo che
  compare entro N ms dall'evento, l'arco che corrisponde a `p.fiato` vero,
  «misura».
