window.onload = function () {
    document.getElementById("a-login").style.backgroundColor = "#1ab188";
    var inputs = document.querySelectorAll("input");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].placeholder = inputs[i].name;
        inputs[i].onfocus = function () {
            this.nextElementSibling.style.display = "block";
        };
        inputs[i].onblur = function () {
            this.nextElementSibling.style.display = "none";
        };
    }

    document.getElementsByTagName("input")[0].blur()
};