const passport = require("passport");

const { User } = require("../models");
const validations = require("../validations");

const index = (request,response) => {
    response.render("index.html", {user: request.user});
}

const about = (request,response) => {
    response.render("about.html", {user: request.user});
}

const login = (request,response) => {
    response.render("login.html",{
        success: request.flash("success")[0],
        messages: request.flash("messages"),
        error: request.flash("error")[0],
        user: request.user
    });
}

const register = (request,response) => {
    response.render("register.html",{
        success: request.flash("success")[0],
        messages: request.flash("messages"),
        error: null,
        user: request.user
    });
}

const add_user = async (request,reponse) => {
    const { username, email, password, confirm_password } = request.body;
    const validation_user = await validations.validate_User(username,email,password,confirm_password);
    if(validation_user.length==0){
        const newUser = new User({ username, email, password });
        newUser.password = await newUser.encryptPassword(password);
        await newUser.save();
        request.flash("messages",["Usuario registrado exitosamente"]);
        request.flash("success",[true]);
        reponse.redirect("/ingreso");
    }else{
        request.flash("messages",validation_user);
        request.flash("success",[false]);
        reponse.redirect("/registro");
    }
}

const entry_user = passport.authenticate("local",{
    successRedirect: "/tareas",
    failureRedirect: "/ingreso",
    failureFlash: true
});

const logout = (request, response) => {
    request.logout();
    response.redirect("/");
}

module.exports = { 
    index,
    about,
    login,
    register,
    add_user,
    entry_user,
    logout
}