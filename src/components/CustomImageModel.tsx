import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import RNFS from 'react-native-fs';
import { WebView } from 'react-native-webview';
import { colors } from '../utils';
import { moderateScale } from '../utils/metrics';

interface CustomImageMoalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  imageUri?: string;
  obj?: any;
  type?: 'image' | 'video';
  videoUrl?: string;
}

const CustomImageMoal: React.FC<CustomImageMoalProps> = ({
  modalVisible,
  setModalVisible,
  imageUri,
  obj,
  type = 'image',
  videoUrl,
}) => {
  const [loadImage, setLoadImage] = React.useState(true);
  const [loadVideo, setLoadVideo] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const getVideoId = (url: string | undefined) => {
    const match = url?.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  const vimeoEmbedUrl =
    videoUrl ||
    `https://player.vimeo.com/video/${getVideoId(
      obj?.vimeo_id?.flyover_url,
    )}?autoplay=1&loop=0&muted=1`;

  const requestAndroidPermissions = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    // For Android 13+ you should request READ_MEDIA_* permissions. For older Android versions use WRITE_EXTERNAL_STORAGE.
    try {
      if (Platform.Version >= 33) {
        // android 13 (T) and above
        const readPerm = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
        const granted = await PermissionsAndroid.request(readPerm as any);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Permission error', err);
      return false;
    }
  };

  const sanitizeFilename = (name: string) => {
    let base = name.split('?')[0].split('/').pop() || `img_${Date.now()}`;
    // replace any char except letters, numbers, dot, dash and underscore
    base = base.replace(/[^a-zA-Z0-9._-]/g, '_');
    base = base.replace(/^\.+/, '');
    if (base.length > 120) base = base.slice(0, 120);
    return base;
  };

  const saveToGallery = async () => {
    // Direct save (no confirmation) — image-only
    if (type !== 'image') return;
    const uri = imageUri;
    if (!uri)
      return Alert.alert('Error', 'No image URL available to download.');

    setSaving(true);

    // sanitize filename & ensure extension
    const rawName = uri.split('?')[0].split('/').pop() || `img_${Date.now()}`;
    let filename = sanitizeFilename(rawName);
    if (!/\.[a-zA-Z0-9]+$/.test(filename)) filename += '.jpg';

    const cachePath = `${RNFS.CachesDirectoryPath}/${filename}`;

    try {
      // request Android permission if needed
      if (Platform.OS === 'android') {
        const ok = await requestAndroidPermissions();
        if (!ok) {
          console.warn('Permission denied');
          return;
        }
      }

      // encode URL to avoid fragment issues with '#' etc.
      const encodedUrl = encodeURI(uri);
      console.log('Downloading image ->', encodedUrl, 'to', cachePath);

      const dl = RNFS.downloadFile({fromUrl: encodedUrl, toFile: cachePath});
      const res = await dl.promise;
      console.log('download result', res);

      // Accept 200, 201, 206 as success
      if (
        !(
          res &&
          (res.statusCode === 200 ||
            res.statusCode === 201 ||
            res.statusCode === 206)
        )
      ) {
        console.warn(
          'Download returned non-success status',
          res && res.statusCode,
        );
        throw new Error(`Download failed with status ${res && res.statusCode}`);
      }

      // verify file exists and has size > 0
      const exists = await RNFS.exists(cachePath);
      console.log('RNFS.exists ->', exists, cachePath);
      if (!exists) throw new Error('Downloaded file missing after download');

      const stat = await RNFS.stat(cachePath).catch(e => {
        console.warn('stat failed', e);
        return null;
      });
      console.log('RNFS.stat ->', stat);
      if (!stat || Number(stat.size) <= 0) {
        throw new Error('Downloaded file is empty or unreadable');
      }

      // Try CameraRoll.save first (cross-platform)

      const saveUri = `file://${cachePath}`;
      console.log('Attempting CameraRoll.save ->', saveUri);
      await CameraRoll.saveAsset(saveUri, {type: 'photo'});
      console.log('Saved via CameraRoll:', saveUri); 
      // Fallback Android direct write to Pictures and scan
      if (Platform.OS === 'android') {
        const destDir = `${RNFS.ExternalStorageDirectoryPath}/Pictures/MyApp`;
        try {
          const existsDir = await RNFS.exists(destDir);
          if (!existsDir) await RNFS.mkdir(destDir);
        } catch (e) {
          console.warn('mkdir error', e);
        }
        const destPath = `${destDir}/${filename}`;
        // move file from cache to dest
        try {
          await RNFS.moveFile(cachePath, destPath);
        } catch (e) {
          console.warn('moveFile failed, trying copy', e);
          try {
            await RNFS.copyFile(cachePath, destPath);
            await RNFS.unlink(cachePath);
          } catch (err) {
            console.warn('copyFile failed', err);
            throw err;
          }
        }

        // trigger media scan if native module available
        // try {
        //   if ((NativeModules as any)?.MediaScannerConnection?.scanFile) {
        //     await (NativeModules as any).MediaScannerConnection.scanFile(
        //       destPath,
        //     );
        //     console.log('MediaScanner scanned', destPath);
        //     return;
        //   }
        // } catch (e) {
        //   console.warn('MediaScanner scan failed', e);
        // }

        // as last resort try CameraRoll.save on dest path
        try {
          if (CameraRoll && typeof (CameraRoll as any).save === 'function') {
            const saveUri2 = `file://${destPath}`;
            await (CameraRoll as any).save(saveUri2, {type: 'photo'});
            try {
              await RNFS.unlink(destPath);
              Alert.alert('Photos Saved');
            } catch (e) {
              console.log('🚀 ~ saveToGallery ~ e:', e);
            }
            return;
          }
        } catch (e) {
          console.warn('CameraRoll fallback failed', e);
        }
      }
    } catch (err: any) {
      const message = err && err.message ? err.message : String(err);
      // Alert.alert('Save error', message);
    } finally {
      setSaving(false);
      Alert.alert('Photo Saved');
      setTimeout(async () => {
        RNFS.unlink(cachePath);
        console.log('cleanup unlink sccesss');
      }, 500);
    }
  };

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.modalBackground}
          onPress={() => setModalVisible(false)}
        />
        <View style={styles.closeButtonContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        {type === 'image' ? (
          <View style={styles.imageModalContainer}>
            <FastImage
              source={{uri: imageUri}}
              style={styles.fullImage}
              resizeMode={FastImage.resizeMode.contain}
              onLoadStart={() => setLoadImage(true)}
              onLoadEnd={() => setLoadImage(false)}
            />

            {loadImage && (
              <ActivityIndicator
                size="large"
                color={colors.primaryMediumBlue}
                style={{position: 'absolute', alignSelf: 'center', top: '50%'}}
              />
            )}

            {/* Download / Save button */}
            <View
              style={styles.actionRow}
              pointerEvents={saving ? 'none' : 'auto'}>
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={saveToGallery}
                disabled={saving}>
                <Text style={styles.downloadTxt}>
                  {saving ? 'Saving...' : 'Download'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View
            style={{
              width: '90%',
              height: 300,
              borderRadius: 10,
              overflow: 'hidden',
              backgroundColor: 'transparent',
            }}>
            <WebView
              source={{uri: vimeoEmbedUrl}}
              onLoadEnd={() => setLoadVideo(false)}
              style={{flex: 1}}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsFullscreenVideo={true}
            />
            {loadVideo && (
              <ActivityIndicator
                size="large"
                color={colors.primaryMediumBlue}
                style={{position: 'absolute', alignSelf: 'center', top: '50%'}}
              />
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: 'flex-end',
    width: moderateScale(65),
    height: moderateScale(70),
    marginTop: moderateScale(5),
    marginLeft: moderateScale(10),
  },
  image: {height: moderateScale(70), width: moderateScale(65)},
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.transparent,
  },
  modalBackground: {...StyleSheet.absoluteFillObject},
  imageModalContainer: {
    width: '90%',
    height: 300,
    // borderRadius: 10,
    // overflow: 'hidden',
    // backgroundColor: 'transparent',
  },
  fullImage: {width: '100%', height: '100%'},
  closeButtonContainer: {
    top: 20,
    marginVertical: 20,
    marginHorizontal: 20,
    alignSelf: 'flex-end',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  closeButtonText: {
    fontSize: 22,
    color: '#000',
    fontWeight: 'bold',
  },
  clickHere_txt: {
    fontWeight: '700',
    color: colors.white,
    textDecorationLine: 'underline',
  },
  backgroundVideo: {width: '100%'},
  videoLink: {
    left: 0,
    right: 0,
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    bottom: moderateScale(100),
    alignItems: 'center',
    height: 50,
  },
  actionRow: {
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 20,
    width: '50%',

    // position: 'absolute',
    // bottom: -20,
    // right: 12,
    // zIndex: 200,
  },
  downloadBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    alignItems: 'center',
    // paddingHorizontal: 12,
    borderRadius: 8,
  },
  downloadTxt: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CustomImageMoal;

/*
  NOTES / SETUP:
  1) Install native deps:
     npm install react-native-fs @react-native-cameraroll/cameraroll
     npx pod-install ios

  2) Android permissions (AndroidManifest.xml):
     <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
     <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
     // For Android 13+ also add in manifest if you want:
     <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
     <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />

  3) iOS Info.plist keys (add with reason strings):
     NSPhotoLibraryUsageDescription
     NSPhotoLibraryAddUsageDescription

  4) This implementation downloads the remote URL directly. If your video is embedded (e.g., Vimeo player URL) you will not be able to download the raw mp4 from the embed URL — you need a direct media URL. For Vimeo/YouTube embeds consider offering a "Open in browser" action instead.

  5) Edge cases: handle large files, show progress, and consider background tasks for big downloads.
*/
