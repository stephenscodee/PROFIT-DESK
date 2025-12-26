import { useState, useEffect } from 'react'
import api from '../services/api'

export default function TimeEntries() {
  const [entries, setEntries] = useState([])
  const [employees, setEmployees] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [formData, setFormData] = useState({
    employee_id: '',
    project_id: '',
    entry_date: new Date().toISOString().split('T')[0],
    hours: '',
    note: ''
  })

  useEffect(() => {
    fetchData()
  }, [selectedMonth])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [entriesRes, employeesRes, projectsRes] = await Promise.all([
        api.get(`/time-entries?month=${selectedMonth}`),
        api.get('/employees'),
        api.get('/projects')
      ])
      setEntries(entriesRes.data)
      setEmployees(employeesRes.data)
      setProjects(projectsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingEntry) {
        await api.put(`/time-entries/${editingEntry.id}`, formData)
      } else {
        await api.post('/time-entries', formData)
      }
      setShowModal(false)
      setEditingEntry(null)
      setFormData({
        employee_id: '',
        project_id: '',
        entry_date: new Date().toISOString().split('T')[0],
        hours: '',
        note: ''
      })
      fetchData()
    } catch (error) {
      console.error('Error saving time entry:', error)
      alert('Error al guardar entrada de tiempo')
    }
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry)
    setFormData({
      employee_id: entry.employee_id,
      project_id: entry.project_id,
      entry_date: entry.entry_date,
      hours: entry.hours,
      note: entry.note || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta entrada?')) return
    
    try {
      await api.delete(`/time-entries/${id}`)
      fetchData()
    } catch (error) {
      console.error('Error deleting time entry:', error)
      alert('Error al eliminar entrada')
    }
  }

  const openNewModal = () => {
    setEditingEntry(null)
    setFormData({
      employee_id: '',
      project_id: '',
      entry_date: new Date().toISOString().split('T')[0],
      hours: '',
      note: ''
    })
    setShowModal(true)
  }

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Registro de Horas</h1>
        <div className="flex gap-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={openNewModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Registrar Horas
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empleado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proyecto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nota
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry) => {
              const employee = employees.find(e => e.id === entry.employee_id)
              const project = projects.find(p => p.id === entry.project_id)
              return (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(entry.entry_date).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {parseFloat(entry.hours).toFixed(2)}h
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {entry.note || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {entries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay entradas de tiempo para este mes
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingEntry ? 'Editar Entrada' : 'Nueva Entrada de Tiempo'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.entry_date}
                    onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empleado
                  </label>
                  <select
                    required
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar empleado</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proyecto
                  </label>
                  <select
                    required
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar proyecto</option>
                    {projects.map(proj => (
                      <option key={proj.id} value={proj.id}>{proj.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horas
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    required
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nota (opcional)
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingEntry(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

