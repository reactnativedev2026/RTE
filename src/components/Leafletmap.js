import React, {useRef} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {WebView} from 'react-native-webview';
import {amerithon_path_json, colors} from '../utils';
import {RootState} from '../core/store';
import {moderateScale} from '../utils/metrics';
import {useSelector} from 'react-redux';
import CustomHorizontalLine from './CustomHorizontalLine';
import {useGetFlagQuery} from '../services/Home.api';

const LeafletMap = ({showHeader = true, containerStyle, distance}) => {
  const webViewRef = useRef(null);
  const {user, eventDetail} = useSelector(
    (state: RootState) => state.loginReducer,
  );
  const {data} = useGetFlagQuery();
  const flagURL = JSON.stringify(data?.flag);

  // Convert GeoJSON to a JavaScript-readable format
  const geoJsonData = JSON.stringify(amerithon_path_json);
  const latitude = distance ? distance.latitude : 37.828881; // Default
  const longitude = distance ? distance.longitude : -122.479583;

  // HTML and JavaScript for Leaflet Map
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
      html, body {
        height: 100%;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #map {
        height: 100vh;
        width: 100vw;
      }
      </style>
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet-geometryutil/0.10.1/leaflet.geometryutil.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Turf.js/6.5.0/turf.min.js"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        document.addEventListener("DOMContentLoaded", function() {
          var map = L.map('map', { zoomControl: false }); // Disable default zoom control
          L.control.zoom({ position: 'bottomright' }).addTo(map); // Add zoom controls at the bottom-right

          var geoJsonData = JSON.parse('${geoJsonData}');

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          L.geoJSON(geoJsonData, {
            style: function(feature) {
              return { color: 'blue', weight: 3 };
            },
            onEachFeature: function(feature, layer) {
              if (feature.properties && feature.properties.Name) {
                layer.bindPopup(feature.properties.Name);
              }
            }
          }).addTo(map);

          // Extract all coordinates from all features
          let allCoordinates = [];
          geoJsonData.features.forEach(feature => {
            if (feature.geometry.type === "LineString") {
              allCoordinates = allCoordinates.concat(feature.geometry.coordinates);
            }
          });

          if (allCoordinates.length > 1) {
            var startCoord = allCoordinates[0]; // First coordinate
            var endCoord = allCoordinates[allCoordinates.length - 1]; // Last coordinate

            // Calculate the midpoint between start and end points
            var midLat = (startCoord[1] + endCoord[1]) / 2;
            var midLng = (startCoord[0] + endCoord[0]) / 2;

            // Set the map center to the midpoint
            map.setView([midLat, midLng], 3); // Adjust zoom level as needed

            // Start point marker
            L.marker([${latitude}, ${longitude}]) // Convert to Lat,Lng
            .addTo(map)
            .bindPopup(${eventDetail?.statistics?.completed_miles} + " miles");

            const flagIcon = L.icon({
              iconUrl: ${flagURL},
              iconSize: [35, 35], 
              iconAnchor: [15, 32], 
              popupAnchor: [0, -32]
            });
            // End point marker
            L.marker([endCoord[1], endCoord[0]], { icon: flagIcon }) // Convert to Lat,Lng
            .addTo(map)
            .bindPopup(geoJsonData.features[geoJsonData.features.length-1].properties.Name);
          } else {
            map.setView([${latitude}, ${longitude}], 3); // Default zoom-out
          }
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, containerStyle]}>
      {showHeader && (
        <View style={styles.targetContainer}>
          <Text style={styles.heading}>
            {user?.display_name || user?.name}'s Journey
          </Text>
          <CustomHorizontalLine />
        </View>
      )}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{html: mapHtml}}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        nestedScrollEnabled={true} // Enable scrolling inside WebView
        scrollEnabled={true} // Disable WebView scrolling (handled by Leaflet)
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 250,
    marginBottom: moderateScale(20),
    marginHorizontal: moderateScale(10),
  },
  webview: {flex: 1},
  heading: {
    color: colors.headerBlack,
    textAlign: 'center',
    fontSize: moderateScale(17),
    fontWeight: '700',
    paddingTop: moderateScale(5),
  },
  targetContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: moderateScale(25),
    borderTopRightRadius: moderateScale(25),
    paddingTop: moderateScale(10),
  },
});

export default LeafletMap;
