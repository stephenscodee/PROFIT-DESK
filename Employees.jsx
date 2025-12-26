import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency, getStatusColor } from '../utils/formatters';
import { Plus, Trash2, Edit2, UserPlus } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', monthlyCost: '', hoursPerMonth: 160 });

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get('http://localhost:5001/api/employees');
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/employees', newEmployee);
      setShowModal(false);
      setNewEmployee({ name: '', monthlyCost: '', hoursPerMonth: 160 });
      fetchEmployees();
    } catch (err) {
      alert('Error creating employee');
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      alert('Error deleting employee');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-slate-400 mt-1">Manage team costs and assignments</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus size={18} />
          Add Employee
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Cost</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Base Hours</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Hourly Cost</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-medium text-slate-200">{emp.name}</td>
                <td className="p-4 text-slate-300">{formatCurrency(emp.monthlyCost)}</td>
                <td className="p-4 text-slate-300">{emp.hoursPerMonth}h</td>
                <td className="p-4 text-slate-300 italic">
                  {formatCurrency(emp.monthlyCost / emp.hoursPerMonth)}/h
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-sky-400 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteEmployee(emp.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {employees.length === 0 && !isLoading && (
              <tr>
                <td colSpan="5" className="p-12 text-center text-slate-500 italic">
                  No employees found. Start by adding one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass w-full max-w-md rounded-2xl p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6">New Employee</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Jane Doe"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Monthly Cost (€)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="3000"
                    value={newEmployee.monthlyCost}
                    onChange={(e) => setNewEmployee({...newEmployee, monthlyCost: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Monthly Hours</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="160"
                    value={newEmployee.hoursPerMonth}
                    onChange={(e) => setNewEmployee({...newEmployee, hoursPerMonth: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-700 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
