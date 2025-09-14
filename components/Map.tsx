import React from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { AppResult } from '../types';

// FIX: Declared google as a global constant to resolve namespace errors for Google Maps types.
declare const google: any;

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// FIX: Removed 'window.' prefix to resolve namespace error.
// FIX: Removed google.maps.MapOptions type annotation to resolve namespace error.
const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [ // Dark mode style
      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
      },
      {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
      },
      {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
      },
      {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
      },
      {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
      },
    ],
};

interface MapProps {
    center: { lat: number; lng: number };
    // FIX: Removed 'window.' prefix to resolve namespace error.
    // FIX: Replaced google.maps.Map with `any` to resolve namespace error.
    onLoad: (map: any) => void;
    onUnmount: () => void;
    results: AppResult[];
    onMarkerClick: (result: AppResult) => void;
    selectedResult: AppResult | null;
}

const Map: React.FC<MapProps> = ({ center, onLoad, onUnmount, results, onMarkerClick, selectedResult }) => {
    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={15}
            options={mapOptions}
            onLoad={onLoad}
            onUnmount={onUnmount}
        >
            {results.map((result) => (
                result.geometry?.location &&
                <Marker
                    key={result.place_id}
                    position={result.geometry.location}
                    onClick={() => onMarkerClick(result)}
                    icon={{
                        url: selectedResult?.place_id === result.place_id 
                          ? 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' 
                          : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    }}
                />
            ))}
        </GoogleMap>
    );
};

export default Map;