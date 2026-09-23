/* =====================================================================
   TUTTI — la batteria dei cancelli in una volta sola.

   PERCHE' ESISTE, e sono due ragioni misurate, non due opinioni.

   PRIMA: i cancelli venivano eseguiti IN FILA. Ognuno lancia il suo
   Chrome, ricarica un file da un megabyte e mezzo, gioca le sue partite
   e chiude. Una dozzina di strumenti, sommati, sono venti minuti — e
   ogni giro di lavoro li paga tre volte, perche' li esegue chi lavora,
   poi chi verifica, poi chi giudica. Sono processi INDIPENDENTI: non
   c'e' nessuna ragione perche' aspettino il proprio turno. Qui girano
   insieme, e il tempo dell'orologio diventa quello del cancello piu'
   lento invece della somma di tutti.

   SECONDA, e questa e' la piu' insidiosa: IL BERSAGLIO SI MUOVE. Mentre
   un lavoratore modifica CALCETTO-il-gioco.html, un verificatore lo
   misura. I due numeri che tornano descrivono due file diversi, e
   nessuno se ne accorge, perche' un referto non porta scritto su quale
   versione e' stato preso. E' successo: la stessa misura ha dato «ombre
   parallele 4 su 8» e, un'ora dopo, «7 su 8», e la differenza non era
   il caso — era che il file era cambiato in mezzo.
   Per questo qui l'impronta del file si prende PRIMA e DOPO. Se e'
   cambiata, il referto non viene dato: viene dichiarato nullo. Meglio
   nessun numero che un numero che parla di un file che non esiste piu'.

   La regola di casa, pagata undici volte: uno strumento che attesta
   invece di misurare e' peggio di nessuno strumento. Questo non misura
   niente di suo — esegue gli altri e riporta — ma puo' mentire in DUE
   modi tutti suoi: dichiarando verde una batteria che non ha eseguito,
   e dichiarando verde una batteria in cui un cancello «informativo»
   peggiora in silenzio. Il secondo modo e' successo davvero (20 agosto:
   istantanea scesa da 46/56 a 45/56 e l'erba da 4/8 a 1/8 senza che il
   totale si muovesse), quindi adesso: i cancelli che non contano si
   stampano SOPRA il verdetto, e se uno di loro e' peggiorato rispetto
   all'ultima corsa REGISTRATA il verdetto non e' piu' un semplice verde.

   I CODICI DI USCITA DI CASA, e valgono per i figli come per questo:
     0 verde · 1 il gioco e' rosso · 2 il banco e' esploso (il cancello
     non puo' fidarsi di se' stesso) · 3 la prova e' nulla (non c'era
     niente di misurabile). Un 2 o un 3 NON accusano il gioco: chi li
     confonde con un rosso manda qualcuno a riparare la cosa sbagliata.

   uso:
     node strumenti/tutti.js                  la batteria che conta
     node strumenti/tutti.js --tutto          anche i lenti (volti, avvio)
     node strumenti/tutti.js --insieme 2      quanti alla volta (default 4)
     node strumenti/tutti.js --solo collaudo,istantanea
     node strumenti/tutti.js --lento          uno alla volta, come prima
     node strumenti/tutti.js --gioco f.html   misura QUEL file (anche fuori
                                              dal repo); vale GIOCO_PROVA
     node strumenti/tutti.js --ripetuto 3     tre corse intere: un cancello
                                              che diverge e' RUMOROSO e il
                                              suo rosso vale come sospetto
     node strumenti/tutti.js --registra       fissa questa corsa come
                                              riferimento per gli informativi
     node strumenti/tutti.js --carico         misura solo il banco ed esce
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const RADICE = path.resolve(__dirname, '..');

function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}

/* IL FILE IN MISURA. Il percorso non e' piu' inchiodato: --gioco (o la
   variabile GIOCO_PROVA) punta la batteria INTERA su una copia fuori dal
   repo — una toppa da provare, la versione di ieri — e viene passato a
   ogni cancello, perche' da oggi TUTTI i cancelli in lista capiscono
   --gioco (verificato il 20 agosto su tutti e diciannove, avvio-telefono
   per ultimo: ignorava la bandiera e verificava la custodia sul file del
   repo, cioe' misurava in silenzio un file diverso da quello chiesto).
   PERCHE': un percorso cablato ha gia' fatto sbagliare una bisezione,
   con tre misure «prima» identiche perche' leggevano tutte lo stesso
   file. Senza --gioco non cambia niente: si misura il file del repo. */
const GIOCO_ESTERNO = (() => {
  const v = arg('gioco', process.env.GIOCO_PROVA || '');
  if (!v) return '';
  const a = path.resolve(v);
  if (!fs.existsSync(a)) { console.error('PROVA NULLA: il gioco indicato non esiste: ' + a); process.exit(3); }
  return a;
})();
const GIOCO = GIOCO_ESTERNO || path.join(RADICE, 'CALCETTO-il-gioco.html');

const impronta = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex').slice(0, 12);

/* QUANTO E' OCCUPATO IL BANCO, e perche' bisogna saperlo prima di credere
   a un cancello cronometrico.

   Un cancello che misura un tempo — giocata entro 500 ms, avvio entro 2
   secondi — su una macchina occupata boccia il gioco per un ritardo che
   non e' suo. E' successo due volte in un giorno: prestazione.js ha
   accusato l'onda di aver dimezzato il fotogramma quando il costo vero
   era un decimo di quello, e giocata ha bocciato tiro e carica mentre
   collaudo, sulla stessa macchina, passava da 36 a 219 secondi.

   Qui il carico si misura invece di supporlo, e senza dipendere dal
   sistema operativo: si cronometra un lavoro aritmetico FISSO. Su un
   banco libero dura sempre lo stesso tempo; su un banco conteso dura di
   piu', in proporzione a quanto gli e' stato tolto. Il riferimento non
   si scrive a mano — si tiene il PIU' VELOCE mai osservato.

   RIPARATA IL 20 AGOSTO, perche' era CODICE MORTO (censimento §3.8.13):
   la prima versione inizializzava base = ms e scriveva il file solo se
   ms < base — cioe' MAI. banco-libero.json non e' mai nato, volte valeva
   sempre 1,000 esatto, e il declassamento da condanna a sospetto non
   poteva scattare in nessun caso: la protezione che il caso 24 aveva
   comprato non e' mai esistita. La cura e' una riga: la taratura si
   scrive ANCHE la prima volta, e da li' in poi si abbassa da sola ogni
   volta che si osserva un banco piu' libero. Il primo valore puo' essere
   preso su un banco occupato e quindi essere troppo alto: si corregge da
   solo scendendo, mai salendo — e' il verso giusto dell'errore, perche'
   una guardia troppo mite oggi diventa giusta domani, mentre una guardia
   morta resta morta per sempre. */
const TARATURA = path.join(__dirname, 'banco-libero.json');
function carico() {
  const t0 = process.hrtime.bigint();
  let x = 0;
  for (let i = 1; i < 12e6; i++) x += Math.sqrt(i) / i;
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  let base = ms, scrivi = false;
  try { base = JSON.parse(fs.readFileSync(TARATURA, 'utf8')).ms; } catch (e) { scrivi = true; /* prima volta: senza questa scrittura la guardia non nasce mai */ }
  if (ms < base) { base = ms; scrivi = true; }
  if (scrivi) { try { fs.writeFileSync(TARATURA, JSON.stringify({ ms: +base.toFixed(1), nota: 'il piu veloce mai osservato: la miglior stima di banco libero' })); } catch (e) {} }
  return { ms, base, volte: ms / base, x };
}

/* --carico: la guardia da sola, per poterla vedere lavorare (e vederla
   FALLIRE: si semina banco-libero.json con un minimo impossibile e deve
   gridare; senza un modo di vederla rossa non e' una guardia). */
if (process.argv.includes('--carico')) {
  const b = carico();
  console.log('banco: ' + b.ms.toFixed(0) + ' ms contro un minimo storico di ' + b.base.toFixed(0) + ' ms -> occupato ' + b.volte.toFixed(2) + ' volte');
  console.log(b.volte > 1.5
    ? 'OCCUPATO: un cancello cronometrico su questo banco puo\' bocciare per contesa, non per difetto.'
    : 'il banco e\' vicino al suo minimo storico: i cronometrici si possono credere.');
  process.exit(0);
}

/* I CANCELLI, e il PERCHE' di ogni «conta».

   conta: false = lo eseguo e lo riporto ma non fa rosso il totale. E' un
   privilegio pericoloso — e' il modo in cui istantanea e' peggiorata di
   tre istanti senza che nessuno lo vedesse — quindi ogni false porta la
   sua ragione scritta, e da oggi i false si stampano SOPRA il verdetto e
   il registro (--registra) li confronta con l'ultima corsa buona.

     istantanea  conta:false PERCHE' delle sue 56 misure alcune sono
                 ambizioni dichiarate (la scheda del manifesto), non
                 requisiti del committente: un rosso perpetuo insegna a
                 non guardare. Il rimedio NON e' contarla a forza: e' il
                 CRICCHETTO — peggiorare rispetto all'ultima corsa
                 registrata toglie il verde semplice. E quando dichiara
                 «il banco non ha otto campioni» esce 3, e qui si legge
                 PROVA NULLA, non un numero.
     avvio       conta:false PERCHE' e' un SIMULATORE, e per sua stessa
                 ammissione il meno credibile della casa: sul medesimo file
                 ha dichiarato 2083 ms con dispersione 205,1% e poi 4018 ms
                 con dispersione 19,2% (censimento 20 ago, §3.8.6). Un
                 numero che raddoppia fra due corse non decide niente.
                 Resta come sonda: stampa la pendenza (quanto costa un
                 kilobyte in piu'), che il telefono non sa dare.
     avvio-telefono
                 conta:TRUE, ed e' la voce 5 dell'Onda A finalmente fatta:
                 i ruoli erano scambiati, il cancello misurava il
                 simulatore mentre il telefono era attaccato al cavo. Ora
                 il cancello e' il telefono, a freddo, con la catena di
                 custodia sugli md5 (gioco -> APK -> APK installato).
                 Misurato il 20 agosto su OnePlus 6: 1215 ms con
                 dispersione 7,9% su 7 avvii, e 1222 ms con 7,0% alla
                 riesecuzione. Puo' CONTARE perche' sa dire «non ho
                 misurato»: senza adb, senza telefono, con l'APK che non e'
                 il gioco di oggi o con la dispersione fuori soglia esce 3,
                 e qui si legge PROVA NULLA — mai un verde regalato.
     prestazione CONTAVA false ed era la voce 5 del §3.8: lanciata nuda
                 usciva 2 e si rifiutava di giudicare, quindi «pavimento
                 di prestazione» non esisteva. Da oggi gira APPAIATA
                 (--contro HEAD): due file alternati sullo stesso banco
                 nello stesso minuto, il modo che le sue prove (a) e (b)
                 dichiarano robusto anche su banco occupato (2,5% di
                 scarto con la CPU a 86-100%). Cosi' puo' CONTARE. Se si
                 dichiara cieco esce 2, e qui si legge BANCO, non rosso.

   solo: true = QUESTO NON PUO' CORRERE IN COMPAGNIA: misura un tempo, e
   messo accanto ad altri tre Chrome boccia per contesa e non per difetto
   — misurato: sotto contesa a tre, collaudo e' passato da 36 a 265
   secondi e giocata ha bocciato una giocata che da sola passa. I
   cronometrici girano DOPO, da soli, col campo libero. */
const CANCELLI = [
  { nome: 'collaudo',    cmd: ['strumenti/collaudo.js'],                                conta: true,  lento: false },
  { nome: 'misura',      cmd: ['strumenti/misura.js'],                                  conta: true,  lento: false },
  { nome: 'senza-rete',  cmd: ['strumenti/senza-rete.js'],                              conta: true,  lento: false },
  /* =====================================================================
     DUE VOCI PER EQUITA', e la seconda mancava (27 agosto 2026).

     In batteria c'era una riga sola:  equita.js --partite 10 . Senza
     --conf-b pero' equita.js NON misura l'equita': il lato B e' identico
     ad A, e quel che si controlla e' che le coppie a semi appaiati
     escano identiche — cioe' l'AUTODIAGNOSI dello strumento, la sua
     prova-che-sa-fallire. Utilissima, ma e' un'altra domanda.

     Cosi' il cancello che porta il nome «equita» sorvegliava il
     determinismo, e la promessa scritta in testa a equita.js — «nessun
     oggetto comprato da' vantaggio in campo» — non era sorvegliata da
     nessuno. Finche' il gioco non incassava era un difetto di nome; dal
     giorno in cui incassa, quella promessa sta accanto a un prezzo.

     Adesso sono due voci con due nomi veri. La seconda passa il lato B
     per --conf-b: attivaOggetti('tutti') sblocca E attiva tutto il
     negozio, che e' esattamente il percorso previsto (vedi il commento
     di sbloccaOggetto nel gioco: «zero suoni, zero caso»).
     ===================================================================== */
  { nome: 'equita-sonda', cmd: ['strumenti/equita.js', '--partite', '10'],              conta: true,  lento: false },
  { nome: 'equita',       cmd: ['strumenti/equita.js', '--partite', '10',
                                '--conf-b', "window.__test.attivaOggetti('tutti')"],    conta: true,  lento: false },
  { nome: 'silhouette',  cmd: ['strumenti/silhouette.js'],                              conta: true,  lento: false },
  { nome: 'folla',       cmd: ['strumenti/folla.js'],                                   conta: true,  lento: false },
  { nome: 'seme',        cmd: ['strumenti/seme.js'],                                    conta: true,  lento: false },
  { nome: 'gabbia',      cmd: ['strumenti/gabbia.js'],                                  conta: true,  lento: false },
  /* diritti: la voce 8 dell'Onda A. Il controllo prescritto da agente7
     §c («deve dare 0») dava 3, tutti falsi positivi (due nei base64 dei
     font, uno in «Serie a oltranza»), e NON stava in batteria: un
     cancello che nasce rosso per rumore viene disattivato la prima
     volta. Questo maschera i base64, pretende la A maiuscola su Serie A,
     distingue i commenti (16 menzioni di concorrenti censite li' dentro
     NON fanno rosso: hanno la toppa _t-menzioni.js), e ha il controllo
     negativo visto 6/6 il 20/8/2026 (cinque sabotaggi rossi piu' la
     prova anti-rumore). Statico, niente browser, niente cronometro:
     corre in compagnia.
     LA DEROGA `--nota-aperta ofl` E' STATA TOLTA IL 26 AGOSTO 2026, ed
     e' il giorno che la riga di ieri aveva gia' scritto: il testo della
     licenza OFL deve viaggiare col gioco (condizione 2; nameID 13
     assente dai woff2, misurato con fontTools) e da oggi viaggia —
     _t-crediti.js e' applicato, la schermata CREDITI porta la OFL per
     intero e diritti.js esce verde SENZA deroga. Da qui in poi chi
     togliesse quella schermata trova il rosso, che e' esattamente cio'
     che la deroga prometteva. */
  { nome: 'diritti',     cmd: ['strumenti/diritti.js'],                                  conta: true,  lento: false },
  /* testo-fuori: il buco che il 28 agosto 2026 ha lasciato passare il
     NOME DEL GIOCO scritto male. Sul telefono vero la home diceva
     «CALCETT», e la didascalia del compensato perdeva fino a 34 px di
     lettere su quattro formati — con venti cancelli verdi, perche'
     nessuno di loro guardava il TESTO. Questo legge il DOM di ogni
     schermata a sette formati (telefono orizzontale e verticale, piu'
     desktop) e confronta scrollWidth con clientWidth, distinguendo tre
     cose: le lettere perdute IN SILENZIO (rosso, e la soglia e' zero),
     i troncamenti dichiarati coi puntini e chi sporge senza essere
     ritagliato (questi due a riferimento datato, rossi solo se
     peggiorano).
     conta:TRUE, e puo' contare per le due ragioni di casa: sa dire «non
     ho misurato» (3 se il gioco indicato non esiste, 2 se Chromium non
     parte) e non ha nulla di casuale — nessuna partita, nessun
     sorteggio, nessun cronometro: due corse danno lo stesso referto.
     E' ROSSO SUL GIOCO SPEDITO finche' non entra _t-titolo.js, ed e'
     giusto cosi': il difetto c'e'. */
  { nome: 'testo-fuori', cmd: ['strumenti/testo-fuori.js'],                              conta: true,  lento: false },
  /* =====================================================================
     carattere: IL CANCELLO CHE ESISTEVA E NON ERA IN BATTERIA — messo in
     lista il 28 agosto 2026 a sera, e vale la pena scrivere perche'.

     _q-carattere.js e' nato stamattina per il difetto piu' caro
     dell'anno: per un MESE i due woff2 incorporati non hanno contenuto
     una sola lettera A-Z e il gioco ha scritto tutto in ripiego di
     sistema, con venti cancelli verdi. La cura e' arrivata, il cancello
     che la sorveglia e' stato scritto — e poi e' rimasto fuori da
     questa lista. Un cancello che non e' in batteria non e' un
     cancello: e' un comando che qualcuno si deve ricordare. Se domani
     un sottoinsieme sbagliato tornasse dentro i woff2, la batteria
     uscirebbe verde esattamente come per tutto il mese scorso.

     conta:TRUE, e puo' contare per le due ragioni di casa. SA DIRE «NON
     HO MISURATO»: esce 2 se il browser non parte o se la pagina lancia
     eccezioni, e in quel caso qui si legge BANCO e non rosso.
     SA FALLIRE, e il guasto e' un file: `node strumenti/_t-guasto-car.js
     --out fuori/car-rotto.html` scrive una copia in cui il marchio ha il
     condensato al posto di Archivo Black; su quella copia il cancello e'
     rosso (stiramento 1,611 contro la banda 0,88..1,14, misurato il 28
     agosto 2026). Lo stesso guasto ha mostrato che la prova del VUOTO,
     da sola, restava verde: era una prova che non poteva cadere, perche'
     textLength stende i glifi e le fa dire sempre 515. Adesso sono due,
     e il guasto ne accende una.
     Deterministico, nessuna partita, nessun sorteggio, nessun
     cronometro: corre in compagnia e costa pochi secondi. */
  { nome: 'carattere',   cmd: ['strumenti/_q-carattere.js'],                              conta: true,  lento: false },
  /* =====================================================================
     disposizione: il buco gemello di testo-fuori, trovato il 28 agosto
     2026. Sul telefono lo SPOGLIATOIO aveva CAMPI da solo a sinistra con
     mezza riga di niente accanto e un buco di 82 px prima di TORNA AL
     MENU — e SEDICI cancelli erano verdi, perche' nessuno di loro guarda
     la GEOMETRIA. collaudo conta i nodi, testo-fuori confronta
     scrollWidth con clientWidth (e dichiara di non vedere ne' i vuoti ne'
     gli a capo), tocco chiede dove finiscono i bersagli — e CAMPI orfano
     si tocca benissimo — istantanea giudica la luce. Una schermata poteva
     essere verde su tutti e sedici e restare messa male.
     Alla prima corsa ha trovato lo stesso difetto in CINQUE schermate
     (SPOGLIATOIO, IMPOSTAZIONI, TORNEO, STAGIONE, PREFERENZE), non in
     quella segnalata soltanto.
     conta:TRUE, e puo' contare per le due ragioni di casa.
     SA DIRE «NON HO MISURATO»: 3 se il gioco indicato non esiste o se
     nessuna schermata si apre, 2 se Chromium non parte o non c'e' nessuna
     .ov; e le schermate che SCORRONO le salta dichiarandolo, perche' li'
     il vuoto in fondo e' la lista che continua, non un buco.
     SA FALLIRE: `--guasto` ferisce una schermata SANA (BACHECA) in quattro
     modi, uno per ogni regola — cella stretta, voce inchiodata a una
     colonna, buco di 110 px — e il 28 agosto 2026 le ha viste rosse tutte
     e quattro (1 SCARTO, 1 ORFANO, 1 VUOTO, 1 BUCHI, uscita 1).
     NON ACCUSA A OCCHI CHIUSI: ogni buco candidato viene guardato in
     fotografia e assolto se dentro c'e' qualcosa (la HOME ha 122 px di
     «vuoto» che sono il campetto coi giocatori). Le assoluzioni si
     stampano sempre, anche in verde.
     Deterministico, niente partite, niente sorteggi, niente cronometro:
     corre in compagnia e costa una ventina di secondi. */
  { nome: 'disposizione', cmd: ['strumenti/disposizione.js'],                             conta: true,  lento: false },
  /* eventi: l'unico cancello che misura il GIOCO invece dell'immagine
     (censimento §3.8.7). Deterministico a seme fisso e senza disegno:
     puo' correre in compagnia. Le soglie sono un pavimento largo,
     ancorato alla fotografia del 20 agosto — vedi _eventi.js. */
  { nome: 'eventi',      cmd: ['strumenti/_eventi.js', '--cancello', '--partite', '20'], conta: true, lento: false },
  /* salvataggio: l'unica cosa che il giocatore perde PER SEMPRE se si
     rompe, e fino al 20 agosto 2026 nessuno dei 207 file la nominava
     (censimento §4, voce 2). Undici casi: il giro completo (si gioca, si
     guadagna, si ricarica, i valori veri sono ancora li'), il salvataggio
     corrotto, quello di versione precedente, localStorage assente o pieno,
     l'azzeramento che pulisce davvero, il nascondimento dell'app.
     conta:TRUE, e puo' contare per due ragioni: sa dire «non ho misurato»
     (uscita 3 se il gioco indicato non esiste, uscita 2 se non parte il
     browser) e il suo unico caso rosso di oggi — il salvataggio non forzato
     al nascondimento, difetto misurato e con la toppa gia' scritta e in
     attesa — si stampa APERTO e non fa rosso il totale finche' la toppa non
     arriva. Appena arriva, il cancello lo pretende per sempre. Deterministico
     e senza cronometro: puo' correre in compagnia. */
  { nome: 'salvataggio', cmd: ['strumenti/salvataggio.js'],                              conta: true,  lento: false },
  /* meta: il punto cieco n.3 del censimento del 20 agosto (§3.8.3: «il
     meta-gioco: torneo, stagione, negozio, albo, trofei — nessun cancello
     li tocca; scatta.js li FOTOGRAFA»). Gioca DAVVERO un torneo intero
     (vinto e perso) e una stagione intera di 14 giornate in modalita'
     umana, ricalcola la classifica da capo dalla definizione (3/1/0) e
     pretende che sia identica a quella del gioco, verifica le monete al
     centesimo (premi e trofei compresi), ricarica la pagina a meta'
     stagione e pretende lo stato identico al bit.
     conta:TRUE per le due ragioni di casa: sa dire «non ho misurato»
     (uscita 2 se il banco non chiude una partita, 3 se il gioco indicato
     non esiste) e SA FALLIRE — controllo negativo a tre sabotaggi
     (_q-meta-controllo.js: punti a 2, tabellone col doppione, salvataggio
     che perde la stagione), visto 4/4 il 20 agosto 2026.
     Deterministico a seme fisso, nessun cronometro: corre in compagnia.
     Il pavimento 0-0 alle tre taglie (--tre-taglie) NON gira in batteria:
     costa ~90 s in piu' ed e' un ROSSO APERTO sull'11 contro 11 (63% e
     38% di 0-0 su due serie di semi, 52% sul mucchio, contro una soglia
     del 33%) finche' l'onda della fisica non chiude davvero la voce di
     PUNTO-DEL-LAVORO.md:138 — quando la toppa arriva, si lancia a mano
     `node strumenti/_q-meta.js --tre-taglie` e da verde si mette in
     batteria. */
  { nome: 'meta',        cmd: ['strumenti/_q-meta.js'],                                  conta: true,  lento: false },
  /* l'onda dei contenuti (1 settembre 2026): tre cancelli nuovi, uno
     per contenuto. divisioni e record girano a passo simulato e corrono
     in compagnia; abbandono preme bottoni veri con attese vere (wipe,
     tocchi CDP) e corre DA SOLO come i cronometrici — un banco a dita
     vere su banco occupato accusa l'innocente (lezione del trentesimo
     cieco). */
  { nome: 'divisioni',   cmd: ['strumenti/_t-divisioni.js'],                             conta: true,  lento: false },
  { nome: 'record',      cmd: ['strumenti/_t-record-conta.js'],                          conta: true,  lento: false },
  { nome: 'abbandono',   cmd: ['strumenti/_t-abbandono-conta.js'],                       conta: true,  lento: true  },
  /* volo: la pulsantiera dice la verita'? (voce #88, 2 settembre 2026).
     Undici prove (A-K) sul COMPORTAMENTO dei dischi, non sul loro
     disegno: che TIRA resti offerto mentre una palla NOSTRA vola, che
     la faccia non cambi senza che cambi il possesso, che il comando
     passi al destinatario, che la volee' esca davvero, che nessuna
     cella accesa rifiuti l'atto e — la direzione opposta, che era il
     buco della prima stesura — che nessuna cella SPENTA nasconda un
     atto possibile; piu' tardi si sono aggiunte il palo che non deve
     lasciare un destinatario rancido, la fascia morta del volo che non
     deve mentire al tabellino, e il raddoppio che deve tenere quanto il
     dito lo tiene.

     PERCHE' STA IN BATTERIA E NON FRA I CANCELLI A MANO: e' il solo
     banco della casa che misura la coerenza fra cio' che un disco
     DICHIARA e cio' che il gioco poi CONCEDE. Nove delle undici prove
     sono nate rosse su difetti veri e sono diventate verdi con una cura
     misurata; le altre due (la rovesciata e il rilascio a vuoto) sono
     nate come controlli che discriminano — verdi sul gioco vero, rosse
     solo su una copia rotta apposta, mai su un difetto dal vivo. Se
     domani qualcuno tocca puoTirare, puoContrastoPremuto o
     touchBtnLayout senza saperlo, questo e' l'unico posto dove il
     silenzio si rompe.
     Deterministico a semi dichiarati (88001, 88002, 88003), passo 1/60,
     nessun cronometro: corre in compagnia. */
  { nome: 'volo',        cmd: ['strumenti/_q-volo.js'],                                  conta: true,  lento: false },
  /* proporzioni: il campo e' nella scala dei campi veri? (voce #86, 6
     settembre 2026). Misura le costanti del campo LETTE DAL GIOCO VIVO
     dopo setTaglia() (cerchio, angolo, dArco, dischetto, area, porta e a
     11 i corpi P_R/B_R) contro le misure ufficiali con fonte primaria di
     _analisi/MISURE-UFFICIALI.md, con lo stesso metodo del committente:
     rapporto unita'/metro dalla lunghezza del campo, poi lo scarto di
     ogni elemento da quel rapporto.

     PERCHE' STA IN BATTERIA: e' l'unico posto che si accorge se qualcuno
     tocca TAGLIE/VERNICI/CORPI senza saperlo — un letterale rimesso a
     mano in un pennello, un dischetto ricopiato invece che letto dalla
     tavola, un raggio dimenticato fuori da setTaglia. Nato ROSSO 4/24 sul
     gioco del 6 settembre (cerchio 11 -69,1%, area 11 -57,7%, area di
     porta assente, porta 5 +73,9%, corpi +189,6%/+232,1%), arrivato a
     27/27 coi compiti 1-6 della voce #86 (tavola VERNICI, costante unica
     disegnata=applicata, forma dell'11, porta e area vere, corpi a 11).
     Deterministico, nessun cronometro: corre in compagnia. */
  { nome: 'proporzioni', cmd: ['strumenti/_q-proporzioni.js'],                            conta: true,  lento: false },
  /* replay: la moviola dice il vero, e registrare non cambia il gioco?
     (voce #85, 7 settembre 2026). Rigioca un nastro registrato con le
     dita e misura tre cose che un replay bit-a-bit da solo non protegge:
     SCATTO (il cronometro del gesto avanza insieme al corpo o resta
     congelato mentre la posizione si muove — seme 20260907), CAMPI (il
     campione della moviola porta anche i cinque campi di posa
     contrasto/presaT/gkManiT/rinvT/recover, non solo gli otto storici) e
     la prova E — "registrare non cambia il gioco": la stessa partita a
     registro acceso e a registro spento, sulla stessa pagina (righe
     287-362 del banco, la diagnosi della voce #68).

     PERCHE' STA IN BATTERIA: e' il solo posto che si accorge se un
     futuro tocco al replay, alla moviola o a Touch5 torna a congelare i
     cronometri del gesto, a dimenticare un campo di posa, o a far
     tornare la prova E a PROVA NULLA. Nato ROSSO su due fronti coi
     compiti 1-3 della voce #85: SCATTO a 5 fotogrammi consecutivi
     congelati, CAMPI assente da tutte e 10 le righe del campione durante
     un contrasto vero; curati col compito 4 (SCATTO 5->0 su 16
     transizioni attive) e col compito 3 (CAMPI presente e variabile). La
     prova E, prima della cura di Touch5 in startMatch del compito 2
     (l'azzeramento che orfanava il dito vivo attraverso una rivincita
     rapida), poteva dichiararsi PROVA NULLA (diagnosi in
     _analisi/PROVA-E-DIAGNOSI.md, voce #68); dopo la cura e' verde e non
     e' piu' tornata NULLA.
     Deterministico ai semi dichiarati (20260803 per il nastro, 20260907
     per SCATTO/CAMPI): corre in compagnia. */
  { nome: 'replay',      cmd: ['strumenti/_q-replay.js'],                                conta: true,  lento: false },
  /* battute: il campo impara le sue linee, e resta il gioco di ieri dove
     deve (voce #87, 17-18 settembre 2026). Undici prove sull'interruttore
     SAVE.sponde/G.campoVero, la scena nuova 'battuta' e la battuta coi
     verbi di casa: INTERRUTTORE (a 11 sempre campo vero), RIMESSA/
     FONDO-ANGOLO/FONDO-RINVIO (la classificazione dell'uscita da
     squadraDelPallone, zero dado()), GABBIA (la soglia 1 del piano: a 5/7
     default il rimbalzo resta ~0,82, mai una battuta), ANTI-STALLO (fermo
     <=1,2s, sciolta <=5s), TIRA-SPENTO (il battitore non puo' tirare),
     BATTUTA-UMANA (PASSA scioglie la rimessa), RISPETTO (nessun
     avversario punta a meno di 40 unita' dal battitore, guardia in
     aiDecide), CLIP-RIMESSA (la posa viaggia su p.rimT fino in moviola,
     non su chargeClip: rettifica di revisione del compito 3) e
     ANGOLO-IN-AREA (l'angolo giocato, non solo assegnato: la palla entra
     davvero nel rettangolo vero, VERNICE.areaProf/areaSemi).

     PERCHE' STA IN BATTERIA: e' l'unico banco che si accorge se un futuro
     tocco a ballWalls, a resetKickoff o alla pulsantiera torna a far
     rimbalzare il fondo/la fascia a 11, riapre lo stallo della battuta,
     dimentica di spegnere TIRA sul battitore, o stacca la clip dal suo
     cronometro. Nato ROSSO 2/7 al compito 1 (solo INTERRUTTORE e GABBIA
     verdi, le cinque scene di battuta non esistevano ancora), arrivato a
     11/11 coi compiti 2-4. La gabbia (5/7 default) resta byte-identica al
     gioco di sempre per costruzione: e' la soglia 1 del piano, e questo
     banco e' il suo giudice permanente.
     Deterministico al seme dichiarato del cantiere (20260917), zero
     dado() nuovi (le scene si costruiscono scrivendo lo stato del
     pallone e chiamando segnaTocco, la stessa funzione del gioco vero):
     corre in compagnia. */
  { nome: 'battute',     cmd: ['strumenti/_q-battute.js'],                              conta: true,  lento: false },
  /* regole: le quattro regole a leva corta esistono davvero? (voce #107,
     18 settembre 2026). Tredici prove su area del rigore (RIGORE-DENTRO/
     RIGORE-FUORI), retropassaggio (RETRO-PRESA/RETRO-TESTA/RETRO-
     AVVERSARIO/RETRO-FERMO), vantaggio coi suoi casi limite (VANTAGGIO-
     FISCHIA-SEMPRE/VANTAGGIO-SFUMATO/CARD-DIFFERITO/DOGSO-GOL/GRAZIA-
     DOPO-CARD/CARD-NON-SI-PERDE) e la versione del nastro (NASTRO-
     VERSIONE, chiude la voce #96: un nastro di un motore diverso si
     chiude col messaggio a causa vera, non con l'accusa sbagliata «la
     squadra e' cambiata da allora» che chiudiSfida darebbe se la
     partita fosse lasciata correre fino in fondo).

     PERCHE' STA IN BATTERIA: e' l'unico banco che si accorge se un
     futuro tocco a checkSlideContact, tentaPresa, punizioneRapida,
     Reg.serializza/deserializza o Sfida.guarda torna a far aprire il
     duello sulla vecchia fascia invece dell'area vera, a lasciar
     afferrare col piede un retropassaggio, a fischiare un vantaggio
     sempre e comunque, o a rigiocare un nastro di un motore diverso
     senza dirlo. Nato ROSSO 1/4 al compito 1 (solo RIGORE-DENTRO
     verde, un controllo discriminante), 5/6 e poi 6/7 al compito 2,
     ROSSO su piu' fronti in corsa al compito 3, arrivato a 13/13 col
     compito 4 (che aggiunge NASTRO-VERSIONE, condannata 12/13 sulla
     base pre-cura).
     Deterministico al seme del cantiere (20260918), zero dado() nuovi
     (le scene scrivono lo stato direttamente, come _q-battute.js; la
     tredicesima prova sostituisce Rete.replay con dati finti, zero
     rete vera): corre in compagnia. */
  { nome: 'regole',      cmd: ['strumenti/_q-regole.js'],                              conta: true,  lento: false },
  /* accessibile: le sette prove degli spiccioli di UX/accessibilita' (voce
     #112, 18 settembre 2026) — ARIA, BANNER-DICHIARATO, VIBRAZIONE,
     VIBRAZIONE-STILE, RIVEDI-TUTORIAL, SOTTOTITOLI, ANELLO-FIATO.

     PERCHE' STA IN BATTERIA: mancava (censita nel piano del cantiere ma
     mai registrata) — senza di lei un futuro tocco a refreshImpostUI, a
     buzz(), al pannello ingranaggio, a sottotitolo() o ad anelloComandato
     puo' spegnere in silenzio un aria-pressed, disallineare lo stile di
     un .diff-row nuovo dal suo stato logico, o rompere l'arco del fiato
     senza che nessun altro banco se ne accorga: nessuno degli altri
     quindici cancelli guarda questi pixel o questi attributi.
     Nata ROSSA 0/2 al compito 1 (solo ARIA e BANNER-DICHIARATO
     esistevano), arrivata a 7/7 col compito 5. Misura, non attesta:
     aria-pressed letto dal DOM, lo stile confrontato con getComputedStyle,
     l'arco del fiato campionato pixel per pixel.
     Deterministico, zero dado() nuovi: corre in compagnia. */
  { nome: 'accessibile', cmd: ['strumenti/_q-accessibile.js'],                          conta: true,  lento: false },
  /* fotosensibile: il banco della fotosensibilita' (voce #112, compito 6,
     18 settembre 2026). Misura la frequenza dei lampi A SCHERMO INTERO su
     tre sorgenti (CROWD_FLASH, DUEL_FLASH, il lampo+raggi del gol), a
     SAVE.moto acceso e spento: verde se nessuno supera 3 Hz.

     PERCHE' STA IN BATTERIA: sorveglia che un futuro effetto luminoso
     (un nuovo lampo, un'animazione di folla piu' vivace, un fondale che
     lampeggia) non introduca uno strobo oltre 3 Hz senza che nessuno se
     ne accorga — nessun altro cancello in lista guarda la luminanza a
     schermo intero nel tempo. Nato verde 6/6 sul gioco di oggi;
     `--controllo` (fuori dalla batteria: un lampo iniettato a 4 Hz)
     condannato 0/1, la prova che il banco discrimina e non attesta.
     Deterministico al seme del cantiere, zero dado() nuovi: corre in
     compagnia (circa 20-25 s, il piu' lento dei banchi in compagnia
     perche' rilegge l'intero canvas a ogni fotogramma vero). */
  { nome: 'fotosensibile', cmd: ['strumenti/_q-fotosensibile.js'],                      conta: true,  lento: false },
  /* nomi: il punto cieco che il 28 agosto 2026 e' costato una bocciatura.
     Il gioco aveva gia' trovato e riparato «due uomini con lo stesso
     cognome nella stessa squadra» — l'elenco dei cognomi fu portato da
     quindici a trenta — ma la riparazione era affidata a un COMMENTO. La
     panchina di _t-condizione.js ha riaperto la ferita (28 uomini con 26
     cognomi a 11 contro 11, Rocco e Vito Piedebuono nella stessa squadra)
     e la batteria e' rimasta verde 15 su 15, perche' _identita.js — che
     si citava a garanzia — misura maglie e numeri, dei nomi non sa
     niente.
     conta:TRUE, e puo' contare per le due ragioni di casa: sa dire «non
     ho misurato» (3 se il gioco indicato non esiste o nessuna taglia
     parte, 2 se il browser non si apre) e SA FALLIRE — `--guasto` copia
     un cognome da un compagno e l'ha visto rosso a tutte e tre le taglie
     il 28 agosto 2026, e sul file rotto (fuori/cond-rotto.html) nomina
     le due coppie una per una.
     Deterministico, tre partite aperte e nemmeno giocate, nessun
     cronometro: corre in compagnia e costa una decina di secondi. */
  { nome: 'nomi',        cmd: ['strumenti/_p-nomi.js'],                                  conta: true,  lento: false },
  /* umore: il banco del MIND v1 (voce #117, 19 settembre 2026, sei
     compiti dal merge-base f352af5). Sette prove sul canale emotivo:
     REGISTRO (G.fatti trascrive gli eventi gia' decisi dal gioco, non li
     inventa), STATI (umore/nervi/spinta derivati dai fatti, osservazione
     pura), CANALE+TETTI (manopolaDi(p) modula passErr/slideP/standoff
     entro i tetti dichiarati, il massimo scarto osservato stampato
     sempre, mai un si/no cieco), TESTIMONE (nessuno stato emotivo resta
     muto: mesto o banner o folla ne parlano), SPECCHIO (due squadre a
     storie speculari producono stati speculari AL BIT), INPUT-SACRO (il
     canale non tocca mai il verbo del dito umano, limite dichiarato nel
     file: nessun __test.dita, quindi ispezione strumentata invece di un
     nastro di comandi vero).

     PERCHE' STA IN BATTERIA: e' l'unico cancello che si accorge se un
     futuro tocco a manopolaDi, applicaImpattoFatto, emettiFatto o ai due
     canali d'occhio (mesto dai fatti, folla+banner sulla spinta) rompe
     un tetto, fa tacere uno stato, o rompe la simmetria fra le due
     squadre — nessun altro dei cancelli in lista guarda il registro dei
     fatti o gli stati emotivi.
     Nato ROSSO con la sola prova REGISTRO al compito 1 (G.fatti non
     esisteva sul gioco di allora), cresciuto compito per compito (STATI
     al 2, CANALE+TETTI al 3, TESTIMONE al 4), arrivato verde su tutte le
     prove col compito 5; le due versioni bugiarde generate apposta
     (_crit-mind-tetto.js sul coefficiente di passErr, _crit-mind-muto.js
     sul canale mesto) lo condannano ciascuna sulla propria prova,
     verificato e dichiarato nel file — la prova che il banco discrimina.
     Deterministico al seme del cantiere (20260919), zero dado() nuovi,
     taglia 5 (default storico -- la voce #98 che lo motivava e' CHIUSA
     dalla voce #129, rettifica a edizioni voce #130, 21 settembre 2026):
     corre in compagnia. */
  { nome: 'umore',       cmd: ['strumenti/_q-umore.js'],                                conta: true,  lento: false },
  /* cpu-ordine: LA RETE CHE COGLIE IL PROSSIMO BANCO ROTTO (voce #121,
     compito 3, seguito #108, 19 settembre 2026). Due prove sullo stesso
     schema, in direzioni opposte: ORDINE-GIUSTO (setCpuVsCpu(true) DOPO
     startMatch) deve dare G.cpu=[true,true] e una partita CPU-CPU a seme
     fisso che raggiunge 'end' entro TETTO_FOTOGRAMMI (18000 fotogrammi,
     ricalibrato voce #127 compito 2, importato da _q-invarianti.js dal
     20 settembre 2026 -- prima una copia locale scaduta) senza restare
     incastrata in 'freekick'; ORDINE-SBAGLIATO (setCpuVsCpu(true) PRIMA
     di startMatch, il controllo discriminante) deve dare G.cpu[0]===false
     -- la prova che l'artefatto #108 esiste ancora nel gioco e che
     l'ordine giusto resta obbligatorio, non una tautologia.

     PERCHE' STA IN BATTERIA (conta:TRUE): _q-umore.js e' nato con questo
     stesso difetto DOPO il censimento originale di #108, e nessuno se
     n'e' accorto finche' non ha causato l'hang #119 -- un censimento e'
     una fotografia, non vede quel che nasce dopo. Questo cancello
     interroga il COMPORTAMENTO del gioco a ogni corsa, non un elenco di
     file noti: nessun quarto banco CPU-CPU puo' nascere rotto su questo
     punto senza che la prova 1 lo veda in batteria.
     Deterministico al seme del cantiere (20260919), zero dado()/SEME
     propri (la semina passa sempre da semeFisso di _posa.js): corre in
     compagnia. */
  { nome: 'cpu-ordine',  cmd: ['strumenti/_q-cpu-ordine.js'],                           conta: true,  lento: false },
  /* mira: LA MIRA GUIDATA A DUE PESI DICE LA VERITA'? (voce #113, 19
     settembre 2026, tre compiti). Cinque prove: SCOPE (input umano
     simulato, seme fisso 113001, taglia 5 — col peso 'essenziale' un
     cross salta ancora, un passaggio corto no; col peso 'pieno' entrambi
     saltano) e SCOPE-BASE113 (la stessa misura sul gioco pre-cantiere,
     nata rossa per costruzione: la' 'essenziale' non esiste); PIENO-
     IDENTICO (col peso 'pieno' esplicito, base113 e curato combaciano
     fotogramma per fotogramma — la prova che protegge MOTORE_V, che
     NON si incrementa: 0 differenze su 60 fotogrammi per due scene);
     MIRA-UI-STILE e MIRA-ARIA (compito 2: la riga IMPOSTAZIONI a due
     bottoni rende col selettore CSS condiviso, aria-pressed sincronizzato
     e SAVE.miraGuidata persistito). La CPU-cecita' (switchControlled
     salta le squadre CPU per costruzione) e la SFIDA-DETERMINISTICA
     (le sfide forzano 'pieno', il SAVE locale e' ignorato) sono cancelli
     a parte (_c3-sorteggi, _q-replay prova B), non ripetuti qui.

     PERCHE' STA IN BATTERIA (conta:TRUE, sul modello di regole/
     accessibile/umore/cpu-ordine): e' l'unico banco che si accorge se un
     futuro tocco a switchControlled, a startMatch (lettura di
     G.miraGuidata), a defaultSave/loadSave (whitelist) o al pannello
     IMPOSTAZIONI fa perdere lo scope ristretto di 'essenziale', fa
     rileggere SAVE a partita in corso, o rompe l'accessibilita' della
     riga a due bottoni — nessun altro cancello in lista guarda questo
     campo.
     Nato ROSSO su SCOPE al compito 1 (il gioco pre-cantiere non
     distingue i due pesi), su MIRA-UI-STILE/MIRA-ARIA al compito 2
     (nessun #miraRow), arrivato verde su tutte le prove col compito 2.
     Deterministico al seme del cantiere (113001), taglia 5, zero dado()
     nuovi (le scene scrivono lo stato di palla/giocatori e chiamano
     kickBall/doCross/segnaTocco, le stesse funzioni del motore vero):
     corre in compagnia. */
  { nome: 'mira',        cmd: ['strumenti/_q-mira.js'],                                 conta: true,  lento: false },
  /* invarianti: IL PRIMO ANELLO DELL'ONDA C (robustezza) DEL MANDATO (voce
     #125, 20 settembre 2026, due compiti dal merge-base a7561d0). Il
     mandato (Appendice A, INV-01..15) chiede proprieta' che devono valere
     SEMPRE, a ogni fotogramma di qualunque partita: nove prove su partite
     CPU-CPU guidate a seme fisso -- NaN/Infinity su ball/players, owner
     valido, punteggio monotono, timeLeft monotono, durata<=18000
     fotogrammi (INV-15, ricalibrato voce #127 compito 2, 20 settembre
     2026 -- il vecchio 13200 non copriva il caso peggiore del rigore a
     oltranza, vedi _q-invarianti.js), i cronometri-fratelli
     (recT/vantaggio/possOwner/possT/pulse/crowdSndT/swLock/swTimer) al
     riposo dopo startMatch, il
     clamp fiato/cond in [0,100], >=2 uomini di movimento in campo per
     squadra, e la palla mai sotto il piano/velocita' entro un tetto
     calibrato (1353 u/s orizzontale, 402 u/s verticale, osservato x1,5 su
     30 semi di calibrazione, a palla libera). Ogni prova nasce rossa su un
     bugiardo dedicato (--bugiardo nan|owner|punteggio|timeleft|durata|
     fiato|movimento|ballz|ballvel), verificato nei compiti 1-2.

     PERCHE' STA IN BATTERIA (conta:TRUE, sul modello di regole/umore/
     cpu-ordine/accessibile): e' il PREREQUISITO del fuzzer e del soak
     (onda C, anelli successivi) -- senza sapere COSA deve valere sempre,
     input casuali non dicono niente. E' un BANCO, non codice in
     produzione: legge G vivo via __test (nessun hook nuovo, nessun costo
     a runtime, nessun rischio nel motore), come _diag-nan.js/
     _q-determinismo.js/_q-umore.js prima di lui.
     Nato con le sei prove solide al compito 1 (NaN, owner, punteggio,
     timeLeft, durata, cronometri-fratelli), esteso a nove al compito 2
     (clamp fiato/cond, movimento, palla) -- verde su tutte e nove dal
     primo giorno, ciascuna gia' dimostrata capace di condannare il
     proprio bugiardo.
     Deterministico al seme del cantiere (20260920), taglia 5 (default
     storico -- la voce #98 che lo motivava e' CHIUSA dalla voce #129,
     rettifica a edizioni voce #130), 8 semi/56984 fotogrammi campionati
     per corsa: corre in compagnia (~5 s). */
  { nome: 'invarianti',  cmd: ['strumenti/_q-invarianti.js'],                          conta: true,  lento: false },
  /* =====================================================================
     fuzzer: IL SECONDO ANELLO DELL'ONDA C (voce #126, tre compiti dal
     merge-base f27d951, 20 settembre 2026 — spec `docs/superpowers/
     specs/2026-09-20-fuzzer-design.md`, piano `docs/superpowers/plans/
     2026-09-20-fuzzer.md`). Il mandato (S13.1.2) chiede "property-based
     tests: random inputs for thousands of ticks must never violate the
     invariants". `invarianti` (sopra) le sa VERIFICARE ma le esercita
     solo con partite CPU-contro-CPU: G.swLock/G.swTimer (scritti solo da
     un cambio-giocatore/strappo UMANO, mai dalla CPU) restano vacui, e
     nessuna posizione e' mai spinta a fondo scala verso i confini del
     campo. Questo banco genera INPUT CASUALE deterministico via Reg+
     Touch5 (uno stick e cinque dischi, come un pollice vero) su una
     squadra umana(fuzzata) contro CPU, RIUSA le dodici invarianti di
     `_q-invarianti.js` (require, non riscritte) dopo ogni fotogramma, e
     gestisce anche il duello dal dischetto (Duel.pickZone/pickKeeper/
     stopPower, LOGGATO A PARTE perche' Reg non lo cattura) invece di
     escluderlo.
     RETTIFICA A EDIZIONI (21 settembre 2026, voce #131): dopo il #131
     Reg CATTURA il duello (le tre porte avvolte entrano nel nastro,
     tipo 6); il logDuelli riapplicato a mano resta nel fuzzer ma e'
     ormai NEUTRALIZZATO dalla guardia di rilettura del gioco
     (Reg.modo===2 && !Reg.dentro && !daMotore, CALCETTO-il-gioco.html:
     43898) — peso morto senza doppio effetto, il cancello resta verde.
     Il testo vecchio non si cancella, si legge cosi'.

     PERCHE' STA IN BATTERIA (conta:TRUE): e' l'unico banco che esercita
     swLock/swTimer (20 semi su 20 osservati attivi, 147.134 fotogrammi-
     tick su 150.589) e INV-04 (confini+margine, 110 unita') — nessun
     altro cancello in lista muove mai un dito verso i bordi del campo o
     tocca il cambio-giocatore umano. Nato dal primo giro (compito 1 su
     main sano, prima di questa ricostruzione) con DUE VIOLAZIONI VERE
     (il cross-proiettile e il battitore espulso, cantiere dedicato #128,
     entrambe curate), e' arrivato VERDE su tutte le dodici invarianti
     dopo la cura, col duello gestito (0 semi esclusi) e la riproduzione
     verificata (nastro+log-duelli su pagina fresca da' la stessa
     partita, byte per byte). LA SCOPERTA DEL COMPITO 2: il residuo di
     determinismo cross-partita a taglia 5 non era il canale dei tocchi
     (stick.ox/oy, gia' sano, verificato campo per campo) ma SAVE.rosa —
     la rosa di carriera cresce di un attributo a ogni fine-partita, per
     disegno; il fuzzer rigenera la rosa (nuovaRosa()) a ogni seme, come
     dichiarato nel file.
     Deterministico ai due semi separati del cantiere (semeGioco
     20260920, semeComandi 71260920), taglia 5 (default storico -- la
     voce #98 che lo motivava e' CHIUSA dalla voce #129, rettifica a
     edizioni voce #130): **15/15**, 20 semi, 150.589 fotogrammi simulati,
     max 745 righe Reg (tetto 40000), corre in compagnia (~17 s, misurato
     due volte, stesso esito e stesso numero al bit entrambe le volte). */
  { nome: 'fuzzer',      cmd: ['strumenti/_q-fuzzer.js'],                              conta: true,  lento: false },
  /* =====================================================================
     soak: IL TERZO E ULTIMO ANELLO DELL'ONDA C (voce #127, tre compiti
     dal merge-base `ddf6604`, 20 settembre 2026 — spec `docs/superpowers/
     specs/2026-09-20-soak-design.md`, piano `docs/superpowers/plans/
     2026-09-20-soak.md`). Il mandato (S13.1.5) chiede "soak tests: 1,000
     bot-vs-bot matches per night per profile ... zero crashes, zero
     invariant violations, no match longer than the expected real
     duration + 25%". `fuzzer` (sopra) cerca il caso avversariale con
     INPUT CASUALE su pochi semi; questo banco e' complementare: guida un
     VOLUME di partite CPU-CONTRO-CPU (nessun input umano) fino a 'end',
     verificando su OGNI partita le dodici invarianti di
     `_q-invarianti.js` (RIUSATE via require, non riscritte) piu' INV-15-
     SU-VOLUME (durata<=TETTO_FOTOGRAMMI, la clausola "+25%" del mandato
     gia' incorporata nel tetto) e le BANDE statistiche ancorate a taglia
     5 (gol/90s, tiri, tiri in porta, parate, legni, durata gioco vivo,
     % 0-0 — mediana dentro un margine dichiaratamente largo, non uno
     steccato di Tukey alla lettera, lezione #112/#114).

     LA SCOPERTA DEL COMPITO 1 (P0 vera, dichiarata non un difetto): a
     volume alto (--partite 1000) 5/1000 partite SANE — un rigore a
     oltranza legittimo (18 tiri, CALCETTO-il-gioco.html:18523) — sforavano
     il vecchio TETTO_FOTOGRAMMI=13200 (220s), tarato sulla durata
     ORDINARIA senza considerare il caso peggiore del proprio meccanismo a
     oltranza. LA RICALIBRAZIONE (compito 2, in `_q-invarianti.js`, non
     duplicata qui): 13200 -> 18000 (300s), somma del caso peggiore
     misurato pre-rigori (180,9s) + 18 tiri x 328 fotogrammi (98,4s),
     arrotondato con margine — l'hang vero (`--bugiardo durata`) resta
     colto (nessun tetto finito lo salva). Il compito 2 ha anche corretto
     EN PASSANT due bug nei banchi di questo stesso censimento, resi
     visibili dalla ricalibrazione: `_q-cpu-ordine.js` teneva una copia
     locale di `TETTO_FOTOGRAMMI` (mai importata nonostante il refactor
     #126); `_q-invarianti.js` validava `--bugiardo` contro il proprio
     elenco anche quando RICHIESTO come modulo, uccidendo `_q-soak.js
     --bugiardo bande` — entrambi curati (require condiviso, guardia
     `require.main===module`).

     TAGLIA 5, IL CANCELLO ANCORATO -- RETTIFICA A EDIZIONI (voce #130, 21
     settembre 2026): la voce #98 (rebuildCrowd/setTaglia consumava PRNG
     in proporzione al perimetro a 7/11) e' CHIUSA dalla voce #129;
     l'ancoraggio resta per le BANDE statistiche (tarate sulla rosa/campo
     di taglia 5), non piu' per il determinismo -- vedi `_q-soak.js` per
     la misura. ROSA RIGENERATA (`nuovaRosa()`) a ogni partita, come
     il fuzzer: SAVE.rosa cresce per carriera a ogni fine-partita vera,
     desincronizzando le partite in sequenza sulla stessa pagina se non
     rigenerata. Deterministico: due corse a `--semeBase`/`--partite`
     identici stampano la STESSA impronta (hash FNV-1a di ogni partita).

     PERCHE' STA IN BATTERIA MA `lento:TRUE` (a differenza di
     invarianti/fuzzer): il CAMPIONE di batteria (default, 60 partite) sta
     sulla soglia dei 30-40s che qui chiede lento (modello `audio.js`),
     misurato **~30-33s** due volte di fila, stessa impronta (21f65940)
     entrambe le volte — ESCLUSO dalla corsa di default di questa
     batteria (`node strumenti/tutti.js`), verificato A PARTE come
     `audio.js`. Il VOLUME del mandato (1000 partite/notte, ~493s) e' un
     lancio manuale (`node strumenti/_q-soak.js --partite 1000`), non un
     cancello di ogni batteria. */
  { nome: 'soak',        cmd: ['strumenti/_q-soak.js'],                                conta: true,  lento: true  },
  /* =====================================================================
     determinismo: IL FONDAMENTO DELLA VERIFICABILITA' DI UNA SFIDA (voce
     #130, "il metro prima del giudice", 21 settembre 2026). L'onda D
     costruira' un GIUDICE che rigioca il nastro di una sfida e ne
     conferma il punteggio — un'operazione che ha senso SOLO se il gioco
     e' deterministico dato il seme (INV-01 del mandato). `_q-determinismo.js`
     lo prova da agosto (quattro prove A/B/C/D: stessa pagina, pagine
     diverse, dita, seme dentro il gioco) ma non era MAI stato registrato
     in questa batteria — trovato mancante durante il censimento di questo
     cantiere (nessuna voce `determinismo` in tutta la lista).

     PERCHE' DUE VOCI E NON UNA. Fino alla voce #129 il banco era 8/10 a
     taglia 7/11 (voce #98: rebuildCrowd/setTaglia consumava il PRNG di
     gioco in proporzione al perimetro del campo sulla prima partita a
     una taglia nuova) — registrarlo a UNA sola taglia (5) avrebbe
     ricreato dentro il cancello proprio il buco che questo cantiere
     doveva chiudere: la batteria avrebbe sorvegliato solo la taglia dove
     il difetto storico non si vedeva mai. Dopo la cura #129 (PRNG
     dedicato `DECO` per la cosmetica, non piu' condiviso col PRNG di
     gioco), MISURATO qui (21 settembre 2026): **10/10 anche a taglia 7 e
     11** (contro l'8/10 di prima), stesso banco, nessuna modifica. Due
     voci: `determinismo` di serie (taglia 5, ~16s) e `determinismo-11`
     (--taglia 11, ~60s — MOLTO piu' lento: le partite a taglia 11 durano
     il doppio e la prova D ne gioca quattro per pagina, due pagine).
     La prova C (con le dita) resta dichiarata assente dal banco stesso
     (`__test.dita` non esposto): non e' un buco di questo cantiere, e'
     un limite gia' scritto nel file, i controlli contati restano dieci.
     RETTIFICA A EDIZIONI (23 settembre 2026, voce #141). Le tre righe
     qui sopra restano com'erano scritte e vanno lette con questa
     accanto: dal 23 settembre `__test.dita` ESISTE (toppa
     `_toppa-141-ritardo.js`) e la prova C MISURA. I controlli contati
     sono ELEVEN, non dieci. E va detta anche la cosa scomoda: per mesi
     quel banco ha PROMESSO una misura che non faceva — stampava «il
     gioco non espone __test.dita» in mezzo a dieci righe verdi, e chi
     leggeva «determinismo 10/10» credeva coperta la gamba dell'INGRESSO,
     che e' proprio quella che decide se sulla rete bastano i comandi.
     Non era un buco del cantiere che scrisse queste righe; era un buco
     che nessuno aveva chiuso, ed e' costato tre cantieri di fiducia
     sbagliata.
     Deterministico ai semi del banco (20260803+), nessun cronometro:
     `determinismo` corre in compagnia, `determinismo-11` da solo
     (`lento:true`, sul modello di `soak`/`audio`). */
  { nome: 'determinismo',    cmd: ['strumenti/_q-determinismo.js'],                              conta: true,  lento: false },
  { nome: 'determinismo-11', cmd: ['strumenti/_q-determinismo.js', '--taglia', '11'],             conta: true,  lento: true  },
  /* =====================================================================
     IL METRO DEL RITARDO (voce #141) — e i due qui sotto NON sono lo
     stesso genere di cosa, per questo hanno `conta` diverso.

     `ritardo` E' UN CANCELLO e conta, ma gira in `--solo-banco`, che e'
     una distinzione che vale la pena leggere. In quel modo guarda che la
     MACCHINA regga: la traslazione trasla davvero (comandi sul tick,
     dischetto sul passo, metadati fermi), il metro varia fra partite
     diverse, il controllo negativo morde (senza NESSUN comando la
     squadra comandata va peggio), a K=0 il nastro si riproduce esatto, e
     a 300 ms il ritardo si VEDE. Cinque cancelli veri, pochi minuti, e
     diventano rossi il giorno in cui qualcuno rompe il registratore o le
     quattro porte.
     NON applica la SOGLIA-DANNO, e non finge di poterla applicare: per
     quella servono centoventi nastri da novanta secondi (la dispersione
     dei gol in una partita di calcio e' quasi uguale alla media), cioe'
     un quarto d'ora. In batteria darebbe PROVA NULLA a ogni corsa, e un
     cancello che ogni giorno dice «non ho potuto misurare» insegna a
     ignorarsi. Il verdetto vero si fa a mano —
     `--nastri 120 --tetto 5400 --pagine 8` — ed e' nel verbale del #141.

     `motori` NON CONTA, e non e' pigrizia: OGGI E' ROSSO, e lo e' per un
     difetto vero e aperto del gioco — Chromium, WebKit e Firefox non
     vedono la stessa partita, perche' Math.hypot e' approssimata
     dall'implementazione e V8 ne sbaglia l'ultimo bit su meta' dei
     valori. Metterlo a `conta:true` renderebbe rossa l'intera batteria
     per un guasto gia' a registro, che e' il modo piu' sicuro di far
     smettere di guardare la batteria. Resta qui, informativo e
     stampato, finche' il guasto non ha un cantiere. `lento:true`
     perche' apre tre browser diversi e gioca tre partite intere per
     ciascuno.

     RETTIFICA A EDIZIONI (23 settembre 2026, voce #143, compito 4):
     `motori` ADESSO CONTA. Il cantiere che la riga qui sopra aspettava
     c'e' stato — le trascendenti della simulazione sono scritte in casa
     con sole operazioni che IEEE-754 obbliga a essere correttamente
     arrotondate — e il cancello e' passato da ZERO semi concordi su otto
     a VENTI su venti. Un cancello che misura una cosa curata e non conta
     e' il rovescio dello stesso errore: il giorno che qualcuno rimette
     una `Math.sin` nella fisica, il lockstep dell'onda E si rompe in
     silenzio e la batteria resta verde. Resta `lento:true` (tre browser,
     tre partite per ciascuno) e in batteria gira a `--semi 2 --secondi
     60`: la SOGLIA piena — venti semi da novanta secondi — sta nel
     verbale del #143, perche' in batteria costerebbe un quarto d'ora.
     ===================================================================== */
  { nome: 'ritardo',         cmd: ['strumenti/_q-ritardo.js', '--solo-banco', '--nastri', '8',
                                   '--tetto', '2700', '--k', '0,18', '--pagine', '4'],           conta: true,  lento: true  },
  { nome: 'ritardo-falsi',   cmd: ['strumenti/_q-ritardo-falsi.js', '--nastri', '6',
                                   '--tetto', '2700', '--pagine', '3'],                          conta: true,  lento: true  },
  /* `verbi-ritardo` e' l'altra meta' del metro: i cinque verbi provati a
     TOCCHI VERI con duecento millisecondi addosso. Conta, ma la sua
     porta e' stretta apposta — «un verbo MUORE» e non «un verbo riesce
     nel 95% dei casi». Il 95% vorrebbe sessanta tentativi per verbo e
     per K (regola del tre) cioe' due ore di corse da mezzo minuto, e il
     banco lo dichiara invece di fingere. Zero riuscite su tre, quando a
     ritardo zero ne riusciva tre su tre, non ha bisogno di statistica.
     Banco a TEMPO REALE, quindi NON ripetibile: `solo:true`, perche' un
     cancello a cronometro che gira in compagnia misura il carico della
     macchina (la stessa ragione di `giocata` e `prestazione`). */
  { nome: 'verbi-ritardo',   cmd: ['strumenti/_q-verbi-ritardo.js', '--ripetute', '3',
                                   '--k', '0,12'],                     conta: true,  lento: true, solo: true },
  { nome: 'motori',          cmd: ['strumenti/_q-motori.js', '--semi', '2', '--secondi', '60'],   conta: true,  lento: true, solo: true },
  /* =====================================================================
     casa / perimetro / casa-falsi: LA MATEMATICA IN CASA (voce #143).

     `casa` misura le sette funzioni scritte a mano sui tre motori e sul
     dominio VERO del gioco — gli argomenti che la partita passa davvero,
     non un intervallo comodo — e tiene due guardie che non stanno altrove:
     che `pow` e `sqrt`, le due lasciate native APPOSTA, siano ancora
     d'accordo fra i motori (se smettessero, vanno scritte in casa anche
     loro), e che lo scarto dalla nativa resti sotto i 4 ulp, che e'
     l'unica prova capace di vedere una funzione uguale ovunque ma STORTA.
     Apre tre browser: `lento` e `solo`.

     `perimetro` risponde alla domanda che nessun altro fa: QUALI chiamate
     decidono la partita. Sporca una funzione per volta di un ulp e guarda
     se l'impronta si muove. E resta utile per sempre, anche a cantiere
     chiuso: il giorno in cui qualcuno mettesse una `Math.asin` dentro la
     fisica, la riga finale — «ogni trascendente DENTRO il perimetro passa
     da casa» — diventa rossa da sola, perche' misura il COMPORTAMENTO e
     non un elenco scritto a mano.

     `casa-falsi` e' il banco dei quattro mutanti, e il suo `--semi 8` NON
     E' UN PARAMETRO DEL BANCO, E' PARTE DELLA SOGLIA: il falso
     `solo-hypot` — la cura parziale che il #141 aveva gia' in mano — passa
     su POCHI semi e cade solo quando ce ne sono abbastanza. Rilancia
     `_q-motori` quattro volte su tre motori, quindi e' il piu' caro della
     batteria: `lento` e `solo`, come `motore-falsi`. */
  { nome: 'casa',            cmd: ['strumenti/_q-casa.js', '--secondi', '60'],                    conta: true,  lento: true, solo: true },
  { nome: 'perimetro',       cmd: ['strumenti/_q-perimetro.js', '--semi', '2', '--secondi', '60'], conta: true, lento: true, solo: true },
  { nome: 'casa-falsi',      cmd: ['strumenti/_q-casa-falsi.js', '--semi', '8'],                   conta: true, lento: true, solo: true },
  /* =====================================================================
     motore-nastro / motore-falsi: UN ONESTO CON UN TELEFONO DI UN'ALTRA
     MARCA (voce #142).

     `motori` qui sopra ha misurato il difetto e sta a conta:false apposta
     — e' rosso per un guasto vero e aperto (le trascendenti divergono, e
     la cura e' il cantiere della matematica scritta in casa), e metterlo
     a true tingerebbe di rosso l'intera batteria per una cosa gia' a
     registro. Questi due invece misurano LA CURA DELL'ACCUSA INGIUSTA,
     che e' chiusa e deve restare chiusa: `motore-nastro` che un nastro
     onesto giudicato su un motore diverso non produca mai NON TORNA (e
     che sullo STESSO motore si confermi ancora — senza quella meta',
     «astenersi sempre» passerebbe a pieni voti), `motore-falsi` che il
     primo se ne accorgerebbe.

     SONO LENTI E VANNO DA SOLI, E NON PER IL CRONOMETRO: il primo apre
     TRE motori veri e serve un file da 2,7 MB a sei contesti, il secondo
     lo rilancia cinque volte (i quattro falsi piu' il controllo
     positivo). MISURATO il 23 settembre 2026: lanciati in compagnia di
     altri tre cancelli, il `goto` scadeva a 30 s e `motore-nastro`
     usciva **2** — «il banco e' esploso», cioe' si dichiarava cieco per
     il carico della macchina — e `motore-falsi`, che lo rilancia, vedeva
     lo stesso timeout e contava zero etichette. Un 2 non accusa il
     gioco, ma un cancello che non misura non serve a niente. Quindi
     `solo:true`, come `giocata` e `prestazione`, piu' tempi larghi
     dentro il banco come seconda rete. */
  { nome: 'motore-nastro',   cmd: ['strumenti/_q-motore-nastro.js', '--sfide', '6'],              conta: true,  lento: true, solo: true },
  { nome: 'motore-falsi',    cmd: ['strumenti/_q-motore-falsi.js', '--sfide', '4'],               conta: true,  lento: true, solo: true },
  /* =====================================================================
     rete / sfida: LA SFIDA ASINCRONA, PROVATA SENZA RETE VERA (voce
     #130). Due banchi gia' scritti (data non censita in questo file, mai
     registrati in `tutti.js` — trovato mancante durante il censimento di
     questo cantiere) che provano il CLIENT della modalita' SFIDA (menu
     11 di MANUALE.md): `_q-rete.js` il motore (coda, ritentativi, tetti
     di tempo, trasferimento profilo — 22 controlli), `_q-sfida.js` la
     schermata e il replay (il difensore rigioca il nastro e ottiene lo
     stesso punteggio — 54 controlli).

     PERCHE' NESSUN CONFLITTO CON `senza-rete` (riga sopra, che pretende
     che il GIOCO non faccia richieste in condizioni normali): questi due
     banchi aprono un SERVER FINTO **in memoria, sulla stessa macchina**
     (`http.createServer` locale — verificato leggendo il codice di
     entrambi, mai una richiesta a Internet, la STESSA tecnica di
     `senza-rete.js` per servire il gioco). Provano un client che PARLA
     con un server (quando la modalita' SFIDA e' configurata per farlo),
     non "il gioco non chiama nessuno" — sono due domande diverse sullo
     stesso file, e la seconda non era sorvegliata da nessun cancello.
     Verificato eseguendoli a mano il 21 settembre 2026: **22/22** e
     **54/54**, zero configurazione di rete, zero traffico esterno.

     SE UN GIORNO RICHIEDESSERO RETE VERA (oggi non la richiedono): la
     regola di casa vale anche qui — un banco senza rete deve uscire 3
     (prova nulla), mai un verde bugiardo. Nessuno dei due lo fa oggi
     (entrambi si servono da soli).
     Deterministico (semi dichiarati nel file), niente cronometro di
     produzione: corrono in compagnia. */
  { nome: 'rete',        cmd: ['strumenti/_q-rete.js'],                                conta: true,  lento: false },
  { nome: 'sfida',       cmd: ['strumenti/_q-sfida.js'],                                conta: true,  lento: true  },
  /* =====================================================================
     duello-impronta: LA RETE DI SICUREZZA DEL DUELLO, PROMOSSA (voce
     #131, correzione di revisione, 21 settembre 2026). Il cantiere #131
     ha fatto entrare il duello dal dischetto nel nastro (le tre porte
     avvolte, sopra e in `_q-fuzzer.js`), ma nessun `_t-duello-*` era
     registrato in questa batteria — la convenzione vuole i `_t-*` come
     attrezzi di compito, non cancelli permanenti, ed e' corretto per
     `_t-duello-nastro.js`/`_t-duello-tacca.js`/`_t-duello-porte.js`/
     `_t-duello-contatore.js`/`_t-duello-rigioca.js` (attrezzi legati a
     compiti specifici del cantiere). Ma il commento accanto a `MOTORE_V`
     nel gioco promette «si rimisura con quello strumento il giorno che
     qualcuno tocchi di nuovo il duello» — un'istruzione a memoria SENZA
     cancello dietro, proprio mentre l'onda D sta per rientrare nel
     duello col GIUDICE (voce #133).

     `strumenti/_t-duello-impronta.js` (compito 0, la rete congelata
     PRIMA di toccare qualunque cosa: 44 duelli a seme fisso, in due
     regimi, cursore a cinque decimali) e' l'unico dei sei attrezzi che
     si presta a restare permanente — non dipende dal nastro (misura il
     duello nudo, senza registrare/rigiocare) e non costruisce mutanti a
     ogni corsa. Rinominato (`git mv`) `_q-duello-impronta.js` e
     registrato qui. `_t-duello-rigioca.js` (il gemello che rigioca la
     serie intera via nastro e condanna due mutanti) e' stato VALUTATO e
     NON promosso: costruisce due mutanti via sottoprocesso a ogni corsa
     (fragile — un'ancora di testo spostata per un motivo qualunque lo
     farebbe esplodere, uscita 2, non dare un rosso vero), costa 23s
     contro i 3,1s dell'impronta, e la fedelta' di registrazione/
     riproduzione che dimostra e' gia' coperta in permanenza da questo
     cancello a una frazione del costo. Motivazione estesa in
     `MANUALE.md` §A, voce #131.

     Deterministico (tre semi dichiarati nel file: 20260921/22/23),
     nessun cronometro di produzione: misurato **3,1s**, non lento. */
  { nome: 'duello-impronta', cmd: ['strumenti/_q-duello-impronta.js'],                 conta: true,  lento: false },
  /* =====================================================================
     ment-nastro / carattere-nastro / rosa-scala / nastro-tronco: I CINQUE
     CANALI DELLA VOCE #132, SORVEGLIATI (correzione di revisione, 21
     settembre 2026). Lo stesso rilievo che duello-impronta ha gia' pagato
     per la voce #131: il cantiere #132 ha chiuso cinque canali che
     facevano divergere una rigiocata ONESTA di una sfida (mentalita',
     carattere dal nome, scala della rosa, troncatura muta, l'audio che
     mangiava i sorteggi), ma i quattro attrezzi che li misurano sono
     rimasti `_t-*.js` — attrezzi di compito, non registrati qui. Prima di
     questa correzione, NESSUN cancello della batteria si sarebbe accorto
     di una regressione su nessuno dei cinque.

     Tutti e quattro rinominati (`git mv`) e registrati: nessuno costruisce
     mutanti a ogni corsa, nessuno dipende da un cronometro di produzione,
     e ciascuno misura un canale che gli altri tre non toccano — la stessa
     ragione per cui duello-impronta e' rimasto solo (i gemelli-`_t-*` che
     costruivano mutanti via sottoprocesso NON sono stati promossi, voce
     #131). Misurati una volta a testa, macchina di sviluppo: ~11s, ~11s,
     ~22s, ~11s — sotto la soglia dei 30-40s che qui chiede lento (modello
     `audio.js`), quindi tutti e quattro non lenti. */
  { nome: 'ment-nastro',       cmd: ['strumenti/_q-ment-nastro.js'],                    conta: true,  lento: false },
  { nome: 'carattere-nastro',  cmd: ['strumenti/_q-carattere-nastro.js'],               conta: true,  lento: false },
  { nome: 'rosa-scala',        cmd: ['strumenti/_q-rosa-scala.js'],                     conta: true,  lento: false },
  { nome: 'nastro-tronco',     cmd: ['strumenti/_q-nastro-tronco.js'],                  conta: true,  lento: false },
  /* =====================================================================
     giudice: IL VERIFICATORE DIFFERITO, SORVEGLIATO DAL PRIMO GIORNO
     (voce #133, compito 4). I due cantieri precedenti hanno pagato in
     revisione il rilievo «il cancello nuovo non e' in batteria»: qui si
     registra insieme alla cura, non dopo.

     COSA SORVEGLIA. `giudica(nastro, atteso, opz)` rigioca il nastro di
     una sfida e ne conferma il punteggio con uno di cinque verdetti, e
     UNO SOLO (NON TORNA) puo' muovere punti. E' l'unico posto del gioco
     che puo' TOGLIERE punti a qualcuno: una regressione qui non si
     vedrebbe su nessuno schermo e si pagherebbe in classifica. Il
     cancello gioca due sfide vere a due pagine, le giudica da una TERZA
     che non si e' mai collegata e che ha apposta le impostazioni locali
     sbagliate, e verifica che i cinque verdetti escano DISTINTI: un
     banco che non li distingue attesta invece di misurare.

     PERCHE' NON BASTAVA `sfida`: quello prova la schermata e il giro del
     nastro fra due telefoni, non il verdetto. E nessuno degli altri
     quarantacinque si accorgerebbe se il giudice cominciasse a dire
     sempre TORNA (o, peggio, sempre NON TORNA).
     RETTIFICA A EDIZIONI (22 settembre 2026, voce #138): da oggi uno c'e',
     e si chiama `staffetta` — il suo gruppo B chiede QUATTRO verdetti
     diversi in una corsa sola, quindi un giudice che ne dicesse sempre
     uno lo farebbe cadere. Resta vero che `giudice` e' l'unico a provare
     il CONTRATTO (le rose dal nastro, le sponde forzate, il salvataggio
     che non si muove): `staffetta` prova il giro, non il giudice.

     Misurato su macchina di sviluppo: ~17 s da solo, sotto la soglia dei
     30-40 s che qui chiede lento (modello `audio.js`) — non lento. */
  { nome: 'giudice',           cmd: ['strumenti/_q-giudice.js'],                        conta: true,  lento: false },
  /* =====================================================================
     sigillo: IL VERDETTO ARRIVA FINO ALL'OCCHIO? (voce #134, compito 3).

     COSA SORVEGLIA, e nessuno degli altri lo guarda. `giudice` prova il
     GIUDIZIO — un nastro dentro, una stringa fuori, senza schermo e
     senza server. `sfida` prova la SCHERMATA e il giro del nastro fra
     due telefoni, ma della verifica non sa niente. In mezzo c'e' il
     tubo, e questo cancello e' l'unico che lo percorre intero:

       A) il modulo VERO `rete/api/sfida.js`, caricato con import()
          dinamico e con al posto di `db` un finto che ONORA LA `select`
          come fa PostgREST. E' il punto che rende la prova una misura
          invece di un attestato: un finto che restituisse la riga intera
          direbbe verde anche con la colonna fuori dalla `select` — cioe'
          proprio nel caso che il cancello esiste per trovare. Il freno
          dell'endpoint si misura qui (`sfl:`, 60 al minuto), e non
          altrove.
       B) la RIGA della lista: tre valori di `verificata` devono dare tre
          parole diverse, e NON TORNA deve comparire una volta sola —
          quella dell'accusa vera. Piu' la piega: a 800x360 con cinque
          righe l'azione primaria e la prima riga restano intere sopra il
          bordo (difetto gia' pagato, grep «LE OTTO SQUADRE SOPRA LA
          PIEGA»).
       C) GUARDA: il replay che gia' avviene lascia un verdetto, e il
          verdetto e' quello di `__test.giudica` sullo stesso nastro. Su
          uno schermo diverso dev'essere NON VERIFICABILE e MAI NON
          TORNA: in produzione due telefoni con lo stesso schermo sono
          l'eccezione, e senza quella distinzione la lista darebbe del
          baro a quasi tutti.

     Misurato su macchina di sviluppo: ~13 s da solo, sotto la soglia dei
     30-40 s che qui chiede lento (modello `audio.js`) — non lento. */
  { nome: 'sigillo',           cmd: ['strumenti/_q-sigillo.js'],                        conta: true,  lento: false },
  /* =====================================================================
     carta: LA SFIDA STA IN UN MESSAGGIO, E NON PORTA VIA L'IDENTITA' DI
     NESSUNO (voce #135, compito 4).

     COSA SORVEGLIA, e nessuno degli altri lo guarda. `rete`, `sfida`,
     `giudice` e `sigillo` sorvegliano la sfida ONLINE: il motore, la
     schermata, il verdetto, il tubo che lo porta all'occhio. Tutti e
     quattro presuppongono un server. Questo cancello sorveglia la meta'
     che il server non ce l'ha — un codice da incollare che contiene
     tutta la partita — e lo fa in quattro gruppi:

       A) il CODICE: impacca-e-spacca e' l'identita'; sta sotto i 100
          caratteri (misurato 79: un SMS ne regge 160); il controllo si
          misura in modo ESAUSTIVO sulle due classi che contano — una
          cifra cambiata, due scambiate — e non a occhio; i rifiuti
          dicono la causa vera e un codice sporcato da spazi, a capo,
          minuscole e trattini passa lo stesso.
       B) DENTRO NON C'E' NESSUNO, ed e' il gruppo che questo cantiere
          esiste per avere. Rete.codiceTrasferimento() produce
          id.segreto.controllo e chi lo incolla DIVENTA quella squadra:
          il codice della sfida non deve contenere NIENTE che dipenda da
          chi lo scrive. La prova che discrimina non e' la ricerca di
          sottostringhe — un falso che cifrasse il segreto la
          passerebbe, ed e' misurato che la passa — ma il confronto fra
          DUE telefoni con identita' diverse e stessa partita: lo stesso
          codice, carattere per carattere. E al contrario: leggere una
          sfida non cambia l'identita' di chi la riceve.
       C) DUE TELEFONI, LA STESSA PARTITA: sei codici, quattro viste e
          quattro salvataggi diversi fino al fischio finale — punteggio,
          sorteggi, durata, posizioni a ogni campione, titolari con nomi
          e numeri. L'unico nome che puo' cambiare e' quello di un
          rincalzo entrato dalla panchina, e la prova lo pretende.
       D) LA SCHERMATA E LA RETE CHE NON C'E': i tre bersagli di
          `sigillo` B3 inchiodati ai loro pixel (CERCA@220, prima
          riga@329, GUARDA@308), l'ingresso nuovo sopra la piega, e ZERO
          richieste di rete in tutto il giro — creare, giocare,
          incollare, rigiocare — contate come DELTA dopo l'apertura
          della schermata, che una richiesta la fa da sempre.

     Misurato su macchina di sviluppo: ~73 s da solo, sopra la soglia dei
     30-40 s che qui chiede lento (modello `audio.js`) — LENTO. Apre
     diciotto contesti di browser, e quasi tutti giocano una partita
     intera. */
  { nome: 'carta',             cmd: ['strumenti/_q-carta.js'],                          conta: true,  lento: true  },
  /* =====================================================================
     amici: IL RISULTATO TORNA INDIETRO, E LA CLASSIFICA SI COMPILA DA
     SOLA (voce #136, compito 3).

     COSA SORVEGLIA, e nessuno degli altri lo guarda. `carta` sorveglia
     il codice della sfida e la partita che ne esce, e non sa niente di
     un risultato che torna. `rete`, `sfida`, `giudice` e `sigillo`
     guardano la sfida ONLINE, che un server ce l'ha. `salvataggio`
     guarda che il salvataggio regga una ricarica, ma non sa che cosa sia
     un amico. Quattro gruppi:

       A) IL CODICE DI RISPOSTA: ventuno caratteri (tetto 40, e non 100
          come per la sfida, perche' un codice di risposta si detta anche
          al telefono); impacca-e-spacca e' l'identita'; il controllo si
          misura ESAUSTIVAMENTE su CINQUANTA codici e non su uno — un
          corpo di dodici simboli e' corto, e una misura su un codice
          solo e' un aneddoto; e le TRE serrature, perche' i codici che
          si incollano nello stesso campo adesso sono tre e il terzo, il
          cambio telefono, regala la squadra a chi ce l'ha.
       B) DENTRO NON C'E' NESSUNO. Il codice di risposta e' quello che si
          manda a chi ti ha sfidato, cioe' un giorno a un gruppo di venti
          persone. Due telefoni con identita' diverse e lo stesso
          risultato devono dare lo STESSO codice, carattere per
          carattere. La ricerca di sottostringhe da sola non basta, ed e'
          MISURATO che non basta: il falso che fa viaggiare il nome della
          squadra la passa, perche' nell'alfabeto di Crockford la O e'
          uno zero e «DOPOLAVORO» esce scritto «D0P01A».
       C) LA CLASSIFICA SI COMPILA E LE DUE SI SPECCHIANO: il giro intero
          su due telefoni veri — uno gioca con la CPU, l'altro col
          copione del pollice, se no finirebbero pari per costruzione e
          uno specchio di pari non prova niente — piu' il doppione, i tre
          tetti, il disco scritto SUBITO (una ricarica non basta: il
          gioco salva anche mentre la pagina se ne va), l'additivita'
          della chiave nuova misurata fra due riletture, e il punteggio
          proprio che un codice non puo' riscrivere.
       D) LA SCHERMATA E LA RETE CHE NON C'E': i quattro bersagli delle
          voci #134 e #135 inchiodati ai loro pixel (CERCA@220, prima
          riga@329, GUARDA@308, SFIDA DI CARTA@347), la cima del pannello
          RAGGIUNGIBILE — non lo era, ed e' un difetto del gioco spedito
          trovato da questo cantiere — e la rete contata in TRE tacche:
          zero per il giro col server acceso, una per la classifica DI
          rete che chiede da sempre, zero per la classifica a rete spenta
          che mostra i testa a testa lo stesso.

     Misurato su macchina di sviluppo: 17-18 s, sotto la soglia dei 30-40
     s che qui chiede lento. Apre sei contesti di browser e gioca due
     partite intere. */
  { nome: 'amici',             cmd: ['strumenti/_q-amici.js'],                          conta: true,  lento: false },
  /* =====================================================================
     sospetto: L'ABBINAMENTO PER PUNTI E IL SOSPETTO (voce #137).

     E' IL PRIMO CANCELLO DELLA BATTERIA CHE NON APRE IL GIOCO, e va
     detto perche' altrimenti sembra un errore di lista: misura il
     SERVER. Non c'e' niente da aprire — il sospetto non si vede per
     disegno, e un abbinamento piu' giusto si sente giocando, non si
     legge in un pixel. Costa meno di un secondo e non accende Chrome.
     Di conseguenza `--gioco` lo ignora: qualunque file gli si punti
     contro, misura sempre rete/. Il suo `--gioco` si chiama `--rete`, e
     serve ai falsi.

     CHE COSA NESSUN ALTRO CANCELLO VEDE. La logica del server e' provata
     da rete/prove/tutte.js, che pero' e' aritmetica pura (la forza di una
     rosa, l'Elo, la pulizia del testo) e non sta in batteria; _q-rete e
     _q-sfida provano il CLIENT contro un server finto, e del server
     vero non sanno niente. Nessuno dei tre guarda l'accoppiamento, la
     chiusura del database, o che cosa succede quando arriva un verdetto.

       A) LA TAVOLA DEI CINQUE VERDETTI, e l'asserzione centrale si
          scrive CONTANDO: su cinque verdetti UNO SOLO alza il sospetto,
          e si chiama NON TORNA. INCOMPLETO, ALTRO MOTORE e NON FINISCE
          sono «non lo so», e un sospetto che nasce da un «non lo so» e'
          un innocente accusato. Piu' ventidue ingressi storti — il
          nullo, il minuscolo, il verdetto inventato — che devono cadere
          tutti nell'innocenza: il ripiego della tavola non e' l'accusa.
       B) IL SOSPETTO IN UN DATABASE IN MEMORIA: i punti che tornano
          indietro per tutti e due, i contatori che scendono di quel che
          erano saliti, la guardia contro il doppio conteggio, e
          L'INVARIANTE — dopo cento verdetti mescolati, il sospetto di
          ognuno DEVE essere il numero delle sue sfide a meno uno. E'
          quel che rende un'accusa riproducibile: non «il sistema dice»,
          ma «ecco le partite, rigiocatele».
       C) L'ABBINAMENTO, MISURATO prima e dopo nella STESSA corsa: 5000
          ricerche su tre popolazioni simulate. E la prova che conta non
          e' una media, e' IL PEGGIO SERVITO — e' li' che il banco ha
          trovato, al compito 2, che una finestra piu' stretta lasciava
          qualcuno con UN avversario solo.
       D) LE PORTE CHIUSE, e questo gruppo DICE di attestare invece di
          misurare: qui non c'e' un Postgres da interrogare. Ogni tabella
          con RLS e nel revoke, ogni funzione revocata con la firma
          esatta, i freni, i cinque endpoint, e il sospetto che non esce
          da nessuna parte.

     SA FALLIRE: otto falsi (`_crit-sospetto-*`, `_crit-abbinamento-*`),
     ognuno costruito nel caso peggiore, ognuno bocciato dalla sua prova
     e da nessun'altra. */
  { nome: 'sospetto',          cmd: ['strumenti/_q-sospetto.js'],                       conta: true,  lento: false },
  /* =====================================================================
     staffetta: IL VERIFICATORE DIFFERITO GIRA DAVVERO? (voce #138).

     E' L'ULTIMO PEZZO DELL'ONDA D, e il primo cancello che misura il
     GIRO INTERO invece di un capo solo: dal database alla finestra
     giusta, dal giudice alla parola che torna indietro. Fino al 22
     settembre 2026 il verificatore differito era tre capi e nessun
     mezzo — `giudice` provava la capacita' (voce #133), `sigillo` il
     tubo fino all'occhio (#134), `sospetto` l'altro capo nel database
     (#137) — e in mezzo non c'era niente. Tre file del repo lo dicevano
     in chiaro: «manca quello, e non manca altro».

     CHE COSA NESSUN ALTRO CANCELLO VEDE. `giudice` chiama `giudica` a
     mano, su una pagina che il banco ha aperto lui e della misura che
     vuole lui; `sospetto` applica verdetti che il banco si e' scritto da
     se'. Nessuno dei due guarda chi SCEGLIE le righe, chi DECIDE quale
     finestra aprire, chi manda la parola e che cosa succede se muore a
     meta'.

       A) LA FORMA, e la misura letta dal nastro PRIMA di aprire il
          browser — che e' l'ordine obbligato, perche' e' la misura a
          decidere quale browser aprire. Leggerla in Node non puo'
          accusare nessuno: se sbagliasse, `giudica` la ricontrolla e
          risponde INCOMPLETO/schermo-diverso, cioe' un «non lo so».
       B) IL GIRO COMPLETO su sei sfide finte, con QUATTRO verdetti
          diversi in una corsa sola (il quinto, NON FINISCE, in un giro
          a parte con la rigiocata stretta a 300 fotogrammi). Due righe
          si chiudono a 1, due a -1, e DUE RESTANO APERTE: il sospetto
          sale solo su chi ha i NON TORNA, e l'invariante del #137 regge
          dopo il giro.
       C) LA MISURA GIUSTA, e non si prova con la fixture congelata: il
          banco GIOCA una sfida vera a 1024x460 dentro la corsa. Quattro
          righe su sei sono a 915x412, e senza quella riga «apre la
          misura giusta» sarebbe un racconto verde anche su una
          staffetta cieca. E la FINESTRA NEGATA: quando la misura
          chiesta non si ottiene la colpa e' della macchina, non del
          nastro, e quella riga NON deve finire nel taccuino — se no la
          si perde per sempre.
       D) LA RIPARTENZA in quattro modi: la risposta persa, la chiamata
          mai partita, il taccuino cancellato e due staffette che
          pescarono insieme. Nessuna riga persa, nessuna giudicata due
          volte tranne quella interrotta, e lo stato finale sempre
          quello del giro pulito.
       E) IL RITMO E I FRENI. Nessun freno del server tocca questo
          processo — i sei `frenato(...)` stanno negli endpoint, e la
          staffetta non passa da nessun endpoint — quindi si frena da
          se', e il cancello guarda se SI FERMA davvero. E la prova a
          vuoto: giudica, non manda niente, e NON avvelena il taccuino
          (se no il giro vero del giorno dopo salterebbe righe che
          nessuno ha mai mandato a nessuno).
       F) LE PORTE E LA CHIAVE: cinque endpoint, `segna_verdetto` ancora
          revocata, la chiave che non compare nei messaggi di guasto e
          nessuna chiave di servizio nei file tracciati del repo.
       G) IL FILO, contro un server che parla la FORMA di PostgREST: la
          via, i filtri, le intestazioni, i nomi degli argomenti — e il
          PROGRAMMA VERO lanciato come si lancia in esercizio, con le
          due variabili d'ambiente. E' l'unico gruppo che tocca `main()`
          e la riga di comando.

     E DICE I SUOI LIMITI invece di fingerli, come il #137: l'SQL non si
     esegue (non c'e' un Postgres nel repo, e il lato-database del banco
     e' `applica()` di rete/lib/verdetto.js); PostgREST si interroga ma
     e' FINTO (se la funzione cambiasse firma nello schema vero, qui non
     si vedrebbe); il ritmo e' misurato su questa macchina e non su un CI.

     SA FALLIRE: DIECI falsi (`_crit-staffetta-*`), ognuno costruito nel
     caso peggiore. DUE di loro hanno riparato il banco prima di esserne
     bocciati, ed e' la ragione per cui i falsi si costruiscono: `cieca`
     passava C2 (la prova leggeva la chiave del gruppo invece della
     finestra aperta davvero) e `filo` passava G7 (la prova lanciava
     `strumenti/staffetta.js` per percorso fisso, quindi provava sempre
     quella onesta). Due righe che attestavano invece di misurare, in un
     banco scritto per non farlo. E QUATTRO sono nati dalla domanda
     opposta — quale asserzione non ha un giudice? — di cui uno,
     `avvelenata`, ha trovato un difetto VERO: la staffetta scriveva nel
     taccuino anche durante il giro a vuoto, e il giro vero del giorno
     dopo avrebbe saltato righe che nessuno aveva mai mandato a nessuno.
     Non sbagliava niente: dimenticava. */
  { nome: 'staffetta',         cmd: ['strumenti/_q-staffetta.js'],                      conta: true,  lento: true  },
  /* =====================================================================
     finestra: LA FINESTRA CHE CAMBIA A META' PARTITA (voce #139).

     IL CRITICO che la revisione d'insieme dell'onda D ha trovato nella
     giuntura fra due cantieri. Il #133 aveva visto che i tocchi del
     nastro sono in coordinate di SCHERMO e aveva messo la misura nel
     nastro — ma UNA VOLTA SOLA, prima del fischio d'inizio, mentre il
     gestore di 'resize' resta vivo per tutta la partita e ricuoce
     SCALE/OX/OY. Il #137 e il #138 hanno dato al verdetto la forza di
     togliere punti. Risultato misurato: una sfida ONESTA giocata mentre
     compariva la barra dell'URL (915x412 -> 915x352 al fotogramma 1200)
     dichiarava 1-2, il giudice la rigiocava 3-4 e diceva NON TORNA —
     l'unico verdetto che muove punti, che ne toglie a DUE persone, alza
     un sospetto che non decade mai e chiude la riga per sempre.

     E' UN BANCO A BRACCI, e cambia UNA cosa sola: la finestra. Stesso
     seme, stesso copione di dita, stesse rose, dischi calcolati una
     volta sola alla misura di partenza, e le stesse due pause agli
     stessi fotogrammi in tutti e tre i bracci — se una pausa bastasse a
     far divergere una rigiocata lo direbbe il braccio FERMO, che
     dev'essere TORNA. Il TERZO braccio (la finestra che va e TORNA)
     esiste per un falso solo, `estremi`: senza di lui quel falso
     passava con diciotto verdi su venti.

     conta:TRUE. Venti prove in quattro gruppi: il gioco SCRIVE (una riga
     per misura distinta, col tick del cambio, e il resize a raffica non
     ne aggiunge), il giudice SI ASTIENE (schermo-cambiato su tutt'e due
     le finestre, mai NON TORNA), i nastri VECCHI non si rompono (la
     sfida congelata torna 1-2 in 9367 passi, e schermo-diverso e
     schermo-ignoto dicono le parole di sempre), e la FORMA (cinque
     verdetti, e la frase che l'occhio legge nomina le due misure invece
     di dare la colpa alla rosa cresciuta di un altro).

     SA DIRE «NON HO MISURATO»: esce 3 se il gioco indicato non ha la
     schermata della sfida o `window.__test.giudica`, o se una delle tre
     sfide non arriva al fischio finale; 2 se il browser non parte.
     DICE QUEL CHE NON MISURA: i nastri di `__test.registra()` (che non
     portano la prima riga di tipo 10, la scrive Sfida.gioca), la
     finestra che cambia durante un REPLAY (in rilettura il registro non
     scrive), e il verticale, che resta affare di checkOrientation.
     SA FALLIRE: CINQUE falsi (`_crit-finestra-*`), ognuno con la lista
     MISURATA di quel che morde — 10, 7, 6, 3 e 1 prova su venti.
     Deterministico (passo fisso, seme dal server finto azzerato fra un
     braccio e l'altro), ma gioca TRE sfide intere piu' il braccio della
     raffica: misurato **58 s** in compagnia, cioe' sopra la soglia dei
     30-40 s che qui chiede lento (modello `audio.js`) — `lento:true`. */
  { nome: 'finestra',          cmd: ['strumenti/_q-finestra.js'],                       conta: true,  lento: true  },
  /* =====================================================================
     schermi: LO STESSO NASTRO, SEI SCHERMI (voce #144) — il cancello che
     chiude il canale dei PIXEL, cioe' il seguito piu' grosso del
     progetto (#133) e il prezzo dichiarato del #139 in una volta sola.

     MISURA quel che nessun altro cancello misura: lo stesso nastro
     giudicato a 800x360, 844x390, 915x412 e 1280x720, piu' un braccio
     col POLLICE al massimo (scala 150%, spazio 140%, mancino) e uno con
     la TACCA di un telefono (env(safe-area-inset) 44/59/21/59). Due
     misure per braccio: il verdetto, e il PUNTEGGIO rigiocato con
     l'astensione aggirata — senza il secondo misurerebbe solo la propria
     guardia (lezione del #141 e del #142).
     PRIMA DELLA CURA: 2-3 dichiarato, 0-5 a 800x360, 0-1 a 1280x720,
     0-0 col pollice, 0-2 con la tacca — e su quest'ultimo lo schermo e'
     IDENTICO, quindi il giudice non si asteneva: diceva NON TORNA.
     DICE QUEL CHE NON MISURA: il duello (il tipo 6 e' gia' semantico),
     il ritardo del #141, e la riadozione dopo una pausa (residuo
     dichiarato nella spec §7).
     SA FALLIRE: CINQUE falsi (`_crit-schermi-*`), ognuno con la lista
     MISURATA di quel che morde.
     Deterministico (passo fisso, seme dal server finto azzerato), ma
     gioca una sfida intera e la rigioca SEI volte piu' una prova in
     modalita' 2: misurato **49 s in compagnia** e ~180 s da solo, cioe'
     sopra la soglia dei 30-40 s che qui chiede lento — `lento:true`. */
  { nome: 'schermi',           cmd: ['strumenti/_q-schermi.js'],                        conta: true,  lento: true  },
  /* =====================================================================
     glicko: IL RATING NASCOSTO (voce #140) — il punto 13 del programma,
     l'ultimo dell'onda D.

     E' IL SECONDO CANCELLO DELLA BATTERIA CHE NON APRE IL GIOCO, dopo
     `sospetto`, e per una ragione ancora piu' netta: il rating e'
     NASCOSTO per disegno. Se si vedesse in un pixel sarebbe un difetto,
     non una prova. Costa quattro secondi e non accende Chrome. `--gioco`
     lo ignora — qualunque file gli si punti contro misura sempre rete/ —
     e il suo `--gioco` si chiama `--rete`, per i falsi.

     LA DECISIONE CHE MISURA. Il mandato si legge in due modi: il rating
     nascosto ACCANTO ai punti visibili, oppure AL POSTO dell'Elo. Si e'
     fatta la prima, e non per lettura: i punti di CALCETTO non sono un
     rating e non possono diventarlo — il difensore perde meta', la serie
     moltiplica fino a 1,3, c'e' un pavimento a 100 — e misurato su 400
     allenatori e 18.546 sfide derivano del +1,6% in sessanta giorni.
     Sono una VALUTA che premia il giocare; il rating e' una MISURA.
     D9 tiene ferma quella decisione: se qualcuno cancellasse `elo()`
     per «semplificare», la classifica di tutti cambierebbe forma in una
     notte e quella riga diventerebbe rossa.

     CHE COSA NESSUN ALTRO CANCELLO VEDE. `sospetto` misura la finestra a
     DUE coordinate e la tavola dei verdetti, e non sa che cosa sia un
     rating. `rete/prove/tutte.js` prova l'Elo, che e' l'altra scala, e
     non sta in batteria. `rete` e `sfida` provano il CLIENT contro un
     server finto. Nessuno guarda i tre numeri nascosti, nessuno guarda
     se la terza coordinata abbina meglio, e nessuno aveva mai
     confrontato la nostra matematica con un'implementazione di
     riferimento.

       A) L'ESEMPIO LAVORATO DI GLICKMAN, numero per numero — il
          cancello che il mandato chiede per nome (milestone M9:
          «Glicko-2 verified against a reference implementation»). Dieci
          valori, dai g(phi) a r' e RD'. E dove i nostri non coincidono
          col paper — v e Delta — la prova NON allarga la tolleranza:
          rifa' il conto con i g e gli E STAMPATI e ritrova 1,7785 e
          -0,4834, cioe' dimostra che lo scarto e' l'arrotondamento del
          paper. Un'implementazione sbagliata non cadrebbe su tutti e due.
       B) LE PROPRIETA' che l'esempio non esercita: la certezza che cala
          giocando e ricresce stando fermi, il tetto e il pavimento
          (provato dove MORDE, con duecento partite in un periodo solo —
          a una partita per volta non morde mai), la volatilita' che si
          muove nei due versi, e la cosa che l'Elo non sa fare: battere
          un forte CERTO vale piu' che battere un forte INCERTO.
       C) L'ABBINAMENTO, e la grandezza non e' lo scarto di punti —
          sarebbe giudicare un metro con se' stesso — ma lo scarto di
          ABILITA' LATENTE, che ne' i punti ne' il rating conoscono.
          Prima e dopo nella stessa corsa, tre popolazioni, e IL PEGGIO
          SERVITO, che e' dove il #137 aveva trovato il suo difetto e
          dove questo cantiere ha trovato i suoi due.
       D) LE PORTE DEL SERVER, e questo gruppo DICE di attestare invece
          di misurare: qui non c'e' un Postgres. Colonne, RLS, revoke
          con la firma esatta, il drop della firma vecchia, il predicato
          SQL accanto al JavaScript, e il rating che non esce da nessuna
          tupla ne' endpoint.
       E) IL PERIODO E LA CONCORRENZA: il giorno nuovo che NON azzera,
          due sfide nello stesso istante contro lo stesso difensore
          senza che nessuna si perda, la resa dopo tre tentativi che non
          rompe la sfida, il fantasma che non muove il rating, e la
          divergenza fra aggiornare a partita e a giornate — MISURATA,
          perche' il mandato chiede un periodo di un giorno e noi
          aggiorniamo a ogni sfida.

     PRENDE `--seme`, e non e' un vezzo: con 7/5/3 il pavimento dava
     quattro avversari possibili sulla base da dodici e sembrava a
     posto; su altri due semi ne dava TRE. Un numero misurato su una
     popolazione sola e' un aneddoto.

     SA FALLIRE: SEI falsi (`_crit-glicko-*`), ognuno costruito nel caso
     peggiore, con la bite list misurata su 58 prove — `ferma` 3,
     `cresce` 11 (e passa A9: il rating resta esatto, sbaglia solo la
     certezza), `sorda` 2 e PASSA IL GRUPPO A (nell'esempio del paper la
     differenza fra ricalcolare la volatilita' e lasciarla ferma e' di
     quattro milionesimi), `visibile` 4 e cade SOLO sulla misura perche'
     cambia JavaScript e SQL insieme, `stagione` 1, `fantasma` 1. E
     `stagione` ha trovato un buco: passava tutte e 57 le prove, perche'
     nessuna chiedeva che il rating di ieri sopravvivesse alla notte.
     E4b e' nata da li'. */
  { nome: 'glicko',            cmd: ['strumenti/_q-glicko.js'],                         conta: true,  lento: false },
  /* =====================================================================
     tocco: IL DITO ARRIVA DOVE VEDE? — il punto cieco che il 28 agosto
     2026 e' costato DUE difetti in un giorno solo, e nessuno dei quindici
     cancelli in lista ne ha visto uno.

       · in PAUSA la quarta voce faceva finire ABBANDONA col centro a
         y=433 su uno schermo alto 412: dalla partita non si usciva piu';
       · in AMICHEVOLE la riga CAMPO stava sotto la barra dei bottoni —
         centro a y=341 su 412, cioe' SULLO SCHERMO, ma il colpo lo
         prendeva la fascia adesiva. Sul telefono si leggeva «CA...».

     collaudo.js apre le schermate e conta i nodi, istantanea.js le
     fotografa e giudica la luce: nessuno dei due CHIEDE AL DOM dove
     finiscono i bersagli. Una schermata puo' essere verde 36 su 36, bella
     in fotografia, e non lasciarsi usare.
     Alla sua prima corsa questo cancello ha trovato, da solo, un terzo
     difetto che nessuno cercava: sotto i 640 px di larghezza in
     orizzontale la voce NEGOZIO della home usciva dallo schermo su una
     pagina che non scorre — irraggiungibile, non «da scorrere».

     conta:TRUE, e puo' contare per le due ragioni di casa.
     SA DIRE «NON HO MISURATO»: esce 3 se il gioco indicato non esiste o
     se una schermata non si apre, 2 se playwright manca o il browser non
     parte; e le due scene di partita in verticale le dichiara NON
     PERTINENTI invece di bocciarle (li' il gioco chiede di ruotare
     apposta, ed e' una decisione sua, non un difetto).
     SA FALLIRE: `--guasto` incolla una lastra trasparente sopra le tre
     voci dello SPOGLIATOIO — una schermata verde su tutte le taglie, non
     quella malata, se no il controllo negativo non dimostrerebbe niente
     — e il 28 agosto 2026 l'ha vista rossa con 9 guai.
     Deterministico, niente cronometro, niente sorteggi: corre in
     compagnia. Costa un paio di minuti sulle sette taglie della corsa
     breve; le tre dei tablet stanno dietro --tutte. */
  { nome: 'tocco',       cmd: ['strumenti/tocco.js'],                                    conta: true,  lento: false },
  /* audio: il punto cieco piu' grosso del censimento del 20 agosto
     (§3.8.1: «se ogni calcio diventasse muto, la batteria uscirebbe
     verde 13 su 13»). CONTA, e conta subito, perche' 25 dei suoi 28
     controlli sono verdi oggi e sanno uscire rossi (controllo negativo a
     quattro sabotaggi, `node strumenti/audio.js --controllo-negativo`,
     che li ha visti rossi tutti e quattro il 20 agosto).
     LA DEROGA `--nota-aperta nascosto` E' STATA TOLTA IL 26 AGOSTO 2026,
     ed e' il giorno che la riga di ieri aveva gia' scritto. I tre
     controlli della parte 5 — a gioco nascosto l'audio deve tacere —
     erano rossi su un difetto vero, con la toppa gia' scritta e in
     attesa che si liberasse il file. La toppa
     (strumenti/_toppa-audio-sospendi.js) e' applicata, e il cancello da'
     28 su 28 SENZA deroghe sul gioco vero. Da qui in poi chi rimuove la
     sospensione del contesto audio trova il rosso, che e' esattamente
     cio' che la deroga prometteva.
     LA COMPAGNIA GLI FA MALE, ED E' MISURATO (23 ago 2026): due volte
     in un giorno rosso dentro la batteria e verde da solo, sempre con
     lo stesso gioco e lo stesso comando. La frase che stava qui — «non
     e' cronometrico, puo' correre in compagnia» — era falsa: il
     cancello misura PICCHI D'USCITA e finestre di costruzione dei nodi
     («nodi nuovi in 1,6 s»), e sotto carico il tempo di parete di quelle
     finestre si allunga. Un rosso che va e viene e' il cancello
     rumoroso di casa: da oggi corre IN FILA. */
  { nome: 'audio',       cmd: ['strumenti/audio.js'],                                     conta: true, lento: true },
  { nome: 'istantanea',  cmd: ['strumenti/istantanea.js', '--dir', 'istantanee-tutti'], conta: false, lento: false },
  { nome: 'volti',       cmd: ['strumenti/volti.js'],                                   conta: true,  lento: true },
  /* da qui in giu': cronometrici, girano da soli */
  { nome: 'giocata',     cmd: ['strumenti/giocata.js', '--tutte'],                      conta: true,  lento: false, solo: true },
  /* CONTROESEMPIO MISURATO ALLA ROBUSTEZZA DELL'APPAIAMENTO (1 settembre
     2026): in batteria, subito dopo giocata, prestazione ha dichiarato
     +26,9% e +26,3% confrontando due file BYTE-IDENTICI (worktree==HEAD,
     git diff vuoto) — contro una risoluzione dichiarata del 9,1%
     (--prova-uguale, stesso minuto). Da sola, un minuto dopo: 3/3. La
     coda dei Chromium appena chiusi piega un lato dell'appaiamento piu'
     dell'altro. Un suo rosso in batteria si RIMISURA da solo prima di
     crederci; su file identici e' falso per costruzione. */
  { nome: 'prestazione', cmd: ['strumenti/prestazione.js', '--contro', 'HEAD'],         conta: true,  lento: false, solo: true },
  { nome: 'avvio',       cmd: ['strumenti/avvio.js'],                                   conta: false, lento: true,  solo: true },
  /* il cancello vero dell'avvio: sta ULTIMO perche' vuole il telefono tutto
     per se' e perche' spegne e riaccende l'app dodici volte di fila */
  { nome: 'avvio-telefono', cmd: ['strumenti/avvio-telefono.js'],                       conta: true,  lento: true,  solo: true },
];

/* la classe di un'uscita, coi codici di casa. Tutto cio' che non e'
   0/2/3 (compresi i -1 di spawn e i crash) si legge NO: in dubbio, un
   cancello morto e' un rosso da guardare, non un verde da regalare. */
const classe = c => (c === 0 ? 'OK' : c === 2 ? 'BANCO' : c === 3 ? 'NULLA' : 'NO');

/* Le righe che vale la pena riportare: il verdetto finale di ognuno e
   ogni riga che dice NO. Il resto e' rumore in un referto d'insieme. */
function succo(testo) {
  const righe = testo.split(/\r?\n/);
  const no = righe.filter(r => /^\s*(NO|ROSSO)\b/.test(r) || /\bROSSO\b/.test(r)).map(r => r.trim());
  const fin = righe.filter(r => /\b(controlli|misure|confronti|azioni|prove|scene|soglie|misura[a-z]*)\b.*\b(passat|fallit|superat)/i.test(r)).map(r => r.trim());
  const tab = righe.filter(r => /^\s*su \d+\s|^\s*\d+ misure passate/.test(r)).map(r => r.trim());
  return { no, fin, tab };
}

/* LE QUOTE: ogni «passate N su M» che il cancello stampa, in numeri.
   Servono a due cose che un codice d'uscita non sa dire: al REGISTRO
   (un informativo che passa da 46/56 a 45/56 e' peggiorato anche se il
   suo codice non cambia) e al RUMORE (--ripetuto: due corse con quote
   diverse sullo stesso file sono un cancello che balla). */
function quote(testo) {
  const q = [];
  let m;
  const re1 = /(\d+)\s+(?:controlli|misure|confronti|soglie|prove|giocate misurate)\s*,\s*(\d+)\s+passat[ei]/g;
  while ((m = re1.exec(testo))) q.push({ ok: +m[2], su: +m[1] });
  const re2 = /(\d+)\s+misure passate su\s+(\d+)/g;
  while ((m = re2.exec(testo))) q.push({ ok: +m[1], su: +m[2] });
  /* la quota di silhouette («8 azioni su 10 nominabili»): senza questa
     riga il suo numero non entrava ne' nel registro ne' nella tabella
     del rumore, e un cancello sorvegliato solo per classe puo' scendere
     da 10/10 a 8/10 senza che nessuno lo veda */
  const re4 = /(\d+)\s+azioni su\s+(\d+)\s+nominabili/g;
  while ((m = re4.exec(testo))) q.push({ ok: +m[1], su: +m[2] });
  /* la riga «su 8   1/8 8/8 ...» del riepilogo di istantanea: ogni
     colonna e' una promessa (erba, palla, altezza, ombre, prato, sera,
     centro) e va sorvegliata da sola — il totale le mescola */
  const re3 = /^\s*su\s+\d+\s+(.+)$/gm;
  while ((m = re3.exec(testo))) {
    for (const f of (m[1].match(/\d+\/\d+/g) || [])) {
      const [a, b] = f.split('/').map(Number);
      q.push({ ok: a, su: b });
    }
  }
  return q;
}
const quoteTesto = q => (q.length ? q.map(x => x.ok + '/' + x.su).join(' ') : '-');

function esegui(c) {
  return new Promise(ok => {
    const t0 = Date.now();
    /* --gioco viaggia con ogni figlio: e' l'unico argomento che la
       batteria aggiunge, cosi' tutti misurano lo STESSO file */
    const cmd = GIOCO_ESTERNO ? [...c.cmd, '--gioco', GIOCO_ESTERNO] : c.cmd;
    const p = spawn(process.execPath, cmd, { cwd: RADICE, windowsHide: true });
    let out = '';
    p.stdout.on('data', d => { out += d; });
    p.stderr.on('data', d => { out += d; });
    p.on('error', e => ok({ ...c, codice: -1, out: String(e), sec: (Date.now() - t0) / 1000 }));
    p.on('close', codice => ok({ ...c, codice, out, sec: (Date.now() - t0) / 1000 }));
  });
}

/* Una coda con un tetto: il banco ha un numero finito di nuclei, e
   lanciare tredici Chrome insieme li fa litigare invece che correre. */
async function aCoda(lista, insieme) {
  const esiti = [];
  let i = 0;
  const operai = Array.from({ length: Math.min(insieme, lista.length) }, async () => {
    while (i < lista.length) {
      const mio = lista[i++];
      process.stderr.write('  ... ' + mio.nome + '\n');
      esiti.push(await esegui(mio));
    }
  });
  await Promise.all(operai);
  return esiti;
}

/* IL REGISTRO dell'ultima corsa buona. Si scrive SOLO con --registra:
   se si aggiornasse da solo a ogni corsa, un peggioramento verrebbe
   segnalato una volta e poi assorbito in silenzio — che e' esattamente
   la malattia che il registro cura. Cosi' invece il confronto resta
   acceso finche' un umano non dichiara «questa corsa e' il nuovo
   riferimento». Dentro c'e' l'impronta del file su cui fu preso: un
   confronto fra due versioni diverse del gioco e' LEGITTIMO (e' il suo
   scopo: vedere cosa un'onda ha rotto), ma va detto in chiaro. */
const REGISTRO = path.join(__dirname, 'ultima-corsa.json');
function leggiRegistro() {
  try { return JSON.parse(fs.readFileSync(REGISTRO, 'utf8')); } catch (e) { return null; }
}
function scriviRegistro(corsa) {
  const cancelli = {};
  /* UNA PROVA NULLA NON LASCIA NUMERI NEL REGISTRO. E' la regola 15:
     quando un cancello esce 3 dichiara da solo che il suo totale non va
     letto (istantanea: «il banco non ha otto campioni»), e un numero che
     non va letto non puo' nemmeno fare da riferimento — il rapporto lo
     stampava gia' («non va nemmeno registrato») ma il codice lo
     registrava lo stesso, visto il 20 agosto. Si registra la CLASSE
     (che NULLA era, e un NULLA che diventa NO si vede), non le quote. */
  for (const e of corsa.esiti) {
    const cl = classe(e.codice);
    cancelli[e.nome] = { codice: e.codice, classe: cl, quote: cl === 'NULLA' ? [] : quote(e.out) };
    if (cl === 'NULLA') cancelli[e.nome].nullo = 'prova nulla: il suo totale non valeva, e non fa da riferimento';
  }
  fs.writeFileSync(REGISTRO, JSON.stringify({
    quando: new Date().toISOString(),
    file: corsa.prima,
    nota: 'scritto da tutti.js --registra: il riferimento con cui si confrontano gli informativi',
    cancelli,
  }, null, 1));
}

/* il confronto di un esito col registro: torna null se non c'e' termine
   di paragone, altrimenti { peggio, meglio, testo }. «Peggio» = il codice
   passa a una classe peggiore, oppure una quota confrontabile cala.
   Quote di forma diversa (il cancello e' cambiato) = non confrontabili,
   e si dice, invece di fingere un confronto. */
function confrontaCol(registro, e) {
  if (!registro || !registro.cancelli || !registro.cancelli[e.nome]) return null;
  const rif = registro.cancelli[e.nome];
  const oraQ = quote(e.out), oraC = classe(e.codice);
  const dettagli = [];
  let peggio = false, meglio = false;
  const ordine = { OK: 0, NULLA: 1, BANCO: 1, NO: 2 };
  if (ordine[oraC] > ordine[rif.classe]) { peggio = true; dettagli.push('uscita ' + rif.classe + ' -> ' + oraC); }
  if (ordine[oraC] < ordine[rif.classe]) { meglio = true; dettagli.push('uscita ' + rif.classe + ' -> ' + oraC); }
  const rifQ = rif.quote || [];
  if (rif.nullo && oraQ.length) {
    /* il riferimento fu una prova nulla: la classe si confronta (sopra),
       le quote no, perche' di la' non ce n'erano di valide */
    dettagli.push('il riferimento era una prova nulla: nessuna quota da confrontare');
  } else if (rifQ.length === oraQ.length && rifQ.every((r, i) => r.su === oraQ[i].su)) {
    for (let i = 0; i < rifQ.length; i++) {
      if (oraQ[i].ok < rifQ[i].ok) { peggio = true; dettagli.push(rifQ[i].ok + '/' + rifQ[i].su + ' -> ' + oraQ[i].ok + '/' + oraQ[i].su); }
      if (oraQ[i].ok > rifQ[i].ok) { meglio = true; dettagli.push(rifQ[i].ok + '/' + rifQ[i].su + ' -> ' + oraQ[i].ok + '/' + oraQ[i].su + ' (meglio)'); }
    }
  } else if (rifQ.length || oraQ.length) {
    dettagli.push('quote non confrontabili (il cancello e\' cambiato: ' + quoteTesto(rifQ) + ' contro ' + quoteTesto(oraQ) + ')');
  }
  return { peggio, meglio, testo: dettagli.join(', ') };
}

/* ============================== UNA CORSA ============================== */
async function unaCorsa(lista, insieme, indice, totale) {
  const inCompagnia = lista.filter(c => !c.solo);
  const daSoli = lista.filter(c => c.solo);

  const prima = impronta(GIOCO);
  const t0 = Date.now();
  console.log('\nBATTERIA' + (totale > 1 ? ' — corsa ' + indice + ' di ' + totale : '') +
    ' — ' + inCompagnia.length + ' cancelli ' + insieme + ' alla volta' +
    (daSoli.length ? ', poi ' + daSoli.length + ' cronometrici da soli (' + daSoli.map(c => c.nome).join(', ') + ')' : '') +
    ', sul file ' + prima + (GIOCO_ESTERNO ? '\n  (fuori repo: ' + GIOCO_ESTERNO + ')' : '') + '\n');

  const esiti = await aCoda(inCompagnia, insieme);
  /* i cronometrici solo adesso, a campo libero: vedi il commento su "solo".
     E prima di eseguirli si guarda quanto e' occupato il banco, perche' e'
     l'unica cosa che puo' farli mentire. */
  let banco = null;
  if (daSoli.length) {
    /* PRIMA SI ASPETTA CHE IL BANCO SI RAFFREDDI, e questa riga e' nata da
       un errore di questo strumento. La prima versione misurava il carico
       UNA volta e tirava dritto: i Chrome della fase in compagnia stavano
       ancora morendo, il campione e' caduto in una tregua, la guardia non
       e' scattata, e avvio.js ha dichiarato 10.427 ms contro un cancello
       di 2.000. Un solo campione non descrive un banco che si sta
       spegnendo: si guarda finche' non sta fermo. */
    const FINO_A = 60000, t = Date.now();
    for (;;) {
      banco = carico();
      if (banco.volte <= 1.25 || Date.now() - t > FINO_A) break;
      process.stderr.write('  ... banco a ' + banco.volte.toFixed(1) + 'x, aspetto che si liberi\n');
    }
    if (banco.volte > 1.5) {
      console.log('\n  ATTENZIONE: il banco e\' occupato ' + banco.volte.toFixed(1) + ' volte piu\' del suo minimo');
      console.log('  (' + banco.ms.toFixed(0) + ' ms contro ' + banco.base.toFixed(0) + ' sul banco piu\' libero mai visto).');
      console.log('  I cancelli cronometrici — ' + daSoli.map(c => c.nome).join(', ') + ' — misurano un tempo,');
      console.log('  quindi qui possono bocciare per contesa invece che per difetto. Il loro');
      console.log('  verdetto va preso come un sospetto, non come una condanna: rifallo a banco libero.\n');
    }
    esiti.push(...await aCoda(daSoli, 1));
  }
  const sec = (Date.now() - t0) / 1000;
  const dopo = impronta(GIOCO);

  esiti.sort((a, b) => CANCELLI.findIndex(c => c.nome === a.nome) - CANCELLI.findIndex(c => c.nome === b.nome));

  console.log('');
  for (const e of esiti) {
    const s = succo(e.out);
    const cl = classe(e.codice);
    const segno = { OK: 'OK ', NO: 'NO ', BANCO: '?? ', NULLA: '?? ' }[cl];
    const peso = e.conta ? '' : '  (informativo)';
    console.log(segno + ' ' + e.nome.padEnd(12) + ' ' + String(Math.round(e.sec)).padStart(4) + 's' + peso);
    /* un 2 o un 3 vanno SPIEGATI sul posto: sono la differenza fra
       «rosso» e «non misurato», e chi legge di fretta la perde */
    if (cl === 'BANCO') console.log('       [uscita 2: il banco del cancello e\' esploso o si dichiara cieco — NON e\' un rosso del gioco]');
    if (cl === 'NULLA') console.log('       [uscita 3: la prova e\' nulla — il cancello dichiara che il suo totale NON VA LETTO]');
    for (const r of s.fin) console.log('       ' + r);
    for (const r of s.tab) console.log('       ' + r);
    for (const r of s.no.slice(0, 8)) console.log('       ' + r);
    if (s.no.length > 8) console.log('       ... e altre ' + (s.no.length - 8) + ' righe NO');
    if (e.codice !== 0 && !s.fin.length && !s.no.length) console.log('       uscito a ' + e.codice + '; ultime righe:\n       ' + e.out.trim().split(/\r?\n/).slice(-4).join('\n       '));
  }

  const somma = esiti.reduce((a, e) => a + e.sec, 0);
  console.log('\n  ' + esiti.length + ' cancelli eseguiti in ' + sec.toFixed(0) + ' s di orologio (' + somma.toFixed(0) + ' s se in fila: ' + (somma / Math.max(sec, 0.001)).toFixed(1) + ' volte piu\' veloce)');

  return { esiti, sec, prima, dopo, banco };
}

/* ======================= IL RAPPORTO DEGLI INFORMATIVI =================
   Si stampa SOPRA il verdetto, sempre: un verde che tace i cancelli che
   non contano e' il verde bugiardo del 20 agosto. Torna la lista dei
   peggiorati rispetto al registro (vuota se registro assente). */
function rapportoInformativi(corsa, registro, saltati) {
  const informativi = CANCELLI.filter(c => !c.conta);
  if (!informativi.length) return [];
  console.log('\n  I CANCELLI CHE NON CONTANO, e come sono andati (si stampano qui');
  console.log('  perche\' un verde che li tace e\' un verde bugiardo):');
  const peggiorati = [];
  for (const c of informativi) {
    const e = corsa.esiti.find(x => x.nome === c.nome);
    if (!e) {
      const perche = saltati.some(s => s.nome === c.nome) ? 'non eseguito in questa corsa' : 'non in lista';
      console.log('    ' + c.nome.padEnd(12) + ' —      (' + perche + ')');
      continue;
    }
    const cl = classe(e.codice);
    const q = quoteTesto(quote(e.out));
    let riga = '    ' + c.nome.padEnd(12) + ' ' + cl.padEnd(5) + ' ' + q;
    const cfr = confrontaCol(registro, e);
    if (cfr && cfr.peggio) { peggiorati.push({ nome: c.nome, testo: cfr.testo }); riga += '   PEGGIORATO rispetto al registro: ' + cfr.testo; }
    else if (cfr && cfr.meglio) riga += '   (migliorato: ' + cfr.testo + ')';
    /* se il confronto ha qualcosa da dire (per esempio: il riferimento fu
       una prova nulla e le quote non si confrontano) lo si stampa, invece
       del comodo «uguale al registro» che direbbe piu' di quanto misurato */
    else if (cfr) riga += '   (' + (cfr.testo || 'uguale al registro') + ')';
    console.log(riga);
    if (cl === 'NULLA') console.log('    ' + ' '.repeat(12) + ' ^ si dichiara NON VALIDO: il suo totale non va letto, e non va nemmeno registrato');
  }
  if (!registro) {
    console.log('    (nessuna corsa registrata: il confronto non si puo\' fare — dopo una corsa');
    console.log('     giudicata buona, fissala con: node strumenti/tutti.js --registra)');
  } else {
    console.log('    (registro del ' + registro.quando.slice(0, 10) + ', file ' + registro.file + (registro.file !== corsa.prima ? ' — DIVERSO da quello di oggi: il confronto dice cosa e\' cambiato da allora' : '') + ')');
  }
  return peggiorati;
}

/* ============================== IL CORPO ============================== */
(async () => {
  const tutto = process.argv.includes('--tutto');
  const lento = process.argv.includes('--lento');
  const registra = process.argv.includes('--registra');
  const insieme = lento ? 1 : +arg('insieme', 4);
  const solo = arg('solo', null);
  const ripetuto = Math.max(1, +arg('ripetuto', 1) | 0);

  let lista = CANCELLI.filter(c => tutto || !c.lento);
  if (solo) {
    const voluti = solo.split(',').map(s => s.trim());
    lista = CANCELLI.filter(c => voluti.includes(c.nome));
    const ignoti = voluti.filter(v => !CANCELLI.some(c => c.nome === v));
    if (ignoti.length) { console.error('cancelli sconosciuti: ' + ignoti.join(', ')); process.exit(2); }
  }
  const saltati = CANCELLI.filter(c => !lista.includes(c));
  const registro = leggiRegistro();

  /* ------------------------------- le corse ------------------------------ */
  const corse = [];
  for (let g = 1; g <= ripetuto; g++) corse.push(await unaCorsa(lista, insieme, g, ripetuto));
  const ultima = corse[corse.length - 1];

  if (saltati.length) console.log('  NON eseguiti: ' + saltati.map(c => c.nome).join(', ') + (tutto ? '' : '  (--tutto per averli)'));

  /* ------------------- il bersaglio si e' mosso? ------------------- */
  /* in due modi: DENTRO una corsa (prima != dopo), o FRA due corse di una
     ripetizione (la corsa k ha visto un file diverso dalla prima) */
  let mosso = corse.find(c => c.dopo !== c.prima);
  if (!mosso && corse.length > 1) {
    const k = corse.find(c => c.prima !== corse[0].prima);
    if (k) mosso = { prima: corse[0].prima, dopo: k.prima };
  }
  if (mosso) {
    console.log('\n  REFERTO NULLO: il file e\' cambiato durante la misura (' + mosso.prima + ' -> ' + mosso.dopo + ').');
    console.log('  Qualcuno sta scrivendo sul gioco mentre lo si misura: i numeri qui sopra');
    console.log('  descrivono file diversi mescolati. Aspetta che il lavoro finisca e rifai');
    console.log('  la batteria. Nessun verdetto viene dato, e niente viene registrato.');
    process.exit(3);
  }

  /* --------------- il rumore, se le corse sono piu' di una --------------- */
  let rumorosi = [];
  if (ripetuto > 1) {
    console.log('\n=== RUMORE SU ' + ripetuto + ' CORSE, stesso file ' + ultima.prima + ' ===');
    console.log('  Un cancello che diverge fra corse identiche e\' RUMOROSO: il suo rosso');
    console.log('  vale come sospetto, non come bocciatura — e il suo verde come speranza.');
    console.log('  cancello       ' + corse.map((_, i) => ('corsa ' + (i + 1)).padEnd(16)).join('') + 'giudizio');
    for (const c of lista) {
      const righe = corse.map(k => {
        const e = k.esiti.find(x => x.nome === c.nome);
        return e ? { cl: classe(e.codice), q: quoteTesto(quote(e.out)) } : { cl: '-', q: '' };
      });
      const firma = r => r.cl + ' ' + r.q;
      const diverge = righe.some(r => firma(r) !== firma(righe[0]));
      if (diverge) rumorosi.push({ nome: c.nome, righe });
      console.log('  ' + c.nome.padEnd(14) + righe.map(r => firma(r).slice(0, 15).padEnd(16)).join('') + (diverge ? 'RUMOROSO' : 'stabile'));
    }
    /* la tabella tronca le quote lunghe (istantanea ne ha otto): per i
       rumorosi il dettaglio si stampa per esteso, perche' e' il numero
       che balla a dire DOVE il cancello e' malato */
    for (const r of rumorosi) {
      console.log('\n  ' + r.nome + ', per esteso:');
      r.righe.forEach((x, i) => console.log('    corsa ' + (i + 1) + ':  ' + x.cl + '  ' + (x.q || '-')));
    }
    rumorosi = rumorosi.map(r => r.nome);
    console.log(rumorosi.length
      ? '\n  RUMOROSI OGGI: ' + rumorosi.join(', ') + ' — o si stabilizzano o la loro dispersione va dichiarata accanto a ogni loro numero.'
      : '\n  nessun cancello diverge su ' + ripetuto + ' corse: oggi la batteria e\' stabile.');
  }

  /* --------------------------- gli informativi --------------------------- */
  const peggiorati = rapportoInformativi(ultima, registro, saltati);

  /* ------------------------------ il verdetto ---------------------------- */
  /* sui contati: un NO stabile boccia; un NO che nelle altre corse era OK
     e' un sospetto; un 2/3 non e' un rosso ma vieta il verde pieno. */
  const contati = ultima.esiti.filter(e => e.conta);
  const nomeRosso = e => classe(e.codice) === 'NO';
  const rossiStabili = contati.filter(e => nomeRosso(e) && !rumorosi.includes(e.nome));
  const rossiRumorosi = contati.filter(e => nomeRosso(e) && rumorosi.includes(e.nome));
  const nonMisurati = contati.filter(e => classe(e.codice) === 'BANCO' || classe(e.codice) === 'NULLA');
  const banco = ultima.banco;

  if (registra) {
    /* si registra l'ULTIMA corsa, e lo si dice: con --ripetuto le quote
       potrebbero differire fra corse, ed e' il rumore qui sopra a dirlo */
    scriviRegistro(ultima);
    console.log('\n  REGISTRATO: questa corsa (file ' + ultima.prima + ') e\' il nuovo riferimento degli informativi.');
  }

  if (rossiStabili.length || rossiRumorosi.length) {
    const cronoRossi = [...rossiStabili, ...rossiRumorosi].filter(e => e.solo);
    console.log('\n  ROSSO: ' + [...rossiStabili, ...rossiRumorosi].map(e => e.nome).join(', '));
    if (rossiRumorosi.length) console.log('  ma ' + rossiRumorosi.map(e => e.nome).join(' e ') + ' ' + (rossiRumorosi.length > 1 ? 'sono RUMOROSI' : 'e\' RUMOROSO') + ' su questo stesso file: sospetto, non condanna.');
    if (cronoRossi.length && banco && banco.volte > 1.5) {
      console.log('  e ' + cronoRossi.map(e => e.nome).join(' e ') + ' misura' + (cronoRossi.length > 1 ? 'no' : '') + ' un tempo su un banco occupato ' + banco.volte.toFixed(1) + 'x: sospetto, non condanna.');
    }
    /* se TUTTI i rossi sono sospetti (rumorosi), bocciare sarebbe il
       cancello rumoroso che insegna a ignorarsi: si esce 0 ma il verde
       pieno non viene dato, e il sospetto resta scritto qui sopra. */
    process.exit(rossiStabili.length ? 1 : 0);
  }

  if (nonMisurati.length) {
    console.log('\n  NON MISURATO: ' + nonMisurati.map(e => e.nome + ' (uscita ' + e.codice + ')').join(', ') + '.');
    console.log('  Nessun cancello che conta e\' rosso, ma questi non hanno potuto misurare:');
    console.log('  il verdetto NON e\' un verde. Prova nulla (uscita 3).');
    process.exit(3);
  }

  if (peggiorati.length) {
    /* IL SECONDO VERDETTO, quello per cui questa riscrittura esiste:
       verde per i cancelli che contano, MA il peggioramento di un
       informativo non e' piu' silenzio. L'uscita resta 0 (un informativo
       rumoroso che bocciasse la batteria verrebbe disattivato in una
       settimana — e' la storia di ogni cancello rumoroso di questa casa);
       il silenzio invece e' finito: la parola VERDE da sola qui non
       compare, e il confronto resta acceso finche' un umano non registra
       una nuova corsa di riferimento. */
    console.log('\n  VERDE CON RISERVA: tutti i ' + contati.length + ' cancelli che contano sono passati, MA ' +
      peggiorati.length + ' informativ' + (peggiorati.length > 1 ? 'i sono peggiorati' : 'o e\' peggiorato') +
      ' rispetto all\'ultima corsa registrata:');
    for (const p of peggiorati) console.log('    ' + p.nome + ': ' + p.testo);
    console.log('  Se il peggioramento e\' accettato, va registrato in chiaro: --registra.');
    process.exit(0);
  }

  console.log('\n  VERDE: tutti i ' + contati.length + ' cancelli che contano sono passati, sul file ' + ultima.prima +
    (registro ? '\n  e nessun informativo e\' peggiorato rispetto alla corsa registrata del ' + registro.quando.slice(0, 10) + '.' : ''));
  process.exit(0);
})();
