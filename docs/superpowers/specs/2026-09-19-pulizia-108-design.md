# Pulizia dei banchi: l'ordine di setCpuVsCpu (voce #121, seguito #108)

19 settembre 2026. Cantiere di MANUTENZIONE DEGLI STRUMENTI (non del gioco),
deciso dal committente dopo la diagnosi del seguito #119: l'hang in `freekick`
delle partite CPU-CPU intere NON e' un bug del gioco reale (in una partita vera
la CPU chiude sempre la propria punizione, l'umano tocca lo schermo), ma
l'ARTEFATTO #108 nei banchi che chiamano `setCpuVsCpu(true)` PRIMA di
`startMatch` — dove `startMatch` riscrive `G.cpu=[false, ...]` incondizionatamente
(`CALCETTO-il-gioco.html:10953`) e annulla l'intento: la squadra 0 resta "umana
immobile", non batte le punizioni, la partita si incastra.

## La scelta del committente
Fra tre strade (pulire i banchi / curare alla radice nel gioco con perdita di
comparabilita' storica / lasciar stare), il committente ha scelto **pulire i
banchi**: correggere l'ordine dove e' sbagliato, SENZA toccare il gioco e SENZA
toccare la comparabilita' delle corse due-versioni storiche. La cura lato-gioco
(`setCpuVsCpu` a prova d'ordine, gia' proposta in MANUALE:870-875) resta NON
applicata, per scelta.

## Il perimetro esatto (dalla ricognizione del 19 settembre)
NON c'e' una leva condivisa: `_posa.js` espone `posaFerma()` con l'ordine giusto,
ma i tre banchi rotti importano solo `{semeFisso}` e avviano a mano. La cura e'
distribuita, sito per sito. I banchi ATTIVI (in `strumenti/tutti.js`) con l'ordine
sbagliato sono TRE, e solo tre — tutti gli altri in batteria (collaudo, misura,
eventi, equita, folla, seme, meta, replay, nomi, audio, istantanea, prestazione,
volti) usano gia' l'ordine giusto:
- **`_q-battute.js`**: 5 siti (:325-326, :348-349, :370-371, :396-397, :451-452).
  Rischio BASSO: le prove 2-6 non guardano il moto della squadra 0 (lo dichiara il
  file stesso, :628-633); 3 siti gemelli (prove 9/10/11) sono gia' corretti.
- **`_q-regole.js`**: 15 siti (:801-802 e altri 14, enumerati nel piano). Rischio
  BASSO: la sola prova che dipendeva dall'artefatto (PROVA 1 RIGORE-DENTRO) e' gia'
  stata riscritta (I4b) per misurare la scena ATTRAVERSATA, non lo stato finale.
  Margine di incertezza dichiarato sulle prove 3-16 (non verificate una per una):
  si legge OGNI riga dopo la correzione, non solo il codice d'uscita.
- **`_q-umore.js`**: 5 siti (:335-336, :636-637, :715-716, :850-851, :886-887).
  Rischio CONCRETO: le prove REGISTRO/STATI/TETTI/TESTIMONE misurano su partite
  CPU-CPU realmente giocate, e i tetti sono stati misurati con la squadra 0
  congelata. Correggere rende la squadra 0 CPU vera: piu' eventi, partite diverse,
  numeri di riferimento che cambiano. NOTA: correggere ELIMINA anche il rischio
  hang qui (esperimento A della diagnosi #119: ordine giusto -> 0/31 bloccate).
  La sola prova SPECCHIO (inietta i fatti a mano) e' insensibile.

`_c3-sorteggi.js` e gli altri ~22 file del censimento #108 restano FUORI: non sono
in batteria (archivio/usa-e-getta). Se un giorno servissero, stessa cura.

## Il principio del cantiere
Non si tocca il gioco: `CALCETTO-il-gioco.html` resta a `48921bd`. Percio' i
cancelli due-versioni/determinismo NON c'entrano (nessun sorteggio del gioco
cambia). La verifica di ogni compito e': (a) il banco corretto e' VERDE, letto
riga per riga (non solo il codice d'uscita — un rosso nuovo va colto); (b) nessuna
partita CPU-CPU del banco resta bloccata in `freekick`; (c) per `_q-umore`, i
tetti dichiarati reggono ancora (il massimo osservato puo' cambiare, ma non deve
SUPERARE il tetto — quello e' proprieta' della formula, non della partita).

## La prova che impedisce la ricaduta
`_q-umore.js` e' nato rotto DOPO il censimento #108 (che non poteva prevederlo):
la prova che un quarto banco non nasca rotto e' parte del valore. Una verifica
condivisa — dopo un avvio CPU-CPU, `G.cpu===[true,true]` — messa dove chi scrive
un banco nuovo guarda gia' (`_posa.js`, accanto a `semeFisso`), e/o un controllo
in `tutti.js` che nessuna partita CPU-CPU della batteria resti in `freekick` oltre
un tetto di fotogrammi.

## Fuori perimetro (dichiarato)
Il gioco (nessun tocco). La cura lato-gioco a prova d'ordine (#108, decisione del
committente: NON si fa). Gli ~22 strumenti d'archivio. La comparabilita' storica
delle corse due-versioni (i banchi corretti daranno numeri nuovi: si RI-ANCORANO
i riferimenti dichiarandolo, non si nasconde il cambio).
