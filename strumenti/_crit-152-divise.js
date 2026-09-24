/* =====================================================================
   _crit-152-divise.js — LE DUE VERSIONI BUGIARDE DELLE DIVISE (voce #152)

   Costruisce, in `fuori/`, due copie del gioco che il cancello
   `_q-divise.js` DEVE dichiarare rosse. Se non le dichiara rosse, il
   cancello non discrimina: attesta, e un cancello che attesta vale meno
   di nessun cancello.

   PERCHE' QUESTI DUE FALSI E NON ALTRI. Il difetto che si vuole poter
   vedere non e' inventato: il #151 lo ha misurato. L'atlas cuoce le
   cinque tinte del kit dentro lo sprite, quindi sul campo restano
   ventidue maglie identiche MENTRE LO STATO DEL GIOCO CONTINUA A DIRE
   CHE I DUE KIT SONO DIVERSI. E' la firma esatta del guasto: chi
   controllasse `TEAMCOL[0] !== TEAMCOL[1]` troverebbe tutto in ordine.
   I due falsi la riproducono senza toccare `TEAMCOL`:

     uguale  la squadra 1 si DISEGNA col kit della squadra 0. Lo stato
             non e' toccato: il tabellino, la minimappa e il menu
             continuano a dichiarare due divise diverse.
     quasi   il caso PEGGIORE, e il motivo per cui non basta il primo:
             la squadra 1 si disegna con la tinta della squadra 0
             ruotata di DODICI GRADI. Sono due kit diversi per davvero —
             un confronto di stringhe li distingue, un istogramma a passo
             di venti gradi quasi sempre li mette nella stessa colonna —
             e l'occhio, a quaranta pixel di figura, non li separa. Un
             cancello che passa «uguale» e cade su «quasi» sta contando
             stringhe, non luce.

   Il falso non e' gentile: e' costruito nel caso peggiore per il
   cancello, che e' l'unico modo in cui un falso prova qualcosa.

   uso:  node strumenti/_crit-152-divise.js            (scrive tutt'e due)
         node strumenti/_crit-152-divise.js --solo quasi
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };

/* L'ANCORA: le tre righe in cima a rigLook che scelgono le tinte della
   divisa. Sono il punto in cui il gioco passa dallo STATO (TEAMCOL) al
   DISEGNO (il look del rig), cioe' esattamente il punto in cui l'atlas
   spezzava la catena. */
const ANCORA = `  const c1 = gk ? gkKit(p.team,0) : TEAMCOL[p.team];
  const c2 = gk ? gkKit(p.team,1) : TEAMCOL2[p.team];
  const pat = gk ? 0 : (TEAMPAT[p.team]|0);`;

/* la rotazione di tinta, scritta una volta e innestata nel falso «quasi».
   Non usa HSL del browser: fa il giro a mano, cosi' il falso non dipende
   da come Chrome arrotonda una stringa di colore. */
const RUOTA = `
function __critRuotaTinta(hex, gradi){
  const m=/^#?([0-9a-f]{6})$/i.exec(String(hex||'')); if(!m) return hex;
  const v=parseInt(m[1],16);
  let r=((v>>16)&255)/255, g=((v>>8)&255)/255, b=(v&255)/255;
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn;
  let h=0; if(d>0){ if(mx===r)h=60*(((g-b)/d)%6); else if(mx===g)h=60*((b-r)/d+2); else h=60*((r-g)/d+4); }
  if(h<0)h+=360;
  const s=mx?d/mx:0, vv=mx;
  h=(h+gradi+360)%360;
  const c=vv*s, x=c*(1-Math.abs((h/60)%2-1)), mm=vv-c;
  let rr=0,gg=0,bb=0;
  if(h<60){rr=c;gg=x;} else if(h<120){rr=x;gg=c;} else if(h<180){gg=c;bb=x;}
  else if(h<240){gg=x;bb=c;} else if(h<300){rr=x;bb=c;} else {rr=c;bb=x;}
  const q=n=>('0'+Math.round((n+mm)*255).toString(16)).slice(-2);
  return '#'+q(rr)+q(gg)+q(bb);
}`;

const FALSI = {
  /* LA SQUADRA 1 SI DISEGNA COL KIT DELLA SQUADRA 0. Lo stato non si
     tocca: TEAMCOL resta quello che era, e il gioco continua a credere
     di vestire due squadre diverse. */
  uguale: `  const __t0 = 0;   /* FALSO _crit-152-divise «uguale»: il DISEGNO ignora la squadra */
  const c1 = gk ? gkKit(p.team,0) : TEAMCOL[__t0];
  const c2 = gk ? gkKit(p.team,1) : TEAMCOL2[__t0];
  const pat = gk ? 0 : (TEAMPAT[__t0]|0);`,
  /* DODICI GRADI DI TINTA: due kit diversi che l'occhio non separa. */
  quasi: `  /* FALSO _crit-152-divise «quasi»: dodici gradi di tinta, cioe' due
     divise diverse per una stringa e identiche per un occhio. */
  const c1 = gk ? gkKit(p.team,0) : (p.team ? __critRuotaTinta(TEAMCOL[0],12) : TEAMCOL[0]);
  const c2 = gk ? gkKit(p.team,1) : (p.team ? __critRuotaTinta(TEAMCOL2[0],12) : TEAMCOL2[0]);
  const pat = gk ? 0 : (TEAMPAT[0]|0);`,
};

const ING = path.resolve(RADICE, arg('gioco', 'CALCETTO-il-gioco.html'));
const SOLO = arg('solo', '');
if (!fs.existsSync(ING)) { console.error('FALSO NON COSTRUITO: manca ' + ING); process.exit(2); }
fs.mkdirSync(path.join(RADICE, 'fuori'), { recursive: true });

let quanti = 0;
for (const [nome, metti] of Object.entries(FALSI)) {
  if (SOLO && SOLO !== nome) continue;
  let t = fs.readFileSync(ING, 'utf8');
  const n = t.split(ANCORA).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO («' + nome + '»): ancora trovata ' + n + ' volte (ne serve 1)'); process.exit(2); }
  t = t.replace(ANCORA, metti);
  if (nome === 'quasi') {
    /* la funzione di rotazione va dichiarata PRIMA di rigLook: si posa
       subito sopra la sua definizione, che e' l'unico posto in cui
       l'ancora e' sicura. */
    const a2 = 'function rigLook(p){';
    if (t.split(a2).length - 1 !== 1) { console.error('FALSO NON COSTRUITO («quasi»): rigLook non e\' unico'); process.exit(2); }
    t = t.replace(a2, RUOTA + '\n' + a2);
  }
  const usc = path.join(RADICE, 'fuori', '152-falso-divise-' + nome + '.html');
  fs.writeFileSync(usc, t);
  console.log('falso costruito: ' + path.relative(RADICE, usc) +
              '  (' + Buffer.byteLength(t, 'utf8') + ' byte)');
  quanti++;
}
if (!quanti) { console.error('nessun falso: --solo «' + SOLO + '» non esiste (uguale | quasi)'); process.exit(2); }
