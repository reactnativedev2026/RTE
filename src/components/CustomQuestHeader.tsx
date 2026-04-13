import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { goBack } from '../services/NavigationService';
import { images } from '../utils';
import { colors } from '../utils/colors';
import { moderateScale } from '../utils/metrics';
import CustomArrow from './CustomArrow';
import CustomModal2 from './CustomModal2';

interface CustomQuestHeaderProps {
  hideEditBtn?: boolean;
  onPressBack?: () => void;
}
const CustomQuestHeader = ({
  hideEditBtn,
  onPressBack,
}: CustomQuestHeaderProps) => {
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);

  const BackPress = () => {
    if (onPressBack) {
      onPressBack();
    } else {
      goBack();
      // navigate(Routes.QUEST_OPTIONS);
    }
  };
  const onPressEdit = () => setModalVisible(true);
  return (
    <View>
      <View style={styles.container}>
        <Pressable onPress={BackPress} style={styles.btn}>
          <CustomArrow
            fill={colors.lightGrey}
            props={{
              style: {transform: [{rotate: '180deg'}]},
            }}
          />
          <Text style={styles.textStyle}>Back</Text>
        </Pressable>
        {!hideEditBtn && (
          <Pressable onPress={onPressEdit} style={styles.btn}>
            <Text style={styles.textStyle}>About</Text>
            <images.AboutIcon style={styles.edit} />
          </Pressable>
        )}
      </View>
      <CustomModal2
        visible={modalVisible}
        onClose={() => {
          console.log('RRRRUNNNNNNNNNN');
          setModalVisible(false);
        }}
        title={'What is the Heroes Journey Series?'}
        description={
          'Join us as we take on the Hero’s Journey, a series of 12 challenges following a protagonist, or hero, as they venture through myths, legends, and other narratives. The journey follows the hero as they transition from their own ordinary world into the unknown to complete multiple quests before eventually returning home. The hero who returns to their world is not the same one who left, for their triumphs and tribulations have changed them, forced them to grow, and shown them what they are truly capable of.\n\nYou will have one month to complete all 12 challenges of the Hero’s Journey and win prizes while you are doing so. Do you think you’re up for the challenge?'
        }
        descriptionStyle={styles.modalDesc}
        confirmButtonTitle={'Got it, thanks!'}
        showDescription={true}
        hideCancelBtn
        onConfirm={() => {
          setModalVisible(false);
        }}
        onCloseIcon={() => setModalVisible(false)}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  textStyle: {
    color: colors.lightGrey,
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  edit: {marginLeft: moderateScale(5)},
  modalDesc: {
    fontSize: moderateScale(14),
    color: colors.primaryGrey,
    fontWeight: '400',
    paddingRight: moderateScale(5),
    bottom: moderateScale(10),
  },
});

export default CustomQuestHeader;
