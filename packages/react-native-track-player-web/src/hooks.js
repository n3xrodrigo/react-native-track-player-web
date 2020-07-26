/**
 * This is a copy paste from: https://github.com/react-native-kit/react-native-track-player/blob/dev/lib/hooks.js
 * so we don't have to install the library as dependency just to export this
 */

import { useEffect, useState, useRef } from 'react';
import * as TrackPlayer from './track-player';
import { TrackPlayerEvents } from './events';

/**
 * @description
 *   Get current playback state and subsequent updatates
 */
export const usePlaybackState = () => {
  const [state, setState] = useState(TrackPlayer.STATE_NONE);

  useEffect(() => {
    async function setPlayerState() {
      const playerState = await TrackPlayer.getState();
      setState(playerState);
    }

    setPlayerState();

    const sub = TrackPlayer.addEventListener(TrackPlayerEvents.PLAYBACK_STATE, (data) => {
      setState(data.state);
    });

    return () => {
      sub.remove();
    };
  }, []);

  return state;
};

/**
 * @description
 *   Attaches a handler to the given TrackPlayer events and performs cleanup on unmount
 * @param {Array<string>} events - TrackPlayer events to subscribe to
 * @param {(payload: any) => void} handler - callback invoked when the event fires
 */
export const useTrackPlayerEvents = (events, handler) => {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const subs = events.map((event) =>
      TrackPlayer.addEventListener(event, (payload) =>
        savedHandler.current({ ...payload, type: event }),
      ),
    );

    return () => {
      subs.forEach((sub) => sub.remove());
    };
  }, events);
};

export const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (!delay) return;
    const id = setInterval(savedCallback.current, delay);
    return () => clearInterval(id);
  }, [delay]);
};

export const useWhenPlaybackStateChanges = (callback) => {
  useTrackPlayerEvents([TrackPlayerEvents.PLAYBACK_STATE], ({ state }) => {
    callback(state);
  });
  useEffect(() => {
    let didCancel = false;
    const fetchPlaybackState = async () => {
      const playbackState = await TrackPlayer.getState();
      if (!didCancel) {
        callback(playbackState);
      }
    };
    fetchPlaybackState();
    return () => {
      didCancel = true;
    };
  }, []);
};

export const usePlaybackStateIs = (...states) => {
  const [is, setIs] = useState();
  useWhenPlaybackStateChanges((state) => {
    setIs(states.includes(state));
  });

  return is;
};

/**
 * @description
 *   Poll for track progress for the given interval (in miliseconds)
 * @param {number} interval - ms interval
 * @param {Array<TrackPlayerState> | null} pollTrackPlayerStates - TrackPlayer states on which the track progress should be polled. If null is provided, the track progress will be polled every `interval` seconds.
 * @returns {[
 *   {
 *      progress: number,
 *      bufferedPosition: number,
 *      duration: number
 *   },
 *   (interval: number) => void
 * ]}
 */
export const useTrackPlayerProgress = (
  interval = 1000,
  pollTrackPlayerStates = [TrackPlayer.STATE_PLAYING, TrackPlayer.STATE_BUFFERING],
) => {
  const initialState = {
    position: 0,
    bufferedPosition: 0,
    duration: 0,
  };

  const [state, setState] = useState(initialState);

  const getProgress = async () => {
    const [position, bufferedPosition, duration] = await Promise.all([
      TrackPlayer.getPosition(),
      TrackPlayer.getBufferedPosition(),
      TrackPlayer.getDuration(),
    ]);
    setState({ position, bufferedPosition, duration });
  };

  let needsPoll = true;
  if (pollTrackPlayerStates) {
    needsPoll = usePlaybackStateIs(...pollTrackPlayerStates);
  }

  useInterval(getProgress, needsPoll ? interval : null);
  return state;
};
