"""
Flask ML Inference Service - Crop Recommendation
=================================================
Serves predictions from the trained Random Forest model. Called by the
Spring Boot backend (CropRecommendationService) via ML_SERVICE_URL.

Run:  python app.py   (listens on port 5000, matches .env ML_SERVICE_URL default)
"""

import json

import joblib
import numpy as np
from flask import Flask, jsonify, request

app = Flask(__name__)

model = joblib.load("crop_model.joblib")
scaler = joblib.load("scaler.joblib")
encoder = joblib.load("label_encoder.joblib")

with open("model_meta.json") as f:
    META = json.load(f)

with open("feature_importances.json") as f:
    FEATURE_IMPORTANCE = json.load(f)

FEATURES = META["features"]  # ["N","P","K","temperature","humidity","ph","rainfall"]


def build_explanation(input_dict, predicted_crop, confidence, top3):
    """Generate a human-readable, feature-importance-grounded explanation."""
    reasons = []
    # Rank the input's features by global model importance and comment on
    # whether each is a strong or weak driver of this specific prediction.
    ranked = sorted(FEATURE_IMPORTANCE.items(), key=lambda x: -x[1])[:3]
    for feat, importance in ranked:
        val = input_dict.get(feat)
        reasons.append(
            f"{feat} (value={val}, global importance={importance:.2f}) was among the "
            f"most influential factors driving this recommendation."
        )
    explanation = (
        f"Model recommends '{predicted_crop}' with {confidence:.1f}% confidence. "
        + " ".join(reasons)
        + f" Alternative candidates considered: {', '.join(c['crop'] for c in top3[1:])}."
    )
    return explanation


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": META["best_model"], "test_accuracy": META["test_accuracy"]})


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)

    missing = [f for f in FEATURES if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        x = np.array([[float(data[f]) for f in FEATURES]])
    except (ValueError, TypeError):
        return jsonify({"error": "All feature values must be numeric"}), 400

    x_scaled = scaler.transform(x)
    probs = model.predict_proba(x_scaled)[0]

    top_idx = np.argsort(probs)[::-1][:3]
    top3 = [
        {"crop": encoder.inverse_transform([i])[0], "confidence": round(float(probs[i]) * 100, 2)}
        for i in top_idx
    ]

    predicted_crop = top3[0]["crop"]
    confidence = top3[0]["confidence"]

    input_dict = {f: data[f] for f in FEATURES}
    explanation = build_explanation(input_dict, predicted_crop, confidence, top3)

    return jsonify({
        "recommendedCrop": predicted_crop,
        "confidence": confidence,
        "explanation": explanation,
        "topCandidates": top3,
        "modelUsed": META["best_model"],
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
