import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'
import { defaultLocale, localePrefix, locales } from './config'
// import { cookies } from 'next/headers'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection: false, // We will control locale detection manually
})

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware((auth, req) => {
  // const cookieStore = cookies()
  // const localeCookie = cookieStore.get('NEXT_LOCALE')

  // // If no locale cookie is set, set the cookie to the defaultLocale
  // if (!localeCookie) {
  //   cookieStore.set('NEXT_LOCALE', defaultLocale) // Set locale cookie
  // }

  // Protect routes using Clerk middleware for non-public routes
  if (!isPublicRoute(req)) {
    auth().protect()
  }

  // Return the intlMiddleware as usual to handle the locale
  return intlMiddleware(req)
})

export const config = {
  matcher: [
    '/',
    '/(el|en)/:path*',
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
