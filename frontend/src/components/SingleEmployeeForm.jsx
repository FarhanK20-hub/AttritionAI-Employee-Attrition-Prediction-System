import { useState } from 'react'
import { predictSingle } from '../api/api'
import { Loader2, Send, ChevronRight, ChevronLeft } from 'lucide-react'

const STEPS = [
  { title: 'Demographics', fields: ['Age', 'Gender', 'MaritalStatus', 'Education', 'EducationField'] },
  { title: 'Job Info', fields: ['Department', 'JobRole', 'JobLevel', 'JobInvolvement', 'BusinessTravel', 'OverTime'] },
  { title: 'Compensation', fields: ['MonthlyIncome', 'DailyRate', 'HourlyRate', 'MonthlyRate', 'PercentSalaryHike', 'StockOptionLevel'] },
  { title: 'Experience', fields: ['TotalWorkingYears', 'YearsAtCompany', 'YearsInCurrentRole', 'YearsSinceLastPromotion', 'YearsWithCurrManager', 'NumCompaniesWorked', 'TrainingTimesLastYear', 'DistanceFromHome', 'PerformanceRating', 'EnvironmentSatisfaction', 'JobSatisfaction', 'RelationshipSatisfaction', 'WorkLifeBalance'] },
]

const DROPDOWNS = {
  Gender: ['Male', 'Female'],
  MaritalStatus: ['Single', 'Married', 'Divorced'],
  BusinessTravel: ['Non-Travel', 'Travel_Rarely', 'Travel_Frequently'],
  Department: ['Research & Development', 'Sales', 'Human Resources'],
  EducationField: ['Life Sciences', 'Medical', 'Marketing', 'Technical Degree', 'Human Resources', 'Other'],
  JobRole: ['Sales Executive', 'Research Scientist', 'Laboratory Technician', 'Manufacturing Director', 'Healthcare Representative', 'Manager', 'Sales Representative', 'Research Director', 'Human Resources'],
  OverTime: ['No', 'Yes'],
}

const RANGES = {
  Age: [18, 65], Education: [1, 5], EnvironmentSatisfaction: [1, 4],
  JobInvolvement: [1, 4], JobLevel: [1, 5], JobSatisfaction: [1, 4],
  PerformanceRating: [1, 4], RelationshipSatisfaction: [1, 4],
  StockOptionLevel: [0, 3], WorkLifeBalance: [1, 4],
  NumCompaniesWorked: [0, 10], TrainingTimesLastYear: [0, 6],
  DistanceFromHome: [1, 30], PercentSalaryHike: [11, 25],
  TotalWorkingYears: [0, 40], YearsAtCompany: [0, 40],
  YearsInCurrentRole: [0, 18], YearsSinceLastPromotion: [0, 15],
  YearsWithCurrManager: [0, 17],
}

const DEFAULT = {
  Age: 30, BusinessTravel: 'Travel_Rarely', DailyRate: 800,
  Department: 'Research & Development', DistanceFromHome: 5,
  Education: 3, EducationField: 'Life Sciences',
  EnvironmentSatisfaction: 3, Gender: 'Male', HourlyRate: 65,
  JobInvolvement: 3, JobLevel: 2, JobRole: 'Research Scientist',
  JobSatisfaction: 3, MaritalStatus: 'Single', MonthlyIncome: 5000,
  MonthlyRate: 14000, NumCompaniesWorked: 2, OverTime: 'No',
  PercentSalaryHike: 14, PerformanceRating: 3,
  RelationshipSatisfaction: 3, StockOptionLevel: 1,
  TotalWorkingYears: 8, TrainingTimesLastYear: 3,
  WorkLifeBalance: 3, YearsAtCompany: 5, YearsInCurrentRole: 3,
  YearsSinceLastPromotion: 1, YearsWithCurrManager: 3,
}

export default function SingleEmployeeForm({ onResults }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ ...DEFAULT })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = { ...form }
      // Convert numeric strings to numbers
      Object.keys(RANGES).forEach(k => { payload[k] = Number(payload[k]) })
      payload.DailyRate = Number(payload.DailyRate)
      payload.HourlyRate = Number(payload.HourlyRate)
      payload.MonthlyIncome = Number(payload.MonthlyIncome)
      payload.MonthlyRate = Number(payload.MonthlyRate)

      const result = await predictSingle(payload)
      // Convert to dashboard-compatible format
      onResults({
        summary: {
          total_employees: 1,
          at_risk_count: result.verdict === 'Likely to Leave' ? 1 : 0,
          high_risk_pct: result.risk_level === 'High' ? 100 : 0,
          medium_risk_pct: result.risk_level === 'Medium' ? 100 : 0,
          low_risk_pct: result.risk_level === 'Low' ? 100 : 0,
          avg_risk_score: result.risk_pct,
          most_at_risk_department: payload.Department,
        },
        employees: [{
          employee_id: 1,
          age: payload.Age,
          department: payload.Department,
          job_role: payload.JobRole,
          monthly_income: payload.MonthlyIncome,
          overtime: payload.OverTime,
          marital_status: payload.MaritalStatus,
          years_at_company: payload.YearsAtCompany,
          job_satisfaction: payload.JobSatisfaction,
          environment_satisfaction: payload.EnvironmentSatisfaction,
          relationship_satisfaction: payload.RelationshipSatisfaction,
          job_level: payload.JobLevel,
          stock_option_level: payload.StockOptionLevel,
          years_in_current_role: payload.YearsInCurrentRole,
          years_since_last_promotion: payload.YearsSinceLastPromotion,
          num_companies_worked: payload.NumCompaniesWorked,
          total_working_years: payload.TotalWorkingYears,
          performance_rating: payload.PerformanceRating,
          distance_from_home: payload.DistanceFromHome,
          work_life_balance: payload.WorkLifeBalance,
          training_times_last_year: payload.TrainingTimesLastYear,
          employee_index: 0,
          risk_score: result.risk_score,
          risk_pct: result.risk_pct,
          verdict: result.verdict,
          risk_level: result.risk_level,
          risk_flags: result.risk_flags,
        }],
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const currentStep = STEPS[step]
  const isLast = step === STEPS.length - 1

  const renderField = (field) => {
    if (DROPDOWNS[field]) {
      return (
        <select
          value={form[field]}
          onChange={(e) => set(field, e.target.value)}
          className="input-field appearance-none cursor-pointer"
        >
          {DROPDOWNS[field].map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    }
    if (RANGES[field]) {
      const [min, max] = RANGES[field]
      return (
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={min} max={max}
            value={form[field]}
            onChange={(e) => set(field, Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-[#3B9AE8] font-mono text-sm w-8 text-right">{form[field]}</span>
        </div>
      )
    }
    return (
      <input
        type="number"
        value={form[field]}
        onChange={(e) => set(field, e.target.value)}
        className="input-field"
      />
    )
  }

  return (
    <div className="glass-card p-6 slide-up">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => setStep(i)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer border-0 ${
                i === step
                  ? 'bg-[#0078D4] text-white'
                  : i < step
                  ? 'bg-[#0D9F6E]/15 text-[#0D9F6E]'
                  : 'bg-[#1F2937] text-[#6B7280]'
              }`}
            >
              {i + 1}
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-12 h-0.5 ${i < step ? 'bg-[#0D9F6E]/30' : 'bg-[#1F2937]'}`} />
            )}
          </div>
        ))}
        <span className="ml-3 text-sm font-semibold text-slate-300">{currentStep.title}</span>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {currentStep.fields.map(field => (
          <div key={field}>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              {field.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="btn-outline flex items-center gap-2"
        >
          <ChevronLeft size={16} /> Back
        </button>
        {isLast ? (
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {loading ? 'Predicting...' : 'Submit & Predict'}
          </button>
        ) : (
          <button onClick={() => setStep(s => s + 1)} className="btn-primary flex items-center gap-2">
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
