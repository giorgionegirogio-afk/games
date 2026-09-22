/* =====================================================================
   _toppa-carta-codice.js — IL CODICE SI GENERA E SI LEGGE
   (voce #135, compito 2).

   IL DIFETTO: la sfida di questo gioco esiste solo se esiste un server.
   `Sfida.cerca` chiede un avversario a `/api/avversario`, `Sfida.guarda`
   chiede un nastro a `/api/classifica`, `chiudiSfida` spedisce. Due
   persone sedute allo stesso tavolo, senza campo, non possono sfidarsi.
   Il mandato (S5, punto 12b) chiede l'altra meta': un codice da
   incollare che contenga TUTTA la partita.

   LA CURA, e sta tutta qui dentro: un formato, due funzioni che lo
   scrivono e lo leggono, e le tre porte che aprono la partita
   (crearla, giocarla da un codice, chiuderla col punteggio dentro).
   Niente schermo: quello e' il compito 4.

   IL DIVIETO CHE REGGE IL CANTIERE, e va riletto ogni volta che si
   tocca questo blocco. `Rete.codiceTrasferimento()` produce
   `id.segreto.controllo` e chi lo incolla DIVENTA quella squadra
   (`accettaTrasferimento` scrive m.id e m.segreto): mandarlo a un amico
   per sfidarlo vuol dire regalargli la squadra. Di quel codice qui si
   riusa la FORMA del controllo — s = (s*31 + v) >>> 0 — e nient'altro.
   Nel codice della sfida non entra niente che dipenda da CHI lo
   genera: ne' l'id, ne' il segreto, ne' il nome della squadra, ne' i
   nomi dei giocatori. Il cancello `_q-carta` gruppo B lo misura nel
   solo modo che discrimina davvero: due telefoni con identita' diverse
   e la stessa partita devono dare lo STESSO codice, carattere per
   carattere.

   uso:  node strumenti/_toppa-carta-codice.js --out fuori/x.html
         node strumenti/_toppa-carta-codice.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const dentro = process.argv.includes('--dentro');
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = dentro ? inFile : path.resolve(RADICE, arg('out', 'fuori/gioco-carta-codice.html'));

/* ============================================================ 1) il formato */
const A1 = `/* i colori arrivano dalla rete: si guardano uno per uno prima di`;
const B1 = `/* =====================================================================
   LA SFIDA DI CARTA — TUTTA LA PARTITA DENTRO UN CODICE (voce #135).

   A CHE SERVE. Le quattro voci dell'onda D hanno costruito la sfida di
   RETE e il suo giudizio, e tutte e quattro poggiano su una cosa: c'e'
   un server. Questo blocco e' l'altra meta': due persone si sfidano
   incollandosi un codice, senza conto, senza rete, senza server. Chi lo
   riceve gioca la STESSA identica partita — stesso seme, stesse due
   rose, stesso avversario, stessa durata — e scopre se ha fatto meglio.

   IL DIVIETO, ed e' la ragione per cui questo codice non e' quello che
   c'era gia'. Rete.codiceTrasferimento() produce id.segreto.controllo,
   e Rete.accettaTrasferimento scrive m.id e m.segreto: CHI LO INCOLLA
   DIVENTA QUELLA SQUADRA. Darlo a un amico per sfidarlo vuol dire
   regalargli la squadra, i punti e la facolta' di giocare a nome tuo —
   ed e' scritto in grassetto nel pannello che lo mostra. Qui di quel
   codice si riusa soltanto la FORMA del controllo, s = (s*31+v)>>>0.

   DENTRO NON C'E' NESSUNO. Non l'id, non il segreto, non il nome della
   squadra, non i nomi dei giocatori. Dell'avversario viaggia l'INDICE
   di carattere — un numero fra -1 e 9 — come gia' fa il nastro dalla
   voce #132 (grep «Nel nastro va il RISULTATO della tabella, non il suo
   ingresso»). Il codice e' funzione della SOLA PARTITA: due telefoni
   diversi che compongono la stessa sfida scrivono lo stesso codice,
   carattere per carattere, ed e' cosi' che il cancello lo misura.

   IL FORMATO, campo per campo (350 bit tondi con due rose da cinque):

     versione            4    un formato che cambia dev'essere riconoscibile
     MOTORE_V            4    due motori diversi non fanno la stessa partita
     taglia              2    indice in [5,7,11]
     seme               32    quello che SEME.accendi usa
     postura di casa     2    G.ment[0] (voce #132)
     postura di fuori    2    G.ment[1]
     carattere           4    indiceCarattere+1, 0 = nessuno (voce #132)
     gol di casa         5    il punteggio da battere
     gol di fuori        5
     uomini di casa      5    0..24, come impaccaRosa
     uomini di fuori     5
     gli attributi      28 per uomo, quattro numeri da 7 bit (1..99)

   FUORI, in base32 di Crockford (niente I, L, O, U: le quattro lettere
   che chi ricopia a mano sbaglia), con davanti la parola CARTA e in
   coda quattro simboli di controllo. MISURATO: 79 caratteri, una parola
   sola — ci sta in un SMS, e una parola sola si seleziona col doppio
   tocco, mentre un codice spezzato dai trattini si copia a meta'.

   IL CONTROLLO E' DI QUATTRO SIMBOLI, cioe' 20 bit, e non di uno.
   MISURATO in modo esaustivo (_q-carta, gruppo A): una cifra cambiata
   2294 su 2294, due cifre scambiate 2614 su 2614, cento per cento tutte
   e due. Non e' fortuna ed e' dimostrabile: una cifra cambiata sposta
   l'accumulatore di delta*31^k, e 31^k e' dispari quindi invertibile
   modulo 2^20, e |delta| <= 31 non puo' annullarlo; uno scambio lo
   sposta di (a-b)*31^m*(31^d - 1), e la potenza di due che divide
   31^d - 1 vale 1 per d dispari e 5+v2(d) per d pari, quindi per
   arrivare a 20 servirebbe d >= 2048, cioe' un codice trenta volte piu'
   lungo di questo. Con UN carattere solo il tasso misurato scende al
   97,5%: un codice storto su quaranta passerebbe, e chi lo gioca
   giocherebbe una partita diversa senza saperlo. Sono tre caratteri in
   piu' su settantanove.

   E IL CODICE NON PORTA UNA PROVA, che e' la rinuncia dichiarata di
   questa funzione: non c'e' un nastro dentro (un nastro pesa migliaia
   di byte, misurato alla voce #133) e quindi non c'e' niente da
   giudicare. La sfida di carta e' un gioco fra due persone che si
   fidano, come un punteggio detto ad alta voce. Chi vuole un verdetto
   usa la SFIDA di rete, che il giudice ce l'ha.
   ===================================================================== */
const CARTA_VER = 1;
const CARTA_ALF = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const CARTA_VAL = (function(){
  const m = {};
  for(let i=0;i<CARTA_ALF.length;i++) m[CARTA_ALF[i]] = i;
  /* le tre confusioni di chi ricopia a mano: la U non c'e' e non si
     perdona, perche' e' quella che nessuno scambia per caso */
  m.I = 1; m.L = 1; m.O = 0;
  return m;
})();
/* I DUE NOMI SONO FISSI, e non e' pigrizia: il nome della squadra
   decide i nomi dei rincalzi (rosaAvversaria('QUARTIERE·'+G.teamName))
   e delle due panchine ('PANCHINA·'+G.teamName), e rosaAvversaria legge
   SAVE.rosa per non ripetere i cognomi gia' in casa. Un nome che viene
   dal telefono e' un canale che entra dalla finestra: due telefoni
   giocherebbero due partite un po' diverse. Fissarli e' anche quel che
   tiene i dati personali fuori dal codice. */
const CARTA_CASA = 'SFIDANTE';
const CARTA_FUORI = 'AVVERSARI';
/* LA SFIDA DI CARTA SI GIOCA A CINQUE, e il formato porta la taglia
   lo stesso perche' domani possa aprirsi senza cambiare formato.
   PERCHE' SOLO CINQUE: la rosa del gioco e' da cinque (nuovaRosa), e a
   sette o a undici setupPlayers completa la squadra di casa con i
   «rincalzi di quartiere», che sono uomini PIATTI — quattro numeri
   uguali fra loro — e formaSquadre li sparge usando il loro NOME come
   asse. Quei nomi escono da rosaAvversaria, che legge SAVE.rosa: due
   telefoni con rose diverse schiererebbero due squadre diverse. A
   cinque non c'e' nessun rincalzo e il canale non esiste. */
const CARTA_TAGLIE = [5];

function cartaControllo(sim){
  let s = 0;
  for(let i=0;i<sim.length;i++) s = (s*31 + sim[i]) >>> 0;
  return s % 1048576;             /* 2^20, quattro simboli da cinque bit */
}

function impaccaCarta(o){
  o = o || {};
  const bits = [];
  const met = (v, n) => { for(let i=n-1;i>=0;i--) bits.push((v>>>i) & 1); };
  const rA = Array.isArray(o.rosaA) ? o.rosaA.slice(0,24) : [];
  const rD = Array.isArray(o.rosaD) ? o.rosaD.slice(0,24) : [];
  met((o.ver === undefined ? CARTA_VER : (o.ver|0)) & 15, 4);
  met((o.motore === undefined ? MOTORE_V : (o.motore|0)) & 15, 4);
  met(Math.max(0, [5,7,11].indexOf(o.taglia|0)) & 3, 2);
  met(o.seme >>> 0, 32);
  met(mentValida(o.mentA) & 3, 2);
  met(mentValida(o.mentD) & 3, 2);
  met((Math.max(-1, Math.min(14, o.car|0)) + 1) & 15, 4);
  met(Math.max(0, Math.min(31, o.golA|0)), 5);
  met(Math.max(0, Math.min(31, o.golD|0)), 5);
  met(rA.length & 31, 5);
  met(rD.length & 31, 5);
  /* LA STESSA REGOLA DELLA SORGENTE (voce #132, compito 3): attrRosa e
     non «v|0», cosi' quel che il codice scrive e quel che il campo
     schiera passano dalla stessa porta. */
  for(const g of rA.concat(rD)){
    met(attrRosa(g && g.vel) & 127, 7);
    met(attrRosa(g && g.tiro) & 127, 7);
    met(attrRosa(g && g.tecnica) & 127, 7);
    met(attrRosa(g && g.tackle) & 127, 7);
  }
  while(bits.length % 5) bits.push(0);
  const sim = [];
  for(let i=0;i<bits.length;i+=5){
    let v = 0;
    for(let k=0;k<5;k++) v = (v<<1) | (bits[i+k] || 0);
    sim.push(v);
  }
  const c = cartaControllo(sim);
  sim.push((c>>>15) & 31, (c>>>10) & 31, (c>>>5) & 31, c & 31);
  let out = 'CARTA';
  for(let i=0;i<sim.length;i++) out += CARTA_ALF[sim[i]];
  return out;
}

/* e il verso opposto. Torna {errore:'...'} e mai un'eccezione: questo
   testo arriva da un incollaggio, cioe' dal posto piu' sporco che
   esista — spazi, a capo, minuscole, trattini messi dalla
   messaggistica, e a volte il codice di un'altra cosa. */
function spaccaCarta(testo){
  let t = String(testo == null ? '' : testo).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if(t.indexOf('CARTA') !== 0) return { errore:'non-e-una-sfida' };
  t = t.slice(5);
  if(t.length < 20) return { errore:'troppo-corto' };
  const sim = [];
  for(let i=0;i<t.length;i++){
    const v = CARTA_VAL[t.charAt(i)];
    if(v === undefined) return { errore:'lettera-strana' };
    sim.push(v);
  }
  const corpo = sim.slice(0, sim.length - 4), coda = sim.slice(sim.length - 4);
  const c = cartaControllo(corpo);
  if(coda[0] !== ((c>>>15) & 31) || coda[1] !== ((c>>>10) & 31) ||
     coda[2] !== ((c>>>5) & 31) || coda[3] !== (c & 31)) return { errore:'controllo' };
  const bits = [];
  for(let i=0;i<corpo.length;i++) for(let k=4;k>=0;k--) bits.push((corpo[i]>>>k) & 1);
  let p = 0, fuori = false;
  const leggi = n => {
    if(p + n > bits.length){ fuori = true; return 0; }
    let v = 0;
    for(let i=0;i<n;i++) v = (v<<1) | bits[p+i];
    p += n;
    return v >>> 0;
  };
  const ver = leggi(4);
  if(ver !== CARTA_VER) return { errore:'altra-versione', ver:ver };
  const motore = leggi(4);
  if(motore !== MOTORE_V) return { errore:'altro-motore', motore:motore };
  const iT = leggi(2), seme = leggi(32);
  const taglia = [5,7,11][iT] || 0;
  if(!taglia) return { errore:'taglia-strana' };
  const mentA = mentValida(leggi(2)), mentD = mentValida(leggi(2));
  const car = leggi(4) - 1;
  const golA = leggi(5), golD = leggi(5);
  const nA = leggi(5), nD = leggi(5);
  const pesca = n => {
    const r = [];
    for(let i=0;i<n;i++) r.push({ vel:leggi(7), tiro:leggi(7), tecnica:leggi(7), tackle:leggi(7) });
    return r;
  };
  const rosaA = pesca(nA), rosaD = pesca(nD);
  if(fuori) return { errore:'troppo-corto' };
  if(nA < 4 || nD < 4) return { errore:'rose-corte' };
  return { ver:ver, motore:motore, taglia:taglia, seme:seme, mentA:mentA, mentD:mentD,
           car:car, golA:golA, golD:golD, rosaA:rosaA, rosaD:rosaD };
}

/* =====================================================================
   I VENTI NOMI, E PERCHE' NON PASSANO DA rosaAvversaria.

   rosaAvversaria inietta SAVE.rosa nei nomi gia' usati (grep
   «usatiN.add»), per non far chiamare un avversario come un uomo di
   casa: ottima regola, e qui e' un veleno — due telefoni con rose
   diverse otterrebbero venti nomi diversi dallo stesso seme, e i nomi
   non sono solo cosmetica (vestiDalNome, formaSquadre, le panchine).
   Qui il nome e' funzione del SOLO seme, per costruzione, e nessuno
   legge SAVE.
   ===================================================================== */
function nomiDiCarta(seme, quanti, sale){
  let h = (Math.imul(seme >>> 0, 2654435761) ^ improntaTesto(sale)) >>> 0;
  const passo = () => { h ^= h<<13; h >>>= 0; h ^= h>>>17; h >>>= 0; h ^= h<<5; h >>>= 0; return h >>> 0; };
  const out = [], usatiN = {}, usatiC = {};
  for(let i=0;i<quanti;i++){
    let a = passo() % NOMI_ROSA.length, g = 0;
    while(usatiN[a] && g++ < NOMI_ROSA.length) a = (a+1) % NOMI_ROSA.length;
    usatiN[a] = 1;
    let b = passo() % COGNOMI_ROSA.length; g = 0;
    while(usatiC[b] && g++ < COGNOMI_ROSA.length) b = (b+1) % COGNOMI_ROSA.length;
    usatiC[b] = 1;
    out.push(NOMI_ROSA[a] + ' ' + COGNOMI_ROSA[b]);
  }
  return out;
}

/* LA ROSA DELL'AVVERSARIO nasce dal seme, attorno alla forza di chi
   sfida: una sfida contro una squadra che non c'entra niente non e' una
   sfida, e' un compito. Nel codice ci finisce comunque per intero,
   quindi chi la riceve non ha bisogno di sapere questa regola. */
function rosaDiCarta(seme, media, quanti){
  let h = (Math.imul(seme >>> 0, 40503) ^ 0x9E3779B9) >>> 0;
  const passo = () => { h ^= h<<13; h >>>= 0; h ^= h>>>17; h >>>= 0; h ^= h<<5; h >>>= 0; return h / 4294967296; };
  const base = Math.max(30, Math.min(92, Math.round(media))) - 4 + ((passo()*9)|0);
  const r = [];
  for(let i=0;i<(quanti||5);i++)
    r.push({ vel:    attrRosa(base + ((passo()*17)|0) - 8),
             tiro:   attrRosa(base + ((passo()*17)|0) - 8),
             tecnica:attrRosa(base + ((passo()*17)|0) - 8),
             tackle: attrRosa(base + ((passo()*17)|0) - 8) });
  return r;
}

/* LA SFIDA, COMPOSTA MA NON ANCORA APERTA. Legge SAVE.rosa (gli
   ATTRIBUTI, che sono la partita) e SAVE.mentalita (la postura, che e'
   la partita anche lei). NON legge il nome della squadra, ne' i nomi
   della rosa, ne' l'identita' di rete: e' la riga che decide se il
   codice e' funzione della sola partita. */
function componiCarta(seme, taglia){
  const s = (seme === undefined || seme === null)
    ? ((Math.random() * 4294967296) >>> 0) : (seme >>> 0);
  const tg = [5,7,11].indexOf(taglia|0) >= 0 ? (taglia|0) : 5;
  const src = Array.isArray(SAVE.rosa) ? SAVE.rosa : [];
  const rosaA = [];
  for(let i=0;i<Math.min(24, src.length);i++){
    const g = src[i] || {};
    rosaA.push({ vel:attrRosa(g.vel), tiro:attrRosa(g.tiro),
                 tecnica:attrRosa(g.tecnica), tackle:attrRosa(g.tackle) });
  }
  let med = 62;
  if(rosaA.length){
    let t = 0;
    for(const g of rosaA) t += (g.vel + g.tiro + g.tecnica + g.tackle) / 4;
    med = Math.round(t / rosaA.length);
  }
  /* L'AVVERSARIO E' UN INDICE, NON UN NOME (voce #132): zero dati
     personali, e i due telefoni leggono la stessa tabella. -1 vuol dire
     «nessun carattere», cioe' la CPU di sempre. */
  const car = (s % (CAR_NOMI.length + 1)) - 1;
  return { ver:CARTA_VER, motore:MOTORE_V, taglia:tg, seme:s,
           mentA:mentValida(SAVE.mentalita), mentD:mentValida((s >>> 7) % 3),
           car:car, golA:0, golD:0,
           rosaA:rosaA, rosaD:rosaDiCarta(s, med, rosaA.length || 5) };
}

/* il nome che la squadra di fuori porta in campo: deriva dall'INDICE,
   cioe' da una tabella che i due telefoni hanno uguale per costruzione */
function nomeDiCarta(car){
  return (car >= 0 && car < CAR_NOMI.length) ? CAR_NOMI[car] : CARTA_FUORI;
}

/* =====================================================================
   LA PARTITA SI APRE, ED E' LA STESSA SU OGNI TELEFONO.

   L'ordine e' quello provato dal banco del replay (voce #131,
   _q-replay.js prova A) e lo stesso di Sfida.gioca: G.sfida per primo,
   perche' durataPartita() lo legge dentro startMatch e senza di lui il
   cronometro seguirebbe SAVE.durata — cioe' due telefoni con due
   preferenze diverse giocherebbero due partite di lunghezza diversa.
   Poi il seme, perche' startMatch pesca subito il primo dado
   (G.kickTeam). Poi la partita.

   sponde:'gabbia' e miraGuidata:'pieno' sono forzate per la stessa
   ragione per cui le forza Sfida.gioca (voci #87 e #113): sono
   impostazioni LOCALI, e due telefoni con scelte diverse girerebbero su
   due motori diversi.

   IL REGISTRO RESTA SPENTO: non c'e' nessun nastro da scrivere, e un
   registro acceso da un'altra parte del gioco muoverebbe i suoi tick
   dentro questa partita.
   ===================================================================== */
function apriCarta(o, daBattere){
  if(!o || o.errore) return { errore:(o && o.errore) || 'codice-assente' };
  if(CARTA_TAGLIE.indexOf(o.taglia|0) < 0) return { errore:'taglia-non-prevista' };
  if(!Array.isArray(o.rosaA) || o.rosaA.length < 4 ||
     !Array.isArray(o.rosaD) || o.rosaD.length < 4) return { errore:'rose-corte' };
  const nomiA = nomiDiCarta(o.seme, o.rosaA.length, 'CASA');
  const nomiD = nomiDiCarta(o.seme, o.rosaD.length, 'FUORI');
  const nomeD = nomeDiCarta(o.car);
  const vesti = (r, nomi) => r.map((g, i) => ({ nome:nomi[i] || 'GIOCATORE',
    vel:attrRosa(g.vel), tiro:attrRosa(g.tiro), tecnica:attrRosa(g.tecnica), tackle:attrRosa(g.tackle) }));
  try{ Reg.spegni(); }catch(e){}
  G.sfida = { seme:String(o.seme >>> 0), taglia:o.taglia|0, chi:nomeD,
              vero:false, replay:false, nomePrima:G.teamName,
              carta:{ dati:o, daBattere: daBattere ? [daBattere[0]|0, daBattere[1]|0] : null } };
  SEME.accendi(o.seme >>> 0);
  startMatch(1, SFIDA_DIFF, {
    size: o.taglia|0,
    sponde: 'gabbia',
    miraGuidata: 'pieno',
    mia: { n:CARTA_CASA, c1:'#3355aa', c2:'#111820', pat:0, ment:o.mentA, rosa:vesti(o.rosaA, nomiA) },
    opp: { n:nomeD, c1:'#cf3e6b', c2:'#123a80', pat:1, ment:o.mentD, car:o.car, rosa:vesti(o.rosaD, nomiD) },
  });
  return { ok:true, chi:nomeD, taglia:o.taglia|0, seme:o.seme >>> 0 };
}

/* i colori arrivano dalla rete: si guardano uno per uno prima di`;

/* ==================================================== 2) le porte di Sfida */
const A2 = `  /* ------------------------------------------------- il trasferimento */
  apriCodice(){`;
const B2 = `  /* ---------------------------------------------- la sfida di carta */
  /* il codice dell'ultima sfida di carta finita su questo telefono, la
     sfida che si e' incollata e com'e' andata. Tre cose che vivono
     quanto la sessione: non toccano il salvataggio, perche' non sono
     una proprieta' della squadra. */
  cartaCodice: '',
  cartaLetta: null,
  cartaEsito: '',
  /* SI CREA: seme a caso, avversario dal seme, e si scende in campo. Il
     codice non esiste ancora, e non puo' esistere — dentro ci va il
     punteggio, e il punteggio lo fa il pollice. Nasce a chiudiSfida. */
  cartaNuova(opz){
    opz = opz || {};
    const o = componiCarta(opz.seme, opz.taglia);
    const r = apriCarta(o, null);
    if(r.errore) return r;
    this.cartaCodice = ''; this.cartaLetta = null; this.cartaEsito = '';
    try{ hide($('sfidaCarta')); }catch(e){}
    return r;
  },
  /* SI RICEVE: si legge il codice e si scende nella stessa partita, col
     punteggio da battere in tasca. */
  cartaGioca(testo){
    const o = spaccaCarta(testo);
    if(o.errore) return o;
    const r = apriCarta(o, [o.golA, o.golD]);
    if(r.errore) return r;
    this.cartaLetta = o; this.cartaEsito = '';
    try{ hide($('sfidaCarta')); }catch(e){}
    return r;
  },
  /* la causa, in italiano, per chi ha incollato qualcosa che non va */
  perCarta(errore){
    switch(errore){
      case 'non-e-una-sfida':  return 'Questo non è un codice di sfida: un codice di sfida comincia per CARTA. Se quello che hai incollato ha dei punti dentro, è il codice del CAMBIO TELEFONO — quello non si manda a nessuno, chi lo incolla diventa la tua squadra.';
      case 'controllo':        return 'Il codice non torna: manca o è cambiato qualche carattere. Si copia per intero, dalla C di CARTA all\\'ultima lettera.';
      case 'troppo-corto':     return 'Il codice è arrivato a metà: ne manca un pezzo in fondo.';
      case 'lettera-strana':   return 'Nel codice c\\'è una lettera che non gli appartiene: probabilmente il messaggio ne ha mangiato o aggiunto una.';
      case 'altro-motore':     return 'Questa sfida è stata costruita con un\\'altra versione del gioco: la stessa partita, oggi, finirebbe in un altro modo. Chiedi un codice nuovo.';
      case 'altra-versione':   return 'Questo codice è di un formato che questa versione del gioco non sa leggere.';
      case 'taglia-non-prevista': return 'La sfida di carta si gioca cinque contro cinque, e questo codice chiede un\\'altra taglia.';
      case 'rose-corte':       return 'Il codice non porta due squadre complete.';
      case 'taglia-strana':    return 'Il codice porta una taglia di campo che non esiste.';
      default:                 return 'Questo codice non si riesce a leggere.';
    }
  },

  /* ------------------------------------------------- il trasferimento */
  apriCodice(){`;

/* ============================================ 3) il ramo di chiudiSfida */
const A3 = `  if(S.replay){
    /* UN REPLAY NON PAGA. Non e' una partita che hai giocato: niente`;
const B3 = `  /* =====================================================================
     LA SFIDA DI CARTA SI CHIUDE QUI (voce #135).

     Due cose, e sono i due lati dello stesso codice:
       · se questa partita e' nata da CREA, il codice nasce adesso —
         prima del fischio finale il punteggio non c'era;
       · se e' nata da un codice INCOLLATO, adesso si sa se hai fatto
         meglio di chi te l'ha mandata.

     E NON PAGA E NON INSEGNA. Niente monete, niente crescita della
     rosa, niente trofei (G.matchRewarded), e Rete.imparaIndole non
     gira: in campo non c'e' la tua squadra, c'e' quella del codice, e
     far crescere la propria rosa giocando con quella di un altro
     sarebbe un imbroglio verso se stessi. E' la stessa regola del
     replay, per la stessa ragione.

     CHI HA FATTO MEGLIO: prima la differenza reti, poi i gol fatti. Due
     partite identiche finite 3-1 e 4-2 valgono uguale di differenza, e
     allora vince chi ha segnato di piu'.

     NON PARTE NIENTE PER LA RETE, e il return qui sotto e' quel che lo
     garantisce: senza, questa partita finirebbe nella coda di
     Rete.manda come se fosse una sfida di rete — che non e', e che
     nessun server ha mai assegnato.
     ===================================================================== */
  if(S.carta){
    G.matchRewarded = true;
    if(S.nomePrima !== undefined) G.teamName = S.nomePrima;
    try{ applyKit(); refreshTeamRGB(); }catch(e){}
    const o = S.carta.dati;
    if(o){
      const pieno = { ver:CARTA_VER, motore:MOTORE_V, taglia:o.taglia, seme:o.seme,
                      mentA:o.mentA, mentD:o.mentD, car:o.car, golA:ga, golD:gd,
                      rosaA:o.rosaA, rosaD:o.rosaD };
      try{ Sfida.cartaCodice = impaccaCarta(pieno); }catch(e){ Sfida.cartaCodice = ''; }
    }
    const b = S.carta.daBattere;
    if(b){
      const mio = ga - gd, suo = (b[0]|0) - (b[1]|0);
      const come = (mio > suo || (mio === suo && ga > (b[0]|0))) ? 'meglio'
                 : ((mio < suo || (mio === suo && ga < (b[0]|0))) ? 'peggio' : 'pari');
      Sfida.cartaEsito = come;
      const dice = come === 'meglio' ? ['scopa','HAI FATTO MEGLIO']
                 : (come === 'pari'  ? ['fischietto','SIETE PARI'] : ['fischietto','NON CI SEI RIUSCITO']);
      try{ toast(dice[0], dice[1], 'Tu ' + ga + '-' + gd + ', chi ti ha sfidato ' + (b[0]|0) + '-' + (b[1]|0) + '.'); }catch(e){}
    }else{
      Sfida.cartaEsito = '';
      try{ toast('scopa','IL CODICE È PRONTO','Sta nella schermata SFIDA, sotto SFIDA DI CARTA: copialo e mandalo.'); }catch(e){}
    }
    return;
  }
  if(S.replay){
    /* UN REPLAY NON PAGA. Non e' una partita che hai giocato: niente`;

/* ===================================== 4) l'indole non impara dalla carta */
const A4 = `  if(!Giudizio.attivo){ try{ Rete.imparaIndole(); }catch(e){} }`;
const B4 = `  /* E NEMMENO DA UNA SFIDA DI CARTA (voce #135): la rosa in campo non e'
     la tua, e imparare «come giochi» da una partita giocata con la
     squadra di un altro sporcherebbe l'indole che viaggia col tuo
     profilo. Stessa ragione del giudizio, riga qui sopra. */
  if(!Giudizio.attivo && !(G.sfida && G.sfida.carta)){ try{ Rete.imparaIndole(); }catch(e){} }`;

/* ============================== 5) il bottone di fine partita e sfidaFine */
const A5 = `  ui.btnRivincita.textContent = G.sfidaFine===1 ? 'ALTRA SFIDA'
    : G.sfidaFine===2 ? 'LE SFIDE'`;
const B5 = `  ui.btnRivincita.textContent = G.sfidaFine===1 ? 'ALTRA SFIDA'
    : G.sfidaFine===3 ? 'IL CODICE'
    : G.sfidaFine===2 ? 'LE SFIDE'`;

const A6 = `  G.sfidaFine = S ? (S.replay ? 2 : 1) : 0;`;
const B6 = `  /* 3 e' la sfida di carta: il bottone di fine partita non promette una
     rivincita (quella partita e' unica per costruzione) e non dice «le
     sfide», che sono quelle di rete — dice IL CODICE, che e' la cosa
     che serve adesso (voce #135). */
  G.sfidaFine = S ? (S.carta ? 3 : (S.replay ? 2 : 1)) : 0;`;

/* ================================= 6) chi esce a meta' da una di carta */
const A7 = `  if(!S.replay) toast('fischietto','SFIDA ABBANDONATA','Non è stata mandata: non conta né in bene né in male.');`;
const B7 = `  if(S.carta) toast('fischietto','SFIDA DI CARTA LASCIATA','Non è finita, quindi non c\\'è nessun codice e nessun confronto.');
  else if(!S.replay) toast('fischietto','SFIDA ABBANDONATA','Non è stata mandata: non conta né in bene né in male.');`;

/* ========================================== 7) la porta per il banco */
const A8 = `  get sfida(){ return Sfida; },`;
const B8 = `  get sfida(){ return Sfida; },
  /* LA SFIDA DI CARTA, aperta al banco (voce #135). \`componi\` e
     \`impacca\` sono separate apposta: il cancello deve poter costruire
     la STESSA sfida su due telefoni diversi e confrontare i due codici
     carattere per carattere — e' l'unica prova che scopre un codice che
     si porta dietro chi lo ha scritto. */
  get carta(){ return {
    ver: CARTA_VER,
    motore: MOTORE_V,
    taglie: CARTA_TAGLIE.slice(),
    componi: (seme, taglia) => componiCarta(seme, taglia),
    impacca: o => impaccaCarta(o),
    spacca: t => spaccaCarta(t),
    nuova: opz => Sfida.cartaNuova(opz),
    gioca: t => Sfida.cartaGioca(t),
    get codice(){ return Sfida.cartaCodice || ''; },
    get sfida(){ return Sfida.cartaLetta || null; },
    get esito(){ return Sfida.cartaEsito || ''; },
  }; },`;

/* ------------------------------------------------------------------ */
const src = fs.readFileSync(inFile, 'utf8');
const coppie = [[A1, B1], [A2, B2], [A3, B3], [A4, B4], [A5, B5], [A6, B6], [A7, B7], [A8, B8]];
const guai = [];
coppie.forEach(([a], i) => {
  const n = src.split(a).length - 1;
  if (n !== 1) guai.push('ancora ' + (i + 1) + ': trovata ' + n + ' volte invece di 1');
});
if (guai.length) { console.error('FALLITO:\n  ' + guai.join('\n  ')); process.exit(1); }

let out = src;
for (const [a, b] of coppie) out = out.replace(a, b);

const attesi = [
  ['const CARTA_VER = 1;', 1],
  ['function impaccaCarta(o){', 1],
  ['function spaccaCarta(testo){', 1],
  ['function componiCarta(seme, taglia){', 1],
  ['function apriCarta(o, daBattere){', 1],
  ['function nomiDiCarta(seme, quanti, sale){', 1],
  ['function rosaDiCarta(seme, media, quanti){', 1],
  ['  cartaNuova(opz){', 1],
  ['  cartaGioca(testo){', 1],
  ['  if(S.carta){', 1],
  ['get carta(){ return {', 1],
  /* quel che NON deve cambiare */
  ['const MOTORE_V = 2;', 1],
  ['function vagliaNastro(righe){', 1],
  ['function giudica(nastro, atteso, opz){', 1],
  ['codiceTrasferimento(){', 1],
  /* e il divieto, scritto nel codice: nessuno di questi due nomi deve
     comparire dentro il blocco della sfida di carta */
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));

/* LA GUARDIA DI SICUREZZA DELL'ATTREZZO, e non e' decorazione: il
   blocco nuovo non deve nominare ne' l'identita' di rete ne' il
   trasferimento. Se un giorno qualcuno ci mettesse dentro
   `Rete.mem().segreto`, questo attrezzo si rifiuta di scrivere. */
const i0 = out.indexOf('const CARTA_VER = 1;');
const i1 = out.indexOf('function apriCarta(o, daBattere){');
/* i COMMENTI si tolgono prima di guardare: il blocco PARLA dei nomi
   di squadra e del trasferimento, ed e' giusto che ne parli — non deve
   LEGGERLI. */
const senzaCommenti = t => t.replace(/\/\*[\s\S]*?\*\//g, ' ');
const blocco = senzaCommenti((i0 >= 0 && i1 > i0) ? out.slice(i0, i1) : '');
for (const vietato of ['mem()', 'segreto', 'codiceTrasferimento', 'teamName', 'SAVE.rosa[']) {
  if (blocco.indexOf(vietato) >= 0) rotti.push('IL BLOCCO DELLA SFIDA DI CARTA NOMINA «' + vietato + '»');
}
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il codice della sfida di carta si genera e si legge: otto ancore, +' + (out.length - src.length) + ' byte');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    prova:  node strumenti/_q-carta.js --solo A,B,C' + (dentro ? '' : ' --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/')));
