var username;
var channel;
var workspace;
var tic = false;
var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;

function getLoggedUsers(container) {
    var xmlhttp = new XMLHttpRequest();
    var url = "/apix/get-logged-users";

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

            while (container.hasChildNodes()) {
                container.removeChild(container.lastChild);
            }
            var usersJson = JSON.parse(this.response);
            usersJson = usersJson["results"];
            var userOption = document.createElement("option");
            userOption.value = username;
            userOption.innerText = username;
            container.appendChild(userOption);

            for (i in usersJson) {
                if (!(usersJson[i]["username"] == username)) {
                    var userOption = document.createElement("option");
                    userOption.value = usersJson[i]["username"];
                    userOption.innerText = usersJson[i]["username"];
                    container.appendChild(userOption);
                }
            }
            container.onchange = function () {
                channel.initSocket(this.value, workspace);
            };
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

window.onload = function () {
    username = document.getElementById("username").innerText;
    var loggedUsersContainer = document.getElementById("logged-users");
    if (isAndroid) {
        workspace = "remote";
    }
    else workspace = "desktop";


    if (isAndroid) {
        window.setInterval(function () {
            tic = true;
        }, 1000);

        channel = new Channel();
        channel.initSocket(username, workspace);

        getLoggedUsers(loggedUsersContainer);
        window.addEventListener('deviceorientation', channel.sendRemotePosition);
        return;
    }

    username = document.getElementById("username").innerText;
    init_draw();
    channel = new Channel();
    channel.initSocket(username, workspace);

    getLoggedUsers(loggedUsersContainer);
    window.setInterval(function () {
        channel.sendCanvasCopy();
    }, 500);
};
