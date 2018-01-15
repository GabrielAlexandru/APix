var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false,
    sizeRange,
    picker,
    drawMouse = false,
    drawShape = false;

var rect;

var colorX = "black",
    pencilSize = 5;

function init_draw() {
    sizeRange = document.getElementById("size-range");
    canvas = document.getElementById("collab-drawing");
    picker = document.getElementById("picker");
    canvas.width = Math.ceil(canvas.width * 2);
    canvas.height = Math.ceil(canvas.height * 2);
    rect = canvas.getBoundingClientRect();
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    sizeRange.addEventListener("input", function (e) {
        pencilSize = Math.floor(sizeRange.value/10);
    }, false);
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

function color(obj) {
    if(document.getElementsByClassName("selected")[0]){
        document.getElementsByClassName("selected")[0].className = "";
    }
    picker.addEventListener("input", function () {
        colorX = picker.value;
        document.styleSheets[2].insertRule("input[type=range]::-webkit-slider-thumb { background: " + colorX + "; }", document.styleSheets[2].cssRules.length);
    }, false);
    obj.className += "selected";
    switch (obj.id) {
        case "green":
            colorX = "green";
            break;
        case "blue":
            colorX = "blue";
            break;
        case "red":
            colorX = "red";
            break;
        case "yellow":
            colorX = "yellow";
            break;
        case "orange":
            colorX = "orange";
            break;
        case "black":
            colorX = "black";
            break;
        case "white":
            colorX = "white";
            break;
    }
    document.styleSheets[2].insertRule("input[type=range]::-webkit-slider-thumb { background: " + colorX + "; }", document.styleSheets[2].cssRules.length);
}

function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = colorX;
    ctx.lineWidth = pencilSize;
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();
    sendInstructions(prevX, prevY, currX, currY, colorX, pencilSize)
    console.log("finshed action");
}

function sendInstructions(prevX, prevY, currX, currY, colorX, pencilSize) {
    text = [prevX, prevY, currX, currY, colorX, pencilSize];
    var username = document.getElementById("username").innerText;
    var msg = {
        type: "command",
        text: text,
        room: username
    };
    channel.socket.send(JSON.stringify(msg));
}

function erase() {
    var m = confirm("Want to clear");
    if (m) {
        ctx.clearRect(0, 0, w, h);
        document.getElementById("canvasimg").style.display = "none";
    }
}

function save() {
    document.getElementById("canvasimg").style.border = "2px solid";
    var dataURL = canvas.toDataURL();
    document.getElementById("canvasimg").src = dataURL;
    document.getElementById("canvasimg").style.display = "inline";
}

function findxy(res, e) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
        currY = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = colorX;
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if(res == 'up' || res == 'out'){
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
            currY = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
            draw();
        }
    }
}

function findPos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

function shapeDraw(obj) {
    if(drawShape && !obj.classList.contains("shape-on")){
        document.getElementsByClassName("shape-on")[0].classList.remove("shape-on");
    }
    var shape = obj.id;
    if(!obj.classList.contains("shape-on")) {
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
        };

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
                element.style.border = pencilSize + 'px solid ' + colorX;
                element.style.left = mouse.x + 'px';
                element.style.top = mouse.y + 'px';
                document.getElementById("content").appendChild(element);
            }
        });
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
}

function pick() {
    var picker2 = document.getElementById("color-picker");
    if(picker2.className != "picker-on"){
        canvas.style.cursor = "crosshair";
        picker2.className = "picker-on";

        var context = canvas.getContext('2d');
        canvas.addEventListener("mousemove", mousePicker = function(e) {
            var pos = findPos(canvas, e);
            var x = pos.x;
            var y = pos.y;
            var coord = "x=" + x + ", y=" + y;
            var p = context.getImageData(x, y, 1, 1).data;
            if(p[0] == 0 && p[1] == 0 && p[2] == 0 && p[3] == 0){
                hex = "#ffffff";
            } else {
                var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
            }
            document.styleSheets[2].insertRule("input[type=range]::-webkit-slider-thumb { background: " + hex + "; }", document.styleSheets[2].cssRules.length);
        }, false);

        canvas.addEventListener("click", pickedColor = function (e) {
            var rect = canvas.getBoundingClientRect();
            var x = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
            var y = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
            var p = context.getImageData(x, y, 1, 1).data;
            if(p[0] == 0 && p[1] == 0 && p[2] == 0 && p[3] == 0){
                hex = "#ffffff";
            } else {
                var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
            }
            colorX = hex;
            canvas.removeEventListener("mousemove", mousePicker);
            canvas.style.cursor = "auto";
            picker2.className = "";
            canvas.removeEventListener("mousemove", mousePicker);

            canvas.addEventListener("mousemove", mousemove = function (e) {
                findxy('move', e)
            }, false);
            canvas.addEventListener("mousedown", mousedown = function (e) {
                flag = true;
                dot_flag = true;
                findxy('down', e)
            }, false);
            canvas.addEventListener("mouseup", mouseup = function (e) {
                flag = false;
                findxy('up', e)
            }, false);
            canvas.addEventListener("mouseout", mouseout = function (e) {
                flag = false;
                findxy('out', e)
            }, false);
            canvas.removeEventListener("click", pickedColor);
        }, false);

        canvas.removeEventListener("mousemove", mousemove, false);
        canvas.removeEventListener("mousedown", mousedown, false);
        canvas.removeEventListener("mouseup", mouseup, false);
        canvas.removeEventListener("mouseout", mouseout, false);
    } else {
        canvas.style.cursor = "auto";
        picker2.className = "";
        canvas.removeEventListener("mousemove", mousePicker);

        canvas.addEventListener("mousemove", mousemove = function (e) {
            findxy('move', e)
        }, false);
        canvas.addEventListener("mousedown", mousedown = function (e) {
            flag = true;
            dot_flag = true;
            findxy('down', e)
        }, false);
        canvas.addEventListener("mouseup", mouseup = function (e) {
            flag = false;
            findxy('up', e)
        }, false);
        canvas.addEventListener("mouseout", mouseout = function (e) {
            flag = false;
            findxy('out', e)
        }, false);
    }
}