# 🧠 AttritionAI — Employee Attrition Prediction System

> An AI-powered SaaS platform that predicts which employees are likely to leave a company, helping HR teams take action before it's too late.

**🚀 Live Demo:** [https://attrition-ai-employee-attrition-pre.vercel.app/](https://attrition-ai-employee-attrition-pre.vercel.app/)

![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.6-F7931E?logo=scikitlearn&logoColor=white)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Problem Statement](#-problem-statement)
- [Dataset Explanation](#-dataset-explanation)
- [Column Impact Analysis](#-how-each-column-affects-attrition)
- [Data Preprocessing](#-data-preprocessing)
- [Model Training](#-model-training)
- [Model Evaluation](#-model-evaluation)
- [How Prediction Works](#-how-prediction-works)
- [Tech Stack](#-tech-stack)
- [Architecture](#-full-stack-architecture)
- [Website Features](#-website-features)
- [UI Explanation](#-what-the-user-sees)
- [Real-World Use Cases](#-real-world-use-cases)
- [Folder Structure](#-folder-structure)
- [Installation & Setup](#-installation--setup)
- [Future Improvements](#-future-improvements)

---

## 🌟 Project Overview

### What is this?

Imagine you run a company with 1,000 employees. Every month, a few people resign. Each resignation costs the company **6–9 months of that person's salary** in hiring, training, and lost productivity. Wouldn't it be great if you could **predict who might leave** before they even start thinking about it?

That's exactly what **AttritionAI** does.

It uses **artificial intelligence** to analyze employee data — things like salary, overtime, job satisfaction, years at the company — and predicts the **probability** that each employee will leave. It then shows this information in a beautiful dashboard so HR teams can take action: promote someone, reduce their overtime, or simply have a conversation.

### What makes this special?

| Feature | Description |
|---------|-------------|
| 🎯 **Stacking Ensemble Model** | Combines 6 different AI models for better accuracy than any single model |
| 📊 **Interactive Dashboard** | Charts, filters, and search — not just numbers in a spreadsheet |
| 🔧 **Adjustable Threshold** | HR teams can tune sensitivity without re-running the model |
| 🚩 **Risk Flags** | Automatically detects patterns like "overtime + low satisfaction" |
| 💡 **HR Recommendations** | Suggests specific actions for each at-risk employee |
| 📄 **Export Reports** | Generate CSV and PDF reports for management meetings |

---

## 🎯 Problem Statement

### Why does employee attrition matter?

Employee attrition (people leaving a company) is one of the **biggest hidden costs** in any organization.

**Think of it like this:** If a skilled mechanic at a Tata Motors factory leaves, the company doesn't just lose one person. They lose:

1. **Knowledge** — Years of expertise and training
2. **Time** — 3–6 months to hire and train a replacement
3. **Money** — Recruiting costs, training costs, lost productivity
4. **Morale** — Other employees see people leaving and start wondering if they should too

**The numbers are staggering:**
- Replacing an employee costs **50–200%** of their annual salary
- Companies with high attrition have **21% lower profitability**
- In India's automotive sector, attrition rates can reach **15–20% annually**

### Our Solution

Instead of waiting for employees to hand in their resignation, **AttritionAI** looks at patterns in data and says:

> *"Based on the data, this employee has a 78% chance of leaving. Here's why: they work overtime, haven't been promoted in 4 years, and their satisfaction score is low. Consider discussing a promotion or role change."*

This shifts HR from **reactive** (responding to resignations) to **proactive** (preventing them).

---

## 📊 Dataset Explanation

We use the **IBM HR Analytics Employee Attrition** dataset — a widely-used benchmark dataset with **1,470 employees** and **35 columns** of information.

Think of each row as one employee's "profile" — everything the company knows about them.

### What each column means (in plain English)

| Column | What it means | Example |
|--------|--------------|---------|
| **Age** | How old the employee is | 34 years |
| **Attrition** | Did they actually leave? (Yes/No) — *this is what we predict* | Yes |
| **BusinessTravel** | How often they travel for work | Travel_Rarely |
| **DailyRate** | Their daily pay rate | ₹1,102 |
| **Department** | Which department they work in | Research & Development |
| **DistanceFromHome** | How far they live from the office (in km) | 5 km |
| **Education** | Highest education level (1=Below College, 5=Doctorate) | 3 (Bachelor's) |
| **EducationField** | What they studied | Life Sciences |
| **EmployeeCount** | Always 1 (not useful) | 1 |
| **EmployeeNumber** | Unique ID for each employee | 42 |
| **EnvironmentSatisfaction** | How happy they are with their workspace (1-4) | 3 (High) |
| **Gender** | Male or Female | Female |
| **HourlyRate** | Pay per hour | ₹94 |
| **JobInvolvement** | How engaged they are in their work (1-4) | 3 (High) |
| **JobLevel** | Their seniority level (1=Entry, 5=Executive) | 2 |
| **JobRole** | Their specific job title | Sales Executive |
| **JobSatisfaction** | How satisfied they are with the job itself (1-4) | 4 (Very High) |
| **MaritalStatus** | Single, Married, or Divorced | Single |
| **MonthlyIncome** | Monthly salary | ₹5,993 |
| **MonthlyRate** | Internal monthly rate | ₹19,479 |
| **NumCompaniesWorked** | How many companies they've worked at before | 8 |
| **Over18** | Are they over 18? (Always Yes) | Y |
| **OverTime** | Do they work overtime? | Yes |
| **PercentSalaryHike** | Their last salary increase (%) | 11% |
| **PerformanceRating** | Their performance review score (1-4) | 3 (Excellent) |
| **RelationshipSatisfaction** | How happy they are with workplace relationships (1-4) | 1 (Low) |
| **StandardHours** | Standard work hours (Always 80) | 80 |
| **StockOptionLevel** | Company stock options they hold (0-3) | 0 (None) |
| **TotalWorkingYears** | Total career experience | 8 years |
| **TrainingTimesLastYear** | Training sessions attended last year | 0 |
| **WorkLifeBalance** | How they rate their work-life balance (1-4) | 1 (Bad) |
| **YearsAtCompany** | How long they've been at this company | 6 years |
| **YearsInCurrentRole** | Years in their current position | 4 years |
| **YearsSinceLastPromotion** | Years since their last promotion | 0 |
| **YearsWithCurrManager** | Years with their current manager | 5 years |

> **Note:** We drop 5 columns that don't help prediction: `Attrition` (that's what we predict), `EmployeeCount` (always 1), `EmployeeNumber` (just an ID), `Over18` (always Y), `StandardHours` (always 80). This leaves us with **30 useful columns**.

---

## 🔍 How Each Column Affects Attrition

Here's the **real-world logic** — not technical jargon — of why each factor matters:

### 🔴 High-Impact Factors

| Factor | Why it matters | Real-world analogy |
|--------|---------------|-------------------|
| **OverTime** | People forced to work extra hours burn out faster | Like running a car engine at redline — it wears out faster |
| **MonthlyIncome** | Underpaid employees feel undervalued | If you found out a colleague doing the same job earns 30% more, you'd look elsewhere |
| **JobSatisfaction** | Unhappy employees actively seek other jobs | Like staying in a bad relationship — eventually you leave |
| **YearsSinceLastPromotion** | No growth = no motivation | Imagine being in the same class at school for 5 years while others move up |
| **NumCompaniesWorked** | Job-hoppers tend to continue hopping | Past behavior predicts future behavior |
| **Age** | Young employees (< 30) switch jobs more freely | Early career = exploring options. Mid-career = seeking stability |

### 🟡 Medium-Impact Factors

| Factor | Why it matters |
|--------|---------------|
| **DistanceFromHome** | Long commutes cause daily frustration |
| **WorkLifeBalance** | Poor balance leads to burnout |
| **EnvironmentSatisfaction** | Bad office conditions push people away |
| **StockOptionLevel** | Stock options act as "golden handcuffs" — employees stay to vest their shares |
| **BusinessTravel** | Frequent travel is exhausting, especially for those with families |
| **MaritalStatus** | Single employees have fewer obligations tying them to a location |

### 🟢 Supporting Factors

| Factor | Why it matters |
|--------|---------------|
| **Education** | Higher education = more options elsewhere |
| **TrainingTimesLastYear** | No training = feeling stagnant |
| **RelationshipSatisfaction** | Bad relationships with colleagues/managers |
| **PerformanceRating** | High performers who feel unrecognized are flight risks |
| **JobLevel** | Entry-level employees leave more often than senior ones |

---

## 🔧 Data Preprocessing

Before feeding data to an AI model, we need to **clean and transform** it — just like you'd clean and chop vegetables before cooking.

### Step 1: Remove Useless Columns

We drop 5 columns that add no value:
- `Attrition` — This is the answer we're trying to predict, not an input
- `EmployeeCount`, `Over18`, `StandardHours` — Same value for everyone
- `EmployeeNumber` — Just an ID, has no predictive power

### Step 2: Encode Categories (Turn Words into Numbers)

Computers don't understand words like "Male" or "Sales". We convert them to numbers:

| Original | Encoded |
|----------|---------|
| Non-Travel → 0, Travel_Rarely → 1, Travel_Frequently → 2 | Business travel frequency ranking |
| Female → 0, Male → 1 | Simple binary |
| Single → 2, Married → 1, Divorced → 0 | Marital status mapping |
| No → 0, Yes → 1 | Overtime flag |

**Analogy:** Think of it like translating English to French before talking to a French person. The meaning stays the same, but the format changes.

### Step 3: Feature Engineering (Create New Insights)

This is the **secret sauce**. We create **22 new columns** from the existing 30, capturing patterns that aren't obvious from raw data alone.

For example:
- **SatisfactionComposite** = Average of all three satisfaction scores. *One low score might be a bad day. Three low scores? That's a pattern.*
- **JobHopper** = Companies worked ÷ Total years. *If someone worked at 8 companies in 10 years, they jump jobs every 1.25 years.*
- **StuckInRole** = In same role for 5+ years AND no promotion in 3+ years. *This employee probably feels trapped.*
- **OvertimeDissatisfied** = Works overtime AND job satisfaction ≤ 2. *The most dangerous combination.*

**Analogy:** Raw data is like flour, eggs, and sugar. Feature engineering is the recipe that turns them into a cake.

### Step 4: Scaling (StandardScaler)

Different columns have wildly different ranges:
- Age: 18–60
- MonthlyIncome: 1,000–20,000

We **scale** everything to have a mean of 0 and standard deviation of 1. This ensures no single feature dominates just because its numbers are bigger.

**Analogy:** Imagine comparing weights in kilograms and distances in meters. Without scaling, the AI might think distances matter more just because the numbers are larger.

---

## 🤖 Model Training

### Why a Stacking Ensemble?

Instead of using **one** AI model, we use **six different models** and combine their predictions. This is called **stacking** — like asking 6 different doctors for their opinion and going with the consensus.

| Model | Strength | Analogy |
|-------|----------|---------|
| **XGBoost** | Great at finding sequential patterns | A detective following clues one by one |
| **LightGBM** | Fast and handles large data well | A speed reader who still catches every detail |
| **CatBoost** | Excellent with category data (departments, roles) | An expert who understands organizational structure |
| **Random Forest** | Robust, hard to fool | A jury of 100 random people — hard to bribe all of them |
| **Extra Trees** | Adds randomness for diversity | A brainstorming session where wild ideas lead to insights |
| **Gradient Boosting** | Learns from previous mistakes | A student who reviews wrong answers before the next test |

### How Stacking Works

```
Employee Data
    │
    ├── XGBoost      → 72% risk
    ├── LightGBM     → 68% risk
    ├── CatBoost     → 74% risk
    ├── Random Forest → 65% risk
    ├── Extra Trees   → 70% risk
    └── GBM          → 71% risk
         │
    Logistic Regression (Meta-Learner)
         │
    Final Prediction: 70.5% risk
```

### Calibration (CalibratedClassifierCV)

After stacking, we **calibrate** the model. This ensures that when the model says "70% risk", there's truly a 70% chance — not just a relative score.

**Analogy:** An uncalibrated thermometer might show 38°C when it's actually 37°C. Calibration fixes this drift.

### Custom Threshold: 0.38 (Not 0.5!)

Most AI models use 0.5 (50%) as the cutoff: above 50% = "will leave", below = "will stay".

We use **0.38 (38%)** because:
- It's better to **over-predict** attrition than to miss it
- False alarms (predicting someone leaves when they stay) are **cheap** — just have an extra conversation with them
- Missing a real resignation is **expensive** — you lose the employee entirely

**Analogy:** A fire alarm with a low threshold might go off during burnt toast (annoying but harmless). A high threshold might miss an actual fire (catastrophic).

---

## 📈 Model Evaluation

### What the metrics mean (no jargon)

| Metric | Plain English | Value |
|--------|--------------|-------|
| **Accuracy** | "Out of all predictions, how many were correct?" | ~89% |
| **Precision** | "When the model says someone will leave, how often is it right?" | ~75% |
| **Recall** | "Out of everyone who actually left, how many did we catch?" | ~82% |
| **F1-Score** | "The balance between precision and recall" | ~78% |
| **AUC-ROC** | "Overall ability to distinguish leavers from stayers" | ~0.92 |

### What this means in practice

For every 100 employees:
- The model correctly identifies **~82%** of employees who will leave
- When it flags someone as "at risk", it's right **~75%** of the time
- It misses about **18%** of actual departures (they slip through)
- About **25%** of flagged employees won't actually leave (false alarms)

> **The trade-off:** We accept more false alarms to catch more real departures. It's better to have an unnecessary conversation with 25 employees than to lose 18 employees you could have saved.

---

## ⚙️ How Prediction Works

Here's the complete journey from raw data to a risk score, explained step by step:

```
📤 User Uploads CSV (1,470 employees)
       │
       ▼
🔍 Step 1: VALIDATION
   • Check all 30 required columns exist
   • Verify data types (numbers are numbers, text is text)
   • Count rows and report to user
       │
       ▼
🏷️ Step 2: ENCODE CATEGORIES
   • "Male" → 1, "Female" → 0
   • "Sales" → 2, "R&D" → 1
   • "Yes" → 1, "No" → 0
       │
       ▼
🧪 Step 3: ENGINEER FEATURES
   • Create 22 new columns from existing data
   • SatisfactionComposite, JobHopper, StuckInRole, etc.
   • Now we have 52 columns total
       │
       ▼
📏 Step 4: SCALE DATA
   • Normalize all 52 features to same range
   • Using the SAME scaler from training (important!)
       │
       ▼
🤖 Step 5: PREDICT
   • Feed 52-feature matrix to CalibratedClassifierCV
   • Get probability for each employee (0.0 to 1.0)
       │
       ▼
🎯 Step 6: APPLY THRESHOLD
   • If probability ≥ 0.38 → "Likely to Leave"
   • If probability < 0.38 → "Likely to Stay"
       │
       ▼
🚩 Step 7: GENERATE FLAGS
   • Check for known risk patterns
   • "Overtime + Low Satisfaction", "No Promotion in 4 Years", etc.
       │
       ▼
💡 Step 8: MAP SUGGESTIONS
   • Each flag triggers a specific HR recommendation
   • "Consider promotion", "Reduce overtime load", etc.
       │
       ▼
📊 Step 9: RETURN TO FRONTEND
   • Summary statistics (% high/medium/low risk)
   • Per-employee risk scores, flags, and suggestions
   • Department and role breakdowns for charts
```

---

## 🛠️ Tech Stack

### Backend (The Brain)
| Technology | Purpose |
|-----------|---------|
| **Python 3.13** | Programming language for ML and API |
| **FastAPI** | Lightning-fast web API framework |
| **scikit-learn** | Machine learning toolkit |
| **XGBoost / LightGBM / CatBoost** | Gradient boosting models |
| **Pandas / NumPy** | Data processing |
| **joblib** | Model loading |
| **Uvicorn** | ASGI server |

### Frontend (The Face)
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI component framework |
| **Vite** | Ultra-fast build tool |
| **Tailwind CSS v4** | Utility-first styling |
| **Recharts** | Beautiful chart library |
| **Lucide React** | Icon library |
| **React Router** | Page navigation |
| **jsPDF** | PDF report generation |

---

## 🏗️ Full-Stack Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                          │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  Upload   │  │  Dashboard   │  │  Employee Detail   │   │
│  │  Page     │→ │  Page        │→ │  Page              │   │
│  └──────────┘  └──────────────┘  └────────────────────┘   │
│       │              │                    │                  │
│       └──────────────┴────────────────────┘                  │
│                      │                                       │
│              React + Tailwind + Recharts                    │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP (JSON)
                       │  via Vite Proxy (/api → :8000)
┌──────────────────────┴──────────────────────────────────────┐
│                    FASTAPI SERVER (:8000)                    │
│                                                             │
│  ┌────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │  /predict   │  │  /predict-single │  │  /template     │  │
│  │  (CSV bulk) │  │  (JSON single)   │  │  (CSV download)│  │
│  └──────┬─────┘  └───────┬─────────┘  └────────────────┘  │
│         └────────────────┘                                  │
│                  │                                           │
│         ┌───────┴────────┐                                  │
│         │  Feature        │                                  │
│         │  Engineering    │  30 raw → 52 total features     │
│         └───────┬────────┘                                  │
│                 │                                           │
│         ┌───────┴────────┐                                  │
│         │  StandardScaler │  Normalize to mean=0, std=1     │
│         └───────┬────────┘                                  │
│                 │                                           │
│    ┌────────────┴────────────────┐                          │
│    │  CalibratedClassifierCV     │                          │
│    │  └─ StackingClassifier      │                          │
│    │     ├─ XGBoost              │                          │
│    │     ├─ LightGBM             │                          │
│    │     ├─ CatBoost             │                          │
│    │     ├─ Random Forest        │                          │
│    │     ├─ Extra Trees          │                          │
│    │     └─ Gradient Boosting    │                          │
│    └─────────────────────────────┘                          │
│                                                             │
│    Model file: attrition_model.pkl (42 MB)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Website Features

### Page 1: Upload & Validate
- 📁 **Drag-and-drop CSV upload** — Simply drag your file onto the page
- ✅ **Column validation** — Instantly checks if all 30 required columns are present
- 📊 **Row count preview** — Shows "1,470 employees detected" before processing
- 📥 **Template download** — Get a blank CSV with the correct column headers
- ❌ **Smart error messages** — Tells you exactly which columns are missing
- 👤 **Single employee mode** — 4-step form wizard for individual predictions

### Page 2: Results Dashboard
- 📊 **7 Summary Cards** — Total employees, at-risk count, risk percentages, avg score, top department
- 📈 **5 Interactive Charts** — Risk histogram, department breakdown, job role analysis, overtime impact, marital status
- 🎚️ **Threshold Slider** — Adjust sensitivity (0.20–0.80) and see results update instantly
- 🔍 **Search & Filter** — Find employees by ID, department, role, or risk level
- ↕️ **Sortable Columns** — Click any column header to sort ascending/descending
- 📥 **CSV Export** — Download results with risk scores appended
- 📄 **PDF Report** — Generate a formatted report for management

### Page 3: Employee Risk Card
- 🎯 **Risk Gauge** — Beautiful semicircular gauge showing exact risk percentage
- ⚠️ **Verdict Banner** — Clear "Likely to Leave" or "Likely to Stay" indicator
- 📊 **Satisfaction Bars** — Visual bars for job, environment, and relationship satisfaction
- 🚩 **Risk Flags** — Auto-detected patterns like "Overtime + Low Satisfaction"
- 💡 **HR Suggestions** — Actionable recommendations mapped to each risk flag
- 📋 **Employee Details** — Age, role, tenure, income, and other key info at a glance

---

## 🖥️ What the User Sees

### First Visit
The user lands on a clean, dark-themed page with two options: **Upload CSV** or **Single Employee**. The design is minimalistic — no clutter, no confusing menus.

### After Upload
A green validation badge appears: *"Validation passed • 1,470 employees detected • 35 columns found"*. One click on **Run Prediction** sends the data to the AI model.

### Dashboard
Seven cards show key metrics at a glance. Below, interactive charts reveal patterns across departments, roles, and overtime status. A data table lists every employee with color-coded risk badges:
- 🔴 **Red (High)** — Risk > 70%
- 🟡 **Yellow (Medium)** — Risk 40–70%
- 🟢 **Green (Low)** — Risk < 40%

### Employee Detail
Clicking any row opens a full profile: a gauge showing exact risk percentage, flags explaining *why* they're at risk, and specific suggestions for HR to act on.

---

## 🌍 Real-World Use Cases

### 1. Tata Motors — Factory Floor Retention
Identify skilled technicians at risk of leaving before they're headhunted by competitors. Focus retention efforts on high-performers with overtime burnout.

### 2. IT Companies — Project Continuity
Flag software engineers likely to leave mid-project. Plan knowledge transfer and backup resourcing proactively.

### 3. Healthcare — Nursing Staff
Hospitals can predict which nurses are burning out and redistribute workloads before they resign, preventing understaffing.

### 4. Retail Chains — Seasonal Planning
Predict which store managers are flight risks before peak season (Diwali, Christmas) and shore up staffing in advance.

### 5. Startups — Culture Watch
Small teams where one departure can derail everything. Early warnings let founders address concerns while they're still fixable.

---

## 📁 Folder Structure

```
TataMotors_internship/
│
├── 📦 attrition_model.pkl          ← Trained AI model (42 MB)
│
├── 📂 archive/
│   └── WA_Fn-UseC_-HR-Employee-Attrition.csv   ← Original dataset
│
├── 📂 backend/                      ← Python API server
│   ├── main.py                      ← FastAPI app (4 endpoints)
│   ├── feature_engineering.py       ← 22 engineered features + validation
│   └── requirements.txt            ← Python dependencies
│
└── 📂 frontend/                     ← React web application
    ├── index.html                   ← HTML entry point
    ├── vite.config.js               ← Build config + API proxy
    ├── package.json                 ← Node.js dependencies
    └── src/
        ├── main.jsx                 ← React entry point
        ├── App.jsx                  ← Router setup
        ├── index.css                ← Global styles (Tailwind)
        ├── api/
        │   └── api.js               ← API service (fetch calls)
        ├── components/
        │   ├── Layout.jsx           ← Header + footer shell
        │   └── SingleEmployeeForm.jsx  ← 4-step input wizard
        └── pages/
            ├── UploadPage.jsx       ← CSV upload + validation
            ├── DashboardPage.jsx    ← Charts + table + export
            └── EmployeeDetailPage.jsx  ← Risk gauge + flags
```

---

## 🚀 Installation & Setup

### Prerequisites
| Software | Version | How to install |
|----------|---------|---------------|
| Python | 3.10+ | [python.org/downloads](https://python.org/downloads) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Git | Any | [git-scm.com](https://git-scm.com) |

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/TataMotors_internship.git
cd TataMotors_internship
```

### Step 2: Start the Backend
```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Start the API server
python main.py
```
You should see: `Uvicorn running on http://0.0.0.0:8000`

> 💡 **Tip:** Visit http://localhost:8000/docs to see the interactive API documentation.

### Step 3: Start the Frontend
```bash
# Open a NEW terminal window
cd frontend
npm install
npm run dev
```
You should see: `VITE ready — Local: http://localhost:5173/`

### Step 4: Use the Application
1. Open **http://localhost:5173** in your browser
2. Upload the sample CSV from `archive/WA_Fn-UseC_-HR-Employee-Attrition.csv`
3. Click **Run Prediction**
4. Explore the dashboard!

---

## 🔮 Future Improvements

| Improvement | Benefit |
|------------|---------|
| 🔐 **User Authentication** | Login system for HR teams with role-based access |
| 📧 **Email Alerts** | Automatic notifications when new high-risk employees are detected |
| 📅 **Scheduled Predictions** | Connect to company HRMS and run predictions monthly |
| 📊 **Trend Analysis** | Track how risk scores change over time for each employee |
| 🌐 **Multi-Language** | Support for Hindi, Marathi, and other Indian languages |
| 📱 **Mobile App** | React Native companion app for managers on the go |
| 🔗 **HRMS Integration** | Direct connection to SAP SuccessFactors, Workday, or BambooHR |
| 🧠 **SHAP Explanations** | Show exactly which factors contributed most to each prediction |
| 🎯 **Retention Score** | Inverse metric showing probability of staying |
| 📊 **A/B Testing** | Compare effectiveness of different retention strategies |

---

## 📝 License

This project was developed as part of an internship program. For educational and demonstration purposes.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  <strong>Built with ❤️ for Tata Motors Internship</strong><br>
  <em>Helping HR teams make data-driven decisions, one employee at a time.</em>
</p>
