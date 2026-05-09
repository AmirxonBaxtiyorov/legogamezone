// Pino strukturalangan logger.
// Development muhitida o'qib bo'ladigan format (pino-pretty), production'da JSON.

import pino from "pino";
import { env, isProduction } from "../config/env";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: "game-zone-qarz" },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      'req.body.password',
      'req.body.code',
      "*.passwordHash",
      "*.codeHash",
    ],
    remove: true,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          translateTime: "SYS:HH:MM:ss",
          ignore: "pid,hostname,service",
          colorize: true,
        },
      },
});
