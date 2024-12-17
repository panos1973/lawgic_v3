'use client'
import { NextPage } from 'next'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePathname, useRouter } from '@/navigation'
import { useLocale } from 'next-intl'
import { useTransition } from 'react'
import { useParams } from 'next/navigation'
import { Locale } from '@/types'
import { cookies } from 'next/headers'
interface Props {}

const LocaltySelector: NextPage<Props> = () => {
  const router = useRouter()
  const locale = useLocale() || 'el'
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()
  const params = useParams()
  // const changeLocalty = (locale: String) => {
  //   const nextLocale = locale as Locale;
  //   startTransition(() => {
  //     router.replace(
  //       // {
  //       //   pathname,
  //       //   // @ts-expect-error -- TypeScript will validate that only known `params`
  //       //   // are used in combination with a given `pathname`. Since the two will
  //       //   // always match for the current route, we can skip runtime checks.
  //       //   params,
  //       // },
  //       pathname,
  //       { locale: nextLocale }
  //     );
  //   });
  // };

  const changeLocalty = (locale: String) => {
    const nextLocale = locale as Locale
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/`
      router.replace(pathname, { locale: nextLocale })
    })
  }

  return (
    <div>
      <Select
        defaultValue={locale}
        onValueChange={changeLocalty}
      >
        <SelectTrigger className="text-xs">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value="en"
            className="text-xs"
          >
            EN
          </SelectItem>
          <SelectItem
            value="el"
            className="text-xs"
          >
            EL
          </SelectItem>
          {/* <SelectItem value="system">System</SelectItem> */}
        </SelectContent>
      </Select>
    </div>
  )
}

export default LocaltySelector
