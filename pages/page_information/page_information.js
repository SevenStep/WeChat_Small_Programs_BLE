// pages/page_2/page_2.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    precision_array: ['高','中','低'],
    objectprecision_array: [{id: 0x01, name: '高'},
                            {id: 0x02, name: '中'},
                            {id: 0x03, name: '低'}],
    precision_index: 1,           
    version_number: ' v0.2.0',//版本号
    showView: false,//developer显示状态
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



  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      precision_index: e.detail.value
    })
  },

  /**
   * 显示函数--developer是否显示
   */
  onChangeShowState() {
    this.setData({
      showView: (!this.data.showView),
    })
  },
  
})