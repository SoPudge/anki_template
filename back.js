/**
 * @Author:SoPduge
 * @Log:
 *  2020/10/27: refactor init version
 *  2021/5/26: 新增错误最多选项功能，发布v1.6版本
 * @file
 *   
 */
 

function setAnswers() {

    //获取input当中的id为right的答案，并解析为字母放置于对应dom当中
    var check = document.getElementsByTagName('input')
    var n = 0
    var questions_id = []
    var mostwrong_id = []
    for (var i of check) {
        n++
        //判断正确错误答案，按照input的id
        if (i.id === 'right') {
            //正确答案转换，从数字到字母
            questions_id.push(String.fromCharCode(n+64))
            //console.log(questions_id)
        }
        if (i.id === 'mostwrong'){
            //检测正面setOptions标记的错误最多答案，并转换成字母存储到数组
            mostwrong_id.push(String.fromCharCode(n+64))
        }
    }
    var questionsArea = document.getElementById('questions_id')
    questionsArea.innerHTML = '正确答案：' + questions_id.join('')
    var mostWrongAnswerShow = document.getElementById("most-wrong-show")
    mostWrongAnswerShow.innerHTML = '错误最多：' + mostwrong_id.join('')
}
setAnswers()
