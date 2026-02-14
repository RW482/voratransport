import React, { useState, useMemo, useRef } from 'react';
import { HiredInvoice } from '../types.ts';
import { 
  Plus, ReceiptIndianRupee, User, Truck as TruckIcon, 
  MapPin, Wallet, CreditCard, CheckCircle2, 
  XCircle, Trash2, Search, Download, 
  ClipboardCheck, Phone, Scale, UserCheck, Printer
} from 'lucide-react';

interface BillingManagerProps {
  invoices: HiredInvoice[];
  addInvoice: (invoice: Omit<HiredInvoice, 'id' | 'createdAt'>) => void;
  togglePaid: (id: string) => void;
  deleteInvoice: (id: string) => void;
}

const BillingManager: React.FC<BillingManagerProps> = ({ invoices, addInvoice, togglePaid, deleteInvoice }) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePrintInvoice, setActivePrintInvoice] = useState<HiredInvoice | null>(null);

  const [form, setForm] = useState({
    lorryOwnerName: '',
    driverName: '',
    mobileNo: '',
    vehicleNo: '',
    from: '',
    to: '',
    amount: 0,
    totalWeight: '',
    advance: 0,
    gPayName: '',
    gPayNumber: '',
    isPaid: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInvoice(form);
    setForm({
      lorryOwnerName: '',
      driverName: '',
      mobileNo: '',
      vehicleNo: '',
      from: '',
      to: '',
      amount: 0,
      totalWeight: '',
      advance: 0,
      gPayName: '',
      gPayNumber: '',
      isPaid: false
    });
    setShowForm(false);
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => 
      inv.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.lorryOwnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.driverName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [invoices, searchTerm]);

  const handlePrint = (invoice: HiredInvoice) => {
    setActivePrintInvoice(invoice);
    // Short timeout to allow state to propagate before print dialog
    setTimeout(() => {
      window.print();
      setActivePrintInvoice(null);
    }, 200);
  };

  return (
    <div className="space-y-8 pb-20 relative">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 no-print">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Hired Billing & Ledger</h2>
          <p className="text-slate-500 font-medium italic underline decoration-indigo-200">Owner Settlement Registry</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Truck No / Owner..." 
              className="bg-transparent font-bold text-slate-800 outline-none text-sm w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setShowForm(!showForm)}
            className={`px-8 py-3.5 rounded-2xl font-black transition-all flex items-center gap-2 shadow-xl ${
              showForm ? 'bg-slate-200 text-slate-700' : 'bg-indigo-600 text-white shadow-indigo-500/20'
            }`}
          >
            {showForm ? 'Cancel' : <><Plus size={20} /> New Bill Entry</>}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] border-4 border-indigo-50 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 no-print">
          <div className="flex items-center gap-4 mb-8 border-b pb-6 border-slate-50">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg text-white">
              <ReceiptIndianRupee size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Record Hiring Invoice</h3>
              <p className="text-sm font-medium text-slate-500">Log lorry freight and advance history</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InputField label="Truck / Vehicle No" placeholder="MH-XX-XX-0000" value={form.vehicleNo} onChange={(v: any) => setForm({...form, vehicleNo: v})} required />
            <InputField label="Lorry Owner" placeholder="Transporter Name" value={form.lorryOwnerName} onChange={(v: any) => setForm({...form, lorryOwnerName: v})} required />
            <InputField label="Driver Name" value={form.driverName} onChange={(v: any) => setForm({...form, driverName: v})} />
            <InputField label="Mobile No" type="tel" value={form.mobileNo} onChange={(v: any) => setForm({...form, mobileNo: v})} />
            
            <InputField label="From Station" placeholder="Mumbai" value={form.from} onChange={(v: any) => setForm({...form, from: v})} />
            <InputField label="To Station" placeholder="Kolhapur" value={form.to} onChange={(v: any) => setForm({...form, to: v})} />
            <InputField label="Weight / Load" placeholder="e.g. 18 Tons" value={form.totalWeight} onChange={(v: any) => setForm({...form, totalWeight: v})} />
            
            <div className="bg-slate-50 p-4 rounded-2xl space-y-4 border border-slate-100 col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField label="Total Freight (₹)" type="number" value={form.amount} onChange={(v: any) => setForm({...form, amount: Number(v)})} />
              <InputField label="Advance Paid (₹)" type="number" value={form.advance} onChange={(v: any) => setForm({...form, advance: Number(v)})} />
              <div className="flex flex-col justify-end">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Pending Balance</p>
                <p className="px-5 py-4 font-black text-rose-600 text-2xl">₹ {form.amount - form.advance}</p>
              </div>
            </div>

            <InputField label="G Pay Name" placeholder="Beneficiary" value={form.gPayName} onChange={(v: any) => setForm({...form, gPayName: v})} />
            <InputField label="G Pay Mobile" placeholder="UPI Number" type="tel" value={form.gPayNumber} onChange={(v: any) => setForm({...form, gPayNumber: v})} />
            
            <div className="flex items-end pb-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="w-6 h-6 rounded-lg accent-indigo-600"
                  checked={form.isPaid}
                  onChange={e => setForm({...form, isPaid: e.target.checked})}
                />
                <span className="font-black text-sm text-slate-700 uppercase tracking-tighter">Settlement Done?</span>
              </label>
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <button type="submit" className="px-12 py-4 bg-slate-950 text-white rounded-[1.25rem] font-black text-lg hover:bg-slate-900 transition-all shadow-xl flex items-center gap-2">
              Save & Record <CheckCircle2 size={20} />
            </button>
          </div>
        </form>
      )}

      {/* Invoice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 no-print">
        {filteredInvoices.map(inv => (
          <div key={inv.id} className={`bg-white rounded-[2.5rem] border-2 transition-all shadow-sm p-8 relative overflow-hidden flex flex-col ${inv.isPaid ? 'border-emerald-100 opacity-80' : 'border-rose-100 hover:border-indigo-400'}`}>
            <div className={`absolute top-0 right-10 px-6 py-2 rounded-b-xl text-[10px] font-black uppercase tracking-widest border-x border-b shadow-sm ${inv.isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
              {inv.isPaid ? 'Settled' : 'Unpaid'}
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tighter">{inv.vehicleNo}</h3>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1 italic">{inv.lorryOwnerName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Pay</p>
                   <p className="text-lg font-black text-slate-800">₹{inv.amount.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1 text-emerald-500">Advance</p>
                   <p className="text-lg font-black text-emerald-600">₹{inv.advance.toLocaleString()}</p>
                </div>
                <div className="col-span-2 bg-rose-50 p-4 rounded-2xl border-2 border-rose-100">
                   <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">PENDING AMT TO PAY</p>
                      {inv.isPaid && <CheckCircle2 size={16} className="text-emerald-500"/>}
                   </div>
                   <p className={`text-3xl font-black ${inv.isPaid ? 'text-slate-400 line-through' : 'text-rose-600'}`}>
                      ₹{(inv.amount - inv.advance).toLocaleString()}
                   </p>
                </div>
            </div>

            <div className="space-y-3 mb-8">
               <div className="flex items-center gap-3 text-xs font-bold text-slate-500"><MapPin size={14}/> {inv.from} ➔ {inv.to}</div>
               <div className="flex items-center gap-3 text-xs font-bold text-slate-500"><User size={14}/> Driver: {inv.driverName}</div>
               <div className="flex items-center gap-3 text-xs font-bold text-indigo-500"><CreditCard size={14}/> GPay: {inv.gPayName} ({inv.gPayNumber})</div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 flex gap-2">
               <button 
                onClick={() => togglePaid(inv.id)}
                className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  inv.isPaid ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg'
                }`}
              >
                {inv.isPaid ? 'Payment Clear' : 'Mark as Paid'}
              </button>
              <button onClick={() => handlePrint(inv)} className="p-4 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Printer size={20}/></button>
              <button onClick={() => deleteInvoice(inv.id)} className="p-4 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={20}/></button>
            </div>
          </div>
        ))}
      </div>

      {/* PRINT-ONLY VIEW */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; margin: 0; padding: 0; }
          main { margin-left: 0 !important; width: 100% !important; padding: 0 !important; }
          @page { size: A4; margin: 1cm; }
        }
        .print-only { display: none; }
      `}</style>
      
      {activePrintInvoice && (
        <div className="print-only p-12 bg-white min-h-screen text-slate-900 border-2 border-slate-900">
           <div className="border-b-8 border-indigo-700 pb-8 mb-8 flex justify-between items-end">
             <div>
                <h1 className="text-6xl font-black text-indigo-800 tracking-tighter uppercase mb-2">Vora Transport</h1>
                <p className="text-xl font-bold text-slate-500 uppercase tracking-[0.3em]">Excellence in Road Logistics</p>
                <p className="mt-4 font-bold text-slate-700 text-sm">Mumbai-Kolhapur High-Speed Corridor Management</p>
                <p className="font-bold text-slate-500 text-xs">GST: 27AAVFV1234Z1ZA | Reg: MH/VR/2024/09</p>
             </div>
             <div className="text-right">
                <h2 className="text-4xl font-black uppercase text-indigo-900">Hired Bill</h2>
                <p className="text-slate-500 font-bold uppercase text-xs">No: VR-{activePrintInvoice.id.split('-')[1]}</p>
                <p className="text-slate-500 font-bold uppercase text-xs">Date: {new Date(activePrintInvoice.createdAt).toLocaleDateString()}</p>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-12 mb-10">
              <div className="bg-slate-100 p-8 rounded-3xl">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Contractor / Owner</h4>
                 <p className="text-3xl font-black uppercase text-slate-900 mb-1">{activePrintInvoice.lorryOwnerName}</p>
                 <p className="font-bold text-indigo-600 uppercase tracking-widest">Truck: {activePrintInvoice.vehicleNo}</p>
                 <p className="mt-4 text-sm font-bold text-slate-600">Mob: {activePrintInvoice.mobileNo}</p>
              </div>
              <div className="bg-slate-100 p-8 rounded-3xl">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Dispatch Summary</h4>
                 <div className="flex items-center gap-4 text-2xl font-black text-slate-900">
                   {activePrintInvoice.from} <ArrowRight size={24} className="text-indigo-500" /> {activePrintInvoice.to}
                 </div>
                 <p className="mt-4 text-sm font-bold text-slate-600">Driver: {activePrintInvoice.driverName}</p>
                 <p className="text-sm font-bold text-slate-600">Load: {activePrintInvoice.totalWeight}</p>
              </div>
           </div>

           <div className="mb-12">
              <table className="w-full border-collapse">
                 <thead>
                    <tr className="bg-slate-900 text-white text-left uppercase text-xs font-black tracking-widest">
                       <th className="p-6">Particulars / Service Description</th>
                       <th className="p-6 text-right">Freight Amt (₹)</th>
                    </tr>
                 </thead>
                 <tbody className="text-xl font-bold">
                    <tr className="border-b border-slate-200">
                       <td className="p-6">Lorry Hiring Charges for Route Dispatch</td>
                       <td className="p-6 text-right">₹{activePrintInvoice.amount.toLocaleString()}.00</td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-slate-50 text-emerald-600">
                       <td className="p-6 italic">Less: Cash / Diesel Advance Paid</td>
                       <td className="p-6 text-right">- ₹{activePrintInvoice.advance.toLocaleString()}.00</td>
                    </tr>
                 </tbody>
                 <tfoot>
                    <tr className="bg-indigo-50 text-indigo-900">
                       <td className="p-8 text-2xl font-black text-right uppercase tracking-tighter">Net Balance to be Paid:</td>
                       <td className="p-8 text-4xl font-black text-right underline decoration-indigo-200">
                          ₹{(activePrintInvoice.amount - activePrintInvoice.advance).toLocaleString()}.00
                       </td>
                    </tr>
                 </tfoot>
              </table>
           </div>

           <div className="grid grid-cols-2 gap-12 pt-12">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Payment Channel</p>
                 <div className="p-6 border-2 border-indigo-100 rounded-2xl bg-indigo-50/50">
                    <p className="font-black text-slate-900 text-lg uppercase">{activePrintInvoice.gPayName}</p>
                    <p className="font-bold text-indigo-600 text-xl tracking-widest">{activePrintInvoice.gPayNumber}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Verified Digital Transaction</p>
                 </div>
              </div>
              <div className="text-right flex flex-col items-end justify-end">
                 <div className="w-64 h-24 border-b-4 border-slate-900 mb-2"></div>
                 <p className="text-sm font-black uppercase tracking-widest text-slate-900">Authorized Signatory</p>
                 <p className="text-xs font-bold text-slate-400">For VORA TRANSPORT CO.</p>
              </div>
           </div>
           
           <div className="absolute bottom-12 left-12 right-12 text-center text-[10px] font-black uppercase text-slate-300 tracking-[0.6em]">
              Strategic Assets • High Performance Logistics • Secured Billing
           </div>
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, value, onChange, placeholder, type = 'text', required = false }: any) => (
  <div className="space-y-2 no-print">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label} {required && '*'}</label>
    <input 
      type={type} 
      placeholder={placeholder} 
      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 outline-none font-bold text-slate-800 placeholder:text-slate-300 focus:border-indigo-500 focus:bg-white transition-all" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      required={required} 
    />
  </div>
);

const ArrowRight = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
);

export default BillingManager;