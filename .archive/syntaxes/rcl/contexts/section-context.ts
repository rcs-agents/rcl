/**
 * RCL Section-Level Context Patterns
 * Defines what can appear inside an RCL section (e.g., properties, nested sections).
 */

type Repository = any;

const sectionLevelPatterns: any = {
	key: 'section_level_patterns',
	patterns: [{ include: '#comments' }, { include: '#property_assignment' }, { include: '#subsection' }],
};

const subsection: any = {
	key: 'subsection',
	patterns: [
		{ include: '#config_section' },
		{ include: '#defaults_section' },
		{ include: '#messages_section' },
		{ include: '#flow_section' },
	],
};

const sectionContent: any = {
	key: 'section_content',
	patterns: [
		{ include: '#comments' },
		{ include: '#property_assignment' },
		{ include: '#embedded_expressions' },
		{ include: '#collections' },
		{ include: '#primitives' },
	],
};

export const sectionContextRepository: Repository = {
	section_level_patterns: sectionLevelPatterns,
	subsection,
	section_content: sectionContent,
}; 