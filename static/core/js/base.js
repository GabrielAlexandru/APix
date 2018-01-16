var username;
var channel;
var workspace;
var drawHelper;
var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
var isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
function getLoggedUsers(container) {
    var xmlhttp = new XMLHttpRequest();
    var url = "/apix/get-logged-users";

    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {

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
                if (!(usersJson[i]["username"] === username)) {
                    userOption = document.createElement("option");
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
    // if (isAndroid) {
    //     workspace = "remote";
    // }
    workspace = "desktop";

    // if (isAndroid) {
    //     channel = new Channel();
    //     channel.initSocket(username, workspace);
    //
    //     getLoggedUsers(loggedUsersContainer);
    //     window.addEventListener('deviceorientation', channel.sendRemotePosition);
    //     return;
    // }

    channel = new Channel();
    channel.initSocket(username, workspace);

    drawHelper = new DrawHelper(channel);
    var canvas = document.getElementById("collab-drawing");
    var sizeRange = document.getElementById("size-range");
    var picker = document.getElementById("picker");
    var pickerCanvas = document.getElementById("picker-canvas");
    var captures = document.getElementById("captures");
    drawHelper.initCanvas(canvas);
    drawHelper.initSizeRange(sizeRange);
    drawHelper.initPicker(picker);
    drawHelper.initPickerCanvas(pickerCanvas);
    drawHelper.initCaptures(captures);


    getLoggedUsers(loggedUsersContainer);
    // window.setInterval(function () {
    //     channel.sendCanvasCopy(drawHelper.canvas);
    // }, 1000);
};
