from django.db import models
import os
from django.conf import settings

# Create your models here.


class Quiz(models.Model):
    quiz_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    date = models.DateField()


class Question(models.Model):
    question_id = models.AutoField(primary_key=True)
    question_text = models.TextField()
    quiz = models.ForeignKey('Quiz', on_delete=models.DO_NOTHING, null=True)


class Answer(models.Model):
    answer_id = models.AutoField(primary_key=True)
    answer_text = models.CharField(max_length=255)
    is_correct = models.BooleanField()
    number = models.IntegerField()
    question = models.ForeignKey('Question', on_delete=models.DO_NOTHING)


class Image(models.Model):
    filename = models.CharField(max_length=255)
    question = models.ForeignKey('Question', on_delete=models.DO_NOTHING)


class ActiveGame(models.Model):
    game_id = models.AutoField(primary_key=True)
    game_code = models.CharField(max_length=255)
    owner_session = models.CharField(max_length=255)
    manager_channel_name = models.CharField(default="", max_length=255)
    quiz = models.ForeignKey('Quiz', on_delete=models.DO_NOTHING)


class Username(models.Model):
    active_game = models.ForeignKey('ActiveGame', on_delete=models.DO_NOTHING)
    username = models.CharField(max_length=255)
