grammar Rcl


hidden terminal SL_COMMENT: /#[^\r\n]*/;

terminal __: /[ ]+/;

terminal ATOM: /:([_a-zA-Z][\w_]*|\"[^\"\\]*\")/;
terminal STRING: /\"(\\.|[^\"\\])*\"/;
terminal NUMBER returns number: /[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?([eE][-+]?[0-9]+)?|[0-9]+(\.[0-9]+)?([eE][-+]?[0-9]+)?/;
terminal NL: /[\r\n]+/;                         // Newlines (removed $)

terminal AGENT_CONFIG_KEYWORD: 'agentConfig';
terminal AGENT_DEFAULTS_KEYWORD: 'agentDefaults';
terminal AGENT_MESSAGES_KEYWORD: 'agentMessages';

terminal INDENT: 'synthetic:indent';                 // Indentation increase (will be overridden)
terminal DEDENT: 'synthetic:dedent';                 // Indentation decrease (will be overridden)
terminal LT: '<';
terminal GT: '>';
terminal SLASH: '/';

terminal TRUE_KW: /\b(True|On|Yes|Active|Enabled)\b/;
terminal FALSE_KW: /\b(False|Off|No|Inactive|Disabled)\b/;

EmptyLine returns string: __* NL;


BooleanLiteral infers BooleanValue:
    value=(TRUE_KW | FALSE_KW);

NullValue infers NullValue:
    value='Null';

LiteralValue infers LiteralValue:
    val_str=STRING
    | val_num=NUMBER
    | val_atom=ATOM
    | val_bool=BooleanLiteral
    | val_null=NullValue;


terminal TYPE_TAG_NAME: /(date|datetime|time|email|phone|msisdn|url|zipcode|zip)/;

terminal COMMON_NOUN: /(?!import\b|as\b|agent\b|agentConfig\b|agentDefaults\b|flow\b|messages\b|authentication\b|transaction\b|promotion\b|servicerequest\b|acknowledge\b|message\b|or\b|and\b|is\b|not\b|date\b|datetime\b|time\b|email\b|phone\b|msisdn\b|url\b|zipcode\b|zip\b)[a-z][a-zA-Z0-9_-]*/;

terminal PROPER_NOUN: /\b[A-Z][\w-]*(?:[ \t]+[A-Z][\w-]*)*\b/;

Identifier infers Identifier:
    value=(PROPER_NOUN | COMMON_NOUN);

interface AttributePath {
    parts: string[];
}

AttributePath returns AttributePath:
    parts+=COMMON_NOUN (__? '.' __? parts+=COMMON_NOUN)*;

QualifiedName returns string:
    PROPER_NOUN (__? '/' __? PROPER_NOUN)*;


interface ImportStatement {
    source: string;
    attribute?: AttributePath;  
    alias?: string;
}

ImportStatement returns ImportStatement:
    'import' __ source=ImportPath ("'s" __ attribute=AttributePath)? (__ 'as' __ alias=PROPER_NOUN)? (NL | EOF);

ImportPath returns string:
    PROPER_NOUN (__ '/' __ PROPER_NOUN)*;


SectionType returns string:
  'agent'
  | 'agentConfig'
  | 'agentDefaults'
  | 'flow'
  | 'messages'
  | ((
      'authentication'
      | 'transaction'
      | 'promotion'
      | 'servicerequest'
      | 'acknowledge'
    )
    __ 'message');

ReservedSectionName returns string:
    'Config' | 'Defaults' | 'Messages';


Section:
    (sectionType=SectionType __ sectionName=PROPER_NOUN | sectionType=SectionType? __ reservedName=ReservedSectionName) __? sectionParam=LiteralValue? __? (NL | EOF)
    ;


Attribute:
    key=COMMON_NOUN __? ':' __? value=(LiteralValue | NestedBlockAttribute) __? (NL | EOF);

NestedBlockAttribute:
    key=COMMON_NOUN __? (NL | EOF)
    INDENT
        (attributes+=Attribute)+
    DEDENT;// Rule to handle empty lines within indented blocks


entry RclFile:
    (imports+=ImportStatement)*
    (INDENT? __? NL DEDENT?)*
    agentSection=(Section);

  