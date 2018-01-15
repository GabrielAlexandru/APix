var Channel = function () {
    this.socket = null;
    this.ball = null;
    this.maxY = null;
    this.maxX = null;

    this.initSocket = function (device, target) {

        this.socket = new WebSocket("ws://" + window.location.host + "/" + target + "/");

        this.socket.device = device;
        this.socket.target = target;

        this.socket.onmessage = function (e) {
            var message_json = JSON.parse(e.data);
            if (device === "desktop") {

                if (message_json['type'] === "command") {
                    var text = message_json['text'];
                    //text = [prevX, prevY, currX, currY, x, y];
                    ctx.beginPath();
                    ctx.moveTo(text[0], text[1]);
                    ctx.lineTo(text[2], text[3]);
                    ctx.strokeStyle = text[4];
                    ctx.lineWidth = text[5];
                    ctx.stroke();
                    ctx.closePath();
                }
                if (message_json['type'] === "canvas") {
                    var img = new Image();
                    img.onload = function copy() {
                        ctx.drawImage(img, 0, 0);
                    };
                    img.src = message_json['text']
                }
                if (message_json['type'] === "remote") {
                    console.log("remote");
                    var text = message_json['text'];
                    // ball = document.getElementById('ball');
                    // maxX = canvas.clientWidth - ball.clientWidth;
                    // maxY = canvas.clientHeight - ball.clientHeight;
                    var x = text[0];
                    var y = text[1];
                    if (x > 90) {
                        x = 90
                    }
                    if (x < -90) {
                        x = -90
                    }
                    x += 90;
                    y += 90;
                    // ball.style.top = (maxX * x / 180 - 10) + "px";
                    // ball.style.left = (maxY * y / 180 - 10) + "px";
                }
            }
        };

        this.socket.onopen = function () {
            var msg = {
                type: "message",
                text: "Logged in",
                room: username
            };
            this.send(JSON.stringify(msg));
        };

        this.socket.onclose = function () {
            alert("Oups, socket closed, need to fix, refresh page 4 ez fix");
        }
    };

    this.sendCanvasCopy = function () {
        var dataURL = canvas.toDataURL();
        var msg = {
            type: "canvas",
            text: dataURL,
            room: username
        };
        this.socket.send(JSON.stringify(msg));
    };

    this.sendRemotePosition = function (event) {
        var x = event.beta;
        var y = event.gamma;
        var text = [x, y];

        var msg = {
            type: "remote",
            text: text,
            room: username
        };
        if (tic)
            this.socket.send(JSON.stringify(msg));
    }
};