import { cwd } from "process";
import { mkdir, writeFile } from "fs/promises";
import { basename, join } from "path";

import { Project } from "./schemas";
import { Reader, FileSystemReader } from "./lib/readers";
import { VastLoader } from "./loader";
import { DEFAULT_APPS_PATH, DEFAULT_COMPILER_PATH_NAME } from "./defaults";

export interface CompilerOptions {
  source: string;
  target: string;
}
export class Compiler {
  protected options: CompilerOptions;
  protected reader: Reader;
  protected loader: VastLoader;
  public project: Project = {
    name: "vast-project",
    apps: {},
  };
  public source: string = "";
  public target: string = "";

  constructor(options?: CompilerOptions) {
    // Load JSON files from source and combine into one
    this.options = this.normalizeOptions(options);
    this.reader = new FileSystemReader(this.options.source);
    this.loader = new VastLoader(this.reader);

    this.source = this.options.source;
    this.target = this.options.target;
  }

  private normalizeOptions(options?: CompilerOptions): CompilerOptions {
    const normalizedOptions = {
      ...options,
      source: options?.source ?? cwd(),
      target: options?.target ?? `../${basename(cwd())}-compiled`,
    };

    return normalizedOptions;
  }

  async load() {
    this.project = await this.loader.load();
  }

  getProjectDir(...path: string[]) {
    return join(this.target, DEFAULT_COMPILER_PATH_NAME, ...path);
  }

  getAppDir(...path: string[]) {
    return join(
      this.target,
      DEFAULT_COMPILER_PATH_NAME,
      DEFAULT_APPS_PATH,
      ...path
    );
  }

  async compile() {
    await this.load();

    const { project, target } = this;
    if (!project) throw new Error("Project not loaded");

    console.log("Writing to destination: " + this.getProjectDir());
    await mkdir(this.getAppDir(), {
      recursive: true,
    });

    await writeFile(
      this.getProjectDir("project.json"),
      JSON.stringify({
        name: project.name,
      })
    );

    await Promise.all(
      Object.keys(project.apps).map(async (name) => {
        const app = project.apps[name];
        // await this.compileSchemas(name);
        await mkdir(this.getAppDir(name), {
          recursive: true,
        });
        await writeFile(this.getAppDir(name, "app.json"), JSON.stringify(app));
      })
    );
  }

  async compileSchemas(app: string) {
    const { project } = this;
    const appObj = project.apps[app];

    await writeFile(
      this.getAppDir(app, "schemas.json"),
      JSON.stringify(appObj.schemas)
    );
  }
}
