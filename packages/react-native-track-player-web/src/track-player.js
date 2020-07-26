import * as Types from './types';
import { TrackPlayerEvents } from './events';
import { createNanoEvents } from './emitter';

export { TrackPlayerEvents };
export * from './types';

const emitter = createNanoEvents();

let audioPlayer = null;
let playlist = [];
let index = 0;
let currentTrack = null;
let _loadedTrack = null;

// Setup metadata
navigator.mediaSession.setActionHandler('play', play);
navigator.mediaSession.setActionHandler('pause', pause);

navigator.mediaSession.setActionHandler('previoustrack', skipToPrev);

navigator.mediaSession.setActionHandler('nexttrack', skipToNext);

navigator.mediaSession.setActionHandler('seekto', function (details) {
  seekTo(details.seekTime);
});

export async function setupPlayer() {
  if (audioPlayer) return audioPlayer;

  const el = document.createElement('audio');
  document.body.appendChild(el);
  el.style.display = 'none';

  audioPlayer = el;

  audioPlayer.addEventListener('timeupdate', () => {
    navigator.mediaSession.setPositionState({
      duration: audioPlayer.duration || 0,
      position: audioPlayer.currentTime,
      playbackRate: audioPlayer.playbackRate,
    });
  });

  audioPlayer.addEventListener('play', (event) => {
    navigator.mediaSession.playbackState = 'playing';
    emitter.emit(TrackPlayerEvents.PLAYBACK_STATE, {
      state: Types.STATE_PLAYING,
    });
  });

  audioPlayer.addEventListener('waiting', () => {
    navigator.mediaSession.playbackState = 'paused';
    emitter.emit(TrackPlayerEvents.PLAYBACK_STATE, {
      state: audioPlayer.paused ? Types.STATE_CONNECTING : Types.STATE_BUFFERING,
    });
  });

  audioPlayer.addEventListener('playing', (event) => {
    navigator.mediaSession.playbackState = 'playing';
    emitter.emit(TrackPlayerEvents.PLAYBACK_STATE, {
      state: Types.STATE_PLAYING,
    });
  });

  audioPlayer.addEventListener('pause', () => {
    navigator.mediaSession.playbackState = 'paused';
    emitter.emit(TrackPlayerEvents.PLAYBACK_STATE, {
      state: Types.STATE_PAUSED,
    });
  });

  audioPlayer.addEventListener('canplay', () => {
    navigator.mediaSession.playbackState = 'none';
    emitter.emit(TrackPlayerEvents.PLAYBACK_STATE, {
      state: Types.STATE_READY,
    });
  });

  audioPlayer.addEventListener('ended', () => {
    navigator.mediaSession.playbackState = 'none';
    emitter.emit(TrackPlayerEvents.PLAYBACK_STATE, {
      state: Types.STATE_NONE,
    });
    skipToNext(true);
  });

  return audioPlayer;
}

export async function destroy() {
  audioPlayer.innerHTML = '';
}

export async function registerPlaybackService() {
  // todo
}

export function addEventListener(event, listener) {
  return emitter.addEventListener(event, listener);
}

export function registerEventHandler() {
  // deprecated
}

export async function add(tracks, insertBeforeId) {
  if (Array.isArray(tracks)) {
    tracks = [...tracks];
  } else {
    tracks = [tracks];
  }

  if (tracks.length < 1) return;

  if (!insertBeforeId) {
    playlist = [...playlist, ...tracks];
    return;
  }

  const index = playlist.findIndex((p) => p.id === insertBeforeId);

  if (index === -1) {
    playlist = [...playlist, ...tracks];
    return;
  }

  playlist.splice(index, 0, ...tracks);
  return;
}

export async function remove(tracks) {
  if (!Array.isArray(tracks)) {
    tracks = [tracks];
  }

  playlist = playlist.filter((p) => p.id.includes(tracks));
  return;
}

export async function skip(id) {
  const trackIndex = playlist.findIndex((p) => p.id === id);

  if (trackIndex === -1) return;

  index = trackIndex;

  const wasPlaying = playing();
  loadTrack();
  if (wasPlaying) play();
}

export async function skipToNext(forcePlay = false) {
  index = index + 1;

  if (index > playlist.length - 1) {
    index = index - 1;
    // you are on the last track
    emitter.emit(TrackPlayerEvents.PLAYBACK_QUEUE_ENDED, {
      track: playlist[index],
    });
    return;
  }

  const wasPlaying = playing();
  loadTrack();
  if (wasPlaying || forcePlay) play();
}

export async function skipToPrev() {
  index = index - 1;

  if (index < 0) {
    index = index + 1;
    // you are on the first track
  }

  const wasPlaying = playing();
  loadTrack();
  if (wasPlaying) play();
}

export async function reset() {
  audioPlayer.pause();
  audioPlayer.innerHTML = '';
}

export async function getTrack(id) {
  return playlist.find((p) => p.id === id);
}

export async function getCurrentTrack() {
  return playlist[index] ? playlist[index].id : null;
}

export async function getQueue() {
  return playlist;
}

export async function removeUpcomingTracks() {
  playlist = playlist.slice(0, index + 1);
}

export async function updateMetadataForTrack(id, metadata) {
  // todo
}

export async function updateOptions() {
  // todo
}

export async function play() {
  if (playlist.length === 0) return;
  if (playing()) return;

  loadTrack();
  audioPlayer.play();
}

export async function pause() {
  audioPlayer.pause();
}

export async function stop() {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  navigator.mediaSession.setPositionState(null);
}

export async function seekTo(time) {
  if (!time) return audioPlayer.currentTime;
  audioPlayer.currentTime = time;
}

export async function setVolume(volume) {
  audioPlayer.volume = volume;
}

export async function getVolume() {
  return audioPlayer.volume;
}

export async function setRate(rate) {
  audioPlayer.playbackRate = rate;
}

export async function getRate() {
  return audioPlayer.playbackRate;
}

export async function getDuration() {
  return audioPlayer.duration;
}

export async function getPosition() {
  return audioPlayer.currentTime;
}

export async function getBufferedPosition() {
  const buffers = audioPlayer.buffered.length;
  return buffers === 0 ? 0 : audioPlayer.buffered.end(buffers - 1);
}

export async function getState() {
  if (!audioPlayer || audioPlayer.readyState === 0) return Types.STATE_NONE;

  if (
    audioPlayer &&
    audioPlayer.readyState !== 0 &&
    audioPlayer.paused &&
    audioPlayer.played.end(0) === 0
  )
    return Types.STATE_READY;

  if (
    audioPlayer &&
    audioPlayer.buffered.end(0) === audioPlayer.currentTime &&
    audioPlayer.readyState <= 2
  )
    return audioPlayer.paused ? Types.STATE_CONNECTING : Types.STATE_BUFFERING;

  if (!audioPlayer.paused) return Types.STATE_PLAYING;
  if (audioPlayer.paused && audioPlayer.currentTime === 0) return Types.STATE_STOPPED;
  if (audioPlayer.paused) return Types.STATE_PAUSED;
}

/** ---  */

function playing() {
  return !audioPlayer.paused;
}

function loadTrack() {
  if (_loadedTrack === index) return;
  if (playlist.length === 0) return;

  const oldPosition = audioPlayer.duration;

  audioPlayer.innerHTML = '';

  const oldTrack = playlist[_loadedTrack];
  currentTrack = playlist[index];

  const source = document.createElement('source');
  source.src = currentTrack.url;
  source.type = currentTrack.type || 'audio/mp3';

  audioPlayer.appendChild(source);
  audioPlayer.load();

  navigator.mediaSession.setPositionState({
    duration: currentTrack.duration,
  });

  emitter.emit(TrackPlayerEvents.PLAYBACK_TRACK_CHANGED, {
    track: oldTrack ? oldTrack.id : null,
    nextTrack: currentTrack ? currentTrack.id : null,
    position: typeof oldPosition === 'number' ? oldPosition : null,
  });

  _loadedTrack = index;
}
