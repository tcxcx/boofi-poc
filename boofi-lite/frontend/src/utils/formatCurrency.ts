export const formatCurrency = (value: bigint | number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
      ...options,
    }).format(Number(value));
  };
  