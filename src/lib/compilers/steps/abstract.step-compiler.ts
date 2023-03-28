import { StatementStructures } from 'ts-morph';
import { Step, Function } from '../../../schemas';

export abstract class AbstractStepCompiler {
  constructor(protected step: Step<any>, protected context: Function) {}
  compile(): (string | StatementStructures)[] {
    return [];
  }
}
