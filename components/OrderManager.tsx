
import React, { useState, useMemo } from 'react';
import { LogisticsOrder } from '../types';
import { 
  Plus, User, Building, Phone, 
  MapPin, Clipboard, Search, CheckCircle2, XCircle, 
  Share2, ClipboardCheck, Trash2, PlusCircle, Package, Weight
} from 'lucide-react';

interface OrderManagerProps {
  orders: LogisticsOrder[];
  addOrder: (order: Omit<LogisticsOrder, 'id' | 'status'>) => void;
  updateStatus: (id: string, status: 'PENDING' | 'LOADED' | 'CANCELLED') => void;
  deleteOrder: (id: string) => void;
  branches: string[];
  addBranch: (name: string) => void;
  deleteBranch: (name: string) => void;
}

const OrderManager: React.FC<OrderManagerProps> = ({ orders, addOrder, updateStatus, deleteOrder, branches, addBranch, deleteBranch }) => {
  const [showForm, setShowForm] = useState(false);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newBranchName, setNewBranchName] = useState('');

  const [newOrder, setNewOrder] = useState({
    partyName: '',
    broker: '',
    mobileNo: '',
    plotNo: '',
    weight: '',
    remark: '',
    orderDate: new Date().toISOString().split('T')[0],
    branch: branches[0] || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.partyName) return;
    addOrder(newOrder);
    setNewOrder({
      ...newOrder,
      partyName: '',
      broker: '',
      mobileNo: '',
      plotNo: '',
      weight: '',
      remark: '',
      orderDate: filterDate,
      branch: branches[0] || ''
    });
    setShowForm(false);
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBranchName) {
      addBranch(newBranchName);
      setNewBranchName('');
      setShowBranchForm(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesDate = o.orderDate === filterDate;
      const matchesSearch = o.partyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            o.broker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            o.plotNo.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [orders, filterDate, searchTerm]);

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      <style>{`
        .order-card { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .order-loaded { transform: translateY(-4px); border-color: #10b981 !important; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.1); }
        .order-cancelled { opacity: 0.5; filter: grayscale(0.5); transform: scale(0.98); }
        .booking-badge { animation: popIn 0.3s ease-out; }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Booking Pipeline</h2>
          <p className="text-slate-500 text-sm font-medium italic underline decoration-indigo-200">Daily Logistics Inventory</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
            <Search size={18} className="text-slate-400 pl-1" />
            <input type="text" placeholder="Search..." className="bg-transparent font-bold text-slate-800 outline-none text-sm w-24 sm:w-32" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <div className="w-[1px] h-5 bg-slate-200 mx-1" />
            <input type="date" className="bg-transparent font-bold text-slate-800 outline-none text-sm" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          </div>

          <div className="flex gap-2">
            <button onClick={() => setShowBranchForm(!showBranchForm)} className="p-3 bg-white text-emerald-600 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-sm" title="Add Branch">
              <Building size={20} />
            </button>
            <button onClick={() => setShowForm(!showForm)} className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl ${showForm ? 'bg-slate-200 text-slate-700' : 'bg-indigo-600 text-white shadow-indigo-500/20'}`}>
              {showForm ? 'Cancel' : <><Plus size={18} /> New Booking</>}
            </button>
          </div>
        </div>
      </div>

      {showBranchForm && (
        <form onSubmit={handleAddBranch} className="bg-white p-6 rounded-3xl border-4 border-emerald-50 shadow-2xl animate-in slide-in-from-top-4 duration-400">
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" placeholder="New Branch Name..." className="flex-1 px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-emerald-500 outline-none font-bold text-slate-800" value={newBranchName} onChange={e => setNewBranchName(e.target.value)} required />
            <button type="submit" className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm uppercase hover:bg-emerald-700 transition-all shadow-xl">Add Branch</button>
          </div>
        </form>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border-4 border-indigo-50 shadow-2xl animate-in slide-in-from-top-4 duration-400">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <InputField label="Party Name" placeholder="Merchant name" value={newOrder.partyName} onChange={(v: string) => setNewOrder({...newOrder, partyName: v})} required />
            <InputField label="Broker / Agent" value={newOrder.broker} onChange={(v: string) => setNewOrder({...newOrder, broker: v})} />
            <InputField label="Mobile No" type="tel" value={newOrder.mobileNo} onChange={(v: string) => setNewOrder({...newOrder, mobileNo: v})} />
            <InputField label="Plot / Location" value={newOrder.plotNo} onChange={(v: string) => setNewOrder({...newOrder, plotNo: v})} />
            <InputField label="Weight" value={newOrder.weight} onChange={(v: string) => setNewOrder({...newOrder, weight: v})} />
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Source Branch</label>
              <select className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none font-bold text-slate-800 text-sm focus:border-indigo-500" value={newOrder.branch} onChange={e => setNewOrder({...newOrder, branch: e.target.value})}>
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button type="submit" className="w-full sm:w-auto px-10 py-3.5 bg-slate-950 text-white rounded-xl font-black text-sm uppercase hover:bg-slate-900 transition-all flex items-center justify-center gap-2">Save Booking <CheckCircle2 size={18} /></button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {branches.map(branchName => (
          <div key={branchName} className="space-y-4 md:space-y-6 bg-white/40 p-4 rounded-[2rem] border border-slate-100">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3 px-2">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black">
                  <Building size={16} />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate max-w-[120px] sm:max-w-none">{branchName}</h3>
              </div>
              <button onClick={() => deleteBranch(branchName)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
            </div>

            <div className="space-y-4">
              {filteredOrders.filter(o => o.branch === branchName).map(order => (
                <div 
                  key={order.id} 
                  className={`order-card bg-white rounded-2xl border border-slate-200 p-5 shadow-sm group relative ${order.status === 'LOADED' ? 'order-loaded bg-emerald-50' : order.status === 'CANCELLED' ? 'order-cancelled' : ''}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-base font-black text-slate-900 uppercase leading-tight truncate pr-6">{order.partyName}</h4>
                    <button onClick={() => deleteOrder(order.id)} className="absolute top-4 right-4 p-1.5 text-slate-200 hover:text-rose-500 transition-all md:opacity-0 md:group-hover:opacity-100"><Trash2 size={14}/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <OrderInfoItem label="Broker" value={order.broker} icon={<User size={10}/>} />
                    <OrderInfoItem label="Weight" value={order.weight} icon={<Weight size={10}/>} />
                  </div>
                  
                  <div className="flex gap-2">
                    {order.status === 'PENDING' ? (
                      <>
                        <button 
                          onClick={() => updateStatus(order.id, 'LOADED')} 
                          className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={12}/> Confirm Load
                        </button>
                        <button 
                          onClick={() => updateStatus(order.id, 'CANCELLED')} 
                          className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                          title="Cancel"
                        >
                          <XCircle size={14}/>
                        </button>
                      </>
                    ) : (
                      <div className={`w-full py-2 rounded-lg text-center text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${order.status === 'LOADED' ? 'text-emerald-600 bg-emerald-100/50' : 'text-rose-600 bg-rose-100/50'}`}>
                        {order.status === 'LOADED' && <CheckCircle2 size={12}/>}
                        {order.status}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredOrders.filter(o => o.branch === branchName).length === 0 && (
                <div className="py-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Empty</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, placeholder, type = 'text', required = false }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label} {required && '*'}</label>
    <input type={type} placeholder={placeholder} className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none font-bold text-slate-800 text-sm transition-all focus:border-indigo-500" value={value} onChange={e => onChange(e.target.value)} required={required} />
  </div>
);

const OrderInfoItem = ({ label, value, icon }: any) => (
  <div className="min-w-0">
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">{label}</p>
    <p className="text-xs font-black text-slate-700 truncate flex items-center gap-1">{icon} {value || '---'}</p>
  </div>
);

export default OrderManager;
