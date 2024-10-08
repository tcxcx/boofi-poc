import BooFi from "@midday-ai/engine";

export const engine = new BooFi({
  environment: process.env.MIDDAY_ENGINE_ENVIRONMENT as
    | "production"
    | "staging"
    | "development"
    | undefined,
  bearerToken: process.env.MIDDAY_ENGINE_API_KEY ?? "",
});
