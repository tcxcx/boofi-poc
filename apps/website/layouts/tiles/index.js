import { Intro } from 'components/intro'
import { CustomHead } from 'components/custom-head'
import { Scrollbar } from 'components/scrollbar'


export function LayoutTiles({
  seo = { title: 'BooFi Spooky Website', description: 'BooFi is your friendly ghost guiding you through spooky finance and accounting', image: '', keywords: 'boofi, spooky, finance, accounting, ghost' },
  children,
  className,
}) {
  return (
    <>
      <CustomHead {...seo} />
        <Scrollbar />
        <main>{children}</main>
    </>
  )
}
