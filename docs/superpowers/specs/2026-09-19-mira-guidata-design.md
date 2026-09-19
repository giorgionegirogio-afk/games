# La mira guidata a due pesi (voce #113, seguito §9.2 del mandato)

19 settembre 2026. Feature di accessibilita' motoria, scelta del committente dopo
#114. La ricognizione ha chiarito un punto cruciale: **"mira guidata a due pesi"
non e' nel mandato grezzo** (che al §9.2 parla di "assist levels Beginner/Standard/
Pro" e "shot-aim assistance") — e' un conio della mappa di lavoro (`_analisi/
MAPPA-MANDATO.md` righe 398-401). Fra tre interpretazioni possibili (A: scope del
controllo post-passaggio; B: vero aiuto geometrico alla precisione; C: ibrido), il
committente ha scelto **(A)**, l'interpretazione della mappa: la piu' snella e a
rischio piu' basso, che NON riapre il codice geometrico tarato di #88.

## Che cos'e' (interpretazione A, fissata dal committente)
Il meccanismo `switchControlled` (CALCETTO-il-gioco.html:17488-17561) esiste dalla
voce #88 ed e' SEMPRE attivo: dopo che un passaggio/cross umano ha un destinatario
dichiarato (`b.passTo`/`b.crossTo`), il controllo del pollice salta a quel
destinatario invece che al compagno piu' vicino alla palla (:17535-17540:
`dest = crossTo>=0 ? crossTo : passTo`). "Due pesi" = due AMPIEZZE DI SCOPE di
questo salto (NON un aiuto alla direzione/precisione del tiro):
- **peso "pieno"** = comportamento di OGGI: il controllo salta al destinatario per
  QUALSIASI passaggio/cross con destinatario dichiarato.
- **peso "essenziale"** = ristretto ai soli **cross/palloni alti** (`b.crossTo`),
  escludendo i **passaggi corti a terra** (`b.passTo`): chi ha difficolta' motorie
  non subisce il salto di controllo sui passaggi brevi (il "fastidio" che il progetto
  #88 §4.2 aveva gia' previsto come possibile ripiego).
NON c'e' uno stato "OFF": il salto e' sempre esistito, questo cantiere lo rende
configurabile in AMPIEZZA, non commutabile.

## Perche' (a) e' a basso rischio e (b) e' quasi gratis sul determinismo
- **Non tocca la geometria** (cono della filtrante, errore angolare del tiro): quel
  codice di #88 (L1.4, 297 tiri misurati) resta INTATTO. Il cantiere tocca solo la
  scelta di CHI controlli dopo che la palla e' partita.
- **`switchControlled` salta gia' le squadre CPU** (:17491, `if(G.ctrl[t]<0)
  continue`): la mira guidata e' strutturalmente scoped all'input UMANO, senza
  bisogno di una guardia nuova. Percio' il due-versioni CPU-CPU (`_c3-sorteggi`) e'
  **0/60 PER COSTRUZIONE** a entrambi i pesi (il ramo nuovo non gira mai in CPU-CPU)
  — piu' pulito del canale MIND, che invece divergeva.
- **Default "pieno" = comportamento di oggi**: un salvataggio vecchio (senza il
  campo) rigioca bit-identico. Se l'implementazione del ramo "pieno" resta
  ESATTAMENTE la logica di oggi, **non serve incrementare MOTORE_V** (da VERIFICARE
  a banco: nastro vecchio rigiocato con "pieno" deve dare esito identico; se
  differisse anche di un carattere, MOTORE_V va incrementato).

## Il design (dalla proposta A della ricognizione)
1. **`SAVE.miraGuidata` in {'pieno','essenziale'}**, default **'pieno'**. Additivo e
   sanificato in `loadSave` con la whitelist, esattamente come `SAVE.sponde`
   (:9985) / `vibInt` (:9973) / `sott` (:9980). Default 'pieno' preserva i
   salvataggi vecchi bit-per-bit. NON "off" (non esiste uno stato off coerente).
2. **Letto UNA VOLTA in `startMatch`** e fissato su `G.miraGuidata`
   (`opts.miraGuidata ?? SAVE.miraGuidata`), come `G.campoVero` da `opts.sponde`
   (:10949) — mai riletto da SAVE a partita in corso.
3. **Il ramo in `switchControlled`** (:17537): quando `G.miraGuidata==='essenziale'`,
   il calcolo di `dest` ignora `b.passTo` e considera solo `b.crossTo` (se non c'e'
   un cross dichiarato, nessun salto: il controllo resta al compagno piu' vicino,
   come senza destinatario). Quando 'pieno', il codice e' CARATTERE PER CARATTERE
   quello di oggi (il ramo nuovo e' un `if(essenziale && ...)` che non altera il
   percorso 'pieno').
4. **Le sfide forzano 'pieno'**: `Sfida.gioca` (:42804) e `Sfida.guarda` (:42984)
   passano `miraGuidata:'pieno'` negli `opts`, ignorando il SAVE locale di entrambi
   i telefoni — esattamente come gia' fanno con `sponde:'gabbia'` e `SFIDA_DIFF`.
   Determinismo del nastro GRATIS, nessun cambio al formato del nastro, nessun
   MOTORE_V. LIMITE dichiarato: la mira guidata NON vale nelle sfide online (v1),
   parallelo al seguito #105 (sponde nel nastro) — a registro.
5. **La UI**: una riga in IMPOSTAZIONI a DUE bottoni (pattern `SAVE.vibInt`/`sponde`),
   con `aria-pressed` sincronizzato (accessibilita', lezione #112). Un sottotitolo
   onesto che spiega cosa fa (il controllo salta solo sui palloni alti, non sui
   passaggi corti).

## Il banco che verifica (nato rosso)
`strumenti/_q-mira.js` (o esteso su un banco esistente che gia' simula l'input
umano — la ricognizione indica `_q-volo.js` prova C come il banco che misuro'
`switchControlled` all'origine). Prove:
- **SCOPE**: con un input umano simulato, col peso 'essenziale' un CROSS/pallone
  alto fa ancora saltare il controllo al destinatario, mentre un PASSAGGIO CORTO no
  (il controllo resta al compagno piu' vicino). Col peso 'pieno', entrambi saltano.
  Nasce ROSSA sul gioco di prima (dove il campo non esiste / il salto e' sempre pieno).
- **PIENO-IDENTICO** (la prova che protegge MOTORE_V): col peso 'pieno', il
  comportamento e' identico al gioco pre-cantiere (nastro/scena rigiocata → stesso
  esito). Se diverge, MOTORE_V va incrementato: si dichiara.
- **CPU-CIECA**: `_c3-sorteggi` CPU-CPU 0/60 a entrambi i pesi (il ramo non gira in
  CPU-CPU) — la firma del basso rischio.
- **SFIDA-DETERMINISTICA**: una sfida registrata con un peso e "vista" con l'altro
  (localmente forzato a 'pieno') NON diverge (perche' il peso locale e' ignorato) —
  `_q-replay` prova B a peso fissato resta verde.
- **INPUT-SACRO NON VALE QUI** (a differenza del MIND): la mira guidata CAMBIA per
  costruzione cosa produce lo stesso comando quando il peso non e' il default; il
  gate corretto e' "stesso nastro + stesso seme + stesso peso => stessa partita", non
  "pesi diversi => stessa partita".

## Le tre cure
1. **Il meccanismo**: SAVE.miraGuidata (additivo/sanificato), la lettura una-volta in
   startMatch, il ramo in switchControlled, le sfide forzate a 'pieno'. Tocchi al
   gioco via attrezzo a ancore. Banco `_q-mira` nato rosso con SCOPE + PIENO-IDENTICO
   + CPU-CIECA. Verifica MOTORE_V (non serve se 'pieno' e' identico).
2. **La UI**: riga IMPOSTAZIONI a due bottoni + aria-pressed + sottotitolo onesto;
   la prova di rendering (getComputedStyle, come VIBRAZIONE-STILE del #112) e la
   prova aria-pressed. Due-versioni 0/60 (UI pura), istantanea non regredita.
3. **Giocabilita', batteria, verbale**: misura che 'essenziale' risolve il fastidio
   sui passaggi corti senza crearne uno nuovo (il banco che misuro' switchControlled,
   prova C di _q-volo, prima/dopo); SFIDA-DETERMINISTICA; batteria; verbale in MANUALE
   (voce #113) con la scelta (A) dichiarata, il limite sfide-online, l'esito MOTORE_V.

## Fuori perimetro (dichiarato)
Le interpretazioni (B) aiuto geometrico e (C) ibrido (scartate dal committente): la
geometria di #88 (cono filtrante, errore angolare del tiro) NON si tocca. I tre
profili Beginner/Standard/Pro del mandato grezzo con auto-switch/auto-sprint/scudo
(riscrittura enorme, esplicitamente evitata dalla mappa). La mira guidata nelle
sfide online (forzata a 'pieno' — seguito parallelo a #105). Nessun cambio al
formato del nastro ne', se 'pieno' resta identico, a MOTORE_V.
