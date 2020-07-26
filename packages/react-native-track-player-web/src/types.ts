// States
export const STATE_NONE = 0;
export const STATE_READY = 1;
export const STATE_PLAYING = 2;
export const STATE_PAUSED = 3;
export const STATE_STOPPED = 4;
export const STATE_BUFFERING = 5;
export const STATE_CONNECTING = 6;

// Capabilities
export const CAPABILITY_PLAY = 0;
export const CAPABILITY_PLAY_FROM_ID = 1;
export const CAPABILITY_PLAY_FROM_SEARCH = 2;
export const CAPABILITY_PAUSE = 3;
export const CAPABILITY_STOP = 4;
export const CAPABILITY_SEEK_TO = 5;
export const CAPABILITY_SKIP = 6;
export const CAPABILITY_SKIP_TO_NEXT = 7;
export const CAPABILITY_SKIP_TO_PREVIOUS = 8;
export const CAPABILITY_JUMP_FORWARD = 9;
export const CAPABILITY_JUMP_BACKWARD = 10;
export const CAPABILITY_SET_RATING = 11;
export const CAPABILITY_LIKE = 12;
export const CAPABILITY_DISLIKE = 13;
export const CAPABILITY_BOOKMARK = 14;

// Pitch algorithms
export const PITCH_ALGORITHM_LINEAR = 0;
export const PITCH_ALGORITHM_MUSIC = 1;
export const PITCH_ALGORITHM_VOICE = 2;

// Rating Types
export const RATING_HEART = 0;
export const RATING_THUMBS_UP_DOWN = 1;
export const RATING_3_STARS = 2;
export const RATING_4_STARS = 3;
export const RATING_5_STARS = 4;
export const RATING_PERCENTAGE = 5;
