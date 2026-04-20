import { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import html2canvas from "html2canvas";
import {
  Plus, Trash2, Home, BarChart2, Settings, TrendingDown, TrendingUp,
  Users, X, Download, Printer, Eye, EyeOff, Search, 
  AlertTriangle, Landmark, Wallet, Lock, Calendar,
  Camera, Sun, Moon, KeyRound, Edit3, CheckCircle2, History, PlusCircle,
  DownloadCloud, UploadCloud, Code, Mail, ChevronDown, Filter, ExternalLink
} from "lucide-react";

const AUTHOR   = "Mushfiqur Rahman Nafi";
const APP_NAME = "NaFinance";

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Hind+Siliguri:wght@400;600;700&display=swap');
  * { font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif; -webkit-font-smoothing: antialiased; }
`;

const BASE_CATEGORIES = {
  expense: [
    { id: "food",      label: { bn: "খাবার",    en: "Food" },      icon: "🍔", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
    { id: "transport", label: { bn: "যাতায়াত", en: "Transport" }, icon: "🚌", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    { id: "rent",      label: { bn: "ভাড়া",    en: "Rent" },      icon: "🏠", color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
    { id: "shopping",  label: { bn: "কেনাকাটা", en: "Shopping" }, icon: "🛒", color: "#ec4899", bg: "rgba(236,72,153,0.12)" },
    { id: "other_ex",  label: { bn: "অন্যান্য", en: "Other" },    icon: "📝", color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  ],
  income: [
    { id: "freelance", label: { bn: "ফ্রিল্যান্স", en: "Freelance" }, icon: "💻", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    { id: "salary",    label: { bn: "বেতন",        en: "Salary" },    icon: "💰", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  ],
};

const CURRENCIES = [
  { code: "BDT", sym: "৳", loc: "bn-BD" }, { code: "USD", sym: "$", loc: "en-US" },
  { code: "GBP", sym: "£", loc: "en-GB" }, { code: "EUR", sym: "€", loc: "de-DE" }
];

const TODAY = () => new Date().toISOString().split("T")[0];
const genId = () => Math.random().toString(36).substr(2, 9);
const fmtMoney = (n, curr, lang) => {
  const c = CURRENCIES.find(x => x.code === curr) || CURRENCIES[0];
  return new Intl.NumberFormat(lang === "bn" ? "bn-BD" : c.loc, { style: "currency", currency: c.code, minimumFractionDigits: 0 }).format(n || 0);
};

export default function App() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("nafinance_v8_db");
    return saved ? JSON.parse(saved) : { txs: [], wallets: [{ id: "w1", name: "Cash", balance: 0, icon: "💵" }, { id: "w2", name: "Bank", balance: 0, icon: "🏦" }], debts: [], goals: [], budgets: {}, savings: { balance: 0, history: [] }, customCategories: { expense: [], income: [] }, dismissedAlerts: [] };
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("nafinance_v8_set");
    return saved ? JSON.parse(saved) : { lang: "bn", curr: "BDT", theme: "dark", hideBalance: false, pinLock: "", recoveryWord: "" };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!settings.pinLock);
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [editTxData, setEditTxData] = useState(null); 
  const [toastMsg, setToastMsg] = useState(null);
  const appRef = useRef(null);

  useEffect(() => { localStorage.setItem("nafinance_v8_db", JSON.stringify(data)); }, [data]);
  useEffect(() => { localStorage.setItem("nafinance_v8_set", JSON.stringify(settings)); }, [settings]);

  const showToast = (msg, type="error") => { setToastMsg({ msg, type }); setTimeout(() => setToastMsg(null), 2500); };
  const isDark = settings.theme === "dark";
  const TH = isDark ? { bg: "#0b0f19", bgCard: "#131b2f", bgInner: "#1e293b", border: "rgba(139,92,246,0.15)", text: "#f8fafc", textMid: "#94a3b8" } : { bg: "#f8fafc", bgCard: "#ffffff", bgInner: "#f1f5f9", border: "#e2e8f0", text: "#0f172a", textMid: "#64748b" };

  const fmt = n => settings.hideBalance ? "••••" : fmtMoney(n, settings.curr, settings.lang);
  
  // 🚀 ক্যাটাগরি হ্যান্ডলার: বেস + আপনার বানানো ক্যাটাগরি
  const getCategories = (type) => [
    ...BASE_CATEGORIES[type], 
    ...(data.customCategories?.[type] || [])
  ];

  const saveTx = (tx, oldTx = null) => {
    let ws = [...data.wallets];
    if (oldTx) { ws = ws.map(w => w.id === oldTx.walletId ? { ...w, balance: oldTx.type === "income" ? w.balance - oldTx.amount : w.balance + oldTx.amount } : w); }
    const isInc = tx.type === "income";
    if (!isInc && ws.find(w=>w.id===tx.walletId).balance < tx.amount) { showToast("ব্যালেন্স নেই!", "error"); return false; }
    ws = ws.map(w => w.id === tx.walletId ? { ...w, balance: isInc ? w.balance + tx.amount : w.balance - tx.amount } : w);
    setData({ ...data, txs: oldTx ? data.txs.map(t => t.id === oldTx.id ? tx : t) : [tx, ...data.txs], wallets: ws });
    showToast("সফল!", "success"); return true;
  };

  const deleteTx = tx => {
    if(!window.confirm("মুছবেন?")) return;
    const ws = data.wallets.map(w => w.id === tx.walletId ? { ...w, balance: tx.type === "income" ? w.balance - tx.amount : w.balance + tx.amount } : w);
    setData({ ...data, txs: data.txs.filter(x => x.id !== tx.id), wallets: ws });
    showToast("মুছে ফেলা হয়েছে", "success");
  };

  if (!isAuthenticated) return <PinScreen settings={settings} setSettings={setSettings} onSuccess={() => setIsAuthenticated(true)} TH={TH} showToast={showToast} />;
  return (
    <div ref={appRef} style={{ minHeight: "100vh", background: TH.bg, color: TH.text, position: "relative" }}>
      <style>{FONT_STYLE}</style>
      
      {toastMsg && (
        <div style={{ position: "fixed", top: 30, left: "50%", transform: "translateX(-50%)", background: TH.bgCard, color: TH.text, padding: "14px 24px", borderRadius: 25, boxShadow: "0 10px 30px rgba(0,0,0,0.3)", zIndex: 2000, display: "flex", alignItems: "center", gap: 10, fontWeight: 700, border: `1px solid ${toastMsg.type === 'success' ? '#10b981' : '#ef4444'}` }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: toastMsg.type === 'success' ? '#10b981' : '#ef4444' }} />
          {toastMsg.msg}
        </div>
      )}
      
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: isDark ? "rgba(11,15,25,0.8)" : "rgba(255,255,255,0.8)", backdropFilter: "blur(15px)", borderBottom: `1px solid ${TH.border}`, padding: "12px 20px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", borderRadius: 12, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900 }}>$</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#8b5cf6" }}>{APP_NAME}</span>
          </div>
          <button onClick={() => setModal("settings")} style={{ padding: 10, background: TH.bgInner, border: "none", borderRadius: 12, color: TH.textMid }}><Settings size={20}/></button>
        </div>
      </header>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "15px 20px 140px" }}>
        {tab === "home" && <HomeView data={data} setData={setData} fmt={fmt} TH={TH} settings={settings} setSettings={setSettings} getCategories={getCategories} deleteTx={deleteTx} setEditTxData={setEditTxData} setModal={setModal} />}
        {tab === "assets" && <AssetsView data={data} setData={setData} fmt={fmt} TH={TH} showToast={showToast} />}
        {tab === "planning" && <PlanningView data={data} setData={setData} fmt={fmt} TH={TH} settings={settings} getCategories={getCategories} showToast={showToast} />}
        {tab === "graphs" && <GraphsView data={data} fmt={fmt} TH={TH} lang={settings.lang} getCategories={getCategories} />}
      </main>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: isDark ? "#131b2f" : "#fff", borderTop: `1px solid ${TH.border}`, padding: "10px 0 40px", zIndex: 100 }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", justifyContent: "space-around" }}>
          <NavBtn active={tab==="home"} icon={Home} label={settings.lang==="bn"?"হোম":"Home"} onClick={()=>setTab("home")} TH={TH}/>
          <NavBtn active={tab==="assets"} icon={Wallet} label={settings.lang==="bn"?"ওয়ালেট":"Wallet"} onClick={()=>setTab("assets")} TH={TH}/>
          <button onClick={() => { setEditTxData(null); setModal("tx"); }} style={{ width: 65, height: 65, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(139,92,246,0.4)", marginTop: -45, border: `6px solid ${TH.bg}`, color: "#fff" }}><Plus size={30}/></button>
          <NavBtn active={tab==="planning"} icon={Landmark} label={settings.lang==="bn"?"প্ল্যান":"Plan"} onClick={()=>setTab("planning")} TH={TH}/>
          <NavBtn active={tab==="graphs"} icon={BarChart2} label={settings.lang==="bn"?"বিশ্লেষণ":"Graphs"} onClick={()=>setTab("graphs")} TH={TH}/>
        </div>
      </nav>

      {modal === "tx" && <TxModal data={data} saveTx={saveTx} onClose={()=>setModal(null)} TH={TH} editData={editTxData} getCategories={getCategories} lang={settings.lang} showToast={showToast} />}
      {modal === "settings" && <SettingsModal settings={settings} setSettings={setSettings} data={data} setData={setData} onClose={()=>setModal(null)} TH={TH} showToast={showToast} AUTHOR={AUTHOR} getCategories={getCategories} />}
    </div>
  );
}

function HomeView({ data, setData, fmt, TH, settings, setSettings, getCategories, deleteTx, setEditTxData, setModal }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const total = data.wallets.reduce((s, w) => s + w.balance, 0);
  const spentToday = data.txs.filter(x => x.date === TODAY() && x.type === "expense").reduce((s, e) => s + e.amount, 0);

  const activeAlerts = getCategories("expense").filter(cat => {
    if (data.dismissedAlerts?.includes(cat.id)) return false;
    const lim = data.budgets[cat.id];
    if (!lim) return false;
    const spent = data.txs.filter(x => x.type === "expense" && x.category === cat.id && x.date.startsWith(TODAY().slice(0, 7))).reduce((s, e) => s + e.amount, 0);
    return spent >= lim * 0.8;
  });

  const filteredTxs = data.txs.filter(tx => {
    const cat = getCategories(tx.type).find(c => c.id === tx.category);
    const s = search.toLowerCase();
    return (filterCat === "all" || tx.category === filterCat) && (tx.note?.toLowerCase().includes(s) || cat?.label.bn.includes(s) || cat?.label.en.toLowerCase().includes(s));
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {activeAlerts.map(cat => (
        <div key={cat.id} style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", padding: "12px 16px", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{display:"flex", alignItems:"center", gap: 10}}><AlertTriangle size={18} color="#f59e0b"/> <span>{cat.icon} {cat.label[settings.lang]} ৮০% বাজেট শেষ!</span></div>
          <button onClick={() => setData({ ...data, dismissedAlerts: [...(data.dismissedAlerts || []), cat.id] })} style={{background:"none", border:"none", color: TH.textMid}}><X size={18}/></button>
        </div>
      ))}
      <div style={{ padding: 30, borderRadius: 32, background: "linear-gradient(135deg, #1e1b4b, #0f172a)", color: "#fff" }}>
        <p style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>মোট ব্যালেন্স</p>
        <h2 style={{ fontSize: 46, fontWeight: 900, margin: "8px 0" }}>{fmt(total)}</h2>
        <div style={{ display: "flex", gap: 15, marginTop: 20 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" }}><p style={{ fontSize: 10, opacity: 0.6 }}>আজকের খরচ</p><p style={{ fontSize: 18, fontWeight: 800, color: "#fca5a5" }}>{fmt(spentToday)}</p></div>
          <button onClick={()=>setSettings({...settings, hideBalance: !settings.hideBalance})} style={{ padding: 18, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 20, color: "#fff" }}>{settings.hideBalance ? <Eye size={24}/> : <EyeOff size={24}/>}</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, background: TH.bgCard, padding: "14px 18px", borderRadius: 20, border: `1px solid ${TH.border}` }}>
          <Search size={20} color={TH.textMid}/><input type="text" placeholder="সার্চ..." value={search} onChange={e=>setSearch(e.target.value)} style={{ background:"none", border:"none", color:TH.text, outline:"none", flex:1, fontSize:15, fontWeight:700 }}/>
        </div>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ padding: "14px", borderRadius: 20, background: TH.bgCard, border: `1px solid ${TH.border}`, color: TH.text, fontWeight: 800 }}>
          <option value="all">সব</option>
          {getCategories("expense").map(c => <option key={c.id} value={c.id}>{c.icon} {c.label[settings.lang]}</option>)}
        </select>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredTxs.slice(0, 30).map(tx => {
          const cat = getCategories(tx.type).find(c => c.id === tx.category) || {icon:"📝", bg:"rgba(148,163,184,0.1)", label:{bn:"অন্যান্য", en:"Other"}};
          return (
            <div key={tx.id} style={{ padding: 18, background: TH.bgCard, borderRadius: 24, border: `1px solid ${TH.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => { setEditTxData(tx); setModal("tx"); }}>
              <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                <div style={{ width: 50, height: 50, borderRadius: 16, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{cat.icon}</div>
                <div><p style={{ fontWeight: 800, fontSize: 16 }}>{tx.note || cat.label[settings.lang]}</p><p style={{ fontSize: 11, color: TH.textMid }}>{tx.date}</p></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                <p style={{ fontWeight: 900, fontSize: 17, color: tx.type === "income" ? "#10b981" : "#ef4444" }}>{tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}</p>
                <button onClick={(e)=>{e.stopPropagation(); deleteTx(tx);}} style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "none", padding: 10, borderRadius: 12 }}><Trash2 size={16}/></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function AssetsView({ data, setData, fmt, TH, showToast }) {
  const [debtForm, setDebtForm] = useState({ show: false, person: "", amount: "", type: "lend" });
  const handleAddDebt = () => {
    const amt = Number(debtForm.amount); if(!debtForm.person || !amt) return showToast("সব দিন");
    let ws = [...data.wallets]; let txs = [...data.txs];
    if (debtForm.type === "lend") { if (ws[0].balance < amt) return showToast("টাকা নেই"); ws[0].balance -= amt; txs = [{ id: genId(), type:'expense', date: TODAY(), amount: amt, category:'other_ex', walletId: "w1", note: `ধার: ${debtForm.person}` }, ...txs]; }
    else { ws[0].balance += amt; txs = [{ id: genId(), type:'income', date: TODAY(), amount: amt, category:'other_in', walletId: "w1", note: `ঋণ: ${debtForm.person}` }, ...txs]; }
    setData({ ...data, wallets: ws, txs: txs, debts: [{...debtForm, id: genId(), amount: amt}, ...data.debts] });
    setDebtForm({ show: false, person: "", amount: "", type: "lend" }); showToast("সফল!", "success");
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h3 style={{ fontWeight: 800 }}>ওয়ালেট</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{data.wallets.map(w => (<div key={w.id} style={{ padding: 25, background: TH.bgCard, borderRadius: 28, border: `1px solid ${TH.border}` }}><span style={{ fontSize: 32 }}>{w.icon}</span><p style={{ fontSize: 13, fontWeight: 800, color: TH.textMid }}>{w.name}</p><p style={{ fontSize: 22, fontWeight: 900 }}>{fmt(w.balance)}</p></div>))}</div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}><h3 style={{ fontWeight: 800 }}>ধার-দেনা</h3><button onClick={()=>setDebtForm({...debtForm, show: !debtForm.show})} style={{ padding: "8px 16px", borderRadius: 12, background: "#8b5cf6", color: "#fff", border: "none", fontWeight: 800 }}>+ নতুন</button></div>
      {debtForm.show && (<div style={{ padding: 25, background: TH.bgCard, borderRadius: 30, display: "flex", flexDirection: "column", gap: 12, border: "2px dashed #8b5cf6" }}><input type="text" placeholder="নাম" value={debtForm.person} onChange={e=>setDebtForm({...debtForm, person: e.target.value})} style={{ padding: 15, borderRadius: 15, background: TH.bgInner, border: "none", color: TH.text, fontWeight: 700 }} /><input type="number" placeholder="টাকা" value={debtForm.amount} onChange={e=>setDebtForm({...debtForm, amount: e.target.value})} style={{ padding: 15, borderRadius: 15, background: TH.bgInner, border: "none", color: TH.text, fontWeight: 700 }} /><button onClick={handleAddDebt} style={{ padding: 18, background: "#8b5cf6", color: "#fff", border: "none", borderRadius: 15, fontWeight: 900 }}>Save</button></div>)}
      {data.debts.map(d => (<div key={d.id} style={{ padding: 20, background: TH.bgCard, borderRadius: 25, display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${TH.border}` }}><div style={{ display:"flex", alignItems:"center", gap:15 }}><div style={{ width:44, height:44, borderRadius:"50%", background: d.type==='lend'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', display:"flex", alignItems:"center", justifyContent:"center" }}><Users size={20} color={d.type==='lend'?'#10b981':'#ef4444'}/></div><div><p style={{ fontWeight: 800 }}>{d.person}</p><p style={{ fontSize: 11, color: TH.textMid }}>{d.type === "lend" ? "পাবো" : "দেনা"}</p></div></div><div style={{ display: "flex", alignItems: "center", gap: 15 }}><p style={{ fontWeight: 900, color: d.type === "lend" ? "#10b981" : "#ef4444" }}>{fmt(d.amount)}</p><button onClick={()=>{ const ws = data.wallets.map(w => w.id === "w1" ? { ...w, balance: d.type==='lend'? w.balance+d.amount : w.balance-d.amount } : w); setData({...data, wallets: ws, debts: data.debts.filter(x=>x.id!==d.id)}); showToast("ক্লিয়ার!", "success"); }} style={{ padding: "8px 14px", background: "rgba(16,185,129,0.1)", color: "#10b981", borderRadius: 10, border: "none", fontWeight: 800 }}>Settle</button></div></div>))}
    </div>
  );
}

function PlanningView({ data, setData, fmt, TH, settings, getCategories, showToast }) {
  const [subTab, setSubTab] = useState("vault");
  const [saveAmt, setSaveAmt] = useState("");
  const [saveNote, setSaveNote] = useState("");
  const [goalForm, setGoalForm] = useState({ show: false, name: "", target: "", id: null });
  const [budgetCat, setBudgetCat] = useState("");

  const handleVault = (type) => {
    const n = Number(saveAmt); if (!n) return;
    let ws = [...data.wallets]; let sv = { ...data.savings }; let txs = [...data.txs];
    if (type === 'deposit') { if (ws[0].balance < n) return showToast("টাকা নেই"); ws[0].balance -= n; sv.balance += n; const msg = saveNote || "সঞ্চয় জমা"; sv.history = [{ id: genId(), date: TODAY(), amount: n, type: 'deposit', note: msg }, ...(sv.history || [])]; txs = [{ id: genId(), type:'expense', date: TODAY(), amount: n, category:'other_ex', walletId: "w1", note: msg }, ...txs]; }
    else { if (sv.balance < n) return showToast("খালি"); ws[0].balance += n; sv.balance -= n; const msg = saveNote || "উত্তোলন"; sv.history = [{ id: genId(), date: TODAY(), amount: n, type: 'withdraw', note: msg }, ...(sv.history || [])]; txs = [{ id: genId(), type:'income', date: TODAY(), amount: n, category:'other_in', walletId: "w1", note: msg }, ...txs]; }
    setData({...data, wallets: ws, savings: sv, txs: txs}); setSaveAmt(""); setSaveNote(""); showToast("সফল!", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", background: TH.bgCard, padding: 6, borderRadius: 20, border: `1px solid ${TH.border}` }}>{['vault', 'goals', 'budgets'].map(t => (<button key={t} onClick={()=>setSubTab(t)} style={{ flex: 1, padding: "12px", borderRadius: 16, background: subTab===t ? "#8b5cf6" : "transparent", color: subTab===t ? "#fff" : TH.textMid, fontWeight: 800, border: "none", fontSize: 13 }}>{t.toUpperCase()}</button>))}</div>
      {subTab === "vault" && (<div style={{ padding: 40, background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))", borderRadius: 35, textAlign: "center", border: "1px solid rgba(16,185,129,0.2)" }}><Landmark size={32} style={{margin:"0 auto 15px", color:"#10b981"}}/><p style={{ fontWeight: 800, color: "#10b981" }}>SAVINGS</p><h2 style={{ fontSize: 44, fontWeight: 900 }}>{fmt(data.savings.balance)}</h2><div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 25 }}><input type="number" placeholder="টাকা" value={saveAmt} onChange={e=>setSaveAmt(e.target.value)} style={{ padding: 18, borderRadius: 18, background: TH.bgInner, border: "none", color: TH.text, textAlign:"center" }} /><input type="text" placeholder="নোট" value={saveNote} onChange={e=>setSaveNote(e.target.value)} style={{ padding: 18, borderRadius: 18, background: TH.bgInner, border: "none", color: TH.text, textAlign:"center" }} /><div style={{ display: "flex", gap: 10 }}><button onClick={()=>handleVault('deposit')} style={{ flex: 1, padding: 18, background: "#10b981", color: "#fff", border: "none", borderRadius: 18, fontWeight: 900 }}>Deposit</button><button onClick={()=>handleVault('withdraw')} style={{ flex: 1, padding: 18, background: "transparent", color: "#10b981", border: "2px solid #10b981", borderRadius: 18, fontWeight: 900 }}>Withdraw</button></div></div></div>)}
      {subTab === "goals" && (<div style={{ display:"flex", flexDirection:"column", gap:15 }}><button onClick={()=>setGoalForm({...goalForm, show: true})} style={{ padding:20, background:TH.bgCard, borderRadius:25, border:`2px dashed #8b5cf6`, color:TH.text, fontWeight:800 }}>+ New Goal</button>{data.goals.map(g => (<div key={g.id} style={{ padding:25, background:TH.bgCard, borderRadius:30, border:`1px solid ${TH.border}` }}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:15 }}><h4 style={{ fontWeight:800 }}>🎯 {g.name}</h4><div style={{ display:"flex", gap:10 }}><button onClick={()=>setGoalForm({show:true, ...g})} style={{ color:"#3b82f6", background:"none", border:"none" }}><Edit3 size={18}/></button><button onClick={()=>setData({...data, goals: data.goals.filter(x=>x.id!==g.id)})} style={{ color:"#ef4444", background:"none", border:"none" }}><Trash2 size={18}/></button></div></div><div style={{ height:12, background:TH.bgInner, borderRadius:10, overflow:"hidden", marginBottom:10 }}><div style={{ width:`${Math.min((g.saved/g.target)*100, 100)}%`, height:"100%", background:"#8b5cf6" }} /></div><div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:800 }}><span>{fmt(g.saved)}</span><span>{fmt(g.target)}</span></div><button onClick={()=>{const a=Number(prompt("টাকা")); if(a) setData({...data, goals: data.goals.map(x=>x.id===g.id?{...x, saved: x.saved+a}:x)} )}} style={{ width:"100%", marginTop:15, padding:15, borderRadius:15, background:TH.bgInner, color:TH.text, fontWeight:800 }}>Add Cash +</button></div>))}</div>)}
      {subTab === "budgets" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ padding:25, background:TH.bgCard, borderRadius:30, border:`1px solid #8b5cf6` }}><p style={{ fontWeight:800, marginBottom:15, color:"#8b5cf6" }}>বাজেট সেট করুন</p><div style={{ display:"flex", gap:10, marginBottom:10 }}><select value={budgetCat} onChange={e=>setBudgetCat(e.target.value)} style={{ flex:1, padding:15, borderRadius:15, background:TH.bgInner, color:TH.text, border:"none", fontWeight:800 }}><option value="">ক্যাটাগরি</option>{getCategories("expense").map(c => <option key={c.id} value={c.id}>{c.icon} {c.label[settings.lang]}</option>)}</select><input type="number" placeholder="লিমিট" id="l-in" style={{ width:120, padding:15, borderRadius:15, background:TH.bgInner, color:TH.text, border:"none", textAlign:"center", fontWeight:900 }} /></div><button onClick={()=>{ const val=Number(document.getElementById('l-in').value); if(budgetCat && val){ setData({...data, budgets:{...data.budgets, [budgetCat]:val}}); showToast("সফল!", "success"); } }} style={{ width:"100%", padding:15, borderRadius:15, background:"#8b5cf6", color:"#fff", border:"none", fontWeight:800 }}>Update Budget</button></div>
          {Object.entries(data.budgets).map(([id, lim]) => {
            const cat = getCategories("expense").find(c => c.id === id); if(!cat) return null;
            return (<div key={id} style={{ padding:22, background:TH.bgCard, borderRadius:25, border:`1px solid ${TH.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}><div style={{ display:"flex", alignItems:"center", gap:15 }}><span style={{ fontSize:28 }}>{cat.icon}</span><div><p style={{ fontWeight:800 }}>{cat.label[settings.lang]}</p><p style={{ fontSize:11, color:TH.textMid }}>{fmt(lim)}</p></div></div><button onClick={()=>{const n={...data.budgets}; delete n[id]; setData({...data, budgets:n})}} style={{ color:"#ef4444", background:"rgba(239,68,68,0.1)", border:"none", padding:12, borderRadius:12 }}><Trash2 size={16}/></button></div>);
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
    const mStr = `2026-${String(i+1).padStart(2, '0')}`;
    const inc = data.txs.filter(t => t.type === "income" && t.date.startsWith(mStr)).reduce((s, t) => s + t.amount, 0);
    const exp = data.txs.filter(t => t.type === "expense" && t.date.startsWith(mStr)).reduce((s, t) => s + t.amount, 0);
    return { name: m, income: inc, expense: exp };
  }), [data.txs]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
       <div style={{ display: "flex", background: TH.bgCard, padding: 8, borderRadius: 22, border: `1px solid ${TH.border}` }}>{['breakdown', 'weekly', 'monthly'].map(t => (<button key={t} onClick={()=>setGType(t)} style={{ flex: 1, padding: "12px", borderRadius: 16, background: gType===t ? "rgba(139,92,246,0.15)" : "transparent", color: gType===t ? "#8b5cf6" : TH.textMid, fontWeight: 800, border: "none", fontSize: 13 }}>{t.toUpperCase()}</button>))}</div>
       <div style={{ padding: 30, background: TH.bgCard, borderRadius: 40, border: `1px solid ${TH.border}`, minHeight: 400 }}>{gType === "breakdown" ? (<ResponsiveContainer width="100%" height={350}><PieChart><Pie data={getCategories("expense").map(cat => ({ name: cat.label[lang], value: data.txs.filter(x=>x.type==="expense" && x.category===cat.id).reduce((s,e)=>s+e.amount,0), color: cat.color })).filter(x=>x.value>0)} innerRadius={85} outerRadius={115} paddingAngle={6} dataKey="value" stroke="none">{getCategories("expense").map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius: 18, border:"none", background: TH.bgInner, fontWeight:800}}/></PieChart></ResponsiveContainer>) : (<ResponsiveContainer width="100%" height={350}><BarChart data={gType === "weekly" ? weeklyData : monthlyData}><XAxis dataKey="name" stroke={TH.textMid} fontSize={12}/><Tooltip cursor={{fill: 'transparent'}} formatter={v=>fmt(v)} contentStyle={{borderRadius: 16, border:"none", background: TH.bgInner, fontWeight:800}}/><Legend verticalAlign="top" iconType="circle"/><Bar dataKey="income" fill="#10b981" radius={[5,5,0,0]} name="Income" /><Bar dataKey="expense" fill="#ef4444" radius={[5,5,0,0]} name="Expense" /></BarChart></ResponsiveContainer>)}</div>
    </div>
  );
}

function TxModal({ data, saveTx, onClose, TH, editData, getCategories, lang, showToast }) {
  const [type, setType] = useState(editData?.type || "expense");
  const [f, setF] = useState(editData || { date: TODAY(), category: "food", amount: "", note: "", walletId: "w1" });
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 12, backdropFilter: "blur(10px)" }}>
      <div style={{ background: TH.bgCard, padding: 35, borderRadius: "45px 45px 30px 30px", width: "100%", maxWidth: 480, border: `1px solid ${TH.border}` }}>
        <div style={{ display: "flex", background: TH.bgInner, padding: 6, borderRadius: 15, marginBottom: 25 }}><button onClick={()=>setType("expense")} style={{ flex: 1, padding: 15, borderRadius: 12, border: "none", background: type==="expense"?"#f97316":"transparent", color: type==="expense"?"#fff":TH.textMid, fontWeight: 900 }}>Expense</button><button onClick={()=>setType("income")} style={{ flex: 1, padding: 15, borderRadius: 12, border: "none", background: type==="income"?"#10b981":"transparent", color: type==="income"?"#fff":TH.textMid, fontWeight: 900 }}>Income</button></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20, maxHeight: 150, overflowY: "auto" }}>{getCategories(type).map(c => (<button key={c.id} onClick={()=>setF({...f, category:c.id})} style={{ padding: 12, borderRadius: 18, border: `2px solid ${f.category===c.id?c.color:TH.border}`, background: f.category===c.id?`${c.color}15`:TH.bgInner, color: TH.text, fontSize: 11, fontWeight: 800 }}>{c.icon}<br/>{c.label[lang]}</button>))}</div>
        <input type="number" placeholder="0" value={f.amount} onChange={e=>setF({...f, amount:e.target.value})} style={{ width: "100%", padding: 22, borderRadius: 22, background: TH.bgInner, border: `2px solid ${TH.border}`, color: "#8b5cf6", fontSize: 44, fontWeight: 900, textAlign: "center", marginBottom: 20, outline: "none" }}/>
        <input type="text" placeholder="নোট..." value={f.note} onChange={e=>setF({...f, note:e.target.value})} style={{ width: "100%", padding: 20, borderRadius: 20, background: TH.bgInner, border: `1px solid ${TH.border}`, color: TH.text, marginBottom: 25, outline: "none", fontWeight: 700 }}/>
        <button onClick={() => { if(saveTx({...f, type, amount: Number(f.amount), id: editData?.id || genId()}, editData)) onClose(); }} style={{ width: "100%", padding: 22, borderRadius: 22, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff", fontWeight: 900, border: "none", fontSize: 18, boxShadow: "0 10px 25px rgba(139,92,246,0.3)" }}>Confirm ✓</button>
        <button onClick={onClose} style={{ width: "100%", padding: 15, background: "none", border: "none", color: TH.textMid, fontWeight: 800 }}>Cancel</button>
      </div>
    </div>
  );
}

function PinScreen({ settings, setSettings, onSuccess, TH, showToast }) {
  const [input, setInput] = useState(""); const [isForgot, setIsForgot] = useState(false); const [recIn, setRecIn] = useState("");
  const handleKey = (num) => { if (input.length < 4) { const newVal = input + num; setInput(newVal); if (newVal === settings.pinLock) setTimeout(onSuccess, 250); else if (newVal.length === 4) { setInput(""); showToast("ভুল পিন!", "error"); } } };
  if (isForgot) return (<div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: TH.bg, padding: 35 }}><KeyRound size={70} color="#f59e0b"/><h2 style={{ fontWeight: 900, marginTop:20 }}>রিস্টোর পিন</h2><input type="text" placeholder="গোপন শব্দ" value={recIn} onChange={e=>setRecIn(e.target.value)} style={{ width:"100%", maxWidth:320, padding:22, borderRadius:22, marginTop:35, background:TH.bgCard, border:`2px solid ${TH.border}`, color:TH.text, textAlign:"center", fontWeight:800 }} /><button onClick={()=>{ if(recIn.toLowerCase() === settings.recoveryWord?.toLowerCase()){ setSettings({...settings, pinLock:""}); onSuccess(); } else showToast("ভুল শব্দ!"); }} style={{ width:"100%", maxWidth:320, padding:22, background:"#f59e0b", color:"#fff", border:"none", borderRadius:22, fontWeight:900, marginTop:25 }}>Unlock</button></div>);
  return (<div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: TH.bg }}><Lock size={65} color="#8b5cf6"/><div style={{ display: "flex", gap: 25, margin: "50px 0" }}>{[1,2,3,4].map(i => <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: input.length >= i ? "#8b5cf6" : TH.border, boxShadow: input.length >= i ? "0 0 15px #8b5cf6" : "none" }} />)}</div><div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 25 }}>{[1,2,3,4,5,6,7,8,9, "C", 0, "×"].map(k => (<button key={k} onClick={() => { if(k==="C") setInput(""); else if(k==="×") setInput(input.slice(0,-1)); else handleKey(k.toString()); }} style={{ width: 85, height: 85, borderRadius: "50%", background: TH.bgCard, border: `1px solid ${TH.border}`, color: TH.text, fontSize: 30, fontWeight: 900 }}>{k}</button>))}</div><button onClick={()=>setIsForgot(true)} style={{ marginTop: 50, color: "#8b5cf6", background: "none", border: "none", fontWeight: 800 }}>পিন ভুলে গেছেন?</button></div>);
}

function SettingsModal({ settings, setSettings, data, setData, onClose, TH, showToast, AUTHOR, getCategories }) {
  const [newCat, setNewCat] = useState({ type: "expense", name: "", icon: "📦" });
  const handleBackup = () => { const blob = new Blob([JSON.stringify({data, settings})], {type: "application/json"}); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `NaFinance_Backup.json`; link.click(); showToast("ব্যাকআপ সফল", "success"); };
  const handleRestore = (e) => { const reader = new FileReader(); reader.onload = (ev) => { try { const p = JSON.parse(ev.target.result); if(p.data) setData(p.data); if(p.settings) setSettings(p.settings); showToast("রিস্টোর সফল!", "success"); } catch(err) { showToast("ভুল ফাইল!"); } }; reader.readAsText(e.target.files[0]); };
  
  // 🚀 নতুন ক্যাটাগরি যোগ করার ফাংশন
  const addCategory = () => {
    if(!newCat.name) return showToast("নাম দিন");
    const n = { id: genId(), label: { bn: newCat.name, en: newCat.name }, icon: newCat.icon, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" };
    setData({ ...data, customCategories: { ...data.customCategories, [newCat.type]: [...(data.customCategories[newCat.type] || []), n] } });
    setNewCat({ ...newCat, name: "" }); showToast("ক্যাটাগরি যুক্ত হয়েছে", "success");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 2000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: TH.bgCard, padding: "40px 30px 60px", borderRadius: "55px 55px 0 0", width: "100%", maxWidth: 480, maxHeight: "94vh", overflowY: "auto", borderTop:`1px solid ${TH.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 35 }}><h2 style={{ fontWeight: 900 }}>সেটিংস</h2><button onClick={onClose} style={{ background: "none", border: "none", color: TH.textMid }}><X size={32}/></button></div>
        
        {/* 🚀 নতুন ক্যাটাগরি বানানোর ফরম */}
        <div style={{ padding:25, background:TH.bgInner, borderRadius:30, marginBottom:25 }}>
           <p style={{ fontWeight:800, marginBottom:15, color:"#8b5cf6" }}>নতুন ক্যাটাগরি তৈরি করুন</p>
           <div style={{ display:"flex", gap:10, marginBottom:10 }}>
              <select value={newCat.type} onChange={e=>setNewCat({...newCat, type:e.target.value})} style={{ padding:12, borderRadius:12, background:TH.bgCard, color:TH.text, border:"none" }}>
                 <option value="expense">ব্যয়</option><option value="income">আয়</option>
              </select>
              <input type="text" placeholder="আইকন (উদা: 🎓)" value={newCat.icon} onChange={e=>setNewCat({...newCat, icon:e.target.value})} style={{ width:60, padding:12, borderRadius:12, background:TH.bgCard, color:TH.text, border:"none", textAlign:"center" }} />
           </div>
           <input type="text" placeholder="ক্যাটাগরির নাম" value={newCat.name} onChange={e=>setNewCat({...newCat, name:e.target.value})} style={{ width:"100%", padding:15, borderRadius:15, background:TH.bgCard, color:TH.text, border:"none", marginBottom:15 }} />
           <button onClick={addCategory} style={{ width:"100%", padding:15, background:"#8b5cf6", color:"#fff", border:"none", borderRadius:15, fontWeight:900 }}>Add Category</button>
        </div>

        <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))", padding: 28, borderRadius: 35, marginBottom: 30 }}><p style={{ fontSize: 11, fontWeight: 800, color: "#8b5cf6", marginBottom: 15 }}>Developer</p><div style={{ display:"flex", alignItems:"center", gap:18 }}><div style={{ width:60, height:60, background:"#8b5cf6", borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}><Code size={30}/></div><div><h3 style={{ fontWeight: 900 }}>{AUTHOR}</h3><p style={{ fontSize: 13, color: TH.textMid }}>mushfiqurnafi@gmail.com</p></div></div></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 15 }}><button onClick={handleBackup} style={{ padding: 20, borderRadius: 22, background: TH.bgInner, color: TH.text, fontWeight: 800 }}>Backup</button><label style={{ padding: 20, borderRadius: 22, background: TH.bgInner, color: TH.text, fontWeight: 800, textAlign:"center" }}>Restore <input type="file" style={{display:"none"}} onChange={handleRestore}/></label></div>
        <div style={{ display: "flex", flexDirection:"column", gap:14, marginBottom:30 }}><select value={settings.lang} onChange={e=>setSettings({...settings, lang: e.target.value})} style={{ width: "100%", padding: 22, borderRadius: 22, background: TH.bgInner, color: TH.text, fontWeight: 800 }}><option value="bn">বাংলা</option><option value="en">English</option></select></div>
        <button onClick={()=>{ if(window.confirm("মুছে যাবে?")) { localStorage.clear(); window.location.reload(); } }} style={{ width: "100%", padding: 22, background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "none", borderRadius: 25, fontWeight: 900 }}>Reset App</button>
      </div>
    </div>
  );
}

function NavBtn({ active, icon: Icon, label, onClick, TH }) {
  return (<button onClick={onClick} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}><div style={{ padding: "12px 24px", borderRadius: 22, background: active ? "rgba(139,92,246,0.15)" : "transparent" }}><Icon size={26} color={active ? "#8b5cf6" : TH.textMid} strokeWidth={active ? 2.5 : 2}/></div><span style={{ fontSize: 10, fontWeight: 800, color: active ? "#8b5cf6" : TH.textMid }}>{label}</span></button>);
}
