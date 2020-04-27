const MAIN_GAME_DATA = ["stone","wood","wood","wood","wood","iron","wood","wood","wood","wood","stone","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","wood","wood","wood","stone","wood","wood","wood","stone","wood","wood","wood","iron","wood","wood","wood","stone","wood","wood","wood","stone","wood","wood","wood","stone","wood","wood","wood","stone","wood","wood","wood","stone","wood","wood","wood","stone","wood","wood","wood","stone","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","stone","wood","wood","wood","supreme","wood","wood","wood","stone","wood","wood","wood","iron","wood","wood","wood","wood","stone","wood","wood","wood","wood","wood","stone","wood","wood","wood","stone","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","stone","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","stone","wood","wood","wood","stone","wood","wood","wood","stone","wood","wood","wood","wood","wood","iron","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","wood","stone","wood","wood","wood","wood","epic","wood","wood"];

// Inexplicably, even though the Balance.json is exactly above, the game actually has an extra stone in spot #241.
const MAIN_DATA_REPLACEMENTS = { 
  240: "stone"
};

for (let replacementIndex in MAIN_DATA_REPLACEMENTS) {
  MAIN_GAME_DATA[replacementIndex] = MAIN_DATA_REPLACEMENTS[replacementIndex];
}



const BASE_EVENT_GAME_DATA = ["plastic","plastic","armored","plastic","plastic","plastic","armored","plastic","plastic","plastic","armored","plastic","plastic","plastic","armored","plastic","plastic","plastic","armored","plastic","plastic","plastic","armored","plastic"];

// Inexplicably, even though the Balance.json is exactly above, the game actually has an extra plastic in spot #25.
const BASE_EVENT_DATA_REPLACEMENTS = { 
  24: "plastic"
};

for (let replacementIndex in BASE_EVENT_DATA_REPLACEMENTS) {
  BASE_EVENT_GAME_DATA[replacementIndex] = BASE_EVENT_DATA_REPLACEMENTS[replacementIndex];
}

// The first capsule in an event is a scripted plastic.  So we just move the plastic at the end to the beginning to fix the loop.
const EVENT_GAME_DATA = ["plastic", ...BASE_EVENT_GAME_DATA.slice(0, -1)]
