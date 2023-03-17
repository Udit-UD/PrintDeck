
const image = document.getElementById("image");
const namee = document.getElementById("name");
const description = document.getElementById("description");

var i = 0;
var names = ["Udit", "Shrey", "Nisha", "Utkarsh", "Bhupinder"];
var images = ["../public/Images/boy1.png", "../public/Images/boy2.png", "../public/Images/girl.png", "../public/Images/boy3.png", "../public/Images/boy4.png", "../public/Images/boy5.png"]
var time = 5000;

function changeCont() {
    namee.innerText = names[i];
    image.src = images[i];
    // image.src = "../public/Images/Udit-img.png";
    if(i < names.length -1){
        i++;
    }
    else{
        i = 0;
    }
    setTimeout("changeCont()", time);
}
window.onload = changeCont;