import { tz } from 'moment-timezone';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  CustomAlert,
  CustomCalendarWrapper,
  CustomScreenWrapper,
} from '../../components';
import { RootState } from '../../core/store';
import { useEventData } from '../../hooks';
import { useLazyGetCalendarPointsQuery } from '../../services/Calander.api';
import { navigate } from '../../services/NavigationService';
import { getStartAndEndDateOfMonth } from '../../utils/helpers';
import { Routes } from '../../utils/Routes';

const CalanderContainer = () => {
  const {fetchEventData} = useEventData();

  const {user} = useSelector((state: RootState) => state.loginReducer);
  const nowInTZ = tz(user?.time_zone_name || 'UTC');

  const [current, setCurrent] = useState('');
  const [yearPoints, setYearPoints] = useState([]);
  const [listView, setListView] = React.useState(false);
  const [monthlyPoints, setMonthlyPoints] = useState([]);
  const [showModal, setShowModal] = React.useState(false);
  const [boldDates, setBoldDates] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(nowInTZ.toDate());
  const [currentYear, setCurrentYear] = useState(nowInTZ.year());
  const [currentMonth, setCurrentMonth] = useState(nowInTZ.month() + 1); // month() is 0-based
  const [footerObj, setFooterObj] = useState({
    date: '',
    miles: '',
    notes: '',
    logo: '',
    vimeo_id: '',
    extra:{}
  });

  useEffect(() => {
    onPointsAddCallback();
  }, []);

  const handleMonthChange = monthInfo => {
    setFooterObj({
      date: '',
      miles: '',
      notes: '',
      logo: '',
      vimeo_id: '',
       extra:{}
    });
    const {year, month} = monthInfo[0];
    setCurrentMonth(month);
    setCurrentYear(year);
    const getDate = getStartAndEndDateOfMonth({
      customMonth: month,
      customYear: year,
    });

    setCurrent(getDate?.startDate);

    const getProfileBody = {
      start_date: getDate?.startDate,
      end_date: getDate?.endDate,
      event_id: user?.preferred_event_id,
    };

    handleCalendarPoints(getProfileBody);
  };

  const handleListChange = monthInfo => {
    setFooterObj({
      date: '',
      miles: '',
      notes: '',
      logo: '',
      vimeo_id: '',
      extra:{}
    });
    const {year, month} = monthInfo[0];
    setCurrentMonth(month);
    setCurrentYear(year);
    const getDate = getStartAndEndDateOfMonth({
      customMonth: month,
      customYear: year,
    });
    setCurrent(getDate?.startDate);
    const getProfileBody = {
      start_date: getDate?.startDate,
      end_date: getDate?.endDate,
      event_id: user?.preferred_event_id,
    };
    handleCalendarListPoints(getProfileBody);
  };

  const getAmountForDate = (
    date: any,
    pointsData: [] | undefined,
    clearObj: boolean | undefined,
  ) => {
    const arrayOfPoints = pointsData || monthlyPoints;
    const matchedItem = arrayOfPoints?.find((item: any) => item?.date == date);

    if (matchedItem) {
      setFooterObj({
        date: matchedItem?.date,
        miles: matchedItem?.total_mile,
        notes: matchedItem?.note,
        logo: matchedItem?.milestone?.image?.calendar_logo_image_url,
        vimeo_id:
          matchedItem?.milestone?.data &&
          JSON.parse(matchedItem?.milestone?.data),
        extra:matchedItem,
      });
    } else {
      setFooterObj({
        date: clearObj ? '' : date,
        miles: '',
        notes: '',
        logo: '',
        vimeo_id: '',
        extra:{}
      });
    }
  };

  const onDayPress = (day: any) => {
    setShowModal(false);
    const selectedDate = day.dateString;
    setStartDate(selectedDate);
    getAmountForDate(selectedDate);
  };

  const moveToToday = () => {
    const startOfMonth = nowInTZ.clone().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = nowInTZ.clone().endOf('month').format('YYYY-MM-DD');

    const currentMonthInTZ = nowInTZ.month() + 1; // moment.month() is 0-based
    const currentYearInTZ = nowInTZ.year();

    if (currentMonth !== currentMonthInTZ || currentYear !== currentYearInTZ) {
      setCurrent(nowInTZ.toDate());
      setCurrentMonth(currentMonthInTZ);
      setCurrentYear(currentYearInTZ);

      onPointsAddCallback({
        month: currentMonthInTZ,
        year: currentYearInTZ,
      });

      const getProfileBody = {
        start_date: startOfMonth,
        end_date: endOfMonth,
        event_id: user?.preferred_event_id,
      };

      handleCalendarListPoints(getProfileBody);
    }
  };

  ///New Work here

  const [
    getCalendarPoints,
    {isFetching: getCalendarPointsIsFetching, isLoading},
  ] = useLazyGetCalendarPointsQuery();
  const handleCalendarListPoints = dateObj => {
    const getPointsObj = {
      start_date: dateObj?.start_date
        ? dateObj?.start_date
        : getStartAndEndDateOfMonth({
            customMonth: currentMonth,
            customYear: currentYear,
          })?.startDate,
      end_date: dateObj?.end_date
        ? dateObj?.end_date
        : getStartAndEndDateOfMonth({
            customMonth: currentMonth,
            customYear: currentYear,
          })?.endDate,
      event_id: user?.preferred_event_id,
      mode: 'list',
      page_limit: 100,
    };

    getCalendarPoints(getPointsObj)
      .unwrap()
      .then(res => setYearPoints(res?.data?.points?.data))
      .catch(err => {
        console.log('error', err);
      });
  };
  const handleCalendarPoints = dateObj => {
    const getPointsObj = {...dateObj, mode: 'calendar'};
    getCalendarPoints(getPointsObj)
      .unwrap()
      .then(res => {
         const pointsData = res?.data?.points?.data;
        setMonthlyPoints(pointsData);
        const boldDatesArray = pointsData?.map((item: any) => item?.date);
        setBoldDates(boldDatesArray);
        if (footerObj?.date) {
          getAmountForDate(footerObj?.date, pointsData, true);
        }
      })
      .catch(err => {
        CustomAlert({type: 'error', message: err?.data?.message});
      });
  };
  useEffect(() => {
    if (listView) {
      handleCalendarListPoints();
    } else {
      onPointsAddCallback({month: currentMonth, year: currentYear});
    }
  }, [listView]);

  const onPointsAddCallback = ({
    month,
    year,
  }: {month?: any; year?: any} = {}) => {
    const profileBody = {
      start_date: getStartAndEndDateOfMonth({
        customMonth: month || currentMonth,
        customYear: year || currentYear,
      })?.startDate,
      end_date: getStartAndEndDateOfMonth({
        customMonth: month || currentMonth,
        customYear: year || currentYear,
      })?.endDate,
      event_id: user?.preferred_event_id,
    };

    handleCalendarPoints(profileBody);
  };

  const OnRefresh = () => {
    fetchEventData();
    onPointsAddCallback();
  };
  return (
    <CustomScreenWrapper
      onRefresh={OnRefresh}
      loadingIndicator={getCalendarPointsIsFetching}>
      <CustomCalendarWrapper
        onPressEdit={() => {
          if (footerObj?.date) {
            navigate(Routes.ADD_CALENDAR_MILES, {
              miles: footerObj?.miles,
              date: footerObj?.date,
              onPointsAddCallback,
            });
          }
        }}
        onMonthChange={handleMonthChange}
        onListChange={handleListChange}
        boldDates={boldDates}
        onDayPress={onDayPress}
        startDate={startDate}
        current={
          current ||
          getStartAndEndDateOfMonth({
            customMonth: currentMonth,
            customYear: currentYear,
          })?.startDate
        }
        onTodayPress={moveToToday}
        yearPoints={yearPoints}
        isFetching={getCalendarPointsIsFetching}
        isLoading={isLoading}
        listView={listView}
        setListView={setListView}
        onPointsAddCallback={handleCalendarListPoints}
        setCurrent={setCurrent}
        footerObj={footerObj}
        monthlyPoints={monthlyPoints}
        showModal={showModal}
        setShowModal={setShowModal}
        handleCalendarPoints={handleCalendarPoints}
      />
    </CustomScreenWrapper>
  );
};

export default CalanderContainer;
