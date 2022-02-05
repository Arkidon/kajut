function getQuizList(){
    var request = new XMLHttpRequest();
    request.open("GET", "get-quiz-list");
    request.send();

    request.onload = function(){
        var response = JSON.parse(request.response);
        for(quiz of response.quiz_list){
            var quizDiv = document.createElement("div");
            quizDiv.setAttribute("class", "quiz-div");
            quizDiv.setAttribute("data-id", quiz.quiz_id);

            var quizName = document.createElement("h2");
            quizName.setAttribute("class", "quiz-name");
            quizName.textContent = quiz.name;

            var quizDate = document.createElement("p");
            quizDate.setAttribute("class", "quiz-creation-date");
            quizDate.textContent = "Fecha de creación: " + quiz.date;

            var quizQuestionQuant = document.createElement("p");
            quizQuestionQuant.setAttribute("class", "quiz-question-quantity");
            quizQuestionQuant.textContent = quiz.number_of_questions + " preguntas";

            var quizSelectButton = document.createElement("button");
            quizSelectButton.setAttribute("class", "quiz-select-button");
            quizSelectButton.textContent = "Seleccionar";
            quizSelectButton.setAttribute("onclick", `seleccionarQuiz(${quiz.quiz_id})`);

            quizDiv.append(quizName);
            quizDiv.append(quizDate);
            quizDiv.append(quizQuestionQuant);
            quizDiv.append(quizSelectButton);

            document.getElementById("quiz-list").append(quizDiv);
        }
    }
}

getQuizList();

var quiz;

function seleccionarQuiz(quiz_id){
    quiz = quiz_id;
    document.getElementById("submit-quiz-button").setAttribute("class", "active-submit-quiz-button");
    document.getElementById("submit-quiz-button").textContent = "Empezar partida";
    var quizDiv = document.querySelector(`[data-id="${quiz_id}"]`);
    var headerTitle = document.getElementById("selected-quiz-div");
    headerTitle.textContent = quizDiv.getElementsByClassName("quiz-name")[0].textContent;
}

function startMatch(){
    var request = new XMLHttpRequest();
    request.open("POST", "create-game");
    request.setRequestHeader("X-CSRFTOKEN", getCookie('csrftoken'));

    var formData = new FormData();
    formData.append("quiz_id", quiz);
    request.send(formData);

    request.onload = function(){
        var response = JSON.parse(request.response);
        
        if(response.game_created){
            window.location.href = "/manage-game/" + response.game_code;
        }
        else{
            alert("Error al crear la partida");
        }
    }
}