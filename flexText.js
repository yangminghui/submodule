// components/flexText.js
import analysis from '../utils/analysis.js'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    applyFilter: {
      type: Boolean,
      value: false
    },
    cstyle: {
      type: String,
      value: ''
    },
    text: {
      type: String,
      value: '',
      observer: function (newVal, oldVal) {
        if (this.data.applyFilter) {//html文本格式
          if (this.data.text.length > this.data.limit) {
            this.setData({
              overLengthFlag: true,
              shortText: this.data.text.replace(/(<br|<p)\s*(\/)?>|\r/g, '\n').replace(/^\n+|\n+$/g, '').replace(/(\n|\s)*/g, '').substr(0, this.data.limit) + "...",
              noFilterText: this.data.text
            })
          } else {
            this.setData({
              shortText: this.data.text.replace(/(<br|<p)\s*(\/)?>|\r/g, '\n').replace(/^\n+|\n+$/g, '').replace(/(\n|\s)*/g, ''),
              noFilterText: this.data.text.replace(/(<br|<p)\s*(\/)?>|\r/g, '\n').replace(/^\n+|\n+$/g, '').replace(/(\n|\s)*/g, '')
            })
          }
        } else {//text文本格式
          if (this.data.text.length > this.data.limit) {
            this.setData({
              overLengthFlag: true,
              shortText: this.data.text.replace(/(\n|\s)*/g, '').substr(0, this.data.limit) + "...",
              noFilterText: this.data.text
            })
          } else {
            this.setData({
              shortText: this.data.text,
              noFilterText: this.data.text
            })
          }
        }
      }
    },
    limit:{
      type:String,
      value:52
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
    overLengthFlag: false,
    shortText: "",//隐藏时均为过滤后取
    noFilterText: "",//原文本
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toggle() {
      if(this.data.applyFilter && !this.data.isShow){
        analysis.send({
          event_type: "click",
          eID:'book_introunfold',
          pid:'book'
        })
      }
      this.setData({
        isShow: !this.data.isShow
      })
    }
  }
})
