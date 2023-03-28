import { StatementStructures } from 'ts-morph';
import { AbstractStepCompiler } from './abstract.step-compiler';

export interface AssignStepCompilerConfig {
  variable: string;
  expression: string;
}

export const STEP_TYPE_ASSIGN = 'assign';

export class AssignStepCompiler extends AbstractStepCompiler {
  compile(): StatementStructures[] | string[] {
    const step = this.step;
    return [`${step.arguments.variable} = ${step.arguments.expression}`];
  }
}
