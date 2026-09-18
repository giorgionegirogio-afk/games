# Spiccioli di UX e accessibilità — piano di esecuzione (onda A chiusa, voce #112)

> **Per chi esegue:** SOTTO-SKILL RICHIESTA: usare `superpowers:subagent-driven-development`. I passi usano caselle (`- [ ]`).

**Obiettivo:** sei cure di UX/accessibilità a rischio quasi zero che chiudono l'onda A del mandato — etichette per lo screen reader, vibrazione a tre intensità, RIVEDI IL TUTORIAL, sottotitoli degli eventi sonori, anello del fiato, banco fotosensibilità.

**Architettura:** puro contorno — HTML/ARIA, impostazioni persistite (SAVE additivo), disegno HUD, un banco di misura. Nessun tocco a `dado()`, a una decisione di gioco o a uno stato letto dalla CPU.

**Tecnologia:** un file HTML, attrezzi a àncore, banchi Node+Playwright.

## Vincoli globali
- **Due-versioni 0/60 a TUTTE le taglie a ogni compito** (`_c3-sorteggi --a <base> --b HEAD --taglie 5,7,11`): il contorno non sposta i sorteggi; un solo divergente è un difetto, FERMATI e diagnostica. `_q-determinismo --partite 4` 13/13.
- Ogni tocco al gioco via attrezzo a àncore (--dentro prima di applicare, mai a mano — lezione della coda di #87/#107). Ogni banco/prova nuova nasce ROSSA sul gioco di oggi (corsa di condanna a registro).
- Campi SAVE nuovi (`vibInt`, `sott`) additivi con default e sanificazione in `loadSave` (modello `sponde` di #87 :9779); primo avvio verificato (pagina fresca senza salvataggio: default giusti, il gioco carica).
- Commenti senza accentate; un commit per compito col verbale nel messaggio.
- Banchi di contorno verdi a ogni compito: `_q-battute` 11/11, `_q-regole` a taglia 5 (16/16), `_q-precedenza` 9/9. Accessibilità MISURATA (aria-pressed sincronizzato, testo entro N ms, arco = fiato vero), mai attestata.
- Fonti: spec `docs/superpowers/specs/2026-09-18-spiccioli-ux-design.md`, `_analisi/MAPPA-MANDATO.md` (aree 4 e 6), gli ancoraggi della ricognizione del 18 settembre.

## Soglie di accettazione (dallo spec)
1. I 5 `.voce.sw` hanno `aria-pressed` sincronizzato con lo stato; il rettangolo banner è dichiarato in `zoneInterfaccia`.
2. `SAVE.vibInt` a 3 valori con la riga in IMPOSTAZIONI; `buzz` scala la durata; ON/OFF resta.
3. RIVEDI IL TUTORIAL azzera entrambi i flag; alla prossima amichevole 1p il tutorial riparte; sottotitolo onesto.
4. `SAVE.sott`: col flag acceso gli eventi sonori chiave (fischi compresi, con le chiamate mancanti aggiunte) mostrano il banner testuale.
5. Anello del fiato: arco proporzionale a `p.fiato` vero, quarta tinta, rispetta buco/raggio, dentro `anelloComandato`.
6. `_q-fotosensibile.js`: verde sul gioco (tre sorgenti, moto on/off), ROSSO sul caso `--controllo` a 4 Hz; in batteria; onda A chiusa nel verbale.

---

### Compito 1: Le etichette parlano, e il banner si dichiara
**File:** creare `strumenti/_t-aria-etichette.js`, `strumenti/_q-accessibile.js`; modificare (via attrezzo) `CALCETTO-il-gioco.html` (`refreshImpostUI` :41623-41652, `zoneInterfaccia` :43370-43454, e i markup dei 5 `.voce.sw` :3631-3663 se aria-label statico serve).
**Interfacce.** Consuma: il pattern `eroeEnd.setAttribute('aria-label',...)` (:11412); `refreshImpostUI`; `zoneInterfaccia()` e come `istantanea.js` la legge (:785, 1715). Produce: `aria-pressed="true|false"` su ognuno dei 5 interruttori, scritto in `refreshImpostUI` accanto al `classList.toggle('on', ...)`; una voce `{tipo:'banner', x0,y0,x1,y1}` in `zoneInterfaccia` che copre il rettangolo del banner (leggi la geometria vera dal disegno ~:39667: bx0..bx1, VH-58..).
- [ ] Passo 1: fonti+grep; scrivere il banco `_q-accessibile.js` (Playwright): prova ARIA — ogni `.voce.sw` ha `aria-pressed` E il suo valore combacia con `classList.contains('on')` dopo un click simulato; prova BANNER-DICHIARATO — `zoneInterfaccia()` contiene una zona `banner` quando `G.banner` è attivo. Condanna sul gioco di oggi (ARIA rossa: 0 aria-pressed; BANNER rossa: non dichiarato).
- [ ] Passo 2: attrezzo, applicare; ARIA e BANNER-DICHIARATO verdi.
- [ ] Passo 3: cancelli — `_q-determinismo --partite 4` 13/13; `_c3-sorteggi --a <git show HEAD in fuori/> --b HEAD --taglie 5,7,11` **0/60** (solo HTML/dichiarazione, zero simulazione); `istantanea.js` verde (il banner dichiarato non deve rompere il conteggio ombra — anzi lo migliora); primo avvio ok.
- [ ] Passo 4: commit — `git commit -m "Le etichette parlano allo screen reader, e il banner si dichiara (voce #112, compito 1)"`

### Compito 2: La vibrazione ha tre intensità
**File:** creare `strumenti/_t-vibrazione-intensita.js`; modificare gioco (HTML IMPOSTAZIONI, `defaultSave`/`loadSave`, `buzz` :8616, `refreshImpostUI`); modificare `strumenti/_q-accessibile.js` (prova nuova).
**Interfacce.** Consuma: il pattern `.diff-row`/`refreshDiffRows` (markup :3656-3660, wiring :40202-40214); `buzz(p)` (:8616); `SAVE` (:9736). Produce: `SAVE.vibInt` (0/1/2 default 1, sanificato in loadSave); riga `#vibRow` (tre bottoni `.vib` data-vi) con `refreshVibRow`; `buzz(p)` scala `p` (numero o array) per `[0.5,1,1.6][SAVE.vibInt]` prima di `navigator.vibrate`.
- [ ] Passo 1: attrezzo + prova VIBRAZIONE nel banco: dopo aver scelto data-vi=2, `t.save.vibInt===2` e (via una spia su navigator.vibrate installata nel banco) la durata passata è ~1,6× quella a vibInt 1. Condanna sul gioco di oggi (vibInt non esiste).
- [ ] Passo 2: cancelli come compito 1 (0/60, 13/13); ON/OFF ancora funziona (vibInt inerte a vib spento); primo avvio (vibInt default 1).
- [ ] Passo 3: commit — `git commit -m "La vibrazione ha tre intensita': leggera, normale, forte (voce #112, compito 2)"`

### Compito 3: RIVEDI IL TUTORIAL
**File:** creare `strumenti/_t-rivedi-tutorial.js`; modificare gioco (pannello id=extra :3112-3128, un handler nuovo); modificare `strumenti/_q-accessibile.js` (prova nuova).
**Interfacce.** Consuma: `Tut` (:40435+), `SAVE.tutorialDone`/`tutorialVisto` (:9772/9777, scrittura :40460), la guardia di `kickoff` (:11120), il pattern `$('btnHow').addEventListener` (:40268), il toast di casa (grep come si mostra un toast/conferma). Produce: bottone `#btnRivediTut` nel pannello extra; handler `SAVE.tutorialDone=false; SAVE.tutorialVisto=0; persistSave();` + toast; sottotitolo onesto.
- [ ] Passo 1: attrezzo + prova RIVEDI-TUTORIAL nel banco: click sul bottone → `t.save.tutorialDone===false && t.save.tutorialVisto===0`; poi `startMatch(1,1)` (amichevole 1p) → al kickoff `Tut.active===true` (o l'equivalente esposto). Condanna sul gioco di oggi (il bottone non esiste). ATTENZIONE (trappola della ricognizione): azzerare solo tutorialDone lo richiuderebbe subito — la prova deve verificare che ENTRAMBI siano azzerati e che il tutorial parta DAVVERO al kickoff, non solo che i flag cambino.
- [ ] Passo 2: cancelli (0/60, 13/13); il tutorial NON riparte in 2 giocatori/CPU/sfida (la guardia :11120 regge — verifica che il bottone non la scavalchi); primo avvio.
- [ ] Passo 3: commit — `git commit -m "Rivedi il tutorial: una voce che riapre la lezione alla prossima amichevole (voce #112, compito 3)"`

### Compito 4: I sottotitoli degli eventi sonori
**File:** creare `strumenti/_t-sottotitoli.js`; modificare gioco (SAVE, IMPOSTAZIONI, `refreshImpostUI`, i punti Audio5 senza banner :16936/17081/…, un helper `sottotitolo(testo)` che chiama showBanner solo se `SAVE.sott`); modificare `strumenti/_q-regole.js` o `_q-accessibile.js` (prova nuova).
**Interfacce.** Consuma: `showBanner` (:8619), `SAVE.dalt` come modello di flag accessibilità (:41753), i punti `Audio5.whistle` senza banner (:16936, :17081, e gli altri censiti). Produce: `SAVE.sott` (default 1, sanificato); interruttore `#btnSetSott`; `sottotitolo(testo,col,dur)` che fa `if(SAVE.sott) showBanner(...)`; le chiamate `sottotitolo('FISCHIO'…)` aggiunte dove il fischio suonava muto. NOTA: il rettangolo banner è già dichiarato in zoneInterfaccia dal compito 1 — verificarlo, non rifarlo.
- [ ] Passo 1: attrezzo + prova SOTTOTITOLI (CPU-CPU, seme fisso): col flag acceso, al fischio d'inizio (o all'evento sonoro chiave che il banco deterministico ESERCITA — verifica quali eventi capitano in CPU-CPU: se il fischio d'inizio è fra quelli, usalo; se no, scegli un evento esercitato e dichiaralo) `G.banner` porta il testo atteso entro pochi fotogrammi; col flag spento, nessun banner NUOVO su quell'evento (i banner preesistenti PALO/GOL restano — il flag non li spegne, li lascia). Condanna sul gioco di oggi (sott non esiste; il fischio d'inizio è muto). Se nessun evento sonoro chiave è esercitato in CPU-CPU, il banco costruisce la scena (fischio via setScene/kickoff) e lo dichiara.
- [ ] Passo 2: cancelli (0/60 — il banner è disegno; 13/13); lo slot unico dichiarato (due eventi ravvicinati: l'urgente vince, come oggi).
- [ ] Passo 3: commit — `git commit -m "I sottotitoli danno voce agli eventi sonori: il fischio si legge (voce #112, compito 4)"`

### Compito 5: L'anello del fiato
**File:** creare `strumenti/_t-anello-fiato.js`; modificare gioco (`anelloComandato` :34234-34264); modificare un banco (prova nuova — `_q-accessibile.js` o un check dedicato).
**Interfacce.** Consuma: `anelloComandato(p)` e la sua ellisse (centro p.x+2.5,p.y+6.6, semiassi arx,ary); `anelloContenimento` come modello (:34266); `p.fiato` (0..100, :18031); `bucoPalla()` (:34151); la palette (ambra=controllo, ciano=contenimento — serve una quarta tinta). Produce: dentro `anelloComandato`, dopo il filo di luce (~:34248), uno stroke ad arco parziale sulla stessa ellisse, angolo finale `-Math.PI/2 + (p.fiato/100)*2*Math.PI`, quarta tinta a bassa alfa (es. `rgba(190,255,120,.85)`), spessore dentro il raggio ambra (non sporgere oltre arx).
- [ ] Passo 1: attrezzo + prova ANELLO-FIATO nel banco (misura, non screenshot): con un `p.fiato` noto impostato via __test o durante una corsa, l'arco disegnato copre la frazione attesa (leggi l'angolo/la geometria via una spia sul disegno, o campiona i pixel della quarta tinta lungo l'ellisse e verifica la frazione accesa ≈ fiato/100). Condanna: sul gioco di oggi non c'è quarta tinta sull'ellisse.
- [ ] Passo 2: cancelli — 0/60 (disegno puro); 13/13; `gabbia.js` verde (nessuna posa nuova, ma va riprovato); `istantanea.js` verde (la quarta tinta NON è scura: se `istantanea` la conta come ombra, la tinta o la posizione sono sbagliate — è il segnale d'allarme della ricognizione); il buco della palla rispettato (l'arco si interrompe come il resto di anelloComandato quando la palla è ai piedi).
- [ ] Passo 3: SCREENSHOT `fuori/anello-fiato.png` con un fiato basso (~40%) e uno pieno, GUARDATO: i tre segnali (ambra=comando, ciano=contenimento, quarta tinta=fiato) si distinguono a 30 px?
- [ ] Passo 4: commit — `git commit -m "L'anello del fiato: il comandato mostra quanto gli resta (voce #112, compito 5)"`

### Compito 6: Il banco fotosensibilità, la batteria, il verbale (onda A chiusa)
**File:** creare `strumenti/_q-fotosensibile.js`; modificare `strumenti/tutti.js`, `MANUALE.md`, `PUNTO-DEL-LAVORO.md`.
**Interfacce.** Consuma: il telaio di `_q-volo.js` (:52-124: server, addInitScript su rAF, semina, simulate); il pattern `getImageData` di `istantanea.js`; le tre sorgenti di lampi (CROWD_FLASH :29636, DUEL_FLASH :37204, il lampo+raggi del gol :39515-39548); `__test.setMoto` (:43730); il gol vero via `setScene('goal')` (:11378, simulato non fabbricato). Produce: `_q-fotosensibile.js` che campiona la luminanza media a schermo intero fotogramma per fotogramma su 3-4 s attorno a più gol ravvicinati (serie di rigori) + una scena sera (fari, controllo negativo: NON deve falsare positivo) + una scena dischetto (DUEL_FLASH), a `moto` on e off, seme fisso; verdetto verde se nessun lampo a schermo intero supera 3 Hz; caso `--controllo` che inietta un lampo a 4 Hz e DEVE uscire rosso.
- [ ] Passo 1: scrivere il banco; lanciarlo — verde sul gioco vero (le tre sorgenti restano sotto 3 Hz), rosso col `--controllo` a 4 Hz. Riportare le due corse (la condanna è il --controllo).
- [ ] Passo 2: registrare `fotosensibile` in `tutti.js` (`conta:true`, commento «PERCHE' STA IN BATTERIA»: sorveglia che un futuro effetto luminoso non introduca uno strobo oltre 3 Hz). Batteria in spezzoni: tutti i cancelli che contano verdi (elenca).
- [ ] Passo 3: sorteggi complessivi del cantiere dal merge-base (`_c3-sorteggi` per taglia): **0/60 a tutte le taglie** — la promessa del cantiere di contorno (nessuna cura ha spostato un sorteggio); `_q-determinismo` 13/13.
- [ ] Passo 4: verbale — `MANUALE.md` voce #112 CURATA (le sei cure coi numeri e la fonte: aria-pressed sui 5, banner dichiarato, vibInt 3 valori, rivedi-tutorial, sottotitoli sugli eventi, anello del fiato, banco fotosensibile verde/controllo rosso; il due-versioni 0/60 dell'intero cantiere = la firma del contorno) + **onda A DICHIARATA CHIUSA** (le quattro voci: #86 vernice, #85 moviola già chiuse in main; #87 rimesse/angoli; #107 regole/#96; #112 spiccioli — e cosa resta: onda B); seguito **#113** (MIRA GUIDATA a due pesi, fuori perimetro). `PUNTO-DEL-LAVORO.md`: la giornata, onda A chiusa, «Restano» = onda B (registro dei fatti + MIND v1) e la voce #89.
- [ ] Passo 5: commit — `git commit -m "Il banco fotosensibilita', la batteria, e l'onda A si chiude (voce #112)"`

---
## Autoverifica del piano
- Copertura: spec §1→C1, §2→C2, §3→C3, §4→C4, §5→C5, §6→C6; il vincolo 0/60 in ogni compito; l'accessibilità misurata in ogni banco.
- Ordine motivato: C1 dichiara il banner in zoneInterfaccia PRIMA che C4 (sottotitoli) lo renda frequente; C6 per ultimo perché chiude batteria e verbale.
- Nomi vincolanti: `SAVE.vibInt` (0/1/2), `SAVE.sott`, `#vibRow`/`.vib`/data-vi, `#btnSetSott`, `#btnRivediTut`, `sottotitolo()`, banco `_q-accessibile.js` (prove ARIA/BANNER-DICHIARATO/VIBRAZIONE/RIVEDI-TUTORIAL/SOTTOTITOLI/ANELLO-FIATO), `_q-fotosensibile.js` (`--controllo`), attrezzi `_t-aria-etichette/_t-vibrazione-intensita/_t-rivedi-tutorial/_t-sottotitoli/_t-anello-fiato`, voce #112.
