/* =====================================================================
   _q-tabellone.js — IL CANCELLO DELLA LAVAGNETTA (29 agosto 2026).

   PERCHE' ESISTE. La voce 36 del confronto con FC Mobile porta la sua
   condanna nel titolo: «quanto schermo mangia l'interfaccia, MISURATO
   SUI RIQUADRI CHE IL GIOCO DICHIARA». Quel 14,0% — di cui 6,1 punti di
   tabellone — e' la parola del gioco, non i suoi pixel. In questa casa
   un cancello che legge la dichiarazione ha gia' dato verde tre volte a
   un gioco costruito per mentirgli.

   Qui la lavagnetta si misura TOGLIENDOLA DAL FOTOGRAMMA
   (strumenti/_t-righello-tabellone.js, innestato in memoria sulla copia
   servita) e contando i pixel che cambiano. La dichiarazione resta, e
   serve a una cosa sola: farsi smentire dai pixel se non e' vera.

   OTTO CONTROLLI, e ognuno sa diventare rosso.

     C1  IL PANNELLO DIPINGE DOVE DICE: nessun pixel del tabellone fuori
         dal rettangolo dichiarato (piu' i 12 px del piede sfumato, che
         il gioco NON dichiara — vedi la nota qui sotto)
     C2  E LO RIEMPIE: il rettangolo dichiarato non e' piu' largo di
         quello dipinto. Un pannello che dichiara piu' di quanto dipinge
         ruba camera per niente, perche' la regia gli lascia il posto
     C3  NIENTE ARIA: dentro il pannello nessuna corsa di colonne senza
         inchiostro piu' lunga di 40 px
     C4  LO SCHERMO MANGIATO: i pixel dipinti dal tabellone stanno sotto
         il 6,0% dello schermo
     C5  LA PASTICCA E' SOLO DELLE CIFRE: nessun pixel di tinta di
         squadra dentro il riquadro del punteggio
     C6  MAI PIU' LARGO DI IERI, E IL NOME CHE CI STA NON SI TRONCA: su
         una batteria di nomi il pannello resta dentro la larghezza della
         formula di ieri, e nessun nome da dodici caratteri prende
         l'ellissi
     C7  LA FASCIA CHE STROZZA LA REGIA: la banda orizzontale in cui il
         punto 6-quater di updateCamera mette un soffitto al comandato
         (BAR_X0-24 .. BAR_X1+24) sta sotto il 50% del quadro
     C8  IL RIGHELLO HA LO ZERO: due disegni identici danno zero pixel di
         scarto, e il righello non spende sorteggi

   IL ROSSO, DIMOSTRATO E NON PROMESSO. Tre controlli non hanno bisogno
   di un guasto fabbricato: il gioco di IERI li fa diventare rossi. Basta
   puntarlo su una copia senza la cura:

     node strumenti/_q-tabellone.js --gioco fuori/cmd-tabellone-base.html
       C3 rosso (vuoto 127 px), C4 rosso (7,66%), C7 rosso (61,2%)

   Gli altri cinque hanno il loro guasto, iniettato nel gioco SERVITO
   senza toccare nessun file: --guasto <nome>, --guasti li prova tutti e
   confronta i controlli caduti con quelli attesi.
     dichiara-stretto   zoneInterfaccia restringe il riquadro del 15% per
                        lato, il disegno resta com'e'      -> C1
     nome-fuori         il nome si dipinge 60 px piu' in la' del pannello
                        che lo contiene                    -> C1
     dichiara-largo     zoneInterfaccia gonfia il riquadro -> C2
     nome-pasticca      i nomi si accostano fino a +-40f, cioe' sopra le
                        cifre                              -> C5
     tetto-150          il riquadro del nome torna a 150f: il pannello
                        puo' diventare piu' largo di ieri  -> C6
     tronca             il riquadro del nome scende a 42f: DOPOLAVORO
                        prende l'ellissi                   -> C6
     tremolio           il pannello si sposta di un pixel a ogni disegno:
                        il righello perde lo zero          -> C8

   UNA NOTA ONESTA SUL PIEDE SFUMATO. Il gioco dichiara il tabellone come
   il rettangolo BAR_X0..BAR_X1 x 0..BAR_H, ma sotto quel bordo dipinge
   dodici pixel di gradiente («PIEDE SFUMATO», drawHUD). Sono pixel veri:
   misurati, il dipinto e' un quarto piu' del dichiarato (circa 28.900
   contro 23.040 sul gioco di ieri, circa 20.500 contro 16.335 su quello
   curato; il conto medio balla di un pixel fra una corsa e l'altra per
   il rumore della tela, le percentuali no). C1
   li concede — e li stampa — perche' toglierli dalla dichiarazione non e'
   lavoro di questa cura: cambierebbe cio' che copertura() risponde a
   tutti gli altri banchi. Chi legge sappia che il numero DICHIARATO
   della voce 36 e' ottimista di circa un quarto.

   uso:
     node strumenti/_q-tabellone.js --gioco fuori/cmd-tabellone.html
     node strumenti/_q-tabellone.js --gioco fuori/cmd-tabellone.html --guasti
     node strumenti/_q-tabellone.js --gioco fuori/cmd-tabellone-base.html
   esce 0 se verde, 1 se rosso, 3 se la prova e' nulla.
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RIGHELLO = require('./_t-righello-tabellone.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const GIOCO = path.resolve(RADICE, arg('gioco', 'CALCETTO-il-gioco.html'));
const VW = +arg('vw', 915), VH = +arg('vh', 412);
const SEC = +arg('sec', 10);
const OGNI = +arg('ogni', 30);
const TAGLIA = +arg('taglia', 11);
const SEMI = arg('semi', '20260829,20260830,20260831').split(',').map(Number);

/* ---------------------------------------------------------- le soglie */
const T_VUOTO = +arg('vuoto', 40);        // px di ardesia senza inchiostro
const T_SCHERMO = +arg('schermo', 6.0);   // % di schermo dipinta dal pannello
const T_FASCIA = +arg('fascia', 50);      // % di quadro della banda della regia
const T_PASTICCA = +arg('pasticca', 20);  // px di tinta squadra tollerati sulle cifre
const T_RIEMPIE = 0.98;                   // quanto del dichiarato dev'essere dipinto

/* ------------------------------------------------------------ i guasti
   Ognuno e' una sostituzione sul sorgente SERVITO: nessun file cambia.
   Se il testo cercato non c'e' esattamente una volta, il guasto si
   rifiuta — un guasto che non si applica darebbe un verde bugiardo. */
const GUASTI = {
  'dichiara-stretto': {
    attesi: ['C1'],
    cerca: `      z.push({tipo:'tabellone', x0:BAR_X0, y0:0, x1:BAR_X1, y1:BAR_H,
              alfa:+TAB_VELO.toFixed(3)});`,
    metti: `      z.push({tipo:'tabellone', x0:Math.round(BAR_X0+(BAR_X1-BAR_X0)*0.15), y0:0,
              x1:Math.round(BAR_X1-(BAR_X1-BAR_X0)*0.15), y1:BAR_H,
              alfa:+TAB_VELO.toFixed(3)});`,
  },
  'dichiara-largo': {
    attesi: ['C2'],
    cerca: `      z.push({tipo:'tabellone', x0:BAR_X0, y0:0, x1:BAR_X1, y1:BAR_H,
              alfa:+TAB_VELO.toFixed(3)});`,
    metti: `      z.push({tipo:'tabellone', x0:Math.round(BAR_X0-(BAR_X1-BAR_X0)*0.15), y0:0,
              x1:Math.round(BAR_X1+(BAR_X1-BAR_X0)*0.15), y1:BAR_H,
              alfa:+TAB_VELO.toFixed(3)});`,
  },
  'nome-fuori': {
    attesi: ['C1'],
    cerca: `    ctx.fillText(q.testo, q.x, cyT);`,
    metti: `    ctx.fillText(q.testo, q.x+(t===0?-60:60), cyT);`,
  },
  'nome-pasticca': {
    attesi: ['C5'],
    cerca: `  TAB_NOMI[0].x = cx-92*f-TAB_NOMI[0].largo;
  TAB_NOMI[1].x = cx+92*f;`,
    metti: `  TAB_NOMI[0].x = cx-40*f-TAB_NOMI[0].largo;
  TAB_NOMI[1].x = cx+40*f;`,
  },
  'tetto-150': { attesi: ['C6'], cerca: `const TAB_NW=120;`, metti: `const TAB_NW=150;` },
  'tronca':    { attesi: ['C6'], cerca: `const TAB_NW=120;`, metti: `const TAB_NW=42;` },
  'tremolio': {
    attesi: ['C8'],
    cerca: `  BAR_X0=Math.round(TAB_SB[0]-14);`,
    metti: `  BAR_X0=Math.round(TAB_SB[0]-14)+(((G.__trem=(G.__trem|0)+1))&1);`,
  },
};

/* ------------------------------------------------------- il sorgente */
function sorgente(nomeGuasto) {
  let src = fs.readFileSync(GIOCO, 'utf8');
  let nota;
  try {
    const r = RIGHELLO.applica(src);
    src = r.out;
    nota = r.gia ? 'righello gia\' dentro' : 'righello innestato (' + r.ancore + ' ancoraggi, dado() ' + r.dado + ')';
  } catch (e) { console.error('PROVA NULLA: il righello non si aggancia — ' + e.message); process.exit(3); }
  if (nomeGuasto) {
    const g = GUASTI[nomeGuasto];
    if (!g) { console.error('PROVA NULLA: guasto sconosciuto «' + nomeGuasto + '»'); process.exit(3); }
    const n = src.split(g.cerca).length - 1;
    if (n !== 1) { console.error('PROVA NULLA: il guasto «' + nomeGuasto + '» non si aggancia (trovato ' + n + ' volte)'); process.exit(3); }
    src = src.replace(g.cerca, g.metti);
    nota += ' · GUASTO ' + nomeGuasto;
  }
  return { src, nota };
}

const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.woff2': 'font/woff2' };
function servi(src) {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = path.join(RADICE, u === '/' ? 'index.html' : u);
      if (/CALCETTO-il-gioco\.html$/i.test(f)) {
        rs.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(src); return;
      }
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        rs.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const BANCO = () => {
  const PASSO = 1000 / 60;
  let t = 0, coda = [];
  window.requestAnimationFrame = cb => { coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  window.__banco = { passo(n) {
    n = Math.max(0, Math.round(+n || 0));
    for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO; for (const f of c) { try { f(t); } catch (e) {} } }
    return t;
  } };
};

const PARTITA = `async (cfg) => {
  const t = window.__test, B = window.__banco, G = t.G;
  try { t.dismissSplash && t.dismissSplash(); } catch(e){}
  B.passo(4);
  /* la quiete prima del seme: la cottura della tessitura del campo tira
     decine di migliaia di sorteggi quando le pare */
  t.semina(1);
  { let fermi=0;
    for (let giri=0; giri<20 && fermi<2; giri++){
      const a=t.sorteggi;
      await new Promise(r=>setTimeout(r,300));
      fermi = (t.sorteggi===a) ? fermi+1 : 0;
    } }
  t.semina(cfg.seme); t.setCpuVsCpu(true);
  t.startMatch(1, 1, { size: cfg.taglia });
  for (let i=0;i<900;i++){ B.passo(1); if (t.state==='play') break; }

  if (typeof t.senzaTabellone!=='function' || typeof t.veloTabellone!=='function')
    return JSON.stringify({errore:'i ganci del righello non ci sono'});
  const cv = document.getElementById('gioco');
  if (!cv) return JSON.stringify({errore:'la tela #gioco non esiste'});
  const cg = cv.getContext('2d');
  const K = cv.width / cfg.VW, W = cv.width, H = cv.height;
  const RIG_H=34, P_DIS=1.18, RIG_PIEDI=10;
  const sorteggi0 = t.sorteggi;

  const fermo = (senza) => {
    const c=G.cam, sc={x:c.x,y:c.y,z:c.z}, mini=G.miniY, velo=t.veloTabellone();
    const desc=Object.getOwnPropertyDescriptor(G,'renderDT');
    Object.defineProperty(G,'renderDT',{get:()=>0,set:()=>{},configurable:true});
    try { if(senza) t.senzaTabellone(true); t.disegna(); }
    finally { if(senza) t.senzaTabellone(false);
      delete G.renderDT; if(desc) Object.defineProperty(G,'renderDT',desc); else G.renderDT=1/60;
      c.x=sc.x; c.y=sc.y; c.z=sc.z; G.miniY=mini; t.veloTabellone(velo); }
  };
  const tutto = () => cg.getImageData(0,0,W,H).data;
  /* TRE SOGLIE, E IL PERCHE' DI OGNUNA.
     Due disegni identici NON danno lo stesso bitmap, e non e' il gioco
     che si muove: su 377.000 pixel se ne trovano un paio che ballano di
     una o due unita' su 255 (misurato il 29 agosto 2026: [25,27,37]
     contro [24,27,37] sulla folla, [81,70,59] contro [80,69,58]). E'
     l'arrotondamento della tela, e succede anche fra due disegni in cui
     non e' cambiato niente.
       muta  (>=2)   conta i pixel che la lavagnetta cambia: l'ardesia
                     sul manto ne cambia decine, quindi 2 non ne perde
                     nessuno, e tiene fuori il rumore da una unita'.
       forte (>=16)  serve dove un solo pixel decide un verdetto —
                     l'inchiostro FUORI dal riquadro dichiarato (C1, C6)
                     e il riquadro dipinto (C2). Il rumore misurato
                     arriva a 2; il gesso di un nome sul manto ne cambia
                     da 50 a 150. Sedici sta in mezzo, molto piu' vicino
                     al rumore che al segnale.
       vede  (>=8)   la variante «visibile» del conto, per il piede
                     sfumato che svanisce a zero. */
  const muta  = (A,B,i) => Math.abs(A[i]-B[i])>=2||Math.abs(A[i+1]-B[i+1])>=2||Math.abs(A[i+2]-B[i+2])>=2;
  const forte = (A,B,i) => Math.abs(A[i]-B[i])>=16||Math.abs(A[i+1]-B[i+1])>=16||Math.abs(A[i+2]-B[i+2])>=16;
  const hex = s => { const m=/^#?([0-9a-f]{6})$/i.exec(String(s).trim());
    if(!m) return null; const v=parseInt(m[1],16); return [v>>16&255, v>>8&255, v&255]; };

  /* un campione: disegna con, disegna con (lo zero), disegna senza, e
     confronta. Torna tutto cio' che i controlli devono sapere. */
  const campione = () => {
    const velo = t.veloTabellone();
    fermo(false); const A = tutto();
    fermo(false); const A2 = tutto();
    let zero=0;
    for (let i=0;i<A.length;i+=4) if(muta(A,A2,i)) zero++;
    fermo(true); const S = tutto();
    const d = t.zoneInterfaccia().find(q=>q.tipo==='tabellone') || {x0:0,y0:0,x1:0,y1:0,alfa:0};
    let n=0, nv=0, bx0=1e9, by0=1e9, bx1=-1e9, by1=-1e9, fuori=0, fuoriDove=null;
    for (let y=0;y<H;y++) for (let x=0;x<W;x++){
      const i=(y*W+x)*4;
      if(!muta(A,S,i)) continue;
      n++;
      if(Math.abs(A[i]-S[i])>=8||Math.abs(A[i+1]-S[i+1])>=8||Math.abs(A[i+2]-S[i+2])>=8) nv++;
      if(!forte(A,S,i)) continue;
      if(x<bx0)bx0=x; if(x>bx1)bx1=x; if(y<by0)by0=y; if(y>by1)by1=y;
      const cx=x/K, cy=y/K;
      /* il piede sfumato di 12 px sotto il pannello e' dipinto e non
         dichiarato: si concede, e si dice (vedi la testata) */
      if(cx<d.x0-1||cx>d.x1+1||cy<d.y0-1||cy>d.y1+13){
        fuori++; if(!fuoriDove) fuoriDove={x:+cx.toFixed(1),y:+cy.toFixed(1)};
      }
    }
    /* l'aria: colonne senza inchiostro dentro il pannello, sopra il
       listello di legno e dentro i due montanti */
    let vuoto=null;
    if(n>0 && d.x1>d.x0){
      const X0=Math.round((d.x0+3)*K), X1=Math.round((d.x1-3)*K);
      const Y0=Math.round(1*K), Y1=Math.round((d.y1-Math.max(3,Math.round(d.y1*0.10))-1)*K);
      const cols=X1-X0, rows=Y1-Y0;
      if(cols>10 && rows>4){
        const lum=new Float32Array(cols*rows);
        for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
          const i=(((Y0+r)*W)+(X0+c))*4;
          lum[r*cols+c]=0.2126*A[i]+0.7152*A[i+1]+0.0722*A[i+2];
        }
        const med=new Float32Array(rows), buf=new Float32Array(cols);
        for(let r=0;r<rows;r++){ for(let c=0;c<cols;c++) buf[c]=lum[r*cols+c];
          const s=Array.prototype.slice.call(buf).sort((a,b)=>a-b); med[r]=s[s.length>>1]; }
        let run=0, peggio=0;
        for(let c=0;c<cols;c++){ let k=0;
          for(let r=0;r<rows;r++) if(Math.abs(lum[r*cols+c]-med[r])>16) k++;
          if(k>=2) run=0; else { run++; if(run>peggio) peggio=run; } }
        vuoto=+(peggio/K).toFixed(1);
      }
    }
    /* tinta di squadra dentro la pasticca delle cifre: se c'e', un nome
       si e' seduto sul punteggio */
    let sporca=0;
    const TC=(typeof TEAMCOL!=='undefined')?TEAMCOL.map(hex).filter(Boolean):[];
    /* IL RIQUADRO DEL PUNTEGGIO SI CALCOLA, NON SI CHIEDE: il gioco lo
       dichiara (tipo 'cifre') SOLO quando la lavagnetta si e' velata, e
       un guasto che stringesse i nomi sulle cifre finirebbe per farsi
       misurare proprio nei fotogrammi in cui la dichiarazione non c'e'.
       cx +-86f x 0..BAR_H sono i tre numeri che la cura promette di non
       toccare, e infatti la toppa li pretende invariati parola per
       parola (vedi ATTESI in _t-tabellone.js). */
    const fP=Math.max(0.52,Math.min(1,(cfg.VW/2-52)/248));
    const past={x0:cfg.VW/2-86*fP, x1:cfg.VW/2+86*fP, y0:0,
                y1:(typeof BAR_H!=='undefined'?BAR_H:45)};
    if(TC.length && !G.golden && G.timeLeft>10){
      const X0=Math.max(0,Math.round(past.x0*K)), X1=Math.min(W,Math.round(past.x1*K));
      const Y0=Math.max(0,Math.round(past.y0*K)), Y1=Math.min(H,Math.round(past.y1*K));
      for(let y=Y0;y<Y1;y++) for(let x=X0;x<X1;x++){
        const i=(y*W+x)*4, r=A[i], g=A[i+1], b=A[i+2];
        const sat=Math.max(r,g,b)-Math.min(r,g,b);
        if(sat<40) continue;
        for(const c of TC){
          if(Math.abs(r-c[0])+Math.abs(g-c[1])+Math.abs(b-c[2])<90){ sporca++; break; }
        }
      }
    }
    return { n:n/(K*K), nv:nv/(K*K), zero, fuori, fuoriDove, vuoto, sporca:sporca/(K*K),
             velo:+velo.toFixed(3),
             dich:{x0:d.x0,y0:d.y0,x1:d.x1,y1:d.y1},
             bbox: n? {x0:+(bx0/K).toFixed(1), y0:+(by0/K).toFixed(1), x1:+((bx1+1)/K).toFixed(1), y1:+((by1+1)/K).toFixed(1)} : null };
  };

  const z = { frames:0, campioni:[], coperti:0, velati:0, sottoBar:0,
              nomi:[G.teamName,G.oppName], VW:cfg.VW, VH:cfg.VH, K:K,
              batteria:[], sorteggiSpesi:0 };

  for (let pas=0; pas<cfg.passi; pas++) {
    if (pas % 240 === 0) await new Promise(r=>setTimeout(r,0));
    B.passo(1);
    if (t.state!=='play') continue;
    z.frames++;
    if (t.veloTabellone()<0.999) z.velati++;
    {
      const f = t.copertura({uomini:true}).filter(r=>r.pannello==='tabellone' && r.soggetto==='uomo' && r.quota>=0.25);
      z.coperti += f.length;
      const zz = t.zoneInterfaccia().find(q=>q.tipo==='tabellone'), v=G.view, i=G.ctrl[0];
      const p = (i>=0)?G.players[i]:null;
      if (zz && v && v.S2 && p && p.out<=0){
        const sx=p.x*v.S2+v.Ax;
        if (sx>zz.x0-24 && sx<zz.x1+24) z.sottoBar++;
      }
    }
    if (pas % cfg.ogni) continue;
    const s0=t.sorteggi;
    z.campioni.push(campione());
    z.sorteggiSpesi += t.sorteggi-s0;
  }

  /* --------- LA BATTERIA DEI NOMI (una sola volta, all'ultimo seme) --- */
  if (cfg.batteria) {
    const era=[G.teamName,G.oppName];
    const f=Math.max(0.52,Math.min(1,(cfg.VW/2-52)/248));
    const sk=Math.tan(16*Math.PI/180)*( (typeof BAR_H!=='undefined'?BAR_H:45) -3);
    /* la formula di IERI, scritta qui perche' ieri non c'e' piu': era in
       resize() prima della cura, ed e' il tetto che la cura promette di
       non superare mai */
    const ieriX0=Math.round(cfg.VW/2-236*f-14), ieriX1=Math.round(cfg.VW/2+230*f+6+sk+14);
    /* IL NOME AL MASSIMO DEL RIQUADRO: si costruisce qui, allungando una
       W alla volta finche' ci sta. E' il caso che mette alla prova la
       promessa piu' forte della cura — «con due nomi al limite il
       pannello ridiventa quello di ieri, al pixel» — e non si puo'
       scrivere a mano, perche' dipende dal carattere e il carattere
       cambia. */
    const nomi2=cfg.nomi2.slice();
    {
      const c=document.createElement('canvas').getContext('2d');
      const nw=(typeof TAB_NW!=='undefined'?TAB_NW:150)*f;
      c.font='700 15px '+(typeof FONT_C!=='undefined'?FONT_C:'sans-serif');
      let w=''; while(c.measureText(w+'W').width<=nw && w.length<40) w+='W';
      if(w) nomi2.push([w,w]);
    }
    for (const nn of nomi2) {
      G.teamName=nn[0]; G.oppName=nn[1];
      /* UN DISEGNO DI RISCALDAMENTO, e vale la pena dire perche'.
         La larghezza del pannello la scrive drawHUD, che gira DOPO
         updateCamera: il primo fotogramma dopo un cambio di nome la
         camera lavora ancora con la larghezza di prima, e il suo clamp
         (punto 6-quater) puo' spostare il mondo di un pixel. Senza
         questo giro a vuoto il banco misurerebbe quello spostamento e
         lo attribuirebbe alla lavagnetta. Nel gioco vero il ritardo
         dura un fotogramma e capita solo quando la squadra cambia
         nome, cioe' in un menu. */
      fermo(false);
      const c=campione();
      z.batteria.push({ nomi:nn, dich:c.dich, bbox:c.bbox, fuori:c.fuori, dove:c.fuoriDove, sporca:c.sporca,
        ieri:{x0:ieriX0,x1:ieriX1},
        testi:(typeof TAB_NOMI!=='undefined')?TAB_NOMI.map(q=>({testo:q.testo,fs:q.fs,largo:+q.largo.toFixed(1)})):null });
    }
    G.teamName=era[0]; G.oppName=era[1];
  }
  z.sorteggiTot = t.sorteggi - sorteggi0;
  return JSON.stringify(z);
}`;

const med = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;

async function corsa(nomeGuasto) {
  const { src, nota } = sorgente(nomeGuasto);
  const srv = await servi(src);
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  await ctx.addInitScript(BANCO);
  const errori = [];
  const tutti = [];
  let batteria = null, dati = null;
  for (let i = 0; i < SEMI.length; i++) {
    const pag = await ctx.newPage();
    pag.on('pageerror', e => errori.push(e.message));
    await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html?t=' + Date.now(), { waitUntil: 'load', timeout: 60000 });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => document.fonts.ready);
    const cfg = JSON.stringify({
      VW, VH, passi: Math.round(SEC * 60), ogni: OGNI, taglia: TAGLIA, seme: SEMI[i],
      batteria: i === SEMI.length - 1,
      nomi2: [['DOPOLAVORO', 'CPU'], ['A', 'B'], ['MMMMMMMMMMMM', 'WWWWWWWWWWWW'],
              ['AMATORI CASTELVETRO', 'REAL FANTOZZI FC'], ['PIÙ È ÀÈÌÒÙ', 'ROSA']],
    });
    const o = JSON.parse(await pag.evaluate(`(${PARTITA})(${cfg})`));
    if (o.errore) { console.error('PROVA NULLA: ' + o.errore); process.exit(3); }
    tutti.push(o);
    if (o.batteria && o.batteria.length) batteria = o.batteria;
    dati = o;
    await pag.close();
  }
  await br.close(); srv.chiudi();
  return { tutti, batteria, dati, nota, errori };
}

function giudica(r, silenzio) {
  const di = (ok, nome, det) => { if (!silenzio) console.log('  ' + (ok ? ' ok  ' : ' NO  ') + nome + '\n           ' + det); return ok; };
  const camp = [].concat.apply([], r.tutti.map(o => o.campioni));
  if (!camp.length) { console.error('PROVA NULLA: nessun campione'); process.exit(3); }
  const SCH = VW * VH;
  const esito = {};

  /* C8 per primo: se il righello non ha lo zero, il resto e' rumore —
     ma si stampa comunque, perche' un cancello che tace non insegna */
  const zeroRotti = camp.filter(c => c.zero > 0);
  const sorteggi = r.tutti.reduce((s, o) => s + o.sorteggiSpesi, 0);
  esito.C8 = zeroRotti.length === 0 && sorteggi === 0;

  const fuori = camp.filter(c => c.fuori > 0);
  esito.C1 = fuori.length === 0;

  const riempie = camp.map(c => {
    const dl = c.dich.x1 - c.dich.x0, bl = c.bbox ? (c.bbox.x1 - c.bbox.x0) : 0;
    return dl > 0 ? bl / dl : 0;
  });
  esito.C2 = Math.min.apply(null, riempie) >= T_RIEMPIE;

  const vuoti = camp.map(c => c.vuoto).filter(v => v !== null);
  const vuotoMax = vuoti.length ? Math.max.apply(null, vuoti) : 0;
  esito.C3 = vuoti.length > 0 && vuotoMax <= T_VUOTO;

  const dipMax = Math.max.apply(null, camp.map(c => c.n));
  esito.C4 = 100 * dipMax / SCH <= T_SCHERMO;

  const sporcaMax = Math.max.apply(null, camp.map(c => c.sporca));
  esito.C5 = sporcaMax <= T_PASTICCA;

  let c6 = true, c6righe = [];
  for (const b of (r.batteria || [])) {
    const largo = b.dich.x1 - b.dich.x0;
    const dentro = b.dich.x0 >= b.ieri.x0 - 0.5 && b.dich.x1 <= b.ieri.x1 + 0.5;
    const troncato = b.testi ? b.testi.some((q, i) => q.testo.indexOf('…') >= 0 && b.nomi[i].length <= 12) : false;
    const inchiostro = b.fuori === 0;
    if (!dentro || troncato || !inchiostro) c6 = false;
    c6righe.push(b.nomi.join('/') + ' ' + largo + 'px'
      + (b.testi ? ' [' + b.testi.map(q => q.testo + ' ' + q.fs + 'px ' + q.largo).join(' | ') + ']' : '') + (dentro ? '' : ' PIU\' LARGO DI IERI (' + b.dich.x0 + '..' + b.dich.x1 + ' contro ' + b.ieri.x0 + '..' + b.ieri.x1 + ')')
      + (troncato ? ' TRONCATO ' + JSON.stringify(b.testi.map(q => q.testo)) : '')
      + (inchiostro ? '' : ' INCHIOSTRO FUORI DAL PANNELLO (' + b.fuori + ' px, primo ' + JSON.stringify(b.dove) + ', dipinto ' + JSON.stringify(b.bbox) + ')'));
  }
  if (!r.batteria) c6 = false;
  esito.C6 = c6;

  const fascia = camp.map(c => 100 * (c.dich.x1 - c.dich.x0 + 48) / VW);
  const fasciaMax = Math.max.apply(null, fascia);
  esito.C7 = fasciaMax <= T_FASCIA;

  if (!silenzio) {
    const frames = r.tutti.reduce((s, o) => s + o.frames, 0);
    const coperti = r.tutti.reduce((s, o) => s + o.coperti, 0) / Math.max(1, frames);
    const velati = 100 * r.tutti.reduce((s, o) => s + o.velati, 0) / Math.max(1, frames);
    const sottoBar = 100 * r.tutti.reduce((s, o) => s + o.sottoBar, 0) / Math.max(1, frames);
    console.log('=== LA LAVAGNETTA DEL PUNTEGGIO — ' + TAGLIA + ' contro ' + TAGLIA + ', ' + VW + 'x' + VH + ' ===');
    console.log('gioco ' + path.basename(GIOCO) + '   [' + r.nota + ']');
    console.log('semi ' + SEMI.join(',') + ' · ' + SEC + ' s ciascuno · ' + camp.length + ' campioni a pixel su ' + frames + ' fotogrammi');
    console.log('nomi in campo ' + JSON.stringify(r.dati.nomi) + '\n');
    di(esito.C1, 'C1  il pannello dipinge dove dice',
      camp.length - fuori.length + '/' + camp.length + ' campioni con tutto l\'inchiostro dentro il riquadro dichiarato'
      + (fuori.length ? ' — primo fuori: ' + JSON.stringify(fuori[0].fuoriDove) + ' contro ' + JSON.stringify(fuori[0].dich) : '')
      + '  ·  dipinto ' + Math.round(med(camp.map(c => c.n))) + ' px contro ' + ((camp[0].dich.x1 - camp[0].dich.x0) * (camp[0].dich.y1 - camp[0].dich.y0)) + ' dichiarati (+' + (100 * med(camp.map(c => c.n)) / ((camp[0].dich.x1 - camp[0].dich.x0) * (camp[0].dich.y1 - camp[0].dich.y0)) - 100).toFixed(0) + '%, il piede sfumato)');
    di(esito.C2, 'C2  e lo riempie',
      'il dipinto copre il ' + (100 * Math.min.apply(null, riempie)).toFixed(1) + '% della larghezza dichiarata al peggio (serve ' + (100 * T_RIEMPIE) + '%)');
    di(esito.C3, 'C3  niente aria dentro il pannello',
      'la corsa piu' + '\' lunga senza inchiostro e\' ' + vuotoMax + ' px, media ' + med(vuoti).toFixed(1) + ' — tetto ' + T_VUOTO);
    di(esito.C4, 'C4  lo schermo mangiato dalla lavagnetta',
      (100 * med(camp.map(c => c.n)) / SCH).toFixed(2) + '% medio, ' + (100 * dipMax / SCH).toFixed(2) + '% al picco — tetto ' + T_SCHERMO.toFixed(1) + '%  (visibili oltre 8/255: ' + (100 * med(camp.map(c => c.nv)) / SCH).toFixed(2) + '%)');
    di(esito.C5, 'C5  la pasticca e\' solo delle cifre',
      'pixel di tinta di squadra dentro il riquadro del punteggio: ' + sporcaMax.toFixed(0) + ' al peggio — tetto ' + T_PASTICCA);
    di(esito.C6, 'C6  mai piu\' largo di ieri, e il nome che ci sta non si tronca',
      c6righe.join('\n           ') || 'batteria non eseguita');
    di(esito.C7, 'C7  la fascia che strozza la regia',
      'BAR_X0-24..BAR_X1+24 e\' il ' + fasciaMax.toFixed(1) + '% del quadro — tetto ' + T_FASCIA + '%');
    di(esito.C8, 'C8  il righello ha lo zero e non spende sorteggi',
      zeroRotti.length + ' campioni su ' + camp.length + ' con due disegni diversi'
      + (zeroRotti.length ? ' (peggiore ' + Math.max.apply(null, zeroRotti.map(c => c.zero)) + ' px)' : '')
      + ' · ' + sorteggi + ' sorteggi spesi dal righello');
    console.log('\n  misure, non controlli:  la lavagnetta si vela nel ' + velati.toFixed(1) + '% dei fotogrammi'
      + ' · ' + coperti.toFixed(3) + ' uomini per fotogramma con un quarto di sagoma sotto'
      + ' · il comandato sta nella fascia nel ' + sottoBar.toFixed(1) + '% dei fotogrammi');
    if (r.errori.length) console.log('  ERRORI DI PAGINA: ' + r.errori.slice(0, 3).join(' | '));
  }
  return esito;
}

(async () => {
  if (haFlag('guasti')) {
    console.log('=== I GUASTI: ogni controllo sa diventare rosso ===\n');
    const sano = giudica(await corsa(null), true);
    const nomiSani = Object.keys(sano).filter(k => !sano[k]);
    console.log('  gioco sano: ' + (nomiSani.length ? 'ROSSO su ' + nomiSani.join(',') + ' — i guasti si leggono con questo in mente' : 'verde su tutti e otto'));
    let male = 0;
    for (const nome of Object.keys(GUASTI)) {
      const e = giudica(await corsa(nome), true);
      const caduti = Object.keys(e).filter(k => !e[k]);
      const attesi = GUASTI[nome].attesi;
      const ok = attesi.every(a => caduti.indexOf(a) >= 0);
      if (!ok) male++;
      console.log('  ' + (ok ? ' ok  ' : ' NO  ') + nome.padEnd(18) + ' caduti: ' + (caduti.join(',') || 'nessuno') + '   attesi: ' + attesi.join(','));
    }
    console.log('\n' + (male ? 'ROSSO: ' + male + ' guasti non fanno cadere il controllo che dovrebbero.' : 'VERDE: ogni guasto fa cadere il suo controllo.'));
    process.exit(male ? 1 : 0);
  }
  const g = arg('guasto', '');
  const r = await corsa(g || null);
  const e = giudica(r, false);
  const rossi = Object.keys(e).filter(k => !e[k]);
  console.log('\n' + (rossi.length ? 'ROSSO: ' + rossi.join(', ') + ' (' + (8 - rossi.length) + ' controlli su 8 passati).'
                                   : 'VERDE: otto controlli su otto.'));
  process.exit(rossi.length ? 1 : 0);
})();
