grammar SampleGram

/** A textual representation of a state machine */
entry Sample:
    (phrases+=Phrase | cmds+=Command)+;

terminal YES: /\byes\b/;
terminal NO: /\bno\b/;
// terminal WORD: /[\w]+/;
terminal WORDS: /[^$]+/;

hidden terminal WS: /[ \t\r\n]+/;

Phrase: 'phrase' value+=WORDS*;

Command: 'cmd' name='suceeded' value=(YES|NO);