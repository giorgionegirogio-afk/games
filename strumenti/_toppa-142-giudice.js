/* =====================================================================
   _toppa-142-giudice.js — IL GIUDICE SI ASTIENE INVECE DI ACCUSARE
   (voce #142, compito 3)

   Aggiunge due rifiuti al vaglio, un campo al referto e due frasi al
   cartello. Non tocca la simulazione: `MOTORE_V` resta 2.

   ------------------------------------------------------------------
   LA DOTTRINA, che non nasce qui: e' quella del #133 e del #139
   ------------------------------------------------------------------
   Il giudice ha cinque verdetti e uno solo muove punti. NON TORNA disfa
   `delta_a` e `delta_d` — toglie i punti a DUE persone — alza un
   `sospetto` che non decade mai (a soglia 3 segrega) e chiude la riga
   per sempre (`and verificata = 0`). Tutti gli altri sono «non lo so»:
   la riga resta in lista, si puo' riprendere domani, e nessuno perde
   niente.

   Percio' quando il giudice non puo' SAPERE, dice che non lo sa. Un
   onesto non confermato non perde niente; un onesto accusato perde i
   punti, il sospetto e la riga per sempre. E' l'argomento con cui il
   #133 ha messo `schermo-ignoto` e il #139 `schermo-cambiato`, ed e' lo
   stesso, parola per parola, qui.

   ------------------------------------------------------------------
   PERCHE' CI SI ASTIENE ANCHE QUANDO L'IMPRONTA MANCA
   ------------------------------------------------------------------
   E' la correzione di revisione che il #133 ha gia' pagato una volta
   (IMPORTANTE-1), e la ragione vale parola per parola: un nastro senza
   la riga 11 e' di prima di questa cura, o costruito apposta senza; in
   ogni caso non si puo' sapere se e' stato calcolato dal motore che lo
   sta rigiocando, e procedere «alla cieca» produce accuse false IN UNA
   SOLA DIREZIONE — misurato, 5 NON TORNA su 6 su un motore diverso, 0 su
   6 su quello giusto.

   IL PREZZO E' DICHIARATO, e non e' piccolo: tutti i nastri gia'
   registrati diventano INCOMPLETO/motore-js-ignoto, cioe' non piu'
   verificabili. Quanti siano non si puo' contare da qui — il database di
   esercizio non sta nel repo e la staffetta non e' mai stata lanciata
   contro un Supabase vero. Quel che si misura, e si misura
   (_q-motore-nastro, prova E), e' l'effetto su un nastro vero: passa da
   TORNA a INCOMPLETO.

   Si paga perche' l'alternativa all'astensione NON E' «verificarli»: e'
   ACCUSARLI. Quegli stessi nastri, oggi, giudicati sul motore sbagliato
   danno NON TORNA 5 volte su 6. E la riga resta a `verificata = 0`,
   cioe' torna verificabile da se' il giorno in cui la staffetta apre il
   motore giusto — cosa che dal compito 4 sa fare, e che per i nastri
   NUOVI funziona subito.

   ------------------------------------------------------------------
   DOPO LO SCHERMO, E NON PRIMA
   ------------------------------------------------------------------
   L'ordine dei rifiuti e' «il piu' specifico vince», e lo schermo ha TRE
   cause che dicono cose diverse: una riparabile aprendo un'altra
   finestra (`schermo-diverso`), una che NON si ripara in nessuna
   finestra (`schermo-cambiato`, e dirla riparabile manderebbe la
   staffetta ad aprire finestre per sempre), una che dice «non c'e'»
   (`schermo-ignoto`). Il motore e' una causa binaria: coincide o no.
   Metterlo prima dello schermo cancellerebbe quella distinzione senza
   guadagnare niente, perche' la staffetta raggruppa per la COPPIA
   (misura, impronta) e apre il contesto giusto per tutte e due.

   E IL REFERTO PORTA L'IMPRONTA SOLO SU `motore-js-diverso`, mai su
   `motore-js-ignoto`: e' la stessa regola del #139 per `schermo-diverso`
   contro `schermo-cambiato`. Su `diverso` c'e' un motore da aprire e chi
   chiama lo apre; su `ignoto` non c'e' niente da aprire, e dare un
   numero prometterebbe una cura che non esiste.

   ------------------------------------------------------------------
   E I REPLAY NON SI SPENGONO
   ------------------------------------------------------------------
   `Sfida.guarda` usa lo STESSO vaglio (voce #134, compito 2) ma
   intercetta solo quattro cause per nome: `motore-diverso`,
   `nastro-vuoto`, `nastro-troncato`, `duello-marchiato`. Le cause dello
   schermo non la fermano — «e' l'unico modo di non spegnere il replay
   per quasi tutti» — e queste due, che si chiamano in un altro modo,
   nemmeno. E il vaglio popola `out.dati`, `out.rosaAtt`, `out.carDif`
   PRIMA di arrivare qui, quindi il film esce con le rose del nastro
   esattamente come ieri. Un film approssimato costa niente; un verdetto
   approssimato costa punti a qualcuno.

   uso: node strumenti/_toppa-142-giudice.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
const agg = (nome, cerca, sostituisci) => CAMBI.push({ nome, cerca, sostituisci });

/* ------------------------------------------------------------------
   1) il campo nel referto del vaglio
   ------------------------------------------------------------------ */
agg('out.impronta', `  const out = { verdetto:'', causa:'', motoreV:motoreV, righe:righe,
                dati:null, mentAtt:undefined, mentDif:undefined,
                rosaAtt:null, rosaDif:null, carDif:undefined, schermo:null,
                schermi:null };`,
`  const out = { verdetto:'', causa:'', motoreV:motoreV, righe:righe,
                dati:null, mentAtt:undefined, mentDif:undefined,
                rosaAtt:null, rosaDif:null, carDif:undefined, schermo:null,
                schermi:null, impronta:0 };`);

/* ------------------------------------------------------------------
   2) i due rifiuti, dopo quelli dello schermo
   ------------------------------------------------------------------ */
agg('i due rifiuti del motore', `  if(sc.length > 1) return no('INCOMPLETO','schermo-cambiato');
  if(sc[0][0] !== (innerWidth|0) || sc[0][1] !== (innerHeight|0)) return no('INCOMPLETO','schermo-diverso');
  return out;
}`,
`  if(sc.length > 1) return no('INCOMPLETO','schermo-cambiato');
  if(sc[0][0] !== (innerWidth|0) || sc[0][1] !== (innerHeight|0)) return no('INCOMPLETO','schermo-diverso');
  /* =====================================================================
     E DEVE ESSERE LO STESSO MOTORE JAVASCRIPT (voce #142).

     E' il SETTIMO canale, e non passa ne' dai sorteggi (chiusi dal #129)
     ne' dai pixel (chiusi dal #133): passa dall'ULTIMO BIT. ECMA-262
     lascia le funzioni trascendenti «implementation-approximated», cioe'
     due motori conformi possono dare risultati diversi sulla stessa
     Math.sin. MISURATO dalla voce #141: fra V8 e JavaScriptCore
     Math.hypot differisce su 100 valori su 200, e il gioco la chiama 33
     volte — una e' la distanza. In un motore caotico a sessanta passi al
     secondo un ultimo bit diventa un gol.

     E NON E' UN CASO RARO COME LA BARRA DEL BROWSER DEL #139: fra un
     iPhone e un Android il motore e' SEMPRE diverso. MISURATO
     (strumenti/_q-motore-nastro.js, sei sfide vere registrate su WebKit
     e rigiudicate altrove): su WebKit TORNA 6 su 6, su Chromium NON
     TORNA 5 su 6, su Firefox 2 su 6. NON TORNA e' l'unico verdetto che
     muove punti: li toglie a DUE persone, alza un sospetto che non
     decade mai e chiude la riga per sempre.

     SI STA IN CODA ALLO SCHERMO, e non e' un dettaglio: lo schermo ha
     tre cause che dicono cose diverse (una non riparabile in nessuna
     finestra), il motore e' binario. Metterlo prima cancellerebbe quella
     distinzione senza guadagnare niente, perche' chi rigioca raggruppa i
     nastri per la COPPIA (misura, impronta).

     SE L'IMPRONTA MANCA, NON SI PROCEDE — ed e' la correzione di
     revisione che il #133 ha gia' pagato una volta (IMPORTANTE-1). Un
     nastro senza riga 11 e' di prima di questa cura: non si puo' sapere
     con che motore e' stato calcolato, e procedere alla cieca produce
     accuse false in una sola direzione. Il prezzo e' che i nastri gia'
     registrati diventano ingiudicabili, e si paga: l'alternativa non e'
     «verificarli», e' accusarli. La riga resta a verificata = 0, quindi
     torna giudicabile da se' il giorno in cui chi rigioca apre il motore
     giusto.
     ===================================================================== */
  const impNastro = improntaDelNastro();
  if(!impNastro) return no('INCOMPLETO','motore-js-ignoto');
  out.impronta = impNastro;
  if(impNastro !== improntaMotore()) return no('INCOMPLETO','motore-js-diverso');
  return out;
}`);

/* ------------------------------------------------------------------
   3) l'impronta nel referto di giudica, come lo schermo
   ------------------------------------------------------------------ */
agg('referto con impronta', `    return dico(vag.verdetto, vag.causa, Object.assign({ motoreV:motoreV, righe:righe },
                vag.causa === 'schermo-diverso' ? { schermo:vag.schermo } : {},
                vag.causa === 'schermo-cambiato' ? { schermi:vag.schermi } : {}));`,
`    /* L'IMPRONTA SI RESTITUISCE SOLO SU motore-js-diverso (voce #142),
       mai su motore-js-ignoto: e' la stessa regola del #139 per lo
       schermo. Su «diverso» c'e' un motore da aprire e chi chiama lo
       apre — e' cosi' che la staffetta smette di essere cieca; su
       «ignoto» non c'e' niente da aprire, e dare un numero prometterebbe
       una cura che non esiste. */
    return dico(vag.verdetto, vag.causa, Object.assign({ motoreV:motoreV, righe:righe },
                vag.causa === 'schermo-diverso' ? { schermo:vag.schermo } : {},
                vag.causa === 'schermo-cambiato' ? { schermi:vag.schermi } : {},
                vag.causa === 'motore-js-diverso' ? { impronta:vag.impronta } : {}));`);

/* ------------------------------------------------------------------
   4) le due frasi del cartello, accanto a quella dello schermo ignoto
   ------------------------------------------------------------------ */
agg('causaSigillo', `    if(c === 'schermo-ignoto')    return 'il nastro non dice su che schermo è stata giocata.';`,
`    if(c === 'schermo-ignoto')    return 'il nastro non dice su che schermo è stata giocata.';
    /* IL MOTORE JAVASCRIPT (voce #142). La parola «motore» qui dentro e'
       gia' presa da MOTORE_V — la versione del GIOCO — quindi la frase
       deve dire di che motore si parla, o chi legge andra' a cercare un
       aggiornamento che non esiste. */
    if(c === 'motore-js-diverso') return 'è stata giocata su un telefono con un altro motore JavaScript ' +
                                         '(un\\'altra marca, o un altro browser), e due motori non fanno gli ' +
                                         'stessi conti fino all\\'ultima cifra.';
    if(c === 'motore-js-ignoto')  return 'il nastro non dice con che motore JavaScript è stata calcolata.';`);

/* ------------------------------------------------------------------
   IL CANCELLO: o tutti gli ancoraggi sono unici, o non si scrive niente.
   ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-142-giudice.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: ancoraggio trovato ${n} volte (ne serve esattamente 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
fs.writeFileSync(usc, t);
console.log(`toppa applicata: ${CAMBI.length} cambi, ${ing} -> ${usc}`);
