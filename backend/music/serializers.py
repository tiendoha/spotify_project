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
        fields = '__all__'  # Hoặc liệt kê các trường cụ thể
        read_only_fields = ['id']

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ['id']

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = '__all__'
        read_only_fields = ['id']

class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = '__all__'
        read_only_fields = ['id']

class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = '__all__'
        read_only_fields = ['id']

class PlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = '__all__'
        read_only_fields = ['id']

class PlaylistTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistTrack
        fields = '__all__'
        read_only_fields = ['id']

class FollowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follower
        fields = '__all__'
        read_only_fields = ['id']

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__'
        read_only_fields = ['id']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    sender_profile = ProfileSerializer(read_only=True, source='sender.profile')
    receiver_profile = ProfileSerializer(read_only=True, source='receiver.profile')

    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['id']

        fields = ['id', 'sender', 'receiver', 'sender_profile', 'receiver_profile', 'content', 'sent_at', 'is_read']
        read_only_fields = ['id', 'sender', 'sent_at', 'is_read']  # Đảm bảo is_read là read-only

    def create(self, validated_data):
        validated_data['is_read'] = False  # Luôn đặt is_read = False khi tạo mới
        return super().create(validated_data)
    
    
class SharedListeningInvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SharedListeningInvitation
        fields = '__all__'
        read_only_fields = ['id']

class MusicVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MusicVideo
        fields = '__all__'
        read_only_fields = ['id']

class UserAlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAlbum
        fields = '__all__'
        read_only_fields = ['id']

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