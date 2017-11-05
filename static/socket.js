var socket;

function init_socket(username) {
    socket = new WebSocket("ws://" + window.location.host + "/" + username + "/");

    socket.onmessage = function (e) {
        //alert(e.data);
        var message_json = JSON.parse(e.data);
        if (message_json['type'] == "command") {
            text = message_json['text'];
            //text = [prevX, prevY, currX, currY, x, y];
            ctx.beginPath();
            ctx.moveTo(text[0], text[1]);
            ctx.lineTo(text[2], text[3]);
            ctx.strokeStyle = text[4];
            ctx.lineWidth = text[5];
            ctx.stroke();
            ctx.closePath();
        }
        if (message_json['type'] == "canvas") {
            var img = new Image();
            img.onload = function copy() {
                ctx.drawImage(img, 0, 0);
            };
            img.src = message_json['text']
        }
    };

    socket.onopen = function () {
        var msg = {
            type: "message",
            text: "Logged in",
            room: username
        };
        socket.send(JSON.stringify(msg));
    };

    socket.onclose = function () {
        alert("Oups, socket closed, need to fix, refresh page 4 ez fix");
    }
    //if (socket.readyState == WebSocket.OPEN) socket.onopen();

}