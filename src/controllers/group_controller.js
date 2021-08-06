const { User, Group, Task } = require("../models");
const validations = require("../validations");

const groups = async (request,response) => {
    const groups = await Group.find({members:{$in:[request.user._id]}});
    const users = await User.find();
    const groups_user = groups.map((group)=>{
        const name_creator = users.filter(user=>String(user._id)==String(group.id_creator))[0].username;
        const new_group = {
            name: group.name,
            cant_members: group.members.length,
            creation_date: group.creation_date.toLocaleDateString("en-GB"),
            code: group._id,
            name_creator: name_creator
        }
        return new_group;
    });
    response.render("groups.html",{
        groups: groups_user,
        success: request.flash("success")[0],
        messages: request.flash("messages"),
        error: null,
        user: request.user
    });
}

const add_group = async (request, response) => {
    const { group_name } = request.body;
    const validation_group = validations.validate_Group(group_name);
    if(validation_group.length==0){
        const newGroup = new Group({
            name: group_name,
            id_creator: request.user._id,
            members: [request.user._id]
        });
        await newGroup.save();
        request.flash("messages",["Grupo creado exitosamente"]);
        request.flash("success",[true]);
    }else{
        request.flash("messages",validations.validation_group);
        request.flash("success",[false]);
    }
    response.redirect("/grupos");
}

const group = async (request, response) => {
    const id_group = request.params.id_group;
    var group;
    try {
        group = (await Group.find({_id:id_group}))[0];
    } catch (error) {
        group = null;
    }
    const groups = await Group.find({members:{$in:[request.user._id]}});
    if(!(group && groups.filter(g=>String(g._id)===String(group._id)).length!=0)){
        request.flash("success",[false]);
        request.flash("messages",["No perteneces al grupo"]);
        response.redirect("/grupos");
    }else{
        const creator = (await User.find({_id:group.id_creator}))[0];
        const users = await User.find();
        const info_members = users.map(user=>{
            if(group.members.filter(id_member=>String(id_member)===String(user._id)).length!=0){
                const info_member = {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
                return info_member;
            }
        }).filter(member=>member);
        const info_group = {
            code: group._id,
            name: group.name,
            creation_date: group.creation_date,
            id_creator: group.id_creator,
            name_creator: creator.username,
            email_creator: creator.email,
            cant_members: group.members.length,
            members: info_members
        };
        const tasks_group = (await Task.find({id_group:id_group})).map(task=>{
            const creator_task = users.filter(user=>String(user._id)===String(task.id_creator))[0];
            const new_task = {
                id: task._id,
                name: task.name,
                done: task.done,
                creation_date: task.creation_date.toLocaleDateString("en-GB"),
                name_creator: creator_task.username,
                email_creator: creator_task.email
            }
            return new_task;
        });
        response.render("group.html",{
            group: info_group,
            tasks_group: tasks_group,
            show_members: request.flash("show_members")[0],
            show_tasks: request.flash("show_tasks")[0],
            success: request.flash("success")[0],
            messages: request.flash("messages"),
            user: request.user,
            error: null
        });
    }
}

const edit_name_group = async (request,response) => {
    const { group_name } = request.body;
    const { id_group } = request.params;z
    await Group.findByIdAndUpdate(id_group,{name:group_name});
    request.flash("success",[true]);
    request.flash("messages",["Nombre de grupo modificado exitosamente"]);
    response.redirect(`/grupos/${id_group}`);
}

const join_group = async (request, response) => {
    const { code_group } = request.body;
    const group = (await Group.find()).filter(group=>String(group._id)===String(code_group));
    if(group.length!=0){
        const new_members = group[0].members;
        if(new_members.filter(member=>String(member._id)===String(request.user._id)).length==0){
            new_members.push(request.user._id);
            await Group.findByIdAndUpdate(code_group,{members:new_members});
            request.flash("success",[true]);
            request.flash("messages",["Te has unido al grupo exitosamente"]);
        }else{
            request.flash("success",[false]);
            request.flash("messages",["Ya pertences a este grupo"]);
        }
    }else{
        request.flash("success",[false]);
        request.flash("messages",["El grupo con el código indicado no fue encontrado"]);
    }
    response.redirect("/grupos");
}

const delete_group = async (request, response) => {
    await Group.findByIdAndDelete(request.params.id_group);
    request.flash("success",[true]);
    request.flash("messages",["El grupo fue borrado exitosamente"]);
    response.redirect("/grupos");
}

const exit_group = async (request, response) => {
    const { id_group } = request.params;
    const new_members = (await Group.find({_id:id_group}))[0].members.filter(member=>String(member._id)!==String(request.user._id));
    await Group.findByIdAndUpdate(id_group,{members:new_members});
    request.flash("success",[true]);
    request.flash("messages",["Has salido del grupo exitosamente"]);
    response.redirect("/grupos");
}

const add_member_group = async (request, response) => {
    const { id_group } = request.params;
    const { email_user } = request.body;
    const user = await User.findOne({email:email_user});
    if(user){
        const id_user = user._id;
        const members_group = (await Group.findOne({_id:id_group})).members;
        const members_id_user = members_group.filter(member=>String(member)===String(id_user));
        if(members_id_user.length===0){
            members_group.push(id_user);
            await Group.findByIdAndUpdate(id_group,{members:members_group});
            request.flash("success",[true]);
            request.flash("messages",["El usuario fue agregado exitosamente"]);
        }else{
            request.flash("success",[false]);
            request.flash("messages",["Este usuario ya es miembro del grupo"]);
        }
    }else{
        request.flash("success",[false]);
        request.flash("messages",["Ningún usuario cuenta con el correo especificado"]);
    }
    request.flash("show_members",[true]);
    response.redirect(`/grupos/${id_group}`);
}

const delete_member_group = async (request, response) => {
    const { id_group, id_user} = request.params;
    const group = await Group.find({_id:id_group});
    const new_members_group = group[0].members.filter(member=>String(member)!==String(id_user));
    await Group.findByIdAndUpdate(id_group,{members:new_members_group});
    request.flash("success",[true]);
    request.flash("messages",["El miembro fue eliminado del grupo exitosamente"]);
    request.flash("show_members",[true]);
    response.redirect(`/grupos/${id_group}`);
}

module.exports = {
    groups,
    add_group,
    group,
    edit_name_group,
    join_group,
    delete_group,
    exit_group,
    add_member_group,
    delete_member_group
}