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
 * 检测系统平台，输出结果调用
 *   client:client电脑客户端（MAC，PC）
 *   mobile:手机端
 *   web:网页端
 *
 *   如果不支持cookie，则说明是client
 *   如果支持cookie，则说明是web或者mobile
 *   如果isMobile为真，则确认为手机
 */
var platform = ''
var ua = navigator.userAgent
var isMobile = ua.indexOf('Android') > -1
    || ua.indexOf('iPhone') > -1
    || ua.indexOf('iPad') > -1

var isClient = ua.indexOf('QtWebEngine') > -1

if (isMobile) {
    platform = 'mobile'
} else if (isClient) {
    platform = 'client'
} else {
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
 *      client: cookie=null,GVALUE=[]
 *      mob: cookie=[],GVALUE=[]
 *
 *  后续进入正面：
 *      web: cookie=ok,GVALUE=ok
 *      client: cookie=null,GVALUE=ok
 *      mob: cookie=ok,GVALUE=[]
 *
 *  每次翻页：
 *      web: cookie=ok,GVALUE=ok
 *      client: cookie=null,GVALUE=ok
 *      mob: cookie=ok,GVALUE=[]
 *
 *  注意手机端每次翻页GVALUE都为空，需同步自cookie，PC端不支持cookie，纯使用GVALUE
 */


/** 
 * @setValues
 *   接受参数key-value，来设置cookie和全局变量GVALUES
 *   如果不是client平台，直接写入cookies，然后if之外写入全局变量GVALUES
 *   传几个参数，更新几个参数，可以部分更新，可以全部更新
 *   标准对象的模版如下
tempData = {
        currentString:'',//代表未乱序的当前题目options列表直接合成的字符串[].join('')
        shuffleString:'',//乱序后的innerHTML字符串
        correctNumber:tempCorrectNumber.toString(),//正确题目数量
        totalNumber:(tempTotalNumber+=1).toString(),//总题目数量
        userSelectionString:''//用户选择答案如012，字符串
        }
 *
 */
if (typeof (GVALUES) === 'undefined') {
    GVALUES = {}
} else {
    GVALUES = GVALUES
}

function setValues(values) {

    for (var i in values) {
        if (!(platform === 'client')) {
            var tempValues = ''
            tempValues = i + '=@@@@@@@@@@' + values[i]
            document.cookie = tempValues
        } 
        GVALUES[i] = values[i]
    }
}

/** 
 * getValues
 *   接受参数key数组[]，来获取cookie和全局变量当中相应的值
 *   默认从cookies当中获取，仅当使用client客户端时从全局变量获取
 *   返回一个以传入key为key的对象，即请求什么返回什么不多余
 *
 */
function getValues(values) {

    var tempObject = {}
    var cookieObject = {}
    //平台不是client从cookie当中获取
    if (!(platform === 'client')) {
        var cookieString = document.cookie
        //先转换cookie到object方便取值
        for (var i of cookieString.split('; ')) {
            cookieObject[i.split('=@@@@@@@@@@')[0]] = i.split('=@@@@@@@@@@')[1]
        }
    }else {
        cookieObject = GVALUES
    }
    //在获取值
    for (var j of values) {
        if (Object.keys(cookieObject).indexOf(j) > -1){
            tempObject[j] = cookieObject[j]
        }
    }
    return tempObject
}


/** *showOptions
 *    接受参数 
 *
 *
 *
 *
 */
function showOptions(isShuffle, isLastShuffle) {

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
        //i：原始顺序，从0开始
        optionTemplate = `<li><label><input type="${selectType}" name="radio_option" id="${answersType}" value="${i}" onchange="getOptions(this)">${options[i]}</label></li>`
        optionsHtml.push(optionTemplate)
    }
    //写入前乱序列号，按传入参数isShuffle来决定，yes为乱序，no为正序
    if (isShuffle === 'yes') {
        optionsHtml = shuffleAnswer(optionsHtml)
    } else if (isShuffle === 'no') {
        optionsHtml = optionsHtml
    }
    //每次执行前都删除所有选项子节点
    optionsOl.innerHTML = ''
    //检查数据是否来自于全局变量tempData.shuffleString，代表同一题切换背面后直接从全局变量获取之前乱序选项的结果
    //isLastShuffle为yes，则证明题目不变只是翻面，使用全局变量当中存储的innerHTML，否则是变题使用optionsHtml
    if (isLastShuffle === 'yes') {
        optionsOl.innerHTML = getValues(['shuffleString'])['shuffleString']
    } else if (isLastShuffle === 'no') {
        x = optionsHtml.join('')
        optionsOl.innerHTML = x
        //写入乱序的shuffleString即乱序答案innerHTML值
        setValues({shuffleString:x})
    }
}


/**
 * @getOptions
 *  作为onChange的方法，将用户选项实时的存储到变量当中
 *
 */

function getOptions(userOption) {

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
    setValues({userSelectionString:userSelectionList.join('')})
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
            //勾选用户答案
            i.checked = true
        }
    }
    //如果用户答案正确，分为有correctNumber和没有
    //var isCorrectNumber = Object.keys(GVALUES).indexOf('correctNumber')
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
    //从全局变量获取全部答题的数量
    var totalNumber = getValues(['totalNumber'])['totalNumber']
    var correctNumber = getValues(['correctNumber'])['correctNumber']

    if (typeof(totalNumber) === 'undefined') {
        setValues({'totalNumber': '1'})
    }else if (pageMode === 'front'){
        totalNumber = totalNumber * 1 + 1
        setValues({'totalNumber':totalNumber})
    }

    //判断是否存在correctNumber，如果不存在则创建并初始化0，后续在setOptions当中会+1
    if (!correctNumber) {
        setValues({'correctNumber': '0'})
    }

    //重新获取更新的totalNumber
    var totalNumber = getValues(['totalNumber'])['totalNumber']
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

//在options加入当前的全局变量当中之前，判断是否是back界面
pageMode = ''
if (getValues(['currentString'])['currentString'] === options.join('')) {
    pageMode = 'back'
} else {
    pageMode = 'front'
}

//更新currentString的值
setValues({currentString:options.join('')})
var answers = document.getElementById("answers").innerHTML
answers = answers.split(',').map(Number)
var optionsOl = document.getElementById("optionList")

//主程序

if (pageMode === 'front') {
    showOptions('yes', 'no')
    //正面显示正确率
    setRatio()
    setCountdown()
} else {
    showOptions('no', 'yes')
    setOptions()
    setRatio()
}
