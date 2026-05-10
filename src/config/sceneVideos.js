function asset(name) {
  return `/videos/${encodeURIComponent(name)}`
}

export const sceneVideoConfigs = [
  { id: 1, videoSrc: asset('MTDC Resort Flip.mp4'), label: 'MTDC Resort Flip', experienceLabel: 'Resort' },
  { id: 2, videoSrc: asset('Me Mumbai English (1).mp4'), label: 'Mumbai · English', experienceLabel: 'Mumbai EN' },
  { id: 3, videoSrc: asset('425 Me Mumbai (1).mp4'), label: 'Mumbai', experienceLabel: 'City tour' },
  { id: 4, videoSrc: asset('520 Me Kolad (1).mp4'), label: 'Kolad', experienceLabel: 'Kolad' },
]
