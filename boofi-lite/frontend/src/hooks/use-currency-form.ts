import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { currencySchema } from "@/lib/schemas/currency-schema";
import { z } from "zod";

export type CurrencyFormData = z.infer<typeof currencySchema>;

export const useCurrencyForm = () => {
  const form = useForm<CurrencyFormData>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      amount: 0,
      token: "ETH",
    },
  });

  return form;
};
