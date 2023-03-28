import { Reader } from "./lib/readers";
import { Project, TableJSON, SchemaJSON, FunctionJSON, EndpointJSON } from "./schemas";

export class VastLoader {
  public project: Project = { name: "Vast Project", apps: {} };
  constructor(protected reader: Reader) {}

  public async load(): Promise<Project> {
    await this.loadProject();
    return this.project;
  }

  protected async loadProject(): Promise<void> {
    const json = await this.reader.read("project.json");
    if(!json) throw new Error('Could not find project.json in source folder');

    this.project = JSON.parse(json);
    await this.loadApps(this.project);
  }

  protected async loadApps(project: Project): Promise<void> {
    const { apps } = project;

    await Promise.all(
      Object.keys(apps).map(async (name) => {
        // load schemas
        await this.loadSchemas(name);
        await this.loadTables(name);
        await this.loadFunctions(name);
        await this.loadEndpoints(name);
      })
    );
  }

  protected async loadSchemas(name: string): Promise<void> {
    console.log("Loading schemas for app " + name);
    let app = this.project.apps[name];

    const json = await this.reader.read(`apps/${name}/schemas.json`);
    const schemaJson: SchemaJSON = JSON.parse(json) as SchemaJSON;
    this.project.apps[name] = {
      ...app,
      schemas: {
        ...schemaJson
      },
    };
  }

  protected async loadTables(name: string): Promise<void> {
    console.log("Loading tables for app " + name);
    let app = this.project.apps[name];

    const json = await this.reader.read(`apps/${name}/tables.json`);
    this.project.apps[name] = {
      ...app,
      tables: JSON.parse(json) as TableJSON,
    };
  }

  protected async loadFunctions(name: string): Promise<void> {
    console.log("Loading functions for app " + name);
    let app = this.project.apps[name];

    const json = await this.reader.read(`apps/${name}/functions.json`);
    this.project.apps[name] = {
      ...app,
      functions: JSON.parse(json) as FunctionJSON,
    };
  }

  protected async loadEndpoints(name: string): Promise<void> {
    console.log("Loading endpoints for app " + name);
    let app = this.project.apps[name];

    const json = await this.reader.read(`apps/${name}/endpoints.json`);
    this.project.apps[name] = {
      ...app,
      endpoints: JSON.parse(json) as EndpointJSON,
    };
  }
}
