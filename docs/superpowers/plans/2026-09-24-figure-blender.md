# LE FIGURE DA BLENDER — piano (voce #151)

Spec: `docs/superpowers/specs/2026-09-24-figure-blender-design.md`.
Merge-base `c1e01fb` (`main`), ramo `voce-151-figure-da-blender`. Cinque compiti,
un commit ciascuno.

## LA BASE, MISURATA PRIMA DI TOCCARE NIENTE (24 set, `c1e01fb`)

`node strumenti/istantanea.js` — **42 misure su 56**, sette colonne:

| erba vuota | palla | figura | **ombre** | prato | centro sera | centro abitato |
|---|---|---|---|---|---|---|
| 1/8 | 8/8 | 8/8 | **5/8** | 8/8 | 7/8 | 5/8 |

**Rettifica al mandato, con la data accanto**: il mandato di partenza dava le
ombre a 3/8 e la figura a 12,5-16,3%. Misurate oggi sul merge-base: **ombre
5/8** e figura **10,56-16,32%**. Il 3/8 è l'edizione del **15 agosto**, superata
il 16 (6/8) e di nuovo oggi. Il numero da non peggiorare è **42/56**, e le
colonne sono quelle della riga qui sopra.

---

## C1 — LA PIPELINE HEADLESS, e il suo cancello

**Prima il test, e nasce rosso.** `strumenti/_t-151-blender.js`:

* **A** Blender c'è e risponde headless (altrimenti **prova nulla**, non rosso:
  è una mancanza del banco, non del gioco — codice 3).
* **B** `figura.py` costruisce il corpo con **le misure del gioco**, osso per
  osso: lo strumento legge `N_THIGH…N_HEADR`, `HIPW` e le `w` dei `SEGS` dal
  gioco e dal JSON che Blender esporta, e pretende **scarto zero**.
* **C** **determinismo**: due corse di fila, `sha256` del PNG identico al byte.
* **D** le due clip esistono e hanno i fotogrammi dichiarati.

Poi gli script: `comune.py`, `figura.py`, `anima.py`. Il cancello passa da rosso
a verde **nello stesso compito**, e il rosso di partenza si scrive nel commit.

Reti a fine compito: **niente tocca il gioco**, quindi la batteria non può
muoversi — e si verifica invece di crederlo, con `git diff --stat` sul gioco.

## C2 — L'ATLAS, E IL SUO PESO

`strumenti/blender/atlante.py` → `fuori/151-atlante.png` (2 clip × 8 direzioni ×
12 fotogrammi, cella 128).
`strumenti/_151-peso-atlante.js` misura: PNG grezzo, base64, memoria di texture
(`W×H×4`, confermata in Chrome con `performance.memory` prima/dopo), **tempo di
decodifica** a 1×, 4× e 6× di CPU. Stampa anche la **copertura piena**
(25 clip, 3 corporature) calcolata dall'atlas vero.

Qui si applicano i criteri 1 e 2 della sezione 6 della spec.

## C3 — IL CONFRONTO ONESTO

Due attrezzi a ancore, due file in `fuori/` (mai nel gioco spedito):

* `strumenti/_toppa-151-atlante.js` → `fuori/151-atlante.html` — `Rig3D.disegna`
  devia sull'atlas quando la clip è `corsa` o `tiro`;
* `strumenti/_toppa-151-luce.js` → `fuori/151-luce.html` — **la terza via**: la
  decisione binaria per arto diventa la tabella di Blender.

Su tutt'e due: `istantanea --gioco`, `prestazione --gioco`, `avvio --gioco` sul
profilo Android 10 dichiarato, e il confronto a fianco in Chrome.

## C4 — IL VERDETTO

I numeri, il criterio di rinuncia applicato riga per riga, la raccomandazione, e
— se gli sprite non convengono — **si scrive che non convengono**. Verbale in
`MANUALE.md` §A in cima, riga in `PUNTO-DEL-LAVORO.md`.

## LE RETI, A OGNI COMPITO

`istantanea` (base **42/56**, non deve peggiorare), `prestazione`, `avvio`,
`senza-rete` 6/6, `_q-duello-impronta` 44/44, `_q-motori`, `_q-casa`,
`determinismo`, `giudice`, `dischetto`, `volto`, `schermi`. A gruppi con
`--solo`. I banchi a tocchi reali con `--ripetuto 3`.

`MOTORE_V` resta **6**: se si muove, è stato toccato il gioco.
