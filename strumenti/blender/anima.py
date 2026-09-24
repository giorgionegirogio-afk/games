# -*- coding: utf-8 -*-
"""
anima.py -- le due clip della voce #151, e il perche' sono DUE e non venticinque.

QUALI GESTI, E DA DOVE VENGONO I NOMI.
fcm-estratto/g-anim.txt e' la TASSONOMIA delle animazioni di FC Mobile: un
elenco di nomi di nodi (ActNodeDribble, ActNodeKickBall, ActNodeSlideTackle...).
Da li' si prende UNA cosa sola -- quali gesti un gioco di calcio deve avere e
come si concatenano -- e nient'altro. La regola del committente e' che le
meccaniche sono libere e l'espressione no: un elenco di nomi non e'
espressione, un disegno si'. Qui non entra un pixel, un testo o un asset di
quel gioco; entrano due nomi:

    ActNodeMoveDirection  ->  'corsa'   il ciclo di locomozione
    ActNodeKickBall       ->  'tiro'    il colpo, una botta sola

Sono i due che coprono quasi tutto il tempo di schermo, ed e' per questo che il
prototipo misura loro: se l'atlas non regge su questi due, non regge.

COME SONO ANIMATE, E PERCHE' COSI'.
Si specificano soltanto le ROTAZIONI dei giunti, e la catena la risolve
Blender: e' la differenza fra riggare un corpo e riscrivere in Python la
trigonometria che il gioco ha gia'. Le pose sono fissate sui fotogrammi che si
renderizzano davvero, percio' nessuna interpolazione entra nel risultato e il
render non puo' dipendere dal tipo di curva.

DODICI POSE PER CLIP, e il numero non e' tondo per caso. La corsa gira a 2,6 Hz
(CLIPS.corsa.freq nel gioco): a 60 fotogrammi al secondo un ciclo dura 23
fotogrammi di schermo, e dodici pose interpolate a due a due sono la densita'
sotto la quale la falcata comincia a saltare. Il tiro gira a 0,7 Hz, cioe' 86
fotogrammi di schermo, e dodici pose lo coprono soltanto perche' e' un gesto a
impulso, dove le pose chiave contano piu' della continuita'.

NESSUN NUMERO CASUALE IN QUESTO FILE. Le curve sono seni e tabelle scritte a
mano: chiunque rilanci ottiene gli stessi gradi.
"""

import math

FOTOGRAMMI = 12

# le ossa che le clip muovono. Gli assi, misurati con la sonda e non supposti:
#   rotazione X = oscillazione sagittale (positiva = arto in avanti)
#   rotazione Y = torsione lungo l'osso
#   rotazione Z = apertura laterale (positiva = arto verso -x)
SAGITTALE, TORSIONE, LATERALE = 0, 1, 2


def _z(v):
    return [float(v[0]), float(v[1]), float(v[2])]


def clip_corsa(i):
    """ActNodeMoveDirection -- il ciclo di corsa.

    LE QUATTRO COSE CHE LA FANNO LEGGERE COME UNA CORSA E NON COME UN
    CAMMINO, ed e' il motivo per cui un ciclo si anima invece di
    interpolarlo:
      1. la coscia va avanti PIU' di quanto vada indietro (0,95 contro 0,55):
         una corsa e' asimmetrica, un cammino no;
      2. il ginocchio si chiude tantissimo nel recupero (fino a 1,9 rad) e
         quasi niente nella spinta: e' il gesto che dice «sta correndo»;
      3. le braccia contro-oscillano in opposizione di fase alle gambe e con
         il gomito gia' piegato, non teso;
      4. il bacino sale e scende DUE volte per ciclo, non una: e' il rimbalzo,
         e senza la figura scivola.
    """
    u = i / float(FOTOGRAMMI)
    a = 2.0 * math.pi * u
    s, c = math.sin(a), math.cos(a)

    def gamba(fase):
        # asimmetria avanti/indietro: 0,95 avanti, 0,55 indietro
        sw = math.sin(fase)
        coscia = 0.95 * sw if sw > 0 else 0.55 * sw
        # il ginocchio si chiude nel recupero (coscia che torna avanti)
        rec = max(0.0, -math.cos(fase))
        ginocchio = -(0.25 + 1.65 * rec * rec)
        # la caviglia raccoglie la punta nel recupero e la stende nella spinta
        caviglia = 0.45 * rec - 0.30 * max(0.0, math.cos(fase))
        return coscia, ginocchio, caviglia

    cd, gd, pd = gamba(a)
    cs, gs, ps = gamba(a + math.pi)

    def braccio(fase):
        sw = math.sin(fase)
        return -0.62 * sw, -0.95 - 0.45 * max(0.0, sw)

    bd, gomd = braccio(a + math.pi)
    bs, goms = braccio(a)

    pose = {
        # il busto si inclina in avanti e contro-ruota di poco col bacino
        'bacino-petto': _z((0.20, 0.10 * s, 0.0)),
        'petto-collo': _z((0.06, -0.06 * s, 0.0)),
        # LA TESTA STA FERMA mentre il busto lavora: e' la stabilizzazione che
        # in un rig scritto a mano costa una riga di correzione e qui e' una
        # rotazione contraria sola.
        'collo-testa': _z((-0.20, 0.0, 0.0)),
        'coscia-dx': _z((cd, 0.0, 0.03)), 'polpaccio-dx': _z((gd, 0.0, 0.0)),
        'piede-dx': _z((pd, 0.0, 0.0)),
        'coscia-sx': _z((cs, 0.0, -0.03)), 'polpaccio-sx': _z((gs, 0.0, 0.0)),
        'piede-sx': _z((ps, 0.0, 0.0)),
        'braccio-dx': _z((bd, 0.0, -0.16)), 'avambraccio-dx': _z((gomd, 0.0, 0.0)),
        'braccio-sx': _z((bs, 0.0, 0.16)), 'avambraccio-sx': _z((goms, 0.0, 0.0)),
    }
    # il rimbalzo: due colmi per ciclo, e il corpo e' piu' basso quando
    # entrambi i piedi sono a terra
    bob = 0.035 * math.cos(2.0 * a) - 0.02
    return pose, bob


# le dodici pose chiave del tiro, scritte una per una. Un colpo non e' una
# curva: e' un carico, uno scatto e un arresto, e la differenza fra i due e'
# tutta nella spaziatura dei tempi.
#   0-2 rincorsa · 3-4 piede d'appoggio che si pianta · 5-6 caricamento
#   7    contatto (il fotogramma che deve leggersi da solo)
#   8-11 accompagnamento e riassetto
_TIRO = [
    # (coscia dx, ginocchio dx, coscia sx, ginocchio sx, busto, braccio sx, braccio dx, bob)
    (0.55, -0.90, -0.35, -0.35, 0.16, -0.30, 0.30, -0.010),
    (0.80, -1.30, -0.50, -0.20, 0.18, -0.45, 0.45, 0.005),
    (0.35, -0.55, -0.15, -0.55, 0.20, -0.30, 0.55, -0.005),
    (-0.10, -0.25, 0.30, -0.75, 0.24, -0.10, 0.70, -0.030),
    (-0.45, -0.30, 0.55, -0.95, 0.26, 0.10, 0.85, -0.045),
    (-0.85, -0.95, 0.60, -1.00, 0.20, 0.35, 1.05, -0.050),
    (-1.05, -1.55, 0.58, -0.98, 0.10, 0.55, 1.25, -0.048),
    (-0.35, -0.45, 0.52, -0.90, -0.04, 0.70, 1.15, -0.040),
    (0.55, -0.08, 0.45, -0.80, -0.14, 0.60, 0.85, -0.026),
    (1.05, -0.20, 0.35, -0.65, -0.10, 0.40, 0.55, -0.012),
    (0.90, -0.55, 0.20, -0.50, 0.02, 0.15, 0.30, -0.008),
    (0.65, -0.80, 0.00, -0.40, 0.12, -0.05, 0.15, -0.010),
]


def clip_tiro(i):
    """ActNodeKickBall -- il colpo. La gamba che calcia e' la DESTRA."""
    cd, gd, cs, gs, busto, bs, bd, bob = _TIRO[i % FOTOGRAMMI]
    pose = {
        'bacino-petto': _z((busto, -0.22, 0.0)),
        'petto-collo': _z((0.04, -0.10, 0.0)),
        # la testa guarda il pallone per tutto il gesto: e' la cosa che
        # separa un calcio da una gamba tirata a caso
        'collo-testa': _z((0.22 - busto * 0.5, 0.0, 0.0)),
        'coscia-dx': _z((cd, 0.0, 0.05)), 'polpaccio-dx': _z((gd, 0.0, 0.0)),
        'piede-dx': _z((-0.35, 0.0, 0.0)),
        'coscia-sx': _z((cs, 0.0, -0.10)), 'polpaccio-sx': _z((gs, 0.0, 0.0)),
        'piede-sx': _z((0.10, 0.0, 0.0)),
        # il braccio opposto si apre per bilanciare: e' la lettura del peso
        'braccio-sx': _z((bs, 0.0, 0.55)), 'avambraccio-sx': _z((-0.65, 0.0, 0.0)),
        'braccio-dx': _z((bd, 0.0, -0.30)), 'avambraccio-dx': _z((-1.05, 0.0, 0.0)),
    }
    return pose, bob


CLIP = {
    'corsa': {'fn': clip_corsa, 'fcm': 'ActNodeMoveDirection', 'freq': 2.6, 'ciclica': True},
    'tiro': {'fn': clip_tiro, 'fcm': 'ActNodeKickBall', 'freq': 0.7, 'ciclica': False},
}


def applica(og, nome, i):
    """posa l'armatura sul fotogramma i della clip. Le ossa non nominate
    tornano a zero, cosi' una clip non puo' ereditare la posa di un'altra --
    che e' il difetto classico di chi anima a stati."""
    pose, bob = CLIP[nome]['fn'](i)
    for pb in og.pose.bones:
        pb.rotation_euler = pose.get(pb.name, (0.0, 0.0, 0.0))
    og.location = (0.0, 0.0, bob)
    return bob
