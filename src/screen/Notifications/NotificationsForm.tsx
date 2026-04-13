import {
  CustomHeader,
  CustomToggleSwitch,
  CustomHorizontalLine,
} from '../../components';
import React from 'react';
import {colors} from '../../utils';
import {useSelector} from 'react-redux';
import {RootState, store} from '../../core/store';
import {moderateScale} from '../../utils/metrics';
import {StyleSheet, Text, View} from 'react-native';
import {getTemplateSpecs} from '../../utils/helpers';

interface NotificationsFormProps {
  toggles?: ToggleState;
  onToggle?: any;
  isLoading?: boolean | undefined;
  loadingToggle?: Partial<ToggleState>;
}
interface ToggleState {
  bibs?: boolean;
  follow_requests?: boolean;
  team_bibs?: boolean;
  team_follow_requests?: boolean;
  team_updates?: boolean;
}

const NotificationsForm = ({
  toggles,
  onToggle,
  isLoading,
  loadingToggle,
}: NotificationsFormProps) => {
  const {user} = useSelector((state: RootState) => state.loginReducer);

  return (
    <View style={styles.firstContainer}>
      <CustomHeader hideEditBtn={true} />
      <Text style={styles.headerText}>{`${
        user?.display_name || user?.name
      }'s Notifications`}</Text>
      <CustomHorizontalLine />
      <Text style={styles.heading}>{'Personal Email Notifications'}</Text>
      <CustomToggleSwitch
        label="Bibs"
        offColor="grey"
        isOn={toggles?.bibs}
        labelStyle={styles.label}
        loading={isLoading || loadingToggle?.bibs}
        onToggle={() => onToggle({key: 'bibs', value: !toggles?.bibs})}
        onColor={
          getTemplateSpecs(store.getState().loginReducer.eventDetail?.template)
            ?.settingsColor || colors.lightBlue
        }
      />
      <CustomToggleSwitch
        offColor="grey"
        label="Follow Requests"
        labelStyle={styles.label}
        isOn={toggles?.follow_requests}
        loading={isLoading || loadingToggle?.follow_requests}
        onToggle={() => {
          onToggle({key: 'follow_requests', value: !toggles?.follow_requests});
        }}
        onColor={
          getTemplateSpecs(store.getState().loginReducer.eventDetail?.template)
            ?.settingsColor || colors.lightBlue
        }
      />
      <CustomHorizontalLine />
      <Text style={styles.heading}>{'Team Email Notifications'}</Text>
      <CustomToggleSwitch
        label="Bibs"
        offColor="grey"
        isOn={toggles?.team_bibs}
        labelStyle={styles.label}
        loading={isLoading || loadingToggle?.team_bibs}
        onToggle={() => {
          onToggle({key: 'team_bibs', value: !toggles?.team_bibs});
        }}
        onColor={
          getTemplateSpecs(store.getState().loginReducer.eventDetail?.template)
            ?.settingsColor || colors.lightBlue
        }
      />
      <CustomToggleSwitch
        offColor="grey"
        label="Follow Requests"
        labelStyle={styles.label}
        isOn={toggles?.team_follow_requests}
        loading={isLoading || loadingToggle?.team_follow_requests}
        onToggle={() => {
          onToggle({
            key: 'team_follow_requests',
            value: !toggles?.team_follow_requests,
          });
        }}
        onColor={
          getTemplateSpecs(store.getState().loginReducer.eventDetail?.template)
            ?.settingsColor || colors.lightBlue
        }
      />
      <CustomToggleSwitch
        offColor="grey"
        label="Other Updates"
        labelStyle={styles.label}
        isOn={toggles?.team_updates}
        loading={isLoading || loadingToggle?.team_updates}
        onToggle={() => {
          onToggle({key: 'team_updates', value: !toggles?.team_updates});
        }}
        onColor={
          getTemplateSpecs(store.getState().loginReducer.eventDetail?.template)
            ?.settingsColor || colors.lightBlue
        }
      />
    </View>
  );
};
export default NotificationsForm;

const styles = StyleSheet.create({
  firstContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(25),
    marginBottom: moderateScale(10),
  },
  headerText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.primaryGrey,
    textAlign: 'center',
    marginTop: moderateScale(10),
    marginBottom: 10,
  },
  heading: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: colors.headerBlack,
    marginTop: moderateScale(25),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: colors.primaryGrey,
  },
});
