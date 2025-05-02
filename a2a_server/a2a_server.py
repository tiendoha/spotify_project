from flask import Flask, request, jsonify
import psycopg2
import logging
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Khởi tạo Flask app
app = Flask(__name__)

# Cấu hình logging
logging.basicConfig(
    filename='a2a_server.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Tải biến môi trường từ .env
load_dotenv()

# Cấu hình Gemini API
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

# Hàm kết nối database
def get_db_connection():
    try:
        conn = psycopg2.connect(
            dbname=os.getenv('DB_NAME', 'music_app'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', '123'),
            host=os.getenv('DB_HOST', '127.0.0.1'),
            port=os.getenv('DB_PORT', '5432')
        )
        logging.info("Database connection established")
        return conn
    except Exception as e:
        logging.error(f"Database connection failed: {str(e)}")
        raise Exception("Database connection failed")

# Hàm truy vấn tracks
def get_tracks():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT t.id, t.name, t.genre, a.name as artist_name
            FROM tracks t
            JOIN artists a ON t.artist_id = a.id
        """)
        tracks = cur.fetchall()
        cur.close()
        conn.close()
        logging.info("Successfully fetched tracks")
        return tracks
    except Exception as e:
        logging.error(f"Error fetching tracks: {str(e)}")
        return []

# Hàm gọi Gemini API để gợi ý bài hát
def recommend_song_with_gemini(input_text, tracks):
    try:
        # Tạo prompt cho Gemini
        track_list = "\n".join([f"- {t[1]} by {t[3]} ({t[2]})" for t in tracks])
        prompt = f"""
        User input: {input_text}
        Available tracks:
        {track_list}
        Recommend one song from the list that matches the user's request. 
        Return the recommendation in the format: 
        "Gợi ý bài hát: '[song name]' của [artist] ([genre])."
        If no match is found, return a random song in the same format.
        """
        
        # Gọi Gemini API
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        recommendation = response.text.strip()
        
        logging.info(f"Gemini recommendation: {recommendation}")
        return recommendation
    except Exception as e:
        logging.error(f"Gemini API error: {str(e)}")
        # Fallback: trả về bài hát ngẫu nhiên
        import random
        track = random.choice(tracks)
        return f"Gợi ý bài hát: '{track[1]}' của {track[3]} ({track[2]})."

# Endpoint JSON-RPC
@app.route('/jsonrpc', methods=['POST'])
def jsonrpc():
    try:
        # Lấy dữ liệu JSON
        data = request.get_json()
        if not data or 'method' not in data or 'params' not in data:
            return jsonify({
                'jsonrpc': '2.0',
                'error': {'code': -32600, 'message': 'Invalid Request'},
                'id': data.get('id', None)
            }), 400

        method = data['method']
        params = data['params']
        request_id = data.get('id')

        # Xử lý phương thức recommend_song
        if method == 'recommend_song':
            input_text = params.get('input', '')
            user_id = params.get('user_id')
            
            if not input_text or not user_id:
                return jsonify({
                    'jsonrpc': '2.0',
                    'error': {'code': -32602, 'message': 'Invalid params'},
                    'id': request_id
                }), 400

            # Lấy danh sách tracks
            tracks = get_tracks()
            if not tracks:
                return jsonify({
                    'jsonrpc': '2.0',
                    'error': {'code': -32000, 'message': 'No tracks available'},
                    'id': request_id
                }), 500

            # Gợi ý bài hát
            recommendation = recommend_song_with_gemini(input_text, tracks)
            
            return jsonify({
                'jsonrpc': '2.0',
                'result': recommendation,
                'id': request_id
            })

        else:
            return jsonify({
                'jsonrpc': '2.0',
                'error': {'code': -32601, 'message': 'Method not found'},
                'id': request_id
            }), 404

    except Exception as e:
        logging.error(f"Server error: {str(e)}")
        return jsonify({
            'jsonrpc': '2.0',
            'error': {'code': -32000, 'message': str(e)},
            'id': data.get('id', None)
        }), 500

# Chạy server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)