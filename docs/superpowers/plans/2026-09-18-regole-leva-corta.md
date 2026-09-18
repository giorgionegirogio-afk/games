# Le regole a leva corta — piano di esecuzione (onda A, voce #107; chiude #96)

> **Per chi esegue:** SOTTO-SKILL RICHIESTA: usare `superpowers:subagent-driven-development` (consigliata) oppure `superpowers:executing-plans` per eseguire il piano un compito alla volta. I passi usano caselle (`- [ ]`) per il tracciamento.

**Obiettivo:** quattro regole vere con le leve già in casa — il rigore legge l'area vera, il portiere rifiuta il retropassaggio, il vantaggio esiste, e il nastro delle sfide porta la versione del motore (la voce #96 si chiude, l'APK si sblocca).

**Architettura:** cure puntuali su decisioni esistenti (zonaCalda→dentroArea; tentaPresa legge una bandiera di tocco nuova sul pallone; il fischio del fallo guadagna una finestra di vantaggio a manopole; Reg/Sfida guadagnano `versioneMotore`). Banco nuovo `_q-regole.js` nato rosso PRIMA delle cure. Il due-versioni diverge per costruzione e si dichiara per taglia (precedente #86).

**Tecnologia:** un solo file HTML, banchi Node+Playwright, attrezzi a àncore.

## Vincoli globali
- Ogni prova nuova nasce ROSSA sul gioco pre-cura (copia in `fuori/`), con la corsa di condanna a registro.
- `_q-determinismo --partite 4` = 13/13 a ogni compito (convenzione del ramo #87). Il due-versioni contro la base del compito DIVERGE per costruzione: si dichiara per taglia col numero, mai nascosto. ZERO `dado()` nei rami nuovi (decisioni geometriche su stati esistenti).
- Attrezzo a àncore per ogni tocco al gioco (cerca/metti esatti, conteggi attesi, --dentro PRIMA dell'applicazione — la lezione della coda di #87: l'attrezzo scritto a posteriori è garanzia più debole, va evitato).
- Commenti senza accentate; documenti con gli accenti; un commit per compito col verbale nel messaggio.
- Fonti tecniche: `_analisi/MAPPA-MANDATO.md` (aree 1 e 5, con prove), lo spec `docs/superpowers/specs/2026-09-18-regole-leva-corta-design.md`, e per il nastro `_analisi/RIMESSE-E-ANGOLI.md` §7 più il codice di `Reg`/`Sfida` (grep `Reg.scrivi`, `chiudiSfida`, `Sfida.gioca`). Ogni compito le legge PRIMA di scrivere àncore.
- Banchi di contorno a ogni compito: `_q-battute` 11/11 (il campo vero non deve rompersi), `_q-precedenza` 9/9, `_q-volo` 11/11.

## Soglie di accettazione (dallo spec)
1. Rigore: fallo DENTRO l'area vera → rigore, FUORI → punizione, a ogni taglia (prova per taglia, con la differenza 260-vs-area misurata e dichiarata a 5).
2. Retropassaggio: presa negata su passaggio di piede del compagno; concessa su colpo di testa, o tocco avversario; il portiere gioca sempre coi piedi.
3. Vantaggio: fallo con azione che prosegue → nessun fischio e banner VANTAGGIO; azione che muore entro la finestra → fischio ritardato dal punto del fallo; cartellino dovuto mostrato alla prossima palla ferma.
4. Nastro: la rigiocata di un nastro con versione diversa (o assente) dice la causa vera e non accusa il profilo; #96 CHIUSA nel MANUALE.
5. Giocabilità: `_eventi` prima/dopo — gol/min entro ±20% del pre-cantiere; rigori/partita dichiarati prima e dopo (il confine nuovo li può spostare: si misura, non si teme).

---

### Compito 1: Il banco `_q-regole.js` nasce rosso, e il rigore legge l'area
**File:** creare `strumenti/_q-regole.js`, `strumenti/_t-rigore-area.js`; modificare il gioco (via attrezzo).
**Interfacce.** Consuma: `dentroArea(team,x,y)` e `VERNICE` (ramo #86); `zonaCalda` (grep `zonaCalda`, era ~:17945 pre-#87); il telaio banco di `_q-battute.js` (flag --gioco/--taglia/--seme). Produce: banco con 4 prove — RIGORE-DENTRO (fallo nell'area vera → duello rigore), RIGORE-FUORI (fallo fuori area ma dentro la vecchia fascia 260 → punizione, LA prova che condanna la fascia), RETRO-PRESA (rossa fino al compito 2), VANTAGGIO-FISCHIA-SEMPRE (rossa fino al 3); la cura: la decisione legge `dentroArea`, `zonaCalda` resta solo se altri usi la richiedono (grep: se l'unico uso è il rigore, il nome muore con commento a edizioni).
- [ ] Passo 1: fonti+grep; scrivere il banco; condanna sul gioco di oggi (RIGORE-FUORI rossa: la fascia dà rigore dove l'area vera non c'è — misurare a 5/7/11 dove le due geometrie divergono e scegliere punti di prova DENTRO la divergenza).
- [ ] Passo 2: attrezzo, applicare; RIGORE-DENTRO e RIGORE-FUORI verdi.
- [ ] Passo 3: cancelli — determinismo 13/13; due-versioni vs base del compito per taglia, numeri dichiarati; battute 11/11; precedenza 9/9. La differenza a 5 (260 vs 173) nel rapporto con la misura.
- [ ] Passo 4: commit — `git commit -m "Il rigore legge l'area vera, non una fascia (voce #107, compito 1)"`

### Compito 2: Il portiere rifiuta il retropassaggio
**File:** creare `strumenti/_t-retropassaggio.js`; modificare gioco e banco.
**Interfacce.** Consuma: `segnaTocco`/`b.lastTouch`; `tentaPresa` (grep); `kickBall` e `colpoDiTesta` (dove nasce il tocco). Produce: bandiera sul pallone (es. `b.toccoPiede = true/false` scritta in kickBall/colpoDiTesta/rinvii, azzerata dove serve — censire TUTTI i punti che scrivono segnaTocco per non lasciare stati stantii, lezione hitPosts di #88); `tentaPresa` nega la presa (non il corpo: il portiere para coi piedi/corpo, solo le MANI sono negate) se ultimo tocco = piede di compagno; prova RETRO-PRESA verde + prova RETRO-TESTA (colpo di testa del compagno → presa concessa) nuova.
- [ ] Passi: banco prima (RETRO-TESTA nasce e condanna? no: nasce VERDE sul gioco di oggi perché oggi prende tutto — dichiararla come controllo discriminante, non condanna), attrezzo, cure, cancelli come al compito 1, commit — `git commit -m "Il portiere rifiuta il retropassaggio: le mani leggono l'ultimo tocco (voce #107, compito 2)"`

### Compito 3: Il vantaggio
**File:** creare `strumenti/_t-vantaggio.js`; modificare gioco e banco.
**Interfacce.** Consuma: il punto del fischio da fallo (grep `infliggiCartellino`/`checkSlideContact`/`startFreeKick`); `squadraDelPallone`. Produce: stato `G.vantaggio = {team, x, y, t, card}` con finestra `VANT_T=2.5` s reali e condizione di conservazione (palla alla squadra offesa E `x` più avanti del punto, valutata a `VANT_VALUTA=0.5` s poi a scadenza); esiti: azione viva a fine finestra → banner VANTAGGIO, niente fischio, cartellino (se `card`) mostrato alla prossima palla ferma (aggancio: `setScene`≠play — kickoff/battuta/goal — o palla fuori); azione morta → fischio ritardato e punizione DAL PUNTO ORIGINARIO (startFreeKick col punto salvato). Prove: VANTAGGIO-VIVO (l'azione prosegue → nessun duello e banner), VANTAGGIO-SFUMATO (palla persa in finestra → duello dal punto del fallo), la vecchia VANTAGGIO-FISCHIA-SEMPRE diventa verde.
- [ ] Passi: banco, attrezzo, cure, cancelli (qui `_eventi` merita una corsa di controllo: il vantaggio tocca il ritmo), commit — `git commit -m "Non ogni fallo ferma il campetto: il vantaggio esiste (voce #107, compito 3)"`

### Compito 4: La versione nel nastro, la batteria, il verbale (#96 si chiude)
**File:** creare `strumenti/_t-nastro-versione.js`; modificare gioco, `strumenti/tutti.js` (registrare `regole`), MANUALE.md, PUNTO-DEL-LAVORO.md.
**Interfacce.** Consuma: `Reg.serializza/deserializza` (grep), `Sfida.gioca/guarda/chiudiSfida` (~:41850, :41998, :42085 su HEAD 239f905), la costante nuova. Produce: `MOTORE_V = 1` (costante con commento: si incrementa a ogni ramo che tocca la simulazione); il nastro serializza la versione; la rigiocata confronta e, se diversa/assente, chiude con messaggio a causa vera (niente accusa al profilo); prova NASTRO-VERSIONE nel banco (nastro artefatto a versione 0 → messaggio giusto); `_q-regole` in batteria (`conta:true` + commento PERCHE'). Verbale: MANUALE voce #107 CURATA + **#96 CHIUSA** (con la condizione: il messaggio dice la causa vera; l'APK si sblocca) + PUNTO aggiornato (giornata, Restano → prossimo: spiccioli UX o onda B su decisione del committente).
- [ ] Passi: banco, attrezzo, batteria in spezzoni tutta verde, `_eventi` prima/dopo del CANTIERE intero (soglia 5 dello spec, numeri nel verbale), sorteggi complessivi dichiarati per taglia dal merge-base del cantiere, commit — `git commit -m "Il nastro conosce il suo motore: la voce 96 si chiude (voce #107)"`

---
## Autoverifica del piano
- Copertura: spec §1→C1, §2→C2, §3→C3, §4→C4, leggi di casa→vincoli+cancelli di ogni compito, giocabilità→C3 parziale + C4 completa.
- Nomi vincolanti: `_q-regole.js`, prove RIGORE-DENTRO/RIGORE-FUORI/RETRO-PRESA/RETRO-TESTA/VANTAGGIO-VIVO/VANTAGGIO-SFUMATO/NASTRO-VERSIONE, `G.vantaggio{team,x,y,t,card}`, `VANT_T=2.5`, `VANT_VALUTA=0.5`, `b.toccoPiede`, `MOTORE_V=1`, attrezzi `_t-rigore-area/_t-retropassaggio/_t-vantaggio/_t-nastro-versione`, voce #107.
- Ordine: il banco nasce col compito 1 e cresce; il nastro per ultimo perché tocca il protocollo e vuole la batteria intera alle spalle.
