//@ts-check
import * as esbuild from "esbuild";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const watch = process.argv.includes("--watch");
const minify = process.argv.includes("--minify");

const success = watch ? "Watch build succeeded" : "Build succeeded";

function getTime() {
	const date = new Date();
	return `[${`${padZeroes(date.getHours())}:${padZeroes(date.getMinutes())}:${padZeroes(date.getSeconds())}`}] `;
}

function padZeroes(i) {
	return i.toString().padStart(2, "0");
}

const plugins = [
	{
		name: "watch-plugin",
		setup(build) {
			build.onEnd((result) => {
				if (result.errors.length === 0) {
					console.log(getTime() + success);
				}
			});
		},
	},
];

// Function to extend the TextMate grammar
function extendTmGrammar() {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const grammarPath = path.join(__dirname, "syntaxes", "rcl.tmLanguage.json");
	try {
		if (!fs.existsSync(grammarPath)) {
			console.warn(
				`${getTime()}Warning: TextMate grammar file not found at ${grammarPath}. Skipping extension.`,
			);
			return;
		}

		const grammarContent = fs.readFileSync(grammarPath, "utf-8");
		const grammar = JSON.parse(grammarContent);

		grammar.repository = grammar.repository || {};
		grammar.patterns = grammar.patterns || [];

		// Remove old individual includes if they exist from previous logic
		grammar.patterns = grammar.patterns.filter(
			p => p.include !== "#embedded-javascript" && p.include !== "#embedded-typescript"
		);

		// Define new repository entries
		grammar.repository["embedded-js-singleline"] = {
			name: "meta.embedded.inline.javascript.rcl",
			begin: "(\$js>)", // Captures $js>
			beginCaptures: { "1": { name: "keyword.control.embedded.marker.js.rcl" } },
			end: "(?=$)", // End of line
			contentName: "source.js", // Tells TextMate to treat content as JS
			patterns: [{ include: "source.js" }]
		};

		grammar.repository["embedded-ts-singleline"] = {
			name: "meta.embedded.inline.typescript.rcl",
			begin: "(\$ts>)", // Captures $ts>
			beginCaptures: { "1": { name: "keyword.control.embedded.marker.ts.rcl" } },
			end: "(?=$)",
			contentName: "source.ts",
			patterns: [{ include: "source.ts" }]
		};

		grammar.repository["embedded-js-multiline"] = {
			name: "meta.embedded.block.javascript.rcl",
			begin: "^(\s*)(\$js>>>)\s*$\n", // Regex: ^(\s*)(\$js>>>)\s*$\n
			beginCaptures: { "2": { name: "keyword.control.embedded.marker.js.rcl" } },
			end: "^(?!\\1\\s+\\S)(?=\\s*\\S)|^(?=\\1$)\", // Indentation-based end pattern
			contentName: "source.js",
			patterns: [{ include: "source.js" }]
		};

		grammar.repository["embedded-ts-multiline"] = {
			name: "meta.embedded.block.typescript.rcl",
			begin: "^(\s*)(\$ts>>>)\s*$\n", // Regex: ^(\s*)(\$ts>>>)\s*$\n
			beginCaptures: { "2": { name: "keyword.control.embedded.marker.ts.rcl" } },
			end: "^(?!\\1\\s+\\S)(?=\\s*\\S)|^(?=\\1$)\",
			contentName: "source.ts",
			patterns: [{ include: "source.ts" }]
		};

        // Generic embedded code block (no language specified)
        grammar.repository["embedded-generic-singleline"] = {
			name: "meta.embedded.inline.generic.rcl",
			begin: "(\$)", // Captures $>
			beginCaptures: { "1": { name: "keyword.control.embedded.marker.generic.rcl" } },
			end: "(?=$)",
            // No contentName, let TextMate decide or treat as plain
		};

		grammar.repository["embedded-generic-multiline"] = {
			name: "meta.embedded.block.generic.rcl",
			begin: "^(\s*)(\$>>>)\s*$\n", // Regex: ^(\s*)(\$>>>)\s*$\n
			beginCaptures: { "2": { name: "keyword.control.embedded.marker.generic.rcl" } },
			end: "^(?!\\1\\s+\\S)(?=\\s*\\S)|^(?=\\1$)\",
             // No contentName
		};

		grammar.repository["rcl-embedded-code"] = {
			patterns: [
				{ include: "#embedded-js-multiline" },
				{ include: "#embedded-ts-multiline" },
                { include: "#embedded-generic-multiline" }, // Generic multi-line before specific single-line
				{ include: "#embedded-js-singleline" },
				{ include: "#embedded-ts-singleline" },
                { include: "#embedded-generic-singleline" }
			]
		};

		// Add the main include to grammar patterns if not already present
		if (!grammar.patterns.some((p) => p.include === "#rcl-embedded-code")) {
			grammar.patterns.push({ include: "#rcl-embedded-code" });
		}

		fs.writeFileSync(grammarPath, JSON.stringify(grammar, null, 2));
		console.log(
			`${getTime()}TextMate grammar extended successfully for multi-line embedded code at ${grammarPath}`,
		);
	} catch (error) {
		console.error(`${getTime()}Error extending TextMate grammar:`, error);
	}
}

// Call the function to extend the grammar before esbuild operations
// This relies on the `build:prepare` script having already copied the base grammar.
extendTmGrammar();

// Desktop (Node.js) build
const desktopCtx = await esbuild.context({
	// Entry points for the vscode extension and the language server
	entryPoints: ["src/extension/main.ts", "src/language/main.ts"],
	outdir: "out",
	bundle: true,
	target: "ES2022",
	// VSCode's extension host is still using cjs, so we need to transform the code
	format: "cjs",
	// To prevent confusing node, we explicitly use the `.cjs` extension
	outExtension: {
		".js": ".cjs",
	},
	loader: { ".ts": "ts" },
	external: ["vscode"],
	platform: "node",
	sourcemap: !minify,
	minify,
	plugins,
});

// Web build
const webCtx = await esbuild.context({
	// Entry point for web extension
	entryPoints: ["src/web/extension.ts"],
	outdir: "out/web",
	bundle: true,
	target: "ES2022",
	// Web extensions use cjs format too
	format: "cjs",
	outExtension: {
		".js": ".cjs",
	},
	loader: { ".ts": "ts" },
	external: ["vscode"],
	platform: "browser",
	sourcemap: !minify,
	minify,
	plugins: [
		...plugins,
		// Define global for web workers
		{
			name: "node-globals",
			setup(build) {
				build.onResolve({ filter: /^(path|fs|os|util)$/ }, () => ({
					path: "browser-stubs",
					namespace: "browser-stubs",
				}));
				build.onLoad({ filter: /.*/, namespace: "browser-stubs" }, () => ({
					contents: 'export default {}; export const sep = "/";',
				}));
			},
		},
	],
	define: {
		global: "globalThis",
		"process.env.NODE_ENV": '"production"',
	},
});

if (watch) {
	await Promise.all([desktopCtx.watch(), webCtx.watch()]);
} else {
	await Promise.all([desktopCtx.rebuild(), webCtx.rebuild()]);
	await Promise.all([desktopCtx.dispose(), webCtx.dispose()]);
}
