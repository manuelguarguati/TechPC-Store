function loguear(){

    let user=document.getElementById("usuario").value;
    let pass=document.getElementById("clave").value;
  

    if(user=="manuel" && pass=="1234"){
         
   window.location="/home";
    }else{

        alert("usuario o contraseña son incorrectos");
    }
}