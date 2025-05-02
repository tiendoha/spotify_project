from rest_framework import viewsets, generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
import logging
from django.db.models import Q, Subquery, OuterRef, Max
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
from rest_framework.decorators import api_view
from django.http import JsonResponse
import requests
import json

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

class ChatWithBot(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logger.info(f"Chat with bot request: {request.data}")
        sender_id = request.data.get('sender')
        content = request.data.get('content')
        bot_id = 27  # ID của bot

        if not sender_id or not content:
            return Response(
                {'error': 'Sender and content are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            sender = User.objects.get(id=sender_id)
            bot = User.objects.get(id=bot_id)

            # Lưu tin nhắn của người dùng
            user_message = Message.objects.create(
                sender=sender,
                receiver=bot,
                content=content,
                sent_at=timezone.now(),
                is_read=True
            )

            # Gọi a2a_server để lấy gợi ý từ Gemini
            a2a_response = requests.post(
                'http://127.0.0.1:5000/jsonrpc',
                json={
                    'jsonrpc': '2.0',
                    'method': 'recommend_song',
                    'params': {'input': content, 'user_id': sender_id},
                    'id': 1
                }
            )
            a2a_data = a2a_response.json()

            if 'result' in a2a_data:
                bot_response = a2a_data['result']
            else:
                bot_response = "Xin lỗi, tôi không thể gợi ý bài hát lúc này."

            # Lưu phản hồi của bot
            bot_message = Message.objects.create(
                sender=bot,
                receiver=sender,
                content=bot_response,
                sent_at=timezone.now(),
                is_read=False
            )

            # Serialize cả hai tin nhắn
            user_message_serializer = MessageSerializer(user_message)
            bot_message_serializer = MessageSerializer(bot_message)

            return Response({
                'user_message': user_message_serializer.data,
                'bot_message': bot_message_serializer.data
            }, status=status.HTTP_201_CREATED)

        except User.DoesNotExist:
            logger.error(f"User or Bot not found: sender_id={sender_id}, bot_id={bot_id}")
            return Response(
                {'error': 'User or Bot not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error in chat with bot: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProfileDetail(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    queryset = Profile.objects.all()
    permission_classes = [AllowAny]

class SearchUser(generics.ListAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [AllowAny]
    queryset = Profile.objects.all()

    def list(self, request, *args, **kwargs):
        username = self.kwargs.get("username", "").strip()
        current_user = self.request.user

        # Khởi tạo danh sách kết quả
        combined_profiles = []

        # Luôn thêm bot (ID=27) vào đầu danh sách
        try:
            bot_profile = Profile.objects.get(user__id=27)
            combined_profiles.append(bot_profile)
        except Profile.DoesNotExist:
            logger.warning("Bot profile (ID=27) not found")

        # Chỉ xử lý logic tìm kiếm nếu người dùng đã đăng nhập
        if current_user.is_authenticated:
            # Tìm tất cả user từng có tin nhắn với current_user
            message_partners = Message.objects.filter(
                Q(sender=current_user) | Q(receiver=current_user)
            ).exclude(
                Q(sender=current_user, receiver=current_user) |
                Q(sender__id=27) | Q(receiver__id=27)  # Loại trừ bot khỏi danh sách partner
            ).values(
                "sender", "receiver"
            ).annotate(
                last_message_time=Max("sent_at")
            )

            partner_ids = set()
            partner_time_map = {}

            for msg in message_partners:
                sender = msg["sender"]
                receiver = msg["receiver"]
                partner_id = receiver if sender == current_user.id else sender
                partner_ids.add(partner_id)
                partner_time_map[partner_id] = msg["last_message_time"]

            # Người đã nhắn tin → lấy profile và gắn thêm thời gian gửi gần nhất
            messaged_profiles = Profile.objects.filter(user__id__in=partner_ids)
            for profile in messaged_profiles:
                profile.last_message_time = partner_time_map.get(profile.user.id)

            # Người chưa nhắn tin nhưng trùng từ khóa
            if username:
                other_profiles = Profile.objects.filter(
                    Q(user__username__icontains=username) |
                    Q(user__email__icontains=username)
                ).exclude(user__id__in=partner_ids).exclude(user=current_user).exclude(user__id=27)
            else:
                other_profiles = Profile.objects.none()

            # Gộp danh sách (bot đã ở đầu)
            combined_profiles += sorted(
                list(messaged_profiles),
                key=lambda p: p.last_message_time or timezone.datetime.min,
                reverse=True
            ) + list(other_profiles)
        else:
            # Nếu chưa đăng nhập, chỉ tìm kiếm theo từ khóa (nếu có), không bao gồm bot
            if username:
                combined_profiles += list(Profile.objects.filter(
                    Q(user__username__icontains=username) |
                    Q(user__email__icontains=username)
                ).exclude(user__id=27))

        serializer = self.get_serializer(combined_profiles, many=True)
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
        try:
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
            Profile.objects.create(user=user)
            return Response({'message': 'Đăng ký thành công'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Lỗi khi đăng ký: {e}")
            return Response({'error': 'Lỗi máy chủ nội bộ', 'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def search(request):
    try:
        query = request.GET.get('q', '')
        type_filter = request.GET.get('type', '')  
        genre_filter = request.GET.get('genre', '') 

        if not query:
            return JsonResponse({'results': []})

        results = []
        
        if type_filter == 'song' or not type_filter:
            songs_query = Track.objects.filter(
                Q(name__icontains=query) |
                Q(artist__name__icontains=query) |
                Q(album__name__icontains=query) |
                Q(genre__icontains=query)
            )

            if genre_filter:
                songs_query = songs_query.filter(genre=genre_filter)

            songs = songs_query.values('id', 'name', 'artist__name', 'album__name', 'genre')[:10]

            results.extend([
                {
                    'id': song['id'],
                    'type': 'song',
                    'title': song['name'],
                    'artist': song['artist__name'],
                    'album': song['album__name'],
                    'genre': song['genre']
                }
                for song in songs
            ])

        if type_filter == 'artist' or not type_filter: 
            artists = Artist.objects.filter(
                Q(name__icontains=query)
            ).values('id', 'name')[:10]

            results.extend([
                {
                    'id': artist['id'],
                    'type': 'artist',
                    'name': artist['name']
                }
                for artist in artists
            ])

        if type_filter == 'album' or not type_filter:
            albums = Album.objects.filter(
                Q(name__icontains=query) |
                Q(artist__name__icontains=query)
            ).values('id', 'name', 'artist__name')[:10]

            results.extend([
                {
                    'id': album['id'],
                    'type': 'album',
                    'title': album['name'],
                    'artist': album['artist__name']
                }
                for album in albums
            ])

        return JsonResponse({'results': results})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)