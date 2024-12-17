'use client'
import { NextPage } from 'next'
import { cn } from '@/lib/utils'
import {
  DocumentUpload,
  Layer,
  Magicpen,
  MenuBoard,
  Message,
  MessageText,
  Notification,
} from 'iconsax-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '../ui/button'
import UserProfileDropdown from './user-profile-dropdown'
import { useTranslations } from 'next-intl'
interface Props {}

const MobileNavbar: NextPage<Props> = () => {
  const path = usePathname()
  const t = useTranslations('common.mainNavs')

  return (
    <div>
      <nav className="flex items-center justify-between w-full border-t border-slate-100 h-[10svh] bg-white">
        <ul className="flex flex-wrap justify-between w-full px-6 text-wrap md:text-nowrap">
          <li
            className={cn('w-1/4 flex flex-col items-center', {
              'text-primary': path.includes('/lawbot'),
            })}
          >
            <Link
              href={'/lawbot'}
              className="flex flex-col justify-center items-center space-y-1"
            >
              <MessageText
                size={20}
                color="#555555"
                variant={path.includes('/lawbot') ? 'Bulk' : 'Linear'}
              />
              <p
                className={cn('text-xs text-center', {
                  'font-semibold ': path.includes('/lawbot'),
                })}
              >
                {t('lawbot')}
              </p>
            </Link>
          </li>
          <li
            className={cn('w-1/4 flex flex-col items-center', {
              'text-primary': path.includes('/case-research'),
            })}
          >
            <Link
              href={'/case-research'}
              className="flex flex-col justify-center items-center space-y-1"
            >
              <Layer
                size="20"
                color="#555555"
                variant={path.includes('/case-research') ? 'Bulk' : 'Linear'}
              />
              <p
                className={cn('text-xs text-center', {
                  'font-semibold text-ref': path.includes('/case-research'),
                })}
              >
                {t('caseResearch')}
              </p>
            </Link>
          </li>
          <li
            className={cn('w-1/4 flex flex-col items-center', {
              'text-primary': path.includes('/contract'),
            })}
          >
            <Link
              href={'/contract'}
              className="flex flex-col justify-center items-center space-y-1"
            >
              <MenuBoard
                size="20"
                color="#555555"
                variant={path.includes('/contract') ? 'Bulk' : 'Linear'}
              />
              <p
                className={cn('text-xs text-center', {
                  'font-semibold': path.includes('/contract'),
                })}
              >
                {t('contracts')}
              </p>
            </Link>
          </li>
          <li className="w-1/4 flex flex-col items-center">
            <UserProfileDropdown />
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default MobileNavbar
