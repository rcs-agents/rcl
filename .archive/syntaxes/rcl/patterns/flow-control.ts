/**
 * RCL Flow Control Structure Patterns
 * (e.g., if/when/unless condition then/do block end)
 */

type Repository = any;

const CONDITIONAL_KEYWORDS = ['if', 'when', 'unless'].join('|');
const CONDITIONAL_ELSE_KEYWORDS = ['else', 'otherwise'].join('|');
const LOOP_KEYWORDS = ['for', 'while', 'repeat'].join('|');
const LOOP_CONTROL_KEYWORDS = ['break', 'continue'].join('|');
const RETURN_KEYWORD = 'return';
const ERROR_HANDLING_KEYWORDS = ['try', 'catch', 'finally'].join('|');
const THROW_KEYWORD = 'throw';

const conditional: any = {
	key: 'conditional',
	scope: 'meta.conditional.rcl',
	begin: new RegExp(`\\b(${CONDITIONAL_KEYWORDS})\\b`),
	beginCaptures: {
		'0': { scope: 'keyword.control.conditional.rcl' },
	},
	end: /(?=\n|$)/,
	patterns: [{ include: '#expressions' }, { include: '#primitives' }],
};

const conditionalElse: any = {
	key: 'conditional_else',
	scope: 'keyword.control.conditional.rcl',
	match: new RegExp(`\\b(${CONDITIONAL_ELSE_KEYWORDS})\\b`),
};

const loop: any = {
	key: 'loop',
	scope: 'meta.loop.rcl',
	begin: new RegExp(`\\b(${LOOP_KEYWORDS})\\b`),
	beginCaptures: {
		'0': { scope: 'keyword.control.loop.rcl' },
	},
	end: /(?=\n|$)/,
	patterns: [{ include: '#expressions' }, { include: '#primitives' }],
};

const loopControl: any = {
	key: 'loop_control',
	scope: 'keyword.control.loop.rcl',
	match: new RegExp(`\\b(${LOOP_CONTROL_KEYWORDS})\\b`),
};

const returnStatement: any = {
	key: 'return_statement',
	scope: 'meta.return.rcl',
	begin: new RegExp(`\\b(${RETURN_KEYWORD})\\b`),
	beginCaptures: {
		'0': { scope: 'keyword.control.return.rcl' },
	},
	end: /(?=\n|$)/,
	patterns: [{ include: '#expressions' }, { include: '#primitives' }],
};

const errorHandling: any = {
	key: 'error_handling',
	scope: 'meta.error-handling.rcl',
	begin: new RegExp(`\\b(${ERROR_HANDLING_KEYWORDS})\\b`),
	beginCaptures: {
		'0': { scope: 'keyword.control.exception.rcl' },
	},
	end: /(?=\n|$)/,
	patterns: [{ include: '#expressions' }, { include: '#primitives' }],
};

const throwStatement: any = {
	key: 'throw_statement',
	scope: 'meta.throw.rcl',
	begin: new RegExp(`\\b(${THROW_KEYWORD})\\b`),
	beginCaptures: {
		'0': { scope: 'keyword.control.exception.rcl' },
	},
	end: /(?=\n|$)/,
	patterns: [{ include: '#expressions' }, { include: '#primitives' }],
};

export const flowControlRepository: Repository = {
	conditional,
	conditional_else: conditionalElse,
	loop,
	loop_control: loopControl,
	return_statement: returnStatement,
	error_handling: errorHandling,
	throw_statement: throwStatement,
}; 