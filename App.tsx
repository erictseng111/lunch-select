import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import Map from './components/Map';
import Controls from './components/Controls';
import ResultsList from './components/ResultsList';
import ResultCard from './components/ResultCard';
import CuisineSuggestions from './components/CuisineSuggestions';
import LoadingOverlay from './components/LoadingOverlay';
import { suggestCuisines, generateRestaurantDetails } from './services/geminiService';
import { AppResult } from './types';

const DEFAULT_CENTER = { lat: 25.0330, lng: 121.5654 }; // Taipei
const DEFAULT_AREA = "台北市";
const libraries: ("places" | "geocoding")[] = ["places", "geocoding"];

const App: React.FC = () => {
    // FIX: Hardcoded API key to resolve persistent InvalidKeyMapError in this environment.
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyAxQ17KzCgWqbGvtxGqomTQYP56c8U-Eh4',
        libraries,
    });

    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>(DEFAULT_CENTER);
    const [currentArea, setCurrentArea] = useState<string>(DEFAULT_AREA);
    const [results, setResults] = useState<AppResult[]>([]);
    const [selectedResult, setSelectedResult] = useState<AppResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('載入地圖資源...');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cuisineSuggestions, setCuisineSuggestions] = useState<string[]>([]);
  
    const placesServiceRef = useRef<any | null>(null);
  
    useEffect(() => {
        if (isLoaded) {
            setLoadingMessage('取得您目前的位置...');
            const dummyDiv = document.createElement('div');
            placesServiceRef.current = new (window as any).google.maps.places.PlacesService(dummyDiv);
            
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const pos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };
                setCurrentLocation(pos);
                
                const geocoder = new (window as any).google.maps.Geocoder();
                geocoder.geocode({ location: pos }, (results: any, status: string) => {
                  if (status === 'OK' && results?.[0]) {
                    const address = results[0].address_components;
                    const area = address.find((c: any) => c.types.includes('administrative_area_level_2'))?.long_name || 
                                 address.find((c: any) => c.types.includes('locality'))?.long_name || 
                                 DEFAULT_AREA;
                    setCurrentArea(area);
                  }
                  setIsLoading(false);
                  setLoadingMessage('');
                });
              },
              () => {
                setIsLoading(false);
                setLoadingMessage('');
                alert('無法取得您的位置，將使用預設地點。');
              }, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
              }
            );
        }
    }, [isLoaded]);

    const getPlaceDetails = useCallback((placeId: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            if (!placesServiceRef.current) {
                return reject("Places service not initialized");
            }
            const request = {
                placeId,
                fields: ['name', 'rating', 'user_ratings_total', 'photo', 'vicinity', 'formatted_address', 'geometry', 'opening_hours', 'reservable', 'place_id'],
            };
            placesServiceRef.current.getDetails(request, (place: any, status: string) => {
                if (status === 'OK') {
                    resolve(place);
                } else {
                    reject(`Failed to get place details: ${status}`);
                }
            });
        });
    }, []);
  
    const searchPlaces = useCallback(async (query: string) => {
      if (!isLoaded || !placesServiceRef.current) {
        alert("地圖服務尚未準備好，請稍後再試。");
        return;
      }
      
      setIsLoading(true);
      setLoadingMessage(`正在搜尋「${query}」...`);
      setResults([]);
      setSelectedResult(null);
  
      const request: any = {
        query: `${query} in ${currentArea}`,
        location: currentLocation,
        radius: 5000,
        type: 'restaurant',
      };
  
      placesServiceRef.current.textSearch(request, async (placeResults: any[], status: string) => {
        if (status === 'OK' && placeResults?.length) {
            setLoadingMessage('正在取得餐廳詳細資訊...');
            try {
                const detailedResultPromises = placeResults
                    .filter(p => p.place_id)
                    .slice(0, 5) // Limit to top 5
                    .map(place => getPlaceDetails(place.place_id));
                
                const detailedPlaces = await Promise.all(detailedResultPromises);

                const initialResults: AppResult[] = detailedPlaces.map(details => ({
                    place_id: details.place_id,
                    name: details.name!,
                    details: details.vicinity || details.formatted_address || '', // Use address as placeholder
                    photoUrl: details.photos?.[0]?.getUrl(),
                    rating: details.rating,
                    user_ratings_total: details.user_ratings_total,
                    vicinity: details.vicinity || details.formatted_address,
                    geometry: details.geometry,
                    opening_hours: details.opening_hours,
                    reservable: details.reservable,
                }));
                
                setResults(initialResults);
            } catch (error) {
                console.error("Error fetching initial detailed results:", error);
                alert('取得餐廳基本資訊時發生錯誤。');
            }
        } else {
          alert('找不到附近的餐廳，請嘗試其他選項。');
        }
        setIsLoading(false);
        setLoadingMessage('');
      });
    }, [isLoaded, currentArea, currentLocation, getPlaceDetails]);
  
    const handleSuggestCuisines = async () => {
      setIsLoading(true);
      setLoadingMessage('AI 正在為您推薦菜色...');
      setShowSuggestions(true);
      const suggestions = await suggestCuisines(currentArea);
      setCuisineSuggestions(suggestions);
      setIsLoading(false);
      setLoadingMessage('');
    };
  
    const handleFeelingLucky = () => {
      const luckyCuisines = ["日式料理", "台式料理", "美式料理", "義式料理", "泰式料理", "韓式料理", "小火鍋", "速食", "咖啡廳"];
      const randomCuisine = luckyCuisines[Math.floor(Math.random() * luckyCuisines.length)];
      searchPlaces(randomCuisine);
    };
  
    const handleCuisineSelect = (cuisine: string) => {
      setShowSuggestions(false);
      setCuisineSuggestions([]);
      searchPlaces(cuisine);
    };
    
    const handleResultSelect = async (result: AppResult) => {
      // Show the card immediately with a loading state for the AI summary
      setSelectedResult({ ...result, details: 'AI 總覽生成中...' });
    
      if (result.geometry?.location) {
        setCurrentLocation({
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng()
        });
      }
    
      try {
        // Generate the AI summary on-demand
        const aiSummary = await generateRestaurantDetails(result.name, result.vicinity || '');
        // Update the selected result with the fetched summary
        setSelectedResult(prev => prev ? { ...prev, details: aiSummary } : null);
      } catch (error) {
        console.error("Error generating on-demand AI summary:", error);
        setSelectedResult(prev => prev ? { ...prev, details: '無法產生 AI 總覽，請稍後再試。' } : null);
      }
    };
  
    if (loadError) {
        return <div className="w-screen h-screen bg-gray-900 text-white flex items-center justify-center">Error loading maps. Check API key and network.</div>;
    }
  
    return (
      <div className="w-screen h-screen bg-gray-900 text-white font-sans overflow-hidden">
        {isLoaded ? (
          <>
            <Map 
              center={currentLocation} 
              results={results} 
              selectedResult={selectedResult} 
              onMarkerClick={handleResultSelect} 
            />
            <Controls 
              onSuggestCuisines={handleSuggestCuisines}
              onFeelingLucky={handleFeelingLucky}
              currentArea={currentArea}
              isLoading={isLoading && !showSuggestions}
              loadingMessage={loadingMessage}
            />
    
            {showSuggestions && (
              <CuisineSuggestions
                suggestions={cuisineSuggestions}
                onSelect={handleCuisineSelect}
                onClose={() => setShowSuggestions(false)}
                isLoading={isLoading}
              />
            )}
    
            {results.length > 0 && !selectedResult && (
              <ResultsList
                results={results}
                onResultSelect={handleResultSelect}
                onClose={() => setResults([])}
              />
            )}
    
            {selectedResult && (
              <ResultCard
                result={selectedResult}
                onClose={() => setSelectedResult(null)}
              />
            )}
            
            {isLoading && !showSuggestions && results.length === 0 && <LoadingOverlay />}
          </>
        ) : <LoadingOverlay message={loadingMessage} />}
      </div>
    );
  };
  
  export default App;