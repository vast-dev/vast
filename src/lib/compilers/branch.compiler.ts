import { Function } from "../../schemas";
import { StepCompilerFactory } from "./step-compiler.factory";
import { StatementStructures } from "ts-morph";

export class BranchCompiler {
  static compile(
    start: string,
    context: Function
  ): (string | StatementStructures)[] {
    const step = this.getStep(start, context);
    console.log("Compiling step " + start);
    if(!step) return [];

    const stepCompiler = StepCompilerFactory.create(step, context);
    if (!stepCompiler) return [];

    const statements = [...stepCompiler.compile()];

    if (step?.next) {
      statements.push(...this.compile(step.next.$ref, context));
    }

    return statements;
  }

  static getStep(stepName: string, context: Function) {
    const match = Object.keys(context.steps).find((step) => step === stepName);
    if(!match) return undefined;
    return context.steps[match];
  }
}
