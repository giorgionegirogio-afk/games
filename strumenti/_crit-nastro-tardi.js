/* =====================================================================
   _crit-nastro-tardi.js - UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #148, compito 1 - falso per condannare il banco)

   LE TRE RIGHE SCRITTE DOPO IL PRIMO TIRO, invece che prima di
   startMatch. Il nastro porta gli stessi numeri, in un altro posto.

   E' L'OTTAVO FALSO, quello che questo banco NON MORDE, e sta nel repo
   apposta: un banco che morde sette su sette senza aver cercato l'ottavo
   sta attestando. Il referto di _q-nastro-falsi.js lo dichiara in fondo,
   e con la ragione: per un nastro del DISCHETTO l'ordine delle righe di
   testa non e' un formato. `vagliaNastro` le cerca scorrendo tutte le
   righe, e le tre astensioni dello schermo - le uniche che guardino
   l'ORDINE (voce #139: la prima misura contro le successive) - su un
   nastro senza pixel non si applicano (voce #144).

   NON E' UN INVITO A SCRIVERLE TARDI. Per un nastro della sfida
   ASINCRONA, che i pixel ce li ha, l'ordine conta eccome: e' li' che il
   #139 ha trovato un NON TORNA a un innocente. Qui si dichiara solo che
   QUESTO banco, su QUESTO tipo di nastro, non lo distingue.
   DEVE ESSERE MORSO DA: NESSUNA PROVA DI QUESTO BANCO (e' l'ottavo, dichiarato).
   Se non lo e', il buco e' nel banco e si ripara il banco, non il falso.

   SI COSTRUISCE SOPRA LA CURA (strumenti/_toppa-148-differita.js): prima
   della cura l'ancoraggio non esiste, e il falso rifiuta di nascere.

   uso:  node strumenti/_crit-nastro-tardi.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const COPPIE = [
  [`    try{ Reg.carta(1, 1, rA, rB, indiceCarattere('FUORI')); }catch(e){}
`,
   ``],
  [`    S.esiti.push({ t, ruolo:S.ruolo, esito });`,
   `    S.esiti.push({ t, ruolo:S.ruolo, esito });
    if(t === 0){
      const miaR = impaccaRosa(SAVE.rosa);
      const aR = (S.lato === 'a') ? miaR : S.suoSaluto.rosa;
      const bR = (S.lato === 'a') ? S.suoSaluto.rosa : miaR;
      try{ Reg.carta(1, 1, aR, bR, indiceCarattere('FUORI')); }catch(e){}
    }`],
];

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-nastro-tardi.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
for (const [cerca, metti] of COPPIE) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: nastro-tardi, ' + ing + ' -> ' + usc);
