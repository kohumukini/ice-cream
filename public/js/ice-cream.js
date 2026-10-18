document.getElementById("ice-cream-form").onsubmit = () => {
    let valid = true; 

    clearErrors(); 

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim(); 
    let flavor = document.getElementById("flavors").value.trim(); 

    let coneSelected = false; 
    
    if (name === "") {
        document.getElementById("name-err").style.display = "block"; 
        valid = false; 
    }

    if (email === "") {
        document.getElementById("email-err").style.display = "block"; 
        valid = false; 
    }

    if (flavor == "none") {
        document.getElementById("flavor-err").style.display = "block"; 
        valid = false; 
    }

    let cone = document.getElementsByName("cone");

    for (let i = 0; i < cone.length; i++) {
        if (cone[i].checked) {
            coneSelected = true; 
            break; 
        }
    }

    if (!coneSelected) {
        document.getElementById("cone-err").style.display = "block"; 
        valid = false; 
    }

    return valid;
}

const clearErrors = () => {
    let errors = document.getElementsByClassName("err"); 

    for (let i = 0; i < errors.length; i++) {
        errors[i].style.display = "none"; 
    }
}