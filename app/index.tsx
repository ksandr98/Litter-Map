import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapView, { UrlTile, Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import * as Location from 'expo-location';

interface WasteSpot {
  id: string;
  latitude: number;
  longitude: number;
  status: 'REPORTED' | 'CLAIMED' | 'CLEANED';
  title: string;
}

const INITIAL_SPOTS: WasteSpot[] = [
  {
    id: '1',
    latitude: 16.0544,
    longitude: 108.2022,
    status: 'REPORTED',
    title: 'Plastic Pile'
  },
  {
    id: '2',
    latitude: 16.0600,
    longitude: 108.2100,
    status: 'CLAIMED',
    title: 'Beach Trash'
  }
];

export default function Index() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [spots, setSpots] = useState<WasteSpot[]>(INITIAL_SPOTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setIsLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        setErrorMsg('Error fetching location');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const getMarkerColor = (status: WasteSpot['status']) => {
    switch (status) {
      case 'REPORTED': return 'red';
      case 'CLAIMED': return 'orange';
      case 'CLEANED': return 'green';
      default: return 'red';
    }
  };

  const initialRegion: Region = {
    latitude: location?.coords.latitude || 16.0544,
    longitude: location?.coords.longitude || 108.2022,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <UrlTile
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
        
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            title={spot.title}
            pinColor={getMarkerColor(spot.status)}
          />
        ))}
      </MapView>

      <View style={styles.overlay}>
        <Text style={styles.title}>LitterMap</Text>
        {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
      </View>

      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  error: {
    color: 'red',
    marginTop: 5,
    fontSize: 12,
  },
  loader: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});