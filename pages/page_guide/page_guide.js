// pages/page_3/page_3.js

const htmlSnip = 
`<div>
<h1 style="text-align:center">使用帮助</h1>
<br />
<h2>✅ 基本使用说明</h2>
<br />
<p style="text-indent:2em">本程序用于低功耗无线传感器节点的演示使用，可通过相对应的无线传感器节点获取温湿度值以及无线传感器设备输入电压。通过参数设置，可以获取一段时间内的温湿度平均数据。</p>
<h3>参数设置</h3>
<p style="text-indent:2em">通过设置参数，可以获取采样时间内的平均温湿度数据。本程序参数设置分为：</p>
<ul>
<li><b>采样精度：</b>分为高、中、低三级</li>
<li><b>采样频率：</b>分为1MPS、2MPS、5MPS、10MPS（MPS即每秒钟采样次数）</li>
<li><b>采样时间：</b>采样总长度时间，可以设置为1秒、5秒、10秒、20秒、30秒、60秒</li>
</ul>
<p style="text-indent:2em"><b>注意：</b>在进行参数设置采样时。不能进行实时温湿度数据的获取。</p>
<br />
<h2>🈯 疑难解答</h2>
<br />
<p style="text-indent:2em">本程序仍处于测试阶段，在Android系统兼容性上具有一定的问题，Android设备用户可能会存在搜索设备较慢的问题。部分BUG请联系开发人员，感谢您的理解与配合🙏</p>
</div>
`

Page({

  /**
   * 页面的初始数据
   */
  data: {
    version_number: ' v0.2.1',//版本号
    showView: false,//developer显示状态
    htmlSnip,
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
    console.log("打开页面：'使用说明'")
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
   * 显示函数--developer是否显示
   */
  onChangeShowState() {
    this.setData({
      showView: (!this.data.showView),
    })
  },

})