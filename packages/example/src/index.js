import React from 'react';
import { AppRegistry } from 'react-native';
import PlaylistScreen from './Playlist';

function App() {
  return <PlaylistScreen />;
}

AppRegistry.registerComponent('App', () => App);
AppRegistry.runApplication('App', { rootTag: document.getElementById('root') });
