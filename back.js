/**
 * @Author:SoPduge
 * @Log:
 *  2020/10/27: refactor init version
 * @file
 *   
 */
 

function setAnswers() {

    //获取input当中的id为right的答案，并解析为字母放置于对应dom当中
    var check = document.getElementsByTagName('input')
    var n = 0
    var questions_id = []
    for (var i of check) {
        n++
        //判断正确错误答案，按照input的id
        if (i.id === 'right') {
            //label填上绿色
            questions_id.push(String.fromCharCode(n+64))
            console.log(questions_id)
        }
    }
    var questionsArea = document.getElementById('questions_id')
    questionsArea.innerHTML = '正确答案：' + questions_id.join('')
}
setAnswers()
