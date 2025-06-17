//@ts-check
import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const minify = process.argv.includes('--minify');

const success = watch ? 'Watch build succeeded' : 'Build succeeded';

function getTime() {
    const date = new Date();
    return `[${`${padZeroes(date.getHours())}:${padZeroes(date.getMinutes())}:${padZeroes(date.getSeconds())}`}] `;
}

function padZeroes(i) {
    return i.toString().padStart(2, '0');
}

const plugins = [{
    name: 'watch-plugin',
    setup(build) {
        build.onEnd(result => {
            if (result.errors.length === 0) {
                console.log(getTime() + success);
            }
        });
    },
}];

// Desktop (Node.js) build
const desktopCtx = await esbuild.context({
    // Entry points for the vscode extension and the language server
    entryPoints: ['src/extension/main.ts', 'src/language/main.ts'],
    outdir: 'out',
    bundle: true,
    target: "ES2022",
    // VSCode's extension host is still using cjs, so we need to transform the code
    format: 'cjs',
    // To prevent confusing node, we explicitly use the `.cjs` extension
    outExtension: {
        '.js': '.cjs'
    },
    loader: { '.ts': 'ts' },
    external: ['vscode'],
    platform: 'node',
    sourcemap: !minify,
    minify,
    plugins
});

// Web build  
const webCtx = await esbuild.context({
    // Entry point for web extension
    entryPoints: ['src/web/extension.ts'],
    outdir: 'out/web',
    bundle: true,
    target: "ES2022",
    // Web extensions use cjs format too
    format: 'cjs',
    outExtension: {
        '.js': '.cjs'
    },
    loader: { '.ts': 'ts' },
    external: ['vscode'],
    platform: 'browser',
    sourcemap: !minify,
    minify,
    plugins: [
        ...plugins,
        // Define global for web workers
        {
            name: 'node-globals',
            setup(build) {
                build.onResolve({ filter: /^(path|fs|os|util)$/ }, () => ({
                    path: 'browser-stubs',
                    namespace: 'browser-stubs'
                }));
                build.onLoad({ filter: /.*/, namespace: 'browser-stubs' }, () => ({
                    contents: 'export default {}; export const sep = "/";'
                }));
            }
        }
    ],
    define: {
        global: 'globalThis',
        'process.env.NODE_ENV': '"production"'
    }
});

if (watch) {
    await Promise.all([
        desktopCtx.watch(),
        webCtx.watch()
    ]);
} else {
    await Promise.all([
        desktopCtx.rebuild(),
        webCtx.rebuild()
    ]);
    await Promise.all([
        desktopCtx.dispose(),
        webCtx.dispose()
    ]);
}
