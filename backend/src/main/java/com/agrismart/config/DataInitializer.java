package com.agrismart.config;

import com.agrismart.entity.Farm;
import com.agrismart.entity.Role;
import com.agrismart.entity.User;
import com.agrismart.repository.FarmRepository;
import com.agrismart.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the database with a demo user and sample farm plots on first startup.
 * This ensures the dropdown menus (Recommendation, Action Plans, etc.) are
 * not empty when the demo user logs in for the first time.
 *
 * Idempotent: checks for existence before inserting to avoid duplicates
 * on subsequent restarts.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final FarmRepository farmRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           FarmRepository farmRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.farmRepository = farmRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedDemoUser();
    }

    private void seedDemoUser() {
        final String DEMO_EMAIL = "demo@smartfarm.com";

        // Ensure demo user exists
        User demoUser = userRepository.findByEmail(DEMO_EMAIL).orElseGet(() -> {
            log.info("Creating demo user: {}", DEMO_EMAIL);
            User u = new User();
            u.setName("Admin Farmer");
            u.setEmail(DEMO_EMAIL);
            u.setPassword(passwordEncoder.encode("password123"));
            u.setRole(Role.FARMER);
            return userRepository.save(u);
        });

        // Only seed farms if demo user has none
        if (farmRepository.findAllByOwner(demoUser).isEmpty()) {
            log.info("Seeding sample farms for demo user...");

            Farm farm1 = new Farm();
            farm1.setName("North Punjab Wheat Farm");
            farm1.setLocation("Amritsar, Punjab");
            farm1.setSizeInAcres(5.5);
            farm1.setLatitude(31.6340);
            farm1.setLongitude(74.8723);
            farm1.setSoilType("Loamy");
            farm1.setOwner(demoUser);
            farmRepository.save(farm1);

            Farm farm2 = new Farm();
            farm2.setName("Telangana Rice Plot");
            farm2.setLocation("Warangal, Telangana");
            farm2.setSizeInAcres(3.2);
            farm2.setLatitude(17.9784);
            farm2.setLongitude(79.5941);
            farm2.setSoilType("Clay");
            farm2.setOwner(demoUser);
            farmRepository.save(farm2);

            log.info("Seeded 2 sample farms for demo user.");
        } else {
            log.info("Demo user already has farms, skipping seed.");
        }
    }
}
