export interface Thesaurus {
  getSynonyms(s:string):Promise<string[]>;
  getWordInfo(a:any):Promise<any>;
}


export class BigHugeLabsThesaurus implements Thesaurus{
  obj:any={
    found: false,
    type:[]
  };
  api_key:string="none";
  website:string="https://words.bighugelabs.com/api/2/";
  constructor(api_key:string){
    this.api_key = api_key;
    if(!api_key){
      throw new Error("No API key passed!");
    }
    else{
      this.website+=api_key+'/';
    }
  }

  public getSynonyms(word:string):Promise<string[]>{
    return this.getWordInfo(word).then((wordInfo:any)=>{
      return wordInfo.noun.syn;
    });
  }


  getWordInfo(word:string):Promise<string>{
    return Network.request('GET',this.website+word+'/json')
    .then((val:any)=>{

      let status:number = val.target.status;
      // 200: OK, 303: alternate, 404: not found, 500 Usage Exceed/Inactive key
      if(status===200 || status ===303){
        console.log(val.target.response);
        if(val.target.response==""){
          console.error("empty");
        }
        let jsonObj = JSON.parse(val.target.response);
        return jsonObj;
      }
      else
      {
        //status === 404
        this.obj.found = false;
      }
    });
  }
}


namespace Network {
  export function request(method, url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = resolve;
        xhr.onerror = reject;
        xhr.send();
    });
  }
}
