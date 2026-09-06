# Le proporzioni ufficiali — piano di esecuzione (voce #86)

> **Per chi esegue:** SOTTO-SKILL RICHIESTA: usare `superpowers:subagent-driven-development` (consigliata) oppure `superpowers:executing-plans` per eseguire il piano un compito alla volta. I passi usano caselle (`- [ ]`) per il tracciamento.

**Obiettivo:** il campo, le linee, la porta e (a 11) i corpi entrano nella scala dei campi veri — misurati da un banco che ha prima condannato il gioco di oggi — senza che vernice e regola possano mai più divergere.

**Architettura:** una TAVOLA DELLE VERNICI per taglia sostituisce i numeri letterali del pennello; la stessa tavola è l'unica fonte della regola (`dentroArea`/`GK_AREA_X`); `setTaglia()` resta l'unica porta che ricuoce i derivati, e ci entrano anche i raggi dei corpi e i pavimenti di zoom (`Z_FIG40`/`Z_BORDO`/`Z_MURO`), oggi `const` globali calcolate una volta sola. Ogni compito che cambia comportamento dichiara PRIMA a quali taglie i sorteggi divergono e verifica che alle altre restino identici al bit.

**Tecnologia:** un solo file HTML (`CALCETTO-il-gioco.html`, ~2,4 MB), banchi in `strumenti/*.js` con Node e Playwright, attrezzi a àncore testuali (`_t-*.js`) applicati con `--dentro`.

## Vincoli globali

- **Legge dei sorteggi:** zero chiamate nuove a `dado()`. Le divergenze di comportamento sono DICHIARATE per compito e per taglia (tabella sotto); dove un compito dichiara «identico», il confronto due-versioni deve essere identico al bit; `_q-determinismo` (stesso codice + stesso seme → stessa partita) resta verde a OGNI compito.
- **Ogni modifica al gioco passa da un attrezzo a àncore** in `strumenti/_t-*.js`, con `cerca`/`metti` esatti e conteggi `attesi` dopo la sostituzione.
- **Numeri di riga:** invecchiano. Ogni passo cerca **per nome** (`grep -n "nome"`), mai per riga; i `file:riga` in questo piano sono coordinate di oggi, da riverificare col grep prima di scrivere l'àncora.
- **Lingua:** commenti nel codice in italiano senza lettere accentate («e'» per «è»); documenti con gli accenti veri.
- **Un commit per compito**, col verbale nel messaggio: che cosa è cambiato, quale misura lo prova.
- **Ogni prova nuova deve saper condannare** prima di essere creduta: rossa sul codice sbagliato (o su una copia guasta apposta, lasciata in `fuori/`), verde sul giusto.
- **Soglie di accettazione** (dallo spec, decise dal committente il 6 settembre): vernice ufficiale entro ±10%; area disegnata e applicata dalla stessa costante (zero formule duplicate); forma a 11 e corpi a 11 entro ±15%; porta entro ±20% su tutte e tre le taglie con `GK_AREA_X` ricalibrata; il banco condanna il gioco di oggi su almeno tre casi noti.

## La tavola dei bersagli (tutta l'aritmetica del piano, in un posto solo)

**Ancore dichiarate** (rapporto unità/metro = FW / lunghezza reale):
- Taglia 5: campo FIFA futsal 40×20 m → **28,75 u/m** (FW 1150).
- Taglia 7: UISP amatoriale adulto; ancora dichiarata **60 m** di lunghezza (dentro il 44-65 UISP; la larghezza implicita 784/26,83 = 29,2 m cade dentro il 25-40 UISP) → **26,83 u/m** (FW 1610). Porta di riferimento 5,5 m (centro del 5-6 UISP).
- Taglia 11: IFAB 105×68 m → **21,90 u/m** (FW 2300, invariato; FH nuovo 1490).

| grandezza | 5 (28,75 u/m) | 7 (26,83 u/m) | 11 (21,90 u/m) | oggi |
|---|---|---|---|---|
| FH | 560 (inv.) | 784 (inv.) | **1490** (68,0 m; aspetto 1,5436 vs 1,5441 reale) | 1120 |
| GOAL_H (tetto ±20%) | **103** (3,58 m, +19,4%) | **172 invariata** (6,41 m, +16,6%: già nel tetto) | **192** (8,77 m, +19,8%) | 150/172/196 |
| AREA_PROF (regola+vernice) | **173** (6,02 m) | **268** (9,99 m, UISP 10) | **361** (16,48 m, IFAB 16,5) | 118/136/153 |
| AREA_SEMI (semilarghezza) | **216** (7,51 m; 3+6+6 m) | **288** (10,73 m; 5,5+8+8 m) | **441** (20,13 m; 7,32+16,5·2 m) | GOAL_H·0,77 |
| Cerchio centrocampo (raggio) | **86** (2,99 m, FIFA 3) | **106** (CONVENZIONE, v. sotto) | **200** (9,13 m, IFAB 9,15) | 62 |
| Arco d'angolo (raggio) | **7** (0,243 m, FIFA 0,25) | **27** (CONVENZIONE, 1 m famiglia-11) | **22** (1,00 m IFAB) | 14 |
| Dischetto (distanza) | **173** (6 m) + **secondo dischetto 288** (10 m, FIFA) | **215** (8,01 m UISP) | **241** (11,0 m IFAB) | 112/129/146 |
| Arco della «D» (r; centro sul dischetto) | **NIENTE** (il futsal non ha la D) | **106** (CONVENZIONE) | **200** (9,15 m IFAB) | 66 ovunque |
| Area di porta (SOLO 11, vernice) | — | — | prof **120** (5,48 m), largh **401** (18,31 m) | assente |
| P_R (raggio giocatore) | 13 (inv.) | 13 (inv.) | **5** (diam 0,456 m vs 0,41: +11,3%) | 13 |
| B_R (raggio pallone) | 8 (inv.) | 8 (inv.) | **2,5** (diam 0,228 m vs 0,22: +3,8%) | 8 |

**CONVENZIONI dichiarate (non misure):** per il 7 nessuna fonte dà cerchio, angolo o D («non trovato» in `_analisi/MISURE-UFFICIALI.md` A3/C2). Convenzione: cerchio e D alla **stessa frazione di larghezza del campo dell'11** (9,15/68 = 13,46% → 0,1346·784 ≈ 106), angolo al valore famiglia-11 (1 m → 27). Il banco marca questi tre valori «convenzione», li verifica come UGUAGLIANZA al valore convenuto e NON li conta nel verdetto ±10% — la regola di casa è concludere solo da misure. La seconda mano del gesso (oggi 63,8 sul cerchio da 62) resta `raggio+1,8` a ogni taglia.

**Divergenze dei sorteggi dichiarate, per compito** (il confronto due-versioni si fa taglia per taglia, con il metodo di `_c3-sorteggi`/`_crit10`):

| compito | 5 | 7 | 11 |
|---|---|---|---|
| 1 (tavola + banco) | identico | identico | identico |
| 2 (costante unica) | identico | identico | identico |
| 3 (forma dell'11) | identico | identico | **DIVERGE** |
| 4 (vernice) | identico | identico | identico |
| 5 (porta + area) | **DIVERGE** | **DIVERGE** (solo area: la porta non cambia) | **DIVERGE** |
| 6 (corpi a 11) | identico | identico | **DIVERGE** |

Una divergenza dove il piano dice «identico» è un difetto del compito, non un rosso da dichiarare.

**Conseguenza da mettere a verbale a ogni compito che diverge:** i nastri delle sfide registrati col motore precedente non si riproducono (stessa conseguenza del compito 9 della voce #88); la voce #96 (versione del motore nel nastro) è già cancello di pubblicazione.

---

### Compito 1: La tavola delle vernici, e il banco che condanna il gioco di oggi

**File:**
- Creare: `strumenti/_t-tavola-vernice.js` (attrezzo), `strumenti/_q-proporzioni.js` (banco)
- Modificare: `CALCETTO-il-gioco.html` — i letterali del pennello diventano una tavola per taglia (STESSI valori di oggi), esposta a `window.__test`

**Interfacce:**
- Consuma: `TAGLIE` (`grep -n "const TAGLIE"`), il blocco del pennello (`grep -n "gArco(FW/2,FH/2,62"`), `setTaglia` (`grep -n "function setTaglia"`), l'hook `window.__test` (`grep -n "__test"` per trovare dove nasce).
- Produce: oggetto globale `VERNICE` per taglia con i campi `{cerchio, cerchio2, angolo, dischetto, dischetto2, dArco, areaProf, areaSemi, portaProf, portaLargh}` (a 5/7 `dischetto2:0` e `portaProf/portaLargh:0` = non si disegna; `cerchio2 = cerchio+1.8`), ricotto in `setTaglia`; esportazioni `__test.proporzioni()` che ritorna `{TAGLIA, FW, FH, GOAL_H, GK_AREA_X, P_R, B_R, KICK_R, POST_R, SEP_R, P_SPEED, VERNICE: {…della taglia corrente}}`. I compiti 2-6 cambiano i VALORI dentro questa tavola, mai la sua forma.

- [ ] **Passo 1: rileggere i tre punti** (le coordinate di oggi: dichiarazione `AREA_W/AREA_H/DISCH` a ~27551, pennello a ~27666-27693, `setTaglia` a ~28412)

Run: `grep -n "const AREA_W=Math.round" CALCETTO-il-gioco.html; grep -n "gArco(FW/2,FH/2,62" CALCETTO-il-gioco.html; grep -n "function setTaglia" CALCETTO-il-gioco.html; grep -n "window.__test" CALCETTO-il-gioco.html | head -5`

- [ ] **Passo 2: scrivere l'attrezzo `_t-tavola-vernice.js`** — àncore sul blocco del pennello e su `setTaglia`. La tavola nasce coi valori DI OGGI, così il compito è un rinomino puro e i sorteggi restano identici al bit:

```js
/* dentro il gioco, accanto a TAGLIE (l'ancora la trova il grep del Passo 1) */
/* LA TAVOLA DELLE VERNICI (voce #86, compito 1). Ogni riga di gesso e ogni
   scatola della regola prende il numero DA QUI, per taglia: il pennello e
   dentroArea non possono piu' divergere perche' leggono lo stesso posto.
   OGGI la tavola replica i valori storici al bit (62/14/66, 118/230/112):
   i compiti 4 e 5 la porteranno alle misure vere. areaSemi=0 significa
   "usa GOAL_H*0.77 come sempre" finche' il compito 5 non decide. */
const VERNICI={
  5:{ cerchio:62, angolo:14, dArco:66, dischetto:112, dischetto2:0,
      areaProf:118, areaSemi:0, portaProf:0, portaLargh:0 },
  7:{ cerchio:62, angolo:14, dArco:66, dischetto:129, dischetto2:0,
      areaProf:136, areaSemi:0, portaProf:0, portaLargh:0 },
  11:{ cerchio:62, angolo:14, dArco:66, dischetto:146, dischetto2:0,
      areaProf:153, areaSemi:0, portaProf:0, portaLargh:0 },
};
let VERNICE=VERNICI[5];
```

Nel pennello: `62`→`VERNICE.cerchio`, `63.8`→`VERNICE.cerchio+1.8`, `14`→`VERNICE.angolo`, `66`→`VERNICE.dArco`, `AREA_W`→`VERNICE.areaProf`, `DISCH`→`VERNICE.dischetto`, e `AREA_H` (oggi `Math.round(230*GOAL_H/150)`) →`(VERNICE.areaSemi||Math.round(230*GOAL_H/150)/2)*2` mantenuto in una variabile locale col vecchio nome per non toccare le righe a valle. In `setTaglia`, accanto a `KPASSO`: `VERNICE=VERNICI[n];`. ATTENZIONE alla riga della dichiarazione locale (`const AREA_W=Math.round(118*KPASSO), AREA_H=…, DISCH=…`): l'àncora la sostituisce per intero. I valori di `dischetto` e `areaProf` nella tavola sono i prodotti di oggi (`112·kPasso`, `118·kPasso` arrotondati): 112/129/146 e 118/136/153 — al bit quelli che il pennello già produce.

Esportazione: nell'oggetto `window.__test` (àncora sul punto dove è definito) aggiungere `proporzioni(){ return {TAGLIA,FW,FH,GOAL_H,GK_AREA_X,P_R,B_R,KICK_R,POST_R,SEP_R,P_SPEED, VERNICE: Object.assign({},VERNICE)}; }`.

- [ ] **Passo 3: applicare e verificare il rinomino puro**

Run: `node strumenti/_t-tavola-vernice.js --dentro && node strumenti/_q-determinismo.js`
Poi il confronto due-versioni (gioco di prima in `fuori/`): `git show HEAD:CALCETTO-il-gioco.html > fuori/base-compito1.html` e confronto col metodo di `_c3-sorteggi` (`--a fuori/base-compito1.html --b CALCETTO-il-gioco.html`): atteso **0 partite divergenti a ogni taglia**.

- [ ] **Passo 4: scrivere il banco `_q-proporzioni.js`** — stile di casa (`servi()` + Playwright come `_q-volo.js`, passo non necessario: le costanti sono statiche, si legge dopo `setTaglia(n)`; niente seme, dichiararlo in testa). Per ogni taglia chiama `__test.setTaglia? — no: usa la via di `_crit10` (`t.startMatch(1,1,{size:n})` dopo `dismissSplash`, poi legge `__test.proporzioni()`). La TABELLA DEI RIFERIMENTI è incisa nel banco con la fonte accanto a ogni numero (copiarla dalla «tavola dei bersagli» di questo piano, che a sua volta viene da `_analisi/MISURE-UFFICIALI.md`). Verdetti `di(ok,nome,dettaglio)`:

  - per ogni elemento CON valore ufficiale: `scarto = (valore/rapporto_u_m) / ufficiale_m − 1`; verde se |scarto| ≤ 10% (vernice), ≤ 20% (GOAL_H), ≤ 15% (FH a 11 come larghezza reale, P_R e B_R a 11);
  - per le tre CONVENZIONI del 7: uguaglianza al valore convenuto, marcate «convenzione» nel nome della prova;
  - «area disegnata = area applicata»: `VERNICE.areaProf === GK_AREA_X` letti dallo stesso `proporzioni()`;
  - «area di porta presente a 11»: `portaProf>0 && portaLargh>0`.

- [ ] **Passo 5: il banco nasce rosso — la condanna sul gioco di oggi**

Run: `node strumenti/_q-proporzioni.js`
Atteso: ROSSO almeno su: cerchio a 11 (oggi 62 → −69,1%), area a 11 (153 → −57,7%), area di porta assente a 11, porta a 5 (+73,9%), corpi a 11 (+189,5% / +232,1%). Salvare l'uscita nel rapporto: è la prova che il banco sa condannare. (Le prove del compito 1 si chiudono col banco rosso: è NATO per condannare il gioco di oggi; diventerà verde compito dopo compito.)

- [ ] **Passo 6: commit**

```bash
git add CALCETTO-il-gioco.html strumenti/_t-tavola-vernice.js strumenti/_q-proporzioni.js
git commit -m "La tavola delle vernici, e il banco che condanna il campo di oggi (voce #86, compito 1)"
```

---

### Compito 2: L'unica costante dell'area — vernice e regola smettono di coincidere per caso

**File:**
- Creare: `strumenti/_t-area-unica.js`
- Modificare: `CALCETTO-il-gioco.html` — `setTaglia` (`GK_AREA_X` legge la tavola), `dentroArea` (semilarghezza dalla tavola)

**Interfacce:**
- Consuma: `VERNICI`/`VERNICE` dal compito 1; `dentroArea` (`grep -n "function dentroArea"`); la ricottura `GK_AREA_X=Math.round(118*KPASSO)` dentro `setTaglia`.
- Produce: `GK_AREA_X = VERNICI[n].areaProf` (in `setTaglia`); `dentroArea` usa `Math.abs(y-FH/2) <= (VERNICE.areaSemi || GOAL_H*0.77)`. Con `areaSemi:0` i valori di oggi restano AL BIT (118·kPasso e GOAL_H·0,77): zero cambi di comportamento.

- [ ] **Passo 1: rileggere** — `grep -n "GK_AREA_X" CALCETTO-il-gioco.html | head -8` (la dichiarazione `let GK_AREA_X = 118` a ~18207 resta; cambia solo la ricottura in `setTaglia`).
- [ ] **Passo 2: attrezzo** con due àncore (`setTaglia`, `dentroArea`) e conteggi `attesi`; commento in `dentroArea`: la promessa «se uno si muove, si muovono tutti e due» smette di essere un patto fra tre formule e diventa UNA variabile.
- [ ] **Passo 3: cancello del letterale unico** — Run: `grep -c "Math.round(118" CALCETTO-il-gioco.html` → atteso **1** (la sola tavola; oggi sono 2: tavola e ricottura). `grep -c "230\*GOAL_H" CALCETTO-il-gioco.html` → atteso **1** (il ripiego dentro il pennello finché areaSemi è 0).
- [ ] **Passo 4: identico al bit** — `node strumenti/_t-area-unica.js --dentro`, poi `_q-determinismo` verde e confronto due-versioni contro `fuori/base-compito2.html` (=HEAD prima dell'attrezzo): 0 divergenze a ogni taglia. `_q-proporzioni`: la prova «disegnata=applicata» diventa VERDE; il resto resta rosso com'era.
- [ ] **Passo 5: commit** — `git commit -m "L'area si vede dove si applica: una costante sola (voce #86, compito 2)"`

---

### Compito 3: La forma dell'11 — il campo prende 68 metri

**File:**
- Creare: `strumenti/_t-forma-undici.js`
- Modificare: `CALCETTO-il-gioco.html` — `TAGLIE[11].FH` 1120→1490; il commento di testa delle taglie (la frase «Rapporto d'aspetto 2.05 INVARIATO su tutte» diventa falsa e va rettificata in chiaro, stile edizioni)

**Interfacce:**
- Consuma: `TAGLIE` (compito 1 non l'ha toccata); `kTetto` in camera (`grep -n "kTetto"`) già parametrico su `FW*FH` — si adatta da solo; la minimappa (`grep -n "TAGLIA===11) ? 1.35"`).
- Produce: `TAGLIE[11].FH:1490`. Il modulo dell'11 è in frazioni `fy` di FH: scala da solo (verificarlo a occhio nel rapporto: `fy:±0.36` → ±536 unità su 1490, dentro il campo).

- [ ] **Passo 1: attrezzo** — àncora sulla riga `11:{ FW:2300, FH:1120, …` e sul commento `Rapporto d'aspetto 2.05 INVARIATO`; la rettifica scrive: a 11 il rapporto è 1,54 (IFAB), 5 e 7 restano 2,05, e la minimappa/camera dell'11 sono state rimisurate (questo compito).
- [ ] **Passo 2: applicare, cancelli di base** — `--dentro`; `_q-determinismo` verde; confronto due-versioni: 5 e 7 IDENTICI, 11 DIVERGE (dichiarato — mettere i numeri nel rapporto).
- [ ] **Passo 3: la rimisura della camera e della minimappa** (l'obbligo della decisione 1). Run in sequenza:
  - `ls strumenti/ | grep -i sweep` e lanciare lo strumento di spazzata sul campo nuovo a taglia 11; conservare l'uscita in `fuori/sweep-11-dopo.txt`;
  - `node strumenti/tutti.js --solo istantanea,folla` (i cancelli del fotogramma fermo e della folla: erba vuota e presenza);
  - la minimappa: leggere il commento sopra `k0` («si vede ~1/4 di campo»): con FH 1490 la frazione cambia — misurarla dalla spazzata e aggiornare NUMERO E COMMENTO se la misura lo chiede (il fattore 1,35 resta se la misura dice che va bene: nessun ritocco al buio).
  Atteso: `istantanea` e `folla` verdi; corpi mai sotto 34 px (Z_BORDO governa e non è cambiato).
- [ ] **Passo 4: `_q-proporzioni`** — la prova della larghezza a 11 (FH vs 68 m) diventa VERDE (−0,03%).
- [ ] **Passo 5: commit** — `git commit -m "Il campo a undici prende i suoi 68 metri (voce #86, compito 3)"`

---

### Compito 4: La vernice alle misure vere

**File:**
- Creare: `strumenti/_t-vernice-vera.js`
- Modificare: `CALCETTO-il-gioco.html` — SOLO i valori dentro `VERNICI` (più il disegno di: secondo dischetto a 5, area di porta a 11, rimozione della D a 5)

**Interfacce:**
- Consuma: la tavola `VERNICI` e il pennello del compito 1.
- Produce: valori nuovi dalla tavola dei bersagli: cerchio 86/106/200, angolo 7/27/22, dischetto 173/215/241, `dischetto2` 288 a 5, `dArco` 0 a 5 (la D non si disegna se `dArco` è 0 — aggiungere la guardia `if(VERNICE.dArco)` al blocco della D), 106 a 7, 200 a 11; `portaProf:120, portaLargh:401` a 11 col disegno del rettangolo interno (stesso stile `gRett` dell'area, guardia `if(VERNICE.portaProf)`); il secondo dischetto a 5 è un punto come il primo, guardia `if(VERNICE.dischetto2)`.
- I campi `areaProf`/`areaSemi`/`GOAL_H` NON si toccano qui (compito 5).

- [ ] **Passo 1: attrezzo** — àncore: la tavola `VERNICI` (valori interi), il blocco della D (guardia), il blocco dei dischetti (secondo punto), il blocco dell'area (rettangolo interno dell'area di porta, disegnato DOPO il rettangolo grande, stessa alfa). Commenti con la misura e la fonte accanto a ogni numero (86 = 3 m FIFA futsal; 200 = 9,15 m IFAB; 106/27 = CONVENZIONE famiglia-11, frazione di larghezza — senza accentate).
- [ ] **Passo 2: applicare, cancelli** — `--dentro`; è VERNICE PURA: `_q-determinismo` verde e confronto due-versioni IDENTICO a tutte e tre le taglie (se diverge, il pennello ha toccato una regola: difetto).
- [ ] **Passo 3: `_q-proporzioni`** — diventano verdi: cerchio (3 taglie), angolo (5 e 11), dischetto (3 taglie), D a 11, area di porta a 11, convenzioni del 7. Restano rossi: porta, area, corpi (compiti 5-6).
- [ ] **Passo 4: l'occhio umano** — una partita di 60 s a taglia 11 e una a 5 col collaudo di casa (hook `window.__test`, `strumenti/collaudo.js` se disponibile, altrimenti server + browser) e UNO screenshot per taglia in `fuori/vernice-{5,11}.png`: il cerchio a 11 deve leggersi come UN CERCHIO DA CALCIO, i due rettangoli annidati davanti alla porta a 11 devono esserci. Da allegare al rapporto.
- [ ] **Passo 5: commit** — `git commit -m "Il gesso torna alle misure del regolamento, e a undici spunta l'area di porta (voce #86, compito 4)"`

---

### Compito 5: La porta e l'area — la scatola davanti alla rete diventa vera

**File:**
- Creare: `strumenti/_t-porta-area.js`
- Modificare: `CALCETTO-il-gioco.html` — `TAGLIE[5].GOAL_H` 150→103, `TAGLIE[11].GOAL_H` 196→192; nella tavola: `areaProf` 173/268/361 e `areaSemi` 216/288/441; il commento «La porta cresce MENO del campo… se crescesse con lui il portiere sparirebbe» va rettificato (la ragione resta vera, i numeri nuovi rispettano il tetto ±20% deciso il 6 settembre)

**Interfacce:**
- Consuma: compiti 1-2 (la tavola governa già `GK_AREA_X` via `setTaglia` e la semilarghezza via `dentroArea`); `GY0/GY1/POSTI` si ricuociono da `GOAL_H` in `setTaglia` da soli.
- Produce: porta 103/172/192; area regola+vernice 173-216 / 268-288 / 361-441. Con `areaSemi>0` il ripiego `GOAL_H*0.77` in `dentroArea` e nel pennello smette di essere usato.

- [ ] **Passo 1: attrezzo** — àncore su `TAGLIE` (i due GOAL_H), sulla tavola (sei valori), sul commento della porta. ATTENZIONE ai lettori di `GOAL_H*0.77`: `grep -n "GOAL_H\*0.77" CALCETTO-il-gioco.html` — dopo il compito 2 ne resta l'uso di ripiego in `dentroArea` (e il gemello nel pennello): verificare che con `areaSemi>0` non restino ALTRI lettori di 0,77 che darebbero un'area diversa a qualche regola.
- [ ] **Passo 2: applicare, cancelli** — `--dentro`; `_q-determinismo` verde; confronto due-versioni: DIVERGE a 5 e 11 (porta+area) e a 7 (solo area — la porta del 7 non cambia). Numeri a verbale.
- [ ] **Passo 3: i cancelli di giocabilità** — la porta a 5 scende del 31% e il portiere a 11 può uscire fino a 361 unità: il gioco DEVE restare calcio. Run: `node strumenti/tutti.js --solo giocata,eventi` (più il banco degli eventi davanti alla porta usato per la voce «l'11 non produce eventi» — cercarlo con `ls strumenti/ | grep -i event`). Atteso: verdi. Se un cancello di giocabilità regredisce (0-0 sistematici a 5, portiere a spasso a 11), FERMARSI e riportare BLOCKED con le misure: la taratura di rimedio è una decisione, non un ritocco silenzioso.
- [ ] **Passo 4: `_q-proporzioni`** — verdi: porta ≤20% (3 taglie), area profondità e semilarghezza (3 taglie), «disegnata=applicata» ancora verde.
- [ ] **Passo 5: commit** — `git commit -m "La porta rientra nel tetto e l'area diventa la scatola vera (voce #86, compito 5)"`

---

### Compito 6: La leva dei corpi — a undici giocano uomini in scala

**File:**
- Creare: `strumenti/_t-leva-corpi.js`
- Modificare: `CALCETTO-il-gioco.html` — `P_R`/`B_R` da `const` a tavola per taglia; `Z_FIG40`/`Z_BORDO`/`Z_MURO` da `const` a ricottura in `setTaglia`

**Interfacce:**
- Consuma: `setTaglia` (unica porta); le tre costanti di zoom (`grep -n "Z_FIG40 ="`, `= 34/(2*P_R*P_DIS)`, `= 31/(2*P_R*P_DIS)`); i lettori fisici di `P_R`/`B_R` restano invariati NEL TESTO (leggono la variabile).
- Produce: `const CORPI={5:{P_R:13,B_R:8},7:{P_R:13,B_R:8},11:{P_R:5,B_R:2.5}}`; `let P_R=13, B_R=8;` e in `setTaglia`: `P_R=CORPI[n].P_R; B_R=CORPI[n].B_R; Z_FIG40=40/(2*P_R*P_DIS); Z_BORDO=34/(2*P_R*P_DIS); Z_MURO=31/(2*P_R*P_DIS);` (le tre Z diventano `let`, coi loro commenti che restano). `P_DIS`/`B_DIS` NON cambiano. La formula dei pavimenti tiene i corpi a 40/34/31 px sullo schermo A OGNI taglia per costruzione — è la leva promessa dalla bozza.
- ATTENZIONE 1: `Z_FIG40` e compagne sono `const` usate in dichiarazioni successive (`let S2_MIN_DEV=…` no, quelle derivano da S2_*) — verificare con grep che nessuna ALTRA `const` a livello di modulo si inizializzi da `P_R`/`B_R`/`Z_*` (quelle andrebbero ricotte anche loro; `window.__test.pallaRaggio` va aggiornato se è una fotografia e non una funzione).
- ATTENZIONE 2: il menu vive a taglia 5 (`setTaglia` commento: «menu, eroe e miniature vivono sul campo base») quindi la home non cambia di un pixel.

- [ ] **Passo 1: censimento dei lettori** — Run: `grep -n "P_R" CALCETTO-il-gioco.html | wc -l` e leggere le occorrenze in dichiarazioni `const … = …P_R…` a livello di modulo (non dentro funzioni): OGNUNA va nell'attrezzo come ricottura o dichiarata innocua nel rapporto.
- [ ] **Passo 2: attrezzo, applicare** — `--dentro`; `_q-determinismo` verde; confronto due-versioni: 5 e 7 IDENTICI AL BIT (il menu e le miniature girano a 5: qualunque divergenza lì è un difetto), 11 DIVERGE (dichiarato).
- [ ] **Passo 3: giocabilità a 11** — `node strumenti/tutti.js --solo giocata,eventi,istantanea,folla` più la spazzata a 11 (`fuori/sweep-11-corpi.txt`). Con P_R 5 il quadro a 40 px di corpo inquadra ~12% del campo (era 30%): la minimappa è la bussola — verificare che il cancello dell'orientamento (se esiste in batteria) e `giocata` restino verdi. Se l'11 muore (zero eventi, camera cieca), BLOCKED con le misure.
- [ ] **Passo 4: `_q-proporzioni`** — verdi: corpi a 11 (+11,3% e +3,8%, entro ±15%). A questo punto TUTTE le prove del banco sono verdi.
- [ ] **Passo 5: commit** — `git commit -m "A undici giocano uomini in scala, e la camera li tiene a 40 pixel (voce #86, compito 6)"`

---

### Compito 7: La batteria, il verbale, il registro

**File:**
- Modificare: `strumenti/tutti.js` (`_q-proporzioni` entra in batteria, `conta:true, lento:false`, con un commento che spiega che cosa misura e perché sta lì), `MANUALE.md` («A registro»: voce #86 curata, con la tavola prima/dopo e le fonti), `PUNTO-DEL-LAVORO.md` (cantiere chiuso; restano #85, #87, #89), `_analisi/MISURE-UFFICIALI.md` (PARTE B e C rettificate A EDIZIONI: i numeri di oggi accanto a quelli di ieri con la data, non cancellati)

- [ ] **Passo 1: batteria in spezzoni** — gli stessi quattro comandi del compito 8 della voce #88 (leggerli da `.git/sdd/brief/compito-8-brief.md`), più `proporzioni` nell'ultimo. Atteso: tutti i cancelli che contano verdi; se `prestazione` è rosso in batteria, rimisurarlo da solo prima di crederci.
- [ ] **Passo 2: sorteggi** — `_q-determinismo` 10/10; il confronto due-versioni COMPLESSIVO (base = il merge-base del ramo) DIVERGE a tutte le taglie per costruzione (porta/area ovunque): il verbale dichiara le divergenze compito per compito con la tabella del piano, e verifica che ogni «identico» del piano sia stato provato al bit nel suo compito.
- [ ] **Passo 3: il verbale nei documenti** — ogni numero con la prova accanto; le CONVENZIONI del 7 dichiarate come tali anche nel MANUALE.
- [ ] **Passo 4: commit** — `git commit -m "Le proporzioni ufficiali: campo, gesso, porta e corpi misurati e a registro (voce #86)"`

---

## Autoverifica del piano (fatta scrivendolo)

- **Copertura dello spec:** vernice ±10% → compiti 1+4; costante unica → 2; area di porta → 4; forma 11 + rimisure → 3; leva corpi + riduzione ±15% → 6; porta ±20% + GK_AREA_X → 5 (GK_AREA_X segue la tavola dal compito 2, i valori dal 5); UISP per il 7 → tavola dei bersagli; banco che condanna su tre casi noti → 1 Passo 5; batteria e documenti → 7.
- **Il rischio più grosso è dichiarato dove si corre:** i cancelli di giocabilità dei compiti 5 e 6 hanno l'ordine di FERMARSI invece di ritoccare in silenzio.
- **Coerenza dei nomi:** `VERNICI`/`VERNICE`, `CORPI`, `__test.proporzioni()` usati con lo stesso nome nei compiti 1, 2, 4, 5, 6 e nel banco.
