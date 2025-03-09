from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (UserViewSet, ProfileViewSet, ArtistViewSet, AlbumViewSet, TrackViewSet, 
                    PlaylistViewSet, PlaylistTrackViewSet, FollowerViewSet, LikeViewSet)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profiles', ProfileViewSet)
router.register(r'artists', ArtistViewSet)
router.register(r'albums', AlbumViewSet)
router.register(r'tracks', TrackViewSet)
router.register(r'playlists', PlaylistViewSet)
router.register(r'playlist-tracks', PlaylistTrackViewSet)
router.register(r'followers', FollowerViewSet)
router.register(r'likes', LikeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]