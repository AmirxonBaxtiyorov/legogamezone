// Zod validatsiya wrapperi: req.body / req.query / req.params ni tekshiradi.

import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type Source = "body" | "query" | "params";

export function validate<T>(schema: ZodSchema<T>, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const raw =
      source === "body" ? req.body : source === "query" ? req.query : req.params;
    const result = schema.safeParse(raw);
    if (!result.success) {
      // errorHandler bu Zod xatoni 400 ga aylantiradi
      return next(result.error);
    }
    if (source === "body") req.body = result.data as Request["body"];
    else if (source === "query") req.query = result.data as Request["query"];
    else req.params = result.data as Request["params"];
    next();
  };
}
