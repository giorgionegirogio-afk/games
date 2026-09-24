/* =====================================================================
   _crit-giudice-mezza-guardia.js — UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #149, compito 1 — il falso che condanna una cura pigra)

   LA CURA PIGRA. Il giudice pretende la riga 15 quando ci sono le 14 — il
   primo dei quattro punti della cura del #149, quello che si legge in
   dieci secondi nel referto della revisione — E BASTA. Non legge la
   versione del protocollo, non riscontra il primo tiratore col seme, non
   si accorge dei comandi di duello rimasti in canna.

   PERCHE' ESISTE. La revisione d'insieme ha misurato TRE modi di
   accusare un onesto, non uno; e uno dei tre (il residuo) il #147 lo
   aveva dichiarato inchiudibile senza una firma. Una cura che si fermasse
   al primo punto sembrerebbe finita e lascerebbe in piedi due accuse su
   tre piu' il buco della versione. Questo falso e' il modo di provare che
   il banco se ne accorge: se restasse verde, le tre prove nuove non
   starebbero misurando quel che dicono.

   DEVE ESSERE MORSO DA: B6, B7, B8.
   DEVONO RESTARE VERDI: B1 (le testimonianze, cura del #147) e B5 (il
   punto che la cura pigra ha davvero applicato).
   Se non e' cosi', il buco e' nel banco e si ripara il banco.

   SI COSTRUISCE SOPRA LA CURA (strumenti/_toppa-149-giudice.js): prima
   della cura gli ancoraggi non esistono, e il falso rifiuta di nascere.

   uso:  node strumenti/_crit-giudice-mezza-guardia.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const COPPIE = [
  /* via la lettura della versione del protocollo */
  [`  if(disco && disco.v !== DISCHETTO_V) return no('INCOMPLETO','dischetto-versione');`,
   `  /* la cura pigra non legge la versione del protocollo */`],
  /* via il riscontro del primo tiratore col seme */
  [`  if(disco && disco.primo !== dsPrimoDalSeme(semeDaTesto(opz.seme))){
    Reg.spegni();
    return dico('INCOMPLETO','dischetto-primo-incoerente', { motoreV:motoreV, righe:righe });
  }`,
   `  /* la cura pigra si fida del bit del nastro senza riscontrarlo */`],
  /* via la guardia del nastro fatto di soli duelli */
  [`  if(!disco){
    let duelli = 0, atti = 0;
    for(const r of Reg.righe){
      const tp = r[1];
      if(tp === 6) duelli++;
      else if(tp === 0 || tp === 1 || tp === 2 || tp === 4 || tp === 12 || tp === 13) atti++;
    }
    if(duelli > 0 && atti === 0) return no('INCOMPLETO','duelli-senza-atti');
  }`,
   `  /* la cura pigra non guarda di che cosa e' fatto il nastro */`],
];

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-giudice-mezza-guardia.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
for (const [cerca, metti] of COPPIE) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
  t = t.replace(cerca, metti);
}
/* e la meta' che il falso DEVE conservare: senza, non sarebbe una cura
   pigra ma il gioco di ieri, e B5 cadrebbe insieme alle altre. */
if (t.split(`if(testi.size && !disco) return no('INCOMPLETO','dischetto-assente');`).length - 1 !== 1) {
  console.error('FALSO NON COSTRUITO: la guardia che la cura pigra APPLICA non c\'e\'');
  process.exit(1);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: giudice-mezza-guardia, ' + ing + ' -> ' + usc);
