# La cosmetica fuori dal PRNG di gioco — piano (voce #129, cura #98)

Progetto: `docs/superpowers/specs/2026-09-20-rebuildcrowd-prng-design.md`
(vedi la RETTIFICA A EDIZIONI in testa alla spec).
Base: `main` = `81bb961`. Ramo: `voce-129-rebuildcrowd-prng`. Cantiere di
MOTORE (tocca il gioco). Due compiti, un commit per compito, revisione finale
+ fusione. CHIUDE la voce #98.

## RETTIFICA (20 settembre, dopo le misure del compito 1)
Il piano originale (salva/ripristina SEME attorno al solo `rebuildCrowd`) e'
SUPERATO: `rebuildCrowd` e' solo l'8% del consumo, il grosso e'
`buildFieldTex`/`paintField`; e ci sono DUE canali (SEME e Math.random-
globale). DECISIONE DEL COMMITTENTE: **opzione 2, PRNG DEDICATO per la
cosmetica** (folla + texture), che cura ENTRAMBI i canali.

## Vincoli globali
1. Il gioco si tocca SOLO via attrezzo a ancore (`_t-*`, cerca/metti,
   `--out` poi `--dentro`, specchio byte-per-byte).
2. Ogni difetto ha prima un TEST FALLITO: `_q-determinismo --taglia 11` (e 7)
   e' 8/10 oggi (prove A/B, canale Math.random-globale) e deve diventare 10/10.
3. **Perimetro cosmetico COMPLETO ma non di piu'**: convertire a `dadoDeco`
   TUTTE E SOLE le `dado()`/`rnd()` cosmetiche raggiungibili da `setTaglia`->
   `resize`->`buildFieldTex`->`paintField`, da `rebuildCrowd`, e da ogni altra
   funzione di caricamento chiamata da `resize`/boot (verificare `vignette` e
   simili). NON toccare le `dado()` di GIOCO (fisica/IA/rosa/avversario,
   chiamate durante `startMatch` DOPO `setTaglia` e durante `simulate`).
4. Il collaudo si chiude a vicenda: `_q-determinismo --taglia 11` = 10/10
   prova che il perimetro e' COMPLETO (se resta una cosmetica non convertita,
   il consumo condizionale persiste e A/B restano rosse); `_eventi` bit-
   identico a taglia 5 + esiti partite invariati prova che NESSUNA `dado()`
   di gioco e' stata toccata.
5. Commenti senza accentate; verbale a edizioni; il commento storico
   :29942-49 riscritto per la nuova strategia.

## Ancore (riverificare col grep)
- `SEME` :8593 (`{on,s,n}`); `dado` :8598 (`SEME.on?xorshift:Math.random`);
  `rnd=(a,b)=>a+dado()*(b-a)` :8608. `rebuildCrowd` :29914-29964 (dado/rnd a
  :29922/29931/29940/29941, il `dado()` buttato :29949). `paintField` :27502+
  (grana :27523-27528, poi gradinate/erba piu' giu'). `buildFieldTex` :29495;
  `resize` chiamato da `setTaglia` :29997; `rebuildCrowd()` :29998.
  `_q-determinismo.js` (A/B/C `__caso` :99-108/122/184, D `SEME` :229-230).
  `strumenti/_t-crowd-prng.js` (attrezzo scritto al compito 1, scoped a
  rebuildCrowd, da AMPLIARE o rifare per l'opzione 2).

## Compito 1 — Il PRNG dedicato + la conversione + il test-condanna
**Obiettivo.** Introdurre un generatore dedicato per la cosmetica e convertire
le funzioni cosmetiche.
1. Definire vicino a `SEME`/`dado` (:8593-8608) un generatore DECO con stato
   proprio: `const DECO={s:1}; function dadoDeco(){ ...xorshift32 su DECO.s...
   return DECO.s/4294967296; }` e `const rndDeco=(a,b)=>a+dadoDeco()*(b-a)`.
   NON dipende da `SEME` ne' da `Math.random`.
2. All'INGRESSO di `paintField` e di `rebuildCrowd`: reseed fisso
   (`DECO.s = <costante dedicata>;`) cosi' la texture/folla e' funzione
   deterministica dei soli parametri (dimensioni campo, q), indipendente dallo
   stato globale. Convertire OGNI `dado()`->`dadoDeco()` e `rnd()`->`rndDeco()`
   dentro queste funzioni. Eliminare il `dado()` buttato :29949 (non serve
   piu'). Riscrivere il commento :29942-49 (a edizioni: la nuova strategia
   PRNG-dedicato, il perche' -- la #98, i due canali).
3. Mappare e convertire ogni ALTRA `dado()` cosmetica raggiungibile da
   `resize`/`buildFieldTex`/boot (vignette, insegne, gradinate se in funzioni
   separate). Il test a 7/11 dira' se ne manca una.
**Cancelli.**
- Test-condanna: `_q-determinismo --taglia 11` e `--taglia 7` da 8/10 a 10/10;
  `--taglia 5` resta 10/10. Se resta 8/10, il perimetro e' INCOMPLETO: trovare
  la cosmetica mancante (misurare `SEME.n`/il consumo residuo).
- Valore pratico: un banco a `SEME` a taglia 11 diventa bit-ripetibile
  (es. `_q-soak --taglia 11` due corse identiche, o una sonda dedicata).
- Non-regressione di GIOCO a taglia 5: `_eventi` bit-identico prima/dopo;
  esiti partite invariati; `_q-invarianti`/`_q-soak`/`_q-fuzzer`/collaudo/
  battute verdi. Se `_eventi` diverge a taglia 5, ho toccato una `dado()` di
  gioco: FERMARSI.
- `istantanea`: la texture/folla CAMBIA aspetto (regressione cosmetica
  ATTESA). Ri-ancorare la fotografia di riferimento o dichiarare lo scarto
  cosmetico (non e' un difetto). Documentare.
- `git diff` del gioco = generatore DECO + conversioni cosmetiche + commento;
  nessun tocco a funzioni di gioco.
**Definizione di fatto.** La cosmetica non tocca piu' il PRNG di gioco; 7/11
tornano 10/10 su ENTRAMBI i canali; taglia 5 bit-identica nel gioco; test-
condanna rosso->verde.

## Compito 2 — MOTORE_V + batteria + verbale (chiude la #98)
**Obiettivo.** MOTORE_V: l'esito di GIOCO a taglia 5 e' invariato (la
cosmetica non gira in `startMatch` a taglia 5 per la guardia) -> i nastri a
taglia 5 rigiocano identici -> `_q-replay`/`_q-regole` verdi -> MOTORE_V RESTA
2 (dichiarare la ragione; la texture cambia aspetto ma non l'esito ne' i
comandi). Verificare a banco. Batteria INTERA (`tutti.js --tutto`). Verbale
#129 in MANUALE (§A): la diagnosi RIVISTA (rebuildCrowd 8%, il vero
consumatore buildFieldTex/paintField, i due canali -- rettifica a edizioni
della voce #128), la cura (PRNG dedicato + reseed), i 7/11 a 10/10 su entrambi
i canali, la non-regressione di gioco a taglia 5 (numeri `_eventi`), la
regressione cosmetica ATTESA (istantanea ri-ancorata), MOTORE_V=2 motivato.
DICHIARARE la voce #98 CHIUSA (nota #98 a edizioni). PUNTO aggiornato.
**Cancelli.** MOTORE_V deciso a banco con prova; batteria verde; verbale a
registro; #98 chiusa; PUNTO aggiornato. Un commit.
**Definizione di fatto.** La #98 e' chiusa: 7/11 deterministici su entrambi i
canali, gioco a taglia 5 intatto, cosmetica ri-ancorata, MOTORE_V motivato.

## Chiusura
Revisione finale del ramo (adversariale: il perimetro cosmetico completo
[10/10 a 7/11] e non-di-piu' [_eventi bit a 5]; la texture ri-ancorata; il
gioco non toccato nelle funzioni di gioco; MOTORE_V motivato; verbale/#98
veri). Se «Ready to merge: YES»: fast-forward, smoke `_q-precedenza` 9/9,
push, ramo eliminato, ledger. La #98 e' CHIUSA.
