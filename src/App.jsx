import { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import html2canvas from "html2canvas";
import {
  Plus, Trash2, Home, BarChart2, Settings, TrendingDown, TrendingUp,
  CreditCard, HandCoins, Target, Users, Sun, Moon, X,
  DollarSign, Download, Printer, Eye, EyeOff, ShieldCheck, Code, Search, 
  Filter, AlertTriangle, Upload, ChevronLeft, ChevronRight, PiggyBank, 
  Edit3, Calendar, Wallet, ArrowUpRight, ArrowDownRight, ArrowRightLeft,
  CheckCircle2, Lock, Camera, Mail, Globe, PlusCircle, PenTool, RefreshCw, Bell
} from "lucide-react";

// ── CONFIG ─────────────────────────────────────────────────────────────
const AUTHOR   = "Mushfiqur Rahman Nafi";
const APP_NAME = "NaFinance";
const EMAIL    = "mushfiqurnafi@gmail.com";
const LINKEDIN = "https://www.linkedin.com/in/mushfiqur-nafi";

const DICT = {
  app_title:    { bn: APP_NAME,               en: APP_NAME },
  home:         { bn: "হোম",                 en: "Home" },
  assets:       { bn: "ওয়ালেট",             en: "Wallet" },
  planning:     { bn: "প্ল্যান",             en: "Plan" },
  graphs:       { bn: "বিশ্লেষণ",           en: "Analytics" },
  settings:     { bn: "সেটিংস",             en: "Settings" },
  income:       { bn: "আয়",                 en: "Income" },
  expense:      { bn: "খরচ",                en: "Expense" },
  balance:      { bn: "মোট ব্যালেন্স",      en: "Total Balance" },
  recent_tx:    { bn: "সাম্প্রতিক লেনদেন", en: "Recent Transactions" },
  transfer:     { bn: "ট্রান্সফার",          en: "Transfer" },
  search_tx:    { bn: "লেনদেন খুঁজুন...",   en: "Search transactions..." },
  add_btn:      { bn: "লেনদেন যোগ করুন",     en: "Add Transaction" }
};

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

const CURRENCIES = [{ code: "BDT", sym: "৳", loc: "bn-BD" }, { code: "USD", sym: "$", loc: "en-US" }, { code: "GBP", sym: "£", loc: "en-GB" }, { code: "EUR", sym: "€", loc: "de-DE" }];
const MONTH_SHORT = { bn: ["জানু","ফেব","মার্চ","এপ্রি","মে","জুন","জুলাই","আগ","সেপ","অক্টো","নভে","ডিসে"], en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] };
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
      const saved = localStorage.getItem("nafinance_db_v6");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {
      txs: [], wallets: [{ id: "w1", name: "Cash", balance: 0, icon: "💵" }, { id: "w2", name: "Bank", balance: 0, icon: "🏦" }],
      debts: [], goals: [], budgets: {}, recurring: [], savings: { balance: 0 }, customCategories: { expense: [], income: [] }
    };
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("nafinance_set_v6");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return { lang: "bn", curr: "BDT", theme: "dark", hideBalance: false, pinLock: "" };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!settings.pinLock);
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [editTxData, setEditTxData] = useState(null); 
  const [toast, setToast] = useState(null);
  const appRef = useRef(null);

  useEffect(() => { localStorage.setItem("nafinance_db_v6", JSON.stringify(data)); }, [data]);
  useEffect(() => { localStorage.setItem("nafinance_set_v6", JSON.stringify(settings)); }, [settings]);

  const isDark = settings.theme === "dark";
  const TH = isDark 
    ? { bg: "#030712", bgCard: "rgba(15,23,42,0.9)", bgInner: "rgba(30,41,59,0.6)", border: "rgba(99,102,241,0.15)", text: "#e2e8f0", textMid: "#94a3b8", textDim: "#475569" }
    : { bg: "#f8fafc", bgCard: "#ffffff", bgInner: "#f1f5f9", border: "#e2e8f0", text: "#0f172a", textMid: "#64748b", textDim: "#94a3b8" };
  const t = key => DICT[key]?.[settings.lang] || key;
  const lang = settings.lang;
  const fmt = n => settings.hideBalance ? "••••" : fmtMoney(n, settings.curr, lang);

  const showToast = (msg, type="error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getCategories = (type) => [...BASE_CATEGORIES[type], ...(data.customCategories[type] || [])];

  const saveTx = (tx, oldTx = null) => {
    let tempWallets = [...data.wallets];
    if (oldTx) {
      tempWallets = tempWallets.map(w => w.id === oldTx.walletId ? { ...w, balance: oldTx.type === "income" ? w.balance - oldTx.amount : w.balance + oldTx.amount } : w);
    }
    const isInc = tx.type === "income";
    const targetW = tempWallets.find(w => w.id === tx.walletId);
    if (!isInc && targetW.balance < tx.amount) {
      showToast(lang === "bn" ? "পর্যাপ্ত ব্যালেন্স নেই!" : "Insufficient balance!", "error");
      return false;
    }
    tempWallets = tempWallets.map(w => w.id === tx.walletId ? { ...w, balance: isInc ? w.balance + tx.amount : w.balance - tx.amount } : w);
    let newTxs = oldTx ? data.txs.map(t => t.id === oldTx.id ? tx : t) : [tx, ...data.txs];
    setData({ ...data, txs: newTxs, wallets: tempWallets });
    showToast(oldTx ? (lang==="bn"?"আপডেট হয়েছে":"Updated") : (lang==="bn"?"যুক্ত হয়েছে":"Added"), "success");
    return true;
  };

  const deleteTx = tx => {
    const isInc = tx.type === "income";
    const targetW = data.wallets.find(w => w.id === tx.walletId);
    if (isInc && targetW.balance < tx.amount) {
      showToast(lang === "bn" ? "ব্যালেন্স নেগেটিভ হবে!" : "Balance will be negative!", "error");
      return;
    }
    const ws = data.wallets.map(w => w.id === tx.walletId ? { ...w, balance: isInc ? w.balance - tx.amount : w.balance + tx.amount } : w);
    setData({ ...data, txs: data.txs.filter(x => x.id !== tx.id), wallets: ws });
    showToast(lang === "bn" ? "ডিলিট হয়েছে" : "Deleted", "success");
  };

  const exportPNG = async () => {
    if (!appRef.current) return;
    try {
      const canvas = await html2canvas(appRef.current, { backgroundColor: TH.bg, scale: 2 });
      const link = document.createElement('a');
      link.download = `NaFinance_Report_${TODAY()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast(lang==="bn"?"স্ক্রিনশট সেভ হয়েছে!":"Screenshot Saved!", "success");
    } catch (err) {
      showToast("Export failed", "error");
    }
  };

  const ToastUI = () => {
    if (!toast) return null;
    return (
      <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: toast.type==="error" ? "#ef4444" : "#10b981", color: "#fff", padding: "12px 24px", borderRadius: 16, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 10px 25px rgba(0,0,0,0.3)", animation: "fadeIn 0.3s ease" }}>
        {toast.type === "error" ? <AlertTriangle size={18}/> : <CheckCircle2 size={18}/>}
        {toast.msg}
      </div>
    );
  };

  if (!isAuthenticated) {
    return <PinScreen correctPin={settings.pinLock} onSuccess={() => setIsAuthenticated(true)} TH={TH} lang={lang} />;
  }

  const nowDate  = new Date();
  const todayStr = lang === "bn" ? `${DAY_NAMES.bn[nowDate.getDay()]}, ${nowDate.getDate()} ${MONTH_SHORT.bn[nowDate.getMonth()]} ${nowDate.getFullYear()}` : `${DAY_NAMES.en[nowDate.getDay()]}, ${nowDate.getDate()} ${MONTH_SHORT.en[nowDate.getMonth()]} ${nowDate.getFullYear()}`;
  const selStyle = { backgroundColor: TH.bgInner, color: TH.text, border: `1px solid ${TH.border}` };

  // ALERTS CALCULATION
  const thisMonth = TODAY().slice(0, 7);
  const budgetAlerts = getCategories("expense").filter(cat => {
    const lim = data.budgets[cat.id];
    if (!lim) return false;
    const spent = data.txs.filter(x => x.type === "expense" && x.category === cat.id && x.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0);
    return spent >= lim * 0.8;
  });

  const debtAlerts = (data.debts || []).filter(d => {
    if (!d.returnDate) return false;
    const diffDays = Math.ceil((new Date(d.returnDate) - new Date(TODAY())) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= -30; // Upcoming in 3 days or overdue
  });

  return (
    <div ref={appRef} style={{ minHeight: "100vh", background: TH.bg, color: TH.text, fontFamily: "'Hind Siliguri', sans-serif", transition: "background-color 0.5s ease, color 0.5s ease" }}>
      
      {/* CSS: Removes arrows from number inputs */}
      <style>{`
        input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
      `}</style>
      
      <ToastUI />

      <header style={{ position: "sticky", top: 0, zIndex: 50, background: isDark ? "rgba(3,7,18,0.85)" : "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${TH.border}` }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}><DollarSign size={18} color="#fff"/></div>
            <div>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#8b5cf6" }}>{APP_NAME}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                <Calendar size={9} color={TH.textMid}/><span style={{ fontSize: 10, color: TH.textMid, fontWeight: 600 }}>{todayStr}</span>
              </div>
            </div>
            {(budgetAlerts.length > 0 || debtAlerts.length > 0) && (
              <span style={{ fontSize: 9, background: "#ef4444", color: "#fff", padding: "2px 7px", borderRadius: 99, fontWeight: 700, animation: "pulse 2s infinite", marginLeft: 4 }}>
                {budgetAlerts.length + debtAlerts.length} ⚠
              </span>
            )}
          </div>
          <button onClick={() => setModal("settings")} style={{ padding: 9, background: TH.bgInner, border: `1px solid ${TH.border}`, borderRadius: 12, cursor: "pointer", color: TH.textMid }}><Settings size={18}/></button>
        </div>
      </header>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 140px" }}>
        {tab === "home"     && <HomeView data={data} fmt={fmt} t={t} deleteTx={deleteTx} editTx={(tx)=>{setEditTxData(tx);setModal("tx");}} settings={settings} toggleHide={() => setSettings({...settings, hideBalance: !settings.hideBalance})} isDark={isDark} TH={TH} lang={lang} getCategories={getCategories} exportPNG={exportPNG} budgetAlerts={budgetAlerts} debtAlerts={debtAlerts}/>}
        {tab === "assets"   && <AssetsView data={data} setData={setData} fmt={fmt} t={t} isDark={isDark} TH={TH} lang={lang} selStyle={selStyle} showToast={showToast}/>}
        {tab === "planning" && <PlanningView data={data} setData={setData} fmt={fmt} t={t} lang={lang} isDark={isDark} TH={TH} selStyle={selStyle} getCategories={getCategories} showToast={showToast}/>}
        {tab === "graphs"   && <GraphsView data={data} fmt={fmt} t={t} lang={lang} isDark={isDark} TH={TH} getCategories={getCategories}/>}
      </main>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, background: isDark ? "rgba(3,7,18,0.96)" : "rgba(255,255,255,0.96)", backdropFilter: "blur(24px)", borderTop: `1px solid ${TH.border}`, paddingBottom: 24, paddingTop: 8 }} className="print:hidden">
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          <NavBtn active={tab==="home"} icon={Home} label={t("home")} onClick={() => setTab("home")} TH={TH}/>
          <NavBtn active={tab==="assets"} icon={Wallet} label={t("assets")} onClick={() => setTab("assets")} TH={TH}/>
          <button onClick={() => { setEditTxData(null); setModal("tx"); }} style={{ width: 56, height: 56, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(139,92,246,0.4)", marginTop: -28, border: `3px solid ${TH.bg}`, cursor: "pointer", transition: "transform 0.2s" }}><Plus size={24} color="#fff" strokeWidth={2.5}/></button>
          <NavBtn active={tab==="planning"} icon={Target} label={t("planning")} onClick={() => setTab("planning")} TH={TH}/>
          <NavBtn active={tab==="graphs"} icon={BarChart2} label={t("graphs")} onClick={() => setTab("graphs")} TH={TH}/>
        </div>
      </nav>

      {modal === "tx" && <TxModal data={data} saveTx={saveTx} onClose={() => setModal(null)} t={t} lang={lang} isDark={isDark} TH={TH} selStyle={selStyle} showToast={showToast} editData={editTxData} getCategories={getCategories}/>}
      {modal === "settings" && <SettingsModal settings={settings} setSettings={setSettings} setModal={setModal} t={t} TH={TH} isDark={isDark} lang={lang} selStyle={selStyle} data={data} setData={setData} showToast={showToast}/>}
    </div>
  );
}

// ── PIN SCREEN ────────────────────────────────────────────────────────
function PinScreen({ correctPin, onSuccess, TH, lang }) {
  const [input, setInput] = useState("");
  const handlePress = (num) => {
    if (input.length < 4) {
      const newVal = input + num;
      setInput(newVal);
      if (newVal.length === 4) {
        setTimeout(() => {
          if (newVal === correctPin) onSuccess();
          else { alert(lang==="bn"?"ভুল পিন!":"Incorrect PIN!"); setInput(""); }
        }, 200);
      }
    }
  };
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: TH.bg, color: TH.text }}>
      <Lock size={40} color="#8b5cf6" style={{ marginBottom: 20 }}/>
      <h2 style={{ fontWeight: 800, marginBottom: 30 }}>{lang==="bn"?"পিন দিন":"Enter PIN"}</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 40 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ width: 20, height: 20, borderRadius: "50%", background: input.length > i ? "#8b5cf6" : TH.bgInner, border: `2px solid ${TH.border}` }}/>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={()=>handlePress(n.toString())} style={{ width: 60, height: 60, borderRadius: "50%", background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, fontSize: 24, fontWeight: 700, cursor: "pointer", outline: "none" }}>{n}</button>
        ))}
        <div/>
        <button onClick={()=>handlePress("0")} style={{ width: 60, height: 60, borderRadius: "50%", background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, fontSize: 24, fontWeight: 700, cursor: "pointer", outline: "none" }}>0</button>
        <button onClick={()=>setInput(input.slice(0,-1))} style={{ width: 60, height: 60, borderRadius: "50%", background: "transparent", border: "none", color: TH.textMid, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", outline: "none" }}><X size={24}/></button>
      </div>
    </div>
  );
}

// ── SETTINGS MODAL ────────────────────────────────────────────────────
function SettingsModal({ settings, setSettings, setModal, t, TH, isDark, lang, selStyle, data, setData, showToast }) {
  const [pinMode, setPinMode] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [catMode, setCatMode] = useState(false);
  const [newCat, setNewCat] = useState({ type: "expense", name: "", icon: "📦", color: "#6366f1" });
  const hiddenFileInput = useRef(null);

  const savePin = () => {
    if(newPin.length !== 4 && newPin.length !== 0) return showToast("PIN must be 4 digits", "error");
    setSettings({...settings, pinLock: newPin});
    showToast(newPin ? "PIN Enabled" : "PIN Disabled", "success");
    setPinMode(false);
  };

  const saveCat = () => {
    if(!newCat.name) return showToast("Enter category name", "error");
    const cat = { id: genId(), label: { bn: newCat.name, en: newCat.name }, icon: newCat.icon, color: newCat.color, bg: `${newCat.color}20`, border: `${newCat.color}50` };
    setData({...data, customCategories: { ...data.customCategories, [newCat.type]: [...(data.customCategories[newCat.type]||[]), cat] }});
    setCatMode(false);
    showToast("Category added", "success");
  };

  const handleBackup = () => {
    const blob = new Blob([JSON.stringify({ data, settings }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `NaFinance_Backup_${TODAY()}.json`;
    a.click();
    showToast(lang==="bn"?"ব্যাকআপ সেভ হয়েছে":"Backup saved", "success");
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed.data) setData(parsed.data);
        if (parsed.settings) setSettings(parsed.settings);
        showToast(lang==="bn"?"ডেটা রিস্টোর হয়েছে":"Data restored successfully", "success");
      } catch(err) {
        showToast(lang==="bn"?"ফাইলটি সঠিক নয়":"Invalid backup file", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = () => {
    if(window.confirm(lang==="bn"?"আপনি কি নিশ্চিত? সব ডেটা মুছে যাবে!":"Are you sure? All data will be deleted!")) {
      setData({ txs: [], wallets: [{ id: "w1", name: "Cash", balance: 0, icon: "💵" }, { id: "w2", name: "Bank", balance: 0, icon: "🏦" }], debts: [], goals: [], budgets: {}, recurring: [], savings: { balance: 0 }, customCategories: { expense: [], income: [] } });
      showToast(lang==="bn"?"অ্যাপ রিসেট হয়েছে":"App Reset Successful", "success");
      setModal(null);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", padding: 16 }}>
      <div style={{ background: TH.bgCard, padding: 28, borderRadius: 32, width: "100%", maxWidth: 380, border: `1px solid ${TH.border}`, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
           <h2 style={{ fontWeight: 800, fontSize: 20 }}>{t("settings")}</h2>
           <button onClick={() => setModal(null)} style={{ background: "none", border: "none", color: TH.textMid, cursor: "pointer" }}><X size={20}/></button>
        </div>

        <div style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", padding: 16, borderRadius: 20, marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: "#8b5cf6", textTransform: "uppercase", marginBottom: 8, letterSpacing: 1 }}>Developer Info</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}><Code size={20} color="#fff"/></div>
                <div><p style={{ fontWeight: 800, fontSize: 15, color: TH.text }}>{AUTHOR}</p></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <a href={`mailto:${EMAIL}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: TH.textMid, textDecoration: "none" }}><Mail size={14}/> {EMAIL}</a>
              <a href={LINKEDIN} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#3b82f6", textDecoration: "none" }}><Globe size={14}/> LinkedIn Profile</a>
            </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <button onClick={handleBackup} style={{ padding: 12, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 14, color: "#3b82f6", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, justifyContent: "center", cursor: "pointer", fontSize: 12 }}><Download size={14}/> Backup Data</button>
          <button onClick={() => hiddenFileInput.current.click()} style={{ padding: 12, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 14, color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, justifyContent: "center", cursor: "pointer", fontSize: 12 }}><Upload size={14}/> Restore Data</button>
          <input type="file" accept=".json" ref={hiddenFileInput} onChange={handleRestore} style={{ display: "none" }} />
        </div>

        {pinMode ? (
          <div style={{ padding: 16, background: TH.bgInner, borderRadius: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>{lang==="bn"?"৪ সংখ্যার পিন দিন":"Enter 4-digit PIN"}</p>
            <input type="text" inputMode="numeric" placeholder="****" value={newPin} onChange={e=>setNewPin(e.target.value.replace(/[^0-9]/g, '').slice(0,4))} style={{ width: "100%", padding: 12, borderRadius: 12, border: `1px solid ${TH.border}`, background: TH.bg, color: TH.text, textAlign: "center", fontSize: 20, letterSpacing: 4, marginBottom: 10, boxSizing: "border-box", outline: "none" }}/>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={savePin} style={{ flex: 1, padding: 10, background: "#8b5cf6", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700 }}>Save</button>
              <button onClick={()=>setPinMode(false)} style={{ flex: 1, padding: 10, background: "transparent", color: TH.textMid, border: `1px solid ${TH.border}`, borderRadius: 10 }}>Cancel</button>
            </div>
          </div>
        ) : catMode ? (
          <div style={{ padding: 16, background: TH.bgInner, borderRadius: 16, marginBottom: 16 }}>
             <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Add Custom Category</p>
             <select value={newCat.type} onChange={e=>setNewCat({...newCat, type: e.target.value})} style={{ ...selStyle, width: "100%", padding: 10, borderRadius: 10, marginBottom: 10 }}><option value="expense">Expense</option><option value="income">Income</option></select>
             <input type="text" placeholder="Name" value={newCat.name} onChange={e=>setNewCat({...newCat, name: e.target.value})} style={{ ...selStyle, width: "100%", padding: 10, borderRadius: 10, marginBottom: 10, boxSizing: "border-box" }}/>
             <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
               <input type="text" placeholder="Emoji" value={newCat.icon} onChange={e=>setNewCat({...newCat, icon: e.target.value})} style={{ ...selStyle, width: "50%", padding: 10, borderRadius: 10, textAlign: "center" }}/>
               <input type="color" value={newCat.color} onChange={e=>setNewCat({...newCat, color: e.target.value})} style={{ width: "50%", height: 40, padding: 2, borderRadius: 10, border: "none", background: "transparent" }}/>
             </div>
             <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveCat} style={{ flex: 1, padding: 10, background: "#8b5cf6", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700 }}>Add</button>
              <button onClick={()=>setCatMode(false)} style={{ flex: 1, padding: 10, background: "transparent", color: TH.textMid, border: `1px solid ${TH.border}`, borderRadius: 10 }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
             <button onClick={()=>setPinMode(true)} style={{ padding: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, borderRadius: 14, color: TH.text, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, justifyContent: "center", cursor: "pointer", fontSize: 12 }}><Lock size={14} color={settings.pinLock ? "#10b981" : TH.textMid}/> App PIN</button>
             <button onClick={()=>setCatMode(true)} style={{ padding: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, borderRadius: 14, color: TH.text, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, justifyContent: "center", cursor: "pointer", fontSize: 12 }}><PlusCircle size={14} color="#8b5cf6"/> Category</button>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={() => setSettings({...settings, theme: "light"})} style={{ flex: 1, padding: 12, borderRadius: 14, border: `1.5px solid ${!isDark?"#8b5cf6":TH.border}`, background: !isDark?"rgba(139,92,246,0.1)":TH.bgInner, color: !isDark?"#8b5cf6":TH.textMid, fontWeight: 700, transition: "all 0.3s", fontSize: 12 }}>☀️ Light</button>
          <button onClick={() => setSettings({...settings, theme: "dark"})} style={{ flex: 1, padding: 12, borderRadius: 14, border: `1.5px solid ${isDark?"#8b5cf6":TH.border}`, background: isDark?"rgba(139,92,246,0.1)":TH.bgInner, color: isDark?"#8b5cf6":TH.textMid, fontWeight: 700, transition: "all 0.3s", fontSize: 12 }}>🌙 Dark</button>
        </div>
        <select value={settings.lang} onChange={e => setSettings({...settings, lang: e.target.value})} style={{ ...selStyle, width: "100%", padding: 12, borderRadius: 14, fontWeight: 700, marginBottom: 10, fontSize: 12 }}><option value="bn">বাংলা (Bengali)</option><option value="en">English</option></select>
        <select value={settings.curr} onChange={e => setSettings({...settings, curr: e.target.value})} style={{ ...selStyle, width: "100%", padding: 12, borderRadius: 14, fontWeight: 700, marginBottom: 16, fontSize: 12 }}>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}</select>

        <button onClick={handleReset} style={{ width: "100%", padding: 12, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, fontWeight: 700, cursor: "pointer", fontSize: 12, display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}><RefreshCw size={14}/> Factory Reset</button>
      </div>
    </div>
  );
}

// ── TRANSACTION MODAL ──────────────────────────────────────────────────
function TxModal({ data, saveTx, onClose, t, lang, isDark, TH, selStyle, showToast, editData, getCategories }) {
  const [type, setType] = useState(editData ? editData.type : "expense");
  const [f, setF] = useState(editData ? editData : { date: TODAY(), category: "food", amount: "", note: "", walletId: data.wallets[0]?.id || "" });
  const cats = type === "transfer" ? [] : getCategories(type);
  const amountRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => amountRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const submit = () => {
    if (!f.amount || Number(f.amount) <= 0) return showToast(lang==="bn"?"সঠিক পরিমাণ লিখুন":"Enter valid amount");
    if (!f.walletId) return showToast(lang==="bn"?"ওয়ালেট নির্বাচন করুন":"Select a wallet");
    const success = saveTx({ ...f, type, amount: Number(f.amount), id: editData ? editData.id : genId() }, editData);
    if (success) onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", padding: 16 }}>
      <div style={{ background: TH.bgCard, padding: 28, borderRadius: "40px 40px 24px 24px", width: "100%", maxWidth: 480, border: `1px solid ${TH.border}`, animation: "slideUp 0.3s ease" }}>
        <h3 style={{ fontWeight: 800, marginBottom: 16, textAlign: "center" }}>{editData ? (lang==="bn"?"লেনদেন এডিট করুন":"Edit Transaction") : t("add_btn")}</h3>
        
        {!editData && (
          <div style={{ display: "flex", background: TH.bgInner, padding: 5, borderRadius: 16, marginBottom: 18 }}>
            <button onClick={() => { setType("expense"); setF({...f, category:"food"}); amountRef.current?.focus(); }} style={{ flex: 1, padding: 11, fontWeight: 700, borderRadius: 12, border: "none", background: type==="expense" ? "#f97316" : "transparent", color: type==="expense" ? "#fff" : TH.textMid, cursor: "pointer" }}>{t("expense")}</button>
            <button onClick={() => { setType("income"); setF({...f, category:"freelance"}); amountRef.current?.focus(); }} style={{ flex: 1, padding: 11, fontWeight: 700, borderRadius: 12, border: "none", background: type==="income" ? "#10b981" : "transparent", color: type==="income" ? "#fff" : TH.textMid, cursor: "pointer" }}>{t("income")}</button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <input type="date" value={f.date} onChange={e => setF({...f, date: e.target.value})} style={{ ...selStyle, padding: "12px 14px", borderRadius: 14, outline: "none", fontWeight: 700, width: "100%", boxSizing: "border-box", colorScheme: isDark?"dark":"light" }}/>
          <select value={f.walletId} onChange={e => setF({...f, walletId: e.target.value})} style={{ ...selStyle, padding: "12px 14px", borderRadius: 14, outline: "none", fontWeight: 700 }}>
            {data.wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
          </select>
        </div>

        {type !== "transfer" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16, maxHeight: 180, overflowY: "auto", paddingRight: 4 }}>
            {cats.map(c => (
              <button key={c.id} onClick={() => { setF({...f, category: c.id}); amountRef.current?.focus(); }} style={{ padding: "10px 6px", borderRadius: 16, border: `1.5px solid ${f.category===c.id ? c.color : TH.border}`, background: f.category===c.id ? c.bg : TH.bgInner, cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ fontSize: 20, marginBottom: 2 }}>{c.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: f.category===c.id ? c.color : TH.textMid }}>{c.label[lang] || c.label.en}</div>
              </button>
            ))}
          </div>
        )}

        <input ref={amountRef} type="number" placeholder="0" value={f.amount} onChange={e => setF({...f, amount: e.target.value})} style={{ width: "100%", padding: 18, background: TH.bgInner, border: `2px solid ${f.amount ? "#8b5cf6" : TH.border}`, borderRadius: 20, fontSize: 36, fontWeight: 800, color: "#8b5cf6", textAlign: "center", outline: "none", marginBottom: 12, boxSizing: "border-box" }}/>
        <input type="text" placeholder={lang==="bn"?"নোট (ঐচ্ছিক)":"Note (optional)"} value={f.note} onChange={e => setF({...f, note: e.target.value})} style={{ width: "100%", padding: 14, background: TH.bgInner, border: `1px solid ${TH.border}`, borderRadius: 16, fontSize: 14, color: TH.text, outline: "none", marginBottom: 14, boxSizing: "border-box" }}/>

        <button onClick={submit} style={{ width: "100%", padding: 18, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff", fontWeight: 800, borderRadius: 22, border: "none", cursor: "pointer", fontSize: 16, marginBottom: 8, boxShadow: "0 8px 20px rgba(139,92,246,0.3)" }}>{lang==="bn" ? "নিশ্চিত করুন ✓" : "Confirm ✓"}</button>
        <button onClick={onClose} style={{ width: "100%", background: "none", border: "none", color: TH.textMid, fontWeight: 700, padding: 6, cursor: "pointer" }}>{lang==="bn" ? "বাতিল" : "Cancel"}</button>
      </div>
    </div>
  );
}

// ── HOME VIEW (Debts Alert Added) ──────────────────────────────────────
function HomeView({ data, fmt, t, deleteTx, editTx, settings, toggleHide, isDark, TH, lang, getCategories, exportPNG, budgetAlerts, debtAlerts }) {
  const { hideBalance } = settings;
  const [search, setSearch] = useState("");
  
  const totalBalance  = data.wallets.reduce((s, w) => s + w.balance, 0);
  const spentToday    = data.txs.filter(x => x.date === TODAY() && x.type === "expense").reduce((s, e) => s + e.amount, 0);
  const incomeToday   = data.txs.filter(x => x.date === TODAY() && x.type === "income").reduce((s, e) => s + e.amount, 0);
  
  const filteredTxs = data.txs.filter(tx => {
    if(tx.type === "transfer") return false;
    if(search) {
      const catLabel = getCategories(tx.type)?.find(c => c.id === tx.category)?.label[lang]?.toLowerCase() || "";
      const note = tx.note?.toLowerCase() || "";
      return catLabel.includes(search.toLowerCase()) || note.includes(search.toLowerCase());
    }
    return true;
  });

  const exportCSV = () => {
    const BOM = "\uFEFF";
    const rows = data.txs.map(tx => `${tx.date},${tx.type},${tx.amount},${tx.category},${tx.note || ""}`).join("\n");
    const blob = new Blob([BOM + "Date,Type,Amount,Category,Note\n" + rows], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "NaFinance_Report.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      
      {/* ALERTS SECTION */}
      {(budgetAlerts.length > 0 || debtAlerts.length > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Budget Alerts */}
          {budgetAlerts.map(cat => {
            const lim   = data.budgets[cat.id];
            const spent = data.txs.filter(x => x.type==="expense" && x.category===cat.id && x.date.startsWith(TODAY().slice(0, 7))).reduce((s,e)=>s+e.amount,0);
            const pct   = Math.round((spent/lim)*100);
            const over  = pct >= 100;
            return (
              <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 16, background: over ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${over?"rgba(239,68,68,0.3)":"rgba(245,158,11,0.3)"}` }}>
                <AlertTriangle size={16} color={over ? "#ef4444" : "#f59e0b"}/>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: TH.text }}>{cat.icon} {cat.label[lang]} ({pct}%)</p>
                  <p style={{ fontSize: 10, color: TH.textMid }}>{fmt(spent)} / {fmt(lim)}</p>
                </div>
              </div>
            );
          })}
          {/* Debt Alerts */}
          {debtAlerts.map(d => {
            const isLend = d.type === "lend";
            const diff = Math.ceil((new Date(d.returnDate) - new Date(TODAY())) / (1000 * 60 * 60 * 24));
            const isLate = diff < 0;
            return (
              <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 16, background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.3)" }}>
                <Bell size={16} color="#ec4899" className={isLate ? "" : "animate-bounce"}/>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: TH.text }}>{isLend ? `Collect from ${d.person}` : `Pay to ${d.person}`} ({fmt(d.amount)})</p>
                  <p style={{ fontSize: 10, color: "#ec4899", fontWeight: 700 }}>{isLate ? `Overdue by ${Math.abs(diff)} days!` : `Due in ${diff} days!`}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ position: "relative", borderRadius: 32, padding: 28, background: isDark ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)" : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)", color: "#fff", boxShadow: "0 24px 60px rgba(139,92,246,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1 }}>{t("balance")}</p>
            <h2 style={{ fontSize: 40, fontWeight: 900, color: hideBalance ? "rgba(255,255,255,0.4)" : "#fff", letterSpacing: -1 }}>{fmt(totalBalance)}</h2>
          </div>
          <button onClick={toggleHide} style={{ padding: 10, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 14, color: "#fff", cursor: "pointer" }}>{hideBalance ? <Eye size={16}/> : <EyeOff size={16}/>}</button>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
             <div style={{ display: "flex", gap: 4, color: "#fca5a5" }}><ArrowDownRight size={13}/><span style={{ fontSize: 9, fontWeight: 700 }}>{lang==="bn"?"আজ খরচ":"Spent"}</span></div>
             <p style={{ fontSize: 15, fontWeight: 800, marginTop: 4 }}>{fmt(spentToday)}</p>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
             <div style={{ display: "flex", gap: 4, color: "#86efac" }}><ArrowUpRight size={13}/><span style={{ fontSize: 9, fontWeight: 700 }}>{lang==="bn"?"আজ আয়":"Earned"}</span></div>
             <p style={{ fontSize: 15, fontWeight: 800, marginTop: 4 }}>{fmt(incomeToday)}</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }} className="print:hidden">
        <button onClick={exportCSV} style={{ padding: "12px 8px", background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontWeight: 700, fontSize: 11, cursor: "pointer" }}><Download size={16}/> CSV</button>
        <button onClick={() => window.print()} style={{ padding: "12px 8px", background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontWeight: 700, fontSize: 11, cursor: "pointer" }}><Printer size={16}/> PDF</button>
        <button onClick={exportPNG} style={{ padding: "12px 8px", background: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontWeight: 700, fontSize: 11, cursor: "pointer" }}><Camera size={16}/> PNG</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, background: TH.bgCard, padding: "10px 16px", borderRadius: 16, border: `1px solid ${TH.border}` }}>
        <Search size={16} color={TH.textMid}/>
        <input type="text" placeholder={t("search_tx")} value={search} onChange={e=>setSearch(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: TH.text, fontSize: 13, fontWeight: 700 }}/>
        {search && <button onClick={()=>setSearch("")} style={{ background:"none", border:"none", color:TH.textMid, cursor:"pointer" }}><X size={14}/></button>}
      </div>

      <div>
        <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>{t("recent_tx")}</h3>
        {filteredTxs.length === 0 && <p style={{ textAlign: "center", padding: 20, color: TH.textDim }}>{lang==="bn"?"কোনো লেনদেন নেই":"No transactions found"}</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredTxs.slice(0, 15).map(tx => {
            const cat = getCategories(tx.type)?.find(c => c.id === tx.category) || { icon: "📝", label: { bn: "অন্যান্য", en: "Other" }, bg: TH.bgInner, border: TH.border };
            return (
              <div key={tx.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, background: TH.bgCard, borderRadius: 20, border: `1px solid ${TH.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 16, background: cat.bg, border: `1px solid ${cat.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{cat.icon}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{cat.label[lang] || cat.label.en}</p>
                    <p style={{ fontSize: 10, color: TH.textMid }}>{tx.date} {tx.note && `· ${tx.note}`}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p style={{ fontWeight: 800, fontSize: 14, color: tx.type==="income" ? "#10b981" : "#f87171" }}>{tx.type==="income" ? "+" : "−"}{fmt(tx.amount)}</p>
                  <button onClick={() => editTx(tx)} style={{ padding: 6, color: "#3b82f6", background: "rgba(59,130,246,0.1)", border: "none", borderRadius: 10, cursor: "pointer" }} className="print:hidden"><Edit3 size={14}/></button>
                  <button onClick={() => deleteTx(tx)} style={{ padding: 6, color: "#f87171", background: "rgba(248,113,113,0.1)", border: "none", borderRadius: 10, cursor: "pointer" }} className="print:hidden"><Trash2 size={14}/></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── ASSETS VIEW ────────────────────────────────────────────────────────
function AssetsView({ data, setData, fmt, t, isDark, TH, lang, selStyle, showToast }) {
  const [topUp, setTopUp] = useState({ show: false, walletId: data.wallets[0]?.id || "", amount: "" });
  const [transfer, setTransfer] = useState({ show: false, from: data.wallets[0]?.id || "", to: data.wallets[1]?.id || "", amount: "" });
  const [manage, setManage] = useState(false);
  const [newW, setNewW] = useState({ id: "", name: "", icon: "🏦" });
  const [debtForm, setDebtForm] = useState({ show: false, person: "", amount: "", type: "lend", borrowDate: TODAY(), returnDate: "" });

  const inp = { padding: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, borderRadius: 12, outline: "none", fontWeight: 700, color: TH.text, width: "100%", boxSizing: "border-box" };

  const handleTopUp = () => {
    const n = Number(topUp.amount);
    if (!n || n <= 0) return showToast(lang==="bn"?"সঠিক পরিমাণ দিন":"Invalid amount");
    const tx = { id: genId(), type: "income", date: TODAY(), amount: n, category: "other_in", walletId: topUp.walletId, note: "Wallet TopUp" };
    const ws = data.wallets.map(w => w.id === topUp.walletId ? { ...w, balance: w.balance + n } : w);
    setData({ ...data, txs: [tx, ...data.txs], wallets: ws });
    setTopUp({ show: false, walletId: data.wallets[0]?.id, amount: "" });
    showToast("TopUp Successful", "success");
  };

  const handleTransfer = () => {
    const n = Number(transfer.amount);
    if (!n || n <= 0 || transfer.from === transfer.to) return showToast("Invalid amount or identical wallets");
    const fromW = data.wallets.find(w => w.id === transfer.from);
    if (fromW.balance < n) return showToast("Insufficient balance", "error");
    const ws = data.wallets.map(w => {
      if (w.id === transfer.from) return { ...w, balance: w.balance - n };
      if (w.id === transfer.to) return { ...w, balance: w.balance + n };
      return w;
    });
    const tx = { id: genId(), type: "transfer", date: TODAY(), amount: n, walletId: transfer.from, note: `Transfer to ${data.wallets.find(w=>w.id===transfer.to)?.name}` };
    setData({ ...data, txs: [tx, ...data.txs], wallets: ws });
    setTransfer({ show: false, from: data.wallets[0]?.id, to: data.wallets[1]?.id, amount: "" });
    showToast("Transfer Successful", "success");
  };

  const saveWallet = () => {
    if(!newW.name) return;
    if(newW.id) {
      setData({...data, wallets: data.wallets.map(w => w.id === newW.id ? {...w, name: newW.name, icon: newW.icon} : w)});
    } else {
      setData({...data, wallets: [...data.wallets, { id: genId(), name: newW.name, icon: newW.icon, balance: 0 }]});
    }
    setNewW({id:"", name:"", icon:"🏦"});
    setManage(false);
  };

  const deleteWallet = (id) => {
    if(data.wallets.length <= 1) return showToast("Need at least 1 wallet");
    if(data.txs.find(tx => tx.walletId === id)) return showToast("Cannot delete wallet with transactions", "error");
    setData({...data, wallets: data.wallets.filter(w => w.id !== id)});
  };

  const addDebt = () => {
    if (!debtForm.person || !debtForm.amount) return showToast("Enter name and amount");
    setData({...data, debts: [...(data.debts||[]), { id: genId(), person: debtForm.person, amount: Number(debtForm.amount), type: debtForm.type, borrowDate: debtForm.borrowDate, returnDate: debtForm.returnDate }]});
    setDebtForm({ show: false, person: "", amount: "", type: "lend", borrowDate: TODAY(), returnDate: "" });
    showToast("Debt Added", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      
      <div style={{ background: TH.bgCard, borderRadius: 24, padding: 20, border: `1px solid ${TH.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><CreditCard size={18} color="#3b82f6"/> {t("wallets")}</h3>
          <button onClick={() => setManage(!manage)} style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Edit3 size={14}/> Manage</button>
        </div>

        {manage && (
          <div style={{ padding: 16, background: "rgba(59,130,246,0.05)", borderRadius: 16, marginBottom: 16, border: "1px dashed rgba(59,130,246,0.3)" }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <input type="text" placeholder="Icon 🏦" value={newW.icon} onChange={e=>setNewW({...newW, icon: e.target.value})} style={{...inp, width: "30%"}}/>
              <input type="text" placeholder="Wallet Name" value={newW.name} onChange={e=>setNewW({...newW, name: e.target.value})} style={{...inp, width: "70%"}}/>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button onClick={saveWallet} style={{ flex: 1, padding: 10, background: "#3b82f6", color: "#fff", fontWeight: 700, borderRadius: 10, border: "none" }}>{newW.id ? "Update" : "Add New"}</button>
              <button onClick={()=>{setManage(false);setNewW({id:"",name:"",icon:"🏦"});}} style={{ flex: 1, padding: 10, background: "transparent", border: `1px solid ${TH.border}`, color: TH.textMid, fontWeight: 700, borderRadius: 10 }}>Cancel</button>
            </div>
            {data.wallets.map(w => (
              <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, borderBottom: `1px solid ${TH.border}` }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{w.icon} {w.name}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setNewW({id: w.id, name: w.name, icon: w.icon})} style={{ padding: 6, background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none", borderRadius: 8 }}><Edit3 size={14}/></button>
                  <button onClick={() => deleteWallet(w.id)} style={{ padding: 6, background: "rgba(248,113,113,0.1)", color: "#f87171", border: "none", borderRadius: 8 }}><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button onClick={() => { setTopUp({...topUp, show: !topUp.show}); setTransfer({...transfer, show: false}); }} style={{ flex: 1, padding: 10, background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 14, fontWeight: 700, fontSize: 12, display: "flex", justifyContent: "center", gap: 6 }}><Plus size={14}/> TopUp</button>
          <button onClick={() => { setTransfer({...transfer, show: !transfer.show}); setTopUp({...topUp, show: false}); }} style={{ flex: 1, padding: 10, background: "rgba(168,85,247,0.1)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.2)", borderRadius: 14, fontWeight: 700, fontSize: 12, display: "flex", justifyContent: "center", gap: 6 }}><ArrowRightLeft size={14}/> {t("transfer")}</button>
        </div>

        {topUp.show && (
          <div style={{ padding: 16, background: TH.bgInner, borderRadius: 16, marginBottom: 16 }}>
            <select value={topUp.walletId} onChange={e => setTopUp({...topUp, walletId: e.target.value})} style={{ ...selStyle, ...inp, marginBottom: 10 }}>{data.wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}</select>
            <input type="number" placeholder="Amount" value={topUp.amount} onChange={e => setTopUp({...topUp, amount: e.target.value})} style={{ ...inp, marginBottom: 10 }}/>
            <button onClick={handleTopUp} style={{ width: "100%", padding: 12, background: "#3b82f6", color: "#fff", fontWeight: 700, borderRadius: 12, border: "none" }}>Confirm TopUp</button>
          </div>
        )}

        {transfer.show && (
          <div style={{ padding: 16, background: TH.bgInner, borderRadius: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <select value={transfer.from} onChange={e => setTransfer({...transfer, from: e.target.value})} style={{ ...selStyle, ...inp }}>{data.wallets.map(w => <option key={w.id} value={w.id}>From {w.name}</option>)}</select>
              <select value={transfer.to} onChange={e => setTransfer({...transfer, to: e.target.value})} style={{ ...selStyle, ...inp }}>{data.wallets.map(w => <option key={w.id} value={w.id}>To {w.name}</option>)}</select>
            </div>
            <input type="number" placeholder="Amount" value={transfer.amount} onChange={e => setTransfer({...transfer, amount: e.target.value})} style={{ ...inp, marginBottom: 10 }}/>
            <button onClick={handleTransfer} style={{ width: "100%", padding: 12, background: "#a855f7", color: "#fff", fontWeight: 700, borderRadius: 12, border: "none" }}>Confirm Transfer</button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {data.wallets.map(w => (
            <div key={w.id} style={{ padding: 18, background: TH.bgInner, borderRadius: 20, border: `1px solid ${TH.border}` }}>
              <span style={{ fontSize: 26 }}>{w.icon}</span>
              <p style={{ fontSize: 10, fontWeight: 700, color: TH.textMid, textTransform: "uppercase", marginTop: 8 }}>{w.name}</p>
              <p style={{ fontSize: 20, fontWeight: 900, marginTop: 2 }}>{fmt(w.balance)}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: TH.bgCard, borderRadius: 24, padding: 20, border: `1px solid ${TH.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><HandCoins size={18} color="#f59e0b"/> {lang==="bn"?"ধার-দেনা":"Debts"}</h3>
          <button onClick={() => setDebtForm({...debtForm, show: !debtForm.show})} style={{ padding: "7px 14px", background: "rgba(245,158,11,0.1)", color: "#f59e0b", borderRadius: 12, fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer" }}>+ Add</button>
        </div>

        {debtForm.show && (
          <div style={{ marginBottom: 16, padding: 16, background: TH.bgInner, borderRadius: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <input placeholder="Person Name" value={debtForm.person} onChange={e => setDebtForm({...debtForm, person: e.target.value})} style={inp}/>
            <input type="number" placeholder="Amount" value={debtForm.amount} onChange={e => setDebtForm({...debtForm, amount: e.target.value})} style={inp}/>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: TH.textMid, marginBottom: 5 }}>📅 Borrow Date</p>
                <input type="date" value={debtForm.borrowDate} onChange={e => setDebtForm({...debtForm, borrowDate: e.target.value})} style={{ ...inp, colorScheme: isDark ? "dark" : "light" }}/>
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: TH.textMid, marginBottom: 5 }}>⏰ Return By</p>
                <input type="date" value={debtForm.returnDate} onChange={e => setDebtForm({...debtForm, returnDate: e.target.value})} style={{ ...inp, colorScheme: isDark ? "dark" : "light" }}/>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setDebtForm({...debtForm, type: "lend"})} style={{ flex: 1, padding: 10, borderRadius: 12, border: `1.5px solid ${debtForm.type==="lend"?"#4ade80":TH.border}`, background: debtForm.type==="lend"?"rgba(74,222,128,0.1)":TH.bgInner, color: debtForm.type==="lend"?"#4ade80":TH.textMid, fontWeight: 700, fontSize: 12 }}>🤝 I Lend</button>
              <button onClick={() => setDebtForm({...debtForm, type: "borrow"})} style={{ flex: 1, padding: 10, borderRadius: 12, border: `1.5px solid ${debtForm.type==="borrow"?"#f87171":TH.border}`, background: debtForm.type==="borrow"?"rgba(248,113,113,0.1)":TH.bgInner, color: debtForm.type==="borrow"?"#f87171":TH.textMid, fontWeight: 700, fontSize: 12 }}>💸 I Borrow</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button onClick={addDebt} style={{ flex: 1, padding: 12, background: "#f59e0b", color: "#fff", fontWeight: 700, borderRadius: 12, border: "none" }}>Confirm</button>
              <button onClick={() => setDebtForm({...debtForm, show: false})} style={{ flex: 1, padding: 12, background: "transparent", color: TH.textMid, fontWeight: 700, borderRadius: 12, border: `1px solid ${TH.border}` }}>Cancel</button>
            </div>
          </div>
        )}

        {(data.debts||[]).length === 0 && <p style={{ textAlign: "center", color: TH.textDim, fontSize: 13, padding: "20px 0" }}>No debts or loans recorded.</p>}
        {(data.debts||[]).map(d => {
          const isLend = d.type === "lend";
          const color  = isLend ? "#4ade80" : "#f87171";
          return (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: 14, background: TH.bgInner, borderRadius: 18, border: `1px solid ${TH.border}`, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ padding: 8, borderRadius: 12, background: isLend ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)", color }}><Users size={14}/></div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: TH.text }}>{d.person}</p>
                  {d.borrowDate && <p style={{ fontSize: 10, color: TH.textMid, marginTop: 2 }}>📅 {d.borrowDate}</p>}
                  {d.returnDate && <p style={{ fontSize: 10, color: TH.textMid, marginTop: 2 }}>⏰ {d.returnDate}</p>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color }}>{fmt(d.amount)}</span>
                <button onClick={() => setData({...data, debts: data.debts.filter(x=>x.id!==d.id)})} style={{ padding: 6, background: "rgba(248,113,113,0.1)", color: "#f87171", border: "none", borderRadius: 9, cursor: "pointer", display: "flex" }}><Trash2 size={13}/></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PLANNING VIEW (Piggy Bank Added) ───────────────────────────────────
function PlanningView({ data, setData, fmt, t, lang, isDark, TH, selStyle, getCategories, showToast }) {
  const [goalForm, setGoalForm] = useState({ show: false, id: "", name: "", target: "", icon: "🎯" });
  const [addFund, setAddFund] = useState({ id: "", amount: "" });
  const [tab, setPlanTab] = useState("savings"); // "savings", "goals", "budgets"
  const [piggyAmount, setPiggyAmount] = useState("");
  const [piggyWallet, setPiggyWallet] = useState(data.wallets[0]?.id || "");

  const handlePiggySave = () => {
    const n = Number(piggyAmount);
    if(!n || n <= 0) return showToast("Invalid amount");
    const w = data.wallets.find(x => x.id === piggyWallet);
    if(w.balance < n) return showToast("Insufficient balance in wallet", "error");
    
    // Deduct from wallet & Add to savings
    const ws = data.wallets.map(x => x.id === piggyWallet ? {...x, balance: x.balance - n} : x);
    const newTx = { id: genId(), type: 'transfer', date: TODAY(), amount: n, walletId: piggyWallet, note: "Transferred to Piggy Bank 🐷" };
    
    setData({...data, wallets: ws, txs: [newTx, ...data.txs], savings: { balance: (data.savings?.balance || 0) + n }});
    setPiggyAmount("");
    showToast("Added to Piggy Bank!", "success");
  };

  const saveGoal = () => {
    if(!goalForm.name || !goalForm.target) return;
    if(goalForm.id) {
      setData({...data, goals: data.goals.map(g => g.id === goalForm.id ? {...g, name: goalForm.name, target: Number(goalForm.target), icon: goalForm.icon} : g)});
    } else {
      setData({...data, goals: [...(data.goals||[]), { id: genId(), name: goalForm.name, target: Number(goalForm.target), icon: goalForm.icon, saved: 0 }]});
    }
    setGoalForm({ show: false, id: "", name: "", target: "", icon: "🎯" });
  };

  const handleFund = (id) => {
    const n = Number(addFund.amount);
    if(!n || addFund.id !== id) return;
    setData({...data, goals: data.goals.map(g => g.id === id ? {...g, saved: g.saved + n} : g)});
    setAddFund({ id: "", amount: "" });
  };

  const inp = { padding: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, borderRadius: 12, outline: "none", fontWeight: 700, color: TH.text, width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 6, background: TH.bgCard, padding: 6, borderRadius: 16, border: `1px solid ${TH.border}` }}>
         <button onClick={()=>setPlanTab("savings")} style={{ flex: 1, padding: 10, borderRadius: 12, border: "none", background: tab==="savings" ? "rgba(16,185,129,0.1)" : "transparent", color: tab==="savings" ? "#10b981" : TH.textMid, fontWeight: 700, cursor: "pointer", fontSize: 11 }}>🐷 Savings</button>
         <button onClick={()=>setPlanTab("goals")} style={{ flex: 1, padding: 10, borderRadius: 12, border: "none", background: tab==="goals" ? "rgba(139,92,246,0.1)" : "transparent", color: tab==="goals" ? "#8b5cf6" : TH.textMid, fontWeight: 700, cursor: "pointer", fontSize: 11 }}>🎯 Goals</button>
         <button onClick={()=>setPlanTab("budgets")} style={{ flex: 1, padding: 10, borderRadius: 12, border: "none", background: tab==="budgets" ? "rgba(245,158,11,0.1)" : "transparent", color: tab==="budgets" ? "#f59e0b" : TH.textMid, fontWeight: 700, cursor: "pointer", fontSize: 11 }}>📊 Budgets</button>
      </div>

      {tab === "savings" && (
        <div style={{ padding: 24, background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 24, textAlign: "center" }}>
          <div style={{ width: 60, height: 60, background: "#10b981", borderRadius: "50%", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}><PiggyBank size={30} color="#fff"/></div>
          <p style={{ fontWeight: 700, color: "#10b981", textTransform: "uppercase", fontSize: 12, letterSpacing: 1 }}>Total Saved</p>
          <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 20 }}>{fmt(data.savings?.balance || 0)}</h2>
          <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <select value={piggyWallet} onChange={e=>setPiggyWallet(e.target.value)} style={{ ...selStyle, ...inp, flex: 1 }}>{data.wallets.map(w => <option key={w.id} value={w.id}>From {w.name}</option>)}</select>
              <input type="number" placeholder="Amount" value={piggyAmount} onChange={e=>setPiggyAmount(e.target.value)} style={{ ...inp, flex: 1 }}/>
            </div>
            <button onClick={handlePiggySave} style={{ width: "100%", padding: 14, background: "#10b981", color: "#fff", fontWeight: 800, borderRadius: 12, border: "none", cursor: "pointer" }}>+ Add to Piggy Bank</button>
          </div>
        </div>
      )}

      {tab === "goals" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontWeight: 800, color: "#8b5cf6" }}>🏆 My Goals</h3>
            <button onClick={()=>setGoalForm({...goalForm, show: true})} style={{ padding: "8px 14px", background: "rgba(139,92,246,0.1)", color: "#8b5cf6", borderRadius: 12, border: "1px solid rgba(139,92,246,0.2)", fontWeight: 700, fontSize: 12 }}>+ New Goal</button>
          </div>
          {/* Goal Forms and Map Logic Unchanged */}
          {goalForm.show && (
            <div style={{ padding: 18, background: TH.bgCard, borderRadius: 20, border: `1px solid ${TH.border}` }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <input type="text" placeholder="Emoji 🎯" value={goalForm.icon} onChange={e=>setGoalForm({...goalForm, icon: e.target.value})} style={{...inp, width: "25%", textAlign:"center"}}/>
                <input type="text" placeholder="Goal Name" value={goalForm.name} onChange={e=>setGoalForm({...goalForm, name: e.target.value})} style={{...inp, width: "75%"}}/>
              </div>
              <input type="number" placeholder="Target Amount" value={goalForm.target} onChange={e=>setGoalForm({...goalForm, target: e.target.value})} style={{...inp, marginBottom: 10}}/>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={saveGoal} style={{ flex: 1, padding: 12, background: "#8b5cf6", color: "#fff", fontWeight: 700, borderRadius: 12, border: "none" }}>Save</button>
                <button onClick={()=>setGoalForm({show:false, id:"", name:"", target:"", icon:"🎯"})} style={{ flex: 1, padding: 12, background: "transparent", border: `1px solid ${TH.border}`, color: TH.textMid, fontWeight: 700, borderRadius: 12 }}>Cancel</button>
              </div>
            </div>
          )}
          {(data.goals || []).map(g => {
            const pct = Math.min((g.saved / g.target) * 100, 100);
            return (
              <div key={g.id} style={{ padding: 24, background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.04))", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 24, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -10, top: -10, fontSize: 120, opacity: 0.05 }}>{g.icon}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <h4 style={{ fontWeight: 800, fontSize: 16, color: "#8b5cf6" }}>{g.icon} {g.name}</h4>
                  <button onClick={()=>setData({...data, goals: data.goals.filter(x=>x.id!==g.id)})} style={{ background:"none", border:"none", color: "#f87171", cursor: "pointer" }}><Trash2 size={16}/></button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 10 }}>
                  <p style={{ fontSize: 32, fontWeight: 900 }}>{fmt(g.saved)}</p>
                  <p style={{ fontSize: 12, color: TH.textMid, fontWeight: 700 }}>Target: {fmt(g.target)}</p>
                </div>
                <div style={{ height: 10, background: TH.bgInner, borderRadius: 99, marginBottom: 8 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", borderRadius: 99, transition: "width 1s" }}/>
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#8b5cf6", marginBottom: 16 }}>{pct.toFixed(1)}% complete</p>
                
                <div style={{ display: "flex", gap: 10 }}>
                  <input type="number" placeholder="Add Amount" value={addFund.id===g.id ? addFund.amount : ""} onChange={e=>setAddFund({id: g.id, amount: e.target.value})} style={inp}/>
                  <button onClick={()=>handleFund(g.id)} style={{ padding: "12px 20px", background: "#8b5cf6", color: "#fff", fontWeight: 700, borderRadius: 12, border: "none" }}>Add</button>
                </div>
              </div>
            )
          })}
        </>
      )}

      {tab === "budgets" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 12, color: TH.textMid, padding: "0 4px", textAlign: "center", marginBottom: 10 }}>{lang==="bn" ? "প্রতি ক্যাটাগরিতে মাসিক সীমা নির্ধারণ করুন।" : "Set limits. You'll be alerted on Home at 80%."}</p>
          {getCategories("expense").map(cat => {
            const lim   = data.budgets[cat.id] || 0;
            const spent = data.txs.filter(x => x.type==="expense" && x.category===cat.id && x.date.startsWith(TODAY().slice(0,7))).reduce((s,e)=>s+e.amount,0);
            const pct   = lim ? Math.min((spent/lim)*100, 100) : 0;
            const over  = lim && spent > lim;
            const warn  = lim && spent >= lim * 0.8 && !over;
            
            return (
              <div key={cat.id} style={{ padding: 18, background: TH.bgCard, borderRadius: 22, border: `1.5px solid ${over ? cat.border : warn ? "rgba(245,158,11,0.3)" : TH.border}`, transition: "border-color 0.3s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: cat.color }}>{cat.icon} {cat.label[lang] || cat.label.en}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: over ? "#f87171" : warn ? "#fbbf24" : TH.textMid }}>
                    {fmt(spent)}{lim ? ` / ${fmt(lim)}` : ""}
                    {over && " ⚠"}{warn && " ⚠"}
                  </span>
                </div>
                {lim > 0 && (
                  <div style={{ height: 6, background: TH.bgInner, borderRadius: 99, overflow: "hidden", marginBottom: 10 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: over ? "#ef4444" : warn ? "#f59e0b" : cat.color, borderRadius: 99, transition: "width 0.7s" }}/>
                  </div>
                )}
                <input type="number" placeholder={lang==="bn" ? "মাসিক সীমা (০ = কোনো সীমা নেই)" : "Monthly limit (0 = no limit)"} value={lim || ""}
                  onChange={e => setData({...data, budgets:{...data.budgets, [cat.id]:Number(e.target.value)||0}})}
                  style={{ ...inp, colorScheme: isDark ? "dark" : "light" }}/>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── GRAPHS VIEW (Income vs Expense Bar Chart Added) ────────────────────
function GraphsView({ data, fmt, t, lang, isDark, TH, getCategories }) {
  const [gTab, setGTab] = useState("pie"); // 'pie', 'week', 'month'

  // Processing Pie Chart (Expenses)
  const catData = getCategories("expense").map(cat => ({
    name: cat.label[lang] || cat.label.en, value: data.txs.filter(x=>x.type==="expense" && x.category===cat.id).reduce((s,e)=>s+e.amount,0), color: cat.color
  })).filter(x=>x.value>0);

  // Processing Weekly Chart (Last 7 Days)
  const weeklyData = useMemo(() => {
    return Array.from({length: 7}).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const txs = data.txs.filter(tx => tx.date === dateStr);
      return { 
        name: DAY_NAMES[lang][d.getDay()].substring(0,3), 
        income: txs.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0), 
        expense: txs.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0) 
      };
    });
  }, [data.txs, lang]);

  // Processing Monthly Chart (Current Year)
  const monthlyData = useMemo(() => {
    return MONTH_SHORT.en.map((_, i) => {
      const prefix = `${new Date().getFullYear()}-${String(i+1).padStart(2, '0')}`;
      const txs = data.txs.filter(tx => tx.date.startsWith(prefix));
      return { 
        name: MONTH_SHORT[lang][i], 
        income: txs.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0), 
        expense: txs.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0) 
      };
    });
  }, [data.txs, lang]);

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: TH.bgCard, border: `1px solid ${TH.border}`, padding: 12, borderRadius: 12 }}>
          <p style={{ fontWeight: 800, marginBottom: 8 }}>{label}</p>
          {payload.map((p, i) => <p key={i} style={{ color: p.fill, fontSize: 12, fontWeight: 700 }}>{p.name === 'income' ? (lang==="bn"?"আয়: ":"Income: ") : (lang==="bn"?"ব্যয়: ":"Expense: ")} {fmt(p.value)}</p>)}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      
      <div style={{ display: "flex", gap: 6, background: TH.bgCard, padding: 6, borderRadius: 16, border: `1px solid ${TH.border}` }}>
         <button onClick={()=>setGTab("pie")} style={{ flex: 1, padding: 8, borderRadius: 12, border: "none", background: gTab==="pie" ? "rgba(139,92,246,0.1)" : "transparent", color: gTab==="pie" ? "#8b5cf6" : TH.textMid, fontWeight: 700, fontSize: 11 }}>Breakdown</button>
         <button onClick={()=>setGTab("week")} style={{ flex: 1, padding: 8, borderRadius: 12, border: "none", background: gTab==="week" ? "rgba(59,130,246,0.1)" : "transparent", color: gTab==="week" ? "#3b82f6" : TH.textMid, fontWeight: 700, fontSize: 11 }}>Weekly</button>
         <button onClick={()=>setGTab("month")} style={{ flex: 1, padding: 8, borderRadius: 12, border: "none", background: gTab==="month" ? "rgba(16,185,129,0.1)" : "transparent", color: gTab==="month" ? "#10b981" : TH.textMid, fontWeight: 700, fontSize: 11 }}>Monthly</button>
      </div>

      <div style={{ background: TH.bgCard, borderRadius: 28, padding: 24, border: `1px solid ${TH.border}` }}>
        {gTab === "pie" && (
          <>
            <h4 style={{ fontWeight: 800, marginBottom: 16 }}>{lang==="bn"?"খরচের বিভাজন":"Expense Breakdown"}</h4>
            <div style={{ height: 250 }}>
              {catData.length === 0 ? <p style={{ textAlign: "center", paddingTop: 80, color: TH.textDim }}>No Data</p> :
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={catData} innerRadius={70} outerRadius={100} paddingAngle={6} dataKey="value" stroke="none">{catData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={v=>fmt(v)} contentStyle={{ borderRadius: 12, background: TH.bgCard, border: `1px solid ${TH.border}`, color: TH.text }}/></PieChart>
                </ResponsiveContainer>
              }
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 20 }}>
              {catData.map(c => (
                 <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, background: TH.bgInner, padding: 8, borderRadius: 10 }}>
                   <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color }}/> {c.name}
                 </div>
              ))}
            </div>
          </>
        )}

        {(gTab === "week" || gTab === "month") && (
          <>
            <h4 style={{ fontWeight: 800, marginBottom: 16 }}>{lang==="bn"?"আয় বনাম ব্যয়":"Income vs Expense"}</h4>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gTab === "week" ? weeklyData : monthlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={TH.border} vertical={false}/>
                  <XAxis dataKey="name" tick={{ fill: TH.textMid, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: TH.textMid, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v)=> v>1000 ? `${v/1000}k` : v} />
                  <Tooltip content={<customTooltip/>} cursor={{ fill: TH.bgInner }}/>
                  <Bar dataKey="income" fill="#10b981" radius={[4,4,0,0]} barSize={12} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: TH.textMid }}><div style={{ width: 10, height: 10, borderRadius: 3, background: "#10b981" }}/> {lang==="bn"?"আয়":"Income"}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: TH.textMid }}><div style={{ width: 10, height: 10, borderRadius: 3, background: "#ef4444" }}/> {lang==="bn"?"ব্যয়":"Expense"}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NavBtn({ active, icon: Icon, label, onClick, TH }) {
  return (
    <button onClick={onClick} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:8, background:"none", border:"none", cursor:"pointer", transition: "transform 0.2s", transform: active ? "scale(1.1)" : "scale(1)" }}>
      <div style={{ padding: 8, borderRadius: 14, background: active ? "rgba(139,92,246,0.15)" : "transparent", transition: "background 0.3s" }}><Icon size={20} color={active ? "#8b5cf6" : TH.textMid} strokeWidth={active ? 2.5 : 2}/></div>
      <span style={{ fontSize: 9, fontWeight: 700, color: active ? "#8b5cf6" : TH.textMid }}>{label}</span>
    </button>
  );
}