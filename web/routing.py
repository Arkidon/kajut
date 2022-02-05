from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/game-managment/<game_code>', consumers.GameManagmentConsumer.as_asgi()),
    path('ws/quiz-game/<game_code>/<username>', consumers.QuizPlayerConsumer.as_asgi())
]