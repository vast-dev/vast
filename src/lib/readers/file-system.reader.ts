import * as fs from 'fs';
import { Reader } from './reader';
import { join } from 'path';

export class FileSystemReader implements Reader {
  constructor(public readonly directory: string) {}

  public async list(dir?: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      fs.readdir(
        dir ? join(this.directory, dir) : this.directory,
        (error: NodeJS.ErrnoException | null, filenames: string[]) => {
          if (error) {
            reject(error);
          } else {
            resolve(filenames);
          }
        },
      );
    });
  }

  public async read(name: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      fs.readFile(
        `${this.directory}/${name}`,
        (error: NodeJS.ErrnoException | null, data: Buffer) => {
          if (error) {
            reject(error);
          } else {
            resolve(data.toString());
          }
        },
      );
    });
  }

  public async readAnyOf(filenames: string[]): Promise<string | undefined> {
    try {
      for (const file of filenames) {
        return await this.read(file);
      }
    } catch (err) {
      return filenames.length > 0
        ? await this.readAnyOf(filenames.slice(1, filenames.length))
        : undefined;
    }
  }
}
