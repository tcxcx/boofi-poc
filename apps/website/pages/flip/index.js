import { LayoutTiles } from 'layouts/tiles'
import dynamic from 'next/dynamic'

export default function Flip() {

const FlipBoard = dynamic(
  () => import('components/flip-board').then((mod) => mod.FlipBoard),
  { ssr: false }
)

  return (
    <LayoutTiles
      theme={'dark'}
      seo={{
        title: 'BooFi – Spookiness incoming',
        description:
          'BooFi is your friendly ghost guiding you through spooky finance and accounting',
      }}
    >
        <FlipBoard/>
    </LayoutTiles>
  )
}

export async function getStaticProps() {
  return {
    props: {
      id: 'flip',
    },
  }
}
