/* =====================================================================
   _143-matematica.js — LA SORGENTE DELLE TRASCENDENTI IN CASA
   (voce #143, compito 2)

   QUESTO FILE E' L'UNICA COPIA. Il testo qui sotto e' quello che
   `_toppa-143-matematica.js` innesta nel gioco, ed e' lo stesso che
   `_q-casa.js` misura in Node e nei tre motori: se fossero due testi,
   il banco misurerebbe una funzione e il gioco ne userebbe un'altra —
   il modo piu' silenzioso che esista di attestare invece di misurare.

   PERCHE'. ECMA-262 non obbliga le trascendenti a essere correttamente
   arrotondate («implementation-approximated»): il #141 ha misurato che
   fra V8, JavaScriptCore e SpiderMonkey `hypot` differisce sull'ultimo
   bit su 100 valori su 200, `atan2` su 24, `exp` su 21, `tan` su 9,
   `sin` su 7, `cos` su 3, `log` su 6. In un motore caotico a sessanta
   passi al secondo un ultimo bit diventa un gol: otto semi su otto
   davano partite diverse fra i tre motori, e il lockstep dell'onda E
   era impossibile.

   COME. Tutto qui dentro usa SOLO operazioni che IEEE-754 obbliga a
   essere correttamente arrotondate — `+`, `-`, `*`, `/`, `Math.sqrt` —
   piu' le operazioni intere (`|0`, `Math.imul`, gli scorrimenti) che
   sono esatte per specifica. Nessuna chiamata a una trascendente
   nativa: se ce ne fosse una sola, l'ultimo bit tornerebbe a dipendere
   dal telefono, e il cantiere sarebbe finto.

   NON SERVE CHE SIANO PRECISE, SERVE CHE SIANO LE STESSE. La precisione
   conta lo stesso, ma per un'altra ragione: una funzione in casa molto
   imprecisa sarebbe uguale ovunque e cambierebbe il gioco molto piu' di
   quanto lo cambi la cura (il falso `_crit-casa-storta`). Percio' i
   polinomi sono quelli di fdlibm (Sun, 1993), che sono minimax sul
   proprio intervallo e stanno sotto l'ulp, e il banco misura lo scarto
   in ULP contro le funzioni native dei tre motori sul dominio VERO del
   gioco.

   LA RIDUZIONE D'ARGOMENTO e' il punto dove si perde la precisione, e
   qui e' quella di fdlibm: pi/2 spezzato in tre pezzi da 33 bit, cosi'
   che `n * pezzo` sia ESATTO, e una catena compensata di sottrazioni.
   La sola differenza e' che i tre livelli si applicano SEMPRE invece
   che solo quando l'esponente dice che si e' persa precisione: costa
   sei operazioni in piu' e toglie tre rami, e un ramo in meno e' un
   posto in meno dove due motori possano prendere strade diverse (non
   potrebbero — i rami sono su valori calcolati con operazioni esatte —
   ma un invariante che non ha bisogno di essere dimostrato e' meglio di
   uno che ce l'ha).

   COSA NON C'E', E PERCHE'.
     · `Math.sqrt` resta nativa: IEEE-754 la obbliga a essere
       correttamente arrotondata, quindi da' lo stesso bit su qualunque
       motore conforme. MISURATO: 0 differenze su 200 valori fra i tre
       motori (_q-motori, prova T). Riscriverla potrebbe solo peggiorarla.
     · `Math.abs`, `Math.min`, `Math.max`, `Math.floor`, `Math.round`,
       `Math.imul` sono esatte per specifica e restano native.

   L'ORDINE DELLE OPERAZIONI E' IL CONTRATTO. In virgola mobile
   `(a+b)+c` non e' `a+(b+c)`: ogni parentesi qui sotto e' parte della
   definizione, non uno stile. Chi «semplifica» un'espressione cambia i
   bit e quindi la partita.
   ===================================================================== */
'use strict';

const SORGENTE = String.raw`
/* =====================================================================
   LA MATEMATICA IN CASA (voce #143).

   Le funzioni trascendenti del gioco, riscritte con sole operazioni che
   IEEE-754 obbliga a essere correttamente arrotondate (+ - * / sqrt) e
   con le operazioni intere, che sono esatte per specifica. Servono
   perche' ECMA-262 lascia sin, cos, tan, exp, log, atan2 e hypot
   «implementation-approximated»: due motori conformi possono dare
   l'ultimo bit diverso, e il #141 ha misurato che otto partite su otto
   divergevano fra V8, JavaScriptCore e SpiderMonkey.

   NON SERVE CHE SIANO PRECISE, SERVE CHE SIANO LE STESSE OVUNQUE. Lo
   sono per costruzione: ogni operazione qui dentro ha un risultato
   imposto dalla norma. La precisione conta lo stesso, perche' una
   funzione uguale ovunque ma storta cambierebbe il gioco piu' della
   cura: i polinomi sono quelli minimax di fdlibm e lo scarto misurato
   contro le native dei tre motori sta sotto l'ulp (strumenti/_q-casa.js).

   MAI CHIAMARE UNA TRASCENDENTE NATIVA QUI DENTRO. Una sola basterebbe
   a rimettere l'ultimo bit nelle mani del telefono.
   ===================================================================== */
const M_SQRT = Math.sqrt;   /* IEEE-754 la obbliga a essere correttamente arrotondata */
const M_ABS  = Math.abs;    /* esatta per specifica: toglie solo il bit di segno */

/* L'INTERO PIU' VICINO, SENZA UN RAMO E SENZA Math.round.
   (a + 1.5*2^52) - 1.5*2^52 sfrutta l'arrotondamento della somma, che
   la norma impone al pari piu' vicino: lo stesso intero su qualunque
   motore. Vale per |a| < 2^51, e oltre a e' gia' intero e torna se
   stesso. Math.round andrebbe bene lo stesso (e' esatta per specifica)
   ma arrotonda .5 verso l'alto invece che al pari, e i polinomi di
   fdlibm sono tarati sull'altro. */
const M_MAGIC = 6755399441055744;   /* 1.5 * 2^52 */
function M_rint(a){ return (a + M_MAGIC) - M_MAGIC; }

/* x * 2^k, esatto. Moltiplicare e dividere per una potenza di due non
   introduce errore (finche' non si sfonda l'intervallo), e 2^k si
   costruisce con moltiplicazioni intere esatte invece che con
   Math.pow(2,k) — che e' proprio una delle funzioni di cui non ci
   fidiamo. */
function M_ldexp(x, k){
  if(k > 1023){ x *= 8.98846567431158e307; k -= 1023;
                if(k > 1023){ x *= 8.98846567431158e307; k -= 1023; if(k > 1023) k = 1023; } }
  else if(k < -1022){ x *= 2.2250738585072014e-308; k += 1022;
                if(k < -1022){ x *= 2.2250738585072014e-308; k += 1022; if(k < -1022) k = -1022; } }
  if(k >= 0){ let s = 1, n = k; while(n >= 30){ s *= 1073741824; n -= 30; } s *= (1 << n); return x * s; }
  let d = 1, n = -k; while(n >= 30){ d *= 1073741824; n -= 30; } d *= (1 << n); return x / d;
}

/* ---------------------------------------------------------------
   LA RIDUZIONE D'ARGOMENTO — x = n*(pi/2) + y0 + y1, con |y0| <= pi/4.
   E' qui che si perde la precisione, e per questo pi/2 e' spezzato in
   tre pezzi da 33 bit significativi: n*pezzo e' allora ESATTO, e la
   catena di sottrazioni compensate recupera i bit che la cancellazione
   si mangia. Costanti di fdlibm (Sun Microsystems, 1993).
   n SI SPEZZA IN TRE perche' n*PIO2_1 resti ESATTO: PIO2_1 ha 33 bit
   significativi, quindi ogni pezzo di n ne puo' portare 20.

   E C'E' UN TETTO, DICHIARATO INVECE CHE SCOPERTO DOPO. Questa e' la
   via «media» di fdlibm, e la sua precisione non dipende dal prodotto
   esatto ma dal RESIDUO: dopo il primo livello r vale circa
   n * 9.1e-11 (quel che a PIO2_1 manca per essere pi/2), e l'errore
   finale e' l'ulp di quel residuo. Fino a |x| = 2^31 il residuo sta
   sotto 0.13 e l'errore sotto 1.5e-17, cioe' un decimillesimo di ulp
   del risultato. A |x| = 1e17 il residuo vale sei milioni e l'errore
   arriva a 1e-6: la funzione smetterebbe di essere una funzione senza
   dirlo. Per questo sopra 2^31 si da' NaN.

   PERCHE' NaN E NON UN NUMERO QUALSIASI. Un seno che vale 0.3 quando
   dovrebbe valere -0.8 e' una bugia silenziosa che cammina dentro la
   fisica per novanta secondi; un NaN lo vede «_q-invarianti» al primo
   passo. E il tetto non e' un'ipotesi: «_q-casa.js» MISURA il piu'
   grande argomento che il gioco passa davvero in una partita vera e
   controlla che stia molti ordini di grandezza sotto. fdlibm, sopra
   quella soglia, passa alla riduzione di Payne-Hanek; qui non c'e'
   perche' non c'e' un dominio da difendere, e scriverla «per sicurezza»
   sarebbe codice mai eseguito, cioe' mai misurato.
   --------------------------------------------------------------- */
const M_TETTO = 2147483648;   /* 2^31 — oltre, la riduzione non sa piu' quel che dice */
const M_INVPIO2 = 6.36619772367581382433e-01;
const M_PIO2_1  = 1.57079632673412561417e+00;
const M_PIO2_1T = 6.07710050650619224932e-11;
const M_PIO2_2  = 6.07710050630396597660e-11;
const M_PIO2_2T = 2.02226624879595063154e-21;
const M_PIO2_3  = 2.02226624871116645580e-21;
const M_PIO2_3T = 8.47842766036889956997e-32;
let M_Y0 = 0, M_Y1 = 0;
function M_rempio2(x){
  const fn = M_rint(x * M_INVPIO2);
  /* il resto in virgola mobile e' esatto, quindi i tre pezzi sono esatti */
  const fa = fn - (fn % 1099511627776);   /* multipli di 2^40 */
  const rb = fn - fa;
  const fb = rb - (rb % 1048576);         /* multipli di 2^20 */
  const fc = rb - fb;
  let r = ((x - fa * M_PIO2_1) - fb * M_PIO2_1) - fc * M_PIO2_1;
  let t = r, w;
  /* secondo livello — pi/2 = PIO2_1 + PIO2_2 + PIO2_2T + ... , e la
     catena compensata recupera i bit che la cancellazione si mangia */
  w = fn * M_PIO2_2;
  r = t - w;
  w = fn * M_PIO2_2T - ((t - r) - w);
  let y0 = r - w;
  /* terzo livello */
  t = r;
  w = fn * M_PIO2_3;
  r = t - w;
  w = fn * M_PIO2_3T - ((t - r) - w);
  y0 = r - w;
  M_Y0 = y0;
  M_Y1 = (r - y0) - w;
  const n = fn % 4;
  return n < 0 ? n + 4 : n;
}

/* i due nuclei di fdlibm su [-pi/4, pi/4]: polinomi minimax, errore
   sotto mezzo ulp sull'intervallo ridotto */
const M_S1 = -1.66666666666666324348e-01, M_S2 =  8.33333333332248946124e-03,
      M_S3 = -1.98412698298579493134e-04, M_S4 =  2.75573137070700676789e-06,
      M_S5 = -2.50507602534068634195e-08, M_S6 =  1.58969099521155010221e-10;
function M_ksin(x, y, iy){
  const z = x * x, v = z * x;
  const r = M_S2 + z * (M_S3 + z * (M_S4 + z * (M_S5 + z * M_S6)));
  if(iy === 0) return x + v * (M_S1 + z * r);
  return x - ((z * (0.5 * y - v * r) - y) - v * M_S1);
}
const M_C1 =  4.16666666666666019037e-02, M_C2 = -1.38888888888741095749e-03,
      M_C3 =  2.48015872894767294178e-05, M_C4 = -2.75573143513906633035e-07,
      M_C5 =  2.08757232129817482790e-09, M_C6 = -1.13596475577881948265e-11;
function M_kcos(x, y){
  const z = x * x;
  const r = z * (M_C1 + z * (M_C2 + z * (M_C3 + z * (M_C4 + z * (M_C5 + z * M_C6)))));
  const hz = 0.5 * z, w = 1 - hz;
  return w + (((1 - w) - hz) + (z * r - x * y));
}

const M_PIO4 = 7.85398163397448278999e-01;

function Msin(x){
  if(x !== x || M_ABS(x) > M_TETTO) return NaN;
  if(M_ABS(x) <= M_PIO4) return M_ksin(x, 0, 0);
  const n = M_rempio2(x);
  if(n === 0) return  M_ksin(M_Y0, M_Y1, 1);
  if(n === 1) return  M_kcos(M_Y0, M_Y1);
  if(n === 2) return -M_ksin(M_Y0, M_Y1, 1);
  return -M_kcos(M_Y0, M_Y1);
}
function Mcos(x){
  if(x !== x || M_ABS(x) > M_TETTO) return NaN;
  if(M_ABS(x) <= M_PIO4) return M_kcos(x, 0);
  const n = M_rempio2(x);
  if(n === 0) return  M_kcos(M_Y0, M_Y1);
  if(n === 1) return -M_ksin(M_Y0, M_Y1, 1);
  if(n === 2) return -M_kcos(M_Y0, M_Y1);
  return M_ksin(M_Y0, M_Y1, 1);
}
/* LA TANGENTE E' UN RAPPORTO, e va detto invece che taciuto: fdlibm ha
   un nucleo dedicato che sta sotto l'ulp, questa forma sta intorno ai
   due ulp vicino ai poli. E' una scelta misurata, non una svista: il
   gioco chiama Math.tan due volte, tutte e due con l'argomento
   costante 16*PI/180 (l'inclinazione delle barre dell'interfaccia), e
   nella finestra della simulazione non entra mai — misurato 0 chiamate
   in 90 s di partita (_q-perimetro.js). Un nucleo in piu' da tarare
   sarebbe stato codice senza un dominio da difendere. */
function Mtan(x){
  if(x !== x || M_ABS(x) > M_TETTO) return NaN;
  if(M_ABS(x) <= M_PIO4) return M_ksin(x, 0, 0) / M_kcos(x, 0);
  const n = M_rempio2(x);
  const s = M_ksin(M_Y0, M_Y1, 1), c = M_kcos(M_Y0, M_Y1);
  return (n & 1) ? -c / s : s / c;
}

/* ---------------------------------------------------------------
   exp — fdlibm: x = k*ln2 + r con |r| <= ln2/2, poi la razionale di
   Remez su r e il riscalamento esatto per 2^k.
   --------------------------------------------------------------- */
const M_LN2HI = 6.93147180369123816490e-01,
      M_LN2LO = 1.90821492927058770002e-10,
      M_INVLN2 = 1.44269504088896338700e+00,
      M_P1 =  1.66666666666666019037e-01, M_P2 = -2.77777777770155933842e-03,
      M_P3 =  6.61375632143793436117e-05, M_P4 = -1.65339022054652515390e-06,
      M_P5 =  4.13813679705723846039e-08;
function Mexp(x){
  if(x !== x) return NaN;
  if(x === Infinity) return Infinity;
  if(x === -Infinity) return 0;
  if(x > 709.7822265625) return Infinity;
  if(x < -745.1332191019411) return 0;
  const ax = M_ABS(x);
  if(ax < 3.725290298461914e-9) return 1 + x;   /* |x| < 2^-28 */
  let hi = 0, lo = 0, k = 0, y = x;
  if(ax > 0.34657359027997264){                  /* |x| > ln2/2 */
    if(ax < 1.0397207708399179){                 /* |x| < 1.5*ln2 */
      if(x > 0){ hi = x - M_LN2HI; lo =  M_LN2LO; k =  1; }
      else     { hi = x + M_LN2HI; lo = -M_LN2LO; k = -1; }
    } else {
      k = M_rint(M_INVLN2 * x);
      hi = x - k * M_LN2HI;
      lo = k * M_LN2LO;
    }
    y = hi - lo;
  }
  const t = y * y;
  const c = y - t * (M_P1 + t * (M_P2 + t * (M_P3 + t * (M_P4 + t * M_P5))));
  if(k === 0) return 1 - ((y * c) / (c - 2) - y);
  return M_ldexp(1 - ((lo - (y * c) / (2 - c)) - hi), k);
}

/* ---------------------------------------------------------------
   log — fdlibm: x = 2^k * m con m in [sqrt(2)/2, sqrt(2)), poi la
   serie in s = f/(2+f). La scomposizione in mantissa ed esponente si
   fa a moltiplicazioni per potenze di due (esatte) invece che leggendo
   i bit: cosi' la funzione non dipende dall'ordine dei byte della
   macchina. Le scale 2^256 / 2^64 / 2^8 tengono il ciclo sotto una
   decina di giri anche sui valori estremi.
   --------------------------------------------------------------- */
const M_LG1 = 6.666666666666735130e-01, M_LG2 = 3.999999999940941908e-01,
      M_LG3 = 2.857142874366239149e-01, M_LG4 = 2.222219843214978396e-01,
      M_LG5 = 1.818357216161805012e-01, M_LG6 = 1.531383769920937332e-01,
      M_LG7 = 1.479819860511658591e-01;
function Mlog(x){
  if(x !== x || x < 0) return NaN;
  if(x === 0) return -Infinity;
  if(x === Infinity) return Infinity;
  let m = x, k = 0;
  if(m < 2.2250738585072014e-308){ m *= 18014398509481984; k -= 54; }   /* subnormali */
  while(m >= 1.157920892373162e77){ m *= 8.636168555094445e-78; k += 256; }
  while(m >= 1.8446744073709552e19){ m *= 5.421010862427522e-20; k += 64; }
  while(m >= 256){ m *= 0.00390625; k += 8; }
  while(m >= 2){ m *= 0.5; k += 1; }
  while(m < 0.00390625){ m *= 256; k -= 8; }
  while(m < 1){ m *= 2; k -= 1; }
  if(m >= 1.4142135623730951){ m *= 0.5; k += 1; }   /* [sqrt2/2, sqrt2) */
  const f = m - 1;
  if(f === 0) return k === 0 ? 0 : (k * M_LN2HI + k * M_LN2LO);
  const s = f / (2 + f), z = s * s, w = z * z;
  const t1 = w * (M_LG2 + w * (M_LG4 + w * M_LG6));
  const t2 = z * (M_LG1 + w * (M_LG3 + w * (M_LG5 + w * M_LG7)));
  const R = t2 + t1, hfsq = 0.5 * f * f;
  if(k === 0) return f - (hfsq - s * (hfsq + R));
  return k * M_LN2HI - ((hfsq - (s * (hfsq + R) + k * M_LN2LO)) - f);
}

/* ---------------------------------------------------------------
   atan e atan2 — fdlibm: quattro intervalli, una tangente nota per
   ciascuno e il polinomio sul residuo.
   --------------------------------------------------------------- */
const M_AT0 =  3.33333333333329318027e-01, M_AT1 = -1.99999999998764832476e-01,
      M_AT2 =  1.42857142725034663711e-01, M_AT3 = -1.11111104054623557880e-01,
      M_AT4 =  9.09088713343650656196e-02, M_AT5 = -7.69187620504482999495e-02,
      M_AT6 =  6.66107313738753120669e-02, M_AT7 = -5.83357013379057348645e-02,
      M_AT8 =  4.97687799461593236017e-02, M_AT9 = -3.65315727442169155270e-02,
      M_AT10 = 1.62858201153657823623e-02;
const M_ATHI = [4.63647609000806093515e-01, 7.85398163397448278999e-01,
                9.82793723247329054082e-01, 1.57079632679489655800e+00];
const M_ATLO = [2.26987774529616870924e-17, 3.06161699786838301793e-17,
                1.39033110312309984516e-17, 6.12323399573676603587e-17];
function Matan(x){
  if(x !== x) return NaN;
  const neg = x < 0;
  let ax = neg ? -x : x;
  if(ax >= 7.378697629483821e19){            /* |x| >= 2^66: l'asintoto */
    const z0 = M_ATHI[3] + M_ATLO[3];
    return neg ? -z0 : z0;
  }
  let id;
  if(ax < 0.4375){
    if(ax < 3.725290298461914e-9) return x;  /* |x| < 2^-28 */
    id = -1;
  } else if(ax < 1.1875){
    if(ax < 0.6875){ id = 0; ax = (2 * ax - 1) / (2 + ax); }
    else           { id = 1; ax = (ax - 1) / (ax + 1); }
  } else if(ax < 2.4375){ id = 2; ax = (ax - 1.5) / (1 + 1.5 * ax); }
  else                  { id = 3; ax = -1 / ax; }
  const z = ax * ax, w = z * z;
  const s1 = z * (M_AT0 + w * (M_AT2 + w * (M_AT4 + w * (M_AT6 + w * (M_AT8 + w * M_AT10)))));
  const s2 = w * (M_AT1 + w * (M_AT3 + w * (M_AT5 + w * (M_AT7 + w * M_AT9))));
  if(id < 0) return neg ? -(ax - ax * (s1 + s2)) : (ax - ax * (s1 + s2));
  const zz = M_ATHI[id] - ((ax * (s1 + s2) - M_ATLO[id]) - ax);
  return neg ? -zz : zz;
}
/* i due pezzi di pi: il doppio piu' vicino e quel che gli manca. Le
   forme «PI - (z - PI_LO)» non sono un vezzo: senza il pezzo basso, i
   due quadranti di sinistra perderebbero un ulp rispetto agli altri
   due, e l'angolo avrebbe una cucitura. */
const M_PI = 3.141592653589793, M_PI_LO = 1.2246467991473531772e-16,
      M_PIO2 = 1.5707963267948966;
function Matan2(y, x){
  if(x !== x || y !== y) return NaN;
  const yinf = (y === Infinity || y === -Infinity), xinf = (x === Infinity || x === -Infinity);
  if(yinf || xinf){
    if(yinf && xinf){ const a = (x > 0) ? (M_PIO2 / 2) : (3 * (M_PIO2 / 2)); return y > 0 ? a : -a; }
    if(yinf) return y > 0 ? M_PIO2 : -M_PIO2;
    const segno = (y < 0 || (y === 0 && 1 / y < 0)) ? -1 : 1;
    return x > 0 ? segno * 0 : segno * M_PI;
  }
  const sy = (y < 0) || (y === 0 && 1 / y < 0);
  const sx = (x < 0) || (x === 0 && 1 / x < 0);
  if(y === 0) return sx ? (sy ? -M_PI : M_PI) : (sy ? -0 : 0);
  if(x === 0) return sy ? -M_PIO2 : M_PIO2;
  const z = Matan(M_ABS(y / x));
  if(!sx) return sy ? -z : z;
  return sy ? ((z - M_PI_LO) - M_PI) : (M_PI - (z - M_PI_LO));
}

/* ---------------------------------------------------------------
   hypot — sqrt(x*x+y*y), e per una volta la forma ingenua e' anche
   quella giusta: sqrt e' correttamente arrotondata per IEEE-754,
   quindi questa riga da' gli stessi bit su qualunque motore. Il prezzo
   e' lo straripamento sopra ~1.3e154 per componente e lo sprofondo
   sotto ~1.5e-162, dove Math.hypot riscala e questa no. MISURATO sui
   domini veri del gioco (strumenti/_q-casa.js): la componente piu'
   grande vista in 90 s di partita sta sotto le migliaia, la piu'
   piccola non nulla sopra 1e-9. Va detto invece che taciuto: se un
   giorno il gioco misurasse distanze astronomiche, questa riga
   sarebbe il posto dove guardare.
   --------------------------------------------------------------- */
function Mhypot(x, y, z){
  if(x === Infinity || x === -Infinity || y === Infinity || y === -Infinity ||
     z === Infinity || z === -Infinity) return Infinity;
  if(z === undefined) return M_SQRT(x * x + y * y);
  return M_SQRT(x * x + y * y + z * z);
}
`;

/* la stessa sorgente, eseguita: e' cosi' che i banchi provano LA COSA
   INNESTATA e non una copia scritta a parte */
function api() {
  return new Function(SORGENTE + '\nreturn { Msin, Mcos, Mtan, Mexp, Mlog, Matan, Matan2, Mhypot, M_rint, M_ldexp };')();
}

module.exports = { SORGENTE, api };
