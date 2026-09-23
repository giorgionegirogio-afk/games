-- =====================================================================
-- CALCETTO — lo schema del database (Supabase / Postgres)
--
-- SI ESEGUE UNA VOLTA, dall'editor SQL di Supabase. E' idempotente: si
-- puo' rieseguire senza rompere niente.
--
-- IL PRINCIPIO. Il client NON parla mai con questo database: parla con le
-- funzioni Vercel, che hanno la chiave di servizio. Quindi qui dentro RLS
-- e' acceso su tutto e NON esiste una sola regola che permetta qualcosa
-- al ruolo anonimo. Se un giorno qualcuno trovasse la chiave anonima, non
-- vedrebbe una riga. Questa e' la differenza fra "difeso dalle regole" e
-- "non raggiungibile".
--
-- ZERO DATI PERSONALI. Non c'e' una colonna per l'email, per il nome
-- vero, per il telefono, per la posizione. C'e' un identificatore
-- casuale e un nome di squadra scelto dal giocatore. E' una scelta di
-- prodotto, non una dimenticanza: e' cio' che tiene l'APK a zero
-- permessi Android.
-- =====================================================================

-- ---------------------------------------------------------------------
-- L'ALLENATORE — l'identita' anonima.
--
-- `segreto` NON e' il segreto: e' il suo digest sha-256. Il segreto vero
-- sta solo sul telefono. Se il telefono si perde, l'identita' si perde:
-- e' il prezzo di non chiedere un'email, ed e' un prezzo che diciamo in
-- chiaro nel gioco, accanto al codice di trasferimento.
-- ---------------------------------------------------------------------
create table if not exists allenatore (
  id           uuid primary key default gen_random_uuid(),
  segreto      text        not null,
  creato       timestamptz not null default now(),
  visto        timestamptz not null default now(),
  -- il paese si ricava dall'intestazione della richiesta e serve solo alla
  -- classifica per nazione. Due lettere, niente di piu' fine: non e' un
  -- dato di posizione.
  paese        char(2),
  -- una bandierina per chi imbroglia: la alza il verificatore differito
  sospetto     int         not null default 0,
  bandito      boolean     not null default false
);
create index if not exists allenatore_visto on allenatore (visto desc);

-- ---------------------------------------------------------------------
-- LA SQUADRA — il profilo pubblico, cioe' quel che un avversario scarica
-- per giocarti contro mentre tu dormi.
--
-- `rosa` e' l'elenco dei giocatori nel formato del gioco (nome, ruolo, i
-- valori). `indole` e' il profilo tattico che la CPU usera' per muoverli:
-- e' la cosa che fa sembrare la sfida "contro di te" e non "contro una
-- squadra a caso con il tuo nome sopra".
--
-- `forza` e' denormalizzata apposta: l'accoppiamento la interroga
-- migliaia di volte e ricalcolarla dalla rosa a ogni richiesta sarebbe
-- una scansione inutile.
-- ---------------------------------------------------------------------
create table if not exists squadra (
  allenatore   uuid primary key references allenatore(id) on delete cascade,
  nome         text        not null check (char_length(nome) between 2 and 18),
  colori       jsonb       not null,
  rosa         jsonb       not null,
  modulo       text        not null default '4-4-2',
  indole       jsonb       not null default '{}'::jsonb,
  forza        int         not null default 50 check (forza between 1 and 99),
  aggiornata   timestamptz not null default now()
);
create index if not exists squadra_forza on squadra (forza);

-- ---------------------------------------------------------------------
-- LA CLASSIFICA — i punti, tenuti a parte dal profilo perche' cambiano
-- con una frequenza diversa e perche' un ripristino della classifica non
-- deve poter cancellare una rosa.
-- ---------------------------------------------------------------------
create table if not exists punti (
  allenatore   uuid primary key references allenatore(id) on delete cascade,
  punti        int not null default 1000,
  vinte        int not null default 0,
  pari         int not null default 0,
  perse        int not null default 0,
  fatti        int not null default 0,
  subiti       int not null default 0,
  serie        int not null default 0,   -- vittorie di fila, per il moltiplicatore
  stagione     int not null default 1,
  aggiornati   timestamptz not null default now()
);
create index if not exists punti_ordine on punti (stagione, punti desc);

-- ---------------------------------------------------------------------
-- IL RATING NASCOSTO — cinque colonne sulla tabella che c'e' gia'
-- (voce #140, Glicko-2).
--
-- PERCHE' QUI E NON IN UNA TABELLA NUOVA. RLS e' acceso su tutte e sei
-- le tabelle con ZERO policy, e ogni tabella sta nel `revoke` in fondo a
-- questo file: una tabella nuova sarebbe l'unica porta aperta del
-- database, e lo sarebbe IN SILENZIO, perche' nessuno si accorge di una
-- riga che manca. `punti` e' gia' la tabella dei numeri che cambiano a
-- ogni partita.
--
-- PERCHE' NON SOSTITUISCONO `punti`. I punti visibili NON sono un
-- rating: il difensore perde meta' di quel che l'attaccante guadagna, la
-- serie moltiplica fino a 1,3, c'e' un pavimento a 100 e contro un
-- avversario costruito si prende meta' senza toglierlo a nessuno.
-- Ognuna di quelle quattro CREA valore dal nulla, ed e' giusto che lo
-- faccia: i punti sono la valuta che premia il giocare. Misurato su 400
-- allenatori e 18.546 sfide simulate, il totale deriva del +1,6% in
-- sessanta giorni. Un rating invece si conserva. Sono due grandezze, e
-- stanno in due colonne — e' la lettura letterale del mandato
-- (_analisi/MANDATO-STADIUM-ROAR.md righe 163-164: «hidden rating»
-- accanto a «visible trophy ladder»).
--
-- I TRE NUMERI DI GLICKO-2:
--   `nascosto`    il rating vero e proprio. Parte da 1500 e NON SI VEDE:
--                 non esce da `trova_avversario`, non esce da
--                 `classifica`, non esce da nessun endpoint. Stessa
--                 ragione del `sospetto` (voce #137): la tupla
--                 dell'avversario finisce dritta nel corpo della
--                 risposta, cioe' sul telefono di un altro.
--   `incertezza`  la *deviation*. 350 vuol dire «non ne sappiamo
--                 niente»; cala giocando e ricresce stando fermi. E' la
--                 cosa che l'Elo a K variabile non sa fare.
--   `volatilita`  quanto e' ERRATICO quel giocatore. Si muove piano per
--                 disegno (tau = 0,5): misura una tendenza, non l'ultima
--                 serata.
--
-- `periodo` E' IL PERIODO DI RATING DI GLICKO-2 (un giorno, come chiede
-- il mandato alla riga 444) E NON E' UNA STAGIONE. Sta apposta nella
-- stessa tabella di `stagione`, tre righe piu' su, perche' e' qui che
-- qualcuno potrebbe confonderle. Il passaggio da un giorno all'altro
-- **non azzera niente**: il rating resta quello di ieri e a crescere e'
-- soltanto l'incertezza. Il mandato parla anche di `season reset every 4
-- weeks` (riga 163): quello in casa e' ESCLUSO
-- (_analisi/MAPPA-MANDATO.md riga 707, «Niente stagione/azzeramento,
-- mai»), e non e' questa colonna.
--
-- `giri` E' LA GUARDIA. Glicko-2 non si puo' scrivere come un incremento
-- relativo — la formula ha bisogno del valore di partenza — quindi il
-- problema che `muovi_punti` risolve con l'atomicita' qui si risolve con
-- un contatore: si scrive solo se nessun altro e' passato nel frattempo.
-- Vedi `posa_nascosto`, piu' in basso.
--
-- `add column if not exists`: questo file resta idempotente come
-- promette la sua intestazione, e un database gia' in piedi si aggiorna
-- rilanciandolo senza perdere una riga.
-- ---------------------------------------------------------------------
alter table punti add column if not exists nascosto   real not null default 1500;
alter table punti add column if not exists incertezza real not null default 350;
alter table punti add column if not exists volatilita real not null default 0.06;
alter table punti add column if not exists periodo    date not null default current_date;
alter table punti add column if not exists giri       int  not null default 0;

-- ---------------------------------------------------------------------
-- LA SFIDA — una partita giocata contro il profilo di qualcun altro.
--
-- `replay` e' il pezzo che rende tutto questo diverso da un punteggio
-- spedito al server: {seme, taglia, righe di comando}. Sta in pochi kB
-- perche' il gioco e' deterministico (misurato: strumenti/_q-determinismo.js).
-- Da qui vengono DUE cose che FC Mobile non ha:
--   · il difensore puo' GUARDARE la partita che ha subito;
--   · chiunque puo' RIGIOCARLA e vedere se il punteggio e' quello vero.
--
-- `verificata`:  0 = da guardare, 1 = torna, -1 = non torna (punti tolti)
--
-- RETTIFICA A EDIZIONI (22 settembre 2026, voce #133). Questa colonna ha
-- tre valori perche' i verdetti sembravano tre. Sono CINQUE, e la
-- differenza non e' accademica: TORNA, NON TORNA, INCOMPLETO (il nastro
-- non basta a decidere), ALTRO MOTORE (MOTORE_V diverso) e NON FINISCE
-- (la rigiocata non arriva alla fine entro il tetto della taglia).
-- **Solo NON TORNA puo' muovere punti**: gli altri tre «no» sono «non lo
-- so», e chi li scrive come -1 toglie punti a un innocente.
-- Finche' la colonna resta int a tre valori, il lavoratore che verra'
-- deve mappare INCOMPLETO / ALTRO MOTORE / NON FINISCE su 0 (da
-- riguardare) e MAI su -1, e annotare la causa altrove. La capacita' che
-- produce i cinque verdetti sta in CALCETTO-il-gioco.html
-- (window.__test.giudica); il verbale e' in MANUALE.md §A, voce #133.
--
-- SEGUITO A EDIZIONI (22 settembre 2026, voce #137). «Il lavoratore che
-- verra'» adesso ha dove posare il verdetto, e si chiama
-- `segna_verdetto(s_id, verdetto)` (piu' in basso in questo file). La
-- mappatura descritta qui sopra non e' piu' una raccomandazione scritta
-- a matita: e' dentro la funzione, che accetta la PAROLA e non il
-- numero, e qualunque parola diversa da 'TORNA' e 'NON TORNA' lascia la
-- colonna a 0. La funzione disfa anche i punti (delta_a, delta_d) e alza
-- `allenatore.sospetto`, e lo fa SOLO su NON TORNA.
--
-- Quel che ancora non esiste e' la STAFFETTA: il processo che pesca le
-- righe a `verificata = 0`, apre il browser della misura giusta, chiama
-- `giudica` e riporta la parola. Manca quello, e non manca altro.
--
-- COMPIMENTO A EDIZIONI (22 settembre 2026, voce #138). Le tre righe qui
-- sopra sono superate: la staffetta ESISTE, e si chiama
-- `strumenti/staffetta.js`. Non e' un endpoint (una funzione Vercel non
-- ha un browser, e il giudice E' il gioco): si lancia a mano o da un CI
-- con la chiave di servizio nell'ambiente, cioe' dalla stessa porta
-- delle cinque funzioni. Pesca con questo indice, apre UN contesto per
-- misura di schermo, e chiama `segna_verdetto` con LA PAROLA — mai con
-- il numero, che e' esattamente il chiamante che la nota sopra la
-- funzione diceva di non voler credere.
--
-- E LA COLONNA RESTA COM'E'. Questo cantiere non ha aggiunto una
-- colonna, una tabella, un endpoint o un grant: i tre «non lo so»
-- continuano a lasciare `verificata` a zero, e la memoria di quali righe
-- sono gia' state guardate sta in un file locale della staffetta (il
-- «taccuino»), non qui. Il taccuino puo' sparire senza che nessuno venga
-- accusato due volte: a proteggere e' la guardia `and verificata = 0`
-- che sta qui sotto, non il quaderno.
-- Misurato: strumenti/_q-staffetta.js, 42 controlli su 42.
-- ---------------------------------------------------------------------
create table if not exists sfida (
  id           bigserial primary key,
  attaccante   uuid not null references allenatore(id) on delete cascade,
  difensore    uuid not null references allenatore(id) on delete cascade,
  seme         bigint not null,
  taglia       int    not null check (taglia in (5,7,11)),
  gol_a        int    not null check (gol_a between 0 and 30),
  gol_d        int    not null check (gol_d between 0 and 30),
  replay       text,                        -- compresso e in base64, non JSON crudo
  peso         int    not null default 0,   -- byte del replay, per i conti
  giocata      timestamptz not null default now(),
  vista        boolean not null default false,
  verificata   int    not null default 0,
  delta_a      int    not null default 0,   -- punti mossi, per poterli disfare
  delta_d      int    not null default 0
);
create index if not exists sfida_difensore on sfida (difensore, giocata desc);
create index if not exists sfida_attaccante on sfida (attaccante, giocata desc);
create index if not exists sfida_daverificare on sfida (verificata, giocata) where verificata = 0;

-- ---------------------------------------------------------------------
-- L'IMPEGNO — «adesso giochi QUESTA partita».
--
-- E' il pezzo che chiude il buco piu' grosso della sfida asincrona.
-- Senza, il giro sarebbe: chiedi un avversario, gioca in locale, se
-- perdi butta via e richiedi, se vinci 7-0 manda. Cento tentativi, un
-- solo risultato spedito, classifica falsa.
--
-- Con l'impegno: chiedere un avversario CANCELLA quello di prima. Ne
-- vive uno solo per attaccante, e /api/sfida accetta soltanto un esito
-- che corrisponde all'impegno vivo e non scaduto. Si puo' ancora
-- rifiutare l'avversario proposto — ed e' giusto — ma non si possono
-- accumulare semi da provare.
--
-- La chiave primaria e' l'attaccante, non il seme: e' la struttura a
-- garantire l'unicita', non un controllo nel codice che qualcuno un
-- giorno dimentichera' di fare.
-- ---------------------------------------------------------------------
create table if not exists impegno (
  attaccante   uuid primary key references allenatore(id) on delete cascade,
  seme         bigint not null,
  difensore    uuid references allenatore(id) on delete set null,  -- null = avversario costruito
  forza_avv    int not null default 50,
  taglia       int not null default 5,
  creato       timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- IL FRENO — quante richieste ha fatto un'identita' nell'ultimo minuto.
--
-- Non e' antifurto, e' antifretta: impedisce che un ciclo impazzito (o
-- una prova andata male) svuoti il piano gratuito di Supabase in una
-- notte. Il conto sta nel database e non nella funzione perche' le
-- funzioni Vercel sono molte e non condividono memoria.
-- ---------------------------------------------------------------------
create table if not exists freno (
  chiave       text primary key,
  conta        int not null default 0,
  finestra     timestamptz not null default now()
);

create or replace function frena(k text, tetto int, secondi int)
returns boolean language plpgsql as $$
declare c int; f timestamptz;
begin
  insert into freno (chiave, conta, finestra) values (k, 0, now())
    on conflict (chiave) do nothing;
  select conta, finestra into c, f from freno where chiave = k for update;
  if now() - f > make_interval(secs => secondi) then
    update freno set conta = 1, finestra = now() where chiave = k;
    return true;
  end if;
  if c >= tetto then return false; end if;
  update freno set conta = conta + 1 where chiave = k;
  return true;
end $$;

-- ---------------------------------------------------------------------
-- L'AVVERSARIO — la ricerca dell'accoppiamento, fatta nel database
-- perche' e' una scansione con un ordinamento e in JavaScript sarebbe
-- scaricare mezza tabella per buttarla via.
--
-- Il criterio: vicino di forza (±banda), non sei tu, non e' bandito,
-- visto negli ultimi 30 giorni (una squadra abbandonata non e' una
-- sfida, e' un punto regalato), e fra quelli che restano si sorteggia —
-- perche' se prendessimo sempre il piu' vicino, due giocatori della
-- stessa fascia si incontrerebbero all'infinito.
-- ---------------------------------------------------------------------
-- AGGIUNTA A EDIZIONI (22 settembre 2026, voce #137). La finestra
-- descritta qui sopra resta quella, con DUE coordinate in piu'. Il testo
-- vecchio non si cancella perche' e' ancora vero: si aggiunge quel che
-- manca.
--
-- 1. LA VICINANZA DI PUNTI (`banda_punti`). `forza` e `punti` misurano
--    due cose diverse: la forza dice quanto hai GIOCATO (la rosa cresce
--    a ogni partita e satura a 99), i punti dicono quanto VINCI (Elo).
--    Dentro `forza 75 +/-8` ci stanno 203 allenatori su 400 con punti
--    da 402 a 1486 (misurato, fuori/_sonda-137-abbinamento.js): mille
--    punti di Elo sono una partita decisa prima del fischio, e la
--    colonna dei punti stava gia' in questa tupla senza che nessuno la
--    guardasse. `banda_punti is null` vuol dire NESSUN LIMITE, ed e' il
--    quarto gradino della scala — quello che garantisce che nessuna
--    sfida si perda. Misurato: scarto mediano da 188 a 60 punti,
--    abbinamenti entro 150 punti dal 41% al 100%, e zero ricerche senza
--    avversario in piu'.
--
-- 2. LA SEPARAZIONE DEI SOSPETTI (`separa`). Il candidato deve stare
--    dalla STESSA PARTE della soglia di chi cerca. Il sospetto e' il
--    numero di sfide di quell'attaccante chiuse a `verificata = -1`,
--    cioe' col verdetto NON TORNA e con nessun altro dei cinque
--    (rete/lib/verdetto.js). Non toglie punti, non bandisce, non si
--    vede: cambia soltanto con chi ti abbini. Misurato: un onesto
--    incontra un sospetto il 3,93% delle volte senza separazione, lo
--    0,00% con.
--
-- 3. IL PAVIMENTO DEL MAZZO (`minimo`), che NON era nel progetto: l'ha
--    trovato il banco. Una finestra piu' stretta da' abbinamenti piu'
--    giusti E MENO GENTE DENTRO, e su 400 allenatori misurati c'era chi
--    restava con UN SOLO avversario possibile: lo stesso, tutte le sere.
--    E' esattamente quel che l'`order by random()` qui sopra esiste per
--    impedire, tornato dalla FINESTRA invece che dall'ordinamento.
--    Allora un gradino non si accontenta di trovare QUALCUNO: deve
--    trovarne almeno `minimo`, se no si passa al gradino dopo. L'ultimo
--    ha `minimo` 1, quindi nessuna sfida si perde lo stesso.
--    Misurato (6/4/2/1): il peggio servito passa da 1 avversario
--    possibile a 7 su una base di 400, e su una base di DODICI da 1 a 5,
--    cioe' meglio dei 3 di oggi.
--
-- IL SOSPETTO NON ENTRA NELLA TUPLA, e non e' una dimenticanza: quel che
-- esce di qui finisce dritto nel corpo della risposta di
-- /api/avversario (`avversario: avv`), cioe' sul telefono di un'altra
-- persona. Il confronto si fa QUI, dove il dato sta gia'.
--
-- LA TRAPPOLA DI POSTGRES, pagata da questa voce: `create or replace
-- function` con una FIRMA DIVERSA non sostituisce niente — crea una
-- SECONDA funzione. Le due convivono, PostgREST sceglie per nome degli
-- argomenti, e il `revoke` scritto sulla firma vecchia resta sulla
-- vecchia, cioe' la nuova nascerebbe APERTA. Quindi le vecchie si
-- buttano PRIMA — tutte e due, perche' questo cantiere la firma l'ha
-- cambiata due volte — e questo file resta idempotente come promette la
-- sua intestazione.
-- ---------------------------------------------------------------------
drop function if exists trova_avversario(uuid, int);
drop function if exists trova_avversario(uuid, int, int, int);

create or replace function trova_avversario(
  io uuid, banda int default 8, banda_punti int default null,
  separa int default 3, minimo int default 1
)
returns table (allenatore uuid, nome text, colori jsonb, rosa jsonb,
               modulo text, indole jsonb, forza int, punti int)
language sql stable as $$
  with mia as (
    select coalesce((select s.forza    from squadra    s where s.allenatore = io),   50) as f,
           coalesce((select p.punti    from punti      p where p.allenatore = io), 1000) as pt,
           coalesce((select a.sospetto from allenatore a where a.id         = io),    0) as sp
  ),
  buoni as (
    select s.allenatore as al, s.nome as nm, s.colori as co, s.rosa as ro,
           s.modulo as mo, s.indole as ind, s.forza as fo,
           coalesce(p.punti, 1000) as pt
      from squadra s
      join allenatore a on a.id = s.allenatore
      left join punti p on p.allenatore = s.allenatore
     cross join mia
     where s.allenatore <> io
       and not a.bandito
       and a.visto > now() - interval '30 days'
       and abs(s.forza - mia.f) <= banda
       and (banda_punti is null or abs(coalesce(p.punti, 1000) - mia.pt) <= banda_punti)
       and (a.sospetto >= separa) = (mia.sp >= separa)
  )
  select al, nm, co, ro, mo, ind, fo, pt
    from buoni
   where (select count(*) from buoni) >= minimo
   order by random()
   limit 1
$$;

-- ---------------------------------------------------------------------
-- MUOVERE I PUNTI — in una sola istruzione, dentro il database.
--
-- Perche' non in JavaScript: due sfide che arrivano nello stesso istante
-- contro lo stesso difensore leggerebbero entrambe i punti vecchi e
-- scriverebbero entrambe partendo da quelli. Uno dei due aggiornamenti
-- sparirebbe, e sparirebbe in silenzio. Qui l'incremento e' relativo e
-- atomico: succedono tutti e due, in un ordine qualsiasi, e il totale e'
-- giusto comunque.
--
-- `tocca_serie` esiste perche' la serie di vittorie e' dell'ATTACCANTE.
-- Il difensore stava dormendo: non e' giusto che una sconfitta subita
-- mentre non giocava gli spezzi la striscia che si e' costruito.
-- ---------------------------------------------------------------------
create or replace function muovi_punti(
  chi uuid, d int, gf int, gs int, esito real, tocca_serie boolean default true
) returns int language plpgsql as $$
declare nuovo int;
begin
  insert into punti (allenatore) values (chi) on conflict (allenatore) do nothing;
  update punti set
    punti  = greatest(100, punti + d),
    vinte  = vinte + (case when esito = 1   then 1 else 0 end),
    pari   = pari  + (case when esito = 0.5 then 1 else 0 end),
    perse  = perse + (case when esito = 0   then 1 else 0 end),
    fatti  = fatti + gf,
    subiti = subiti + gs,
    serie  = case when not tocca_serie then serie
                  when esito = 1 then serie + 1 else 0 end,
    aggiornati = now()
  where allenatore = chi
  returning punti into nuovo;
  return nuovo;
end $$;

-- ---------------------------------------------------------------------
-- POSARE IL RATING NASCOSTO — e perche' non e' un `update` e basta
-- (voce #140).
--
-- `muovi_punti` qui sopra risolve la corsa con l'atomicita': `punti =
-- punti + d` succede tutto intero, e due sfide che arrivano nello stesso
-- istante si sommano in un ordine qualsiasi con lo stesso totale.
--
-- Glicko-2 NON SI PUO' SCRIVERE COSI'. Non e' un incremento: e' una
-- funzione del valore di partenza, dell'avversario e di quanti giorni
-- sono passati, e ha bisogno di leggere prima di scrivere. Fra la
-- lettura e la scrittura c'e' una finestra, e in quella finestra un'altra
-- sfida contro lo stesso difensore leggerebbe lo stesso valore vecchio:
-- una delle due sparirebbe, e sparirebbe in silenzio — esattamente il
-- guaio che la nota sopra `muovi_punti` descrive.
--
-- Allora si scrive solo se NESSUNO E' PASSATO NEL FRATTEMPO. `giri` e'
-- un contatore che sale di uno a ogni scrittura andata a buon fine; chi
-- chiama passa il valore che ha LETTO, e se non e' piu' quello la
-- scrittura non avviene e la funzione torna `false`. Il chiamante
-- rilegge e rifa' il conto (rete/api/sfida.js, tre tentativi).
--
-- E SE PERDE TUTTE E TRE LE VOLTE? Non succede niente di grave, ed e' il
-- motivo per cui la guardia puo' permettersi di essere severa: i punti
-- VISIBILI si sono gia' mossi con `muovi_punti`, il replay e' gia'
-- registrato, la sfida e' andata. Quel che si perde e' un aggiornamento
-- di un numero che nessuno vede, e la prossima partita lo rimette a
-- posto. Un'informazione in meno, non un danno.
--
-- La riga si crea se non c'e', come fa `muovi_punti`: un giocatore puo'
-- arrivare qui prima di avere una riga in classifica.
--
-- Non e' un endpoint e non lo diventera': si chiama con la chiave di
-- servizio, e sotto c'e' il `revoke` come per tutte le altre.
-- ---------------------------------------------------------------------
create or replace function posa_nascosto(
  chi uuid, r real, rd real, vol real, quando date, da_giri int
) returns boolean language plpgsql as $$
declare mosse int;
begin
  insert into punti (allenatore) values (chi) on conflict (allenatore) do nothing;
  update punti set
    nascosto   = r,
    incertezza = rd,
    volatilita = vol,
    periodo    = quando,
    giri       = da_giri + 1
  where allenatore = chi and giri = da_giri;
  get diagnostics mosse = row_count;
  return mosse > 0;
end $$;

-- ---------------------------------------------------------------------
-- LA CLASSIFICA — i primi N piu' la TUA posizione, in una interrogazione
-- sola. Il rango si calcola qui perche' calcolarlo fuori vorrebbe dire
-- scaricare tutta la tabella per contare quante righe stanno sopra.
-- ---------------------------------------------------------------------
create or replace function classifica(io uuid, quanti int default 100, st int default 1)
returns table (posto bigint, allenatore uuid, nome text, colori jsonb,
               forza int, punti int, vinte int, pari int, perse int, sono_io boolean)
language sql stable as $$
  with tutti as (
    select row_number() over (order by p.punti desc, p.aggiornati asc) as posto,
           p.allenatore, s.nome, s.colori, s.forza, p.punti, p.vinte, p.pari, p.perse
      from punti p
      join squadra s on s.allenatore = p.allenatore
      join allenatore a on a.id = p.allenatore
     where p.stagione = st and not a.bandito
  )
  select posto, allenatore, nome, colori, forza, punti, vinte, pari, perse,
         (allenatore = io) as sono_io
    from tutti where posto <= quanti
  union all
  select posto, allenatore, nome, colori, forza, punti, vinte, pari, perse, true
    from tutti where allenatore = io and posto > quanti
  order by posto
$$;

-- ---------------------------------------------------------------------
-- SEGNARE UN VERDETTO — l'altro capo del giudice (voce #137).
--
-- Il giudice esiste da ieri: `window.__test.giudica` (voce #133) rigioca
-- una sfida sul motore vero e restituisce uno di CINQUE verdetti. Questa
-- funzione e' quel che il server ne fa. Non e' un endpoint e non lo
-- diventera': un endpoint che accetta «questa sfida non torna» sarebbe
-- il modo piu' corto per far togliere i punti a un avversario scrivendo
-- il suo identificativo. Si chiama con la chiave di servizio, e sotto
-- c'e' il `revoke` come per tutte le altre.
--
-- LA TAVOLA DEI CINQUE, rifatta qui dentro. La stessa sta in
-- rete/lib/verdetto.js, e non e' una ripetizione per sbaglio: sono DUE
-- PORTE. Chi scrivera' il verificatore differito potrebbe sbagliare a
-- chiamare `conseguenza()` e passare un -1 a mano; questa funzione non
-- gli crederebbe comunque, perche' non accetta -1 — accetta la parola
-- 'NON TORNA'. Qualunque altra stringa (un errore di battitura, un
-- nullo, un verdetto inventato fra un anno, un minuscolo) vale «non lo
-- so» e non muove NIENTE: il ripiego di questa funzione e' l'innocenza.
--
-- E i tre «non lo so» — INCOMPLETO, ALTRO MOTORE, NON FINISCE — lasciano
-- `verificata` a ZERO, non a -1 e nemmeno a 1: zero vuol dire «da
-- riguardare», e l'indice `sfida_daverificare` tiene quelle righe in
-- lista perche' un `INCOMPLETO / schermo-diverso` si puo' rigiudicare
-- domani con la finestra della misura giusta.
--
-- LA GUARDIA (`and verificata = 0`) e' la riga che conta. Senza, un
-- verificatore che ripassa sulla stessa sfida — o due processi partiti
-- insieme — toglierebbero i punti due volte e scriverebbero due sospetti
-- per una partita sola. E' la stessa forma del DELETE che consuma
-- l'impegno in /api/sfida: il controllo lo fa la struttura, non un `if`
-- che qualcuno un giorno spostera'.
--
-- IL SOSPETTO, e che cosa comporta. Sale di uno, e solo qui: dentro il
-- ramo del solo NON TORNA. Non toglie punti da se' (li toglie il
-- disfacimento di QUELLA partita, che e' un'altra cosa), non bandisce
-- (`bandito` resta una decisione umana), non compare in nessuna risposta
-- di nessun endpoint, non compare nella classifica. Fa UNA cosa:
-- `trova_avversario` cerca solo fra chi sta dalla stessa parte della
-- soglia. E' il «pool separati per abusatori» del mandato §10.5.
--
-- L'INVARIANTE, che e' la ragione per cui un'accusa cosi' si puo'
-- scrivere: `allenatore.sospetto` di X E' il numero di righe `sfida` con
-- `attaccante = X` e `verificata = -1`. Non e' un punteggio tarato a
-- mano: e' un CONTEGGIO DI RIGHE, e ogni riga porta seme, taglia, gol e
-- il replay. Chi e' segnato lo e' per partite che chiunque abbia la
-- chiave puo' rigiocare una per una e ottenere lo stesso NON TORNA. Per
-- questo il sospetto non decade mai: un numero che cala col tempo
-- smetterebbe di essere ricostruibile dalle righe, e diventerebbe
-- un'opinione.
--
-- LA `serie` NON SI DISFA, e va detto: non e' ricostruibile da una riga
-- sola (servirebbe l'ordine di tutte le partite venute dopo) e vale al
-- massimo un moltiplicatore del 30% su una singola partita. E' l'unica
-- cosa che una sfida disfatta lascia indietro.
-- ---------------------------------------------------------------------
create or replace function segna_verdetto(s_id bigint, verdetto text)
returns table (mosso boolean, esito int, sospetto_nuovo int)
language plpgsql as $$
declare s sfida%rowtype; e int; nuovo int := 0;
begin
  e := case verdetto when 'TORNA' then 1 when 'NON TORNA' then -1 else 0 end;
  if e = 0 then
    return query select false, 0, 0;
    return;
  end if;

  update sfida set verificata = e where id = s_id and verificata = 0
    returning * into s;
  if not found then
    return query select false, e, 0;
    return;
  end if;

  if e = -1 then
    -- i punti tornano indietro per TUTTI E DUE: i delta furono registrati
    -- apposta («punti mossi, per poterli disfare»), e i pavimenti sono
    -- quelli di muovi_punti, cento punti e zero contatori
    update punti p set
      punti  = greatest(100, p.punti  - s.delta_a),
      vinte  = greatest(0,   p.vinte  - (case when s.gol_a >  s.gol_d then 1 else 0 end)),
      pari   = greatest(0,   p.pari   - (case when s.gol_a =  s.gol_d then 1 else 0 end)),
      perse  = greatest(0,   p.perse  - (case when s.gol_a <  s.gol_d then 1 else 0 end)),
      fatti  = greatest(0,   p.fatti  - s.gol_a),
      subiti = greatest(0,   p.subiti - s.gol_d),
      aggiornati = now()
     where p.allenatore = s.attaccante;

    update punti p set
      punti  = greatest(100, p.punti  - s.delta_d),
      vinte  = greatest(0,   p.vinte  - (case when s.gol_d >  s.gol_a then 1 else 0 end)),
      pari   = greatest(0,   p.pari   - (case when s.gol_a =  s.gol_d then 1 else 0 end)),
      perse  = greatest(0,   p.perse  - (case when s.gol_d <  s.gol_a then 1 else 0 end)),
      fatti  = greatest(0,   p.fatti  - s.gol_d),
      subiti = greatest(0,   p.subiti - s.gol_a),
      aggiornati = now()
     where p.allenatore = s.difensore;

    update allenatore a set sospetto = a.sospetto + 1
     where a.id = s.attaccante
    returning a.sospetto into nuovo;
  end if;

  return query select true, e, coalesce(nuovo, 0);
end $$;

-- ---------------------------------------------------------------------
-- RLS ACCESO SU TUTTO, E NESSUNA REGOLA.
--
-- Non e' una svista: e' il progetto. Il ruolo `service_role`, che usano
-- le funzioni Vercel, scavalca RLS per costruzione. Tutti gli altri —
-- `anon` compreso — non hanno una sola regola che li autorizzi, quindi
-- non leggono e non scrivono niente. La superficie esposta a Internet
-- sono i cinque endpoint, non queste cinque tabelle.
-- ---------------------------------------------------------------------
alter table allenatore enable row level security;
alter table squadra    enable row level security;
alter table punti      enable row level security;
alter table sfida      enable row level security;
alter table impegno    enable row level security;
alter table freno      enable row level security;

revoke all on allenatore, squadra, punti, sfida, impegno, freno from anon, authenticated;
revoke all on function trova_avversario(uuid, int, int, int, int)      from anon, authenticated;
revoke all on function frena(text, int, int)                          from anon, authenticated;
revoke all on function muovi_punti(uuid, int, int, int, real, boolean) from anon, authenticated;
revoke all on function posa_nascosto(uuid, real, real, real, date, int) from anon, authenticated;
revoke all on function classifica(uuid, int, int)                     from anon, authenticated;
revoke all on function segna_verdetto(bigint, text)                   from anon, authenticated;
