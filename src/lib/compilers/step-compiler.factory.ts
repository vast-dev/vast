import { Step, Function } from '../../schemas';
import { AbstractStepCompiler } from './steps/abstract.step-compiler';
import {
  IfStepCompiler,
  LoopStepCompiler,
  EndStepCompiler,
  AssignStepCompiler,
  STEP_TYPE_IF,
  STEP_TYPE_ASSIGN,
  STEP_TYPE_END,
  STEP_TYPE_LOOP,
} from './steps';

export class StepCompilerFactory {
  static create(step: Step<any>, context: Function): AbstractStepCompiler | undefined {
    switch (step.type) {
      case STEP_TYPE_ASSIGN:
        return new AssignStepCompiler(step, context);
      case STEP_TYPE_IF:
        return new IfStepCompiler(step, context);
      case STEP_TYPE_LOOP:
        return new LoopStepCompiler(step, context);
      case STEP_TYPE_END:
        return new EndStepCompiler(step, context);
    }
  }
}
