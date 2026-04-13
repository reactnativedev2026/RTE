package com.loginsignupapp

import android.app.Activity
import android.util.Log
import com.facebook.react.bridge.*
import com.samsung.android.sdk.health.data.HealthDataService
import com.samsung.android.sdk.health.data.HealthDataStore
import com.samsung.android.sdk.health.data.data.Field
import com.samsung.android.sdk.health.data.data.HealthDataPoint
import com.samsung.android.sdk.health.data.error.ResolvablePlatformException
import com.samsung.android.sdk.health.data.permission.AccessType
import com.samsung.android.sdk.health.data.permission.Permission
import com.samsung.android.sdk.health.data.data.AggregatedData
import com.samsung.android.sdk.health.data.request.DataType
import com.samsung.android.sdk.health.data.request.DataTypes
import com.samsung.android.sdk.health.data.request.LocalTimeFilter
import com.samsung.android.sdk.health.data.request.LocalTimeGroup
import com.samsung.android.sdk.health.data.request.LocalTimeGroupUnit
import com.samsung.android.sdk.health.data.request.Ordering
import com.samsung.android.sdk.health.data.response.DataResponse
import kotlinx.coroutines.*
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.Duration
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter

/**
 * Samsung Health Module for React Native
 * Based on Samsung Health Data API 1.0.0
 *
 * This module provides connection and permission management for Samsung Health
 */
class SamsungHealthModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var healthDataStore: HealthDataStore? = null
    private val TAG = "SamsungHealthModule"
    private var scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    override fun getName(): String {
        return "SamsungHealthModule"
    }

    /**
     * Initialize Samsung Health SDK connection
     * Uses HealthDataService.getStore() as per the working Health Diary code
     * Also recreates the coroutine scope if it was previously cancelled
     */
    @ReactMethod
    fun initialize(promise: Promise) {
        try {
            if (!scope.isActive) {
                scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
            }
            healthDataStore = HealthDataService.getStore(reactApplicationContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", "Failed to initialize: ${e.message}", e)
        }
    }

    /**
     * Request permissions for Samsung Health data access
     * Follows the pattern from HealthMainViewModel in Health Diary code
     * Handles ResolvablePlatformException to prompt user for Samsung Health setup
     * 
     * @param allowedDataTypes Optional ReadableArray of allowed data types (e.g., ["STEPS", "EXERCISE"])
     *                         If null or empty, defaults to requesting STEPS and EXERCISE
     *                         STEPS is always included regardless of the parameter
     */
    @ReactMethod
    fun requestPermissions(allowedDataTypes: ReadableArray?, promise: Promise) {
        val store = healthDataStore
        if (store == null) {
            promise.reject("NOT_INITIALIZED", "Samsung Health not initialized. Call initialize() first.")
            return
        }

        val context = reactApplicationContext

        scope.launch(Dispatchers.Main) {
            try {
                val activity = context.currentActivity
                if (activity == null) {
                    promise.reject("NO_ACTIVITY", "No current activity available")
                    return@launch
                }

                // Build permission set based on allowed_data_types
                // STEPS is always included
                val permSet = mutableSetOf<Permission>()
                permSet.add(Permission.of(DataTypes.STEPS, AccessType.READ))
                permSet.add(Permission.of(DataTypes.ACTIVITY_SUMMARY, AccessType.READ))

                // Check if EXERCISE is in allowed_data_types
                var includeExercise = false
                if (allowedDataTypes != null && allowedDataTypes.size() > 0) {
                    for (i in 0 until allowedDataTypes.size()) {
                        val dataType = allowedDataTypes.getString(i)?.uppercase()
                        if (dataType == "EXERCISE") {
                            includeExercise = true
                            break
                        }
                    }
                }

                if (includeExercise) {
                    permSet.add(Permission.of(DataTypes.EXERCISE, AccessType.READ))
                }

                // Request permissions - this will show Samsung Health permission dialog
                val grantedPermissions = store.requestPermissions(permSet, activity as Activity)

                if (grantedPermissions.containsAll(permSet)) {
                    promise.resolve(true)
                } else {
                    promise.resolve(false)
                }
            } catch (e: ResolvablePlatformException) {
                val activity = context.currentActivity
                if (activity != null && e.hasResolution) {
                    try {
                        e.resolve(activity as Activity)
                        promise.reject("PERMISSION_ERROR", "Samsung Health needs to be set up. Please follow the prompts and try again.", e)
                    } catch (resolveError: Exception) {
                        promise.reject("PERMISSION_ERROR", "Failed to resolve: ${resolveError.message}", resolveError)
                    }
                } else {
                    promise.reject("PERMISSION_ERROR", "Cannot resolve permission issue: ${e.message}", e)
                }
            } catch (e: Exception) {
                promise.reject("PERMISSION_ERROR", "Error requesting permissions: ${e.message}", e)
            }
        }
    }

    /**
     * Get device unique identifier
     * Uses ANDROID_ID which is unique per app-signing key, user, and device
     */
    @ReactMethod
    fun getDeviceId(promise: Promise) {
        try {
            val deviceId = android.provider.Settings.Secure.getString(
                reactApplicationContext.contentResolver,
                android.provider.Settings.Secure.ANDROID_ID
            )
            promise.resolve(deviceId ?: "")
        } catch (e: Exception) {
            promise.reject("DEVICE_ID_ERROR", "Error getting device ID: ${e.message}", e)
        }
    }

    /**
     * Disconnect from Samsung Health
     */
    @ReactMethod
    fun disconnect(promise: Promise) {
        try {
            scope.cancel()
            healthDataStore = null
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("DISCONNECT_ERROR", "Error disconnecting: ${e.message}", e)
        }
    }

    /**
     * Check if Samsung Health is connected
     */
    @ReactMethod
    fun isConnected(promise: Promise) {
        try {
            val isConnected = healthDataStore != null
            promise.resolve(isConnected)
        } catch (e: Exception) {
            promise.reject("CONNECTION_CHECK_ERROR", "Error checking connection: ${e.message}", e)
        }
    }

    /**
     * Check which permissions are currently granted
     * Returns an object with boolean flags for each permission type
     *
     * @param allowedDataTypes Optional ReadableArray of allowed data types (e.g., ["STEPS", "EXERCISE"])
     *                         Used to determine which permissions to check
     */
    @ReactMethod
    fun checkGrantedPermissions(allowedDataTypes: ReadableArray?, promise: Promise) {
        val store = healthDataStore
        if (store == null) {
            promise.reject("NOT_INITIALIZED", "Samsung Health not initialized. Call initialize() first.")
            return
        }

        scope.launch(Dispatchers.Main) {
            try {
                // Build the same permission set we're checking for
                val permSet = mutableSetOf<Permission>()
                permSet.add(Permission.of(DataTypes.STEPS, AccessType.READ))
                permSet.add(Permission.of(DataTypes.ACTIVITY_SUMMARY, AccessType.READ))

                // Check if EXERCISE is in allowed_data_types
                var includeExercise = false
                if (allowedDataTypes != null && allowedDataTypes.size() > 0) {
                    for (i in 0 until allowedDataTypes.size()) {
                        val dataType = allowedDataTypes.getString(i)?.uppercase()
                        if (dataType == "EXERCISE") {
                            includeExercise = true
                            break
                        }
                    }
                }

                if (includeExercise) {
                    permSet.add(Permission.of(DataTypes.EXERCISE, AccessType.READ))
                }

                // Get currently granted permissions
                val grantedPermissions = store.getGrantedPermissions(permSet)

                // Build result map
                val result = Arguments.createMap()
                result.putBoolean("hasSteps", grantedPermissions.contains(Permission.of(DataTypes.STEPS, AccessType.READ)))
                result.putBoolean("hasActivitySummary", grantedPermissions.contains(Permission.of(DataTypes.ACTIVITY_SUMMARY, AccessType.READ)))
                result.putBoolean("hasExercise", grantedPermissions.contains(Permission.of(DataTypes.EXERCISE, AccessType.READ)))
                result.putBoolean("hasAllRequired", grantedPermissions.containsAll(permSet))

                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("PERMISSION_CHECK_ERROR", "Error checking permissions: ${e.message}", e)
            }
        }
    }

    /**
     * Retrieve steps data from Samsung Health
     * Uses aggregation API (DataType.StepsType.TOTAL) as per Health Diary Code implementation
     *
     * @param startDate Start date in ISO format (e.g., "2024-01-01T00:00:00")
     * @param endDate End date in ISO format (e.g., "2024-01-02T00:00:00")
     * @param promise Promise to resolve with steps data or reject with error
     */
    @ReactMethod
    fun getStepsData(startDate: String, endDate: String, promise: Promise) {
        val store = healthDataStore
        if (store == null) {
            promise.reject("NOT_INITIALIZED", "Samsung Health not initialized. Call initialize() first.")
            return
        }

        scope.launch(Dispatchers.IO) {
            try {
                // Parse date strings to LocalDateTime
                val formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME
                val startDateTime = LocalDateTime.parse(startDate, formatter)
                val endDateTime = LocalDateTime.parse(endDate, formatter)

                // Create time filter for the specified date range
                val localTimeFilter = LocalTimeFilter.of(startDateTime, endDateTime)
                
                // Create time group for hourly aggregation (as per StepViewModel in Health Diary Code)
                val localTimeGroup = LocalTimeGroup.of(LocalTimeGroupUnit.HOURLY, 1)

                // Build aggregate request for steps data using StepsType.TOTAL
                // This is the correct way to read steps data in Samsung Health SDK 1.0.0
                val aggregateRequest = DataType.StepsType.TOTAL.requestBuilder
                    .setLocalTimeFilterWithGroup(localTimeFilter, localTimeGroup)
                    .setOrdering(Ordering.ASC)
                    .build()

                // Make SDK call to aggregate step data
                val result: DataResponse<AggregatedData<Long>> = store.aggregateData(aggregateRequest)

                // Process the aggregated step data
                val stepsDataArray = processAggregatedStepsData(result.dataList)

                // Resolve promise with the steps data
                promise.resolve(stepsDataArray)

            } catch (e: ResolvablePlatformException) {
                promise.reject("PERMISSION_ERROR", "Permission issue reading steps data: ${e.message}", e)
            } catch (e: Exception) {
                promise.reject("READ_ERROR", "Error reading steps data: ${e.message}", e)
            }
        }
    }

    /**
     * Process aggregated steps data and convert to WritableArray for React Native
     * Extracts step count, start time, end time, and date from AggregatedData
     * Based on StepViewModel.processAggregateDataResponse from Health Diary Code
     */
    private fun processAggregatedStepsData(aggregatedStepsList: List<AggregatedData<Long>>): WritableArray {
        val stepsArray = Arguments.createArray()

        aggregatedStepsList.forEach { aggregatedStepData ->
            try {
                val stepsMap = Arguments.createMap()

                // Extract step count from aggregated data value
                val stepCount = aggregatedStepData.value as? Long ?: 0L
                stepsMap.putInt("count", stepCount.toInt())

                // Extract start and end times from aggregated data
                val startTime = aggregatedStepData.getStartLocalDateTime()
                val endTime = aggregatedStepData.getEndLocalDateTime()

                // Format times as ISO strings for React Native
                stepsMap.putString("startTime", startTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                stepsMap.putString("endTime", endTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                stepsMap.putString("date", startTime.toLocalDate().toString())

                stepsArray.pushMap(stepsMap)
            } catch (e: Exception) {
                Log.e(TAG, "Error processing aggregated step data: ${e.message}", e)
                // Continue processing other data points
            }
        }

        return stepsArray
    }

    /**
     * Retrieve activity summary distance data from Samsung Health
     * Uses ActivitySummaryType.TOTAL_DISTANCE to get distance while active
     * Returns aggregated distance data for the specified date range
     *
     * @param startDate Start date in ISO format (e.g., "2024-01-01T00:00:00")
     * @param endDate End date in ISO format (e.g., "2024-01-02T00:00:00")
     * @param promise Promise to resolve with distance data or reject with error
     */
    @ReactMethod
    fun getActivitySummaryDistance(startDate: String, endDate: String, promise: Promise) {
        val store = healthDataStore
        if (store == null) {
            promise.reject("NOT_INITIALIZED", "Samsung Health not initialized. Call initialize() first.")
            return
        }

        scope.launch(Dispatchers.IO) {
            try {
                // Parse date strings to LocalDateTime
                val formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME
                val startDateTime = LocalDateTime.parse(startDate, formatter)
                val endDateTime = LocalDateTime.parse(endDate, formatter)

                // Create time filter for the specified date range
                val localTimeFilter = LocalTimeFilter.of(startDateTime, endDateTime)

                // Create time group for daily aggregation
                val localTimeGroup = LocalTimeGroup.of(LocalTimeGroupUnit.DAILY, 1)

                // Use TOTAL_DISTANCE to get only distance (distance while active)
                val aggregateRequest = DataType.ActivitySummaryType.TOTAL_DISTANCE
                    .requestBuilder
                    .setLocalTimeFilterWithGroup(localTimeFilter, localTimeGroup)
                    .setOrdering(Ordering.ASC)
                    .build()

                // Make SDK call to aggregate activity summary data
                val result = store.aggregateData(aggregateRequest)

                // Process the aggregated distance data
                val distanceDataArray = processActivitySummaryDistanceData(result.dataList)

                // Resolve promise with the distance data
                promise.resolve(distanceDataArray)

            } catch (e: ResolvablePlatformException) {
                promise.reject("PERMISSION_ERROR", "Permission issue reading activity summary data: ${e.message}", e)
            } catch (e: Exception) {
                promise.reject("READ_ERROR", "Error reading activity summary data: ${e.message}", e)
            }
        }
    }

    /**
     * Process aggregated activity summary distance data and convert to WritableArray for React Native
     * Converts distance from meters to kilometers with 2 decimal places precision
     */
    private fun processActivitySummaryDistanceData(aggregatedDistanceList: List<AggregatedData<*>>): WritableArray {
        val distanceArray = Arguments.createArray()

        aggregatedDistanceList.forEach { aggregatedData ->
            try {
                val distanceMap = Arguments.createMap()

                // Extract start and end times from aggregated data
                val startTime = aggregatedData.getStartLocalDateTime()
                val endTime = aggregatedData.getEndLocalDateTime()

                // Format times as ISO strings for React Native
                distanceMap.putString("startTime", startTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                distanceMap.putString("endTime", endTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                distanceMap.putString("date", startTime.toLocalDate().toString())

                // Access the value property and convert to BigDecimal for precise calculation
                @Suppress("UNCHECKED_CAST")
                val aggregatedFloat = aggregatedData as? AggregatedData<Float>

                var distanceMetersBigDecimal: BigDecimal? = null
                if (aggregatedFloat != null) {
                    val distanceValue = aggregatedFloat.value
                    // Convert to BigDecimal using the most precise method available
                    distanceMetersBigDecimal = when (distanceValue) {
                        is Float -> {
                            // Use BigDecimal constructor with scale to preserve precision
                            // Convert Float to String with enough precision, then to BigDecimal
                            BigDecimal(java.lang.Float.toString(distanceValue))
                        }
                        is Double -> BigDecimal.valueOf(distanceValue)
                        is Long -> BigDecimal.valueOf(distanceValue)
                        is Int -> BigDecimal.valueOf(distanceValue.toLong())
                        else -> {
                            val num = distanceValue as? Number
                            if (num != null) {
                                BigDecimal(java.lang.Float.toString(num.toFloat()))
                            } else {
                                null
                            }
                        }
                    }
                }

                // Convert meters to kilometers with 2 decimal places
                if (distanceMetersBigDecimal != null && distanceMetersBigDecimal > BigDecimal.ZERO) {
                    // Use BigDecimal for precise division with exact rounding
                    val kmBigDecimal = distanceMetersBigDecimal.divide(
                        BigDecimal("1000"),
                        2, // 2 decimal places
                        RoundingMode.HALF_UP
                    )

                    // Store both meters and kilometers for flexibility
                    distanceMap.putDouble("distanceMeters", distanceMetersBigDecimal.toDouble())
                    distanceMap.putDouble("distanceKilometers", kmBigDecimal.toDouble())

                    // Also store as string to preserve exact precision
                    distanceMap.putString("distanceKilometersString", kmBigDecimal.toPlainString())
                } else {
                    // No distance recorded for this time period
                    distanceMap.putDouble("distanceMeters", 0.0)
                    distanceMap.putDouble("distanceKilometers", 0.0)
                    distanceMap.putString("distanceKilometersString", "0.00")
                }

                distanceArray.pushMap(distanceMap)
            } catch (e: Exception) {
                Log.e(TAG, "Error processing activity summary distance data: ${e.message}", e)
                // Continue processing other data points
            }
        }

        return distanceArray
    }

    /**
     * Retrieve exercise data from Samsung Health
     * Follows the pattern from ExerciseViewModel in Health Diary code
     *
     * @param startDate Start date in ISO format (e.g., "2024-01-01T00:00:00")
     * @param endDate End date in ISO format (e.g., "2024-01-02T00:00:00")
     * @param promise Promise to resolve with exercise data or reject with error
     */
    @ReactMethod
    fun getExerciseData(startDate: String, endDate: String, promise: Promise) {
        val store = healthDataStore
        if (store == null) {
            promise.reject("NOT_INITIALIZED", "Samsung Health not initialized. Call initialize() first.")
            return
        }

        scope.launch(Dispatchers.IO) {
            try {
                // Parse date strings to LocalDateTime
                val formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME
                val startDateTime = LocalDateTime.parse(startDate, formatter)
                val endDateTime = LocalDateTime.parse(endDate, formatter)

                // Create time filter for the specified date range
                val localTimeFilter = LocalTimeFilter.of(startDateTime, endDateTime)

                // Build read request for exercise data
                val readRequest = DataTypes.EXERCISE.readDataRequestBuilder
                    .setLocalTimeFilter(localTimeFilter)
                    .setOrdering(Ordering.DESC)
                    .build()

                // Make SDK call to read exercise data
                val exerciseList = store.readData(readRequest).dataList

                // Process the exercise data
                val exerciseDataArray = processExerciseData(exerciseList)

                // Resolve promise with the exercise data
                promise.resolve(exerciseDataArray)

            } catch (e: ResolvablePlatformException) {
                promise.reject("PERMISSION_ERROR", "Permission issue reading exercise data: ${e.message}", e)
            } catch (e: Exception) {
                promise.reject("READ_ERROR", "Error reading exercise data: ${e.message}", e)
            }
        }
    }

    /**
     * Process exercise data points and convert to WritableArray for React Native
     * Extracts exercise type, duration, distance, calories, and timestamps
     * Uses reflection to extract data from exercise sessions (similar to ExerciseViewModel)
     */
    private fun processExerciseData(exerciseList: List<HealthDataPoint>): WritableArray {
        val exerciseArray = Arguments.createArray()

        exerciseList.forEach { exerciseDataPoint ->
            try {
                val exerciseMap = Arguments.createMap()

                // Extract exercise type
                val exerciseType = exerciseDataPoint.getValueOrDefault(
                    DataType.ExerciseType.EXERCISE_TYPE,
                    DataType.ExerciseType.PredefinedExerciseType.OTHER
                ) as? DataType.ExerciseType.PredefinedExerciseType
                    ?: DataType.ExerciseType.PredefinedExerciseType.OTHER

                exerciseMap.putString("exerciseType", exerciseType.toString())

                // Extract start and end times
                val startTime = LocalDateTime.ofInstant(
                    exerciseDataPoint.startTime,
                    exerciseDataPoint.zoneOffset
                )
                val endTime = LocalDateTime.ofInstant(
                    exerciseDataPoint.endTime,
                    exerciseDataPoint.zoneOffset
                )

                exerciseMap.putString("startTime", startTime.toString())
                exerciseMap.putString("endTime", endTime.toString())

                // Calculate duration in seconds
                val duration = Duration.between(startTime, endTime).seconds
                exerciseMap.putDouble("duration", duration.toDouble())

                // Extract calories and distance from exercise sessions
                val (calories, distance) = extractCaloriesAndDistance(exerciseDataPoint)
                exerciseMap.putDouble("calories", calories)
                exerciseMap.putDouble("distance", distance)

                exerciseArray.pushMap(exerciseMap)
            } catch (e: Exception) {
                // Continue processing other data points
            }
        }

        return exerciseArray
    }

    /**
     * Extract calories and distance from exercise sessions using reflection
     * Exercise data stores calories and distance in nested session objects
     */
    private fun extractCaloriesAndDistance(exerciseDataPoint: HealthDataPoint): Pair<Double, Double> {
        var totalCalories = 0.0
        var totalDistance = 0.0

        try {
            // Get all available fields from the exercise data point
            val sessionsList = getSessionsList(exerciseDataPoint)

            if (sessionsList != null && sessionsList.isNotEmpty()) {
                sessionsList.forEach { session ->
                    if (session != null) {
                        // Extract calories from session
                        val sessionCalories = getSessionValue(
                            session,
                            listOf("calories", "CALORIES", "BURNED_CALORIES", "EXERCISE_CALORIES", "CALORIE", "ENERGY")
                        )
                        totalCalories += sessionCalories

                        // Extract distance from session
                        val sessionDistance = getSessionValue(
                            session,
                            listOf("distance", "DISTANCE", "TOTAL_DISTANCE", "EXERCISE_DISTANCE", "DISTANCE_METERS", "DIST")
                        )
                        totalDistance += sessionDistance
                    }
                }
            }
        } catch (e: Exception) {
            // Silent error handling
        }

        return Pair(totalCalories, totalDistance)
    }

    /**
     * Get sessions list from exercise data point using reflection
     */
    private fun getSessionsList(exerciseDataPoint: HealthDataPoint): List<*>? {
        try {
            val declaredFields = DataType.ExerciseType::class.java.declaredFields
            val publicFields = DataType.ExerciseType::class.java.fields
            val allFields = (declaredFields + publicFields).distinctBy { it.name }

            for (field in allFields) {
                if (field.name == "SESSIONS" && java.lang.reflect.Modifier.isStatic(field.modifiers)) {
                    try {
                        field.isAccessible = true
                        val fieldObj = field.get(null)
                        if (fieldObj is com.samsung.android.sdk.health.data.data.Field<*>) {
                            val value = exerciseDataPoint.getValue(fieldObj)
                            if (value is List<*>) {
                                return value
                            }
                        }
                    } catch (e: Exception) {
                        // Silent error handling
                    }
                }
            }
        } catch (e: Exception) {
            // Silent error handling
        }
        return null
    }

    /**
     * Get a numeric value from a session object using reflection
     * Tries multiple field names to find the value
     */
    private fun getSessionValue(session: Any, fieldNames: List<String>): Double {
        val sessionClass = session.javaClass

        for (fieldName in fieldNames) {
            try {
                // Try to get field directly
                val field = try {
                    sessionClass.getDeclaredField(fieldName)
                } catch (e: NoSuchFieldException) {
                    try {
                        sessionClass.getField(fieldName)
                    } catch (e2: NoSuchFieldException) {
                        null
                    }
                }

                if (field != null) {
                    field.isAccessible = true
                    val value = field.get(session)
                    if (value != null) {
                        return when (value) {
                            is Double -> value
                            is Float -> value.toDouble()
                            is Int -> value.toDouble()
                            is Long -> value.toDouble()
                            else -> (value as? Number)?.toDouble() ?: 0.0
                        }
                    }
                }

                // Try getter method
                val getterName = "get${fieldName.replaceFirstChar { it.uppercaseChar() }}"
                try {
                    val method = sessionClass.getMethod(getterName)
                    val value = method.invoke(session)
                    if (value != null) {
                        return when (value) {
                            is Double -> value
                            is Float -> value.toDouble()
                            is Int -> value.toDouble()
                            is Long -> value.toDouble()
                            else -> (value as? Number)?.toDouble() ?: 0.0
                        }
                    }
                } catch (e: Exception) {
                    // Continue to next field name
                }
            } catch (e: Exception) {
                // Continue to next field name
            }
        }

        return 0.0
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        scope.cancel()
        healthDataStore = null
    }
}

