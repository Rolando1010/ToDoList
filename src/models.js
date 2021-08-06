const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

require("dotenv").config({path: "variables.env"});

mongoose.connect(process.env.DB_URL,{
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false
}).then(db => console.log("DB is connected")).catch(error => console.log(error));

const UserSchema = new Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
});

UserSchema.methods.encryptPassword = async (password) =>{
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(password,salt);
    return hash;
};

UserSchema.methods.matchPassword = async function (password){
    return await bcrypt.compare(password,this.password)
};

const User = mongoose.model("User",UserSchema);

const GroupSchema = new Schema({
    name: {type: String, required: true},
    id_creator: Schema.Types.ObjectId,
    creation_date: {type: Date, default: Date.now},
    members: {type: Array, required: true}
});

const Group = mongoose.model("Group",GroupSchema);

const TaskSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    creation_date: {type: Date, default: Date.now},
    id_creator: Schema.Types.ObjectId,
    id_group: Schema.Types.ObjectId,
    done: {type: Boolean, default: false}
});

const Task = mongoose.model("Task",TaskSchema);

module.exports = {
    User,
    Group,
    Task
}