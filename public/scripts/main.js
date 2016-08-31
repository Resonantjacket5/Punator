'use strict';

function Punator (){
  console.log("hi");
  this.keywordForm = document.getElementById('keywordForm');
  this.keywordInput = document.getElementById('keyword');
  this.sentenceInput = document.getElementById('sentence');
  this.keywordSynonyms = document.getElementById('keywordSynonyms');


  this.keywordForm.addEventListener('submit', this.submitKeyAndSentence.bind(this));
  //this.checkSetup();
  //this.initFirebase();
}

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
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

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
};

Punator.prototype.fetchBigHugeLabs = (word)=>{
  request('GET','https://words.bighugelabs.com/api/2/29017c6048fadaa546444cb9b1088e33/'+word+'/json').then((val)=>{
    console.log(val.target.response);
    return val.target.response;
  }).then((e)=>{
    // handle errors
  });
}

Punator.prototype.fetchBigHugeLabsSynonyms = (word)=>{
  return request('GET','https://words.bighugelabs.com/api/2/29017c6048fadaa546444cb9b1088e33/'+word+'/json').then((val)=>{
    console.log(val.target.response);
    if(val.target.response==""){
      console.log("empty");
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

Punator.prototype.fetchBigHugeLabsSpecific = (word,type)=>{
  request('GET','https://words.bighugelabs.com/api/2/29017c6048fadaa546444cb9b1088e33/'+word+'/json').then((val)=>{
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

Punator.prototype.submitKeyAndSentence = function (e){
  // stop the page from refreshing!!!
  e.preventDefault();
  console.log("submitKeyAndSentence");
  //this.submitSentence();
  this.submitKeyword();
  this.sentenceSynonyms();
}

// Finds all synonyms of the sentences
Punator.prototype.sentenceSynonyms = function() {
  var s = this.submitSentence();
  var s = s.split(" ");
  // TODO: error checking that s exists
  //var synonyms = [];
  var senSynPromises = [];

  for(let i =0; i<s.length;i+=1)
  {
    this.fetchBigHugeLabsSynonyms(s[i]).then((syn)=>{
      console.log(syn);
      synonyms.push(syn);
      console.log(synonyms);
    });
  }
}

// Fetches the sentence inputted
Punator.prototype.submitSentence = function (e){
  if(this.sentenceInput.value){
    console.log(this.sentenceInput.value);
    var sentence = this.sentenceInput.value;
    return sentence;
  }
  else {
    console.log("sentence failed");
    // TODO: throw error if sentence not found
  }
}

// do I really need such a simple function?
//Input: "The fox lives on"
//Output: ["The", "fox", "lives", "on"]
// Punator.prototype.splitSentence = function (sentence){
//   return sentence.split(" ");
// }


Punator.prototype.submitKeyword = function (e){
  //e.preventDefault();
  if(this.keywordInput.value /*&& this.checkSignedInWithMessage()*/){
    console.log(this.keywordInput.value);
    //var word = "fish";
    var word = this.keywordInput.value;
    this.fetchBigHugeLabsSynonyms(word).then((syn)=>{

    });
  }
  else {
    console.log("failed");
  }
}

// Checks that the Firebase SDK has been correctly setup and configured.
Punator.prototype.checkSetup = function() {
  if (!firebase || !(firebase.app instanceof Function) || !config) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions.');
  } else if (config.storageBucket === '') {
    window.alert('You have not enabled Firebase Storage prior to importing the firebase SDK. ' +
        'Make sure you go through the codelab setup instructions.');
  }
};

window.punator = new Punator();
