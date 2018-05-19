// 合约地址
// const CONTRACT_URL="n22pBKyE7Ge8SsmJRByRKN9RMSQaL4A5qjL"
const CONTRACT_URL="n1pVXp5H3mkvw5D28Uc8QMGi5uKv4QDuNP3"
const NebPay =require("nebpay")
class ContractApi{
  constructor(address){
    this.nebPay=new NebPay();
    this._contract_address=address||CONTRACT_URL;
  }
  getContractAddress(){
    return this._contract_address;
  }
  _simulateCall({value="0",callArgs="[]",callFunction,callback}){
    this.nebPay.simulateCall(this._contract_address,value,callFunction,callArgs,{
      callback:NebPay.config.mainnetUrl,
      listener:function (res) { callback(res) }
    })
  }
  _call({value="0",callArgs="[]",callFunction,callback}){
    this.nebPay.call(this._contract_address,value,callFunction,callArgs,{
      // callback:function (response) {  
      //   if(callback){
      //     callback(response)
      //   }
      // }
      callback:NebPay.config.mainnetUrl,
      listener:function (res) { callback(res) }
    })
  }
}

class LoveApi extends ContractApi{
  constructor(){
    super()
  }
  add(man,woman,text,cb) {
      this._call({
          callArgs : `["${man}", "${woman}", "${text}","${Date.now()}"]`,
          callFunction : "add", 
          callback: cb
      });
  }

  getUser(wallet,cb) {
      this._simulateCall({
          callArgs : `[]`,
          callFunction : "getUser", 
          callback: cb
      });
  }    

  delete(itemId, cb) {
      this._call({
          callArgs: `[${itemId}]`,
          callFunction : "delete", 
          callback: cb
      });
  }

  getTotalCount(cb) {
      this._simulateCall({
          callFunction : "total", 
          callback: cb
      });
  }
  
  get(limit, offset, cb) {
      this._simulateCall({
          callArgs : `[${limit}, ${offset}]`,
          callFunction : "get", 
          callback: cb
      });;
  }   
}
