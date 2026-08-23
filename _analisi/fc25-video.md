# FC 25 dai DUE VIDEO DEL COMMITTENTE — il divario, misurato

23 agosto 2026. Fonti: `videoplayback.mp4` (7 ore e 1 minuto di partite,
640x360, 30 fps) e `videoplaybackcontroller.mp4` (11 minuti e 39, il
video sui comandi col pad in sovrimpressione). Campionatura: 48
fotogrammi uniformi dal primo (uno ogni 8'45"), 12 dal secondo, salvati
in `fuori/fc25/`; piu' le misure dirette scritte sotto, ognuna col suo
comando. Questo documento sostituisce le citazioni di seconda mano su
FC 25 usate nei giorni scorsi: da qui in poi i numeri vengono da QUESTI
video.

---

## 1. IL MANTO — il divario piu' grande, in due numeri

Colore medio del prato in zona di gioco (ffmpeg, crop centrale,
scale=1:1), sei fotogrammi di partita FC 25 contro i due scatti dal
nostro telefono (build 1390941):

    FC 25   (92,142,67) (55,126,60) (72,118,49) (115,151,80) (86,131,63) (82,133,39)
            -> media (84, 134, 60) · luminanza ~118/255 · dominante verde (G - max(R,B)) ~ +50

    NOSTRO  (69,95,63) e (52,72,51)
            -> media (60, 84, 57)  · luminanza ~77/255  · dominante verde ~ +27

**Il nostro manto e' un terzo piu' scuro e ha meta' della dominante
verde.** FC 25 legge come erba da trasmissione televisiva — anche nelle
partite in notturna il prato e' LUMINOSO, perche' i riflettori veri
rendono il manto vivido, non spento. La nostra «sera» (Tema 1) ha
abbassato il prato insieme al cielo: la sera giusta e' quella dei
riflettori — bordi e cielo scuri, manto acceso.
Si somma al censimento §4 (manto ingrandito 1,8-2,1x a filtro spento):
i due difetti si vedono INSIEME, come «erba sfocata e paludosa».

## 2. LA SCALA — le nostre figure sono 3 volte piu' grandi

FC 25 in gioco (g12, g16, g20, g32, g40): figure alte 28-35 px su 360 =
**8-10% dell'altezza dello schermo**; si vede piu' di meta' campo in
larghezza; il quadro e' la TATTICA. Le nostre: 94-111 px su 384 =
**25-29%** — tre volte tanto; il quadro e' il DUELLO.
Su un telefono la scelta nostra ha una ragione (dita e leggibilita': la
giuria ha gia' bocciato le figure piccole), ma il divario di colpo
d'occhio viene anche da qui. La strada non e' copiare la camera FC:
e' la FORBICE — stringere nel duello come oggi, ma ALLARGARE in
costruzione, cosi' il campo esiste anche da noi.

## 3. LA REGIA — 2,6 stacchi al minuto, misurati qui

Rivelatore di scena ffmpeg (soglia 0,35) su 10 minuti (t=6000-6600):
**26 stacchi = 2,6/min**. Conferma e supera il 2,16/min citato nei
giorni scorsi. La lingua degli stacchi, dai fotogrammi:
  · inquadratura da stadio all'ingresso (g08);
  · primo piano col cartellino statistiche dopo l'occasione (g28:
    volto, «TOTAL ATTEMPTS 5 · GOALS 1»);
  · replay da DIETRO LA RETE dopo il gol (g24: rete in primo piano);
  · replay basso dietro l'azione per i dribbling (g04, g36);
  · scenetta del calcio d'angolo: l'uomo posa il pallone alla
    bandierina, camera a terra (g44).
Regola gia' nostra e confermata dal video: gli stacchi vivono SOLO nel
gioco fermo (gol, angolo, fallo, ingresso) — mai durante l'azione viva.
Da noi: zero stacchi; due camere esistono, una si usa; la moviola ha
un'inquadratura sola. (`_t-regia.js`/`_q-regia.js` esistono, MAI
verificati.)

## 4. L'HUD — il loro e' un sussurro, il nostro una targa

FC 25 in partita: pillola punteggio PICCOLA in alto a SINISTRA
(~15% della larghezza), radar traslucido in basso al CENTRO, due
targhette nome ai piedi dello schermo nei colori delle squadre. Tutto
il resto e' campo.
Nostro: tabellone in alto al CENTRO largo ~37% del lato, radar in basso
a sinistra, quattro dischi comando a destra (necessari: siamo touch).
Il tabellone e' il candidato: piu' piccolo e spostato, il campo respira.

## 5. LE FIGURE E LA FOLLA — dove non si insegue

Modelli 3D con volto, capelli, maglie stirate dal vento, tatuaggi
(g28, g44); folla densa e animata con striscioni (g36); pannelli
pubblicitari luminosi animati. A 6-9 px di larghezza la nostra figura
non puo' competere sul dettaglio — il provino cieco l'ha gia' detto
tre volte («a quella taglia non c'e' spazio per un volume insieme
visibile e pulito»). La nostra strada resta la LEGGIBILITA' stilizzata
+ l'ombra a terra. Quello che SI puo' prendere: la folla piu' densa nei
momenti caldi, i pannelli bordocampo vivi, le bandiere.

## 6. I COMANDI — il video del controller, catalogato

Il secondo video mostra il pad DualSense in sovrimpressione e insegna
le ricette a schermo (es. g06: «DRIVEN LOB PASS — R1+L1+[] / RB+LB+X»).
Il vocabolario FC: passaggio, filtrante (anche alto), lob/cross (tre
pesi), tiro (normale/finesse/chip), scatto, protezione palla, finte
(levetta destra), contrasto, scivolata, pressing di squadra, cambio
uomo. La nostra copertura dopo L1.6: passaggio, filtrante, cross con
destinatario, tiro mirato con rampa, pizzata, pallonetto, scatto,
contrasto in piedi, contenimento, scivolata mirata e secca, cambio
direzionale, raddoppio, pressa, chiamata. Mancano per scelta dichiarata
(agente28 §8): finte con la levetta destra (28:1 di rapporto segnale),
accordi a due dita, portiere comandato. Manca senza scelta: il colpo
di testa (voce 7 del censimento).

---

## LE CONSEGUENZE — ordine dei lavori che discende da QUESTI numeri

1. **Il manto luminoso** (divario n.1): alzare luminanza e dominante
   del prato in partita verso (84,134,60) SENZA perdere la sera ai
   bordi. ATTENZIONE: i cancelli del contrasto divise/erba (collaudo)
   misurano contro il prato di oggi — vanno riletti dopo, e una divisa
   chiara puo' scendere sotto il 3:1 su prato chiaro. Insieme: il
   filtro del manto (censimento §4).
2. **La regia** (2,6/min contro 0): verificare i tre stub esistenti
   e portare dentro angolo+replay dietro la rete+cartellino statistiche,
   solo a gioco fermo.
3. **La forbice della camera** in costruzione (divario n.2).
4. **Il tabellone a pillola** (divario n.4).
5. La folla densa + pannelli vivi (n.5), il colpo di testa (gia' in
   coda come voce 7).
