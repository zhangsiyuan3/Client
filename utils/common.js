const mapKey = require('./qqmap.js')
const { $api } = wx
module.exports = {
  //请求数据
  request(url, data, method = 'POST') { //请求
    return new Promise((resolve, reject) => wx.request({
      url,
      data,
      method,
      header: {
        'content-type': 'application/json'
      },
      success: resolve,
      fail: reject
    }))
  },
  getLocation() { //获取当前坐标
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        altitude: true,
        success: resolve,
        fail: reject
      })
    })
  },
  getCurrentLocation() { //获取当前位置
    return new Promise((resolve, reject) => {
      this.getLocation()
        .then(this.reverseGeocoder)
        .then(resolve)
        .catch(reject)
    })
  },
  reverseGeocoder(options) { //腾讯地图，逆地址解析
    const {
      latitude,
      longitude
    } = options
    return new Promise((resolve, reject) => {
      mapKey.reverseGeocoder({
        location: {
          latitude,
          longitude
        },
        success: res => res.status === 0 ? wx.setStorageSync('currentLocation', res.result) || resolve(res) : reject(res),
        fail: reject
      })
    })
  },
  //从本地相册选择图片或使用相机拍照
  chooseImage(success, count) {
    count = parseInt(count) ? count : 9;
    success = typeof (success) === 'function' ? success : function (res) { };
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      count: count,
      success: success,
    })
  },
  uploadFile() { //上传文件
    return new Promise((resolve, reject) => wx.uploadFile({ url, success: reject }))
  },
  loading(title = '请求中...', mask = true) {
    wx.showLoading({
      title,
      mask
    })
  },
  hide() {
    wx.hideLoading()
  },
  unique(arr, id) { //数组去重
    let hash = {}
    return arr.reduce((item, target) => {
      hash[target[id]] ? '' : hash[target[id]] = true && item.push(target)
      return item
    }, [])
  },
  timeStamp(str) { //时间戳转换为时间
    let timeStamp = ('' + str).replace(/\D/g, '')
    let date = new Date(+timeStamp),
      y = date.getFullYear(),
      m = date.getMonth() + 1,
      d = date.getDate(),
      h = date.getHours(),
      mi = date.getMinutes(),
      s = date.getSeconds(),
      w = date.getDay()
    m < 10 && (m = '0' + m)
    d < 10 && (d = '0' + d)
    h < 10 && (h = '0' + h)
    mi < 10 && (mi = '0' + mi)
    s < 10 && (s = '0' + s)
    return {
      y,
      m,
      d,
      h,
      mi,
      s,
      w
    }
  },
}