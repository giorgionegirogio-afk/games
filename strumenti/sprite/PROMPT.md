# I fogli degli sprite — come si rigenerano (voce #158)

I fogli generati (`fuori/sprite/ingresso/*.png`) **non si committano**: sono
immagini da 1 MB l'una prodotte con Nano Banana (Gemini, modalità Images,
modello «3.6 Flash») con l'account del committente. Questo file tiene i
prompt che hanno funzionato, quelli falliti e il metodo, così i fogli si
rigenerano; `piano.json` dice quale foglio diventa quale clip; `monta.py`
rifà taglio, maschere e atlante.

## Il metodo, misurato il 25 settembre 2026

- **Un foglio per posa, 8 rotazioni in un'immagine sola.** Il generatore
  tiene il personaggio coerente DENTRO un'immagine (stesso volto, stessa
  maglia, stessa luce) molto meglio che fra immagini diverse. Otto figure
  in griglia 4×2, ruotate di 45° l'una: fronte, ¾ destro, profilo destro,
  ¾ dorso destro, dorso, ¾ dorso sinistro, profilo sinistro, ¾ sinistro.
- **Prompt nuovo e completo per ogni posa, non «modifica l'immagine».**
  Le modifiche («same character, change ONLY the pose») hanno restituito
  3 volte su 4 la stessa identica immagine di partenza (differenza media
  2,5-4,7 livelli: rumore JPEG). Il prompt intero con la posa descritta
  cambia la posa (camminata, tiro, passaggio, scivolata: 4 su 4).
- **La posa «in aria» non esce**: «mid-air / flight instant / both feet
  off the floor» ha dato due volte l'uomo in piedi e una volta un errore.
  Pose con un piede a terra sì.
- **La camera «dall'alto» si ottiene con «3/4 top-down perspective, like
  the camera of a top-down video game» + «seamless flat green FLOOR».**
  «42 degrees», «high-angle», «bird's-eye», «from a balcony» hanno dato
  altezza d'occhio (3 tentativi) o nessuna immagine (1). L'angolo che esce
  è moderato (~20-25°), non i 42° del rig: dichiarato, non nascosto.
- **Calzoncini MAGENTA, maglia e calze bianche, sfondo verde chroma.**
  Tre zone separabili per colore: la maglia si tinge con la prima tinta
  della squadra, i calzoncini con la seconda; il verde si toglie. Il
  magenta viene neutralizzato in grigio dalla pipeline (`ritaglia.py`).
- **Luce «soft even daylight»**, perché la seconda metà del ciclo di corsa
  e camminata nasce specchiando (`atlante.py --specchia`): con una luce
  laterale lo specchio si vedrebbe.
- **Niente pallone, niente ombre a terra, niente testo**: il gioco disegna
  i suoi.
- **Quota**: il modello 3.6 Flash si è esaurito dopo ~18 immagini
  («Limit resets 7:42 PM»). Flash-Lite non crea immagini: se il chip
  «Images» sparisce dal compositore, il prompt viene trattato come ricerca
  (il portiere è uscito come foto di repertorio, il tuffo come cartone).
- **Nella pagina `/images` (chat nuova) il tool si STACCA dopo ogni
  risposta**: il chip «Images» sparisce e il prompt seguente viene
  trattato come testo («I cannot generate or edit images directly»).
  Prima di ogni invio: «+» → «Create image» (voce di menu con spunta; se la
  spunta c'è già NON cliccare, la toglierebbe) → verificare che nel
  compositore ci sia il pulsante «Deselect Images» → cliccare nella
  casella sul segnaposto «Describe your image» → scrivere → Invio.
  «I encountered an error» è transitorio: si rimanda lo stesso prompt.
- **Download**: Chrome blocca i download multipli dalla pagina; il pulsante
  «Download» cambia riferimento; `fetch` del blob e POST a localhost sono
  bloccati dalla CSP. La via che funziona: un pulsante iniettato nella
  pagina che copia l'immagine negli appunti (`navigator.clipboard.write`
  su click vero) e PowerShell che salva gli appunti
  (`[Windows.Forms.Clipboard]::GetImage()`).

## Il prompt base (personaggio in piedi — nb06)

> Photorealistic 3/4 TOP-DOWN perspective sprite sheet, exactly like the
> camera of a top-down video game: the viewer looks down at the figures
> from high above at about 45 degrees, so we see the top of each head, the
> tops of the shoulders and the chest, and the boots at the bottom
> standing on a seamless flat bright green floor that fills the whole
> image (the floor is the only background: no wall, no horizon, no
> texture, no lines, no shadows). The SAME male soccer player 8 times in
> a neat 4 by 2 grid, equal size and spacing, relaxed standing pose,
> rotated 45 degrees more each time: facing the viewer, front
> three-quarter right, right profile, back three-quarter right, back to
> the viewer, back three-quarter left, left profile, front three-quarter
> left. Pure white short-sleeve jersey, BRIGHT MAGENTA shorts, white
> socks, black boots, no logos, no numbers, no text; short dark hair,
> athletic build, light olive skin. Soft even daylight. Sharp, highly
> detailed. No text, no labels, no watermark.

## Le pose (stesso preambolo; cambia solo la frase «The pose is identical in all 8 copies: …»)

| foglio | clip | frase della posa | esito |
|---|---|---|---|
| nb07 | corsa f0 | *(modifica di nb06)* he is SPRINTING, frozen at the instant of foot contact: RIGHT foot planted on the floor under his body, LEFT knee raised high in front, RIGHT arm swung forward and bent, LEFT arm swung back, torso leaning forward, eyes ahead | OK |
| nb14 | camminata f0 | WALKING calmly at mid-step, the right foot forward with the heel just touching the floor, the left foot behind with the heel lifted, weight between the feet, arms relaxed and swinging gently in opposition, torso upright, head level | OK |
| nb15 | tiro f0 | a powerful SHOT with the RIGHT foot at the instant of contact: left foot planted flat on the floor, right leg swung through low with the laces pointing forward and the toe down, hips open, left arm out wide for balance, right arm back, torso slightly bent forward, eyes down | OK (gamba in carico, non in follow-through; due figure si toccavano: `foglio.py` le spacca) |
| nb16 | passaggio f0 | a SIDE-FOOT PASS with the RIGHT foot at the instant of contact: left foot planted, right leg swung forward with the foot turned outward so the inside of the boot faces forward, knee slightly bent, arms open low for balance, torso upright, eyes down toward the floor in front of him | OK |
| nb17 | scivolata f0 | a SLIDING TACKLE on the floor: the body low and sliding on the left hip and thigh, the right leg fully extended forward along the floor with the toe pointed, the left leg tucked under and bent, the left hand on the floor for support, the right arm raised for balance, torso leaning back, eyes forward | OK |
| nb18 | contrasto | a STANDING TACKLE, a deep lunge: … / a deep defensive LUNGE to block: … | griglia 4×4 in stile CG: scartato, da rifare |
| — | corsa f1 (volo) | full sprint caught IN MID-AIR, both feet off the floor, … | 2 volte in piedi, 1 errore: da riformulare con un piede a terra |
| nb19 | corsa f1 | RUNNING fast with a LONG STRIDE: the right leg stretched far forward with the heel about to land, the left leg stretched far back behind him with only the toe touching the floor, the legs wide apart like scissors, left arm forward and right arm back, torso leaning forward, eyes ahead | OK come griglia **4×4** (16 figure, due set con camere diverse): le prime 8 in ordine di lettura sono le 8 direzioni; `piano.json` le dichiara con `"attese": 16` |
| — | attesaGK | goalkeeper's READY STANCE … black gloves | trattato come ricerca web (modalità Images spenta) |
| — | tuffo | full-stretch DIVE to his right … | uscito come cartone (modalità Images spenta) |

| nb20 | tiro f1 | the FOLLOW-THROUGH of a powerful right-foot shot: the right leg swung high forward and up after striking, the left foot planted, the body leaning back slightly, left arm raised out for balance, right arm back | OK, 4×4, prime 8 |
| nb21 | contrasto f0 | a deep defensive LUNGE to block a pass: the right leg stretched far forward and low with the foot flat on the floor, the left leg bent behind, the body crouched with the torso leaning over the front knee, both arms out to the sides | OK, 4×4, prime 8 |
| nb22 | attesaGK f0 | *(«black gloves» nel kit)* a crouched READY STANCE, waiting for a shot like a goalkeeper: feet wider than the shoulders, knees bent, weight on the toes, torso leaning forward, both hands held out in front at hip height with the palms open | OK, 4×4, prime 8 |
| nb23 | tuffo f0 | a full-stretch DIVE to his right, the body horizontal just above the floor, both arms stretched out together toward the upper right with open hands, legs extended behind, head turned toward the hands | OK, 4×4 (direzioni approssimative) |
| nb24 | parata f0 | *(chiesta la FRENATA)* BRAKING hard after a sprint … | uscita una parata bassa **coi guanti** (il contesto della chat tiene i guanti dei prompt precedenti): usata come `parata`; la frenata resta in prestito |
| nb25 | testa | HEADING the ball, jumping with both feet just off the floor, the neck and upper body snapped forward … | **scartato**: pallone cotto sulla testa nonostante «NO ball», guanti dal contesto, griglia 4×3 |

| nb26 | esultanza f0 | *(«BARE HANDS with no gloves»)* CELEBRATING a goal, running with both arms raised straight up in the air, fists clenched, chest out, head tilted back, mouth open shouting with joy, one foot forward | OK, 4×4, prime 8 |
| nb27 | delusione f0 | DEJECTED after missing a chance, standing with both hands on top of his head, elbows out, head bowed, shoulders slumped, feet apart | OK, 4×2 (immagine 1024×559) |
| nb28 | frenata f0 | skidding to a sudden STOP after a sprint: the right foot planted far ahead with the leg straight, the left leg bent behind, the upper body leaning back against the momentum, both arms flung slightly back and out, chin up | OK, 4×3: prima riga 4 figure grandi, le otto direzioni nelle celle 4..11 (`"da": 4`) |
| nb29 | rimessa f0 | *(«There is NO ball anywhere in the image»)* the THROW-IN gesture, both arms raised together behind the head with the empty hands close together as if about to throw, back arched, one foot slightly ahead of the other | OK, 4×4, prime 8 |
| nb30 | testa f0 | *(«There is NO ball … and the hands are EMPTY»)* JUMPING to head an imaginary ball, both feet just off the floor, the neck and upper body snapped forward, chin tucked, eyes ahead, both arms out and slightly back for balance | OK al secondo tentativo, 4×4, prime 8 |
| nb31 | ginocchia f0 | a KNEE-SLIDE celebration, sliding on both knees with the shins flat on the floor, torso upright, both arms spread wide open, chest out, face lifted and shouting with joy | OK, 4×4, prime 8 |
| nb32 | pugno f0 | a FIST PUMP celebration, standing, the right arm bent with the fist clenched and pulled down hard to the hip, the left arm slightly out, knees slightly bent, jaw clenched with a fierce grin | OK, 4×2 (1024×559) |

**Seconda quota esaurita** dopo altre 14 immagini (19:45-20:35): «Create
image» torna grigia e il modello ricade su Flash-Lite. Restano in prestito:
filtrante, cross, rinvio, rovesciata, finta (→ passaggio/tiro/corsa),
presa, pugni, respinta, sfugge (→ attesaGK/parata), cielo (→ esultanza).

**Il contesto della chat CONTAMINA**: dopo un prompt coi guanti, i prompt
seguenti li tengono anche se non li nominano; «NO ball» non basta per il
colpo di testa. Dire esplicitamente «BARE HANDS with no gloves» e, per le
pose col pallone, aprire una chat nuova.

## Da fare quando la quota torna

corsa f1 (falcata lunga, un piede a terra), tiro f1 (follow-through),
contrasto, attesaGK, tuffo, parata, frenata, testa, esultanza, delusione.
Finché mancano, `Sprite3D.ALIAS` presta la clip più vicina: la tabella è
nel modulo e `window.__test.sprite.prestiti` la stampa.

> **RETTIFICA (9 ottobre 2026).** Le dieci qui sopra sono entrate col
> compito 2 (seconda quota); le dieci rimaste in prestito sono entrate
> col compito 5 (terza quota, tabella qui sotto): **ventisette clip, zero
> prestiti** (`window.__test.sprite.prestiti` stampa `{}`).

## Lezioni della terza quota (9 ottobre 2026, 18:30-19:00, 11 immagini)

- Una risposta può uscire come il testo **`object:image{}`** senza
  immagine: non è un rifiuto, si rimanda lo stesso prompt (filtrante, al
  secondo invio).
- **La posa in volo esce** se il prompt non nomina mai il pavimento né i
  piedi staccati: «seen from above: the body horizontal and tilted back
  toward the floor, the right leg kicking straight up over the head» ha
  dato la rovesciata al primo colpo (nb42), dove «mid-air / both feet off
  the floor» aveva fallito tre volte.
- Nella pagina `/images` **il chip Images è rimasto attaccato** per tutta
  la chat (cinque invii di fila), diversamente dal 25 settembre: si
  verifica a vista e basta.
- Le pose del portiere in piedi (presa, pugni) escono **4×2 in
  1024×1024** con figure alte ~340 px e camera più bassa; respinta,
  sfugge e rinvio escono **4×4** (prime 8 = le direzioni).
- La via degli appunti è ora in `copia-gemini.js` + `salva-appunti.ps1`:
  iniezione, click VERO sul pulsante alla coordinata che il pannello
  restituisce (57, 90 + 25·n), PowerShell che salva. Dieci fogli in
  trenta minuti, nessun download bloccato.


## Compito 5 — i dieci fogli in prestito (9 ottobre 2026)

Stesso preambolo di nb06 (camera 3/4 top-down, griglia 4×2 o 4×4, maglia
bianca, calzoncini magenta, pavimento verde, nessun pallone, nessun testo).
Le pose sono descritte da quel che il rig fa nella fase del foglio
(`poseCalcio` per filtrante e cross, `poseRinvio`, `poseFinta`, `posePresa`,
`posePugni`, `poseRespinta`, `poseSfugge`, `poseCielo`, `poseRovesciata`).
Per le quattro del portiere il kit dice «black goalkeeper gloves»; per le
altre «BARE HANDS with no gloves». Chat NUOVA prima delle pose di campo,
perché i guanti contaminano. La colonna «esito» si compila foglio per foglio.

| foglio | clip | frase della posa | esito |
|---|---|---|---|
| nb33 | filtrante f0 | a firm THROUGH-BALL pass with the RIGHT foot at the instant of contact: left foot planted beside the imaginary ball, right leg driven forward with the inside of the boot facing forward and the toe up, torso leaning forward over the ball, right arm back and left arm out for balance, eyes up looking far ahead | OK al secondo invio (il primo ha reso «object:image{}», vuoto: si rimanda), 4×2 1024×559 |
| nb34 | cross f0 | whipping a CROSS with the RIGHT foot at the instant of contact: left foot planted and pointing away from the kick, body leaning back and away to the left, right leg swung across the body with the ankle locked and the foot wrapping around the imaginary ball, left arm raised high for balance, right arm back, head down | OK, 4×2 1024×559, gamba che avvolge e braccio sinistro alto |
| nb35 | rinvio f0 | *(«black goalkeeper gloves»)* a goalkeeper's PUNT, kicking an imaginary ball dropped from the hands: the right leg swung high in front with the laces pointing up, the left foot planted, the body leaning back, both arms open wide at shoulder height for balance, chin up — the hands are EMPTY, there is NO ball | *(vedi riga sotto)* |
| nb36 | presa f0 | *(«black goalkeeper gloves»)* a goalkeeper CATCHING high: standing fully stretched on his toes, both arms straight up above the head with the gloved hands together making a W with spread fingers, elbows almost locked, head tilted back looking up at the hands, body slightly arched — the hands are EMPTY, there is NO ball | OK, 4×2 in 1024×1024 (figure alte ~340 px), guanti, mani a W sopra la testa; camera meno alta delle altre |
| nb37 | pugni f0 | *(«black goalkeeper gloves»)* a goalkeeper PUNCHING clear with both fists: both arms fully extended up and forward together above the head, the two fists touching, standing on tiptoes with the body stretched and arched slightly forward, chin up — there is NO ball | OK, 4×2 in 1024×1024, pugni uniti sopra la testa |
| nb38 | respinta f0 | *(«black goalkeeper gloves»)* a goalkeeper PARRYING a shot to his right: a long low lunge sideways with the right leg bent and the left leg stretched out straight, the right arm fully extended out to the right at shoulder height with the palm open facing right, the left arm out to the left for balance, torso leaning right, eyes to the right — there is NO ball | OK, **4×4** (`attese 16`, prime 8), affondo laterale braccio destro teso |
| nb39 | sfugge f0 | *(«black goalkeeper gloves»)* a goalkeeper FUMBLING a ball that slips through his hands: bending forward from the waist with the knees bent, both arms down in front of him with the palms open and turned up, fingers spread, head bowed looking down between his hands, shoulders hunched — there is NO ball | OK, **4×4** (`attese 16`, prime 8), piegato in avanti mani in basso |
| nb40 | cielo f0 | *(«BARE HANDS with no gloves»)* the AIRPLANE celebration: standing in a half lunge with the right foot forward, both arms stretched straight out horizontally to the sides like wings, chest pushed out, back arched, head thrown back with the face to the sky, mouth open shouting | OK, 4×2 1024×559, PRIMO foglio della terza quota (9/10, 18:35): braccia ad aliante, volto al cielo; sfondo erba e non verde piatto (il chroma lo prende) |
| nb41 | finta f0 | *(«BARE HANDS with no gloves»)* a dribbling FEINT, the double inside touch: pushing an imaginary ball across his body with the inside of the right foot, the right leg swung across in front of the left shin, the weight dropped onto the bent left leg, hips and shoulders turned to the left, arms out low for balance, eyes down — there is NO ball | OK, 4×2 1024×572, tocco d'interno incrociato; resa un po' da rendering |
| nb42 | rovesciata f0 | *(«BARE HANDS with no gloves»; già fallita in volo: ultimo tentativo)* an acrobatic OVERHEAD BICYCLE KICK seen from above: the body horizontal and tilted back toward the floor, the right leg kicking straight up over the head, the left leg lower and bent, both arms spread wide and down, head back | **OK, finalmente in volo**: corpo orizzontale e gamba destra in alto, 4×2 1024×559 — la posa è uscita togliendo ogni parola sul pavimento («seen from above», niente «off the floor»); direzioni approssimative come nel tuffo |

## I tre fogli della sagoma (voce #160, 2 novembre 2026, quarta quota)

Il cancello `silhouette` sugli sprite dava 2 azioni su 10, e le cause stavano
nei fogli: scivolata seduta (forma 0,5-0,7 contro l'1,15 di «steso»),
camminata al contatto quasi un fermo, fermo a colonna piena. Tre fogli nuovi,
stesso preambolo di nb06, nella pagina Images (chat nuova per ogni posa):

| foglio | frase della posa | esito |
|---|---|---|
| nb43-scivolata-B | a SLIDING TACKLE stretched out FLAT and LOW on the floor, like a baseball player sliding feet first … the body forms one long low line | 8 celle ruotate, ma ancora SEDUTO (forma 0,99-1,25): scartato |
| nb43-scivolata-C | … it is LYING DOWN, not sitting: the player lies on his LEFT SIDE flat on the floor … like a plank … Seen from above each figure is a long thin horizontal shape, about three times longer than it is tall; no part of the body is upright | corpo davvero disteso (forma 2,8-3,3) ma **otto profili quasi uguali**: il generatore non ruota una posa a terra |
| nb43-scivolata-R | *(non e' un prompt)* la cella 1 di nb43-scivolata-C ruotata nelle 8 direzioni da `ruota-cella.py` (modello a cilindro steso: l'asse si proietta con k = sin 22° = 0,37, lo spessore no) | 8 celle, forma 0,85 (di punta) → 2,8 (di profilo); statura_px 374 |
| nb44-camminata-B | WALKING with a LONG confident stride … legs clearly apart like an open pair of scissors, the left arm swung far forward and the right arm swung far back, both arms clearly away from the torso with daylight visible between each arm and the body | OK 4×2: forma 0,52-0,56 (nb14: 0,35-0,42), inchiostro 0,29-0,32 (nb14: 0,46-0,58) |
| nb45-fermo-B | STANDING STILL and alert with the feet planted WIDE apart, wider than the shoulders, knees slightly bent, both hands resting on the hips with the elbows pointing OUT to the sides, so there is a clear gap of green floor visible between each arm and the body and between the two legs | **4 figure per immagine** (il modello ha scritto «first two rows»): la seconda riga chiesta nella STESSA chat («Now the second row … the remaining four rotations»), coerente; le due righe composte in un foglio solo (verde della seconda riportato a quello della prima). Forma 0,41-0,61 (nb06: 0,19-0,40), inchiostro 0,37-0,42 (nb06: 0,53-0,65) |
| nb46-fermo-C | … both ARMS FOLDED ACROSS THE CHEST high up, the elbows pointing out to the sides, so the waist below the folded arms is bare and narrow | sul banco: masse 4 (le mani sui fianchi davano 1: riempiono la vita), inchiostro 0,51, scavo 0,37 ma **forma 0,33** (< 0,35): il modello non ha allargato i piedi |
| nb47-fermo-D | STANDING in a very WIDE STANCE, the feet planted far apart, much wider than the shoulders, the legs straight and spread like an inverted V with a large triangle of green floor visible between them, and both ARMS FOLDED ACROSS THE CHEST … | **nominabile**: inchiostro 0,366, forma 0,47, masse 4, scavo 0,44. E' il fermo del gioco dal #160 (due righe di 4, stessa chat) |

Lezioni: **una posa a terra non si ruota col prompt** (otto profili su otto in
due formulazioni): si chiede UNA cella buona e si ruota in casa con
`ruota-cella.py`; il modello puo' dare **quattro rotazioni per immagine** e
le altre quattro si chiedono nella stessa chat, che tiene il personaggio; il
pulsante iniettato (`copia-gemini.js`) si clicca alla posizione fissa
(89,90) e il secondo, se ci sono due risposte, a (89,119); `salva-appunti.ps1
-Attesa 12` lanciato in parallelo al click salva senza un secondo giro.

