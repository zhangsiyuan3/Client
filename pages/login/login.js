const $common = require('../../utils/common.js');
const $api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    Address: '', //地址
    bo_end:false
  },
  getAddress() {
    $common.loading('登录中...')
    //获取当前位置
    // $common.getLocation()
    //   .then(res => $common.reverseGeocoder(res))
    //   .then(res => {
    //     this.setData({
    //       Address: res.result.address
    //     })
    //   })
  },
  //获取并更新用户头像等信息
  // 参数：openId【】avaUrl【头像地址】nickName【昵称】userType【用户类型， 0：用户   1：客服】
  getUserInfo() {
    let openid = wx.getStorageSync('openid')
    let userinfo = wx.getStorageSync('userinfo')
    // console.log(openid)
    // console.log(wx.getStorageSync('userinfo'))
    $common.request($api.UpdateAvaUrlNick, { openId: openid, nickName: userinfo.nickName, userType: 0, avaUrl: userinfo.avatarUrl})
      .then(res => {
        $common.hide()
        // console.log(res)
      })
  },
  //获取当前用户冻结状态
  // 参数：OpenId【】UserType【用户类型， 0：用户   1：客服】  返回值：FrozenState：0【正常】1【已冻结】
  GetUserFrozen() {
    let openid = wx.getStorageSync('openid')
    $common.request($api.GetUserFrozenState, {
        openId: openid,
        userType: 0
      })
      .then(res => {
        $common.hide()
      })
  },
  //获取openid
  getopenid(){
    // 获取code
    wx.login({
      success: res => {
        let code = res.code;
        // console.log(code)
        $common.request($api.Getopenid, {
          code: code,
          userType: 0
        })
          .then(res => {
            if(res.data.res){
              // console.log(res)
              wx.setStorageSync('openid', res.data.openid)
              /**
               * 因获取手机号session_key过期问题，解决方案
               * 存储两个session_key后台会循环验证
               * session_key必须有值，New_session_key可有可无
               */
              let session_key = wx.getStorageSync('session_key')
              let New_session_key = wx.getStorageSync('New_session_key')
              let data_session_key = res.data.session_key
              wx.setStorageSync('session_key', session_key ? New_session_key === data_session_key ? session_key : New_session_key : data_session_key)
              wx.setStorageSync('New_session_key', data_session_key)
              this.GetUserFrozen()
              this.getUserInfo()
              if (res.data.UserExistence){
                this.setData({
                  bo_end: true
                })
                setTimeout(() => {
                  wx.reLaunch({
                    url: '../Home/OnlineService/OnlineService'
                  });
                }, 500);
                $common.hide()
              }
            }
            
          }).catch(err => {
            console.log('err', err)

          })
      
      }
    })
  },
  //获取用户信息
  info(){
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success(res) {
              // 存储基本信息

            }
          })
        }
      }
    })
  },
  bindGetUserInfo(e) {
    wx.setStorageSync('userinfo', e.detail.userInfo)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getopenid()
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