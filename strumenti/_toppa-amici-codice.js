/* =====================================================================
   _toppa-amici-codice.js — IL RISULTATO TORNA INDIETRO E DIVENTA UNA
   RIGA (voce #136, compito 2).

   IL DIFETTO: la sfida di carta (voce #135) e' un giro a META'. Mando
   settantanove caratteri, l'altro gioca la mia partita, il suo gioco gli
   dice se ha fatto meglio — e il mio telefono non lo sapra' mai. Due
   persone che si sfidano per un mese non hanno un posto dove guardare
   chi e' avanti.

   LA CURA, e non ha schermo: un codice di ventuno caratteri che torna
   indietro col risultato, e una classifica dei testa a testa che vive
   nel salvataggio locale. Niente server, niente conto, e soprattutto
   NIENTE IDENTITA' CHE VIAGGIA: nel codice ci sono il seme e i quattro
   numeri dei due punteggi, e basta. L'amico si chiama come lo chiami tu
   sul tuo telefono.

   NOVE ANCORE:
     1  i tre tetti, accanto a quelli degli inviti e per la stessa
        ragione d'ordine: loadSave gira mentre il file si carica, e un
        const letto prima della sua riga non e' undefined, e' un errore
        che spegne il gioco;
     2  `amici` nel defaultSave;
     3  la rilettura a whitelist, coi tre tetti riapplicati;
     4  impaccaEsito, spaccaEsito, esitoCarta e l'oggetto Amici;
     5  la terza serratura dentro spaccaCarta;
     6  i due campi di sessione in Sfida;
     7  il ramo S.carta di chiudiSfida: il codice di risposta di qua, il
        ricordo della propria sfida di la';
     8  Sfida.segnaCarta e le cause in italiano;
     9  window.__test.amici, la porta del banco.

   IL SALVATAGGIO RESTA v4, e non e' una scommessa: misurato al compito
   0 (fuori/_sonda-136-save.js) su un salvataggio vissuto di 37 chiavi —
   togliendone una non si perde niente sulle altre 36, aggiungendone una
   sconosciuta non si perde niente. Il precedente e' gia' dichiarato nel
   gioco accanto a `div`: «chiave additiva, versione ferma a v4».

   uso:  node strumenti/_toppa-amici-codice.js --out fuori/x.html
         node strumenti/_toppa-amici-codice.js --dentro
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
const outFile = dentro ? inFile : path.resolve(RADICE, arg('out', 'fuori/gioco-amici-codice.html'));

/* ========================================================== 1) i tetti */
const A1 = `const INV_TETTO = 3;`;
const B1 = `const INV_TETTO = 3;
/* =====================================================================
   I TRE TETTI DELLA CLASSIFICA DEGLI AMICI (voce #136), e stanno QUI
   per la stessa ragione d'ordine degli inviti qui sopra: loadSave()
   gira mentre il file si carica, e la whitelist deve conoscere i tetti
   prima che l'oggetto Amici esista, quindicimila righe piu' sotto.

   UNA LISTA CHE PUO' CRESCERE E NON E' TAPPATA PERDE LE RIGHE VECCHIE
   IN SILENZIO. Qui i tetti sono tre e nessuno dei tre e' silenzioso:

     AMICI_TETTO  venti amici. Quando ne arriva uno nuovo e la lista e'
                  piena esce il PIU' VECCHIO PER DATA — a parita' di
                  data il primo entrato — e la riga sotto il campo lo
                  dice per nome. E' il modello della coda delle sfide
                  (grep «m.coda.shift()»), con la differenza che li'
                  nessuno lo diceva.
     AMICI_SEMI   dodici partite ricordate per ogni amico, e servono a
                  non contare due volte lo stesso codice incollato due
                  volte, che e' lo sbaglio piu' probabile di tutti. Il
                  prezzo, dichiarato: una risposta piu' vecchia di dodici
                  partite CON QUELL'AMICO, reincollata, conterebbe due
                  volte. Lo sbaglio vero — il doppione subito — e' preso
                  sempre.
     AMICI_MIE    venti sfide create di cui il telefono ricorda il
                  proprio punteggio, cosi' un codice che torna non puo'
                  riscriverlo. Il prezzo: se ne mandi piu' di venti
                  senza che tornino, la ventunesima risposta si fida di
                  quel che dichiara il codice.
   ===================================================================== */
const AMICI_TETTO = 20;
const AMICI_SEMI = 12;
const AMICI_MIE = 20;`;

/* ================================================ 2) il defaultSave */
const A2 = `    lastRes:null,                 // ultimo risultato giocato, per la lavagna della home
  };
}`;
const B2 = `    lastRes:null,                 // ultimo risultato giocato, per la lavagna della home
    /* =================================================================
       LA CLASSIFICA DEGLI AMICI (voce #136), e la versione resta v4.

       CHIAVE ADDITIVA, misurato prima di scriverla
       (fuori/_sonda-136-save.js): su un salvataggio vissuto di 37
       chiavi, togliendone una non si perde niente sulle altre 36, e
       aggiungendone una che il gioco non conosce non si perde niente.
       E' la stessa dichiarazione che sta gia' accanto a \`div\`: «I
       salvataggi nati prima prendono il default: chiave additiva,
       versione ferma a v4».

       IL PREZZO, DETTO: chi gioca con questa versione e poi riapre una
       versione VECCHIA del gioco perde la classifica degli amici — la
       vecchia rilegge a whitelist e riscrive senza. Non e' un guasto
       nuovo, e' come questo salvataggio si comporta da sempre per
       qualunque chiave; ma qui dentro c'e' il lavoro di un mese di
       sfide, e chi non lo sa lo scopre dopo.

       righe: i testa a testa. mie: le sfide che HO creato, col mio
       punteggio, perche' un codice che torna non me lo riscriva.
       ================================================================= */
    amici:{ righe:[], mie:[] },
  };
}`;

/* ================================================ 3) la rilettura */
const A3 = `    if(Array.isArray(j.lastRes)&&j.lastRes.length===2&&isFinite(j.lastRes[0])&&isFinite(j.lastRes[1]))
      s.lastRes=[Math.max(0,j.lastRes[0]|0), Math.max(0,j.lastRes[1]|0)];`;
const B3 = `    if(Array.isArray(j.lastRes)&&j.lastRes.length===2&&isFinite(j.lastRes[0])&&isFinite(j.lastRes[1]))
      s.lastRes=[Math.max(0,j.lastRes[0]|0), Math.max(0,j.lastRes[1]|0)];
    /* LA CLASSIFICA DEGLI AMICI, riletta con la disciplina di tutto il
       blocco: solo le chiavi conosciute, solo numeri finiti, e i TRE
       TETTI riapplicati in lettura come fa gia' la coda delle sfide
       (r.coda.slice(0,20)). Un salvataggio manomesso non puo' iniettare
       duemila amici, ne' un nome di trecento caratteri, ne' far crescere
       un contatore all'infinito. */
    if(j.amici&&typeof j.amici==='object'){
      const num=(v,max)=>(typeof v==='number'&&isFinite(v))?Math.max(0,Math.min(max,v|0)):0;
      if(Array.isArray(j.amici.righe)) for(const x of j.amici.righe.slice(0,AMICI_TETTO)){
        if(!x||typeof x!=='object') continue;
        const n=String(x.n||'').trim().toUpperCase().slice(0,12);
        if(!n) continue;
        if(s.amici.righe.some(y=>y.n===n)) continue;
        const semi=[];
        if(Array.isArray(x.semi)) for(const q of x.semi.slice(-AMICI_SEMI))
          if(typeof q==='number'&&isFinite(q)) semi.push(q>>>0);
        s.amici.righe.push({ n:n, g:num(x.g,9999), v:num(x.v,9999), p:num(x.p,9999), s:num(x.s,9999),
                             mf:num(x.mf,99999), ms:num(x.ms,99999), sf:num(x.sf,99999), ss:num(x.ss,99999),
                             q:(typeof x.q==='number'&&isFinite(x.q))?x.q|0:0, semi:semi });
      }
      if(Array.isArray(j.amici.mie)) for(const x of j.amici.mie.slice(-AMICI_MIE)){
        if(!x||typeof x!=='object') continue;
        if(typeof x.s!=='number'||!isFinite(x.s)) continue;
        s.amici.mie.push({ s:x.s>>>0, a:num(x.a,31), d:num(x.d,31),
                           q:(typeof x.q==='number'&&isFinite(x.q))?x.q|0:0 });
      }
    }`;

/* ========================== 4) il codice di risposta e la classifica */
const A4 = `/* =====================================================================
   I VENTI NOMI, E PERCHE' NON PASSANO DA rosaAvversaria.`;
const B4 = `/* =====================================================================
   IL CODICE DI RISPOSTA — VENTUNO CARATTERI, E DENTRO NON C'E' NESSUNO
   (voce #136).

   La sfida di carta va in un verso solo. Questo codice torna indietro e
   chiude il giro: chi ha giocato la mia partita mi rimanda il
   risultato, e da quei codici si compila una classifica dei testa a
   testa che non passa da nessun server.

   IL CARICO, e sono sessanta bit tondi — dodici simboli, zero
   riempimento:
       ver 4 · motore 4 · seme 32 · gol dello sfidante 5+5 ·
       gol di chi risponde 5+5
   piu' quattro simboli di controllo: ESITO + 12 + 4 = VENTUNO
   caratteri. Misurato (fuori/_sonda-136-codice.js): 21..21 su mille
   risposte a caso, giro impacca-e-spacca identita' 1000/1000.

   PERCHE' IL CODICE PORTA TUTTI E DUE I PUNTEGGI, e non solo quello
   nuovo: il telefono che aveva creato la sfida puo' essere stato spento
   per una settimana, e il codice della sua sfida vive quanto la
   sessione (voce #135). Il codice dev'essere sufficiente da solo. Ma se
   quel telefono il seme se lo ricorda, VINCE IL RICORDO — grep
   AMICI_MIE: e' l'unica verifica possibile senza un server, e costa
   venti numeri.

   IL CONTROLLO E' QUELLO DELLA VOCE #135, quattro simboli e non uno.
   Misurato su cinquanta codici diversi: 100% esaustivo su una cifra
   cambiata (24.800 prove) e su due scambiate (5.770). Con UN simbolo
   solo le due scambiate scenderebbero al 66,06% — su un corpo corto un
   controllo corto non tiene. Le sei fughe su 99.147 mutazioni a caso
   sono TUTTE la coppia «ultimo simbolo del carico + ultimo simbolo di
   controllo»: quello pesa 31^0=1 nell'accumulatore, quindi le due
   variazioni si annullano e quel che esce e' un codice VALIDO di
   un'altra partita. E' la classe che nessun controllo puo' prendere,
   perche' il controllo e' funzione del carico.

   LA PAROLA ESITO HA UNA I E UNA O, cioe' proprio le due lettere che
   l'alfabeto di Crockford butta via perche' nessuno sa ricopiarle. Il
   prefisso si confronta quindi dopo la stessa normalizzazione del
   corpo: chi ricopia a mano ES1T0 viene capito lo stesso.

   CHE COSA NON C'E' DENTRO: nessun id, nessun segreto, nessun nome,
   nessuna data. Il codice di risposta e' il codice che si manda a
   qualcuno che non ti ha mandato niente prima — un giorno finira' in un
   gruppo di venti persone — e la regola della voce #135 qui vale di
   piu', non di meno.
   ===================================================================== */
const ESITO_VER = 1;
/* la funzione e' DICHIARATA e non assegnata a un const apposta: cosi' e'
   issata, e spaccaCarta (che sta piu' su) puo' chiamarla */
function piattoCodice(t){ return String(t).replace(/[IL]/g, '1').replace(/O/g, '0'); }
function nudoCodice(t){ return String(t == null ? '' : t).toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function eUnaRisposta(t){ return piattoCodice(nudoCodice(t)).indexOf('ES1T0') === 0; }

function impaccaEsito(o){
  o = o || {};
  const bits = [];
  const met = (v, n) => { for(let i=n-1;i>=0;i--) bits.push((v>>>i) & 1); };
  met((o.ver === undefined ? ESITO_VER : (o.ver|0)) & 15, 4);
  met((o.motore === undefined ? MOTORE_V : (o.motore|0)) & 15, 4);
  met(o.seme >>> 0, 32);
  met(Math.max(0, Math.min(31, o.sfA|0)), 5);
  met(Math.max(0, Math.min(31, o.sfD|0)), 5);
  met(Math.max(0, Math.min(31, o.riA|0)), 5);
  met(Math.max(0, Math.min(31, o.riD|0)), 5);
  while(bits.length % 5) bits.push(0);
  const sim = [];
  for(let i=0;i<bits.length;i+=5){
    let v = 0;
    for(let k=0;k<5;k++) v = (v<<1) | (bits[i+k] || 0);
    sim.push(v);
  }
  const c = cartaControllo(sim);
  sim.push((c>>>15) & 31, (c>>>10) & 31, (c>>>5) & 31, c & 31);
  let out = 'ESITO';
  for(let i=0;i<sim.length;i++) out += CARTA_ALF[sim[i]];
  return out;
}

/* e il verso opposto. Torna {errore:'...'} e mai un'eccezione: questo
   testo arriva da un incollaggio. NON si pretende la lunghezza esatta —
   si legge il carico e si ignora quel che avanza — cosi' un formato che
   domani crescesse in coda resterebbe leggibile da qui. */
function spaccaEsito(testo){
  const nudo = nudoCodice(testo);
  const piatto = piattoCodice(nudo);
  if(piatto.indexOf('CARTA') === 0) return { errore:'e-una-sfida' };
  if(piatto.indexOf('ES1T0') !== 0) return { errore:'non-e-un-risultato' };
  const t = nudo.slice(5);
  if(t.length < 16) return { errore:'troppo-corto' };
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
  let p = 0;
  const leggi = n => { let v = 0; for(let i=0;i<n;i++) v = (v<<1) | (bits[p+i] || 0); p += n; return v >>> 0; };
  const ver = leggi(4);
  if(ver !== ESITO_VER) return { errore:'altra-versione', ver:ver };
  const motore = leggi(4);
  if(motore !== MOTORE_V) return { errore:'altro-motore', motore:motore };
  const seme = leggi(32);
  return { ver:ver, motore:motore, seme:seme,
           sfA:leggi(5), sfD:leggi(5), riA:leggi(5), riD:leggi(5) };
}

/* CHI HA FATTO MEGLIO: prima la differenza reti, poi i gol fatti. Due
   partite identiche finite 3-1 e 4-2 valgono uguale di differenza, e
   allora vince chi ha segnato di piu'.
   E' UNA FUNZIONE SOLA perche' la chiamano in due — il fischio finale
   di una sfida di carta e la lettura di un codice che torna. Due copie
   della stessa regola a duecento righe di distanza sono una copia che
   un giorno si scosta. */
function esitoCarta(ga, gd, ba, bd){
  const mio = (ga|0) - (gd|0), suo = (ba|0) - (bd|0);
  if(mio > suo || (mio === suo && (ga|0) > (ba|0))) return 'meglio';
  if(mio < suo || (mio === suo && (ga|0) < (ba|0))) return 'peggio';
  return 'pari';
}

/* =====================================================================
   LA CLASSIFICA DEGLI AMICI (voce #136).

   NON C'E' UN'IDENTITA' DA NESSUNA PARTE, ed e' il punto di tutto: la
   chiave di una riga e' il SOPRANNOME che scrivi tu su questo telefono,
   la chiave di una partita e' il SEME. Due telefoni possono chiamarsi
   in due modi diversi e le due classifiche si specchiano lo stesso.

   DUE PORTE PER LA STESSA RIGA, e servono tutte e due perche' la
   classifica sia simmetrica:
     · chi RICEVE una sfida di carta conosce gia' i due punteggi (il suo
       e quello che stava nel codice): segna senza aspettare niente;
     · chi l'ha CREATA aspetta il codice di risposta, e quello gli porta
       l'unico numero che gli manca.

   LO STESSO CODICE INCOLLATO DUE VOLTE non conta due volte, e la difesa
   e' il seme: due partite diverse hanno due semi diversi, trentadue bit
   a caso. E sta PER AMICO e non in una lista sola, perche' la stessa
   sfida si manda a due persone e due risposte con lo stesso seme sono
   due partite che contano tutte e due.
   ===================================================================== */
const Amici = {
  /* un salvataggio nato prima di questa voce non ha la chiave: si crea
     al primo bisogno, e senza alzare la versione */
  mem(){
    if(!SAVE.amici || typeof SAVE.amici !== 'object') SAVE.amici = { righe:[], mie:[] };
    if(!Array.isArray(SAVE.amici.righe)) SAVE.amici.righe = [];
    if(!Array.isArray(SAVE.amici.mie)) SAVE.amici.mie = [];
    return SAVE.amici;
  },
  /* IL NOME E' LOCALE E RESTA LOCALE: dodici caratteri come il nome
     della squadra, maiuscolo come tutto il resto del gioco. Non viaggia
     in nessun codice, quindi non e' un dato di nessuno tranne che di chi
     lo scrive. */
  pulisciNome(t){ return String(t == null ? '' : t).trim().toUpperCase().replace(/\\s+/g, ' ').slice(0, 12); },

  /* le sfide che HO creato: seme e punteggio mio */
  ricordaMia(seme, ga, gd){
    const m = this.mem(), s = seme >>> 0;
    for(let i=m.mie.length-1;i>=0;i--) if((m.mie[i].s >>> 0) === s) m.mie.splice(i, 1);
    m.mie.push({ s:s, a:Math.max(0,Math.min(31,ga|0)), d:Math.max(0,Math.min(31,gd|0)), q:Date.now() });
    while(m.mie.length > AMICI_MIE) m.mie.shift();
    try{ persistSave(); }catch(e){}
    return m.mie.length;
  },
  miaDi(seme){
    const s = seme >>> 0;
    for(const x of this.mem().mie) if((x.s >>> 0) === s) return x;
    return null;
  },

  segna(o){
    o = o || {};
    const nome = this.pulisciNome(o.nome);
    if(!nome) return { errore:'senza-nome' };
    const seme = o.seme >>> 0;
    const mi = o.miei || [], su = o.suoi || [];
    const g = v => Math.max(0, Math.min(31, v|0));
    const ma = g(mi[0]), md = g(mi[1]), sa = g(su[0]), sd = g(su[1]);
    const m = this.mem();
    let r = null;
    for(const x of m.righe) if(x.n === nome){ r = x; break; }
    let uscito = '';
    if(!r){
      /* IL TETTO, e chi esce si dice. A parita' di data esce il primo
         entrato: il confronto e' stretto, quindi l'indice piu' basso
         resta scelto — cioe' il piu' vecchio anche quando l'orologio
         non sa distinguerli. */
      if(m.righe.length >= AMICI_TETTO){
        let vecchia = 0;
        for(let i=1;i<m.righe.length;i++) if((m.righe[i].q|0) < (m.righe[vecchia].q|0)) vecchia = i;
        uscito = m.righe[vecchia].n;
        m.righe.splice(vecchia, 1);
      }
      r = { n:nome, g:0, v:0, p:0, s:0, mf:0, ms:0, sf:0, ss:0, q:0, semi:[] };
      m.righe.push(r);
    }
    if(r.semi.indexOf(seme) >= 0) return { errore:'gia-segnata', nome:nome, riga:r };
    r.semi.push(seme);
    while(r.semi.length > AMICI_SEMI) r.semi.shift();
    const come = esitoCarta(ma, md, sa, sd);
    r.g++;
    if(come === 'meglio') r.v++; else if(come === 'pari') r.p++; else r.s++;
    r.mf += ma; r.ms += md; r.sf += sa; r.ss += sd;
    r.q = Date.now();
    try{ persistSave(); }catch(e){}
    return { ok:true, nome:nome, come:come, riga:r, uscito:uscito, miei:[ma,md], suoi:[sa,sd] };
  },

  /* la porta di chi ha in mano un TESTO: o il codice che gli e' tornato
     indietro, o niente — e «niente» vuol dire «la sfida che ho appena
     giocato», che e' il caso di chi la sfida l'ha RICEVUTA. */
  segnaTesto(nome, testo){
    const t = String(testo == null ? '' : testo);
    if(t.trim()){
      if(t.indexOf('.') >= 0 && t.trim().split('.').length === 3) return { errore:'sembra-trasferimento' };
      const o = spaccaEsito(t);
      if(o.errore) return { errore:o.errore };
      let miei = [o.sfA, o.sfD], avviso = '';
      const mia = this.miaDi(o.seme);
      if(mia && (mia.a !== o.sfA || mia.d !== o.sfD)){
        avviso = 'Il codice dice che avevi chiuso ' + o.sfA + '-' + o.sfD +
                 ', ma questo telefono si ricorda ' + mia.a + '-' + mia.d + ': vale il ricordo.';
        miei = [mia.a, mia.d];
      }
      const r = this.segna({ nome:nome, seme:o.seme, miei:miei, suoi:[o.riA, o.riD] });
      if(r.ok && avviso) r.avviso = avviso;
      return r;
    }
    const p = Sfida.cartaDaSegnare;
    if(!p) return { errore:'niente-da-segnare' };
    const r = this.segna({ nome:nome, seme:p.seme, miei:p.miei, suoi:p.suoi });
    if(r.ok) Sfida.cartaDaSegnare = null;
    return r;
  },

  /* l'ordine: punti, poi scarto, poi giocate, poi nome. Deterministico
     apposta — un ordinamento che dipende dall'ordine di inserimento non
     si puo' misurare. */
  punti(r){ return (r.v|0)*3 + (r.p|0); },
  scarto(r){ return ((r.mf|0)-(r.ms|0)) - ((r.sf|0)-(r.ss|0)); },
  ordinata(){
    return this.mem().righe.slice().sort((a,b) =>
      this.punti(b) - this.punti(a) || this.scarto(b) - this.scarto(a) ||
      (b.g|0) - (a.g|0) || (a.n < b.n ? -1 : (a.n > b.n ? 1 : 0)));
  },
};

/* =====================================================================
   I VENTI NOMI, E PERCHE' NON PASSANO DA rosaAvversaria.`;

/* ============================================ 5) la terza serratura */
const A5 = `function spaccaCarta(testo){
  let t = String(testo == null ? '' : testo).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if(t.indexOf('CARTA') !== 0) return { errore:'non-e-una-sfida' };`;
const B5 = `function spaccaCarta(testo){
  let t = String(testo == null ? '' : testo).toUpperCase().replace(/[^A-Z0-9]/g, '');
  /* LA TERZA SERRATURA (voce #136). I codici che si incollano in questo
     campo adesso sono tre — il cambio telefono, la sfida, il risultato —
     e a un risultato non si dice «non e' un codice di sfida», che e' la
     causa sbagliata: si dice che cos'e'. L'altro verso sta in
     spaccaEsito. */
  if(eUnaRisposta(t)) return { errore:'e-un-risultato' };
  if(t.indexOf('CARTA') !== 0) return { errore:'non-e-una-sfida' };`;

/* ================================== 6) i due campi di sessione */
const A6 = `  /* la frase che il pannello mostra dopo una sfida di carta finita: il
     confronto per chi l'ha ricevuta, il punteggio per chi l'ha creata */
  cartaRiga: '',`;
const B6 = `  /* la frase che il pannello mostra dopo una sfida di carta finita: il
     confronto per chi l'ha ricevuta, il punteggio per chi l'ha creata */
  cartaRiga: '',
  /* IL RITORNO (voce #136). cartaRisposta e' il codice di ventuno
     caratteri da rimandare a chi ti ha sfidato: esiste solo dopo una
     sfida RICEVUTA, perche' e' l'unico caso in cui questo telefono
     conosce tutti e due i punteggi. cartaDaSegnare e' la stessa cosa
     dal lato della classifica, e si azzera appena la riga e' scritta —
     cosi' il bottone premuto due volte non conta due volte. */
  cartaRisposta: '',
  cartaDaSegnare: null,`;

/* ============================== 7) il ramo S.carta di chiudiSfida */
const A7 = `    const o = S.carta.dati;
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
      Sfida.cartaEsito = come;`;
const B7 = `    const o = S.carta.dati;
    const b = S.carta.daBattere;
    if(o){
      const pieno = { ver:CARTA_VER, motore:MOTORE_V, taglia:o.taglia, seme:o.seme,
                      mentA:o.mentA, mentD:o.mentD, car:o.car, golA:ga, golD:gd,
                      rosaA:o.rosaA, rosaD:o.rosaD };
      try{ Sfida.cartaCodice = impaccaCarta(pieno); }catch(e){ Sfida.cartaCodice = ''; }
      /* =====================================================================
         QUI IL GIRO SI CHIUDE (voce #136), e sono due strade opposte.

         SE LA SFIDA ERA RICEVUTA questo telefono conosce tutti e due i
         punteggi — il suo e quello che stava nel codice — quindi nasce
         il codice di RISPOSTA da rimandare, e la riga della classifica
         si puo' gia' scrivere: manca solo il nome, che lo mette il
         pollice.

         SE LA SFIDA ERA CREATA qui non si sa ancora niente dell'altro:
         si ricorda solo il PROPRIO punteggio, cosi' quando la risposta
         tornera' — magari fra una settimana, magari dopo dieci
         riaperture del gioco — nessuno potra' riscriverlo.
         ===================================================================== */
      Sfida.cartaRisposta = '';
      Sfida.cartaDaSegnare = null;
      if(b){
        try{ Sfida.cartaRisposta = impaccaEsito({ seme:o.seme, sfA:b[0]|0, sfD:b[1]|0, riA:ga, riD:gd }); }
        catch(e){ Sfida.cartaRisposta = ''; }
        Sfida.cartaDaSegnare = { seme:o.seme >>> 0, miei:[ga, gd], suoi:[b[0]|0, b[1]|0] };
      }else{
        try{ Amici.ricordaMia(o.seme, ga, gd); }catch(e){}
      }
    }
    if(b){
      const come = esitoCarta(ga, gd, b[0]|0, b[1]|0);
      Sfida.cartaEsito = come;`;

/* ================================= 8) il dito su SEGNA IL RISULTATO */
const A8 = `  /* la causa, in italiano, per chi ha incollato qualcosa che non va */`;
const B8 = `  /* =====================================================================
     IL DITO SU SEGNA IL RISULTATO (voce #136).

     Due sorgenti, un bottone solo: se nel campo c'e' un codice di
     risposta si legge quello, se il campo e' vuoto si segna la sfida
     appena giocata. E' la stessa distinzione che c'e' dalla parte di
     chi gioca — chi riceve sa gia' tutto, chi ha creato aspetta il
     codice — e non la deve sapere chi preme.
     ===================================================================== */
  segnaCarta(){
    const n = $('sfCartaNota');
    const dire = t => { if(n) n.textContent = t; };
    const cn = $('sfCartaAmico'), ci = $('sfCartaIn');
    const r = Amici.segnaTesto(cn ? String(cn.value || '') : '', ci ? String(ci.value || '') : '');
    if(r.errore){
      dire(this.perAmico(r.errore));
      try{ toast('fischietto','NON SI PUÒ SEGNARE','Guarda la riga sotto il campo: dice che cosa manca.'); }catch(e){}
      return false;
    }
    if(ci) ci.value = '';
    const q = r.riga || {};
    const verbo = r.come === 'meglio' ? 'hai vinto' : (r.come === 'pari' ? 'siete pari' : 'hai perso');
    dire((r.avviso ? r.avviso + ' ' : '') +
         'Segnato: contro ' + r.nome + ' ' + verbo + ', ' + r.miei.join('-') + ' contro ' + r.suoi.join('-') +
         '. Con ' + r.nome + ' siete ' + (q.v|0) + '-' + (q.p|0) + '-' + (q.s|0) + ' in ' + (q.g|0) +
         ' partit' + ((q.g|0) === 1 ? 'a' : 'e') + '. La classifica sta in CLASSIFICA.' +
         (r.uscito ? ' La classifica tiene ' + AMICI_TETTO + ' amici: è uscito ' + r.uscito + ', il più vecchio.' : ''));
    try{ toast(r.come === 'meglio' ? 'scopa' : 'fischietto', 'SEGNATO',
               'Contro ' + r.nome + ': ' + verbo + '.'); }catch(e){}
    return true;
  },
  /* la causa, in italiano, per chi voleva segnare e non si puo'. Le
     cause che il codice di risposta ha in comune con quello della sfida
     passano da perCarta: una frase sola, un posto solo. */
  perAmico(errore){
    switch(errore){
      case 'senza-nome':          return 'Scrivi il nome dell\\'amico qui sopra: serve solo a te, resta su questo telefono e non viaggia in nessun codice.';
      case 'niente-da-segnare':   return 'Non c\\'è niente da segnare: incolla il codice che ti è tornato indietro, oppure gioca una sfida che hai ricevuto e torna qui.';
      case 'gia-segnata':         return 'Questa partita era già segnata: la classifica non conta due volte lo stesso codice.';
      case 'e-una-sfida':         return 'Questo è il codice di una SFIDA da giocare, non un risultato: premi GIOCA LA SFIDA.';
      case 'non-e-un-risultato':  return 'Questo non è un codice di risultato: un risultato comincia per ESITO ed è lungo ventuno caratteri.';
      case 'controllo':           return 'Il codice del risultato non torna: manca o è cambiato qualche carattere. Si copia per intero, dalla E di ESITO all\\'ultima lettera.';
      default:                    return this.perCarta(errore);
    }
  },

  /* la causa, in italiano, per chi ha incollato qualcosa che non va */`;

/* ====================================== 9) la porta del banco */
const A9 = `  get sfidaStato(){ return { inPartita:!!G.sfida, seme:G.sfida?G.sfida.seme:'',`;
const B9 = `  /* LA CLASSIFICA DEGLI AMICI, aperta al banco (voce #136). \`impacca\` e
     \`spacca\` sono separate dalla classifica apposta: il cancello deve
     poter costruire lo STESSO codice su due telefoni diversi e
     confrontarlo carattere per carattere — e' l'unica prova che scopre
     un codice che si porta dietro chi lo ha scritto. \`righe\` e \`mie\`
     tornano una COPIA: un banco che potesse scrivere nella classifica
     passando dal getter misurerebbe se stesso. */
  get amici(){ return {
    ver: ESITO_VER,
    motore: MOTORE_V,
    tetto: AMICI_TETTO,
    semiTetto: AMICI_SEMI,
    mieTetto: AMICI_MIE,
    impacca: o => impaccaEsito(o),
    spacca: t => spaccaEsito(t),
    segna: o => Amici.segna(o),
    segnaTesto: (n, t) => Amici.segnaTesto(n, t),
    ricorda: (s, a, d) => Amici.ricordaMia(s, a, d),
    ordinata: () => JSON.parse(JSON.stringify(Amici.ordinata())),
    get righe(){ return JSON.parse(JSON.stringify(Amici.mem().righe)); },
    get mie(){ return JSON.parse(JSON.stringify(Amici.mem().mie)); },
    get risposta(){ return Sfida.cartaRisposta || ''; },
    get daSegnare(){ return Sfida.cartaDaSegnare || null; },
    azzera(){ SAVE.amici = { righe:[], mie:[] }; Sfida.cartaDaSegnare = null;
              try{ persistSave(); }catch(e){} return true; },
  }; },
  get sfidaStato(){ return { inPartita:!!G.sfida, seme:G.sfida?G.sfida.seme:'',`;

/* ------------------------------------------------------------------ */
const src = fs.readFileSync(inFile, 'utf8');
const coppie = [[A1, B1], [A2, B2], [A3, B3], [A4, B4], [A5, B5],
                [A6, B6], [A7, B7], [A8, B8], [A9, B9]];
const guai = [];
coppie.forEach(([a], i) => {
  const n = src.split(a).length - 1;
  if (n !== 1) guai.push('ancora ' + (i + 1) + ': trovata ' + n + ' volte invece di 1');
});
if (guai.length) { console.error('FALLITO:\n  ' + guai.join('\n  ')); process.exit(1); }

let out = src;
for (const [a, b] of coppie) out = out.replace(a, b);

const attesi = [
  ['function impaccaEsito(o){', 1],
  ['function spaccaEsito(testo){', 1],
  ['function esitoCarta(ga, gd, ba, bd){', 1],
  ['function eUnaRisposta(t){', 1],
  ['const Amici = {', 1],
  ['const AMICI_TETTO = 20;', 1],
  ['const AMICI_SEMI = 12;', 1],
  ['const AMICI_MIE = 20;', 1],
  ['    amici:{ righe:[], mie:[] },', 1],
  ['  segnaCarta(){', 1],
  ['  perAmico(errore){', 1],
  ['  get amici(){ return {', 1],
  ["  if(eUnaRisposta(t)) return { errore:'e-un-risultato' };", 1],
  ['  cartaRisposta: \'\',', 1],
  ['  cartaDaSegnare: null,', 1],
  /* quel che NON deve cambiare */
  ["const SAVE_KEY='calcetto_save_v4';", 1],
  ['const MOTORE_V = 2;', 1],
  ['const CARTA_VER = 1;', 1],
  ['const CARTA_TAGLIE = [5];', 1],
  ['function impaccaCarta(o){', 1],
  ['function spaccaCarta(testo){', 1],
  /* la vecchia regola inline del confronto e' SPARITA: adesso e' una
     funzione sola, e questa riga e' la guardia che lo dice */
  ["? 'meglio'", 0],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
/* e la versione del salvataggio non si e' alzata: e' il vincolo numero
   uno di questo cantiere, e sta a guardia dentro l'attrezzo */
if (/calcetto_save_v5/.test(out)) rotti.push('il salvataggio e\' passato a v5: non era previsto');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il risultato torna indietro: nove ancore, +' + (out.length - src.length) + ' caratteri');
console.log('    da   ' + inFile + '  (' + src.length + ' caratteri)');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri)');
console.log('    prova:  node strumenti/_q-amici.js --solo A,B,C' +
            (dentro ? '' : ' --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/')));
