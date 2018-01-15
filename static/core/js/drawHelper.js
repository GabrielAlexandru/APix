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
    this.picker = document.getElementById("picker");
    this.pickerCanvas = null;
    this.color = "black";
    this.pencilSize = 5;
    this.captures = document.getElementById("captures");
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

        w = canvas.width;
        h = canvas.height;



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

    this.clearCanvas = function() {
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
        var canvas = this.canvas;
        if (drawShape && !obj.classList.contains("shape-on")) {
            document.getElementsByClassName("shape-on")[0].classList.remove("shape-on");
        }
        var shape = obj.id;
        if (!obj.classList.contains("shape-on")) {
            drawShape = true;
            canvas.style.cursor = "crosshair";
            obj.classList.add("shape-on");

            canvas.removeEventListener("mousemove", mousemove, false);
            canvas.removeEventListener("mousedown", mousedown, false);
            canvas.removeEventListener("mouseup", mouseup, false);
            canvas.removeEventListener("mouseout", mouseout, false);

            var isDrawing = false;
            var startX;
            var startY;
            var lastX;
            var lastY;
            var element = null;
            var mouse = {
                x: 0,
                y: 0,
                startX: 0,
                startY: 0
            };

            function setMousePosition(e) {
                var ev = e || window.event; //Moz || IE
                if (ev.pageX) { //Moz
                    mouse.x = ev.pageX + window.pageXOffset;
                    mouse.y = ev.pageY + window.pageYOffset;
                } else if (ev.clientX) { //IE
                    mouse.x = ev.clientX + document.body.scrollLeft;
                    mouse.y = ev.clientY + document.body.scrollTop;
                }
            }

            canvas.addEventListener("mousedown", drawDown = function (e) {
                if (element !== null) {
                    element = null;
                    canvas.style.cursor = "default";
                    console.log("finsihed.");
                } else {
                    console.log("begun.");
                    mouse.startX = mouse.x;
                    mouse.startY = mouse.y;
                    element = document.createElement('div');
                    element.className = 'rectangleLive';
                    element.style.position = 'absolute';
                    element.style.border = this.pencilSize + 'px solid ' + this.color;
                    element.style.left = mouse.x + 'px';
                    element.style.top = mouse.y + 'px';
                    document.getElementById("content").appendChild(element);
                }
            }.bind(this));
            canvas.addEventListener("mousemove", drawMove = function (e) {
                setMousePosition(e);
                if (element !== null) {
                    element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
                    element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
                    element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
                    element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
                }
            });
            // canvas.addEventListener("mouseup", drawUp = function (e) {
            //     ctx.beginPath();
            //     ctx.strokeStyle = colorX;
            //     ctx.lineWidth = pencilSize;
            //     ctx.rect(startX,startY,pos.x-startX,pos.y-startY);
            //     ctx.stroke();
            //     isDrawing = false;
            // });

        } else {
            drawShape = false;
            canvas.style.cursor = "auto";
            obj.classList.remove("shape-on");
            canvas.removeEventListener("mousemove", drawDown, false);
            canvas.removeEventListener("mousemove", drawMove, false);
            // canvas.removeEventListener("mousemove", drawUp, false);

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
        if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
            source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
        var url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);
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
