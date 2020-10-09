const mongoose = require('mongoose');

//创建的集合名在mongoDB可视化软件中默认以小写开头，s结尾
const RoomSchema = new mongoose.Schema({
    _id: String,
    room_name: {
        type: String,
        required: true,
        maxlength: 12
    },
    room_detail: {
        type: String,
        trim: true
    },
    room_picture: {
        type: String
    },
    room_left: {
        type: Number,
        default: 12
    },
    room_life: {
        type: Number
    }
}, {
    versionKey: false
})
const Room = mongoose.model('Room', RoomSchema);


const RoleSchema = new mongoose.Schema({
    _id: String,
    role_name: String,
    user_id: String,
    room_id: {
        type: String,
        ref: 'Room'
    }
}, {
    versionKey: false
})
const Role = mongoose.model('Role', RoleSchema);


const MsgSchema = new mongoose.Schema({
    _id: String,
    role_id: {
        type: String,
        ref: 'Role'
    },
    room_id: String,
    msg_context: {
        type: String,
        trim: true
    },
    msg_time: {
        type: String
    }
}, {
    versionKey: false
})
const Msg = mongoose.model('Msg', MsgSchema);

module.exports = {
    Room,
    Role,
    Msg
};

// 测试数据

// const room_life = +new Date() + 604800000;
// const default_path = '/img/room.jpg';
// Room.create({
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试1号房',
//     room_detail: '测试1号房，欢迎你',
//     room_picture: default_path,
//     room_left: 6,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试2号房',
//     room_detail: '测试2号房，欢迎你',
//     room_picture: default_path,
//     room_left: 6,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试3号房',
//     room_detail: '测试3号房，欢迎你',
//     room_picture: default_path,
//     room_left: 6,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试4号房',
//     room_detail: '测试4号房，欢迎你',
//     room_picture: default_path,
//     room_left: 6,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试5号房',
//     room_detail: '测试5号房，欢迎你',
//     room_picture: default_path,
//     room_left: 6,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试6号房',
//     room_detail: '测试6号房，欢迎你',
//     room_picture: default_path,
//     room_left: 6,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试7号房',
//     room_detail: '测试7号房，欢迎你',
//     room_picture: default_path,
//     room_left: 6,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试8号房',
//     room_detail: '测试8号房，欢迎你',
//     room_picture: default_path,
//     room_left: 6,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试9号房',
//     room_detail: '测试9号房，欢迎你',
//     room_picture: default_path,
//     room_left: 6,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试10号房',
//     room_detail: '测试10号房，欢迎你',
//     room_picture: default_path,
//     room_left: 6,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试11号房',
//     room_detail: '测试11号房，欢迎你',
//     room_picture: default_path,
//     room_left: 6,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试12号房',
//     room_detail: '测试12号房，欢迎你',
//     room_picture: default_path,
//     room_left: 6,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试13号房',
//     room_detail: '测试13号房，欢迎你',
//     room_picture: default_path,
//     room_left: 0,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试14号房',
//     room_detail: '测试14号房，欢迎你',
//     room_picture: default_path,
//     room_left: 0,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试15号房',
//     room_detail: '测试15号房，欢迎你',
//     room_picture: default_path,
//     room_left: 1,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试16号房',
//     room_detail: '测试16号房，欢迎你',
//     room_picture: default_path,
//     room_left: 1,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试17号房',
//     room_detail: '测试17号房，欢迎你',
//     room_picture: default_path,
//     room_left: 6,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试18号房',
//     room_detail: '测试18号房，欢迎你',
//     room_picture: default_path,
//     room_left: 6,
//     room_life: room_life
// },{
//     _id: mongoose.Types.ObjectId(),
//     room_name: '测试19号房',
//     room_detail: '测试19号房，欢迎你',
//     room_picture: default_path,
//     room_left: 6,
//     room_life: room_life
// })