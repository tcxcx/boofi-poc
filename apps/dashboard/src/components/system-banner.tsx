export function SystemBanner() {
  return (
    <div className="p-1 fixed left-0 right-0 top-0 bg-[#FFD02B] z-50 text-center flex items-center justify-center text-black text-sm font-medium">
      <span>
        We are currently investigating a technical issue, follow{" "}
        <a href="https://status.boofi.ai" className="underline">
          status.boofi.ai
        </a>{" "}
        for updates.
      </span>
    </div>
  );
}
