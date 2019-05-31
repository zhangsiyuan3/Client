const phoneReg = /^(1[3456789]|9[28])\d{9}$/ // 正则手机号码
const http =`znkf.1-zhao.fun`
const host = `https://${http}`
const DepImgs =`${host}/Content/DepImgs/`//客服头像路径
const voice = `${host}/ChatMultiMedia/voice/`//音频路径
const Images = `${host}/ChatMultiMedia/Images/`//聊天图片路径
const webStock = `wss://${http}/WebSocketServer.ashx`;//聊天
module.exports = {
  webStock,
  phoneReg,
  DepImgs,
  voice,
  Images,
  //获取openid
  Getopenid: `${host}/ltp/UserInfo/GetSaveUserOpenId`,
  // 更新头像与昵称
  UpdateAvaUrlNick: `${host}/ltp/UserInfo/UpdateAvaUrlNick`,
  //获取当前用户冻结状态
  GetUserFrozenState: `${host}/ltp/UserInfo/GetUserFrozenState`,
  //解密手机号码
  GetUserPhone: `${host}/ltp/UserInfo/GetUserPhone`,
  //获取该客户的客服列表
  GetDepartmentList: `${host}/Customer/GetDepartmentList`,
  //获取userid
  GetMyServicesInfo: `${host}/Customer/GetMyServicesInfo`,
  //获取聊天记录
  GetChatRecord: `${host}/ChatRecord/GetChatRecord`,
  //聊天上传图片
  UpLoadImg: `${host}/ChatRecord/UpLoadImg`,
  //聊天上传音频
  UploadVoice: `${host}/ChatRecord/UploadAudio`,

}