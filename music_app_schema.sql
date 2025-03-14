-- Tạo bảng --

CREATE TABLE auth_user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL,
    password VARCHAR(128) NOT NULL,
    date_joined TIMESTAMP NOT NULL
);

CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES auth_user(id) ON DELETE CASCADE,
    date_of_birth DATE,
    profile_image VARCHAR(255)
);

CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    genre VARCHAR(50) NOT NULL CHECK (genre IN ('pop', 'rock', 'jazz')),
    image VARCHAR(255)
);

CREATE TABLE albums (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    release_date DATE NOT NULL,
    image VARCHAR(255),
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE
);

CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    duration INTERVAL NOT NULL,
    file VARCHAR(255) NOT NULL,
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL
);

CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE
);

CREATE TABLE playlist_tracks (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    track_order INTEGER NOT NULL CHECK (track_order >= 0),
    CONSTRAINT unique_playlist_order UNIQUE (playlist_id, track_order)
);

CREATE TABLE followers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    CONSTRAINT unique_follow UNIQUE (user_id, artist_id)
);

CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    liked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_like UNIQUE (user_id, track_id)
);

-- Chèn dữ liệu --

INSERT INTO auth_user (id, username, email, password, date_joined) VALUES
(1, 'user1', 'user1@example.com', 'hashed_password1', '2025-03-01 10:00:00'),
(2, 'user2', 'user2@example.com', 'hashed_password2', '2025-03-02 15:30:00'),
(3, 'user3', 'user3@example.com', 'hashed_password3', '2025-03-03 09:15:00');

INSERT INTO profiles (id, user_id, date_of_birth, profile_image) VALUES
(1, 1, '1995-05-15', '/profiles/user1.jpg'),
(2, 2, '2000-12-25', '/profiles/user2.png'),
(3, 3, '1998-07-10', NULL);

INSERT INTO artists (id, name, genre, image) VALUES
(1, 'Taylor Swift', 'pop', '/artists/taylor.jpg'),
(2, 'Kendrick Lamar', 'pop', '/artists/kendrick.jpg'),  -- Sửa 'rap' thành 'pop'
(3, 'Billie Eilish', 'jazz', '/artists/billie.jpg');

INSERT INTO albums (id, name, release_date, image, artist_id) VALUES
(1, 'I Can Do It With A Broken Heart', '2020-12-11', '/albums/broken-heart.jpeg', 1),
(2, 'GNX', '1991-09-24', '/albums/GNX.jpeg', 2),
(3, 'Hit Me Hard and Soft', '1959-08-17', '/albums/hit-harder.jpeg', 3);

INSERT INTO tracks (id, name, duration, file, artist_id, album_id) VALUES
(1, 'Willow', '00:03:34', '/tracks/willow.mp3', 1, 1),
(2, 'Champagne Problems', '00:04:04', '/tracks/champagne.mp3', 1, 1),
(3, 'Smells Like Teen Spirit', '00:05:01', '/tracks/teen_spirit.mp3', 2, 2),
(4, 'Come As You Are', '00:03:38', '/tracks/come_as_you_are.mp3', 2, 2),
(5, 'So What', '00:09:22', '/tracks/so_what.mp3', 3, 3),
(6, 'Shake It Off', '00:03:39', '/tracks/shake_it_off.mp3', 1, NULL);

INSERT INTO playlists (id, name, image, user_id) VALUES
(1, 'My Pop Hits', '/playlists/pop_hits.jpg', 1),
(2, 'Rock Classics', '/playlists/rock_classics.jpg', 2);

INSERT INTO playlist_tracks (id, playlist_id, track_id, track_order) VALUES
(1, 1, 1, 0),
(2, 1, 2, 1),
(3, 1, 6, 2),
(4, 2, 3, 0),
(5, 2, 4, 1);

INSERT INTO followers (id, user_id, artist_id) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 3),
(4, 1, 3);

INSERT INTO likes (id, user_id, track_id, liked_at) VALUES
(1, 1, 1, '2025-03-04 12:00:00'),
(2, 1, 3, '2025-03-04 12:05:00'),
(3, 2, 4, '2025-03-04 14:30:00'),
(4, 3, 5, '2025-03-04 15:00:00');