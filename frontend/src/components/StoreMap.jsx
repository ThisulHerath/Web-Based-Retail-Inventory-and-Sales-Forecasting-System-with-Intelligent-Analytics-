import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { MapPin, Navigation, Loader, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useCallback } from 'react';

// Fix default marker icon issue in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom user location marker icon (blue)
const userMarkerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const STORE_COORDINATES = [6.709753, 80.065837];

const StoreMap = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [directionsUrl, setDirectionsUrl] = useState(
        'https://www.google.com/maps/dir/?api=1&destination=6.709753,80.065837'
    );

    const handleGetLocation = useCallback(() => {
        setLocationLoading(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                
                // Update directions URL with user's current location
                const googleMapsUrl = `https://www.google.com/maps/dir/${latitude},${longitude}/${STORE_COORDINATES[0]},${STORE_COORDINATES[1]}`;
                setDirectionsUrl(googleMapsUrl);
                setLocationLoading(false);
            },
            (error) => {
                let errorMessage = 'Unable to retrieve your location';
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMessage = 'Location information is unavailable.';
                } else if (error.code === error.TIMEOUT) {
                    errorMessage = 'Location request timeout.';
                }
                setLocationError(errorMessage);
                setLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, []);
    return (
        <section id="location" className="py-24 bg-[var(--color-bg-secondary)] relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-[var(--color-text-primary)] tracking-tight">Find Our Store</h2>
                    <p className="text-[var(--color-text-secondary)] mt-2 text-lg">Visit us at 7 Super City, Horana</p>
                </div>

                {/* Location Permission Alert */}
                {locationError && (
                    <div className="mb-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-800 dark:text-red-300">Location Error</h3>
                            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{locationError}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Map */}
                    <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-lg border border-[var(--color-border)] relative z-10" style={{ height: '450px' }}>
                        <MapContainer
                            center={userLocation ? [userLocation.lat, userLocation.lng] : STORE_COORDINATES}
                            zoom={userLocation ? 15 : 16}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={false}
                            zoomControl={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            
                            {/* User Location Marker */}
                            {userLocation && (
                                <Marker position={[userLocation.lat, userLocation.lng]} icon={userMarkerIcon}>
                                    <Popup>
                                        <div className="text-center p-2">
                                            <h3 className="font-bold text-gray-800 dark:text-gray-100">Your Location</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                                                {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                            
                            {/* Store Location Marker */}
                            <Marker position={STORE_COORDINATES}>
                                <Popup>
                                    <div className="text-center p-1">
                                        <h3 className="font-bold text-gray-800 dark:text-gray-100">7 Super City</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">6°42'35.1"N 80°03'57.0"E</p>
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Route Line between user and store */}
                            {userLocation && (
                                <Polyline
                                    positions={[
                                        [userLocation.lat, userLocation.lng],
                                        STORE_COORDINATES
                                    ]}
                                    color="rgb(var(--color-primary-500))"
                                    weight={3}
                                    opacity={0.7}
                                    dashArray="5, 5"
                                />
                            )}
                        </MapContainer>
                    </div>

                    {/* Store Info Card */}
                    <div className="bg-[var(--color-card-bg)] rounded-2xl shadow-lg p-8 border border-[var(--color-border)] flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg">
                                    <MapPin className="w-6 h-6 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--color-text-primary)]">7 Super City</h3>
                                    <p className="text-sm text-[var(--color-text-secondary)]">Retail Store</p>
                                </div>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">Address</h4>
                                    <p className="text-[var(--color-text-secondary)]">Horana - Anguruwatota - Mathugama - Aluthgama Road, Horana</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">Coordinates</h4>
                                    <p className="text-[var(--color-text-secondary)] font-mono text-xs">6°42'35.1"N 80°03'57.0"E</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">Opening Hours</h4>
                                    <div className="text-[var(--color-text-secondary)] space-y-0.5">
                                        <p>Mon - Sat: 8:00 AM - 9:00 PM</p>
                                        <p>Sunday: 8:00 AM - 6:00 PM</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">Contact</h4>
                                    <p className="text-[var(--color-text-secondary)]">+94 34 220 0000</p>
                                    <p className="text-[var(--color-text-secondary)]">hello@7supercity.lk</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            {/* Get Location Button */}
                            <button
                                onClick={handleGetLocation}
                                disabled={locationLoading}
                                className="flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors w-full border border-primary-500/50 shadow-md shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {locationLoading ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Getting Location...
                                    </>
                                ) : (
                                    <>
                                        <MapPin className="w-5 h-5" />
                                        {userLocation ? 'Update Location' : 'Get My Location'}
                                    </>
                                )}
                            </button>

                            {/* Get Directions Button */}
                            <a
                                href={directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors w-full"
                            >
                                <Navigation className="w-5 h-5" />
                                {userLocation ? 'Get Directions' : 'Get Directions (Generic)'}
                            </a>

                            {/* Location Status */}
                            {userLocation && (
                                <p className="text-xs text-center text-green-600 dark:text-green-400 font-semibold">
                                    ✓ Your location detected
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StoreMap;
