# Il banco fotosensibile ancorato a WCAG (voce #114, seguito del #112)

19 settembre 2026. Il banco `strumenti/_q-fotosensibile.js` (nato col #112) verde
se nessun lampo supera ~3 Hz, ma con una soglia `PROMINENZA_MIN=1,5` TARATA sul
gioco odierno e una "cecita' sotto soglia" dichiarata in chiaro: garantiva
"nessuno strobo FORTE oltre 3 Hz", non "fotosensibile-safe" in senso clinico
(MANUALE.md:781-797, dove il seguito #114 e' nominato). Questo cantiere sostituisce
la taratura con le soglie CLINICHE di WCAG, cosi' che il verde sia una garanzia
VERA e non tarata sul gioco di oggi.

## La scoperta preliminare (misurata, con riserva)
La ricognizione del 19/9 NON ha trovato evidenza che il gioco violi WCAG:
- **Area**: folla (quadratini ~9-15 px, 2-3 per fotogramma) e duello (punti ~10-15
  px, 3-4 per fotogramma) coprono <2% del canvas (915x412) — categoricamente sotto
  qualunque soglia d'area. Il lampo del gol e' a schermo intero (qualifica per
  area) MA...
- **Tempo**: la festa del gol dura ~1,25-2,25 s (riga 39618) e BLOCCA una nuova
  festa finche' il gioco non torna in `play` — tetto STRUTTURALE di <1 lampo a
  schermo intero al secondo, sotto i 3 Hz, indipendente da qualunque metrica.
Riserva dichiarata: la misura preliminare e' una media whole-canvas (proxy grezzo).
Il banco riscritto, con il criterio d'area vero, sara' la verifica autorevole —
questo cantiere e' quasi tutto BANCO, non un bugfix di gioco. Se pero' il banco
corretto scoprisse una violazione vera, ci si ferma e si riferisce (diventa un
cantiere di gioco).

## Le soglie cliniche (con fonte e data — per il verbale "studi a edizioni")
- **WCAG 2.3.1 "Three Flashes or Below Threshold" (Livello A)**, W3C Recommendation
  WCAG 2.2, 5 ottobre 2023 (invariata da WCAG 2.0, 11 dic 2008). Passa se: non piu'
  di **3 flash generali E/O 3 red flash in QUALUNQUE finestra di 1 secondo**, OPPURE
  l'area dei flash concorrenti resta sotto la soglia d'area.
  Fonte: https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html
- **General flash threshold**: un flash e' una **coppia di transizioni opposte**
  (su-giu' e giu'-su) nella LUMINANZA RELATIVA di almeno il **10% della luminanza
  relativa massima (1,0)**, dove la luminanza relativa del piu' scuro dei due stati
  e' **sotto 0,80**.
- **Criterio d'area**: il flash conta solo se l'area combinata dei flash concorrenti
  supera **0,006 steradianti (25% di un campo visivo di 10 gradi)**. Risoluzione di
  riferimento WCAG: rettangolo **341x256 px su schermo 1024x768** come stima di un
  campo di 10 gradi a distanza tipica.
- **Red flash threshold**: coppia di transizioni opposte che coinvolge un rosso
  saturo — uno stato con **R/(R+G+B) >= 0,8** e differenza fra i due stati **> 0,2**
  nel diagramma CIE 1976 UCS.
- **Luminanza relativa WCAG** (glossario, https://www.w3.org/TR/WCAG22/#dfn-relative-luminance):
  `L = 0,2126*R + 0,7152*G + 0,0722*B`, dove per c in {R,G,B}: `csRGB=c8/255`, e
  `c = csRGB/12,92` se `csRGB<=0,04045`, altrimenti `((csRGB+0,055)/1,055)^2,4`.
- **Harding/PEAT/broadcast** (ITU-R BT.1702, Ofcom): usano cd/m2 ASSOLUTI (~20 cd/m2
  con scuro <160 cd/m2, equivalente al 10%/0,80 WCAG su SDR 200 cd/m2) e aggiungono
  i PATTERN spaziali a strisce (fuori perimetro qui — CALCETTO non ha strisce ad
  alto contrasto pulsanti). Fonte: Fulton et al., ACM TACCESS 2024/25, PMC11872230.
  NOTA: la cifra ITU-R esatta della revisione in vigore NON e' stata verificata sul
  documento originale — non si cita un numero clinico non verificato.

## I difetti del banco da correggere
1. **Metrica sbagliata**: `__luce()` (:151-162) pesa 0,2126/0,7152/0,0722 sui byte
   sRGB GREZZI (0-255), senza linearizzazione gamma → non e' la luminanza relativa
   WCAG. Va riscritta: linearizza gamma per canale, poi pesa, scala 0-1.
2. **Soglia tarata**: `PROMINENZA_MIN=1,5` (:222) va SOSTITUITA dalla definizione di
   transizione WCAG (coppia di transizioni opposte >=10% con scuro <0,80), rilevata
   sugli estremi locali della serie — non un numero arbitrario. Cosi' cade la
   "cecita' sotto soglia".
3. **Area mancante**: il criterio 0,006 sr / 25% di un campo di 10 gradi NON e'
   considerato. Va aggiunto (proxy: la frazione di pixel del canvas coinvolti nel
   flash, con la soglia derivata dalla risoluzione di riferimento WCAG e dichiarata
   come approssimazione). Esenta formalmente folla/duello, conferma il gol.
4. **Red flash mancante**: nessuna prova sul rosso saturo. Da aggiungere.

## Il cantiere in tre cure
1. **La metrica e il rilevatore WCAG**: `__luce()` in luminanza relativa vera
   (linearizzazione gamma, scala 0-1); il rilevatore a coppie di transizioni opposte
   (>=10%, scuro <0,80) al posto di PROMINENZA_MIN; finestra di 1 s, soglia <=3 flash.
   Ricalibra il `--controllo` (4 Hz a schermo intero) sulla nuova metrica: deve
   restare ROSSO. Le tre scene del gioco restano verdi (nessuna viola per ampiezza).
2. **L'area e il red flash**: il criterio d'area (esenta folla/duello <soglia,
   conferma il gol a schermo intero) e la prova red flash (R/(R+G+B)>=0,8, Δ>0,2).
   Casi di condanna nati apposta: un flash GRANDE sintetico a >3 Hz → ROSSO; un flash
   PICCOLO a >3 Hz → VERDE (esenzione d'area); un RED flash a >3 Hz → ROSSO. Verifica
   i raggi colorati del gol e le tinte-squadra rosse contro la soglia red.
3. **Verifica, ricalibrazione, verbale**: il gioco vero PASSA tutte le soglie WCAG
   (area + red flash + 3 Hz) — la verifica autorevole promessa; se NON passa, fermarsi
   e riferire (diventa cantiere di gioco). Batteria con il banco aggiornato. Verbale
   in MANUALE (voce #114): le soglie con fonti e date, la metrica corretta, la
   chiusura di #114, il verdetto onesto (banco piu' corretto/severo, gioco verificato
   non-violante, con la riserva metodologica risolta dal criterio d'area vero).

## Vincoli
- E' un cantiere di BANCO: `CALCETTO-il-gioco.html` non va toccato (se il banco
  corretto scoprisse una violazione, ci si ferma e si riferisce prima di toccarlo).
- Ogni nuova regola del banco NASCE in grado di CONDANNARE (un caso sintetico che
  viola la soglia deve uscire rosso) — un banco che non sa condannare non misura.
- I numeri clinici vanno col riferimento e la data (studi a edizioni). Nessun numero
  clinico inventato o non verificato.
- Il verdetto sul gioco (verde/rosso) deve essere RIPRODUCIBILE a seme fisso.

## Fuori perimetro
I pattern spaziali a strisce (Harding, non WCAG 2.3.1 — CALCETTO non li ha). La
luminanza assoluta in cd/m2 (dipende dal display, non misurabile a banco). L'HDR.
La cifra ITU-R esatta non verificata. Il gioco (salvo scoperta di violazione vera).
