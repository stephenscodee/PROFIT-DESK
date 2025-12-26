import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Clock, Send, CheckCircle2 } from 'lucide-react';

const TimeTracking = () => {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    projectId: '',
    entryDate: format(new Date(), 'yyyy-MM-dd'),
    hours: '',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [empRes, projRes] = await Promise.all([
        axios.get('http://localhost:5001/api/employees'),
        axios.get('http://localhost:5001/api/projects')
      ]);
      setEmployees(empRes.data);
      setProjects(projRes.data);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5001/api/time-entries', formData);
      setSuccess(true);
      setFormData({
        ...formData,
        hours: '',
        note: ''
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Error saving time entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Time Tracking</h1>
        <p className="text-slate-400 mt-1">Log manual hours for reporting</p>
      </div>

      <div className="glass p-8 rounded-3xl relative overflow-hidden">
        {success && (
          <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300 z-10">
            <div className="flex flex-col items-center gap-2 text-emerald-400">
              <CheckCircle2 size={48} className="animate-bounce" />
              <p className="font-bold text-xl">Entry Saved!</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Employee</label>
              <select 
                className="input-field"
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                required
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Project</label>
              <select 
                className="input-field"
                value={formData.projectId}
                onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                required
              >
                <option value="">Select Project</option>
                {projects.map(proj => (
                  <option key={proj.id} value={proj.id}>{proj.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Date</label>
              <input 
                type="date" 
                className="input-field"
                value={formData.entryDate}
                onChange={(e) => setFormData({...formData, entryDate: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Hours Worked</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="number" 
                  step="0.5"
                  className="input-field pl-10"
                  placeholder="8.0"
                  value={formData.hours}
                  onChange={(e) => setFormData({...formData, hours: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Note (Optional)</label>
            <textarea 
              className="input-field h-24 resize-none"
              placeholder="What was done today?"
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full btn-primary flex items-center justify-center gap-2 py-4"
          >
            {isSubmitting ? 'Saving...' : (
              <>
                <Send size={18} />
                Submit Entry
              </>
            )}
          </button>
        </form>
      </div>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 italic text-slate-400 text-sm text-center">
        Tip: Manual tracking is great for initial validation. Integrating with Jira/Git comes next!
      </div>
    </div>
  );
};

export default TimeTracking;
