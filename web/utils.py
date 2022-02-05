from django.conf import settings
import random
import pathlib
import os
from .models import ActiveGame
from django.core.exceptions import ObjectDoesNotExist


def save_image(file_bytes, filename, directory):
    pathlib.Path(directory).mkdir(parents=True, exist_ok=True)
    file_path = os.path.join(directory, filename)
    with open(file_path, "wb+") as file:
        file.write(file_bytes.read())


def generate_game_code():
    loop = True

    while loop:
        game_id = random.randint(100000, 999999)

        try:
            ActiveGame.objects.get(game_id=game_id)

        except ObjectDoesNotExist:
            return game_id
