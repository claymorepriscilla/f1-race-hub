// Default avatar URLs using DiceBear API
const maleAvatars = [
  'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=racer1&backgroundColor=1e1e1e',
  'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=racer2&backgroundColor=1e1e1e',
  'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=racer3&backgroundColor=1e1e1e',
  'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=racer4&backgroundColor=1e1e1e',
  'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=racer5&backgroundColor=1e1e1e',
];

const femaleAvatars = [
  'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=pilot1&backgroundColor=1e1e1e',
  'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=pilot2&backgroundColor=1e1e1e',
  'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=pilot3&backgroundColor=1e1e1e',
  'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=pilot4&backgroundColor=1e1e1e',
  'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=pilot5&backgroundColor=1e1e1e',
];

export const defaultAvatars = [...maleAvatars, ...femaleAvatars];

export const getRandomAvatar = () => {
  return defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
};
