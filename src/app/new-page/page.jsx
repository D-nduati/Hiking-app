"use client";
import React from "react";

function MainComponent() {
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [fitnessLevel, setFitnessLevel] = useState(3);

  // Get user's location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setError(
            "Could not get your location. Some features may be limited."
          );
        }
      );
    }
  }, []);

  // Fetch trails
  useEffect(() => {
    const fetchTrails = async () => {
      try {
        const response = await fetch("/api/trails/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fitnessLevel }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch trails");
        }

        const data = await response.json();
        setTrails(data.trails);
      } catch (err) {
        console.error("Error fetching trails:", err);
        setError("Could not load trails. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrails();
  }, [fitnessLevel]);

  // Fetch weather when location is available
  useEffect(() => {
    const fetchWeather = async () => {
      if (!userLocation) return;

      try {
        const response = await fetch(
          `/integrations/weather-by-city/weather/${userLocation.latitude},${userLocation.longitude}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }
        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        console.error("Error fetching weather:", err);
      }
    };

    fetchWeather();
  }, [userLocation]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 rounded-lg shadow-lg mb-6">
        <h1 className="text-2xl font-bold">TrailFinder AI</h1>
        <p className="text-sm">Your personal hiking companion</p>
      </div>

      {/* Weather Info */}
      {weatherData && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Current Weather</h2>
          <div className="flex items-center">
            <img
              src={weatherData.current.condition.icon}
              alt={weatherData.current.condition.text}
              className="w-12 h-12"
            />
            <div className="ml-4">
              <p className="text-xl">{weatherData.current.temp_c}°C</p>
              <p className="text-gray-600">
                {weatherData.current.condition.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fitness Level Selector */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Your Fitness Level</h2>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => setFitnessLevel(level)}
              className={`w-10 h-10 rounded-full ${
                fitnessLevel === level
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Trails List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-10">
            Loading trails...
          </div>
        ) : (
          trails.map((trail) => (
            <div
              key={trail.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{trail.name}</h3>
                <p className="text-gray-600 mb-2">{trail.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Length: {trail.length_km}km</span>
                  <span>Elevation: {trail.elevation_gain_m}m</span>
                </div>
                <div className="mt-2 flex items-center">
                  <span className="text-sm text-gray-600 mr-2">
                    Difficulty:
                  </span>
                  <div className="flex">
                    {[...Array(trail.difficulty)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MainComponent;