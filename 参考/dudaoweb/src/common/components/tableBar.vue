<style scope>
  .btn-all .el-button{
    border-radius: 50%!important;
    padding: 8px!important;
    background: #F2F3F5!important;
    font-size: 15px!important;
    border: none!important;
  }
  .btn-all .el-button:hover{
    background:#F2F3F5!important;
    color: #3C7AFF!important;
  }
</style>

<template>
<div class="btn-all">
    <el-tooltip v-if="type.includes('copy')" popper-class="tipe" effect="light" content="复制" placement="top">
      <el-button  size="small" plain icon="el-icon-document" @click="copy"></el-button>
   </el-tooltip>
   <el-tooltip v-if="type.includes('export')" popper-class="tipe" effect="light" content="导出" placement="top">
  <el-button size="small" plain icon="el-icon-upload2" @click="port"></el-button>
   </el-tooltip>
    <el-tooltip v-if="type.includes('refresh')" popper-class="tipe" effect="light" content="刷新" placement="top">
  <el-button  size="small" plain icon="el-icon-refresh" @click="refresh"></el-button>
  </el-tooltip>
  <el-tooltip v-if="type.includes('printer')"  popper-class="tipe" effect="light" content="打印" placement="top">
  <el-button size="small" plain icon="el-icon-printer" @click="printer"></el-button>
  </el-tooltip>
  <el-tooltip style="margin-left:10px;" v-if="scrColumn1||(scrColumn&&scrColumn.length)" popper-class="tipe" effect="light" content="列筛选" placement="top">
    <el-dropdown :hide-on-click="false">
      <el-button size="small" plain icon="el-icon-sort"></el-button>
      <el-dropdown-menu slot="dropdown" class="ins-s-ofy-a ins-s-ofx-h" style="max-height:400px;">
        <el-dropdown-item v-if="scrColumn.length" v-for="(o,i) in scrColumn" :key="i"> <el-checkbox v-model="o.selected" :disabled="o.field==currDisabledField">{{o.text}}</el-checkbox></el-dropdown-item>
        <el-dropdown-item v-if="scrColumn1" v-for="(o,i) in scrColumn1" :key="i"> <el-checkbox v-model="o.selected" :disabled="o.field==currDisabledField">{{o.text}}</el-checkbox></el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </el-tooltip>
</div>
</template>
<script>
const getExplorer = function () {
  var explorer = window.navigator.userAgent
  if (explorer.indexOf('MSIE') >= 0) {
    // ie
    return 'ie'
  } else if (explorer.indexOf('Firefox') >= 0) {
    // firefox
    return 'Firefox'
  } else if (explorer.indexOf('Chrome') >= 0) {
    // Chrome
    return 'Chrome'
  } else if (explorer.indexOf('Opera') >= 0) {
    // Opera
    return 'Opera'
  } else if (explorer.indexOf('Safari') >= 0) {
    // Safari
    return 'Safari'
  }
}
const css =
  '.table-bordered,table {border: 1px solid #000;}.table,table {width: 100%;max-width: 100%;margin-bottom: 20px;}.table,table {border-spacing: 0;border-collapse: collapse;}.table td,table td{border: 1px solid #000;vertical-align: middle;text-align:center;font-size:15px;height:30px;}.table th,table th{padding:6px; vertical-align: top; border: 1px solid #000;text-align:center;  font-weight:bold;  font-size:13px;}.table div{  text-align:center; } .table .w_35{width:35px; }.table .w_100{width:100px; }.editdiv{ width: 100%;  border: 0;  height: 30px;   font-size: 15px;  font-weight: normal;  text-align: center;  line-height:30px; }.ng-table-filters{display:none;};input{width: 100%;border: 0;height:30px;line-height:30px;font-size: 15px;font-weight: normal;text-align: center;}'
export default {
  data () {
    return {
      currDisabledField: '' // 已勾选的列
    }
  },
  props: {
    type: {
      type: String,
      default: '',
      required: true
    },
    tableId: {
      type: String,
      default: '',
      required: true
    },
    printOb: {
      type: Object,
      default: function (value) {
        return value || {}
      }
    },
    scrColumn: { // 待修改
      type: Array,
      default: function (value) {
        return value || []
      }
    },
    scrColumn1: {
      type: Object,
      default: function (value) {
        return value
      }
    }
  },
  methods: {
    copy () {
      var div = document.querySelector('#' + this.tableId)
      var table = div.querySelectorAll('table')
      var html = document.createElement('table')
      if (table.length > 0 && table.length === 2) {
        if (!document.querySelector('#bstableCopy')) {
          var element = document.createElement('textarea')
          // "<textarea id='bstableCopy' cols='20' rows='10' style='opacity: 0;position: fixed;'>复制内容</textarea>"
          element.id = 'bstableCopy'
          element.cols = '20'
          element.rows = '10'
          element.style.opacity = 0
          element.style.position = 'fixed'
          document.querySelector('body').appendChild(element)
        }
        html.innerHTML = table[0].querySelector('thead').outerHTML
        html.innerHTML += table[1].querySelector('tbody').outerHTML
      }
      document.querySelector('#bstableCopy').innerHTML = html.outerHTML
      document.querySelector('#bstableCopy').select() // 选择对象
      document.execCommand('Copy')
      this.$message({
        type: 'success',
        message: '复制成功,请粘贴到Excel表格中!'
      })
    },
    port () {
      var idTmr
      const Cleanup = function () {
        window.clearInterval(idTmr)
        window.CollectGarbage()
      }
      let tableToExcel = (function () {
        let uri = 'data:application/vnd.ms-excel;base64,'
        let template =
          '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
        let base64 = function (s) {
          return window.btoa(unescape(encodeURIComponent(s)))
        }
        let format = function (s, c) {
          return s.replace(/{(\w+)}/g, function (m, p) {
            return c[p]
          })
        }
        return function (table, name) {
          if (!table.nodeType) table = document.getElementById(table)
          var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML }
          window.location.href = uri + base64(format(template, ctx))
        }
      })()
      if (getExplorer() === 'ie') {
        var curTbl = document.getElementById(this.tableId)
        var oXL = new window.ActiveXObject('Excel.Application') // 创建AX对象excel
        var oWB = oXL.Workbooks.Add() // 获取workbook对象
        var xlsheet = oWB.Worksheets(1) // 激活当前sheet
        var sel = document.body.createTextRange()
        sel.moveToElementText(curTbl) // 把表格中的内容移到TextRange中
        sel.select() // 全选TextRange中内容
        sel.execCommand('Copy') // 复制TextRange中内容
        xlsheet.Paste() // 粘贴到活动的EXCEL中
        oXL.Visible = true // 设置excel可见属性
        try {
          var fname = oXL.Application.GetSaveAsFilename(
            'Excel.xls',
            'Excel Spreadsheets (*.xls), *.xls'
          )
        } catch (e) {
          print('Nested catch caught ' + e)
        } finally {
          let savechanges = false
          oWB.SaveAs(fname)
          oWB.Close(savechanges) // xls.visible = false;
          oXL.Quit()
          oXL = null
          idTmr = window.setInterval(function () {
            Cleanup()
          }, 1)
        }
      } else {
        tableToExcel(this.tableId)
      }
    },
    refresh () {
      this.$emit('refresh')
    },
    printer () {
      this.$message('打印预览可能在浏览器后面！')
      var div = document.querySelector('#' + this.tableId)
      var table = div.querySelectorAll('table')
      var html = document.createElement('table')
      var thead = document.createElement('thead')
      var tr = document.createElement('tr')
      var tbody = document.createElement('tbody')
      if (table.length > 0 && table.length === 2) {
        table[0].querySelectorAll('thead tr th').forEach(o => {
          if (o.innerText !== '操作' && o.innerText !== '') {
            var th = document.createElement('th')
            th.innerHTML = o.innerText
            tr.appendChild(th)
          }
        })
        html.appendChild(tr)
        html.appendChild(thead)
        table[1].querySelectorAll('tbody tr').forEach(o => {
          var trd = document.createElement('tr')
          o.querySelectorAll('td').forEach(d => {
            if (d.querySelectorAll('input[type="checkbox"]').length === 0 && d.querySelectorAll('button').length === 0 && !d.className.includes('gutter') && !d.className.includes('checkbox')) {
              var td = document.createElement('td')
              td.innerHTML = d.innerText
              trd.appendChild(td)
            }
          })
          tbody.appendChild(trd)
        })
        html.appendChild(tbody)
      }
      // 设置打印表头和脚
      var tabletitle =
        "<div style='text-align:center;font-size:20px;font-weight:bold;font-family: arial, Microsoft Yahei, 微软雅黑;'>" +
        this.printOb.title +
        '</div>'
      var tablefoot =
        "<font color='#000000' format='Num'><span tdata='pageNO-1+" +
        this.printOb.pageNum +
        "'>第##页</span></font>"
      var strBodyStyle = '<html><head><style>' + css + '</style></head>'
      var printHtml =
        strBodyStyle + '<body>' + html.outerHTML + '</body></html>'
      this.YS.YS_lodop(function () {
        var LODOP
        try {
          LODOP = window.getLodop()
          LODOP.PRINT_INIT('打印控件 英之泰打印')
          // 打印具体表格内容；
          LODOP.ADD_PRINT_TABLE('19mm', '15mm', '90%', '88%', printHtml)
          // 设置表头
          LODOP.ADD_PRINT_HTM('10mm', 34, 'RightMargin:0.9cm', 30, tabletitle)
          LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
          // 设置页脚页码
          LODOP.ADD_PRINT_HTM('97%', '48%', 200, 80, tablefoot)
          LODOP.SET_PRINT_STYLEA(0, 'ItemType', 1)
          LODOP.PREVIEW()
        } catch (e) {
          this.$message.error('请先安装打印控件！')
        }
      })
    }
  },
  watch: {
    scrColumn1: {
      handler (val, oldVal) {
        let selectArr = Object.values(val).filter((item) => {
          return item.selected
        })
        if (selectArr.length === 1) {
          this.currDisabledField = selectArr[0].field
        } else {
          this.currDisabledField = ''
        }
      },
      deep: true
    }
  }
}
</script>

