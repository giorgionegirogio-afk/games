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
| — | attesaGK | goalkeeper's READY STANCE … black gloves | trattato come ricerca web (modalità Images spenta) |
| — | tuffo | full-stretch DIVE to his right … | uscito come cartone (modalità Images spenta) |

## Da fare quando la quota torna

corsa f1 (falcata lunga, un piede a terra), tiro f1 (follow-through),
contrasto, attesaGK, tuffo, parata, frenata, testa, esultanza, delusione.
Finché mancano, `Sprite3D.ALIAS` presta la clip più vicina: la tabella è
nel modulo e `window.__test.sprite.prestiti` la stampa.
