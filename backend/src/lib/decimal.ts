// Pul summalari uchun yordamchilar.
// Prisma Decimal -> Number konvertatsiyasi katta summalarda aniqlikni yo'qotmaydi
// chunki biz aslida int (so'm — eng kichik birlik) saqlaymiz.

import { Prisma } from "@prisma/client";

export const dec = (v: Prisma.Decimal | null | undefined): number =>
  v == null ? 0 : Number(v.toString());

// Decimal'ni JSON response uchun string ga aylantirish (frontend Number/BigInt qiladi).
export const decStr = (v: Prisma.Decimal | null | undefined): string =>
  v == null ? "0" : v.toString();

export const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);
