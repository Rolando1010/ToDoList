const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { User } = require("./models");

passport.use(new LocalStrategy({
    usernameField: "email"
}, async (email, password, done) => {
    const user = await User.findOne({email:email});
    if(!user){
        return done(null, false,{message: "Usuario no encontrado"});
    }else{
        const match = await user.matchPassword(password);
        if(match){
            return done(null, user);
        }else{
            return done(null,false,{message: "Contraseña incorrecta"});
        }
    }
}));

passport.serializeUser((user,done) => {
    done(null,user.id);
});

passport.deserializeUser((id,done)=>{
    User.findById(id,(error,user)=>{
        done(error,user);
    });
});

const helpers = {};
helpers.isAuthenticated = (request,response,next) => {
    if(request.isAuthenticated()){
        return next();
    }
    request.flash("error","No hay autorización");
    response.redirect("/ingreso");
}

module.exports = helpers;