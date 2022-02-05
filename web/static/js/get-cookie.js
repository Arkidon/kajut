function getCookie(cookie){
    // Gets a cookie name and returns the cookie value
    var cookieList = document.cookie.split(";");
    var cookieDict = {};

    for(var i = 0; i < cookieList.length; i++){
        cookieList[i] = cookieList[i].replace(" ", "");
        values = cookieList[i].split("=");
        cookieDict[values[0]] = values[1];
    }

    return cookieDict[cookie];
}