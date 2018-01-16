var Channel = function () {
    this.socket = null;
    this.tick = false;
    this.ball = null;
    this.maxY = null;
    this.maxX = null;

    this.initSocket = function (target, device) {

        this.socket = new WebSocket("ws://" + window.location.host + "/" + target + "/");

        this.socket.device = device;
        this.socket.target = target;

        window.setInterval(function () {
            this.tick = true;
        }.bind(this), 200);

        this.socket.onmessage = function (e) {
            var message_json = JSON.parse(e.data);
            var text = message_json['text'];
            if (device === "desktop") {
                if (username !== message_json['username']) {
                    if (message_json['type'] === "command") {
                        drawHelper.ctx.beginPath();
                        drawHelper.ctx.moveTo(text[0], text[1]);
                        drawHelper.ctx.lineTo(text[2], text[3]);
                        drawHelper.ctx.strokeStyle = text[4];
                        drawHelper.ctx.lineWidth = text[5];
                        drawHelper.ctx.stroke();
                        drawHelper.ctx.closePath();
                    }
                    if (message_json['type'] === "canvas") {
                        var img = new Image();
                        img.onload = function copy() {
                            drawHelper.ctx.drawImage(img, 0, 0);
                        };
                        img.src = message_json['text']
                    }

                    if (message_json['type'] === "canvas-clear") {
                        drawHelper.ctx.clearRect(0, 0, drawHelper.canvas.width, drawHelper.canvas.height);
                    }
                }
                if (message_json['type'] === "remote") {
                    console.log("remote");
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
            console.log("Websocket down, reinitializing...");
            this.initSocket(this.socket.target, this.socket.device);
        }.bind(this);
    }.bind(this);

    this.sendCanvasCopy = function (canvas) {
        if (this.socket.readyState === 1) {
            var dataURL = canvas.toDataURL();
            var msg = {
                type: "canvas",
                text: dataURL,
                room: username
            };

            this.socket.send(JSON.stringify(msg));
        }
    }.bind(this);

    this.sendClearCanvas = function () {
        if (this.socket.readyState === 1) {
            var msg = {
                type: "canvas-clear",
                text: "command",
                room: username
            };

            this.socket.send(JSON.stringify(msg));
        }
    }.bind(this);

    this.sendRemotePosition = function (event) {
        if (this.socket.readyState === 1) {
            var x = event.beta;
            var y = event.gamma;
            var text = [x, y];

            var msg = {
                type: "remote",
                text: text,
                room: username
            };
            // if (tic)
            this.socket.send(JSON.stringify(msg));
        }
    }.bind(this);

    this.sendInstructions = function (prevX, prevY, currX, currY, colorX, pencilSize) {
        if (this.socket.readyState === 1 && this.tick === true) {

            text = [prevX, prevY, currX, currY, colorX, pencilSize];
            var msg = {
                type: "command",
                text: text,
                room: username
            };
            this.socket.send(JSON.stringify(msg));

            this.tick = false;
        }
    }.bind(this);
};