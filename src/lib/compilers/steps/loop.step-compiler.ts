import { StatementStructures } from 'ts-morph';
import { BranchCompiler } from '../branch.compiler';
import { AbstractStepCompiler } from './abstract.step-compiler';

export const STEP_TYPE_LOOP = 'loop';

export interface LoopStepCompilerConfig {
  variable: string;
  predicate: string;
  loopStep: string;
}

export class LoopStepCompiler extends AbstractStepCompiler {
  compile(): (string | StatementStructures)[] {
    const step = this.step;
    const { variable, predicate, loopStep } = step.arguments;

    return [
      `${variable}.forEach((${predicate}) => {`,
      ...BranchCompiler.compile(loopStep, this.context),
      `})`,
    ];
  }
}
