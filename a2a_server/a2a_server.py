from flask import Flask, request, jsonify
import psycopg2
import logging
import os
from dotenv import load_dotenv
import google.generativeai as genai
import random

# Initialize Flask app
app = Flask(__name__)

# Configure logging
logging.basicConfig(
    filename='a2a_server.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Load environment variables from .env
load_dotenv()

# Configure Gemini API
api_key = os.getenv('GOOGLE_API_KEY')
if not api_key:
    logging.error("GOOGLE_API_KEY is missing in the environment variables")
    raise ValueError("GOOGLE_API_KEY is not set in the environment")
genai.configure(api_key=api_key, transport="rest")

# Connect to the database
def get_db_connection():
    try:
        conn = psycopg2.connect(
            dbname=os.getenv('DB_NAME', 'music_app'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', '123'),
            host=os.getenv('DB_HOST', '127.0.0.1'),
            port=os.getenv('DB_PORT', '5432')
        )
        logging.info("Database connection established successfully")
        return conn
    except Exception as e:
        logging.error(f"Failed to connect to the database: {str(e)}")
        raise Exception("Failed to connect to the database")

# Fetch list of tracks
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
        logging.info("Fetched tracks successfully")
        return [(t[0], t[1], t[2], t[3]) for t in tracks]  # (id, name, genre, artist_name)
    except Exception as e:
        logging.error(f"Error fetching tracks: {str(e)}")
        return []

# Fetch list of albums
def get_albums():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT al.id, al.name, a.name as artist_name
            FROM albums al
            JOIN artists a ON al.artist_id = a.id
        """)
        albums = cur.fetchall()
        cur.close()
        conn.close()
        logging.info("Fetched albums successfully")
        return [(a[0], a[1], a[2]) for a in albums]  # (id, name, artist_name)
    except Exception as e:
        logging.error(f"Error fetching albums: {str(e)}")
        return []

# Fetch list of artists
def get_artists():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT name FROM artists")
        artists = [row[0] for row in cur.fetchall()]
        cur.close()
        conn.close()
        logging.info("Fetched artists successfully")
        return artists
    except Exception as e:
        logging.error(f"Error fetching artists: {str(e)}")
        return []

# Fetch list of genres
def get_genres():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT DISTINCT genre FROM tracks WHERE genre IS NOT NULL")
        genres = [row[0] for row in cur.fetchall() if row[0] is not None]
        cur.close()
        conn.close()
        logging.info("Fetched genres successfully")
        return genres
    except Exception as e:
        logging.error(f"Error fetching genres: {str(e)}")
        return []

# Fetch total number of songs
def get_total_songs():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM tracks")
        total_songs = cur.fetchone()[0]
        cur.close()
        conn.close()
        logging.info(f"Total number of songs: {total_songs}")
        return total_songs
    except Exception as e:
        logging.error(f"Error fetching total number of songs: {str(e)}")
        return 0

# Fetch total number of artists
def get_total_artists():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM artists")
        total_artists = cur.fetchone()[0]
        cur.close()
        conn.close()
        logging.info(f"Total number of artists: {total_artists}")
        return total_artists
    except Exception as e:
        logging.error(f"Error fetching total number of artists: {str(e)}")
        return 0

# Fetch the most liked song
def get_most_liked_song():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT t.name, a.name as artist_name, COUNT(l.id) as like_count
            FROM tracks t
            JOIN artists a ON t.artist_id = a.id
            LEFT JOIN likes l ON t.id = l.track_id
            GROUP BY t.id, t.name, a.name
            ORDER BY like_count DESC
            LIMIT 1
        """)
        most_liked = cur.fetchone()
        cur.close()
        conn.close()
        if most_liked:
            logging.info(f"Most liked song: {most_liked[0]} by {most_liked[1]} with {most_liked[2]} likes")
            return most_liked
        else:
            logging.info("No likes found in the system")
            return None
    except Exception as e:
        logging.error(f"Error fetching most liked song: {str(e)}")
        return None

# Query Gemini API to answer user requests
def query_gemini(input_text, tracks, albums, artists, genres, total_songs, total_artists, most_liked_song):
    try:
        # Create data lists for Gemini
        track_list = "\n".join([f"- {t[1]} by {t[3]} ({t[2] if t[2] else 'No genre'})" for t in tracks])
        album_list = "\n".join([f"- {a[1]} by {a[2]}" for a in albums])
        artist_list = "\n".join([f"- {a}" for a in artists])
        genre_list = "\n".join([f"- {g}" for g in genres])

        # System information
        system_info = f"""
        Total number of songs in the system: {total_songs}
        Total number of artists in the system: {total_artists}
        """
        if most_liked_song:
            system_info += f"Most liked song: '{most_liked_song[0]}' by {most_liked_song[1]} with {most_liked_song[2]} likes."

        # Create a flexible prompt
        prompt = f"""
        User input: {input_text}
        
        Available data in the system:
        {system_info}
        
        List of tracks:
        {track_list}
        
        List of albums:
        {album_list}
        
        List of artists:
        {artist_list}
        
        List of genres:
        {genre_list}
        
        Based on the user's input, respond naturally and clearly in English. The user may request:
        - Song recommendations (e.g., "suggest a song", "suggest 2 songs by Taylor Swift", "suggest a pop song").
        - Album recommendations (e.g., "suggest an album by The Beatles", "suggest a jazz album").
        - Artist information (e.g., "how many artists are there?", "which artists are in the system?").
        - Song information (e.g., "how many songs are there?", "which song has the most likes?").
        
        Respond naturally without a fixed format, but ensure accuracy based on the provided data. 
        If the user requests multiple songs or albums, list them casually, as in a conversation. 
        If no relevant data is available, respond clearly and naturally.
        """
        
        # Use only gemini-1.5-flash
        available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        logging.info(f"Available Gemini models supporting generateContent: {available_models}")
        if 'models/gemini-1.5-flash-latest' not in available_models:
            raise ValueError("gemini-1.5-flash is not available or does not support generateContent")
        model = genai.GenerativeModel('models/gemini-1.5-flash-latest')
        response = model.generate_content(prompt)
        answer = response.text.strip()
        
        logging.info(f"Gemini response: {answer}")
        return answer
    except Exception as e:
        logging.error(f"Gemini API error: {str(e)}")
        return f"Sorry, I couldn't process your request because gemini-1.5-flash is unavailable or encountered an error: {str(e)}"

# Define JSON-RPC endpoint
@app.route('/jsonrpc', methods=['POST'])
def jsonrpc():
    try:
        # Get JSON data
        data = request.get_json()
        if not data or 'method' not in data or 'params' not in data:
            return jsonify({
                'jsonrpc': '2.0',
                'error': {'code': -32600, 'message': 'Invalid request'},
                'id': data.get('id', None)
            }), 400

        method = data['method']
        params = data['params']
        request_id = data.get('id')

        # Handle recommend_song method
        if method == 'recommend_song':
            input_text = params.get('input', '')
            user_id = params.get('user_id')
            
            if not input_text or not user_id:
                return jsonify({
                    'jsonrpc': '2.0',
                    'error': {'code': -32602, 'message': 'Invalid parameters'},
                    'id': request_id
                }), 400

            # Fetch data from the database
            tracks = get_tracks()
            albums = get_albums()
            artists = get_artists()
            genres = get_genres()
            total_songs = get_total_songs()
            total_artists = get_total_artists()
            most_liked_song = get_most_liked_song()
            
            if not tracks and not albums:
                return jsonify({
                    'jsonrpc': '2.0',
                    'error': {'code': -32000, 'message': 'No tracks or albums available'},
                    'id': request_id
                }), 500

            # Call Gemini to generate a response
            response = query_gemini(input_text, tracks, albums, artists, genres, total_songs, total_artists, most_liked_song)
            
            return jsonify({
                'jsonrpc': "2.0",
                'result': response,
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
            'id': None
        }), 500

# Run the server on port 5001
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)