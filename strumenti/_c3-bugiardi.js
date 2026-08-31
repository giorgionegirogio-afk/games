/* =====================================================================
   _c3-bugiardi.js — I GIOCHI-BUGIARDI DELLA TERZA FAMIGLIA.

   UN CANCELLO SENZA IL SUO ROSSO DIMOSTRATO E' UN TIMBRO. Questa toppa
   ha portato due banchi nuovi (_p-scatto.js, _p-scudo.js) e ha toccato
   due cancelli di casa (_q-l16.js, _q-precedenza.js): qui si fabbricano
   le copie costruite APPOSTA per batterli, e si dichiara quale numero
   deve accendersi su ognuna.

     nastro   il quinto disco torna dove stava nella prima stesura
              (bx-252, VH-56), cioe' sotto il nastro dell'evento.
              -> _q-dischi.js deve dare PROVA NULLA («soloDischi()
                 ridipinge N pixel diversi dal fotogramma vero»)

     presa    il quinto disco scende addosso a PASSA, con le prese che
              si toccano.
              -> _q-l16.js deve dare ROSSO su A («prese disgiunte: NO»)

     tremolio la PRIMA STESURA dello scudo, con una domanda sola: il
              fiato si consuma solo mentre si protegge, quindi sotto la
              soglia lo scudo si spegne, il ramo del recupero lo rimette
              sopra e si riaccende.
              -> _p-scudo.js a otto secondi deve mostrare un fiato
                 finale incollato alla soglia e uno scudo che non
                 finisce mai

     senzafiato  la variante BOCCIATA dello scudo: reggere un uomo non
              costa fiato.
              -> _p-scudo.js deve dare uno scudo IMBATTIBILE (zero
                 palloni persi) anche a otto secondi: e' il numero per
                 cui SCUDO_FIATO esiste

     morto    il disco c'e', si dipinge, si preme — e non fa NIENTE:
              Touch5.scatta torna sempre false.
              -> _p-scatto.js col dito tenuto deve leggere 0% di scatto
                 (invece del 66,9% del gioco curato), e _p-scudo.js deve
                 dare due bracci identici

   uso:  node strumenti/_c3-bugiardi.js --in fuori/cmd-terza.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const IN = path.resolve(arg('in', path.join(RADICE, 'fuori/cmd-terza.html')));

const BUGIE = {
  nastro: [
    [`    scudo ? { act:'sprint',  label:'SCUDO',     x:bx+s*220, y:VH-148, r:26 }
          : { act:'sprint',  label:'SCATTO',    x:bx+s*220, y:VH-148, r:26 },`,
     `    scudo ? { act:'sprint',  label:'SCUDO',     x:bx+s*252, y:VH-56,  r:26 }
          : { act:'sprint',  label:'SCATTO',    x:bx+s*252, y:VH-56,  r:26 },`],
  ],
  presa: [
    [`    scudo ? { act:'sprint',  label:'SCUDO',     x:bx+s*220, y:VH-148, r:26 }
          : { act:'sprint',  label:'SCATTO',    x:bx+s*220, y:VH-148, r:26 },`,
     `    scudo ? { act:'sprint',  label:'SCUDO',     x:bx+s*180, y:VH-148, r:26 }
          : { act:'sprint',  label:'SCATTO',    x:bx+s*180, y:VH-148, r:26 },`],
  ],
  tremolio: [
    [`  const scudaC = isHuman && scudoChiesto(p);
  const scuda = scudaC && p.fiato>6;`,
     `  const scudaC = isHuman && scudoChiesto(p) && p.fiato>6;
  const scuda = scudaC;`],
  ],
  senzafiato: [
    [`  else if(scudaC) p.fiato=Math.max(0,p.fiato-SCUDO_FIATO*(1+COND_MORSO*0.5*(1-q))*dt);`,
     `  else if(scudaC){ /* la variante BOCCIATA: reggere non costa aria */ }`],
  ],
  morto: [
    [`  scatta(t){
    for(const id in this.atti){
      const a=this.atti[id];
      if(a.t===t && a.act==='sprint' && !a.morto && this.btnTouch[id]) return true;
    }
    return false;
  },`,
     `  scatta(t){
    return false;
  },`],
  ],
};

const nome = arg('bugia', '');
const quali = nome ? [nome] : Object.keys(BUGIE);
const src = fs.readFileSync(IN, 'utf8');
let male = 0;
for (const q of quali) {
  let out = src, ok = true;
  for (const [cerca, metti] of BUGIE[q]) {
    const n = out.split(cerca).length - 1;
    if (n !== 1) { console.error('FALLITO ' + q + ': ancoraggio trovato ' + n + ' volte'); ok = false; male++; break; }
    out = out.replace(cerca, metti);
  }
  if (!ok) continue;
  if (out === src) { console.error('FALLITO ' + q + ': la bugia non ha cambiato niente'); male++; continue; }
  const f = path.join(RADICE, 'fuori', 'cmd3-bugiardo-' + q + '.html');
  fs.writeFileSync(f, out);
  console.log('OK  ' + f + '  (' + out.length + ' caratteri)');
}
process.exit(male ? 1 : 0);
