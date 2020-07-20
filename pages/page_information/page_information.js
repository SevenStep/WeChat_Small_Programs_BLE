// pages/page_information/page_information.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    precision_array: ['高','中','低'],
    precision_index: 1,
    objectprecision_array: [{id: 0x01, name: '高'},
                            {id: 0x02, name: '中'},
                            {id: 0x03, name: '低'}],
    
    frequency_array: ['1MPS','2MPS','5MPS','10MPS'],
    frequency_index: 0,
    objectfrequency_array: [{id: 0x00, name: '1MPS'},
                            {id: 0x01, name: '2MPS'},
                            {id: 0x02, name: '5MPS'},
                            {id: 0x03, name: '10MPS'}],
  
    duration_array: ['1秒','5秒','10秒','20秒','30秒','60秒'],
    duration_index: 0, 
    objectduration_array: [{id: 0x00, name: '1秒'},
                           {id: 0x01, name: '5秒'},
                           {id: 0x02, name: '10秒'},
                           {id: 0x03, name: '20秒'},
                           {id: 0x04, name: '30秒'},
                           {id: 0x05, name: '60秒'},],
              
    version_number: ' v0.2.0',//版本号
    showView: false,//developer显示状态

    Tem_num: "未获取",
    Hum_num: "未获取",
    Volt_num: "未获取",
    
    device_connected: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    showView: (options.showView == "true" ? true : false)

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
    this.getDeviceData()
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
    return {
      title: 'BLE温湿度检测',
      path: '../main_page/main_page',
    }
  },

  /**
   * 振动
   */
  vibrateShort() {
    wx.vibrateShort({
    complete: (res) => {
    console.log("点击振动",res)
    },
  })
  },

  /**
   * 获取当前连接数据
   * @param {*} e 
   */
  getDeviceData: function() {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    console.log("读取数据：",prevPage.data.device_connected)
    this.setData({
      device_connected: prevPage.data.device_connected
    })
  },


  precisionPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      precision_index: e.detail.value
    })
  },

  frequencyPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      frequency_index: e.detail.value
    })
  },

  durationPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      duration_index: e.detail.value
    })
  },


  /**
   * 确认参数开始测试
   */

  /**
   * 获取当前实时温度
   */

  /**
   * 获取当前实时电压
   */

  /**
   * 显示函数--developer是否显示
   */
  onChangeShowState() {
    this.setData({
      showView: (!this.data.showView),
    })
  },
  
})