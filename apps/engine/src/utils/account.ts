export type AccountType =
  | "depository"
  | "credit"
  | "other_asset"
  | "crypto"
  | "loan"
  | "other_liability";

export function getType(type: string): AccountType {
  switch (type) {
    case "depository":
      return "depository";
    case "credit":
      return "credit";
    case "crypto":
      return "crypto";
    default:
      return "other_asset";
  }
}
