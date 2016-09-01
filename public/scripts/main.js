/*jshint globalstrict: true*/
/*jslint browser:true */
'use strict';

function Punator() {
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
};

Punator.prototype.fetchBigHugeLabs = (word)=>{
  request('GET','https://words.bighugelabs.com/api/2/29017c6048fadaa546444cb9b1088e33/'+word+'/json').then((val)=>{
    console.log(val.target.response);
    return val.target.response;
  }).then((e)=>{
    // handle errors
  });
};

// TODO: Future should generalize this so other thesauruses
// can be called and easily subsistute Api's

Punator.prototype.fetchBigHugeLabsSynonyms = (word)=>{
  return request('GET','https://words.bighugelabs.com/api/2/29017c6048fadaa546444cb9b1088e33/'+word+'/json').then((val)=>{
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
};

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

/*
  Handle fetching both the
  keyPromise and the sentencePromises
  then work on the comparing the two of them.

*/


Punator.prototype.submitKeyAndSentence = function(e){
  // stop the page from refreshing!!!
  e.preventDefault();
  console.log("submitKeyAndSentence");

  var keyWord = this.getKeyword();
  var keyPromise = this.fetchBigHugeLabsSynonyms(keyWord)
  .then((syns)=>{
    syns.push(keyWord);
    return syns;
  });

  var sentencePromises = this.sentenceSynonyms();

  // Wait for all promises to finish
  Promise.all([keyPromise,sentencePromises]).then((val)=>{
    //var newSentence = this.compareAll(val[0],val[1]);
    var newSentence = this.createPun(val[0],val[1]);//.bind(this);
    console.log(newSentence);
    newSentence = newSentence.join(" ");
    this.keywordSynonyms.textContent = newSentence;
  });
};

// Finds all synonyms of the sentences
// Returns a promise with
// Output: ["The", "fox", "lives", "on"]
// Punator.prototype.splitSentence = function (sentence){
//   return sentence.split(" ");
// }
Punator.prototype.sentenceSynonyms = function() {
  var s = this.getSentence();
  var s = s.split(" ");
  // TODO: error checking that s exists
  //var synonyms = [];
  var arrSenSynPromises = [];

  for(let i =0; i<s.length;i+=1)
  {
    arrSenSynPromises.push(this.fetchBigHugeLabsSynonyms(s[i]));
    // this.fetchBigHugeLabsSynonyms(s[i]).then((syn)=>{
    //   console.log(syn);
    //   synonyms.push(syn);
    //   console.log(synonyms);
    // });
  }

  return Promise.all(arrSenSynPromises);
};

// Fetches the sentence inputted
Punator.prototype.getSentence = function (e){
  if(this.sentenceInput.value){
    console.log(this.sentenceInput.value);
    var sentence = this.sentenceInput.value;
    return sentence;
  }
  else {
    console.log("sentence failed");
    // TODO: throw error if sentence not found
  }
};

// do I really need such a simple function?
//Input: "The fox lives on"
//Output: ["The", "fox", "lives", "on"]
// Punator.prototype.splitSentence = function (sentence){
//   return sentence.split(" ");
// }


Punator.prototype.getKeyword = function (e){
  //e.preventDefault();
  if(this.keywordInput.value){
    var word = this.keywordInput.value;
    return word;
  }
  else {
    console.log("failed");
  }
};

// Old version of fetching keyWord
Punator.prototype.submitKeyword = function (e){
  //e.preventDefault();
  if(this.keywordInput.value /*&& this.checkSignedInWithMessage()*/){
    console.log(this.keywordInput.value);
    //var word = "fish";
    var word = this.keywordInput.value;
    // return new Promise((resolve,reject)=>{
    //   resolve(word);
    // });

    return this.fetchBigHugeLabsSynonyms(word).then((syn)=>{
      return syn;
    });
  }
  else {
    console.log("failed");
  }
};


// Returns a matrix of two vectors of words
// with the score of their raw scores
/*        list2  a   b   c
  list1 1         .   .   .
        2         .   .   .
        3         .   .   .
*/
Punator.prototype.productWords = function(list1, list2){
  var matrix = [];
  for(let i=0; i<list1.length;i+=1)
  {
    var row=[];
    for(let j=0;j<list2.length;j+=1)
    {
      var ratio = this.rawCompare(list1[i],list2[j]);
      console.log(list1[i]+" "+list2[j]+" "+ratio);
      row.push(ratio);
    }
    matrix.push(row);
  }
  return matrix;
};

// row typically correspondes to key synonym
// could probably do this with apply and fancy array stuff
Punator.prototype.minMatrix = (matrix)=>{
  console.log(matrix);
  var numRows = matrix.length;
  var numCols = matrix[0].length;
  var minRatio = 999;
  var minLocation = {};
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
};



/*  input: key synonyms, sentence, synonyms
    keySyn: [one,two,three,four,five,six, ... ]
    senSyns:
    [
      word: (fish) [salmon,tuna,...],
      [],
      []
    ]
*/
Punator.prototype.createPun = function(keySynonyms, listOfSentenceSynonyms){
  var sentenceLength = listOfSentenceSynonyms.length;
  var newSentence = []
  for(let i=0; i<sentenceLength; i+=1)
  {
    var currentWordSynonyms = listOfSentenceSynonyms[i];


    var matrix = this.productWords(keySynonyms,currentWordSynonyms);
    var minItem = this.minMatrix(matrix);
    console.log(minItem);
    var minRatio = minItem.ratio;
    console.log(keySynonyms);
    console.log(keySynonyms[minItem.minLocation.row]);
    var minKey = keySynonyms[minItem.minLocation.row];
    var minWordSynonym = currentWordSynonyms[minItem.minLocation.col];
    newSentence.push(minKey);
  }
  return newSentence;
};




// To large of a function, can't tell what it does
Punator.prototype.compareAll = function (keySyns, senSyns){
  throw new Error("deprecated as too complicated");
  var arrKeySyns = [];
  // Fetch each word in sentece
  for(let i=0;i<senSyns.length;i++)
  {
    // list of synonyms for the word
    var wordSyns=senSyns[i];
    // Best keySynonym for the Word in the sentence
    var keySynsForWordSyns =[];

    // Fetch the synonyms for the current word
    for(let j=0;j<wordSyns.length;j++)
    {
      // Currrent synonym of the word
      var wordSyn = wordSyns[j];
      var minKeySynForWordSyn = {ratio:99};

      // For each word synonym compare against the key synonyms
      // and find the best Key Synonym
      for(let k=0;k<keySyns.length;k++)
      {
        var keySyn = keySyns[k];
        var ratio = this.rawCompare(keySyn,wordSyn);
        if(ratio<minKeySynForWordSyn.ratio)
        {
          minKeySynForWordSyn = {
            ratio:ratio,
            keySyn: keySyn
          }
        }
      }

      // After finding the best KeySyn accounting for all synonyms of the word
      // add it
      keySynsForWordSyns.push(minKeySynForWordSyn);
    }

    var tempRatio = 999;
    var minKeySynForWordSyns = {};

    // find the lowest ratio of the key for the word
    for(let l=0;l<keySynsForWordSyns.length;l+=1)
    {
      var info = keySynsForWordSyns[l];
      if(info.ratio<tempRatio)
      {
        minKeySynForWordSyns=info;
      }
    }

    arrKeySyns.push(minKeySynForWordSyns);
  }
  return arrKeySyns;
};






Punator.prototype.rawCompare = (word1, word2) =>{
  var editDistance = getEditDistance(word1,word2);
  var larger = Math.max(word1.length,word2.length);
  var ratio = editDistance/larger;
  return ratio;
};



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
