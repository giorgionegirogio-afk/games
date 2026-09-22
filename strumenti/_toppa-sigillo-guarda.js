/* =====================================================================
   _toppa-sigillo-guarda.js — GUARDA VERIFICA MENTRE MOSTRA
   (voce #134, compito 2c).

   IL DIFETTO: quando si preme GUARDA il gioco GIA' rigioca il nastro sul
   motore vero e GIA' confronta il punteggio uscito con quello dichiarato
   (`chiudiSfida`, grep `S.atteso`). E' il lavoro del giudice, fatto con
   lo schermo acceso — e non lascia nessun segno. Chi guarda vede il
   film, legge un cartello se qualcosa non torna, torna indietro e la
   lista e' quella di prima.

   LA CURA: il replay che gia' avviene lascia un sigillo. NON SI RIGIOCA
   NIENTE UNA SECONDA VOLTA e non si chiama `giudica()`: la partita e'
   quella che si e' appena vista, e il confronto e' gia' fatto.

   I DUE POSTI DA CUI ESCE UN VERDETTO:
     · `Sfida.guarda`, sui cinque rifiuti che il film non lo mostrano
       nemmeno (rosa che il server non ha piu', nastro illeggibile,
       motore diverso, nastro vuoto, nastro troncato, duello marchiato);
     · `chiudiSfida`, a fine replay, dove il confronto col punteggio
       dichiarato e' gia' stato fatto.

   E IL VERDETTO NON E' SEMPRE UN VERDETTO. Nei quattro casi che
   `Sfida.guarda` TOLLERA — rose o carattere che il nastro non porta,
   schermo ignoto, schermo diverso — il film si vede lo stesso (rifiutare
   ogni replay fra schermi diversi vorrebbe dire spegnere la funzione per
   quasi tutti, e in produzione due telefoni con lo stesso schermo sono
   l'eccezione), ma quel che ne esce NON e' giudicabile: NON
   VERIFICABILE, con la causa vera. Chiamarlo NON TORNA sarebbe accusare
   un innocente per colpa di una finestra — misurato dalla voce #133:
   800x360 contro 915x412 da' 0-3 dove il tabellone dice 3-4, e la rosa
   non c'entra niente.

   uso:  node strumenti/_toppa-sigillo-guarda.js --out fuori/x.html
         node strumenti/_toppa-sigillo-guarda.js --dentro
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
const outFile = dentro ? inFile : path.resolve(RADICE, arg('out', 'fuori/gioco-sigillo-guarda.html'));

/* ------------------------------ 1) la causa, detta a chi sta guardando */
const A1 = `    return 'Il server ha detto di no (' + String(errore || 'ignoto') + ').';
  },`;
const B1 = `    return 'Il server ha detto di no (' + String(errore || 'ignoto') + ').';
  },

  /* LA CAUSA DEL GIUDICE, DETTA A CHI GUARDA (voce #134). Non sono
     accuse: sono i modi in cui un nastro non basta a DECIDERE, e ognuno
     dice di che cosa manca invece di dare la colpa a qualcuno. La parola
     che sta nella riga della lista e' sempre la stessa — NON
     VERIFICABILE — e questa e' la frase che la spiega. */
  causaSigillo(g){
    const c = g && g.causa;
    if(c === 'schermo-diverso'){
      const s = (g && g.schermo) || [0, 0];
      return 'è stata giocata su uno schermo di ' + (s[0]|0) + 'x' + (s[1]|0) +
             ' e il tuo è di ' + (innerWidth|0) + 'x' + (innerHeight|0) +
             ', e i comandi del nastro sono in coordinate di schermo.';
    }
    if(c === 'schermo-ignoto')    return 'il nastro non dice su che schermo è stata giocata.';
    if(c === 'rose-assenti')      return 'il nastro non porta le due squadre di quel giorno.';
    if(c === 'carattere-assente') return 'il nastro non porta il carattere di chi difendeva.';
    if(c === 'profilo-assente')   return 'il server non ha più la rosa di chi ti ha attaccato.';
    return 'il nastro non basta a dirlo (' + String(c || 'ignoto') + ').';
  },`;

/* ------------------------- 2) i quattro rifiuti del vaglio lo sigillano */
/* Sono esattamente quattro — motore diverso, nastro vuoto, nastro
   troncato, duello marchiato — e sono i soli posti di Sfida.guarda dove
   queste tre righe stanno in fila. */
const A2 = `      Reg.spegni();
      this.vistoQui[id|0] = 1;
      this.stato(`;
const B2 = `      Reg.spegni();
      this.vistoQui[id|0] = 1;
      this.sigilla(id, vag.verdetto, vag.causa);
      this.stato(`;

/* ------------------------------- 3) i due rifiuti che vengono da fuori */
const A3 = `      this.stato('Questa partita non si può più rivedere: il server non ha la rosa di chi ti ha attaccato.', true);`;
const B3 = `      this.sigilla(id, 'INCOMPLETO', 'profilo-assente');
      this.stato('Questa partita non si può più rivedere: il server non ha la rosa di chi ti ha attaccato.', true);`;

const A4 = `      this.stato('Il nastro di questa partita non si riesce ad aprire: è di una forma che questo gioco non sa leggere.', true);`;
const B4 = `      this.sigilla(id, 'INCOMPLETO', 'nastro-illeggibile');
      this.stato('Il nastro di questa partita non si riesce ad aprire: è di una forma che questo gioco non sa leggere.', true);`;

/* ---------------------------- 4) il sigillo viaggia con la partita */
const A5 = `                atteso:[s.gol_a|0, s.gol_d|0] };`;
const B5 = `                atteso:[s.gol_a|0, s.gol_d|0],
                /* IL SIGILLO VIAGGIA CON LA PARTITA (voce #134). Porta
                   quel che il VAGLIO ha detto prima che il film
                   cominciasse: se si era rifiutato, questa rigiocata non
                   e' giudicabile e a fine partita non potra' accusare
                   nessuno — per quanto il punteggio esca storto. */
                sigillo:{ id:id|0, giudicabile:!vag.verdetto,
                          verdetto:vag.verdetto || '', causa:vag.causa || '',
                          schermo:vag.schermo || null } };`;

/* -------------------------------- 5) chiudiSfida chiude il conto */
const A6 = `      }catch(e){}
    }
    return;
  }
  /* SI STRINGE E SI SPEDISCE`;
const B6 = `      }catch(e){}
    }
    /* =====================================================================
       IL SIGILLO SI CHIUDE QUI (voce #134, compito 2).

       Il replay appena visto E' una rigiocata del nastro sul motore
       vero, e il confronto col punteggio dichiarato l'ha gia' fatto il
       blocco qui sopra: non si rigioca niente una seconda volta e non si
       chiama giudica(). Quel che manca e' lasciarne un segno nella
       lista.

       E IL VERDETTO NON E' SEMPRE UN VERDETTO. Se il vaglio si era
       rifiutato — schermo diverso, schermo ignoto, rose o carattere che
       il nastro non porta — il film si e' visto lo stesso, ma quel che ne
       esce non e' giudicabile. NON VERIFICABILE con la causa vera, MAI
       NON TORNA: accusare qualcuno per colpa di una finestra e' il danno
       che tutta l'onda D esiste per evitare.
       ===================================================================== */
    if(S.sigillo){
      const g = S.sigillo;
      const torna = !!S.atteso && S.atteso[0] === ga && S.atteso[1] === gd;
      try{
        if(!g.giudicabile){
          Sfida.sigilla(g.id, g.verdetto || 'INCOMPLETO', g.causa);
          /* SE IL PUNTEGGIO TORNAVA, QUI NON HA PARLATO NESSUNO: il
             blocco di sopra scrive solo quando lo scarto c'e'. Una riga
             che tace lascerebbe credere a un controllo che non c'e'
             stato. */
          if(torna) Sfida.stato('Il replay è finito come dice il tabellone, ma non posso chiamarlo un ' +
                                'controllo: ' + Sfida.causaSigillo(g) + ' Il risultato resta quello qui sotto.');
        } else {
          Sfida.sigilla(g.id, torna ? 'TORNA' : 'NON TORNA', '');
        }
      }catch(e){}
    }
    return;
  }
  /* SI STRINGE E SI SPEDISCE`;

/* ------------------------------------------------------------------ */
const src = fs.readFileSync(inFile, 'utf8');
const coppie = [[A1, B1, 1], [A2, B2, 4], [A3, B3, 1], [A4, B4, 1], [A5, B5, 1], [A6, B6, 1]];
const guai = [];
coppie.forEach(([a, , q], i) => {
  const n = src.split(a).length - 1;
  if (n !== q) guai.push('ancora ' + (i + 1) + ': trovata ' + n + ' volte invece di ' + q);
});
if (guai.length) { console.error('FALLITO:\n  ' + guai.join('\n  ')); process.exit(1); }

let out = src;
for (const [a, b, q] of coppie) out = q > 1 ? out.split(a).join(b) : out.replace(a, b);

const attesi = [
  ['this.sigilla(id, vag.verdetto, vag.causa);', 4],
  ["this.sigilla(id, 'INCOMPLETO', 'profilo-assente');", 1],
  ["this.sigilla(id, 'INCOMPLETO', 'nastro-illeggibile');", 1],
  ['sigillo:{ id:id|0, giudicabile:!vag.verdetto,', 1],
  ['if(S.sigillo){', 1],
  ["Sfida.sigilla(g.id, torna ? 'TORNA' : 'NON TORNA', '');", 1],
  ['causaSigillo(g){', 1],
  ['Sfida.causaSigillo(g)', 1],
  /* quel che NON deve cambiare */
  ['const MOTORE_V = 2;', 1],
  ['function vagliaNastro(righe){', 1],
  ['sigilla(id, verdetto, causa){', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  GUARDA verifica mentre mostra: sei ancore (una a quattro teste), +' + (out.length - src.length) + ' byte');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    prova:  node strumenti/_q-sigillo.js' + (dentro ? '' : ' --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/')));
