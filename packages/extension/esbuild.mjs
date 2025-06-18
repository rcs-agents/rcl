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

		// Ensure repository and patterns exist
		grammar.repository = grammar.repository || {};
		grammar.patterns = grammar.patterns || [];

		// Add embedded JavaScript
		grammar.repository["embedded-javascript"] = {
			name: "meta.embedded.block.javascript.rcl",
			begin: "\\$js>", // Regex: $js>
			end: "$", // End of line
			patterns: [{ include: "source.js" }],
		};

		// Add embedded TypeScript
		grammar.repository["embedded-typescript"] = {
			name: "meta.embedded.block.typescript.rcl",
			begin: "\\$ts>", // Regex: $ts>
			end: "$", // End of line
			patterns: [{ include: "source.ts" }],
		};

		// Add includes to main patterns if not already present
		if (!grammar.patterns.some((p) => p.include === "#embedded-javascript")) {
			grammar.patterns.push({ include: "#embedded-javascript" });
		}
		if (!grammar.patterns.some((p) => p.include === "#embedded-typescript")) {
			grammar.patterns.push({ include: "#embedded-typescript" });
		}

		fs.writeFileSync(grammarPath, JSON.stringify(grammar, null, 2));
		console.log(
			`${getTime()}TextMate grammar extended successfully at ${grammarPath}`,
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
