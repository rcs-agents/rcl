/**
 * RCL keyword patterns (reserved words, section types, etc.)
 */

type Repository = any;

const SECTION_KEYWORDS = [
	'agent',
	'agentConfig',
	'agentDefaults',
	'agentMessage',
	'flow',
	'messages',
	'message',
	'authentication message',
	'transaction message',
	'promotion message',
	'servicerequest message',
	'acknowledge message',
	'Config',
	'Defaults',
	'Messages',
].join('|');

const IMPORT_KEYWORDS = ['import', 'as', "'s"].join('|');

const BOOLEAN_KEYWORDS = [
	'True',
	'On',
	'Yes',
	'Active',
	'Enabled',
	'False',
	'Off',
	'No',
	'Inactive',
	'Disabled',
].join('|');

const NULL_KEYWORD = 'Null';

const TYPE_TAG_KEYWORDS = ['date', 'datetime', 'time', 'email', 'phone', 'msisdn', 'url', 'zipcode', 'zip'].join('|');

const sectionKeywords: any = {
	key: 'section_keywords',
	scope: 'keyword.control.section.rcl',
	match: new RegExp(`\\b(${SECTION_KEYWORDS})\\b`),
};

const importKeywords: any = {
	key: 'import_keywords',
	scope: 'keyword.control.import.rcl',
	match: new RegExp(`\\b(${IMPORT_KEYWORDS})\\b`),
};

const booleanKeywords: any = {
	key: 'boolean_keywords',
	scope: 'constant.language.boolean.rcl',
	match: new RegExp(`\\b(${BOOLEAN_KEYWORDS})\\b`),
};

const nullKeyword: any = {
	key: 'null_keyword',
	scope: 'constant.language.null.rcl',
	match: new RegExp(`\\b(${NULL_KEYWORD})\\b`),
};

const typeTagKeywords: any = {
	key: 'type_tag_keywords',
	scope: 'storage.type.tag.rcl',
	match: new RegExp(`\\b(${TYPE_TAG_KEYWORDS})\\b`),
};

export const keywordsRepository: Repository = {
	section_keywords: sectionKeywords,
	import_keywords: importKeywords,
	boolean_keywords: booleanKeywords,
	null_keyword: nullKeyword,
	type_tag_keywords: typeTagKeywords,
}; 