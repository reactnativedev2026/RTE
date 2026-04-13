import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import FastImage from 'react-native-fast-image';
import ImagePicker from 'react-native-image-crop-picker';
import RenderHtml from 'react-native-render-html';
import {
  CustomAlert,
  CustomQuestHeader,
  CustomScreenWrapper
} from '../../components';
import CustomModal2 from '../../components/CustomModal2';
import { useEventData } from '../../hooks';
import {
  useDeleteQuestMutation,
  useMoveToHistoryMutation,
  useUpdateQuestMutation,
} from '../../services/quest.api';
import { colors, images } from '../../utils';
import { fonts } from '../../utils/fonts';
import { moderateScale } from '../../utils/metrics';
import { Routes } from '../../utils/Routes';
import AddPhotoModal from './AddPhotoModal';
import MeetingMentorForm from './MeetingMentorForm';

interface MeetingMentorProps {
  route?: any;
}
const MeetingMentor = ({route}: MeetingMentorProps) => {
  const navigation = useNavigation();
  const Param = route?.params;
  const questItem = Param?.item;
  const initialRoute = Param?.initialRoute;
  const LootMessage =
    questItem?.activity?.data && JSON.parse(questItem?.activity?.data);

  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [addModal, setAddModal] = React.useState<boolean>(false);
  const [modal, setModal] = React.useState<boolean>(false);
  const [manageQuest, setManageQuest] = useState({
    error: '',
    photo: null,
    allData: questItem,
    note: questItem?.notes,
    date:  questItem?.date,
  });

  //RTK-Query
  const [updateQuest, {isLoading}] = useUpdateQuestMutation();
  const [deleteQuest, {isLoading: deleteIsLoading}] = useDeleteQuestMutation();
  const [moveToHistory, {isLoading: historyIsLoading}] =
    useMoveToHistoryMutation();
  // hook
  const {fetchEventData} = useEventData();

  const onPressDelete = () => {
    setModal(true) 
  };

  const handleDelete = async () => {
    setModal(false);
    await deleteQuest({quest_id: questItem?.id})
      ?.unwrap()
      .then(res => {
        CustomAlert({type: 'success', message: 'Quest Deleted Successfully!'});
        skipTwoAndNavigate();
        fetchEventData();
      })
      .catch(err => {
        CustomAlert({type: 'error', message: err?.data?.message});
      });
  };

  const skipTwoAndNavigate = () => {
    const routes = navigation.getState().routes;
    const newRoutes = routes.slice(0, -2);
    navigation.reset({
      index: newRoutes?.length - 1,
      routes: [...newRoutes, {name: initialRoute || Routes.MANAGE_QUEST}],
    });
  };

  const handleMoveToHistory = (questId: any) => {
    moveToHistory({quest_id: questId})
      ?.unwrap()
      .then(res => {
        CustomAlert({
          type: 'success',
          message: 'Quest moved to history successfully!',
        });
        skipTwoAndNavigate();
        fetchEventData();
      })
      .catch(err => {
        CustomAlert({type: 'error', message: err?.data?.message});
      });
  };

  const handleSave = async (quest: object) => {
    if (!quest?.note && !quest?.photo) {
      setManageQuest({...manageQuest, error: 'Note and Photo are required'});
    } else {
      setAddModal(false);
      const photo = {
        uri: quest?.photo?.path,
        name: quest?.photo?.path.split('/').pop() || 'photo.jpg',
        type: quest?.photo?.mime,
      };
      const formData = new FormData();

      quest?.photo?.path && formData.append('photo', photo);

      formData.append('quest_id', questItem?.id);
      formData.append('note', quest?.note);
      formData.append('date', moment(quest?.date).format('YYYY-MM-DD'));

      await updateQuest(formData)
        .unwrap()
        .then(res => {
          CustomAlert({
            type: 'success',
            message: 'Notes and Photo Added Successfully!',
          });
          setManageQuest(prevState => ({
            ...prevState,
            photo: null,
            note: quest?.note,
            date: moment(quest?.date).format('YYYY-MM-DD'),
            error: '',
            allData: {
              ...prevState.allData,
              image: quest?.photo?.path, // Update `image` with the `quest.photo.path`
            },
          }));
        })
        .catch(err => {
          console.log("err",err)
           setManageQuest(prevState => ({
            ...prevState,
            date: moment(manageQuest?.allData?.date).format('YYYY-MM-DD'),
            error: '',
            allData: {
              ...prevState.allData,
              image: quest?.photo?.path, // Update `image` with the `quest.photo.path`
            },
          }));
          CustomAlert({type: 'error', message: err?.data?.data?.error});
        });
    }
  };

  

  return (
    <CustomScreenWrapper
      removeScroll
      loadingIndicator={isLoading || deleteIsLoading || historyIsLoading}>
      <View style={styles.firstContainer}>
        <CustomQuestHeader onPressBack={() => navigation.pop()} />
        <MeetingMentorForm
          manageQuest={manageQuest}
          questItem={questItem}
          onPressDelete={onPressDelete}
          onPressAdd={() => setAddModal(true)}
          onPressClaimLoot={() => setModalVisible(true)}
          hideBoth={initialRoute == Routes.QUEST_HISTORY}
          onPressMoveToHistory={(questId: any) => handleMoveToHistory(questId)}
          hideHistory={
            initialRoute == Routes.QUEST_HISTORY || !questItem?.is_completed
          }
          hideClaim={
            initialRoute == Routes.QUEST_HISTORY || !questItem?.is_completed
          }
        />
        <AddPhotoModal
          visible={addModal}
          manageQuest={manageQuest}
          error={manageQuest?.error}
          setManageQuest={setManageQuest}
          questItem={manageQuest?.allData}
          onClose={() => setAddModal(false)}
          onRequestClose={() => setAddModal(false)}
          onPressSave={() => handleSave(manageQuest)}
          onPressUpload={() => {
            ImagePicker.openPicker({
              width: 1300,
              height: 1400,
              cropping: true,
              forceJpg: true,
            })
              .then(image => {
                setManageQuest({...manageQuest, photo: image, error: ''});
              })
              .catch(err => console.log('ERR in picker', err));
          }}
        />

        <CustomModal2
          hideCancelBtn
          title={'Congrats!'}
          visible={modalVisible}
          showDescription={false}
          confirmButtonTitle={'Cool, thanks!'}
          onClose={() => setModalVisible(false)}
          onConfirm={() => setModalVisible(false)}
          onCloseIcon={() => setModalVisible(false)}>
          <View style={styles.imageWrapper}>
            <ImageBackground
              resizeMode={'contain'}
              source={images.LootPng}
              style={styles.imageStyle}>
              <View
                style={{
                  marginHorizontal: moderateScale(70),
                  marginVertical: moderateScale(40),
                }}>
                <Text style={styles.overlayHeading}>
                  {LootMessage.congratulation_message}
                </Text>
                <ScrollView
                  style={{
                    paddingHorizontal: 16,
                    height: Dimensions.get('screen').height / 2.5,
                  }}>
                  <RenderHtml
                    contentWidth={Dimensions.get('window').width}
                    source={{html: `<div>${LootMessage?.drawing?.prize}</div>`}}
                    tagsStyles={{
                      body: {
                        fontSize: 15,
                        fontFamily: 'sans-serif',
                        color: colors.primaryBrown,
                      },
                      a: {color: '#007BFF'},
                      em: {fontStyle: 'italic'},
                      span: {fontWeight: 'bold', color: colors.primaryBrown},
                    }}
                  />
                </ScrollView>
              </View>
            </ImageBackground>
          </View>
        </CustomModal2>
         <CustomModal2
          visible={modal}
          showDescription={true}
          title={'Are you sure?'}
          onClose={() => setModal(false)}
          onConfirm={() => handleDelete()}
          descriptionStyle={styles.modalDesc}
          confirmButtonTitle={'Delete Quest'}
          onCloseIcon={() => setModal(false)}
          customBtnStyle={{backgroundColor: colors.deleteRed}}
          description={'Your bard will delete the following quest:'}>
          <>
            <FastImage
              style={{height: 150, width: 150}}
              defaultSource={images.Loading}
              source={
                questItem?.activity?.bib_image
                  ? {uri: questItem?.activity?.bib_image}
                  : images.ShieldPng
              }
            />
            <Text style={styles.footerDesc}>
              {`${questItem?.activity?.name}\n${questItem?.date}  |  ${questItem?.activity?.total_points} Miles`}
            </Text>
          </>
        </CustomModal2>
       </View>
    </CustomScreenWrapper>
  );
};
export default MeetingMentor;
const styles = StyleSheet.create({
  firstContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    borderRadius: moderateScale(25),
    paddingBottom: moderateScale(5),
    marginBottom: moderateScale(10),
    marginHorizontal: moderateScale(10),
    paddingHorizontal: moderateScale(20),
  },
  modalDesc: {
    fontWeight: '400',
    color: colors.primaryGrey,
    bottom: moderateScale(10),
    fontSize: moderateScale(14),
    paddingRight: moderateScale(5),
  },
  footerDesc: {
    fontWeight: '700',
    textAlign: 'center',
    color: colors.headerBlack,
    fontSize: moderateScale(14),
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(33),
  },
  imageWrapper: {justifyContent: 'center', alignItems: 'center', width: '100%'},
  imageStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height / 1.7,
  },
  overlayHeading: {
    padding: 8,
    paddingLeft: 20,
    borderRadius: 6,
    color: colors.primaryBrown,
    fontSize: moderateScale(33),
    fontFamily: fonts.loot,
  },
  overlayDescription: {padding: 8, paddingLeft: 20},
});
