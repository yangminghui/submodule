import analysis from '../utils/analysis.js'
// pages/read.js
const app = getApp()

const SLIDER_LEN = 250;
var standard = 0;

Page({
  gData: {
    readPageHeight: 0,
    catalogue: {},
    chapterIds: [], //索引
    chapterNames: [], //索引
    ids: [], //全书
    names: [], //全书
  },
  /**
   * 页面的初始数据
   */
  data: {
    isFirstPage: false,
    navigationBarHeight: 0,

    bookId: 0,
    chapterId: null,
    isNight: false,
    isFirstChapter: false,
    isLastChapter: false,
    isToolBoxShow: false,
    isVip:false,
    toolBoxMode:'index',
    isIphoneX: app.globalData.isIphoneX,
    isIOS:app.globalData.isIOS,
    isLoading:false,

    currentChapter: {},
    chapterTalk: {},
    readPercent: 0,
    selectedChapterName: '',
    selectedChapterIndex: 0,
    totalIndex: 0,
    fontSizeMax: 19,
    fontSizeMin: 12,
    fontSize: 16,
    startPoint: 'read-main'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      bookId: Number(options.bookId),
      chapterId: Number(options.chapterId)
    })
    try {
      var fs = wx.getStorageSync('fontSize') || 16

      this.setData({
        fontSize: fs
      })
      
      var isn = !!wx.getStorageSync('isNight')
      this.setData({
        isNight:isn
      })
      wx.setNavigationBarColor({
        frontColor: isn ? '#ffffff' : '#000000',
        backgroundColor: isn ? '#000000' : '#ffffff'
      })

      var navigationBarHeight = app.globalData.navigationBarHeight;
      this.setData({
        isFirstPage: getCurrentPages().length == 1,
        navigationBarHeight: navigationBarHeight
      })
    } catch (err) {
      throw new Error('读取字体或主题缓存失败' + err)
    }
    this._loadChapter(this.data.chapterId)
    this._getCatalogue()

    try {
      wx.setStorageSync('recordedChapter', this.data.chapterId)
    } catch (err) {
      throw new Error("缓存章节大小失败" + err)
    }

    analysis.send({
      event_type: "impression",
      pid:'read'
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
    analysis.send({
      event_type: "click",
      pid:'read',
      eid:'sharefriend'
    })
     return {
      title:'斗破苍穹，电视剧同名小说抢先看！',
      imageUrl:'https://qidian.qpic.cn/qidian_common/349573/ff482838369209b20cab50d606679c8b/0'
    }
  },
  _getCatalogue() {
    wx.request({
      url: "https://wxapp.qidian.com/ajax/book/category",
      data: {
        bookId: this.data.bookId
      },
      success: (res) => {
        var catalogueData = res.data.data
        // console.log(res)
        Object.assign(this.gData.catalogue, catalogueData)

        catalogueData.vs.forEach((volume) => {
          volume.cs.forEach((chapter) => {
            this.gData.ids.push(chapter.id)
            this.gData.names.push(chapter.cN)
          });
        });
        // console.log(this.gData.ids)
        // console.log(this.gData.names)
        if (this.gData.ids.length > SLIDER_LEN) {
          standard = (this.gData.ids.length - 1) / (SLIDER_LEN - 1) //最后一个元素位置是len-1，将除了最后一个元素分组，分成249组
          // console.log(standard)
          for (var i = 0; i < SLIDER_LEN; i++) { //取250个数把最后一个取为一组
            var index = Math.ceil(i * standard)
            //console.log(index)
            if (index <= this.gData.ids.length) {
              this.gData.chapterIds.push(this.gData.ids[index])
              this.gData.chapterNames.push(this.gData.names[index])
            }
          }
        } else {
          this.gData.chapterIds = this.gData.ids
          this.gData.chapterNames = this.gData.names
        }
        this.setData({
          totalIndex: this.gData.chapterIds.length - 1
        })
        this._updateIndex(this.data.chapterId)
        this.setData({
          startPoint: this.data.startPoint,
        })
      },
      fail: (err) => {
        throw err
      }
    })
  },
  _loadChapter(chapterId) { //切换chapter，改变索引，当前的id，选择的名字，内容会和本章说
    this.setData({
      chapterId: chapterId,
      isLoading:true
    })
    this._getChapter()
  },
  _getReadRect() {
    wx.createSelectorQuery().select('#read-container').boundingClientRect((rect) => {
      this.gData.readPageHeight = rect.height;
      console.log(rect)
    }).exec();
  },
  _getChapter() {
    wx.request({
      url: "https://wxapp.qidian.com/ajax/chapter/getChapterInfo",
      data: {
        bookId: this.data.bookId,
        chapterId: this.data.chapterId
      },
      success: (res) => {
        console.log('read_chapterInfo',res)
        var chapterData = res.data.data.chapterInfo
        this.setData({
          book: res.data.data.bookInfo,
          currentChapter: chapterData,
          isVip:chapterData.vipStatus,
          isFirstChapter: chapterData.prev < 0 ? true : false,
          isLastChapter: chapterData.next < 0 ? true : false,
        })

        wx.request({
          url: "https://wxapp.qidian.com/ajax/chapter/getChapterTalk",
          data: {
            pageSize: 2,
            chapterId: this.data.chapterId,
            bookId: this.data.bookId
          },
          success: (res) => {
            console.log(res)
            var chapterTalkData = res.data.data
            chapterTalkData.list.forEach((item) => {
              item.content = item.content.replace(/(\[fn=\d+\])/g, "")
            })
            this.setData({
              chapterTalk: chapterTalkData,
              startPoint: this.data.startPoint,
              isLoading:false
            })

            this._getReadRect()
          },
          fail: (err) => {
            throw new Error('本章说加载错误:' + err)
          }
        })

      },
      fail: (err) => {
        throw err
      }
    })
  },
  _updateIndex(chapterId) {
    //update Index
    var currentIndex = this.gData.ids.indexOf(chapterId)
    console.log(currentIndex)
    this.gData.chapterIds[Math.ceil(currentIndex / standard)] = chapterId
    this.gData.chapterNames[Math.ceil(currentIndex / standard)] = this.gData.names[currentIndex]

    this.setData({
      selectedChapterIndex: Math.ceil(currentIndex / standard),
      selectedChapterName: this.gData.chapterNames[Math.ceil(currentIndex / standard)]
    })
  },
  onGoPrevButtonTap() {
    this._gotoChapter(this.data.currentChapter.prev)
  },
  onGoNextButtonTap() {
    this._gotoChapter(this.data.currentChapter.next)
  },
  onCatalogButtonTap() {
    this.setData({
      catalogVisible: true,
      pageScrollable: false,
      isToolBoxShow:false
    })
    analysis.send({
      event_type: "click",
      eid:'read_catalog',
      pid:'read',
      cid:this.data.chapterId
    })
  },
  onCatalogHide() {
    this.setData({
      catalogVisible: false,
      pageScrollable: true
    })
  },
  onCatalogSelect(e) {
    this.setData({
      catalogVisible: false
    })

    this._gotoChapter(e.detail.id)
    console.log(e.detail.id)
  },
  onGoChapterTalkButtonTap() { 
    wx.navigateTo({
      url: `chapterTalk?bookId=${this.data.bookId}&chapterId=${this.data.chapterId}`,
    });
    analysis.send({
      event_type: "click",
      eid:'read_chaptercomment',
      pid:'read',
      cid:this.data.chapterId
    })
  },
  onScroll(e) {
   // console.log(e.detail)
   console.log('111',e) 
   console.log(arguments)
    const newReadPercent = (e.detail.scrollTop) / (e.detail.scrollHeight - this.gData.readPageHeight) * 100;
    this.setData({
      readPercent: (newReadPercent > 99) ? 100 : newReadPercent,
    });
  },
  onToolBoxMaskTouchStart() {
    console.log("hide")
    this.setData({
      isToolBoxShow: false
    })
  },
  onToolBoxMaskTap() {
    console.log("hide")
    this.setData({
      isToolBoxShow: false
    })
  },
  onReadContainerTap() {
    console.log("show")
    this.setData({
      isToolBoxShow: true,
      toolBoxMode: 'index'
    })
    analysis.send({
      event_type: "click",
      eid:'read_toolbar',
      pid:'read'
    })
  },
  onFontSettingButtonTap() {
    this.setData({
      toolBoxMode: 'fontSetting'
    })
    analysis.send({
      event_type: "click",
      pid:'read_settings',
    })
  },
  onSwitchThemeButtonTap() {
    this.setData({
      isNight: !this.data.isNight
    })
    try {
      wx.setStorageSync('isNight', this.data.isNight)
    } catch (err) {
      throw new Error("缓存主题失败" + err)
    }
    wx.setNavigationBarColor({
      frontColor: this.data.isNight ? '#ffffff' : '#000000',
      backgroundColor: this.data.isNight ? '#000000' : '#ffffff'
    });
    analysis.send({
      event_type: "click",
      eid:'read_night',
      pid:'read',
    })
  },
  onFontSliderChange(e) {
    console.log(e.detail.value)
    this.setData({
      fontSize: e.detail.value
    })
    try {
      wx.setStorageSync('fontSize', this.data.fontSize)
    } catch (err) {
      throw new Error("缓存字体大小失败" + err)
    }
  },
  onMinusFontButtonTap() {
    console.log(this.data.fontSize)
    this.setData({
      fontSize: this.data.fontSize - 1
    })
    try {
      wx.setStorageSync('fontSize', this.data.fontSize)
    } catch (err) {
      throw new Error("缓存字体大小失败" + err)
    }
  },
  onPlusFontButtonTap() {
    console.log(this.data.fontSize)
    this.setData({
      fontSize: this.data.fontSize + 1
    })
    try {
      wx.setStorageSync('fontSize', this.data.fontSize)
    } catch (err) {
      throw new Error("缓存字体大小失败" + err)
    }
  },
  _gotoChapter(chapterId) {
    this._updateIndex(chapterId)
    this._loadChapter(chapterId)
    try {
      wx.setStorageSync('recordedChapter', chapterId)
    } catch (err) {
      throw new Error("缓存章节大小失败" + err)
    }
  },
  onChapterSliderChange(e) {
    var chapterId = this.gData.chapterIds[e.detail.value]
    this._gotoChapter(chapterId)
  },
  onChapterSliderChanging(e) {
    console.log(this.data.selectedChapterIndex)
    this.setData({
      selectedChapterName: this.gData.chapterNames[e.detail.value]
    })
  },
  onTipsBottomAreaTap() {
     wx.navigateToMiniProgram({
      appId: 'wx7a9a45a2ec94a1be',
      success(res) {
        // 打开成功
      },
      fail(e) {
        wx.showModal({
          content: e,
        })
      }
    })
  },
  onTipsTopMiniproAreaTap(){
    console.log('pages/read?bookId=' + this.data.bookId + '&chapterId=' + this.data.chapterId)
    wx.navigateToMiniProgram({
      appId: 'wx7a9a45a2ec94a1be',
      path: 'pages/read?bookId='+this.data.bookId+'&chapterId='+this.data.chapterId,
      success(res) {
        // 打开成功
      },
      fail(e) {
        wx.showModal({
          
          content: e,
        })
      }
    })
  }
})