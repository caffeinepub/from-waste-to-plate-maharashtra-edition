import { useEffect, useState } from "react";

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: true,
    error: null,
    permissionDenied: false,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation not supported",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loading: false,
          error: null,
          permissionDenied: false,
        });
      },
      (err) => {
        setState({
          latitude: null,
          longitude: null,
          loading: false,
          error: err.message,
          permissionDenied: err.code === err.PERMISSION_DENIED,
        });
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  return state;
}
