import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {CustomModal, CustomScreenWrapper} from '../../components';
import {colors, images} from '../../utils';
import {moderateScale} from '../../utils/metrics';
import {useSelector} from 'react-redux';
import {RootState} from '../../core/store';
import {goBack} from '../../services/NavigationService';

interface RegisteredQuestProps {}
const RegisteredQuest = ({}: RegisteredQuestProps) => {
  const {user} = useSelector((state: RootState) => state.loginReducer);
  const [modal, setModal] = React.useState<boolean>(true);

  const onConfirm = () => {
    setModalVisible(false);
    goBack();
  };
  return (
    <CustomScreenWrapper removeScroll>
      <View style={styles.firstContainer}>
        <Text style={styles.headerText}>{`${
          user?.display_name || user?.name
        }'s Quests`}</Text>
      </View>
      <CustomModal
        visible={modal}
        onClose={() => setModal(false)}
        title={`Congratulations, ${user?.display_name || user?.name}`}
        description={
          'Excellent news, you are successfully registered for this quest!'
        }
        descriptionStyle={styles.modalDesc}
        confirmButtonTitle={'Cool, thanks!'}
        showDescription={true}
        hideCancelBtn
        onConfirm={onConfirm}
        onCloseIcon={() => setModal(false)}>
        <>
          <images.Shield />
          <Text style={styles.footerDesc}>
            {'Meeting with the Mentor\n{{date}}  |  {{miles}}'}
          </Text>
        </>
      </CustomModal>
    </CustomScreenWrapper>
  );
};
export default RegisteredQuest;

const styles = StyleSheet.create({
  firstContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(25),
  },
  headerText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.primaryGrey,
    textAlign: 'center',
    marginTop: moderateScale(10),
  },
  modalDesc: {
    fontSize: moderateScale(14),
    color: colors.primaryGrey,
    fontWeight: '400',
    paddingRight: moderateScale(5),
    bottom: moderateScale(10),
  },
  footerDesc: {
    fontSize: moderateScale(14),
    color: colors.headerBlack,
    fontWeight: '700',
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(33),
    textAlign: 'center',
  },
});
