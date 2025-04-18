from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import logging
from django.db.models import Q, Subquery, OuterRef
from django.utils import timezone
from .models import (
    User, Profile, Artist, Album, Track, Playlist, PlaylistTrack, 
    Follower, Like, Message, SharedListeningInvitation, MusicVideo, 
    UserAlbum, UserAlbumTrack
)
from .serializers import (
    UserSerializer, ProfileSerializer, ArtistSerializer, AlbumSerializer,
    TrackSerializer, PlaylistSerializer, PlaylistTrackSerializer, 
    FollowerSerializer, LikeSerializer, MessageSerializer,
    SharedListeningInvitationSerializer, MusicVideoSerializer, 
    UserAlbumSerializer, UserAlbumTrackSerializer
)
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

logger = logging.getLogger(__name__)

# Các ViewSet hiện có
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer

class ArtistViewSet(viewsets.ModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer

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
    serializer_class = FollowerSerializer

class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

class SharedListeningInvitationViewSet(viewsets.ModelViewSet):
    queryset = SharedListeningInvitation.objects.all()
    serializer_class = SharedListeningInvitationSerializer

class MusicVideoViewSet(viewsets.ModelViewSet):
    queryset = MusicVideo.objects.all()
    serializer_class = MusicVideoSerializer

class UserAlbumViewSet(viewsets.ModelViewSet):
    queryset = UserAlbum.objects.all()
    serializer_class = UserAlbumSerializer

class UserAlbumTrackViewSet(viewsets.ModelViewSet):
    queryset = UserAlbumTrack.objects.all()
    serializer_class = UserAlbumTrackSerializer

class MyInbox(generics.ListAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        messages = Message.objects.filter(
            id__in=Subquery(
                User.objects.filter(
                    Q(sent_messages__receiver=user_id) |
                    Q(received_messages__sender=user_id)
                ).distinct().annotate(
                    last_msg=Subquery(
                        Message.objects.filter(
                            Q(sender=OuterRef('id'), receiver=user_id) |
                            Q(receiver=OuterRef('id'), sender=user_id)
                        ).order_by('-id')[:1].values_list('id', flat=True)
                    )
                ).values_list('last_msg', flat=True)
            )
        ).order_by('-id')
        return messages

class GetMessages(generics.ListAPIView):
    serializer_class = MessageSerializer
    
    def get_queryset(self):
        sender_id = self.kwargs['sender_id']
        receiver_id = self.kwargs['receiver_id']
        messages = Message.objects.filter(
            sender__in=[sender_id, receiver_id], 
            receiver__in=[sender_id, receiver_id]
        ).order_by('sent_at')
        return messages

class SendMessages(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        logger.info(f"Token từ header: {self.request.headers.get('Authorization')}")
        logger.info(f"request.user: {self.request.user}, authenticated: {self.request.user.is_authenticated}")
        logger.info(f"Data từ frontend: {self.request.data}")

        receiver_id = self.request.data.get('receiver')
        try:
            receiver_user = User.objects.get(id=int(receiver_id))
            serializer.save(sender=self.request.user, receiver=receiver_user)
        except ValueError:
            logger.error(f"Receiver phải là số (ID user), nhận được: {receiver_id}")
            raise
        except User.DoesNotExist:
            logger.error(f"User với ID {receiver_id} không tồn tại")
            raise
        except Exception as e:
            logger.error(f"Error saving message: {str(e)}")
            raise

class ProfileDetail(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    queryset = Profile.objects.all()
    permission_classes = [IsAuthenticated]

class SearchUser(generics.ListAPIView):
    serializer_class = ProfileSerializer
    queryset = Profile.objects.all()
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        username = self.kwargs['username']
        logged_in_user = self.request.user
        users = Profile.objects.filter(
            Q(user__username__icontains=username) | 
            Q(user__email__icontains=username)
        ).exclude(user=logged_in_user)

        if not users.exists():
            return Response(
                {"detail": "No users found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Vui lòng cung cấp tên người dùng và mật khẩu'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)
            if user.check_password(password):
                token, _ = Token.objects.get_or_create(user=user)
                role = 'admin' if user.role == 2 else 'user'
                return Response({
                    'token': token.key,
                    'role': role,
                    'user_id': user.id
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Mật khẩu không đúng'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Tên người dùng không tồn tại'}, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not username or not email or not password:
            return Response({'error': 'Vui lòng cung cấp đầy đủ thông tin'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Tên người dùng đã tồn tại'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email đã tồn tại'}, status=status.HTTP_400_BAD_REQUEST)

        user = User(
            username=username,
            email=email,
            date_joined=timezone.now(),
            role=1
        )
        user.set_password(password)
        user.save()
        return Response({'message': 'Đăng ký thành công'}, status=status.HTTP_201_CREATED)
