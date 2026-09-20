"""
Crop Recommendation Model Training
====================================
Trains and compares multiple ML classifiers (Random Forest, XGBoost-like
Gradient Boosting, SVM, KNN, Decision Tree) on the standard Kaggle Crop
Recommendation dataset (N, P, K, temperature, humidity, ph, rainfall -> crop).

Saves the best model + scaler + label encoder for use by the Flask
inference service (app.py), and prints a results table suitable for
inclusion in a paper.
"""

import json
import time

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import (accuracy_score, classification_report,
                              confusion_matrix, f1_score, precision_score,
                              recall_score)
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

RANDOM_STATE = 42

df = pd.read_csv("crop_dataset.csv")
FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
TARGET = "label"

X = df[FEATURES].values
y_raw = df[TARGET].values

encoder = LabelEncoder()
y = encoder.fit_transform(y_raw)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

models = {
    "Decision Tree": DecisionTreeClassifier(random_state=RANDOM_STATE),
    "KNN": KNeighborsClassifier(n_neighbors=5),
    "SVM (RBF)": SVC(kernel="rbf", probability=True, random_state=RANDOM_STATE),
    "Random Forest": RandomForestClassifier(
        n_estimators=200, random_state=RANDOM_STATE, max_depth=None
    ),
    "Gradient Boosting": GradientBoostingClassifier(random_state=RANDOM_STATE),
}

results = []
trained = {}

for name, model in models.items():
    t0 = time.time()
    model.fit(X_train_scaled, y_train)
    train_time = time.time() - t0

    y_pred = model.predict(X_test_scaled)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)

    results.append({
        "model": name,
        "accuracy": round(acc * 100, 2),
        "precision": round(prec * 100, 2),
        "recall": round(rec * 100, 2),
        "f1_score": round(f1 * 100, 2),
        "cv_mean_accuracy": round(cv_scores.mean() * 100, 2),
        "cv_std": round(cv_scores.std() * 100, 2),
        "train_time_sec": round(train_time, 4),
    })
    trained[name] = model
    print(f"{name:20s} | Acc: {acc*100:.2f}% | F1: {f1*100:.2f}% | CV: {cv_scores.mean()*100:.2f}% (+/-{cv_scores.std()*100:.2f})")

results_df = pd.DataFrame(results).sort_values("accuracy", ascending=False)
print("\n=== Model Comparison Table (for paper) ===")
print(results_df.to_string(index=False))
results_df.to_csv("model_comparison_results.csv", index=False)

best_name = results_df.iloc[0]["model"]
best_model = trained[best_name]
print(f"\nBest model: {best_name} ({results_df.iloc[0]['accuracy']}% accuracy)")

# Detailed classification report for the best model
y_pred_best = best_model.predict(X_test_scaled)
report = classification_report(
    y_test, y_pred_best, target_names=encoder.classes_, output_dict=True
)
with open("classification_report.json", "w") as f:
    json.dump(report, f, indent=2)

cm = confusion_matrix(y_test, y_pred_best)
np.savetxt("confusion_matrix.csv", cm, delimiter=",", fmt="%d")

# Feature importance (explainability) - only meaningful for tree-based models
if hasattr(best_model, "feature_importances_"):
    importances = dict(zip(FEATURES, best_model.feature_importances_.tolist()))
    importances = dict(sorted(importances.items(), key=lambda x: -x[1]))
    print("\nFeature importances (explainability):")
    for k, v in importances.items():
        print(f"  {k:12s}: {v:.4f}")
    with open("feature_importances.json", "w") as f:
        json.dump(importances, f, indent=2)

# Persist best model + preprocessing artifacts for the Flask service
joblib.dump(best_model, "crop_model.joblib")
joblib.dump(scaler, "scaler.joblib")
joblib.dump(encoder, "label_encoder.joblib")
with open("model_meta.json", "w") as f:
    json.dump({
        "best_model": best_name,
        "features": FEATURES,
        "n_classes": len(encoder.classes_),
        "classes": encoder.classes_.tolist(),
        "test_accuracy": float(results_df.iloc[0]["accuracy"]),
    }, f, indent=2)

print("\nSaved: crop_model.joblib, scaler.joblib, label_encoder.joblib, model_meta.json")
