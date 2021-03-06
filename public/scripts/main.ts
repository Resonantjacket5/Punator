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
//var Moby:any = require("moby");

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

  keyword:string;
  sentence:string;


  constructor()
  {

    console.log(Metaphone.process("train"));


    // Use this thesaurus for fetching synonyms and pass in the API key listed below
    this.thesaurus = new BigHugeLabsThesaurus("29017c6048fadaa546444cb9b1088e33");
    this.keywordForm.addEventListener('submit', this.submitKeyAndSentence.bind(this));

    //this.checkSetup();
    //this.initFirebase();
  }

  /*
    Handle fetching both the
    keyPromise and the sentencePromises
    then work on the comparing the two of them.

    Activated when the user clicks or presses enter

  */


  submitKeyAndSentence(e):void  {
    // stop the page from refreshing!!!
    e.preventDefault();
    console.log("submitKeyAndSentence");

    let keyWord:string = this.getKeyword();
    let sentence:string = this.getSentence();
    this.managePun(keyWord,sentence);
    return null;
  }

  managePun(keyword:string,rawSentence:string)
  {
    let keyPromise:Promise<string[]> = this.thesaurus.getSynonyms(keyword)
    .then((syns)=>{
      syns.push(keyword); // include self
      return syns;
    });
    let sentencePromises:Promise<string[][]> = this.sentenceSynonyms(rawSentence);

    // Wait for all promises to finish
    Promise.all([keyPromise,sentencePromises]).then((val)=>{
      this.createPun(val);
    });
  }

  createPun(val:[Array<string>,Array<Array<string>>]) {
    //var newSentence = this.compareAll(val[0],val[1]);

    //let s = this.getSentence().split(" ");
    //let punInfo = this.createPun(val[0],s);

    //normal one
    let punInfo = this.compareKeySynonymsAndSentence(val[0],val[1]);
    let rhymedSentenceArr:Array<string> = punInfo[0];
    let sentenceRatios:Array<number> = punInfo[1];


    // simple string join
    let newSentence:string = "Error not loaded"; //= newSentenceArr.join(" ");
    let newSentenceArr:string[] = [];




    let oldSentenceArr:string[] = this.getSentence().split(" ");

    if(rhymedSentenceArr.length !== oldSentenceArr.length)
    {
      console.error(rhymedSentenceArr,"Rhymed Sentence");
      console.error(oldSentenceArr, "Old Sentence");
      throw new Error("Sentence array incorrect size!");
    }

    // TODO: refactor processing of deciding pun to be
    // handled by createPun
    for(let index = 0; index < oldSentenceArr.length; index++)
    {
      let difference:number = sentenceRatios[index];
      if ( difference <= 1)
      {
        // if difference is small the push the synonym pun
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

    // Output new sentence
    this.keywordSynonyms.textContent = newSentence;
  }

  // Finds all synonyms of the sentences
  // Returns a promise with
  // Output: ["The", "fox", "lives", "on"]
  // Punator.prototype.splitSentence = function (sentence){
  //   return sentence.split(" ");
  // }
  sentenceSynonyms(rawSentence2:string=null):Promise<Array<Array<string>>> {

    let rawSentence:string = "";
    if(rawSentence2 !== null)
    {
      rawSentence = rawSentence2;
    }
    else
    {
      rawSentence = this.getSentence();
    }
    var s:Array<string> = rawSentence.split(" ");
    // TODO: error checking that s exists
    var arrSenSynPromises:Array<Promise<Array<string>>> = [];
    for(let i =0; i <s.length;i+=1)
    {
      arrSenSynPromises.push(this.thesaurus.getSynonyms(s[i]));
    }
    return Promise.all(arrSenSynPromises);
  }


  // Fetches the sentence inputted
  getSentence():string {
    if(this.sentenceInput.value){
      console.log(this.sentenceInput.value);
      var sentence = this.sentenceInput.value;
      this.sentence = sentence;
      return sentence;
    }
    else {
      console.log("sentence failed or empty");
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


  getKeyword ():string {
    //e.preventDefault();
    if(this.keywordInput.value){
      var word = this.keywordInput.value;
      this.keyword = word;
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
  compareKeySynonymsAndSentence (
    keySynonyms:Array<string>,
    listOfSentenceSynonyms:Array<Array<string>>)
    :[Array<string>,Array<number>]
  {
    let output :[Array<string>,Array<number>];
    let sentenceLength:number = listOfSentenceSynonyms.length;
    let newSentence:Array<string> = []
    let sentenceRatios:Array<number> =[]
    for(let i=0; i <sentenceLength; i++)
    {
      let currentWordSynonyms:Array<string> = listOfSentenceSynonyms[i];

      let matrix = this.productWords(keySynonyms,currentWordSynonyms,this.metaphoneCompare);
      let minItem = this.minMatrix(matrix);
      //console.log(minItem);
      let minRatio:number = minItem.ratio;
      //console.log(keySynonyms);
      //console.log(keySynonyms[minItem.minLocation.row]);
      let minKey:string = keySynonyms[minItem.minLocation.row];
      let minWordSynonym:string = currentWordSynonyms[minItem.minLocation.col];
      newSentence.push(minKey);
      sentenceRatios.push(minRatio);
    }
    return [newSentence,sentenceRatios];
  }





  // Returns a matrix of two vectors of words
  // with the score of their raw scores
  // Depending on function passed in
  /*        list2  a   b   c
    list1 1         .   .   .
          2         .   .   .
          3         .   .   .
  */
  productWords (
    list1:Array<string>,
    list2:Array<string>,
    compareFunction:TwoWordCompare)
    :Array<Array<number>>
  {
    var matrix:Array<Array<number>> = [];
    for(let i=0; i <list1.length;i+=1)
    {
      var row:Array<number>=[];
      for(let j=0;j <list2.length;j+=1)
      {
        var ratio:number = compareFunction(list1[i],list2[j]);//this.rawCompare(list1[i],list2[j]);
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
    for(let i = 0; i < numRows; i++)
    {
      for(let j = 0; j < numCols; j++)
      {
        // get ratio at row i and col j
        var ratio = matrix[i][j];
        if( ratio < minRatio)
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

interface TwoWordCompare {
  (a:string, b:string): number;
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
