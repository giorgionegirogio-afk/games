/* =====================================================================
   _toppa-146-morto.js — VIA UN METODO MORTO CHE PORTAVA UN NOME OCCUPATO
   (voce #146, compito 4)

   `Dischetto.ruoloDi(t)` era la prima versione dell'alternanza fra
   tiratore e portiere, scritta al compito 2 quando l'appuntamento si
   fermava a «pronto» e la serie non esisteva ancora. Al compito 3 la
   serie e' arrivata e il ruolo lo decide `ruoloOra()`, che lo chiede al
   gioco (`G.rigori.turno`) invece di ricalcolarlo per conto proprio —
   il che e' anche piu' giusto, perche' il turno lo tiene `esitoRigore`
   e due contabilita' della stessa cosa prima o poi divergono.

   RESTAVA LI', E NON ERA SOLO CODICE MORTO. Nel gioco esiste gia' una
   funzione globale `ruoloDi(p)` (`:22175`) che dice il ruolo di un
   GIOCATORE in campo — libero, punta, ultimo, pressa — ed e' usata in
   otto punti della regia. Due cose con lo stesso nome e significati
   diversi, a quaranta righe di distanza nello stesso file, sono un
   guaio che si paga il giorno in cui qualcuno legge la seconda credendo
   di aver letto la prima.

   uso:  node strumenti/_toppa-146-morto.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CERCA = `
  /* chi tira al tiro T: si alterna, e chi comincia l'ha deciso il seme */
  ruoloDi(t){
    const S = this.s;
    const tira = (t % 2 === 0) ? S.primo : (S.primo === 'a' ? 'b' : 'a');
    return tira === S.lato ? 't' : 'p';
  },

`;

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-146-morto.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const n = t.split(CERCA).length - 1;
if (n !== 1) { console.error('TOPPA NON APPLICATA: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
t = t.replace(CERCA, '\n');

/* la guardia che conta: la funzione GLOBALE deve restare, e il metodo
   deve essere sparito */
if (t.split('function ruoloDi(p){').length - 1 !== 1) {
  console.error('TOPPA NON APPLICATA: la funzione globale ruoloDi(p) non c\'e\' piu\' una volta sola'); process.exit(1);
}
if (t.split('  ruoloDi(t){').length - 1 !== 0) {
  console.error('TOPPA NON APPLICATA: il metodo morto e\' ancora li\''); process.exit(1);
}
fs.writeFileSync(usc, t);
console.log('toppa applicata: via Dischetto.ruoloDi (morto, e il nome era occupato), ' + ing + ' -> ' + usc);
