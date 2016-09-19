# Punator

## Synopsis

Really simple web app. It simply takes a sentence and tries to replace each word with relevant words close to the **keyword**.

The keyword is the one that app is trying to *pun* towards. For instance with the sentence "There are many pieces" and the keyword *fish* it's hoped that the app will find "Pisces" as near *fish*. With this nearby word it'll notice that "pieces" and "Pisces" are similar in sound (utilizing metaphone) and replace it. 

## How to use

Simply type in a sentence, a **keyword** (the word you're trying to find puns for), and the desired tolerance level. The lower the tolerance the more strictly the sentence's words will have to match the keyword's synonyms. Also no puntuaction for now please.


## Backend

Currently the app uses BigHugeLab's thesaurus free key (awesome people) which limits the app to 1000 lookups a day. 

## Future todo

* More thesauruses/keys! The more similar words to the **keyword** the better choices for it to find
* Better sound comparison! The current algorithm of metaphone is fine, but more advanced algorithms would be able to find better puns
* Handle punctuation




