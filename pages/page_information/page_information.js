// pages/page_information/page_information.js

let util = require('../../utils/util.js')

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
    objectduration_array: [{id: 0x00, name: '1秒', duration: 1},
                           {id: 0x01, name: '5秒', duration: 5},
                           {id: 0x02, name: '10秒', duration: 10},
                           {id: 0x03, name: '20秒', duration: 20},
                           {id: 0x04, name: '30秒', duration: 30},
                           {id: 0x05, name: '60秒', duration: 60}],
              
    version_number: ' v0.2.1',//版本号
    showView: false,//developer显示状态

    Tem_num: "未获取",
    Hum_num: "未获取",
    Volt_num: "未获取",
    device_connected: [],
    serviceId: [],
    Write_characteristicId: [],//写入指令
    Notify_characteristicId: [],//Notify特征值
    setdata_time: '尚未获取',
    getdata_time: '尚未获取',
    getvolt_time: '尚未获取',

    setdata_btn_disabled: false,
    wait_time: 0,
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
    console.log("打开页面：'信息获取'")
    this.getDeviceData()
    this.getBLEDeviceServices()
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
    this.setData({
      Tem_num: "未获取",
      Hum_num: "未获取",
      Volt_num: "未获取",
      device_connected: [],
      serviceId: [],
      Write_characteristicId: [],//写入指令
      Notify_characteristicId: [],//Notify特征值
      setdata_time: [],
      getdata_time: [],
      getvolt_time: [],
    })

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
    console.log("读取已连接设备：",prevPage.data.device_connected)
    this.setData({
      device_connected: prevPage.data.device_connected
    })
    //监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
    wx.onBLEConnectionStateChange((res) => {
      let that = this
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
          Tem_num: "未获取",
          Hum_num: "未获取",
          Volt_num: "未获取",
          device_connected: [],
          serviceId: [],
          Write_characteristicId: [],//写入指令
          Notify_characteristicId: [],//Notify特征值
          setdata_time: [],
          getdata_time: [],
          getvolt_time: [],
        })
        let pages = getCurrentPages()
        let prevPage = pages[pages.length - 2]
        prevPage.setData({
          devices:[],
          device_connected:[],
          connected: false,
        })
        prevPage.openBluetoothAdapter()
      }
    })
  },


  precisionPickerChange: function (e) {
    console.log('precisionPicker发送选择改变，序列值为', e.detail.value)
    this.setData({
      precision_index: e.detail.value
    })
    console.log("写入精度命令",this.data.objectprecision_array[this.data.precision_index].name)
  },

  frequencyPickerChange: function (e) {
    console.log('frequencyPicker发送选择改变，序列值为', e.detail.value)
    this.setData({
      frequency_index: e.detail.value
    })
    console.log("写入频率命令",this.data.objectfrequency_array[this.data.frequency_index].name)
  },

  durationPickerChange: function (e) {
    console.log('durationPicker发送选择改变，序列值为', e.detail.value)
    this.setData({
      duration_index: e.detail.value
    })
    console.log('写入时长命令',this.data.objectduration_array[this.data.duration_index].name)
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

  /**
   * 获取蓝牙设备所有服务(service)
   * @param {*} deviceId 
   */
  getBLEDeviceServices(){
    let deviceId = this.data.device_connected.deviceid
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        console.log("services:",res.services)//serviceID  蓝牙服务的uuid  
        console.log('advertisServiceUUIDs:',this.data.device_connected.advertisserviceuuids[0])
        //查找主服务uuid并确认连接
        let uuid_index = res.services.findIndex(a => a.uuid == this.data.device_connected.advertisserviceuuids[0])
        if (uuid_index != -1){
          console.log("已找到主服务uuid，确认连接")
          this.setData({
            serviceId: res.services[uuid_index].uuid
          })
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
        //获取可写入指令特征值
        let  Write_characteristic_index = res.characteristics.findIndex(a => a.properties.write == true && a.properties.read == true)
        this.setData({
          Write_characteristicId: res.characteristics[Write_characteristic_index].uuid
        })
        console.log('可写入特征值：',res.characteristics[Write_characteristic_index].uuid)
        //启用低功耗蓝牙设备特征值变化时的 notify 功能，订阅特征值
        let Notify_characteristic_index = res.characteristics.findIndex(a => a.properties.notify || a.properties.indicate == true)
        this.setData({
          Notify_characteristicId: res.characteristics[Notify_characteristic_index].uuid
        })

        wx.notifyBLECharacteristicValueChange({
          deviceId,
          serviceId,
          characteristicId: res.characteristics[Notify_characteristic_index].uuid,
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
      //采用uint8是因为尽管是16位数据，但是蓝牙传递队列已经把数据转化成8位了，这个是蓝牙本身的库函数决定的。
      let r_data = new Uint8Array(res.value)//received_data接收的数据
      console.log(`Notify特征值${res.characteristicId} 已改变：`,r_data[0],r_data[1],r_data[2],r_data[3])

      if (r_data[2] == 0x00 && r_data[3] == 0x00){
        let Volt = (r_data[1]+(r_data[0]/255)).toFixed(2)
        this.setData({
          Volt_num: `${Volt}V`,
        })
      }
      
      if (r_data[2] != 0x00 && r_data[3] != 0x00){
        let Tem = ((r_data[3]*256+r_data[2]) * 175 / (Math.pow(2,16)-1) - 45).toFixed(2)
        let Hum = ((r_data[1]*256+r_data[0]) * 100 / (Math.pow(2,16)-1)).toFixed(2)
        this.setData({
          Tem_num: `${Tem}℃`,
          Hum_num: `${Hum}%`,
      })
      }
    })
  },


  /**
   * 写入特征值，以进行数据获取
   */
  setBLEDeviceCharacteristicsValue: function(event) {
    this.vibrateShort()
    let eventId = event.target.id
    let buffer = new ArrayBuffer(4)
    let dataView = new DataView(buffer)

    if (eventId == "getvolt"){//获取设备当前电压
      let time = util.formatHMdata(new Date());
      this.setData({
        getvolt_time: time
      })
      dataView.setUint8(0,0xff)
      dataView.setUint8(1,0)
      dataView.setUint8(2,0)
      dataView.setUint8(3,0)

      wx.writeBLECharacteristicValue({
        deviceId: this.data.device_connected.deviceid,
        serviceId: this.data.serviceId,
        characteristicId:this.data.Write_characteristicId,
        value:buffer,
        success:(res) => {
          console.log("写入：",buffer)
        },
        fail:(res)=>{
          console.log(res)
        }
      })
    }
    if (eventId == "getdata"){//获取当前温湿度值
      let time = util.formatHMdata(new Date());
      this.setData({
        getdata_time: time
      })
      dataView.setUint8(0,0xff)
      dataView.setUint8(1,0xff)
      dataView.setUint8(2,0)
      dataView.setUint8(3,0)

      wx.writeBLECharacteristicValue({
        deviceId: this.data.device_connected.deviceid,
        serviceId: this.data.serviceId,
        characteristicId:this.data.Write_characteristicId,
        value:buffer,
        success:(res) => {
          console.log("写入：",buffer)
        },
        fail:(res)=>{
          console.log(res)
        }
    })
    }
    if (eventId == "setdata"){//确认参数开始测试
      let time = util.formatHMdata(new Date());
      this.setData({
        setdata_time: time,
        Tem_num: "获取中",
        Hum_num: "获取中",
        setdata_btn_disabled: true,
        wait_time: this.data.objectduration_array[this.data.duration_index].duration,
      })

      //简单的倒计时显示还有多久能够获取数据
      // console.log("wait_time:",this.data.wait_time)
      let seconds = this.data.objectduration_array[this.data.duration_index].duration
      // console.log('测试时长：',this.data.objectduration_array[this.data.duration_index].duration)
      let setdata_intercal = setInterval(() => {
        seconds--
        if (seconds <= 0){
          this.setData({
            setdata_btn_disabled: false,
          })
          clearInterval(setdata_intercal)
        } else {
          this.setData({
            wait_time: seconds,
          })
          // console.log("wait_time:",that.data.wait_time)
        }
      }, 1000);
      

      dataView.setUint8(0,this.data.objectduration_array[this.data.duration_index].id)
      dataView.setUint8(1,this.data.objectfrequency_array[this.data.frequency_index].id)
      dataView.setUint8(2,this.data.objectprecision_array[this.data.precision_index].id)
      dataView.setUint8(3,0x01)

      wx.writeBLECharacteristicValue({
        deviceId: this.data.device_connected.deviceid,
        serviceId: this.data.serviceId,
        characteristicId:this.data.Write_characteristicId,
        value:buffer,
        success:(res) => {
          console.log("写入：",buffer)
        },
        fail:(res)=>{
          console.log(res)
        }
    })
    }

  },

})