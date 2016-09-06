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
