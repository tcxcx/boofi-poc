import WormholeConnect, {
  WormholeConnectConfig,
  WormholeConnectTheme,
} from "@wormhole-foundation/wormhole-connect";

const config: WormholeConnectConfig = {
  ui: {
    title: "Boofi Bridge",
    showHamburgerMenu: false,
    showInProgressWidget: false,
    defaultInputs: {},
  },

  network: "Testnet",
  chains: ["Sepolia", "ArbitrumSepolia", "BaseSepolia", "Avalanche"],
  rpcs: {
    Avalanche: "https://rpc.ankr.com/avalanche_fuji",
    BaseSepolia: "https://base-sepolia-rpc.publicnode.com",
  },
};
const theme: WormholeConnectTheme = {
  mode: "light",
  //   input: "#181a2d",
  //   primary: "#9E77ED",
  //   secondary: "#667085",
  badge: "#000000",
  text: "#000000",

  //   textSecondary: "#79859e",
  //   error: "#F04438",
  //   success: "#12B76A",
  //   badge: "#010101",
  font: '"Inter", sans-serif',
};

export default function Bridge() {
  return (
    <section className="mb-10 w-full">
      <WormholeConnect config={config} theme={theme} />
    </section>
  );
}
