import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { ArrowLeft, Shield, AlertTriangle, Lightbulb, User, Briefcase, DollarSign, Clock } from 'lucide-react'

function RiskGauge({ score }) {
  const radius = 80
  const circumference = Math.PI * radius
  const progress = (score / 100) * circumference
  const color = score > 70 ? '#DC2626' : score >= 40 ? '#D97706' : '#0D9F6E'
  const rotation = -90

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="120" viewBox="0 0 200 120">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#1F2937"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={circumference - progress}
          style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease' }}
        />
        {/* Score text */}
        <text x="100" y="85" textAnchor="middle" fill="white" fontSize="32" fontWeight="800" fontFamily="Inter, sans-serif">
          {score}%
        </text>
        <text x="100" y="105" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="600">
          Risk Score
        </text>
      </svg>
      {/* Glow effect */}
      <div
        className="absolute bottom-0 w-32 h-16 rounded-full blur-2xl opacity-20"
        style={{ background: color }}
      />
    </div>
  )
}

function InfoCard({ icon: Icon, label, value, color = '#0078D4' }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0B1120]">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}12` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}

export default function EmployeeDetailPage({ results }) {
  const location = useLocation()
  const navigate = useNavigate()
  const employee = location.state?.employee

  if (!employee) return <Navigate to="/" replace />

  const riskColor = employee.risk_level === 'High' ? '#DC2626' : employee.risk_level === 'Medium' ? '#D97706' : '#0D9F6E'

  return (
    <div className="fade-in max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors cursor-pointer bg-transparent border-0"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Header Card */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Risk Gauge */}
          <div className="flex-shrink-0">
            <RiskGauge score={employee.risk_pct} />
          </div>

          {/* Verdict */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
              <span className="text-sm font-mono text-slate-500">Employee #{employee.employee_id}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold badge-${employee.risk_level.toLowerCase()}`}>
                {employee.risk_level} Risk
              </span>
            </div>
            <div
              className="inline-block px-6 py-3 rounded-lg text-lg font-bold mb-3"
              style={{
                background: `${riskColor}15`,
                color: riskColor,
                border: `1px solid ${riskColor}30`,
              }}
            >
              {employee.verdict === 'Likely to Leave' ? '⚠️' : '✅'} {employee.verdict}
            </div>
            <p className="text-slate-400 text-sm">
              {employee.job_role} in {employee.department}
            </p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <InfoCard icon={User} label="Age" value={employee.age} />
        <InfoCard icon={Briefcase} label="Role" value={employee.job_role} color="#1A3C6E" />
        <InfoCard icon={DollarSign} label="Income" value={`$${employee.monthly_income?.toLocaleString()}`} color="#0D9F6E" />
        <InfoCard icon={Clock} label="Tenure" value={`${employee.years_at_company} yrs`} color="#D97706" />
        <InfoCard icon={Shield} label="Job Level" value={employee.job_level} color="#0078D4" />
        <InfoCard icon={Briefcase} label="Overtime" value={employee.overtime} color={employee.overtime === 'Yes' ? '#DC2626' : '#0D9F6E'} />
        <InfoCard icon={User} label="Marital" value={employee.marital_status} color="#1A3C6E" />
        <InfoCard icon={Clock} label="Last Promo" value={`${employee.years_since_last_promotion} yrs ago`} color="#D97706" />
      </div>

      {/* Satisfaction Scores */}
      <div className="glass-card p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Satisfaction Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Job Satisfaction', value: employee.job_satisfaction, max: 4 },
            { label: 'Environment', value: employee.environment_satisfaction, max: 4 },
            { label: 'Relationship', value: employee.relationship_satisfaction, max: 4 },
          ].map((s, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-slate-400">{s.label}</span>
                <span className="text-xs font-mono text-slate-300">{s.value}/{s.max}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(s.value / s.max) * 100}%`,
                    background: s.value <= 2 ? '#DC2626' : s.value === 3 ? '#D97706' : '#0D9F6E',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Flags */}
      {employee.risk_flags && employee.risk_flags.length > 0 && (
        <div className="glass-card p-5 mb-6 border-amber-500/20">
          <h3 className="text-sm font-semibold text-amber-300 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} /> Risk Flags ({employee.risk_flags.length})
          </h3>
          <div className="space-y-3">
            {employee.risk_flags.map((flag, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <div className="w-1 rounded-full bg-amber-500/50 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-200">{flag.flag}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{flag.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HR Suggestions */}
      {employee.risk_flags && employee.risk_flags.length > 0 && (
        <div className="glass-card p-5 border-[#0078D4]/15">
          <h3 className="text-sm font-semibold text-[#3B9AE8] mb-4 flex items-center gap-2">
            <Lightbulb size={16} /> HR Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {employee.risk_flags.map((flag, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#0078D4]/5 border border-[#0078D4]/10">
                <div className="w-6 h-6 rounded-md bg-[#0078D4]/12 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#3B9AE8]">{i + 1}</span>
                </div>
                <p className="text-sm text-slate-300">{flag.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No flags message */}
      {(!employee.risk_flags || employee.risk_flags.length === 0) && (
        <div className="glass-card p-8 text-center border-emerald-500/20">
          <Shield size={32} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-emerald-300 font-semibold">No risk flags detected</p>
          <p className="text-slate-500 text-sm mt-1">This employee shows no immediate attrition risk patterns</p>
        </div>
      )}
    </div>
  )
}
