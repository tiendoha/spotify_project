from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, ProfileViewSet, ArtistViewSet, AlbumViewSet, TrackViewSet,
    PlaylistViewSet, PlaylistTrackViewSet, FollowerViewSet, LikeViewSet,
    MessageViewSet, SharedListeningInvitationViewSet, MusicVideoViewSet,
    UserAlbumViewSet, UserAlbumTrackViewSet, MyInbox, GetMessages,
    SendMessages, ProfileDetail, SearchUser
)

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
router.register(r'messages', MessageViewSet)
router.register(r'shared-listening-invitations', SharedListeningInvitationViewSet)
router.register(r'music-videos', MusicVideoViewSet)
router.register(r'user-albums', UserAlbumViewSet)
router.register(r'user-album-tracks', UserAlbumTrackViewSet)

urlpatterns = [
    path('', include(router.urls)),  # Các route từ router (ViewSet)
    # Các route cho view generics
    path('inbox/<int:user_id>/', MyInbox.as_view(), name='my-inbox'),
    path('messages/<int:sender_id>/<int:receiver_id>/', GetMessages.as_view(), name='get-messages'),
    path('send-message/', SendMessages.as_view(), name='send-message'),
    path('profile/<int:pk>/', ProfileDetail.as_view(), name='profile-detail'),
    path('search/<str:username>/', SearchUser.as_view(), name='search-user'),
]