

import React, { useState, useEffect, useCallback } from 'react';
import { useLoadScript } from '@react-google-maps/api';

import Map from './components/Map';
import Controls from './components/Controls';
import ResultsList from './components/ResultsList';
import ResultCard from './components/ResultCard';
import CuisineSuggestions from './components/CuisineSuggestions';
import LoadingOverlay from './components/LoadingOverlay';

import { AppResult } from './types';
import { suggestCuisines, generateRestaurantDetails } from './services/geminiService';

// FIX: Declared google as a global constant to resolve namespace errors for Google Maps types.
declare const google: any;

const libraries: "places"[] = ['places'];

// PERMANENT FIX: Hardcoded the API key to resolve persistent InvalidKeyMapError 
// in an environment that does not support process.env.
const API_KEY = "AIzaSyAxQ17KzCgWqbGvtxGqomTQYP56c8U-Eh4";

const App: React.FC = () => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: API_KEY!,
        libraries,
    });

    // FIX: Removed 'window.' prefix to resolve namespace error.
    // FIX: Replaced google.maps.Map with `any` to resolve namespace error.
    const [map, setMap] = useState<any | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>({ lat: 25.0330, lng: 121.5654 }); // Default to Taipei
    const [currentArea, setCurrentArea] = useState<string>('定位中...');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isCuisineLoading, setIsCuisineLoading] = useState(false);
    const [cuisineSuggestions, setCuisineSuggestions] = useState<string[]>([]);
    const [showCuisineSuggestions, setShowCuisineSuggestions] = useState(false);
    const [results, setResults] = useState<AppResult[]>([]);
    const [filteredResults, setFilteredResults] = useState<AppResult[]>([]);
    const [selectedResult, setSelectedResult] = useState<AppResult | null>(null);
    const [ratingFilter, setRatingFilter] = useState<number>(0); // 0 for all, 3 for 3+, 4 for 4+
    const [openNowFilter, setOpenNowFilter] = useState<boolean>(true);

    // FIX: Removed 'window.' prefix to resolve namespace error.
    // FIX: Replaced google.maps.Map with `any` to resolve namespace error.
    const mapRef = React.useRef<any | null>(null);

    // FIX: Removed 'window.' prefix to resolve namespace error.
    // FIX: Replaced google.maps.Map with `any` to resolve namespace error.
    const onLoad = useCallback((mapInstance: any) => {
        mapRef.current = mapInstance;
        setMap(mapInstance);
    }, []);

    const onUnmount = useCallback(() => {
        mapRef.current = null;
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ lat: latitude, lng: longitude });
                },
                (error) => {
                    console.error("Error getting user location:", error);
                    // Keep default location (Taipei)
                }
            );
        }
    }, []);
    
    useEffect(() => {
        if (isLoaded && currentLocation) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: currentLocation }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    // Find a suitable address component
                    const area = results[0].address_components.find(c => c.types.includes('locality') || c.types.includes('administrative_area_level_3'))?.long_name;
                    const district = results[0].address_components.find(c => c.types.includes('administrative_area_level_1'))?.long_name;
                    setCurrentArea(area && district ? `${district}, ${area}` : results[0].formatted_address);
                } else {
                    setCurrentArea('無法辨識位置');
                }
            });
        }
    }, [isLoaded, currentLocation]);
    
    useEffect(() => {
        let tempResults = [...results];

        if (openNowFilter) {
            tempResults = tempResults.filter(result => result.opening_hours?.open_now === true);
        }

        if (ratingFilter > 0) {
            tempResults = tempResults.filter(result => result.rating != null && result.rating >= ratingFilter);
        }

        setFilteredResults(tempResults);
    }, [results, ratingFilter, openNowFilter]);

    const handleSuggestCuisines = async () => {
        setShowCuisineSuggestions(true);
        setIsCuisineLoading(true);
        try {
            const suggestions = await suggestCuisines(currentArea);
            setCuisineSuggestions(suggestions);
        } catch (error) {
            console.error("Failed to fetch cuisine suggestions:", error);
            const defaultSuggestions = await suggestCuisines(currentArea); // This will return defaults from the service
            setCuisineSuggestions(defaultSuggestions);
        } finally {
            setIsCuisineLoading(false);
        }
    };
    
    const searchNearby = useCallback(async (query: string) => {
        if (!map || !map.getBounds()) return;
        
        setIsLoading(true);
        setLoadingMessage(`正在尋找 ${query}...`);
        setResults([]);
        setSelectedResult(null);
        setShowCuisineSuggestions(false);
        setRatingFilter(0);
        setOpenNowFilter(true);
        
        const placesService = new google.maps.places.PlacesService(map);
        // FIX: Switched from location+radius to map bounds for more relevant results.
        // FIX: Removed google.maps.places.PlaceSearchRequest type annotation to resolve namespace error.
        const request = {
            bounds: map.getBounds()!,
            type: 'restaurant',
            keyword: query,
        };
        
        placesService.nearbySearch(request, async (placeResults, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && placeResults) {
                
                // FIX: Sort results by rating in descending order.
                placeResults.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

                // Don't pre-filter by open_now. Slice to prevent too many API calls.
                const topResults = placeResults.slice(0, 10);
                
                if (topResults.length === 0) {
                    setIsLoading(false);
                    alert(`在此區域找不到 ${query} 餐廳。`);
                    return;
                }
                
                setLoadingMessage("AI 正在為您產生餐廳介紹...");

                const detailedResults: AppResult[] = await Promise.all(
                    topResults.map(async (place) => {
                        // Promise to get detailed place info from Google
                        const placeDetailsPromise = new Promise<any>((resolve) => {
                            const detailsService = new google.maps.places.PlacesService(map);
                            const request = {
                                placeId: place.place_id!,
                                fields: ['opening_hours', 'website', 'reservable', 'reviews'],
                            };
                            detailsService.getDetails(request, (result, status) => {
                                if (status === google.maps.places.PlacesServiceStatus.OK && result) {
                                    resolve(result);
                                } else {
                                    console.error(`Place Details request failed for ${place.name} with status: ${status}`);
                                    resolve({}); // Resolve with empty object on failure
                                }
                            });
                        });
                        
                        // Promise to get AI-generated description
                        const aiDetailsPromise = generateRestaurantDetails(place.name!, place.vicinity!);
                        
                        // Await both promises
                        const [placeDetails, aiDetails] = await Promise.all([placeDetailsPromise, aiDetailsPromise]);

                        return {
                            place_id: place.place_id,
                            name: place.name || 'N/A',
                            details: aiDetails,
                            photoUrl: place.photos?.[0]?.getUrl(),
                            rating: place.rating,
                            user_ratings_total: place.user_ratings_total,
                            vicinity: place.vicinity,
                            geometry: place.geometry,
                            opening_hours: placeDetails.opening_hours || place.opening_hours,
                            website: placeDetails.website,
                            reservable: placeDetails.reservable,
                            reviews: placeDetails.reviews,
                        };
                    })
                );
                
                setResults(detailedResults);
            } else {
                alert(`搜尋 "${query}" 時發生錯誤: ${status}`);
            }
            setIsLoading(false);
            setLoadingMessage('');
        });
    }, [map]);

    const handleSelectCuisine = (cuisine: string) => {
        searchNearby(cuisine);
    };

    const handleFeelingLucky = () => {
        searchNearby("午餐");
    };

    const handleResultSelect = (result: AppResult) => {
        setSelectedResult(result);
        if (result.geometry?.location && map) {
            map.panTo(result.geometry.location);
            map.setZoom(17); // Zoom in for a closer look
        }
    };

    if (loadError) return <div>地圖載入失敗: {loadError.message}</div>;
    if (!isLoaded) return <LoadingOverlay />;

    return (
        <div className="relative w-screen h-screen">
            <Map 
                center={currentLocation}
                onLoad={onLoad}
                onUnmount={onUnmount}
                results={filteredResults}
                onMarkerClick={handleResultSelect}
                selectedResult={selectedResult}
            />
            <Controls 
                onSuggestCuisines={handleSuggestCuisines}
                onFeelingLucky={handleFeelingLucky}
                currentArea={currentArea}
                isLoading={isLoading || !map}
                loadingMessage={loadingMessage}
            />
            {showCuisineSuggestions && (
                <CuisineSuggestions
                    suggestions={cuisineSuggestions}
                    onSelect={handleSelectCuisine}
                    onClose={() => setShowCuisineSuggestions(false)}
                    isLoading={isCuisineLoading}
                />
            )}
            {results.length > 0 && !selectedResult && (
                <ResultsList 
                    results={filteredResults}
                    onResultSelect={handleResultSelect}
                    onClose={() => setResults([])}
                    ratingFilter={ratingFilter}
                    openNowFilter={openNowFilter}
                    onRatingChange={setRatingFilter}
                    onOpenNowChange={setOpenNowFilter}
                />
            )}
            {selectedResult && (
                <ResultCard 
                    result={selectedResult}
                    onClose={() => setSelectedResult(null)}
                />
            )}
            {isLoading && <LoadingOverlay />}
        </div>
    );
};

export default App;