# Run Guide — ML-Integrated Smart Crop Farm System

This document explains how to run the updated system end-to-end and what
to verify before you rely on it for your paper / demo. It also lists
everything I could NOT verify myself (network restrictions on my side)
so you know exactly what to double-check.

## What changed vs. the original zip

1. **`ml_service/`** (new) — Python/Flask microservice serving a trained
   Random Forest model (99.55% test accuracy) on the standard Kaggle
   crop-recommendation dataset (2,200 samples, 22 crops).
   - `train_model.py` — trains & compares 5 classifiers, saves the best one.
   - `app.py` — Flask API (`/predict`, `/health`) serving the trained model.
   - `crop_model.joblib`, `scaler.joblib`, `label_encoder.joblib` — trained
     artifacts (already generated; you don't have to retrain, but you can).
   - `model_comparison_results.csv`, `feature_importances.json`,
     `confusion_matrix.csv`, `classification_report.json` — results used
     directly in the paper draft.

2. **Backend (`backend/src/main/java/...`)**
   - `service/CropRecommendationService.java` — rewritten to call the
     Flask `/predict` endpoint first, and only fall back to the original
     rule-based scorer if the ML service is unreachable.
   - `config/RestTemplateConfig.java` — new bean, 3s connect / 5s read
     timeout so a dead ML service fails fast into the fallback path.
   - `dto/response/MlPredictionResponse.java` — new DTO matching the
     Flask JSON response shape.
   - `application.properties` — added `app.ml.service-url` (reads
     `ML_SERVICE_URL` from your `.env`, already set to
     `http://localhost:5000`).

3. **Frontend / DB schema / everything else** — untouched. The response
   shape (`cropName`, `suitabilityScore`, `explanation`,
   `estimatedProfitMin/Max`) is identical to before, so
   `RecommendationPage.jsx` needs no changes.

## How to run it (in order)

```bash
# 1. Start MySQL and make sure your .env has real DB credentials

# 2. Start the ML microservice (from ml_service/)
cd ml_service
pip install scikit-learn pandas numpy joblib flask
python app.py
# should print "Running on http://0.0.0.0:5000"
curl http://localhost:5000/health   # sanity check

# 3. Start the backend (from backend/)
cd ../backend
mvn clean install
mvn spring-boot:run

# 4. Start the frontend (from frontend/)
cd ../frontend
npm install
npm run dev
```

## ⚠️ What I could NOT verify myself

My sandbox can only reach a fixed allow-list of domains (npm, pypi,
GitHub, etc.) — **not** `repo.maven.apache.org`. This means:

- **I could not run `mvn compile` / `mvn test` on the backend.** I
  reviewed the new/changed Java files manually (brace/paren balance,
  method signatures against the controller and DTOs, Spring Boot 3.4
  API compatibility for `RestTemplateBuilder`), and I'm fairly
  confident it compiles, but **you must run `mvn clean install`
  yourself and fix anything I missed** before treating this as final.
- I could not start MySQL or run the Spring context, so I couldn't
  confirm `contextLoads()` and the auth integration test still pass
  — they *should* be unaffected (no changes touched auth), but verify.
- I trained and tested the ML model and Flask service directly in my
  sandbox — **that part is fully verified and working** (see
  `ml_service/model_comparison_results.csv` for real numbers).

## Quick end-to-end sanity test (after starting all 3 services)

```bash
curl -X POST http://localhost:5000/predict -H "Content-Type: application/json" \
  -d '{"N":90,"P":42,"K":43,"temperature":20.87,"humidity":82.0,"ph":6.5,"rainfall":202.9}'
# should return recommendedCrop: "rice", confidence ~93%
```

Then in the app: log in as a FARMER, go to Recommendation page, submit
the same values for a registered farm, and confirm the result now shows
a Random-Forest-backed prediction (check the backend log — you should
see no "ML service unreachable" warning).

## For the paper

- `Crop_Recommendation_Paper_Draft.docx` — full draft, ready to adapt
  to your conference's template.
- **Before submitting:** fill in author names/affiliation, verify
  references [2],[3],[5]-[8] (marked "VERIFY" in the doc — I could
  confirm the reported accuracy figures from source pages, but not the
  complete author lists / volume-issue numbers from search snippets
  alone), and run it through your institution's plagiarism checker
  (iThenticate/Turnitin) since most Scopus-indexed conferences require
  a similarity report at submission.
- If you retrain the model or change thresholds, the accuracy/figures
  in the paper will need to be regenerated (`train_model.py` prints and
  saves everything used in Tables I, and Figs. 2-4).
