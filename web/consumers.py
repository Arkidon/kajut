import json
from channels.generic.websocket import WebsocketConsumer
from .models import ActiveGame, Username, Question, Answer
from django.core.exceptions import ObjectDoesNotExist
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from channels.exceptions import StopConsumer, DenyConnection
from datetime import datetime
import threading


class GameManagmentConsumer(WebsocketConsumer):
    def connect(self):
        self.game_code = self.scope['url_route']['kwargs']['game_code']
        session_key = self.scope['session'].session_key
        self.question_number = 0
        self.users_connected = 0
        self.answers_received = 0
        self.players_information = []

        try:
            active_game = ActiveGame.objects.get(game_code=self.game_code,
                                                 owner_session=session_key)

            active_game.manager_channel_name = self.channel_name
            active_game.save()

            self.question_list = Question.objects.filter(quiz=active_game.quiz)

            self.accept()

        except ObjectDoesNotExist:
            self.close()

    def disconnect(self, code):
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(self.game_code, {"type": "management.disconnected"})
            active_game = ActiveGame.objects.get(game_code=self.game_code)
            Username.objects.filter(active_game=active_game).delete()
            active_game.delete()

        except ObjectDoesNotExist:
            pass

    def user_disconnected(self, event):
        self.users_connected -= 1

    def receive(self, text_data=None, bytes_data=None):
        mensaje = json.loads(text_data)
        channel_layer = get_channel_layer()
        if mensaje["msg_type"] == 'start_game':
            self.status = "waiting_for answers"
            self.start_game()

    def user_joined(self, event):
        self.send(text_data=json.dumps({"msg_type": "user_joined",
                                        "username": event['text'],
                                        }))
        self.users_connected += 1

    def start_game(self):
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(self.game_code, {"type": "start.game"})
        self.send_next_question()

    def question_answered(self, event):
        print("question_answered")
        self.answers_received += 1
        self.players_information.append({"username": event["text"]["username"],
                                         "points": event["text"]["points"]})

        print(self.players_information)

        if self.answers_received == self.users_connected:
            if self.parallel_task.is_alive():
                self.parallel_task.cancel()
            channel_layer = get_channel_layer()

            # Sorts the player_information list max to min based on points
            self.players_information = sorted(self.players_information, key=lambda key: key["points"], reverse=True)

            self.post_answers_freeze_time()

    def send_next_question(self):
        self.players_information = []

        channel_layer = get_channel_layer()
        # Termina la partida si se han enviado todas las preguntas
        if self.question_number == len(self.question_list):
            async_to_sync(channel_layer.group_send)(self.game_code, {"type": "game.over"})
            self.send(text_data=json.dumps({"type": "game_over"}))
            self.disconnect(0)

        question = self.question_list[self.question_number]
        answers = Answer.objects.filter(question=question)
        answer1 = answers.get(number=1)
        answer2 = answers.get(number=2)
        answer3 = answers.get(number=3)
        answer4 = answers.get(number=4)

        async_to_sync(channel_layer.group_send)(self.game_code, {"type": "next.question",
                                                                 "text": {"title": question.question_text,

                                                                          "question_id": question.question_id,

                                                                          "answer1": {"text": answer1.answer_text,
                                                                                      "is_correct": answer1.is_correct},

                                                                          "answer2": {"text": answer2.answer_text,
                                                                                      "is_correct": answer2.is_correct},

                                                                          "answer3": {"text": answer3.answer_text,
                                                                                      "is_correct": answer3.is_correct},

                                                                          "answer4": {"text": answer4.answer_text,
                                                                                      "is_correct": answer4.is_correct}
                                                                          }
                                                                 }
                                                )

        self.question_number += 1
        self.answers_received = 0

        self.parallel_task = threading.Timer(5, self.show_question)
        self.parallel_task.start()

    def show_question(self):
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(self.game_code, {"type": "show.question"})
        self.parallel_task = threading.Timer(42, self.post_answers_freeze_time)
        self.parallel_task.start()

    def post_answers_freeze_time(self):
        print("post_answers_freeze_time")
        if self.parallel_task.is_alive():
            self.parallel_task.cancel()

        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(self.game_code, {"type": "post.answer.freeze.time",
                                                                 "text": self.players_information},)

        self.parallel_task = threading.Timer(3, self.show_points_freeze_time)
        self.parallel_task.start()

    def show_points_freeze_time(self):
        print("show_points_freeze_time")
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(self.game_code, {"type": "show.points.freeze.time"})

        self.parallel_task = threading.Timer(3, self.send_next_question)
        self.parallel_task.start()


class QuizPlayerConsumer(WebsocketConsumer):
    def connect(self):
        self.game_code = self.scope['url_route']['kwargs']['game_code']
        self.username = self.scope['url_route']['kwargs']['username']
        self.points = 0
        self.correct_answer = False
        self.accept()
        self.manager_channel_name = None
        # Checks if the game exists
        try:
            active_game = ActiveGame.objects.get(game_code=self.game_code)
            self.manager_channel_name = active_game.manager_channel_name
        except ObjectDoesNotExist:
            self.send(text_data=json.dumps({"type": "connection_handshake",
                                            "connection_accepted": False,
                                            "error": "El código no es válido"}))
            self.close()
            raise DenyConnection()

        # Checks if the username has been already used

        try:
            Username.objects.get(active_game=active_game, username=self.username)
            self.send(json.dumps({"type": "connection_handshake",
                                  "connection_accepted": False,
                                  "error": "El usuario está en uso"
                                  }))
            self.close()
            raise DenyConnection()

        except ObjectDoesNotExist:
            username = Username(active_game=active_game, username=self.username)
            username.save()
            self.send(json.dumps({"type": "connection_handshake",
                                  "connection_accepted": True
                                  }))

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.send)(self.manager_channel_name, {"type": "user_joined",
                                                                             "text": self.username})

        async_to_sync(channel_layer.group_add)(self.game_code, self.channel_name)

    def disconnect(self, code):
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.send)(self.manager_channel_name, {"type": "user.disconnected"})

    def receive(self, text_data=None, bytes_data=None):
        mensaje = json.loads(text_data)

        if self.answer_send:
            return

        if mensaje["msg_type"] == "question_answered":
            question_number = mensaje["question"]

            if mensaje["question"] == 1:
                self.answer_send = True
                if self.current_question["answer1"]["is_correct"]:
                    self.correct_answer = True

            elif mensaje["question"] == 2:
                self.answer_send = True
                if self.current_question["answer2"]["is_correct"]:
                    self.correct_answer = True

            elif mensaje["question"] == 3:
                self.answer_send = True
                if self.current_question["answer3"]["is_correct"]:
                    self.correct_answer = True

            elif mensaje["question"] == 4:
                self.answer_send = True
                if self.current_question["answer4"]["is_correct"]:
                    self.correct_answer = True

            else:
                self.answer_send = True

            if self.correct_answer:
                self.points += 40 - (datetime.now() - self.timestamp).seconds

            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.send)(self.manager_channel_name, {"type": "question.answered",
                                                                          "text": {"username": self.username,
                                                                                   "points": self.points}})

    def start_game(self, text_data=None, bytes_data=None):
        self.send(json.dumps({"type": "start_game"}))

    def next_question(self, event):
        self.timestamp = datetime.now()
        self.answer_send = False
        self.correct_answer = False
        self.current_question = event["text"]
        self.send(text_data=json.dumps({
                                        "type": "question_information",
                                        "question_information": {"title": self.current_question["title"],
                                                                 "question_id": self.current_question["question_id"],
                                                                 "answer1": self.current_question["answer1"]["text"],
                                                                 "answer2": self.current_question["answer2"]["text"],
                                                                 "answer3": self.current_question["answer3"]["text"],
                                                                 "answer4": self.current_question["answer4"]["text"]}
                                        }
                                       )
                  )

    def show_question(self, event):
        self.send(text_data=json.dumps({"type": "show_question"}))

    def post_answer_freeze_time(self, event):
        self.send(text_data=json.dumps({"type": "post_answer_freeze_time",
                                        "player_information": event["text"],
                                        "correct_answer": self.correct_answer}))

    def show_points_freeze_time(self, event):
        self.send(text_data=json.dumps({"type": "show_points_freeze_time"}))

    def game_over(self, event):
        self.send(text_data=json.dumps({"type": "game_over"}))

    def management_disconnected(self, event):
        self.send(text_data=json.dumps({"type": "managment_disconnected"}))
