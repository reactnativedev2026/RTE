import { create } from 'zustand';
import { store } from '../../../core/store';
import { Routes } from '../../../utils/Routes';
import { setActiveTab } from '../../Home/Home.slice';
import {
  setCompleteProfile,
  setEventDetail,
  setEventList,
  setToken,
  setUser,
} from './login.slice';

const useLoginStore = create(set => ({
  apiError: null,
  loading: false,
  secureEntry: true,
  eventID: null,
  broadcastModal: {name: '', description: '', visible: false},

  setEventID: eventID => set({eventID}),
  setApiError: apiError => set({apiError}),
  setLoading: loading => set({loading}),
  setSecureEntry: () => set(state => ({secureEntry: !state.secureEntry})),
  setBroadcastModal: broadcastModal => set({broadcastModal}),
  handleFormSubmit: async ({
    values,
    loginMutation,
    getCompleteProfile,
    getEventDetails,
    getEventList,
    getBroadcastUnseen,
    readBroadcast,
  }) => {
    const body = {email: values.username, password: values?.password};
    store.dispatch(setActiveTab(Routes.HOME_STACK));
    try {
      const response = await loginMutation(body).unwrap();
      const {token, ...rest} = response?.data;
      store.dispatch(setToken(token));
      store.dispatch(setUser({...rest, name: response?.data?.name}));
      // Navigate to Dashboard upon successful login
      // Call the getCompleteProfile API
      try {
        const profileResponse = await getCompleteProfile().unwrap();
        store.dispatch(
          setCompleteProfile({
            ...profileResponse?.data,
            name: profileResponse?.data?.name,
          }),
        );
      } catch (err) {
        console.log('getCompleteProfile API error:', err?.data?.message);
      }

      let eventID = null;

      // ✅ Fetch event list
      try {
        const eventListResponse = await getEventList({
          list_type: 'all',
        }).unwrap();
        const eventList = eventListResponse?.data?.data || [];

        const maxIdObject = eventList?.reduce((max, e) => {
          return e.event_status === 'current' && (!max || e.id > max.id)
            ? e
            : max;
        }, null);

        eventID = maxIdObject ? maxIdObject?.id : eventList[0]?.id;

        set({eventID});
        const preferredEventId = eventID;
        store.dispatch(
          setUser({
            ...store.getState().loginReducer.user,
            preferred_event_id: preferredEventId,
          }),
        );
        const dataArray = [...(eventListResponse?.data?.data || [])];
        if (preferredEventId) {
          const index = dataArray.findIndex(
            item => item.id === preferredEventId,
          );
          if (index > 0) {
            dataArray.unshift(dataArray.splice(index, 1)[0]);
          }
        }
        store.dispatch(setEventList(dataArray));
      } catch (err) {
        console.log('eventResponse API error 2:', err?.data?.message);
      }

      // ✅ Fetch event details
      try {
        const eventResponse = await getEventDetails({
          eventId: eventID,
        }).unwrap();
        store.dispatch(setEventDetail(eventResponse?.data));
      } catch (err) {
        console.log('eventResponse API error 1:', err?.data?.message);
      }

      // ✅ Fetch unseen broadcasts
      try {
        const unseenResponse = await getBroadcastUnseen(undefined).unwrap();
        const name =
          unseenResponse?.data &&
          unseenResponse?.data[0] &&
          unseenResponse?.data[0].name;
        const description =
          unseenResponse?.data &&
          unseenResponse?.data[0] &&
          unseenResponse?.data[0].description;
        console.log(
          'Unseen broadcasts:',
          unseenResponse?.data && unseenResponse?.data[0],
        );

        if (name) {
          set({
            broadcastModal: {
              name,
              description,
              visible: true,
              readBroadcastFn: readBroadcast,
            },
          });
          // Alert.alert(
          //   name,
          //   description,
          //   [
          //     {
          //       text: 'Close',
          //       onPress: async () => {
          //         try {
          //           await readBroadcast({}).unwrap();
          //           console.log('Broadcast marked as read');
          //         } catch (err) {
          //           console.log('readBroadcast API error:', err?.data?.message);
          //         }
          //       },
          //     },
          //   ],
          //   {cancelable: false},
          // );
        } else {
          set({
            broadcastModal: {
              name: '',
              description: '',
              visible: false,
            },
          });
        }
      } catch (err) {
        console.log('getBroadcastUnseen API error:', err?.data?.message);
      }
    } catch (err) {
      console.log('API error:', err?.data?.message);
      const errorMessage = err?.data?.message;
      set({apiError: errorMessage});
    }
  },
}));

export default useLoginStore;
