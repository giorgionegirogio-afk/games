/* =====================================================================
   _t-moviola-blend.js — I CRONOMETRI DEL GESTO IMPARANO A SCORRERE
   (voce #85, compito 4).

   LA FIRMA MISURATA (_analisi/MOVIOLA-OGGI.md, 2.1-2.2; prova SCATTO di
   _q-replay.js): dentro disegnaMoviola, posizione/direzione/amp/squash/
   ang/bob si mescolano gia' con mix() fra il campione f e il successivo
   g -- ma gli otto cronometri del gesto (kickT/kickB/charge/chargeT/
   slide/dive/rove/roveT1) e i cinque campi del compito 3 (contrasto/
   presaT/gkManiT/rinvT/recover) si COPIAVANO di peso dal campione f. Il
   corpo scorreva liscio e il calcio restava congelato per 4-5 fotogrammi
   di schermo consecutivi, poi saltava di colpo: la prova SCATTO misurava
   max 5 (soglia verde <3).

   LA GUARDIA SUL RIAVVIO, il cuore di questo compito: un cronometro di
   gesto non si spalma attraverso il proprio riavvio. Letti nel codice
   (non assunti), i cronometri si dividono in due famiglie per sentinella
   e verso:
     - CRESCONO mentre il gesto e' attivo e RIPOSANO A -1 (charge:
       p.charge+=dt a :16065/16734/18449; slide: implicito, avanza col
       tempo trascorso, "p.slide>=SLIDE_T" a :17538; rove: p.rove+=dt a
       :17482). Qui -1->0,3 e' un INIZIO (un salto, non una rampa) tanto
       quanto 0,3->-1 e' una FINE: la guardia scatta quando uno dei due
       campioni e' la sentinella -1 e l'altro no, OPPURE quando il
       campione dopo e' comunque minore di quello prima (un riavvio che
       passa da un valore basso a uno piu' basso senza mai toccare -1
       nella finestra registrata, caso raro ma non impossibile a 20 Hz).
     - DECRESCONO mentre il gesto e' attivo e RIPOSANO A 0 (kickT:
       "p.kickT=Math.max(0,p.kickT-dt)" a :17420; kickB idem a :17424;
       dive: "p.dive-=dt" a :18461; e i cinque del compito 3: contrasto
       "p.contrasto=Math.max(0,p.contrasto-dt)" a :17439, presaT/rinvT/
       gkManiT "p.X-=dt" a :17091-17093, recover "p.recover-=dt" a
       :17541/18487). Qui la sola salita possibile e' un riavvio (un
       decadimento non risale mai da solo), quindi la guardia scatta
       quando il campione dopo e' MAGGIORE di quello prima.
   Quando la guardia scatta non si mescola: si prende il campione piu'
   vicino alla frazione fr, esattamente il campione che si sarebbe visto
   leggendo il nastro un fotogramma alla volta senza interpolare.

   I CINQUE CAMPI DEL COMPITO 3 SONO TUTTI CRONOMETRI, ZERO BANDIERE:
   verificato leggendo dove li legge rigStato (:33549 presaT, :33560-33566
   gkManiT/rinvT, :33588-33590 contrasto, :33542-33543/:17245-17246
   recover) -- tutti pilotano st.u o uno squash in modo CONTINUO
   (st.u=0,32+0,43*(1-p.presaT/0,8), sq=1+0,14*clamp(p.recover/0.30,0,1)),
   mai un semplice si'/no. Si interpolano tutti con la stessa guardia
   "decresce" di kickT/kickB/dive.

   chargeT E roveT1 (compito 4, punto 3): sono bersagli/durate costanti
   DURANTE il gesto (chargeT si fissa all'inizio della carica, :15146/
   16041/18564; roveT1 si fissa al lancio della rovesciata, :16360), non
   progrediscono nel tempo -- interpolarli fra due valori diversi
   inventerebbe un bersaglio intermedio che non e' mai stato il bersaglio
   di nessuna carica vera. La copia resta la scelta giusta, MA deve
   seguire lo STESSO campione (f o g) scelto per il numero che
   accompagnano (charge/rove): prima del compito 4 charge/rove erano
   copiati di peso da f, quindi chargeT/roveT1=f andava sempre bene; ora
   che charge/rove possono scattare su g quando la guardia sceglie il
   campione piu' vicino con fr>=0,5, tenere chargeT/roveT1 sempre a f
   avrebbe raccontato il bersaglio della carica VECCHIA accanto a un
   numero che e' gia' quello della carica NUOVA.

   SORTEGGI: zero. Si legge solo l'anello G.rec gia' scritto da
   registraFotogramma; nessuna chiamata a dado() in disegnaMoviola prima
   o dopo questo compito (verificato: la funzione non lo fa mai).

   uso:  node strumenti/_t-moviola-blend.js --out fuori/moviola-blend.html
         node strumenti/_t-moviola-blend.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/moviola-blend.html'));

const ANCORE = [

/* 1 — le due guardie, definite subito dopo mix() cosi' che l'intero
   corpo del ciclo per-giocatore le veda gia' pronte. */
{
  nome: '1/2 le guardie mixSu/mixGiu accanto a mix()',
  cerca:
`  const mix = (u,v)=>u + (v-u)*fr;`,
  metti:
`  const mix = (u,v)=>u + (v-u)*fr;
  /* LA GUARDIA SUL RIAVVIO (voce #85, compito 4): un cronometro di gesto
     non si spalma attraverso il proprio riavvio. Due famiglie, sentinella
     diversa (verificate nel codice, vedi strumenti/_t-moviola-blend.js):
     - CRESCE mentre il gesto e' attivo e riposa a -1 (charge, slide,
       rove): -1->0,3 e' un INIZIO (un salto, non una rampa) tanto quanto
       0,3->-1 e' una FINE -- fra i due, con entrambi i campioni attivi,
       il valore sale sempre e si mescola come amp/squash qui sopra.
     - DECRESCE mentre il gesto e' attivo e riposa a 0 (kickT, kickB,
       dive, e i cinque campi del compito 3: contrasto, presaT, gkManiT,
       rinvT, recover): un decadimento non risale mai da solo, quindi
       l'unica salita possibile e' un riavvio -- la guardia scatta quando
       il campione DOPO e' maggiore del campione PRIMA.
     Quando la guardia scatta non si mescola: si prende il campione piu'
     vicino alla frazione fr, come si farebbe senza interpolare. */
  const vicino = (u,v)=> fr<0.5 ? u : v;
  const saltaSu  = (u,v)=> (v<u) || ((u===-1)!==(v===-1));
  const saltaGiu = (u,v)=> v>u;
  const mixSu  = (u,v)=> saltaSu(u,v)  ? vicino(u,v) : mix(u,v);
  const mixGiu = (u,v)=> saltaGiu(u,v) ? vicino(u,v) : mix(u,v);`,
},

/* 2 — il corpo del ciclo: da copia di peso a interpolazione guardata,
   per tutti e otto i cronometri e i cinque campi del compito 3. */
{
  nome: '2/2 gli otto cronometri e i cinque campi si interpolano',
  cerca:
`    q.kickT=f.kt; q.kickB=f.kb;
    q.slide=f.slide; q.dive=f.dive;
    /* la carica si rimette com'era: sono i tre campi che quotaAnticipo
       legge, e senza di loro il replay di un gol mostrerebbe un tiro che
       parte da una figura che cammina */
    if(f.ch!==undefined){ q.charge=f.ch; q.chargeKind=f.ck; q.chargeT=f.cT; }
    /* la rovesciata e la clip del calcio come tutto il resto */
    if(f.rv!==undefined){ q.rove=f.rv; if(f.rT) q.roveT1=f.rT; }
    if(f.kc!==undefined) q.kickClip=f.kc;
    /* IL CONTRASTO E LA PARATA SI COPIANO DI PESO, NON SI INTERPOLANO
       (voce #85, compito 3): sono stato discreto come slide/dive/charge/
       rove qui sopra, non un cronometro continuo -- mescolare un
       contrasto a meta' con uno finito inventerebbe una posa mai vista.
       Qui si rilegge quello che il compito 3 ha registrato;
       l'interpolazione dei cronometri di gesto (kickT/kickB/charge/
       roveT1) resta il compito 4, non questi cinque campi. */
    if(f.contrasto!==undefined) q.contrasto=f.contrasto;
    if(f.presaT!==undefined) q.presaT=f.presaT;
    if(f.gkManiT!==undefined) q.gkManiT=f.gkManiT;
    if(f.rinvT!==undefined) q.rinvT=f.rinvT;
    if(f.recover!==undefined) q.recover=f.recover;`,
  metti:
`    /* GLI OTTO CRONOMETRI DEL GESTO SI INTERPOLANO, CON LA GUARDIA SUL
       RIAVVIO (voce #85, compito 4): fino a ieri si copiava di peso il
       campione f, e la prova SCATTO misurava fino a 5 fotogrammi di
       schermo consecutivi bit-identici mentre il corpo avanzava -- lo
       stesso difetto che l'interpolazione qui sopra aveva gia' tolto ad
       amp/squash/ang/bob, lasciato intatto sui cronometri. kickT/kickB/
       dive riposano a 0 e decrescono mentre il gesto dura (mixGiu);
       charge/slide/rove riposano a -1 e crescono (mixSu). */
    q.kickT=mixGiu(f.kt,g.kt); q.kickB=mixGiu(f.kb,g.kb);
    q.slide=mixSu(f.slide,g.slide); q.dive=mixGiu(f.dive,g.dive);
    /* la carica: charge si interpola con la guardia; chargeKind resta
       dello stato discreto come prima ('passo'/'tiro'/'tuffo', mescolarlo
       inventerebbe un gesto mai fatto) -- ma chargeKind e chargeT (il
       bersaglio-durata di QUESTA carica) devono seguire lo STESSO
       campione scelto per il numero, non sempre f: se la guardia sceglie
       g perche' fr e' oltre meta' e la carica e' appena ripartita,
       chargeT=f.cT racconterebbe il bersaglio della carica VECCHIA
       accanto a un charge che e' gia' quello della carica NUOVA. */
    if(f.ch!==undefined){
      const gch=(g.ch!==undefined)?g.ch:f.ch;
      const usaG = saltaSu(f.ch,gch) && fr>=0.5;
      q.charge=mixSu(f.ch,gch);
      q.chargeKind = usaG ? g.ck : f.ck;
      q.chargeT = usaG ? g.cT : f.cT;
    }
    /* la rovesciata: stessa logica di charge; roveT1 e' il bersaglio (il
       tempo di volo stimato al lancio, ROVE_ZC) e segue lo stesso
       campione di rove. Il controllo di verita' di prima si mantiene: uno
       zero non e' un bersaglio valido, si preferisce lasciare quello che
       roveT1 gia' vale (lo 0,4 di riposo dell'inizializzazione). */
    if(f.rv!==undefined){
      const grv=(g.rv!==undefined)?g.rv:f.rv;
      const usaG = saltaSu(f.rv,grv) && fr>=0.5;
      q.rove=mixSu(f.rv,grv);
      const rT = usaG ? g.rT : f.rT;
      if(rT) q.roveT1=rT;
    }
    if(f.kc!==undefined) q.kickClip=f.kc;
    /* I CINQUE CAMPI DEL COMPITO 3 SONO TUTTI CRONOMETRI, ZERO BANDIERE
       (voce #85, compito 4): letto nel codice -- contrasto, presaT,
       gkManiT e rinvT sono "secondi residui" che decrescono con p.X-=dt
       fino a 0 e pilotano st.u/st.clip in rigStato in modo continuo (es.
       st.u=0,32+0,43*(1-p.presaT/0,8)), esattamente come kickT/kickB/
       dive; recover idem (p.recover-=dt, letto come
       clamp(p.recover/0.30,0,1) in due punti del rig). Nessuno dei
       cinque e' un booleano: si interpolano tutti con mixGiu, la stessa
       guardia di kickT/kickB/dive. */
    if(f.contrasto!==undefined) q.contrasto=mixGiu(f.contrasto,(g.contrasto!==undefined?g.contrasto:f.contrasto));
    if(f.presaT!==undefined) q.presaT=mixGiu(f.presaT,(g.presaT!==undefined?g.presaT:f.presaT));
    if(f.gkManiT!==undefined) q.gkManiT=mixGiu(f.gkManiT,(g.gkManiT!==undefined?g.gkManiT:f.gkManiT));
    if(f.rinvT!==undefined) q.rinvT=mixGiu(f.rinvT,(g.rinvT!==undefined?g.rinvT:f.rinvT));
    if(f.recover!==undefined) q.recover=mixGiu(f.recover,(g.recover!==undefined?g.recover:f.recover));`,
},

];

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}
/* CONTEGGI A DELTA */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['const saltaGiu = (u,v)=> v>u;', 1],
  ['q.kickT=mixGiu(f.kt,g.kt); q.kickB=mixGiu(f.kb,g.kb);', 1],
  ['q.kickT=f.kt; q.kickB=f.kb;', -1],
  ['const usaG = saltaSu(f.ch,gch) && fr>=0.5;', 1],
  ['const usaG = saltaSu(f.rv,grv) && fr>=0.5;', 1],
  ['if(f.contrasto!==undefined) q.contrasto=mixGiu(', 1],
  ['if(f.contrasto!==undefined) q.contrasto=f.contrasto;', -1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
