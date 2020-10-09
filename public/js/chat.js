// 声明会使用到的全局变量
var room_id = getUrlParams('id');
var role_id;
var role_name;

//获取url参数中的room_id
function getUrlParams(name) {
    var paramsAry = location.search.substr(1).split('&');
    for (var i = 0; i < paramsAry.length; i++) {
        var tmp = paramsAry[i].split('=');
        if (tmp[0] == name) {
            return tmp[1];
        }
    }
    return -1;
}

// 运行到这里便发送ajax请求，获取房间信息，同时判断是否可加入此房间
$.ajax({
    type: 'get',
    url: '/roomInfo?room_id=' + room_id,
    success: function (response) {
        if (response.status == 0) {
            alert('房间过期已销毁！');
            location.href = 'room.html';
        } else if (response.status == 1) {
            alert('房间人数已满！');
            location.href = 'room.html';
        } else {
            // 全局变量赋值
            role_id = response.role._id;
            role_name = response.role.role_name;
            // 将获取的数据与html定义的模板拼接
            var html = template('roomInfoTpl', response);
            // 将拼接好的html代码插入到目标节点下
            $('#room_info').html(html);
            // 开启房间倒计时，获取当前时间毫秒数
            let nowDate = +new Date();
            // 截止日期-当前日期 得到可存在的秒数
            let totalSeconds = parseInt((response.room.room_life - nowDate) / 1000);
            TimeDown(totalSeconds);
            // 获取消息
            getMsg();
            // 新角色获取昵称的随机动画
            if (response.status == 2) {
                let turn = 20; //循环次数
                let intervar = setInterval(function () {
                    $('.role_name').html(roleNames[Math.ceil(Math.random() *
                        325)]);
                    if (!turn--) {
                        clearInterval(intervar);
                        $('.role_name').html(response.role.role_name);
                        setTimeout(function () {
                            alert("你在本聊天室的昵称为" + response.role
                                .role_name + ",尽情畅聊吧！")
                        }, 200);
                    }
                }, 100);
            }
        }
    }
})

// 发送ajax请求获取房间已有的消息，并将滚动条置于最下方
function getMsg() {
    $.ajax({
        type: 'get',
        url: '/getMsg?room_id=' + room_id,
        success: function (response) {
            response.role_id = role_id;
            // console.log(response)
            $('#chat_msg').html(template('chatMsgTpl', response));
            $('.box_center').scrollTop($('#chat_msg').height());
        }
    })
}

// 创建 socket.io 实例，向服务器发送连接请求，默认连接到提供当前页面的主机
var socket = io();
// 发送事件并携带所在房间id
socket.emit('join', room_id);

// 发送输入框消息，并清空输入框，调整滚动条
$('.sendbtn').on("click", function () {
    let sendmsg = $('.txtmsg').val();
    if (sendmsg) { //判断是否有内容
        $('.txtmsg').val(''); //清空输入内容
        // 为什么要发送rolename，虽然插入数据库用不到，但是消息发送给其他用户时要显示的，而且插入数据时没有级联查询得不到
        var msg = {
            role_id: role_id,
            role_name: role_name,
            room_id: room_id,
            msg_context: sendmsg
        }
        socket.emit('sendMsg', msg);
        $('.box_center').scrollTop($('#chat_msg').height());
    }
})

// 监听服务器发送的事件，接受某用户发送的消息
socket.on('newMsg', (res, roleName) => {
    // console.log(res)
    let my_msg = '';
    // 如果是自己发送的，则使气泡右浮动
    if (res.role_id == role_id) {
        my_msg = 'my_msg';
    }
    // 接收新消息前，获取混动条位置。
    let before = $('#chat_msg').height();
    // 给消息列表追加新消息节点
    $('#chat_msg').append("<li class='" + my_msg + "'>" + roleName + "&nbsp" + res.msg_time +
        "<br><div class='msgbox'>" + res.msg_context + "</div></li>");
    //如果位置不在最下方，说明在看之前的消息，那么新消息来时，滚动条位置不变；否则，说明在等新消息，滚动条滚至最下方,模拟qq
    if ($('.box_center').scrollTop() + $('.box_center').outerHeight(true) == before) {
        $('.box_center').scrollTop(before);
    }
});



//倒计时函数
function TimeDown(totalSeconds) {
    if (totalSeconds < 1) {
        //房间截止日期已到，刷新界面，即可销毁房间
        location.reload();
        return false
    }
    var days = Math.floor(totalSeconds / (60 * 60 * 24));
    var modulo = totalSeconds % (60 * 60 * 24);
    var hours = Math.floor(modulo / (60 * 60));
    modulo = modulo % (60 * 60);
    var minutes = Math.floor(modulo / 60);
    var seconds = modulo % 60;
    $('.left_time').html(days + "天" + hours + "时" + minutes + "分" + seconds + "秒");
    setTimeout(function () {
        // 递归调用
        TimeDown(totalSeconds - 1)
    }, 1000);
}