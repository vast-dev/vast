import {
  Collections,
  SchematicOption,
  SchematicService,
} from "./lib/schematics";
import { Compiler, CompilerOptions } from "./compiler";
import { mkdir } from "fs/promises";

export interface NewProjectOptions {
  name: string;
}

export class Vast {
  static schematicService = new SchematicService();

  static async createNewProject(options: NewProjectOptions) {
    const schematicOpts: SchematicOption[] = [];
    schematicOpts.push(new SchematicOption("name", options.name));

    console.log("Running schematic");
    await this.schematicService.execute(
      Collections.MetaSchematics,
      "project",
      schematicOpts
    );
  }

  static async compile(options?: CompilerOptions) {
    const compiler = new Compiler(options);
    await compiler.load();

    // Run project compiler schematic to bootstrap everything
    try {
      await mkdir(compiler.target);
      process.chdir(compiler.target);
    } catch (err) {
      throw new Error(
        `Could not create target directory ${compiler.target}. ${err}`
      );
    }

    const schematicOpts: SchematicOption[] = [];
    schematicOpts.push(
      new SchematicOption("name", compiler.project?.name ?? "vast-project"),
      new SchematicOption("directory", '.')
    );
    await this.schematicService.execute(
      Collections.Schematics,
      "project",
      schematicOpts
    );

    await compiler.compile();

    if (compiler.project?.apps) {
      await Promise.all(Object.keys(compiler.project?.apps).map(async (name) => {
        const appOpts: SchematicOption[] = [];
        appOpts.push(
          new SchematicOption("name", name),
        );
        
        await this.schematicService.execute(
          Collections.Schematics,
          "app",
          appOpts
        );
      }));
    }

    // Create pre-compiled AST JSON files where needed
    // Save to disk as temp files (need to be added to .gitignore)
  }
}
