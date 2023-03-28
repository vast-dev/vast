import { StatementStructures } from 'ts-morph';
import { AbstractStepCompiler } from './abstract.step-compiler';

export const STEP_TYPE_END = 'end';

export class EndStepCompiler extends AbstractStepCompiler {
  compile(): StatementStructures[] | string[] {
    const context = this.context;
    return [`return ${context.returns.$ref};`];
  }
}
