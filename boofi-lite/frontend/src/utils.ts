/* eslint-disable no-prototype-builtins */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string";
import { z } from "zod";
import { useLocale } from "next-intl";
import { convertUSDToCurrency } from "@/hooks/use-convert-usd-to-currency";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// FORMAT DATE TIME
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    year: "numeric", // numeric year (e.g., '2023')
    month: "2-digit", // abbreviated month name (e.g., 'Oct')
    day: "2-digit", // numeric day of the month (e.g., '25')
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  );

  const formattedDateDay: string = new Date(dateString).toLocaleString(
    "en-US",
    dateDayOptions
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  );

  return {
    dateTime: formattedDateTime,
    dateDay: formattedDateDay,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export function FormatAmountWithLocale(amount: number, locale: string): string {
  let currencyCode: string;
  let localeString: string;

  switch (locale) {
    case "pt-BR":
      currencyCode = "BRL";
      localeString = "pt-BR";
      break;
    case "es-AR":
      currencyCode = "ARS";
      localeString = "es-AR";
      break;
    case "en-IN":
      currencyCode = "INR";
      localeString = "en-IN";
      break;
    case "de":
      currencyCode = "EUR";
      localeString = "de-DE";
      break;
    case "ja":
      currencyCode = "JPY";
      localeString = "ja-JP";
      break;
    case "en":
    default:
      currencyCode = "USD";
      localeString = "en-US";
      break;
  }

  const formatter = new Intl.NumberFormat(localeString, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}

export function FormatAmount(amount: number): string {
  const locale = useLocale();
  return FormatAmountWithLocale(amount, locale);
}

async function convertAndFormatUSDToCurrency(
  usdAmount: number,
  targetCurrency: "BRL" | "INR" | "EUR" | "JPY"
): Promise<string> {
  const convertedAmount = await convertUSDToCurrency(usdAmount, targetCurrency);

  // Set the locale based on the target currency
  let tempLocale;
  switch (targetCurrency) {
    case "BRL":
      tempLocale = "pt-BR";
      break;
    case "INR":
      tempLocale = "en-IN";
      break;
    case "EUR":
      tempLocale = "de";
      break;
    case "JPY":
      tempLocale = "ja";
      break;
    default:
      tempLocale = "en";
  }

  return FormatAmountWithLocale(convertedAmount, tempLocale);
}

export const parseStringify = (value: any) => JSON.parse(JSON.stringify(value));

export const removeSpecialCharacters = (value: string) => {
  return value.replace(/[^\w\s]/gi, "");
};

interface UrlQueryParams {
  params: string;
  key: string;
  value: string;
}

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}
