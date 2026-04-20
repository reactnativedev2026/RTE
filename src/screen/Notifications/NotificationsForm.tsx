import {
  CustomHeader,
  CustomHorizontalLine,
  CustomToggleSwitch,
} from '../../components';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState, store} from '../../core/store';
import {colors} from '../../utils';
import {getTemplateSpecs} from '../../utils/helpers';
import {moderateScale} from '../../utils/metrics';

interface EmailToggleState {
  bibs?: boolean;
  follow_requests?: boolean;
  team_bibs?: boolean;
  team_follow_requests?: boolean;
  team_updates?: boolean;
}

interface PushToggleState {
  behind_pace?: boolean;
  ahead_of_pace?: boolean;
  goal_completed?: boolean;
  monthly_reminder?: boolean;
}

interface NotificationsFormProps {
  toggles?: EmailToggleState;
  onToggle?: any;
  isLoading?: boolean;
  loadingToggle?: Partial<EmailToggleState>;
  pushToggles?: PushToggleState;
  onPushToggle?: (key: string, value: boolean) => void;
  isPushLoading?: boolean;
  loadingPushToggle?: Partial<PushToggleState>;
}

const PUSH_ITEMS: {key: keyof PushToggleState; title: string; description: string}[] = [
  {
    key: 'behind_pace',
    title: 'Behind pace',
    description: "Alert when you're falling behind your monthly mileage goal",
  },
  {
    key: 'ahead_of_pace',
    title: 'Ahead of pace',
    description: "Celebrate when you're ahead of your monthly goal",
  },
  {
    key: 'goal_completed',
    title: 'Goal completed',
    description: 'Celebrate when you hit 100% of your monthly goal',
  },
  {
    key: 'monthly_reminder',
    title: 'Monthly reminder',
    description: 'First-of-month nudge to set or review your monthly goal',
  },
];

const NotificationsForm = ({
  toggles,
  onToggle,
  isLoading,
  loadingToggle,
  pushToggles,
  onPushToggle,
  isPushLoading,
  loadingPushToggle,
}: NotificationsFormProps) => {
  const {user} = useSelector((state: RootState) => state.loginReducer);

  const toggleColor =
    getTemplateSpecs(store.getState().loginReducer.eventDetail?.template)
      ?.settingsColor || colors.lightBlue;

  return (
    <View style={styles.firstContainer}>
      <CustomHeader hideEditBtn={true} />
      <Text style={styles.headerText}>{`${
        user?.display_name || user?.name
      }'s Notifications`}</Text>
      <CustomHorizontalLine />

      {/* ── Personal Email Notifications ── */}
      <Text style={styles.heading}>{'Personal Email Notifications'}</Text>
      <CustomToggleSwitch
        label="Bibs"
        offColor="grey"
        isOn={toggles?.bibs}
        labelStyle={styles.label}
        loading={isLoading || loadingToggle?.bibs}
        onToggle={() => onToggle({key: 'bibs', value: !toggles?.bibs})}
        onColor={toggleColor}
      />
      <CustomToggleSwitch
        offColor="grey"
        label="Follow Requests"
        labelStyle={styles.label}
        isOn={toggles?.follow_requests}
        loading={isLoading || loadingToggle?.follow_requests}
        onToggle={() =>
          onToggle({key: 'follow_requests', value: !toggles?.follow_requests})
        }
        onColor={toggleColor}
      />

      <CustomHorizontalLine />

      {/* ── Team Email Notifications ── */}
      <Text style={styles.heading}>{'Team Email Notifications'}</Text>
      <CustomToggleSwitch
        label="Bibs"
        offColor="grey"
        isOn={toggles?.team_bibs}
        labelStyle={styles.label}
        loading={isLoading || loadingToggle?.team_bibs}
        onToggle={() =>
          onToggle({key: 'team_bibs', value: !toggles?.team_bibs})
        }
        onColor={toggleColor}
      />
      <CustomToggleSwitch
        offColor="grey"
        label="Follow Requests"
        labelStyle={styles.label}
        isOn={toggles?.team_follow_requests}
        loading={isLoading || loadingToggle?.team_follow_requests}
        onToggle={() =>
          onToggle({
            key: 'team_follow_requests',
            value: !toggles?.team_follow_requests,
          })
        }
        onColor={toggleColor}
      />
      <CustomToggleSwitch
        offColor="grey"
        label="Other Updates"
        labelStyle={styles.label}
        isOn={toggles?.team_updates}
        loading={isLoading || loadingToggle?.team_updates}
        onToggle={() =>
          onToggle({key: 'team_updates', value: !toggles?.team_updates})
        }
        onColor={toggleColor}
      />

      <CustomHorizontalLine />

      {/* ── Monthly Goal Push Notifications ── */}
      <Text style={styles.sectionTitle}>{'Monthly goal push notifications'}</Text>
      <Text style={styles.sectionSubtitle}>
        {'Choose which notifications you receive about your monthly activity goals'}
      </Text>

      {PUSH_ITEMS.map((item, index) => (
        <View key={item.key}>
          <View style={styles.notifRow}>
            <View style={styles.notifTextContainer}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifDescription}>{item.description}</Text>
            </View>
            <CustomToggleSwitch
              offColor="grey"
              isOn={pushToggles?.[item.key]}
              loading={isPushLoading || loadingPushToggle?.[item.key]}
              onToggle={() =>
                onPushToggle?.(item.key, !pushToggles?.[item.key])
              }
              onColor={toggleColor}
              toggleStyle={styles.toggle}
            />
          </View>
          {index < PUSH_ITEMS.length - 1 && (
            <CustomHorizontalLine customStyle={styles.rowDivider} />
          )}
        </View>
      ))}
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
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: colors.headerBlack,
    marginTop: moderateScale(20),
    marginBottom: moderateScale(4),
  },
  sectionSubtitle: {
    fontSize: moderateScale(12),
    fontWeight: '400',
    color: colors.primaryGrey,
    marginBottom: moderateScale(8),
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(12),
  },
  notifTextContainer: {
    flex: 1,
    paddingRight: moderateScale(12),
  },
  notifTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: colors.headerBlack,
    marginBottom: moderateScale(2),
  },
  notifDescription: {
    fontSize: moderateScale(11),
    fontWeight: '400',
    color: colors.primaryGrey,
    lineHeight: moderateScale(16),
  },
  rowDivider: {
    marginTop: 0,
  },
  toggle: {
    height: moderateScale(23),
    marginRight: moderateScale(5),
  },
});
