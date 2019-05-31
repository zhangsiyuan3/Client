const $common = require('../../../utils/common.js');
const $api = require('../../../utils/api.js')
// async await 所需
const regeneratorRuntime = require('../../../utils/regenerator-runtime/runtime')
let _msgQueue = [] //需要发送消息的队列
let _socket = null //websocket 实例
let eventObj = {} //事件对象
let pageIsUnload = true //页面是否未被销毁

Page({

  /**
   * 页面的初始数据
   */
  data: {
    intervalTime: 300000, //间隔时间 5分钟
    Images: $api.Images, //图片拼接
    voice: $api.voice, //图片拼接
    CrdMessageType: '',
    CrId: '',
    isRecord: false, //是否进入录音模式
    layerH: 0, //初始高度 
    isTop: true, //上下三角
    userId: 0,
    pageIndex: 1,
    pageSize: 9,
    // listData: {
    //   objList:[]
    // },
    listData: [],
    recordIsNormal: true, //录音状态是否正常
    newDataCount: 0, //自己发送与接收数据之和
    isOver: false, //列表是否请求道最后一条了
    record: null, //全局唯一录音实例
    isTape: false, //录音效果
    audioObject: {}, //语音实例集，为保证同一时间只能有一个音频播放
    audioPrevId: null, //上一个播放的音频id
    pageHidenType: 1, // 页面隐藏时的类型，1正常 2选相片
    imgArray: [],
    isLayer: false, //复制，翻译
    layerH: 0, //初始高度 
    isTop: true, //上下三角
    meimg: '',
    youimg: ''
  },
  //获取聊天记录
  //参数：openId【】 userId【对方UserId】 pageIndex【页码】pageSize【每页聊天记录条数】UserType【当前用户类型  0：客户  1：客服】  
  getchatrecord(isReach) {
    let { pageIndex, pageSize, isOver, newDataCount } = this.data
    if (isOver) return wx.stopPullDownRefresh(); //到底了，不管了
    // $common.loading('努力加载中...');
    $common.request($api.GetChatRecord, {
      openId: wx.getStorageSync('openid'),
      userId: parseInt(this.data.userId),
      pageIndex: pageIndex,
      pageSize: pageSize,
      UserType: 0,
      newDataCount: newDataCount
    }).then(res => {
      if (res.data.res) {
        this.setData({
          meimg: res.data.NowUserAvaUrl,
          youimg: res.data.SendUserAvaUrl
        })
        let data = res.data.objList;
        if (data.length >= pageSize) {
          this.data.pageIndex++;
          isOver = false
        } else {
          isOver = true
        }
        let listData = isReach ? this.data.listData : [];
        for (let i = 0, len = data.length; i < len; i++) {
          let date = this.timeStamp(data[i].CrdSendTime);
          data[i].showTime = date.timeWhile;
          data[i].timeStamp = date.msec;
          listData.unshift(data[i]);
          wx.stopPullDownRefresh();
        }
        listData = this.removeDuplicate(listData, 'CrdId'); //数组依据CrdId去重
        for (let i = listData.length - 1; i >= 0; i--) {
          let one = listData[i].timeStamp;
          let two = listData[i - 1] ? listData[i - 1].timeStamp : 0;
          //对话时距超过5分钟显示时间 
          listData[i].isTime = one - two >= this.data.intervalTime ? true : false;
        }
        this.setData({ listData, isOver })
        if (isReach) return;
        this.myPageScroll();
        // console.log(res.data)
        // if (this.data.listData.objList == '') {
        //   console.log(res.data)
        //   this.setData({
        //     listData: res.data,
        //   })
        //   $common.hide()
        //   this.myPageScroll();
        // }
        // let data = res.data.objList
        // if (data.length >= pageSize) {
        //   console.log(123)
        //   this.data.pageIndex++;
        //   isOver = false
        // } else {
        //   isOver = true
        // }
        // if (isReach) {
        //   console.log(this.data.listData)
        //   let listData = this.data.listData
        //   for (let i = data.length;  i>0 ; i--) {
        //     if (typeof (data[i]) != 'undefined') {
        //       listData.objList.unshift(data[i]);
        //     }
        //   }
        //   console.log(listData)
        //   listData.objList= this.removeDuplicate(listData.objList, 'CrdId'); //数组依据CrdId去重
        //   console.log(listData)
        //   this.setData({ listData, isOver })
        //   $common.hide()
        //   wx.stopPullDownRefresh();
        // }
      }
    }
    )
  },
  removeDuplicate(thisArr, thisId) { //去重
    let hash = {};
    let newArr = thisArr.reduce(function (item, target, index) {
      hash[target[thisId]] ? item[hash[target[thisId]].nowIndex] = target : hash[target[thisId]] = {
        nowIndex: item.push(target) && index
      }
      return item;
    }, []);
    return newArr;
  },
  sort(arr, idx) {
    newarr = arr.sort(function (x, y) {
      return y['idx'].toString().localeCompare(x['idx'].toString());
    });
    return newarr
  },
  longpress(e) { //长按
    console.log(123)
    let index = e.currentTarget.dataset.index;
    let listData = this.data.listData;
    this.data.copyIndex = index;
    let query = wx.createSelectorQuery().selectAll('.core').boundingClientRect().exec((res) => {
      let node = res[0][index];
      let isTime = listData.objList[index].isTime;
      let top = node.top; //该top是该元素相对于屏幕顶端的距离
      let height = node.height;
      let layerH = 0;
      let isTop = true;
      if (top < 50) { //当前元素距离顶部的距离小于100，三角形在上面
        isTop = false;
        layerH = top + height + 5;
      } else { //三角形在下面
        isTop = true;
        layerH = isTime ? top - 50 + 40 : top - 50;
      }
      this.setData({ isLayer: true, layerH, isTop })
    });
  },
  move() { //隐藏层
    this.setData({ isLayer: false })
  },
  Written() {

  },
  checkImage(e) {
    let iUrl = e.currentTarget.dataset.src;
    wx.previewImage({
      urls: [this.data.Images + iUrl] // 需要预览的图片http链接列表
    })
  },
  chooseImage() { //发送图片
    this.data.pageHidenType = 2
    $common.chooseImage((res) => {
      $common.loading('发送中')
      setTimeout(() => {
        const imageList = res.tempFilePaths
        for (let i = 0, len = imageList.length; i < len; i++) this.uploadFile(1002, imageList[i])
      }, 4000);
    })
  },
  audioCreate(e) { //待音频为可播放状态，收集所有实例
    this.data.audioObject[e.detail.key] = e.detail.value
  },
  stopAudio(e) {
    let {
      audioPrevId,
      audioObject
    } = this.data
    if (e.detail === audioPrevId) return //点的是同一个
    audioPrevId && audioObject[audioPrevId].stop()
    this.data.audioPrevId = e.detail
  },
  //录音
  recordStart() { //录音开始
    let record = this.data.record = wx.getRecorderManager()
    let startTime = 0
    let endTime = 0
    record.onStart(() => { //开始录音回调
      this.setData({
        isTape: true
      })
      startTime = new Date().getTime()
      this.data.recordIsNormal = true
    })
    record.onStop((res) => { //停止录音回调
      this.setData({
        isTape: false
      })
      endTime = new Date().getTime()
      const duration = endTime - startTime // res.duration 音频时长，录音器返回的和播放时获取的不符，自己搞
      this.uploadFile(1003, res.tempFilePath, duration)
    })
    record.onError((res) => { //录音错误事件回调
      this.setData({
        isTape: false
      })
      this.data.recordIsNormal = false
    })
    record.start({
      duration: 600000,
      format: 'mp3'
    })
  },
  recordEnd() { //录音结束
    this.data.record.stop()
  },
  recordCancel() { //按下事件被打断，如来电提醒，弹窗
    this.data.recordIsNormal = false
    this.data.record.stop()
  },
  uploadFile(CrdMessageType, filePath, duration = '') { //上传文件 1002 图片 1003 音频
    if (!this.data.recordIsNormal) return //录音出错等等情况，不上传，不提交
    // $common.loading('上传中')
    wx.uploadFile({
      url: CrdMessageType === 1003 ? $api.UploadVoice : $api.UpLoadImg,
      filePath,
      name: 'file',
      formData: {},
      success: res => {
        let data = JSON.parse(res.data)
        const CrdChatMsg = duration ? `${data.msg}|${duration}` : data.msg
        if (data.res) this.sendMessage({
          CrdChatMsg,
          CrdMessageType,
          CrdBeMySelf: 1
        })
      },
      complete: $common.hide
    })
  },
  getMyDate(num) {
    let date = num ? new Date(+num) : new Date()
    let y = date.getFullYear(),
      m = date.getMonth() + 1,
      d = date.getDate(),
      h = date.getHours(),
      f = date.getMinutes();
    m < 10 && (m = '0' + m);
    d < 10 && (d = '0' + d);
    h < 10 && (h = '0' + h);
    f < 10 && (f = '0' + f);
    return {
      timeStamp: date.getTime(),
      showTime: `${y}-${m}-${d} ${h}:${f}`
    }
  },
  sendMessage(obj) { //发送消息  CrdMessageType 1001 文字 1002 图片 1003 语音 1004 视频
    console.log('处理前', obj)
    let listData = this.data.listData
    listData.push(obj)
    this.setData({
      listData,
      CrdMessageType: obj.CrdMessageType,
    }) //将发送的数据渲染于页面
    let object = {}
    if (obj.CrdMessageType === 1001) { //文字发送后需要清空输入框内容
      object = { value: '', listData }
    } else {
      object = { listData }
    }
    this.setData(object)
    this.myPageScroll()
    //添加数据到事件队列
    _msgQueue.push(() => _socket.send({ data: JSON.stringify(obj), complete(e) { console.log(e) } }))
    this.loopSendMsg()
  },
  async loopSendMsg() { //轮询执行队列里的事件
    console.log('轮询事件', _msgQueue)
    for (let i = 0; i < _msgQueue.length; i++) {
      await _msgQueue[i]()
      _msgQueue.shift() //执行完成后删除该事件
      i--
    }
  },
  confirm(e) { //点击右下角 发送 按钮
    let value = e.detail.value;
    if (value.trim().length <= 0) return;
    this.sendMessage({
      CrdChatMsg: value,
      CrdMessageType: 1001,
      CrdBeMySelf: 1
    })
  },
  async init() {
    await this.getchatrecord();
    this.linkSocket()
    this.myPageScroll()
  },
  changeVoice() { //切换语音或文字, //语音需要授权
    let {
      isRecord
    } = this.data
    if (!isRecord) {
      wx.authorize({
        scope: 'scope.record',
        complete: () => wx.getSetting({
          success: res => {
            if (res.authSetting['scope.record']) this.setData({
              isRecord: true
            })
          }
        })
      })
    } else {
      this.setData({
        isRecord: false
      })
    }
  },
  myPageScroll() {
    setTimeout(() => { // 使页面滚动到底部
      // wx.createSelectorQuery().select('#wrap').boundingClientRect(function (rect) {
        wx.pageScrollTo({
          scrollTop: 999999999999
        })
      // }).exec();
    }, 10);
  },
  timeStamp(time) { //时间戳转换为日期
    time = ('' + time).replace(/\D/g, '');
    let date = new Date(+time),
      y = date.getFullYear(),
      m = date.getMonth() + 1,
      d = date.getDate(),
      h = date.getHours(),
      f = date.getMinutes();
    let msec = Date.parse(new Date(+time));
    m < 10 && (m = '0' + m);
    d < 10 && (d = '0' + d);
    h < 10 && (h = '0' + h);
    f < 10 && (f = '0' + f);
    return {
      timeWhile: `${y}-${m}-${d} ${h}:${f}`,
      msec: msec
    }
  },
  reconnect() { //断线重连
    let timer = null
    let isLink = false //是否成功连接
    let n = 0 //重连次数
    this.reconnect = () => {
      console.log('重连函数', pageIsUnload, isLink)
      if (!pageIsUnload) return //页面接下来要被销毁，无需重连
      if (isLink) return
      isLink = true
      clearTimeout(timer)
      if (n < 30) {
        timer = setTimeout(() => {
          console.log('因...  启动重连')
          this.linkSocket()
          isLink = false
        }, 5000)
        n++
      }
    }
    this.reconnect()
  },
  //websocket
  async linkSocket(callback = () => { }) {
    console.log('开始建立连接')
    let openid = wx.getStorageSync('openid');
    //建立连接
    _socket = await wx.connectSocket({
      url: `${$api.webStock}?OpenId=${openid}&NowUserType=0&NowCrId=${this.data.CrId}&ReceiveUserId=${this.data.userId}&CrdMessageType=${this.data.CrdMessageType}`
    });
    _socket.onOpen(() => {
      console.log('WebSocket连接打开')
      this.loopSendMsg()
      this.heartCheck()
      $common.hide()
    })
    _socket.onError((res) => {
      console.log(res, 'WebSocket连接打开失败')
      this.reconnect()
    })
    _socket.onClose((res) => {
      console.log('WebSocket 已关闭！')
      this.reconnect()
    })
    _socket.onMessage((res) => { //接收数据
      console.log('接收数据', res)
      if (res.data === '心跳成功！') return this.heartCheck()
      let listData = this.data.listData;
      let data = JSON.parse(res.data)
      if (data.CrdReceOpId != "{-system-}") {
        listData.push({
          CrdBeMySelf: 0,
          ...data,
        })
      }
      let newDataCount = this.data.newDataCount;
      newDataCount++;
      this.setData({
        listData,
      })
      this.myPageScroll()
    });
  },
  heartCheck() { //心跳检测
    let timeout = 10000
    let timeObj = null //发送消息确认是否连接正常
    let serverTimeObj = null //当链接无缘无故断开时，断开连接，会自动重新连接
    this.heartCheck = () => {
      clearTimeout(serverTimeObj)
      clearTimeout(timeObj)
      timeObj = setTimeout(() => {
        console.log('发送密钥')
        //发送固定密钥
        _socket.send({
          data: 'K1f8Wn1iB3KuHaKHqskGeqiwHfCPv5Km'
        })
        serverTimeObj = setTimeout(_socket.close, timeout)
      }, timeout)
    }
    this.heartCheck()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      Did: options.Di,
      userId: options.userid,
      CrId: options.crid
    })
    $common.loading('努力加载中...');
    pageIsUnload = true
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

    let { pageHidenType } = this.data
    if (pageHidenType === 1) {
      this.data.pageIndex = 1
      this.init();
    } else if (pageHidenType === 2) {
      this.data.pageHidenType = 1
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    _socket.close && _socket.close()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    pageIsUnload = false
    _socket.close && _socket.close()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getchatrecord(true);
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