/**
 * RCL file-level context patterns
 */

type Repository = any;

export const fileLevelPatterns: any = {
	key: 'file_level_patterns',
	patterns: [
		{ include: '#comments' },
		{ include: '#import_statement' },
		{ include: '#agent_section' },
		{ include: '#message_definition' },
		{ include: '#agent_message_definition' },
	],
};

export const fileLevelWhitespace: any = {
	key: 'file_level_whitespace',
	patterns: [
		{
			key: 'file_level_whitespace',
			scope: 'meta.whitespace.file.rcl',
			match: '^\\s*$',
		},
	],
};

export const fileContext: any = {
	key: 'file_context',
	patterns: [{ include: '#file_level_patterns' }, { include: '#file_level_whitespace' }],
};

export const fileContextRepository: Repository = {
	file_level_patterns: fileLevelPatterns,
	file_level_whitespace: fileLevelWhitespace,
	file_context: fileContext,
}; 