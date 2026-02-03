// Generate funny random names like Reddit does
const adjectives = [
  'Silly', 'Happy', 'Clever', 'Lazy', 'Speedy', 'Sleepy', 'Gentle', 'Brave',
  'Witty', 'Curious', 'Eager', 'Swift', 'Wild', 'Cool', 'Bright', 'Crafty',
  'Playful', 'Sharp', 'Calm', 'Snappy', 'Vivid', 'Noble', 'Kind', 'Bouncy',
  'Zippy', 'Quirky', 'Humble', 'Sly', 'Mighty', 'Jolly', 'Perky', 'Smooth',
  'Droll', 'Wacky', 'Smart', 'Tiny', 'Vast', 'Fuzzy', 'Sleek', 'Proud'
];

const nouns = [
  'Panda', 'Narwhal', 'Penguin', 'Platypus', 'Capybara', 'Otter', 'Lemur', 'Quokka',
  'Sloth', 'Hedgehog', 'Koala', 'Chinchilla', 'Meerkat', 'Mongoose', 'Wombat', 'Badger',
  'Emu', 'Flamingo', 'Peacock', 'Llama', 'Alpaca', 'Axolotl', 'Fennec', 'Caracal',
  'Ocelot', 'Puma', 'Jaguar', 'Lynx', 'Bobcat', 'Cougar', 'Cheetah', 'Serval',
  'Dolphin', 'Whale', 'Seal', 'Walrus', 'Manatee', 'Orca', 'Shark', 'Stingray',
  'Turtle', 'Tortoise', 'Iguana', 'Dragon', 'Phoenix', 'Griffin', 'Unicorn', 'Sphinx'
];

export function generateFunnyName() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective}-${noun}`;
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
