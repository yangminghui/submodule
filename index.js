import analysis from '../utils/analysis.js'

const app = getApp()

// pages/book.js
Page({
  gData: {
    scrollTop: 0,
    sampleChapterStart: 0,
    commentStart: 0
  },
  /**
   * 页面的初始数据
   */
  data: {
    bookId: 1209977,
    roleList: [],
    commentList: [],
    sampleChapter: {},
    menuInfo: '',
    rate: null,
    bookInfo: null,
    sellPoint: "",
    wordsCount: null,
    clickCount: null,
    desc: "",
    posterTempPath: "",
    sharePictureTempPath: "",

    isIphoneX: app.globalData.isIphoneX,
    navigationBarHeight: app.globalData.navigationBarHeight,
    pageScrollable: true,
    catalogVisible: false,
    isSampleChapterShow: false,
    isPosterModelShow: false,
    fixedNavigationOpacity: 0,
    showFixedNavigation: false,
    bookCoverColor: '#1E2F42',

    fontColor: 'white'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getBookInfo()
    this._getCommentList()
    this._getSampleChapter()
    this._getRoleList()


    analysis.send({
      event_type: "impression",
      pid: 'book'
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
    console.log(this.gData.scrollTop, this.gData)
    if (this.gData.scrollTop > this.gData.commentStart) {
      console.log("send c success")
      analysis.send({
        event_type: "impression",
        pid: 'dushumini_book',
        col: 'comment'
      })
    }

    if (this.gData.scrollTop > this.gData.sampleChapterStart) {
      console.log('send p success')
      analysis.send({
        event_type: "impression",
        pid: 'dushumini_book',
        col: 'prechapter'
      })
    }
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.gData.scrollTop > this.gData.commentStart) {
      console.log("send c success")
      analysis.send({
        event_type: "impression",
        pid: 'dushumini_book',
        col: 'comment'
      })
    }

    if (this.gData.scrollTop > this.gData.sampleChapterStart) {
      console.log('send p success')
      analysis.send({
        event_type: "impression",
        pid: 'dushumini_book',
        col: 'prechapter'
      })
    }
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
  onShareAppMessage: function (res) { //TEMP
    console.log('res', res)
    if (res.from === "menu") {
      analysis.send({
        event_type: "click",
        pid: 'book',
        eid: 'sharefriend'
      })
    } else if (res.from === 'button') {
      analysis.send({
        event_type: "click",
        pid: 'book',
        eid: 'book_sharefriends'
      })
    }

    return {
      title: '斗破苍穹，电视剧同名小说抢先看！',
      imageUrl: this.data.sharePictureTempPath
    }

  },
  _getBookInfo() {
    wx.request({
      url: "https://wxapp.qidian.com/ajax/book/info",
      data: {
        bookId: this.data.bookId
      },
      success: (res) => {
        var bookData = res.data.data
        console.log("bookInfo", bookData)
        this.setData({
          bookInfo: bookData.bookInfo,
          rate: bookData.rateInfo.rate,
          sellPoint: bookData.sellingPoint || "", //TEMP
          desc: bookData.bookInfo.desc,
          menuInfo: bookData.bookInfo.updTime + '更新' + bookData.bookInfo.updChapterName,
          wordsCount: bookData.bookInfo.wordsCnt,
          clickCount: bookData.bookInfo.clickTotal
        })


        var width = 600
        var height = 504
        const GRAY = 'rgb(103,107,112)'

        var canvasContext = wx.createCanvasContext('shareCanvas')
        canvasContext.drawImage('../assets/book/share-bg.png', 0, 0, width, height)
        canvasContext.drawImage('../assets/book/cover.png', 72, 72, 180, 240)

        addText('斗破苍穹', 276, 135, 'left', '#ffffff', 42)
        addText('天蚕土豆' + '·' + '玄幻', 276, 200, 'left', '#ffffff', 30)
        var s = this.data.rate
        var x = 276;
        for (var i = 0; i < 5; i++) {
          if (s >= 2) {
            canvasContext.drawImage('../assets/book/star-bright.png', x, 240, 20, 20)
            x = x + 30
          } else {
            canvasContext.drawImage('../assets/book/star-grey.png', x, 240, 20, 20)
            x = x + 30
          }
          s = s - 2
        }

        addText(this.data.rate + '分', x, 260, 'left', '#ffffff', 25)

        var sellPoints = /^(.{0,20})(.*)$/.exec(this.data.sellPoint)
        console.log(sellPoints)
        addText(sellPoints[1], width / 2, 400, 'center', '#ffffff', 28)
        if (sellPoints[2].length) {
          addText(sellPoints[2], width / 2, 445, 'center', '#ffffff', 28)
        }

        canvasContext.draw(false, () => {
          wx.canvasToTempFilePath({
            canvasId: 'shareCanvas',
            success: (res) => {
              console.log(res.tempFilePath)
              this.setData({
                sharePictureTempPath: res.tempFilePath
              })
            },
            fail(err) {
              throw err
            }
          })
        })

        function addText(text, x, y, align, color, fontSize) {
          canvasContext.setTextAlign(align)
          canvasContext.setFillStyle(color)
          canvasContext.setFontSize(fontSize)
          canvasContext.fillText(text, x, y)
        }

      },
      fail: (err) => {
        throw err
      }
    })
  },
  _getCommentList() {
    wx.request({
      url: "https://wxapp.qidian.com/ajax/book/getBookForum",
      data: {
        bookId: this.data.bookId
      },
      success: (res) => {
        var commentData = res.data.data
        console.log("commentList", commentData)
        commentData.threadList.forEach((item) => {
          item.content = item.content.replace(/(\[fn=\d+\])/g, "")
        })
        this.setData({
          commentList: commentData.threadList || [],
        });
        var screenHeight = wx.getSystemInfoSync().screenHeight
        setTimeout(() => {
          wx.createSelectorQuery().select('#book-comments-wrap').boundingClientRect((rect1) => {
            console.log('rect1', rect1)
            if (!rect1) {
              this.gData.commentStart = 99999999
            } else {
              this.gData.commentStart = rect1.top - screenHeight
            }
          }).exec()
        }, 1000)
      },
      fail: (err) => {
        throw err
      }
    })
  },
  _getRoleList() {
    wx.request({
      url: "https://wxapp.qidian.com/ajax/book/getBookRoles",
      data: {
        bookId: this.data.bookId
      },
      success: (res) => {
        var roleData = res.data.data
        console.log("RoleList", roleData)
        var statusEnum = ['', '主角', '配角', '旁白', '男主', '女主', '男配', '女配'] //0不会用到
        var dataRoleList = roleData.roleList.map((r) => {
          return {
            nickname: r.nickname,
            portrait: r.portrait,
            status: statusEnum[r.capacity]
          }
        })
        this.setData({
          roleList: dataRoleList || []
        })
      },
      fail: (err) => {
        throw err
      }
    })

  },
  _getSampleChapter() {
    wx.request({
      url: "https://wxapp.qidian.com/ajax/chapter/getSampleChapter",
      data: {
        bookId: this.data.bookId
      },
      success: (res) => {
        var sampleData = res.data.data
        console.log("sampleChapter")
        console.log(sampleData)
        this.setData({
          sampleChapter: sampleData || {},
        });
        var screenHeight = wx.getSystemInfoSync().screenHeight
        setTimeout(() => {
          wx.createSelectorQuery().select('#book-sample-chapter').boundingClientRect((rect1) => {
            console.log('rect1', rect1)
            if (!rect1) {
              this.gData.sampleChapterStart = 99999999
            } else {
              this.gData.sampleChapterStart = rect1.top - screenHeight
            }
          }).exec()
        }, 1000)
      },
      fail: (err) => {
        throw err
      }
    })
  },
  onContainerScroll: function (e) {
    console.log(e)
    const flagStart = 300;
    const flagEnd = 310;

    var scrollTop = e.detail.scrollTop;

    if (scrollTop < flagStart) {
      if (this.data.fixedNavigationOpacity != 0) {
        this.setData({
          fixedNavigationOpacity: 0
        })
      }
    } else if (scrollTop > flagEnd) {
      if (this.data.fixedNavigationOpacity != 1) {
        this.setData({
          fixedNavigationOpacity: 1
        })
      }
    } else {
      this.setData({
        fixedNavigationOpacity: (scrollTop - flagStart) / (flagEnd - flagStart)
      })
    }

    if (scrollTop > flagStart) {
      if (!this.data.showFixedNavigation) {
        this.setData({
          showFixedNavigation: true
        })
      }
    } else {
      if (this.data.showFixedNavigation) {
        this.setData({
          showFixedNavigation: false
        })
      }
    }

    if (scrollTop > this.gData.scrollTop) {
      this.gData.scrollTop = scrollTop
    }

  },
  /**
   *  用户点击角色头像
   */
  onRoleAvatarTap() {
    wx.showModal({
      content: '下载 起点读书App 可看到他的详细信息还可以为ta比心哟',
      showCancel: false,
      confirmText: '我知道了'

    })
    analysis.send({
      event_type: "click",
      pid: 'book',
      eid: 'book_roleportrait'
    })
  },
  /**
   *  用户展开章节试读
   */
  onShowMoreButtonTap() {
    this.setData({
      isSampleChapterShow: !this.data.isSampleChapterShow
    })
    if (!this.data.isSampleChapterShow) {
      analysis.send({
        event_type: "click",
        eid: 'book_previewunfold',
        pid: 'book'
      })
    }
  },
  /**
   *  用户点击继续阅读
   */
  onSampleGoReadButtonTap() {
    wx.navigateTo({
      url: `read?bookId=${this.data.bookId}&chapterId=${this.data.sampleChapter.nextChapterId || 0}`,
    });
    analysis.send({
      event_type: "click",
      eid: 'book_previewcontinue',
      pid: 'book'
    })
  },
  /**
   *  用户点击生成海报
   */
  onCreatePosterButtonTap() {
    if (!this.data.posterTempPath.length) {
      console.log(111)
      wx.showLoading({
        title: "生成中",
        mask: true
      })
      var width = 300
      var wordSize = 12
      var height = 386
      const GRAY = 'rgb(103,107,112)'

      var canvasContext = wx.createCanvasContext('posterCanvas')

      canvasContext.drawImage('../assets/book/card-none.png', 0, 0, width, height)
      canvasContext.drawImage('../assets/book/cover.png', 102, 65, 96, 129)
      addText('斗破苍穹', width / 2, 224, 'center', 'rgb(64,63,76)', wordSize + 6)
      addText('天蚕土豆' + ' · ' + '玄幻', width / 2, 247, 'center', GRAY, wordSize)
      // addText("吴磊、林允主演电视剧《斗破苍穹》", width / 2, 275, 'center', '#747982', wordSize)
      var sellPoints = /^(.{0,20})(.*)$/.exec(this.data.sellPoint)
      console.log(sellPoints)
      addText(sellPoints[1], width / 2, 275, 'center', '#747982', wordSize)
      if (sellPoints[2].length) {
        addText(sellPoints[2], width / 2, 295, 'center', '#747982', wordSize)
      }

      canvasContext.drawImage('../assets/book/wxacode.jpg', 65, height - 79, 50, 50)

      canvasContext.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'posterCanvas',
          success: (res) => {
            console.log(res.tempFilePath)
            this.setData({
              posterTempPath: res.tempFilePath
            })
          },
          fail(err) {
            throw err
          }
        })
      })

      wx.hideLoading()
      this.setData({
        isPosterModelShow: true
      })

      function addText(text, x, y, align, color, fontSize) {
        canvasContext.setTextAlign(align)
        canvasContext.setFillStyle(color)
        canvasContext.setFontSize(fontSize)
        canvasContext.fillText(text, x, y)
      }
    } else {
      console.log(222)
      this.setData({
        isPosterModelShow: true
      })
    }

    analysis.send({
      event_type: "click",
      pid: 'book',
      eid: 'book_sharepicture'
    })
  },
  onSavePosterButtonTap() {

    wx.getSetting({
      success: (res) => {
        var self = this;

        console.log(res)
        if (res.authSetting['scope.writePhotosAlbum']) {
          process()
        } else {

          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              process()
            },
            fail() {
              wx.showToast({
                title: '图片保存失败，请重试。',
                icon: 'none'
              });
            }
          })
        }

        function process() {
          wx.showLoading({
            title: "正在保存图片...",
            mask: true
          })
          wx.saveImageToPhotosAlbum({
            filePath: self.data.posterTempPath,
            success: (res) => {
              wx.hideLoading();
              wx.showToast({
                title: '保存成功',
                icon: 'success'
              })
              self.setData({
                isPosterModelShow: false,
              });
            },
            fail: () => {
              wx.showToast({
                title: '图片保存失败，请重试。',
                icon: 'none'
              });
              self.setData({
                isPosterModelShow: false,
              });
            }
          })

          analysis.send({
            event_type: "click",
            pid: 'book',
            eid: 'book_savepicture'
          })
        }

      }
    })


  },
  onPreviewPosterTap() {
    wx.canvasToTempFilePath({
      canvasId: 'posterCanvas',
      success: (res) => {
        wx.previewImage({
          urls: [res.tempFilePath]
        })
      }
    })

  },
  onHidePosterButtonTap() {
    this.setData({
      isPosterModelShow: false,
    });
  },
  /**
   *  用户点击更多好书
   */
  onMoreBookButtonTap() {
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
    analysis.send({
      event_type: "click",
      eid: 'book_qidiandushu',
      pid: 'book'
    })
  },
  onCatalogButtonTap() {
    this.setData({
      catalogVisible: true,
      pageScrollable: false
    })
    analysis.send({
      event_type: "click",
      eid: 'book_catalog',
      pid: 'book'
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
    console.log(e.detail.id)
    wx.navigateTo({
      url: `read?bookId=${this.data.bookId}&chapterId=${e.detail.id}`,
    });
    analysis.send({
      event_type: "click",
      eid: 'book_catalogchapter',
      pid: 'book',
      cid: this.data.chapterId
    })
  },
  /**
   *  用户点击开始阅读
   */
  onGoReadButtonTap() {
    var rc
    try {
      rc = wx.getStorageSync('recordedChapter')
    } catch (err) {
      throw new Error('章节缓存失败' + err)
    }
    if (rc) {
      wx.navigateTo({
        url: `read?bookId=${this.data.bookId}&chapterId=${rc}`,
      });
    } else {
      wx.navigateTo({
        url: `read?bookId=${this.data.bookId}&chapterId=${this.data.sampleChapter.chapterId}`,
      });
    }
    analysis.send({
      event_type: "click",
      eid: 'book_readnow',
      pid: 'book'
    })
  }
})