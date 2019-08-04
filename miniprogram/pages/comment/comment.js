// pages/comment/comment.js
// 6.1初始化数据库 env 环境id
const db=wx.cloud.database({
  env:"mywx-426g1"
})
Page({
  /**
   * 页面的初始数据
   */
  data: {
    value: "",//输入框中用户输入内容
    score:"5",//评分的值
    movieid:0, //保存电影id
    detail:{},  //保存电影信息
    images:[],   //保存选中的图片  
    fileIDS:[]   //上传成功保存fileID
  },
  mysubmit: function () {
  // 功能：将选中的图片上传到云存储中
  // 功能:将云存储中的fileID一次性储存云数据库集中
  // 1：在data添加属性fileIDS:[]
  // 2：显示加载动画提示框"正在提交中"
  wx.showLoading({
    title: '正在提交中...',
  })
  // 3：上传到云存储
  //  3.1 创建promise数组[保存promise对象]
  var promiseArr=[];
  //  3.2 创建一个循环遍历选中的图片
  for(var i=0;i<this.data.images.length;i++){
  //  3.3 创建promise对象
  // promise负责完成上传一张图片任务
  // 并且将图片fileID保存数组中
  promiseArr.push(new Promise((reslove,reject)=>{
    // 3.3.1 获取当前图片
    var item=this.data.images[i];
    // 3.3.2 创建正则表达式拆分文件后缀名 .jpg .png .gif
    var suffix=/\.\w+$/.exec(item)[0];
    console.log(suffix)  
    // 3.3.3 上传图片并且将fileID保存数组
    // 新文件名=事件+随机数+后缀
    var newFile=new Date().getTime()+Math.floor(Math.random()*9999)+suffix;
    wx.cloud.uploadFile({
       cloudPath:newFile,  //新文件名
       filePath:item,      //选中文件
       success:res=>{      //上传成功
      //  console.log(res)
      //  3.3.5上传成功拼接fileID
       var fid=res.fileID;
       var ids=this.data.fileIDS.concat(fid);
       this.setData({
         fileIDS:ids
       })
       // 3.3.6 将当前promise任务追加任务列表中
       reslove();
       },//success end
      // 3.3.7 上传失败输出错误消息
       fail:err=>{console.log(err)}
    })
   
  })) //promise end
  }//for end
  //功能2:将云存储中fileID一次性存储云数据库中
  // 4.在云数据库中添加集合  comment
    // 此集合用于保存评论内容与文件id
    // 5.等带数据中的所有Promise任务执行结束
    Promise.all(promiseArr).then(res=>{
      // 6.回调函数中
      // 6.1在程序最顶端初始化数据库
      // 7.将评论内容 分数 电影id 上传图片所有id 添加集合中
      db.collection("comment").add({
          data:{
            content:this.data.value,//评论内容
            score:this.data.score, //评论分数
            movieid:this.data.movieid,//电影id
            fileIds:this.data.fileIDS//图片fileID
          }
      }).then(res=>{
        // 8.隐藏加载提示框
        wx.hideLoading();
        // 9.显示提示框 '发表成功'
        wx.showToast({
          title: '发表成功',
        })

        }).catch(err => {// 10 添加集合失败
      // 11.隐藏加载提示框
      // 12 显示提示框 '评论失败'
        wx.hideLoading();
        wx.showToast({
          title: '发表失败'
        })
      })
    })
  },
  selectImage:function(){
    // 功能：请用户选中9张图片并且保存data中
    wx.chooseImage({
      count:9,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
      success:(res)=>{
      
        var files = res.tempFilePaths;    
       // 2.调用wx.chooseImage选中图片
       // 3.将选中的9张图片保存到images中
        this.setData({ images: files });
      }
    })
  },
  // 组件创建成功调用
  loadMore:function(){
    // 功能：发送请求获取云函数返回数据
    // 1:接收电影列表传递参数id
    var id=this.data.movieid;
    // 2.显示数据加载提示框
    wx.showLoading({
      title: '加载中...',
    })
    // 3.调用云函数
    wx.cloud.callFunction({
      name:"getDetail3",  //云函数名字
      data:{id:id}
    })
    .then(res=>{
      // console.log(res);
      // 4: 获取云函数返回结果 
      // 4.1 将云函数返回字符串转为JS对象
      var obj = JSON.parse(res.result);
      // 4.2 保js对象保存detail
      this.setData({detail:obj});
      // 4.3 隐藏加载提示框
      wx.hideLoading();
    })
    .catch(err=>{console.log(err)})
  },
  // 输入框对应事件
  onContentChange(e) {
    // event.detail 用户输入内容
    console.log(e.detail);
    this.setData({
      value:e.detail
    })
  },
  // 用户打分对应事件
  onScoreChange(e) {
    // 获取用户现在输入分数
    // 将用户输入新分数赋值操作
    this.setData({
      score: e.detail
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options.id)
    // 将电影列表组件传递参数  id 保存data中movieid
    this.setData({
      movieid:options.id
    });
    this.loadMore();

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})