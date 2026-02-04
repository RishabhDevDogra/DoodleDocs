// Generate Reddit-style names with adjective-occupation format
const adjectives = [
  'Creative', 'Artistic', 'Bold', 'Brilliant', 'Calm', 'Cheerful', 'Clever', 'Curious',
  'Daring', 'Dynamic', 'Eager', 'Elegant', 'Energetic', 'Fearless', 'Friendly', 'Gentle',
  'Happy', 'Honest', 'Humble', 'Incredible', 'Joyful', 'Kind', 'Lively', 'Loyal',
  'Magical', 'Mighty', 'Noble', 'Optimistic', 'Passionate', 'Peaceful', 'Playful', 'Proud',
  'Quick', 'Radiant', 'Reliable', 'Serene', 'Sharp', 'Smart', 'Smooth', 'Spirited',
  'Stellar', 'Strong', 'Swift', 'Talented', 'Thoughtful', 'Vibrant', 'Wise', 'Witty'
];

const occupations = [
  'Artist', 'Architect', 'Chef', 'Designer', 'Doctor', 'Engineer', 'Explorer', 'Gardener',
  'Guide', 'Inventor', 'Judge', 'Keeper', 'Leader', 'Maker', 'Navigator', 'Observer',
  'Painter', 'Pilot', 'Poet', 'Ranger', 'Scholar', 'Scientist', 'Scout', 'Sculptor',
  'Singer', 'Solver', 'Teacher', 'Thinker', 'Trainer', 'Traveler', 'Visionary', 'Warrior',
  'Writer', 'Composer', 'Dancer', 'Dreamer', 'Builder', 'Creator', 'Craftsman', 'Healer',
  'Hunter', 'Musician', 'Philosopher', 'Strategist', 'Storyteller', 'Adventurer', 'Champion', 'Guardian'
];

export function generateFunnyName() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const occupation = occupations[Math.floor(Math.random() * occupations.length)];
  return `${adjective}-${occupation}`;
}

export function getOrCreateUserId() {
  const storageKey = 'doodledocs_user_id';
  const storageName = 'doodledocs_user_name';
  
  let userId = localStorage.getItem(storageKey);
  let userName = localStorage.getItem(storageName);
  
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    userName = generateFunnyName();
    localStorage.setItem(storageKey, userId);
    localStorage.setItem(storageName, userName);
  }
  
  return { userId, userName };
}
