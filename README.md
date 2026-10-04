
# 🌾 Mini Crop — Smart Crop Farm Management System

A full-stack intelligent farming platform with ML-powered crop recommendations, resource tracking, irrigation planning, and action plan scheduling. Built for resource-constrained farmers to make data-driven decisions.

**🚀 Live Production Deployment:**
- **Frontend:** https://mini-crop.vercel.app
- **Backend API:** https://mini-crop-1.onrender.com/api
- **ML Service:** https://mini-crop-ml.onrender.com

---
# APP LINK : https://mini-crop.vercel.app

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [ML Model](#-ml-model)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Local Development Setup](#-local-development-setup)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based stateless authentication
- Role-based access control — `FARMER` and `ADMIN` roles
- Secure password hashing with BCrypt
- Auto token refresh and logout on 401

### 🌾 Farm Management
- Register and manage multiple farm plots
- Store farm details: area (acres), soil type, GPS coordinates (lat/lng)
- View detailed farm profiles with weather and resource snapshots

### 🤖 ML-Powered Crop Recommendation
- **Random Forest model** trained on 2,200 samples across **22 crop types**
- **99.55% test accuracy** on the Kaggle Crop Recommendation Dataset
- Input: N, P, K (soil nutrients), temperature, humidity, pH, rainfall
- Output: recommended crop, suitability score, profit estimate range
- Falls back to rule-based scoring if ML service is unreachable
- Full recommendation history per farm

### 💧 Irrigation Planning
- Calculate irrigation schedules based on farm parameters
- Store and retrieve irrigation plans per farm
- Water requirement computation

### 📦 Resource Tracking
- Track **Water**, **Budget (INR)**, and **Labour (man-hours)**
- Log allocations and usage per farm plot
- Live balance dashboard — remaining vs. used per resource type
- History log with per-entry annotations

### 📅 Action Plan Scheduler
- Create prioritized farming tasks with due dates (Priority 1/2/3)
- Mark tasks as `PENDING`, `COMPLETED`, or `REPLANNED`
- **Verify & Replan** — auto-detects resource deficits and replans overdue tasks
- Task history per farm

### 🌤️ Real-time Weather Integration
- Fetch live weather data per farm using GPS coordinates
- Displays temperature, humidity, wind speed, and condition
- Shown on Dashboard and Farm Detail pages

### 📊 Dashboard
- Farm count, total area, recommendation count at a glance
- Recent activity feed (recommendations + tasks)
- Resource summary (water, budget, labour remaining)
- Quick action buttons for all features

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool |
| React Router DOM | 7 | Client-side routing |
| Axios | 1.7 | HTTP client with JWT interceptor |
| React Hot Toast | 2.5 | Toast notifications |
| React Icons | 5.5 | Icon library (HeroIcons 2) |
| Vanilla CSS | — | Custom design system, dark theme |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 3.4.0 | Application framework |
| Spring Security | 6 | JWT auth + CORS |
| Spring Data JPA | — | ORM / database access |
| MySQL | 8 | Relational database |
| JJWT | — | JWT token generation/validation |
| RestTemplate | — | ML service HTTP client |
| Maven | — | Build tool |

### ML Service
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11.10 | Runtime |
| Flask | 3.0.3 | REST API server |
| scikit-learn | 1.5.1 | Random Forest model |
| pandas | 2.2.2 | Data handling |
| numpy | 1.26.4 | Numerical operations |
| joblib | 1.4.2 | Model serialization |

### Infrastructure
| Service | Platform | Purpose |
|---|---|---|
| Frontend | Vercel | CDN + static hosting |
| Backend | Render (Web Service) | Spring Boot JAR |
| ML Service | Render (Web Service) | Flask microservice |
| Database | Railway | Managed MySQL 8 |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Browser / Client                       │
│           https://mini-crop.vercel.app                   │
│              React + Vite (SPA)                         │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS + JWT
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Spring Boot Backend                         │
│        https://mini-crop-1.onrender.com/api              │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │   Auth   │  │  Farms   │  │Resources │  │ Plans  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│  ┌──────────────────┐  ┌─────────────────────────────┐  │
│  │  Crop Recommend. │  │   Irrigation / Weather      │  │
│  └────────┬─────────┘  └─────────────────────────────┘  │
└───────────┼──────────────────────────┬──────────────────┘
            │ HTTP (internal)          │ JPA
            ▼                          ▼
┌───────────────────────┐  ┌──────────────────────────────┐
│   ML Flask Service    │  │      MySQL Database           │
│  /predict  /health    │  │       (Railway)               │
│  Random Forest 99.55% │  └──────────────────────────────┘
└───────────────────────┘
```

---

## 🤖 ML Model

### Model Details
| Property | Value |
|---|---|
| Algorithm | Random Forest Classifier |
| Dataset | Kaggle Crop Recommendation Dataset |
| Training samples | 2,200 |
| Number of crops | 22 |
| Test accuracy | **99.55%** |
| Features | N, P, K, temperature, humidity, pH, rainfall |

### Supported Crops
`apple` · `banana` · `blackgram` · `chickpea` · `coconut` · `coffee` · `cotton` · `grapes` · `jute` · `kidneybeans` · `lentil` · `maize` · `mango` · `mothbeans` · `mungbean` · `muskmelon` · `orange` · `papaya` · `pigeonpeas` · `pomegranate` · `rice` · `watermelon`

### ML Service Endpoints
```
GET  /health    → service health check
POST /predict   → crop prediction
```

**Predict request body:**
```json
{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 20.87,
  "humidity": 82.0,
  "ph": 6.5,
  "rainfall": 202.9
}
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |

### Farms
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/farms` | ✅ | Get all farms for user |
| GET | `/api/farms/{id}` | ✅ | Get farm by ID |
| POST | `/api/farms` | ✅ | Create new farm |
| PUT | `/api/farms/{id}` | ✅ | Update farm |
| DELETE | `/api/farms/{id}` | ✅ | Delete farm |

### Crop Recommendations
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/recommendations` | ✅ | Get ML crop recommendation |
| GET | `/api/recommendations/farm/{farmId}` | ✅ | Get recommendation history |

### Irrigation
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/irrigation/plan` | ✅ | Calculate irrigation plan |
| GET | `/api/irrigation/farm/{farmId}` | ✅ | Get irrigation plans |

### Resources
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/resources/farm/{farmId}` | ✅ | Get resource logs |
| GET | `/api/resources/farm/{farmId}/summary` | ✅ | Get resource summary |
| POST | `/api/resources/farm/{farmId}` | ✅ | Add resource log |

### Action Plans
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/action-plans/farm/{farmId}` | ✅ | Get action plans |
| POST | `/api/action-plans/farm/{farmId}` | ✅ | Create action plan |
| PUT | `/api/action-plans/{planId}/status` | ✅ | Update plan status |
| POST | `/api/action-plans/farm/{farmId}/verify-replan` | ✅ | Verify & auto-replan |
| DELETE | `/api/action-plans/{planId}` | ✅ | Delete action plan |

### Weather
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/weather/{farmId}` | ✅ | Get weather for farm |

---

## 📁 Project Structure

```
Mini_Crop/
├── frontend/                          # React + Vite app (Vercel)
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   ├── context/                  # AuthContext (JWT state)
│   │   ├── pages/                    # Route pages
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── FarmDetail.jsx
│   │   │   ├── ResourcePage.jsx
│   │   │   ├── ActionPlanPage.jsx
│   │   │   └── ...
│   │   └── services/
│   │       └── api.js                # Centralized Axios instance
│   ├── .env.production               # VITE_API_URL for Vercel build
│   └── vercel.json                   # Vercel deployment config
│
├── backend/                          # Spring Boot (Render)
│   └── src/main/java/com/agrismart/
│       ├── config/
│       │   ├── CorsConfig.java       # CORS — allows Vercel origin
│       │   └── SecurityConfig.java   # JWT SecurityFilterChain
│       ├── controller/               # REST controllers
│       ├── service/                  # Business logic
│       ├── entity/                   # JPA entities
│       ├── repository/               # Spring Data repositories
│       ├── security/                 # JwtAuthFilter, JwtService
│       └── resources/
│           └── application.properties  # server.port=${PORT:8080}
│
├── ml_service/                       # Flask ML microservice (Render)
│   ├── app.py                        # Flask API (/predict, /health)
│   ├── train_model.py                # Model training script
│   ├── crop_model.joblib             # Trained Random Forest
│   ├── scaler.joblib                 # StandardScaler
│   ├── label_encoder.joblib          # LabelEncoder
│   ├── requirements.txt              # Python dependencies
│   └── .python-version               # 3.11.10
│
└── render.yaml                       # Render multi-service config
```

---

## 💻 Local Development Setup

### Prerequisites
- Java 21+
- Maven 3.9+
- Node.js 18+
- Python 3.11+
- MySQL 8+

### 1. Clone the Repository
```bash
git clone https://github.com/MSMADHUINIYA/Mini_Crop.git
cd Mini_Crop
```

### 2. Start the ML Service
```bash
cd ml_service
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

Verify:
```bash
curl http://localhost:5000/health
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"N":90,"P":42,"K":43,"temperature":20.87,"humidity":82.0,"ph":6.5,"rainfall":202.9}'
```

### 3. Set Up the Database
```bash
mysql -u root -p
CREATE DATABASE agrismart;
```

Create `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=agrismart
DB_USERNAME=root
DB_PASSWORD=your_password
JWT_SECRET=your_256bit_hex_secret
ML_SERVICE_URL=http://localhost:5000
```

### 4. Start the Backend
```bash
cd backend
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

### 5. Start the Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🔧 Environment Variables

### Backend (`backend/.env` or Render Environment)
| Variable | Description | Example |
|---|---|---|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `agrismart` |
| `DB_USERNAME` | Database user | `root` |
| `DB_PASSWORD` | Database password | `secret` |
| `JWT_SECRET` | 256-bit hex secret | `404E63...` |
| `ML_SERVICE_URL` | Flask ML service URL | `http://localhost:5000` |
| `PORT` | Server port (injected by Render) | `10000` |

### Frontend (`frontend/.env.production` / Vercel)
| Variable | Description | Value |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `https://mini-crop-1.onrender.com/api` |

### ML Service (Render Environment)
| Variable | Description | Value |
|---|---|---|
| `PYTHON_VERSION` | Python version | `3.11.10` |

---

## 🚀 Deployment

### Architecture Overview
| Service | Platform | Branch |
|---|---|---|
| Frontend | Vercel | `main` |
| Backend | Render | `main` |
| ML Service | Render | `main` |
| Database | Railway | — |

### Frontend — Vercel
- **Root Directory:** `frontend/`
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variable:** `VITE_API_URL=https://mini-crop-1.onrender.com/api`

### Backend — Render
- **Root Directory:** `backend`
- **Build Command:** `./mvnw clean package -DskipTests`
- **Start Command:** `java -jar target/backend-0.0.1-SNAPSHOT.jar`
- **Runtime:** Java
- **`server.port`:** `${PORT:8080}` (uses Render's injected PORT)

### ML Service — Render
- **Root Directory:** `ml_service`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `python app.py`
- **Runtime:** Python 3.11.10
- **Environment Variable:** `PYTHON_VERSION=3.11.10`

### render.yaml
The `render.yaml` at the repo root configures both Render services (backend + ML) in a single file for Blueprint deployments.

---

## 🔒 Security Notes

- All API endpoints (except `/api/auth/**`) require a valid JWT Bearer token
- Tokens expire after 24 hours (`86400000 ms`)
- CORS is restricted to:
  - `https://mini-crop.vercel.app` (production)
  - `http://localhost:5173` (local dev)
  - `http://localhost:3000` (local dev)
- Passwords are hashed with BCrypt
- Spring Security stateless session — no server-side session storage

---

## 👤 User Roles

| Role | Permissions |
|---|---|
| `FARMER` | Full access to own farms, recommendations, resources, plans |
| `ADMIN` | Access to `/api/admin/**` endpoints |

---

## 📦 Key Dependencies

### Backend (`pom.xml`)
- `spring-boot-starter-web`
- `spring-boot-starter-security`
- `spring-boot-starter-data-jpa`
- `mysql-connector-j`
- `jjwt-api`, `jjwt-impl`, `jjwt-jackson`

### Frontend (`package.json`)
- `react`, `react-dom`
- `react-router-dom`
- `axios`
- `react-hot-toast`
- `react-icons`

### ML Service (`requirements.txt`)
- `flask==3.0.3`
- `scikit-learn==1.5.1`
- `pandas==2.2.2`
- `numpy==1.26.4`
- `joblib==1.4.2`

---

## 🧪 Quick Production Test

```bash
# 1. Register a user
curl -X POST https://mini-crop-1.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Farmer","email":"test@farm.com","password":"secret123","role":"FARMER"}'

# 2. Login and get token
curl -X POST https://mini-crop-1.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@farm.com","password":"secret123"}'

# 3. Use the token to get farms
curl https://mini-crop-1.onrender.com/api/farms \
  -H "Authorization: Bearer <YOUR_TOKEN>"

# 4. Check ML service health
curl https://mini-crop-ml.onrender.com/health
```

---

## 📄 License

This project was built for academic purposes as part of a smart farming research paper.

---

*Built with ❤️ for smarter farming — Mini Crop © 2024*
