import { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid
} from "recharts";
import html2canvas from "html2canvas";
import { Toaster, toast } from 'react-hot-toast';
import {
  Plus, Trash2, Home, BarChart2, Settings, TrendingDown, TrendingUp,
  Users, X, Download, Printer, Eye, EyeOff, Search, 
  AlertTriangle, Landmark, Wallet, Lock, 
  Camera, Sun, Moon, KeyRound, Edit3, CheckCircle2, History, PlusCircle
} from "lucide-react";

// ── CONFIG ─────────────────────────────────────────────────────────────
const AUTHOR   = "Mushfiqur Rahman Nafi";
const APP_NAME = "NaFinance";

const BASE_CATEGORIES = {
  expense: [
    { id: "food",      label: { bn: "খাবার",    en: "Food" },      icon: "🍔", color: "#f97316", bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.35)" },
    { id: "transport", label: { bn: "যাতায়াত", en: "Transport" }, icon: "🚌", color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.35)" },
    { id: "rent",      label: { bn: "ভাড়া",    en: "Rent" },      icon: "🏠", color: "#a855f7", bg: "rgba(168,85,247,0.12)",  border: "rgba(168,85,247,0.35)" },
    { id: "shopping",  label: { bn: "কেনাকাটা", en: "Shopping" }, icon: "🛒", color: "#ec4899", bg: "rgba(236,72,153,0.12)",  border: "rgba(236,72,153,0.35)" },
    { id: "other_ex",  label: { bn: "অন্যান্য", en: "Other" },    icon: "📝", color: "#64748b", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.35)" },
  ],
  income: [
    { id: "freelance", label: { bn: "ফ্রিল্যান্স", en: "Freelance" }, icon: "💻", color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.35)" },
    { id: "salary",    label: { bn: "বেতন",        en: "Salary" },    icon: "💰", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.35)" },
    { id: "other_in",  label: { bn: "অন্যান্য",   en: "Other" },     icon: "🎁", color: "#64748b", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.35)" },
  ],
};

const CURRENCIES = [{ code: "BDT", sym: "৳", loc: "bn-BD" }, { code: "USD", sym: "$", loc: "en-US" }];
const DAY_NAMES = { bn: ["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"], en: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] };

const TODAY    = () => new Date().toISOString().split("T")[0];
const genId    = () => Math.random().toString(36).substr(2, 9);
const fmtMoney = (n, curr, lang) => {
  const c = CURRENCIES.find(x => x.code === curr) || CURRENCIES[0];
  return new Intl.NumberFormat(lang === "bn" ? "bn-BD" : c.loc, { style: "currency", currency: c.code, minimumFractionDigits: 0 }).format(n || 0);
};

// ── MAIN APP ──────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem("nafinance_db_master");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {
      txs: [], wallets: [{ id: "w1", name: "Cash", balance: 0, icon: "💵" }, { id: "w2", name: "Bank", balance: 0, icon: "🏦" }],
      debts: [], goals: [], budgets: {}, recurring: [], savings: { balance: 0, history: [] }, customCategories: { expense: [], income: [] },
      dismissedAlerts: [] 
    };
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("nafinance_set_master");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return { lang: "bn", curr: "BDT", theme: "dark", hideBalance: false, pinLock: "", recoveryWord: "" };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!settings.pinLock);
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [editTxData, setEditTxData] = useState(null); 
  const [showInstall, setShowInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const appRef = useRef(null);

  useEffect(() => { localStorage.setItem("nafinance_db_master", JSON.stringify(data)); }, [data]);
  useEffect(() => { localStorage.setItem("nafinance_set_master", JSON.stringify(settings)); }, [settings]);

  useEffect(() => {
    const handleVisibility = () => { if (document.visibilityState === "hidden" && settings.pinLock) setIsAuthenticated(false); };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [settings.pinLock]);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const isMobile = /android|iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    if (!isStandalone && isMobile) setTimeout(() => setShowInstall(true), 2000);
    const handlePrompt = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowInstall(false);
    } else {
      toast("ব্রাউজারের মেনু থেকে 'Install App' এ ক্লিক করুন!", { icon: '💡' });
    }
  };

  // 🚀 PREMIUM REACT-HOT-TOAST
  const showToast = (msg, type="error") => {
    const style = {
      borderRadius: '16px',
      background: settings.theme === 'dark' ? '#1e293b' : '#ffffff',
      color: settings.theme === 'dark' ? '#f8fafc' : '#0f172a',
      fontWeight: 800,
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      padding: '12px 20px'
    };
    if (type === "success") toast.success(msg, { style });
    else if (type === "info") toast(msg, { icon: '💡', style });
    else toast.error(msg, { style });
  };

  const isDark = settings.theme === "dark";
  const TH = isDark 
    ? { bg: "#030712", bgCard: "rgba(15,23,42,0.9)", bgInner: "rgba(30,41,59,0.6)", border: "rgba(99,102,241,0.15)", text: "#e2e8f0", textMid: "#94a3b8" }
    : { bg: "#f8fafc", bgCard: "#ffffff", bgInner: "#f1f5f9", border: "#e2e8f0", text: "#0f172a", textMid: "#64748b" };

  const fmt = n => settings.hideBalance ? "••••" : fmtMoney(n, settings.curr, settings.lang);
  
  const getCategories = (type) => [...BASE_CATEGORIES[type], ...(data.customCategories[type] || [])];

  const activeAlerts = useMemo(() => {
    return getCategories("expense").filter(cat => {
      if ((data.dismissedAlerts || []).includes(cat.id)) return false;
      const lim = data.budgets[cat.id];
      if (!lim) return false;
      const spent = data.txs.filter(x => x.type === "expense" && x.category === cat.id && x.date.startsWith(TODAY().slice(0, 7))).reduce((s, e) => s + e.amount, 0);
      return spent >= lim * 0.8;
    });
  }, [data.budgets, data.txs, data.dismissedAlerts, data.customCategories]);

  const saveTx = (tx, oldTx = null) => {
    let tempWallets = [...data.wallets];
    if (oldTx) {
      tempWallets = tempWallets.map(w => w.id === oldTx.walletId ? { ...w, balance: oldTx.type === "income" ? w.balance - oldTx.amount : w.balance + oldTx.amount } : w);
    }
    const isInc = tx.type === "income";
    const targetW = tempWallets.find(w => w.id === tx.walletId);
    if (!isInc && targetW.balance < tx.amount) { showToast("পর্যাপ্ত ব্যালেন্স নেই!", "error"); return false; }
    
    tempWallets = tempWallets.map(w => w.id === tx.walletId ? { ...w, balance: isInc ? w.balance + tx.amount : w.balance - tx.amount } : w);
    let newTxs = oldTx ? data.txs.map(t => t.id === oldTx.id ? tx : t) : [tx, ...data.txs];
    
    setData({ ...data, txs: newTxs, wallets: tempWallets });
    showToast(oldTx ? "আপডেট হয়েছে" : "যুক্ত হয়েছে", "success");
    return true;
  };

  const deleteTx = tx => {
    const isInc = tx.type === "income";
    const ws = data.wallets.map(w => w.id === tx.walletId ? { ...w, balance: isInc ? w.balance - tx.amount : w.balance + tx.amount } : w);
    setData({ ...data, txs: data.txs.filter(x => x.id !== tx.id), wallets: ws });
    showToast("ডিলিট হয়েছে", "success");
  };

  const exportPNG = async () => {
    if (!appRef.current) return;
    const canvas = await html2canvas(appRef.current, { backgroundColor: TH.bg });
    const link = document.createElement('a'); 
    link.download = `NaFinance_${TODAY()}.png`; 
    link.href = canvas.toDataURL(); 
    link.click();
  };

  if (!isAuthenticated) return <PinScreen settings={settings} setSettings={setSettings} onSuccess={() => setIsAuthenticated(true)} TH={TH} showToast={showToast} />;

  return (
    <div ref={appRef} style={{ minHeight: "100vh", background: TH.bg, color: TH.text, fontFamily: "'Hind Siliguri', sans-serif" }}>
      <Toaster position="top-center" reverseOrder={false} />
      
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: isDark ? "rgba(3,7,18,0.85)" : "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${TH.border}`, padding: "12px 20px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/icon-192x192.png" style={{ width: 34, height: 34, borderRadius: 10 }} alt="logo" />
            <div><span style={{ fontWeight: 800, fontSize: 18, color: "#8b5cf6" }}>{APP_NAME}</span><p style={{ fontSize: 10, color: TH.textMid }}>{TODAY()}</p></div>
          </div>
          <button onClick={() => setModal("settings")} style={{ padding: 9, background: TH.bgInner, border: "none", borderRadius: 12, color: TH.textMid }}><Settings size={18}/></button>
        </div>
      </header>

      {showInstall && (
        <div style={{ maxWidth: 450, margin: "15px auto", background: "linear-gradient(135deg, #10b981, #059669)", borderRadius: 18, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff", width: "92%", boxShadow: "0 10px 25px rgba(16,185,129,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}><Download size={22}/><div><p style={{ fontWeight: 800, fontSize: 14 }}>NaFinance ইন্সটল করুন</p></div></div>
          <button onClick={() => setShowInstall(false)} style={{ color: "#fff", background: "none", border: "none" }}><X size={20}/></button>
        </div>
      )}

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "10px 16px 140px" }}>
        {tab === "home" && <HomeView data={data} setData={setData} fmt={fmt} TH={TH} settings={settings} setSettings={setSettings} activeAlerts={activeAlerts} getCategories={getCategories} exportPNG={exportPNG} deleteTx={deleteTx} />}
        {tab === "assets" && <AssetsView data={data} setData={setData} fmt={fmt} TH={TH} showToast={showToast} />}
        {tab === "planning" && <PlanningView data={data} setData={setData} fmt={fmt} TH={TH} lang={settings.lang} getCategories={getCategories} showToast={showToast} />}
        {tab === "graphs" && <GraphsView data={data} fmt={fmt} TH={TH} lang={settings.lang} getCategories={getCategories} />}
      </main>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: isDark ? "#0f172a" : "#fff", borderTop: `1px solid ${TH.border}`, padding: "10px 0 30px", backdropFilter: "blur(15px)" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          <NavBtn active={tab==="home"} icon={Home} label="হোম" onClick={()=>setTab("home")} TH={TH}/>
          <NavBtn active={tab==="assets"} icon={Wallet} label="ওয়ালেট" onClick={()=>setTab("assets")} TH={TH}/>
          <button onClick={() => { setEditTxData(null); setModal("tx"); }} style={{ width: 60, height: 60, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(139,92,246,0.4)", marginTop: -40, border: `4px solid ${TH.bg}` }}><Plus size={28} color="#fff"/></button>
          <NavBtn active={tab==="planning"} icon={Landmark} label="প্ল্যান" onClick={()=>setTab("planning")} TH={TH}/>
          <NavBtn active={tab==="graphs"} icon={BarChart2} label="বিশ্লেষণ" onClick={()=>setTab("graphs")} TH={TH}/>
        </div>
      </nav>

      {modal === "tx" && <TxModal data={data} saveTx={saveTx} onClose={()=>setModal(null)} TH={TH} editData={editTxData} getCategories={getCategories} lang={settings.lang} showToast={showToast} />}
      {modal === "settings" && <SettingsModal settings={settings} setSettings={setSettings} data={data} setData={setData} onClose={()=>setModal(null)} TH={TH} showToast={showToast} />}
    </div>
  );
}

// ── SUB-VIEWS ───────────────────────────────────────────────────────

function HomeView({ data, setData, fmt, TH, settings, setSettings, activeAlerts, getCategories, exportPNG, deleteTx }) {
  const total = data.wallets.reduce((s, w) => s + w.balance, 0);
  const spentToday = data.txs.filter(x => x.date === TODAY() && x.type === "expense").reduce((s, e) => s + e.amount, 0);
  const [search, setSearch] = useState("");

  const dismissAlert = (catId) => {
    setData({ ...data, dismissedAlerts: [...(data.dismissedAlerts || []), catId] });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {activeAlerts.map(cat => (
        <div key={cat.id} style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)", padding: "12px 16px", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
          <div style={{display:"flex", alignItems:"center", gap: 8}}>
            <AlertTriangle size={18} color="#f59e0b"/> 
            <span>{cat.icon} <b>{cat.label[settings.lang]}</b> বাজেট ৮০% ছাড়িয়েছে!</span>
          </div>
          <button onClick={()=>dismissAlert(cat.id)} style={{background:"none", border:"none", color: TH.textMid, cursor:"pointer", padding: 5}}><X size={18}/></button>
        </div>
      ))}

      <div style={{ padding: 28, borderRadius: 32, background: "linear-gradient(135deg, #0f172a, #1e1b4b)", color: "#fff", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
        <p style={{ fontSize: 11, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>মোট ব্যালেন্স</p>
        <h2 style={{ fontSize: 44, fontWeight: 900, margin: "8px 0" }}>{fmt(total)}</h2>
        <div style={{ display: "flex", gap: 15, marginTop: 15 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", padding: "12px 15px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
            <p style={{ fontSize: 9, opacity: 0.6, fontWeight: 700 }}>আজকের খরচ</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#fca5a5" }}>{fmt(spentToday)}</p>
          </div>
          <button onClick={()=>setSettings({...settings, hideBalance: !settings.hideBalance})} style={{ padding: 12, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 16, color: "#fff" }}>
            {settings.hideBalance ? <Eye size={20}/> : <EyeOff size={20}/>}
          </button>
        </div>
      </div>
      
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <button onClick={exportPNG} style={{ padding:12, borderRadius:12, background:TH.bgInner, border:`1px solid ${TH.border}`, color:TH.text, fontWeight:700, fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Camera size={14}/> স্ক্রিনশট</button>
        <button onClick={()=>window.print()} style={{ padding:12, borderRadius:12, background:TH.bgInner, border:`1px solid ${TH.border}`, color:TH.text, fontWeight:700, fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Printer size={14}/> PDF রিপোর্ট</button>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: TH.bgInner, padding: "12px 18px", borderRadius: 18 }}>
        <Search size={18} color={TH.textMid}/>
        <input type="text" placeholder="লেনদেন খুঁজুন..." value={search} onChange={e=>setSearch(e.target.value)} style={{ background:"none", border:"none", color:TH.text, outline:"none", flex:1, fontSize:15, fontWeight:600 }}/>
      </div>
      
      <h3 style={{ fontWeight: 800, fontSize: 18 }}>সাম্প্রতিক লেনদেন</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {!(data.txs||[]).length && (
          <div style={{ textAlign: "center", padding: "40px 20px", background: TH.bgCard, borderRadius: 20, border: `1px solid ${TH.border}` }}>
            <span style={{ fontSize: 48, display: "block", marginBottom: 10 }}>📭</span>
            <p style={{ color: TH.textMid, fontWeight: 700 }}>এখনো কোনো লেনদেন যোগ হয়নি</p>
          </div>
        )}
        {data.txs.filter(x => x.note?.toLowerCase().includes(search.toLowerCase())).slice(0, 20).map(tx => {
          const cat = getCategories(tx.type).find(c => c.id === tx.category) || {icon:"📝", color:"#ccc", bg:"#ccc20", border:"#ccc50", label:{bn:"অন্যান্য", en:"Other"}};
          return (
            <div key={tx.id} style={{ padding: 16, background: TH.bgCard, borderRadius: 22, border: `1px solid ${TH.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 15, background: cat.bg, border: `1px solid ${cat.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{cat.icon}</div>
                <div><p style={{ fontWeight: 800, fontSize: 15 }}>{tx.note || cat.label[settings.lang]}</p><p style={{ fontSize: 11, color: TH.textMid, fontWeight: 600 }}>{tx.date}</p></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <p style={{ fontWeight: 900, fontSize: 15, color: tx.type === "income" ? "#10b981" : "#ef4444" }}>{tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}</p>
                <button onClick={()=>deleteTx(tx)} style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "none", padding: 8, borderRadius: 10 }}><Trash2 size={16}/></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AssetsView({ data, setData, fmt, TH, showToast }) {
  const [debtForm, setDebtForm] = useState({ show: false, person: "", amount: "", type: "lend", date: TODAY(), sourceId: "w1" });
  const [settleForm, setSettleForm] = useState({ show: false, debt: null, targetId: "w1" });

  const handleAddDebt = () => {
    const amt = Number(debtForm.amount);
    if(!debtForm.person || !amt) return showToast("সঠিক তথ্য দিন", "error");
    
    let newWallets = [...data.wallets];
    let newSavings = { ...(data.savings || { balance: 0, history: [] }) };
    let newTxs = [...data.txs];

    if (debtForm.type === "lend") {
      if (debtForm.sourceId === "savings") {
        if (newSavings.balance < amt) return showToast("সেভিংস-এ পর্যাপ্ত টাকা নেই!", "error");
        newSavings.balance -= amt;
        newSavings.history = [{ id: genId(), date: TODAY(), amount: amt, type: 'withdraw', note: `Lent to ${debtForm.person}` }, ...(newSavings.history || [])];
      } else {
        const wIdx = newWallets.findIndex(w => w.id === debtForm.sourceId);
        if (wIdx === -1 || newWallets[wIdx].balance < amt) return showToast("ওয়ালেটে পর্যাপ্ত টাকা নেই!", "error");
        newWallets[wIdx].balance -= amt;
        newTxs = [{ id: genId(), type: 'expense', date: TODAY(), amount: amt, category: 'other_ex', walletId: debtForm.sourceId, note: `Lent to ${debtForm.person}` }, ...newTxs];
      }
    } else {
      if (debtForm.sourceId === "savings") {
        newSavings.balance += amt;
        newSavings.history = [{ id: genId(), date: TODAY(), amount: amt, type: 'deposit', note: `Borrowed from ${debtForm.person}` }, ...(newSavings.history || [])];
      } else {
        const wIdx = newWallets.findIndex(w => w.id === debtForm.sourceId);
        newWallets[wIdx].balance += amt;
        newTxs = [{ id: genId(), type: 'income', date: TODAY(), amount: amt, category: 'other_in', walletId: debtForm.sourceId, note: `Borrowed from ${debtForm.person}` }, ...newTxs];
      }
    }
    
    setData({ ...data, wallets: newWallets, savings: newSavings, txs: newTxs, debts: [{...debtForm, id: genId(), amount: amt}, ...data.debts] });
    setDebtForm({ show: false, person: "", amount: "", type: "lend", date: TODAY(), sourceId: "w1" });
    showToast("ধার যুক্ত হয়েছে", "success");
  };

  const handleSettleDebt = () => {
    const amt = settleForm.debt.amount;
    let newWallets = [...data.wallets];
    let newSavings = { ...(data.savings || { balance: 0, history: [] }) };
    let newTxs = [...data.txs];

    if (settleForm.debt.type === "lend") {
      if (settleForm.targetId === "savings") {
        newSavings.balance += amt;
        newSavings.history = [{ id: genId(), date: TODAY(), amount: amt, type: 'deposit', note: `Repaid by ${settleForm.debt.person}` }, ...(newSavings.history || [])];
      } else {
        const wIdx = newWallets.findIndex(w => w.id === settleForm.targetId);
        newWallets[wIdx].balance += amt;
        newTxs = [{ id: genId(), type: 'income', date: TODAY(), amount: amt, category: 'other_in', walletId: settleForm.targetId, note: `Repaid by ${settleForm.debt.person}` }, ...newTxs];
      }
    } else {
      if (settleForm.targetId === "savings") {
        if (newSavings.balance < amt) return showToast("সেভিংস-এ টাকা নেই!", "error");
        newSavings.balance -= amt;
        newSavings.history = [{ id: genId(), date: TODAY(), amount: amt, type: 'withdraw', note: `Repaid to ${settleForm.debt.person}` }, ...(newSavings.history || [])];
      } else {
        const wIdx = newWallets.findIndex(w => w.id === settleForm.targetId);
        if (wIdx === -1 || newWallets[wIdx].balance < amt) return showToast("ওয়ালেটে টাকা নেই!", "error");
        newWallets[wIdx].balance -= amt;
        newTxs = [{ id: genId(), type: 'expense', date: TODAY(), amount: amt, category: 'other_ex', walletId: settleForm.targetId, note: `Repaid to ${settleForm.debt.person}` }, ...newTxs];
      }
    }
    
    setData({ ...data, wallets: newWallets, savings: newSavings, txs: newTxs, debts: data.debts.filter(d => d.id !== settleForm.debt.id) });
    setSettleForm({ show: false, debt: null, targetId: "w1" });
    showToast("হিসাব ক্লিয়ার হয়েছে!", "success");
  };
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <h3 style={{ fontWeight: 800, fontSize: 18 }}>আপনার ওয়ালেট</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {data.wallets.map(w => (
          <div key={w.id} style={{ padding: 22, background: TH.bgCard, borderRadius: 24, border: `1px solid ${TH.border}` }}>
            <span style={{ fontSize: 28 }}>{w.icon}</span>
            <p style={{ fontSize: 11, fontWeight: 700, color: TH.textMid, marginTop: 12 }}>{w.name}</p>
            <p style={{ fontSize: 20, fontWeight: 900 }}>{fmt(w.balance)}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 15 }}>
        <h3 style={{ fontWeight: 800, fontSize: 18 }}>ধার-দেনা</h3>
        <button onClick={()=>setDebtForm({...debtForm, show: !debtForm.show})} style={{ padding: "8px 16px", borderRadius: 12, background: "#8b5cf6", color: "#fff", border: "none", fontSize: 13, fontWeight: 800 }}>+ নতুন ধার</button>
      </div>
      
      {debtForm.show && (
        <div style={{ padding: 20, background: TH.bgCard, borderRadius: 24, border: `1.5px dashed #8b5cf6`, display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="text" placeholder="ব্যক্তির নাম" value={debtForm.person} onChange={e=>setDebtForm({...debtForm, person: e.target.value})} style={{ padding: 14, borderRadius: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, fontWeight: 600, outline:"none" }} />
          <input type="number" placeholder="টাকার পরিমাণ" value={debtForm.amount} onChange={e=>setDebtForm({...debtForm, amount: e.target.value})} style={{ padding: 14, borderRadius: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, fontWeight: 600, outline:"none" }} />
          <select value={debtForm.type} onChange={e=>setDebtForm({...debtForm, type: e.target.value})} style={{ padding: 14, borderRadius: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, fontWeight: 600, outline:"none" }}>
            <option value="lend">আমি পাবো (Lend)</option>
            <option value="borrow">আমি দেবো (Borrow)</option>
          </select>
          <select value={debtForm.sourceId} onChange={e=>setDebtForm({...debtForm, sourceId: e.target.value})} style={{ padding: 14, borderRadius: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, fontWeight: 600, outline:"none" }}>
            <option value="savings">🏦 সেভিংস ভল্ট থেকে</option>
            {data.wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name} থেকে</option>)}
          </select>
          <button onClick={handleAddDebt} style={{ padding: 15, borderRadius: 14, background: "#8b5cf6", color: "#fff", border: "none", fontWeight: 800 }}>সংরক্ষণ করুন</button>
        </div>
      )}

      {settleForm.show && (
         <div style={{ padding: 20, background: "rgba(16,185,129,0.1)", borderRadius: 24, border: `1.5px solid #10b981`, display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontWeight: 800, fontSize: 14, color: "#10b981" }}>কোথায় টাকা অ্যাড/কাট করবেন?</p>
            <select value={settleForm.targetId} onChange={e=>setSettleForm({...settleForm, targetId: e.target.value})} style={{ padding: 14, borderRadius: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, fontWeight: 600, outline:"none" }}>
              <option value="savings">🏦 সেভিংস ভল্ট</option>
              {data.wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
            </select>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSettleDebt} style={{ flex: 1, padding: 15, borderRadius: 14, background: "#10b981", color: "#fff", border: "none", fontWeight: 800 }}>Confirm</button>
              <button onClick={()=>setSettleForm({show: false, debt: null, targetId: "w1"})} style={{ flex: 1, padding: 15, borderRadius: 14, background: "transparent", color: TH.textMid, border: `1px solid ${TH.border}`, fontWeight: 800 }}>Cancel</button>
            </div>
         </div>
      )}
      
      {!(data.debts||[]).length && <p style={{ textAlign: "center", color: TH.textMid, fontSize: 13, marginTop: 10 }}>কোনো ধার-দেনার রেকর্ড নেই</p>}
      {data.debts.map(d => (
        <div key={d.id} style={{ padding: 18, background: TH.bgCard, borderRadius: 22, border: `1px solid ${TH.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: d.type==="lend"?"#10b98115":"#ef444415", display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={18} color={d.type==="lend"?"#10b981":"#ef4444"}/></div>
            <div><p style={{ fontWeight: 800, fontSize: 15 }}>{d.person}</p><p style={{ fontSize: 11, color: TH.textMid }}>{d.date}</p></div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <p style={{ fontWeight: 900, fontSize: 15, color: d.type === "lend" ? "#10b981" : "#ef4444" }}>{fmt(d.amount)}</p>
            <button onClick={()=>setSettleForm({ show: true, debt: d, targetId: "w1" })} style={{ padding: "6px 12px", background: "rgba(16,185,129,0.1)", color: "#10b981", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Settle ✓</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PlanningView({ data, setData, fmt, TH, lang, getCategories, showToast }) {
  const [subTab, setSubTab] = useState("vault");
  
  // SAVINGS 
  const [saveAmount, setSaveAmount] = useState("");
  const [saveNote, setSaveNote] = useState("");
  const [saveWallet, setSaveWallet] = useState("w1");
  
  // GOALS
  const [goalForm, setGoalForm] = useState({ show: false, id: "", name: "", target: "", saved: "", icon: "🎯" });
  const [addFund, setAddFund] = useState({ id: "", amount: "", sourceId: "w1", note: "" });
  
  // BUDGET CATEGORY
  const [catForm, setCatForm] = useState({ show: false, name: "", icon: "📦", color: "#8b5cf6" });

  const handleSaveAction = (type) => {
    const n = Number(saveAmount);
    if (!n || n <= 0) return showToast("সঠিক পরিমাণ দিন", "error");
    
    let newWallets = [...data.wallets];
    let newSavings = { ...(data.savings || { balance: 0, history: [] }) };
    let newTxs = [...data.txs];
    let wIdx = newWallets.findIndex(x => x.id === saveWallet);

    if (type === 'deposit') {
      if (newWallets[wIdx].balance < n) return showToast("ওয়ালেটে পর্যাপ্ত টাকা নেই!", "error");
      newWallets[wIdx].balance -= n;
      newSavings.balance += n;
      const finalNote = saveNote ? `সেভিংস-এ জমা: ${saveNote}` : "সেভিংস-এ জমা 🏦";
      newSavings.history = [{ id: genId(), date: TODAY(), amount: n, type: 'deposit', note: finalNote }, ...(newSavings.history || [])];
      
      newTxs = [{ id: genId(), type: 'expense', date: TODAY(), amount: n, category: 'other_ex', walletId: saveWallet, note: finalNote }, ...newTxs];
    } else {
      if (newSavings.balance < n) return showToast("সেভিংস-এ পর্যাপ্ত টাকা নেই!", "error");
      newWallets[wIdx].balance += n;
      newSavings.balance -= n; 
      const finalNote = saveNote ? `সেভিংস থেকে উত্তোলন: ${saveNote}` : "সেভিংস থেকে উত্তোলন 🏦";
      newSavings.history = [{ id: genId(), date: TODAY(), amount: n, type: 'withdraw', note: finalNote }, ...(newSavings.history || [])];
      
      newTxs = [{ id: genId(), type: 'income', date: TODAY(), amount: n, category: 'other_in', walletId: saveWallet, note: finalNote }, ...newTxs];
    }
    
    setData({...data, wallets: newWallets, savings: newSavings, txs: newTxs});
    setSaveAmount(""); 
    setSaveNote("");
    showToast(type === 'deposit' ? "সেভিংস জমা হয়েছে" : "সেভিংস থেকে তোলা হয়েছে", "success");
  };

  const handleDeleteGoal = (id) => {
    if(window.confirm("আপনি কি গোলটি ডিলিট করতে চান?")) {
        setData({...data, goals: data.goals.filter(x => x.id !== id)});
        showToast("গোল ডিলিট হয়েছে", "success");
    }
  };

  const handleGoalAction = () => {
    if(!goalForm.name || !goalForm.target) return showToast("সব তথ্য দিন", "error");
    if(goalForm.id) {
      setData({...data, goals: data.goals.map(g => g.id === goalForm.id ? {...g, name: goalForm.name, target: Number(goalForm.target), saved: Number(goalForm.saved), icon: goalForm.icon} : g)});
      showToast("গোল আপডেট হয়েছে", "success");
    } else {
      setData({...data, goals: [...data.goals, { id: genId(), name: goalForm.name, target: Number(goalForm.target), saved: Number(goalForm.saved || 0), icon: goalForm.icon }]});
      showToast("নতুন গোল তৈরি হয়েছে", "success");
    }
    setGoalForm({ show: false, id: "", name: "", target: "", saved: "", icon: "🎯" });
  };

  const handleFund = (id) => {
    const n = Number(addFund.amount);
    if (!n) return showToast("পরিমাণ দিন", "error");
    let newWallets = [...data.wallets];
    let newSavings = { ...(data.savings || { balance: 0, history: [] }) };
    let newTxs = [...data.txs];
    
    const goalName = data.goals.find(g=>g.id===id)?.name || "Goal";
    const finalNote = addFund.note ? `[${addFund.note}] - ${goalName}` : `Funded Goal: ${goalName}`;

    if (addFund.sourceId === "savings") {
        if (newSavings.balance < n) return showToast("সেভিংস-এ টাকা নেই!", "error");
        newSavings.balance -= n;
        newSavings.history = [{ id: genId(), date: TODAY(), amount: n, type: 'withdraw', note: finalNote }, ...(newSavings.history || [])];
    } else if (addFund.sourceId !== "external") {
        const wIdx = newWallets.findIndex(x => x.id === addFund.sourceId);
        if (wIdx === -1 || newWallets[wIdx].balance < n) return showToast("ওয়ালেটে টাকা নেই!", "error");
        newWallets[wIdx].balance -= n;
        newTxs = [{ id: genId(), type: 'expense', date: TODAY(), amount: n, category: 'other_ex', walletId: addFund.sourceId, note: finalNote }, ...newTxs];
    }

    setData({...data, wallets: newWallets, savings: newSavings, txs: newTxs, goals: data.goals.map(g => g.id === id ? {...g, saved: g.saved + n} : g)});
    setAddFund({ id: "", amount: "", sourceId: "w1", note: "" });
    showToast("টাকা যোগ হয়েছে", "success");
  };

  const handleAddBudgetCat = () => {
    if(!catForm.name) return showToast("নাম দিন", "error");
    const newCat = { id: genId(), label: { bn: catForm.name, en: catForm.name }, icon: catForm.icon, color: catForm.color, bg: `${catForm.color}20`, border: `${catForm.color}50` };
    setData({...data, customCategories: { ...data.customCategories, expense: [...(data.customCategories?.expense||[]), newCat] }});
    setCatForm({ show: false, name: "", icon: "📦", color: "#8b5cf6" });
    showToast("ক্যাটাগরি যুক্ত হয়েছে", "success");
  };

  const activeGoals = data.goals.filter(g => g.saved < g.target);
  const completedGoals = data.goals.filter(g => g.saved >= g.target);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 5, background: TH.bgInner, padding: 6, borderRadius: 16 }}>
        <button onClick={()=>setSubTab("vault")} style={{ flex: 1, padding: 10, borderRadius: 12, border: "none", background: subTab==="vault" ? "#8b5cf6" : "transparent", color: subTab==="vault" ? "#fff" : TH.textMid, fontWeight: 800 }}>Vault</button>
        <button onClick={()=>setSubTab("goals")} style={{ flex: 1, padding: 10, borderRadius: 12, border: "none", background: subTab==="goals" ? "#8b5cf6" : "transparent", color: subTab==="goals" ? "#fff" : TH.textMid, fontWeight: 800 }}>Goals</button>
        <button onClick={()=>setSubTab("budgets")} style={{ flex: 1, padding: 10, borderRadius: 12, border: "none", background: subTab==="budgets" ? "#8b5cf6" : "transparent", color: subTab==="budgets" ? "#fff" : TH.textMid, fontWeight: 800 }}>Budgets</button>
      </div>

      {subTab === "vault" && (
        <>
          <div style={{ padding: 30, borderRadius: 32, background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))", border: "1px solid rgba(16,185,129,0.3)", textAlign: "center" }}>
            <div style={{ width: 60, height: 60, background: "#10b981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px", boxShadow: "0 10px 20px rgba(16,185,129,0.2)" }}><Landmark size={30} color="#fff" /></div>
            <p style={{ fontWeight: 800, color: "#10b981", fontSize: 12, textTransform: "uppercase" }}>মোট সঞ্চয়</p>
            <h2 style={{ fontSize: 36, fontWeight: 900, marginTop: 8 }}>{fmt(data.savings?.balance || 0)}</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 25 }}>
              <input type="number" placeholder="টাকার পরিমাণ" value={saveAmount} onChange={e=>setSaveAmount(e.target.value)} style={{ padding: 14, borderRadius: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, fontWeight: 700, outline: "none" }} />
              <input type="text" placeholder="নোট লিখুন (কেন জমা/উত্তোলন করছেন?)" value={saveNote} onChange={e=>setSaveNote(e.target.value)} style={{ padding: 14, borderRadius: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, fontWeight: 600, outline: "none" }} />
              <select value={saveWallet} onChange={e=>setSaveWallet(e.target.value)} style={{ padding: 14, borderRadius: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, outline: "none", fontWeight: 700 }}>
                  {data.wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
              </select>
              <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
                <button onClick={()=>handleSaveAction('deposit')} style={{ flex: 1, padding: 14, background: "#10b981", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800 }}>Deposit</button>
                <button onClick={()=>handleSaveAction('withdraw')} style={{ flex: 1, padding: 14, background: "transparent", color: "#10b981", border: "2px solid #10b981", borderRadius: 12, fontWeight: 800 }}>Withdraw</button>
              </div>
            </div>
          </div>
          <h4 style={{ fontWeight: 800, paddingLeft: 5 }}>সেভিংস হিস্ট্রি</h4>
          {!(data.savings.history||[]).length && <p style={{textAlign:"center", color:TH.textMid, fontSize:13}}>কোনো রেকর্ড নেই</p>}
          {data.savings.history.map(h => (
            <div key={h.id} style={{ padding: 16, background: TH.bgCard, borderRadius: 18, border: `1px solid ${TH.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{display: "flex", alignItems: "center", gap: 10}}>
                <div style={{padding: 8, borderRadius: 10, background: h.type==='withdraw' ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", color: h.type==='withdraw' ? "#ef4444" : "#10b981"}}>
                   {h.type === 'withdraw' ? <TrendingDown size={18}/> : <TrendingUp size={18}/>}
                </div>
                <div><p style={{fontWeight:800, fontSize:14}}>{h.note || (h.type==='withdraw'?'Withdrawal':'Deposit')}</p><p style={{fontSize:11, color:TH.textMid}}>{h.date}</p></div>
              </div>
              <p style={{fontWeight:900, fontSize:16, color: h.type==='withdraw' ? "#ef4444" : "#10b981"}}>{h.type==='withdraw'?'-':'+'}{fmt(h.amount)}</p>
            </div>
          ))}
        </>
      )}

      {subTab === "goals" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontWeight: 800, color: "#8b5cf6" }}>🏆 My Goals</h3>
            <button onClick={()=>setGoalForm({show: true, id: "", name: "", target: "", saved: "", icon: "🎯"})} style={{ padding: "8px 14px", background: "rgba(139,92,246,0.1)", color: "#8b5cf6", borderRadius: 12, border: "none", fontWeight: 800, fontSize: 12 }}>+ New Goal</button>
          </div>
          {goalForm.show && (
            <div style={{ padding: 20, background: TH.bgCard, borderRadius: 24, border: `1px dashed #8b5cf6`, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <input type="text" placeholder="🎯" value={goalForm.icon} onChange={e=>setGoalForm({...goalForm, icon: e.target.value})} style={{ width: "25%", padding: 14, borderRadius: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, textAlign:"center", outline: "none" }}/>
                <input type="text" placeholder="নাম" value={goalForm.name} onChange={e=>setGoalForm({...goalForm, name: e.target.value})} style={{ width: "75%", padding: 14, borderRadius: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, outline: "none" }}/>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{flex: 1}}><p style={{fontSize: 10, color: TH.textMid, fontWeight: 700, paddingBottom: 4}}>টার্গেট (Target)</p><input type="number" placeholder="Target" value={goalForm.target} onChange={e=>setGoalForm({...goalForm, target: e.target.value})} style={{ width: "100%", padding: 14, borderRadius: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, boxSizing:"border-box", outline: "none" }}/></div>
                <div style={{flex: 1}}><p style={{fontSize: 10, color: TH.textMid, fontWeight: 700, paddingBottom: 4}}>জমানো (Saved)</p><input type="number" placeholder="Saved" value={goalForm.saved} onChange={e=>setGoalForm({...goalForm, saved: e.target.value})} style={{ width: "100%", padding: 14, borderRadius: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, boxSizing:"border-box", outline: "none" }}/></div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
                <button onClick={handleGoalAction} style={{ flex: 1, padding: 14, background: "#8b5cf6", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800 }}>{goalForm.id ? "Update" : "Save"}</button>
                <button onClick={()=>setGoalForm({show: false})} style={{ flex: 1, padding: 14, background: "transparent", color: TH.textMid, border: `1px solid ${TH.border}`, borderRadius: 12, fontWeight: 800 }}>Cancel</button>
              </div>
            </div>
          )}
          
          {!(activeGoals.length) && !(completedGoals.length) && <p style={{ textAlign: "center", color: TH.textMid, fontSize: 13, marginTop: 20 }}>কোনো গোল সেট করা নেই</p>}
          
          {activeGoals.map(g => (
            <div key={g.id} style={{ padding: 22, background: TH.bgCard, border: `1px solid ${TH.border}`, borderRadius: 24, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -10, top: -10, fontSize: 100, opacity: 0.05 }}>{g.icon}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                  <h4 style={{ fontWeight: 800, fontSize: 16, color: "#8b5cf6" }}>{g.icon} {g.name}</h4>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={()=>setGoalForm({show: true, id: g.id, name: g.name, target: g.target, saved: g.saved, icon: g.icon})} style={{ background:"none", border:"none", color: "#3b82f6", cursor: "pointer" }}><Edit3 size={18}/></button>
                    <button onClick={()=>handleDeleteGoal(g.id)} style={{ background:"none", border:"none", color: "#f87171", cursor: "pointer" }}><Trash2 size={18}/></button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 10 }}>
                  <p style={{ fontSize: 28, fontWeight: 900 }}>{fmt(g.saved)}</p>
                  <p style={{ fontSize: 12, color: TH.textMid, fontWeight: 700 }}>Target: {fmt(g.target)}</p>
                </div>
                <div style={{ height: 8, background: TH.bgInner, borderRadius: 99, marginBottom: 8 }}>
                  <div style={{ height: "100%", width: `${Math.min((g.saved/g.target)*100, 100)}%`, background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", borderRadius: 99, transition: "width 1s" }}/>
                </div>
                
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", background: TH.bgInner, padding: 12, borderRadius: 16, marginTop: 15 }}>
                  <select value={addFund.id===g.id ? addFund.sourceId : "w1"} onChange={e=>setAddFund({id: g.id, amount: addFund.amount, sourceId: e.target.value, note: addFund.note})} style={{ flex: "1 1 100%", padding: 12, borderRadius: 10, background: TH.bgCard, color: TH.text, border: `1px solid ${TH.border}`, outline: "none", fontWeight: 700 }}>
                    <option value="external">🎁 অন্য উৎস (External)</option>
                    <option value="savings">🏦 সেভিংস থেকে</option>
                    {data.wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name} থেকে</option>)}
                  </select>
                  <input type="text" placeholder="নোট (ঐচ্ছিক)" value={addFund.id===g.id ? addFund.note : ""} onChange={e=>setAddFund({id: g.id, amount: addFund.amount, sourceId: addFund.sourceId, note: e.target.value})} style={{ flex: "1 1 100%", padding: 12, borderRadius: 10, background: TH.bgCard, border: `1px solid ${TH.border}`, color: TH.text, outline: "none" }} />
                  <input type="number" placeholder="পরিমাণ" value={addFund.id===g.id ? addFund.amount : ""} onChange={e=>setAddFund({id: g.id, amount: e.target.value, sourceId: addFund.sourceId, note: addFund.note})} style={{ flex: 1, padding: 12, borderRadius: 10, background: TH.bgCard, border: `1px solid ${TH.border}`, color: TH.text, outline: "none" }} />
                  <button onClick={()=>handleFund(g.id)} style={{ padding: "0 20px", background: "#8b5cf6", color: "#fff", fontWeight: 800, borderRadius: 10, border: "none" }}>Add</button>
                </div>
            </div>
          ))}

          {completedGoals.length > 0 && (
              <div style={{ marginTop: 20 }}>
                  <h4 style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.6, marginBottom: 10 }}><History size={18}/> Completed Goals</h4>
                  {completedGoals.map(g => (
                      <div key={g.id} style={{ padding: 18, background: TH.bgInner, borderRadius: 16, border: `1px solid ${TH.border}`, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.8 }}>
                          <div style={{display:"flex", gap:12, alignItems:"center"}}>
                            <CheckCircle2 size={24} color="#10b981"/> 
                            <div><b style={{fontSize:15}}>{g.icon} {g.name}</b><br/><span style={{fontSize:12, fontWeight:700, color:"#10b981"}}>{fmt(g.saved)} Achieved!</span></div>
                          </div>
                          <button onClick={()=>handleDeleteGoal(g.id)} style={{ background:"none", border:"none", color: "#f87171", cursor: "pointer" }}><Trash2 size={18}/></button>
                      </div>
                  ))}
              </div>
          )}
        </>
      )}

      {subTab === "budgets" && (
        <div style={{ display:"flex", flexDirection:"column", gap:15 }}>
          <button onClick={()=>setCatForm({...catForm, show: !catForm.show})} style={{ padding: "12px", borderRadius: 12, background: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "1px dashed #8b5cf6", fontWeight: 800, display: "flex", justifyContent: "center", gap: 8 }}><PlusCircle size={18}/> Add Category</button>
          
          {catForm.show && (
            <div style={{ padding: 18, background: TH.bgInner, borderRadius: 16, border: `1px solid ${TH.border}` }}>
               <input type="text" placeholder="ক্যাটাগরির নাম" value={catForm.name} onChange={e=>setCatForm({...catForm, name: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 10, marginBottom: 10, boxSizing: "border-box", background: TH.bgCard, color: TH.text, border: `1px solid ${TH.border}`, outline:"none" }}/>
               <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                 <input type="text" placeholder="ইমোজি (যেমন: 🍕)" value={catForm.icon} onChange={e=>setCatForm({...catForm, icon: e.target.value})} style={{ width: "50%", padding: 12, borderRadius: 10, textAlign: "center", background: TH.bgCard, color: TH.text, border: `1px solid ${TH.border}`, outline:"none" }}/>
                 <input type="color" value={catForm.color} onChange={e=>setCatForm({...catForm, color: e.target.value})} style={{ width: "50%", height: 46, padding: 2, borderRadius: 10, border: "none", background: "transparent" }}/>
               </div>
               <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleAddBudgetCat} style={{ flex: 1, padding: 12, background: "#8b5cf6", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800 }}>Add</button>
                <button onClick={()=>setCatForm({show: false})} style={{ flex: 1, padding: 12, background: "transparent", color: TH.textMid, border: `1px solid ${TH.border}`, borderRadius: 10, fontWeight: 800 }}>Cancel</button>
              </div>
            </div>
          )}

          {getCategories("expense").map(cat => {
            const lim = data.budgets[cat.id] || 0;
            const spent = data.txs.filter(x=>x.type==="expense" && x.category===cat.id && x.date.startsWith(TODAY().slice(0,7))).reduce((s,e)=>s+e.amount,0);
            const pct = lim ? Math.min((spent/lim)*100, 100) : 0;
            return (
              <div key={cat.id} style={{ padding:20, background:TH.bgCard, borderRadius:24, border:`1px solid ${TH.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                  <span style={{ fontWeight:800, fontSize: 15 }}>{cat.icon} {cat.label[lang] || cat.label.en}</span>
                  <span style={{ fontSize:13, fontWeight:800, color: spent > lim && lim > 0 ? "#ef4444" : TH.text }}>{fmt(spent)} / {fmt(lim)}</span>
                </div>
                <div style={{ height: 8, background: TH.bgInner, borderRadius: 10, overflow: "hidden", marginBottom: 15 }}>
                   <div style={{ height: "100%", width: `${pct}%`, background: spent > lim ? "#ef4444" : (cat.color || "#8b5cf6"), borderRadius: 10, transition: "width 0.5s" }} />
                </div>
                <input type="number" placeholder="মাসিক সীমা সেট করুন" value={lim || ""} onChange={e=>setData({...data, budgets:{...data.budgets, [cat.id]:Number(e.target.value)}})} style={{ width:"100%", padding:12, borderRadius:12, background:TH.bgInner, border:`1px solid ${TH.border}`, color:TH.text, fontWeight: 600, boxSizing:"border-box", outline:"none" }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GraphsView({ data, fmt, TH, lang, getCategories }) {
  const [gType, setGType] = useState("pie");
  const catData = getCategories("expense").map(cat => ({ name: cat.label[lang] || cat.label.en, value: data.txs.filter(x=>x.type==="expense" && x.category===cat.id).reduce((s,e)=>s+e.amount,0), color: cat.color || "#8b5cf6" })).filter(x=>x.value>0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
       <div style={{ display: "flex", gap: 10, background: TH.bgInner, padding: 6, borderRadius: 16 }}><button onClick={()=>setGType("pie")} style={{ flex: 1, padding: 10, borderRadius: 12, background: gType==="pie" ? "#8b5cf6" : "transparent", color: gType==="pie" ? "#fff" : TH.textMid, fontWeight: 800, border: "none" }}>Pie</button><button onClick={()=>setGType("bar")} style={{ flex: 1, padding: 10, borderRadius: 12, background: gType==="bar" ? "#8b5cf6" : "transparent", color: gType==="bar" ? "#fff" : TH.textMid, fontWeight: 800, border: "none" }}>Bar</button></div>
       <div style={{ padding: 25, background: TH.bgCard, borderRadius: 32, border: `1px solid ${TH.border}` }}>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              {gType === "pie" ? (
                <PieChart><Pie data={catData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">{catData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius: 15, border:"none", fontWeight: 700, background: TH.bgCard, color: TH.text}}/></PieChart>
              ) : (
                <BarChart data={catData}><XAxis dataKey="name" hide/><Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius: 15, border:"none", fontWeight: 700, background: TH.bgCard, color: TH.text}}/><Bar dataKey="value" fill="#8b5cf6" radius={[8,8,0,0]}/></BarChart>
              )}
            </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
}

function TxModal({ data, saveTx, onClose, TH, editData, getCategories, lang, showToast }) {
  const [type, setType] = useState(editData?.type || "expense");
  const [f, setF] = useState(editData || { date: TODAY(), category: "food", amount: "", note: "", walletId: data.wallets[0]?.id });
  
  const submit = () => {
    if(!f.amount || Number(f.amount) <= 0) return showToast("সঠিক পরিমাণ লিখুন", "error");
    saveTx({...f, type, amount: Number(f.amount), id: editData?.id || genId()});
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 10, backdropFilter: "blur(5px)" }}>
      <div style={{ background: TH.bgCard, padding: 30, borderRadius: "40px 40px 25px 25px", width: "100%", maxWidth: 480, border: `1px solid ${TH.border}`, animation: "slideUp 0.3s ease-out" }}>
        <div style={{ display: "flex", background: TH.bgInner, padding: 6, borderRadius: 15, marginBottom: 25 }}>
          <button onClick={()=>setType("expense")} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: type==="expense"?"#f97316":"transparent", color: type==="expense"?"#fff":TH.textMid, fontWeight: 800 }}>Expense</button>
          <button onClick={()=>setType("income")} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: type==="income"?"#10b981":"transparent", color: type==="income"?"#fff":TH.textMid, fontWeight: 800 }}>Income</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20, maxHeight: 180, overflowY: "auto" }}>
          {getCategories(type).map(c => (
            <button key={c.id} onClick={()=>setF({...f, category:c.id})} style={{ padding: 12, borderRadius: 16, border: `2px solid ${f.category===c.id?(c.color||"#8b5cf6"):TH.border}`, background: f.category===c.id?(c.bg||"#8b5cf620"):TH.bgInner, color: TH.text, fontSize: 11, fontWeight: 800, transition: "all 0.2s" }}>{c.icon}<br/>{c.label[lang] || c.label.en}</button>
          ))}
        </div>
        
        <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
          <select value={f.walletId} onChange={e=>setF({...f, walletId: e.target.value})} style={{ flex: 1, padding: 15, borderRadius: 15, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, fontWeight: 700, outline: "none" }}>
            {data.wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
          </select>
          <input type="date" value={f.date} onChange={e=>setF({...f, date: e.target.value})} style={{ flex: 1, padding: 15, borderRadius: 15, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, fontWeight: 700, outline: "none", colorScheme: TH.bg==="#030712"?"dark":"light" }}/>
        </div>

        <input type="number" placeholder="0" value={f.amount} onChange={e=>setF({...f, amount:e.target.value})} style={{ width: "100%", padding: 18, borderRadius: 20, background: TH.bgInner, border: `2px solid ${TH.border}`, color: "#8b5cf6", fontSize: 32, fontWeight: 900, textAlign: "center", marginBottom: 15, outline: "none", boxSizing: "border-box" }}/>
        <input type="text" placeholder="নোট লিখুন (ঐচ্ছিক)..." value={f.note} onChange={e=>setF({...f, note:e.target.value})} style={{ width: "100%", padding: 15, borderRadius: 15, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, marginBottom: 20, outline: "none", fontWeight: 600, boxSizing: "border-box" }}/>
        <button onClick={submit} style={{ width: "100%", padding: 18, borderRadius: 20, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff", fontWeight: 900, border: "none", cursor: "pointer", fontSize: 16, boxShadow: "0 10px 20px rgba(139,92,246,0.3)" }}>নিশ্চিত করুন ✓</button>
        <button onClick={onClose} style={{ width: "100%", padding: 10, background: "none", border: "none", color: TH.textMid, fontWeight: 800, marginTop: 10 }}>বাতিল</button>
      </div>
    </div>
  );
}

function PinScreen({ settings, setSettings, onSuccess, TH, showToast }) {
  const [input, setInput] = useState("");
  const [isForgot, setIsForgot] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState("");

  const handleKey = (num) => {
    if (input.length < 4) {
      const newVal = input + num;
      setInput(newVal);
      if (newVal === settings.pinLock) setTimeout(onSuccess, 200);
      else if (newVal.length === 4) { setInput(""); showToast("ভুল পিন!", "error"); }
    }
  };

  if (isForgot) return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: TH.bg, padding: 25, textAlign: "center" }}>
      <Toaster position="top-center" reverseOrder={false} />
      <KeyRound size={50} color="#f59e0b" style={{ marginBottom: 20 }}/>
      <h2 style={{ fontWeight: 900 }}>পিন রিকভারি</h2>
      <p style={{ fontSize: 13, color: TH.textMid, marginTop: 10 }}>আপনার সেট করা গোপন শব্দটি লিখুন</p>
      <input type="text" value={recoveryInput} onChange={e=>setRecoveryInput(e.target.value)} placeholder="যেমন: আপনার ডাকনাম" style={{ width: "100%", maxWidth: 320, padding: 18, borderRadius: 18, marginTop: 25, textAlign: "center", border: `2px solid ${TH.border}`, background: TH.bgCard, color: TH.text, fontSize: 16, fontWeight: 700 }} />
      <button onClick={() => {
        if (recoveryInput.toLowerCase() === settings.recoveryWord) { setSettings({...settings, pinLock: "", recoveryWord: ""}); onSuccess(); showToast("পিন রিসেট হয়েছে", "success"); }
        else showToast("ভুল শব্দ!", "error");
      }} style={{ marginTop: 25, width:"100%", maxWidth:320, padding: 18, background: "#f59e0b", color: "#fff", border: "none", borderRadius: 18, fontWeight: 900, fontSize: 16 }}>Verify & Reset</button>
      <button onClick={()=>setIsForgot(false)} style={{ marginTop: 20, background: "none", border: "none", color: TH.textMid, fontWeight: 800 }}>ফিরে যান</button>
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: TH.bg }}>
      <Toaster position="top-center" reverseOrder={false} />
      <Lock size={45} color="#8b5cf6" style={{ marginBottom: 25 }}/>
      <div style={{ display: "flex", gap: 18, marginBottom: 45 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: input.length >= i ? "#8b5cf6" : TH.border, boxShadow: input.length >= i ? "0 0 10px #8b5cf6" : "none" }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 25 }}>
        {[1,2,3,4,5,6,7,8,9, "C", 0, "×"].map(k => (
          <button key={k} onClick={() => {
            if (k === "C") setInput("");
            else if (k === "×") setInput(input.slice(0,-1));
            else handleKey(k.toString());
          }} style={{ width: 75, height: 75, borderRadius: "50%", background: TH.bgCard, border: `1.5px solid ${TH.border}`, color: TH.text, fontSize: 26, fontWeight: 800, cursor: "pointer", transition: "transform 0.1s" }}>{k}</button>
        ))}
      </div>
      {settings.recoveryWord && <button onClick={()=>setIsForgot(true)} style={{ marginTop: 40, color: "#8b5cf6", background: "none", border: "none", fontWeight: 800, fontSize: 14 }}>পিন ভুলে গেছেন?</button>}
    </div>
  );
}

function SettingsModal({ settings, setSettings, data, setData, onClose, TH, showToast }) {
  const [newPin, setNewPin] = useState("");
  const [rec, setRec] = useState("");

  const savePin = () => {
    if (newPin.length === 4 && rec) { setSettings({...settings, pinLock: newPin, recoveryWord: rec.toLowerCase()}); showToast("পিন সেট হয়েছে!", "success"); } 
    else showToast("৪ সংখ্যার পিন ও রিকভারি শব্দ দিন", "error");
  };

  const removePin = () => {
    if(window.confirm("আপনি কি পিন সুরক্ষা মুছে ফেলতে চান?")) {
        setSettings({...settings, pinLock: "", recoveryWord: ""});
        showToast("পিন রিমুভ হয়েছে", "success");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: TH.bgCard, padding: 30, borderRadius: 32, width: "100%", maxWidth: 400, border: `1px solid ${TH.border}`, maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ fontWeight: 900, marginBottom: 25, fontSize: 22 }}>অ্যাপ সেটিংস</h2>
        
        <div style={{ display:"flex", flexDirection:"column", gap:15 }}>
           <p style={{ fontSize:12, fontWeight:800, color: "#8b5cf6", textTransform: "uppercase" }}>অ্যাপ সুরক্ষা (PIN Lock)</p>
           <input type="number" placeholder="৪ সংখ্যার নতুন পিন" value={newPin} onChange={e=>setNewPin(e.target.value.slice(0,4))} style={{ padding: 14, borderRadius: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, fontWeight: 700, outline: "none" }} />
           <input type="text" placeholder="সিক্রেট শব্দ (রিকভারির জন্য)" value={rec} onChange={e=>setRec(e.target.value)} style={{ padding: 14, borderRadius: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, fontWeight: 700, outline: "none" }} />
           <button onClick={savePin} style={{ padding: 15, borderRadius: 15, background: "#8b5cf6", color: "#fff", border: "none", fontWeight: 900 }}>Save PIN Settings</button>
           
           {settings.pinLock && (
               <button onClick={removePin} style={{ padding: 12, borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontWeight: 800 }}>Remove PIN (পিন মুছে ফেলুন)</button>
           )}
        </div>

        <div style={{ marginTop: 25, display: "flex", flexDirection: "column", gap: 10 }}>
           <p style={{ fontSize:12, fontWeight:800, color: "#8b5cf6", textTransform: "uppercase" }}>অন্যান্য</p>
           <button onClick={()=>setSettings({...settings, theme: settings.theme==="dark"?"light":"dark"})} style={{ padding: 14, borderRadius: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>থিম পরিবর্তন {settings.theme==="dark"?<Sun size={16}/>:<Moon size={16}/>}</button>
           <button onClick={()=>{if(window.confirm("সব ডেটা মুছে যাবে!")) {setData({ txs: [], wallets: [{ id: "w1", name: "Cash", balance: 0, icon: "💵" }, { id: "w2", name: "Bank", balance: 0, icon: "🏦" }], debts: [], goals: [], budgets: {}, recurring: [], savings: { balance: 0, history: [] }, dismissedAlerts: [], customCategories: { expense: [], income: [] } }); onClose();}}} style={{ padding: 14, borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontWeight: 700 }}>ফ্যাক্টরি রিসেট</button>
        </div>

        <button onClick={onClose} style={{ width: "100%", padding: 15, background: TH.bgInner, border: `1px solid ${TH.border}`, borderRadius: 15, color: TH.text, fontWeight: 800, marginTop: 20 }}>বন্ধ করুন</button>
      </div>
    </div>
  );
}

function NavBtn({ active, icon: Icon, label, onClick, TH }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", transition: "all 0.3s" }}>
      <div style={{ padding: "10px 20px", borderRadius: 18, background: active ? "rgba(139,92,246,0.15)" : "transparent" }}><Icon size={24} color={active ? "#8b5cf6" : TH.textMid} strokeWidth={active ? 2.5 : 2}/></div>
      <span style={{ fontSize: 10, fontWeight: 800, color: active ? "#8b5cf6" : TH.textMid }}>{label}</span>
    </button>
  );
}