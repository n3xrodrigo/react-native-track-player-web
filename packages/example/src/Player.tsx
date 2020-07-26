import React, { useState } from 'react';
import TrackPlayer, {
  State,
  Event,
  useProgress,
  usePlaybackState,
  useTrackPlayerEvents,
  Track,
} from 'react-native-track-player-web';
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

function ProgressBar() {
  const progress = useProgress();

  return (
    <View style={styles.progress}>
      <View style={{ flex: progress.position, backgroundColor: 'red' }} />
      <View
        style={{
          flex: progress.duration - progress.position,
          backgroundColor: 'grey',
        }}
      />
    </View>
  );
}

function ControlButton({ title, onPress }: { title: string; onPress(): void }) {
  return (
    <TouchableOpacity style={styles.controlButtonContainer} onPress={onPress}>
      <Text style={styles.controlButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}

interface Props {
  style: ViewStyle;
  onNext(): void;
  onPrevious(): void;
  onTogglePlayback(): void;
}

export default function Player(props: Props) {
  const playbackState = usePlaybackState();

  const [trackTitle, setTrackTitle] = useState<undefined | string>('');
  const [trackArtwork, setTrackArtwork] = useState<any>('');
  const [trackArtist, setTrackArtist] = useState<undefined | string>('');

  useTrackPlayerEvents([Event.PlaybackTrackChanged], (event: any) => {
    if (event.type === Event.PlaybackTrackChanged) {
      TrackPlayer.getTrack(event.nextTrack).then((track: Track) => {
        setTrackTitle(track.title);
        setTrackArtist(track.artist);
        setTrackArtwork(track.artwork);
      });
    }
  });

  const { style, onNext, onPrevious, onTogglePlayback } = props;

  var middleButtonText = 'Play';

  if (playbackState === State.Playing || playbackState === State.Buffering) {
    middleButtonText = 'Pause';
  }

  return (
    <View style={[styles.card, style]}>
      <Image style={styles.cover} source={{ uri: trackArtwork }} />
      <ProgressBar />
      <Text style={styles.title}>{trackTitle}</Text>
      <Text style={styles.artist}>{trackArtist}</Text>
      <View style={styles.controls}>
        <ControlButton title={'<<'} onPress={onPrevious} />
        <ControlButton title={middleButtonText} onPress={onTogglePlayback} />
        <ControlButton title={'>>'} onPress={onNext} />
      </View>
    </View>
  );
}

Player.defaultProps = {
  style: {},
};

const styles = StyleSheet.create({
  card: {
    width: '80%',
    elevation: 1,
    borderRadius: 4,
    shadowRadius: 2,
    shadowOpacity: 0.1,
    alignItems: 'center',
    shadowColor: 'black',
    backgroundColor: 'white',
    shadowOffset: { width: 0, height: 1 },
  },
  cover: {
    width: 140,
    height: 140,
    marginTop: 20,
    backgroundColor: 'grey',
  },
  progress: {
    height: 1,
    width: '90%',
    marginTop: 10,
    flexDirection: 'row',
  },
  title: {
    marginTop: 10,
  },
  artist: {
    fontWeight: 'bold',
  },
  controls: {
    marginVertical: 20,
    flexDirection: 'row',
    width: '100%',
  },
  controlButtonContainer: {
    flexGrow: 1,
  },
  controlButtonText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
