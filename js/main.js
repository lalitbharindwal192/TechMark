if(sessionStorage.getItem("emailid")==null){
    document.getElementById("auth-btn").innerHTML = '<a href="auth-signin.html"><button class="auth_btn"><img src="assets-main/images/login.png" alt="" height="30">  Login</button></a>';
}else{
    document.getElementById("auth-btn").innerHTML = '<a href="auth-signin.html"><button onclick="logout()" class="auth_btn"><img src="assets-main/images/login.png" alt="" height="30">  Logout</button></a>';
}

function logout(){
    sessionStorage.clear();
    localStorage.clear();
}