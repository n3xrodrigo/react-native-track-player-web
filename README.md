# react-native-track-player-web

`react-native-web` partial implementation of [react-native-track-player](https://github.com/react-native-kit/react-native-track-player).

Note that this is a partial implementation and it's not production ready.

### Targeting the Web

Add the following to your webpack configuration:

```javascript
module.exports = {
  ..., /* the existing configuration */

  resolve: {
    alias: {
      'react-native-track-player': 'react-native-track-player-web'
    }
  }
};
```
