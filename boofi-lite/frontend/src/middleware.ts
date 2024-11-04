import { NextFetchEvent, NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { geolocation } from '@vercel/edge';

// List of blocked countries (ISO 3166-1 alpha-2 country codes)
// North Korea (KP), Iran (IR), Syria (SY), Cuba (CU), Crimea (UA-43), Luhansk (UA-09), Donetsk (UA-14)
const BLOCKED_COUNTRIES = [
  'KP',
  'IR',
  'SY',
  'CU',
  'UA-43',
  'UA-09',
  'UA-14',
  'UNKNOWN',
];

// Middleware for handling internationalization
const i18nMiddleware = createMiddleware({
  locales: ["en", "es", "pt"],
  defaultLocale: "en",
});

// Middleware for handling authentication
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

// Main middleware function
export default async function middleware(
  req: NextRequestWithAuth,
  event: NextFetchEvent
) {
  // Check if i18nMiddleware returns a response
  const i18nResponse = i18nMiddleware(req);
  if (i18nResponse) return i18nResponse;

  // Handle authentication
  const authResponse = await authMiddleware(req, event);
  if (authResponse) return authResponse;

  console.log('Inside middleware');

  // Geolocation-based blocking
  const { country } = geolocation(req);
  const countryCode = country || 'UNKNOWN';

  if (BLOCKED_COUNTRIES.includes(countryCode)) {
    console.log(`Country ${countryCode} is blocked`);
    return new Response('AI agent app not available in your country', { status: 403 });
  }
}

// Configuration for matcher
export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
