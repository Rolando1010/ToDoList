const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const passport = require("passport");
const methodOverride = require("method-override");

require("./authenticate");

app.set("port",process.env.PORT || 3000);
app.set("views",path.join(__dirname,"/views/pages"));

app.engine("html",require("ejs").renderFile);

app.use(express.static(path.join(__dirname,"/static")));
app.use(express.urlencoded());
app.use(methodOverride("_method"));
app.use(session({
    secret: "mysecretapp",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(require("./routes"));

app.use((request,response,next)=>{
    response.locals.success = request.flash("success");
    response.locals.messages = request.flash("messages");
    response.locals.error = request.flash("error");
    response.locals.user = request.user || null;
    next();
});

app.listen(app.get("port"),()=>{
    console.log(`Server initialized in port ${app.get("port")}.............`);
});