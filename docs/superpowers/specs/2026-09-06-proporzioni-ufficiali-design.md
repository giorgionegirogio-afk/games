# PROPORZIONI UFFICIALI — progetto deciso (voce #86)

**6 settembre 2026.** Questo documento promuove la bozza del 2 settembre
(`2026-09-02-proporzioni-ufficiali-bozza.md`) a progetto: il committente ha
sciolto oggi le quattro decisioni aperte, scegliendo per tutte la
raccomandazione della bozza. L'analisi del codice, i punti `file:riga` e la
distinzione vernice/regola NON vengono ripetuti qui — stanno nella bozza e in
`_analisi/MISURE-UFFICIALI.md` (le misure ufficiali con fonte accanto a ogni
numero), che restano i documenti di riferimento.

## Le quattro decisioni del committente (6 settembre 2026)

1. **Forma del campo: si corregge SOLO la taglia 11**, da 2,05:1 a 1,54:1
   (105×68 IFAB). Le taglie 5 e 7 restano 2,05:1 (a 5 lo scarto è +2,7%,
   trascurabile; il 7 non ha una legge con l'autorità dell'IFAB). Obbligo a
   valle: rimisurare i pavimenti di zoom (`S2_*`) e il fattore della
   minimappa a 11 con gli strumenti già in casa (`strumenti/_sweep`, test di
   fotogramma fermo) — quei numeri furono tarati sulla forma di oggi.

2. **Corpi: si costruisce la leva per taglia E si riducono i corpi a 11.**
   `P_R`/`B_R` e i pavimenti `Z_FIG40`/`Z_BORDO` diventano funzione della
   taglia (ricalcolati dentro `setTaglia`, non `const` globali); a 11 i raggi
   si riducono così che lo scarto residuo dichiarato resti **entro ±15%**, e
   la formula dei pavimenti riporta da sola il corpo alla stessa dimensione
   in pixel sullo schermo. La riduzione tocca anche la fisica che legge quei
   raggi (separazioni, dribbling, rendering della palla): è parte del lavoro,
   non un effetto collaterale da nascondere.

3. **Porta: tetto di scarto unico ±20% su tutte e tre le taglie.** `GOAL_H`
   si risolve dal tetto, taglia per taglia; la 5 NON va al valore pieno (3 m
   sarebbe una fessura). `GK_AREA_X` (l'uscita del portiere) va ricalibrata
   insieme alla porta: oggi deriva da `kPasso` e resterebbe tarata sulla
   porta vecchia.

4. **La legge del 7 è UISP (amatoriale adulto)**: campo 44-65×25-40 m, porta
   5-6×2 m. È il regolamento coerente col resto del gioco (cartellini,
   espulsioni temporanee, rigori-serie da adulti). Dove serve un valore di
   riferimento per il 7, si usa UISP.

## Il perimetro del lavoro

**Dentro (dalla PARTE 1 della bozza, nessuna decisione richiesta):**
- Vernice pura corretta entro **±10%** del rapporto unità/metro della sua
  taglia: cerchio di centrocampo, archi d'angolo, arco dell'area («D»).
- **Area di porta (5,5 m)**: oggi non esiste, va disegnata — è vernice nuova,
  nessuna regola la legge.
- **Unificazione della costante dell'area**: `AREA_W`/`AREA_H` (disegno) e
  `GK_AREA_X`/`dentroArea` (regola) oggi coincidono per formula, non per
  variabile. Devono derivare da un'UNICA costante, altrimenti l'area si vede
  in un punto e si applica in un altro. Verifica: il grep delle occorrenze
  letterali di `118` e `230` legate al campo restituisce una sola
  definizione.
- **Dischetto** (`DISCH`): vernice per la regola; attenzione al solo rischio
  visivo dichiarato (la telecamera del duello ha scala propria).

**Fuori (non in questa voce):**
- Rimesse laterali e calci d'angolo → voce #87 (l'analisi è in
  `_analisi/RIMESSE-E-ANGOLI.md`).
- La forma di 5 e 7, i corpi a 5 e 7.
- Qualunque meccanica nuova (rigore su fallo in area, barriere, fuorigioco).

## Soglie di accettazione (dalla PARTE 4 della bozza, ora vincolanti)

1. Vernice pura entro **±10%** taglia per taglia (metodo della PARTE C dello
   studio).
2. Area disegnata e area applicata derivano dalla **stessa costante** — zero
   formule duplicate.
3. Forma a 11 e corpi a 11: scarto residuo dichiarato **entro ±15%**.
4. Porta: scarto **entro ±20%** su TUTTE e tre le taglie, e `GK_AREA_X`
   ricalibrata insieme.
5. Il banco delle proporzioni legge le costanti dal gioco vivo dopo
   `setTaglia(n)` via `window.__test` e, fatto girare sul gioco di OGGI,
   condanna almeno tre casi noti (cerchio a 11 −69,1%, area a 11 −57,7%,
   area di porta assente). Se è verde sul gioco di oggi, è rotto il banco.

## Vincoli globali (di casa, invariati dalla voce #88)

- **Legge dei sorteggi:** zero chiamate nuove a `dado()`; percorsi a seme
  fisso identici al bit dove il comportamento non è dichiarato cambiare.
  ATTENZIONE: qui il comportamento CAMBIA per costruzione (campo, porta e
  corpi a 11; porta a 5 e 7): i banchi di confronto fra versioni andranno
  letti come al compito 9 della voce #88 — divergenze DICHIARATE e isolate,
  con `_q-determinismo` (stesso codice+seme) che deve restare verde.
- Ogni modifica al gioco passa da un **attrezzo a àncore** (`_t-*.js`) con
  `cerca`/`metti` esatti e conteggi `attesi`.
- Si cerca **per nome**, mai per numero di riga.
- Commenti nel codice in italiano senza lettere accentate; documenti con gli
  accenti veri.
- Un commit per compito, col verbale nel messaggio.
- Ogni prova nuova deve **sapere condannare** prima di essere creduta.
