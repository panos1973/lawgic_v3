import { Pathnames, LocalePrefix } from 'next-intl/routing'

export const defaultLocale = 'el' as const
export const locales = ['en', 'el'] as const

export const localePrefix: LocalePrefix<typeof locales> = 'always'
