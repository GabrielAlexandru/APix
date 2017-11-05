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
    };
    socket.onopen = function () {
        var msg = {
            type: "message",
            text: "Logged in",
            room: username
        };
        socket.send(JSON.stringify(msg));
    }
    //if (socket.readyState == WebSocket.OPEN) socket.onopen();
}