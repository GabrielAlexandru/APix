window.onload = function () {
    document.getElementById("a-register").style.backgroundColor = "#1ab188";
    var inputs = document.querySelectorAll("input");
    for (var i = 0; i < inputs.length; i++) {
        if (i < inputs.length - 2)
            inputs[i].placeholder = inputs[i].name;
        inputs[i].onfocus = function () {
            this.nextElementSibling.style.display = "block";
        };
        inputs[i].onblur = function () {
            this.nextElementSibling.style.display = "none";
        };
    }
    inputs[inputs.length - 2].parentNode.nextElementSibling.style.display = "none";
    inputs[inputs.length - 2].onfocus = function () {
        this.parentNode.nextElementSibling.style.display = "block";
    };
    inputs[inputs.length - 2].onblur = function () {
        this.parentNode.nextElementSibling.style.display = "none";
    };

    inputs[inputs.length - 2].placeholder = "password";
    inputs[inputs.length - 1].placeholder = "password confirm";

    document.getElementById("id_email").nextElementSibling.innerText = "Required. Please enter a valid email address.";

    document.getElementById("id_username").blur();
    document.getElementById("id_username").focus();
    document.getElementById("a-register").classList.add("disabled");
};