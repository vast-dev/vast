import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { AbstractRunner } from '../runners/abstract.runner';
import { SchematicOption } from './schematic-option.interface';
import { SchematicRunner } from '../runners/schematic.runner';

export interface Schematic {
  name: string;
  alias: string;
  description: string;
}

export interface CollectionSchematic {
  schema: string;
  description: string;
  aliases: string[];
}

export class SchematicService {
  protected runner = new SchematicRunner();
  protected collection = '@vast/meta-schematics';

  public async execute(
    name: string,
    options: SchematicOption[],
    extraFlags?: string,
  ) {
    let command = this.buildCommandLine(name, options);
    command = extraFlags ? command.concat(` ${extraFlags}`) : command;
    await this.runner.run(command);
  }

  public getSchematics(): Schematic[] {
    const collectionPackagePath = dirname(require.resolve(this.collection));
    const collectionPath = join(collectionPackagePath, 'collection.json');
    const collection = JSON.parse(readFileSync(collectionPath, 'utf8'));
    const schematics = Object.entries(collection.schematics).map(
      ([name, value]) => {
        const schematic = value as CollectionSchematic;
        const description = schematic.description;
        const alias = schematic?.aliases?.length ? schematic.aliases[0] : '';
        return { name, description, alias };
      },
    );

    return schematics;
  }

  private buildCommandLine(name: string, options: SchematicOption[]): string {
    return `${this.collection}:${name}${this.buildOptions(options)}`;
  }

  private buildOptions(options: SchematicOption[]): string {
    return options.reduce((line, option) => {
      return line.concat(` ${option.toCommandString()}`);
    }, '');
  }
}
