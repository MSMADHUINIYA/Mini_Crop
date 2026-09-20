package com.agrismart;

import com.agrismart.dto.request.LoginRequest;
import com.agrismart.dto.request.RegisterRequest;
import com.agrismart.dto.response.AuthResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthenticationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testSuccessfulRegistrationAndLogin() throws Exception {
        // 1. Register a Farmer
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setName("Test Farmer");
        registerReq.setEmail("farmer@test.com");
        registerReq.setPassword("password123");
        registerReq.setRole("FARMER");

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.role").value("FARMER"))
                .andReturn();

        String token = objectMapper.readValue(registerResult.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // 2. Duplicate Registration
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isConflict());

        // 3. Successful Login
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("farmer@test.com");
        loginReq.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());

        // 4. Wrong Password
        loginReq.setPassword("wrongpassword");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized());

        // 5. Test FARMER authorization
        mockMvc.perform(get("/api/farmer/test")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // 6. Test ADMIN endpoint access denied for FARMER
        mockMvc.perform(get("/api/admin/test")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        // 7. Test Missing JWT
        mockMvc.perform(get("/api/protected/test"))
                .andExpect(status().isForbidden());

        // 8. Test Invalid JWT
        mockMvc.perform(get("/api/protected/test")
                .header("Authorization", "Bearer " + token + "invalid"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminRegistrationAndAccess() throws Exception {
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setName("Test Admin");
        registerReq.setEmail("admin@test.com");
        registerReq.setPassword("password123");
        registerReq.setRole("ADMIN");

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String token = objectMapper.readValue(registerResult.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // Test ADMIN endpoint access granted
        mockMvc.perform(get("/api/admin/test")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
