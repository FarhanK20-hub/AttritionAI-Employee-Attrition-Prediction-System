"""
Employee Attrition Prediction — FastAPI Backend
================================================
Endpoints:
  POST /predict         → Bulk CSV upload
  POST /predict-single  → Single employee JSON
  GET  /health          → Health check
  GET  /template        → Download CSV template
"""

import io
import os
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from feature_engineering import (
    FEATURE_ORDER,
    RAW_COLUMNS,
    derive_risk_flags,
    encode_categoricals,
    engineer_features,
    prepare_dataframe,
    validate_columns,
)

warnings.filterwarnings("ignore")

# ── Load artefacts ─────────────────────────────────────────────────────────────
MODEL_PATH = os.environ.get(
    "MODEL_PATH",
    str(Path(__file__).resolve().parent.parent / "attrition_model.pkl"),
)

print(f"Loading model from {MODEL_PATH} …")
artefacts = joblib.load(MODEL_PATH)
MODEL = artefacts["model"]
SCALER = artefacts["scaler"]
THRESHOLD = float(artefacts["threshold"])  # 0.38
print(f"Model loaded.  Threshold = {THRESHOLD}")

# ── FastAPI app ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Employee Attrition Prediction API",
    version="1.0.0",
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic schemas ──────────────────────────────────────────────────────────
class SingleEmployee(BaseModel):
    Age: int = Field(..., ge=18, le=65)
    BusinessTravel: str = "Travel_Rarely"
    DailyRate: int = 800
    Department: str = "Research & Development"
    DistanceFromHome: int = Field(1, ge=1, le=30)
    Education: int = Field(3, ge=1, le=5)
    EducationField: str = "Life Sciences"
    EnvironmentSatisfaction: int = Field(3, ge=1, le=4)
    Gender: str = "Male"
    HourlyRate: int = 65
    JobInvolvement: int = Field(3, ge=1, le=4)
    JobLevel: int = Field(2, ge=1, le=5)
    JobRole: str = "Research Scientist"
    JobSatisfaction: int = Field(3, ge=1, le=4)
    MaritalStatus: str = "Single"
    MonthlyIncome: int = 5000
    MonthlyRate: int = 14000
    NumCompaniesWorked: int = Field(1, ge=0, le=10)
    OverTime: str = "No"
    PercentSalaryHike: int = Field(14, ge=11, le=25)
    PerformanceRating: int = Field(3, ge=1, le=4)
    RelationshipSatisfaction: int = Field(3, ge=1, le=4)
    StockOptionLevel: int = Field(1, ge=0, le=3)
    TotalWorkingYears: int = Field(8, ge=0, le=40)
    TrainingTimesLastYear: int = Field(3, ge=0, le=6)
    WorkLifeBalance: int = Field(3, ge=1, le=4)
    YearsAtCompany: int = Field(5, ge=0, le=40)
    YearsInCurrentRole: int = Field(3, ge=0, le=18)
    YearsSinceLastPromotion: int = Field(1, ge=0, le=15)
    YearsWithCurrManager: int = Field(3, ge=0, le=17)


class PredictionResult(BaseModel):
    employee_index: int
    risk_score: float
    risk_pct: float
    verdict: str
    risk_level: str


# ── Helpers ────────────────────────────────────────────────────────────────────

def _predict(df_raw: pd.DataFrame, threshold: float | None = None) -> list[dict]:
    """Run the full pipeline and return per-employee results."""
    if threshold is None:
        threshold = THRESHOLD

    # Prepare the 52-feature DataFrame
    df_prepared = prepare_dataframe(df_raw)

    # Scale
    X_scaled = SCALER.transform(df_prepared)

    # Predict probabilities (class 1 = attrition)
    probas = MODEL.predict_proba(X_scaled)[:, 1]

    results = []
    for idx, proba in enumerate(probas):
        risk_pct = round(float(proba) * 100, 2)
        at_risk = proba >= threshold

        if risk_pct > 70:
            risk_level = "High"
        elif risk_pct >= 40:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        results.append({
            "employee_index": idx,
            "risk_score": round(float(proba), 4),
            "risk_pct": risk_pct,
            "verdict": "Likely to Leave" if at_risk else "Likely to Stay",
            "risk_level": risk_level,
        })
    return results


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "threshold": THRESHOLD, "features": len(FEATURE_ORDER)}


@app.get("/template")
async def download_template():
    """Return a CSV template with required columns."""
    df = pd.DataFrame(columns=RAW_COLUMNS)
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)
    return StreamingResponse(
        io.BytesIO(buf.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=template.csv"},
    )


@app.post("/predict")
async def predict_bulk(file: UploadFile = File(...)):
    """Accept CSV, validate, predict, return structured JSON."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only CSV files are accepted.")

    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
    except Exception as exc:
        raise HTTPException(400, f"Could not parse CSV: {exc}")

    if df.empty:
        raise HTTPException(400, "CSV file is empty.")

    # Validate columns
    missing = validate_columns(df)
    if missing:
        raise HTTPException(
            422,
            {
                "error": "missing_columns",
                "missing": missing,
                "message": f"Missing {len(missing)} required column(s): {', '.join(missing)}",
            },
        )

    # Keep original data for response enrichment
    original_df = df.copy()

    # Run predictions
    results = _predict(df)

    # Enrich results with original employee data
    enriched = []
    for i, res in enumerate(results):
        row = original_df.iloc[i]
        employee_data = {
            "employee_id": int(row.get("EmployeeNumber", i + 1)) if "EmployeeNumber" in original_df.columns else i + 1,
            "age": int(row.get("Age", 0)),
            "department": str(row.get("Department", "")),
            "job_role": str(row.get("JobRole", "")),
            "monthly_income": int(row.get("MonthlyIncome", 0)),
            "overtime": str(row.get("OverTime", "No")),
            "marital_status": str(row.get("MaritalStatus", "")),
            "years_at_company": int(row.get("YearsAtCompany", 0)),
            "job_satisfaction": int(row.get("JobSatisfaction", 0)),
            "environment_satisfaction": int(row.get("EnvironmentSatisfaction", 0)),
            "relationship_satisfaction": int(row.get("RelationshipSatisfaction", 0)),
            "job_level": int(row.get("JobLevel", 0)),
            "stock_option_level": int(row.get("StockOptionLevel", 0)),
            "years_in_current_role": int(row.get("YearsInCurrentRole", 0)),
            "years_since_last_promotion": int(row.get("YearsSinceLastPromotion", 0)),
            "num_companies_worked": int(row.get("NumCompaniesWorked", 0)),
            "total_working_years": int(row.get("TotalWorkingYears", 0)),
            "performance_rating": int(row.get("PerformanceRating", 0)),
            "distance_from_home": int(row.get("DistanceFromHome", 0)),
            "work_life_balance": int(row.get("WorkLifeBalance", 0)),
            "training_times_last_year": int(row.get("TrainingTimesLastYear", 0)),
        }
        # Generate risk flags from raw data
        raw_row = row.to_dict()
        risk_flags = derive_risk_flags(raw_row)

        enriched.append({**employee_data, **res, "risk_flags": risk_flags})

    # Summary statistics
    scores = [r["risk_pct"] for r in results]
    at_risk = [r for r in results if r["verdict"] == "Likely to Leave"]
    high = [r for r in results if r["risk_level"] == "High"]
    medium = [r for r in results if r["risk_level"] == "Medium"]
    low = [r for r in results if r["risk_level"] == "Low"]

    # Most at-risk department
    dept_risk = {}
    for e in enriched:
        dept = e["department"]
        dept_risk.setdefault(dept, []).append(e["risk_pct"])
    most_at_risk_dept = max(dept_risk, key=lambda d: np.mean(dept_risk[d])) if dept_risk else "N/A"

    summary = {
        "total_employees": len(results),
        "at_risk_count": len(at_risk),
        "high_risk_pct": round(len(high) / len(results) * 100, 1) if results else 0,
        "medium_risk_pct": round(len(medium) / len(results) * 100, 1) if results else 0,
        "low_risk_pct": round(len(low) / len(results) * 100, 1) if results else 0,
        "avg_risk_score": round(np.mean(scores), 2) if scores else 0,
        "most_at_risk_department": most_at_risk_dept,
    }

    return {"summary": summary, "employees": enriched}


@app.post("/predict-single")
async def predict_single(employee: SingleEmployee):
    """Accept single employee JSON, predict, return score + verdict + flags."""
    data = employee.model_dump()
    df = pd.DataFrame([data])

    results = _predict(df)
    res = results[0]

    # Generate risk flags
    risk_flags = derive_risk_flags(data)

    return {
        "employee": data,
        "risk_score": res["risk_score"],
        "risk_pct": res["risk_pct"],
        "verdict": res["verdict"],
        "risk_level": res["risk_level"],
        "risk_flags": risk_flags,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
