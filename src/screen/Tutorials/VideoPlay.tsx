import React from 'react';
import {colors} from '../../utils';
import {WebView} from 'react-native-webview';
import Entypo from 'react-native-vector-icons/Entypo';
import {View, Dimensions, StyleSheet} from 'react-native';
import {ANDROID, IOS, moderateScale} from '../../utils/metrics';

interface VideoPlayProps {
  videoItem?: string;
  onLoadEnd?: () => void;
  onClosePress?: () => void;
}

const VideoPlay = ({videoItem, onLoadEnd, onClosePress}: VideoPlayProps) => {
  const getVideoId = (url: string | undefined) => {
    if (!url) {
      return null;
    }
    const match = url.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)/);
    return match ? match[1] : null;
  };

  const vimeoId = getVideoId(videoItem);
  const htmlContent = `
    <html>
      <body style="margin:0;padding:0;overflow:hidden;background:black;">
        <iframe
          src="https://player.vimeo.com/video/${vimeoId}?autoplay=1&playsinline=1"
          width="100%" height="100%" frameborder="0"
          allow="autoplay; fullscreen" allowfullscreen
        ></iframe>
      </body>
    </html>
  `;

  return (
    <View style={IOS ? {} : styles.container}>
      {ANDROID && (
        <Entypo
          size={40}
          name={'cross'}
          color={colors.white}
          onPress={onClosePress}
          style={{
            alignSelf: 'flex-end',
            padding: moderateScale(20),
            marginVertical: moderateScale(20),
          }}
        />
      )}
      <WebView
        originWhitelist={['*']}
        source={{html: htmlContent}}
        style={styles.backgroundVideo}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        onLoadEnd={onLoadEnd}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="always"
      />
    </View>
  );
};

export default VideoPlay;

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get('screen').height - 150,
    backgroundColor: 'black',
  },
  backgroundVideo: {flex: 1, marginBottom: 100},
});
