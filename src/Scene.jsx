import ArVideoFrame from './ui/ArVideoFrame'
import './ui/styles.css'
import './ui/frame-wrapper.css'

const KNOW_MORE_URL = 'https://fascinolibrary.com/fascinolib/#/site/mk-stalin'

export default function Scene() {
  return (
    <div className="ar-ui-layer">
      <div className="frame-wrapper">
        <div className="canvas-holder">
          <ArVideoFrame exploreUrl={KNOW_MORE_URL} />
        </div>
      </div>
    </div>
  )
}
