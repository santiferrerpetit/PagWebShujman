import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodSchema } from "zod";

export function validate(schema: ZodSchema, source: "body" | "params" | "query" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((e) => `${String(e.path.join("."))}: ${e.message}`);
        const err = new Error(messages.join("; "));
        (err as any).statusCode = 400;
        (err as any).code = "VALIDATION_ERROR";
        next(err);
        return;
      }
      next(error);
    }
  };
}
