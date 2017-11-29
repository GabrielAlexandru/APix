var username;
var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;

function get_logged_users() {
    var xmlhttp = new XMLHttpRequest();
    var url = "/apix/get_logged_users";

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var logged_users_container = document.getElementById("logged-users");
            while (logged_users_container.hasChildNodes()) {
                logged_users_container.removeChild(logged_users_container.lastChild);
            }
            var logged_users_json = JSON.parse(this.response);
            logged_users_json = logged_users_json["results"];
            var a_user = document.createElement("option");
            a_user.value = username;
            a_user.innerText = username;
            logged_users_container.appendChild(a_user);
            for (i in logged_users_json) {
                //alert(logged_users_json[i]["username"]);
                if (!(logged_users_json[i]["username"] == username)) {
                    var a_user = document.createElement("option");
                    a_user.value = logged_users_json[i]["username"];
                    a_user.innerText = logged_users_json[i]["username"];
                    logged_users_container.appendChild(a_user);
                }
            }
            logged_users_container.onchange = function () {
                init_socket(this.value);
            };
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function sendCanvasCopy() {
    var dataURL = canvas.toDataURL();
    var username = document.getElementById("username").innerText;
    var msg = {
        type: "canvas",
        text: dataURL,
        room: username
    };
    socket.send(JSON.stringify(msg));
}

window.onload = function () {
    if (isAndroid) {

        return;
    }

    username = document.getElementById("username").innerText;
    init_draw();
    init_socket(username);
    get_logged_users();
    window.setInterval(function () {
        sendCanvasCopy();
    }, 500);
};
