from django import forms


class QuizForm(forms.Form):
    kajut_name = forms.CharField(max_length=255)
    question_information = forms.JSONField()
    images = forms.FileField(required=False)


class CreateGame(forms.Form):
    quiz_id = forms.IntegerField()
