var prevX = 0;
var currX = 0;
var prevY = 0;
var currY = 0;
var flag = false;
var dot_flag = false;
var drawMouse = false;
var drawShape = false;

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

var DrawHelper = function (channel) {
    this.channel = channel;
    this.canvas = null;
    this.ctx = null;
    this.rect = null;
    this.sizeRange = null;
    this.picker = null;
    this.pickerCanvas = null;
    this.color = "black";
    this.pencilSize = 5;
    this.captures = null;
    this.captureList = [];

    this.defaultDrawingON = function (canvas) {
        var findxy = this.findxy;
        canvas.addEventListener("mousemove", mousemove = function (e) {
            findxy('move', e)
        }, false);
        canvas.addEventListener("mousedown", mousedown = function (e) {
            findxy('down', e)
        }, false);
        canvas.addEventListener("mouseup", mouseup = function (e) {
            findxy('up', e)
        }, false);
        canvas.addEventListener("mouseout", mouseout = function (e) {
            findxy('out', e)
        }, false);
    }.bind(this);

    this.defaultDrawingOFF = function (canvas) {
        canvas.removeEventListener("mousemove", mousemove, false);
        canvas.removeEventListener("mousedown", mousedown, false);
        canvas.removeEventListener("mouseup", mouseup, false);
        canvas.removeEventListener("mouseout", mouseout, false);
    }.bind(this);

    this.initCanvas = function (canvas) {
        canvas.width = Math.ceil(canvas.width * 2);
        canvas.height = Math.ceil(canvas.height * 2);

        this.canvas = canvas;
        this.rect = canvas.getBoundingClientRect();
        this.ctx = canvas.getContext("2d");

        this.defaultDrawingON(canvas);
    }.bind(this);

    this.initSizeRange = function (sizeRange) {
        var helper = this;
        sizeRange.addEventListener("input", function (e) {
            helper.pencilSize = Math.floor(sizeRange.value / 10);
        }, false);

        this.sizeRange = sizeRange;
    }.bind(this);

    this.initPicker = function (picker) {
        this.picker = picker;
    }.bind(this);

    this.initCaptures = function (captures) {
        this.captures = captures;
    }.bind(this);

    this.initPickerCanvas = function (pickerCanvas) {
        this.pickerCanvas = pickerCanvas;
    }.bind(this);

    this.findxy = function (res, e) {
        var canvas = this.canvas;
        var rect = this.rect;
        var ctx = this.ctx;
        if (res === 'down') {
            prevX = currX;
            prevY = currY;
            currX = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
            currY = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;

            flag = true;
            dot_flag = true;
            if (dot_flag) {
                ctx.beginPath();
                ctx.fillStyle = this.color;
                ctx.lineJoin = ctx.lineCap = 'round';
                ctx.fillRect(currX, currY, 2, 2);
                ctx.closePath();
                dot_flag = false;
            }
        }
        if (res === 'up' || res === 'out') {
            flag = false;
        }
        if (res === 'move') {
            if (flag) {
                prevX = currX;
                prevY = currY;
                currX = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
                currY = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
                this.draw();
            }
        }
    }.bind(this);

    this.colorSwitch = function (obj) {
        console.log("emfgt");
        var tmpColor;
        if (document.getElementsByClassName("selected")[0]) {
            document.getElementsByClassName("selected")[0].className = "";
        }
        this.picker.addEventListener("input", function () {
            tmpColor = this.picker.value;
            this.color = tmpColor;
            document.styleSheets[2].insertRule("input[type=range]::-webkit-slider-thumb { background: " + tmpColor + "; }", document.styleSheets[2].cssRules.length);
        }.bind(this), false);
        obj.className += "selected";
        switch (obj.id) {
            case "green":
                tmpColor = "green";
                break;
            case "blue":
                tmpColor = "blue";
                break;
            case "red":
                tmpColor = "red";
                break;
            case "yellow":
                tmpColor = "yellow";
                break;
            case "orange":
                tmpColor = "orange";
                break;
            case "black":
                tmpColor = "black";
                break;
            case "white":
                tmpColor = "white";
                break;
        }
        this.color = tmpColor;
        document.styleSheets[2].insertRule("input[type=range]::-webkit-slider-thumb { background: " + tmpColor + "; }", document.styleSheets[2].cssRules.length);

    }.bind(this);

    this.draw = function () {
        var ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.pencilSize;
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.stroke();
        ctx.closePath();
        //this.channel.sendInstructions(prevX, prevY, currX, currY, this.color, this.pencilSize);
        //overloads socket, sending canvas copies every 1 second is lot better.
    }.bind(this);

    this.erase = function () {
        var m = confirm("Want to clear");
        if (m) {
            ctx.clearRect(0, 0, w, h);
            document.getElementById("canvasimg").style.display = "none";
        }
    }.bind(this);

    this.clearCanvas = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.channel.sendClearCanvas();
    }.bind(this);

    this.save = function () {
        document.getElementById("canvasimg").style.border = "2px solid";
        var dataURL = canvas.toDataURL();
        document.getElementById("canvasimg").src = dataURL;
        document.getElementById("canvasimg").style.display = "inline";
    }.bind(this);

    this.findPos = function (canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
            y: (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
        };
    }.bind(this);

    this.shapeDraw = function (obj) {

        function drawEllipse(x1, y1, x2, y2, ctx, color, pencilSize) {
            var radiusX = (x2 - x1) * 0.5,
                radiusY = (y2 - y1) * 0.5,
                centerX = x1 + radiusX,
                centerY = y1 + radiusY,
                step = 0.01,
                a = step,
                pi2 = Math.PI * 2 - step;

            ctx.beginPath();
            ctx.moveTo(centerX + radiusX * Math.cos(0),
                centerY + radiusY * Math.sin(0));

            for (; a < pi2; a += step) {
                ctx.lineTo(centerX + radiusX * Math.cos(a),
                    centerY + radiusY * Math.sin(a));
            }

            ctx.closePath();
            ctx.strokeStyle = color;
            ctx.lineWidth = pencilSize;
            //ctx.fillStyle = this.color;
            ctx.stroke();
            //ctx.fill();
        }


        if (drawShape && !obj.classList.contains("shape-on")) {
            nodeList = document.getElementsByClassName("shape-on");
            for (i = 0; i < nodeList.length; i++) {
                nodeList[i].classList.remove("shape-on");
            }
        }
        if (drawShape && obj.classList.contains("shape-on"))
        {
            document.getElementById("fake-canvas").remove();
        }

        var shape = obj.id;
        var canvas = this.canvas;
        var fakeCanvas;

        if (!obj.classList.contains("shape-on")) {
            drawShape = true;
            obj.classList.add("shape-on");

            var container = document.getElementById("content");
            if (document.getElementById("fake-canvas") === null) {
                fakeCanvas = canvas.cloneNode(true);
                fakeCanvas.id = "fake-canvas";
                container.insertBefore(fakeCanvas, container.childNodes[0]);
            }
            else {
                fakeCanvas = document.getElementById("fake-canvas");
                fakeCanvas.removeEventListener("mousemove", mousemove, false);
                fakeCanvas.removeEventListener("mousedown", mousedown, false);
                fakeCanvas.removeEventListener("mouseup", mouseup, false);
            }
            var ctx = fakeCanvas.getContext("2d");
            ctx.clearRect(0, 0, fakeCanvas.width, fakeCanvas.height);
            var rect = fakeCanvas.getBoundingClientRect();


            var startX;
            var startY;

            fakeCanvas.addEventListener("mousedown", mousedown = function (e) {
                startX = (e.clientX - rect.left) / (rect.right - rect.left) * fakeCanvas.width;
                startY = (e.clientY - rect.top) / (rect.bottom - rect.top) * fakeCanvas.height;
            }, false);

            fakeCanvas.addEventListener("mousemove", mousemove = function (e) {
                currX = (e.clientX - rect.left) / (rect.right - rect.left) * fakeCanvas.width;
                currY = (e.clientY - rect.top) / (rect.bottom - rect.top) * fakeCanvas.height;

                if (shape === "rectangle") {
                    ctx.beginPath();
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = this.pencilSize;
                    ctx.rect(startX, startY, currX - startX, currY - startY);
                    ctx.clearRect(0, 0, fakeCanvas.width, fakeCanvas.height);
                    ctx.stroke();
                }
                if (shape === "circle") {
                    ctx.clearRect(0, 0, fakeCanvas.width, fakeCanvas.height);
                    drawEllipse(startX, startY, currX, currY, ctx, this.color, this.pencilSize);
                }
            }.bind(this), false);


            fakeCanvas.addEventListener("mouseup", mouseup = function (e) {
                currX = (e.clientX - rect.left) / (rect.right - rect.left) * fakeCanvas.width;
                currY = (e.clientY - rect.top) / (rect.bottom - rect.top) * fakeCanvas.height;
                if (shape === "rectangle") {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = this.color;
                    this.ctx.lineWidth = this.pencilSize;
                    this.ctx.rect(startX, startY, currX - startX, currY - startY);
                    this.ctx.stroke();
                }
                if (shape === "circle") {
                    ctx.clearRect(0, 0, fakeCanvas.width, fakeCanvas.height);
                    drawEllipse(startX, startY, currX, currY, this.ctx, this.color, this.pencilSize);
                }

                fakeCanvas.remove();
                canvas.style.display = "block";
                drawShape = false;
                obj.classList.remove("shape-on");
            }.bind(this), false);
        } else {
            obj.classList.remove("shape-on");
        }
    }.bind(this);

    this.pick = function () {
        var helper = this;
        var findxy = helper.findxy;
        var canvas = helper.canvas;
        var pickerCanvas = helper.pickerCanvas;
        if (pickerCanvas.className !== "picker-on") {
            canvas.style.cursor = "crosshair";
            pickerCanvas.className = "picker-on";

            var context = canvas.getContext('2d');
            canvas.addEventListener("mousemove", mousePicker = function (e) {
                var pos = this.findPos(canvas, e);
                var x = pos.x;
                var y = pos.y;
                var coord = "x=" + x + ", y=" + y;
                var p = context.getImageData(x, y, 1, 1).data;
                if (p[0] === 0 && p[1] === 0 && p[2] === 0 && p[3] === 0) {
                    hex = "#ffffff";
                } else {
                    var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
                }
                document.styleSheets[2].insertRule("input[type=range]::-webkit-slider-thumb { background: " + hex + "; }", document.styleSheets[2].cssRules.length);
            }.bind(this), false);

            canvas.addEventListener("click", pickedColor = function (e) {
                var rect = canvas.getBoundingClientRect();
                var x = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
                var y = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
                var p = context.getImageData(x, y, 1, 1).data;
                if (p[0] === 0 && p[1] === 0 && p[2] === 0 && p[3] === 0) {
                    hex = "#ffffff";
                } else {
                    var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
                }
                helper.color = hex;
                canvas.removeEventListener("mousemove", mousePicker);
                canvas.style.cursor = "auto";
                pickerCanvas.className = "";
                canvas.removeEventListener("mousemove", mousePicker);


                this.defaultDrawingON(canvas);
                canvas.removeEventListener("click", pickedColor);
            }.bind(this), false);

            this.defaultDrawingOFF(canvas);
        } else {
            canvas.style.cursor = "auto";
            pickerCanvas.className = "";
            canvas.removeEventListener("mousemove", mousePicker);

            this.defaultDrawingON(canvas);
        }
    }.bind(this);

    this.downloadPNG = function () {
        var helper = this;
        var img = helper.canvas.toDataURL("image/png");
        var imgDiv = document.createElement("a");
        imgDiv.href = img;
        imgDiv.download = 'YourPNG.png';
        imgDiv.style.display = "none";
        document.body.appendChild(imgDiv);
        imgDiv.click();
        document.body.removeChild(imgDiv);
    }.bind(this);

    this.downloadSVG = function () {
        var helper = this;
        var img = helper.canvas.toDataURL("image/png");
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        var imgDiv = document.createElementNS("http://www.w3.org/2000/svg", "image");
        imgDiv.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", img);
        svg.style.display = "none";
        svg.appendChild(imgDiv);
        var serializer = new XMLSerializer();
        var source = serializer.serializeToString(svg);
        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
            source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
        var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
        var link = document.createElement("a");
        link.href = url;
        link.download = "YourSVG.svg";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }.bind(this);

    this.capture = function () {
        var helper = this;
        var img = helper.canvas.toDataURL("image/png");
        var imgDiv = document.createElement("img");
        imgDiv.classList.add("capture");
        imgDiv.src = img;
        helper.captures.append(imgDiv);
        console.log(imgDiv);

    }.bind(this);
};
