
if(main.CheckLoginUser() != null){
    location.assign("index.html");
}

$("#btnLogin").click(function() {
    var username = $("#txtUsername").val();
    var password = $("#txtPassword").val();

    if(username === "" || password === "") {
        swal.fire({
            icon: 'error',
            title: 'Incomplete Form',
            text: 'Please enter both username and password.'
        });
    } else {
        main.LoginUser(username, password, function(success) {
            if(success) {
                $("#btnSpinner").show();
                location.assign("index.html");
            } else {
                swal.fire({
                    icon: 'error',
                    title: 'Invalid Credentials',
                    text: 'The username or password you entered is incorrect.'
                });
            }
        });
    }

    
});