/**
 * @Author:SoPduge
 * @Log:
 *  2020/10/23: refactor init version
 *  2020/10/26：v1 version release
 * @file
 *  本程序功能如下：
 *      #1 单选多选自动匹配，答案乱序
 *      #2 back页乱序答案顺序同front页，自动批改答案
 *      #3 自动计算当次答题正确率
 *      #4 全平台支持以上功能
 *  Ankibb不同的客户端分为以下三种，根据页面切换的情况，对变量和功能的支持如下
 *      web端：支持sessionStorage保持，支持全局变量保持
 *      手机端：支持sessionStorage保持，不支持全局变量保持
 *      PC端：不支持sessionStorage功能，支持全局变量保持
 *  本程序有如下方法模块
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
 * 检测系统平台，输出结果调用
 *   client:client电脑客户端（MAC，PC, IOS)，由于ios版本支持全局变量在退出答题页面后清零，所以将ios版本也定义为client
 *   使用gvalues全局变量代替sessionStorage
 *   mobile:手机端
 *   web:网页端
 */
var platform = ''
var ua = navigator.userAgent
var isAndroid = ua.indexOf('Android') > -1

var isIOS = ua.indexOf('iPhone') > -1 
    || ua.indexOf('iPad') > -1

var isClient = ua.indexOf('QtWebEngine') > -1

if (isAndroid) {
    platform = 'mobile'
} else if (isClient || isIOS) {
    platform = 'client'
} else {
    platform = 'client'
} 

/**
 * 检测界面
 *  如果含有背面翻页线，即id='answer'的元素，则为背面
 */

var pageMode = ''
if (!document.getElementById('answer')) {
    pageMode = 'front'
} else {
    pageMode = 'back'
}

/**
 * 创建变量
 *  如果全局变量或者sessionStorage为空，则创建相关内容
    {
        currentString:'',//代表未乱序的当前题目options列表直接合成的字符串[].join('')
        shuffleString:'',//乱序后的innerHTML字符串
        correctNumber:tempCorrectNumber.toString(),//正确题目数量
        totalNumber:(tempTotalNumber+=1).toString(),//总题目数量
        userSelectionString:''//用户选择答案如012，字符串
        }
 */

if (typeof (GVALUES) === 'undefined') {
    var GVALUES = {}
    GVALUES['currentString'] = ''
    GVALUES['shuffleString'] = ''
    GVALUES['correctNumber'] = '0'
    GVALUES['totalNumber'] = '0'
    GVALUES['userSelectionString'] = ''
} 

if (!isClient && sessionStorage.length === 0){
    sessionStorage.setItem('currentString','')
    sessionStorage.setItem('shuffleString','')
    sessionStorage.setItem('correctNumber','0')
    sessionStorage.setItem('totalNumber','0')
    sessionStorage.setItem('userSelectionString','')
}

/** 
 * @setValues
 * 对于Android mobile，使用sessionStorage方法存储，离开页面自动清空
 *  对于web和client和ios，使用全局变量GVALUES，离开页面自动清空
 *
 */

function setValues(values) {

    for (var i in values) {
        if (platform === 'client') {
            GVALUES[i] = values[i]
        } else {
            sessionStorage.setItem(i, values[i])
        }
    }
}

/** 
 * getValues
 *  接受一个数组作为参数，数组内部元素为请求数据的key
 *  如果为client客户端，则从全局变量取值，否则从sessionStorage当中取值，都返回object
 *  请求哪个key就返回哪个key
 *
 */

function getValues(values) {

    var tempObject = {}
    var resultObject = {}

    //转存不同客户端下的全局变量到tempObject
    if (platform === 'client') {
        tempObject = GVALUES
    } else {
        var n = 0
        for (var i in sessionStorage) {
            if (n < sessionStorage.length) {
                tempObject[i] = sessionStorage.getItem(i)
                n++
            }
        }
    }
    //在获取值，存在返回，不存在返回undefinede
    for (var j of values) {
        if (Object.keys(tempObject).indexOf(j) > -1) {
            resultObject[j] = tempObject[j]
        }
    }
    return resultObject
}


/** showOptions
 *      显示答案，对于正面直接显示乱序答案并存储，对于反面则从变量当中获取乱序答案直接显示
 *      生成的innerHTML按照标准答案标记正误，使用onChange方法在每次选择时都更新选项到全局变量
 *
 */
function showOptions() {

    function shuffleAnswer(arr) {
        for (let i = arr.length; i > 0; i--) {
            // 从 arr 中选取一个未混排的元素的索引
            let idx = Math.floor(Math.random() * i); // 0~arr.length - 1
            // 将它和最后一个未混排的元素，即当前元素交换
            let temp = arr[i - 1];
            arr[i - 1] = arr[idx];
            arr[idx] = temp;
        }
        return arr;
    }
    //生成答案匹配对象数组，内部为直接使用的html，单选多选自适应
    var optionsHtml = []
    var selectType = ""
    //判断使用radio还是checkbox
    if (answers.length > 1) {
        selectType = "checkbox"
    } else {
        selectType = "radio"
    }
    //按答案顺序生成innerHTML字符串
    for (var i = 0; i < options.length; i++) {
        var answersType = ''
        for (var j of answers) {
            if (j === i) {
                answersType = "right"
                //遇到正确的项目立即跳出循环，完成多选
                break
            } else {
                answersType = "wrong"
            }
        }
        //selectType：单选或多选
        //answersType：标记答案正误
        //i：原始答案顺序，从0开始
        optionTemplate = `<li><label onclick=""><input type="${selectType}" name="radio_option" id="${answersType}" value="${i}" onchange="getOptions()">${options[i]}</label></li>`
        optionsHtml.push(optionTemplate)
    }
    //如果是正面，则乱序显示并将shuffleString存储到全局变量，如果是背面则获取全局变量shuffleString显示出来
    if (pageMode === 'front') {
        optionsHtml = shuffleAnswer(optionsHtml)
        setValues({'shuffleString': optionsHtml.join('')})
        optionsOl.innerHTML = optionsHtml.join('')
    } else {
        optionsOl.innerHTML = getValues(['shuffleString'])['shuffleString']
    }
}


/**
 * @getOptions
 *  作为onChange的方法，将用户选项实时的存储到变量当中
 *  每次用户选择，都会循环当前所有options，将选项作为数组类似[0,2,3,1]的字符串储存
 *  循环的原因是支持单选多选
 *
 */

function getOptions() {

    //获取单选或多选的用户选择值
    //单选多选都可用
    var check = document.getElementsByTagName('input')
    //循环前清空list
    var userSelectionList = []
    for (var i of check) {
        if (i.checked) {
            userSelectionList.push(i.value)
        }
    }
    setValues({'userSelectionString':userSelectionList.join('')})
}


/**
 * @setOptions
 *  仅在背面存在，将存储在变量当中的用户选项恢复到背面
 *  判断并显示答案正误
 *
 */

function setOptions() {

    //获取全局变量当中的用户选择答案，用以标记到背面答案
    var userAnswerNumberArray = getValues(['userSelectionString'])['userSelectionString'].split('')
    //对比用户答案和正确答案，并标记dom，正确答案绿色，错误红色，用户选择的错误加删除线，禁用单选多选框
    var check = document.getElementsByTagName('input')
    for (var i of check) {
        //判断正确错误答案，按照input的id
        if (i.id === 'right') {
            //label填上绿色
            i.parentNode.style = "color:#A6E22E;"
        } else {
            //颜色红加删除线
            i.parentNode.style = "color:#F92772;text-decoration:line-through;"
        }
        //反面同步填充用户答案勾选
        if (userAnswerNumberArray.includes(i.value)) {
            i.checked = true
        }
    }
    //如果用户答案正确，取出correctNumber并+1写入
    if (userAnswerNumberArray.sort().join('') === answers.join('')) {
        var tempCorrectNumber = getValues(['correctNumber'])['correctNumber'] * 1
        setValues({'correctNumber': tempCorrectNumber + 1})
    }
}


/**
 * @setRatio
 *  所有页面均存在，在front当中显示截止前一题的正确率，总题量显示当题，正确率为前一题总量计算
 *  在back界面显示计算当题的正确率
 *
 */

function setRatio() {

    var ratio = document.getElementById('ratio')
    //从全局变量获取全部答题的数量，front页面+1
    var totalNumber = getValues(['totalNumber'])['totalNumber']
    if (pageMode === 'front') {
        totalNumber = totalNumber * 1 + 1
        setValues({'totalNumber': totalNumber})
    }

    //从全局变量获取correctNumber，因为correctNumber在setOptions当中已经变更
    var correctNumber = getValues(['correctNumber'])['correctNumber']

    //判断翻页，如果本题正面，错误项不显示；如果翻页，显示错误项
    if (pageMode === 'front') {
        var ratioString = `第${totalNumber}题-正确${correctNumber}-错误${totalNumber - correctNumber - 1}-正确率${(correctNumber / totalNumber * 100).toFixed(2)}%`
    } else {
        var ratioString = `第${totalNumber}题-正确${correctNumber}-错误${totalNumber - correctNumber}-正确率${(correctNumber / totalNumber * 100).toFixed(2)}%`
    }
    ratio.innerHTML = ratioString
}

/**
 * @setCounddown
 *  设置front页面倒计时，back页面显示使用时间
 *
 */
function setCountdown(){

  var wait = 60
	var cd = document.getElementById('countdown')
	function countdown() {
  	if (wait == 0) {
    	cd.innerHTML = `答题超时`
    	wait = 60;
  	}else{
    	cd.innerHTML = wait
    	wait--;
    	setTimeout(countdown, 1000);
    }
}
countdown()
}

/**
 * 变量说明
 * @options: 所有选项的数组[1,2,3]，内容为字符串
 * @answers: 标答选项数组，[0,1,2]
 * @optionsOl: dom对象，需要显示的options在这里
 *
 */

var options = document.getElementById("options").innerHTML
var options_reg = /<br.*?>/i
options = options.split(options_reg)
//特殊处理，对于手机端无法判断front/back，则通过全局变量存储的选项，和当前页面选项对比，两者一致说明在背面
if ((isAndroid || isIOS) && getValues(['currentString'])['currentString'] === options.join('')){
    pageMode = 'back'
}
setValues({'currentString':options.join('')})
var answers = document.getElementById("answers").innerHTML
answers = answers.split(',').map(Number)
var optionsOl = document.getElementById("optionList")

//主程序
showOptions()
if (pageMode === 'front') {
    setCountdown()
} else {
    setOptions()
}
setRatio()
