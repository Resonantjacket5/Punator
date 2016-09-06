/*jshint globalstrict: true*/
/*jslint browser:true */
'use strict';

// regular import from natural doesn't work
// because log4js (node) doens't work on browser
// and no idea how to remove dependency
//import * as natural from "natural";
import {BigHugeLabsThesaurus,Thesaurus} from "./thesaurus";
//import Metaphone from "natural/lib/natural/phonetics/metaphone.js";
var Metaphone:any = require("natural/lib/natural/phonetics/metaphone.js");

declare var require: {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};

class Punator {
  keywordForm:HTMLElement= document.getElementById('keywordForm');;
  keywordInput:HTMLInputElement=<HTMLInputElement> document.getElementById('keyword');
  sentenceInput:HTMLInputElement = <HTMLInputElement>document.getElementById('sentence');
  keywordSynonyms:HTMLElement = document.getElementById('keywordSynonyms');
  thesaurus:Thesaurus;
    constructor(){
    //console.log(Metaphone);
    // require('natural',(natural)=>{
    //   console.log(natural);
    // });

    console.log(Metaphone.process("train"));
    this.thesaurus = new BigHugeLabsThesaurus("29017c6048fadaa546444cb9b1088e33");
    this.keywordForm.addEventListener('submit', this.submitKeyAndSentence.bind(this));
    //this.checkSetup();
    //this.initFirebase();
  }

  //https://www.npmjs.com/package/callthesaurus maybe use this?




  fetchBigHugeLabsSynonyms (word):Promise<Array<string>>{
    throw new Error("deprecated");
    return request('GET','https://words.bighugelabs.com/api/2/29017c6048fadaa546444cb9b1088e33/'+word+'/json').then((val:any)=>{
      console.log(val);
      console.log(val.target.response);
      if(val.target.response==""){
        console.error("empty");
        console.error(word);
        return null;
      }
      var jsonObj = JSON.parse(val.target.response);
      // console.log(jsonObj);
      // console.log(jsonObj.noun);
      console.log(jsonObj.noun.syn);
      return jsonObj.noun.syn;
    });
    // .then((e)=>{
    //   // handle errors
    //   console.error(e);
    // });
  }

  fetchBigHugeLabsSpecific(word,type){
    request('GET','https://words.bighugelabs.com/api/2/29017c6048fadaa546444cb9b1088e33/'+word+'/json').then((val:any)=>{
      console.log(val.target.response);
      return val.target.response.noun[type];
    }).then((e)=>{
      // handle errors
    });
  }

  // Punator.prototype.nearbyWord = (word1,word2)=>{
  //   for(let i=0;i<word1.length;i+=1){
  //
  //   }
  // }

  /*
    Handle fetching both the
    keyPromise and the sentencePromises
    then work on the comparing the two of them.

    Activated when the user clicks or presses enter

  */


  submitKeyAndSentence(e){
    // stop the page from refreshing!!!
    e.preventDefault();
    console.log("submitKeyAndSentence");

    var keyWord:string = this.getKeyword();
    var keyPromise:Promise<any> = this.thesaurus.getSynonyms(keyWord)
    .then((syns)=>{
      syns.push(keyWord);
      return syns;
    });

    var sentencePromises:Promise<any> = this.sentenceSynonyms();

    // Wait for all promises to finish
    Promise.all([keyPromise,sentencePromises]).then((val)=>{
      //var newSentence = this.compareAll(val[0],val[1]);
      let punInfo = this.createPun(val[0],val[1]);//.bind(this);
      let rhymedSentenceArr:Array<string> = punInfo[0];
      let sentenceRatios:Array<number> = punInfo[1];


      // simple string join
      let newSentence:string = "Error not loaded"; //= newSentenceArr.join(" ");
      let newSentenceArr:string[] = [];

      // TODO: more effecient calling of the sentence
      let oldSentenceArr:string[] = this.getSentence().split(" ");

      if(rhymedSentenceArr.length !== oldSentenceArr.length)
      {
        console.error(rhymedSentenceArr,"Rhymed Sentence");
        console.error(oldSentenceArr, "Old Sentence");
        throw new Error("Sentence array correct size!");
      }

      // TODO: refactor processing of deciding pun to be
      // handled by createPun
      for(let index=0; index<oldSentenceArr.length; index++)
      {
        let difference:number = sentenceRatios[index];
        if (difference<=2)
        {
          // if difference is small
          // the push the synonym pun
          newSentenceArr.push(rhymedSentenceArr[index]);
        }
        else
        {
          // if difference is large
          // continue to use the old word
          newSentenceArr.push(oldSentenceArr[index]);
        }
      }
      newSentence = newSentenceArr.join(" ");
      this.keywordSynonyms.textContent = newSentence;
    });
  }

  // Finds all synonyms of the sentences
  // Returns a promise with
  // Output: ["The", "fox", "lives", "on"]
  // Punator.prototype.splitSentence = function (sentence){
  //   return sentence.split(" ");
  // }
  sentenceSynonyms():Promise<any[]> {
    var rawSentence:string = this.getSentence();
    var s:Array<string> = rawSentence.split(" ");
    // TODO: error checking that s exists
    //var synonyms = [];
    var arrSenSynPromises:Array<Promise<Array<string>>> = [];

    for(let i =0; i<s.length;i+=1)
    {
      //arrSenSynPromises.push(this.fetchBigHugeLabsSynonyms(s[i]));

      arrSenSynPromises.push(this.thesaurus.getSynonyms(s[i]));
      // this.fetchBigHugeLabsSynonyms(s[i]).then((syn)=>{
      //   console.log(syn);
      //   synonyms.push(syn);
      //   console.log(synonyms);
      // });
    }

    return Promise.all(arrSenSynPromises);
  }


  // Fetches the sentence inputted
  getSentence():string {
    if(this.sentenceInput.value){
      console.log(this.sentenceInput.value);
      var sentence = this.sentenceInput.value;
      return sentence;
    }
    else {
      console.log("sentence failed");
      // TODO: throw error if sentence not found
      throw new Error("sentence not found");
    }
  }

  // do I really need such a simple function?
  //Input: "The fox lives on"
  //Output: ["The", "fox", "lives", "on"]
  // Punator.prototype.splitSentence = function (sentence){
  //   return sentence.split(" ");
  // }


  getKeyword ():string{
    //e.preventDefault();
    if(this.keywordInput.value){
      var word = this.keywordInput.value;
      return word;
    }
    else {
      console.log("failed");
    }
  }

  /*  input: key synonyms, sentence, synonyms
      keySyn: [one,two,three,four,five,six, ... ]
      senSyns:
      [
        word: (fish) [salmon,tuna,...],
        [],
        []
      ]
  */
  createPun (
    keySynonyms:Array<string>,
    listOfSentenceSynonyms:Array<Array<string>>)
    :[Array<string>,Array<number>]
    {
    let output :[Array<string>,Array<number>];
    let sentenceLength:number = listOfSentenceSynonyms.length;
    let newSentence:Array<string> = []
    let sentenceRatios:Array<number> =[]
    for(let i=0; i<sentenceLength; i+=1)
    {
      let currentWordSynonyms:Array<string> = listOfSentenceSynonyms[i];

      let matrix = this.productWords(keySynonyms,currentWordSynonyms);
      let minItem = this.minMatrix(matrix);
      console.log(minItem);
      let minRatio:number = minItem.ratio;
      console.log(keySynonyms);
      console.log(keySynonyms[minItem.minLocation.row]);
      let minKey:string = keySynonyms[minItem.minLocation.row];
      let minWordSynonym:string = currentWordSynonyms[minItem.minLocation.col];
      newSentence.push(minKey);
      sentenceRatios.push(minRatio);
    }
    return [newSentence,sentenceRatios];
  }


  // Returns a matrix of two vectors of words
  // with the score of their raw scores
  /*        list2  a   b   c
    list1 1         .   .   .
          2         .   .   .
          3         .   .   .
  */
  productWords (list1:Array<string>, list2:Array<string>){
    var matrix = [];
    for(let i=0; i<list1.length;i+=1)
    {
      var row=[];
      for(let j=0;j<list2.length;j+=1)
      {
        var ratio:number = this.metaphoneCompare(list1[i],list2[j]);//this.rawCompare(list1[i],list2[j]);
        console.log(list1[i]+" "+list2[j]+" "+ratio);
        row.push(ratio);
      }
      matrix.push(row);
    }
    console.info(matrix);
    return matrix;
  }


  // row typically correspondes to key synonym
  // could probably do this with apply and fancy array stuff
  minMatrix  (matrix:Array<Array<number>>){
    console.log(matrix);
    var numRows:number = matrix.length;
    var numCols:number = matrix[0].length;
    var minRatio = 999;
    var minLocation = {row:null,col:null};
    for(let i=0; i<numRows;i+=1)
    {
      for(let j=0;j<numCols;j+=1)
      {
        // get ratio at row i and col j
        var ratio = matrix[i][j];
        if(ratio<minRatio)
        {
          minRatio = ratio;
          minLocation = {row:i,col:j};
        }
      }
    }
    return {ratio:minRatio,minLocation};
  }



  metaphoneCompare(word1:string,word2:string):number {
    let code1:string = Metaphone.process(word1);
    let code2:string = Metaphone.process(word2);
    return getEditDistance(code1,code2);
  }

  rawCompare (word1:string, word2:string):number {
    var editDistance = getEditDistance(word1,word2);
    var larger = Math.max(word1.length,word2.length);
    var ratio = editDistance/larger;
    return ratio;
  }
}



// Punator.prototype.fetchBigHugeLabs = function (word){
//   request('GET','https://words.bighugelabs.com/api/2/29017c6048fadaa546444cb9b1088e33/'+word+'/json').then((val)=>{
//     console.log(val.target.response);
//     return val.target.response;
//   }).then((e)=>{
//     // handle errors
//   });
// };

// TODO: Future should generalize this so other thesauruses
// can be called and easily subsistute Api's



// Checks that the Firebase SDK has been correctly setup and configured.
// Punator.prototype.checkSetup = function() {
//   if (!firebase || !(firebase.app instanceof Function) || !window.config) {
//     window.alert('You have not configured and imported the Firebase SDK. ' +
//         'Make sure you go through the codelab setup instructions.');
//   } else if (config.storageBucket === '') {
//     window.alert('You have not enabled Firebase Storage prior to importing the firebase SDK. ' +
//         'Make sure you go through the codelab setup instructions.');
//   }
// };

function request(method, url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = resolve;
        xhr.onerror = reject;
        xhr.send();
    });
}

function getEditDistance(a, b) {
  // credit to:
  //https://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance#JavaScript
  if (a.length === 0) {return b.length; }
  if (b.length === 0) {return a.length; }

  var matrix = [];

  // increment along the first column of each row
  var i;
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i-1) == a.charAt(j-1)) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
}

(<any>window).punator = new Punator();
