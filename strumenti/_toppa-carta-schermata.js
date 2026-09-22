/* =====================================================================
   _toppa-carta-schermata.js — LA SFIDA DI CARTA SI VEDE E SI TOCCA
   (voce #135, compito 4).

   IL DIFETTO: dal compito 2 il gioco sa fare e leggere il codice, e non
   c'e' nessun modo di arrivarci con un dito. `window.__test.carta`
   esiste, il bottone no.

   DOVE VA L'INGRESSO, e non e' un gusto: e' misurato
   (fuori/_sonda-135-bottone.js, tre posti, tre viste, lista vuota e
   lista piena).

     · un QUARTO bottone nella barra .azioni manda la barra su due file
       e fa cadere il bottone nuovo SOTTO la piega: l'ingresso di una
       funzione nuova finisce dove non lo trova nessuno;
     · una VOCE GRANDE SOPRA la lista spinge la prima riga della lista
       a 375 su una piega di 360 — cioe' ROMPE il cancello _q-sigillo,
       prova B3, che e' li' apposta per il difetto gia' pagato del
       TORNEO (grep «LE OTTO SQUADRE SOPRA LA PIEGA»);
     · una VOCE GRANDE SOTTO la lista non muove NIENTE di quel che il
       cancello sorveglia: CERCA AVVERSARIO resta a 220, la prima riga a
       329, il primo GUARDA a 308, identici al pixel su tutte e tre le
       viste. E l'ingresso nuovo resta sopra la piega a lista vuota su
       tutte e tre (347 / 347 / 471 contro pieghe di 412 / 360 / 640).

   IL PREZZO, DETTO: la barra dei tre bottoni scende di 46 px. A 915x412
   con la lista vuota i suoi bottoni finiscono 6 px sotto la piega, e ci
   si arriva scorrendo — lo stesso scorrimento che questa schermata
   chiede gia' oggi appena la lista ha una riga (misurato: barra a 692
   con cinque righe). Si paga li' perche' li' c'e' TORNA AL MENU, che
   chiunque sa cercare; l'ingresso nuovo, che nessuno sa ancora di
   cercare, sta in alto.

   E IL PANNELLO DICE DUE COSE CHE NON SONO DECORAZIONE: che una sfida
   di carta non porta una prova (il codice porta la partita, non il
   verdetto: chi lo riceve puo' dichiarare il punteggio che vuole), e
   che NON E' il codice del cambio telefono — quello non si manda a
   nessuno, perche' chi lo incolla diventa quella squadra.

   uso:  node strumenti/_toppa-carta-schermata.js --out fuori/x.html
         node strumenti/_toppa-carta-schermata.js --dentro
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
const outFile = dentro ? inFile : path.resolve(RADICE, arg('out', 'fuori/gioco-carta-schermata.html'));

/* ============================================================== 1) il CSS */
const A1 = `#sfidaCodice{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;
  background:rgba(3,10,6,.72);overflow-y:auto;overscroll-behavior:contain}
#sfidaCodice.hidden{display:none}
#sfidaCodice .patto{max-width:460px;margin:16px;padding:20px 22px;text-align:left;position:relative;
  background:linear-gradient(180deg,#f2ecdb,#e3d9c0);color:#3a3020;
  font-family:var(--cond);font-weight:600;font-size:14.5px;line-height:1.5;
  box-shadow:0 8px 18px rgba(0,0,0,.6)}
#sfidaCodice .patto b{font-weight:700}
#sfidaCodice .sf-nota{font-size:12.5px;color:#5a4d33;margin-top:10px}
#sfidaCodice input{display:block;width:100%;box-sizing:border-box;margin:8px 0 2px;padding:8px 9px;
  font-family:var(--mono);font-weight:700;font-size:12px;letter-spacing:.04em;
  color:#20301a;background:#f8f3e6;border:1px solid #8d7c57;border-radius:2px}
#sfidaCodice .fbtn{margin-top:12px;margin-right:8px;color:#57492e;border-color:#b3a380;
  background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.08));
  box-shadow:0 2px 0 rgba(90,70,40,.4)}
#sfidaCodice .fbtn.paga{background:linear-gradient(180deg,#ffc757,#e59200);border-color:#a86f00;color:#12210f}`;

const B1 = `/* DUE PANNELLI, UN VESTITO (voce #135). Il pannello della sfida di
   carta e' la stessa carta di quello del cambio telefono, e i selettori
   si allungano invece di raddoppiarsi: due fogli identici scritti in
   due posti si scostano al primo ritocco. SONO due pannelli e non uno
   perche' dicono due cose opposte — uno porta via la squadra, l'altro
   porta una partita — e confonderli e' il difetto che la voce #135
   esiste per non fare. */
#sfidaCodice,#sfidaCarta{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;
  background:rgba(3,10,6,.72);overflow-y:auto;overscroll-behavior:contain}
#sfidaCodice.hidden,#sfidaCarta.hidden{display:none}
#sfidaCodice .patto,#sfidaCarta .patto{max-width:460px;margin:16px;padding:20px 22px;text-align:left;position:relative;
  background:linear-gradient(180deg,#f2ecdb,#e3d9c0);color:#3a3020;
  font-family:var(--cond);font-weight:600;font-size:14.5px;line-height:1.5;
  box-shadow:0 8px 18px rgba(0,0,0,.6)}
#sfidaCodice .patto b,#sfidaCarta .patto b{font-weight:700}
#sfidaCodice .sf-nota,#sfidaCarta .sf-nota{font-size:12.5px;color:#5a4d33;margin-top:10px}
#sfidaCodice input,#sfidaCarta input{display:block;width:100%;box-sizing:border-box;margin:8px 0 2px;padding:8px 9px;
  font-family:var(--mono);font-weight:700;font-size:12px;letter-spacing:.04em;
  color:#20301a;background:#f8f3e6;border:1px solid #8d7c57;border-radius:2px}
#sfidaCodice .fbtn,#sfidaCarta .fbtn{margin-top:12px;margin-right:8px;color:#57492e;border-color:#b3a380;
  background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.08));
  box-shadow:0 2px 0 rgba(90,70,40,.4)}
#sfidaCodice .fbtn.paga,#sfidaCarta .fbtn.paga{background:linear-gradient(180deg,#ffc757,#e59200);border-color:#a86f00;color:#12210f}
/* IL CODICE SI DEVE POTER LEGGERE AD ALTA VOCE E RICOPIARE: settantanove
   caratteri in una riga sola diventano sei punti di grigio su un
   telefono stretto. Qui va a capo da solo, monospazio e spaziato. */
#sfCartaMio{font-size:13px;letter-spacing:.09em;line-height:1.45;word-break:break-all;white-space:normal;
  min-height:56px;resize:none}`;

/* ============================================================= 2) l'HTML */
const A2 = `    <div class="sf-lista" id="sfLista"></div>
    <div class="azioni">`;
const B2 = `    <div class="sf-lista" id="sfLista"></div>
    <!-- L'INGRESSO DELLA SFIDA DI CARTA STA QUI, SOTTO LA LISTA, e il
         posto e' misurato (voce #135, fuori/_sonda-135-bottone.js).
         Sopra la lista spingerebbe la prima riga a 375 su una piega di
         360 e romperebbe _q-sigillo B3 — il difetto gia' pagato del
         TORNEO. Qui non muove di un pixel CERCA AVVERSARIO (220), la
         prima riga (329) ne' il primo GUARDA (308).
         E' l'unica cosa di questa schermata che funziona SENZA RETE:
         chi apre SFIDA e non ha campo trova comunque una partita da
         giocare contro qualcuno. -->
    <button class="voce" id="btnSfidaCarta">SFIDA DI CARTA <small>un codice da incollare &middot; senza rete</small></button>
    <div class="azioni">`;

const A3 = `      <button class="fbtn paga" id="btnSfCodUsa">USA IL CODICE</button>
      <button class="fbtn" id="btnSfCodChiudi">CHIUDI</button>
    </div>
  </div>
</div>`;
const B3 = `      <button class="fbtn paga" id="btnSfCodUsa">USA IL CODICE</button>
      <button class="fbtn" id="btnSfCodChiudi">CHIUDI</button>
    </div>
  </div>
  <!-- ============ LA SFIDA DI CARTA (voce #135) ============
       Un codice che contiene tutta la partita, e che NON e' il codice
       qui sopra: quello porta via la squadra, questo porta una partita
       e basta. Le due cose stanno in due pannelli diversi apposta, e
       ognuno dei due dice dell'altro. -->
  <div id="sfidaCarta" class="hidden">
    <div class="patto">
      <b>SFIDA DI CARTA</b><br>
      Un codice che contiene <b>tutta la partita</b>: stesso campo, stessa
      squadra, stesso avversario, stesso punteggio da battere. Non serve la
      rete, non serve che l&rsquo;altro abbia un conto: si copia e si manda in un
      messaggio.
      <div class="sf-nota" id="sfCartaVia">Crea una sfida, giocala fino in fondo, e il codice compare qui sotto.</div>
      <input id="sfCartaMio" readonly spellcheck="false" aria-label="il codice della tua sfida di carta">
      <button class="fbtn paga" id="btnSfCartaNuova">CREA UNA SFIDA</button>
      <div class="sf-nota">Hai ricevuto un codice? Incollalo qui e gioca la stessa identica partita.</div>
      <input id="sfCartaIn" autocomplete="off" spellcheck="false" placeholder="incolla qui il codice" aria-label="codice di sfida ricevuto">
      <div class="sf-nota" id="sfCartaNota"></div>
      <button class="fbtn paga" id="btnSfCartaUsa">GIOCA LA SFIDA</button>
      <button class="fbtn" id="btnSfCartaChiudi">CHIUDI</button>
      <!-- LE DUE COSE DA DIRE, E VANNO DETTE QUI E NON ALTROVE.
           La prima: il codice porta la PARTITA, non la prova. Chi lo
           riceve puo' dichiarare il punteggio che vuole, e non c'e'
           nessun giudice che possa smentirlo — un nastro non ci sta in
           un messaggio. Chi vuole un risultato verificato ha la SFIDA
           di rete, che il giudice ce l'ha (voci #130-#134).
           La seconda: questo non e' il codice del CAMBIO TELEFONO. -->
      <div class="sf-nota"><b>Non &egrave; un controllo.</b> Il codice porta la partita, non la prova:
      chi lo riceve pu&ograve; dire il punteggio che vuole, e nessuno pu&ograve; smentirlo. &Egrave; un gioco
      fra due persone che si fidano. Per un risultato verificato c&rsquo;&egrave; la SFIDA,
      qui sopra. <b>E non &egrave; il codice del cambio telefono:</b> quello si tiene per s&eacute;,
      perch&eacute; chi lo incolla diventa la tua squadra.</div>
    </div>
  </div>
</div>`;

/* ================================================== 3) le porte di Sfida */
const A4 = `  /* ---------------------------------------------- la sfida di carta */`;
const B4 = `  /* --------------------------------------- la sfida di carta, a schermo */
  /* SI CHIAMA mostraCarta e non apriCarta perche' apriCarta e' gia' la
     funzione che APRE LA PARTITA: due nomi uguali per due cose diverse
     a due righe di distanza sono un errore che aspetta. */
  mostraCarta(){
    const e = $('sfCartaMio');
    if(e) e.value = this.cartaCodice || '';
    const v = $('sfCartaVia');
    if(v) v.textContent = this.cartaCodice
      ? 'Questo è il codice della tua ultima sfida di carta. Copialo e mandalo: chi lo incolla gioca la stessa identica partita.'
      : 'Crea una sfida, giocala fino in fondo, e il codice compare qui sotto.';
    const n = $('sfCartaNota');
    if(n) n.textContent = this.cartaRiga || '';
    const i = $('sfCartaIn'); if(i) i.value = '';
    show($('sfidaCarta'));
  },
  /* il dito su GIOCA LA SFIDA. Torna vero se la partita e' partita. */
  usaCarta(){
    const i = $('sfCartaIn'), n = $('sfCartaNota');
    const testo = i ? String(i.value || '') : '';
    const dire = t => { if(n) n.textContent = t; };
    /* =====================================================================
       CHI INCOLLA QUI IL CODICE DEL CAMBIO TELEFONO VA FERMATO CON LA
       FRASE GIUSTA (voce #135). Non «codice sbagliato»: quello e' il
       codice che regala la squadra a chi ce l'ha, e se e' finito in
       questo campo vuol dire che qualcuno stava per mandarlo a un
       amico. Si riconosce dalla forma — tre pezzi separati da punto,
       che e' esattamente cio' che accettaTrasferimento pretende — e la
       riga che esce parla di quello, non del formato.
       ===================================================================== */
    if(testo.indexOf('.') >= 0 && testo.trim().split('.').length === 3){
      dire(this.perCarta('sembra-trasferimento'));
      try{ toast('fischietto','QUELLO NON SI MANDA','È il codice del cambio telefono: chi lo incolla diventa la tua squadra.'); }catch(e){}
      return false;
    }
    const r = this.cartaGioca(testo);
    if(r && r.errore){
      dire(this.perCarta(r.errore));
      try{ toast('fischietto','CODICE SBAGLIATO','Guarda la riga sotto il campo: dice che cosa non va.'); }catch(e){}
      return false;
    }
    return true;
  },

  /* ---------------------------------------------- la sfida di carta */`;

const A5 = `  cartaEsito: '',`;
const B5 = `  cartaEsito: '',
  /* la frase che il pannello mostra dopo una sfida di carta finita: il
     confronto per chi l'ha ricevuta, il punteggio per chi l'ha creata */
  cartaRiga: '',`;

const A6 = `      case 'rose-corte':       return 'Il codice non porta due squadre complete.';`;
const B6 = `      case 'sembra-trasferimento': return 'Questo è il codice del CAMBIO TELEFONO, non una sfida: non si manda a nessuno, perché chi lo incolla diventa la tua squadra. Un codice di sfida comincia per CARTA e non ha punti dentro.';
      case 'rose-corte':       return 'Il codice non porta due squadre complete.';`;

/* ========================================== 4) la riga del confronto */
const A7 = `      Sfida.cartaEsito = come;`;
const B7 = `      Sfida.cartaEsito = come;
      Sfida.cartaRiga = 'Hai chiuso ' + ga + '-' + gd + ', chi ti ha sfidato ' + (b[0]|0) + '-' + (b[1]|0) + ': ' +
        (come === 'meglio' ? 'hai fatto meglio.' : (come === 'pari' ? 'siete pari.' : 'non ci sei riuscito.'));`;

const A8 = `      Sfida.cartaEsito = '';
      try{ toast('scopa','IL CODICE È PRONTO','Sta nella schermata SFIDA, sotto SFIDA DI CARTA: copialo e mandalo.'); }catch(e){}`;
const B8 = `      Sfida.cartaEsito = '';
      Sfida.cartaRiga = 'La tua sfida è finita ' + ga + '-' + gd + ': chi riceve il codice deve fare meglio di così.';
      try{ toast('scopa','IL CODICE È PRONTO','Sta nella schermata SFIDA, sotto SFIDA DI CARTA: copialo e mandalo.'); }catch(e){}`;

/* ============================================= 5) i comandi e il ritorno */
const A9 = `$('btnSfCodChiudi').addEventListener('click', ()=>{ Audio5.unlock(); hide($('sfidaCodice')); });
$('btnBackSfida').addEventListener('click', ()=>{ hide($('sfidaCodice')); goScreen(ui.menu); });`;
const B9 = `$('btnSfCodChiudi').addEventListener('click', ()=>{ Audio5.unlock(); hide($('sfidaCodice')); });
/* ------------------------------------------------- la sfida di carta */
$('btnSfidaCarta').addEventListener('click', ()=>{ Audio5.unlock(); Sfida.mostraCarta(); });
$('btnSfCartaNuova').addEventListener('click', ()=>{ Audio5.unlock(); Audio5.beep(520); Sfida.cartaNuova(); });
$('btnSfCartaUsa').addEventListener('click', ()=>{ Audio5.unlock(); Sfida.usaCarta(); });
/* Invio nel campo vale GIOCA LA SFIDA, come nel pannello del cambio
   telefono: chi incolla e preme Invio non deve cercare il bottone */
$('sfCartaIn').addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); Audio5.unlock(); Sfida.usaCarta(); } });
$('btnSfCartaChiudi').addEventListener('click', ()=>{ Audio5.unlock(); hide($('sfidaCarta')); });
$('btnBackSfida').addEventListener('click', ()=>{ hide($('sfidaCodice')); hide($('sfidaCarta')); goScreen(ui.menu); });`;

const A10 = `  if(G.sfidaFine){ setScene('menu'); Audio5.crowdLevel(0); Sfida.apri(); }`;
const B10 = `  /* DOPO UNA SFIDA DI CARTA (G.sfidaFine===3) la cosa che serve non e'
     la lista delle sfide di rete: e' il CODICE, appena nato col
     punteggio dentro, o il confronto con quello che c'era da battere.
     Il pannello si apre da se' (voce #135). */
  if(G.sfidaFine===3){ const c=1; setScene('menu'); Audio5.crowdLevel(0); Sfida.apri(); Sfida.mostraCarta(); }
  else if(G.sfidaFine){ setScene('menu'); Audio5.crowdLevel(0); Sfida.apri(); }`;

/* ------------------------------------------------------------------ */
const src = fs.readFileSync(inFile, 'utf8');
const coppie = [[A1, B1], [A2, B2], [A3, B3], [A4, B4], [A5, B5], [A6, B6],
                [A7, B7], [A8, B8], [A9, B9], [A10, B10]];
const guai = [];
coppie.forEach(([a], i) => {
  const n = src.split(a).length - 1;
  if (n !== 1) guai.push('ancora ' + (i + 1) + ': trovata ' + n + ' volte invece di 1');
});
if (guai.length) { console.error('FALLITO:\n  ' + guai.join('\n  ')); process.exit(1); }

let out = src;
for (const [a, b] of coppie) out = out.replace(a, b);

const attesi = [
  ['id="btnSfidaCarta"', 1],
  ['id="sfidaCarta"', 1],
  ['id="sfCartaMio"', 1],
  ['id="sfCartaIn"', 1],
  ['id="sfCartaNota"', 1],
  ['id="btnSfCartaNuova"', 1],
  ['id="btnSfCartaUsa"', 1],
  ['  mostraCarta(){', 1],
  ['  usaCarta(){', 1],
  ["case 'sembra-trasferimento':", 1],
  ['#sfidaCodice,#sfidaCarta{', 1],
  /* quel che NON deve cambiare: i tre bersagli di _q-sigillo B3 stanno
     tutti SOPRA l'inserimento, e la barra ha ancora i suoi tre bottoni */
  ['id="btnSfidaCerca"', 1],
  ['id="btnSfidaClassifica"', 1],
  ['id="btnSfidaCodice"', 1],
  ['id="btnBackSfida"', 1],
  ['const MOTORE_V = 2;', 1],
  ['const CARTA_TAGLIE = [5];', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
/* LA BARRA .azioni DI SFIDA HA ANCORA TRE BOTTONI E NON QUATTRO: e' la
   misura del compito 0 messa a guardia. Un quarto bottone li' manderebbe
   la barra su due file e il nuovo sotto la piega. */
const barra = /<div class="azioni">\s*<button class="btnA sec" id="btnSfidaClassifica">[\s\S]*?<\/div>/.exec(out);
if (!barra) rotti.push('non trovo la barra .azioni di SFIDA');
else if ((barra[0].match(/<button/g) || []).length !== 3)
  rotti.push('la barra .azioni di SFIDA ha ' + (barra[0].match(/<button/g) || []).length + ' bottoni invece di 3');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  la sfida di carta si vede e si tocca: dieci ancore, +' + (out.length - src.length) + ' caratteri');
console.log('    da   ' + inFile + '  (' + src.length + ' caratteri)');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri)');
console.log('    prova:  node strumenti/_q-carta.js --solo D' + (dentro ? '' : ' --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/')));
