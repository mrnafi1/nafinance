import { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  XAxis, Legend
} from "recharts";
import {
  Plus, Trash2, Home, BarChart2, Settings,
  Users, X, Download, Eye, EyeOff, Search, 
  AlertTriangle, Landmark, Wallet, Lock, 
  Sun, Moon, KeyRound, Edit3, Code, Check, FileText, Edit
} from "lucide-react";

const AUTHOR   = "Mushfiqur Rahman Nafi";
const APP_NAME = "NaFinance";

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Hind+Siliguri:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif; -webkit-font-smoothing: antialiased; }
  body { font-size: 16px; }
  input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
  .premium-card { transition: all 0.3s ease; }
  .premium-card:active { transform: scale(0.98); }
`;

const BASE_CATEGORIES = {
  expense: [
    { id: "food", label: { bn: "খাবার", en: "Food" }, icon: "🍔", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
    { id: "transport", label: { bn: "যাতায়াত", en: "Transport" }, icon: "🚌", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    { id: "rent", label: { bn: "ভাড়া", en: "Rent" }, icon: "🏠", color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
    { id: "shopping", label: { bn: "কেনাকাটা", en: "Shopping" }, icon: "🛒", color: "#ec4899", bg: "rgba(236,72,153,0.12)" },
    { id: "other_ex", label: { bn: "অন্যান্য", en: "Other" }, icon: "📝", color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  ],
  income: [
    { id: "freelance", label: { bn: "ফ্রিল্যান্স", en: "Freelance" }, icon: "💻", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    { id: "salary", label: { bn: "বেতন", en: "Salary" }, icon: "💰", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    { id: "other_in", label: { bn: "অন্যান্য", en: "Other" }, icon: "🎁", color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  ],
};

const CURRENCIES = [
  { code: "BDT", sym: "৳", loc: "bn-BD" }, { code: "USD", sym: "$", loc: "en-US" },
  { code: "GBP", sym: "£", loc: "en-GB" }, { code: "EUR", sym: "€", loc: "de-DE" }
];

const TODAY = () => new Date().toISOString().split("T")[0];
const genId = () => Math.random().toString(36).substring(2, 11);
const fmtMoney = (n, curr, lang) => {
  const c = CURRENCIES.find(x => x.code === curr) || CURRENCIES[0];
  return new Intl.NumberFormat(lang === "bn" ? "bn-BD" : c.loc, { style: "currency", currency: c.code, minimumFractionDigits: 0 }).format(n || 0);
};

const DEFAULT_DATA = { txs: [], wallets: [{ id: "w1", name: "Cash", balance: 0, icon: "💵" }, { id: "w2", name: "Bank", balance: 0, icon: "🏦" }], debts: [], goals: [], budgets: {}, savings: { balance: 0, history: [] }, customCategories: { expense: [], income: [] }, dismissedAlerts: [], recurring: [] };
const DEFAULT_SETTINGS = { lang: "bn", curr: "BDT", theme: "dark", hideBalance: false, pinLock: "", recoveryWord: "" };

export default function App() {
  const [data, setData] = useState(() => {
    try { const saved = localStorage.getItem("nafinance_vmax_db"); return saved ? { ...DEFAULT_DATA, ...JSON.parse(saved) } : DEFAULT_DATA; } catch(e) { return DEFAULT_DATA; }
  });

  const [settings, setSettings] = useState(() => {
    try { const saved = localStorage.getItem("nafinance_vmax_set"); return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS; } catch(e) { return DEFAULT_SETTINGS; }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!settings.pinLock);
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [editTxData, setEditTxData] = useState(null); 
  const [toastMsg, setToastMsg] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, msg: "", onConfirm: null });
  const appRef = useRef(null);

  // 🚀 Recurring Transactions Check
  useEffect(() => {
    if(!data.recurring || data.recurring.length === 0) return;
    let updated = false; let newTxs = [...data.txs]; let newWs = [...data.wallets];
    const newRec = data.recurring.map(r => {
      if (r.nextDate <= TODAY()) {
        const wIdx = newWs.findIndex(w => w.id === r.walletId);
        if (wIdx > -1) {
          newWs[wIdx].balance += (r.type === 'income' ? r.amount : -r.amount);
          newTxs.push({ id: genId(), type: r.type, date: r.nextDate, amount: r.amount, category: r.category, walletId: r.walletId, note: `[Auto] ${r.note}` });
          updated = true;
        }
        const nextMonth = new Date(r.nextDate); nextMonth.setMonth(nextMonth.getMonth() + 1);
        return { ...r, nextDate: nextMonth.toISOString().split("T")[0] };
      }
      return r;
    });
    if (updated) { setData(prev => ({ ...prev, txs: newTxs, wallets: newWs, recurring: newRec })); showToast(settings.lang==='bn'?"স্বয়ংক্রিয় পেমেন্ট যোগ হয়েছে!":"Auto-payments added!", "success"); }
  }, []);

  useEffect(() => { localStorage.setItem("nafinance_vmax_db", JSON.stringify(data)); }, [data]);
  useEffect(() => { localStorage.setItem("nafinance_vmax_set", JSON.stringify(settings)); }, [settings]);

  const showToast = (msg, type="error") => { setToastMsg({ msg, type }); setTimeout(() => setToastMsg(null), 2500); };
  const isDark = settings.theme === "dark";
  const TH = isDark ? { bg: "#0b0f19", bgCard: "#131b2f", bgInner: "#1e293b", border: "rgba(139,92,246,0.15)", text: "#f8fafc", textMid: "#94a3b8" } : { bg: "#f8fafc", bgCard: "#ffffff", bgInner: "#f1f5f9", border: "#e2e8f0", text: "#0f172a", textMid: "#64748b" };

  const fmt = n => settings.hideBalance ? "••••" : fmtMoney(n, settings.curr, settings.lang);
  const getCategories = (type) => [...BASE_CATEGORIES[type], ...(data.customCategories?.[type] || [])];

  const saveTx = (tx, oldTx = null, isRecurring = false) => {
    let ws = [...data.wallets];
    if (oldTx) { ws = ws.map(w => w.id === oldTx.walletId ? { ...w, balance: oldTx.type === "income" ? w.balance - oldTx.amount : w.balance + oldTx.amount } : w); }
    const isInc = tx.type === "income";
    const targetW = ws.find(w => w.id === tx.walletId);
    if (!targetW) return showToast("Wallet error", "error");
    if (!isInc && targetW.balance < tx.amount) { showToast(settings.lang==='bn'?"ব্যালেন্স নেই!":"Insufficient Balance", "error"); return false; }
    
    ws = ws.map(w => w.id === tx.walletId ? { ...w, balance: isInc ? w.balance + tx.amount : w.balance - tx.amount } : w);
    
    let newRecs = data.recurring || [];
    if(isRecurring && !oldTx) {
      const d = new Date(tx.date); d.setMonth(d.getMonth() + 1);
      newRecs.push({ ...tx, nextDate: d.toISOString().split("T")[0] });
    }

    setData({ ...data, txs: oldTx ? data.txs.map(t => t.id === oldTx.id ? tx : t) : [tx, ...data.txs], wallets: ws, recurring: newRecs });
    showToast(settings.lang==='bn'?"সফল!":"Success!", "success"); return true;
  };

  const deleteTx = tx => {
    setConfirmDialog({
      show: true, msg: settings.lang==='bn'?"মুছতে চান?":"Delete transaction?",
      onConfirm: () => {
        const ws = data.wallets.map(w => w.id === tx.walletId ? { ...w, balance: tx.type === "income" ? w.balance - tx.amount : w.balance + tx.amount } : w);
        setData({ ...data, txs: data.txs.filter(x => x.id !== tx.id), wallets: ws });
        showToast(settings.lang==='bn'?"মুছে ফেলা হয়েছে":"Deleted", "success");
      }
    });
  };

  if (!isAuthenticated) return <PinScreen settings={settings} setSettings={setSettings} onSuccess={() => setIsAuthenticated(true)} TH={TH} showToast={showToast} />;
  return (
    <div ref={appRef} style={{ minHeight: "100vh", background: TH.bg, color: TH.text, position: "relative" }}>
      <style>{FONT_STYLE}</style>
      
      {toastMsg && (
        <div style={{ position: "fixed", top: 30, left: "50%", transform: "translateX(-50%)", background: TH.bgCard, color: TH.text, padding: "16px 28px", borderRadius: 30, boxShadow: "0 10px 30px rgba(0,0,0,0.3)", zIndex: 5000, display: "flex", alignItems: "center", gap: 12, fontWeight: 800, border: `1px solid ${toastMsg.type === 'success' ? '#10b981' : '#ef4444'}` }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: toastMsg.type === 'success' ? '#10b981' : '#ef4444' }} />
          {toastMsg.msg}
        </div>
      )}

      {confirmDialog.show && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 6000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: TH.bgCard, padding: 35, borderRadius: 30, width: "100%", maxWidth: 340, textAlign: "center", border: `1px solid ${TH.border}` }}>
             <AlertTriangle size={45} color="#ef4444" style={{margin:"0 auto 15px"}}/>
             <h3 style={{fontWeight:800, marginBottom:25, fontSize:18}}>{confirmDialog.msg}</h3>
             <div style={{display:"flex", gap:15}}>
               <button onClick={()=>{ confirmDialog.onConfirm(); setConfirmDialog({show:false, msg:"", onConfirm:null}); }} style={{flex:1, padding:16, background:"#ef4444", color:"#fff", borderRadius:18, border:"none", fontWeight:900, fontSize:16}}>Yes</button>
               <button onClick={()=>setConfirmDialog({show:false, msg:"", onConfirm:null})} style={{flex:1, padding:16, background:TH.bgInner, color:TH.text, borderRadius:18, border:"none", fontWeight:900, fontSize:16}}>No</button>
             </div>
          </div>
        </div>
      )}
      
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: isDark ? "rgba(11,15,25,0.85)" : "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${TH.border}`, padding: "14px 20px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", borderRadius: 14, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize: 20 }}>$</div>
            <span style={{ fontWeight: 800, fontSize: 20, color: "#8b5cf6" }}>{APP_NAME}</span>
          </div>
          <button onClick={() => setModal("settings")} style={{ padding: 12, background: TH.bgInner, border: "none", borderRadius: 14, color: TH.textMid }}><Settings size={22}/></button>
        </div>
      </header>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "20px 20px 140px" }}>
        {tab === "home" && <HomeView data={data} setData={setData} fmt={fmt} TH={TH} settings={settings} setSettings={setSettings} getCategories={getCategories} deleteTx={deleteTx} setEditTxData={setEditTxData} setModal={setModal} setConfirmDialog={setConfirmDialog} />}
        {tab === "assets" && <AssetsView data={data} setData={setData} fmt={fmt} TH={TH} showToast={showToast} settings={settings} setConfirmDialog={setConfirmDialog} />}
        {tab === "planning" && <PlanningView data={data} setData={setData} fmt={fmt} TH={TH} settings={settings} getCategories={getCategories} showToast={showToast} setConfirmDialog={setConfirmDialog} />}
        {tab === "graphs" && <GraphsView data={data} fmt={fmt} TH={TH} lang={settings.lang} getCategories={getCategories} />}
      </main>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: isDark ? "#131b2f" : "#fff", borderTop: `1px solid ${TH.border}`, padding: "12px 0 35px", zIndex: 100 }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", justifyContent: "space-around" }}>
          <NavBtn active={tab==="home"} icon={Home} label={settings.lang==='bn'?'হোম':'Home'} onClick={()=>setTab("home")} TH={TH}/>
          <NavBtn active={tab==="assets"} icon={Wallet} label={settings.lang==='bn'?'ওয়ালেট':'Wallet'} onClick={()=>setTab("assets")} TH={TH}/>
          <button onClick={() => { setEditTxData(null); setModal("tx"); }} style={{ width: 68, height: 68, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 30px rgba(139,92,246,0.4)", marginTop: -45, border: `6px solid ${TH.bg}`, color: "#fff" }}><Plus size={32}/></button>
          <NavBtn active={tab==="planning"} icon={Landmark} label={settings.lang==='bn'?'প্ল্যান':'Plan'} onClick={()=>setTab("planning")} TH={TH}/>
          <NavBtn active={tab==="graphs"} icon={BarChart2} label={settings.lang==='bn'?'বিশ্লেষণ':'Graphs'} onClick={()=>setTab("graphs")} TH={TH}/>
        </div>
      </nav>

      {modal === "tx" && <TxModal data={data} saveTx={saveTx} onClose={()=>setModal(null)} TH={TH} editData={editTxData} getCategories={getCategories} lang={settings.lang} showToast={showToast} />}
      {modal === "settings" && <SettingsModal settings={settings} setSettings={setSettings} data={data} setData={setData} onClose={()=>setModal(null)} TH={TH} showToast={showToast} AUTHOR={AUTHOR} getCategories={getCategories} setConfirmDialog={setConfirmDialog} />}
    </div>
  );
}

function HomeView({ data, setData, fmt, TH, settings, setSettings, getCategories, deleteTx, setEditTxData, setModal, setConfirmDialog }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [dateRange, setDateRange] = useState("month"); 
  
  const total = data.wallets.reduce((s, w) => s + w.balance, 0);
  const currentMonth = TODAY().slice(0,7);
  
  const monthlyInc = data.txs.filter(x => x.type === "income" && x.date.startsWith(currentMonth)).reduce((s, e) => s + e.amount, 0);
  const monthlyExp = data.txs.filter(x => x.type === "expense" && x.date.startsWith(currentMonth)).reduce((s, e) => s + e.amount, 0);
  const monthlySav = data.savings?.history?.filter(x => x.type === 'deposit' && x.date.startsWith(currentMonth)).reduce((s, e) => s + e.amount, 0) || 0;

  const overdueDebts = data.debts.filter(d => d.returnDate && d.returnDate < TODAY() && d.type === "lend");

  const activeAlerts = getCategories("expense").filter(cat => {
    if (data.dismissedAlerts?.includes(cat.id)) return false;
    const lim = data.budgets[cat.id]; if (!lim) return false;
    const spent = data.txs.filter(x => x.type === "expense" && x.category === cat.id && x.date.startsWith(currentMonth)).reduce((s, e) => s + e.amount, 0);
    return spent >= lim * 0.8;
  });

  const filteredTxs = data.txs.filter(tx => {
    if(dateRange === 'month' && !tx.date.startsWith(currentMonth)) return false;
    if(dateRange === 'week') { const txDate = new Date(tx.date); const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7); if(txDate < weekAgo) return false; }
    
    const cat = getCategories(tx.type).find(c => c.id === tx.category);
    const s = search.toLowerCase();
    const matchFilter = filterCat === "all" || tx.category === filterCat;
    
    const catBn = cat?.label?.bn || ""; const catEn = cat?.label?.en || "";
    const matchSearch = !s || tx.note?.toLowerCase().includes(s) || catBn.toLowerCase().includes(s) || catEn.toLowerCase().includes(s);
    
    return matchFilter && matchSearch;
  });

  // 🚀 CSV Export
  const exportCSV = () => {
    const headers = "Date,Type,Category,Amount,Note\n";
    const rows = data.txs.map(t => {
       const cat = getCategories(t.type).find(c => c.id === t.category);
       return `${t.date},${t.type},${cat ? cat.label.en : t.category},${t.amount},"${t.note||''}"`;
    }).join("\n");
    const blob = new Blob([headers + rows], {type: "text/csv;charset=utf-8;"});
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `NaFinance_${TODAY()}.csv`; link.click();
  };

  // 🚀 Beautiful PDF (Excel Table) Export
  const exportPDF = () => {
    const win = window.open('', '', 'height=800,width=1000');
    let html = `<html lang="en"><head><title>NaFinance Report</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background: #fdfdfd; }
      h2 { text-align: center; color: #8b5cf6; font-size: 28px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px; }
      p.date { text-align: center; color: #666; margin-bottom: 30px; font-size: 14px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 15px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
      th, td { border: 1px solid #ddd; padding: 14px 16px; text-align: left; }
      th { background-color: #8b5cf6; color: white; font-weight: 600; text-transform: uppercase; font-size: 13px; letter-spacing: 1px; }
      tr:nth-child(even) { background-color: #f8f9fa; }
      .inc { color: #10b981; font-weight: bold; }
      .exp { color: #ef4444; font-weight: bold; }
      .amount { text-align: right; }
    </style></head><body>
    <h2>NaFinance - Statement</h2>
    <p class="date">Generated on: ${new Date().toLocaleString()}</p>
    <table>
      <tr><th>Date</th><th>Category</th><th>Wallet</th><th>Note</th><th>Type</th><th class="amount">Amount</th></tr>`;
    
    data.txs.forEach(tx => {
      const cat = getCategories(tx.type).find(c => c.id === tx.category) || {label:{en:'Other', bn:'অন্যান্য'}};
      const w = data.wallets.find(w => w.id === tx.walletId) || {name: 'Unknown'};
      html += `<tr>
        <td>${tx.date}</td>
        <td>${cat.label.en}</td>
        <td>${w.name}</td>
        <td>${tx.note || '-'}</td>
        <td class="${tx.type === 'income' ? 'inc' : 'exp'}">${tx.type === 'income' ? 'INCOME' : 'EXPENSE'}</td>
        <td class="amount ${tx.type === 'income' ? 'inc' : 'exp'}">${fmtMoney(tx.amount, settings.curr, 'en')}</td>
      </tr>`;
    });
    html += `</table></body></html>`;
    win.document.write(html); win.document.close();
    setTimeout(() => { win.print(); }, 800); 
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {overdueDebts.map(d => (
        <div key={`od-${d.id}`} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", padding: "14px 18px", borderRadius: 18, display: "flex", alignItems: "center", gap: 12, color: "#ef4444" }}>
          <AlertTriangle size={20}/> <span style={{fontSize:14, fontWeight:800}}>{settings.lang==='bn'?'ওভারডিউ ধার:':'Overdue Debt:'} {d.person} ({fmt(d.amount)})</span>
        </div>
      ))}

      {activeAlerts.map(cat => (
        <div key={cat.id} style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", padding: "14px 18px", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{display:"flex", alignItems:"center", gap: 12}}><AlertTriangle size={20} color="#f59e0b"/> <span style={{fontSize:14, fontWeight:800, color:TH.text}}>{cat.icon} {cat.label[settings.lang] || cat.label['en']} {settings.lang==='bn'?'বাজেট ৮০% শেষ!':'80% budget used!'}</span></div>
          <button onClick={() => setData({ ...data, dismissedAlerts: [...(data.dismissedAlerts || []), cat.id] })} style={{background:"none", border:"none", color: TH.textMid}}><X size={20}/></button>
        </div>
      ))}
      
      <div style={{ padding: 30, borderRadius: 32, background: "linear-gradient(135deg, #1e1b4b, #0f172a)", color: "#fff", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><p style={{ fontSize: 13, opacity: 0.7, fontWeight: 800 }}>{settings.lang==='bn'?'মোট ব্যালেন্স':'Total Balance'}</p><h2 style={{ fontSize: 44, fontWeight: 900, margin: "10px 0" }}>{fmt(total)}</h2></div>
          <button onClick={()=>setSettings({...settings, hideBalance: !settings.hideBalance})} style={{ padding: 14, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 16, color: "#fff" }}>{settings.hideBalance ? <Eye size={22}/> : <EyeOff size={22}/>}</button>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 25 }}>
          <div style={{ flex: 1 }}><p style={{ fontSize: 11, opacity: 0.6 }}>{settings.lang==='bn'?'এই মাসে আয়':'This Month Inc'}</p><p style={{ fontSize: 16, fontWeight: 800, color: "#10b981" }}>{fmt(monthlyInc)}</p></div>
          <div style={{ flex: 1, borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: 10 }}><p style={{ fontSize: 11, opacity: 0.6 }}>{settings.lang==='bn'?'এই মাসে ব্যয়':'This Month Exp'}</p><p style={{ fontSize: 16, fontWeight: 800, color: "#ef4444" }}>{fmt(monthlyExp)}</p></div>
          <div style={{ flex: 1, borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: 10 }}><p style={{ fontSize: 11, opacity: 0.6 }}>{settings.lang==='bn'?'সঞ্চয়':'Savings'}</p><p style={{ fontSize: 16, fontWeight: 800, color: "#3b82f6" }}>{fmt(monthlySav)}</p></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={exportCSV} style={{ flex:1, padding:"12px", borderRadius:18, background:TH.bgInner, color:TH.text, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", gap:8, border:"none" }}><Download size={18} color="#10b981"/> CSV</button>
        <button onClick={exportPDF} style={{ flex:1, padding:"12px", borderRadius:18, background:TH.bgInner, color:TH.text, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", gap:8, border:"none" }}><FileText size={18} color="#ef4444"/> PDF</button>
        <select value={dateRange} onChange={e=>setDateRange(e.target.value)} style={{ padding: "0 15px", borderRadius: 18, background: TH.bgInner, border: "none", color: TH.text, fontWeight: 800, outline:"none", flex:1.5 }}>
          <option value="all">{settings.lang==='bn'?'সব সময়':'All Time'}</option>
          <option value="month">{settings.lang==='bn'?'এই মাস':'This Month'}</option>
          <option value="week">{settings.lang==='bn'?'গত ৭ দিন':'Last 7 Days'}</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 12, background: TH.bgCard, padding: "14px 18px", borderRadius: 20, border: `1px solid ${TH.border}` }}>
          <Search size={20} color={TH.textMid}/><input type="text" placeholder={settings.lang==='bn'?'খুঁজুন...':'Search...'} value={search} onChange={e=>setSearch(e.target.value)} style={{ background:"none", border:"none", color:TH.text, outline:"none", flex:1, fontSize:15, fontWeight:700 }}/>
        </div>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ flex: 1, padding: "0 15px", borderRadius: 20, background: TH.bgCard, border: `1px solid ${TH.border}`, color: TH.text, fontWeight: 800, outline:"none", fontSize:14 }}>
          <option value="all">{settings.lang==='bn'?'ক্যাটাগরি':'Category'}</option>
          {getCategories("expense").map(c => <option key={c.id} value={c.id}>{c.icon} {c.label[settings.lang] || c.label['en']}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filteredTxs.slice(0, 30).map(tx => {
          const cat = getCategories(tx.type).find(c => c.id === tx.category) || {icon:"📝", bg:"rgba(148,163,184,0.1)", label:{bn:"অন্যান্য", en:"Other"}};
          return (
            <div key={tx.id} style={{ padding: 20, background: TH.bgCard, borderRadius: 25, border: `1px solid ${TH.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => { setEditTxData(tx); setModal("tx"); }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 54, height: 54, borderRadius: 18, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{cat.icon}</div>
                <div><p style={{ fontWeight: 800, fontSize: 17, color: TH.text }}>{tx.note || cat.label[settings.lang] || cat.label['en']}</p><p style={{ fontSize: 12, color: TH.textMid, fontWeight:600 }}>{tx.date}</p></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                <p style={{ fontWeight: 900, fontSize: 18, color: tx.type === "income" ? "#10b981" : "#ef4444" }}>{tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}</p>
                <button onClick={(e)=>{e.stopPropagation(); deleteTx(tx);}} style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "none", padding: 12, borderRadius: 14 }}><Trash2 size={18}/></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function AssetsView({ data, setData, fmt, TH, showToast, settings, setConfirmDialog }) {
  const [debtForm, setDebtForm] = useState({ show: false, person: "", amount: "", type: "lend", date: TODAY(), returnDate: "", note: "", sourceId: "w1" });
  const [walletForm, setWalletForm] = useState({ show: false, name: "", balance: "", icon: "💳", id: null });
  
  const handleAddDebt = () => {
    const amt = Number(debtForm.amount); if(!debtForm.person || !amt) return showToast(settings.lang==='bn'?"সব তথ্য দিন":"Enter info", "error");
    let ws = [...data.wallets]; 
    const tIdx = ws.findIndex(w => w.id === debtForm.sourceId);

    if (debtForm.type === "lend") {
        if (ws[tIdx].balance < amt) return showToast(settings.lang==='bn'?"টাকা নেই":"No cash", "error");
        ws[tIdx].balance -= amt;
    } else { ws[tIdx].balance += amt; }
    
    const tx = { id: genId(), type: debtForm.type === 'lend' ? 'expense' : 'income', date: debtForm.date, amount: amt, category: debtForm.type === 'lend' ? 'other_ex' : 'other_in', walletId: debtForm.sourceId, note: `${debtForm.type==='lend'?'ধার:':'ঋণ:'} ${debtForm.person}` };
    setData({ ...data, wallets: ws, txs: [tx, ...data.txs], debts: [{...debtForm, id: genId(), amount: amt}, ...data.debts] });
    setDebtForm({ show: false, person: "", amount: "", type: "lend", date: TODAY(), returnDate: "", note: "", sourceId: "w1" });
    showToast(settings.lang==='bn'?"সংরক্ষিত":"Saved", "success");
  };

  const handleWalletSave = () => {
    if(!walletForm.name || walletForm.balance === "") return showToast("Enter details", "error");
    const nw = { id: walletForm.id || genId(), name: walletForm.name, balance: Number(walletForm.balance), icon: walletForm.icon };
    setData({ ...data, wallets: walletForm.id ? data.wallets.map(w=>w.id===walletForm.id?nw:w) : [...data.wallets, nw] });
    setWalletForm({ show: false, name: "", balance: "", icon: "💳", id: null });
  };

  // 🚀 Fixed Bug: Safe Wallet Deletion
  const deleteWalletSafe = (w) => {
    if(data.wallets.length === 1) return showToast(settings.lang==='bn'?"কমপক্ষে ১টি ওয়ালেট থাকতে হবে":"Need 1 wallet minimum", "error");
    const hasTxs = data.txs.some(t => t.walletId === w.id);
    if(hasTxs) return showToast(settings.lang==='bn'?"এই ওয়ালেটে লেনদেন আছে!":"Wallet has transactions!", "error");
    
    setConfirmDialog({
       show: true, msg: settings.lang==='bn'?"ওয়ালেটটি মুছতে চান?":"Delete Wallet?",
       onConfirm: () => { setData({...data, wallets: data.wallets.filter(x=>x.id!==w.id)}); showToast("Deleted", "success"); }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h3 style={{ fontWeight: 800, fontSize:18 }}>{settings.lang==='bn'?'ওয়ালেট':'Wallets'}</h3>
        <button onClick={()=>setWalletForm({...walletForm, show:true})} style={{ padding: "10px 18px", borderRadius: 14, background: "#3b82f6", color: "#fff", border: "none", fontWeight: 800 }}>+ Add</button>
      </div>

      {walletForm.show && (
         <div style={{ padding: 25, background: TH.bgCard, borderRadius: 25, display: "flex", flexDirection: "column", gap: 14, border: "2px dashed #3b82f6" }}>
           <div style={{ display:"flex", gap:12 }}>
             <input type="text" placeholder="Icon" value={walletForm.icon} onChange={e=>setWalletForm({...walletForm, icon: e.target.value})} style={{ width:65, padding: 16, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, textAlign:"center", outline:"none" }} />
             <input type="text" placeholder="Wallet Name" value={walletForm.name} onChange={e=>setWalletForm({...walletForm, name: e.target.value})} style={{ flex:1, padding: 16, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:700 }} />
           </div>
           <input type="number" placeholder="Initial Balance" value={walletForm.balance} onChange={e=>setWalletForm({...walletForm, balance: e.target.value})} style={{ padding: 16, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:700 }} />
           <div style={{ display:"flex", gap:12 }}>
             <button onClick={handleWalletSave} style={{ flex:1, padding: 16, background: "#3b82f6", color: "#fff", border: "none", borderRadius: 16, fontWeight: 900 }}>Save</button>
             <button onClick={()=>setWalletForm({ show: false, name: "", balance: "", icon: "💳", id: null })} style={{ flex:1, padding: 16, background: TH.bgInner, color: TH.text, border: "none", borderRadius: 16, fontWeight: 900 }}>Cancel</button>
           </div>
         </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {data.wallets.map(w => (
          <div key={w.id} style={{ padding: 25, background: TH.bgCard, borderRadius: 30, border: `1px solid ${TH.border}`, position:"relative" }}>
            <div style={{ position:"absolute", top:18, right:18, display:"flex", gap:10 }}>
              <button onClick={()=>setWalletForm({show:true, ...w})} style={{background:"none", border:"none", color:"#3b82f6"}}><Edit size={18}/></button>
              <button onClick={()=>deleteWalletSafe(w)} style={{background:"none", border:"none", color:"#ef4444"}}><Trash2 size={18}/></button>
            </div>
            <span style={{ fontSize: 36 }}>{w.icon}</span>
            <p style={{ fontSize: 14, fontWeight: 800, color: TH.textMid, marginTop: 12 }}>{w.name}</p>
            <p style={{ fontSize: 24, fontWeight: 900 }}>{fmt(w.balance)}</p>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}><h3 style={{ fontWeight: 800, fontSize:18 }}>{settings.lang==='bn'?'ধার-দেনা':'Debts'}</h3><button onClick={()=>setDebtForm({...debtForm, show: !debtForm.show})} style={{ padding: "10px 18px", borderRadius: 14, background: "#8b5cf6", color: "#fff", border: "none", fontWeight: 800 }}>+ {settings.lang==='bn'?'নতুন':'New'}</button></div>
      
      {debtForm.show && (
          <div style={{ padding: 25, background: TH.bgCard, borderRadius: 30, display: "flex", flexDirection: "column", gap: 14, border: "2px dashed #8b5cf6" }}>
              <input type="text" placeholder={settings.lang==='bn'?'নাম':'Name'} value={debtForm.person} onChange={e=>setDebtForm({...debtForm, person: e.target.value})} style={{ padding: 16, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, fontWeight: 700, outline:"none" }} />
              <input type="number" placeholder={settings.lang==='bn'?'টাকা':'Amount'} value={debtForm.amount} onChange={e=>setDebtForm({...debtForm, amount: e.target.value})} style={{ padding: 16, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, fontWeight: 700, outline:"none" }} />
              <label style={{fontSize:13, fontWeight:800, color:TH.textMid}}>{settings.lang==='bn'?'লেনদেনের তারিখ:':'Given Date:'}</label>
              <input type="date" value={debtForm.date} onChange={e=>setDebtForm({...debtForm, date: e.target.value})} style={{ padding: 16, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:700 }} />
              <label style={{fontSize:13, fontWeight:800, color:TH.textMid}}>{settings.lang==='bn'?'ফেরত পাওয়ার তারিখ:':'Return Date:'}</label>
              <input type="date" value={debtForm.returnDate} onChange={e=>setDebtForm({...debtForm, returnDate: e.target.value})} style={{ padding: 16, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:700 }} />
              <select value={debtForm.sourceId} onChange={e=>setDebtForm({...debtForm, sourceId: e.target.value})} style={{ padding: 16, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, fontWeight: 800, outline:"none" }}>{data.wallets.map(w=><option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}</select>
              <select value={debtForm.type} onChange={e=>setDebtForm({...debtForm, type: e.target.value})} style={{ padding: 16, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, fontWeight: 800, outline:"none" }}><option value="lend">{settings.lang==='bn'?'আমি পাবো':'I will get'}</option><option value="borrow">{settings.lang==='bn'?'আমি দেবো':'I will give'}</option></select>
              <button onClick={handleAddDebt} style={{ padding: 18, background: "#8b5cf6", color: "#fff", border: "none", borderRadius: 16, fontWeight: 900, fontSize:16 }}>Save</button>
          </div>
      )}
      {data.debts.map(d => (
        <div key={d.id} style={{ padding: 22, background: TH.bgCard, borderRadius: 25, display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${TH.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}><div style={{ width:48, height:48, borderRadius:"50%", background: d.type==='lend'?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)', display:"flex", alignItems:"center", justifyContent:"center" }}><Users size={22} color={d.type==='lend'?'#10b981':'#ef4444'}/></div><div><p style={{ fontWeight: 800, fontSize:16, color:TH.text }}>{d.person}</p><p style={{ fontSize: 12, color: TH.textMid, fontWeight:600 }}>{settings.lang==='bn'?'ফেরত:':'Return:'} {d.returnDate || 'N/A'}</p></div></div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}><p style={{ fontWeight: 900, fontSize:18, color: d.type === "lend" ? "#10b981" : "#ef4444" }}>{fmt(d.amount)}</p><button onClick={()=>{ setConfirmDialog({ show: true, msg: settings.lang==='bn'?"হিসাব ক্লিয়ার করবেন?":"Settle this debt?", onConfirm: () => { const ws = data.wallets.map(w => w.id === d.sourceId ? { ...w, balance: d.type==='lend'? w.balance+d.amount : w.balance-d.amount } : w); setData({...data, wallets: ws, debts: data.debts.filter(x=>x.id!==d.id)}); showToast(settings.lang==='bn'?"ক্লিয়ার!":"Settled!", "success"); }}); }} style={{ padding: "10px 16px", background: "rgba(16,185,129,0.15)", color: "#10b981", borderRadius: 12, border: "none", fontWeight: 800 }}>Settle</button></div>
        </div>
      ))}
    </div>
  );
}
function PlanningView({ data, setData, fmt, TH, settings, getCategories, showToast, setConfirmDialog }) {
  const [subTab, setSubTab] = useState("vault");
  const [saveAmt, setSaveAmt] = useState("");
  const [saveNote, setSaveNote] = useState("");
  const [vaultWallet, setVaultWallet] = useState("w1"); 
  
  const [goalForm, setGoalForm] = useState({ show: false, name: "", target: "", note: "", id: null });
  const [addCashId, setAddCashId] = useState(null); 
  const [addCashAmt, setAddCashAmt] = useState("");
  const [addCashWallet, setAddCashWallet] = useState("w1");
  const [limitVal, setLimitVal] = useState(""); 
  const [budgetCat, setBudgetCat] = useState("");

  const handleVault = (type) => {
    const n = Number(saveAmt); if (!n) return;
    let ws = [...data.wallets]; let sv = { ...data.savings }; let txs = [...data.txs];
    const wIdx = ws.findIndex(w => w.id === vaultWallet);
    if(wIdx === -1) return showToast("Wallet error", "error");

    if (type === 'deposit') { 
      if (ws[wIdx].balance < n) return showToast("No cash", "error"); 
      ws[wIdx].balance -= n; sv.balance += n; 
      const msg = saveNote || "Vault Deposit"; 
      sv.history = [{ id: genId(), date: TODAY(), amount: n, type: 'deposit', note: msg }, ...(sv.history || [])]; 
      txs = [{ id: genId(), type:'expense', date: TODAY(), amount: n, category:'other_ex', walletId: vaultWallet, note: msg }, ...txs]; 
    } else { 
      if (sv.balance < n) return showToast("Vault Empty", "error"); 
      ws[wIdx].balance += n; sv.balance -= n; 
      const msg = saveNote || "Vault Withdraw"; 
      sv.history = [{ id: genId(), date: TODAY(), amount: n, type: 'withdraw', note: msg }, ...(sv.history || [])]; 
      txs = [{ id: genId(), type:'income', date: TODAY(), amount: n, category:'other_in', walletId: vaultWallet, note: msg }, ...txs]; 
    }
    setData({...data, wallets: ws, savings: sv, txs: txs}); setSaveAmt(""); setSaveNote(""); showToast("Success", "success");
  };

  const handleAddGoalCash = (goalId) => {
    const amt = Number(addCashAmt); if(!amt) return;
    let ws = [...data.wallets]; const wIdx = ws.findIndex(w => w.id === addCashWallet);
    if(wIdx === -1 || ws[wIdx].balance < amt) return showToast(settings.lang==='bn'?"ব্যালেন্স নেই!":"Insufficient Balance", "error");
    ws[wIdx].balance -= amt;
    const newGoals = data.goals.map(g => g.id === goalId ? { ...g, saved: g.saved + amt } : g);
    const tx = { id: genId(), type:'expense', date: TODAY(), amount: amt, category:'other_ex', walletId: addCashWallet, note: `${settings.lang==='bn'?'লক্ষ্য:':'Goal:'} ${data.goals.find(x=>x.id===goalId).name}` };
    setData({ ...data, wallets: ws, goals: newGoals, txs: [tx, ...data.txs] });
    setAddCashId(null); setAddCashAmt(""); showToast(settings.lang==='bn'?"টাকা এড হয়েছে":"Added", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", background: TH.bgCard, padding: 8, borderRadius: 22, border: `1px solid ${TH.border}` }}>
        {['vault', 'goals', 'budgets'].map(t => (
            <button key={t} onClick={()=>setSubTab(t)} style={{ flex: 1, padding: "14px", borderRadius: 16, background: subTab===t ? "#8b5cf6" : "transparent", color: subTab===t ? "#fff" : TH.textMid, fontWeight: 800, border: "none", fontSize: 14 }}>{t.toUpperCase()}</button>
        ))}
      </div>
      
      {subTab === "vault" && (<div style={{ padding: 45, background: "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.06))", borderRadius: 35, textAlign: "center", border: "1.5px solid rgba(16,185,129,0.25)" }}><Landmark size={36} style={{margin:"0 auto 15px", color:"#10b981"}}/><p style={{ fontWeight: 800, color: "#10b981", letterSpacing:1 }}>SAVINGS VAULT</p><h2 style={{ fontSize: 48, fontWeight: 900, margin:"10px 0 20px" }}>{fmt(data.savings.balance)}</h2><div style={{ display: "flex", flexDirection: "column", gap: 14 }}><select value={vaultWallet} onChange={e=>setVaultWallet(e.target.value)} style={{ padding: 16, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, fontWeight: 800, outline:"none", fontSize:16 }}>{data.wallets.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select><input type="number" placeholder="Amount" value={saveAmt} onChange={e=>setSaveAmt(e.target.value)} style={{ padding: 16, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, textAlign:"center", outline:"none", fontWeight:800, fontSize:18 }} /><input type="text" placeholder="Note" value={saveNote} onChange={e=>setSaveNote(e.target.value)} style={{ padding: 16, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, textAlign:"center", outline:"none", fontWeight:700 }} /><div style={{ display: "flex", gap: 12 }}><button onClick={()=>handleVault('deposit')} style={{ flex: 1, padding: 18, background: "#10b981", color: "#fff", border: "none", borderRadius: 16, fontWeight: 900, fontSize:16 }}>Deposit</button><button onClick={()=>handleVault('withdraw')} style={{ flex: 1, padding: 18, background: "transparent", color: "#10b981", border: "2.5px solid #10b981", borderRadius: 16, fontWeight: 900, fontSize:16 }}>Withdraw</button></div></div></div>)}
      
      {subTab === "goals" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <button onClick={()=>setGoalForm({...goalForm, show: true})} style={{ padding:20, background:TH.bgCard, borderRadius:25, border:`2px dashed #8b5cf6`, color:TH.text, fontWeight:800, fontSize:16 }}>+ {settings.lang==='bn'?'নতুন লক্ষ্য':'New Goal'}</button>
          {goalForm.show && (
            <div style={{ padding:25, background:TH.bgCard, borderRadius:30, display:"flex", flexDirection:"column", gap:14, border:"1.5px solid #8b5cf6" }}>
              <input type="text" placeholder={settings.lang==='bn'?'নাম':'Name'} value={goalForm.name} onChange={e=>setGoalForm({...goalForm, name: e.target.value})} style={{ padding:16, borderRadius:16, background:TH.bgInner, color:TH.text, border:"none", outline:"none", fontWeight:700 }} />
              <input type="number" placeholder={settings.lang==='bn'?'টার্গেট':'Target Amount'} value={goalForm.target} onChange={e=>setGoalForm({...goalForm, target: e.target.value})} style={{ padding:16, borderRadius:16, background:TH.bgInner, color:TH.text, border:"none", outline:"none", fontWeight:700 }} />
              <input type="text" placeholder={settings.lang==='bn'?'নোট':'Note'} value={goalForm.note} onChange={e=>setGoalForm({...goalForm, note: e.target.value})} style={{ padding:16, borderRadius:16, background:TH.bgInner, color:TH.text, border:"none", outline:"none", fontWeight:700 }} />
              <button onClick={()=>{ if(!goalForm.name || !goalForm.target) return showToast("Enter info", "error"); const newGoal = { id: goalForm.id || genId(), name: goalForm.name, target: Number(goalForm.target), note: goalForm.note, saved: goalForm.saved || 0 }; setData({ ...data, goals: goalForm.id ? data.goals.map(g=>g.id===goalForm.id?newGoal:g) : [newGoal, ...data.goals] }); setGoalForm({ show: false, name: "", target: "", note: "", id: null }); }} style={{ padding:18, background:"#8b5cf6", color:"#fff", border:"none", borderRadius:16, fontWeight:900, fontSize:16 }}>Save Goal</button>
            </div>
          )}
          {data.goals.map(g => (
            <div key={g.id} style={{ padding:28, background:TH.bgCard, borderRadius:30, border:`1px solid ${TH.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:15 }}><h4 style={{ fontWeight:800, fontSize:18 }}>🎯 {g.name}</h4><div style={{ display:"flex", gap:12 }}><button onClick={()=>setGoalForm({show:true, ...g})} style={{ color:"#3b82f6", background:"none", border:"none" }}><Edit3 size={20}/></button><button onClick={()=>setConfirmDialog({show:true, msg:"Delete Goal?", onConfirm:()=>setData({...data, goals: data.goals.filter(x=>x.id!==g.id)})})} style={{ color:"#ef4444", background:"none", border:"none" }}><Trash2 size={20}/></button></div></div>
              <p style={{ fontSize: 13, color: TH.textMid, marginBottom: 12, fontWeight:600 }}>{g.note}</p>
              <div style={{ height:14, background:TH.bgInner, borderRadius:10, overflow:"hidden", marginBottom:12 }}><div style={{ width:`${Math.min((g.saved/g.target)*100, 100)}%`, height:"100%", background:"linear-gradient(90deg, #3b82f6, #8b5cf6)", transition:"width 1s ease" }} /></div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, fontWeight:800, marginBottom:18 }}><span style={{color:"#10b981"}}>{fmt(g.saved)}</span><span style={{color:TH.textMid}}>{fmt(g.target)}</span></div>
              
              {addCashId === g.id ? (
                 <div style={{ display:"flex", gap:10 }}>
                   <select value={addCashWallet} onChange={e=>setAddCashWallet(e.target.value)} style={{ padding:14, borderRadius:14, background:TH.bgInner, border:"none", color:TH.text, outline:"none", flex:1, fontWeight:800 }}>{data.wallets.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select>
                   <input type="number" placeholder="Amt" value={addCashAmt} onChange={e=>setAddCashAmt(e.target.value)} style={{ flex:1, padding:14, borderRadius:14, background:TH.bgInner, border:"none", color:TH.text, outline:"none", fontWeight:800 }}/>
                   <button onClick={()=>handleAddGoalCash(g.id)} style={{ padding:14, borderRadius:14, background:"#10b981", color:"#fff", border:"none", fontWeight:800 }}><Check size={20}/></button>
                   <button onClick={()=>{setAddCashId(null); setAddCashAmt("");}} style={{ padding:14, borderRadius:14, background:"rgba(239,68,68,0.15)", color:"#ef4444", border:"none", fontWeight:800 }}><X size={20}/></button>
                 </div>
              ) : (
                 <button onClick={()=>setAddCashId(g.id)} style={{ width:"100%", padding:16, borderRadius:16, background:TH.bgInner, color:TH.text, fontWeight:800, border:"none", fontSize:15 }}>Add Cash +</button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {subTab === "budgets" && (
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <div style={{ padding:28, background:TH.bgCard, borderRadius:30, border:`1.5px solid #8b5cf6` }}>
            <p style={{ fontWeight:800, marginBottom:15, color:"#8b5cf6", fontSize:15 }}>{settings.lang==='bn'?'বাজেট সেট করুন':'Set Budget'}</p>
            <div style={{ display:"flex", gap:12, marginBottom:15 }}>
              <select value={budgetCat} onChange={e=>setBudgetCat(e.target.value)} style={{ flex:1, padding:16, borderRadius:16, background:TH.bgInner, color:TH.text, border:"none", fontWeight:800, outline:"none", fontSize:15 }}><option value="">{settings.lang==='bn'?'ক্যাটাগরি':'Category'}</option>{getCategories("expense").map(c => <option key={c.id} value={c.id}>{c.icon} {c.label[settings.lang] || c.label['en']}</option>)}</select>
              <input type="number" placeholder="Limit" value={limitVal} onChange={e=>setLimitVal(e.target.value)} style={{ width:120, padding:16, borderRadius:16, background:TH.bgInner, color:TH.text, border:"none", textAlign:"center", fontWeight:900, outline:"none", fontSize:16 }} />
            </div>
            <button onClick={()=>{ const val=Number(limitVal); if(budgetCat && val){ setData({...data, budgets:{...data.budgets, [budgetCat]:val}}); setLimitVal(""); showToast("Updated", "success"); } }} style={{ width:"100%", padding:18, borderRadius:16, background:"#8b5cf6", color:"#fff", border:"none", fontWeight:900, fontSize:16 }}>Update Budget</button>
          </div>
          {Object.entries(data.budgets).map(([id, lim]) => {
            const cat = getCategories("expense").find(c => c.id === id); if(!cat) return null;
            const spent = data.txs.filter(x => x.type === "expense" && x.category === id && x.date.startsWith(TODAY().slice(0, 7))).reduce((s, e) => s + e.amount, 0);
            const percent = Math.min((spent / lim) * 100, 100);
            const isOver = spent > lim;

            return (
              <div key={id} style={{ padding:25, background:TH.bgCard, borderRadius:28, border:`1px solid ${isOver ? '#ef4444' : TH.border}`, display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                   <div style={{ display:"flex", alignItems:"center", gap:16 }}><span style={{ fontSize:32 }}>{cat.icon}</span><div><p style={{ fontWeight:800, fontSize:16 }}>{cat.label[settings.lang] || cat.label['en']}</p><p style={{ fontSize:12, color:TH.textMid, fontWeight:700 }}>{fmt(spent)} / {fmt(lim)}</p></div></div>
                   <button onClick={()=>setConfirmDialog({show:true, msg:"Delete Budget?", onConfirm:() => { const n={...data.budgets}; delete n[id]; setData({...data, budgets:n}); }})} style={{ color:"#ef4444", background:"none", border:"none" }}><Trash2 size={20}/></button>
                </div>
                <div style={{ height:10, background:TH.bgInner, borderRadius:10, overflow:"hidden", marginTop:5 }}><div style={{ width:`${percent}%`, height:"100%", background: isOver ? "#ef4444" : "#8b5cf6", transition:"width 1s ease" }} /></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
function GraphsView({ data, fmt, TH, lang, getCategories }) {
  const [gType, setGType] = useState("breakdown");
  const weeklyData = useMemo(() => Array.from({length: 7}).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); const s = d.toISOString().split('T')[0];
    const inc = data.txs.filter(t => t.type === "income" && t.date === s).reduce((sum, t) => sum + t.amount, 0);
    const exp = data.txs.filter(t => t.type === "expense" && t.date === s).reduce((sum, t) => sum + t.amount, 0);
    return { name: d.toLocaleDateString(lang==='bn'?'bn-BD':'en-US', {weekday:'short'}), income: inc, expense: exp };
  }), [data.txs, lang]);
  
  const monthlyData = useMemo(() => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => {
    const y = new Date().getFullYear(); 
    const mStr = `${y}-${String(i+1).padStart(2, '0')}`;
    const inc = data.txs.filter(t => t.type === "income" && t.date.startsWith(mStr)).reduce((s, t) => s + t.amount, 0);
    const exp = data.txs.filter(t => t.type === "expense" && t.date.startsWith(mStr)).reduce((s, t) => s + t.amount, 0);
    return { name: m, income: inc, expense: exp };
  }), [data.txs]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
       <div style={{ display: "flex", background: TH.bgCard, padding: 8, borderRadius: 25, border: `1px solid ${TH.border}` }}>{['breakdown', 'weekly', 'monthly'].map(t => (<button key={t} onClick={()=>setGType(t)} style={{ flex: 1, padding: "14px", borderRadius: 18, background: gType===t ? "rgba(139,92,246,0.15)" : "transparent", color: gType===t ? "#8b5cf6" : TH.textMid, fontWeight: 800, border: "none", fontSize: 13 }}>{t.toUpperCase()}</button>))}</div>
       <div style={{ padding: 30, background: TH.bgCard, borderRadius: 40, border: `1px solid ${TH.border}`, minHeight: 420 }}>{gType === "breakdown" ? (<ResponsiveContainer width="100%" height={380}><PieChart><Pie data={getCategories("expense").map(cat => ({ name: cat.label[lang] || cat.label['en'], value: data.txs.filter(x=>x.type==="expense" && x.category===cat.id).reduce((s,e)=>s+e.amount,0), color: cat.color })).filter(x=>x.value>0)} innerRadius={90} outerRadius={120} paddingAngle={8} dataKey="value" stroke="none">{getCategories("expense").map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius: 20, border:"none", background: TH.bgInner, fontWeight:800}}/></PieChart></ResponsiveContainer>) : (<ResponsiveContainer width="100%" height={380}><BarChart data={gType === "weekly" ? weeklyData : monthlyData} margin={{top:20}}><XAxis dataKey="name" stroke={TH.textMid} fontSize={12} tickLine={false} axisLine={false}/><Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} formatter={v=>fmt(v)} contentStyle={{borderRadius: 18, border:"none", background: TH.bgInner, fontWeight:800}}/><Legend verticalAlign="top" height={40} iconType="circle"/><Bar dataKey="income" fill="#10b981" radius={[6,6,0,0]} name={lang==='bn'?'আয়':'Income'} barSize={15} /><Bar dataKey="expense" fill="#ef4444" radius={[6,6,0,0]} name={lang==='bn'?'ব্যয়':'Expense'} barSize={15} /></BarChart></ResponsiveContainer>)}</div>
    </div>
  );
}

function TxModal({ data, saveTx, onClose, TH, editData, getCategories, lang, showToast }) {
  const [type, setType] = useState(editData?.type || "expense");
  const [f, setF] = useState(editData || { date: TODAY(), category: "food", amount: "", note: "", walletId: "w1" });
  const [isRecurring, setIsRecurring] = useState(false); 

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 2000, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 10, backdropFilter: "blur(12px)" }}>
      <div style={{ background: TH.bgCard, padding: "35px 30px", borderRadius: "45px 45px 25px 25px", width: "100%", maxWidth: 480, border: `1px solid ${TH.border}`, animation: "slideIn 0.3s ease-out" }}>
        <div style={{ display: "flex", background: TH.bgInner, padding: 8, borderRadius: 18, marginBottom: 25 }}><button onClick={()=>setType("expense")} style={{ flex: 1, padding: 16, borderRadius: 14, border: "none", background: type==="expense"?"#f97316":"transparent", color: type==="expense"?"#fff":TH.textMid, fontWeight: 900, fontSize:16 }}>Expense</button><button onClick={()=>setType("income")} style={{ flex: 1, padding: 16, borderRadius: 14, border: "none", background: type==="income"?"#10b981":"transparent", color: type==="income"?"#fff":TH.textMid, fontWeight: 900, fontSize:16 }}>Income</button></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 25, maxHeight: 180, overflowY: "auto", padding: 5 }}>{getCategories(type).map(c => (<button key={c.id} onClick={()=>setF({...f, category:c.id})} style={{ padding: 14, borderRadius: 20, border: `2.5px solid ${f.category===c.id?c.color:TH.border}`, background: f.category===c.id?`${c.color}15`:TH.bgInner, color: TH.text, fontSize: 13, fontWeight: 800, transition:"all 0.2s" }}>{c.icon}<br/><span style={{marginTop:4, display:"inline-block"}}>{c.label[lang] || c.label['en']}</span></button>))}</div>
        <div style={{ display:"flex", gap:12, marginBottom:20 }}><select value={f.walletId} onChange={e=>setF({...f, walletId:e.target.value})} style={{ flex:1, padding:18, borderRadius:18, background:TH.bgInner, border:"none", color:TH.text, fontWeight:800, outline:"none", fontSize:15 }}>{data.wallets.map(w=><option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}</select><input type="date" value={f.date} onChange={e=>setF({...f, date:e.target.value})} style={{ flex:1, padding:18, borderRadius:18, background:TH.bgInner, border:"none", color:TH.text, fontWeight:800, outline:"none", fontSize:15 }} /></div>
        <input type="number" placeholder="0" value={f.amount} onChange={e=>setF({...f, amount:e.target.value})} style={{ width: "100%", padding: 25, borderRadius: 25, background: TH.bgInner, border: `2.5px solid ${TH.border}`, color: "#8b5cf6", fontSize: 48, fontWeight: 900, textAlign: "center", marginBottom: 20, outline: "none" }}/>
        <input type="text" placeholder={lang==='bn'?'নোট (ঐচ্ছিক)...':'Note (Optional)...'} value={f.note} onChange={e=>setF({...f, note:e.target.value})} style={{ width: "100%", padding: 20, borderRadius: 20, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, marginBottom: 15, outline: "none", fontWeight: 700, fontSize:16 }}/>
        
        {!editData && (
          <label style={{ display:"flex", alignItems:"center", gap:12, marginBottom:25, fontWeight:800, color:TH.textMid, cursor:"pointer", padding:"10px", background:TH.bgInner, borderRadius:15 }}>
            <input type="checkbox" checked={isRecurring} onChange={e=>setIsRecurring(e.target.checked)} style={{width:20, height:20, accentColor:"#8b5cf6"}}/>
            {lang==='bn'?'প্রতি মাসে স্বয়ংক্রিয়ভাবে যোগ করুন':'Auto-add every month'}
          </label>
        )}

        <button onClick={() => { if(saveTx({...f, type, amount: Number(f.amount), id: editData?.id || genId()}, editData, isRecurring)) onClose(); }} style={{ width: "100%", padding: 22, borderRadius: 22, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff", fontWeight: 900, border: "none", fontSize: 18, boxShadow: "0 15px 30px rgba(139,92,246,0.3)" }}>{lang==='bn'?'নিশ্চিত করুন ✓':'Confirm ✓'}</button>
        <button onClick={onClose} style={{ width: "100%", padding: 18, background: "none", border: "none", color: TH.textMid, fontWeight: 800, marginTop:5, fontSize:16 }}>{lang==='bn'?'বাতিল':'Cancel'}</button>
      </div>
    </div>
  );
}

function PinScreen({ settings, setSettings, onSuccess, TH, showToast }) {
  const [input, setInput] = useState(""); const [isForgot, setIsForgot] = useState(false); const [recIn, setRecIn] = useState("");
  const handleKey = (num) => { if (input.length < 4) { const newVal = input + num; setInput(newVal); if (newVal === settings.pinLock) setTimeout(onSuccess, 250); else if (newVal.length === 4) { setInput(""); showToast("ভুল পিন!", "error"); } } };
  if (isForgot) return (<div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: TH.bg, padding: 35 }}><KeyRound size={70} color="#f59e0b"/><h2 style={{ fontWeight: 900, marginTop:20 }}>রিস্টোর পিন</h2><input type="text" placeholder="গোপন শব্দ" value={recIn} onChange={e=>setRecIn(e.target.value)} style={{ width:"100%", maxWidth:320, padding:22, borderRadius:22, marginTop:35, background:TH.bgCard, border:`2px solid ${TH.border}`, color:TH.text, textAlign:"center", fontWeight:800, outline:"none" }} /><button onClick={()=>{ if(recIn.toLowerCase() === settings.recoveryWord?.toLowerCase()){ setSettings({...settings, pinLock:""}); onSuccess(); } else showToast("ভুল শব্দ!", "error"); }} style={{ width:"100%", maxWidth:320, padding:22, background:"#f59e0b", color:"#fff", border:"none", borderRadius:22, fontWeight:900, marginTop:25 }}>Unlock</button></div>);
  return (<div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: TH.bg }}><Lock size={65} color="#8b5cf6"/><div style={{ display: "flex", gap: 25, margin: "50px 0" }}>{[1,2,3,4].map(i => <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: input.length >= i ? "#8b5cf6" : TH.border, boxShadow: input.length >= i ? "0 0 15px #8b5cf6" : "none" }} />)}</div><div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 25 }}>{[1,2,3,4,5,6,7,8,9, "C", 0, "×"].map(k => (<button key={k} onClick={() => { if(k==="C") setInput(""); else if(k==="×") setInput(input.slice(0,-1)); else handleKey(k.toString()); }} style={{ width: 85, height: 85, borderRadius: "50%", background: TH.bgCard, border: `1px solid ${TH.border}`, color: TH.text, fontSize: 30, fontWeight: 900 }}>{k}</button>))}</div><button onClick={()=>setIsForgot(true)} style={{ marginTop: 50, color: "#8b5cf6", background: "none", border: "none", fontWeight: 800 }}>পিন ভুলে গেছেন?</button></div>);
}

function SettingsModal({ settings, setSettings, data, setData, onClose, TH, showToast, AUTHOR, getCategories, setConfirmDialog }) {
  const [newPin, setNewPin] = useState(""); const [recovery, setRecovery] = useState("");
  const [newCat, setNewCat] = useState({ type: "expense", name: "", icon: "📦", color: "#8b5cf6" }); 
  
  const addCategory = () => {
    if(!newCat.name) return showToast(settings.lang==='bn'?"নাম দিন":"Enter Name", "error");
    const n = { id: genId(), label: { bn: newCat.name, en: newCat.name }, icon: newCat.icon, color: newCat.color, bg: `${newCat.color}20` };
    setData({ ...data, customCategories: { ...data.customCategories, [newCat.type]: [...(data.customCategories[newCat.type] || []), n] } });
    setNewCat({ type: "expense", name: "", icon: "📦", color: "#8b5cf6" }); showToast(settings.lang==='bn'?"সফল!":"Added!", "success");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 2000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: TH.bgCard, padding: "40px 30px 60px", borderRadius: "45px 45px 0 0", width: "100%", maxWidth: 480, maxHeight: "94vh", overflowY: "auto", borderTop:`1px solid ${TH.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}><h2 style={{ fontWeight: 900 }}>{settings.lang==='bn'?'সেটিংস':'Settings'}</h2><button onClick={onClose} style={{ background: "none", border: "none", color: TH.textMid }}><X size={32}/></button></div>
        
        {/* থিম ও ভাষা */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 15 }}>
           <button onClick={()=>setSettings({...settings, theme: "light"})} style={{ padding: 18, borderRadius: 18, background: settings.theme==='light'?'#f59e0b':TH.bgInner, color: settings.theme==='light'?'#fff':TH.text, border: "none", fontWeight:800 }}><Sun size={18}/> Light</button>
           <button onClick={()=>setSettings({...settings, theme: "dark"})} style={{ padding: 18, borderRadius: 18, background: settings.theme==='dark'?'#8b5cf6':TH.bgInner, color: settings.theme==='dark'?'#fff':TH.text, border: "none", fontWeight:800 }}><Moon size={18}/> Dark</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
           <button onClick={()=>setSettings({...settings, lang: "bn"})} style={{ padding: 18, borderRadius: 18, background: settings.lang==='bn'?'#8b5cf6':TH.bgInner, color: settings.lang==='bn'?'#fff':TH.text, border: "none", fontWeight:800 }}>বাংলা</button>
           <button onClick={()=>setSettings({...settings, lang: "en"})} style={{ padding: 18, borderRadius: 18, background: settings.lang==='en'?'#8b5cf6':TH.bgInner, color: settings.lang==='en'?'#fff':TH.text, border: "none", fontWeight:800 }}>English</button>
        </div>
        <select value={settings.curr} onChange={e=>setSettings({...settings, curr: e.target.value})} style={{ width: "100%", padding: 18, borderRadius: 18, background: TH.bgInner, border: "none", color: TH.text, fontWeight: 800, marginBottom: 25, outline:"none" }}>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.sym})</option>)}</select>

        {/* নতুন ক্যাটাগরি */}
        <div style={{ padding:20, background:TH.bgInner, borderRadius:25, marginBottom:25 }}>
          <p style={{ fontWeight:800, marginBottom:12, color:"#8b5cf6", fontSize:14 }}>{settings.lang==='bn'?'নতুন ক্যাটাগরি':'Add Category'}</p>
          <div style={{ display:"flex", gap:10, marginBottom:10 }}>
            <select value={newCat.type} onChange={e=>setNewCat({...newCat, type:e.target.value})} style={{ padding:12, borderRadius:12, background:TH.bgCard, color:TH.text, border:"none", outline:"none" }}><option value="expense">{settings.lang==='bn'?'ব্যয়':'Expense'}</option><option value="income">{settings.lang==='bn'?'আয়':'Income'}</option></select>
            <input type="text" placeholder="ইমোজি 🍔" value={newCat.icon} onChange={e=>setNewCat({...newCat, icon:e.target.value})} style={{ width:70, padding:12, borderRadius:12, background:TH.bgCard, color:TH.text, border:"none", textAlign:"center", outline:"none" }} />
            <input type="color" value={newCat.color} onChange={e=>setNewCat({...newCat, color:e.target.value})} style={{ width:50, height:48, padding:0, border:"none", borderRadius:12, background:"none", cursor:"pointer" }} />
          </div>
          <input type="text" placeholder={settings.lang==='bn'?'নাম':'Name'} value={newCat.name} onChange={e=>setNewCat({...newCat, name:e.target.value})} style={{ width:"100%", padding:14, borderRadius:12, background:TH.bgCard, color:TH.text, border:"none", marginBottom:12, outline:"none" }} />
          <button onClick={addCategory} style={{ width:"100%", padding:15, background:"#8b5cf6", color:"#fff", border:"none", borderRadius:12, fontWeight:900 }}>Save Category</button>
        </div>

        {/* পিন সিকিউরিটি */}
        <div style={{ padding:20, background:TH.bgInner, borderRadius:25, marginBottom:25 }}><p style={{ fontWeight:800, marginBottom:12, color:"#8b5cf6", fontSize:14 }}>PIN SECURITY</p><div style={{ display:"flex", gap:10, marginBottom:10 }}><input type="number" placeholder="4-Digit" value={newPin} onChange={e=>setNewPin(e.target.value.slice(0,4))} style={{ flex:1, padding:14, borderRadius:12, background:TH.bgCard, color:TH.text, border:"none", textAlign:"center", fontWeight:800, outline:"none" }} /><input type="text" placeholder="Secret Word" value={recovery} onChange={e=>setRecovery(e.target.value)} style={{ flex:1, padding:14, borderRadius:12, background:TH.bgCard, color:TH.text, border:"none", textAlign:"center", fontWeight:800, outline:"none" }} /></div><button onClick={()=>{ if(newPin.length===4 && recovery){ setSettings({...settings, pinLock: newPin, recoveryWord: recovery.toLowerCase()}); showToast(settings.lang==='bn'?"পিন সেট হয়েছে":"PIN Set", "success"); } }} style={{ width:"100%", padding:14, background:"#10b981", color:"#fff", border:"none", borderRadius:12, fontWeight:900 }}>Set PIN</button>{settings.pinLock && <button onClick={()=>setSettings({...settings, pinLock:"", recoveryWord:""})} style={{ width:"100%", marginTop:10, color:"#ef4444", fontWeight:800, background:"none", border:"none" }}>Remove PIN</button>}</div>

        {/* ব্যাকআপ ও রিসেট */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}><button onClick={()=>{ const blob = new Blob([JSON.stringify({data, settings})], {type: "application/json"}); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `NaFinance_Backup.json`; link.click(); showToast("Backup Success", "success"); }} style={{ padding: 16, borderRadius: 15, background: TH.bgInner, color: TH.text, fontWeight: 800, border:"none" }}>Backup</button><label style={{ padding: 16, borderRadius: 15, background: TH.bgInner, color: TH.text, fontWeight: 800, textAlign:"center" }}>Restore <input type="file" style={{display:"none"}} onChange={(e)=>{ const reader = new FileReader(); reader.onload = (ev) => { try { const p = JSON.parse(ev.target.result); if(p.data) setData({...DEFAULT_DATA, ...p.data}); if(p.settings) setSettings({...DEFAULT_SETTINGS, ...p.settings}); showToast("Restore Success", "success"); } catch(err) { showToast("Invalid File", "error"); } }; reader.readAsText(e.target.files[0]); }}/></label></div>
        <button onClick={()=>{ setConfirmDialog({show:true, msg:settings.lang==='bn'?"সব ডেটা মুছে যাবে! নিশ্চিত?":"Are you sure to Reset?", onConfirm:()=>{localStorage.clear(); window.location.reload();}}) }} style={{ width: "100%", padding: 18, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: 18, fontWeight: 900 }}>Factory Reset</button>
      </div>
    </div>
  );
}

function NavBtn({ active, icon: Icon, label, onClick, TH }) {
  return (<button onClick={onClick} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}><div style={{ padding: "12px 24px", borderRadius: 22, background: active ? "rgba(139,92,246,0.15)" : "transparent", transition:"0.3s" }}><Icon size={26} color={active ? "#8b5cf6" : TH.textMid} strokeWidth={active ? 2.5 : 2}/></div><span style={{ fontSize: 12, fontWeight: 800, color: active ? "#8b5cf6" : TH.textMid }}>{label}</span></button>);
}