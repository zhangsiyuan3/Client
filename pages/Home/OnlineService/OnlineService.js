const $common = require('../../../utils/common.js');
const $api = require('../../../utils/api.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    DepImgs: $api.DepImgs, //图片拼接
    listData: [],
    id: '',
    hide: 0,
    pageSize: 10,
    pageIndex: 1,
    isOver: false
  },
  Communicate(e) {
    let Did = e.currentTarget.dataset.id
    let userid = e.currentTarget.dataset.userid
    let Crid = e.currentTarget.dataset.crid
    wx.navigateTo({
      url: `../Communication/Communication?Did=${Did}&userid=${userid}&crid=${Crid}`
    });
  },
  getlist() {
    let listData = this.data.listData 
    //获取客服列表
    $common.request($api.GetDepartmentList, {
      openId: wx.getStorageSync('openid'),
    }).then(res => {
      if(res.data.res){
        if (res.data.Data.length>0){
          let data = res.data.Data
          for (let i = 0, len = data.length; i < len; i++) {
            data[i].showTime = this.timeStamp(data[i].CrRecentContactTime);
            listData.push(data[i]);
          }
          this.setData({
            listData: data
          })
          $common.hide()
        }else{
          this.setData({
            hide:1
          })
        }
        
      }
    }).catch(err => {
      console.log('err', err)
    })
  },
  //时间
  timeStamp(time) { //时间戳转换为日期
    time = time.replace("/Date(", '').replace(')/', '');
    let date = new Date(parseInt(time)),
      y = date.getFullYear(),
      m = date.getMonth() + 1,
      d = date.getDate(),
      h = date.getHours(),
      f = date.getMinutes();
    m < 10 && (m = '0' + m);
    d < 10 && (d = '0' + d);
    h < 10 && (h = '0' + h);
    f < 10 && (f = '0' + f);
    return `${y}/${m}/${d} ${h}:${f}`;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getlist()
    $common.loading()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getlist()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh();
    this.getlist()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})