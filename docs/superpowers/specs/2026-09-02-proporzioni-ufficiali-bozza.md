# PROPORZIONI UFFICIALI — bozza per la voce #86

**2 settembre 2026.** Voce di lavoro **#86**. Questa è una BOZZA da sottoporre
al committente: non è un piano da eseguire, è una decisione da preparare.
Nessuna riga di `CALCETTO-il-gioco.html` né di alcuno strumento è stata
toccata scrivendo questo documento.

**Il reclamo, con le sue parole:** «le proporzioni tra giocatori, campo da
calcio, linee del campo di gioco e dimensioni porte non sono corrette, ci
sono le dimensioni ufficiali per un campo a 11, un campo a 7 e un campo a 5
giocatori».

**Base di misura:** `_analisi/MISURE-UFFICIALI.md` (354 righe) — PARTE A ha
le misure ufficiali con fonte, PARTE B quello che il gioco fa oggi, PARTE C
lo scarto per le tre taglie. Qui non rifaccio quel lavoro: lo uso. Ogni
affermazione sul CODICE in questa bozza è stata riverificata da me oggi con
`Grep` mirato — i numeri di riga di quello studio erano già invecchiati di
30-40 righe rispetto al sorgente attuale (il file è marcato modificato in
`git status`); i numeri qui sotto sono quelli di adesso.

---

## 0. Il fatto che governa tutto

Solo il rettangolo del campo (`FW`/`FH`) e la luce della porta (`GOAL_H`)
crescono con la taglia. Il codice lo dichiara in un commento a
`CALCETTO-il-gioco.html:3824-3837`, verificato riga per riga:

> «La 5 e' il campo di sempre, al bit; 7 e 11 crescono il MONDO, non le
> figure — lo zoom e' in pixel per unita' (vedi S2_\*), quindi i corpi
> restano grossi uguali sullo schermo e un campo piu' grande significa solo
> piu' campo fuori quadro. […] GOAL_D, POST_R, P_R, B_R, KICK_R, P_SPEED non
> scalano: corpi e piedi sono gli stessi, cambia il mondo.»

Confermato dai valori letti a `:3842-3856` (tabella `TAGLIE`) e dalle
costanti fisse: `P_R=13` (`:3975`), `B_R=8` (`:4007`), `POST_R=5.5`
(`:3925`), `GOAL_D=34` (`:3923`), `KICK_R=26` (`:4141`), `P_SPEED=168`
(`:4096`), `SEP_R=54` (`:19049`). Sulla porta, lo stesso commento è
esplicito: «se crescesse con lui il portiere sparirebbe» (`:3830-3831`).

Questo fatto separa in due la decisione: quello che è solo vernice del campo
(PARTE 1, si corregge senza costi) e quello che tocca corpi, porta e forma
(PARTE 2, tre decisioni vere per il committente).

---

## PARTE 1 — vernice pura o conseguenza sul gioco

Cercato nel sorgente ogni punto in cui le costanti di disegno del campo sono
LETTE da una regola, non solo dal pennello.

| elemento | costante / riga di disegno | letto da una regola di gioco? | conseguenza se cambiato |
|---|---|---|---|
| Cerchio di centrocampo | raggio 62, `:27564` | **NO** | `resetKickoff()` (`:10563-10605`) piazza i giocatori solo dalle frazioni `fx/fy` del modulo; il raggio del cerchio non compare. **Vernice pura.** |
| Archi d'angolo | raggio 14, `:27568` | **NO** | Nessuna meccanica di calcio d'angolo esiste: il pallone rimbalza sulle sponde (clamp su `FW/FH`), «nessuna rimessa, a nessuna taglia» (`:3834`). **Vernice pura.** |
| Arco dell'area (la «D») | raggio 66, `:27573-27574` | **NO** | Nessun'altra occorrenza del valore in tutto il file; niente barriera/fuorigioco legato all'arco — il calcio di punizione è un duello astratto (v. sotto), non una ricostruzione in campo. **Vernice pura.** |
| Rettangolo dell'area di rigore | `AREA_W`, `AREA_H`, dichiarate `:27445`, disegnate `:27565` | **SÌ, MA NON DIRETTAMENTE** | La regola vera è `dentroArea(team,x,y)` (`:19845-19848`), che usa `GK_AREA_X` per la larghezza e `GOAL_H*0.77` per l'altezza — **due variabili diverse** da `AREA_W`/`AREA_H`, non condivise nel codice. `GK_AREA_X` (`:18125`, ricotta in `setTaglia` a `:28317`) usa la STESSA formula di `AREA_W` (`Math.round(118*KPASSO)`) — stesso numero, per coincidenza di formula, non per condivisione. `dentroArea` decide se un cross vale (`:16130`, `finestraRovesciata`) e quanto lontano può uscire il portiere (`:18220`, `:18331`). **Rischio:** toccando solo `AREA_W`/`AREA_H` (quello che si VEDE) senza toccare `GK_AREA_X` e il fattore `0.77` (quello che il gioco APPLICA), il rettangolo dipinto si stacca dalla scatola vera. Il commento a `:19836-19843` lo dichiara già un patto fragile: «se un giorno uno dei due si muove, si muovono tutti e due» — ma sono tre formule letterali distinte, non una costante sola. |
| Dischetto del rigore | `DISCH`, dichiarata `:27445`, disegnata `:27572` (arco) e `:27589` (punto) | **NO** | Il duello dal dischetto (`Duel.start`, `:20549`) è un minigioco astratto (mira/potenza): non legge mai `DISCH` né alcuna coordinata di campo. Il rigore-serie (`avviaRigori`/`programmaRigore`/`esitoRigore`, `:17577-17608`) decide solo CHI tira, non DOVE — anzi il commento a `:20862-20866` distingue esplicitamente «PUNIZIONE» (qualunque fallo, in campo) da «RIGORE» (solo il titolo della serie a fine partita: **non esiste, in questo gioco, un rigore assegnato per un fallo dentro l'area durante l'azione**). **Vernice pura per la regola**, con un solo rischio: se `DISCH` si sposta, il pallino disegnato si stacca visivamente dalla telecamera del duello, che ha una scala propria e fissa (`RIG_H`, `:32957`; `:8046`). |
| Area di porta (5,5 m) | assente | — | Cercato `AREA_W2`, `areaPiccola`, `GOAL_AREA`, `AREA_PORTA`: nessun riscontro. Aggiungerla è disegnare un elemento nuovo, non toccare una regola esistente. |
| Palo della porta (per contesto, non è vernice) | `POST_R=5.5`, `:3925` | **SÌ** | `hitPosts()` usa `R=POST_R+B_R` (`:18605`) per la collisione fisica pallone-palo (swept, sul segmento del passo). Governa i rimbalzi sul palo — gol sfiorati, respinte fortunose — su ogni taglia. Non è nella lista del committente perché non è una linea, ma va tenuto distinto: è corpo, non vernice, per dichiarazione dello stesso commento di `:3832`. |

**Sintesi:** cerchio, archi d'angolo e arco dell'area si correggono senza
nessun costo di regola. Il rettangolo dell'area e il dischetto invece
condividono un NUMERO con una regola vera (`GK_AREA_X`, `dentroArea`) senza
condividere la VARIABILE: la cura corretta non è «cambia `AREA_W`», è
«fai in modo che `AREA_W`/`AREA_H` e `GK_AREA_X`/`dentroArea` derivino dalla
stessa unica costante», altrimenti si rischia un'area che si vede in un
punto e si applica in un altro.

---

## PARTE 2 — le tre decisioni vere

### (a) La forma del campo — oggi 2,05:1 ad ogni taglia, l'11 vero è 1,54:1

Oggi: rapporto `FW/FH` fisso a 2,05 su 5, 7 e 11 (`:3819-3822`, riaffermato
`:3829-3831`). Regolamentare (11, campo 105×68): 1,54:1 — scarto **+33,0%**
(fonte: `_analisi/MISURE-UFFICIALI.md`, PARTE C4). A 5 lo scarto è già
minimo (+2,7%: 2,05 contro 2,00 reale); il problema è quasi solo l'11.

Cosa si guadagna: un campo a 11 che assomiglia a un vero campo da calcio —
il cuore del reclamo.

Cosa si perde/costa: il codice è già scritto in funzione di `FW`/`FH` in
modo parametrico — dichiarato esplicitamente nel commento di `setTaglia()`
(`:28299-28304`): «fisica, sponde, IA, minimappa — e' gia' scritto in
funzione di FW/FH e scala da solo». Non serve quindi una riscrittura
strutturale. MA esistono tarature empiriche legate alla FORMA di oggi, non
riscritte automaticamente da un cambio di `FW/FH`:

- i quattro pavimenti di zoom `S2_MIN=1.00, S2_BASE=1.25, S2_MAX=1.53,
  S2_GOL=1.77` (`:24533`) sono stati tarati con test di fotogramma fermo e
  con una «spazzata di inquadrature» (`strumenti/_sweep`, citata nel
  commento a `:24570`) misurata sul campo attuale;
- la minimappa ha già un caso scritto a mano per la taglia 11:
  `const k0 = (Math.min(VW,VH)>=700 || TAGLIA===11) ? 1.35 : 1;` (`:34175`),
  col commento «sull'11 contro 11 si vede ~1/4 di campo» (`:34172-34174`) —
  un numero misurato sulla forma di oggi, che cambierebbe con la forma.

Cambiare la forma per l'11 vuol dire **rimisurare con gli strumenti che il
progetto ha già** (`strumenti/_sweep`, i test di fotogramma fermo), non
costruirli da capo — ma è comunque un giro di lavoro vero, non un numero
solo.

**Raccomandazione:** correggere la forma SOLO alla taglia 11 (la 5 è già
quasi giusta), e rimisurare zoom e minimappa con gli strumenti esistenti
prima di dichiarare chiuso lo scarto — non toccare 5 e 7 per questa voce.

### (b) La taglia dei corpi — oggi +189,5% (giocatore) e +232,1% (pallone) a 11

Oggi, a 11: diametro giocatore 26 unità contro 0,41 m reale (scarto
**+189,5%**); pallone 16 unità contro 0,22 m (**+232,1%**) — fonte: PARTE
C3 dello studio. `P_R`/`B_R` non scalano mai (`:3975`, `:4007`).

**Una leva esiste già, e cambia la natura della decisione.** Il pavimento
di zoom non è scritto come «quanto ingrandire», ma come «quanti pixel deve
occupare il corpo», e ne deriva lo zoom: `Z_FIG40 = 40/(2*P_R*P_DIS)`
(`:24543`) e `Z_BORDO = 34/(2*P_R*P_DIS)` (`:24564`) — la dimensione in
pixel del corpo è il dato fisso, `P_R` entra al denominatore. Se `P_R`
(e `B_R`) fossero più piccoli SOLO alla taglia 11, e questi due pavimenti
fossero ricalcolati con lo stesso `P_R` più piccolo, la formula produrrebbe
da sola uno zoom più stretto che **riporta il corpo alla stessa dimensione
in pixel sullo schermo**.

Il limite: oggi questo non succede. `Z_FIG40`/`Z_BORDO` sono `const` a
livello di modulo, calcolate una sola volta con l'unico `P_R` globale — non
sono ricalcolate dentro `setTaglia()` (`:28306-28324`, verificato: non le
tocca). E lo zoom stesso (`S2_MIN_DEV`/`S2_MAX_DEV`/…, ricotto in
`resize()` a `:24752-24771`) dipende SOLO da `kDev`, una misura del
dispositivo (`VW×VH`), MAI dalla taglia. La leva quindi esiste
nell'architettura ma non è cablata per taglia: **non è ancora costruita,
ma non va inventata da zero**.

Il resto del costo: `P_R`/`B_R` non sono solo pixel — governano la fisica
(separazione fra giocatori, `:4182`; ingombro nel dribbling, `:16835`;
raggio nel rendering della palla, `:31806`, `:31988`, `:32885`, `:33770`).
Ridurli alla sola taglia 11 tocca quei punti, non solo il disegno.

**Raccomandazione:** costruire la leva (rendere `Z_FIG40`/`Z_BORDO` e i
raggi fisici funzione della taglia, non un numero globale) prima di
decidere quanto ridurre i corpi — è un lavoro delimitato (una manciata di
costanti da spostare dentro `setTaglia`, verificato sopra dove sono), non
un compromesso obbligato fra leggibilità e regolamento.

### (c) La porta — oggi +73,9% a 5, +22,2% a 11

`GOAL_H`: 150/172/196 unità (5/7/11), scarto +73,9% a 5 e +22,2% a 11
(fonte: PARTE C1/C3 dello studio). Il codice dichiara la ragione,
`:3830-3831`: «La porta cresce MENO del campo (x1.15/x1.3): se crescesse
con lui il portiere sparirebbe.»

**Una via di mezzo è misurabile**, con lo stesso metodo della PARTE C dello
studio: si sceglie uno scarto bersaglio (per esempio la metà di quello di
oggi, o un tetto assoluto tipo ±20%) e si risolve `GOAL_H` di conseguenza,
taglia per taglia — non è «sì o no alla porta vera», è «quale scarto
bersaglio». Un vincolo da non dimenticare: `GK_AREA_X` (quanto esce il
portiere) oggi deriva da `kPasso`, non da `GOAL_H` (`:28317`) — se la porta
cambia senza toccare `GK_AREA_X`, il portiere guadagna una porta più vera
ma un raggio d'azione tarato sulla vecchia.

**Raccomandazione:** non correggere la 5 al valore pieno (3 m: sullo
schermo di un telefono sarebbe una fessura, e a 5 lo scarto oggi è il più
grande dei tre ma il campo è anche il più stretto); fissare invece un tetto
di scarto unico per tutte e tre le taglie (per esempio ±20%) e risolvere
`GOAL_H` da lì — il committente decide il tetto.

---

## PARTE 3 — il calcio a 7 non ha una legge

Lo studio riporta due regolamenti italiani discordanti, nessuno dei due con
l'autorità dell'IFAB sull'11:

- **FIGC-SGS** (Pulcini, 8-10 anni): campo 50×30 o 60×40 m, porta 4×2 o
  5×2 m. Fonte primaria letta per intero.
- **UISP** (amatoriale adulto): campo 44-65×25-40 m, porta 5-6×2 m. Fonti
  secondarie concordanti.

Non è un conflitto sullo stesso fatto: sono due regolamenti per due
destinatari diversi, e bisogna scegliere quale dei due CALCETTO sta
simulando.

**Raccomandazione: UISP.** CALCETTO non ha nessuna meccanica da «attività
di base» — portiere vero con parate geometriche, cartellini ed espulsione
temporanea (`:17610-17614`), nessun accenno a categorie giovanili — e i suoi
tre tagli (5/7/11) leggono come tre livelli dello stesso gioco adulto, non
tre fasce d'età. Questa era già la raccomandazione dello studio (PARTE A3);
la confermo dal lato progetto perché è coerente con tutto il resto del
gioco che ho verificato in questa bozza (rigori-serie da adulti, cartellini
da adulti, nessuna regola agevolata).

---

## PARTE 4 — come si misura che la cura ha funzionato

**Soglie di accettazione**, non aggettivi:

1. Ogni elemento di **vernice pura** (cerchio di centrocampo, archi
   d'angolo, arco dell'area, e la nuova area di porta) sta entro **±10%**
   del rapporto di riferimento unità/metro della sua taglia (stesso metodo
   della PARTE C dello studio).
2. L'area di rigore vera (quella che `dentroArea`/`GK_AREA_X` applicano) e
   il rettangolo disegnato derivano dalla **stessa costante** — zero
   duplicazioni fra formula di disegno e formula di regola. Verifica:
   `grep` di ogni occorrenza letterale di `118` e `230` legata al campo deve
   restituire un'unica definizione, non tre.
3. Sulla forma del campo e sulla taglia dei corpi (PARTE 2, decisione del
   committente): qualunque numero scelga, lo scarto residuo dichiarato resta
   sotto un tetto esplicito — propongo **±15%** — invece di restare «quello
   che viene» dopo la correzione.
4. Sulla porta: lo scarto bersaglio scelto in PARTE 2(c) vale su tutte e tre
   le taglie, non solo su una.

**Il banco che le misura:**

- **Che cosa legge:** uno script nello stile di quelli già in `strumenti/`
  (`_crit-*.js`, `_q-*.js`) che per ogni taglia (5/7/11) calcola il rapporto
  di riferimento (`FW`/lunghezza reale) e il rapporto implicito di ogni
  costante di disegno, leggendole dal gioco vivo dopo `setTaglia(n)` tramite
  l'hook `window.__test` (coerente con la nota di casa sul collaudo dei
  giochi HTML), non da un canvas o da un numero copiato.
- **Con quale seme:** le costanti geometriche sono statiche, nessun seme
  serve per leggerle. Se il banco include anche eventi di gioco reali (un
  cross che deve o non deve valere secondo `dentroArea`), serve un seme
  dichiarato (per esempio `20260902`) per restare ripetibile.
- **Come si dimostra che sa condannare:** fatto girare **sul gioco di oggi,
  prima di qualunque correzione**, deve segnalare rosso su almeno tre casi
  noti — cerchio di centrocampo a 11 (oggi −69,1%), area di rigore a 11
  (oggi −57,7%), area di porta assente. Se il banco passa verde sul gioco di
  oggi, è il banco che è rotto, non il gioco.
