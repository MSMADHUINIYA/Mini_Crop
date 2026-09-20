package com.agrismart.controller;

import com.agrismart.entity.WeatherData;
import com.agrismart.service.WeatherService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weather")
@PreAuthorize("isAuthenticated()")
public class WeatherController {
    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/{farmId}")
    public ResponseEntity<WeatherData> getWeather(@PathVariable Long farmId,
                                                  @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(weatherService.getWeatherForFarm(farmId));
    }
}
