import { formatFiles, runTasksInSerial, Tree, updateJson } from '@nx/devkit';
import { libraryGenerator as angularLibraryGenerator } from '@nx/angular/generators';
import { libraryGenerator as jsLibraryGenerator } from '@nx/js/src/generators/library/library';
import { GenerateLibSchema } from './schema';

export async function generateLibGenerator(tree: Tree, options: GenerateLibSchema) {
  const libName = `${options.type}-${options.name}`;
  const projectName = `${options.scope}-${libName}`;
  const basePath = options.directory
    ? `libs/${options.scope}/${options.directory}/${libName}`
    : `libs/${options.scope}/${libName}`;
  const aliasBase = options.directory
    ? `@ozon/${options.scope}/${options.directory}/${libName}`
    : `@ozon/${options.scope}/${libName}`;
  const tags = `scope:${options.scope},type:${options.type}`;

  let installTask: (() => void) | void;

  if (options.scope === 'frontend') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    installTask = await angularLibraryGenerator(tree, {
      name: projectName,
      directory: basePath,
      tags,
      standalone: true,
      linter: 'eslint',
      unitTestRunner: 'jest' as any,
      style: 'scss',
      changeDetection: 'OnPush',
      skipModule: true,
    });
  } else {
    installTask = await jsLibraryGenerator(tree, {
      name: projectName,
      directory: basePath,
      tags,
      bundler: 'none',
      linter: 'eslint',
      unitTestRunner: 'jest',
    });
  }

  updateJson(tree, 'tsconfig.base.json', (json) => {
    const paths: Record<string, string[]> = json.compilerOptions.paths ?? {};
    // Remove any unscoped alias Nx may have auto-added
    for (const key of Object.keys(paths)) {
      if (key === libName || key === projectName) delete paths[key];
    }
    paths[aliasBase] = [`${basePath}/src/index.ts`];
    json.compilerOptions.paths = paths;
    return json;
  });

  await formatFiles(tree);
  if (installTask) return runTasksInSerial(installTask);
}

export default generateLibGenerator;
