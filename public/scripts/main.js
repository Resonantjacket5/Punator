'use strict';

function Punator (){
  console.log("hi");
  this.keywordForm = document.getElementById('keywordForm');
  this.keywordInput = document.getElementById('keyword');
  this.sentenceInput = document.getElementById('sentence');
  this.keywordSynonyms = document.getElementById('keywordSynonyms');


  this.keywordForm.addEventListener('submit', this.submitKeyAndSentence());
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

Punator.prototype.fetchBigHugeLabs = (word)=>{
  request('GET','https://words.bighugelabs.com/api/2/29017c6048fadaa546444cb9b1088e33/'+word+'/json').then((val)=>{
    console.log(val.target.response);
    return val.target.response;
  }).then((e)=>{
    // handle errors
  });
}

// Punator.prototype.nearbyWord = (word1,word2)=>{
//   for(let i=0;i<word1.length;i+=1){
//
//   }
// }

Punator.prototype.submitKeyAndSentence = ()=>{
  this.submitKeyword();
}

Punator.prototype.submitSentence = function (e){
  e.preventDefault();
  if(this.sentenceInput.value /*&& this.checkSignedInWithMessage()*/){
    console.log(this.sentenceInput.value);
    //var word = "fish";
    var word = this.sentenceInput.value;
    //this.fetchBigHugeLabs(word);
  }
  else {
    console.log("sentence failed");
  }
}

Punator.prototype.submitKeyword = function (e){
  e.preventDefault();
  if(this.keywordInput.value /*&& this.checkSignedInWithMessage()*/){
    console.log(this.keywordInput.value);
    //var word = "fish";
    var word = this.keywordInput.value;
    //this.fetchBigHugeLabs(word);
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
