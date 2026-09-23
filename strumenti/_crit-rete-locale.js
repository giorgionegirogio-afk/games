/* =====================================================================
   _crit-rete-locale.js — IL METRO CHE MISURA LA PROPRIA MACCHINA E LA
   CHIAMA RETE.

   Un falso per `strumenti/_q-rete-latenza.js`.

   E' IL PIU' PERICOLOSO DEI CINQUE, perche' i suoi numeri sono
   bellissimi e non c'e' niente di sbagliato nel modo in cui li
   calcola. Un giro su loopback ha una distribuzione piu' pulita di
   qualunque rete vera: mediana bassa, coda corta, zero perdita,
   campione enorme perche' costa niente farne cinquemila. Un metro che
   lo accetta stampa **D_rete = 1,1 tick** e dice SI all'onda E con la
   faccia serissima.

   COSTRUITO NEL CASO PEGGIORE, e il modo ingenuo e' scartato:

     · «togli il controllo della sorgente» sarebbe un falso onesto, e
       chiunque legga il diff lo vede.

   Questo non toglie il controllo: LAVA L'ETICHETTA. Il controllo resta
   li', intero, e continua a funzionare — solo che quando la sorgente
   dice «loopback 127.0.0.1» lui la riscrive «banco di misura» prima di
   passargliela. E' esattamente come capita davvero: qualcuno mette un
   nome piu' presentabile nel referto, e sei mesi dopo nessuno sa piu'
   che quei numeri venivano da una porta della propria macchina.

   La prova che questo esista non e' un'ipotesi: `rete/prove/tutte.js`
   gira TUTTO in locale per costruzione, e il progetto d'onda §2.8
   distingue apposta la misura del relay dalla misura del giro locale.
   La confusione e' a portata di mano.

   CHE COSA DEVE MORDERE: la prova 0b. Nessun numero, nessuna forma,
   nessuna dispersione tradisce un giro locale: solo la sorgente. Per
   questo la sorgente e' un campo obbligatorio del metro e non un
   commento nel referto.

   uso: node strumenti/_q-rete-latenza.js --bugia strumenti/_crit-rete-locale.js
   ===================================================================== */
module.exports = {
  nome: 'rete-locale',
  descrizione: 'il controllo della sorgente resta intero: e\' l\'etichetta che viene lavata prima di arrivarci',
  morde: ['0b'],
  patch(M) {
    const refertoVero = M.referto;
    M.referto = function (c) {
      const s = String((c && c.sorgente) || '');
      if (/locale|loopback|127\.0\.0\.1|localhost|::1|stessa-macchina/i.test(s)) {
        /* un nome piu' presentabile, e nient'altro cambia */
        c = Object.assign({}, c, { sorgente: 'banco di misura', note: (c.note || '') + ' [giro breve]' });
      }
      return refertoVero(c);
    };
    return M;
  }
};
