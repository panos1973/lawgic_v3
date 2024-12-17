import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
let locales = ["el", "en"];

function getLocale(request: NextRequest) {
  let headers = { "accept-language": "en-US,en;q=0.5" };
  let languages = new Negotiator({ headers }).languages();
  console.log(languages);

  let defaultLocale = "el";
  return match(languages, locales, defaultLocale);
}

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    const { pathname } = request.nextUrl;
    const pathnameHasLocale = locales.some(
      (locale) =>
        pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) return;

    // Redirect if there is no locale
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    auth().protect();

    return NextResponse.redirect(request.nextUrl);
  }
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    "/((?!_next).*)",
    "/((?!api|_next/static|_next/image|img/|favicon.ico).*)",
  ],
};
