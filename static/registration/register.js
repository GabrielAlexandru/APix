window.onload = function () {
    document.getElementById("a-register").style.backgroundColor = "#1ab188";
    var inputs = document.querySelectorAll("input");
    for (var i = 0; i < inputs.length - 2; i++) {
        inputs[i].placeholder = inputs[i].name;
    }
    inputs[inputs.length - 2].placeholder = "password";
    inputs[inputs.length - 1].placeholder = "password confirm";
}