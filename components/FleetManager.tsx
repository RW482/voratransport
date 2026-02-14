import React, { useState, useMemo } from 'react';
import { Truck, TripStatus, HiredInvoice, RouteType } from '../types.ts';
import { 
  MapPin, User, Phone, Weight, Wallet, 
  ArrowRight, Plus, CheckCircle2,
  Truck as TruckIcon, Download, Share2,
  Filter, Trash2, ArrowRightLeft, CreditCard,
  ReceiptIndianRupee, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface FleetManagerProps {
  trucks: Truck[];
  updateStatus: (id: string, status: TripStatus) => void;
  addNewTruck: (truck: Omit<Truck, 'id' | 'lastUpdated' | 'status'>) => void;
  deleteTruck: (id: string) => void;
  invoices: HiredInvoice[];
}

const FleetManager: React.FC<FleetManagerProps> = ({ trucks, updateStatus, addNewTruck, deleteTruck, invoices }) => {
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeRouteType, setActiveRouteType] = useState<RouteType>('MUM_KOP');
  
  const [newTruck, setNewTruck] = useState({
    numberPlate: '',
    driverName: '',
    driverMobile: '',
    capacity: '12 Tons',
    loadedWeight: '',
    fromStation: '',
    toStation: '',
    dispatchDate: new Date().toISOString().split('T')[0],
    isHired: false,
    hiredFreightAmount: 0,
    advancePaid: 0,
    lorryOwnerName: '',
    routeType: 'MUM_KOP' as RouteType
  });

  const openFormForRoute = (route: RouteType, from: string, to: string) => {
    setActiveRouteType(route);
    setNewTruck({
      ...newTruck,
      fromStation: from,
      toStation: to,
      dispatchDate: filterDate,
      routeType: route
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTruck.numberPlate || !newTruck.driverName) return;
    addNewTruck(newTruck);
    setShowForm(false);
    setNewTruck({
      ...newTruck,
      numberPlate: '',
      driverName: '',
      driverMobile: '',
      loadedWeight: '',
      fromStation: '',
      toStation: '',
      hiredFreightAmount: 0,
      advancePaid: 0,
      isHired: false,
      lorryOwnerName: '',
      dispatchDate: filterDate,
      routeType: 'MUM_KOP',
      capacity: '12 Tons'
    });
  };

  const shareToWhatsApp = (truck: Truck) => {
    const header = `🚛 *VORA TRANSPORT CO. DISPATCH*`;
    const details = `
*Date:* ${new Date(truck.dispatchDate).toLocaleDateString()}
*Vehicle:* ${truck.numberPlate}
*Route:* ${truck.fromStation} to ${truck.toStation}
*Type:* ${truck.isHired ? `Hired (${truck.lorryOwnerName})` : 'Company Own'}
*Driver:* ${truck.driverName} (${truck.driverMobile})
*Weight:* ${truck.loadedWeight || 'Not specified'}
*Status:* ${truck.status.replace('_', ' ')}
    `.trim();
    const footer = `_Generated via LogiTrack Pro_`;
    
    const message = encodeURIComponent(`${header}\n---------------------------\n${details}\n---------------------------\n${footer}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const filteredTrucks = useMemo(() => {
    return trucks.filter(t => t.dispatchDate === filterDate);
  }, [trucks, filterDate]);

  const mumToKop = filteredTrucks.filter(t => t.routeType === 'MUM_KOP');
  const kopToMum = filteredTrucks.filter(t => t.routeType === 'KOP_MUM');
  const otherDispatches = filteredTrucks.filter(t => t.routeType === 'OTHER');

  const exportToCSV = (list: Truck[], name: string) => {
    const headers = ["Date", "From", "To", "Vehicle No", "Driver", "Mobile", "Weight", "Status", "Owner", "Freight", "Advance"];
    const rows = list.map(t => [t.dispatchDate, t.fromStation, t.toStation, t.numberPlate, t.driverName, t.driverMobile, t.loadedWeight, t.status, t.lorryOwnerName || 'Company', t.hiredFreightAmount, t.advancePaid]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `${name}_${filterDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Fleet Command</h2>
          <p className="text-slate-500 text-sm font-medium italic">Mumbai-Kolhapur Corridor Registry</p>
        </div>
        
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3 w-fit">
          <Filter size={18} className="text-slate-400" />
          <input type="date" className="bg-transparent font-bold text-slate-800 outline-none text-sm" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border-4 border-indigo-50 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg text-white"><TruckIcon size={24} /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Add Dispatch Entry</h3>
              <p className="text-xs font-medium text-slate-500 italic">Route: {activeRouteType.replace('_', ' to ')}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <InputField label="Vehicle Number" placeholder="MH-XX-XX-0000" value={newTruck.numberPlate} onChange={(v: string) => setNewTruck({...newTruck, numberPlate: v})} required />
            <InputField label="Driver Name" value={newTruck.driverName} onChange={(v: string) => setNewTruck({...newTruck, driverName: v})} required />
            <InputField label="From Station" value={newTruck.fromStation} onChange={(v: string) => setNewTruck({...newTruck, fromStation: v})} required />
            <InputField label="To Station" value={newTruck.toStation} onChange={(v: string) => setNewTruck({...newTruck, toStation: v})} required />
            <InputField label="Loaded Weight" placeholder="e.g. 15 Tons" value={newTruck.loadedWeight} onChange={(v: string) => setNewTruck({...newTruck, loadedWeight: v})} />
            <InputField label="Driver Mobile" type="tel" value={newTruck.driverMobile} onChange={(v: string) => setNewTruck({...newTruck, driverMobile: v})} />
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ownership</label>
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button type="button" onClick={() => setNewTruck({...newTruck, isHired: false})} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${!newTruck.isHired ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Own</button>
                <button type="button" onClick={() => setNewTruck({...newTruck, isHired: true})} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${newTruck.isHired ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>Hired</button>
              </div>
            </div>

            {newTruck.isHired && (
              <>
                <InputField label="Lorry Owner" value={newTruck.lorryOwnerName} onChange={(v: string) => setNewTruck({...newTruck, lorryOwnerName: v})} />
                <InputField label="Total Freight" type="number" value={newTruck.hiredFreightAmount} onChange={(v: string) => setNewTruck({...newTruck, hiredFreightAmount: Number(v)})} />
                <InputField label="Advance Paid" type="number" value={newTruck.advancePaid} onChange={(v: string) => setNewTruck({...newTruck, advancePaid: Number(v)})} />
              </>
            )}
          </div>
          <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
             <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-sm uppercase">Discard</button>
             <button type="submit" className="px-8 py-3 bg-slate-950 text-white rounded-xl font-black text-sm uppercase hover:bg-slate-900 transition-all flex items-center justify-center gap-2">Confirm Dispatch <ArrowRight size={18} /></button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-10">
        <RouteSection 
          title="Mumbai to Kolhapur" 
          trucks={mumToKop} 
          invoices={invoices}
          onAdd={() => openFormForRoute('MUM_KOP', 'Mumbai', 'Kolhapur')}
          onExport={() => exportToCSV(mumToKop, 'MUM_KOP')}
          updateStatus={updateStatus}
          deleteTruck={deleteTruck}
          shareToWhatsApp={shareToWhatsApp}
          color="indigo"
        />
        <RouteSection 
          title="Kolhapur to Mumbai" 
          trucks={kopToMum} 
          invoices={invoices}
          onAdd={() => openFormForRoute('KOP_MUM', 'Kolhapur', 'Mumbai')}
          onExport={() => exportToCSV(kopToMum, 'KOP_MUM')}
          updateStatus={updateStatus}
          deleteTruck={deleteTruck}
          shareToWhatsApp={shareToWhatsApp}
          color="emerald"
        />
      </div>

      <div className="mt-6 md:mt-10">
        <RouteSection 
          title="Manual / Other Route Dispatches" 
          trucks={otherDispatches} 
          invoices={invoices}
          onAdd={() => openFormForRoute('OTHER', '', '')}
          onExport={() => exportToCSV(otherDispatches, 'OTHER')}
          updateStatus={updateStatus}
          deleteTruck={deleteTruck}
          shareToWhatsApp={shareToWhatsApp}
          color="slate"
        />
      </div>
    </div>
  );
};

const RouteSection = ({ title, trucks, invoices, onAdd, onExport, updateStatus, deleteTruck, shareToWhatsApp, color }: any) => {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-${color}-100 pb-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-${color}-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg`}><ArrowRightLeft size={18} /></div>
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{title}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{trucks.length} Vehicles</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onExport} className="p-2.5 bg-white text-slate-400 border border-slate-200 rounded-xl hover:text-emerald-600 transition-all shadow-sm"><Download size={18}/></button>
          <button onClick={onAdd} className={`flex-1 sm:flex-none px-5 py-2.5 bg-${color}-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-${color}-700 transition-all flex items-center justify-center gap-2`}><Plus size={16}/> New Dispatch</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {trucks.map((truck: Truck) => {
          const invoiceRecord = invoices.find((inv: HiredInvoice) => inv.vehicleNo.toLowerCase() === truck.numberPlate.toLowerCase());
          const isPaidInBilling = invoiceRecord?.isPaid || false;
          const balanceDue = isPaidInBilling ? 0 : (truck.hiredFreightAmount - truck.advancePaid);

          return (
            <div key={truck.id} className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 hover:shadow-md transition-all group relative">
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 p-2 rounded-xl text-white"><TruckIcon size={20} /></div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg md:text-xl font-black text-slate-900 leading-tight uppercase">{truck.numberPlate}</h4>
                      <button 
                        onClick={() => shareToWhatsApp(truck)} 
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all flex items-center gap-1"
                        title="Share to WhatsApp"
                      >
                        <Share2 size={16}/>
                        <span className="text-[8px] font-black uppercase tracking-tighter hidden sm:inline">Share</span>
                      </button>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{truck.isHired ? `Hired: ${truck.lorryOwnerName}` : 'Company'}</p>
                  </div>
                </div>
                <div className="flex gap-1 transition-all">
                  <button onClick={() => deleteTruck(truck.id)} className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18}/></button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                <DetailItem label="Driver" value={truck.driverName} icon={<User size={12} className="text-indigo-500"/>} />
                <DetailItem label="Contact" value={truck.driverMobile} icon={<Phone size={12} className="text-indigo-500"/>} isLink href={`tel:${truck.driverMobile}`} />
                <DetailItem label="Weight" value={truck.loadedWeight} icon={<Weight size={12} className="text-indigo-500"/>} />
                <DetailItem label="Route" value={`${truck.fromStation} to ${truck.toStation}`} icon={<MapPin size={12} className="text-indigo-500"/>} />
              </div>

              {truck.isHired && (
                <div className={`mb-4 md:mb-6 p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${isPaidInBilling ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                  <div>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${isPaidInBilling ? 'text-emerald-500' : 'text-rose-400'}`}>
                      {isPaidInBilling ? 'Balance Settled' : 'Pending Payment'}
                    </p>
                    <p className={`text-lg font-black ${isPaidInBilling ? 'text-emerald-600' : 'text-rose-600'}`}>₹{balanceDue.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-slate-400 italic">Advance: ₹{truck.advancePaid.toLocaleString()}</p>
                  </div>
                  <Link to="/billing" className="w-full sm:w-auto p-2 bg-white/80 text-indigo-600 rounded-xl hover:bg-white shadow-sm transition-all flex items-center justify-center gap-2 text-xs font-bold"><ReceiptIndianRupee size={16}/> Go to Billing</Link>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                 <select 
                    value={truck.status} 
                    onChange={(e) => updateStatus(truck.id, e.target.value as TripStatus)} 
                    className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all cursor-pointer outline-none text-center sm:text-left ${
                        truck.status === TripStatus.ON_ROAD ? 'bg-indigo-600 text-white border-indigo-600' : 
                        truck.status === TripStatus.COMPLETED ? 'bg-emerald-500 text-white border-emerald-500' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {Object.values(TripStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <p className="text-[9px] font-black text-slate-300 uppercase italic text-center sm:text-right flex items-center justify-center gap-1">
                    <Calendar size={10} /> {new Date(truck.dispatchDate).toLocaleDateString()} | {new Date(truck.lastUpdated).toLocaleTimeString()}
                  </p>
              </div>
            </div>
          );
        })}
        {trucks.length === 0 && (
          <div className="py-12 text-center bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic">No {title.toLowerCase()} dispatches listed</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, icon, isLink, href }: any) => (
  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    {isLink && value ? (
      <a href={href} className="text-xs font-black text-indigo-600 flex items-center gap-2 hover:underline truncate">{icon} {value}</a>
    ) : (
      <p className="text-xs font-black text-slate-800 flex items-center gap-2 truncate">{icon} {value || '---'}</p>
    )}
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = 'text', required = false }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label} {required && '*'}</label>
    <input type={type} placeholder={placeholder} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none font-bold text-slate-800 text-sm focus:border-indigo-500 transition-all" value={value} onChange={e => onChange(e.target.value)} required={required} />
  </div>
);

export default FleetManager;