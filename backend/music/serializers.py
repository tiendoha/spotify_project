from rest_framework import serializers
from .models import (
    User, Profile, Artist, Album, Track, Playlist, PlaylistTrack, 
    Follower, Like, Message, SharedListeningInvitation, MusicVideo, 
    UserAlbum, UserAlbumTrack
)
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils import timezone

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password','date_joined']


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'user', 'date_of_birth', 'profile_image']


class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ['id', 'name', 'image']  # Xóa genre

class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = ['id', 'name', 'release_date', 'image', 'artist']

class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = ['id', 'name', 'duration', 'file', 'image', 'artist', 'album', 'genre']  # Thêm image và genre

class PlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = ['id', 'name', 'image', 'user']


class PlaylistTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistTrack
        fields = ['id', 'playlist', 'track', 'track_order']


class FollowerSerializer(serializers.ModelSerializer):  # Sửa tên thành số ít cho nhất quán
    class Meta:
        model = Follower
        fields = ['id', 'user', 'artist']


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'user', 'track', 'liked_at']


class MessageSerializer(serializers.ModelSerializer):
    sender_profile = ProfileSerializer(read_only=True, source='sender.profile')
    receiver_profile = ProfileSerializer(read_only=True, source='receiver.profile')

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'sender_profile', 'receiver_profile', 'content', 'sent_at', 'is_read']


class SharedListeningInvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SharedListeningInvitation
        fields = ['id', 'sender', 'receiver', 'track', 'start_time', 'current_position', 'created_at', 'status']


class MusicVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MusicVideo
        fields = ['id', 'track', 'video_file', 'duration', 'uploaded_at']


class UserAlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAlbum
        fields = ['id', 'name', 'user', 'image', 'created_at']


class UserAlbumTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAlbumTrack
        fields = ['id', 'user_album', 'track', 'track_order']


# Các serializer bổ sung từ code cũ
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        profile = getattr(user, 'profile', None)
        token['username'] = user.username
        token['email'] = user.email
        token['date_joined'] = user.date_joined.isoformat()
        if profile:
            token['profile_image'] = str(profile.profile_image) if profile.profile_image else None
            token['date_of_birth'] = profile.date_of_birth.isoformat() if profile.date_of_birth else None
        return token


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password2', 'date_joined')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            date_joined=validated_data.get('date_joined', timezone.now())  # Đã đúng cú pháp
        )
        user.set_password(validated_data['password'])
        user.save()
        return user