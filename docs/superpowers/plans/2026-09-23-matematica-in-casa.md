# LA MATEMATICA IN CASA — voce #143, piano

Spec: `docs/superpowers/specs/2026-09-23-matematica-in-casa-design.md`
Merge-base: `a2607d0` (`main`) · ramo `voce-143-matematica-in-casa`

Sei compiti, un commit ciascuno. **La batteria intera a ogni compito**, a
gruppi con `--solo` (`--tutto` chiede ~12 minuti e va oltre il tempo di un
comando).

## C0 — la spec e il piano

Questo file e la spec. Le soglie sono scritte **prima** dei banchi (spec §3).

## C1 — il perimetro, misurato

**`strumenti/_143-siti.js`** — lo scanner che separa il codice dai commenti,
dalle stringhe, dai template e dalle espressioni regolari. Una grep conterebbe
anche i verbali che parlano di `Math.hypot`. Ha la sua prova su casi sintetici.

**`strumenti/_q-perimetro.js`** — le due misure indipendenti:

    P) LA POPOLAZIONE      quali dei 452 siti si accendono nella cottura,
                           nel passo, nel disegno; e quante CHIAMATE, che e'
                           il numero che decide il costo di prestazione
    S) LA SOSTITUZIONE     si sporca UNA funzione per volta e si guarda se
       SPORCA              l'IMPRONTA DELLA PARTITA cambia; due forze (un ulp
                           come i motori veri, 1e-9 come caso peggiore) e il
                           conto delle chiamate come testimone

## C2 — le funzioni in casa, e la loro verifica

**`strumenti/_143-matematica.js`** — la sorgente, copia sola: riduzione
d'argomento di fdlibm e polinomi minimax, con sole operazioni correttamente
arrotondate. Esportata come testo (per l'innesto) e come funzioni (per i banchi):
il gioco e il banco provano lo STESSO testo.

**`strumenti/_q-casa.js`** — il banco, sui tre motori e sul dominio VERO:

    D) IL DOMINIO          il piu' grande e il piu' piccolo argomento che il
                           gioco passa davvero, contro il tetto dichiarato
    N) LA NATIVA NON LO E'  la condanna sugli argomenti veri; e la guardia che
                           impone a pow e sqrt di restare concordi, se no
                           vanno scritte in casa anche loro
    C) LA CASA E' LA STESSA stessi bit su chromium/webkit/firefox — LA SOGLIA
    U) LO SCARTO IN ULP     contro la nativa, <= 4 ulp — contro la funzione
                           uguale ovunque ma storta

## C3 — l'innesto

**`strumenti/_toppa-143-matematica.js`** — libreria in cima allo script, e le
370 chiamate eseguibili dirottate, col blocco di `improntaMotore()` protetto.
La toppa conta quel che sostituisce e rifa la scansione dopo: se resta anche
una sola chiamata nativa fuori dal blocco protetto, non scrive niente.

Il cancello che decide: **`_q-motori.js` da 0/8 semi a 8/8**, confermato a 20.

## C4 — prestazione, MOTORE_V, i falsi

Prestazione appaiata `--contro HEAD`. `MOTORE_V` deciso **con la misura** (nastri
del motore vecchio rigiocati sul curato), non con l'argomento.

I falsi, costruiti nel caso peggiore:

    _crit-casa-solo-hypot   cura solo hypot (il #141 ha misurato che passa
                            molti semi: DEVE essere bocciato da _q-motori)
    _crit-casa-storta       funzione in casa uguale ovunque ma imprecisa:
                            passa la SOGLIA-CASA, deve cadere sulla SOGLIA-ULP
    _crit-casa-una-nativa   una sola chiamata nativa lasciata nel perimetro
    _crit-casa-impronta     improntaMotore dirottata sulla casa: l'impronta
                            del #142 diventa piatta e non separa piu' i motori

**`strumenti/_q-casa-falsi.js`** — il banco dei falsi, con la lista dei morsi.

## C5 — le ritarature, la batteria, il verbale

Ogni ancora che si muove va **dichiarata con la sua ragione**, e distinta da una
regressione misurando sull'ultimo commit. Verbale in `MANUALE.md` §A in cima e
riga in `PUNTO-DEL-LAVORO.md`.
