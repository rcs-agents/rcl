/**
 * RCL multiline string patterns (|, |-, +|, +|+)
 */
import { type BeginEndRule, type Rule } from 'tmgrammar-toolkit';

type Repository = Record<string, Rule>;

const multilineStringTrimOneNl: BeginEndRule = {
	key: 'multiline_string_trim_one_nl',
	scope: 'string.unquoted.multiline.trim-one-nl.rcl',
	begin: /\|(?![-+])/,
	beginCaptures: {
		'0': { scope: 'punctuation.definition.string.multiline.begin.rcl' },
	},
	end: /^(?!\s)/,
	patterns: [
		{
			key: 'multiline_content',
			scope: 'string.unquoted.multiline.content.rcl',
			match: /.*/,
		},
	],
};

const multilineStringTrimNoNl: BeginEndRule = {
	key: 'multiline_string_trim_no_nl',
	scope: 'string.unquoted.multiline.trim-no-nl.rcl',
	begin: /\|-/,
	beginCaptures: {
		'0': { scope: 'punctuation.definition.string.multiline.begin.rcl' },
	},
	end: /^(?!\s)/,
	patterns: [
		{
			key: 'multiline_content',
			scope: 'string.unquoted.multiline.content.rcl',
			match: /.*/,
		},
	],
};

const multilineStringKeepOneNl: BeginEndRule = {
	key: 'multiline_string_keep_one_nl',
	scope: 'string.unquoted.multiline.keep-one-nl.rcl',
	begin: /\+\\|(?!\+)/,
	beginCaptures: {
		'0': { scope: 'punctuation.definition.string.multiline.begin.rcl' },
	},
	end: /^(?!\s)/,
	patterns: [
		{
			key: 'multiline_content',
			scope: 'string.unquoted.multiline.content.rcl',
			match: /.*/,
		},
	],
};

const multilineStringKeepAll: BeginEndRule = {
	key: 'multiline_string_keep_all',
	scope: 'string.unquoted.multiline.keep-all.rcl',
	begin: /\+\|\+/,
	beginCaptures: {
		'0': { scope: 'punctuation.definition.string.multiline.begin.rcl' },
	},
	end: /^(?!\s)/,
	patterns: [
		{
			key: 'multiline_content',
			scope: 'string.unquoted.multiline.content.rcl',
			match: /.*/,
		},
	],
};

export const multilineStringsRepository: Repository = {
	multiline_string_trim_one_nl: multilineStringTrimOneNl,
	multiline_string_trim_no_nl: multilineStringTrimNoNl,
	multiline_string_keep_one_nl: multilineStringKeepOneNl,
	multiline_string_keep_all: multilineStringKeepAll,
}; 