import { baseSepolia } from "viem/chains";

export const EXPECTED_CHAIN = baseSepolia;

export const isDev = process.env.NODE_ENV === "development";
export const isProd = process.env.NODE_ENV === "production";

export const isClient = typeof document !== "undefined";
export const isServer = !isClient;
export const githubUrl = "https://github.com/hackathon-2024";
export const APP_NAME = "BooFi Finance";
export const APP_LOGO_URL = "/images/BooFi-icon.png";
export const PEANUT_API_URL =
  process.env.PEANUT_API_URL || "https://api.peanut.to/";

if (typeof process.env.NEXT_PUBLIC_SITE_URL !== "string") {
  throw new Error(
    `Please set the NEXT_PUBLIC_SITE_URL environment variable to your site's URL.
    
1. Create .env file at the root of your project.
2. Add NEXT_PUBLIC_SITE_URL=http://localhost:3000
3. For other environments (like production), make sure you set the correct URL.
    `
  );
}

export const siteURL =
  new URL(process.env.NEXT_PUBLIC_SITE_URL) || "https://boofi.finance";
export const siteOrigin = siteURL.origin;

// we like putting this in the JavaScript console,
// as our signature.
// you can delete it if not needed.
export const basementLog = `
🐱‍💻👻

88                                    ad88 88  
88                                   d8"   ""  
88                                   88        
88,dPPYba,   ,adPPYba,   ,adPPYba, MM88MMM 88  
88P'    "8a a8"     "8a a8"     "8a  88    88  
88       d8 8b       d8 8b       d8  88    88  
88b,   ,a8" "8a,   ,a8" "8a,   ,a8"  88    88  
8Y"Ybbd8"'   ""YbbdP""   ""YbbdP""   88    88  
                                               
                                                
`;
// **********************************************************************

//change this to the correct contract address and abi
export const linksContractABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_claimId",
        type: "string",
      },
    ],
    name: "claimPaymentLink",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const linksContractAddress =
  "0x0000000000000000000000000000000000000000";

// **********************************************************************


