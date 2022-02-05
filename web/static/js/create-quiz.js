class Pregunta{
    constructor(pregunta, imagen, respuesta1, respuesta2, respuesta3, respuesta4){
        this.titulo = pregunta;
        this.imagen = imagen;
        this.respuesta1 = respuesta1;
        this.respuesta2 = respuesta2;
        this.respuesta3 = respuesta3;
        this.respuesta4 = respuesta4;
    }
}

class Respuesta{
    constructor(texto, correcta){
        this.texto = texto;
        this.correcta = correcta;
    }
}

var listaPreguntas = [];
var position = 0;


function insertarImagen(){
    var input = document.createElement("input");
    input.type = "file";
    input.click();
    input.oninput = function(){
        listaPreguntas[position].imagen = input.files[0];
        actualizarImagen();
    }
}

function borrarImagen(){
    listaPreguntas[position].imagen = null;
    actualizarImagen();
}

function cambiarPregunta(div){
    position = div.getAttribute("data-position");
    actualizarPreguntaMostrada();
}

function actualizarTitulo(){
    var titulo = document.getElementById("title-input").value;
    if (titulo == ""){
        listaPreguntas[position].titulo = null;
    }
    else{
        listaPreguntas[position].titulo = titulo;
    }
}

function actualizarImagen(){
    var pregunta = listaPreguntas[position];

    if(pregunta.imagen == null){
        document.getElementById("image-panel").style.display = "none";
        document.getElementById("default-image-panel").style.display = "block";
    }
    else{
        var fileReader = new FileReader();
        fileReader.readAsDataURL(pregunta.imagen);
        fileReader.addEventListener("load", function(){
            document.getElementById("image").src = fileReader.result;
        })
        document.getElementById("image-panel").style.display = "flex";
        document.getElementById("default-image-panel").style.display = "none";
    }

}

function actualizarRespuesta1(){
    var respuesta1 = document.getElementById("answer1-input").value;
    var botonRespuestaCorrecta1 = document.getElementById("answer1-correct-button");
    if (respuesta1 == ""){
        listaPreguntas[position].respuesta1 = null;
        document.getElementById("answer1-correct-button").setAttribute("data-toogle", "off");
    }
    else{
        var activado = botonRespuestaCorrecta1.getAttribute("data-toogle") == "on";
        listaPreguntas[position].respuesta1 = new Respuesta(respuesta1, activado);
    }
}

function actualizarRespuesta2(){
    var respuesta2 = document.getElementById("answer2-input").value;
    var botonRespuestaCorrecta2 = document.getElementById("answer2-correct-button");
    if (respuesta2 == ""){
        listaPreguntas[position].respuesta2 = null;
        document.getElementById("answer2-correct-button").setAttribute("data-toogle", "off");
    }
    else{
        var activado = botonRespuestaCorrecta2.getAttribute("data-toogle") == "on";
        listaPreguntas[position].respuesta2 = new Respuesta(respuesta2, activado);
    }
}

function actualizarRespuesta3(){
    var respuesta3 = document.getElementById("answer3-input").value;
    var botonRespuestaCorrecta3 = document.getElementById("answer3-correct-button");
    if (respuesta3 == ""){
        listaPreguntas[position].respuesta3 = null;
        document.getElementById("answer3-correct-button").setAttribute("data-toogle", "off");
    }
    else{
        var activado = botonRespuestaCorrecta3.getAttribute("data-toogle") == "on";
        listaPreguntas[position].respuesta3 = new Respuesta(respuesta3, activado);
    }
}

function actualizarRespuesta4(){
    var respuesta4 = document.getElementById("answer4-input").value;
    var botonRespuestaCorrecta4 = document.getElementById("answer4-correct-button");
    if (respuesta4 == ""){
        listaPreguntas[position].respuesta4 = null;
        document.getElementById("answer4-correct-button").setAttribute("data-toogle", "off");
    }
    else{
        var activado = botonRespuestaCorrecta4.getAttribute("data-toogle") == "on";
        listaPreguntas[position].respuesta4 = new Respuesta(respuesta4, activado);
    }
}

function actualizarPreguntaMostrada(){
    var pregunta = listaPreguntas[position];
    document.getElementById("title-input").value = pregunta.titulo;

    if(pregunta.respuesta1 != null){
        document.getElementById("answer1-input").value = pregunta.respuesta1.texto;

        if(pregunta.respuesta1.correcta){
            document.getElementById("answer1-correct-button").setAttribute("data-toogle", "on");
        }
        else{
            document.getElementById("answer1-correct-button").setAttribute("data-toogle", "off");
        }
    }
    else{
        document.getElementById("answer1-input").value = null;
        document.getElementById("answer1-correct-button").setAttribute("data-toogle", "off");
    }
    

    if(pregunta.respuesta2 != null){
        document.getElementById("answer2-input").value = pregunta.respuesta2.texto;

        if(pregunta.respuesta2.correcta){
            document.getElementById("answer2-correct-button").setAttribute("data-toogle", "on");
        }
        else{
            document.getElementById("answer2-correct-button").setAttribute("data-toogle", "off");
        }
    }
    else{
        document.getElementById("answer2-input").value = null;
        document.getElementById("answer2-correct-button").setAttribute("data-toogle", "off");
    }


    if(pregunta.respuesta3 != null){
        document.getElementById("answer3-input").value = pregunta.respuesta3.texto;

        if(pregunta.respuesta3.correcta){
            document.getElementById("answer3-correct-button").setAttribute("data-toogle", "on");
        }
        else{
            document.getElementById("answer3-correct-button").setAttribute("data-toogle", "off");
        }
    }
    else{
        document.getElementById("answer3-input").value = null;
        document.getElementById("answer3-correct-button").setAttribute("data-toogle", "off");
    }



    if(pregunta.respuesta4 != null){
        document.getElementById("answer4-input").value = pregunta.respuesta4.texto;

        if(pregunta.respuesta4.correcta){
            document.getElementById("answer4-correct-button").setAttribute("data-toogle", "on");
        }
        else{
            document.getElementById("answer4-correct-button").setAttribute("data-toogle", "off");
        }
    }
    else{
        document.getElementById("answer4-input").value = null;
        document.getElementById("answer4-correct-button").setAttribute("data-toogle", "off");
    }

    var preguntas = document.getElementsByClassName("question");
    for (pregunta of preguntas){
        pregunta.setAttribute("class", "question");
    }

    var preguntaElegida = document.getElementById("question-"+(parseInt(position)+1));
    preguntaElegida.setAttribute("class", "question selected-question");

    actualizarImagen();
}

function toogleRespuestaCorrecta1(){
    var boton = document.getElementById("answer1-correct-button");

    if(document.getElementById("answer1-input").value == ""){
        return;
    }

    if(boton.getAttribute("data-toogle") == "off"){
        boton.setAttribute("data-toogle", "on");
    }
    else{
        boton.setAttribute("data-toogle", "off");
    }
    actualizarRespuesta1();
}

function toogleRespuestaCorrecta2(){
    var boton = document.getElementById("answer2-correct-button");

    if(document.getElementById("answer2-input").value == ""){
        return;
    }

    if(boton.getAttribute("data-toogle") == "off"){
        boton.setAttribute("data-toogle", "on");
    }
    else{
        boton.setAttribute("data-toogle", "off");
    }
    actualizarRespuesta2();
}

function toogleRespuestaCorrecta3(){
    var boton = document.getElementById("answer3-correct-button");

    if(document.getElementById("answer3-input").value == ""){
        return;
    }

    if(boton.getAttribute("data-toogle") == "off"){
        boton.setAttribute("data-toogle", "on");
    }
    else{
        boton.setAttribute("data-toogle", "off");
    }
    actualizarRespuesta3();
    
}

function toogleRespuestaCorrecta4(){
    var boton = document.getElementById("answer4-correct-button");

    if(document.getElementById("answer4-input").value == ""){
        return;
    }

    if(boton.getAttribute("data-toogle") == "off"){
        boton.setAttribute("data-toogle", "on");
    }
    else{
        boton.setAttribute("data-toogle", "off");
    }
    actualizarRespuesta4();
}


function submitKajut(){
    if(!validateKajut()) return;
    
    var formData = new FormData();
    formData.append("kajut_name", document.getElementById("kajut-name-input").value);

    var informacionPreguntas = []
    for(var i = 0; i<listaPreguntas.length; i++){
        var diccionario = {};
        var pregunta = listaPreguntas[i];

        diccionario["titulo"] = pregunta.titulo;
        
        if(pregunta.imagen == null){
            diccionario["imagen"] = false;
        }
        else{
            diccionario["imagen"] = true;
            formData.append("images", pregunta.imagen);
        }

        diccionario["respuesta1"] = {"texto": pregunta.respuesta1.texto, "correcta": pregunta.respuesta1.correcta}

        diccionario["respuesta2"] = {"texto": pregunta.respuesta2.texto, "correcta": pregunta.respuesta2.correcta}

        diccionario["respuesta3"] = {"texto": pregunta.respuesta3.texto, "correcta": pregunta.respuesta3.correcta}

        diccionario["respuesta4"] = {"texto": pregunta.respuesta4.texto, "correcta": pregunta.respuesta4.correcta}

        informacionPreguntas.push(diccionario);
    }

    formData.append("question_information", JSON.stringify(informacionPreguntas));

    var request = new XMLHttpRequest();
    request.open("POST", "/create-quiz");
    request.setRequestHeader("X-CSRFTOKEN", getCookie("csrftoken"));
    
    request.send(formData);

    request.onload = function(){
        var response = JSON.parse(request.response);
        document.getElementById("submit-kajut-button").disabled = true;
        
        if(response.valid){
            alert("Kajut creado correctamente");
            window.location.href = "/";
        }
        else{
            alert("Ha habido un error de comunicación, no se ha podido crear el Kajut");
            document.getElementById("submit-kajut-button").disabled = false;
        }
    }

}


function validateKajut(){
    var kajutName = document.getElementById("kajut-name-input");
    var errors = "";
    var saltoLinea = "\n\n"

    if(kajutName.value == ""){
        errors += "Debes especificar un nombre para el kajut" + saltoLinea;
    }

    for(var i = 0; i<listaPreguntas.length; i++){
        var pregunta = listaPreguntas[i];

        if(pregunta.titulo == "" || pregunta.titulo == null){
            errors += "Debes asignarle un titulo a la pregunta " + (i+1) + saltoLinea;
        }

        if(pregunta.respuesta1 == null || pregunta.respuesta1.texto == ""
            || pregunta.respuesta2 == null || pregunta.respuesta2.texto == "" 
            || pregunta.respuesta3 == null || pregunta.respuesta3.texto == ""
            || pregunta.respuesta4 == null || pregunta.respuesta4.texto == "") {
            errors += "La pregunta " + (i+1) + " tiene respuestas incompletas"+ saltoLinea;
        }

        else if(!pregunta.respuesta1.correcta && !pregunta.respuesta2.correcta
            && !pregunta.respuesta3.correcta && !pregunta.respuesta4.correcta){
            errors += "La pregunta " + (i+1) + " no tiene ninguna respuesta marcada como correcta" + saltoLinea;
        }
    }

    if(errors != ""){
        alert(errors);
        return false;
    }
    else{
        return true
    }

}

//Eliminar imagen de la pregunta
document.getElementById("delete-image-button").addEventListener("click", function(e){
    e.stopPropagation();
    borrarImagen();
    var div = create
})


//Eliminar pregunta
document.getElementById("options-menu-button").addEventListener("click", function(){
    var optionDropMenu = document.getElementById("options-drop-menu");

    if(getComputedStyle(optionDropMenu).display == "flex"){
        optionDropMenu.style.display = "none";
    }
    else if(getComputedStyle(optionDropMenu).display == "none"){
        optionDropMenu.style.display = "flex";
    }
})

//Añadir pregunta
document.getElementById("add-question-button").addEventListener("click", function(e){
    listaPreguntas.push(new Pregunta(null, null, null, null, null, null));
    position = listaPreguntas.length-1;

    var div = document.createElement("div");
    div.className = "question";
    div.id = "question-" + listaPreguntas.length;
    div.setAttribute("data-position", position);

    div.textContent = listaPreguntas.length;

    document.getElementById("question-div").appendChild(div);
    
    div.setAttribute("onclick", "cambiarPregunta(this)")

    actualizarPreguntaMostrada();
})


document.getElementById("add-question-button").click();