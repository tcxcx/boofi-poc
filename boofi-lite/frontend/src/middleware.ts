import { NextFetchEvent, NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";

const i18nMiddleware = createMiddleware({
  locales: ["en", "es", "pt"],
  defaultLocale: "en",
});

const authMiddleware = withAuth({
  callbacks: {
    authorized({ req, token }: { req: NextRequest; token: any }) {
      if (req.nextUrl.pathname === "/admin") {
        return token?.userRole === "admin";
      }
      return !!token;
    },
  },
});

export default async function middleware(
  req: NextRequestWithAuth,
  event: NextFetchEvent
) {
  const i18nResponse = i18nMiddleware(req);
  if (i18nResponse) return i18nResponse;

  const authResponse = await authMiddleware(req, event);
  return authResponse;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
