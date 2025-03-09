from rest_framework import viewsets
from .models import User, Artist, Album, Track, Playlist, PlaylistTrack, Follower, Like, Profile
from .serializers import (UserSerializer, ProfileSerializer, ArtistSerializer, AlbumSerializers, TrackSerializer, PlaylistSerializer, PlaylistTrackSerializer, FollowerSerializers, LikeSerializer)

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

class ArtistViewSet(viewsets.ModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer

class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializers

class TrackViewSet(viewsets.ModelViewSet):
    queryset = Track.objects.all()
    serializer_class = TrackSerializer

class PlaylistViewSet(viewsets.ModelViewSet):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer

class PlaylistTrackViewSet(viewsets.ModelViewSet):
    queryset = PlaylistTrack.objects.all()
    serializer_class = PlaylistTrackSerializer

class FollowerViewSet(viewsets.ModelViewSet):
    queryset = Follower.objects.all()
    serializer_class = FollowerSerializers

class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer