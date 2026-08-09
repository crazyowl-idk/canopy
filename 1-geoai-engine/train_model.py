import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import os

print("🧠 Booting up GeoAI Training Pipeline...")

# 1. Generate Historical Training Data (Simulating MCMC Logs)
np.random.seed(42)
n_samples = 5000

# Features (X)
lst_temps = np.random.uniform(30.0, 42.0, n_samples)
densities = np.random.uniform(1.0, 2.0, n_samples)
penalties = np.random.uniform(10, 60, n_samples)

# Target (Y): Historical Throttling Risk (%)
raw_risk = (lst_temps * densities) + penalties
noise = np.random.normal(0, 5, n_samples) # Add real-world variance
risk_percentage = np.clip((raw_risk * 0.82) - 30 + noise, 0, 100)

df = pd.DataFrame({
    'baseLST': lst_temps,
    'baseDensity': densities,
    'networkPenalty': penalties,
    'throttling_risk': risk_percentage
})

X = df[['baseLST', 'baseDensity', 'networkPenalty']]
y = df['throttling_risk']

# 2. Train the Machine Learning Model
print("📊 Training Random Forest Regressor...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)

score = model.score(X_test, y_test)
print(f"✅ Model trained successfully! R^2 Accuracy Score: {score:.2f}")

# 3. Export the Model Artifact
os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/thermal_model.joblib')
print("💾 Model saved to 'models/thermal_model.joblib'")