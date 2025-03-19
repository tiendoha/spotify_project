-- Xóa database cũ (nếu cần) và tạo mới --
DROP DATABASE IF EXISTS music_app;
CREATE DATABASE music_app;

-- Kết nối tới database --
\c music_app

-- Tạo các bảng --

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL,
    password VARCHAR(128) NOT NULL,
    date_joined TIMESTAMP NOT NULL,
    role INTEGER NOT NULL DEFAULT 1 CHECK (role IN (1, 2))
);

CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
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
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
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
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    CONSTRAINT unique_follow UNIQUE (user_id, artist_id)
);

CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    liked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_like UNIQUE (user_id, track_id)
);

-- Chèn dữ liệu vào các bảng --
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE
);

-- Tạo chỉ mục để tăng hiệu suất truy vấn
CREATE INDEX messages_sender_receiver_idx ON messages (sender_id, receiver_id);

CREATE TABLE shared_listening_invitations (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL, -- Thời điểm bắt đầu phát nhạc của sender
    current_position INTERVAL NOT NULL, -- Vị trí hiện tại của bài hát (tính bằng giây)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    CONSTRAINT unique_invitation UNIQUE (sender_id, receiver_id, track_id)
);

CREATE INDEX shared_listening_idx ON shared_listening_invitations (sender_id, receiver_id);

CREATE TABLE music_videos (
    id SERIAL PRIMARY KEY,
    track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    video_file VARCHAR(255) NOT NULL,
    duration INTERVAL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_albums (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE user_album_tracks (
    id SERIAL PRIMARY KEY,
    user_album_id INTEGER NOT NULL REFERENCES user_albums(id) ON DELETE CASCADE,
    track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    track_order INTEGER NOT NULL CHECK (track_order >= 0),
    CONSTRAINT unique_user_album_order UNIQUE (user_album_id, track_order)
);

-- Users
INSERT INTO users (id, username, email, password, date_joined) VALUES
(1, 'user1', 'user1@example.com', 'hashed_password1', '2025-03-01 10:00:00'),
(2, 'user2', 'user2@example.com', 'hashed_password2', '2025-03-02 15:30:00'),
(3, 'user3', 'user3@example.com', 'hashed_password3', '2025-03-03 09:15:00'),
(4, 'user4', 'user4@example.com', 'hashed_password4', '2025-03-05 14:00:00'),
(5, 'user5', 'user5@example.com', 'hashed_password5', '2025-03-06 09:30:00'),
(6, 'user6', 'user6@example.com', 'hashed_password6', '2025-03-07 11:15:00'),
(7, 'john_doe', 'john@example.com', 'hashed_password7', '2025-03-08 08:00:00'),
(8, 'jane_smith', 'jane@example.com', 'hashed_password8', '2025-03-08 09:00:00'),
(9, 'mike_jones', 'mike@example.com', 'hashed_password9', '2025-03-08 10:00:00'),
(10, 'emma_watson', 'emma@example.com', 'hashed_password10', '2025-03-08 11:00:00'),
(11, 'peter_parker', 'peter@example.com', 'hashed_password11', '2025-03-09 12:00:00'),
(12, 'sarah_connor', 'sarah@example.com', 'hashed_password12', '2025-03-09 13:00:00'),
(13, 'david_bowie', 'david@example.com', 'hashed_password13', '2025-03-09 14:00:00'),
(14, 'linda_hamilton', 'linda@example.com', 'hashed_password14', '2025-03-09 15:00:00'),
(15, 'chris_evans', 'chris@example.com', 'hashed_password15', '2025-03-10 16:00:00'),
(16, 'natasha_romanoff', 'natasha@example.com', 'hashed_password16', '2025-03-10 17:00:00'),
(17, 'tony_stark', 'tony@example.com', 'hashed_password17', '2025-03-10 18:00:00'),
(18, 'bruce_wayne', 'bruce@example.com', 'hashed_password18', '2025-03-11 19:00:00'),
(19, 'clark_kent', 'clark@example.com', 'hashed_password19', '2025-03-11 20:00:00'),
(20, 'diana_prince', 'diana@example.com', 'hashed_password20', '2025-03-11 21:00:00'),
(21, 'steve_rogers', 'steve@example.com', 'hashed_password21', '2025-03-12 08:00:00'),
(22, 'wanda_maximoff', 'wanda@example.com', 'hashed_password22', '2025-03-12 09:00:00'),
(23, 'thor_odinson', 'thor@example.com', 'hashed_password23', '2025-03-12 10:00:00'),
(24, 'loki_laufeyson', 'loki@example.com', 'hashed_password24', '2025-03-12 11:00:00'),
(25, 'gamora_zen', 'gamora@example.com', 'hashed_password25', '2025-03-13 12:00:00'),
(26, 'peter_quill', 'peterq@example.com', 'hashed_password26', '2025-03-13 13:00:00');

-- Profiles
INSERT INTO profiles (id, user_id, date_of_birth, profile_image) VALUES
(1, 1, '1995-05-15', '/profiles/user1.jpg'),
(2, 2, '2000-12-25', '/profiles/user2.png'),
(3, 3, '1998-07-10', NULL),
(4, 4, '1990-08-20', '/profiles/user4.png'),
(5, 5, '2002-03-12', '/profiles/user5.png'),
(6, 6, '1985-11-30', NULL),
(7, 7, '1992-01-15', '/profiles/john.png'),
(8, 8, '1993-02-20', '/profiles/jane.png'),
(9, 9, '1988-03-25', NULL),
(10, 10, '1995-04-10', '/profiles/emma.png'),
(11, 11, '1996-05-05', '/profiles/peter.png'),
(12, 12, '1987-06-15', NULL),
(13, 13, '1990-07-20', '/profiles/david.png'),
(14, 14, '1985-08-25', '/profiles/linda.png'),
(15, 15, '1991-09-30', NULL),
(16, 16, '1994-10-10', '/profiles/natasha.png'),
(17, 17, '1989-11-15', '/profiles/tony.png'),
(18, 18, '1986-12-20', NULL),
(19, 19, '1993-01-25', '/profiles/clark.png'),
(20, 20, '1997-02-28', '/profiles/diana.png'),
(21, 21, '1988-03-15', NULL),
(22, 22, '1995-04-20', '/profiles/wanda.png'),
(23, 23, '1992-05-25', '/profiles/thor.png'),
(24, 24, '1990-06-30', NULL),
(25, 25, '1996-07-10', '/profiles/gamora.png'),
(26, 26, '1994-08-15', '/profiles/peterq.png');

-- Artists
INSERT INTO artists (id, name, genre, image) VALUES
(1, 'Taylor Swift', 'pop', '/artists/taylor.png'),
(2, 'Kendrick Lamar', 'pop', '/artists/kendrick.png'), 
(3, 'Billie Eilish', 'jazz', '/artists/billie.png'),
(4, 'The Beatles', 'rock', '/artists/beatles.png'),
(5, 'Miles Davis', 'jazz', '/artists/miles.png'),
(6, 'Adele', 'pop', '/artists/adele.png'),
(7, 'Nirvana', 'rock', '/artists/nirvana.png'),
(8, 'Ella Fitzgerald', 'jazz', '/artists/ella.png');

-- Albums
INSERT INTO albums (id, name, release_date, image, artist_id) VALUES
(1, 'I Can Do It With A Broken Heart', '2020-12-11', '/albums/broken-heart.jpeg', 1),
(2, 'GNX', '1991-09-24', '/albums/GNX.jpeg', 2),
(3, 'Hit Me Hard and Soft', '1959-08-17', '/albums/hit-harder.jpeg', 3),
(4, 'Abbey Road', '1969-09-26', '/albums/abbey_road.png', 4),
(5, 'Kind of Blue', '1959-08-17', '/albums/kind_of_blue.png', 5),
(6, '25', '2015-11-20', '/albums/25.png', 6),
(7, 'Nevermind', '1991-09-24', '/albums/nevermind.png', 7),
(8, 'Ella and Louis', '1956-10-01', '/albums/ella_louis.png', 8),
(9, 'Reputation', '2017-11-10', '/albums/reputation.png', 1),
(10, 'Damn', '2017-04-14', '/albums/damn.png', 2);

-- Tracks
INSERT INTO tracks (id, name, duration, file, artist_id, album_id) VALUES
(1, 'Willow', '00:03:34', '/tracks/willow.mp3', 1, 1),
(2, 'Champagne Problems', '00:04:04', '/tracks/champagne.mp3', 1, 1),
(3, 'Smells Like Teen Spirit', '00:05:01', '/tracks/teen_spirit.mp3', 2, 2),
(4, 'Come As You Are', '00:03:38', '/tracks/come_as_you_are.mp3', 2, 2),
(5, 'So What', '00:09:22', '/tracks/so_what.mp3', 3, 3),
(6, 'Shake It Off', '00:03:39', '/tracks/shake_it_off.mp3', 1, NULL),
(7, 'Come Together', '00:04:19', '/tracks/come_together.mp3', 4, 4),
(8, 'Something', '00:03:02', '/tracks/something.mp3', 4, 4),
(9, 'Here Comes the Sun', '00:03:06', '/tracks/here_comes_the_sun.mp3', 4, 4),
(10, 'Blue in Green', '00:05:37', '/tracks/blue_in_green.mp3', 5, 5),
(11, 'Freddie Freeloader', '00:09:46', '/tracks/freddie_freeloader.mp3', 5, 5),
(12, 'Hello', '00:04:55', '/tracks/hello.mp3', 6, 6),
(13, 'Rolling in the Deep', '00:03:48', '/tracks/rolling_in_the_deep.mp3', 6, 6),
(14, 'Someone Like You', '00:04:45', '/tracks/someone_like_you.mp3', 6, 6),
(15, 'Breed', '00:03:03', '/tracks/breed.mp3', 7, 7),
(16, 'Lithium', '00:04:17', '/tracks/lithium.mp3', 7, 7),
(17, 'Summertime', '00:04:58', '/tracks/summertime.mp3', 8, 8),
(18, 'Cheek to Cheek', '00:05:52', '/tracks/cheek_to_cheek.mp3', 8, 8),
(19, 'Blank Space', '00:03:51', '/tracks/blank_space.mp3', 1, 9),
(20, 'Bad Blood', '00:03:31', '/tracks/bad_blood.mp3', 1, 9),
(21, 'HUMBLE.', '00:02:57', '/tracks/humble.mp3', 2, 10),
(22, 'DNA.', '00:03:05', '/tracks/dna.mp3', 2, 10),
(23, 'Yesterday', '00:02:05', '/tracks/yesterday.mp3', 4, NULL),
(24, 'Let It Be', '00:04:03', '/tracks/let_it_be.mp3', 4, NULL),
(25, 'All of Me', '00:04:29', '/tracks/all_of_me.mp3', 5, NULL),
(26, 'Set Fire to the Rain', '00:04:02', '/tracks/set_fire_to_the_rain.mp3', 6, NULL),
(27, 'Heart-Shaped Box', '00:04:41', '/tracks/heart_shaped_box.mp3', 7, NULL),
(28, 'My Funny Valentine', '00:05:00', '/tracks/my_funny_valentine.mp3', 8, NULL),
(29, 'Love Story', '00:03:55', '/tracks/love_story.mp3', 1, NULL),
(30, 'Loyalty', '00:03:47', '/tracks/loyalty.mp3', 2, NULL),
(31, 'Bad Guy', '00:03:14', '/tracks/bad_guy.mp3', 3, NULL),
(32, 'Hey Jude', '00:07:11', '/tracks/hey_jude.mp3', 4, NULL),
(33, 'So What (Live)', '00:08:45', '/tracks/so_what_live.mp3', 5, NULL),
(34, 'Skyfall', '00:04:46', '/tracks/skyfall.mp3', 6, NULL),
(35, 'Rape Me', '00:02:50', '/tracks/rape_me.mp3', 7, NULL),
(36, 'Misty', '00:03:00', '/tracks/misty.mp3', 8, NULL);

-- Playlists
INSERT INTO playlists (id, name, image, user_id) VALUES
(1, 'My Pop Hits', '/playlists/pop_hits.jpg', 1),
(2, 'Rock Classics', '/playlists/rock_classics.jpg', 2),
(3, 'Jazz Vibes', '/playlists/jazz_vibes.jpg', 4),
(4, 'Rock Legends', '/playlists/rock_legends.jpg', 5),
(5, 'Pop Favorites', '/playlists/pop_favorites.jpg', 6),
(6, 'Morning Pop', '/playlists/morning_pop.jpg', 7),
(7, 'Rock Nights', '/playlists/rock_nights.jpg', 8),
(8, 'Jazz Chill', '/playlists/jazz_chill.jpg', 9),
(9, 'Pop Classics', '/playlists/pop_classics.jpg', 10),
(10, 'Rock Anthems', '/playlists/rock_anthems.jpg', 11),
(11, 'Jazz Grooves', '/playlists/jazz_grooves.jpg', 12),
(12, 'Party Hits', '/playlists/party_hits.jpg', 13),
(13, '90s Rock', '/playlists/90s_rock.jpg', 14),
(14, 'Jazz Legends', '/playlists/jazz_legends.jpg', 15),
(15, 'Pop Ballads', '/playlists/pop_ballads.jpg', 16),
(16, 'Rock Favorites', '/playlists/rock_favorites.jpg', 17),
(17, 'Jazz Nights', '/playlists/jazz_nights.jpg', 18),
(18, 'Pop Energy', '/playlists/pop_energy.jpg', 19),
(19, 'Classic Rock', '/playlists/classic_rock.jpg', 20),
(20, 'Jazz Moods', '/playlists/jazz_moods.jpg', 21),
(21, 'Pop Vibes', '/playlists/pop_vibes.jpg', 22),
(22, 'Rock Journey', '/playlists/rock_journey.jpg', 23),
(23, 'Jazz Classics', '/playlists/jazz_classics.jpg', 24),
(24, 'Pop Hits 2025', '/playlists/pop_hits_2025.jpg', 25),
(25, 'Rock Revival', '/playlists/rock_revival.jpg', 26);

-- Playlist Tracks
INSERT INTO playlist_tracks (id, playlist_id, track_id, track_order) VALUES
(1, 1, 1, 0),
(2, 1, 2, 1),
(3, 1, 6, 2),
(4, 2, 3, 0),
(5, 2, 4, 1),
(6, 3, 10, 0),  -- Jazz Vibes: Blue in Green
(7, 3, 11, 1),  -- Jazz Vibes: Freddie Freeloader
(8, 3, 17, 2),  -- Jazz Vibes: Summertime
(9, 3, 28, 3),  -- Jazz Vibes: My Funny Valentine
(10, 4, 7, 0),  -- Rock Legends: Come Together
(11, 4, 15, 1), -- Rock Legends: Breed
(12, 4, 16, 2), -- Rock Legends: Lithium
(13, 4, 27, 3), -- Rock Legends: Heart-Shaped Box
(14, 5, 12, 0), -- Pop Favorites: Hello
(15, 5, 13, 1), -- Pop Favorites: Rolling in the Deep
(16, 5, 19, 2), -- Pop Favorites: Blank Space
(17, 5, 29, 3), -- Pop Favorites: Love Story
(18, 6, 12, 0),  -- Morning Pop: Hello
(19, 6, 19, 1),  -- Morning Pop: Blank Space
(20, 7, 7, 0),   -- Rock Nights: Come Together
(21, 7, 15, 1),  -- Rock Nights: Breed
(22, 8, 10, 0),  -- Jazz Chill: Blue in Green
(23, 8, 17, 1),  -- Jazz Chill: Summertime
(24, 9, 13, 0),  -- Pop Classics: Rolling in the Deep
(25, 9, 14, 1),  -- Pop Classics: Someone Like You
(26, 10, 16, 0), -- Rock Anthems: Lithium
(27, 10, 27, 1), -- Rock Anthems: Heart-Shaped Box
(28, 11, 11, 0), -- Jazz Grooves: Freddie Freeloader
(29, 11, 28, 1), -- Jazz Grooves: My Funny Valentine
(30, 12, 19, 0), -- Party Hits: Blank Space
(31, 12, 20, 1), -- Party Hits: Bad Blood
(32, 13, 3, 0),  -- 90s Rock: Smells Like Teen Spirit
(33, 13, 4, 1),  -- 90s Rock: Come As You Are
(34, 14, 5, 0),  -- Jazz Legends: So What
(35, 14, 18, 1), -- Jazz Legends: Cheek to Cheek
(36, 15, 14, 0), -- Pop Ballads: Someone Like You
(37, 15, 26, 1), -- Pop Ballads: Set Fire to the Rain
(38, 16, 9, 0),  -- Rock Favorites: Here Comes the Sun
(39, 16, 23, 1), -- Rock Favorites: Yesterday
(40, 17, 25, 0), -- Jazz Nights: All of Me
(41, 17, 36, 1), -- Jazz Nights: Misty
(42, 18, 1, 0),  -- Pop Energy: Willow
(43, 18, 29, 1), -- Pop Energy: Love Story
(44, 19, 8, 0),  -- Classic Rock: Something
(45, 19, 24, 1), -- Classic Rock: Let It Be
(46, 20, 17, 0), -- Jazz Moods: Summertime
(47, 20, 33, 1), -- Jazz Moods: So What (Live)
(48, 21, 6, 0),  -- Pop Vibes: Shake It Off
(49, 21, 31, 1), -- Pop Vibes: Bad Guy
(50, 22, 15, 0), -- Rock Journey: Breed
(51, 22, 35, 1), -- Rock Journey: Rape Me
(52, 23, 11, 0), -- Jazz Classics: Freddie Freeloader
(53, 23, 28, 1), -- Jazz Classics: My Funny Valentine
(54, 24, 12, 0), -- Pop Hits 2025: Hello
(55, 24, 34, 1), -- Pop Hits 2025: Skyfall
(56, 25, 7, 0),  -- Rock Revival: Come Together
(57, 25, 32, 1); -- Rock Revival: Hey Jude

-- Followers
INSERT INTO followers (id, user_id, artist_id) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 3),
(4, 1, 3),
(5, 4, 5),  -- user4 follows Miles Davis
(6, 5, 4),  -- user5 follows The Beatles
(7, 6, 6),  -- user6 follows Adele
(8, 4, 8),  -- user4 follows Ella Fitzgerald
(9, 5, 7),  -- user5 follows Nirvana
(10, 7, 6),   -- john_doe follows Adele
(11, 8, 4),   -- jane_smith follows The Beatles
(12, 9, 5),   -- mike_jones follows Miles Davis
(13, 10, 1),  -- emma_watson follows Taylor Swift
(14, 11, 7),  -- peter_parker follows Nirvana
(15, 12, 8),  -- sarah_connor follows Ella Fitzgerald
(16, 13, 2),  -- david_bowie follows Kendrick Lamar
(17, 14, 3),  -- linda_hamilton follows Billie Eilish
(18, 15, 4),  -- chris_evans follows The Beatles
(19, 16, 6),  -- natasha_romanoff follows Adele
(20, 17, 1),  -- tony_stark follows Taylor Swift
(21, 18, 5),  -- bruce_wayne follows Miles Davis
(22, 19, 7),  -- clark_kent follows Nirvana
(23, 20, 8),  -- diana_prince follows Ella Fitzgerald
(24, 21, 2),  -- steve_rogers follows Kendrick Lamar
(25, 22, 3),  -- wanda_maximoff follows Billie Eilish
(26, 23, 4),  -- thor_odinson follows The Beatles
(27, 24, 6),  -- loki_laufeyson follows Adele
(28, 25, 1),  -- gamora_zen follows Taylor Swift
(29, 26, 7);  -- peter_quill follows Nirvana

-- Likes
INSERT INTO likes (id, user_id, track_id, liked_at) VALUES
(1, 1, 1, '2025-03-04 12:00:00'),
(2, 1, 3, '2025-03-04 12:05:00'),
(3, 2, 4, '2025-03-04 14:30:00'),
(4, 3, 5, '2025-03-04 15:00:00'),
(5, 4, 10, '2025-03-05 15:00:00'), -- user4 likes Blue in Green
(6, 4, 17, '2025-03-05 15:05:00'), -- user4 likes Summertime
(7, 5, 7, '2025-03-06 10:00:00'),  -- user5 likes Come Together
(8, 5, 16, '2025-03-06 10:10:00'), -- user5 likes Lithium
(9, 6, 12, '2025-03-07 12:00:00'), -- user6 likes Hello
(10, 6, 19, '2025-03-07 12:05:00'), -- user6 likes Blank Space
(11, 7, 12, '2025-03-08 08:30:00'),  -- john_doe likes Hello
(12, 8, 7, '2025-03-08 09:30:00'),   -- jane_smith likes Come Together
(13, 9, 10, '2025-03-08 10:30:00'),  -- mike_jones likes Blue in Green
(14, 10, 19, '2025-03-08 11:30:00'), -- emma_watson likes Blank Space
(15, 11, 16, '2025-03-09 12:30:00'), -- peter_parker likes Lithium
(16, 12, 17, '2025-03-09 13:30:00'), -- sarah_connor likes Summertime
(17, 13, 21, '2025-03-09 14:30:00'), -- david_bowie likes HUMBLE.
(18, 14, 31, '2025-03-09 15:30:00'), -- linda_hamilton likes Bad Guy
(19, 15, 9, '2025-03-10 16:30:00'),  -- chris_evans likes Here Comes the Sun
(20, 16, 13, '2025-03-10 17:30:00'), -- natasha_romanoff likes Rolling in the Deep
(21, 17, 1, '2025-03-10 18:30:00'),  -- tony_stark likes Willow
(22, 18, 25, '2025-03-11 19:30:00'), -- bruce_wayne likes All of Me
(23, 19, 27, '2025-03-11 20:30:00'), -- clark_kent likes Heart-Shaped Box
(24, 20, 18, '2025-03-11 21:30:00'), -- diana_prince likes Cheek to Cheek
(25, 21, 22, '2025-03-12 08:30:00'), -- steve_rogers likes DNA.
(26, 22, 31, '2025-03-12 09:30:00'), -- wanda_maximoff likes Bad Guy
(27, 23, 32, '2025-03-12 10:30:00'), -- thor_odinson likes Hey Jude
(28, 24, 34, '2025-03-12 11:30:00'), -- loki_laufeyson likes Skyfall
(29, 25, 29, '2025-03-13 12:30:00'), -- gamora_zen likes Love Story
(30, 26, 35, '2025-03-13 13:30:00'); -- peter_quill likes Rape Me
