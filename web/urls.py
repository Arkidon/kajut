from django.urls import path

from web import views

urlpatterns = [
    path('', views.index),
    path('create-quiz', views.create_quiz),
    path('create-lobby', views.create_lobby),
    path('get-quiz-list', views.get_quiz_list),
    path('create-game', views.create_game),
    path('manage-game/<game_code>', views.game_managment),
    path('join-game', views.join_game),
    path('check-game/<game_code>', views.check_game),
    path('get-question-image/<question_id>', views.get_question_image),
]
