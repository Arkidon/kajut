var protocol = window.location.protocol;
var wsProtocol;
var gameCode;

var webSocket;
var chronometer;
var timeLeft;
const DEFAULT_TIME_LIMIT = 40;

document.getElementById("chrono").textContent = DEFAULT_TIME_LIMIT;

if(protocol == 'http:'){
    wsProtocol = 'ws://';
}
else if(protocol == 'https:'){
    wsProtocol = 'wss://'
}


function checkGame(){
    var gameCodeInput = document.getElementById("game_code_input");

    if(gameCodeInput.value == ""){
        alert("Introduce un código");
        return;
    }

    var request = new XMLHttpRequest();
    request.open('GET', 'check-game/' + gameCodeInput.value);

    request.send();

    request.onload = function(){
        var response = JSON.parse(request.response);

        if(response.game_exists){
            gameCode = gameCodeInput.value;
            gameCodeInput.value = '';
            gameCodeInput.setAttribute('placeholder', 'Inserta un nombre');
            document.getElementById("join-game-button").setAttribute("onclick", "joinGame()");
        }
        else{
            alert("El código no es válido");
        }
    }
}


function joinGame(){
    var usernameInput = document.getElementById("game_code_input");

    if(usernameInput.value == ''){
        alert('Introduce un nombre');
        return;
    }

    webSocket = new WebSocket(wsProtocol + window.location.host + '/ws/quiz-game/' + gameCode + '/' + usernameInput.value);


    webSocket.onmessage = function(event){
        var mensaje = JSON.parse(event.data);
        console.log(mensaje);
        switch(mensaje.type){
            case "connection_handshake":
                if(mensaje.connection_accepted){
                    document.getElementsByClassName("join-game-panel")[0].style.display = "none";
                    document.getElementsByClassName("waiting-game-start-panel")[0].style.display = "flex";
                }
                else{
                    alert(mensaje.error);
                }
                break;

            case "start_game":
                document.getElementsByClassName("waiting-game-start-panel")[0].style.display = "none";
                document.getElementsByClassName("game-panel")[0].style.display = "grid";
                break;
            
            case "question_information":
                var question = mensaje.question_information;
                document.getElementById("answer1-paragraph").textContent = question.answer1;
                document.getElementById("answer2-paragraph").textContent = question.answer2;
                document.getElementById("answer3-paragraph").textContent = question.answer3;
                document.getElementById("answer4-paragraph").textContent = question.answer4;
                document.getElementById("title-paragraph").textContent = question.title;
                document.getElementById("chrono").textContent = DEFAULT_TIME_LIMIT;
                updateImage(question.question_id);
                break;

            case "show_question":
                document.getElementById("chrono-div").style.display = "flex";
                document.getElementsByClassName("game-panel")[0].style.display = "grid";
                document.getElementsByClassName("time-over-panel")[0].style.display = "none";
                startChronometer();
                break;

            case "post_answer_freeze_time":
                document.getElementById("chrono-div").style.display = "none";
                document.getElementById("waiting-for-players-response-panel").style.display = "none";
                document.getElementById("post-answer-freeze-time-panel").style.display = "block";

                if(mensaje.correct_answer){
                    document.getElementById("correct-answer-div").style.display = "flex";
                    document.getElementById("incorrect-answer-div").style.display = "none";
                }
                else{
                    document.getElementById("correct-answer-div").style.display = "none";
                    document.getElementById("incorrect-answer-div").style.display = "flex";
                }

                document.getElementById("score-list").innerHTML = '';

                for(player of mensaje.player_information){
                    var userScoreDiv = document.createElement("div");
                    userScoreDiv.setAttribute("class", "user-score");

                    var usernameParagraph = document.createElement("p");
                    usernameParagraph.textContent = player.username;

                    var pointsParagraph = document.createElement("p");
                    pointsParagraph.textContent = player.points;

                    userScoreDiv.append(usernameParagraph);
                    userScoreDiv.append(pointsParagraph);

                    document.getElementById("score-list").appendChild(userScoreDiv);
                }
                break;

            case "show_points_freeze_time":
                document.getElementsByClassName("game-panel")[0].style.display = "none";
                document.getElementById("post-answer-freeze-time-panel").style.display = "none";
                document.getElementsByClassName("time-over-panel")[0].style.display = "block";
                break;

            case "game_over":
                alert("La partida ha terminado. Gracias por jugar");
                window.location.href = "/";
                break;

            case "managment_disconnected":
                webSocket.close();
                alert("La partida ha sido cancelada :(");
                window.location.href = "/";
                break;
        }   
    }
}

function seleccionarRespuesta1(){
    document.getElementsByClassName("game-panel")[0].style.display = "none";
    document.getElementById("waiting-for-players-response-panel").style.display = "flex";
    webSocket.send(JSON.stringify({"msg_type": "question_answered", "question": 1}));
    stopChronometer();
}

function seleccionarRespuesta2(){
    document.getElementsByClassName("game-panel")[0].style.display = "none";
    document.getElementById("waiting-for-players-response-panel").style.display = "flex";
    webSocket.send(JSON.stringify({"msg_type": "question_answered", "question": 2}));
    stopChronometer();
}

function seleccionarRespuesta3(){
    document.getElementsByClassName("game-panel")[0].style.display = "none";
    document.getElementById("waiting-for-players-response-panel").style.display = "flex";
    webSocket.send(JSON.stringify({"msg_type": "question_answered", "question": 3}));
    stopChronometer();
}

function seleccionarRespuesta4(){
    document.getElementsByClassName("game-panel")[0].style.display = "none";
    document.getElementById("waiting-for-players-response-panel").style.display = "flex";
    webSocket.send(JSON.stringify({"msg_type": "question_answered", "question": 4}));
    stopChronometer();
}


function startChronometer(){
    timeLeft = DEFAULT_TIME_LIMIT;
    chronometer = setInterval(tick, 1000);
}

function stopChronometer(){
    clearInterval(chronometer);
}

function tick(){
    if(timeLeft == 0){
        stopChronometer();
        document.getElementsByClassName("game-panel")[0].style.display = "none";
        document.getElementById("waiting-for-players-response-panel").style.display = "flex";
        webSocket.send(JSON.stringify({"msg_type": "question_answered", "question": 0}));
        return;
    }

    timeLeft--;
    document.getElementById("chrono").textContent = timeLeft;
}


function updateImage(question_id){
    var request = new XMLHttpRequest();
    request.open("GET", "get-question-image/" + question_id);
    request.send();

    request.onload = function(){
        document.getElementById("image").src = "data:image;base64," + request.response;
    }
}