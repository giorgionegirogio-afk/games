# -*- coding: utf-8 -*-
"""
mcp-blender.py — IL SERVER MCP DI CASA PER BLENDER (voce #159), senza una
dipendenza: sola libreria standard di Python.

Claude Code lo registra come server MCP «stdio» e parla JSON-RPC 2.0 a righe
(il trasporto stdio del Model Context Protocol: un messaggio per riga). Il
server espone quattro attrezzi, e ognuno passa dal ponte che gira dentro
Blender (strumenti/blender/ponte-blender.py, presa 127.0.0.1:9877):

  blender_avvia(gui?)     lancia Blender col ponte se non risponde gia'
                          (senza finestra, o con la finestra se gui=true)
  blender_python(code)    esegue Python dentro Blender; _result torna indietro
  blender_info()          scena, oggetti, camera, motore, risoluzione
  blender_render(path,w,h,camera?,motore?)   un fotogramma PNG
  blender_spegni()        chiude il ponte (e Blender, se era senza finestra)

Si registra cosi' (una volta, dalla radice del repo):
  claude mcp add blender -s project -- python strumenti/blender/mcp-blender.py
e dalla sessione successiva gli attrezzi si chiamano mcp__blender__*.

Prova a mano, senza Claude:
  python strumenti/blender/mcp-blender.py --prova
che fa il giro intero: avvia Blender, chiede la versione, spegne.

DOVE STA BLENDER: la variabile BLENDER, altrimenti la cartella di Program
Files con la versione piu' alta (oggi 5.2). Il ponte ascolta sulla porta
PONTE_BLENDER_PORTA (9877).
"""
import sys, os, json, socket, subprocess, time, glob

PORTA = int(os.environ.get('PONTE_BLENDER_PORTA', '9877'))
QUI = os.path.dirname(os.path.abspath(__file__))
PONTE = os.path.join(QUI, 'ponte-blender.py')
PROTOCOLLO = '2024-11-05'


def trova_blender():
    b = os.environ.get('BLENDER')
    if b and os.path.exists(b):
        return b
    cand = sorted(glob.glob(r'C:/Program Files/Blender Foundation/Blender */blender.exe'))
    if cand:
        return cand[-1]
    for c in ('/Applications/Blender.app/Contents/MacOS/Blender', '/usr/bin/blender', '/snap/bin/blender'):
        if os.path.exists(c):
            return c
    return None


def chiama(msg, timeout=600.0):
    """una richiesta al ponte, una risposta; la connessione e' per chiamata"""
    s = socket.create_connection(('127.0.0.1', PORTA), timeout=5.0)
    s.settimeout(timeout)
    try:
        s.sendall((json.dumps(msg) + '\n').encode('utf-8'))
        dati = b''
        while not dati.endswith(b'\n'):
            pezzo = s.recv(1 << 20)
            if not pezzo:
                break
            dati += pezzo
        return json.loads(dati.decode('utf-8'))
    finally:
        s.close()


def ponte_vivo():
    try:
        r = chiama({'id': 0, 'op': 'python', 'code': '_result = 1'}, timeout=10)
        return bool(r.get('ok'))
    except Exception:
        return False


def avvia_blender(gui=False, attesa=60.0):
    if ponte_vivo():
        return {'avviato': False, 'nota': 'il ponte rispondeva gia'}
    b = trova_blender()
    if not b:
        raise RuntimeError('Blender non trovato: imposta la variabile BLENDER col percorso di blender.exe')
    args = [b] + ([] if gui else ['--background']) + ['--python', PONTE]
    flags = 0
    if os.name == 'nt':
        flags = subprocess.CREATE_NEW_PROCESS_GROUP | getattr(subprocess, 'DETACHED_PROCESS', 0)
    log = open(os.path.join(QUI, 'ponte-blender.log'), 'ab')
    subprocess.Popen(args, stdout=log, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL,
                     creationflags=flags, close_fds=True)
    t0 = time.time()
    while time.time() - t0 < attesa:
        if ponte_vivo():
            return {'avviato': True, 'blender': b, 'gui': gui, 'secondi': round(time.time() - t0, 1)}
        time.sleep(0.5)
    raise RuntimeError('Blender avviato ma il ponte non risponde entro %.0f s (vedi %s)' % (attesa, os.path.join(QUI, 'ponte-blender.log')))


# ---------------------------------------------------------------- gli attrezzi
ATTREZZI = [
    {'name': 'blender_avvia',
     'description': "Avvia Blender col ponte di casa se non risponde gia' (gui=true apre la finestra, altrimenti gira senza). Torna subito se e' gia' vivo.",
     'inputSchema': {'type': 'object', 'properties': {'gui': {'type': 'boolean', 'description': 'true per vedere la finestra di Blender'}}}},
    {'name': 'blender_python',
     'description': "Esegue codice Python dentro Blender (bpy gia' importato). Se il codice assegna _result, il valore torna nella risposta; l'uscita standard torna in stdout.",
     'inputSchema': {'type': 'object', 'properties': {'code': {'type': 'string'}}, 'required': ['code']}},
    {'name': 'blender_info',
     'description': 'La scena di Blender: file, oggetti con posizione/rotazione/scala, camera, motore di resa, risoluzione, materiali, azioni.',
     'inputSchema': {'type': 'object', 'properties': {}}},
    {'name': 'blender_render',
     'description': 'Rende un fotogramma PNG della scena corrente nel percorso dato (assoluto), con larghezza/altezza opzionali, camera e motore (BLENDER_EEVEE_NEXT, CYCLES, BLENDER_WORKBENCH) opzionali.',
     'inputSchema': {'type': 'object', 'properties': {'path': {'type': 'string'}, 'w': {'type': 'integer'}, 'h': {'type': 'integer'},
                                                      'camera': {'type': 'string'}, 'motore': {'type': 'string'}}, 'required': ['path']}},
    {'name': 'blender_spegni',
     'description': 'Chiude il ponte (e Blender se era senza finestra).',
     'inputSchema': {'type': 'object', 'properties': {}}},
]


def esegui_attrezzo(nome, arg):
    arg = arg or {}
    if nome == 'blender_avvia':
        return avvia_blender(bool(arg.get('gui')))
    if not ponte_vivo():
        avvia_blender(False)
    if nome == 'blender_python':
        r = chiama({'id': 1, 'op': 'python', 'code': arg.get('code', '')})
    elif nome == 'blender_info':
        r = chiama({'id': 1, 'op': 'info'})
    elif nome == 'blender_render':
        r = chiama({'id': 1, 'op': 'render', 'path': arg['path'], 'w': arg.get('w'), 'h': arg.get('h'),
                    'camera': arg.get('camera'), 'motore': arg.get('motore')})
    elif nome == 'blender_spegni':
        r = chiama({'id': 1, 'op': 'spegni'})
    else:
        raise ValueError('attrezzo sconosciuto: ' + nome)
    if not r.get('ok'):
        raise RuntimeError(r.get('errore', 'errore nel ponte') + '\n' + (r.get('traccia') or ''))
    fuori = {k: v for k, v in r.items() if k in ('result', 'stdout') and v not in (None, '')}
    return fuori


# ---------------------------------------------------------------- JSON-RPC stdio
def scrivi(msg):
    sys.stdout.write(json.dumps(msg, ensure_ascii=False) + '\n')
    sys.stdout.flush()


def risposta(rid, risultato):
    scrivi({'jsonrpc': '2.0', 'id': rid, 'result': risultato})


def errore(rid, codice, testo):
    scrivi({'jsonrpc': '2.0', 'id': rid, 'error': {'code': codice, 'message': testo}})


def servi():
    for riga in sys.stdin:
        riga = riga.strip()
        if not riga:
            continue
        try:
            msg = json.loads(riga)
        except Exception:
            errore(None, -32700, 'JSON non leggibile')
            continue
        metodo = msg.get('method')
        rid = msg.get('id')
        if metodo == 'initialize':
            risposta(rid, {'protocolVersion': msg.get('params', {}).get('protocolVersion') or PROTOCOLLO,
                           'capabilities': {'tools': {}},
                           'serverInfo': {'name': 'blender-ponte-di-casa', 'version': '1.0'},
                           'instructions': "Blender via il ponte di casa (strumenti/blender/ponte-blender.py). Chiama blender_avvia una volta (gui=true per guardare), poi blender_python/blender_info/blender_render. Percorsi di resa assoluti."})
        elif metodo == 'notifications/initialized' or (metodo or '').startswith('notifications/'):
            continue
        elif metodo == 'ping':
            risposta(rid, {})
        elif metodo == 'tools/list':
            risposta(rid, {'tools': ATTREZZI})
        elif metodo == 'tools/call':
            p = msg.get('params', {})
            try:
                esito = esegui_attrezzo(p.get('name'), p.get('arguments'))
                risposta(rid, {'content': [{'type': 'text', 'text': json.dumps(esito, ensure_ascii=False, indent=1)}], 'isError': False})
            except Exception as e:
                risposta(rid, {'content': [{'type': 'text', 'text': 'ERRORE: ' + str(e)}], 'isError': True})
        elif rid is not None:
            errore(rid, -32601, 'metodo sconosciuto: %r' % (metodo,))


def prova():
    print('blender:', trova_blender())
    print('avvio:', avvia_blender(False))
    print('versione:', esegui_attrezzo('blender_python', {'code': 'import bpy\n_result = bpy.app.version_string'}))
    info = esegui_attrezzo('blender_info', {})['result']
    print('scena:', info['scena'], 'oggetti:', [o['nome'] for o in info['oggetti']])
    print('spegni:', esegui_attrezzo('blender_spegni', {}))


if __name__ == '__main__':
    if '--prova' in sys.argv:
        prova()
    else:
        servi()
