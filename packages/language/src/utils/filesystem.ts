/**
 * Filesystem utilities for RCL parser
 * 
 * This module provides cross-platform filesystem operations that work in both
 * Node.js and web environments. The filesystem interface can be injected for
 * testing or specialized environments.
 */

export interface FileSystemInterface {
  existsSync(path: string): boolean;
  join(...paths: string[]): string;
  dirname(path: string): string;
  resolve(path: string): string;
}

/**
 * Web-compatible filesystem mock for environments without filesystem access
 */
export const webFileSystemMock: FileSystemInterface = {
  existsSync: () => false,
  join: (...paths: string[]) => paths.join('/').replace(/\/+/g, '/'),
  dirname: (path: string) => path.split('/').slice(0, -1).join('/') || '/',
  resolve: (path: string) => path.startsWith('/') ? path : '/' + path
};

/**
 * Get filesystem interface - tries Node.js first, falls back to web mock
 */
export function getFileSystem(): FileSystemInterface {
  try {
    // Try to use Node.js filesystem APIs
    const fs = require('node:fs');
    const path = require('node:path');
    return {
      existsSync: fs.existsSync,
      join: path.join,
      dirname: path.dirname,
      resolve: path.resolve
    };
  } catch {
    // Fallback to web-compatible mock
    return webFileSystemMock;
  }
}

/**
 * Find the project root by searching up for rclconfig.yml or config/rcl.yml
 */
export function findProjectRoot(startPath: string, fs?: FileSystemInterface): string {
  const fileSystem = fs || getFileSystem();
  let dir = fileSystem.resolve(startPath);
  while (true) {
    if (fileSystem.existsSync(fileSystem.join(dir, 'rclconfig.yml')) ||
        fileSystem.existsSync(fileSystem.join(dir, 'config', 'rcl.yml'))) {
      return dir;
    }
    const parent = fileSystem.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return fileSystem.resolve(startPath);
}

/**
 * Resolves an import path (multi-level, space-separated) to a file/module/section.
 *
 * - Import resolution is case-insensitive.
 * - If two or more possible resolutions exist, an error is thrown (ambiguity).
 * - The import path is resolved relative to the project root, which is the closest folder up the hierarchy containing either an `rclconfig.yml` or a `config/rcl.yml` file. If none is found, the current file's folder is used.
 * - The import path `Shared / Common Flows / Retail / Catalog` should resolve to:
 *     - flow `Catalog` in:
 *         - `shared/common flows/retail.rcl`
 *         - `shared/common-flows/retail.rcl`
 *         - `shared/common_flows/retail.rcl`
 *     - flow `Catalog` of the `Retail` agent in:
 *         - `shared/common flows.rcl`
 *         - `shared/common-flows.rcl`
 *         - `shared/common_flows.rcl`
 * - Throws if the import cannot be resolved or is ambiguous.
 *
 * @param importedNames The namespace path segments (e.g., ["Shared", "Common Flows", "Retail", "Catalog"])
 * @param options Additional options (e.g., current file path, filesystem interface)
 * @returns The resolved file path and section name, or throws on error
 */
export function resolveImportPath(
  importedNames: string[], 
  options: { currentFilePath: string; fileSystem?: FileSystemInterface }
): { filePath: string; sectionName?: string } {
  if (!importedNames.length) throw new Error('Empty import path');
  
  const fileSystem = options.fileSystem || getFileSystem();
  const projectRoot = findProjectRoot(fileSystem.dirname(options.currentFilePath), fileSystem);
  
  // Helper function to generate directory and file name variations
  const generateNameVariations = (name: string): string[] => {
    const variations = new Set([
      name,                                    // Original case with spaces
      name.toLowerCase(),                      // Lowercase with spaces  
      name.replace(/ /g, '-').toLowerCase(),   // Lowercase with dashes
      name.replace(/ /g, '_').toLowerCase()    // Lowercase with underscores
    ]);
    return Array.from(variations); // Remove duplicates
  };

  // Generate cartesian product of all directory variations
  function cartesianProduct(arrays: string[][]): string[][] {
    return arrays.reduce((acc, curr) => 
      acc.flatMap(x => curr.map(y => [...x, y])), 
      [[]] as string[][]
    );
  }

  // Try full path as file first
  const fileName = `${importedNames[importedNames.length-1]}.rcl`;
  const dirSegments = importedNames.slice(0, -1);
  
  const fileCandidates: string[] = [];
  
  if (dirSegments.length === 0) {
    // Single file in project root
    generateNameVariations(fileName).forEach(variation => {
      fileCandidates.push(fileSystem.join(projectRoot, variation));
    });
  } else {
    // Build all combinations of directory variations
    const dirVariations = dirSegments.map(generateNameVariations);
    const fileVariations = generateNameVariations(fileName);
    
    const allDirCombinations = cartesianProduct(dirVariations);
    
    allDirCombinations.forEach(dirCombo => {
      fileVariations.forEach(fileVar => {
        fileCandidates.push(fileSystem.join(projectRoot, ...dirCombo, fileVar));
      });
    });
  }
  
  // Remove duplicates and filter existing files
  const uniqueFileCandidates = Array.from(new Set(fileCandidates));
  const foundFiles = uniqueFileCandidates.filter(f => fileSystem.existsSync(f));
  
  // Handle case-insensitive filesystems by resolving to real paths and deduplicating
  const realFoundFiles = foundFiles.map(f => {
    try {
      return { original: f, real: fileSystem.resolve(f) };
    } catch {
      return { original: f, real: f };
    }
  });
  
  // Group by real path to handle case-insensitive filesystems
  const uniqueRealPaths = new Map<string, string>();
  realFoundFiles.forEach(({ original, real }) => {
    const normalizedReal = real.toLowerCase();
    if (!uniqueRealPaths.has(normalizedReal)) {
      uniqueRealPaths.set(normalizedReal, original);
    }
  });
  
  const finalFoundFiles = Array.from(uniqueRealPaths.values());
  
  if (finalFoundFiles.length === 1) {
    return { filePath: finalFoundFiles[0] };
  } else if (finalFoundFiles.length > 1) {
    throw new Error(`Ambiguous import: multiple files match for ${importedNames.join(' / ')}`);
  }
  
  // Try as section in parent file
  if (importedNames.length > 1) {
    const parentFileName = `${importedNames[importedNames.length-2]}.rcl`;
    const parentDirSegments = importedNames.slice(0, -2);
    
    const parentCandidates: string[] = [];
    
    if (parentDirSegments.length === 0) {
      // Parent file in project root
      generateNameVariations(parentFileName).forEach(variation => {
        parentCandidates.push(fileSystem.join(projectRoot, variation));
      });
    } else {
      // Build all combinations for parent file
      const parentDirVariations = parentDirSegments.map(generateNameVariations);
      const parentFileVariations = generateNameVariations(parentFileName);
      
      const allParentDirCombinations = cartesianProduct(parentDirVariations);
      
      allParentDirCombinations.forEach(dirCombo => {
        parentFileVariations.forEach(fileVar => {
          parentCandidates.push(fileSystem.join(projectRoot, ...dirCombo, fileVar));
        });
      });
    }
    
    // Remove duplicates and filter existing files
    const uniqueParentCandidates = Array.from(new Set(parentCandidates));
    const foundParentFiles = uniqueParentCandidates.filter(f => fileSystem.existsSync(f));
    
    // Handle case-insensitive filesystems by resolving to real paths and deduplicating
    const realFoundParentFiles = foundParentFiles.map(f => {
      try {
        return { original: f, real: fileSystem.resolve(f) };
      } catch {
        return { original: f, real: f };
      }
    });
    
    // Group by real path to handle case-insensitive filesystems
    const uniqueParentRealPaths = new Map<string, string>();
    realFoundParentFiles.forEach(({ original, real }) => {
      const normalizedReal = real.toLowerCase();
      if (!uniqueParentRealPaths.has(normalizedReal)) {
        uniqueParentRealPaths.set(normalizedReal, original);
      }
    });
    
    const finalFoundParentFiles = Array.from(uniqueParentRealPaths.values());
    
    if (finalFoundParentFiles.length === 1) {
      return { filePath: finalFoundParentFiles[0], sectionName: importedNames[importedNames.length-1] };
    } else if (finalFoundParentFiles.length > 1) {
      throw new Error(`Ambiguous import: multiple parent files match for ${importedNames.join(' / ')}`);
    }
  }
  
  throw new Error(`Import not found: ${importedNames.join(' / ')}`);
} 