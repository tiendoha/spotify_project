-- -- Xóa database cũ (nếu cần) và tạo mới --
-- DROP DATABASE IF EXISTS music_app;
-- CREATE DATABASE music_app;

-- -- Kết nối tới database --
-- \c music_app

-- -- Tạo các bảng --

-- CREATE TABLE users (
--     id SERIAL PRIMARY KEY,
--     username VARCHAR(150) NOT NULL UNIQUE,
--     email VARCHAR(254) NOT NULL,
--     password VARCHAR(128) NOT NULL,
--     date_joined TIMESTAMP NOT NULL,
--     role INTEGER NOT NULL DEFAULT 1 CHECK (role IN (1, 2))
-- );

-- CREATE TABLE profiles (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
--     date_of_birth DATE,
--     profile_image VARCHAR(255)
-- );

-- CREATE TABLE artists (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     genre VARCHAR(50) NOT NULL CHECK (genre IN ('pop', 'rock', 'jazz')),
--     image VARCHAR(255)
-- );

-- CREATE TABLE albums (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     release_date DATE NOT NULL,
--     image VARCHAR(255),
--     artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE
-- );

-- CREATE TABLE tracks (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     duration INTERVAL NOT NULL,
--     file VARCHAR(255) NOT NULL,
--     artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
--     album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL
-- );

-- CREATE TABLE playlists (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     image VARCHAR(255),
--     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE playlist_tracks (
--     id SERIAL PRIMARY KEY,
--     playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
--     track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
--     track_order INTEGER NOT NULL CHECK (track_order >= 0),
--     CONSTRAINT unique_playlist_order UNIQUE (playlist_id, track_order)
-- );

-- CREATE TABLE followers (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
--     CONSTRAINT unique_follow UNIQUE (user_id, artist_id)
-- );

-- CREATE TABLE likes (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
--     liked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     CONSTRAINT unique_like UNIQUE (user_id, track_id)
-- );

-- -- Chèn dữ liệu vào các bảng --
-- CREATE TABLE messages (
--     id SERIAL PRIMARY KEY,
--     sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     content TEXT NOT NULL,
--     sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     is_read BOOLEAN NOT NULL DEFAULT FALSE
-- );

-- -- Tạo chỉ mục để tăng hiệu suất truy vấn
-- CREATE INDEX messages_sender_receiver_idx ON messages (sender_id, receiver_id);

-- CREATE TABLE shared_listening_invitations (
--     id SERIAL PRIMARY KEY,
--     sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
--     start_time TIMESTAMP NOT NULL, -- Thời điểm bắt đầu phát nhạc của sender
--     current_position INTERVAL NOT NULL, -- Vị trí hiện tại của bài hát (tính bằng giây)
--     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
--     CONSTRAINT unique_invitation UNIQUE (sender_id, receiver_id, track_id)
-- );

-- CREATE INDEX shared_listening_idx ON shared_listening_invitations (sender_id, receiver_id);

-- CREATE TABLE music_videos (
--     id SERIAL PRIMARY KEY,
--     track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
--     video_file VARCHAR(255) NOT NULL,
--     duration INTERVAL,
--     uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE user_albums (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     image VARCHAR(255),
--     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );
-- CREATE TABLE user_album_tracks (
--     id SERIAL PRIMARY KEY,
--     user_album_id INTEGER NOT NULL REFERENCES user_albums(id) ON DELETE CASCADE,
--     track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
--     track_order INTEGER NOT NULL CHECK (track_order >= 0),
--     CONSTRAINT unique_user_album_order UNIQUE (user_album_id, track_order)
-- );

INSERT INTO users (id, username, email, password, date_joined, role) VALUES
(1, 'user1', 'user1@example.com', 'hashed_password1', '2025-03-01 10:00:00', 1),
(2, 'user2', 'user2@example.com', 'hashed_password2', '2025-03-02 15:30:00', 2), -- Admin
(3, 'user3', 'user3@example.com', 'hashed_password3', '2025-03-03 09:15:00', 1),
(4, 'user4', 'user4@example.com', 'hashed_password4', '2025-03-05 14:00:00', 1),
(5, 'user5', 'user5@example.com', 'hashed_password5', '2025-03-06 09:30:00', 1),
(6, 'user6', 'user6@example.com', 'hashed_password6', '2025-03-07 11:15:00', 1),
(7, 'john_doe', 'john@example.com', 'hashed_password7', '2025-03-08 08:00:00', 1),
(8, 'jane_smith', 'jane@example.com', 'hashed_password8', '2025-03-08 09:00:00', 1),
(9, 'mike_jones', 'mike@example.com', 'hashed_password9', '2025-03-08 10:00:00', 1),
(10, 'emma_watson', 'emma@example.com', 'hashed_password10', '2025-03-08 11:00:00', 1),
(11, 'peter_parker', 'peter@example.com', 'hashed_password11', '2025-03-09 12:00:00', 1),
(12, 'sarah_connor', 'sarah@example.com', 'hashed_password12', '2025-03-09 13:00:00', 1),
(13, 'david_bowie', 'david@example.com', 'hashed_password13', '2025-03-09 14:00:00', 1),
(14, 'linda_hamilton', 'linda@example.com', 'hashed_password14', '2025-03-09 15:00:00', 1),
(15, 'chris_evans', 'chris@example.com', 'hashed_password15', '2025-03-10 16:00:00', 1),
(16, 'natasha_romanoff', 'natasha@example.com', 'hashed_password16', '2025-03-10 17:00:00', 1),
(17, 'tony_stark', 'tony@example.com', 'hashed_password17', '2025-03-10 18:00:00', 1),
(18, 'bruce_wayne', 'bruce@example.com', 'hashed_password18', '2025-03-11 19:00:00', 1),
(19, 'clark_kent', 'clark@example.com', 'hashed_password19', '2025-03-11 20:00:00', 1),
(20, 'diana_prince', 'diana@example.com', 'hashed_password20', '2025-03-11 21:00:00', 1),
(21, 'steve_rogers', 'steve@example.com', 'hashed_password21', '2025-03-12 08:00:00', 1),
(22, 'wanda_maximoff', 'wanda@example.com', 'hashed_password22', '2025-03-12 09:00:00', 1),
(23, 'thor_odinson', 'thor@example.com', 'hashed_password23', '2025-03-12 10:00:00', 1),
(24, 'loki_laufeyson', 'loki@example.com', 'hashed_password24', '2025-03-12 11:00:00', 1),
(25, 'gamora_zen', 'gamora@example.com', 'hashed_password25', '2025-03-13 12:00:00', 1),
(26, 'peter_quill', 'peterq@example.com', 'hashed_password26', '2025-03-13 13:00:00', 1);
-- Profiles
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
INSERT INTO artists (id, name, image) VALUES
(1, 'Taylor Swift', '/artists/taylor.png'),
(2, 'Kendrick Lamar', '/artists/kendrick.png'), 
(3, 'Billie Eilish', '/artists/billie.png'),
(4, 'The Beatles', '/artists/beatles.png'),
(5, 'Miles Davis', '/artists/miles.png'),
(6, 'Adele', '/artists/adele.png'),
(7, 'Nirvana', '/artists/nirvana.png'),
(8, 'Ella Fitzgerald', '/artists/ella.png');
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

INSERT INTO tracks (id, name, duration, file, image, artist_id, album_id, genre) VALUES
(1, 'Willow', '00:03:34', '/tracks/willow.mp3', '/tracks/images/willow.png', 1, 1, 'pop'),
(2, 'Champagne Problems', '00:04:04', '/tracks/champagne.mp3', '/tracks/images/champagne.png', 1, 1, 'pop'),
(3, 'Smells Like Teen Spirit', '00:05:01', '/tracks/teen_spirit.mp3', '/tracks/images/teen_spirit.png', 7, 2, 'rock'),
(4, 'Come As You Are', '00:03:38', '/tracks/come_as_you_are.mp3', '/tracks/images/come_as_you_are.png', 7, 2, 'rock'),
(5, 'So What', '00:09:22', '/tracks/so_what.mp3', '/tracks/images/so_what.png', 5, 3, 'jazz'),
(6, 'Shake It Off', '00:03:39', '/tracks/shake_it_off.mp3', '/tracks/images/shake_it_off.png', 1, NULL, 'pop'),
(7, 'Come Together', '00:04:19', '/tracks/come_together.mp3', '/tracks/images/come_together.png', 4, 4, 'rock'),
(8, 'Something', '00:03:02', '/tracks/something.mp3', '/tracks/images/something.png', 4, 4, 'rock'),
(9, 'Here Comes the Sun', '00:03:06', '/tracks/here_comes_the_sun.mp3', '/tracks/images/here_comes_the_sun.png', 4, 4, 'rock'),
(10, 'Blue in Green', '00:05:37', '/tracks/blue_in_green.mp3', '/tracks/images/blue_in_green.png', 5, 5, 'jazz'),
(11, 'Freddie Freeloader', '00:09:46', '/tracks/freddie_freeloader.mp3', '/tracks/images/freddie_freeloader.png', 5, 5, 'jazz'),
(12, 'Hello', '00:04:55', '/tracks/hello.mp3', '/tracks/images/hello.png', 6, 6, 'pop'),
(13, 'Rolling in the Deep', '00:03:48', '/tracks/rolling_in_the_deep.mp3', '/tracks/images/rolling_in_the_deep.png', 6, 6, 'pop'),
(14, 'Someone Like You', '00:04:45', '/tracks/someone_like_you.mp3', '/tracks/images/someone_like_you.png', 6, 6, 'pop'),
(15, 'Breed', '00:03:03', '/tracks/breed.mp3', '/tracks/images/breed.png', 7, 7, 'rock'),
(16, 'Lithium', '00:04:17', '/tracks/lithium.mp3', '/tracks/images/lithium.png', 7, 7, 'rock'),
(17, 'Summertime', '00:04:58', '/tracks/summertime.mp3', '/tracks/images/summertime.png', 8, 8, 'jazz'),
(18, 'Cheek to Cheek', '00:05:52', '/tracks/cheek_to_cheek.mp3', '/tracks/images/cheek_to_cheek.png', 8, 8, 'jazz'),
(19, 'Blank Space', '00:03:51', '/tracks/blank_space.mp3', '/tracks/images/blank_space.png', 1, 9, 'pop'),
(20, 'Bad Blood', '00:03:31', '/tracks/bad_blood.mp3', '/tracks/images/bad_blood.png', 1, 9, 'pop'),
(21, 'HUMBLE.', '00:02:57', '/tracks/humble.mp3', '/tracks/images/humble.png', 2, 10, 'pop'),
(22, 'DNA.', '00:03:05', '/tracks/dna.mp3', '/tracks/images/dna.png', 2, 10, 'pop'),
(23, 'Yesterday', '00:02:05', '/tracks/yesterday.mp3', '/tracks/images/yesterday.png', 4, NULL, 'rock'),
(24, 'Let It Be', '00:04:03', '/tracks/let_it_be.mp3', '/tracks/images/let_it_be.png', 4, NULL, 'rock'),
(25, 'All of Me', '00:04:29', '/tracks/all_of_me.mp3', '/tracks/images/all_of_me.png', 5, NULL, 'jazz'),
(26, 'Set Fire to the Rain', '00:04:02', '/tracks/set_fire_to_the_rain.mp3', '/tracks/images/set_fire_to_the_rain.png', 6, NULL, 'pop'),
(27, 'Heart-Shaped Box', '00:04:41', '/tracks/heart_shaped_box.mp3', '/tracks/images/heart_shaped_box.png', 7, NULL, 'rock'),
(28, 'My Funny Valentine', '00:05:00', '/tracks/my_funny_valentine.mp3', '/tracks/images/my_funny_valentine.png', 8, NULL, 'jazz'),
(29, 'Love Story', '00:03:55', '/tracks/love_story.mp3', '/tracks/images/love_story.png', 1, NULL, 'pop'),
(30, 'Loyalty', '00:03:47', '/tracks/loyalty.mp3', '/tracks/images/loyalty.png', 2, NULL, 'pop'),
(31, 'Bad Guy', '00:03:14', '/tracks/bad_guy.mp3', '/tracks/images/bad_guy.png', 3, NULL, 'pop'),
(32, 'Hey Jude', '00:07:11', '/tracks/hey_jude.mp3', '/tracks/images/hey_jude.png', 4, NULL, 'rock'),
(33, 'So What (Live)', '00:08:45', '/tracks/so_what_live.mp3', '/tracks/images/so_what_live.png', 5, NULL, 'jazz'),
(34, 'Skyfall', '00:04:46', '/tracks/skyfall.mp3', '/tracks/images/skyfall.png', 6, NULL, 'pop'),
(35, 'Rape Me', '00:02:50', '/tracks/rape_me.mp3', '/tracks/images/rape_me.png', 7, NULL, 'rock'),
(36, 'Misty', '00:03:00', '/tracks/misty.mp3', '/tracks/images/misty.png', 8, NULL, 'jazz');
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

INSERT INTO music_videos (id, track_id, video_file, duration, uploaded_at) VALUES
(1, 1, '/videos/willow.mp4', '00:03:40', '2025-03-04 10:00:00'),
(2, 2, '/videos/champagne_problems.mp4', '00:04:10', '2025-03-04 10:05:00'),
(3, 3, '/videos/smells_like_teen_spirit.mp4', '00:05:10', '2025-03-04 10:10:00'),
(4, 4, '/videos/come_as_you_are.mp4', '00:03:45', '2025-03-04 10:15:00'),
(5, 5, '/videos/so_what.mp4', '00:09:30', '2025-03-04 10:20:00'),
(6, 6, '/videos/shake_it_off.mp4', '00:03:45', '2025-03-04 10:25:00'),
(7, 7, '/videos/come_together.mp4', '00:04:25', '2025-03-04 10:30:00'),
(8, 8, '/videos/something.mp4', '00:03:10', '2025-03-04 10:35:00'),
(9, 9, '/videos/here_comes_the_sun.mp4', '00:03:15', '2025-03-04 10:40:00'),
(10, 10, '/videos/blue_in_green.mp4', '00:05:45', '2025-03-04 10:45:00'),
(11, 11, '/videos/freddie_freeloader.mp4', '00:09:50', '2025-03-04 10:50:00'),
(12, 12, '/videos/hello.mp4', '00:05:00', '2025-03-04 10:55:00'),
(13, 13, '/videos/rolling_in_the_deep.mp4', '00:03:55', '2025-03-04 11:00:00'),
(14, 14, '/videos/someone_like_you.mp4', '00:04:50', '2025-03-04 11:05:00'),
(15, 15, '/videos/breed.mp4', '00:03:10', '2025-03-04 11:10:00'),
(16, 16, '/videos/lithium.mp4', '00:04:25', '2025-03-04 11:15:00'),
(17, 17, '/videos/summertime.mp4', '00:05:05', '2025-03-04 11:20:00'),
(18, 18, '/videos/cheek_to_cheek.mp4', '00:06:00', '2025-03-04 11:25:00'),
(19, 19, '/videos/blank_space.mp4', '00:04:00', '2025-03-04 11:30:00'),
(20, 20, '/videos/bad_blood.mp4', '00:03:40', '2025-03-04 11:35:00'),
(21, 21, '/videos/humble.mp4', '00:03:00', '2025-03-04 11:40:00'),
(22, 22, '/videos/dna.mp4', '00:03:10', '2025-03-04 11:45:00'),
(23, 23, '/videos/yesterday.mp4', '00:02:10', '2025-03-04 11:50:00'),
(24, 24, '/videos/let_it_be.mp4', '00:04:10', '2025-03-04 11:55:00'),
(25, 25, '/videos/all_of_me.mp4', '00:04:35', '2025-03-04 12:00:00'),
(26, 26, '/videos/set_fire_to_the_rain.mp4', '00:04:10', '2025-03-04 12:05:00'),
(27, 27, '/videos/heart_shaped_box.mp4', '00:04:50', '2025-03-04 12:10:00'),
(28, 28, '/videos/my_funny_valentine.mp4', '00:05:10', '2025-03-04 12:15:00'),
(29, 29, '/videos/love_story.mp4', '00:04:00', '2025-03-04 12:20:00'),
(30, 30, '/videos/loyalty.mp4', '00:03:55', '2025-03-04 12:25:00'),
(31, 31, '/videos/bad_guy.mp4', '00:03:20', '2025-03-04 12:30:00'),
(32, 32, '/videos/hey_jude.mp4', '00:07:20', '2025-03-04 12:35:00'),
(33, 33, '/videos/so_what_live.mp4', '00:08:50', '2025-03-04 12:40:00'),
(34, 34, '/videos/skyfall.mp4', '00:04:55', '2025-03-04 12:45:00'),
(35, 35, '/videos/rape_me.mp4', '00:03:00', '2025-03-04 12:50:00'),
(36, 36, '/videos/misty.mp4', '00:03:05', '2025-03-04 12:55:00');

INSERT INTO user_albums (id, name, user_id, image, created_at) VALUES
(1, 'User1 Favorites', 1, '/user_albums/favs_user1.jpg', '2025-03-04 12:00:00'),
(2, 'Admin Chill Vibes', 2, '/user_albums/chill_admin.jpg', '2025-03-04 13:00:00'),
(3, 'User2 Pop Hits', 3, '/user_albums/pop_user2.jpg', '2025-03-04 14:00:00'),
(4, 'User1 Rock Collection', 1, '/user_albums/rock_user1.jpg', '2025-03-04 15:00:00'),
(5, 'Admin Jazz Mix', 2, '/user_albums/jazz_admin.jpg', '2025-03-04 16:00:00'),
(6, 'User3 Party Playlist', 3, '/user_albums/party_user3.jpg', '2025-03-04 17:00:00'),
(7, 'User4 Study Tunes', 4, '/user_albums/study_user4.jpg', '2025-03-04 18:00:00'),
(8, 'User5 Road Trip', 5, '/user_albums/road_user5.jpg', '2025-03-04 19:00:00'),
(9, 'User2 Oldies', 3, '/user_albums/oldies_user2.jpg', '2025-03-04 20:00:00'),
(10, 'Admin Top Hits', 2, '/user_albums/top_admin.jpg', '2025-03-04 21:00:00'),
(11, 'User1 Summer Vibes', 1, '/user_albums/summer_user1.jpg', '2025-03-05 09:00:00'),
(12, 'User3 Dance Mix', 3, '/user_albums/dance_user3.jpg', '2025-03-05 10:00:00'),
(13, 'User4 Relaxing Evening', 4, '/user_albums/relax_user4.jpg', '2025-03-05 11:00:00'),
(14, 'User5 Workout Energy', 5, '/user_albums/workout_user5.jpg', '2025-03-05 12:00:00'),
(15, 'Admin Classic Rock', 2, '/user_albums/classic_admin.jpg', '2025-03-05 13:00:00'),
(16, 'User1 Late Night', 1, '/user_albums/night_user1.jpg', '2025-03-05 14:00:00'),
(17, 'User2 Indie Picks', 3, '/user_albums/indie_user2.jpg', '2025-03-05 15:00:00'),
(18, 'User4 Morning Boost', 4, '/user_albums/morning_user4.jpg', '2025-03-05 16:00:00'),
(19, 'User5 Retro Beats', 5, '/user_albums/retro_user5.jpg', '2025-03-05 17:00:00'),
(20, 'Admin Best of 2025', 2, '/user_albums/best_admin.jpg', '2025-03-05 18:00:00');

INSERT INTO user_album_tracks (id, user_album_id, track_id, track_order) VALUES
(1, 1, 1, 0),    -- User1 Favorites
(2, 1, 4, 1),
(3, 1, 19, 2),
(4, 2, 2, 0),    -- Admin Chill Vibes
(5, 2, 5, 1),
(6, 2, 25, 2),
(7, 3, 6, 0),    -- User2 Pop Hits
(8, 3, 13, 1),
(9, 3, 20, 2),
(10, 4, 3, 0),   -- User1 Rock Collection
(11, 4, 15, 1),
(12, 4, 27, 2),
(13, 5, 10, 0),  -- Admin Jazz Mix
(14, 5, 17, 1),
(15, 5, 28, 2),
(16, 6, 7, 0),   -- User3 Party Playlist
(17, 6, 12, 1),
(18, 6, 21, 2),
(19, 7, 8, 0),   -- User4 Study Tunes
(20, 7, 11, 1),
(21, 7, 25, 2),
(22, 8, 9, 0),   -- User5 Road Trip
(23, 8, 16, 1),
(24, 8, 32, 2),
(25, 9, 23, 0),  -- User2 Oldies
(26, 9, 24, 1),
(27, 9, 28, 2),
(28, 10, 14, 0), -- Admin Top Hits
(29, 10, 22, 1),
(30, 10, 34, 2),
(31, 11, 19, 0), -- User1 Summer Vibes
(32, 11, 29, 1),
(33, 12, 6, 0),  -- User3 Dance Mix
(34, 12, 20, 1),
(35, 13, 5, 0),  -- User4 Relaxing Evening
(36, 13, 17, 1),
(37, 14, 21, 0), -- User5 Workout Energy
(38, 14, 27, 1),
(39, 15, 3, 0),  -- Admin Classic Rock
(40, 15, 15, 1);


INSERT INTO messages (id, sender_id, receiver_id, content, sent_at, is_read) VALUES
(1, 1, 2, 'Hey, check out this song!', '2025-03-04 12:10:00', FALSE),
(2, 2, 1, 'Cool, thanks!', '2025-03-04 12:15:00', TRUE),
(3, 3, 1, 'Hi, any good playlists?', '2025-03-04 12:20:00', FALSE),
(4, 1, 3, 'Try my Pop Hits!', '2025-03-04 12:25:00', TRUE),
(5, 4, 2, 'Admin, can you add more jazz?', '2025-03-04 12:30:00', FALSE),
(6, 2, 4, 'Sure, working on it.', '2025-03-04 12:35:00', TRUE),
(7, 5, 1, 'Love your favorites album!', '2025-03-04 12:40:00', FALSE),
(8, 1, 5, 'Thanks, glad you like it!', '2025-03-04 12:45:00', TRUE),
(9, 3, 2, 'Can we chat about music?', '2025-03-04 12:50:00', FALSE),
(10, 2, 3, 'Of course, anytime!', '2025-03-04 12:55:00', TRUE),
(11, 4, 5, 'Road trip vibes are great!', '2025-03-04 13:00:00', FALSE),
(12, 5, 4, 'Thanks, I worked hard on it.', '2025-03-04 13:05:00', TRUE),
(13, 1, 4, 'Any study tunes to share?', '2025-03-04 13:10:00', FALSE),
(14, 4, 1, 'Check my Study Tunes album.', '2025-03-04 13:15:00', TRUE),
(15, 2, 5, 'Top Hits updated!', '2025-03-04 13:20:00', FALSE),
(16, 5, 2, 'Awesome, will check it out.', '2025-03-04 13:25:00', TRUE),
(17, 3, 4, 'How’s your day?', '2025-03-04 13:30:00', FALSE),
(18, 4, 3, 'Good, thanks for asking!', '2025-03-04 13:35:00', TRUE),
(19, 1, 2, 'New song added!', '2025-03-05 09:00:00', FALSE),
(20, 2, 1, 'Nice, I’ll listen.', '2025-03-05 09:05:00', TRUE),
(21, 5, 3, 'Party playlist is fire!', '2025-03-05 09:10:00', FALSE),
(22, 3, 5, 'Glad you think so!', '2025-03-05 09:15:00', TRUE),
(23, 4, 2, 'More tracks please!', '2025-03-05 09:20:00', FALSE),
(24, 2, 4, 'On it!', '2025-03-05 09:25:00', TRUE),
(25, 1, 3, 'What’s your favorite song?', '2025-03-05 09:30:00', FALSE),
(26, 3, 1, 'Love "Willow"!', '2025-03-05 09:35:00', TRUE),
(27, 5, 4, 'Workout playlist rocks!', '2025-03-05 09:40:00', FALSE),
(28, 4, 5, 'Thanks, glad you enjoyed!', '2025-03-05 09:45:00', TRUE),
(29, 2, 3, 'New jazz mix up!', '2025-03-05 09:50:00', FALSE),
(30, 3, 2, 'Can’t wait to hear it!', '2025-03-05 09:55:00', TRUE);

INSERT INTO shared_listening_invitations (id, sender_id, receiver_id, track_id, start_time, current_position, created_at, status) VALUES
(1, 1, 2, 1, '2025-03-04 12:00:00', '00:01:05', '2025-03-04 12:01:05', 'pending'),
(2, 2, 3, 3, '2025-03-04 12:10:00', '00:02:30', '2025-03-04 12:12:30', 'accepted'),
(3, 3, 1, 6, '2025-03-04 12:20:00', '00:00:45', '2025-03-04 12:20:45', 'rejected'),
(4, 4, 5, 8, '2025-03-04 12:30:00', '00:01:20', '2025-03-04 12:31:20', 'pending'),
(5, 5, 2, 9, '2025-03-04 12:40:00', '00:02:10', '2025-03-04 12:42:10', 'accepted'),
(6, 1, 3, 19, '2025-03-04 12:50:00', '00:01:30', '2025-03-04 12:51:30', 'pending'),
(7, 2, 4, 13, '2025-03-04 13:00:00', '00:03:00', '2025-03-04 13:03:00', 'rejected'),
(8, 3, 5, 21, '2025-03-04 13:10:00', '00:00:55', '2025-03-04 13:10:55', 'accepted'),
(9, 4, 1, 25, '2025-03-04 13:20:00', '00:02:45', '2025-03-04 13:22:45', 'pending'),
(10, 5, 3, 32, '2025-03-04 13:30:00', '00:04:00', '2025-03-04 13:34:00', 'accepted'),
(11, 1, 2, 4, '2025-03-05 09:00:00', '00:01:15', '2025-03-05 09:01:15', 'pending'),
(12, 2, 5, 10, '2025-03-05 09:10:00', '00:03:20', '2025-03-05 09:13:20', 'rejected'),
(13, 3, 4, 15, '2025-03-05 09:20:00', '00:02:00', '2025-03-05 09:22:00', 'accepted'),
(14, 4, 2, 17, '2025-03-05 09:30:00', '00:01:50', '2025-03-05 09:31:50', 'pending'),
(15, 5, 1, 20, '2025-03-05 09:40:00', '00:02:15', '2025-03-05 09:42:15', 'accepted'),
(16, 1, 3, 29, '2025-03-05 09:50:00', '00:01:40', '2025-03-05 09:51:40', 'pending'),
(17, 2, 4, 34, '2025-03-05 10:00:00', '00:03:10', '2025-03-05 10:03:10', 'rejected'),
(18, 3, 5, 7, '2025-03-05 10:10:00', '00:02:25', '2025-03-05 10:12:25', 'accepted'),
(19, 4, 1, 11, '2025-03-05 10:20:00', '00:04:30', '2025-03-05 10:24:30', 'pending'),
(20, 5, 2, 36, '2025-03-05 10:30:00', '00:01:55', '2025-03-05 10:31:55', 'accepted');
