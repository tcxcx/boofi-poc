import { z } from "zod";

export const currencySchema = z.object({
  amount: z
    .number()
    .min(0.0001, "Amount must be greater than zero")
    .max(1000000, "Amount exceeds the maximum limit"),
  token: z.string().min(1, "Token must be selected"),
});
