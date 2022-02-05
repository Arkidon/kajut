var gameCode = document.getElementById("game-code").value;

var protocol = window.location.protocol;
var wsProtocol;

if(protocol == 'http:'){
    wsProtocol = 'ws://';
}
else if(protocol == 'https:'){
    wsProtocol = 'wss://'
}


var webSocket = new WebSocket(wsProtocol + window.location.host + '/ws/game-managment/'+gameCode);

webSocket.onopen = function(){
    document.getElementById("game_code").textContent = gameCode;
}

webSocket.onmessage = function(event){
    var mensaje = JSON.parse(event.data);

    switch(mensaje.msg_type){
        case "user_joined":
            var userListDiv = document.getElementById("users-list-div");

            var userPar = document.createElement("p");
            userPar.setAttribute("class", "user");

            userPar.textContent = mensaje.username;

            userListDiv.append(userPar);

            break;

        case "game_over":
            alert("La partida ha terminado. Gracias por crearla :D");
            window.location.href = "/";
            break;
    }

}

function startGame(){
    document.getElementById("start-game-div").style.display = "none";
    webSocket.send(JSON.stringify({"msg_type": "start_game"}));
    document.getElementById("game_code_div").style.display = "none";
    document.getElementById("users-list-div").style.display = "none";
    document.getElementById("match-running-message").style.display = "block";
}