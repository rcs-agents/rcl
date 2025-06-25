/**
 * RCL embedded expression patterns ($js>, $ts>, etc.)
 */

type Repository = any;

const inlineJsEmbedded: any = {
	key: 'embedded_js_inline',
	scope: 'meta.embedded.inline.javascript.rcl',
	begin: /\$js>/,
	end: /\$/,
	contentName: 'source.js',
	patterns: [{ include: 'source.js' }],
};

const inlineTsEmbedded: any = {
	key: 'embedded_ts_inline',
	scope: 'meta.embedded.inline.typescript.rcl',
	begin: /\$ts>/,
	end: /\$/,
	contentName: 'source.ts',
	patterns: [{ include: 'source.ts' }],
};

const multilineJsEmbedded: any = {
	key: 'embedded_js_multiline',
	scope: 'meta.embedded.block.javascript.rcl',
	begin: /\$js>>>/,
	end: /^(?!\s+\S)/, // Dedent pattern
	contentName: 'source.js',
	patterns: [{ include: 'source.js' }],
};

const multilineTsEmbedded: any = {
	key: 'embedded_ts_multiline',
	scope: 'meta.embedded.block.typescript.rcl',
	begin: /\$ts>>>/,
	end: /^(?!\s+\S)/, // Dedent pattern
	contentName: 'source.ts',
	patterns: [{ include: 'source.ts' }],
};

export const embeddedExpressionsRepository: Repository = {
	embedded_js_inline: inlineJsEmbedded,
	embedded_ts_inline: inlineTsEmbedded,
	embedded_js_multiline: multilineJsEmbedded,
	embedded_ts_multiline: multilineTsEmbedded,
}; 