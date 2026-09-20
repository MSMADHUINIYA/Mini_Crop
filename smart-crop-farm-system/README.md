# Smart Crop Recommendation and Farm Management System

This is a comprehensive full-stack farm management and decision-support platform designed to help farmers with adaptive action-planning, especially focusing on resource-constrained scenarios (Water, Budget, Labour).

## Features

- **Resource-Constrained Adaptive Farm Planning:** Dynamically adjust farm plans based on limited resources.
- **Explainable Recommendations:** Transparent explanations for every system-generated decision.
- **Resource Management:** Track water, budget, and labour utilization.
- **Irrigation Planning:** Allocate water efficiently, adapting to weather and crop stage.
- **Action Verification & Replanning:** The system recalculates plans when actual resource usage deviates from expectations.
- **Weather Integration:** Incorporates weather forecasts for better farm management.
- **Profit Estimation:** Provides transparent ranges for estimated crop profitability.
- **Role-based Authentication:** Secure JWT-based access for `FARMER` and `ADMIN`.

## Architecture

- **Frontend**: React.js, Vite, Axios
- **Backend**: Java 21, Spring Boot 3.x, Spring Web, Spring Data JPA, Spring Security, JWT
- **Database**: MySQL 8
- **Optional ML Service**: Python 3.11, Flask (Candidate Crop Generator)

## Setup Instructions

1. **Clone the repository.**
2. **Database Setup:** Ensure MySQL 8 is running. Create a database named `agrismart` and configure credentials in `.env`.
3. **Backend:**
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```
4. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Environment Variables

Copy `.env.example` to `.env` in the root directory and update it with your real credentials. Do NOT commit the `.env` file to version control.
