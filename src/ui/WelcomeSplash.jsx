import './welcome-splash.css'

export default function WelcomeSplash({ onStart }) {
  return (
    <div className="welcome-splash">
      <div className="welcome-splash__bg" aria-hidden />
      <div className="welcome-splash__content">
        <p className="welcome-splash__eyebrow">Welcome to</p>
        <h1 className="welcome-splash__brand">Fascino</h1>
        <p className="welcome-splash__tagline">
          Discover places. Live stories. Feel the world in AR.
        </p>

        <div className="welcome-splash__logo-wrap">
          <div className="welcome-splash__glow" aria-hidden />
          <button
            type="button"
            className="welcome-splash__logo-btn"
            onClick={onStart}
            aria-label="Start Fascino experience"
          >
            <img src="/fascinologo.png" alt="" className="welcome-splash__logo-img" width={104} height={104} />
          </button>
        </div>

        <p className="welcome-splash__hint">
          Click on the logo{' '}
          <span className="welcome-splash__hint-highlight">to start</span> experience
        </p>

        <div className="welcome-splash__dots" aria-hidden>
          <span className="welcome-splash__dot welcome-splash__dot--active" />
          <span className="welcome-splash__dot" />
          <span className="welcome-splash__dot" />
          <span className="welcome-splash__dot" />
        </div>
      </div>
    </div>
  )
}
