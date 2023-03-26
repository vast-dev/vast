import { cwd } from "process";
import { mkdir, writeFile } from "fs/promises";
import { basename, join } from "path";

import { Project } from "./schemas";
import { Reader, FileSystemReader } from "./lib/readers";
import { VastLoader } from "./loader";

export interface CompilerOptions {
  source: string;
  target: string;
}

export const VAST_COMPILER_DIR = ".vast";

export class Compiler {
  protected options: CompilerOptions;
  protected reader: Reader;
  protected loader: VastLoader;
  public project: Project | undefined;
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
    if (!this.project) {
      this.project = await this.loader.load();
    }
  }

  async compile() {
    await this.load();

    const { project, target } = this;
    if(!project) throw new Error('Project not loaded');

    console.log("Writing to destination: " + join(target, VAST_COMPILER_DIR));
    await mkdir(join(target, VAST_COMPILER_DIR, 'apps'), {
      recursive: true,
    });

    await writeFile(
      join(target, VAST_COMPILER_DIR, 'project.json'),
      JSON.stringify({
        name: project.name,
      })
    );

    await Promise.all(
      Object.keys(project.apps).map(async (name) => {
        const app = project.apps[name];
        await writeFile(
          join(target, VAST_COMPILER_DIR, `apps/${name}.json`),
          JSON.stringify(app)
        );
      })
    );
  }
}
