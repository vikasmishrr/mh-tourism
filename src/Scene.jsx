import ArVideoFrame from './ui/ArVideoFrame'
import './ui/styles.css'
import './ui/frame-wrapper.css'

const KNOW_MORE_URL = 'https://example.com'
const MAPS_SEARCH_URL =
  'https://www.google.com/maps/search/Maharashtra+Tourism+Development+Corporation'

export default function Scene() {
  return (
    <div
      className="ar-ui-layer"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 3,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <div className="frame-wrapper">
        <div className="canvas-holder">
          <ArVideoFrame exploreUrl={KNOW_MORE_URL} mapsSearchUrl={MAPS_SEARCH_URL} />
        </div>
      </div>
    </div>
  )
}
