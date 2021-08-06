const { User } = require("./models");

const validate_User = async (username,email,password,confirm_password) => {
    const alerts = []
    if(username.length==0){
        alerts.push("No dejes el nombre de usuario vacío");
    }
    if(email.length==0){
        alerts.push("No dejes el email vacío");
    }
    if(password.length==0){
        alerts.push("No dejes la contraseña vacía");
    }
    if(password!=confirm_password){
        alerts.push("Las contraseñas no coinciden");
    }
    if(await User.findOne({email:email})){
        alerts.push("Ya hay un usuario registrado con este correo, ingresa otro");
    }
    return alerts;
}

const validate_Group = (group_name) => {
    const alerts = [];
    if(group_name.length==0){
        alerts.push("Por favor no dejes el campo de nombre de grupo vacío");
    }
    return alerts;
}

module.exports = {
    validate_User,
    validate_Group
}