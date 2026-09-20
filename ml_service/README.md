# Crop Recommendation ML Microservice

Flask inference service that plugs into the existing Spring Boot backend's
`CropRecommendationService` (which already calls `POST {ML_SERVICE_URL}/predict`
and falls back to the rule-based scorer if this service is unreachable).

## Dataset

`crop_dataset.csv` is the **standard public "Crop Recommendation Dataset"**
(N, P, K, temperature, humidity, ph, rainfall -> 22 crop labels, 2200 rows),
originally compiled by Atharva Ingle and widely used as an agricultural
ML benchmark. **Cite this dataset explicitly in your paper's Dataset
section** — do not present it as data you collected yourself. A citation
along these lines is standard:

> Ingle, A. "Crop Recommendation Dataset." Kaggle, 2020.
> https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset

If your institution/conference requires primary data collection, consider
supplementing this with a small locally-collected validation set (even
20-30 real samples from known farms) and reporting both benchmark and
local validation accuracy — this substantially strengthens a paper's
contribution claim beyond "we ran an existing dataset through RF."

## What's included

| File | Purpose |
|---|---|
| `train_model.py` | Trains & compares 5 classifiers (Decision Tree, KNN, SVM, Random Forest, Gradient Boosting), picks the best, saves it |
| `app.py` | Flask service exposing `/predict` and `/health`, matching the exact JSON contract your Java `MlPredictionResponse` DTO expects |
| `crop_model.joblib`, `scaler.joblib`, `label_encoder.joblib` | Trained artifacts (already trained — Random Forest, 99.55% test accuracy) |
| `model_comparison_results.csv` | Model comparison table — **drop this straight into your paper's Results section** |
| `classification_report.json` | Per-class precision/recall/F1 |
| `confusion_matrix.csv` | For a confusion-matrix figure |
| `feature_importances.json` | Which of N/P/K/temp/humidity/ph/rainfall drive predictions most — feeds the "explainable" claim |

## Running it

```bash
cd ml_service
pip install -r requirements.txt

# Model is already trained. To retrain from scratch:
python train_model.py

# Start the service (must be running before/alongside the Spring Boot backend)
python app.py
```

Runs on port 5000 by default, matching `ML_SERVICE_URL=http://localhost:5000`
already set in your `.env` / `application.properties`. No backend code
changes needed — `CropRecommendationService.recommend()` will now hit this
real model instead of falling back to the rule-based scorer.

## Verified working

```bash
curl -X POST http://localhost:5000/predict -H "Content-Type: application/json" \
  -d '{"N":90,"P":42,"K":43,"temperature":20.8,"humidity":82,"ph":6.5,"rainfall":202}'
# -> {"recommendedCrop":"rice","confidence":93.5,...}
```

## For your paper: results to report

- **Test accuracy: 99.55%**, macro F1 99.55% (Random Forest, best of 5 models compared)
- 5-fold cross-validation: 99.43% ± 0.54% (shows it's not overfit to one split)
- Full model comparison table in `model_comparison_results.csv` — good for
  a "we compared 5 algorithms" table, standard in this literature
- Feature importance ranking → supports the "explainable recommendation" claim
  in your README, since you can now say the explanation is *grounded in
  the model's actual learned importances*, not a hardcoded template

## Honest framing note

The rule-based scorer in `CropRecommendationService.java` still exists as
a fallback for when this service is down — that's a legitimate resilience
design pattern, worth mentioning in the paper as "graceful degradation,"
not something to hide. Just make sure your paper's abstract/methodology
describes the **primary path** (trained RF model) accurately, and doesn't
imply the fallback rule-based method IS the ML method.
