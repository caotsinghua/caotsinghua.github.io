
var backBtn=document.querySelector('#my-back-btn');//返回按钮
function goBack(){//返回上一级
    history.back();
}
backBtn.addEventListener('click',function(){
    goBack();
})

var imgUrls=[//图标路径
    './assets/imgs/type0.png',
    './assets/imgs/type1.png',
    './assets/imgs/type2.png',
    './assets/imgs/type3.png',
    './assets/imgs/type4.png',
    './assets/imgs/type5.png',
    './assets/imgs/type6.png',
]
var kindNames=[//种类
    '资金',
    '电子产品',
    '体育用品',
    '书籍',
    '文具',
    '装饰配件',
    '其他',
]
var colors=[
    'rgb(248,179,70)',
    'rgb(70,158,248)',
    'rgb(248,120,70)',
    'rgb(4,208,76)',
    'rgb(114,200,240)',
    'rgb(199,125,250)',
    'rgb(255,142,219)'
]


var mychoices=document.querySelectorAll('.my-choice'),
    choice_thing_name=document.querySelector('#choice_thing_name'),
    choice_img=document.querySelector('#choice_img'),
    choice_text=document.querySelector('#choice_text'),
    submit_btn=document.querySelector('#submit_btn'),
    left_message=document.querySelector('#left_message'),
    input_name=document.querySelector('#input_name'),
    tab_back=document.querySelector('.tab-background'),
    my_form=document.getElementById('form'),
    text_error=document.querySelector('.text-error'),
    express_input=document.querySelector('.my-express-input'),
    express_select=document.querySelector('.express-select')

function openUrl(url,e){
    e.stopPropagation();
    window.open(url,'_self');
}
function createThing(index,name,leftMessage){//创建物品的构造函数
    this.imgUrl=imgUrls[index],//图片
    this.kind=kindNames[index];//种类
    this.index=index;//第几个种类
    this.name=name;//捐献物件名称
    this.leftMessage=leftMessage;//留言
    this.color=colors[index];//背景色
    
   
}

var postData=new createThing(1,'','');
var checkSuccess=true;//是否校验成功

function renderThing(thing){//将物品渲染到tabbar
    // choice_img.setAttribute('src',thing.imgUrl);
    input_name.value=thing.name;//关联到输入框
    // 文字移动特效+图片移动
  
    choice_text.classList.add('fadeOutUp');
    choice_text.classList.remove('fadeInUp');   
    choice_img.classList.add('fadeOutUp');
    choice_img.classList.remove('bounceInRight');   
    setTimeout(function() {
        
        choice_text.classList.remove('fadeOutUp');
        choice_text.innerText=thing.kind;
        choice_text.classList.add('fadeInUp');

        
        choice_img.classList.remove('fadeOutUp');
        choice_img.setAttribute('src',thing.imgUrl);
        choice_img.classList.add('bounceInRight');
}, 200);
   
    //end
    if(thing.index==0){
        document.querySelector('.money-tag').style.display='block';
    }else{
         document.querySelector('.money-tag').style.display='none';
    }
    //渲染背景颜色
    //重设一个div，宽度从0加到100 
    setTimeout(function() {
        tab_back.classList.remove('tab-animate');
    }, 500);
    tab_back.style.background=thing.color;
    tab_back.classList.add('tab-animate');
    
    
    setTimeout(function() {
        document.querySelector('.my-tab-bar').style.background=thing.color;//设置背景色
    }, 500);
}
function donateThing(index){
        var left=left_message.value;
        var value=input_name.value;
        postData.index=index;
        postData.name=value;
        postData.leftMessage=left;
        postData.imgUrl=imgUrls[index],//图片
        postData.kind=kindNames[index];//种类
        postData.color=colors[index];//背景色
         if(index==0){//关闭物流输入
            document.querySelectorAll('.express-select option')[0].setAttribute('selected',"selected");
            document.querySelector('.express-content').setAttribute('disabled','true');
            document.querySelector('.express-content').setAttribute('placeholder','无');
            express_input.classList.remove('fadeInRight');
            express_input.classList.add('fadeOutUp');
            setTimeout(function() {
                 express_input.classList.add('hidden-express');
            }, 1000);
            setTimeout(function(){
                left_message.classList.add('move-lefttext');
                submit_btn.classList.add('move-btn');
            },300)
            

        }else{
            document.querySelectorAll('.express-select option')[0].removeAttribute('selected'); 
            left_message.classList.remove('move-lefttext');
            submit_btn.classList.remove('move-btn');
            express_input.classList.remove('hidden-express');
            express_input.classList.remove('fadeOutUp');
            express_input.classList.add('fadeInRight');
             
        }

        renderThing(postData);  
}



for(var i=0;i<mychoices.length;i++){//iphone forEach无效？
   (function(index){
        mychoices[i].onclick=function(){
             input_name.value="";
            donateThing(index);
        }
   })(i)
}

//表单验证
var checkForm=function(index){
    switch(index){
        case 0:checkMoney();break;
        default:checkOther();break;
    }
}
var checkMoney=function(){//检查金额项
    var money=input_name.value;
    if(money==''){
        text_error.innerText='请输入捐赠金额!';
        text_error.classList.add('show-error');
        checkSuccess=false;
    }else if(isNaN(money)){
        text_error.innerText='请输入数字!';
        text_error.classList.add('show-error');
        checkSuccess=false;
    }
    else{
        text_error.classList.remove('show-error');
        checkSuccess=true;
    }
}
var checkOther=function(){//检查其他项
    var text=input_name.value;
    if(text==''){
        text_error.innerText='请输入物品名称!';
        text_error.classList.add('show-error');
        checkSuccess=false;
    }
    else if(text.length>15){
            text_error.innerText='最多输入15字符!'
        
        text_error.classList.add('show-error');
        checkSuccess=false;
    }else{
        text_error.classList.remove('show-error');
        checkSuccess=true;
    }
}

input_name.onblur=function(){//失去焦点的时候进行验证
    checkForm(postData.index);
}
function changeToMoney(){
     var regStrs = [  
        ['^0(\\d+)$', '$1'], //禁止录入整数部分两位以上，但首位为0  
        ['[^\\d\\.]+$', ''], //禁止录入任何非数字和点  
        ['\\.(\\d?)\\.+', '.$1'], //禁止录入两个以上的点  
        ['^(\\d+\\.\\d{2}).+', '$1'] //禁止录入小数点后两位以上  
    ];  

    for(i=0; i<regStrs.length; i++){  
        var reg = new RegExp(regStrs[i][0]);  
        input_name.value = input_name.value.replace(reg, regStrs[i][1]);  
    }  
}
input_name.oninput=function(){//输入时对资金替换，其他的提示信息
    if(postData.index==0){
        changeToMoney();
}else{
    checkForm(postData.index)
}
}
submit_btn.onclick=function(e){//提交表单
    e.preventDefault();
    checkForm(postData.index);//验证是否正确
    if(!checkSuccess){
      return ;//验证失败
    }
    else{
        window.open("./success.html",'_self');
        // my_form.submit();//成功

    }
    
    
}



//  选择物流时判断
express_select.onchange=function(e){
    // alert(e.target.value)
    if(e.target.value=='NONE'){
        document.querySelector('.express-content').setAttribute('disabled','true');
        document.querySelector('.express-content').setAttribute('placeholder','无');
    }else{
        document.querySelector('.express-content').removeAttribute('disabled');
        document.querySelector('.express-content').setAttribute('placeholder','快递单号');
    }
}


