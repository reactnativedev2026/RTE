import React, {useState} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {colors} from '../utils';
import {moderateScale, WINDOW_WIDTH} from '../utils/metrics';
import CustomHorizontalLine from './CustomHorizontalLine';
import {useSelector} from 'react-redux';
import {RootState} from '../core/store';
import MapView, {Marker, Polyline} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

interface CustomAmerithonMapProps {
  showHeader?: boolean;
  containerStyle?: object;
  mapStyle?: object;
}

const CustomAmerithonMap = ({
  showHeader = true,
  containerStyle,
  mapStyle,
}: CustomAmerithonMapProps) => {
  const mapRef = React.useRef(null);
  const {user, eventDetail} = useSelector(
    (state: RootState) => state.loginReducer,
  );
  const [routeCoordinates, setRouteCoordinates] = useState<
    {latitude: number; longitude: number}[]
  >([]);

  const progressPercentage = eventDetail?.statistics?.completed_percentage;
  const origin = {latitude: 47.751076, longitude: -120.740135};
  const destination = {latitude: 37.8199, longitude: -122.478661};
  const GOOGLE_MAPS_APIKEY = 'AIzaSyB0_kPQ8axcyO23geRlhY8fjeOgUu5otXo';

  return (
    <View style={[styles.container, containerStyle]}>
      {showHeader && (
        <View style={styles.targetContainer}>
          <Text style={styles.heading}>{user?.name}'s Journey</Text>
          <CustomHorizontalLine />
        </View>
      )}
      <MapView
        ref={mapRef}
        style={[styles.map, mapStyle]}
        rotateEnabled={true}
        initialRegion={{
          latitude: (origin.latitude + destination.latitude) / 2,
          longitude: (origin.longitude + destination.longitude) / 2,
          latitudeDelta: Math.abs(origin.latitude - destination.latitude) + 0.2,
          longitudeDelta:
            Math.abs(origin.longitude - destination.longitude) + 0.2,
        }}
        onMapReady={() => {
          if (mapRef.current) {
            mapRef.current.fitToCoordinates([origin, destination], {
              edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
              animated: true,
            });
          }
        }}>
        <Marker coordinate={origin} title="Washington" pinColor="blue" />
        {/* Progress Markers */}
        {/* {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker}
            title={marker.title}
            pinColor="red"

          />
        ))} */}

        <Marker coordinate={destination} title="Golden Bridge" />
        <MapViewDirections
          origin={origin}
          destination={destination}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={0} // Hide the default route, we use Polyline instead
          onReady={result => {
            if (result.coordinates.length > 0) {
              setRouteCoordinates(result.coordinates);
            }
          }}
          onError={errorMessage => {
            console.error('MapViewDirections error:', errorMessage);
          }}
        />
        {/* Draw the road-following path */}
        {routeCoordinates.length > 0 && (
          <>
            {/* Covered Path (Blue) */}
            <Polyline
              coordinates={routeCoordinates.slice(
                0,
                Math.floor(
                  routeCoordinates.length * (progressPercentage / 100),
                ),
              )}
              strokeWidth={6}
              strokeColor="blue"
            />

            {/* Remaining Path (Gray) */}
            <Polyline
              coordinates={routeCoordinates.slice(
                Math.floor(
                  routeCoordinates.length * (progressPercentage / 100),
                ),
              )}
              strokeWidth={6}
              strokeColor="gray"
            />
          </>
        )}

        {/* Add Markers at 10% Intervals */}
        {routeCoordinates.length > 0 &&
          Array.from({length: 10}, (_, i) => {
            const index = Math.floor(routeCoordinates.length * ((i + 1) / 10));
            if (index < routeCoordinates.length) {
              return (
                <Marker
                  key={i}
                  pinColor="red"
                  title={`${(i + 1) * 10}%`}
                  coordinate={routeCoordinates[index]}
                />
              );
            }
            return null;
          })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: moderateScale(10),
    marginBottom: moderateScale(5),
  },
  targetContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    padding: moderateScale(10),
  },
  heading: {
    color: colors.headerBlack,
    textAlign: 'center',
    fontSize: moderateScale(17),
    fontWeight: '700',
    paddingTop: moderateScale(5),
  },
  distanceText: {
    color: colors.primary,
    textAlign: 'center',
    fontSize: moderateScale(14),
    marginTop: moderateScale(5),
  },
  map: {
    alignSelf: 'center',
    width: WINDOW_WIDTH - 20,
    height: moderateScale(200),
    marginBottom: moderateScale(10),
  },
});

export default CustomAmerithonMap;
