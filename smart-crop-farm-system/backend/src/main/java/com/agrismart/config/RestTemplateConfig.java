package com.agrismart.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        // NOTE: Spring Boot 3.4+ deprecated setConnectTimeout/setReadTimeout in
        // favor of connectTimeout/readTimeout (no "set" prefix). Using the
        // current API to match this project's Spring Boot 3.4.0 parent POM.
        return builder
                .connectTimeout(Duration.ofSeconds(3))
                .readTimeout(Duration.ofSeconds(5))
                .build();
    }
}
