export interface Reader {
  directory: string;
  list(dir?: string): string[] | Promise<string[]>;
  read(name: string): string | Promise<string>;
  readAnyOf(filenames: string[]): string | Promise<string | undefined>;
}
