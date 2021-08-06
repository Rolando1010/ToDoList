const { User, Group, Task } = require("../models");

const tasks = async (request, response) => {
    const id_user = request.user._id;
    const groups_user = await Group.find({members:{$in:[id_user]}});
    const tasks = await Task.find();
    const tasks_user = tasks.map(task => {
        const task_user = {
            id: task._id,
            name: task.name,
            description: task.description,
            creation_date: task.creation_date.toLocaleDateString("en-GB"),
            done: task.done,
            group_name: ""
        }  
        const group_owner = groups_user.filter(group=>String(group._id)===String(task.id_group))[0];      
        if(group_owner){
            task_user.group_name =  `${group_owner.name} - ${group_owner._id}`;
            return task_user;
        }
        else if(String(task.id_creator)===String(id_user)){
            return task_user;
        }
    }).filter(task=>task);
    response.render("tasks.html",{
        user: request.user,
        success: request.flash("success")[0],
        messages: request.flash("messages"),
        error: request.error,
        tasks_user: tasks_user
    });
}

const add_personal_task = async (request, response) => {
    const { name, description } = request.body;
    const new_task = new Task({
        name: name,
        description: description,
        id_creator: request.user._id,
        id_group: null
    });
    await new_task.save();
    request.flash("success",[true]);
    request.flash("messages",["La tarea ha sido creada correctamente"]);
    response.redirect("/tareas");
}

const edit_task = async (request, response) => {
    const { id_task } = request.params;
    const { name, description } = request.body;
    await Task.findByIdAndUpdate(id_task,{name:name, description: description});
    request.flash("success",[true]);
    request.flash("messages",["La tarea fue modificada exitosamente"]);
    response.redirect(`/tareas/${id_task}`);
}

const delete_task = async (request, response) => {
    await Task.findByIdAndDelete(request.params.id_task);
    request.flash("success",[true]);
    request.flash("messages",["La tarea fue eliminada exitosamente"]);
    const group = request.body.group;
    if(group){
        request.flash("show_tasks",[true]);
        response.redirect(`/grupos/${group}`);
    }else{
        response.redirect(`/tareas`);
    }
}

const finish_task = async (request, response) =>{
    const { id_task } = request.params;
    const task = await Task.find({_id:id_task});
    if(task[0].done){
        request.flash("success",[false]);
        request.flash("messages",["La tarea ya había sido finalizada"]);
    }else{
        await Task.findByIdAndUpdate(id_task,{done: true});
        request.flash("success",[true]);
        request.flash("messages",["La tarea ha sido finalizada"]);
    }
    response.redirect(`/tareas/${id_task}`);
}

const task = async (request, response) => {
    const task = await Task.findOne({_id:request.params.id_task});
    const creator = await User.findOne({_id:task.id_creator});
    var group;
    if(task.id_group){
        const info_group = await Group.findOne({_id:task.id_group});
        group = `${info_group.name} - ${info_group._id}`;
    }
    const info_task = {
        id: task._id,
        name: task.name,
        description: task.description,
        creation_date: task.creation_date,
        creator: `${creator.username} - ${creator.email}`,
        done: task.done,
        id_group: task.id_group,
        group: group
    }
    response.render("task.html",{
        task: info_task,
        success: request.flash("success")[0],
        messages: request.flash("messages"),
        user: request.user,
        error: request.error
    });
}

const add_group_task = async (request, response) => {
    const { id_group } = request.params;
    const { name, description } = request.body;
    const new_task = new Task({
        name: name,
        description: description,
        id_creator: request.user._id,
        id_group: id_group
    });
    await new_task.save();
    request.flash("success",[true]);
    request.flash("messages",["La tarea ha sido creada correctamente"]);
    request.flash("show_tasks",[true]);
    response.redirect(`/grupos/${id_group}`);
}

module.exports = {
    tasks,
    add_personal_task,
    edit_task,
    delete_task,
    finish_task,
    task,
    add_group_task
}