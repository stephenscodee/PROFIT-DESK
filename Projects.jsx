import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency, getStatusColor } from '../utils/formatters';
import { FolderPlus, Trash2, Edit2, Briefcase } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', priceType: 'FIXED', priceValue: '' });

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get('http://localhost:5001/api/projects');
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/projects', newProject);
      setShowModal(false);
      setNewProject({ name: '', priceType: 'FIXED', priceValue: '' });
      fetchProjects();
    } catch (err) {
      alert('Error creating project');
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert('Error deleting project');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-slate-400 mt-1">Track revenue and client agreements</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FolderPlus size={18} />
          New Project
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Project Name</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Pricing Model</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rate / Value</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {projects.map((proj) => (
              <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-medium text-slate-200">{proj.name}</td>
                <td className="p-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                    proj.priceType === 'FIXED' 
                      ? 'text-purple-400 border-purple-400/20 bg-purple-400/10' 
                      : 'text-sky-400 border-sky-400/20 bg-sky-400/10'
                  }`}>
                    {proj.priceType}
                  </span>
                </td>
                <td className="p-4 text-slate-300">
                  {formatCurrency(proj.priceValue)}
                  {proj.priceType === 'HOURLY' && '/h'}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-sky-400 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteProject(proj.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 && !isLoading && (
              <tr>
                <td colSpan="4" className="p-12 text-center text-slate-500 italic">
                  No projects found. Create your first project to start tracking.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass w-full max-w-md rounded-2xl p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6">New Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Project Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Website Redesign"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Pricing Model</label>
                <select 
                  className="input-field"
                  value={newProject.priceType}
                  onChange={(e) => setNewProject({...newProject, priceType: e.target.value})}
                >
                  <option value="FIXED">Monthly Fixed Price</option>
                  <option value="HOURLY">Hourly Rate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  {newProject.priceType === 'FIXED' ? 'Monthly Revenue (€)' : 'Hourly Rate (€/h)'}
                </label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="2500"
                  value={newProject.priceValue}
                  onChange={(e) => setNewProject({...newProject, priceValue: e.target.value})}
                  required 
                />
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
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
