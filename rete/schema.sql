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
create or replace function trova_avversario(io uuid, banda int default 8)
returns table (allenatore uuid, nome text, colori jsonb, rosa jsonb,
               modulo text, indole jsonb, forza int, punti int)
language sql stable as $$
  with mia as (select coalesce((select s.forza from squadra s where s.allenatore = io), 50) as f)
  select s.allenatore, s.nome, s.colori, s.rosa, s.modulo, s.indole, s.forza,
         coalesce(p.punti, 1000)
    from squadra s
    join allenatore a on a.id = s.allenatore
    left join punti p on p.allenatore = s.allenatore
   cross join mia
   where s.allenatore <> io
     and not a.bandito
     and a.visto > now() - interval '30 days'
     and abs(s.forza - mia.f) <= banda
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
revoke all on function trova_avversario(uuid, int)                    from anon, authenticated;
revoke all on function frena(text, int, int)                          from anon, authenticated;
revoke all on function muovi_punti(uuid, int, int, int, real, boolean) from anon, authenticated;
revoke all on function classifica(uuid, int, int)                     from anon, authenticated;
