import { SchematicOption, SchematicService } from "./lib/schematics";
import { FileSystemReader } from './lib/readers/file-system.reader';
import { cwd } from "process";
import { resolve } from "path";
import { Project } from "./schemas";
import { VastLoader } from './loader';

export interface NewProjectOptions {
  name: string;
}

export interface CompilerOptions {
  source: string;
  target: string;
}

export class Vast {
  static schematicService = new SchematicService();

  static async createNewProject(options: NewProjectOptions) {
    const schematicOpts: SchematicOption[] = [];
    schematicOpts.push(new SchematicOption("name", options.name));

    console.log("Running schematic");
    await this.schematicService.execute("project", schematicOpts);
  }

  static async compile(_options?: CompilerOptions) {
    const options = {
        ..._options,
        source: _options?.source ?? cwd(),
    };

    // Load JSON files from source and combine into one
    const reader = new FileSystemReader(options.source);
    const loader = new VastLoader(reader);

    const project = await loader.load();
    console.debug(JSON.stringify(project, null, 2));


    // Create pre-compiled AST JSON files where needed
    // Save to disk as temp files (need to be added to .gitignore)

    // Run project compiler schematic to bootstrap everything
    const schematicOpts: SchematicOption[] = [];

    schematicOpts.push(new SchematicOption("name", "test"));
    // await this.schematicService.execute("project", schematicOpts);
  }
}
