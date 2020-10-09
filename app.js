// 必备的模块
const express = require('express');
const app = express();
const mongoose = require('mongoose');
// 路径拼接
const path = require('path');
// 配置静态资源路径,{index:"login.html"}第二个参数，代表主页，默认
app.use(express.static(path.join(__dirname, 'public')));
//post请求参数获取模块
const bodyParser = require('body-parser');
// 配置body-parser模块
app.use(bodyParser.urlencoded({
    extended: false
}));
// 日期格式化处理模块
const moment = require('moment');
// 设置时区
moment.locale('zh-cn');
// cookie
const cookieParser = require('cookie-parser');
app.use(cookieParser());
//表单对象解析
const formidable = require('formidable');
// socket模块，官方推荐这么使用，还需要注意一下下面的监听端口设置
const http = require('http').Server(app);
const io = require('socket.io')(http);
//引入昵称池文件
const {
    roleNames
} = require('./public/js/roleNames');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/chat', {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('数据库连接成功'))
    .catch(() => console.log('数据库连接失败'));
//引入集合句柄
const {
    Room,
    Role,
    Msg
} = require('./public/js/dbInit');
// 自动引入的包，猜测是调试用的
const {
    send
} = require('process');


// 中间件。作用是每次get房间和进入聊天室时，先要判断房间是否过期
// 意外尝试得知可以使用路由数组，极大减少代码冗余
app.use(['/myRoom', '/allRoom', '/roomInfo'], async (req, res, next) => {
    // 获取现在时间毫秒数
    let nowTime = +new Date();
    // find的第三个参数是回调函数，作用是先获取过期房间id数组，然后分别删除与此房间相关的角色、消息等
    // 查询条件：房间截止日期小于当前时间
    await Room.find({
        room_life: {
            $lt: nowTime
        }
    }, '_id', async function (err, person) {
        // map 将对象转换为数组，结合$in，$in是数据库一种查询规则——包含在其中
        let deleteId = person.map(item => item._id);
        await Room.deleteMany({
            _id: {
                $in: deleteId
            }
        });
        await Role.deleteMany({
            room_id: {
                $in: deleteId
            }
        });
        await Msg.deleteMany({
            room_id: {
                $in: deleteId
            }
        });
    });
    // 作为中间件必须要有的
    next();
});

// 获取已加入房间的信息
app.get('/myRoom/:page', async (req, res) => {
    // 获取请求携带的cookie，若不存在则创建新的，本项目不考虑cookie会过期
    if (req.cookies.userId) {
        var id = req.cookies.userId;
    } else {
        res.cookie('userId', mongoose.Types.ObjectId(), {
            maxAge: 6048000000
        });
    }
    // '+'将字符型转为Number类型，为统一返回的数据格式
    let page = +req.params.page;
    let num = 18;
    let totalPage = 0;
    let display;
    // 获取集合中的文档总数，count已被废弃，支持回调
    Role.countDocuments({
        user_id: id
    }, function (err, count) {
        // page总页数
        totalPage = Math.ceil(count / num)
        // 创建一个 1~n 的数组，作为分页的模板数据
        display = new Array(totalPage).toString().split(',').map(function (item, index) {
            return index + 1;
        });
    });
    // populate是根据规则定义的外键room_id级联查询角色相关的房间信息，过滤掉left和life
    // skip和limit实现分页查询，skip跳过前n条结果 limit限制显示n条结果
    let myRoom = await Role.find({
        user_id: id
    }).populate('room_id', '-room_left -room_life').skip((page - 1) * num).limit(num);
    res.send({
        myRoom,
        page,
        totalPage,
        display
    });
})

// 获取全部房间的信息
app.get('/allRoom/:page', async (req, res) => {
    let page = +req.params.page;
    let num = 18;
    let totalPage = 0;
    let display;
    Room.countDocuments({}, function (err, count) {
        totalPage = Math.ceil(count / num);
        display = new Array(totalPage).toString().split(',').map(function (item, index) {
            return index + 1;
        });
    });
    let allRoom = await Room.find().skip((page - 1) * num).limit(num);
    res.send({
        allRoom,
        page,
        totalPage,
        display
    })
})

// 创建新房间
app.post('/newRoom', async (req, res) => {
    // 创建表单解析对象
    const form = new formidable.IncomingForm();
    // 配置上传文件的存放位置
    form.uploadDir = path.join(__dirname, 'public', 'uploads');
    // 保留上传文件的后缀
    form.keepExtensions = true;
    // 解析表单，fields保存普通表单数据，files保存和上传文件相关的数据
    form.parse(req, async (err, fields, files) => {
        //如果用户没上传图片，则使用默认图片代替
        let default_path = '/img/room.jpg';
        if (files.room_picture.size != 0) {
            default_path = files.room_picture.path.split('public')[1];
        }
        // 获取房间截止时间的毫秒数
        let room_life = +new Date() + fields.room_life * 60 * 1000;
        // 添加一条数据
        let newroom = await Room.create({
            _id: mongoose.Types.ObjectId(),
            room_name: fields.room_name,
            room_detail: fields.room_detail,
            room_picture: default_path,
            room_left: fields.room_left,
            room_life: room_life
        })
        res.send(newroom);
    });
})

// 获取进入的房间信息
app.get('/roomInfo', async (req, res) => {
    var id = req.cookies.userId;
    //查询是否存在角色，此处如果用find 会返回空数组，并不是null
    let role = await Role.findOne({
        user_id: id,
        room_id: req.query.room_id
    });
    // 查询房间是否存在
    let room = await Room.findOne({
        _id: req.query.room_id
    });
    // if房间不存在；else if是新用户；else是老用户
    if (!room) {
        //状态0，表示房间已销毁不存在
        res.send({
            status: 0,
        });
    } else if (!role) {
        // 房间可加入人数是否达上限
        if (room.room_left <= 0) {
            res.send({
                room,
                status: 1
            });
        } else {
            // do…while…获取不重复昵称
            do {
                var roleName = roleNames[Math.ceil(Math.random() * 325)];
            }
            while (await Role.findOne({
                    role_name: roleName,
                    room_id: req.query.room_id
                }));

            let newrole = await Role.create({
                _id: mongoose.Types.ObjectId(),
                role_name: roleName,
                user_id: id,
                room_id: req.query.room_id
            })
            // 返回新角色，修改剩余人数-1
            await Room.updateOne({
                _id: req.query.room_id
            }, {
                room_left: room.room_left - 1
            })
            res.send({
                room,
                role: newrole,
                status: 2
            });
        }
    } else {
        res.send({
            room,
            role,
            status: 3
        });
    }
})

// 获取房间所有消息
app.get('/getMsg', async (req, res) => {
    let msg = await Msg.find({
        room_id: req.query.room_id
    }, '-room_id').populate('role_id', 'role_name');
    // 可以自己定义接口文档的变量
    res.send({
        data: msg
    });
})

// socket模块，当用户打开聊天窗口时触发，将客户端socket实例作为参数传入，socket参数用来识别是哪台主机的哪个应用，即ip+端口号
io.on('connection', function (socket) {
    console.log(socket)
    // console.log('a user connected');
    let roomId;
    //监听客户端join请求，目的是把当前用户划分到所属房间，使每个房间聊天互不影响
    socket.on('join', roomid => {
        roomId = roomid;
        socket.join(roomId); // 加入房间  
    })
    // 监听客户端发送消息的事件，并得到发送的消息相关数据
    socket.on('sendMsg', async (req) => {
        // 在数据库插入一条消息文档，返回插入的数据给res
        let res = await Msg.create({
            _id: mongoose.Types.ObjectId(),
            role_id: req.role_id,
            room_id: req.room_id,
            msg_context: req.msg_context,
            msg_time: moment().format('YYYY-MM-DD HH:mm:ss')
        })
        //搞不懂为什么给res对象添加字段不生效呢？
        // res.role_name=req.role_name;

        // 将新消息发送给所有在此房间的用户，也包括自己
        io.sockets.in(roomId).emit('newMsg', res, req.role_name);
    });
});


http.listen(3000, () => console.log('服务器启动成功'));