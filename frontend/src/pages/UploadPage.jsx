import { useState, useCallback } from 'react'
import { UploadCloud, FileText, AlertTriangle, CheckCircle2, Download, Users, Loader2 } from 'lucide-react'
import { predictBulk, downloadTemplate } from '../api/api'
import SingleEmployeeForm from '../components/SingleEmployeeForm'

const REQUIRED_COLUMNS = [
  'Age','BusinessTravel','DailyRate','Department','DistanceFromHome',
  'Education','EducationField','EnvironmentSatisfaction','Gender',
  'HourlyRate','JobInvolvement','JobLevel','JobRole','JobSatisfaction',
  'MaritalStatus','MonthlyIncome','MonthlyRate','NumCompaniesWorked',
  'OverTime','PercentSalaryHike','PerformanceRating',
  'RelationshipSatisfaction','StockOptionLevel','TotalWorkingYears',
  'TrainingTimesLastYear','WorkLifeBalance','YearsAtCompany',
  'YearsInCurrentRole','YearsSinceLastPromotion','YearsWithCurrManager',
]

export default function UploadPage({ onResults }) {
  const [mode, setMode] = useState('csv') // 'csv' | 'single'
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [validation, setValidation] = useState(null) // {valid, rows, missing, extra}
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const validateCSV = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.trim().split('\n')
      if (lines.length < 2) {
        setValidation({ valid: false, error: 'CSV file is empty or has no data rows.' })
        return
      }
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const rows = lines.length - 1
      const missing = REQUIRED_COLUMNS.filter(c => !headers.includes(c))
      const extra = headers.filter(c => !REQUIRED_COLUMNS.includes(c) && c !== 'Attrition' && c !== 'EmployeeNumber' && c !== 'EmployeeCount' && c !== 'Over18' && c !== 'StandardHours')

      setValidation({
        valid: missing.length === 0,
        rows,
        headers: headers.length,
        missing,
        extra,
      })
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.name.endsWith('.csv')) {
      setFile(f)
      setError(null)
      validateCSV(f)
    } else {
      setError('Please upload a CSV file.')
    }
  }, [validateCSV])

  const handleFileSelect = (e) => {
    const f = e.target.files[0]
    if (f) {
      setFile(f)
      setError(null)
      validateCSV(f)
    }
  }

  const handleSubmit = async () => {
    if (!file || !validation?.valid) return
    setLoading(true)
    setError(null)
    try {
      const data = await predictBulk(file)
      onResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in">
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Predict Employee Attrition</h2>
        <p className="text-slate-400 text-sm">Upload employee data or enter details manually for AI-powered risk analysis</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('csv')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            mode === 'csv'
              ? 'bg-[#0078D4]/12 text-[#3B9AE8] border border-[#0078D4]/30'
              : 'bg-white/[0.03] text-[#6B7280] border border-[#1F2937] hover:border-[#374151]'
          }`}
        >
          <UploadCloud size={16} />
          CSV Upload
        </button>
        <button
          onClick={() => setMode('single')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            mode === 'single'
              ? 'bg-[#0078D4]/12 text-[#3B9AE8] border border-[#0078D4]/30'
              : 'bg-white/[0.03] text-[#6B7280] border border-[#1F2937] hover:border-[#374151]'
          }`}
        >
          <Users size={16} />
          Single Employee
        </button>
      </div>

      {mode === 'csv' ? (
        <div className="space-y-6">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            className={`glass-card p-12 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-[#0078D4] bg-[#0078D4]/5' : ''
            }`}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input id="file-input" type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#0078D4]/10">
                <UploadCloud size={26} className="text-[#0078D4]" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">
                  {file ? file.name : 'Drop your CSV file here'}
                </p>
                <p className="text-slate-500 text-sm">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click to browse • CSV format required'}
                </p>
              </div>
            </div>
          </div>

          {/* Validation Results */}
          {validation && (
            <div className={`glass-card p-5 slide-up ${validation.valid ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
              <div className="flex items-start gap-3">
                {validation.valid ? (
                  <CheckCircle2 size={20} className="text-emerald-400 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle size={20} className="text-red-400 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  {validation.error ? (
                    <p className="text-red-300 text-sm">{validation.error}</p>
                  ) : (
                    <>
                      <p className={`font-semibold text-sm ${validation.valid ? 'text-emerald-300' : 'text-red-300'}`}>
                        {validation.valid ? 'Validation passed' : 'Validation failed'}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        {validation.rows} employees detected • {validation.headers} columns found
                      </p>
                      {validation.missing.length > 0 && (
                        <div className="mt-3">
                          <p className="text-red-400 text-xs font-semibold mb-1">Missing columns ({validation.missing.length}):</p>
                          <div className="flex flex-wrap gap-1.5">
                            {validation.missing.map(c => (
                              <span key={c} className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-300 text-xs font-mono">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="glass-card p-4 border-red-500/30">
              <p className="text-red-300 text-sm flex items-center gap-2">
                <AlertTriangle size={16} /> {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={!file || !validation?.valid || loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              {loading ? 'Analyzing...' : 'Run Prediction'}
            </button>
            <button onClick={downloadTemplate} className="btn-outline flex items-center gap-2">
              <Download size={16} />
              Download Template
            </button>
          </div>

          {/* Info */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <FileText size={14} /> Required Columns (30)
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {REQUIRED_COLUMNS.map(c => (
                <span key={c} className="px-2 py-1 rounded bg-[#1F2937] text-[#6B7280] text-[11px] font-mono">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <SingleEmployeeForm onResults={onResults} />
      )}
    </div>
  )
}
