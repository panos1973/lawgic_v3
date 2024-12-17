'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'
import {
  ClipboardText,
  DocumentUpload,
  Layer,
  Magicpen,
  MenuBoard,
  MessageText,
} from 'iconsax-react'
import { NextPage } from 'next'
import Link from 'next/link'
import { useLocale } from 'next-intl' // Import useLocale
import dynamic from 'next/dynamic'
import { useTranslations } from 'use-intl'
import { usePathname } from 'next/navigation'

// Dynamically load the user profile dropdown component
const UserProfileDropdown = dynamic(() => import('./user-profile-dropdown'), {
  ssr: false, // Disable server-side rendering for this component
  loading: () => <div>Loading...</div>, // Show a fallback while it's loading
})

interface Props {}

// Helper function to determine active route
const isActive = (path: string, route: string) => path.includes(route)

const SideNavbar: NextPage<Props> = () => {
  const path = usePathname()
  const locale = useLocale() || 'el'
  const t = useTranslations('common.mainNavs')

  return (
    <div>
      <nav className="flex flex-col justify-between py-12 w-24 border-r border-slate-100 h-[93svh]">
        <ul className="space-y-6">
          <li
            className={cn({
              'border-r-2 border-primary': isActive(path, `/lawbot`),
            })}
          >
            <Link
              href={`/${locale}/lawbot`}
              prefetch={true}
              className="flex flex-col justify-center items-center space-y-1"
            >
              <MessageText
                size={20}
                color="#555555"
                variant={isActive(path, `/lawbot`) ? 'Bulk' : 'Linear'}
              />
              <p
                className={cn('text-xs text-center', {
                  'font-semibold': isActive(path, `/lawbot`),
                })}
              >
                {t('lawbot')}
              </p>
            </Link>
          </li>

          <li
            className={cn({
              'border-r-2 border-primary': isActive(path, `/case-research`),
            })}
          >
            <Link
              href={`/${locale}/case-research`}
              prefetch={true}
              className="flex flex-col justify-center items-center space-y-1"
            >
              <Layer
                size={20}
                color="#555555"
                variant={isActive(path, `/case-research`) ? 'Bulk' : 'Linear'}
              />
              <p
                className={cn('text-xs text-center', {
                  'font-semibold': isActive(path, `/case-research`),
                })}
              >
                {t('caseResearch')}
              </p>
            </Link>
          </li>

          <li
            className={cn({
              'border-r-2 border-primary': isActive(path, `/contract`),
            })}
          >
            <Link
              href={`/${locale}/contract`}
              prefetch={true}
              className="flex flex-col justify-center items-center space-y-1"
            >
              <MenuBoard
                size={20}
                color="#555555"
                variant={isActive(path, `/contract`) ? 'Bulk' : 'Linear'}
              />
              <p
                className={cn('text-xs text-center', {
                  'font-semibold': isActive(path, `/contract`),
                })}
              >
                {t('contracts')}
              </p>
            </Link>
          </li>
         {/* <li
            className={cn({
              'border-r-2 border-primary': isActive(path, `/standard-contract`),
            })}
          >
            <Link
              href={`/${locale}/standard-contract`}
              prefetch={true}
              className="flex flex-col justify-center items-center space-y-1"
            >
              <ClipboardText
                size={20}
                color="#555555"
                variant={
                  isActive(path, `/standard-contract`) ? 'Bulk' : 'Linear'
                }
              />

              <p
                className={cn('text-xs text-center', {
                  'font-semibold': isActive(path, `/standard-contract`),
                })}
              >
                {t('simpleContracts')}
              </p>
            </Link>
          </li>
          */}
        </ul>

        <div className="flex flex-col justify-center items-center space-y-4">
          <UserProfileDropdown />
        </div>
      </nav>
    </div>
  )
}

export default memo(SideNavbar)
