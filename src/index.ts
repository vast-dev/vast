import {
  Collections,
  SchematicOption,
  SchematicService,
} from "./lib/schematics";
import { Compiler, CompilerOptions } from "./compiler";
import { mkdir } from "fs/promises";
import { DEFAULT_APPS_PATH, DEFAULT_PATH_NAME } from "./defaults";
import { join } from "path";

export interface NewProjectOptions {
  name: string;
}

export class Vast {
  protected schematicService = new SchematicService();

  constructor(protected compiler: Compiler) {}

  async createNewProject(options: NewProjectOptions) {
    const schematicOpts: SchematicOption[] = [];
    schematicOpts.push(new SchematicOption("name", options.name));

    console.log("Running schematic");
    await this.schematicService.execute(
      Collections.MetaSchematics,
      "project",
      schematicOpts
    );
  }

  async compile() {
    const { compiler } = this;
    // Load all JSON files into one big project object
    await compiler.load();

    // Create the necessary directories and bootstrap the NestJS project
    await this.initTargetDirectory(compiler.target);
    await this.runProjectSchematic(compiler.project.name);

    // Create pre-compiled AST JSON files where needed
    // Save to disk as temp files (need to be added to .gitignore or cleaned up after)
    await compiler.compile();

    // Create sub-apps for each app in the project
    await this.runAppSchematics(Object.keys(compiler.project.apps));
  }

  async initTargetDirectory(target: string) {
    console.log("Initializing target directory: " + target);
    try {
      await mkdir(target);
      process.chdir(target);
    } catch (err) {
      throw new Error(`Could not create target directory ${target}. ${err}`);
    }
  }

  async runProjectSchematic(name: string) {
    console.log("Running project schematic");
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

  async runAppSchematics(names?: string[]) {
    if (names) {
      await Promise.all(
        names.map(async (name) => {
          console.log("Running app schematic for: " + name);
          const appOpts: SchematicOption[] = [];
          appOpts.push(new SchematicOption("name", name));

          await this.schematicService.execute(
            Collections.Schematics,
            "app",
            appOpts
          );

          // Schemas
          await this.runSchemaSchematics(name);

          // Tables
        })
      );
    }
  }

  getSourceRoot(app: string) {
    return join(DEFAULT_APPS_PATH, app, DEFAULT_PATH_NAME);
  }

  async runSchemaSchematics(app: string) {
    const appOpts: SchematicOption[] = [];
    appOpts.push(new SchematicOption("name", app));
    appOpts.push(new SchematicOption("sourceRoot", this.getSourceRoot(app)));
    appOpts.push(new SchematicOption("jsonPath", this.compiler.getAppDir(app, 'schemas.json')));

    await this.schematicService.execute(
      Collections.Schematics,
      "schema",
      appOpts
    );
  }
}
