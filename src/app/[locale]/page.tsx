import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

export default async function Home() {
  const t = await getTranslations('common')
  return (
    <div className="md:h-[93svh] h-[83svh] flex justify-center items-center  ">
      <div className="border rounded-2xl p-5 w-[90svw] md:w-[70%] max-h-[70svh] md:max-h-full overflow-y-scroll md:overflow-y-hidden">
        <p
          className="text-sm"
          dangerouslySetInnerHTML={{ __html: t.raw('home') }}
        ></p>
      </div>
    </div>
  )
}
