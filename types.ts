// FIX: Replaced google.maps.LatLng with its expected structure to resolve namespace error.
export interface AppResult {
    place_id?: string;
    name: string;
    details: string;
    photoUrl?: string;
    rating?: number;
    user_ratings_total?: number;
    vicinity?: string; // This is typically the address
    geometry?: {
      location: { lat: () => number; lng: () => number; };
    };
    opening_hours?: {
        open_now?: boolean;
        weekday_text?: string[];
    };
    reservable?: boolean;
    website?: string;
}
