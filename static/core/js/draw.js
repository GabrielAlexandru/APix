var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false,
    sizeRange,
    picker;

var rect;

var x = "black",
    y = 5;

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
        y = Math.floor(sizeRange.value/10);
    }, false);
    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);
}

function color(obj) {
    if(document.getElementsByClassName("selected")[0]){
        document.getElementsByClassName("selected")[0].className = "";
    }
    picker.addEventListener("input", function () {
        x = picker.value;
        document.styleSheets[2].insertRule("input[type=range]::-webkit-slider-thumb { background: " + x + "; }", document.styleSheets[2].cssRules.length);
    }, false);
    obj.className += "selected";
    switch (obj.id) {
        case "green":
            x = "green";
            break;
        case "blue":
            x = "blue";
            break;
        case "red":
            x = "red";
            break;
        case "yellow":
            x = "yellow";
            break;
        case "orange":
            x = "orange";
            break;
        case "black":
            x = "black";
            break;
        case "white":
            x = "white";
            break;
    }
    if (x == "white") y = 14;

}

function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();
    sendInstructions(prevX, prevY, currX, currY, x, y)
    console.log("finshed action");
}

function sendInstructions(prevX, prevY, currX, currY, x, y) {
    text = [prevX, prevY, currX, currY, x, y];
    var username = document.getElementById("username").innerText;
    var msg = {
        type: "command",
        text: text,
        room: username
    };
    socket.send(JSON.stringify(msg));
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
            ctx.fillStyle = x;
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
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

function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

function pick() {
    var picker2 = document.getElementById("color-picker");
    if(picker2.className != "picker-on"){
        canvas.style.cursor = "crosshair";
        picker2.className = "picker-on";
    } else {
        canvas.style.cursor = "auto";
        picker2.className = "";
    }
    var context = canvas.getContext('2d');
    canvas.addEventListener("mousemove", function(e) {
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        var coord = "x=" + x + ", y=" + y;
        // var c = this.getContext('2d');
        var p = context.getImageData(x, y, 1, 1).data;
        var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
        console.log(p);
    }, false);
}