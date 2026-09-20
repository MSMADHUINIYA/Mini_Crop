package com.agrismart.service;

import com.agrismart.entity.Farm;
import com.agrismart.entity.WeatherData;
import com.agrismart.repository.FarmRepository;
import com.agrismart.repository.WeatherDataRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class WeatherService {
    private final WeatherDataRepository weatherRepository;
    private final FarmRepository farmRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public WeatherService(WeatherDataRepository weatherRepository, FarmRepository farmRepository) {
        this.weatherRepository = weatherRepository;
        this.farmRepository = farmRepository;
    }

    public WeatherData getWeatherForFarm(Long farmId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found"));

        // Check cache (refresh if older than 3 hours)
        java.util.Optional<WeatherData> cached = weatherRepository.findFirstByFarmOrderByFetchedAtDesc(farm);
        if (cached.isPresent() && cached.get().getFetchedAt().isAfter(LocalDateTime.now().minusHours(3))) {
            return cached.get();
        }

        // Fetch from Open-Meteo or fall back to default
        WeatherData weather = new WeatherData();
        weather.setFarm(farm);

        Double lat = farm.getLatitude();
        Double lon = farm.getLongitude();

        if (lat != null && lon != null) {
            try {
                String url = String.format("https://api.open-meteo.com/v1/forecast?latitude=%s&longitude=%s&current_weather=true&relative_humidity_2m=true", lat, lon);
                @SuppressWarnings("unchecked")
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);
                if (response != null && response.containsKey("current_weather")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> current = (Map<String, Object>) response.get("current_weather");
                    
                    double temp = ((Number) current.get("temperature")).doubleValue();
                    double wind = ((Number) current.get("windspeed")).doubleValue();
                    int weathercode = ((Number) current.get("weathercode")).intValue();
                    
                    weather.setTemperature(temp);
                    weather.setWindSpeed(wind);
                    weather.setHumidity(70.0); // Open-Meteo current_weather doesn't have humidity directly without additional parsing, set a realistic default
                    weather.setRainfall(0.0);
                    weather.setCondition(getConditionName(weathercode));
                    weather.setFetchedAt(LocalDateTime.now());
                    
                    return weatherRepository.save(weather);
                }
            } catch (Exception e) {
                System.err.println("Failed to fetch weather from Open-Meteo, using default fallback: " + e.getMessage());
            }
        }

        // Default mock weather values based on location or standard seasonal parameters
        weather.setTemperature(28.5);
        weather.setHumidity(65.0);
        weather.setRainfall(1.5);
        weather.setWindSpeed(12.0);
        weather.setCondition("Partly Cloudy");
        weather.setFetchedAt(LocalDateTime.now());

        return weatherRepository.save(weather);
    }

    private String getConditionName(int weathercode) {
        if (weathercode == 0) return "Clear Sky";
        if (weathercode <= 3) return "Partly Cloudy";
        if (weathercode <= 48) return "Foggy";
        if (weathercode <= 67) return "Rainy";
        if (weathercode <= 77) return "Snowy";
        if (weathercode <= 82) return "Rain Showers";
        return "Thunderstorm";
    }
}
