import {
  Tree,
  formatFiles,
  generateFiles,
  joinPathFragments,
  readJson,
  updateJson,
  runTasksInSerial,
} from '@nx/devkit';
import { libraryGenerator } from '@nx/angular/generators';

interface Schema {
  name: string;
}

export default async function (tree: Tree, schema: Schema) {
  const libName = `feature-${schema.name}`;
  const directory = `libs/frontend/features/${libName}`;
  const alias = `@ozon/frontend/features/${libName}`;

  const installTask = await libraryGenerator(tree, {
    name: libName,
    directory,
    tags: 'scope:frontend,type:feature',
    standalone: true,
    linter: 'eslint',
    unitTestRunner: 'jest',
    style: 'scss',
    changeDetection: 'OnPush',
    skipModule: true,
  });

  // Fix path alias — replace the key that Nx generates with our scoped alias
  updateJson(tree, 'tsconfig.base.json', (json) => {
    const paths: Record<string, string[]> = json.compilerOptions.paths ?? {};
    // Nx may have added the lib name without scope — remove it
    for (const key of Object.keys(paths)) {
      if (key === libName || key.endsWith(`/${libName}`)) {
        delete paths[key];
      }
    }
    paths[alias] = [`${directory}/src/index.ts`];
    json.compilerOptions.paths = paths;

    return json;
  });

  await formatFiles(tree);
  
  return runTasksInSerial(installTask);
}
