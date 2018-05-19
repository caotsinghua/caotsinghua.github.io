'use strict';

$(function () {  

  var api=new LoveApi();
  let curFlag=1;
  let limit=10;
  let myid;
  let total=0;
  var theApi={
    getLoves(offset,limit){
      return new Promise((resolve,reject)=>{
        api.get(limit,offset,function (res) { 
          resolve(res)
        })
      })
      
    },
    getMyLoves() { 
      return new Promise((resolve,reject)=>{
          api.getUser(null,function (res) {
          resolve(res)
        })
      })
      
    },
  
    getTotal() { 
      return new Promise((resolve,reject)=>{
        api.getTotalCount(function(res){
          resolve(res);
        })
      })
      
    },
    deleteLove(id) {
      return new Promise((resolve,reject)=>{
        api.delete(id,function(res){
          resolve(res);
        })
      })
      
    },
    addLove(man,woman,text) {
      return new Promise((resolve,reject)=>{
        api.add(man,woman,text,function(res){
          resolve(res);
        })
      })
      
    }
  }
  function showModal(){
    document.getElementById("modal").classList.remove('hidden');
    document.getElementById("modal").classList.add('show');
    document.getElementById("modal").onclick=function (e) {
      e.preventDefault();
      e.stopPropagation();
      hideModal();
    }
    document.getElementById("modal-box").onclick=function (e) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    document.getElementById('cancle').onclick=function (e) { 
      e.stopPropagation();
      e.preventDefault();
      hideModal()
    }
    document.getElementById('confirm').onclick=function (e) { 
      e.stopPropagation();
      e.preventDefault();
      let form=document.getElementById('form');
      let f={
        man:form['boy'].value,
        woman:form['girl'].value,
        text:form['text'].value
      }
      theApi.addLove(f.man,f.woman,f.text).then(res=>{
        if(res.txhash){
          swal({
            title: "交易完成",
            text:'交易哈希:'+res.txhash,
            icon: "success",
            dangerMode: false,
          })
          hideModal();
          total++;
          document.getElementById('total').innerHTML=total;
        }else{
          swal('遇到了一些问题...')
        }
      })
    }
  }
  function hideModal() { 
    document.getElementById("modal").classList.remove('show');
    document.getElementById("modal").classList.add('hidden');
  }
  function bindEvents() {
    const addBtn=document.getElementById('addLove');
    const prevBtn=document.getElementById('prev');
    const nextBtn=document.getElementById('next');
    
    addBtn.addEventListener('click',function (e) { 
      showModal();
    })
    prevBtn.onclick=function (e) { 
      e.stopPropagation()
      
      prev();
    }
    nextBtn.onclick=function (e) {
      e.stopPropagation()
      next();
    }
  }
  function getPastTime(time) { 
    var now=Date.now();
    time=new Date(time-0);
    let t=now-time;
    t=parseInt(t/1000/60/60/24);
    return t;
  }

  function renderAll(list,id) {  
    console.log(list)
    var ul_el=document.getElementById(id);
    var outHtml='';
    for(let i=0;i<list.length;i++){
      var el=list[i];
      ul_el.innerHTML='';
      var past=getPastTime(el.deploy_time)
      let t=new Date(el.deploy_time-0);
      t=t.getFullYear() + '-' + (t.getMonth() + 1) + '-' + t.getDate();
      outHtml+=`<li class="love-item" data-key="${el.id}">
      <p class="boy-name">${el.man}</p>
      <p class="text">宣言:${el.text}</p>
      <div class="center-love">
        <span class="days">${past}天</span>
        <span class="start">from:${t}</span>
      </div>
      <p class="girl-name">${el.woman}</p>
      </li>`
    }
    ul_el.innerHTML=outHtml||'暂无记录';
  }
  function next() {
    let m=total/limit;
    if(curFlag>=limit){
      swal('没有更多了')
      return;
    }
    curFlag+=limit
    theApi.getLoves(curFlag,limit).then(res=>{
      let list=JSON.parse(res.result)||[];
      renderAll(list,'allLoveList')
    })
  }
  function prev() {
    if(curFlag-limit>0) curFlag-=limit;
    else{
      swal('没有更前了')
      return;
    }
    theApi.getLoves(curFlag,limit).then(res=>{
      let list=JSON.parse(res.result)||[];
      renderAll(list,'allLoveList')
    })
  }
  function init() { 
    bindEvents() 
    theApi.getTotal().then(res=>{
      if(!res.execute_err){
        total=res.result-0;
        document.getElementById('total').innerHTML=total;
      }else{
        swal(res.execute_err);
      }
    })
    theApi.getLoves(curFlag,limit).then(res=>{
      let list=JSON.parse(res.result)||[];
      renderAll(list,'allLoveList')
    })
  }
  $("#fullscreen").fullpage({
    sectionsColor:['rgba(247, 120, 190, 0.596)', '#4BBFC3', '#7BAABE', 'whitesmoke', '#ccddff'],
    anchors:['section1','section2'],
    menu:'#menu',
    verticalCentered: false,
    normalScrollElements:'#modal,#myLoveList,#allLoveList',
    afterLoad: function(anchorLink, index){
      var loadedSection = $(this);
      //使用 index
      if(index == 1){
        theApi.getLoves(curFlag,limit).then(res=>{
          let list=JSON.parse(res.result)||[];
          renderAll(list,'allLoveList')
        })
      }
      if(index==2){
        theApi.getMyLoves().then(res=>{
          if(res.execute_err){
            swal({
              title: "警告",
              text:res.execute_err,
              icon: "warning",
              dangerMode: true,
            })
          }else{
            let list=JSON.parse(res.result||[])
            renderAll(list,'myLoveList')
          }
          
        })
      }

    }
  })
  init();
  
})