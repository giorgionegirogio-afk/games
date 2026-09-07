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
