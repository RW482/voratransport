import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck as TruckIcon, 
  ChevronLeft,
  ChevronRight,
  Menu,
  BookOpen,
  ReceiptIndianRupee
} from 'lucide-react';
import { Truck, LogisticsOrder, TripStatus, HiredInvoice } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import FleetManager from './components/FleetManager.tsx';
import OrderManager from './components/OrderManager.tsx';
import BillingManager from './components/BillingManager.tsx';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [branches, setBranches] = useState<string[]>(() => {
    const saved = localStorage.getItem('logitrack_branches');
    return saved ? JSON.parse(saved) : ['Mumbai HQ', 'Kolhapur Branch'];
  });
  const [trucks, setTrucks] = useState<Truck[]>(() => {
    const saved = localStorage.getItem('logitrack_trucks');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<LogisticsOrder[]>(() => {
    const saved = localStorage.getItem('logitrack_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [invoices, setInvoices] = useState<HiredInvoice[]>(() => {
    const saved = localStorage.getItem('logitrack_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => localStorage.setItem('logitrack_branches', JSON.stringify(branches)), [branches]);
  useEffect(() => localStorage.setItem('logitrack_trucks', JSON.stringify(trucks)), [trucks]);
  useEffect(() => localStorage.setItem('logitrack_orders', JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem('logitrack_invoices', JSON.stringify(invoices)), [invoices]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const updateTruckStatus = (id: string, status: TripStatus) => {
    setTrucks(prev => prev.map(t => t.id === id ? { ...t, status, lastUpdated: new Date().toISOString() } : t));
  };

  const deleteTruck = (id: string) => {
    if (window.confirm('Are you sure you want to delete this truck entry?')) {
      setTrucks(prev => prev.filter(t => t.id !== id));
    }
  };

  const addNewTruck = (newTruckData: Omit<Truck, 'id' | 'lastUpdated' | 'status'>) => {
    const truck: Truck = {
      ...newTruckData,
      id: Math.random().toString(36).substr(2, 9),
      status: TripStatus.LOADING,
      lastUpdated: new Date().toISOString()
    };
    setTrucks(prev => [truck, ...prev]);
  };

  const addNewOrder = (newOrderData: Omit<LogisticsOrder, 'id' | 'status'>) => {
    const order: LogisticsOrder = {
      ...newOrderData,
      id: `ORD-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      status: 'PENDING'
    };
    setOrders(prev => [order, ...prev]);
  };

  const updateOrderStatus = (id: string, status: 'PENDING' | 'LOADED' | 'CANCELLED') => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const deleteOrder = (id: string) => {
    if (window.confirm('Delete this order permanently?')) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const addBranch = (name: string) => {
    if (name && !branches.includes(name)) setBranches(prev => [...prev, name]);
  };

  const deleteBranch = (name: string) => {
    if (branches.length <= 1) return alert("At least one branch must remain.");
    if (window.confirm(`Delete branch "${name}"?`)) setBranches(prev => prev.filter(b => b !== name));
  };

  const addInvoice = (invoice: Omit<HiredInvoice, 'id' | 'createdAt'>) => {
    const newInvoice: HiredInvoice = { ...invoice, id: `INV-${Date.now()}`, createdAt: new Date().toISOString() };
    setInvoices(prev => [newInvoice, ...prev]);
  };

  const toggleInvoicePaid = (id: string) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, isPaid: !inv.isPaid } : inv));
  };

  const deleteInvoice = (id: string) => {
    if (window.confirm('Delete billing record?')) setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
        {!isSidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="fixed top-6 left-6 z-50 p-3 bg-slate-950 text-white rounded-xl shadow-2xl lg:hidden border border-slate-800"
          >
            <Menu size={20} />
          </button>
        )}

        <aside 
          className={`fixed inset-y-0 left-0 z-40 bg-slate-950 text-white transition-all duration-300 ease-in-out transform shadow-2xl ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}
        >
          <button 
            onClick={toggleSidebar}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-50 bg-indigo-600 text-white p-1 rounded-full border-4 border-slate-50 shadow-xl hover:scale-110 transition-transform hidden lg:block"
          >
            {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          <div className="flex flex-col h-full border-r border-slate-800">
            <div className={`p-6 border-b border-slate-800 flex items-center h-20 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
              {isSidebarOpen ? (
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 p-2 rounded-lg shadow-inner"><TruckIcon size={20} /></div>
                  <h1 className="text-lg font-black tracking-tight uppercase">Logi<span className="text-indigo-500">Track</span></h1>
                </div>
              ) : (
                <div className="bg-indigo-600 p-2 rounded-lg"><TruckIcon size={20} /></div>
              )}
            </div>
            
            <nav className="flex-1 py-8 overflow-y-auto space-y-1">
              <SidebarItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" isOpen={isSidebarOpen} />
              <SidebarItem to="/orders" icon={<BookOpen size={20} />} label="Daily Orders" isOpen={isSidebarOpen} />
              <SidebarItem to="/fleet" icon={<TruckIcon size={20} />} label="Fleet Dispatch" isOpen={isSidebarOpen} />
              <SidebarItem to="/billing" icon={<ReceiptIndianRupee size={20} />} label="Hired Billing" isOpen={isSidebarOpen} />
            </nav>

            <div className={`p-6 border-t border-slate-800 bg-slate-900/40 ${!isSidebarOpen && 'flex justify-center'}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white shrink-0 text-sm shadow-md">V</div>
                {isSidebarOpen && (
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">Vora Transport</p>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Master Admin</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} min-h-screen pt-20 lg:pt-0`}>
          <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard trucks={trucks} orders={orders} invoices={invoices} />} />
              <Route path="/orders" element={<OrderManager orders={orders} addOrder={addNewOrder} updateStatus={updateOrderStatus} deleteOrder={deleteOrder} branches={branches} addBranch={addBranch} deleteBranch={deleteBranch} />} />
              <Route path="/fleet" element={<FleetManager trucks={trucks} updateStatus={updateTruckStatus} addNewTruck={addNewTruck} deleteTruck={deleteTruck} invoices={invoices} />} />
              <Route path="/billing" element={<BillingManager invoices={invoices} addInvoice={addInvoice} togglePaid={toggleInvoicePaid} deleteInvoice={deleteInvoice} />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

const SidebarItem: React.FC<{ to: string, icon: React.ReactNode, label: string, isOpen: boolean }> = ({ to, icon, label, isOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 border-l-4 ${isActive ? 'bg-indigo-600/10 text-white border-indigo-500' : 'text-slate-500 border-transparent hover:bg-slate-900 hover:text-slate-300'}`}
      title={label}
    >
      <div className={`${isActive ? 'text-indigo-500' : 'text-slate-600'} shrink-0 transition-colors`}>{icon}</div>
      {isOpen && <span className="font-bold text-sm tracking-tight whitespace-nowrap">{label}</span>}
    </Link>
  );
};

export default App;