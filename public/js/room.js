// 网页返回上一页时自动刷新页面
window.addEventListener('pageshow', function (event) {
    if (event.persisted || window.performance &&
        window.performance.navigation.type == 2) {
        location.reload();
    }
}, false);

// 向服务器端发送请求 获取房间信息
function getMyRoom(page = 1) {
    $.ajax({
        type: 'get',
        url: '/myRoom/' + page,
        success: function (response) {
            console.log(response)
            var myRoomHTML=template('myRoomTpl', response);
            $('#myRoom').html(myRoomHTML);
            // 页码模板渲染
            $('#pageBox1').html(template('pageTpl1', response));
        }
    })
}

// 如果不传入参数，page默认值为1，es6功能
function getAllRoom(page = 1) {
    $.ajax({
        type: 'get',
        url: '/allRoom/'+ page,
        success: function (response) {
            // console.log(response)
            $('#allRoom').html(template('allRoomTpl', response));
            $('#pageBox2').html(template('pageTpl2', response));
        }
    })
}

getMyRoom();

// tab栏切换
$(".tab_list li").click(function () {
    $(this).addClass("current").siblings().removeClass("current");
    let index = $(this).index();
    $(".tab_item").eq(index).show().siblings().hide();
    if (index == 0) {
        getMyRoom();
    }
    if (index == 1) {
        getAllRoom();
    }
})

// 创建新房间
$('#submit').on('click', function () {
    //对于formdata，必须使用原生dom获取方式
    var fd = new FormData(document.getElementById('new_room'));
    //此处记录一个坑，出错原因同上，jQuery获取的dom对象是数组，不是节点，所以额外加个[0]
    // var fd= new FormData();
    // fd.append('room_picture', $("#room_picture")[0].files[0]);
    $.ajax({
        type: 'post',
        url: '/newRoom',
        data: fd,
        //此处还有一坑，formdata包含文件就属于复杂对象了，不设置contenttype会自动以url拼接方式传递，会报错
        contentType: false,
        //取消帮我们格式化数据，是什么就是什么
        processData: false,
        success: function (response) {
            // console.log(response)
            // 创建完成后自动跳转
            location.href = 'chat.html?id=' + response._id;
        }
    })
})

// 当用户选择完文件以后,回显在客户端
$('#room_picture').on('change', function () {
    // 1 创建文件读取对象
    var reader = new FileReader();
    // 2 读取文件
    reader.readAsDataURL(this.files[0]);
    // 3 监听onload事件
    reader.onload = function () {
        // 修改节点的属性和样式
        $('#preview').prop('src', reader.result);
        $('#preview').css('display', 'block');
    }

});