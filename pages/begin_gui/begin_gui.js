//index.js
//获取应用实例
const app = getApp()

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
  data: {
    devices:[],
    connected:false,
    chs:[],
    numT:0,
    numH:0,
  },
  //打开蓝牙适配器
  openBluetoothAdapter (){
    wx.openBluetoothAdapter({
     success:(res)=>{

       console.log("openBluetoothAdapter",res)
      this.startBluetoothDevicesDiscovery()
      //这个this 指向什么？app?
      
     },
     fail: (res) => {
       if (res.errCode === 10001) {//当前蓝牙适配器不可用
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

  getBluetoothAdapterState(){
   wx.getBluetoothAdapterState({
    success: function(res) {
      comsole.log("getBluetoothAdapterState",res)
       if(res.discovering){
         this.onBluetoothDeviceFound()
        } else if(res.available){
         this.startBluetoothDevicesDiscovery()
        }
      }
    })
  },

  startBluetoothDevicesDiscovery(){
    if(this._discoveryStarted){
      //1.this的四种用法2. _的用法 3.discivertStarted 这个参数哪里来的？API并未提及这个
      return
    }
    this._discoveryStarted=true
    wx.startBluetoothDevicesDiscovery({
      
      success: (res)=> {
        console.log("startBluetoothDevicesDiscovery",res)
        this.onBluetoothDeviceFound()
      }
    })
  },

  stopBluetoothDevicesDiscovery() {
    console.log("stopBluetoothDevicesDiscovery")
     wx.stopBluetoothDevicesDiscovery() 
  },

  onBluetoothDeviceFound() {
    //安卓部分机型需要打开位置权限才能搜索到设备
    wx.onBluetoothDeviceFound((res) => {
      console.log("onBluetoothDeviceFound")
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        //判定值等于值 device.deviceId是从哪里传递过来的的？
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
          //一开始什么设备也没发现的 时候，device被赋值给data.devices[0],依然不是很懂为什么要用`$`我好想被这个东西给误导了。还是说不能嵌套[[]]这种？我在这边做个标记，后面再来调试，不是[[]]应该是 [][].
        } 
        else {
           data[`devices[${idx}]`] = device
          }
        this.setData(data)
        //setData用于将数据发送到视图层，同时改变对于的this.data的值
        //就是改变开头定义的data的数值 29~33
      })
    })
  },
  
  createBLEConnection(e) {
    const ds = e.currentTarget.dataset//currentTarget和target事件，currentTarget代表的是手指触摸到选项，进行连接
    const deviceId = ds.deviceId
    const name = ds.name
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        console.log("createBLEConnection success")
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
  
  closeBLEConnection() {
    const self=this
    wx.closeBLEConnection({
      deviceId: self.data.deviceId
    })
    self.setData({
      connected: false,
      chs: [],
      canWrite: false,
    })
  },
  getBLEDeviceServices(deviceId){
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        console.log("services",res.services)
        for(let i=0;i<res.services.length;i++){
          if (res.services[i].uuid === "0000180A-0000-1000-8000-00805F9B34FB"){
            //是主服务是什么概念？ 四个services的isPrimary判定都为真，程序一开始选择的是第一个，借由蓝牙调试软件得出服务的serviceId0000FFF0-0000-1000-8000-00805F9B34FB
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
       console.log('getBLEDeviceCharacteristics success', res.characteristics)
       for(let i=0;i<res.characteristics.length;i++){
         let item=res.characteristics[i]

         /*if(item.properties.read){
           console.log('canRead')
           this._deviceId = deviceId
           this._serviceId = serviceId
           this._characteristicId = item.uuid
                 
          }
         if (item.properties.write){
           console.log('canWrite')
           this.setData({
             canWrite:true
           })
           this._deviceId = deviceId
           this._serviceId = serviceId
           this._characteristicId=item.uuid
           
          }*/
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
       console.error('tezhengzhi huoqu shibai',res)
      }
    }),
  
    //操作之前先监听，保证第一时间获取数据
    //获得所有服务的所有值
     /* wx.onBLECharacteristicValueChange((characteristic)=>{
       const idx = inArray(this.data.chs, 'uuid',characteristic.characteristicId)
       const data={}
       if(idx === -1){
        data[`chs[${this.data.chs.length}]`] = {
         uuid:characteristic.characteristicId,
         value:ab2hex(characteristic.value)
        }
       }
       else {
        data[`chs[${idx}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
        console.log(characteristic.value)
       }  
       this.setData(data)
     
    })*/
    
    wx.onBLECharacteristicValueChange( (res) => {
    
     console.log(`characteristic ${res.characteristicId} has changed, `)
       
     console.log(ab2hex(res.value))
          
     //console.log("wendu", ab2hex(res.value).slice(0, 4))   slice取值 是索引[0,4)
     var a = parseInt( (ab2hex(res.value).slice(0, 4)),16)
     //console.log(a)
     var T = (a * 175 / (65535) - 45).toFixed(2)
     console.log("Temperature",T)
     this.setData({
       numT: T
     })
    
     
     var b = parseInt((ab2hex(res.value).slice(4, 8)), 16)
     console.log(b)
     var H = (b * 100 / (65535)).toFixed(2)
     console.log("Humidity", H)
     this.setData({
       numH: H
     })


    })
    
  },

  closeBluetoothAdapter(){
    wx.closeBluetoothAdapter()
    this._discoveryStarted=false
  } 
  
})
