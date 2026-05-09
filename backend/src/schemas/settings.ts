import { z } from "zod";

export const updateSettingsSchema = z.record(
  z.string().min(1).max(80),
  z.union([z.string(), z.number(), z.boolean(), z.null()]),
);
