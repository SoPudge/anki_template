/**
 * @Author:SoPduge
 * @Log:
 *  2020/10/23: refactor init version
 * @file
 *  Anki分三种页面，第一种是首次进入第一题题干，第二种是答案界面展示，第三种是切换题目
 *  Ankibb不同的客户端分为以下三种，根据页面切换的情况，对变量和功能的支持如下
 *      web端：支持cookie保持，支持全局变量保持
 *      手机端：支持cookie保持，不支持全局变量保持
 *      PC端：不支持cookie功能，支持全局变量保持
 *  本程序有如下功能
 *  @ShowOptions：显示选项，在frontPage/backPage
 *  @getOptions：获取用户选项，作为选项的onChange触发，frontPage存在
 *  @setOptions：将用户选项同步到backPage，仅在backPage存在
 *  @setValues：接受key-value参数，同时存储到全局变量和cookie并保持同步
 *  @getValues：接受key参数，从cookie或全局变量获取值，保持两者同步
 *  @setRatio：设置题目正确率，所有页面均存在，frontPage当中不显示当前题目正确率
 *  @setCountdown：设置倒计时，仅在frontPage存在
 *
 */

/**
 * 变量说明
 * @options: 所有选项的数组[1,2,3]，内容为字符串
 * @answer: 标答选项数组，[0,1,2]
 * @optionsOl: dom对象，需要显示的options在这里
 *
 */

var options = document.getElementById("options").innerHTML
var options_reg = /<br.*?>/i
options = options.split(options_reg)
var answer = document.getElementById("answer").innerHTML
answer = answer.split(',').map(Number)
var optionsOl = document.getElementById("optionList")

/**
 * 检测系统平台，输出结果调用
 *   x86:x86电脑客户端（MAC，PC）
 *   mobile:手机端
 *   web:网页端
 *
 *   如果不支持cookie，则说明是x86
 *   如果支持cookie，则说明是web或者mobile
 *   如果isMobile为真，则确认为手机
 */
var platform = ''
var ua = navigator.userAgent
var isMobile = ua.indexOf('Android') > -1
    || ua.indexOf('iPhone') > -1
    || ua.indexOf('iPad') > -1

try {
    document.cookie
}catch(e){
    platform = 'x86'
}finally {
}

if (isMobile && platform === ''){
    platform = 'mobile'
} else if (platform === '') {
    platform = 'web'
}

/**
 * 检测界面
 *   1:首次进入
 *   2:显示backPage
 *   3:进入新题目
 *
 *   首次进入：
 *      web：cookie=[],GVALUE=[]
 *      x86: cookie=null,GVALUE=[]
 *      mob: cookie=[],GVALUE=[]
 *
 *  后续进入正面：
 *      web: cookie=ok,GVALUE=ok
 *      x86: cookie=null,GVALUE=ok
 *      mob: cookie=ok,GVALUE=[]
 *
 *  每次翻页：
 *      web: cookie=ok,GVALUE=ok
 *      x86: cookie=null,GVALUE=ok
 *      mob: cookie=ok,GVALUE=[]
 *
 *  注意手机端每次翻页GVALUE都为空，需同步自cookie，PC端不支持cookie，纯使用GVALUE
 */

//var pageMode
//function getPage() {
    //if ()
//}


/** *setValues
 *   接受参数key-value，来设置cookie和全局变量GVALUES
 *   如果不是x86平台，直接写入cookies，然后if之外写入全局变量GVALUES
 *   传几个参数，更新几个参数，可以部分更新，可以全部更新
 *
 */
var GVALUES = {}
function setValue(values) {

    for (var i in values) {
        if (!(platform = 'x86')) {
            var tempValues
            tempValues = i + '=@@@@@@@@@@' + tempValues[i]
            document.cookie = tempValues
        } 
        GVALUES[i] = values[i]
    }
}

/** *getValues
 *   接受参数key数组[]，来获取cookie和全局变量当中相应的值
 *   返回值为{}的key-value结果
 *
 */
function getValues(values) {

    var tempObject
    var cookieObject
    var cookieString = document.cookie
    //先转换cookie到object方便取值
    for (var i of cookieString.split('; ')){
        cookieObject[i.split('=@@@@@@@@@@')[0]] = i.split('=@@@@@@@@@@')[1]
        }
    //在获取值
    for (var j in values) {
        if (j in Object.keys(cookieObject)){
            tempObject[j] = cookieObject[j]
        }
    }
    return tempObject
}
