import { useState, useMemo } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import {
  Users, AlertTriangle, TrendingUp, Building2, Download,
  Search, SlidersHorizontal, FileDown, ArrowUpDown
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend
} from 'recharts'

const COLORS = {
  High: '#DC2626', Medium: '#D97706', Low: '#0D9F6E',
  chart: ['#0078D4', '#1A3C6E', '#3B9AE8', '#5BA3D9', '#8BBDE0'],
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-300 font-semibold">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#c7d2fe' }} className="mt-0.5">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage({ results }) {
  const navigate = useNavigate()
  const [threshold, setThreshold] = useState(0.38)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('All')
  const [filterRole, setFilterRole] = useState('All')
  const [filterRisk, setFilterRisk] = useState('All')
  const [sortKey, setSortKey] = useState('risk_pct')
  const [sortDir, setSortDir] = useState('desc')

  if (!results) return <Navigate to="/" replace />

  const { summary, employees: rawEmployees } = results

  // Recompute risk levels based on threshold slider (client-side, no API call)
  const employees = useMemo(() => {
    return rawEmployees.map(emp => {
      const atRisk = emp.risk_score >= threshold
      let risk_level = 'Low'
      if (emp.risk_pct > 70) risk_level = 'High'
      else if (emp.risk_pct >= 40) risk_level = 'Medium'
      return { ...emp, verdict: atRisk ? 'Likely to Leave' : 'Likely to Stay', risk_level }
    })
  }, [rawEmployees, threshold])

  // Derived stats
  const stats = useMemo(() => {
    const atRisk = employees.filter(e => e.verdict === 'Likely to Leave')
    const high = employees.filter(e => e.risk_level === 'High')
    const medium = employees.filter(e => e.risk_level === 'Medium')
    const low = employees.filter(e => e.risk_level === 'Low')
    const avgScore = employees.reduce((s, e) => s + e.risk_pct, 0) / employees.length

    const deptRisk = {}
    employees.forEach(e => {
      deptRisk[e.department] = deptRisk[e.department] || []
      deptRisk[e.department].push(e.risk_pct)
    })
    const mostAtRisk = Object.entries(deptRisk).sort((a, b) =>
      b[1].reduce((s,v) => s+v, 0)/b[1].length - a[1].reduce((s,v) => s+v, 0)/a[1].length
    )[0]?.[0] || 'N/A'

    return {
      total: employees.length,
      atRisk: atRisk.length,
      highPct: ((high.length / employees.length) * 100).toFixed(1),
      medPct: ((medium.length / employees.length) * 100).toFixed(1),
      lowPct: ((low.length / employees.length) * 100).toFixed(1),
      avgScore: avgScore.toFixed(1),
      mostAtRisk,
    }
  }, [employees])

  // Chart data
  const deptData = useMemo(() => {
    const map = {}
    employees.forEach(e => {
      map[e.department] = map[e.department] || { name: e.department, count: 0, avgRisk: 0, total: 0 }
      map[e.department].count++
      map[e.department].total += e.risk_pct
    })
    return Object.values(map).map(d => ({ ...d, avgRisk: (d.total / d.count).toFixed(1) }))
  }, [employees])

  const roleData = useMemo(() => {
    const map = {}
    employees.forEach(e => {
      map[e.job_role] = map[e.job_role] || { name: e.job_role, count: 0, atRisk: 0 }
      map[e.job_role].count++
      if (e.verdict === 'Likely to Leave') map[e.job_role].atRisk++
    })
    return Object.values(map).sort((a, b) => b.atRisk - a.atRisk)
  }, [employees])

  const overtimeData = useMemo(() => {
    const yes = employees.filter(e => e.overtime === 'Yes')
    const no = employees.filter(e => e.overtime === 'No')
    return [
      { name: 'Overtime', atRisk: yes.filter(e => e.verdict === 'Likely to Leave').length, safe: yes.filter(e => e.verdict === 'Likely to Stay').length },
      { name: 'No Overtime', atRisk: no.filter(e => e.verdict === 'Likely to Leave').length, safe: no.filter(e => e.verdict === 'Likely to Stay').length },
    ]
  }, [employees])

  const maritalData = useMemo(() => {
    const map = {}
    employees.forEach(e => {
      map[e.marital_status] = (map[e.marital_status] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [employees])

  const histogramData = useMemo(() => {
    const bins = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10}-${(i + 1) * 10}%`,
      count: 0,
    }))
    employees.forEach(e => {
      const bin = Math.min(Math.floor(e.risk_pct / 10), 9)
      bins[bin].count++
    })
    return bins
  }, [employees])

  // Filtering + Sorting
  const departments = [...new Set(employees.map(e => e.department))]
  const roles = [...new Set(employees.map(e => e.job_role))]

  const filtered = useMemo(() => {
    let list = [...employees]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(e =>
        String(e.employee_id).includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.job_role.toLowerCase().includes(q)
      )
    }
    if (filterDept !== 'All') list = list.filter(e => e.department === filterDept)
    if (filterRole !== 'All') list = list.filter(e => e.job_role === filterRole)
    if (filterRisk !== 'All') list = list.filter(e => e.risk_level === filterRisk)

    list.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey]
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase() }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [employees, search, filterDept, filterRole, filterRisk, sortKey, sortDir])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  // Export CSV
  const exportCSV = () => {
    const headers = ['Employee ID', 'Department', 'Role', 'Income', 'Risk %', 'Risk Level', 'Verdict']
    const rows = filtered.map(e => [e.employee_id, e.department, e.job_role, e.monthly_income, e.risk_pct, e.risk_level, e.verdict])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'attrition_results.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  // Export PDF
  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf')
    await import('jspdf-autotable')
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.setTextColor(99, 102, 241)
    doc.text('Employee Attrition Report', 14, 22)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleString()} | Threshold: ${(threshold * 100).toFixed(0)}%`, 14, 30)

    // Summary
    doc.setFontSize(12)
    doc.setTextColor(40)
    doc.text('Summary', 14, 42)
    doc.setFontSize(10)
    doc.text(`Total Employees: ${stats.total}`, 14, 50)
    doc.text(`At Risk: ${stats.atRisk}`, 14, 56)
    doc.text(`High Risk: ${stats.highPct}%  |  Medium: ${stats.medPct}%  |  Low: ${stats.lowPct}%`, 14, 62)
    doc.text(`Average Risk Score: ${stats.avgScore}%`, 14, 68)
    doc.text(`Most At-Risk Department: ${stats.mostAtRisk}`, 14, 74)

    // Table
    doc.autoTable({
      startY: 84,
      head: [['ID', 'Department', 'Role', 'Income', 'Risk %', 'Level', 'Verdict']],
      body: filtered.map(e => [e.employee_id, e.department, e.job_role, `$${e.monthly_income}`, `${e.risk_pct}%`, e.risk_level, e.verdict]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [99, 102, 241] },
    })

    doc.save('attrition_report.pdf')
  }

  const SortHeader = ({ label, field, className = '' }) => (
    <th
      onClick={() => toggleSort(field)}
      className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 select-none ${className}`}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={12} className={sortKey === field ? 'text-[#0078D4]' : 'text-[#374151]'} />
      </span>
    </th>
  )

  return (
    <div className="fade-in space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: '#0078D4' },
          { label: 'At Risk', value: stats.atRisk, icon: AlertTriangle, color: '#DC2626' },
          { label: 'High Risk', value: `${stats.highPct}%`, icon: TrendingUp, color: '#DC2626' },
          { label: 'Medium Risk', value: `${stats.medPct}%`, icon: TrendingUp, color: '#D97706' },
          { label: 'Low Risk', value: `${stats.lowPct}%`, icon: TrendingUp, color: '#0D9F6E' },
          { label: 'Avg Score', value: `${stats.avgScore}%`, icon: SlidersHorizontal, color: '#3B9AE8' },
          { label: 'Top Dept', value: stats.mostAtRisk.split(' ')[0], icon: Building2, color: '#D97706' },
        ].map((card, i) => (
          <div key={i} className="glass-card p-4 slide-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={14} style={{ color: card.color }} />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{card.label}</span>
            </div>
            <p className="text-xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Threshold Slider */}
      <div className="glass-card p-4 flex items-center gap-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
          Risk Threshold
        </span>
        <input
          type="range"
          min={0.2} max={0.8} step={0.01}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="flex-1 accent-indigo-500"
        />
        <span className="text-[#3B9AE8] font-mono font-bold text-sm w-12 text-right">
          {(threshold * 100).toFixed(0)}%
        </span>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk Score Histogram */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Risk Score Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Employees" fill="#0078D4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Chart */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Risk by Department</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 10 }} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgRisk" name="Avg Risk %" fill="#1A3C6E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Job Role Breakdown */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">At-Risk by Job Role</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={roleData.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="atRisk" name="At Risk" fill="#DC2626" radius={[4, 4, 0, 0]} />
              <Bar dataKey="count" name="Total" fill="#1F2937" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Overtime + Marital Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Overtime Impact</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={overtimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="atRisk" name="At Risk" stackId="a" fill="#DC2626" radius={[0, 0, 0, 0]} />
                <Bar dataKey="safe" name="Safe" stackId="a" fill="#0D9F6E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Marital Status</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={maritalData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={65} innerRadius={35} paddingAngle={4}>
                  {maritalData.map((_, i) => (
                    <Cell key={i} fill={COLORS.chart[i % COLORS.chart.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={16} className="text-slate-500" />
          <input
            type="text" placeholder="Search by ID, department, role..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-field"
          />
        </div>
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="input-field w-auto">
          <option value="All">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="input-field w-auto">
          <option value="All">All Roles</option>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className="input-field w-auto">
          <option value="All">All Risk Levels</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Results Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <SortHeader label="ID" field="employee_id" />
                <SortHeader label="Department" field="department" />
                <SortHeader label="Role" field="job_role" />
                <SortHeader label="Income" field="monthly_income" />
                <SortHeader label="Risk %" field="risk_pct" />
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Level</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => (
                <tr
                  key={emp.employee_id + '-' + i}
                  onClick={() => navigate(`/employee/${i}`, { state: { employee: emp } })}
                  className="border-t border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-mono text-slate-300">#{emp.employee_id}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{emp.department}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{emp.job_role}</td>
                  <td className="px-4 py-3 text-sm text-slate-300 font-mono">${emp.monthly_income.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${emp.risk_pct}%`,
                            background: emp.risk_level === 'High' ? '#DC2626' : emp.risk_level === 'Medium' ? '#D97706' : '#0D9F6E',
                          }}
                        />
                      </div>
                      <span className="text-sm font-mono font-semibold text-slate-300">{emp.risk_pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold badge-${emp.risk_level.toLowerCase()}`}>
                      {emp.risk_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{emp.verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-slate-500">Showing {filtered.length} of {employees.length} employees</span>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3">
        <button onClick={exportCSV} className="btn-outline flex items-center gap-2">
          <FileDown size={16} /> Export CSV
        </button>
        <button onClick={exportPDF} className="btn-outline flex items-center gap-2">
          <Download size={16} /> Export PDF Report
        </button>
      </div>
    </div>
  )
}
