'use strict';
class LoveItem{
  constructor(love_str){
    let love=love_str?JSON.parse(love_str):{};
    this.id=love.id;
    this.deploy_time=love.deploy_time;//发布时间
    this.text=love.text;//宣言
    this.man=love.man;//男方
    this.woman=love.woman;//女方
  }
  toString(){
    return JSON.stringify(this);
  }
}

class LoveContract{
  constructor(){
    LocalContractStorage.defineProperty(this,'count');
    LocalContractStorage.defineMapProperty(this,'userLoves');
    LocalContractStorage.defineMapProperty(this,'loves',{
      parse:function (text) {  
        return new LoveItem(text);
      },
      stringify:function (o) {  
        return o.toString();
      }
    })
  }
  init(){
    this.count=new BigNumber(1);
  }
  total(){
    return new BigNumber(this.count).minus(1).toNumber();//获取所有数量
  }
  add(man,woman,text,deploy_time){
    let from=Blockchain.transaction.from;
    let index=this.count;//唯一id
    let loveItem=new LoveItem();
    loveItem.id=index;
    loveItem.deploy_time=deploy_time;
    loveItem.man=man;
    loveItem.woman=woman;
    loveItem.text=text;

    this.loves.put(index,loveItem);//添加进love列表
    let userLoves=this.userLoves.get(from)||[];//获取用户的love数据
    userLoves.push(index);
    this.userLoves.put(from,userLoves);
    this.count=new BigNumber(index).plus(1);
  }
  delete(id){
    let loveItem=this.loves.get(id);
    if(!loveItem){
      throw new Error("love data not found!")
    }
    this.loves.del(id);//删除数据
  }
  /**
   * 获取所有信息
   * limit：条数
   * offset：开始的id
   * @param {number} limit 
   * @param {number} offset 
   */
  get(limit,offset){
    let arr=[];
    offset=new BigNumber(offset);
    limit=new BigNumber(limit);
    for(let i=offset;i.lessThan(offset.plus(limit));i=i.plus(1)){
      let id=i.toNumber();
      let item=this.loves.get(id);
      if(item){
        arr.push(item);
      }
    }
    return arr;
  }
  /**
   * 获取用户的信息
   */
  getUser(wallet){
    let from=wallet||Blockchain.transaction.from;
    let userLoves=this.userLoves.get(from);
    if(!userLoves){
      throw new Error(`wallet=${from} doesnot have lovers!`);
    }
    let arr=[];
    for(let i=0;i<userLoves.length;i++){
      let id=userLoves[i];
      let item=this.loves.get(id);
      if(item){
        arr.push(item)
      }
    }
    return arr;
  }

}

module.exports=LoveContract;