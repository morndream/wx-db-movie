// pages/mymovie/mymovie.js
// 初始化数据库并且指定环境id
const db=wx.cloud.database({
  env:"mywx-426g1"
})
Page({
  /**
   * 页面的初始数据
   */
  data: {
    content:"", 
    file:{},
  },
  onContentChange:function(e){
    // 功能：获取用户输入留言内容
    this.setData({
      content:e.detail
    })
  },
  myupload:function(){
    // 功能：选择一张图片
    wx.chooseImage({
      count:1,
      sizeType:["original","compressed"],
      sourceType:["album","camera"],
      success: (res) =>{
        console.log(res)
        var file=res.tempFilePaths[0];
        this.setData({
         file:file
       })
      }
    })

  },
  mysubmit:function(){
    // 功能：上传图片并且将图片保存云数据
    // 1.获取上传图片
    var f=this.data.file;
    // 2.截取文件后缀名称
    var suffix=/\.\w+$/.exec(f)[0];
    // 3.创建新文件名称
    var newFile=new Date().getTime()+suffix;
    var c=this.data.content;
    // 4.获取用户评论内容
    // 5.上传文件操作
    wx.cloud.uploadFile({
      cloudPath:newFile,
      filePath: f,
      success: (res) => { //上传成功
        // 5.2 在程序开始声明数据库
        console.log(res)
        var fId=res.fileID;
        db.collection("mymovie").add({
           data:{
             fileId: fId,
             content:c
           }
        }).then(res=>{
          wx.showToast({
            title: '发表成功',
          })
        }).catch(err=>{
          wx.showToast({
            title: '发表失败',
          })
        })
    },
    fail:err=>{  //上传失败
        console.log(err)
    }
  }) 
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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