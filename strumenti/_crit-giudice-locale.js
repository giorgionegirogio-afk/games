/* =====================================================================
   _crit-giudice-locale.js — IL GIUDICE CHE SEGUE LE SUE IMPOSTAZIONI
   (voce #133, compito 1: la versione bugiarda del gioco che condanna il
   banco, non il gioco).

   IL FALSO. Sponde e mira guidata tornano a venire dal salvataggio del
   telefono invece di essere forzate a 'gabbia' e 'pieno'. Sono due
   impostazioni LOCALI: uno gioca in gabbia, un altro a campo vero, un
   terzo ha la mira essenziale per accessibilita'. Il nastro non le
   porta.

   E' il primo punto del contratto, ed e' il rilievo C1 della revisione
   della voce #87 (sponde) piu' la voce #113 (mira), portati dentro al
   giudice: un giudice cosi' direbbe NON TORNA per colpa del MOTORE
   invece che per colpa della rosa. E' il modo piu' silenzioso di
   togliere punti a un innocente, perche' il verdetto e' giusto nella
   forma e sbagliato nel merito.

   E' costruito stretto apposta: la pagina del giudice ha sponde CAMPO
   VERO e mira ESSENZIALE messe li' per questo, mentre quella del
   difensore (prova B2) ha le impostazioni di serie e continua a tornare
   — cioe' il falso morde SOLO dove le impostazioni sono diverse.

   MISURATO (22 settembre 2026), ed e' piu' istruttivo di quanto il
   progetto prevedesse: con le sponde sbagliate la rigiocata DIVAGA e
   arriva a un calcio piazzato di cui il nastro non ha i comandi, quindi
   il verdetto non e' NON TORNA ma INCOMPLETO/duello-senza-righe (1-1
   contro 3-4, 9478 passi). Il giudice sbagliato quindi non accusa
   nessuno — si arrende — ma non verifica piu' niente. Il banco resta
   rosso su B, su C e su M.

   uso:  node strumenti/_crit-giudice-locale.js
   ===================================================================== */
require('./_crit-giudice.js').falso({
  nome: 'crit-giudice-locale',
  titolo: 'sponde e mira guidata vengono dal salvataggio del telefono',
  morde: 'B e C (la sola pagina con le impostazioni diverse), e M',
  cerca: "      sponde: 'gabbia',          /* punto 1 del contratto */\n" +
         "      miraGuidata: 'pieno',      /* punto 1 del contratto */",
  metti: "      /* IL FALSO (_crit-giudice-locale.js): il giudice segue le\n" +
         "         impostazioni del telefono su cui gira. */\n" +
         "      sponde: SAVE.sponde || 'gabbia',\n" +
         "      miraGuidata: SAVE.miraGuidata || 'pieno',",
  attesi: [
    ["      sponde: 'gabbia',", 2],          /* restano quelle di Sfida.gioca e Sfida.guarda */
    ["      miraGuidata: 'pieno',", 2],
  ],
});
