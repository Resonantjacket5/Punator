'use strict';
class Punator {
    constructor() {
        this.keywordForm = document.getElementById('keywordForm');
        this.keywordInput = document.getElementById('keyword');
        this.sentenceInput = document.getElementById('sentence');
        this.keywordSynonyms = document.getElementById('keywordSynonyms');
        console.log("hi");
        this.keywordForm.addEventListener('submit', this.submitKeyAndSentence.bind(this));
    }
    ;
}
Punator.prototype.fetchBigHugeLabs = function (word) {
    request('GET', 'https://words.bighugelabs.com/api/2/29017c6048fadaa546444cb9b1088e33/' + word + '/json').then((val) => {
        console.log(val.target.response);
        return val.target.response;
    }).then((e) => {
    });
};
Punator.prototype.fetchBigHugeLabsSynonyms = (word) => {
    return request('GET', 'https://words.bighugelabs.com/api/2/29017c6048fadaa546444cb9b1088e33/' + word + '/json').then((val) => {
        console.log(val.target.response);
        if (val.target.response == "") {
            console.error("empty");
            console.error(word);
            return null;
        }
        var jsonObj = JSON.parse(val.target.response);
        console.log(jsonObj.noun.syn);
        return jsonObj.noun.syn;
    });
};
Punator.prototype.fetchBigHugeLabsSpecific = (word, type) => {
    request('GET', 'https://words.bighugelabs.com/api/2/29017c6048fadaa546444cb9b1088e33/' + word + '/json').then((val) => {
        console.log(val.target.response);
        return val.target.response.noun[type];
    }).then((e) => {
    });
};
Punator.prototype.submitKeyAndSentence = function (e) {
    e.preventDefault();
    console.log("submitKeyAndSentence");
    var keyWord = this.getKeyword();
    var keyPromise = this.fetchBigHugeLabsSynonyms(keyWord)
        .then((syns) => {
        syns.push(keyWord);
        return syns;
    });
    var sentencePromises = this.sentenceSynonyms();
    Promise.all([keyPromise, sentencePromises]).then((val) => {
        var newSentence = this.createPun(val[0], val[1]);
        console.log(newSentence);
        newSentence = newSentence.join(" ");
        this.keywordSynonyms.textContent = newSentence;
    });
};
Punator.prototype.sentenceSynonyms = function () {
    var s = this.getSentence();
    var s = s.split(" ");
    var arrSenSynPromises = [];
    for (let i = 0; i < s.length; i += 1) {
        arrSenSynPromises.push(this.fetchBigHugeLabsSynonyms(s[i]));
    }
    return Promise.all(arrSenSynPromises);
};
Punator.prototype.getSentence = function (e) {
    if (this.sentenceInput.value) {
        console.log(this.sentenceInput.value);
        var sentence = this.sentenceInput.value;
        return sentence;
    }
    else {
        console.log("sentence failed");
    }
};
Punator.prototype.getKeyword = function (e) {
    if (this.keywordInput.value) {
        var word = this.keywordInput.value;
        return word;
    }
    else {
        console.log("failed");
    }
};
Punator.prototype.productWords = function (list1, list2) {
    var matrix = [];
    for (let i = 0; i < list1.length; i += 1) {
        var row = [];
        for (let j = 0; j < list2.length; j += 1) {
            var ratio = this.rawCompare(list1[i], list2[j]);
            console.log(list1[i] + " " + list2[j] + " " + ratio);
            row.push(ratio);
        }
        matrix.push(row);
    }
    return matrix;
};
Punator.prototype.minMatrix = function (matrix) {
    console.log(matrix);
    var numRows = matrix.length;
    var numCols = matrix[0].length;
    var minRatio = 999;
    var minLocation = {};
    for (let i = 0; i < numRows; i += 1) {
        for (let j = 0; j < numCols; j += 1) {
            var ratio = matrix[i][j];
            if (ratio < minRatio) {
                minRatio = ratio;
                minLocation = { row: i, col: j };
            }
        }
    }
    return { ratio: minRatio, minLocation };
};
Punator.prototype.createPun = function (keySynonyms, listOfSentenceSynonyms) {
    var sentenceLength = listOfSentenceSynonyms.length;
    var newSentence = [];
    for (let i = 0; i < sentenceLength; i += 1) {
        var currentWordSynonyms = listOfSentenceSynonyms[i];
        var matrix = this.productWords(keySynonyms, currentWordSynonyms);
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
Punator.prototype.rawCompare = function (word1, word2) {
    var editDistance = getEditDistance(word1, word2);
    var larger = Math.max(word1.length, word2.length);
    var ratio = editDistance / larger;
    return ratio;
};
Punator.prototype.checkSetup = function () {
    if (!firebase || !(firebase.app instanceof Function) || !window.config) {
        window.alert('You have not configured and imported the Firebase SDK. ' +
            'Make sure you go through the codelab setup instructions.');
    }
    else if (config.storageBucket === '') {
        window.alert('You have not enabled Firebase Storage prior to importing the firebase SDK. ' +
            'Make sure you go through the codelab setup instructions.');
    }
};
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
    if (a.length === 0) {
        return b.length;
    }
    if (b.length === 0) {
        return a.length;
    }
    var matrix = [];
    var i;
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    var j;
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            }
            else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
}
;
window.punator = new Punator();
