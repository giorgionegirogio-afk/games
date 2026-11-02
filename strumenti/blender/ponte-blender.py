# -*- coding: utf-8 -*-
"""
ponte-blender.py — IL PONTE DI CASA FRA CLAUDE CODE E BLENDER (voce #159).

PERCHE' ESISTE. Il committente ha chiesto «il connettore Blender». Quello
pubblico (blender-mcp) vuole un pacchetto da PyPI e un addon da GitHub, e
la sessione automatica non ha il permesso di installare codice esterno.
Questo ponte fa la stessa cosa con la sola libreria standard: gira DENTRO
Blender, apre una presa TCP su 127.0.0.1 e accetta righe JSON. Dall'altra
parte sta strumenti/blender/mcp-blender.py, il server MCP che Claude Code
registra, anch'esso senza dipendenze.

COME SI AVVIA (due modi, stesso script):
  senza finestra, come un servizio:
    blender --background --python strumenti/blender/ponte-blender.py
  con la finestra aperta, per guardare quel che Claude fa:
    blender --python strumenti/blender/ponte-blender.py
  In sottofondo il ponte e' un ciclo bloccante (Blender headless non ha un
  ciclo di eventi da rispettare); con la finestra usa bpy.app.timers e una
  presa non bloccante, cosi' l'interfaccia resta viva.

IL PROTOCOLLO, una riga JSON per messaggio, risposta su una riga:
  {"id":1,"op":"python","code":"import bpy\\n_result = bpy.app.version_string"}
    -> {"id":1,"ok":true,"result":"5.2.0","stdout":""}
  {"id":2,"op":"info"}                 scena, oggetti, camera, render
  {"id":3,"op":"render","path":"C:/.../x.png","w":512,"h":512}
  {"id":4,"op":"apri","path":"C:/.../scena.blend"}
  {"id":5,"op":"salva","path":"C:/.../scena.blend"}
  {"id":6,"op":"spegni"}
  In "python" il codice gira con bpy gia' importato; se assegna _result, quel
  valore torna indietro (serializzato come JSON se si puo', altrimenti come
  testo). L'uscita standard viene catturata e restituita in "stdout".

SICUREZZA. Ascolta SOLO su 127.0.0.1: niente dall'esterno. Esegue codice
Python arbitrario per costruzione (e' il suo lavoro), quindi la porta e'
locale e il processo e' quello del committente.

PORTA: 9877 (blender-mcp usa 9876: non la stessa, cosi' i due non si
pestano se un giorno il committente installa anche quello).
"""
import bpy, socket, json, sys, io, traceback, os, threading

PORTA = int(os.environ.get('PONTE_BLENDER_PORTA', '9877'))
INDIRIZZO = '127.0.0.1'


def _json_sicuro(v):
    try:
        json.dumps(v)
        return v
    except Exception:
        return repr(v)


def _info():
    sc = bpy.context.scene
    ogg = []
    for o in bpy.data.objects:
        ogg.append({'nome': o.name, 'tipo': o.type,
                    'pos': [round(x, 4) for x in o.location],
                    'rot': [round(x, 4) for x in o.rotation_euler],
                    'scala': [round(x, 4) for x in o.scale],
                    'visibile': not o.hide_render})
    cam = sc.camera.name if sc.camera else None
    return {'blender': bpy.app.version_string, 'file': bpy.data.filepath or None,
            'scena': sc.name, 'fotogramma': sc.frame_current,
            'camera': cam, 'motore': sc.render.engine,
            'risoluzione': [sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage],
            'oggetti': ogg, 'materiali': [m.name for m in bpy.data.materials],
            'azioni': [a.name for a in bpy.data.actions]}


def _esegui(msg):
    op = msg.get('op')
    if op == 'python':
        codice = msg.get('code', '')
        spazio = {'bpy': bpy, '__name__': '__ponte__'}
        cattura = io.StringIO()
        vecchio = sys.stdout
        sys.stdout = cattura
        try:
            exec(compile(codice, '<ponte>', 'exec'), spazio)
        finally:
            sys.stdout = vecchio
        return {'result': _json_sicuro(spazio.get('_result')), 'stdout': cattura.getvalue()}
    if op == 'info':
        return {'result': _info()}
    if op == 'render':
        sc = bpy.context.scene
        percorso = msg.get('path') or os.path.join(os.getcwd(), 'ponte-render.png')
        w, h = msg.get('w'), msg.get('h')
        if w: sc.render.resolution_x = int(w)
        if h: sc.render.resolution_y = int(h)
        sc.render.resolution_percentage = int(msg.get('percento', 100))
        sc.render.image_settings.file_format = 'PNG'
        sc.render.filepath = percorso
        if msg.get('camera'):
            sc.camera = bpy.data.objects[msg['camera']]
        if msg.get('motore'):
            sc.render.engine = msg['motore']
        bpy.ops.render.render(write_still=True)
        return {'result': {'path': percorso, 'w': sc.render.resolution_x, 'h': sc.render.resolution_y}}
    if op == 'apri':
        bpy.ops.wm.open_mainfile(filepath=msg['path'])
        return {'result': {'aperto': bpy.data.filepath}}
    if op == 'salva':
        percorso = msg.get('path') or bpy.data.filepath
        bpy.ops.wm.save_as_mainfile(filepath=percorso)
        return {'result': {'salvato': percorso}}
    if op == 'spegni':
        return {'result': 'addio', '_spegni': True}
    raise ValueError('op sconosciuta: %r' % (op,))


def _rispondi(conn, msg):
    rid = msg.get('id')
    try:
        esito = _esegui(msg)
        risposta = {'id': rid, 'ok': True}
        risposta.update({k: v for k, v in esito.items() if not k.startswith('_')})
    except Exception as e:
        risposta = {'id': rid, 'ok': False, 'errore': ''.join(traceback.format_exception_only(type(e), e)).strip(),
                    'traccia': traceback.format_exc()[-2000:]}
        esito = {}
    conn.sendall((json.dumps(risposta, ensure_ascii=False) + '\n').encode('utf-8'))
    return esito.get('_spegni', False)


def _leggi_righe(conn):
    """una riga JSON per messaggio; la connessione puo' portare piu' messaggi"""
    resto = b''
    while True:
        pezzo = conn.recv(65536)
        if not pezzo:
            return
        resto += pezzo
        while b'\n' in resto:
            riga, resto = resto.split(b'\n', 1)
            riga = riga.strip()
            if riga:
                yield json.loads(riga.decode('utf-8'))


def _servi_connessione(conn):
    try:
        for msg in _leggi_righe(conn):
            if _rispondi(conn, msg):
                return True
    except Exception as e:
        try:
            conn.sendall((json.dumps({'ok': False, 'errore': 'ponte: ' + repr(e)}) + '\n').encode('utf-8'))
        except Exception:
            pass
    finally:
        try:
            conn.close()
        except Exception:
            pass
    return False


def avvia():
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind((INDIRIZZO, PORTA))
    srv.listen(4)
    print('[ponte-blender] in ascolto su %s:%d (Blender %s, background=%s)' % (
        INDIRIZZO, PORTA, bpy.app.version_string, bpy.app.background), flush=True)

    if bpy.app.background:
        # senza finestra: un ciclo bloccante e' la cosa giusta, Blender non ha
        # altro da fare; ogni comando gira nel thread principale (bpy lo esige)
        while True:
            conn, _ = srv.accept()
            if _servi_connessione(conn):
                break
        srv.close()
        print('[ponte-blender] spento', flush=True)
        return

    # con la finestra: presa non bloccante sondata da un timer di Blender,
    # cosi' i comandi girano nel thread principale fra un ridisegno e l'altro
    srv.setblocking(False)
    stato = {'spegni': False}

    def sonda():
        if stato['spegni']:
            srv.close()
            print('[ponte-blender] spento', flush=True)
            return None
        try:
            conn, _ = srv.accept()
        except BlockingIOError:
            return 0.05
        conn.setblocking(True)
        if _servi_connessione(conn):
            stato['spegni'] = True
        return 0.01

    bpy.app.timers.register(sonda, persistent=True)


avvia()
