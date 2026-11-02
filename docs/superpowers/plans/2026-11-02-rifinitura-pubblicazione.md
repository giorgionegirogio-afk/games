# Piano — voce #159, la rifinitura per la pubblicazione (2 novembre 2026)

Spec: `docs/superpowers/specs/2026-11-02-rifinitura-pubblicazione-design.md`.
Merge-base `4063c2a`, ramo `voce-159-rifinitura`. Dieci ore in tutto, di cui
due già spese in ricognizione e batteria di base.

## Compiti, nell'ordine

| | compito | chi | misura che lo chiude |
|---|---|---|---|
| 0 | Banco della matematica cieco alla coda base64; le native `Math.*` del blocco APQ dirottate | capo cantiere | `perimetro`, `casa-falsi` misurano (non uscita 2); andata e ritorno `innesta(sguaina(g))===g` |
| 1 | **Batteria P — il portiere** (P1 #6, P2 #7/#9, P3 #8, P4 #5) sul file vero | agente P | `_t-159-portiere-mani.js`, `_t-159-portiere-anticipo.js`, `_t-159-testa-vicino.js` rossi→verdi; `_eventi.js` 30 partite ×3 taglie prima/dopo entro le soglie; `collaudo`, `determinismo`, `equita`, `seme`, `regole`, `cpu-ordine` verdi |
| 2 | **Batteria R — disciplina e regole** (R1 #12, R2 #13, R3 #33, R4 #31 onesto, R5 #46) su una COPIA `fuori/159/CALCETTO-regole.html` con `--gioco` | agente R, in parallelo a 1 | `_t-159-scivolata-senza-palla.js`, `_t-159-contrasto-fallo.js`, `_t-159-doppio-giallo.js`, `_t-159-rigori-pannello.js`, `_t-159-hud-falli.js`; falli/partita +<20% in CPU contro CPU; gli stessi cancelli di 1 sulla copia |
| 3 | **Documenti** (README, COME-INSTALLARE, index.html, CLAUDE.md, NOTICE, MANUALE §6-8/§14/§15, sw.js v3, .gitignore) | agente D (sonnet), in parallelo | ogni frase corretta con la riga di prova; `diritti`, `testo-fuori` verdi |
| 4 | Fusione a tre vie della copia R nel file vero (`git merge-file`), poi i cancelli di 1 sul fuso | capo cantiere | zero conflitti o conflitti risolti a mano e riletti |
| 5 | **Batteria H — le leve deterministiche dell'umano** (H1 finestra con pressione, H2 lead/velocità del passaggio) + testi in gioco (pallonetto, crediti) | agente H | `_t-159-finestra-pressione.js`, `_t-159-passaggio-pressione.js`; `giocata` 7/7, `mira`, `_q-l13` rampa monotona, `tocco` |
| 6 | **`silhouette` sugli sprite** (time-box 45 min) | agente S, in parallelo a 5 | `silhouette` ≥ 8/10 sugli sprite, oppure il numero vero dichiarato |
| 7 | `MOTORE_V` 7, fixture rigenerata, cancelli sensibili | capo cantiere | i quattordici cancelli di spec §4 verdi |
| 8 | **Batteria intera** `--tutto --insieme 2` sul gioco finito | capo cantiere | nessun rosso che conta, o rosso dichiarato con causa e commit d'origine |
| 9 | APK: `SERIE` 1.2, `enableOnBackInvokedCallback`, build, `verifica.py` 48/48, installazione, `avvio-telefono`, fps a taglia 11 con FIGURE (`_158-sonda-telefono.js`) | capo cantiere | APK nel repo con `versione.json`; se il telefono resta assente, dichiarato |
| 10 | Commit narrativi, merge in `main`, push, release GitHub con l'APK | capo cantiere | `gh release view` mostra l'asset |
| 11 | Verbale §A, `PUNTO-DEL-LAVORO.md`, memoria | capo cantiere | — |

## Regole del cantiere

- La batteria INTERA si rilancia dopo la fusione (compito 8), non solo i
  cancelli nominati; i compiti 1, 2, 5 girano i cancelli mirati.
- Chi lavora sulla copia passa `--gioco` (o `GIOCO_PROVA`) a OGNI strumento:
  il default è il file vero, e lo misurerebbe al posto della copia.
- Nessuna cura legge `team===0`; nessuna aggiunge estrazioni non dichiarate;
  chi teletrasporta il pallone azzera `b.lastTouch`/`b.toccoPiede`.
- Un rosso di un banco a tocchi reali si rilancia con `--ripetuto` prima di
  chiamarsi regressione; un rosso qualunque si misura sull'origine prima di
  chiamarsi regressione.
