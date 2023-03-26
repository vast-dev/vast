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
    await this.initTargetDirectory(compiler.target);
    await this.runProjectSchematic(compiler.project.name);
    await compiler.compile();
    await this.runAppSchematics(Object.keys(compiler.project.apps));

    // Create pre-compiled AST JSON files where needed
    // Save to disk as temp files (need to be added to .gitignore)
  }

  static async initTargetDirectory(target: string) {
    try {
      await mkdir(target);
      process.chdir(target);
    } catch (err) {
      throw new Error(`Could not create target directory ${target}. ${err}`);
    }
  }

  static async runProjectSchematic(name: string) {
    const schematicOpts: SchematicOption[] = [];
    schematicOpts.push(
      new SchematicOption("name", name),
      new SchematicOption("directory", ".")
    );
    await this.schematicService.execute(
      Collections.Schematics,
      "project",
      schematicOpts
    );
  }

  static async runAppSchematics(names?: string[]) {
    if (names) {
      await Promise.all(
        names.map(async (name) => {
          const appOpts: SchematicOption[] = [];
          appOpts.push(new SchematicOption("name", name));

          await this.schematicService.execute(
            Collections.Schematics,
            "app",
            appOpts
          );
        })
      );
    }
  }
}
