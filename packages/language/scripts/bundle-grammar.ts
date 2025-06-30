import {
	appendFile,
	mkdir,
	readFile,
	rm,
	writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const grammarDir = path.resolve(__dirname, "..", "src", "grammar");
const entryFile = path.resolve(grammarDir, "rcl.langium");
const outputFile = path.resolve(grammarDir, "..", "rcl-grammar.langium");
const logDir = path.resolve(__dirname, "..", "logs");
const logFile = path.resolve(logDir, "bundle-grammar.log");

async function log(message: string): Promise<void> {
	const timestamp = new Date().toISOString();
	await appendFile(logFile, `[${timestamp}] ${message}\n`);
}

async function bundle(
	filePath: string,
	processedFiles: Set<string>,
): Promise<string> {
	const absolutePath = path.resolve(filePath);
	if (processedFiles.has(absolutePath)) {
		await log(`Skipping already processed file: ${absolutePath}`);
		return "";
	}
	await log(`Processing file: ${absolutePath}`);
	processedFiles.add(absolutePath);

	let content: string;
	try {
		content = await readFile(absolutePath, "utf-8");
	} catch (error) {
		await log(`Error reading file ${absolutePath}: ${error}`);
		throw error;
	}

	const lines = content.split(/\r?\n/);
	const output: string[] = [];

	const importRegex = /^\s*import\s+"([^"]+)";/;

	for (const line of lines) {
		if (line.trim().startsWith("//")) {
			continue;
		}

		const match = line.match(importRegex);
		if (match) {
			const importPath = match[1];
			const importedFile = path.resolve(
				path.dirname(absolutePath),
				`${importPath}.langium`,
			);
			output.push(await bundle(importedFile, processedFiles));
		} else {
			output.push(line);
		}
	}

	return output.join("\n");
}

async function main(): Promise<void> {
	try {
		await mkdir(logDir, { recursive: true });
		await writeFile(
			logFile,
			`--- Log for grammar bundling at ${new Date().toISOString()} ---\n`,
		);

		// Delete the existing bundled file to ensure a clean build
		await rm(outputFile, { force: true });
		await log(`Removed existing bundled file: ${outputFile}`);

		await log("Starting grammar bundling process...");
		const processedFiles = new Set<string>();
		let bundledContent = await bundle(entryFile, processedFiles);

		const grammarNameRegex = /grammar\s+([A-Za-z_][A-Za-z0-9_]*)/;
		const grammarMatch = bundledContent.match(grammarNameRegex);
		if (grammarMatch) {
			const grammarName = grammarMatch[1];
			const grammarDeclaration = `grammar ${grammarName}`;
			// Remove all grammar declarations from the bundled content
			bundledContent = bundledContent.replace(
				/grammar\s+[A-Za-z_][A-Za-z0-9_]*/g,
				"",
			);
			// Add a single grammar declaration at the top
			bundledContent = `${grammarDeclaration}\n\n${bundledContent}`;
		}

		// Ensure no more than two blank lines in a row
		bundledContent = bundledContent.replace(/(\n\s*){3,}/g, '\n\n');

		await writeFile(outputFile, bundledContent);
		await log(`Successfully bundled grammar to ${outputFile}`);
		console.log(`Grammar bundled successfully to ${outputFile}`);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		await log(`An error occurred: ${errorMessage}`);
		console.error("An error occurred during bundling:", error);
		process.exit(1);
	}
}

main(); 