// pages/test/test.js
const app = getApp()

Page({

  
  /**
   * 初始数据
   */
  data: {
    version_number: ' v0.1.7',//版本号
    system_info:[],//手机系统版本

    devices:[],//扫描设备列表
    device_connected:[],//当前连接设备信息
    connected:false,//设备连接状态
    Tem_num:"无连接",//温度值
    Hum_num:"无连接",//湿度值

    showView: false,//developer显示状态
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    showView: (options.showView == "true" ? true : false)
    // app.watch(this, {
    //   devices: function (newVal) {
    //     console.log(newVal)
    //   }
    // }) 
    this.SystemInfo()//获取设备系统类型
  },

    /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.stopBluetoothDevicesDiscovery(),
    this.closeBluetoothAdapter();
    this.setData({
      devices:[],
      device_connected:[],
      connected: false,
      Tem_num: "无连接",
      Hum_num: "无连接",
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

  SystemInfo(){
    wx.getSystemInfo({
      complete: (res) => {
        this.setData({
          system_info: res.system.substring(0,3)
        })
      },
    })
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
   * 打开蓝牙适配器，开始扫描
   * StarScan的目的是把振动和打开蓝牙模块分开，否则在安卓设备上需要频繁打开模块，一直振动
   */
  StartScan: function () {
    this.vibrateShort(),
    this.openBluetoothAdapter()
  },
  openBluetoothAdapter: function () {
    //刷新设备列表
    wx.openBluetoothAdapter({
      success:(res)=>{
        console.log("打开蓝牙适配器",res)
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        //当前蓝牙适配器不可用
        if (res.errCode == 10001) {//当前蓝牙适配器不可用
          wx.showModal({
            title: "注意",
            content: '请检查设备蓝牙及定位是否打开',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {//这里是点击了确定以后
                console.log('确定')
              } 
            }
          }),
          wx.onBluetoothAdapterStateChange(function(res){
            console.log("BluetoothAdapterStateChange", res)
            if(res.available){
              this.startBluetoothDevicesDiscovery()
              }
            })
          }
        }
    })
  },

  /**
   * 开始搜寻附近的蓝牙外围设备
   * 此操作比较耗费系统资源
   * 请在搜索并连接到设备后调用 wx.stopBluetoothDevicesDiscovery 方法停止搜索
   */
  startBluetoothDevicesDiscovery(){
    if (this.data.connected != true){
      this.setData({
        devices:[]
      })
    }
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
      console.log("开始监听寻找新设备")
      res.devices.forEach(device => {
        var that = this
        console.log("当前设备清单：",that.data.devices)
        //检测设备名称，没名字的不显示
        if (!device.name && !device.localName) {
          return
        }
        //为devices添加项目devices_index
        let devices_list = that.data.devices//读取data.devices
        if (devices_list.findIndex(a => a.deviceId == device.deviceId) == -1) {
          console.log('找到新设备:',device)
          devices_list.push(device)//数组末尾添加一个对象用push，concat加不进去
        } 
        this.setData({
          devices: devices_list
        })
      })
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
        console.log("services:",res.services)//serviceID  蓝牙服务的uuid  
        console.log('advertisServiceUUIDs:',this.data.device_connected.advertisserviceuuids[0])
        //查找主服务uuid并确认连接
        let uuid_index = res.services.findIndex(a => a.uuid == this.data.device_connected.advertisserviceuuids[0])
        if (uuid_index != -1){
          console.log("已找到主服务uuid，确认连接")
          this.getBLEDeviceCharacteristics(deviceId, res.services[uuid_index].uuid)
          return
        }
        
      },
    })
  },


  /**
   * 获取蓝牙设备某个服务中所有特征值(characteristic)
   * @param {*} deviceId 
   * @param {*} advertisServiceUUIDs 
   */
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    //获取蓝牙设备某个服务中所有特征值(characteristic)。
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('成功获取蓝牙设备特征值', res.characteristics)
        //启用低功耗蓝牙设备特征值变化时的 notify 功能，订阅特征值
        let characteristic_index = res.characteristics.findIndex(a => a.properties.notify || a.properties.indicate == true)
        wx.notifyBLECharacteristicValueChange({
          deviceId,
          serviceId,
          characteristicId: res.characteristics[characteristic_index].uuid,
          state: true,//是否启用notify
          success:function(res){
             console.log("成功订阅notify特征值")
          },
        })
      },
      fail: (res)=> {
        console.error('特征值获取失败',res)
      },
    }),
    //监听低功耗蓝牙设备的特征值变化事件。必须先启用 notifyBLECharacteristicValueChange 接口才能接收到设备推送的 notification。
    wx.onBLECharacteristicValueChange( (res) => {
      console.log(`特征值${res.characteristicId} 已改变：`)
      //采用uint8是因为尽管是16位数据，但是蓝牙传递队列已经把数据转化成8位了，这个是蓝牙本身的库函数决定的。
      let r_data = new Uint8Array(res.value)//received_data接收的数据
      // let r_data_16
      // r_data_16 = r_data.forEach(function(v,i,a) {//v是数组元素，i数组索引，a是数组本身
      //   a[i] =v.toString(16)
      // })
      // r_data_16 = r_data_16.join('')

      let Tem = ((r_data[0]*256+r_data[1]) * 175 / (Math.pow(2,16)-1) - 45).toFixed(2)
      let Hum = ((r_data[2]*256+r_data[3]) * 100 / (Math.pow(2,16)-1)).toFixed(2)
      this.setData({
        Tem_num: `${Tem}℃`,
        Hum_num: `${Hum}%`,
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
    this.vibrateShort()
    //如果已经存在连接，断开连接
    if (this.data.connected == true) {
      //如果已经存在连接，且在已连接状态下点击同一设备，无反应。
      if (e.currentTarget.dataset.deviceid == this.data.device_connected.deviceid) {
        return
      }
      /**
       * 因为安卓蓝牙的设置，切换也有问题，索性让两个系统在切换这个功能上不一样
       * iOS设备可以直接在列表里切换，安卓需要先断开连接，关闭蓝牙模块，然后重新打开再次搜索
       */
      if (this.data.system_info != "iOS") {
        wx.showModal({
          title: "检测到安卓设备",
          content: '请点击断开连接按钮再切换设备',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {//这里是点击了确定以后
              console.log('确定')
            } 
          }
        })
        return
      }
      wx.closeBLEConnection({
        deviceId: this.data.device_connected.deviceid
      })
      // this.closeBluetoothAdapter()
      // console.log('已断开，函数：createBLEConnection')
      this.setData({
        connected: false,
        device_connected:[],
        Tem_num: "获取中",
        Hum_num: "获取中",
      })
    }
    let device_data = e.currentTarget.dataset//获取本次事件data
    console.log(device_data)
    let deviceId = device_data.deviceid
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        console.log("创建BLE连接成功")
        this.setData({
          connected: true,
          device_connected: device_data,
          Tem_num: "获取中",
          Hum_num: "获取中",
        })
        console.log("deviceId:",deviceId);
        this.getBLEDeviceServices(deviceId);

        //监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
        wx.onBLEConnectionStateChange((res) => {
          var that = this
          if(res.connected == false) {
            /**
             * 安卓系统【微信小程序】wx.onBluetoothDeviceFound 安卓机第一次可以连接蓝牙设备，第二次搜索不到问题
             * 问题原因：
             * wx.onBluetoothDeviceFound 接口返回的是新的蓝牙设备，之前连接过的在部分安卓机型上，不算做新的蓝牙设备，故重新连接搜索不到
             * 解决办法:
             * 操作完成后要及时关闭连接，同时也要关闭蓝牙设备，否则安卓下再次进入会搜索不到设备除非关闭小程序进程再进才可以，iOS不受影响。
             */
            if (this.data.system_info != "iOS") {
              wx.closeBLEConnection({
                deviceId: this.data.device_connected.deviceid
              })
              console.log('连接已断开，安卓特制')
              wx.closeBluetoothAdapter({
                complete: (res) => {
                  console.log("安卓特制：关闭蓝牙模块")
                },
              })
            }
            wx.showToast({
              title: "连接已断开",
              duration:1000,
              mask:true,
            }),
            this.setData({
              devices:[],
              device_connected:[],
              connected: false,
              Tem_num: "无连接",
              Hum_num: "无连接",
            }),
            that.openBluetoothAdapter()
          }
        })
        wx.stopBluetoothDevicesDiscovery();
        console.log("设备已连接，停止查找");
      },
      fail: (res) => {
        console.log('fail:',res)
      }
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
   * 断开与低功耗蓝牙设备的连接
   */
  closeBLEConnection() {
    this.vibrateShort()
    if (this.data.connected == false) {
      console.log('无连接，别点了')
      return
    }
    if (this.data.system_info != "iOS") {
      wx.closeBLEConnection({
        deviceId: this.data.device_connected.deviceid
      })
      console.log('连接已断开，安卓特制')
      wx.closeBluetoothAdapter({
        complete: (res) => {
          console.log("安卓特制：关闭蓝牙模块")
        },
      })
      this.setData({
        device_connected:[],
        connected: false,
        Tem_num: "无连接",
        Hum_num: "无连接",
      })
      return
    }
    wx.closeBLEConnection({
      deviceId: this.data.device_connected.deviceid
    })
    console.log('连接已断开，人用的iOS')
    this.setData({
      device_connected:[],
      connected: false,
      Tem_num: "无连接",
      Hum_num: "无连接",
    })
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