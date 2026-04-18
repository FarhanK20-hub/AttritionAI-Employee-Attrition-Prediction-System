"""
Feature Engineering Module
==========================
Generates 22 engineered features from 30 raw input columns.
Must match EXACTLY what was used during model training.

Raw features (30):
  Age, BusinessTravel, DailyRate, Department, DistanceFromHome, Education,
  EducationField, EnvironmentSatisfaction, Gender, HourlyRate, JobInvolvement,
  JobLevel, JobRole, JobSatisfaction, MaritalStatus, MonthlyIncome, MonthlyRate,
  NumCompaniesWorked, OverTime, PercentSalaryHike, PerformanceRating,
  RelationshipSatisfaction, StockOptionLevel, TotalWorkingYears,
  TrainingTimesLastYear, WorkLifeBalance, YearsAtCompany, YearsInCurrentRole,
  YearsSinceLastPromotion, YearsWithCurrManager

Engineered features (22):
  SatisfactionComposite, DissatisfactionRisk, PromotionLag, TenureRatio,
  CareerVelocity, UnderutilisedSenior, StuckInRole, NewEmployee, IncomePerExp,
  SalaryHikeAdequacy, LowPaidHighPerformer, OvertimeDissatisfied, TravelStress,
  DistanceOvertime, LoyaltyIndex, JobHopper, LongTenureNoPromotion,
  OT_x_Satisfaction, Age_x_Income, Single_x_OT, LowStock_x_OT, YoungJobHopper
"""

import pandas as pd
import numpy as np

# ── Categorical Encoding Maps ──────────────────────────────────────────────────
BUSINESS_TRAVEL_MAP = {"Non-Travel": 0, "Travel_Rarely": 1, "Travel_Frequently": 2}
DEPARTMENT_MAP = {"Human Resources": 0, "Research & Development": 1, "Sales": 2}
EDUCATION_FIELD_MAP = {
    "Human Resources": 0, "Life Sciences": 1, "Marketing": 2,
    "Medical": 3, "Other": 4, "Technical Degree": 5,
}
GENDER_MAP = {"Female": 0, "Male": 1}
MARITAL_STATUS_MAP = {"Divorced": 0, "Married": 1, "Single": 2}
OVERTIME_MAP = {"No": 0, "Yes": 1}
JOB_ROLE_MAP = {
    "Healthcare Representative": 0, "Human Resources": 1,
    "Laboratory Technician": 2, "Manager": 3,
    "Manufacturing Director": 4, "Research Director": 5,
    "Research Scientist": 6, "Sales Executive": 7,
    "Sales Representative": 8,
}

# The 30 raw columns expected in incoming CSVs / form data
RAW_COLUMNS = [
    "Age", "BusinessTravel", "DailyRate", "Department", "DistanceFromHome",
    "Education", "EducationField", "EnvironmentSatisfaction", "Gender",
    "HourlyRate", "JobInvolvement", "JobLevel", "JobRole", "JobSatisfaction",
    "MaritalStatus", "MonthlyIncome", "MonthlyRate", "NumCompaniesWorked",
    "OverTime", "PercentSalaryHike", "PerformanceRating",
    "RelationshipSatisfaction", "StockOptionLevel", "TotalWorkingYears",
    "TrainingTimesLastYear", "WorkLifeBalance", "YearsAtCompany",
    "YearsInCurrentRole", "YearsSinceLastPromotion", "YearsWithCurrManager",
]

# Full 52-feature order that the scaler / model expects
FEATURE_ORDER = [
    # 30 raw (label-encoded)
    "Age", "BusinessTravel", "DailyRate", "Department", "DistanceFromHome",
    "Education", "EducationField", "EnvironmentSatisfaction", "Gender",
    "HourlyRate", "JobInvolvement", "JobLevel", "JobRole", "JobSatisfaction",
    "MaritalStatus", "MonthlyIncome", "MonthlyRate", "NumCompaniesWorked",
    "OverTime", "PercentSalaryHike", "PerformanceRating",
    "RelationshipSatisfaction", "StockOptionLevel", "TotalWorkingYears",
    "TrainingTimesLastYear", "WorkLifeBalance", "YearsAtCompany",
    "YearsInCurrentRole", "YearsSinceLastPromotion", "YearsWithCurrManager",
    # 22 engineered
    "SatisfactionComposite", "DissatisfactionRisk", "PromotionLag",
    "TenureRatio", "CareerVelocity", "UnderutilisedSenior", "StuckInRole",
    "NewEmployee", "IncomePerExp", "SalaryHikeAdequacy",
    "LowPaidHighPerformer", "OvertimeDissatisfied", "TravelStress",
    "DistanceOvertime", "LoyaltyIndex", "JobHopper",
    "LongTenureNoPromotion", "OT_x_Satisfaction", "Age_x_Income",
    "Single_x_OT", "LowStock_x_OT", "YoungJobHopper",
]


def validate_columns(df: pd.DataFrame) -> list[str]:
    """Return list of missing required columns (empty if all present)."""
    present = set(df.columns)
    return [c for c in RAW_COLUMNS if c not in present]


def encode_categoricals(df: pd.DataFrame) -> pd.DataFrame:
    """Label-encode categorical columns in-place and return the DataFrame."""
    df = df.copy()
    df["BusinessTravel"] = df["BusinessTravel"].map(BUSINESS_TRAVEL_MAP).fillna(1).astype(int)
    df["Department"] = df["Department"].map(DEPARTMENT_MAP).fillna(1).astype(int)
    df["EducationField"] = df["EducationField"].map(EDUCATION_FIELD_MAP).fillna(4).astype(int)
    df["Gender"] = df["Gender"].map(GENDER_MAP).fillna(0).astype(int)
    df["MaritalStatus"] = df["MaritalStatus"].map(MARITAL_STATUS_MAP).fillna(1).astype(int)
    df["OverTime"] = df["OverTime"].map(OVERTIME_MAP).fillna(0).astype(int)
    df["JobRole"] = df["JobRole"].map(JOB_ROLE_MAP).fillna(6).astype(int)
    return df


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add 22 derived features.  Input must already be label-encoded.

    Formulas (matched to model training):
    ──────────────────────────────────────
    1.  SatisfactionComposite   = mean(EnvSat, JobSat, RelSat)
    2.  DissatisfactionRisk     = 1 if SatisfactionComposite < 2 else 0
    3.  PromotionLag            = YearsAtCompany − YearsSinceLastPromotion
    4.  TenureRatio             = YearsAtCompany / max(TotalWorkingYears, 1)
    5.  CareerVelocity          = JobLevel / max(TotalWorkingYears, 1)
    6.  UnderutilisedSenior     = 1 if TotalWorkingYears > 15 and JobLevel <= 2
    7.  StuckInRole             = 1 if YearsInCurrentRole > 5 and YearsSinceLastPromotion > 3
    8.  NewEmployee             = 1 if YearsAtCompany <= 1
    9.  IncomePerExp            = MonthlyIncome / max(TotalWorkingYears, 1)
    10. SalaryHikeAdequacy      = PercentSalaryHike − median(PercentSalaryHike)  →  per-batch
    11. LowPaidHighPerformer    = 1 if PerformanceRating >= 3 and MonthlyIncome < 3000
    12. OvertimeDissatisfied    = 1 if OverTime == 1 and JobSatisfaction <= 2
    13. TravelStress            = BusinessTravel * DistanceFromHome
    14. DistanceOvertime        = DistanceFromHome * OverTime
    15. LoyaltyIndex            = YearsAtCompany / max(NumCompaniesWorked, 1)
    16. JobHopper               = NumCompaniesWorked / max(TotalWorkingYears, 1)
    17. LongTenureNoPromotion   = 1 if YearsAtCompany > 5 and YearsSinceLastPromotion > 3
    18. OT_x_Satisfaction       = OverTime * SatisfactionComposite
    19. Age_x_Income            = Age * MonthlyIncome
    20. Single_x_OT             = (MaritalStatus == 2) * OverTime
    21. LowStock_x_OT           = (StockOptionLevel == 0) * OverTime
    22. YoungJobHopper           = 1 if Age < 32 and JobHopper > 0.5
    """
    df = df.copy()

    # 1. SatisfactionComposite
    df["SatisfactionComposite"] = (
        df["EnvironmentSatisfaction"] + df["JobSatisfaction"] + df["RelationshipSatisfaction"]
    ) / 3.0

    # 2. DissatisfactionRisk
    df["DissatisfactionRisk"] = (df["SatisfactionComposite"] < 2).astype(int)

    # 3. PromotionLag
    df["PromotionLag"] = df["YearsAtCompany"] - df["YearsSinceLastPromotion"]

    # 4. TenureRatio
    df["TenureRatio"] = df["YearsAtCompany"] / df["TotalWorkingYears"].clip(lower=1)

    # 5. CareerVelocity
    df["CareerVelocity"] = df["JobLevel"] / df["TotalWorkingYears"].clip(lower=1)

    # 6. UnderutilisedSenior
    df["UnderutilisedSenior"] = (
        (df["TotalWorkingYears"] > 15) & (df["JobLevel"] <= 2)
    ).astype(int)

    # 7. StuckInRole
    df["StuckInRole"] = (
        (df["YearsInCurrentRole"] > 5) & (df["YearsSinceLastPromotion"] > 3)
    ).astype(int)

    # 8. NewEmployee
    df["NewEmployee"] = (df["YearsAtCompany"] <= 1).astype(int)

    # 9. IncomePerExp
    df["IncomePerExp"] = df["MonthlyIncome"] / df["TotalWorkingYears"].clip(lower=1)

    # 10. SalaryHikeAdequacy  (median computed per-batch)
    median_hike = df["PercentSalaryHike"].median()
    df["SalaryHikeAdequacy"] = df["PercentSalaryHike"] - median_hike

    # 11. LowPaidHighPerformer
    df["LowPaidHighPerformer"] = (
        (df["PerformanceRating"] >= 3) & (df["MonthlyIncome"] < 3000)
    ).astype(int)

    # 12. OvertimeDissatisfied
    df["OvertimeDissatisfied"] = (
        (df["OverTime"] == 1) & (df["JobSatisfaction"] <= 2)
    ).astype(int)

    # 13. TravelStress
    df["TravelStress"] = df["BusinessTravel"] * df["DistanceFromHome"]

    # 14. DistanceOvertime
    df["DistanceOvertime"] = df["DistanceFromHome"] * df["OverTime"]

    # 15. LoyaltyIndex
    df["LoyaltyIndex"] = df["YearsAtCompany"] / df["NumCompaniesWorked"].clip(lower=1)

    # 16. JobHopper
    df["JobHopper"] = df["NumCompaniesWorked"] / df["TotalWorkingYears"].clip(lower=1)

    # 17. LongTenureNoPromotion
    df["LongTenureNoPromotion"] = (
        (df["YearsAtCompany"] > 5) & (df["YearsSinceLastPromotion"] > 3)
    ).astype(int)

    # 18. OT_x_Satisfaction
    df["OT_x_Satisfaction"] = df["OverTime"] * df["SatisfactionComposite"]

    # 19. Age_x_Income
    df["Age_x_Income"] = df["Age"] * df["MonthlyIncome"]

    # 20. Single_x_OT
    df["Single_x_OT"] = (df["MaritalStatus"] == 2).astype(int) * df["OverTime"]

    # 21. LowStock_x_OT
    df["LowStock_x_OT"] = (df["StockOptionLevel"] == 0).astype(int) * df["OverTime"]

    # 22. YoungJobHopper
    df["YoungJobHopper"] = (
        (df["Age"] < 32) & (df["JobHopper"] > 0.5)
    ).astype(int)

    return df


def prepare_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Full pipeline: validate → encode → engineer → reorder.
    Returns a DataFrame with exactly 52 columns in FEATURE_ORDER.
    """
    # Keep only the 30 raw columns (drop extras like Attrition, EmployeeNumber, etc.)
    df = df[[c for c in RAW_COLUMNS if c in df.columns]].copy()

    # Encode categoricals
    df = encode_categoricals(df)

    # Engineer features
    df = engineer_features(df)

    # Cast all to float
    for col in FEATURE_ORDER:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # Reorder
    return df[FEATURE_ORDER]


def derive_risk_flags(row: dict) -> list[dict]:
    """
    Given a single employee's raw (un-encoded) data, generate human-readable
    risk flags and corresponding HR suggestions.
    """
    flags = []

    # Overtime + Low Satisfaction
    if str(row.get("OverTime", "No")) == "Yes" and (
        int(row.get("JobSatisfaction", 4)) <= 2
        or int(row.get("EnvironmentSatisfaction", 4)) <= 2
    ):
        flags.append({
            "flag": "Overtime + Low Satisfaction",
            "detail": "Working overtime with low job or environment satisfaction",
            "suggestion": "Reduce overtime load and conduct a satisfaction survey",
        })

    # No Promotion in X Years
    yrs_promo = int(row.get("YearsSinceLastPromotion", 0))
    yrs_company = int(row.get("YearsAtCompany", 0))
    if yrs_company > 5 and yrs_promo > 3:
        flags.append({
            "flag": f"No Promotion in {yrs_promo} Years",
            "detail": f"Has been at company {yrs_company} years with last promotion {yrs_promo} years ago",
            "suggestion": "Consider promotion or role change discussion",
        })

    # Job Hopper Pattern
    num_companies = int(row.get("NumCompaniesWorked", 0))
    total_years = max(int(row.get("TotalWorkingYears", 1)), 1)
    job_hopper_ratio = num_companies / total_years
    if job_hopper_ratio > 0.5:
        flags.append({
            "flag": "Job Hopper Pattern",
            "detail": f"Worked at {num_companies} companies over {total_years} years",
            "suggestion": "Provide retention incentives and career path clarity",
        })

    # Underpaid for Experience
    income = int(row.get("MonthlyIncome", 0))
    perf = int(row.get("PerformanceRating", 3))
    if perf >= 3 and income < 3000:
        flags.append({
            "flag": "Underpaid for Experience",
            "detail": f"High performer (rating {perf}) with monthly income ₹{income:,}",
            "suggestion": "Salary benchmarking and compensation adjustment",
        })

    # Stuck in Same Role
    yrs_role = int(row.get("YearsInCurrentRole", 0))
    if yrs_role > 5 and yrs_promo > 3:
        flags.append({
            "flag": "Stuck in Same Role",
            "detail": f"In current role for {yrs_role} years, no promotion in {yrs_promo} years",
            "suggestion": "Role rotation or lateral move opportunity",
        })

    # Young employee + overtime + single
    age = int(row.get("Age", 30))
    marital = str(row.get("MaritalStatus", "Married"))
    if age < 30 and marital == "Single" and str(row.get("OverTime", "No")) == "Yes":
        flags.append({
            "flag": "Young & Overworked",
            "detail": f"Age {age}, single, working overtime",
            "suggestion": "Monitor work-life balance and provide mentoring",
        })

    # New employee risk
    if yrs_company <= 1:
        flags.append({
            "flag": "New Employee",
            "detail": f"Been with the company for only {yrs_company} year(s)",
            "suggestion": "Ensure onboarding support and regular check-ins",
        })

    # Low stock options + overtime
    stock = int(row.get("StockOptionLevel", 0))
    if stock == 0 and str(row.get("OverTime", "No")) == "Yes":
        flags.append({
            "flag": "No Stock Options + Overtime",
            "detail": "Working overtime with zero stock options",
            "suggestion": "Consider stock option or equity compensation",
        })

    return flags
