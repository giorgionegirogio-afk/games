# La mira guidata a due pesi — piano (voce #113)

Progetto: `docs/superpowers/specs/2026-09-19-mira-guidata-design.md`.
Base: `main` = `d3169d3`. Ramo: `voce-113-mira-guidata`. Interpretazione (A) scelta
dal committente: due pesi sullo SCOPE di `switchControlled`, non sulla geometria.
Tre compiti, un commit per compito, revisione finale + fusione.

## Vincoli globali
1. **Non si tocca la geometria di #88** (cono filtrante `scegliFiltrante`, errore
   angolare del tiro `fireShot`/`fireShotMirato`). Il cantiere tocca SOLO
   `switchControlled` (chi controlli dopo il passaggio), SAVE, la UI, le sfide.
2. **Il ramo 'pieno' e' CARATTERE PER CARATTERE il comportamento di oggi**: il ramo
   nuovo e' `if(G.miraGuidata==='essenziale' && ...)`, il percorso 'pieno' invariato.
3. **Determinismo**: default 'pieno' preserva i salvataggi vecchi. `_c3-sorteggi`
   CPU-CPU 0/60 a entrambi i pesi PER COSTRUZIONE (switchControlled salta la CPU:
   il ramo non gira mai in CPU-CPU). `_q-determinismo` intatto. MOTORE_V NON si
   incrementa SE il ramo 'pieno' e' identico (da VERIFICARE a banco: se il nastro
   vecchio rigiocato con 'pieno' differisce, MOTORE_V va incrementato — si dichiara).
4. **Le sfide forzano 'pieno'** (come `sponde:'gabbia'`): determinismo del nastro
   gratis, nessun cambio al formato. Limite dichiarato: niente mira guidata nelle
   sfide online (v1).
5. **Solo input umano**: gia' gratis (switchControlled salta la CPU). Non aggiungere
   modulazione altrove.
6. Ogni tocco al gioco via attrezzo a ancore (`--out` poi `--dentro`); banco nato
   rosso; SAVE additivo/sanificato. Commenti senza accentate; un commit per compito;
   verbale in MANUALE (voce #113).

## Ancore (riverificare col grep)
- `switchControlled` :17488-17561 (guardia CPU :17491, `dest` :17535-17540).
- `defaultSave()` ~:9837 (`sponde:'gabbia'`), `loadSave()` ~:9945 (whitelist sponde
  :9985, vibInt :9973, sott :9980).
- `startMatch` ~:10924 (fissa `G.campoVero` da `opts.sponde` :10949).
- `Sfida.gioca` ~:42804, `Sfida.guarda` ~:42984 (forzano `sponde:'gabbia'`,
  `SFIDA_DIFF`).
- La UI IMPOSTAZIONI: il pattern a bottoni di `vibInt`/`sponde` (grep i loro id e
  `refreshImpostUI`); `MOTORE_V` ~:13101.
- `_q-volo.js` (prova C, misuro' switchControlled all'origine); `_q-replay.js`
  (prova B); `_c3-sorteggi.js`; `_q-determinismo.js`.

## Compito 1 — Il meccanismo (il cuore)
**Obiettivo.** (a) `SAVE.miraGuidata in {'pieno','essenziale'}`, default 'pieno',
additivo in `defaultSave`, sanificato con whitelist in `loadSave` (modello sponde).
(b) `startMatch` fissa `G.miraGuidata = opts.miraGuidata ?? SAVE.miraGuidata`, una
volta, mai riletto. (c) In `switchControlled`, quando 'essenziale', `dest` considera
solo `b.crossTo` (ignora `b.passTo`); 'pieno' invariato. (d) `Sfida.gioca`/`guarda`
forzano `miraGuidata:'pieno'` negli opts (accanto a `sponde:'gabbia'`). Tutto via
attrezzo `_t-mira-guidata.js`.
**Banco.** `strumenti/_q-mira.js` (calco `_q-volo.js`/`_q-battute.js`): SCOPE (input
umano simulato: 'essenziale' → cross salta, passaggio corto no; 'pieno' → entrambi
saltano), NATA ROSSA sul gioco pre-cantiere (`git show d3169d3:...`); PIENO-IDENTICO
(peso 'pieno' = pre-cantiere, scena/nastro rigiocato identico → protegge MOTORE_V);
CPU-CIECA (`_c3-sorteggi` CPU-CPU 0/60 a entrambi i pesi). Come si simula l'input
umano nel banco: guarda come `_q-volo.js` guida un passaggio/cross umano (imposta
G.ctrl, inietta un comando) — riusa quel telaio.
**Cancelli.** SCOPE rosso→verde; PIENO-IDENTICO verde (dichiara l'esito MOTORE_V);
`_c3-sorteggi` CPU-CPU 0/60 (contro `d3169d3`); `_q-determinismo` intatto;
`_q-replay` prova B verde a peso fissato; `_q-battute`/`_q-regole` non regredite
(hai toccato startMatch/switchControlled). Attrezzo a specchio. Un commit.
**Definizione di fatto.** Il meccanismo a due pesi, 'pieno' identico (MOTORE_V
deciso coi numeri), 'essenziale' cambia lo scope per il solo umano, sfide forzate,
banco nato rosso verde.

## Compito 2 — La UI
**Obiettivo.** Riga in IMPOSTAZIONI a due bottoni ('pieno'/'essenziale') sul pattern
`vibInt`/`sponde`, con `aria-pressed` sincronizzato in `refreshImpostUI` (lezione
#112) e un sottotitolo ONESTO ("il controllo salta al ricevente solo sui palloni
alti, non sui passaggi corti" per 'essenziale'). Via attrezzo.
**Cancelli.** Prova di rendering (getComputedStyle: i due bottoni e lo stato .sel
visibili, come VIBRAZIONE-STILE del #112) + prova aria-pressed (sincronizzato con lo
stato), nate rosse. Due-versioni 0/60 (UI pura, nessun sorteggio). `istantanea` non
regredita. Attrezzo a specchio. Un commit.
**Definizione di fatto.** La UI a due pesi visibile e accessibile, il flag persiste,
due-versioni 0/60.

## Compito 3 — Giocabilita', batteria, verbale
**Obiettivo.** Misura che 'essenziale' risolve il fastidio sui passaggi corti senza
crearne uno nuovo: il banco che misuro' `switchControlled` (`_q-volo` prova C, o una
sonda dedicata) prima/dopo, a entrambi i pesi. SFIDA-DETERMINISTICA (una sfida
registrata con un peso e vista con l'altro forzato a 'pieno' non diverge). Batteria
intera (`tutti.js`, con `_q-mira` registrato conta:true). Verbale in MANUALE (voce
#113): la scelta (A) dichiarata (e perche' NON (B)/(C)), il limite sfide-online
(parallelo #105), l'esito MOTORE_V (incrementato o no, coi numeri), la
CPU-cecita' come firma del basso rischio. PUNTO aggiornato.
**Cancelli.** Batteria verde (audio.js/istantanea pre-esistenti dichiarati);
giocabilita' misurata; verbale coi numeri veri. Un commit.

## Chiusura
Revisione finale del ramo (modello capace): il ramo 'pieno' e' identico (MOTORE_V
giusto), 'essenziale' cambia lo scope solo per l'umano, le sfide forzano 'pieno', il
banco condanna, le fonti/limiti dichiarati. Se «Ready to merge: YES»: fast-forward,
smoke, push, ramo eliminato, ledger aggiornato. Chiude la coppia #114+#113 di
accessibilita' scelta dal committente.
