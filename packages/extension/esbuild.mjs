//@ts-check
import * as esbuild from "esbuild";

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

const baseConfig = {
	bundle: true,
	target: "ES2022",
	format: "cjs",
	outExtension: {
		".js": ".cjs",
	},
	loader: { ".ts": "ts" },
	external: ["vscode"],
	sourcemap: !minify,
	minify,
};

// Note: TextMate grammar enhancement is now handled in packages/language/scripts/build-tmlanguage.ts
// The extension simply copies the final enhanced grammar from the language package

const desktopConfig = {
	...baseConfig,
	entryPoints: ["src/extension/main.ts", "src/language/main.ts"],
	outdir: "out",
	platform: "node",
};

const webConfig = {
	...baseConfig,
	entryPoints: ["src/web/extension.ts"],
	outdir: "out/web",
	platform: "browser",
	define: {
		global: "globalThis",
		"process.env.NODE_ENV": '"production"',
	},
};

if (watch) {
	// Use context API for watch mode
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

	const desktopCtx = await esbuild.context({
		...desktopConfig,
		plugins,
	});

	const webCtx = await esbuild.context({
		...webConfig,
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
	});

	await Promise.all([desktopCtx.watch(), webCtx.watch()]);
	console.log(getTime() + "Watching for changes...");
} else {
	// Use simple build API for one-time builds
	try {
		await Promise.all([
			esbuild.build(desktopConfig),
			esbuild.build({
				...webConfig,
				plugins: [
					// Define global for web workers
					{
						name: "node-globals",
						setup(build) {
							build.onResolve({ filter: /^(path|fs|os|util)$/ }, () => ({
								path: "browser-stubs",
								namespace: "browser-stubs",
							}));
							build.onLoad(
								{ filter: /.*/, namespace: "browser-stubs" },
								() => ({
									contents: 'export default {}; export const sep = "/";',
								}),
							);
						},
					},
				],
			}),
		]);
		console.log(getTime() + success);
	} catch (error) {
		console.error(getTime() + "Build failed:", error);
		process.exit(1);
	}
}
