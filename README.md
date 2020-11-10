# ANKI全平台单选多选自动判断正误模板

## 功能
- 支持单选多选自动识别
- 支持单选多选自动批改
- 支持实时统计当前答题的正确率错误率
- 支持题目答题倒计时
- 全平台测试支持：网页版，windows/mac，android/ios客户端


## 使用方法

**创建新的笔记类型，并编辑卡片正面/背面/样式表**

- 下载release/或切换到tag版本
- 将front.html内容全部复制到anki的正面模板
- 将front.js复制到front.html模板的< script>< /script>中间
- 将back.html全部复制到anki的背面模板
- 将back.js复制到back.html模板的< script>< /script>中间
- 将style.css全部复制到样式表当中

## 添加题目

**在笔记类型当中创建字段**

- **字段1: Questions**  
此字段必须，即题干

- **字段2: Options**  
此字段必须，即题目选项，必须在填入时选择html格式，如下示例，注意去掉html代码当中的空格
```
选项一< br>
选项二< br>
选项三< br>
选项四< br>
```

- **字段3: Answer**  
此字段必须，即正确答案，格式为数字并且多个正确答案以英文逗号分隔，从0开始，如下示例
```
正确答案A:填入0
正确答案B:填入1
正确答案ABC:填入0,1,2
正确答案ACD:填入0,2,3
```

- **字段4: Solutions**  
此字段必须，即背面答案解析，同题干格式

- **(可选)字段5: Id**  
此字段可选，自定义的ID号，如果无需此字段，可无需创建，在笔记类型卡片背面样式当中删除相关条目即可

- **(可选)字段6: CorrectRatio**  
此字段可选，即自定义的正确率，当然可以换成别的，删除方法同字段5

## 已知问题

IOS:
- Solved in v1.3 <del>由于Anki程序限制，无法获知是否为首次进入Anki答题，所以对于IOS版本来说，需通过后台退出Anki后再次进入答题，计算正确率归零重新计算
如果在ios当中只是返回到记忆库界面，然后再次进入答题，则正确率计算会累加</del>

## 功能截图

### 创建卡片和字段
![](http://github.com/SoPudge/anki_template/raw/master/example/card.png)

### 电脑版本
![](http://github.com/SoPudge/anki_template/raw/master/example/client_radio_front.png)
![](http://github.com/SoPudge/anki_template/raw/master/example/client_radio_back.png)

![](http://github.com/SoPudge/anki_template/raw/master/example/client_checkbox_front.png)
![](http://github.com/SoPudge/anki_template/raw/master/example/client_checkbox_back.png)
### Android版本
<img src="http://github.com/SoPudge/anki_template/raw/master/example/android_radio_front.jpg" width=75% height=75%>
<img src="http://github.com/SoPudge/anki_template/raw/master/example/android_radio_back.jpg" width=75% height=75%>
<img src="http://github.com/SoPudge/anki_template/raw/master/example/android_checkbox_front.jpg" width=75% height=75%>
<img src="http://github.com/SoPudge/anki_template/raw/master/example/android_checkbox_back.jpg" width=75% height=75%>
