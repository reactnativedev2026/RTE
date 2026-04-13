import React from 'react';
import { CustomAlert } from '../components';
import { store } from '../core/store';
import { setEventDetail } from '../screen/AuthScreen/login/login.slice';
import { useLazyGetEventQuery } from '../services/profile.api';

const useEventData = () => {
  const [getEventDetails] = useLazyGetEventQuery();

  const fetchEventData = React.useCallback(() => {
    if (store.getState().loginReducer.eventDetail?.id) {
      getEventDetails({ eventId: store.getState().loginReducer.eventDetail?.id })
        .unwrap()
        .then((eventResponse: { data: any }) => {
          store.dispatch(
            setEventDetail({
              ...store.getState().loginReducer.eventDetail,
              ...eventResponse?.data,
            }),
          );
        })
        .catch((err: { data: { message: any } }) => {
          CustomAlert({ type: 'error', message: err?.data?.message });
        });
    }
  }, [getEventDetails]);

  return {fetchEventData};
};

export default useEventData;
