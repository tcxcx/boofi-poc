export function truncateAddress(address: string, length: number = 6): string {
  if (!address) return "";
  return address.length > 2 * length + 2
    ? `${address.slice(0, length)}...${address.slice(-length)}`
    : address;
}
