function get_logged_users() {
    var xmlhttp = new XMLHttpRequest();
    var url = "/APix/get_logged_users";

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var logged_users_container = document.getElementById("logged-users");
            while (logged_users_container.hasChildNodes()) {
                logged_users_container.removeChild(logged_users_container.lastChild);
            }
            var logged_users_json = JSON.parse(this.response);
            logged_users_json = logged_users_json["results"];
            for (i in logged_users_json) {
                //alert(logged_users_json[i]["username"]);
                var a_user = document.createElement("a");
                a_user.innerText = logged_users_json[i]["username"];
                a_user.className += "sb-item sb-button";
                a_user.onclick = function () {
                    init_socket(this.innerText);
                };
                logged_users_container.appendChild(a_user);
            }
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

window.onload = function () {
    init_draw();
    var username = document.getElementById("username").innerText;
    init_socket(username);
};
