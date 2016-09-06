/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const thesaurus_1 = __webpack_require__(10);
	var Metaphone = __webpack_require__(1);
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
	        var keyWord = this.getKeyword();
	        var keyPromise = this.thesaurus.getSynonyms(keyWord)
	            .then((syns) => {
	            syns.push(keyWord);
	            return syns;
	        });
	        var sentencePromises = this.sentenceSynonyms();
	        Promise.all([keyPromise, sentencePromises]).then((val) => {
	            let punInfo = this.createPun(val[0], val[1]);
	            let rhymedSentenceArr = punInfo[0];
	            let sentenceRatios = punInfo[1];
	            let newSentence = "Error not loaded";
	            let newSentenceArr = [];
	            let oldSentenceArr = this.getSentence().split(" ");
	            if (rhymedSentenceArr.length !== oldSentenceArr.length) {
	                console.error(rhymedSentenceArr, "Rhymed Sentence");
	                console.error(oldSentenceArr, "Old Sentence");
	                throw new Error("Sentence array correct size!");
	            }
	            for (let index = 0; index < oldSentenceArr.length; index++) {
	                let difference = sentenceRatios[index];
	                if (difference <= 2) {
	                    newSentenceArr.push(rhymedSentenceArr[index]);
	                }
	                else {
	                    newSentenceArr.push(oldSentenceArr[index]);
	                }
	            }
	            newSentence = newSentenceArr.join(" ");
	            this.keywordSynonyms.textContent = newSentence;
	        });
	    }
	    sentenceSynonyms() {
	        var rawSentence = this.getSentence();
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
	            return word;
	        }
	        else {
	            console.log("failed");
	        }
	    }
	    createPun(keySynonyms, listOfSentenceSynonyms) {
	        let output;
	        let sentenceLength = listOfSentenceSynonyms.length;
	        let newSentence = [];
	        let sentenceRatios = [];
	        for (let i = 0; i < sentenceLength; i += 1) {
	            let currentWordSynonyms = listOfSentenceSynonyms[i];
	            let matrix = this.productWords(keySynonyms, currentWordSynonyms);
	            let minItem = this.minMatrix(matrix);
	            console.log(minItem);
	            let minRatio = minItem.ratio;
	            console.log(keySynonyms);
	            console.log(keySynonyms[minItem.minLocation.row]);
	            let minKey = keySynonyms[minItem.minLocation.row];
	            let minWordSynonym = currentWordSynonyms[minItem.minLocation.col];
	            newSentence.push(minKey);
	            sentenceRatios.push(minRatio);
	        }
	        return [newSentence, sentenceRatios];
	    }
	    productWords(list1, list2) {
	        var matrix = [];
	        for (let i = 0; i < list1.length; i += 1) {
	            var row = [];
	            for (let j = 0; j < list2.length; j += 1) {
	                var ratio = this.metaphoneCompare(list1[i], list2[j]);
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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/*
	Copyright (c) 2011, Chris Umbel

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	*/

	var Phonetic = __webpack_require__(2);

	function dedup(token) {
	    return token.replace(/([^c])\1/g, '$1');
	}

	function dropInitialLetters(token) {
	    if(token.match(/^(kn|gn|pn|ae|wr)/))
	        return token.substr(1, token.length - 1);
	        
	    return token;
	}

	function dropBafterMAtEnd(token) {
	    return token.replace(/mb$/, 'm');
	}

	function cTransform(token) {
	    

	    token = token.replace(/([^s]|^)(c)(h)/g, '$1x$3').trim();


	    token = token.replace(/cia/g, 'xia');
	    token = token.replace(/c(i|e|y)/g, 's$1');
	    token = token.replace(/c/g, 'k'); 
	    
	    return token;
	}

	function dTransform(token) {
	    token = token.replace(/d(ge|gy|gi)/g, 'j$1');
	    token = token.replace(/d/g, 't');
	    
	    return token;
	}

	function dropG(token) {
	    token = token.replace(/gh(^$|[^aeiou])/g, 'h$1');
	    token = token.replace(/g(n|ned)$/g, '$1');    
	    
	    return token;
	}

	function transformG(token) {
	    token = token.replace(/gh/g, 'f'); 
	    token = token.replace(/([^g]|^)(g)(i|e|y)/g, '$1j$3');
	    token = token.replace(/gg/g, 'g');
	    token = token.replace(/g/g, 'k');    
	    
	    return token;
	}

	function dropH(token) {
	    return token.replace(/([aeiou])h([^aeiou]|$)/g, '$1$2');
	}

	function transformCK(token) {
	    return token.replace(/ck/g, 'k');
	}
	function transformPH(token) {
	    return token.replace(/ph/g, 'f');
	}

	function transformQ(token) {
	    return token.replace(/q/g, 'k');
	}

	function transformS(token) {
	    return token.replace(/s(h|io|ia)/g, 'x$1');
	}

	function transformT(token) {
	    token = token.replace(/t(ia|io)/g, 'x$1');
	    token = token.replace(/th/, '0');
	    
	    return token;
	}

	function dropT(token) {
	    return token.replace(/tch/g, 'ch');
	}

	function transformV(token) {
	    return token.replace(/v/g, 'f');
	}

	function transformWH(token) {
	    return token.replace(/^wh/, 'w');
	}

	function dropW(token) {
	    return token.replace(/w([^aeiou]|$)/g, '$1');
	}

	function transformX(token) {
	    token = token.replace(/^x/, 's');
	    token = token.replace(/x/g, 'ks');
	    return token;
	}

	function dropY(token) {
	    return token.replace(/y([^aeiou]|$)/g, '$1');
	}

	function transformZ(token) {
	    return token.replace(/z/, 's');
	}

	function dropVowels(token) {
	    return token.charAt(0) + token.substr(1, token.length).replace(/[aeiou]/g, '');
	}

	var Metaphone = new Phonetic();
	module.exports = Metaphone;

	Metaphone.process = function(token, maxLength) {
	    maxLength == maxLength || 32;
	    token = token.toLowerCase();
	    token = dedup(token);
	    token = dropInitialLetters(token);
	    token = dropBafterMAtEnd(token);
	    token = transformCK(token);
	    token = cTransform(token);
	    token = dTransform(token);
	    token = dropG(token);
	    token = transformG(token);
	    token = dropH(token);
	    token = transformPH(token);
	    token = transformQ(token);
	    token = transformS(token);
	    token = transformX(token);    
	    token = transformT(token);
	    token = dropT(token);
	    token = transformV(token);
	    token = transformWH(token);
	    token = dropW(token);
	    token = dropY(token);
	    token = transformZ(token);
	    token = dropVowels(token);
	    
	    token.toUpperCase();
	    if(token.length >= maxLength)
	        token = token.substring(0, maxLength);        

	    return token.toUpperCase();
	};

	// expose functions for testing    
	Metaphone.dedup = dedup;
	Metaphone.dropInitialLetters = dropInitialLetters;
	Metaphone.dropBafterMAtEnd = dropBafterMAtEnd;
	Metaphone.cTransform = cTransform;
	Metaphone.dTransform = dTransform;
	Metaphone.dropG = dropG;
	Metaphone.transformG = transformG;
	Metaphone.dropH = dropH;
	Metaphone.transformCK = transformCK;
	Metaphone.transformPH = transformPH;
	Metaphone.transformQ = transformQ;
	Metaphone.transformS = transformS;
	Metaphone.transformT = transformT;
	Metaphone.dropT = dropT;
	Metaphone.transformV = transformV;
	Metaphone.transformWH = transformWH;
	Metaphone.dropW = dropW;
	Metaphone.transformX = transformX;
	Metaphone.dropY = dropY;
	Metaphone.transformZ = transformZ;
	Metaphone.dropVowels = dropVowels;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*
	Copyright (c) 2011, Chris Umbel

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	*/

	var stopwords = __webpack_require__(3);
	var Tokenizer = __webpack_require__(4),
	    tokenizer = new Tokenizer();

	module.exports = function() {
	    this.compare = function(stringA, stringB) {
	        return this.process(stringA) == this.process(stringB);
	    };

	    this.attach = function() {
		var phonetic = this;

	        String.prototype.soundsLike = function(compareTo) {
	            return phonetic.compare(this, compareTo);
	        }
	        
	        String.prototype.phonetics = function() {
	            return phonetic.process(this);
	        }
		
	        String.prototype.tokenizeAndPhoneticize = function(keepStops) {
	            var phoneticizedTokens = [];
	            
	            tokenizer.tokenize(this).forEach(function(token) {
	                if(keepStops || stopwords.words.indexOf(token) < 0)
	                    phoneticizedTokens.push(token.phonetics());
	            });
	            
	            return phoneticizedTokens;
	        }
	    };
	};


/***/ },
/* 3 */
/***/ function(module, exports) {

	/*
	Copyright (c) 2011, Chris Umbel

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	*/

	// a list of commonly used words that have little meaning and can be excluded
	// from analysis.
	var words = [
	    'about', 'after', 'all', 'also', 'am', 'an', 'and', 'another', 'any', 'are', 'as', 'at', 'be',
	    'because', 'been', 'before', 'being', 'between', 'both', 'but', 'by', 'came', 'can',
	    'come', 'could', 'did', 'do', 'each', 'for', 'from', 'get', 'got', 'has', 'had',
	    'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how', 'if', 'in', 'into',
	    'is', 'it', 'like', 'make', 'many', 'me', 'might', 'more', 'most', 'much', 'must',
	    'my', 'never', 'now', 'of', 'on', 'only', 'or', 'other', 'our', 'out', 'over',
	    'said', 'same', 'see', 'should', 'since', 'some', 'still', 'such', 'take', 'than',
	    'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those',
	    'through', 'to', 'too', 'under', 'up', 'very', 'was', 'way', 'we', 'well', 'were',
	    'what', 'where', 'which', 'while', 'who', 'with', 'would', 'you', 'your',
	    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
	    'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '$', '1',
	    '2', '3', '4', '5', '6', '7', '8', '9', '0', '_'];
	    
	// tell the world about the noise words.    
	exports.words = words;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*
	Copyright (c) 2011, Chris Umbel

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	*/

	var Tokenizer = __webpack_require__(5),
	    util = __webpack_require__(6);

	var AggressiveTokenizer = function() {
	    Tokenizer.call(this);    
	};
	util.inherits(AggressiveTokenizer, Tokenizer);

	module.exports = AggressiveTokenizer;

	AggressiveTokenizer.prototype.tokenize = function(text) {
	    // break a string up into an array of tokens by anything non-word
	    return this.trim(text.split(/\W+/));
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	/*
	Copyright (c) 2011, Chris Umbel

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	*/

	/**
	 * \@todo Use .bind() in Tokenizer.prototype.attach().
	 */

	var Tokenizer = function() {
	};

	Tokenizer.prototype.trim = function(array) {
	  while (array[array.length - 1] == '')
	    array.pop();

	  while (array[0] == '')
	    array.shift();

	  return array;
	};

	// Expose an attach function that will patch String with new methods.
	Tokenizer.prototype.attach = function() {
	  var self = this;

	  String.prototype.tokenize = function() {
	    return self.tokenize(this);
	  }
	};

	Tokenizer.prototype.tokenize = function() {};

	module.exports = Tokenizer;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(8);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(9);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(7)))

/***/ },
/* 7 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 9 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";
	class BigHugeLabsThesaurus {
	    constructor(api_key) {
	        this.obj = {
	            found: false,
	            type: []
	        };
	        this.api_key = "none";
	        this.website = "https://words.bighugelabs.com/api/2/";
	        this.api_key = api_key;
	        if (!api_key) {
	            throw new Error("No API key passed!");
	        }
	        else {
	            this.website += api_key + '/';
	        }
	    }
	    getSynonyms(word) {
	        return this.getWordInfo(word).then((wordInfo) => {
	            let syn = [];
	            for (let type in wordInfo) {
	                if (wordInfo[type].syn !== undefined) {
	                    syn = syn.concat(wordInfo[type].syn);
	                }
	            }
	            return syn;
	        });
	    }
	    getWordInfo(word) {
	        return Network.request('GET', this.website + word + '/json')
	            .then((val) => {
	            let status = val.target.status;
	            if (status === 200 || status === 303) {
	                console.log(val.target.response);
	                if (val.target.response == "") {
	                    console.error("empty");
	                }
	                let jsonObj = JSON.parse(val.target.response);
	                return jsonObj;
	            }
	            else {
	                this.obj.found = false;
	            }
	        });
	    }
	}
	exports.BigHugeLabsThesaurus = BigHugeLabsThesaurus;
	var Network;
	(function (Network) {
	    function request(method, url) {
	        return new Promise(function (resolve, reject) {
	            var xhr = new XMLHttpRequest();
	            xhr.open(method, url);
	            xhr.onload = resolve;
	            xhr.onerror = reject;
	            xhr.send();
	        });
	    }
	    Network.request = request;
	})(Network || (Network = {}));


/***/ }
/******/ ]);