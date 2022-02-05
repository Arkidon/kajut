import base64
from django.shortcuts import render, HttpResponse
from django.http import JsonResponse, HttpResponseNotFound
from .forms import QuizForm, CreateGame
from .models import Quiz, Question, Answer, Image
from .utils import *
from datetime import datetime
import os


# Create your views here.


def create_session(request):
    print(request.session.session_key)
    if request.session.session_key is None:
        request.session.create()


def index(request):
    create_session(request)
    return render(request, "web/index.html")


def create_quiz(request):
    create_session(request)
    if request.method == "GET":
        return render(request, "web/create-quiz.html")

    elif request.method == "POST":
        quiz_form = QuizForm(request.POST, request.FILES)
        if quiz_form.is_valid():

            quiz = Quiz(name=quiz_form.cleaned_data["kajut_name"], date=datetime.now())
            quiz.save()
            preguntas = quiz_form.cleaned_data["question_information"]

            image_list = request.FILES.getlist("images")
            image_position = 0

            for pregunta in preguntas:
                print(pregunta)
                question = Question(question_text=pregunta["titulo"],
                                    quiz=quiz)
                question.save()

                respuesta1 = pregunta["respuesta1"]
                answer1 = Answer(answer_text=respuesta1["texto"],
                                 is_correct=respuesta1["correcta"],
                                 number=1,
                                 question=question)
                answer1.save()

                respuesta2 = pregunta["respuesta2"]
                answer2 = Answer(answer_text=respuesta2["texto"],
                                 is_correct=respuesta2["correcta"],
                                 number=2,
                                 question=question)
                answer2.save()

                respuesta3 = pregunta["respuesta3"]
                answer3 = Answer(answer_text=respuesta3["texto"],
                                 is_correct=respuesta3["correcta"],
                                 number=3,
                                 question=question)
                answer3.save()

                respuesta4 = pregunta["respuesta4"]
                answer4 = Answer(answer_text=respuesta4["texto"],
                                 is_correct=respuesta3["correcta"],
                                 number=4,
                                 question=question)
                answer4.save()

                if pregunta["imagen"]:
                    file_extension = os.path.splitext(image_list[image_position].name)[1]
                    filename = f"{quiz.quiz_id}-{image_position}{file_extension}"
                    directory = os.path.join(settings.IMAGES_DIRECTORY, str(quiz.quiz_id))

                    save_image(file_bytes=image_list[image_position],
                               directory=directory,
                               filename=filename)

                    image = Image(filename=filename, question=question)
                    image.save()

                    image_position += 1

            return JsonResponse({"valid": True, "quiz": quiz.quiz_id})
        else:
            return JsonResponse({"valid": False, "error": "La informacion enviada no es valida"})


def create_lobby(request):
    create_session(request)
    return render(request, "web/create-lobby.html")


def get_quiz_list(request):
    create_session(request)
    quiz_list = Quiz.objects.all()
    response_list = []
    for quiz in quiz_list:
        quiz_dict = {"name": quiz.name,
                     "quiz_id": quiz.quiz_id,
                     "date": f"{quiz.date.day}-{quiz.date.month}-{quiz.date.year}",
                     "number_of_questions": len(Question.objects.filter(quiz=quiz))}
        response_list.append(quiz_dict)
    print(response_list)
    return JsonResponse({"quiz_list": response_list})


def create_game(request):
    create_session(request)
    create_game_form = CreateGame(request.POST)
    if not create_game_form.is_valid():
        return JsonResponse({"game_created": False})

    try:
        quiz = Quiz.objects.get(quiz_id=create_game_form.cleaned_data['quiz_id'])

    except ObjectDoesNotExist:
        return JsonResponse({"game_created": False})

    active_game = ActiveGame(game_code=generate_game_code(),
                             owner_session=request.session.session_key,
                             quiz=quiz)
    active_game.save()

    print("Json response game")
    return JsonResponse({"game_created": True, "game_code": active_game.game_code})


def game_managment(request, game_code):
    try:
        game = ActiveGame.objects.get(game_code=game_code,
                                      owner_session=request.session.session_key)

    except ObjectDoesNotExist:
        return HttpResponse("No tienes permiso para acceder a esta página")

    return render(request, "web/game-managment.html", {"game_code": game_code, "quiz-name": game.quiz.name})


def check_game(request, game_code):
    try:
        ActiveGame.objects.get(game_code=game_code)
        return JsonResponse({"game_exists": True})

    except ObjectDoesNotExist:
        return JsonResponse({"game_exists": False})


def join_game(request):
    create_session(request)
    return render(request, "web/join-game.html")


def get_question_image(request, question_id):
    try:
        image = Image.objects.get(question_id=question_id)

    except ObjectDoesNotExist:
        return HttpResponseNotFound("La imagen solicitada no existe")

    with open(os.path.join(settings.IMAGES_DIRECTORY, str(image.question.quiz.quiz_id), image.filename), 'rb') as file:
        return HttpResponse(base64.b64encode(file.read()))
