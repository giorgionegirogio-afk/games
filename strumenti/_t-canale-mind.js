/* =====================================================================
   _t-canale-mind.js -- IL CANALE DI GIOCO: manopolaDi(p) (voce #117,
   compito 3, MIND v1). Qui inizia la divergenza: manopoleDi(t) resta la
   manopola DI SQUADRA (il carattere, G.knob[t] CONDIVISO dagli undici,
   MAI mutato in-place); manopolaDi(p) e' la manopola DI QUEL GIOCATORE,
   che parte da manopoleDi(p.team) e applica DOPO i tre tetti del canale
   MIND (p.umore, p.nervi, G.spinta[team] -- gli stati OSSERVAZIONE PURA
   del compito 2, vedi strumenti/_t-stati-mind.js).

   MODELLO: strumenti/_t-stati-mind.js (l'ANCORE con cerca/metti, il
   guardiano che rifiuta se `cerca' non compare ESATTAMENTE una volta).

   LA STRUTTURA VERA DEL RAMO IA (verificata col grep prima di scrivere
   questo attrezzo, fidandosi del codice e non dei numeri di riga del
   progetto -- che erano su un HEAD precedente e sono scivolati di circa
   1700 righe per gli inserimenti dei compiti 1 e 2): il motore NON legge
   D.slideP/D.passErr/D.standoff in tre punti indipendenti che vadano
   cambiati uno per uno. C'e' UNA SOLA costruzione:
     aiMove(p,dt){ const D=manopoleDi(p.team); ... }
   e D scende come ARGOMENTO in aiDecide(p,...,D) (che legge D.standoff e
   D.slideP) e in aiCarrier(p,...,D) -> aiPass(p,D) -> anticipa(p,'passo',
   ...,q=>eseguiAiPass(q,D)) -> eseguiAiPass(p,D) (che legge D.passErr).
   `anticipa'/`maturaAnticipi' richiamano SEMPRE il callback con lo STESSO
   giocatore che ha aperto la carica (go(p) su p.chargeGo, mai un altro
   indice) -- quindi D resta la manopola dello STESSO p per tutta la
   catena, anche dopo il ritardo del gesto. Cambiare la SOLA costruzione
   (manopoleDi(p.team) -> manopolaDi(p)) modula quindi TUTTI E TRE i
   campi, nei tre siti di lettura originali del progetto, senza toccare
   aiDecide/aiCarrier/eseguiAiPass. Le ancore C/D/E qui sotto NON cambiano
   quei tre siti (restano cerca===metti): sono CHECKPOINT, bloccano
   l'attrezzo se un refactor futuro li sposta o li riscrive senza
   avvertire chi legge questo file.

   IL QUARTO LETTORE TROVATO DAL GREP, DELIBERATAMENTE NON TOCCATO: a
   ~17110 (`eseguiAiPass(bp, manopoleDi(G.battuta.team))', la battuta di
   rimessa/punizione dentro la finestra di casa, voce #87) c'e' una
   chiamata DIRETTA a eseguiAiPass che bypassa aiMove/aiCarrier e quindi
   non passa mai per manopolaDi(p). Il commento di quella finestra dice
   che il fermo si scioglie "chiunque altro (umano incluso...) entro
   BATTUTA_HOLD secondi totali": bp puo' essere il giocatore di un umano
   che non ha battuto in tempo. E' esattamente il caso per cui lo spec
   dice "mai sull'input umano" e "non aggiungere modulazione altrove":
   quel sito resta con la manopola di squadra pura, non quella modulata.
   Un quinto lettore, a ~21289 (`manopoleDi(team).mira'), legge `.mira'
   -- un campo del CARATTERE, non uno dei tre tetti del canale MIND -- e
   resta fuori perimetro per lo stesso motivo (nessuna modulazione fuori
   dai tre campi dichiarati).

   6 ancore (definizione di manopolaDi, il cambio della costruzione in
   aiMove, i tre checkpoint di lettura D.standoff/D.slideP/D.passErr, la
   superficie __test).

   ZERO dado() NUOVO: manopolaDi(p) legge solo stati gia' calcolati
   (compito 2) e G.knob (compito 2/precedente); nessun sorteggio qui
   dentro. Il guardiano lo verifica contro il conteggio della sorgente.

   NON MUTA MAI G.knob[t]: quando i tre stati sono a zero restituisce D
   stesso (lo stesso oggetto, stesso indirizzo di manopoleDi(p.team));
   altrimenti restituisce una COPIA nuova (spread), mai una scrittura sui
   campi di D.

   uso:  node strumenti/_t-canale-mind.js --in fuori/x.html --out fuori/y.html
         node strumenti/_t-canale-mind.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/canale-mind.html'));

const ANCORE = [

{
  nome: '1. la definizione di manopolaDi(p), subito dopo manopoleDi(t)',
  cerca:
`function manopoleDi(t){ return (G.knob && G.knob[t]) || DIFF[G.diff]; }`,
  metti:
`function manopoleDi(t){ return (G.knob && G.knob[t]) || DIFF[G.diff]; }

/* =====================================================================
   IL CANALE DI GIOCO -- manopolaDi(p) (voce #117, compito 3, MIND v1).

   manopoleDi(t) resta la manopola DI SQUADRA: il carattere, invariato,
   G.knob[t] CONDIVISO dagli undici uomini della squadra t (popolato una
   volta sola in startMatch, mai mutato in-place). manopolaDi(p) e' la
   manopola DI QUEL GIOCATORE: parte da manopoleDi(p.team) e applica DOPO
   il carattere i tre tetti del canale MIND, relativi e con la STESSA
   formula per le due squadre:
     passErr diviso (1 + 0.15*p.umore)       -- tetto +-15%: umore alto,
                                                 meno errori di passaggio
     slideP  moltiplicato (1 + 0.25*p.nervi) -- tetto +25%: nervi alti,
                                                 piu' scivolate
     standoff moltiplicato (1 - 0.12*G.spinta[team]) -- spinta alta, la
                                                 squadra aspetta meno; su
                                                 Duro standoff parte gia'
                                                 da zero (DIFF[2].standoff)
                                                 e zero per qualunque cosa
                                                 fa zero: l'effetto li' e'
                                                 invisibile, va bene cosi'

   LA TRAPPOLA CHE QUESTA FUNZIONE EVITA: manopoleDi(p.team) restituisce
   G.knob[t], LO STESSO oggetto per tutti gli undici. Scrivere sui suoi
   campi corromperebbe ogni compagno di squadra (e il fotogramma dopo).
   Percio' D non si tocca MAI: quando i tre tetti non sono neutri si
   restituisce una COPIA nuova (uno spread, un oggetto per chiamata),
   mai G.knob[t].

   IL RITORNO NEUTRO E' ESATTO, MA SOLO A STATI ZERO: quando
   p.umore===0 && p.nervi===0 && G.spinta[p.team]===0 l'if qui sotto
   restituisce D stesso -- LO STESSO OGGETTO, allo stesso indirizzo di
   manopoleDi(p.team), PRIMA di qualunque copia o calcolo. A stati zero
   il gioco resta byte-identico a prima del canale: la divergenza dal
   gioco pre-canale nasce SOLO dopo il primo fatto emotivo -- esattamente
   come la garanzia dell'indirizzo identico di manopole() qui sopra, un
   piano piu' in basso (per giocatore, non per squadra).

   MAI SULL'INPUT UMANO: l'unico chiamante e' aiMove(p,dt), che gira SOLO
   per chi non e' isHuman (vedi updatePlayer: humanMove per l'uomo,
   aiMove per tutti gli altri). Il verbo che esce dal dito non passa mai
   da qui -- ne' D.standoff ne' D.slideP (aiDecide) ne' D.passErr
   (aiCarrier/aiPass/eseguiAiPass) leggono mai la manopola di un
   giocatore comandato dal dito. */
function manopolaDi(p){
  const D = manopoleDi(p.team);
  const spinta = G.spinta ? G.spinta[p.team] : 0;
  if(p.umore===0 && p.nervi===0 && spinta===0) return D;
  return {
    ...D,
    passErr: D.passErr / (1 + 0.15*p.umore),
    slideP: D.slideP * (1 + 0.25*p.nervi),
    standoff: Math.max(0, D.standoff * (1 - 0.12*spinta)),
  };
}`,
},

{
  nome: '2. la costruzione in aiMove: manopoleDi(p.team) -> manopolaDi(p)',
  cerca:
`  /* LE MANOPOLE SONO DELLA SQUADRA, NON DELLA PARTITA. Questa riga era
     \`const D=DIFF[G.diff]\`, cioe' la stessa testa per tutti e ventidue gli
     uomini in campo: due squadre non potevano giocare in due modi
     diversi nemmeno volendo. D scende poi in aiDecide e in aiCarrier
     come argomento, quindi cambiare qui cambia tutto il ramo. */
  const D=manopoleDi(p.team);`,
  metti:
`  /* LE MANOPOLE SONO DELLA SQUADRA, NON DELLA PARTITA. Questa riga era
     \`const D=DIFF[G.diff]\`, cioe' la stessa testa per tutti e ventidue gli
     uomini in campo: due squadre non potevano giocare in due modi
     diversi nemmeno volendo. D scende poi in aiDecide e in aiCarrier
     come argomento, quindi cambiare qui cambia tutto il ramo. */
  /* IL CANALE MIND (voce #117, compito 3): D non e' piu' la manopola DI
     SQUADRA, e' la manopola DI QUESTO GIOCATORE. manopolaDi(p) parte da
     manopoleDi(p.team) (il carattere, invariato) e applica i tre tetti
     di p.umore/p.nervi/G.spinta DOPO -- vedi la sua definizione qui
     sopra per la garanzia dell'indirizzo identico a stati zero. aiMove
     gira SOLO per chi non e' isHuman: il verbo del dito non passa mai
     da qui. */
  const D=manopolaDi(p);`,
},

{
  nome: '3. checkpoint (nessuna modifica) -- il sito di lettura D.standoff in aiDecide',
  cerca:
`      if(carrier && carrier.team!==myTeam && isCpuTeam && D.standoff>0 && p.contieni){
        /* pressing blando: contieni a distanza, lato porta (Facile/Normale) */
        const vx=myGoalX-carrier.x, vy=FH/2-carrier.y, vl=Math.max(1,len(vx,vy));
        p.aiTX=clamp(carrier.x+vx/vl*D.standoff*KPASSO, P_R, FW-P_R);
        p.aiTY=clamp(carrier.y+vy/vl*D.standoff*KPASSO, P_R, FH-P_R);
      }else{`,
  metti:
`      if(carrier && carrier.team!==myTeam && isCpuTeam && D.standoff>0 && p.contieni){
        /* pressing blando: contieni a distanza, lato porta (Facile/Normale) */
        const vx=myGoalX-carrier.x, vy=FH/2-carrier.y, vl=Math.max(1,len(vx,vy));
        p.aiTX=clamp(carrier.x+vx/vl*D.standoff*KPASSO, P_R, FW-P_R);
        p.aiTY=clamp(carrier.y+vy/vl*D.standoff*KPASSO, P_R, FH-P_R);
      }else{`,
},

{
  nome: '4. checkpoint (nessuna modifica) -- il sito di lettura D.slideP in aiDecide',
  cerca:
`        if(conviene && dado()<D.slideP) startSlide(p,nx,ny);`,
  metti:
`        if(conviene && dado()<D.slideP) startSlide(p,nx,ny);`,
},

{
  nome: '5. checkpoint (nessuna modifica) -- il sito di lettura D.passErr in eseguiAiPass',
  cerca:
`  const botch = dado()<D.passErr;`,
  metti:
`  const botch = dado()<D.passErr;`,
},

{
  nome: '6. la superficie __test: setUmore/setNervi/setSpinta/manopolaDi/manopoleDi',
  cerca:
`  get spinta(){ return G.spinta ? G.spinta.slice() : [0,0]; },`,
  metti:
`  get spinta(){ return G.spinta ? G.spinta.slice() : [0,0]; },
  /* IL CANALE (voce #117, compito 3): superficie per il banco CANALE/
     TETTI. setUmore/setNervi scrivono lo stato di UN giocatore (indice
     in G.players), clampati come clampStato (umore -1..+1, nervi 0..1);
     setSpinta scrive lo stato di UNA squadra (-1..+1). manopolaDi(idx)
     legge la manopola MODULATA di quel giocatore (i soli tre campi del
     canale, non l'intero oggetto knob); manopoleDi(team) legge la
     manopola DI SQUADRA, invariata -- lo stesso valore che il motore
     legge quando i tre stati sono a zero (il neutro esatto). Nessun
     sorteggio qui dentro: sola lettura e scrittura di stato. */
  setUmore(idx,v){ const p=G.players[idx]; if(!p) return null; p.umore=clampStato(+v||0,-1,1); return p.umore; },
  setNervi(idx,v){ const p=G.players[idx]; if(!p) return null; p.nervi=clampStato(+v||0,0,1); return p.nervi; },
  setSpinta(team,v){ if(!G.spinta) G.spinta=[0,0]; const t2=team?1:0; G.spinta[t2]=clampStato(+v||0,-1,1); return G.spinta[t2]; },
  manopolaDi(idx){ const p=G.players[idx]; if(!p) return null; const m=manopolaDi(p); return {passErr:m.passErr, slideP:m.slideP, standoff:m.standoff}; },
  manopoleDi(team){ const m=manopoleDi(team?1:0); return {passErr:m.passErr, slideP:m.slideP, standoff:m.standoff}; },`,
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

/* CONTEGGI A DELTA. */
const conta = (testo, s) => testo.split(s).length - 1;
const rotti = [];
if (conta(out, 'function manopolaDi(p){') !== 1) rotti.push('la definizione di manopolaDi(p) non e\' presente esattamente una volta');
if (conta(out, 'const D=manopolaDi(p);') !== 1) rotti.push('la costruzione modulata in aiMove non e\' presente esattamente una volta');
if (conta(out, 'const D=manopoleDi(p.team);') !== 0) rotti.push('la vecchia costruzione manopoleDi(p.team) e\' ancora presente: il sito non e\' stato cambiato');
if (conta(out, 'if(carrier && carrier.team!==myTeam && isCpuTeam && D.standoff>0 && p.contieni){') !== 1) rotti.push('il checkpoint D.standoff non e\' presente esattamente una volta: il sito di lettura si e\' spostato o e\' cambiato');
if (conta(out, 'if(conviene && dado()<D.slideP) startSlide(p,nx,ny);') !== 1) rotti.push('il checkpoint D.slideP non e\' presente esattamente una volta: il sito di lettura si e\' spostato o e\' cambiato');
if (conta(out, 'const botch = dado()<D.passErr;') !== 1) rotti.push('il checkpoint D.passErr non e\' presente esattamente una volta: il sito di lettura si e\' spostato o e\' cambiato');
if (conta(out, 'setUmore(idx,v){') !== 1) rotti.push('__test.setUmore non e\' presente esattamente una volta');
if (conta(out, 'setNervi(idx,v){') !== 1) rotti.push('__test.setNervi non e\' presente esattamente una volta');
if (conta(out, 'setSpinta(team,v){') !== 1) rotti.push('__test.setSpinta non e\' presente esattamente una volta');
if (conta(out, 'manopolaDi(idx){') !== 1) rotti.push('__test.manopolaDi non e\' presente esattamente una volta');
if (conta(out, 'manopoleDi(team){') !== 1) rotti.push('__test.manopoleDi non e\' presente esattamente una volta');
/* IL SITO NON TOCCATO (voce #87, la battuta): deve restare con la
   manopola DI SQUADRA, mai quella modulata -- il quarto lettore
   dichiarato nella lettera di testa, deliberatamente fuori perimetro. */
if (conta(out, 'eseguiAiPass(bp, manopoleDi(G.battuta.team));') !== 1) rotti.push('il sito della battuta (voce #87) non legge piu\' manopoleDi(team) come atteso: e\' stato toccato per errore, o si e\' spostato');
if (conta(out, 'dado()') !== conta(src, 'dado()')) rotti.push('il numero di chiamate a dado() e\' cambiato: zero dado() nel codice nuovo e\' un vincolo assoluto');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
