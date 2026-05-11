function asset(name) {
  return `/videos/${encodeURIComponent(name)}`
}

export const sceneVideoConfigs = [
  { id: 1, videoSrc: asset('Me Mumbai English (1).mp4'), label: 'Mumbai · English', experienceLabel: 'Mumbai EN' },
  { id: 2, videoSrc: asset('19 Me Kamshet (2).mp4'), label: 'Kamshet', experienceLabel: 'Kamshet' },
  { id: 3, videoSrc: asset('24 Me Monsoon (1).mp4'), label: 'Monsoon', experienceLabel: 'Monsoon' },
  { id: 4, videoSrc: asset('101 Me Adventure (1).mp4'), label: 'Adventure', experienceLabel: 'Adventure' },
  { id: 5, videoSrc: asset('520 Me Kolad (1).mp4'), label: 'Kolad', experienceLabel: 'Kolad' },
]
