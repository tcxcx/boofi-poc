export enum Environment {
    localhost = 'localhost',
    development = 'development',
    staging = 'staging',
    production = 'production',
  }
  
  export function getCurrentEnvironment(): Environment {
    const siteURL = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
    if (siteURL.origin === "https://boofi.xyz") {
      return Environment.production;
    }
    return Environment.development;
  }
  