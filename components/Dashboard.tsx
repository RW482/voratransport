import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, XAxis, YAxis
} from 'recharts';
import { BrainCircuit, Loader2, TrendingUp, Wallet, CreditCard, ShoppingBag, Truck as TruckIcon } from 'lucide-react';
import { Truck, LogisticsOrder, HiredInvoice } from '../types.ts';
import { getLogisticsInsights } from '../services/geminiService.ts';

interface DashboardProps {
  trucks: Truck[];
  orders: LogisticsOrder[];
  invoices: HiredInvoice[];
}

const Dashboard: React.FC<DashboardProps> = ({ trucks, orders, invoices }) => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(true);

  const hiredTrucks = trucks.filter(t => t.isHired);
  const totalAdvanceGiven = hiredTrucks.reduce((acc, t) => acc + (t.advancePaid || 0), 0);
  
  const totalBalanceDue = hiredTrucks.reduce((acc, t) => {
    const invoiceRecord = invoices.find(inv => inv.vehicleNo.toLowerCase() === t.numberPlate.toLowerCase());
    if (invoiceRecord?.isPaid) return acc;
    return acc + ((t.hiredFreightAmount || 0) - (t.advancePaid || 0));
  }, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;

  const fetchInsight = async () => {
    setLoadingAi(true);
    const insight = await getLogisticsInsights({ trucks, orders });
    setAiInsight(insight || 'Focus on optimizing Mumbai loads today.');
    setLoadingAi(false);
  };

  useEffect(() => {
    fetchInsight();
  }, [trucks, orders]);

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Vora Console</h2>
          <p className="text-slate-500 font-medium text-sm md:text-lg italic tracking-wide mt-1">Strategic corridor logistics hub</p>
        </div>
        <div className="px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-600 tracking-widest uppercase whitespace-nowrap">Live Status: Active</span>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KPICard title="Total Trips" value={trucks.length.toString()} color="indigo" icon={<TrendingUp size={24} />} />
        <KPICard title="Pending Bookings" value={pendingOrdersCount.toString()} color="orange" icon={<ShoppingBag size={24} />} />
        <KPICard title="Total Advance" value={`₹${totalAdvanceGiven.toLocaleString()}`} color="emerald" icon={<Wallet size={24} />} />
        <KPICard title="Hired Balance" value={`₹${totalBalanceDue.toLocaleString()}`} color="rose" icon={<CreditCard size={24} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-7 xl:col-span-8 space-y-6 md:space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3 uppercase">
              <TruckIcon className="text-indigo-500" size={20} /> Operational Flow
            </h3>
            <div className="h-48 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  {name: 'M', trips: 4}, {name: 'T', trips: 7}, {name: 'W', trips: 5},
                  {name: 'T', trips: 9}, {name: 'F', trips: 12}, {name: 'S', trips: 8}, {name: 'S', trips: 3}
                ]}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" hide />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="trips" stroke="#6366f1" strokeWidth={4} fill="url(#chartGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Queue</h3>
                <Link to="/orders" className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">View All</Link>
             </div>
             <div className="space-y-3">
               {orders.slice(0, 3).map(o => (
                 <div key={o.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="min-w-0">
                      <p className="font-black text-slate-800 uppercase text-xs truncate">{o.partyName}</p>
                      <p className="text-[9px] font-bold text-slate-400 truncate">Branch: {o.branch} • Weight: {o.weight}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${o.status === 'LOADED' ? 'bg-emerald-500 text-white' : 'bg-orange-100 text-orange-600'}`}>{o.status}</span>
                 </div>
               ))}
               {orders.length === 0 && <p className="text-center py-6 text-slate-300 text-xs italic">No bookings found.</p>}
             </div>
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 h-full">
          <div className="bg-slate-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl h-full flex flex-col min-h-[350px]">
            <div className="relative z-10 flex items-center gap-3 mb-6">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <BrainCircuit className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-black tracking-tight uppercase">AI Advisor</h3>
            </div>
            
            <div className="relative z-10 flex-1">
              {loadingAi ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
                  <Loader2 className="animate-spin" size={28} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Analyzing Logistics...</p>
                </div>
              ) : (
                <div className="text-slate-300 font-medium leading-relaxed italic text-base border-l-4 border-indigo-500 pl-4 py-2">
                  {aiInsight}
                </div>
              )}
            </div>

            <div className="pt-6 relative z-10 mt-auto">
              <button 
                onClick={() => fetchInsight()}
                className="w-full py-3 bg-white text-slate-950 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all hover:bg-indigo-500 hover:text-white"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, color, icon }: any) => (
  <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-indigo-200 transition-all">
    <div className={`w-10 h-10 md:w-14 md:h-14 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center mb-3 transition-all group-hover:bg-${color}-600 group-hover:text-white`}>
      {icon}
    </div>
    <h4 className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h4>
    <p className="text-lg md:text-2xl font-black text-slate-900 leading-none">{value}</p>
  </div>
);

export default Dashboard;