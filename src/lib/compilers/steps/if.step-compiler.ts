import { StatementStructures } from 'ts-morph';
import { BranchCompiler } from '../branch.compiler';
import { AbstractStepCompiler } from './abstract.step-compiler';

export const STEP_TYPE_IF = 'if';

export interface IfStepCompilerConfig {
  expression: string;
  trueStep: string;
}

export class IfStepCompiler extends AbstractStepCompiler {
  compile(): (string | StatementStructures)[] {
    const step = this.step;
    const { expression, trueStep } = step.arguments;

    return [
      `if(${expression}) {`,
      ...BranchCompiler.compile(trueStep, this.context),
      `}`,
    ];
  }
}
