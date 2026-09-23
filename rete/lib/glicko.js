/* =====================================================================
   glicko.js — IL RATING NASCOSTO (voce #140).

   CHE COSA E', IN UNA RIGA: il numero che dice quanto vali davvero, che
   nessuno vede, e che serve soltanto ad abbinarti con qualcuno alla tua
   altezza.

   PERCHE' NON SOSTITUISCE I PUNTI, ed e' la decisione di questo cantiere
   (spec: docs/superpowers/specs/2026-09-23-glicko-design.md). I punti di
   `rete/api/sfida.js` NON sono un rating e non possono diventarlo, per
   quattro decisioni prese apposta e scritte in chiaro li' dentro:

     · il difensore perde META' di quel che l'attaccante guadagna, perche'
       lui non stava giocando;
     · la serie di vittorie MOLTIPLICA fino a 1,3;
     · c'e' un pavimento a 100, sotto il quale perdere e' gratis;
     · contro un avversario costruito si prende meta' e non si toglie
       niente a nessuno.

   Ognuna di quelle quattro CREA valore dal nulla, ed e' giusto che lo
   faccia: i punti sono una valuta che premia il giocare. Un rating
   invece deve conservarsi — misurato su 400 allenatori e 18.546 sfide,
   i punti derivano del +1,6% in sessanta giorni. Sono due grandezze
   diverse e stanno in due colonne diverse.

   E IL MANDATO CHIEDE PROPRIO QUESTO: «Hidden rating: Glicko-2 (rating,
   deviation, volatility)... matchmaking uses hidden rating» accanto a
   «Trophies (visible)» — due righe, due cose
   (_analisi/MANDATO-STADIUM-ROAR.md righe 163-164).

   QUESTO FILE NON SA CHE ESISTE UN DATABASE. E' aritmetica pura, come
   `rete/prove/tutte.js` dice della parte del server che puo' sbagliare
   in modo grave. Chi scrive sul database e' `rete/api/sfida.js`, con la
   guardia di `posa_nascosto`.

   IL RIFERIMENTO: Mark E. Glickman, «Example of the Glicko-2 system».
   La nostra implementazione riproduce l'esempio lavorato del paper
   numero per numero — e' il gruppo A di `strumenti/_q-glicko.js`, ed e'
   il cancello che il mandato chiede per nome (milestone M9).
   ===================================================================== */

/* =====================================================================
   LE COSTANTI, e nessuna di loro e' una scelta nostra.

   SCALA_G = 400/ln(10): e' il fattore che porta la scala «da 1500» di
   Glicko-1 alla scala interna di Glicko-2. Il paper lo stampa come
   173.7178 e lo stesso numero sta scritto nei nostri commenti: qui si
   CALCOLA, cosi' non c'e' una cifra da ricopiare a mano.

   TAU governa quanto la volatilita' puo' muoversi in un periodo. Piu'
   basso, piu' il sistema e' sordo alle sorprese; piu' alto, piu' un
   risultato strano fa ballare il rating. Glickman raccomanda fra 0,3 e
   1,2; il mandato chiede 0,5 (riga 444) ed e' il valore dell'esempio
   lavorato — cioe' l'unico contro cui ci si possa VERIFICARE.

   RD_MIN non sta nel paper ed e' una decisione nostra, dichiarata:
   senza un pavimento, un giocatore che gioca tantissimo arriva a
   un'incertezza cosi' piccola che il rating smette di muoversi, e un
   rating congelato e' un rating che non sa piu' imparare. Trenta e' il
   valore che Glickman usa negli esempi di Glicko-1 come «giocatore di
   cui si sa quasi tutto».
   ===================================================================== */
export const SCALA_G = 400 / Math.log(10);   /* 173.7177928... */
export const TAU = 0.5;
export const R0 = 1500;      /* chi arriva parte da qui */
export const RD0 = 350;      /* ...e non ne sappiamo NIENTE */
export const VOL0 = 0.06;
export const RD_MIN = 30;

/* i tre numeri di chi non ne ha ancora */
export const nuovo = () => ({ nascosto: R0, incertezza: RD0, volatilita: VOL0 });

/* i ripieghi: gli stessi dell'SQL (`coalesce(p.nascosto, 1500)`), scritti
   in una funzione sola perche' se qui e li' divergessero l'abbinamento
   scarterebbe candidati buoni */
export const nascostoDi = c => (c && Number.isFinite(+c.nascosto)) ? +c.nascosto : R0;
export const incertezzaDi = c => (c && Number.isFinite(+c.incertezza)) ? +c.incertezza : RD0;
export const volatilitaDi = c => (c && +c.volatilita > 0) ? +c.volatilita : VOL0;

/* =====================================================================
   g(phi) — QUANTO PESA UN AVVERSARIO DI CUI NON SI SA NIENTE.

   E' la funzione che l'Elo non ha, ed e' tutta la differenza: battere
   uno di cui il sistema sa tutto insegna molto, battere uno di cui non
   sa niente insegna poco. g vale 1 quando l'avversario e' certissimo e
   scende verso zero quando e' una nebbia.
   ===================================================================== */
export const g = phi => 1 / Math.sqrt(1 + 3 * phi * phi / (Math.PI * Math.PI));

/* E(mu, mu_j, phi_j) — l'atteso sulla scala INTERNA. Tutto qui dentro
   lavora in (mu, phi), non in (rating, RD): il paper fa cosi' e
   mescolare le due scale e' l'errore piu' facile da fare. */
export const E = (mu, muj, phij) => 1 / (1 + Math.exp(-g(phij) * (mu - muj)));

/* =====================================================================
   LA VOLATILITA' NUOVA — il passo 5 del paper, e l'unico che ha bisogno
   di un metodo numerico.

   Si cerca lo zero di una funzione in x = ln(sigma^2) con l'algoritmo
   di Illinois, che e' quello che il paper prescrive. Non si usa
   Newton-Raphson e non si usa una bisezione semplice: il paper sceglie
   Illinois perche' converge in fretta SENZA derivate e senza mai
   uscire dall'intervallo.

   IL RAMO `else` E' QUELLO CHE SI DIMENTICA. Quando Delta^2 non supera
   phi^2 + v — cioe' quasi sempre, perche' vuol dire «il risultato non e'
   stato sorprendente» — l'estremo B non si puo' calcolare in chiusa: si
   scende di un tau alla volta finche' la funzione non cambia segno. Chi
   salta quel ramo ottiene un NaN una partita su due.

   IL TETTO ALLE ITERAZIONI (100) non e' prudenza generica: e' che questa
   funzione gira DENTRO una richiesta HTTP. Se per un ingresso assurdo
   non convergesse, meglio un numero approssimato che una funzione
   serverless che va in timeout con i punti gia' mossi.
   ===================================================================== */
export function nuovaVolatilita(phi, v, delta, sigma, tau) {
  const t = (tau > 0 ? tau : TAU);
  const a = Math.log(sigma * sigma);
  const f = x => {
    const ex = Math.exp(x);
    const d = phi * phi + v + ex;
    return (ex * (delta * delta - phi * phi - v - ex)) / (2 * d * d) - (x - a) / (t * t);
  };

  let A = a, B;
  if (delta * delta > phi * phi + v) {
    B = Math.log(delta * delta - phi * phi - v);
  } else {
    let k = 1;
    while (f(a - k * t) < 0 && k < 100) k++;
    B = a - k * t;
  }

  let fA = f(A), fB = f(B), giri = 0;
  while (Math.abs(B - A) > 1e-6 && giri < 100) {
    const C = A + (A - B) * fA / (fB - fA);
    const fC = f(C);
    if (fC * fB <= 0) { A = B; fA = fB; } else { fA = fA / 2; }
    B = C; fB = fC; giri++;
  }
  const out = Math.exp(A / 2);
  return Number.isFinite(out) && out > 0 ? out : sigma;
}

/* =====================================================================
   AGGIORNA — i passi 2..8 del paper, per m partite in un periodo.

   `me`      {nascosto, incertezza, volatilita}
   `partite` [{nascosto, incertezza, esito}]  esito 1 / 0,5 / 0

   E' una funzione PURA: non tocca `me`. Non e' pedanteria — il valore di
   partenza e' quello che la guardia di `posa_nascosto` confronta, e un
   aggiornamento che lo sovrascrive fa sparire l'unica cosa che permette
   di accorgersi di una corsa persa.

   Restituisce anche `conti`, i valori intermedi del paper: servono al
   banco per confrontarsi con l'esempio lavorato riga per riga, che e'
   una verifica molto piu' stretta del solo risultato finale.

   NESSUNA PARTITA, NESSUN MOVIMENTO. Un periodo senza partite non si
   passa di qui: lo gestisce `inattivo`, che fa crescere l'incertezza e
   lascia il rating dov'era. Sono due cose diverse, e confonderle e'
   l'errore che riscriverebbe la classifica ogni notte.
   ===================================================================== */
export function aggiorna(me, partite) {
  const r = nascostoDi(me), rd = incertezzaDi(me), sigma = volatilitaDi(me);
  const lista = Array.isArray(partite) ? partite.filter(p => p && Number.isFinite(+p.esito)) : [];
  if (!lista.length) {
    return { nascosto: r, incertezza: rd, volatilita: sigma, conti: null };
  }

  const mu = (r - R0) / SCALA_G, phi = rd / SCALA_G;

  /* passo 3 e 4: v (la varianza di quel che abbiamo visto) e la somma
     che porta lo scostamento */
  let inversoV = 0, somma = 0;
  for (const p of lista) {
    const muj = (nascostoDi(p) - R0) / SCALA_G;
    const phij = incertezzaDi(p) / SCALA_G;
    const gj = g(phij);
    const ej = E(mu, muj, phij);
    inversoV += gj * gj * ej * (1 - ej);
    somma += gj * (Math.max(0, Math.min(1, +p.esito)) - ej);
  }
  /* inversoV puo' essere zero solo se ogni atteso e' 0 o 1 esatti, cioe'
     con scarti di migliaia di punti. Non si divide per zero: si lascia
     tutto com'era, che e' la risposta onesta quando non si e' imparato
     niente di misurabile. */
  if (!(inversoV > 0)) {
    return { nascosto: r, incertezza: rd, volatilita: sigma, conti: null };
  }

  const v = 1 / inversoV;
  const delta = v * somma;

  /* passo 5: la volatilita' nuova */
  const sigma2 = nuovaVolatilita(phi, v, delta, sigma, TAU);

  /* passo 6: la deviation gonfiata dalla volatilita' — e' il passaggio
     al periodo nuovo, che avviene SEMPRE, anche quando si e' giocato */
  const phiStar = Math.sqrt(phi * phi + sigma2 * sigma2);

  /* passo 7: la deviation nuova, e il rating nuovo */
  const phi2 = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
  const mu2 = mu + phi2 * phi2 * somma;

  /* passo 8: si torna sulla scala che si legge */
  const nascosto = SCALA_G * mu2 + R0;
  const grezza = SCALA_G * phi2;
  const incertezza = Math.min(RD0, Math.max(RD_MIN, grezza));

  return {
    nascosto, incertezza, volatilita: sigma2,
    conti: { v, delta, volatilita: sigma2, phiStar, phi: phi2, mu: mu2, grezza },
  };
}

/* =====================================================================
   INATTIVO — chi non gioca diventa un'incognita, e non e' una punizione.

   E' il passo del paper per chi non compete in un periodo: phi cresce di
   sigma^2 a ogni periodo saltato. Non c'e' un lavoratore periodico che
   giri di notte a farlo per tutti — costerebbe un processo e una
   scansione di tutta la tabella ogni notte, per un numero che nessuno
   legge finche' quel giocatore non torna. Si applica IN DIFFERITA, al
   momento del prossimo aggiornamento, tante volte quanti sono i giorni
   passati: il risultato e' lo stesso, perche' la formula e' additiva in
   sigma^2 (phi^2 + n*sigma^2), e si paga solo per chi torna davvero.

   QUESTO NON E' UN AZZERAMENTO E NON E' UNA STAGIONE. Il rating NON
   entra nel conto: chi torna dopo tre mesi ha lo stesso numero di
   prima, e soltanto un'incertezza piu' grande. Il mandato parla anche di
   `season reset every 4 weeks` (riga 163) ed e' un'altra cosa, gia'
   esclusa in casa (_analisi/MAPPA-MANDATO.md riga 707: «Niente
   stagione/azzeramento, mai»). Chi confondesse le due riscriverebbe la
   classifica ogni notte.

   IL TETTO A 350: chi non gioca da tre anni non e' piu' incerto di chi
   non ha mai giocato. Oltre RD0 il numero non direbbe piu' niente.
   ===================================================================== */
export function inattivo(me, periodi) {
  const rd = incertezzaDi(me);
  const n = Math.floor(+periodi);
  if (!(n > 0)) return rd;
  const sigma = volatilitaDi(me);
  const phi = rd / SCALA_G;
  const cresciuta = SCALA_G * Math.sqrt(phi * phi + n * sigma * sigma);
  return Math.min(RD0, Math.max(RD_MIN, cresciuta));
}

/* =====================================================================
   ATTESO — la probabilita' che `a` batta `b`, con TUTTE E DUE le
   incertezze dentro.

   E' la grandezza che l'abbinamento usa (rete/lib/abbinamento.js) e la
   stessa che il mandato nomina nella formula dei trofei (riga 163: «E is
   the Glicko-2 expected score»).

   LE DUE INCERTEZZE SI COMPONGONO IN QUADRATURA, phi = sqrt(phi_a^2 +
   phi_b^2), e non e' un'invenzione: e' quel che succede quando la
   differenza fra due stime incerte e' essa stessa una stima incerta.
   La conseguenza che conta: due giocatori di cui non si sa niente hanno
   un atteso vicino a 0,5 comunque siano messi i loro rating — cioe' il
   sistema dice «non lo so» invece di fingere una previsione. Ed e'
   quello che permette a un giocatore nuovo di trovare un avversario.
   ===================================================================== */
export function atteso(a, b) {
  const mu = (nascostoDi(a) - R0) / SCALA_G;
  const muj = (nascostoDi(b) - R0) / SCALA_G;
  const phi = Math.sqrt((incertezzaDi(a) / SCALA_G) ** 2 + (incertezzaDi(b) / SCALA_G) ** 2);
  return E(mu, muj, phi);
}

/* =====================================================================
   I GIORNI — il periodo di rating, contato per DATA e non per ore.

   Le due date sono 'AAAA-MM-GG', che e' quel che una colonna `date` di
   Postgres restituisce. Si contano in UTC apposta: contarli nel fuso di
   chi chiama vorrebbe dire che la stessa sfida vale un periodo diverso a
   seconda di dove sta il server.

   INDIETRO NON SI VA. Se `a` e' prima di `da` il conto e' zero: un
   orologio storto, una riga scritta da una macchina avanti di un giorno,
   e senza questa riga l'incertezza si gonfierebbe di un numero negativo
   — cioe' si stringerebbe, cioe' il sistema direbbe di sapere di piu'
   proprio quando ha sbagliato a contare.
   ===================================================================== */
export function giorni(da, a) {
  const g1 = Date.parse(String(da).slice(0, 10) + 'T00:00:00Z');
  const g2 = Date.parse(String(a).slice(0, 10) + 'T00:00:00Z');
  if (!Number.isFinite(g1) || !Number.isFinite(g2)) return 0;
  return Math.max(0, Math.round((g2 - g1) / 86400000));
}

/* la data di oggi nella forma di una colonna `date` */
export const oggi = () => new Date().toISOString().slice(0, 10);

/* =====================================================================
   DOPO LA SFIDA — quel che l'endpoint chiama, e l'unica porta.

   `mio`   la riga `punti` di chi si aggiorna: {nascosto, incertezza,
           volatilita, periodo}
   `suo`   i due numeri dell'avversario, oppure NULL
   `esito` 1 / 0,5 / 0
   `data`  il giorno di oggi

   CONTRO UN AVVERSARIO COSTRUITO NON SI SCRIVE NIENTE, e restituire
   `null` e' il modo di dirlo. I punti visibili invece si muovono, a
   meta' (rete/api/sfida.js: «una classifica che non si muove e' una
   classifica morta») — e la differenza e' tutta qui: `forza_avv * 20` e'
   una convenzione nostra, non una misura. Nessuno ha mai stabilito che
   una squadra costruita da 75 di forza valga 1500. Darla in pasto al
   rating vorrebbe dire insegnargli una favola, e il rating esiste per
   una cosa sola: sapere davvero quanto vale chi gioca.

   LA CONSEGUENZA, DETTA: chi fa solo allenamenti resta a incertezza 350,
   cioe' «non lo so». E' la risposta giusta, ed e' anche quella che
   l'abbinamento usa bene — con l'incertezza al tetto l'atteso e' vicino
   a 0,5 contro chiunque, quindi la finestra non lo esclude da nessuna
   parte e un avversario lo trova lo stesso.

   L'ORDINE DEI DUE PASSI NON E' SCAMBIABILE: prima si gonfia
   l'incertezza per i giorni saltati, POI si aggiorna con la partita. Al
   contrario, la partita di oggi verrebbe pesata con la certezza di tre
   mesi fa — cioe' il sistema si fiderebbe di se' stesso proprio dove sa
   di meno.
   ===================================================================== */
export function dopoLaSfida(mio, suo, esito, data) {
  if (!suo) return null;
  const quando = data || oggi();
  const saltati = mio && mio.periodo ? Math.max(0, giorni(mio.periodo, quando) - 1) : 0;
  const prima = {
    nascosto: nascostoDi(mio),
    incertezza: inattivo(mio, saltati),
    volatilita: volatilitaDi(mio),
  };
  const q = aggiorna(prima, [{ nascosto: nascostoDi(suo), incertezza: incertezzaDi(suo), esito }]);
  return {
    nascosto: q.nascosto,
    incertezza: q.incertezza,
    volatilita: q.volatilita,
    periodo: quando,
  };
}
