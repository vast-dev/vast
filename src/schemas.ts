import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { OpenAPIV3 } from "openapi-types";

export interface Project {
  name: string;
  apps: {
    [key: string]: App;
  };
}

export interface App {
  name: string;
  description?: string;
  schemas?: {
    [key: string]: Schema;
  };
  tables?: {
    [key: string]: Table;
  };
  functions?: {
    [key: string]: Function;
  };
  endpoints?: Endpoints;
}
export interface Schema extends JSONSchema7 {}
export interface SchemaJSON {
  schemas: {
    [key: string]: Schema;
  };
}

export interface Table extends JSONSchema7 {}
export interface TableJSON {
  tables: {
    [key: string]: Table;
  };
}
export interface FunctionJSON {
  functions: {
    [key: string]: Function;
  };
}
export interface Function {
  arguments: {
    [key: string]: JSONSchema7Definition;
  };
  returns: JSONSchema7Definition;
  start: Reference;
  steps: {
    [key: string]: Step<any>;
  };
}

export interface EndpointJSON {
  endpoints: Endpoints;
}
export interface Endpoints extends OpenAPIV3.Document<{
  steps: {
    [key: string]: Step<any>;
  };
}> {}

export interface Step<T> {
  type: string;
  next: Reference;
  arguments: T;
}

export interface Reference {
  $ref: string | undefined;
}
