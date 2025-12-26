import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency, getStatusColor } from '../utils/formatters';
import { format } from 'date-fns';
import { TrendingUp, Users, FolderKanban, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:5001/api/reports/summary?month=${month}`);
        setData(data);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [month]);

  if (isLoading) return <div className="text-slate-500 italic">Updating data...</div>;

  const stats = [
    { 
      label: 'Monthly Profit', 
      value: formatCurrency(data?.totalProfit || 0), 
      icon: TrendingUp,
      color: data?.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
    },
    { 
      label: 'Active Projects', 
      value: data?.projects.length || 0, 
      icon: FolderKanban,
      color: 'text-sky-400'
    },
    { 
      label: 'Team Size', 
      value: data?.employees.length || 0, 
      icon: Users,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Overview</h1>
          <p className="text-slate-400 mt-1">Real-time profitability insights</p>
        </div>
        <input 
          type="month" 
          className="input-field w-auto" 
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
            <h2 className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Projects */}
        <section className="glass rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-200">Projects Health</h3>
          </div>
          <div className="divide-y divide-white/5">
            {data?.projects.map(project => (
              <div key={project.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div>
                  <p className="font-bold text-slate-100">{project.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{project.hours} business hours</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${project.margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(project.margin)}
                  </p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-2 border ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Employees */}
        <section className="glass rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-200">Employee Performance</h3>
          </div>
          <div className="divide-y divide-white/5">
            {data?.employees.map(employee => (
              <div key={employee.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div>
                  <p className="font-bold text-slate-100">{employee.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Cost: {formatCurrency(employee.monthlyCost)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${employee.margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(employee.margin)}
                  </p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-2 border ${getStatusColor(employee.status)}`}>
                    {employee.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
