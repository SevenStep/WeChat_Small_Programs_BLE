// pages/test/test.js




 /**
  * arrayBuffer 转16进制字符串示例
  * @param {*} buffer 
  */
  function ab2hex(buffer) {
   var hexArr = Array.prototype.map.call(
     new Uint8Array(buffer),
     function (bit) {
       return ('00' + bit.toString(16)).slice(-2)
     }
   )
   return hexArr.join('');
 }


Page({

  
  /**
   * 初始数据
   */
  data: {
    version_number: ' v0.0.3',//版本号
    showView: false,//developer显示状态
    devices:[],//设备列表
    device_connected:[],//当前连接设备信息
    connected:false,//设备连接状态
    Tem_num:0,//温度值
    Hum_num:0,//湿度值
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
  onChangeShowState() {
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
        var that = this
        //检测设备名称，没名字的不显示
        if (!device.name && !device.localName) {
          return
        }
        //为devices添加项目devices_index
        const devices_list = that.data.devices//读取data.devices
        const devices_index = devices_list.findIndex(a => a.deviceId === device.deviceId)
        if (devices_index === -1) {
          console.log('找到新设备:',device)
          devices_list.push(device)//数组末尾添加一个对象用push，concat加不进去
        } 
        this.setData({
          devices: devices_list
        })
      })
      console.log(this.data.devices)
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
    wx.closeBluetoothAdapter({
      success (res) {
        console.log("关闭蓝牙模块")
      }
    })
  },

  /**
   * 获取蓝牙设备所有服务(service)
   * @param {*} deviceId 
   */
  getBLEDeviceServices(deviceId){
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        console.log("services:",res.services)
        console.log('advertisServiceUUIDs:',this.data.device_connected.advertisserviceuuids[0])
        for(let i=0;i<res.services.length;i++){
          if (res.services[i].uuid === this.data.device_connected.advertisserviceuuids[0]){//advertisServiceUUIDs
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
            console.log('100',res.services[i].uuid)
            return
          }
        }
      },
    })
  },//serviceID  蓝牙服务的uuid  


  getBLEDeviceCharacteristics(deviceId, serviceId){
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('成功获取蓝牙设备特征值', res.characteristics)
        for(let i=0;i<res.characteristics.length;i++){
          let item=res.characteristics[i]
          if (item.properties.notify || item.properties.indicate){   
             wx.notifyBLECharacteristicValueChange({
               deviceId,
               serviceId,
               characteristicId: item.uuid,
               state: true,
               success:function(res){
                  console.log("notify success")
               }
             })
           }
         }
       },
      fail: (res)=> {
        console.error('特征值获取失败',res)
       }
     }),
     wx.onBLECharacteristicValueChange( (res) => {
      console.log(`characteristic ${res.characteristicId} has changed, `)
      console.log(ab2hex(res.value))
      //console.log("wendu", ab2hex(res.value).slice(0, 4))   slice取值 是索引[0,4)
      var a = parseInt( (ab2hex(res.value).slice(0, 4)),16)
      //console.log(a)
      var T = (a * 175 / (65535) - 45).toFixed(2)
      console.log("Temperature",T)
      this.setData({
        Tem_num: T
      })
      var b = parseInt((ab2hex(res.value).slice(4, 8)), 16)
      console.log(b)
      var H = (b * 100 / (65535)).toFixed(2)
      console.log("Humidity", H)
      this.setData({
        Hum_num: H
      })
     })
     
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
    //如果已经存在连接，断开连接
    if (this.data.connected === "true"){
      wx.closeBLEConnection({
        deviceId: this.data.device_connected.deviceid
      })
      this.setData({
        connected: false,
      })
    }
    const device_data = e.currentTarget.dataset//获取本次事件data
    console.log(device_data)
    const deviceId = device_data.deviceid
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        console.log("创建BLE连接成功")
        this.setData({
          connected: true,
          device_connected: device_data,
        })
        console.log("deviceId:",deviceId);
        this.getBLEDeviceServices(deviceId);
        wx.stopBluetoothDevicesDiscovery();
      },
      fail: (res) => {
        console.log('fail:',res)
      }
    })
    
  },

  /**
   * 断开与低功耗蓝牙设备的连接
   */
  closeBLEConnection() {
    wx.vibrateShort({
      complete: (res) => {
        console.log("断开当前连接-震动",res)
      },
    })
    wx.closeBLEConnection({
      deviceId: this.data.device_connected.deviceid
    })
    this.setData({
      connected: false,
    })
  },

//   /**
//    * 生命周期函数--监听页面初次渲染完成
//    */
//   onReady: function () {

//   },

//   /**
//    * 生命周期函数--监听页面显示
//    */
//   onShow: function () {

//   },

//   /**
//    * 生命周期函数--监听页面隐藏
//    */
//   onHide: function () {

//   },

//   /**
//    * 生命周期函数--监听页面卸载
//    */
//   onUnload: function () {

//   },

//   /**
//    * 页面相关事件处理函数--监听用户下拉动作
//    */
//   onPullDownRefresh: function () {

//   },

//   /**
//    * 页面上拉触底事件的处理函数
//    */
//   onReachBottom: function () {

//   },

//   /**
//    * 用户点击右上角分享
//    */
//   onShareAppMessage: function () {

//   }
})