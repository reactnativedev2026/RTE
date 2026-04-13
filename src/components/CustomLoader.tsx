import React from 'react';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';
import {StyleSheet, View} from 'react-native';
import {moderateScale} from '../utils/metrics';

interface CustomLoaderProps {}

const CustomLoader = ({}: CustomLoaderProps) => {
  return (
    <View>
      <ContentLoader
        height={70}
        speed={1}
        backgroundColor="#FFFFFF"
        foregroundColor="#E0E0E0"
        viewBox="0 0 400 70">
        <Rect x="0" y="0" rx="2" ry="2" width="400" height="70" />
      </ContentLoader>

      <ContentLoader
        height={160}
        speed={1}
        style={styles.circle}
        backgroundColor="#FFFFFF"
        foregroundColor="#E0E0E0"
        viewBox="0 0 400 160">
        <Circle cx="200" cy="80" r="80" />
      </ContentLoader>

      <ContentLoader
        height={550}
        style={styles.content}
        speed={1}
        backgroundColor="#FFFFFF"
        foregroundColor="#E0E0E0"
        viewBox="0 0 400 550">
        <Rect x="10" y="40" rx="20" ry="20" width="380" height="550" />
        <Rect x="30" y="70" rx="5" ry="5" width="300" height="15" />
        <Rect x="30" y="100" rx="5" ry="5" width="250" height="15" />
        <Rect x="30" y="130" rx="5" ry="5" width="280" height="15" />
        <Rect x="30" y="160" rx="5" ry="5" width="200" height="15" />
        <Rect x="30" y="190" rx="5" ry="5" width="250" height="15" />
      </ContentLoader>
    </View>
  );
};

export default CustomLoader;
const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    top: moderateScale(90),
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  content: {
    top: moderateScale(110),
  },
});
