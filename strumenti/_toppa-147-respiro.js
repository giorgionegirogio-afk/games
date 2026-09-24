/* =====================================================================
   _toppa-147-respiro.js — IL RESPIRO (voce #147, compito 3)

   L'IDEA, CON LE PAROLE DEL PROGETTO D'ONDA (spec onda E, sezione 6):

     «Ogni netcode nasconde il ritardo e si scusa. Questo lo rende un
     oggetto diegetico: quando dai un comando, il giocatore comandato non
     parte di scatto — PRENDE FIATO. Una piccolissima anticipazione che
     dura esattamente D tick e finisce sul tick in cui il comando esegue.
     Il ritardo non si sente come lag: si sente come PESO.»

   QUATTRO ANCORE, e ognuna e' piccola. Il respiro e' un numero solo —
   la CARICA, fra 0 e 1 — e tre posti che lo leggono: l'anello del
   giocatore comandato, la fascia del dischetto, e la maniglia del banco.

   IL PEZZO PIU' IMPORTANTE NON E' IL DISEGNO: E' L'OROLOGIO.
   La carica NON conta i fotogrammi: legge il ritardo. `Ritardo` (#141)
   tiene un orologio proprio (`tick`) e una coda in cui ogni comando
   porta il tick in cui scadra'. La carica e' 1 meno quanto manca, diviso
   K. Cosi' «dura esattamente K e finisce sul tick in cui il comando
   esegue» non e' un'aspirazione tarata a mano: e' la definizione, e non
   puo' sfasarsi nemmeno se il telefono perde fotogrammi. Un respiro
   contato a fotogrammi avrebbe voluto una taratura, e una taratura
   sarebbe andata fuori sincrono sul primo telefono lento.

   A K = 0 — cioe' in tutto il gioco offline di oggi — IL RESPIRO NON
   ESISTE: non c'e' coda, non c'e' carica, non c'e' un pixel diverso.
   E' la ragione per cui `_q-istantanea` non si muove e per cui
   MOTORE_V resta 4.

   LE TRE PROPRIETA', E COME SI VERIFICANO (non si assumono):

   1. E' SOLA PRESENTAZIONE. `Respiro.passo()` si chiama da `render()`,
      non da `step()`, e non scrive niente fuori da se'. Misurato: E3 del
      banco confronta impronta, punteggio e posizione del pallone con e
      senza respiro su 240 fotogrammi.

   2. E' GIA' PAGATA. L'unico sorteggio del respiro — il tremolio
      dell'arco — esce da `dadoDeco()`, il PRNG dedicato della cosmetica
      (cura #129), che non legge ne' scrive ne' SEME ne' Math.random.
      Misurato: E4 pretende delta ZERO sul contatore dei sorteggi di
      gioco. Il #132 ha trovato che l'audio mangiava sorteggi: qui non si
      ragiona, si conta.
      E si consuma DECO senza ripristinarlo, ed e' voluto: ogni funzione
      cosmetica risemina DECO a costante fissa al proprio ingresso
      (paintField, rebuildCrowd), quindi far camminare quello stream fra
      una e l'altra non sposta nessun disegno. Ripristinarlo darebbe un
      tremolio COSTANTE, cioe' nessun tremolio.

   3. DEGRADA BENE. Quando la simulazione si ferma ad aspettare l'altro,
      la carica TIENE: non si azzera, non lampeggia, non compare una
      rotella. E tiene per costruzione, non per un `if`: durante un
      duello `step()` non gira (render chiama `Duel.update` al suo
      posto), quindi `Ritardo.tick` sta fermo e la carica, che e' funzione
      di quel tick, non si muove. Misurato: E2, novanta fotogrammi a
      orologio fermo, carica invariata e maggiore di zero.

   E L'INDICATORE DI CONNESSIONE E' LO STESSO OGGETTO.
   Nella sfida dal dischetto non c'e' un `Ritardo`: l'attesa e' il giro
   della cassetta. Allora la seconda sorgente della carica e' quella —
   quanti fotogrammi si sta aspettando l'altro — e il fiato si carica e
   poi RESTA TRATTENUTO. Un oggetto, due significati, zero interfaccia
   nuova, e nessun numero di millisecondi sullo schermo: un numero di
   millisecondi non dice a nessuno che cosa fare.

   uso:  node strumenti/_toppa-147-respiro.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

/* ----------------------------------------- 1. L'OGGETTO, accanto a DECO */
const A1 = `const rndDeco=(a,b)=>a+dadoDeco()*(b-a);`;
const B1 = `const rndDeco=(a,b)=>a+dadoDeco()*(b-a);

/* =====================================================================
   IL RESPIRO (voce #147) -- il ritardo messo in scena invece di nascosto.

   Sta qui, accanto a DECO, e non e' un caso: il respiro e' cosmetica, e
   la cosmetica in questa casa ha un generatore suo dal #129. L'unico
   sorteggio del respiro esce da dadoDeco(), quindi non consuma un solo
   sorteggio di gioco -- il che non e' un'opinione, e' il cancello E4.

   LA CARICA NON CONTA I FOTOGRAMMI, LEGGE L'OROLOGIO DEL RITARDO.
   Ritardo (#141) accoda ogni comando col tick in cui scadra'. La carica
   e' 1 meno quanto manca, diviso K: quindi «dura esattamente K e finisce
   sul tick in cui il comando esegue» e' la definizione, non una
   taratura. Un respiro contato a fotogrammi sarebbe andato fuori
   sincrono sul primo telefono lento, e la taratura l'avrebbe nascosto.

   A K = 0 QUESTO BLOCCO E' INERTE: nessuna coda, nessuna carica, nessun
   pixel diverso. E' la ragione per cui il gioco offline di oggi non si
   muove di un bit e MOTORE_V resta 4.
   ===================================================================== */
/* quanto dura lo scarico dopo il colmo, in tick. Il fiato non si spegne
   di scatto: il piede si e' piantato, e il peso torna. */
const RESPIRO_SCARICO = 10;
/* quanti fotogrammi ci vuole il fiato dell'ATTESA DI RETE per arrivare al
   colmo. Non e' un ritardo d'ingresso: e' il giro della cassetta, e la
   sua lunghezza vera non la sa nessuno prima di misurarla sul posto. Un
   secondo a sessanta fotogrammi e' il tempo oltre il quale una persona
   comincia a chiedersi se il gioco e' rotto. */
const RESPIRO_ATTESA = 60;

const Respiro = {
  on: true,            /* si spegne per la misura: due esecuzioni confrontabili */
  carica: 0,           /* 0..1 -- e' TUTTO il respiro */
  K: 0,                /* i tick che il fiato deve durare */
  fine: 0,             /* il tick in cui il comando piu' vecchio esegue */
  restaTick: 0,
  viva: false,
  trattenuto: false,   /* il fiato TIENE: la simulazione aspetta */
  tremore: 0,          /* l'unico sorteggio, e viene da DECO */
  atteso: 0,           /* fotogrammi di attesa della rete */

  azzera(){
    this.carica = 0; this.K = 0; this.fine = 0; this.restaTick = 0;
    this.viva = false; this.trattenuto = false; this.tremore = 0; this.atteso = 0;
  },

  /* l'attesa della RETE, che e' l'altra sorgente del fiato: quando la
     sfida dal dischetto aspetta l'altro, la simulazione sta ferma e il
     ritardo d'ingresso non c'entra niente. Torna vero mentre si aspetta. */
  attesaRete(){
    try{
      if(typeof Dischetto === 'undefined' || !Dischetto.s) return false;
      const f = Dischetto.s.fase;
      return f === 'attesa-impegno' || f === 'attesa-pari';
    }catch(e){ return false; }
  },

  /* SI CHIAMA DAL DISEGNO, NON DALLA SIMULAZIONE. E' la riga che rende
     vera la prima delle tre proprieta': questo blocco non sta dentro
     step(), quindi non puo' spostare una partita nemmeno per sbaglio. */
  passo(){
    if(!this.on){ this.azzera(); return; }

    /* --- prima sorgente: il ritardo d'ingresso (#141) --- */
    const K = Ritardo.K|0;
    const coda = Ritardo.coda;
    if(K > 0 && coda.length){
      /* IL PIU' VECCHIO, non il piu' nuovo. Con una levetta che si muove
         la coda si riempie a ogni tick: guardando il piu' nuovo il fiato
         resterebbe a zero per sempre, e proprio mentre il ritardo e'
         massimo. Il piu' vecchio dice quanto manca al prossimo comando
         che esegue, che e' quel che una persona sente. */
      this.K = K; this.fine = coda[0][0]; this.viva = true;
    }

    if(this.viva){
      const resta = this.fine - Ritardo.tick;
      if(resta >= 0){
        this.restaTick = resta;
        this.carica = (this.K > 0) ? Math.max(0, Math.min(1, 1 - resta / this.K)) : 1;
        this.trattenuto = false;
      }else if(this.attesaRete()){
        /* IL FIATO TRATTENUTO: non si azzera. */
        this.trattenuto = true;
      }else{
        this.restaTick = 0;
        this.carica = Math.max(0, 1 + resta / RESPIRO_SCARICO);
        if(this.carica <= 0){ this.viva = false; this.K = 0; }
      }
    }else if(this.attesaRete()){
      /* --- seconda sorgente: l'attesa della rete, cioe' l'indicatore di
         connessione. Non e' un numero di millisecondi: e' lo stesso
         fiato, e quando la rete e' brutta resta trattenuto piu' a lungo.
         --- */
      this.atteso++;
      this.carica = Math.min(1, this.atteso / RESPIRO_ATTESA);
      this.trattenuto = this.carica >= 1;
    }else{
      this.carica = 0; this.trattenuto = false; this.restaTick = 0;
    }
    if(!this.attesaRete()) this.atteso = 0;

    /* IL TREMOLIO, E VIENE DA DECO. E' l'unico sorteggio di tutto il
       respiro, e per questo E4 pretende delta zero sui sorteggi di
       gioco. Non si ripristina DECO.s: ogni funzione cosmetica lo
       risemina a costante fissa al proprio ingresso, quindi far
       camminare quello stream non sposta nessun disegno -- mentre
       ripristinarlo darebbe sempre lo stesso numero, cioe' nessun
       tremolio. */
    this.tremore = (this.carica > 0.02 && this.carica < 0.999)
      ? (dadoDeco() - 0.5) * 0.44 * this.carica : 0;
  },

  /* QUANTO FIATO C'E' SU QUESTO UOMO. Zero su tutti tranne il comandato
     della squadra che una persona sta giocando: un anello che respirasse
     sotto una CPU racconterebbe una bugia. */
  suUomo(p){
    if(!this.on || this.carica <= 0 || !p) return 0;
    const t = p.team;
    if(!G.ctrl || G.cpu[t]) return 0;
    if(G.ctrl[t] < 0 || G.players[G.ctrl[t]] !== p) return 0;
    return this.carica;
  },

  stato(){
    return { on:this.on, carica:this.carica, K:this.K, resta:this.restaTick,
             trattenuto:this.trattenuto, tremore:this.tremore, atteso:this.atteso };
  },
};`;

/* -------------------------------------- 2. IL PASSO, DENTRO IL DISEGNO */
const A2 = `function render(){
  vigilaBottoniHUD();
  if(G.frozen) return;`;
const B2 = `function render(){
  vigilaBottoniHUD();
  /* IL RESPIRO CAMMINA NEL DISEGNO (voce #147), e sta PRIMA della
     guardia di G.frozen apposta: a fotogramma congelato il fiato deve
     restare quello che era, e per restare quello che era deve essere
     ricalcolato dallo stesso orologio -- non dimenticato. */
  Respiro.passo();
  if(G.frozen) return;`;

/* ------------------------------------------------- 3. L'ANELLO CHE RESPIRA */
const A3 = `  const pl = SAVE.moto ? 0.5+0.5*Msin(G.pulse*2.6) : 0.5;
  const arx=19.2+1.4*pl, ary=8.4+0.61*pl;
  ctx.strokeStyle='rgba(0,0,0,.46)'; ctx.lineWidth=5.4;
  ctx.beginPath(); ctx.ellipse(p.x+2.5,p.y+6.6,arx,ary,0,0,6.2832); ctx.stroke();
  ctx.strokeStyle='rgba(255,176,32,.95)';
  ctx.lineWidth=3.4;
  ctx.beginPath(); ctx.ellipse(p.x+2.5,p.y+6.6,arx,ary,0,0,6.2832); ctx.stroke();`;
const B3 = `  const pl = SAVE.moto ? 0.5+0.5*Msin(G.pulse*2.6) : 0.5;
  /* IL RESPIRO (voce #147). Il ritardo d'ingresso non si nasconde: si
     mette in scena. L'anello del comandato si STRINGE mentre il comando
     matura e arriva al colmo sul tick in cui esegue -- il piede che si
     pianta, il peso che si sposta. A ritardo spento (tutto il gioco
     offline di oggi) fiato vale 0 e queste due righe sono i numeri di
     ieri alla cifra: e' la ragione per cui l'istantanea non si muove. */
  const fiato = Respiro.suUomo(p);
  const arx=19.2+1.4*pl-3.4*fiato, ary=8.4+0.61*pl-1.50*fiato;
  ctx.strokeStyle='rgba(0,0,0,.46)'; ctx.lineWidth=5.4;
  ctx.beginPath(); ctx.ellipse(p.x+2.5,p.y+6.6,arx,ary,0,0,6.2832); ctx.stroke();
  ctx.strokeStyle='rgba(255,176,32,.95)';
  ctx.lineWidth=3.4;
  ctx.beginPath(); ctx.ellipse(p.x+2.5,p.y+6.6,arx,ary,0,0,6.2832); ctx.stroke();
  /* L'ARCO DELL'ANTICIPAZIONE: gira in senso orario dall'alto in
     proporzione alla carica, sull'ellisse dell'ambra allargata di due
     pixel e mezzo. NON e' l'anello del fiato-fatica (quello e' verde-lime
     e legge p.fiato, voce #112): questo e' avorio caldo e legge il
     RITARDO. Due anelli, due cose, due tinte -- se avessero la stessa
     tinta chi gioca crederebbe di essere stanco quando invece e' la
     rete a essere lenta. */
  if(fiato > 0.004){
    ctx.strokeStyle='rgba(255,238,206,'+(0.26+0.46*fiato).toFixed(3)+')';
    ctx.lineWidth=2.2;
    const a0=-1.5708+Respiro.tremore;
    ctx.beginPath();
    ctx.ellipse(p.x+2.5,p.y+6.6,arx+2.5,ary+1.1,0, a0, a0+6.2832*fiato);
    ctx.stroke();
  }`;

/* ---------------------------------------------- 4. LA MANIGLIA DEL BANCO */
const A4 = `  ritardo(K){ return Ritardo.imposta(K); },`;
const B4 = `  ritardo(K){ return Ritardo.imposta(K); },
  /* =====================================================================
     IL RESPIRO, APERTO AL BANCO (voce #147).

     Tre verbi e uno stato, e nessuno dei tre fa qualcosa che il gioco non
     faccia da se': passo() e' LA STESSA porta che chiama render(), e
     accendi/spegni servono a misurare la partita nei due modi. Senza
     poterlo spegnere, «la partita non cambia di un bit col respiro»
     sarebbe una frase invece di un confronto.
     ===================================================================== */
  get respiro(){
    return {
      get stato(){ return Respiro.stato(); },
      accendi(){ Respiro.on = true; Respiro.azzera(); return true; },
      spegni(){ Respiro.on = false; Respiro.azzera(); return false; },
      passo(){ Respiro.passo(); return Respiro.stato(); },
    };
  },`;

/* ===================================================================== */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-147-respiro.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');

for (const [cerca, metti, nome] of [[A1, B1, 'oggetto'], [A2, B2, 'passo'],
                                    [A3, B3, 'anello'], [A4, B4, 'maniglia']]) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('TOPPA NON APPLICATA: ancora «' + nome + '» trovata ' + n + ' volte (ne serve 1)'); process.exit(1); }
  t = t.replace(cerca, metti);
}
for (const [k, q] of [['const Respiro = {', 1],
                      ['Respiro.passo();\n  if(G.frozen) return;', 1],
                      ['Respiro.suUomo(p)', 1], ['get respiro(){', 1],
                      ['Respiro.passo();', 2]]) {
  const n = t.split(k).length - 1;
  if (n !== q) { console.error('TOPPA NON APPLICATA: «' + k + '» compare ' + n + ' volte (ne servono ' + q + ')'); process.exit(1); }
}
fs.writeFileSync(usc, t);
console.log('toppa applicata: il respiro, ' + ing + ' -> ' + usc);
