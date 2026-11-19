from flask import Flask, request, jsonify, send_from_directory
import os
import time
import json
import urllib.request
import urllib.error

app = Flask(__name__)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

LAST_SENT = {}

@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/api/support', methods=['POST'])
def support():
    ip = request.headers.get('X-Forwarded-For', request.remote_addr or 'unknown').split(',')[0].strip()
    now = time.time()
    if now - LAST_SENT.get(ip, 0) < 15:
        return jsonify({'ok': False, 'error': 'Слишком часто. Подождите 15 секунд.'}), 429

    data = request.get_json(silent=True) or {}
    contact = str(data.get('contact', '')).strip()[:100]
    message = str(data.get('message', '')).strip()[:1500]

    if not contact or not message:
        return jsonify({'ok': False, 'error': 'Заполните контакт и текст сообщения.'}), 400

    token = os.environ.get('TG_BOT_TOKEN', '').strip()
    chat_id = os.environ.get('TG_CHAT_ID', '').strip()

    if not token or not chat_id:
        return jsonify({'ok': False, 'error': 'Не заданы ключи бота в настройках Render.'}), 500

    text = (
        f"🆘 Новое обращение с сайта QAIRU\n\n"
        f"👤 Контакт: {contact}\n"
        f"💬 Сообщение:\n{message}"
    )

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({
        'chat_id': chat_id,
        'text': text
    }).encode('utf-8')

    req = urllib.request.Request(
        url,
        data=payload,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                LAST_SENT[ip] = now
                return jsonify({'ok': True})
    except urllib.error.HTTPError as e:
        return jsonify({'ok': False, 'error': f'Ошибка Telegram API ({e.code})'}), 502
    except Exception:
        return jsonify({'ok': False, 'error': 'Не удалось связаться с Telegram.'}), 502

    return jsonify({'ok': False, 'error': 'Неизвестная ошибка отправки.'}), 500

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(BASE_DIR, path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)