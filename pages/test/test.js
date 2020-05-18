// pages/test/test.js

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
     if (arr[i][key] ===  val){
       return i;
       // [i]代表索引，[key]代表下属的元素
     }
   
   }
   return -1;
 }
 //arrayBuffer 转16进制字符串示例
 function ab2hex(buffer) {
   var hexArr = Array.prototype.map.call(
     //https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array
     new Uint8Array(buffer),
     function (bit) {
       return ('00' + bit.toString(16)).slice(-2)
       //j将bit数字值转化成16位的字符串，加'00'啥意思不懂，slice是取一部分，倒数的第二位到最后
       //我又有新问题了。直接buffer转16位不就完了吗？为什么还要前面取那么多八进制什么的。这个arrayBuffer是几位的呢？
     }
   )
   return hexArr.join('');
 }


Page({

  /**
   * 页面的初始数据
   */
  data: {
    version_number: ' v0.0.3',//版本号
    showView: false,//developer显示状态
    devices:[],//设备
    connected:false,//设备连接状态
    chs:[],
    numT:0,
    numH:0,
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    showView: (options.showView == "true" ? true : false)
  },

  /**
   * 显示函数--developer是否显示
   */
  onChangeShowState: function () {
    this.setData({
      showView: (!this.data.showView),
    })
  },

  /**
   * 打开蓝牙适配器，开始扫描
   */
  openBluetoothAdapter: function () {
    wx.vibrateShort({
    complete: (res) => {
      console.log("点击开始扫描-震动",res)
    },
    })
    wx.openBluetoothAdapter({
      success:(res)=>{
        console.log("打开蓝牙适配器",res)
        this.startBluetoothDevicesDiscovery()
      },
      // fail: (res) => {
      //   if (res.errCode === 10001) {//当前蓝牙适配器不可用
      //     wx.onBluetoothAdapterStateChange(function(res){
      //       console.log("BluetoothAdapterStateChange", res)
      //       if(res.available){
      //         this.startBluetoothDevicesDiscovery()
      //         }
      //       })
      //     }
      //   }
    })
  },

  /**
   * 开始搜寻附近的蓝牙外围设备
   * 此操作比较耗费系统资源
   * 请在搜索并连接到设备后调用 wx.stopBluetoothDevicesDiscovery 方法停止搜索
   */
  startBluetoothDevicesDiscovery(){
    // if(this._discoveryStarted){
    //   //1.this的四种用法2. _的用法 3.discivertStarted 这个参数哪里来的？API并未提及这个
    //   return
    // }
    // this._discoveryStarted=true
    wx.startBluetoothDevicesDiscovery({     
      success: (res)=> {
        console.log("开始查找蓝牙设备",res)
        this.onBluetoothDeviceFound()
      }
    })
  },

  /**
   * 监听寻找到新设备的事件
   * 安卓下部分机型需要有位置权限才能搜索到设备，需留意是否开启了位置权限
   */
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      console.log("正在查找蓝牙设备")
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
          //一开始什么设备也没发现的 时候，device被赋值给data.devices[0]
        } 
        else {
           data[`devices[${idx}]`] = device
          }
        this.setData(data)
      })
    })
  },

  /**
   * 停止搜寻附近的蓝牙外围设备
   * 若已经找到需要的蓝牙设备并不需要继续搜索时
   * 建议调用该接口停止蓝牙搜索
   */
  stopBluetoothDevicesDiscovery() {
    console.log("停止查找蓝牙设备")
    wx.stopBluetoothDevicesDiscovery() 
  },


  /**
   * 关闭蓝牙模块
   * 调用该方法将断开所有已建立的连接并释放系统资源
   * 建议在使用蓝牙流程后
   * 与 wx.openBluetoothAdapter 成对调用
   */
  closeBluetoothAdapter(){
    wx.closeBluetoothAdapter()
    this._discoveryStarted=false
  },



 /**
   * 连接低功耗蓝牙设备
   * 若小程序在之前已有搜索过某个蓝牙设备并成功建立连接
   * 可直接传入之前搜索获取的 deviceId 直接尝试连接该设备
   * 无需进行搜索操作
   */
  createBLEConnection(e) {
    wx.vibrateShort({
      complete: (res) => {
        console.log("建立连接-震动",res)
      },
    })
    const ds = e.currentTarget.dataset//currentTarget和target事件，currentTarget代表的是手指触摸到选项，进行连接
    const deviceId = ds.deviceId
    const name = ds.name
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        console.log("创建BLE连接成功")
        this.setData({
          connected: true,
          name,
          deviceId,
        })
        this.getBLEDeviceServices(deviceId)
      }
    })
    this.stopBluetoothDevicesDiscovery()
  },





  /**
   * 断开与低功耗蓝牙设备的连接
   */
  closeBLEConnection: function() {
    wx.vibrateShort({
      complete: (res) => {
        console.log("断开当前连接-震动",res)
      },
    })
    wx.closeBLEConnection({
      deviceId: this.data.deviceId
    })
    this.setData({
      connected: false,
      chs: [],
      canWrite: false,
    })
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