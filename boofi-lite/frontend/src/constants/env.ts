export const dynamicEnvironmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID!;

if (!dynamicEnvironmentId) {
  throw new Error("Dynamic environment ID is not defined");
}
