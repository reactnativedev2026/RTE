import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  ActivityIndicator,
  Share,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {
  CustomAlert,
  CustomHeader,
  CustomScreenWrapper,
} from '../../components';
import {colors} from '../../utils/colors';
import {moderateScale} from '../../utils/metrics';
import {store} from '../../core/store';
import {getTemplateSpecs} from '../../utils/helpers';
import {SamsungHealthBackgroundSync} from '../../services/SamsungHealthBackgroundSync';
import {SamsungHealth, PermissionCheckResult} from '../../services/SamsungHealthService';

interface SamsungHealthDebugProps {}

const SamsungHealthDebug = ({}: SamsungHealthDebugProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<Record<string, any> | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<Record<string, any> | null>(null);
  const [permissionsInfo, setPermissionsInfo] = useState<PermissionCheckResult | null>(null);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);

  const PrimaryColor = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  ).btnPrimaryColor;

  useEffect(() => {
    loadDebugInfo();
    loadDeviceInfo();
    loadPermissionsInfo();
  }, []);

  const loadDeviceInfo = async () => {
    try {
      const info: Record<string, any> = {
        deviceId: await DeviceInfo.getDeviceId(),
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
        appVersion: DeviceInfo.getVersion(),
        buildNumber: DeviceInfo.getBuildNumber(),
        bundleId: DeviceInfo.getBundleId(),
        isEmulator: await DeviceInfo.isEmulator(),
        manufacturer: await DeviceInfo.getManufacturer(),
        apiLevel: Platform.OS === 'android' ? await DeviceInfo.getApiLevel() : 'N/A',
        totalMemory: await DeviceInfo.getTotalMemory(),
        usedMemory: await DeviceInfo.getUsedMemory(),
      };
      setDeviceInfo(info);
    } catch (error) {
      console.error('Error loading device info:', error);
    }
  };

  const loadDebugInfo = async () => {
    try {
      const info = await SamsungHealthBackgroundSync.getDebugInfo();
      setDebugInfo(info);
    } catch (error) {
      console.error('Error loading debug info:', error);
    }
  };

  const loadPermissionsInfo = async () => {
    if (Platform.OS !== 'android') {
      setPermissionsError('Samsung Health is only available on Android');
      return;
    }

    try {
      setPermissionsError(null);
      // Initialize Samsung Health first
      await SamsungHealth.initialize();

      // Get allowed data types from debug info to check correct permissions
      const allowedDataTypes = debugInfo?.serviceState?.allowedDataTypes || ['STEPS', 'EXERCISE'];

      const permissions = await SamsungHealth.checkGrantedPermissions(allowedDataTypes);
      setPermissionsInfo(permissions);
    } catch (error: any) {
      console.error('Error loading permissions info:', error);
      setPermissionsError(error?.message || 'Failed to check permissions');
      setPermissionsInfo(null);
    }
  };

  const handleReschedule = async () => {
    setIsLoading(true);
    try {
      const result = await SamsungHealthBackgroundSync.rescheduleBackgroundTasks();
      if (result.success) {
        CustomAlert({
          type: 'success',
          message: result.message,
        });
        // Reload debug info after rescheduling
        await loadDebugInfo();
      } else {
        CustomAlert({
          type: 'error',
          message: result.message,
        });
      }
    } catch (error: any) {
      CustomAlert({
        type: 'error',
        message: error?.message || 'Failed to reschedule background tasks',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDebugInfoForEmail = (): string => {
    const lines: string[] = [];

    lines.push('=== SAMSUNG HEALTH DEBUG REPORT ===');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');

    // Device Information
    lines.push('--- DEVICE INFORMATION ---');
    if (deviceInfo) {
      Object.entries(deviceInfo).forEach(([key, value]) => {
        lines.push(`${key}: ${JSON.stringify(value)}`);
      });
    }
    lines.push('');

    // Samsung Health Sync Information
    lines.push('--- SAMSUNG HEALTH SYNC INFO ---');
    if (debugInfo) {
      // Service State
      if (debugInfo.serviceState) {
        lines.push('');
        lines.push('Service State:');
        Object.entries(debugInfo.serviceState).forEach(([key, value]) => {
          lines.push(`  ${key}: ${JSON.stringify(value)}`);
        });
      }

      // AsyncStorage
      if (debugInfo.asyncStorage) {
        lines.push('');
        lines.push('AsyncStorage Data:');
        Object.entries(debugInfo.asyncStorage).forEach(([key, value]) => {
          lines.push(`  ${key}: ${JSON.stringify(value)}`);
        });
      }

      // BackgroundFetch
      if (debugInfo.backgroundFetch) {
        lines.push('');
        lines.push('BackgroundFetch Status:');
        Object.entries(debugInfo.backgroundFetch).forEach(([key, value]) => {
          lines.push(`  ${key}: ${JSON.stringify(value)}`);
        });
      }

      // Config
      if (debugInfo.config) {
        lines.push('');
        lines.push('Config:');
        Object.entries(debugInfo.config).forEach(([key, value]) => {
          lines.push(`  ${key}: ${JSON.stringify(value)}`);
        });
      }
    }

    // Permissions
    lines.push('');
    lines.push('--- SAMSUNG HEALTH PERMISSIONS ---');
    if (permissionsInfo) {
      lines.push(`Steps: ${permissionsInfo.hasSteps ? 'Allowed' : 'Not Allowed'}`);
      lines.push(`Activity Summary: ${permissionsInfo.hasActivitySummary ? 'Allowed' : 'Not Allowed'}`);
      lines.push(`Exercise: ${permissionsInfo.hasExercise ? 'Allowed' : 'Not Allowed'}`);
      lines.push(`All Required Granted: ${permissionsInfo.hasAllRequired ? 'Yes' : 'No'}`);
    } else if (permissionsError) {
      lines.push(`Error: ${permissionsError}`);
    } else {
      lines.push('Not loaded');
    }

    // Scheduled Jobs
    lines.push('');
    lines.push('--- SCHEDULED BACKGROUND JOBS ---');
    if (debugInfo?.scheduledJobs) {
      const jobs = debugInfo.scheduledJobs;
      lines.push('');
      lines.push('Regular Sync (shealth-sync):');
      lines.push(`  Scheduled: ${jobs.regularSync?.isScheduled ? 'Yes' : 'No'}`);
      lines.push(`  Interval: ${jobs.regularSync?.interval || 'N/A'}`);
      lines.push(`  Scheduled At: ${jobs.regularSync?.scheduledAt || 'N/A'}`);
      lines.push('');
      lines.push('End-of-Day Sync (shealth-eod-sync):');
      lines.push(`  Scheduled: ${jobs.endOfDaySync?.isScheduled ? 'Yes' : 'No'}`);
      lines.push(`  Enabled: ${jobs.endOfDaySync?.enabled ? 'Yes' : 'No'}`);
      lines.push(`  Target Time: ${jobs.endOfDaySync?.targetTime || 'N/A'}`);
      lines.push(`  Scheduled At: ${jobs.endOfDaySync?.scheduledAt || 'N/A'}`);
      lines.push(`  Next Run: ${jobs.endOfDaySync?.nextRunTime || 'N/A'}`);
      lines.push('');
      lines.push('Hourly Reconciliation (shealth-hourly-reconciliation):');
      lines.push(`  Scheduled: ${jobs.hourlyReconciliation?.isScheduled ? 'Yes' : 'No'}`);
      lines.push(`  Enabled: ${jobs.hourlyReconciliation?.enabled ? 'Yes' : 'No'}`);
      lines.push(`  Interval: ${jobs.hourlyReconciliation?.interval || 'N/A'}`);
      lines.push(`  Scheduled At: ${jobs.hourlyReconciliation?.scheduledAt || 'N/A'}`);
      lines.push(`  Next Run: ${jobs.hourlyReconciliation?.nextRunTime || 'N/A'}`);
      lines.push('');
      lines.push('Foreground Auto-Refresh:');
      lines.push(`  Active: ${jobs.foregroundInterval?.isActive ? 'Yes' : 'No'}`);
      lines.push(`  Interval: ${jobs.foregroundInterval?.interval || 'N/A'}`);
    } else {
      lines.push('Not loaded');
    }

    lines.push('');
    lines.push('=== END OF REPORT ===');

    return lines.join('\n');
  };

  const handleSendDebugEmail = async () => {
    setIsLoading(true);
    try {
      // Refresh all info before sending
      await loadDebugInfo();
      await loadDeviceInfo();
      await loadPermissionsInfo();

      const debugReport = formatDebugInfoForEmail();
      const appVersion = DeviceInfo.getVersion();
      const buildNumber = DeviceInfo.getBuildNumber();
      const deviceModel = DeviceInfo.getModel();

      const subject = `Samsung Health Sync Debug Report - ${deviceModel} - v${appVersion}(${buildNumber})`;
      const email = 'support@runtheedge.com';

      // Try to open email with full body first, if URL is too long, truncate
      let body = debugReport;

      // URL length limit is around 2000 chars for mailto, so we limit the body
      const maxBodyLength = 1500;
      if (body.length > maxBodyLength) {
        body = body.substring(0, maxBodyLength) + '\n\n[Report truncated - full report too large for email URL]';
      }

      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Directly try to open without canOpenURL check (Android 11+ has issues with canOpenURL)
      try {
        await Linking.openURL(mailtoUrl);
      } catch (openError) {
        // If mailto fails, try with just the email address
        try {
          await Linking.openURL(`mailto:${email}`);
          CustomAlert({
            type: 'info',
            message: 'Email app opened. Please copy the debug info manually from the previous screen.',
          });
        } catch (fallbackError) {
          CustomAlert({
            type: 'error',
            message: 'Unable to open email app. Please manually send debug info to support@runtheedge.com',
          });
        }
      }
    } catch (error: any) {
      CustomAlert({
        type: 'error',
        message: error?.message || 'Failed to prepare debug report',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareDebugInfo = async () => {
    setIsLoading(true);
    try {
      // Refresh all info before sharing
      await loadDebugInfo();
      await loadDeviceInfo();
      await loadPermissionsInfo();

      const debugReport = formatDebugInfoForEmail();
      const appVersion = DeviceInfo.getVersion();
      const buildNumber = DeviceInfo.getBuildNumber();

      await Share.share({
        title: `Samsung Health Debug Report v${appVersion}(${buildNumber})`,
        message: debugReport,
      });
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        CustomAlert({
          type: 'error',
          message: error?.message || 'Failed to share debug info',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderInfoSection = (title: string, data: Record<string, any> | null) => {
    if (!data) return null;

    return (
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {Object.entries(data).map(([key, value]) => (
          <View key={key} style={styles.infoRow}>
            <Text style={styles.infoKey}>{key}:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPermissionStatus = (label: string, granted: boolean | undefined) => {
    const statusColor = granted ? '#4CAF50' : '#F44336';
    const statusText = granted ? 'Allowed' : 'Not Allowed';

    return (
      <View style={styles.permissionRow}>
        <Text style={styles.permissionLabel}>{label}</Text>
        <View style={[styles.permissionBadge, {backgroundColor: statusColor + '20', borderColor: statusColor}]}>
          <Text style={[styles.permissionBadgeText, {color: statusColor}]}>
            {statusText}
          </Text>
        </View>
      </View>
    );
  };

  const renderPermissionsSection = () => {
    return (
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Samsung Health Permissions</Text>

        {permissionsError ? (
          <Text style={styles.errorText}>{permissionsError}</Text>
        ) : permissionsInfo ? (
          <>
            {renderPermissionStatus('Steps', permissionsInfo.hasSteps)}
            {renderPermissionStatus('Activity Summary', permissionsInfo.hasActivitySummary)}
            {renderPermissionStatus('Exercise', permissionsInfo.hasExercise)}
            <View style={styles.permissionDivider} />
            <View style={styles.permissionRow}>
              <Text style={styles.permissionLabel}>All Required Granted</Text>
              <View style={[
                styles.permissionBadge,
                {
                  backgroundColor: permissionsInfo.hasAllRequired ? '#4CAF5020' : '#F4433620',
                  borderColor: permissionsInfo.hasAllRequired ? '#4CAF50' : '#F44336',
                }
              ]}>
                <Text style={[
                  styles.permissionBadgeText,
                  {color: permissionsInfo.hasAllRequired ? '#4CAF50' : '#F44336'}
                ]}>
                  {permissionsInfo.hasAllRequired ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.loadingText}>Loading permissions...</Text>
        )}

        <TouchableOpacity
          style={[styles.permissionRefreshButton, {borderColor: PrimaryColor}]}
          onPress={loadPermissionsInfo}>
          <Text style={[styles.permissionRefreshText, {color: PrimaryColor}]}>
            Refresh Permissions
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderJobStatus = (label: string, isActive: boolean) => {
    const statusColor = isActive ? '#4CAF50' : '#FF9800';
    const statusText = isActive ? 'Active' : 'Inactive';

    return (
      <View style={styles.permissionRow}>
        <Text style={styles.permissionLabel}>{label}</Text>
        <View style={[styles.permissionBadge, {backgroundColor: statusColor + '20', borderColor: statusColor}]}>
          <Text style={[styles.permissionBadgeText, {color: statusColor}]}>
            {statusText}
          </Text>
        </View>
      </View>
    );
  };

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return 'Not scheduled';
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch {
      return isoString;
    }
  };

  const renderScheduledJobsSection = () => {
    const jobs = debugInfo?.scheduledJobs;

    return (
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Scheduled Background Jobs</Text>

        {jobs ? (
          <>
            {/* Regular Sync Job */}
            <Text style={styles.jobSubtitle}>Regular Sync (shealth-sync)</Text>
            {renderJobStatus('Status', jobs.regularSync?.isScheduled)}
            <View style={styles.jobDetailRow}>
              <Text style={styles.jobDetailLabel}>Interval:</Text>
              <Text style={styles.jobDetailValue}>{jobs.regularSync?.interval || 'N/A'}</Text>
            </View>
            <View style={styles.jobDetailRow}>
              <Text style={styles.jobDetailLabel}>Scheduled At:</Text>
              <Text style={styles.jobDetailValue}>{formatDateTime(jobs.regularSync?.scheduledAt)}</Text>
            </View>

            <View style={styles.permissionDivider} />

            {/* EOD Sync Job */}
            <Text style={styles.jobSubtitle}>End-of-Day Sync (shealth-eod-sync)</Text>
            {renderJobStatus('Status', jobs.endOfDaySync?.isScheduled && jobs.endOfDaySync?.enabled)}
            <View style={styles.jobDetailRow}>
              <Text style={styles.jobDetailLabel}>Enabled:</Text>
              <Text style={styles.jobDetailValue}>{jobs.endOfDaySync?.enabled ? 'Yes' : 'No'}</Text>
            </View>
            <View style={styles.jobDetailRow}>
              <Text style={styles.jobDetailLabel}>Target Time:</Text>
              <Text style={styles.jobDetailValue}>{jobs.endOfDaySync?.targetTime || 'N/A'}</Text>
            </View>
            <View style={styles.jobDetailRow}>
              <Text style={styles.jobDetailLabel}>Scheduled At:</Text>
              <Text style={styles.jobDetailValue}>{formatDateTime(jobs.endOfDaySync?.scheduledAt)}</Text>
            </View>
            <View style={styles.jobDetailRow}>
              <Text style={styles.jobDetailLabel}>Next Run:</Text>
              <Text style={styles.jobDetailValue}>{formatDateTime(jobs.endOfDaySync?.nextRunTime)}</Text>
            </View>

            <View style={styles.permissionDivider} />

            {/* Hourly Reconciliation Job */}
            <Text style={styles.jobSubtitle}>Hourly Reconciliation (shealth-hourly-reconciliation)</Text>
            {renderJobStatus('Status', jobs.hourlyReconciliation?.isScheduled && jobs.hourlyReconciliation?.enabled)}
            <View style={styles.jobDetailRow}>
              <Text style={styles.jobDetailLabel}>Enabled:</Text>
              <Text style={styles.jobDetailValue}>{jobs.hourlyReconciliation?.enabled ? 'Yes' : 'No'}</Text>
            </View>
            <View style={styles.jobDetailRow}>
              <Text style={styles.jobDetailLabel}>Interval:</Text>
              <Text style={styles.jobDetailValue}>{jobs.hourlyReconciliation?.interval || 'N/A'}</Text>
            </View>
            <View style={styles.jobDetailRow}>
              <Text style={styles.jobDetailLabel}>Scheduled At:</Text>
              <Text style={styles.jobDetailValue}>{formatDateTime(jobs.hourlyReconciliation?.scheduledAt)}</Text>
            </View>
            <View style={styles.jobDetailRow}>
              <Text style={styles.jobDetailLabel}>Next Run:</Text>
              <Text style={styles.jobDetailValue}>{formatDateTime(jobs.hourlyReconciliation?.nextRunTime)}</Text>
            </View>

            <View style={styles.permissionDivider} />

            {/* Foreground Interval */}
            <Text style={styles.jobSubtitle}>Foreground Auto-Refresh</Text>
            {renderJobStatus('Status', jobs.foregroundInterval?.isActive)}
            <View style={styles.jobDetailRow}>
              <Text style={styles.jobDetailLabel}>Interval:</Text>
              <Text style={styles.jobDetailValue}>{jobs.foregroundInterval?.interval || 'N/A'}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.loadingText}>Loading scheduled jobs info...</Text>
        )}
      </View>
    );
  };

  return (
    <CustomScreenWrapper removeScroll={false}>
      <View style={styles.container}>
        <CustomHeader hideEditBtn={true} />
        <Text style={styles.headerText}>Samsung Health Debug</Text>
        <Text style={styles.subHeaderText}>
          Advanced troubleshooting options
        </Text>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: PrimaryColor}]}
              onPress={handleReschedule}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.actionButtonText}>
                  Re-schedule Background Jobs
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.actionDescription}>
              Use this if your Samsung Health data is not syncing automatically.
              This resets sync frequency to default (10 min), clears last sync date,
              and re-registers all background tasks.
            </Text>

            <TouchableOpacity
              style={[styles.actionButton, styles.emailButton, {borderColor: PrimaryColor}]}
              onPress={handleSendDebugEmail}
              disabled={isLoading}>
              <Text style={[styles.emailButtonText, {color: PrimaryColor}]}>
                Send Debug Report to Support
              </Text>
            </TouchableOpacity>

            <Text style={styles.actionDescription}>
              Collects diagnostic information and opens your email app with a
              pre-filled support request.
            </Text>

            <TouchableOpacity
              style={[styles.copyButton]}
              onPress={handleShareDebugInfo}
              disabled={isLoading}>
              <Text style={[styles.copyButtonText, {color: PrimaryColor}]}>
                Share Debug Info
              </Text>
            </TouchableOpacity>

            <Text style={styles.actionDescription}>
              Alternative: Share debug info via other apps (Gmail, messaging, etc.)
            </Text>
          </View>

          {/* Refresh Button */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => {
              loadDebugInfo();
              loadDeviceInfo();
              loadPermissionsInfo();
            }}>
            <Text style={[styles.refreshButtonText, {color: PrimaryColor}]}>
              Refresh Info
            </Text>
          </TouchableOpacity>

          {/* Samsung Health Permissions */}
          {Platform.OS === 'android' && renderPermissionsSection()}

          {/* Scheduled Background Jobs */}
          {Platform.OS === 'android' && renderScheduledJobsSection()}

          {/* Device Info */}
          {renderInfoSection('Device Information', deviceInfo)}

          {/* Service State */}
          {debugInfo?.serviceState && renderInfoSection('Service State', debugInfo.serviceState)}

          {/* AsyncStorage */}
          {debugInfo?.asyncStorage && renderInfoSection('Storage Data', debugInfo.asyncStorage)}

          {/* BackgroundFetch */}
          {debugInfo?.backgroundFetch && renderInfoSection('Background Fetch', debugInfo.backgroundFetch)}

          {/* Config */}
          {debugInfo?.config && renderInfoSection('Configuration', debugInfo.config)}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </CustomScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(15),
    paddingBottom: moderateScale(30),
    marginBottom: moderateScale(20),
    flex: 1,
  },
  headerText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.primaryGrey,
    textAlign: 'center',
    marginTop: moderateScale(10),
  },
  subHeaderText: {
    fontSize: moderateScale(12),
    fontWeight: '400',
    color: colors.primaryGrey,
    textAlign: 'center',
    marginTop: moderateScale(5),
    marginBottom: moderateScale(20),
  },
  scrollView: {
    flex: 1,
  },
  actionSection: {
    marginBottom: moderateScale(20),
  },
  actionButton: {
    paddingVertical: moderateScale(14),
    borderRadius: moderateScale(25),
    alignItems: 'center',
    marginBottom: moderateScale(8),
  },
  actionButtonText: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  emailButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    marginTop: moderateScale(15),
  },
  emailButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  copyButton: {
    paddingVertical: moderateScale(12),
    alignItems: 'center',
    marginTop: moderateScale(10),
  },
  copyButtonText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  actionDescription: {
    fontSize: moderateScale(11),
    color: colors.primaryGrey,
    lineHeight: moderateScale(16),
    marginBottom: moderateScale(5),
    paddingHorizontal: moderateScale(5),
  },
  refreshButton: {
    alignSelf: 'flex-end',
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(15),
    marginBottom: moderateScale(10),
  },
  refreshButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: colors.grey + '30',
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    marginBottom: moderateScale(15),
  },
  sectionTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: colors.primaryGrey,
    marginBottom: moderateScale(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    paddingBottom: moderateScale(8),
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: moderateScale(4),
  },
  infoKey: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    color: colors.primaryGrey,
    width: '45%',
  },
  infoValue: {
    fontSize: moderateScale(10),
    color: colors.primaryGrey,
    flex: 1,
  },
  bottomPadding: {
    height: moderateScale(30),
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: moderateScale(8),
  },
  permissionLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: colors.primaryGrey,
  },
  permissionBadge: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
    borderWidth: 1,
  },
  permissionBadgeText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  permissionDivider: {
    height: 1,
    backgroundColor: colors.lightGrey,
    marginVertical: moderateScale(8),
  },
  permissionRefreshButton: {
    marginTop: moderateScale(12),
    paddingVertical: moderateScale(8),
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: moderateScale(15),
  },
  permissionRefreshText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  errorText: {
    fontSize: moderateScale(11),
    color: '#F44336',
    fontStyle: 'italic',
    paddingVertical: moderateScale(8),
  },
  loadingText: {
    fontSize: moderateScale(11),
    color: colors.primaryGrey,
    fontStyle: 'italic',
    paddingVertical: moderateScale(8),
  },
  jobSubtitle: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: colors.primaryGrey,
    marginTop: moderateScale(4),
    marginBottom: moderateScale(6),
  },
  jobDetailRow: {
    flexDirection: 'row',
    paddingVertical: moderateScale(3),
    paddingLeft: moderateScale(8),
  },
  jobDetailLabel: {
    fontSize: moderateScale(10),
    fontWeight: '500',
    color: colors.primaryGrey,
    width: '35%',
  },
  jobDetailValue: {
    fontSize: moderateScale(10),
    color: colors.primaryGrey,
    flex: 1,
  },
});

export default SamsungHealthDebug;
