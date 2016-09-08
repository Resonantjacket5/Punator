'use strict';
const thesaurus_1 = require("./thesaurus");
var Metaphone = require("natural/lib/natural/phonetics/metaphone.js");
class Punator {
    constructor() {
        this.keywordForm = document.getElementById('keywordForm');
        this.keywordInput = document.getElementById('keyword');
        this.sentenceInput = document.getElementById('sentence');
        this.keywordSynonyms = document.getElementById('keywordSynonyms');
        console.log(Metaphone.process("train"));
        this.thesaurus = new thesaurus_1.BigHugeLabsThesaurus("29017c6048fadaa546444cb9b1088e33");
        this.keywordForm.addEventListener('submit', this.submitKeyAndSentence.bind(this));
    }
    ;
    submitKeyAndSentence(e) {
        e.preventDefault();
        console.log("submitKeyAndSentence");
        let keyWord = this.getKeyword();
        let sentence = this.getSentence();
        this.managePun(keyWord, sentence);
        return null;
    }
    managePun(keyword, rawSentence) {
        let keyPromise = this.thesaurus.getSynonyms(keyword)
            .then((syns) => {
            syns.push(keyword);
            return syns;
        });
        let sentencePromises = this.sentenceSynonyms(rawSentence);
        Promise.all([keyPromise, sentencePromises]).then((val) => {
            this.createPun(val);
        });
    }
    createPun(val) {
        let punInfo = this.compareKeySynonymsAndSentence(val[0], val[1]);
        let rhymedSentenceArr = punInfo[0];
        let sentenceRatios = punInfo[1];
        let newSentence = "Error not loaded";
        let newSentenceArr = [];
        let oldSentenceArr = this.getSentence().split(" ");
        if (rhymedSentenceArr.length !== oldSentenceArr.length) {
            console.error(rhymedSentenceArr, "Rhymed Sentence");
            console.error(oldSentenceArr, "Old Sentence");
            throw new Error("Sentence array incorrect size!");
        }
        for (let index = 0; index < oldSentenceArr.length; index++) {
            let difference = sentenceRatios[index];
            if (difference <= 1) {
                newSentenceArr.push(rhymedSentenceArr[index]);
            }
            else {
                newSentenceArr.push(oldSentenceArr[index]);
            }
        }
        newSentence = newSentenceArr.join(" ");
        this.keywordSynonyms.textContent = newSentence;
    }
    sentenceSynonyms(rawSentence2 = null) {
        let rawSentence = "";
        if (rawSentence2 !== null) {
            rawSentence = rawSentence2;
        }
        else {
            rawSentence = this.getSentence();
        }
        var s = rawSentence.split(" ");
        var arrSenSynPromises = [];
        for (let i = 0; i < s.length; i += 1) {
            arrSenSynPromises.push(this.thesaurus.getSynonyms(s[i]));
        }
        return Promise.all(arrSenSynPromises);
    }
    getSentence() {
        if (this.sentenceInput.value) {
            console.log(this.sentenceInput.value);
            var sentence = this.sentenceInput.value;
            this.sentence = sentence;
            return sentence;
        }
        else {
            console.log("sentence failed or empty");
            throw new Error("sentence not found");
        }
    }
    getKeyword() {
        if (this.keywordInput.value) {
            var word = this.keywordInput.value;
            this.keyword = word;
            return word;
        }
        else {
            console.log("failed");
        }
    }
    compareKeySynonymsAndSentence(keySynonyms, listOfSentenceSynonyms) {
        let output;
        let sentenceLength = listOfSentenceSynonyms.length;
        let newSentence = [];
        let sentenceRatios = [];
        for (let i = 0; i < sentenceLength; i++) {
            let currentWordSynonyms = listOfSentenceSynonyms[i];
            let matrix = this.productWords(keySynonyms, currentWordSynonyms, this.metaphoneCompare);
            let minItem = this.minMatrix(matrix);
            let minRatio = minItem.ratio;
            let minKey = keySynonyms[minItem.minLocation.row];
            let minWordSynonym = currentWordSynonyms[minItem.minLocation.col];
            newSentence.push(minKey);
            sentenceRatios.push(minRatio);
        }
        return [newSentence, sentenceRatios];
    }
    productWords(list1, list2, compareFunction) {
        var matrix = [];
        for (let i = 0; i < list1.length; i += 1) {
            var row = [];
            for (let j = 0; j < list2.length; j += 1) {
                var ratio = compareFunction(list1[i], list2[j]);
                console.log(list1[i] + " " + list2[j] + " " + ratio);
                row.push(ratio);
            }
            matrix.push(row);
        }
        console.info(matrix);
        return matrix;
    }
    minMatrix(matrix) {
        console.log(matrix);
        var numRows = matrix.length;
        var numCols = matrix[0].length;
        var minRatio = 999;
        var minLocation = { row: null, col: null };
        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
                var ratio = matrix[i][j];
                if (ratio < minRatio) {
                    minRatio = ratio;
                    minLocation = { row: i, col: j };
                }
            }
        }
        return { ratio: minRatio, minLocation };
    }
    metaphoneCompare(word1, word2) {
        let code1 = Metaphone.process(word1);
        let code2 = Metaphone.process(word2);
        return getEditDistance(code1, code2);
    }
    rawCompare(word1, word2) {
        var editDistance = getEditDistance(word1, word2);
        var larger = Math.max(word1.length, word2.length);
        var ratio = editDistance / larger;
        return ratio;
    }
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
window.punator = new Punator();
