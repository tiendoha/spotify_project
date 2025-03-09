from rest_framework import serializers
from .models import User, Profile, Artist, Album, Track, Playlist, PlaylistTrack, Follower, Like

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        field = ['id', 'username', 'email', 'date_joined']

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['user', 'date_of_birth', 'profile_image']

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ['id', 'name', 'genre', 'image']

class AlbumSerializers(serializers.ModelSerializer):
    class Meta:
        model = Album
        field = ['id', 'name', 'release_date', 'image', 'artist']

class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = ['id', 'name', 'duration', 'file', 'artist', 'album']

class PlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = ['id', 'name', 'image', 'user']

class PlaylistTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistTrack
        fields = ['id', 'playlist', 'track', 'track_order']

class FollowerSerializers(serializers.ModelSerializer):
    class Meta:
        model = Follower
        fields = ['id', 'user', 'artist']

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'user', 'track', 'liked_at']
