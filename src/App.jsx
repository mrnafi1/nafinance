import { useState, useEffect, useMemo, useRef } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, Legend } from "recharts";
import { Plus, Trash2,MessageCircle, Home, BarChart2, Settings, Users, X, Download, Eye, EyeOff, Search, AlertTriangle, Landmark, Wallet, Lock, Sun, Moon, KeyRound, Edit3, Check, FileText, Edit, ArrowRightLeft, TrendingUp, TrendingDown, Activity, Mail, LogOut, DownloadCloud, Zap, Hash, Paperclip, Loader2, Image as ImageIcon } from "lucide-react";
import TxModal from './components/TxModal';
import SettingsModal from './components/SettingsModal';
// 🔥 Firebase Imports
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AUTHOR = "Mushfiqur Rahman Nafi";
const APP_NAME = "NaFinance";

// 🚀 Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlW5Dbs5NTeNtJpsdIYPv5bgva0O2q6jg",
  authDomain: "nafinance-7e236.firebaseapp.com",
  projectId: "nafinance-7e236",
  storageBucket: "nafinance-7e236.firebasestorage.app",
  messagingSenderId: "153707489931",
  appId: "1:153707489931:web:0a8fcf471235a77936828e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// 🚀 Premium Navy & Gold UI Animations
const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Hind+Siliguri:wght@400;600;700&display=swap'); 
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif; -webkit-font-smoothing: antialiased; } 
  body { font-size: 16px; overscroll-behavior-y: none; background: #0B1121; } 
  input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; } 
  input[type=number] { -moz-appearance: textfield; }
  
  @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideDownFade { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulseGlow { 0% { box-shadow: 0 0 15px rgba(251,191,36,0.3); } 100% { box-shadow: 0 0 30px rgba(251,191,36,0.6); } }
  @keyframes spin { 100% { transform: rotate(360deg); } }
  .animate-spin { animation: spin 1s linear infinite; }
  
  .animate-slide { animation: slideUpFade 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
  .animate-slide-down { animation: slideDownFade 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
  .animate-scale { animation: scaleIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
  .animate-fade { animation: fadeIn 0.2s ease forwards; }
  
  button { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
  button:active { transform: scale(0.94); }
  .tx-card { transition: all 0.2s ease; }
  .tx-card:active { transform: scale(0.97); background: rgba(255,255,255,0.03) !important; }

  .glass-header { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
  
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.3); border-radius: 10px; }
`;

const BASE_CATEGORIES = {
  expense: [
    { id: "food", label: { bn: "খাবার", en: "Food" }, icon: "🍔", color: "#f97316", bg: "rgba(249,115,22,0.15)" },
    { id: "transport", label: { bn: "যাতায়াত", en: "Transport" }, icon: "🚌", color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
    { id: "rent", label: { bn: "ভাড়া", en: "Rent" }, icon: "🏠", color: "#a855f7", bg: "rgba(168,85,247,0.15)" },
    { id: "shopping", label: { bn: "কেনাকাটা", en: "Shopping" }, icon: "🛒", color: "#ec4899", bg: "rgba(236,72,153,0.15)" },
    { id: "other_ex", label: { bn: "অন্যান্য", en: "Other" }, icon: "📝", color: "#64748b", bg: "rgba(100,116,139,0.15)" },
  ],
  income: [
    { id: "freelance", label: { bn: "ফ্রিল্যান্স", en: "Freelance" }, icon: "💻", color: "#10b981", bg: "rgba(16,185,129,0.15)" },
    { id: "salary", label: { bn: "বেতন", en: "Salary" }, icon: "💰", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
    { id: "other_in", label: { bn: "অন্যান্য", en: "Other" }, icon: "🎁", color: "#64748b", bg: "rgba(100,116,139,0.15)" },
  ],
};

const CURRENCIES = [
  { code: "BDT", sym: "৳", loc: "bn-BD" }, 
  { code: "USD", sym: "$", loc: "en-US" }, 
  { code: "GBP", sym: "£", loc: "en-GB" }, 
  { code: "EUR", sym: "€", loc: "de-DE" }
];

const TODAY = () => new Date().toISOString().split("T")[0];
const genId = () => Math.random().toString(36).substring(2, 11);

const fmtMoney = (n, curr, lang) => {
  const c = CURRENCIES.find(x => x.code === curr) || CURRENCIES[0];
  return new Intl.NumberFormat(lang === "bn" ? "bn-BD" : c.loc, { style: "currency", currency: c.code, minimumFractionDigits: 0 }).format(n || 0);
};

const formatDate = (isoDate) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
};

const DEFAULT_DATA = { 
  txs: [], wallets: [{ id: "w1", name: "Cash", balance: 0, icon: "💵" }, { id: "w2", name: "Bank", balance: 0, icon: "🏦" }], 
  debts: [], goals: [], budgets: {}, savings: { balance: 0, history: [] }, customCategories: { expense: [], income: [] }, dismissedAlerts: [], recurring: [], templates: [] 
};

const DEFAULT_SETTINGS = { lang: "bn", curr: "BDT", theme: "dark", hideBalance: false, pinLock: "", recoveryWord: "" };

export default function App() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [editTxData, setEditTxData] = useState(null); 
  const [toastMsg, setToastMsg] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, msg: "", onConfirm: null });
  const appRef = useRef(null);

  const showToast = (msg, type="error") => { setToastMsg({ msg, type }); setTimeout(() => setToastMsg(null), 2500); };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    }
  };

      const onLogout = async () => {
    try {
      await auth.signOut();
      setFirebaseUser(null);
      setModal(null); // মডাল বন্ধ করার জন্য
      showToast(settings.lang === 'bn' ? "লগআউট সফল!" : "Logged out!", "success");
    } catch (error) {
      showToast("Error logging out", "error");
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const dbData = docSnap.data();
            if (dbData.data) setData({ ...DEFAULT_DATA, ...dbData.data });
            if (dbData.settings) {
              const mergedSet = { ...DEFAULT_SETTINGS, ...dbData.settings };
              setSettings(mergedSet);
              setIsAuthenticated(!mergedSet.pinLock);
            }
          } else {
            setIsAuthenticated(true);
          }
        } catch(err) { console.error("Firebase Read Error:", err); }
        setIsDbLoaded(true);
      } else {
        setIsDbLoaded(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (firebaseUser && isDbLoaded) {
      setDoc(doc(db, "users", firebaseUser.uid), { data, settings }).catch(e => console.error("Firebase Sync Error:", e));
    }
  }, [data, settings, firebaseUser, isDbLoaded]);

  useEffect(() => {
    if(!isDbLoaded || !data.recurring || data.recurring.length === 0) return;
    let updated = false; let newTxs = [...data.txs]; let newWs = [...data.wallets];
    const newRec = data.recurring.map(r => {
      if (r.nextDate <= TODAY()) {
        const wIdx = newWs.findIndex(w => w.id === r.walletId);
        if (wIdx > -1) { newWs[wIdx].balance += (r.type === 'income' ? r.amount : -r.amount); newTxs.push({ id: genId(), type: r.type, date: r.nextDate, amount: r.amount, category: r.category, walletId: r.walletId, note: `[Auto] ${r.note}`, tags: [] }); updated = true; }
        const nextMonth = new Date(r.nextDate); nextMonth.setMonth(nextMonth.getMonth() + 1); return { ...r, nextDate: nextMonth.toISOString().split("T")[0] };
      } return r;
    });
    if (updated) { setData({ ...data, txs: newTxs, wallets: newWs, recurring: newRec }); showToast(settings.lang==='bn'?"স্বয়ংক্রিয় পেমেন্ট যোগ হয়েছে!":"Auto-payments added!", "success"); }
  }, [isDbLoaded]);

  const isDark = settings.theme === "dark";
  const TH = isDark 
    ? { bg: "#0B1121", bgCard: "#151F32", bgInner: "#1E2A45", border: "rgba(255,255,255,0.05)", text: "#F8FAFC", textMid: "#94A3B8", primary: "#FBBF24", primaryBg: "rgba(251,191,36,0.15)", glow: "rgba(251,191,36,0.25)" } 
    : { bg: "#F3F4F6", bgCard: "#FFFFFF", bgInner: "#F9FAFB", border: "rgba(0,0,0,0.06)", text: "#111827", textMid: "#6B7280", primary: "#D97706", primaryBg: "rgba(217,119,6,0.15)", glow: "rgba(217,119,6,0.2)" };
  
  const fmt = n => settings.hideBalance ? "••••" : fmtMoney(n, settings.curr, settings.lang);
  const getCategories = (type) => [...BASE_CATEGORIES[type], ...(data.customCategories?.[type] || [])];

  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (err) { showToast("Login failed!", "error"); }
  };

  const handleLogout = () => {
    auth.signOut();
    setData(DEFAULT_DATA);
    setSettings(DEFAULT_SETTINGS);
    setModal(null);
  };

  const saveTx = (tx, oldTx = null, isRecurring = false, saveAsTemplate = false) => {
    let ws = [...data.wallets];
    if (oldTx) { ws = ws.map(w => w.id === oldTx.walletId ? { ...w, balance: oldTx.type === "income" ? w.balance - oldTx.amount : w.balance + oldTx.amount } : w); }
    const isInc = tx.type === "income"; const targetW = ws.find(w => w.id === tx.walletId);
    if (!targetW) { showToast("Wallet error", "error"); return false; }
    if (!isInc && targetW.balance < tx.amount) { showToast(settings.lang==='bn'?"ব্যালেন্স নেই!":"Insufficient Balance", "error"); return false; }
    ws = ws.map(w => w.id === tx.walletId ? { ...w, balance: isInc ? w.balance + tx.amount : w.balance - tx.amount } : w);
    
    let newRecs = [...(data.recurring || [])];
    if(isRecurring && !oldTx) { const d = new Date(tx.date); d.setMonth(d.getMonth() + 1); newRecs.push({ ...tx, nextDate: d.toISOString().split("T")[0] }); }
    
    let newTemplates = [...(data.templates || [])];
    if(saveAsTemplate && !oldTx) {
       newTemplates.push({ id: genId(), type: tx.type, amount: tx.amount, category: tx.category, walletId: tx.walletId, note: tx.note || "Template", tags: tx.tags || [] });
    }

    setData({ ...data, txs: oldTx ? data.txs.map(t => t.id === oldTx.id ? tx : t) : [tx, ...data.txs], wallets: ws, recurring: newRecs, templates: newTemplates });
    showToast(settings.lang==='bn'?"সফল!":"Success!", "success"); return true;
  };

  const deleteTx = tx => {
    setConfirmDialog({ show: true, msg: settings.lang==='bn'?"মুছতে চান?":"Delete transaction?", onConfirm: () => {
        const ws = data.wallets.map(w => w.id === tx.walletId ? { ...w, balance: tx.type === "income" ? w.balance - tx.amount : w.balance + tx.amount } : w);
        setData({ ...data, txs: data.txs.filter(x => x.id !== tx.id), wallets: ws }); showToast(settings.lang==='bn'?"মুছে ফেলা হয়েছে":"Deleted", "success"); }
    });
  };

  const deleteTemplate = id => {
     setData({ ...data, templates: data.templates.filter(t => t.id !== id) });
     showToast("Template Removed", "success");
  };

  if (authLoading) return <LoadingScreen TH={TH} />;
  if (!firebaseUser) return <AuthScreen TH={TH} onLogin={handleLogin} />;
  if (!isAuthenticated && settings.pinLock) return <PinScreen settings={settings} setSettings={setSettings} onSuccess={() => setIsAuthenticated(true)} TH={TH} showToast={showToast} onLogout={handleLogout} />;

  return (
    <div ref={appRef} style={{ minHeight: "100vh", background: TH.bg, color: TH.text, position: "relative" }}>
      <style>{FONT_STYLE}</style>
      
      {showInstallPrompt && (
        <div className="animate-slide-down" style={{ position: "fixed", top: 15, left: "50%", transform: "translateX(-50%)", width: "90%", maxWidth: 440, background: TH.bgCard, padding: "16px 20px", borderRadius: 20, zIndex: 7000, display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${TH.primary}`, boxShadow: `0 15px 40px rgba(0,0,0,0.6)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, background: TH.primary, borderRadius: 12, display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontWeight:900, fontSize: 20 }}>N</div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15, color: TH.text, marginBottom: 2 }}>Install NaFinance</p>
              <p style={{ fontSize: 11, color: TH.textMid, fontWeight: 600 }}>Get the full app experience</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={handleInstallApp} style={{ background: TH.primary, color: "#000", border: "none", padding: "10px 18px", borderRadius: 12, fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><DownloadCloud size={16}/> Install</button>
            <button onClick={() => setShowInstallPrompt(false)} style={{ background: "none", border: "none", color: TH.textMid }}><X size={20}/></button>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="animate-scale" style={{ position: "fixed", top: showInstallPrompt ? 90 : 30, left: "50%", transform: "translateX(-50%)", background: TH.bgCard, color: TH.text, padding: "14px 24px", borderRadius: 30, boxShadow: `0 10px 30px rgba(0,0,0,0.5)`, zIndex: 5000, display: "flex", alignItems: "center", gap: 12, fontWeight: 700, fontSize: 14, border: `1px solid ${toastMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: toastMsg.type === 'success' ? '#10b981' : '#ef4444', boxShadow: `0 0 10px ${toastMsg.type === 'success' ? '#10b981' : '#ef4444'}` }} /> {toastMsg.msg}
        </div>
      )}

      {confirmDialog.show && (
        <div className="animate-fade" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter:"blur(8px)", zIndex: 6000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="animate-scale" style={{ background: TH.bgCard, padding: 35, borderRadius: 30, width: "100%", maxWidth: 320, textAlign: "center", border: `1px solid ${TH.border}`, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
             <AlertTriangle size={40} color="#ef4444" style={{margin:"0 auto 15px"}}/>
             <h3 style={{fontWeight:700, marginBottom:25, fontSize:17}}>{confirmDialog.msg}</h3>
             <div style={{display:"flex", gap:12}}>
               <button onClick={()=>{ confirmDialog.onConfirm(); setConfirmDialog({show:false, msg:"", onConfirm:null}); }} style={{flex:1, padding:14, background:"#ef4444", color:"#fff", borderRadius:16, border:"none", fontWeight:800}}>Yes</button>
               <button onClick={()=>setConfirmDialog({show:false, msg:"", onConfirm:null})} style={{flex:1, padding:14, background:TH.bgInner, color:TH.text, borderRadius:16, border:"none", fontWeight:800}}>No</button>
             </div>
          </div>
        </div>
      )}
      
      <header className="glass-header" style={{ position: "sticky", top: 0, zIndex: 50, background: isDark ? "rgba(11,17,33,0.8)" : "rgba(243,244,246,0.8)", borderBottom: `1px solid ${TH.border}`, padding: "16px 20px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {firebaseUser?.photoURL ? (
              <img src={firebaseUser.photoURL} alt="Profile" style={{ width: 40, height: 40, borderRadius: 12, border: `2px solid ${TH.primary}`, boxShadow: `0 5px 15px ${TH.glow}`, objectFit: "cover" }} />
            ) : (
              <div style={{ width: 40, height: 40, background: TH.primary, borderRadius: 12, display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontWeight:900, fontSize: 18, boxShadow: `0 5px 15px ${TH.glow}` }}>{firebaseUser?.displayName?.charAt(0) || "N"}</div>
            )}
            <span style={{ fontWeight: 800, fontSize: 20, color: TH.primary, letterSpacing: "0.5px" }}>{APP_NAME}</span>
          </div>
          <button onClick={() => setModal("settings")} style={{ padding: 10, background: TH.bgInner, border: `1px solid ${TH.border}`, borderRadius: 14, color: TH.textMid }}><Settings size={20}/></button>
        </div>
      </header>

      <main className="animate-slide" style={{ maxWidth: 480, margin: "0 auto", padding: "15px 20px 140px" }}>
        {tab === "home" && <HomeView data={data} setData={setData} fmt={fmt} TH={TH} settings={settings} setSettings={setSettings} getCategories={getCategories} deleteTx={deleteTx} setEditTxData={setEditTxData} setModal={setModal} setConfirmDialog={setConfirmDialog} deleteTemplate={deleteTemplate} saveTx={saveTx} />}
        {tab === "assets" && <AssetsView data={data} setData={setData} fmt={fmt} TH={TH} showToast={showToast} settings={settings} setConfirmDialog={setConfirmDialog} />}
        {tab === "planning" && <PlanningView data={data} setData={setData} fmt={fmt} TH={TH} settings={settings} getCategories={getCategories} showToast={showToast} setConfirmDialog={setConfirmDialog} />}
        {tab === "graphs" && <GraphsView data={data} fmt={fmt} TH={TH} lang={settings.lang} getCategories={getCategories} />}
      </main>

      <div style={{ position: "fixed", bottom: 25, left: 0, right: 0, zIndex: 100, pointerEvents: "none" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px", position: "relative" }}>
          <nav style={{ background: isDark ? "rgba(21, 31, 50, 0.95)" : "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", border: `1px solid ${TH.border}`, borderRadius: 35, padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems:"center", pointerEvents: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", gap: 5, flex: 1, justifyContent: "space-around" }}>
              <NavBtn active={tab==="home"} icon={Home} label={settings.lang==='bn'?'হোম':'HOME'} onClick={()=>setTab("home")} TH={TH}/>
              <NavBtn active={tab==="assets"} icon={Wallet} label={settings.lang==='bn'?'ওয়ালেট':'WALLET'} onClick={()=>setTab("assets")} TH={TH}/>
            </div>
            
            <div style={{ width: 75 }}></div> 
            
            <div style={{ display: "flex", gap: 5, flex: 1, justifyContent: "space-around" }}>
              <NavBtn active={tab==="planning"} icon={Landmark} label={settings.lang==='bn'?'প্ল্যান':'PLAN'} onClick={()=>setTab("planning")} TH={TH}/>
              <NavBtn active={tab==="graphs"} icon={BarChart2} label={settings.lang==='bn'?'বিশ্লেষণ':'GRAPHS'} onClick={()=>setTab("graphs")} TH={TH}/>
            </div>
          </nav>
          <button onClick={() => { setEditTxData(null); setModal("tx"); }} style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 20, width: 64, height: 64, background: TH.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 25px ${TH.glow}`, border: `5px solid ${TH.bg}`, color: "#000", pointerEvents: "auto" }}>
            <Plus size={32} strokeWidth={2.5}/>
          </button>
        </div>
      </div>


      {modal === "tx" && <TxModal data={data} saveTx={saveTx} deleteTx={deleteTx} onClose={()=>setModal(null)} TH={TH} editData={editTxData} getCategories={getCategories} lang={settings.lang} showToast={showToast} firebaseUser={firebaseUser} storage={storage} />}
  {modal === "settings" && (<SettingsModal settings={settings} setSettings={setSettings} data={data} setData={setData} onClose={() => setModal(null)} TH={TH} showToast={showToast} AUTHOR={AUTHOR}
    setConfirmDialog={setConfirmDialog} onLogout={onLogout} genId={genId} CURRENCIES={CURRENCIES} /> )}
    </div>
  );
}

// 🛡️ Loading Screen
function LoadingScreen({ TH }) {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: TH.bg }}>
      <style>{FONT_STYLE}</style>
      <div style={{ width: 64, height: 64, background: TH.primary, borderRadius: 20, display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontWeight:900, fontSize: 28, animation: "pulseGlow 1s infinite alternate" }}>N</div>
      <p style={{ marginTop: 25, color: TH.textMid, fontWeight: 700, fontSize: 14 }}>Connecting securely...</p>
    </div>
  );
}

// 🛡️ Login Screen
function AuthScreen({ TH, onLogin }) {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: TH.bg, padding: 20 }}>
      <style>{FONT_STYLE}</style>
      <div className="animate-scale" style={{ padding: 40, background: TH.bgCard, borderRadius: 32, border: `1px solid ${TH.border}`, textAlign: "center", boxShadow: `0 20px 50px rgba(0,0,0,0.5)`, width: "100%", maxWidth: 360 }}>
        <div style={{ width: 64, height: 64, background: TH.primary, borderRadius: 20, display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontWeight:900, fontSize: 28, margin: "0 auto 20px", boxShadow: `0 10px 25px ${TH.glow}` }}>N</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: TH.primary, marginBottom: 10 }}>NaFinance</h2>
        <p style={{ color: TH.textMid, fontSize: 14, fontWeight: 600, marginBottom: 35 }}>Premium Wealth Management</p>
        <button onClick={onLogin} style={{ width: "100%", padding: 18, background: "#fff", color: "#000", borderRadius: 16, border: "none", fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 10px 25px rgba(255,255,255,0.1)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.86C4.01 20.64 7.69 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.86z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.69 1 4.01 3.36 2.18 7.05l3.66 2.86c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

function HomeView({ data, setData, fmt, TH, settings, setSettings, getCategories, deleteTx, setEditTxData, setModal, setConfirmDialog, deleteTemplate, saveTx }) {
  const [search, setSearch] = useState(""); const [filterCat, setFilterCat] = useState("all"); const [dateRange, setDateRange] = useState("month"); 
  const total = data.wallets.reduce((s, w) => s + w.balance, 0); const currentMonth = TODAY().slice(0,7);
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
    const cat = getCategories(tx.type).find(c => c.id === tx.category); const s = search.toLowerCase();
    const matchFilter = filterCat === "all" || tx.category === filterCat;
    const tagMatch = tx.tags?.some(tag => tag.toLowerCase().includes(s));
    const matchSearch = !s || tx.note?.toLowerCase().includes(s) || cat?.label?.bn?.includes(s) || cat?.label?.en?.toLowerCase().includes(s) || tagMatch;
    return matchFilter && matchSearch;
  });

  const exportCSV = () => {
    const headers = "Date,Type,Category,Amount,Note,Tags,Receipt\n";
    const rows = data.txs.map(t => { const cat = getCategories(t.type).find(c => c.id === t.category); return `${formatDate(t.date)},${t.type},${cat ? cat.label.en : t.category},${t.amount},"${t.note||''}","${t.tags?t.tags.join(' '):''}","${t.imageUrl||''}"`; }).join("\n");
    const blob = new Blob([headers + rows], {type: "text/csv;charset=utf-8;"}); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `NaFinance_${TODAY()}.csv`; link.click();
  };

  const exportPDF = () => {
    const win = window.open('', '', 'height=800,width=1000');
    let html = `<html lang="en"><head><title>NaFinance Report</title><style> body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #333; } h2 { text-align: center; color: #8b5cf6; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th, td { border: 1px solid #ddd; padding: 12px; text-align: left; } th { background-color: #8b5cf6; color: white; } .inc { color: #10b981; } .exp { color: #ef4444; } </style></head><body><h2>NaFinance - Statement</h2><p style="text-align:center">Date: ${formatDate(TODAY())}</p><table><tr><th>Date</th><th>Category</th><th>Wallet</th><th>Note</th><th>Type</th><th>Amount</th></tr>`;
    data.txs.forEach(tx => { const cat = getCategories(tx.type).find(c => c.id === tx.category) || {label:{en:'Other'}}; const w = data.wallets.find(w => w.id === tx.walletId) || {name: 'Unknown'}; html += `<tr><td>${formatDate(tx.date)}</td><td>${cat.label.en}</td><td>${w.name}</td><td>${tx.note || '-'} ${tx.tags?.length ? `(${tx.tags.join(', ')})` : ''}</td><td class="${tx.type === 'income' ? 'inc' : 'exp'}">${tx.type.toUpperCase()}</td><td class="${tx.type === 'income' ? 'inc' : 'exp'}">${fmtMoney(tx.amount, settings.curr, 'en')}</td></tr>`; });
    html += `</table></body></html>`; win.document.write(html); win.document.close(); setTimeout(() => win.print(), 800); 
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {overdueDebts.map(d => (<div key={`od-${d.id}`} className="animate-scale" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", padding: "14px 18px", borderRadius: 20, display: "flex", alignItems: "center", gap: 12, color: "#ef4444" }}><AlertTriangle size={18}/> <span style={{fontSize:13, fontWeight:700}}>{settings.lang==='bn'?'ওভারডিউ ধার:':'Overdue Debt:'} {d.person} ({fmt(d.amount)})</span></div>))}
      {activeAlerts.map(cat => (<div key={cat.id} className="animate-scale" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", padding: "14px 18px", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}><div style={{display:"flex", alignItems:"center", gap: 12}}><AlertTriangle size={18} color="#f59e0b"/> <span style={{fontSize:13, fontWeight:700, color:TH.text}}>{cat.icon} {cat.label[settings.lang] || cat.label['en']} {settings.lang==='bn'?'বাজেট ৮০% শেষ!':'80% budget used!'}</span></div><button onClick={() => setData({ ...data, dismissedAlerts: [...(data.dismissedAlerts || []), cat.id] })} style={{background:"none", border:"none", color: TH.textMid}}><X size={18}/></button></div>))}
      
      <div style={{ padding: "28px 24px", borderRadius: 28, background: TH.bgCard, border: `1px solid ${TH.border}`, position: "relative", overflow: "hidden", boxShadow: `0 15px 40px rgba(0,0,0,0.2)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 12, color: TH.textMid, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>{settings.lang==='bn'?'মোট ব্যালেন্স':'Total Balance'}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <h2 style={{ fontSize: 44, fontWeight: 900, color: TH.primary, letterSpacing: "-1px" }}>{fmt(total)}</h2>
            </div>
          </div>
          <button onClick={()=>setSettings({...settings, hideBalance: !settings.hideBalance})} style={{ padding: 12, background: TH.bgInner, border: `1px solid ${TH.border}`, borderRadius: 14, color: TH.textMid }}>
            {settings.hideBalance ? <Eye size={20}/> : <EyeOff size={20}/>}
          </button>
        </div>

        <div style={{ display: "flex", gap: 15, marginTop: 35 }}>
          <div style={{ flex: 1 }}>
             <p style={{ fontSize: 11, color: TH.textMid, fontWeight: 600, display:"flex", alignItems:"center", gap:6 }}><TrendingUp size={14} color="#10b981"/> {settings.lang==='bn'?'আয়':'INCOME'}</p>
             <p style={{ fontSize: 16, fontWeight: 700, color: "#10b981", marginTop: 4 }}>{fmt(monthlyInc)}</p>
          </div>
          <div style={{ flex: 1, borderLeft: `1px solid ${TH.border}`, paddingLeft: 15 }}>
             <p style={{ fontSize: 11, color: TH.textMid, fontWeight: 600, display:"flex", alignItems:"center", gap:6 }}><TrendingDown size={14} color="#ef4444"/> {settings.lang==='bn'?'ব্যয়':'EXPENSE'}</p>
             <p style={{ fontSize: 16, fontWeight: 700, color: "#ef4444", marginTop: 4 }}>{fmt(monthlyExp)}</p>
          </div>
          <div style={{ flex: 1, borderLeft: `1px solid ${TH.border}`, paddingLeft: 15 }}>
             <p style={{ fontSize: 11, color: TH.textMid, fontWeight: 600, display:"flex", alignItems:"center", gap:6 }}><Activity size={14} color="#3b82f6"/> {settings.lang==='bn'?'সঞ্চয়':'SAVINGS'}</p>
             <p style={{ fontSize: 16, fontWeight: 700, color: "#3b82f6", marginTop: 4 }}>{fmt(monthlySav)}</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={exportCSV} style={{ flex:1, padding:"14px", borderRadius:18, background:TH.bgCard, color:TH.text, fontWeight:700, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8, border:`1px solid rgba(16,185,129,0.3)`, boxShadow: "0 4px 15px rgba(16,185,129,0.05)" }}><Download size={18} color="#10b981"/> CSV</button>
        <button onClick={exportPDF} style={{ flex:1, padding:"14px", borderRadius:18, background:TH.bgCard, color:TH.text, fontWeight:700, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8, border:`1px solid rgba(239,68,68,0.3)`, boxShadow: "0 4px 15px rgba(239,68,68,0.05)" }}><FileText size={18} color="#ef4444"/> PDF</button>
        <select value={dateRange} onChange={e=>setDateRange(e.target.value)} style={{ padding: "0 14px", borderRadius: 18, background: TH.bgCard, border:`1px solid ${TH.border}`, color: TH.textMid, fontWeight: 700, fontSize:14, outline:"none", flex:1.2 }}>
          <option value="all">{settings.lang==='bn'?'সব সময়':'All Time'}</option>
          <option value="month">{settings.lang==='bn'?'এই মাস':'This Month'}</option>
          <option value="week">{settings.lang==='bn'?'গত ৭ দিন':'Last 7 Days'}</option>
        </select>
      </div>

      {data.templates && data.templates.length > 0 && (
         <div>
           <p style={{ fontSize: 12, color: TH.textMid, fontWeight: 700, textTransform: "uppercase", marginBottom: 10, display:"flex", alignItems:"center", gap:5 }}><Zap size={14} color={TH.primary}/> {settings.lang==='bn'?'কুইক অ্যাড':'Quick Add'}</p>
           <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 5 }}>
             {data.templates.map(tmp => {
                const cat = getCategories(tmp.type).find(c => c.id === tmp.category) || {icon:"📝"};
                return (
                  <div key={tmp.id} className="animate-scale" style={{ flexShrink: 0, display:"flex", alignItems:"center", background: TH.bgCard, border: `1px solid ${TH.border}`, borderRadius: 16, padding: "8px 12px", gap: 8 }}>
                    <button onClick={() => {
                        const defaultWalletId = data.wallets.find(w => w.id === tmp.walletId)?.id || (data.wallets.length > 0 ? data.wallets[0].id : "");
                        const newTx = { id: genId(), type: tmp.type, date: TODAY(), amount: tmp.amount, category: tmp.category, walletId: defaultWalletId, note: tmp.note, tags: tmp.tags || [], imageUrl: null };
                        saveTx(newTx, null, false, false);
                    }} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", color:TH.text, fontWeight:700, fontSize:13 }}>
                       <span style={{fontSize:16}}>{cat.icon}</span> {tmp.note} ({fmt(tmp.amount)})
                    </button>
                    <button onClick={()=>deleteTemplate(tmp.id)} style={{ background:"none", border:"none", color:TH.textMid, marginLeft: 5, padding:2 }}><X size={14}/></button>
                  </div>
                )
             })}
           </div>
         </div>
      )}
      
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10, background: TH.bgCard, padding: "14px 18px", borderRadius: 20, border: `1px solid ${TH.border}` }}>
          <Search size={18} color={TH.textMid} style={{ flexShrink: 0 }}/>
          <input type="text" placeholder={settings.lang==='bn'?'নোট বা #ট্যাগ খুঁজুন...':'Search notes or #tags...'} value={search} onChange={e=>setSearch(e.target.value)} style={{ background:"none", border:"none", color:TH.text, outline:"none", width:"100%", fontSize:15, fontWeight:600 }}/>
        </div>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ width: "115px", flexShrink: 0, padding: "0 14px", borderRadius: 20, background: TH.bgCard, border: `1px solid ${TH.border}`, color: TH.text, fontWeight: 700, outline:"none", fontSize:14, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
          <option value="all">All</option>
          {getCategories("expense").map(c => <option key={c.id} value={c.id}>{c.icon} {c.label[settings.lang] || c.label['en']}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredTxs.slice(0, 30).map(tx => {
          const cat = getCategories(tx.type).find(c => c.id === tx.category) || {icon:"📝", bg:"rgba(148,163,184,0.1)", label:{bn:"অন্যান্য", en:"Other"}};
          return (
            <div key={tx.id} className="tx-card" style={{ padding: "18px 20px", background: TH.bgCard, borderRadius: 24, border: `1px solid ${TH.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => { setEditTxData(tx); setModal("tx"); }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{cat.icon}</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 16, color: TH.text, marginBottom: 2, display:"flex", alignItems:"center", gap:6 }}>
                     {tx.note || cat.label[settings.lang] || cat.label['en']} 
                     {tx.imageUrl && <Paperclip size={14} color={TH.textMid} />}
                  </p>
                  <p style={{ fontSize: 12, color: TH.textMid, fontWeight:500, display:"flex", alignItems:"center", gap:6 }}>
                     {formatDate(tx.date)}
                     {tx.tags && tx.tags.length > 0 && (
                        <span style={{ color: TH.primary, fontWeight:700 }}>{tx.tags.map(t => `#${t}`).join(' ')}</span>
                     )}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <p style={{ fontWeight: 800, fontSize: 16, color: tx.type === "income" ? "#10b981" : TH.text }}>{tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}</p>
                <button onClick={(e) => { e.stopPropagation(); deleteTx(tx); }} style={{ background: "none", border: "none", color: "#ef4444", padding: "4px 0 4px 8px" }}><Trash2 size={18}/></button>
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
  const [transferForm, setTransferForm] = useState({ show: false, from: data.wallets[0]?.id || "", to: data.wallets.length > 1 ? data.wallets[1].id : "", amount: "", note: "" });
  
  const handleAddDebt = () => {
    const amt = Number(debtForm.amount); if(!debtForm.person || !amt) return showToast(settings.lang==='bn'?"সব তথ্য দিন":"Enter info", "error");
    let ws = [...data.wallets]; const tIdx = ws.findIndex(w => w.id === debtForm.sourceId);
    if (debtForm.type === "lend") { if (ws[tIdx].balance < amt) return showToast(settings.lang==='bn'?"টাকা নেই":"No cash", "error"); ws[tIdx].balance -= amt; } else { ws[tIdx].balance += amt; }
    const tx = { id: genId(), type: debtForm.type === 'lend' ? 'expense' : 'income', date: debtForm.date, amount: amt, category: debtForm.type === 'lend' ? 'other_ex' : 'other_in', walletId: debtForm.sourceId, note: `${debtForm.type==='lend'?'ধার:':'ঋণ:'} ${debtForm.person}`, tags:[] };
    setData({ ...data, wallets: ws, txs: [tx, ...data.txs], debts: [{...debtForm, id: genId(), amount: amt}, ...data.debts] });
   
    setDebtForm({ show: false, person: "", amount: "", type: "lend", date: TODAY(), returnDate: "", note: "", sourceId: "w1" }); showToast(settings.lang==='bn'?"সংরক্ষিত":"Saved", "success");
  };

  const handleWalletSave = () => {
    if(!walletForm.name || walletForm.balance === "") return showToast("Enter details", "error");
    const nw = { id: walletForm.id || genId(), name: walletForm.name, balance: Number(walletForm.balance), icon: walletForm.icon };
    setData({ ...data, wallets: walletForm.id ? data.wallets.map(w=>w.id===walletForm.id?nw:w) : [...data.wallets, nw] });
    setWalletForm({ show: false, name: "", balance: "", icon: "💳", id: null });
  };
 const sendReminder = (debt) => {
    const msg = settings.lang === 'bn' 
      ? `ভাই ${debt.person}, আপনার কাছে আমার ${debt.amount}৳ পাওয়া ছিল। সময় করে পাঠিয়ে দিলে খুব উপকার হতো। ধন্যবাদ!`
      : `Hey ${debt.person}, just a friendly reminder about the ${debt.amount} BDT. Please send it over when you can. Thanks!`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };
  const deleteWalletSafe = (w) => {
    if(data.wallets.length === 1) return showToast(settings.lang==='bn'?"কমপক্ষে ১টি ওয়ালেট থাকতে হবে":"Need 1 wallet minimum", "error");
    const hasTxs = data.txs.some(t => t.walletId === w.id);
    const hasDebts = data.debts.some(d => d.sourceId === w.id);
    if(hasTxs || hasDebts) return showToast(settings.lang==='bn'?"এই ওয়ালেটে লেনদেন বা ধার আছে!":"Wallet has active logs!", "error");
    setConfirmDialog({ show: true, msg: settings.lang==='bn'?"ওয়ালেটটি মুছতে চান?":"Delete Wallet?", onConfirm: () => { setData({...data, wallets: data.wallets.filter(x=>x.id!==w.id)}); showToast("Deleted", "success"); } });
  };

  const handleTransfer = () => {
    const amt = Number(transferForm.amount);
    if (!transferForm.from || !transferForm.to || !amt) return showToast(settings.lang==='bn'?"সব তথ্য দিন":"Enter info", "error");
    if (transferForm.from === transferForm.to) return showToast(settings.lang==='bn'?"একই ওয়ালেট সিলেক্ট করা হয়েছে":"Same wallet selected", "error");
    let ws = [...data.wallets]; const fromIdx = ws.findIndex(w => w.id === transferForm.from); const toIdx = ws.findIndex(w => w.id === transferForm.to);
    if (fromIdx === -1 || toIdx === -1) return showToast("Wallet error", "error");
    if (ws[fromIdx].balance < amt) return showToast(settings.lang==='bn'?"টাকা নেই":"Insufficient Balance", "error");
    ws[fromIdx].balance -= amt; ws[toIdx].balance += amt;
    const fromName = ws[fromIdx].name; const toName = ws[toIdx].name;
    const txOut = { id: genId(), type: 'expense', date: TODAY(), amount: amt, category: 'other_ex', walletId: transferForm.from, note: `Transfer to ${toName} ${transferForm.note ? `(${transferForm.note})` : ''}`, tags:[] };
    const txIn = { id: genId(), type: 'income', date: TODAY(), amount: amt, category: 'other_in', walletId: transferForm.to, note: `Transfer from ${fromName} ${transferForm.note ? `(${transferForm.note})` : ''}`, tags:[] };
    setData({ ...data, wallets: ws, txs: [txOut, txIn, ...data.txs] });
    setTransferForm({ ...transferForm, show: false, amount: "", note: "" }); showToast(settings.lang==='bn'?"ট্রান্সফার সফল!":"Transfer Success!", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h3 style={{ fontWeight: 700, fontSize:16, color: TH.textMid }}>{settings.lang==='bn'?'ওয়ালেট':'WALLETS'}</h3>
        <div style={{ display: "flex", gap: 8 }}>
           <button onClick={()=>setTransferForm({...transferForm, show:!transferForm.show})} style={{ padding: "8px 14px", borderRadius: 12, background: TH.bgCard, color: TH.text, border: `1px solid ${TH.border}`, fontWeight: 700, fontSize:13 }}><ArrowRightLeft size={14} style={{marginBottom:-2}}/> Transfer</button>
           <button onClick={()=>setWalletForm({...walletForm, show:true})} style={{ padding: "8px 14px", borderRadius: 12, background: TH.primary, color: "#000", border: "none", fontWeight: 800, fontSize:13 }}>+ Add</button>
        </div>
      </div>
      
      {transferForm.show && (
         <div className="animate-scale" style={{ padding: 20, background: TH.bgCard, borderRadius: 24, display: "flex", flexDirection: "column", gap: 12, border: "1px solid rgba(16,185,129,0.3)" }}>
           <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
             <select value={transferForm.from} onChange={e=>setTransferForm({...transferForm, from: e.target.value})} style={{ flex:1, padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:600, fontSize:14 }}>{data.wallets.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select>
             <span style={{fontSize: 16}}>➡️</span>
             <select value={transferForm.to} onChange={e=>setTransferForm({...transferForm, to: e.target.value})} style={{ flex:1, padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:600, fontSize:14 }}>{data.wallets.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select>
           </div>
           <input type="number" placeholder={settings.lang==='bn'?'টাকার পরিমাণ':'Amount'} value={transferForm.amount} onChange={e=>setTransferForm({...transferForm, amount: e.target.value})} style={{ padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:600, fontSize:14 }} />
           <input type="text" placeholder={settings.lang==='bn'?'নোট (ঐচ্ছিক)':'Note (Optional)'} value={transferForm.note} onChange={e=>setTransferForm({...transferForm, note: e.target.value})} style={{ padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:600, fontSize:14 }} />
           <button onClick={handleTransfer} style={{ padding: 14, background: "#10b981", color: "#fff", border: "none", borderRadius: 14, fontWeight: 800, fontSize: 14 }}>{settings.lang==='bn'?'ট্রান্সফার করুন':'Transfer Now'}</button>
         </div>
      )}

      {walletForm.show && (
         <div className="animate-scale" style={{ padding: 20, background: TH.bgCard, borderRadius: 24, display: "flex", flexDirection: "column", gap: 12, border: `1px solid ${TH.primary}` }}>
           <div style={{ display:"flex", gap:10 }}>
             <input type="text" placeholder="Icon" value={walletForm.icon} onChange={e=>setWalletForm({...walletForm, icon: e.target.value})} style={{ width:55, padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, textAlign:"center", outline:"none", fontSize:18 }} />
             <input type="text" placeholder="Wallet Name" value={walletForm.name} onChange={e=>setWalletForm({...walletForm, name: e.target.value})} style={{ flex:1, padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:600, fontSize:14 }} />
           </div>
           <input type="number" placeholder="Initial Balance" value={walletForm.balance} onChange={e=>setWalletForm({...walletForm, balance: e.target.value})} style={{ padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:600, fontSize:14 }} />
           <div style={{ display:"flex", gap:10 }}>
             <button onClick={handleWalletSave} style={{ flex:1, padding: 14, background: TH.primary, color: "#000", border: "none", borderRadius: 14, fontWeight: 800, fontSize:14 }}>Save</button>
             <button onClick={()=>setWalletForm({ show: false, name: "", balance: "", icon: "💳", id: null })} style={{ flex:1, padding: 14, background: TH.bgInner, color: TH.textMid, border: "none", borderRadius: 14, fontWeight: 800, fontSize:14 }}>Cancel</button>
           </div>
         </div>
      )}
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {data.wallets.map(w => (
          <div key={w.id} className="tx-card" style={{ padding: "20px", background: TH.bgCard, borderRadius: 24, border: `1px solid ${TH.border}`, position:"relative" }}>
            <div style={{ position:"absolute", top:14, right:14, display:"flex", gap:8 }}>
              <button onClick={()=>setWalletForm({show:true, ...w})} style={{background:"none", border:"none", color:TH.textMid}}><Edit size={16}/></button>
              <button onClick={()=>deleteWalletSafe(w)} style={{background:"none", border:"none", color:"#ef4444"}}><Trash2 size={16}/></button>
            </div>
            <span style={{ fontSize: 28 }}>{w.icon}</span>
            <p style={{ fontSize: 13, fontWeight: 600, color: TH.textMid, marginTop: 10 }}>{w.name}</p>
            <p style={{ fontSize: 18, fontWeight: 800, marginTop: 2, color: TH.text }}>{fmt(w.balance)}</p>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
        <h3 style={{ fontWeight: 700, fontSize:16, color: TH.textMid }}>{settings.lang==='bn'?'ধার-দেনা':'DEBTS'}</h3>
        <button onClick={()=>setDebtForm({...debtForm, show: !debtForm.show})} style={{ padding: "8px 14px", borderRadius: 12, background: TH.bgCard, color: TH.text, border: `1px solid ${TH.border}`, fontWeight: 700, fontSize:13 }}>+ {settings.lang==='bn'?'নতুন':'New'}</button>
      </div>
      
      {debtForm.show && (
          <div className="animate-scale" style={{ padding: 20, background: TH.bgCard, borderRadius: 24, display: "flex", flexDirection: "column", gap: 12, border: `1px solid ${TH.primary}` }}>
            <input type="text" placeholder={settings.lang==='bn'?'নাম':'Name'} value={debtForm.person} onChange={e=>setDebtForm({...debtForm, person: e.target.value})} style={{ padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, fontWeight: 600, outline:"none", fontSize:14 }} />
            <input type="number" placeholder={settings.lang==='bn'?'টাকা':'Amount'} value={debtForm.amount} onChange={e=>setDebtForm({...debtForm, amount: e.target.value})} style={{ padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, fontWeight: 600, outline:"none", fontSize:14 }} />
            <div style={{display:"flex", gap:10}}>
              <div style={{flex:1}}>
                 <label style={{fontSize:11, fontWeight:700, color:TH.textMid}}>{settings.lang==='bn'?'তারিখ:':'Date:'}</label>
                 <input type="date" value={debtForm.date} onChange={e=>setDebtForm({...debtForm, date: e.target.value})} style={{ width:"100%", padding: 12, borderRadius: 12, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:600, fontSize:13 }} />
              </div>
              <div style={{flex:1}}>
                 <label style={{fontSize:11, fontWeight:700, color:TH.textMid}}>{settings.lang==='bn'?'ফেরত:':'Return:'}</label>
                 <input type="date" value={debtForm.returnDate} onChange={e=>setDebtForm({...debtForm, returnDate: e.target.value})} style={{ width:"100%", padding: 12, borderRadius: 12, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:600, fontSize:13 }} />
              </div>
            </div>
            <div style={{display:"flex", gap:10}}>
               <select value={debtForm.sourceId} onChange={e=>setDebtForm({...debtForm, sourceId: e.target.value})} style={{ flex:1, padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, fontWeight: 700, outline:"none", fontSize:13 }}>{data.wallets.map(w=><option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}</select>
               <select value={debtForm.type} onChange={e=>setDebtForm({...debtForm, type: e.target.value})} style={{ flex:1, padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, fontWeight: 700, outline:"none", fontSize:13 }}><option value="lend">I will get</option><option value="borrow">I will give</option></select>
            </div>
            <button onClick={handleAddDebt} style={{ padding: 14, background: TH.primary, color: "#000", border: "none", borderRadius: 14, fontWeight: 800, fontSize:14 }}>Save</button>
          </div>
      )}
      
      {data.debts.map(d => (
        <div key={d.id} className="tx-card" style={{ padding: 18, background: TH.bgCard, borderRadius: 24, display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${TH.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:42, height:42, borderRadius:14, background: d.type==='lend'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', display:"flex", alignItems:"center", justifyContent:"center" }}><Users size={20} color={d.type==='lend'?'#10b981':'#ef4444'}/></div>
            <div>
              <p style={{ fontWeight: 700, fontSize:15, color:TH.text, marginBottom:2 }}>{d.person}</p>
              <p style={{ fontSize: 11, color: TH.textMid, fontWeight:600 }}>{settings.lang==='bn'?'ফেরত:':'Return:'} {d.returnDate ? formatDate(d.returnDate) : 'N/A'}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <p style={{ fontWeight: 800, fontSize:16, color: TH.text }}>{fmt(d.amount)}</p>
            <button 
  onClick={(e) => { e.stopPropagation(); sendReminder(d); }} style={{ color: "#25D366", display: "flex", alignItems: "center", gap: 4, background: "none" ,     border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 
  }}
>
  <MessageCircle size={16} />
  {settings.lang === 'bn' ? 'রিমাইন্ড' : 'Remind'}
</button>
            <button onClick={()=>{ setConfirmDialog({ show: true, msg: settings.lang==='bn'?"হিসাব ক্লিয়ার করবেন?":"Settle this debt?", onConfirm: () => { const ws = data.wallets.map(w => w.id === d.sourceId ? { ...w, balance: d.type==='lend'? w.balance+d.amount : w.balance-d.amount } : w); setData({...data, wallets: ws, debts: data.debts.filter(x=>x.id!==d.id)}); showToast(settings.lang==='bn'?"ক্লিয়ার!":"Settled!", "success"); }}); }} style={{ padding: "8px 12px", background: TH.bgInner, color: TH.text, borderRadius: 10, border: `1px solid ${TH.border}`, fontWeight: 700, fontSize: 12 }}>Settle</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PlanningView({ data, setData, fmt, TH, settings, getCategories, showToast, setConfirmDialog }) {
  const [subTab, setSubTab] = useState("vault");
  const [saveAmt, setSaveAmt] = useState(""); const [saveNote, setSaveNote] = useState(""); const [vaultWallet, setVaultWallet] = useState(data.wallets[0]?.id || ""); 
  const [goalForm, setGoalForm] = useState({ show: false, name: "", target: "", note: "", id: null });
  const [addCashId, setAddCashId] = useState(null); const [addCashAmt, setAddCashAmt] = useState(""); const [addCashWallet, setAddCashWallet] = useState(data.wallets[0]?.id || "");
  const [limitVal, setLimitVal] = useState(""); const [budgetCat, setBudgetCat] = useState("");

  const handleVault = (type) => {
    const n = Number(saveAmt); if (!n) return; let ws = [...data.wallets]; let sv = { ...data.savings }; let txs = [...data.txs];
    const wIdx = ws.findIndex(w => w.id === vaultWallet); if(wIdx === -1) return showToast("Wallet error", "error");
    if (type === 'deposit') { if (ws[wIdx].balance < n) return showToast("No cash", "error"); ws[wIdx].balance -= n; sv.balance += n; const msg = saveNote || "Vault Deposit"; sv.history = [{ id: genId(), date: TODAY(), amount: n, type: 'deposit', note: msg }, ...(sv.history || [])]; txs = [{ id: genId(), type:'expense', date: TODAY(), amount: n, category:'other_ex', walletId: vaultWallet, note: msg, tags:[] }, ...txs]; } 
    else { if (sv.balance < n) return showToast("Vault Empty", "error"); ws[wIdx].balance += n; sv.balance -= n; const msg = saveNote || "Vault Withdraw"; sv.history = [{ id: genId(), date: TODAY(), amount: n, type: 'withdraw', note: msg }, ...(sv.history || [])]; txs = [{ id: genId(), type:'income', date: TODAY(), amount: n, category:'other_in', walletId: vaultWallet, note: msg, tags:[] }, ...txs]; }
    setData({...data, wallets: ws, savings: sv, txs: txs}); setSaveAmt(""); setSaveNote(""); showToast("Success", "success");
  };

  const handleAddGoalCash = (goalId) => {
    const amt = Number(addCashAmt); if(!amt) return; let ws = [...data.wallets]; const wIdx = ws.findIndex(w => w.id === addCashWallet);
    if(wIdx === -1 || ws[wIdx].balance < amt) return showToast(settings.lang==='bn'?"ব্যালেন্স নেই!":"Insufficient Balance", "error");
    ws[wIdx].balance -= amt; const newGoals = data.goals.map(g => g.id === goalId ? { ...g, saved: g.saved + amt } : g);
    const tx = { id: genId(), type:'expense', date: TODAY(), amount: amt, category:'other_ex', walletId: addCashWallet, note: `${settings.lang==='bn'?'লক্ষ্য:':'Goal:'} ${data.goals.find(x=>x.id===goalId).name}`, tags:[] };
    setData({ ...data, wallets: ws, goals: newGoals, txs: [tx, ...data.txs] }); setAddCashId(null); setAddCashAmt(""); showToast(settings.lang==='bn'?"টাকা এড হয়েছে":"Added", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", background: TH.bgCard, padding: 6, borderRadius: 20, border: `1px solid ${TH.border}` }}>
        {['vault', 'goals', 'budgets'].map(t => (
          <button key={t} onClick={()=>setSubTab(t)} style={{ flex: 1, padding: "12px", borderRadius: 16, background: subTab===t ? TH.bgInner : "transparent", color: subTab===t ? TH.text : TH.textMid, fontWeight: 700, border: "none", fontSize: 13, textTransform:"uppercase", transition: "0.3s" }}>{t}</button>
        ))}
      </div>
      
      {subTab === "vault" && (
        <div className="animate-slide" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="animate-scale" style={{ padding: 40, background: TH.bgCard, borderRadius: 32, textAlign: "center", border: `1px solid ${TH.border}` }}>
            <Landmark size={36} style={{margin:"0 auto 15px", color:TH.primary}}/>
            <p style={{ fontWeight: 700, color: TH.textMid, letterSpacing:1, fontSize:12 }}>SAVINGS VAULT</p>
            <h2 style={{ fontSize: 42, fontWeight: 800, margin:"10px 0 25px", color: TH.text }}>{fmt(data.savings.balance)}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <select value={vaultWallet} onChange={e=>setVaultWallet(e.target.value)} style={{ padding: 14, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, fontWeight: 700, outline:"none", fontSize:14 }}>{data.wallets.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select>
              <input type="number" placeholder="Amount" value={saveAmt} onChange={e=>setSaveAmt(e.target.value)} style={{ padding: 14, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, textAlign:"center", outline:"none", fontWeight:700, fontSize:16 }} />
              <input type="text" placeholder="Note (Optional)" value={saveNote} onChange={e=>setSaveNote(e.target.value)} style={{ padding: 14, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, textAlign:"center", outline:"none", fontWeight:600, fontSize:14 }} />
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button onClick={()=>handleVault('deposit')} style={{ flex: 1, padding: 14, background: "#10b981", color: "#fff", border: "none", borderRadius: 16, fontWeight: 800, fontSize:14 }}>Deposit</button>
                <button onClick={()=>handleVault('withdraw')} style={{ flex: 1, padding: 14, background: TH.bgInner, color: TH.text, border: `1px solid ${TH.border}`, borderRadius: 16, fontWeight: 800, fontSize:14 }}>Withdraw</button>
              </div>
            </div>
          </div>

          {(data.savings.history && data.savings.history.length > 0) && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontWeight: 700, marginBottom: 12, color: TH.textMid, fontSize: 13, textTransform: "uppercase" }}>{settings.lang==='bn'?'সাম্প্রতিক হিস্ট্রি':'Recent History'}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.savings.history.map(sv => (
                  <div key={sv.id} className="tx-card" style={{ padding: "16px 20px", background: TH.bgCard, borderRadius: 20, border: `1px solid ${TH.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ textAlign: "left" }}>
                       <p style={{ fontWeight: 700, fontSize: 15, color: TH.text }}>{sv.note}</p>
                       <p style={{ fontSize: 12, color: TH.textMid, fontWeight: 500 }}>{formatDate(sv.date)}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                       <p style={{ fontWeight: 800, fontSize: 16, color: sv.type === 'deposit' ? "#10b981" : "#ef4444" }}>{sv.type === 'deposit' ? "+" : "-"}{fmt(sv.amount)}</p>
                       <button onClick={() => {
                          setConfirmDialog({ show: true, msg: settings.lang==='bn'?"এই হিস্ট্রি মুছবেন?":"Delete this record?", onConfirm: () => {
                             let svNew = { ...data.savings };
                             svNew.balance = sv.type === 'deposit' ? svNew.balance - sv.amount : svNew.balance + sv.amount;
                             svNew.history = svNew.history.filter(x => x.id !== sv.id);
                             const matchingTx = data.txs.find(t => t.date === sv.date && t.amount === sv.amount && t.note === sv.note);
                             let newWs = [...data.wallets];
                             let newTxs = [...data.txs];
                             if (matchingTx) {
                                 const wIdx = newWs.findIndex(w => w.id === matchingTx.walletId);
                                 if (wIdx > -1) { newWs[wIdx].balance += (matchingTx.type === 'expense' ? matchingTx.amount : -matchingTx.amount); }
                                 newTxs = newTxs.filter(t => t.id !== matchingTx.id);
                             } else if (newWs[0]) { newWs[0].balance += (sv.type === 'deposit' ? sv.amount : -sv.amount); }
                             setData({ ...data, savings: svNew, wallets: newWs, txs: newTxs });
                             showToast(settings.lang==='bn'?"মুছে ফেলা হয়েছে":"Deleted", "success");
                          }});
                       }} style={{ background: "none", border: "none", color: "#ef4444", padding: "4px 0 4px 8px" }}><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {subTab === "goals" && (
        <div className="animate-slide" style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <button onClick={()=>setGoalForm({...goalForm, show: true})} style={{ padding:18, background:TH.bgCard, borderRadius:20, border:`1px dashed ${TH.textMid}`, color:TH.text, fontWeight:700, fontSize:14 }}>+ {settings.lang==='bn'?'নতুন লক্ষ্য':'New Goal'}</button>
          
          {goalForm.show && (
            <div className="animate-scale" style={{ padding:20, background:TH.bgCard, borderRadius:24, display:"flex", flexDirection:"column", gap:12, border:`1px solid ${TH.primary}` }}>
              <input type="text" placeholder={settings.lang==='bn'?'নাম':'Name'} value={goalForm.name} onChange={e=>setGoalForm({...goalForm, name: e.target.value})} style={{ padding:14, borderRadius:14, background:TH.bgInner, color:TH.text, border:"none", outline:"none", fontWeight:600, fontSize:14 }} />
              <input type="number" placeholder={settings.lang==='bn'?'টার্গেট':'Target Amount'} value={goalForm.target} onChange={e=>setGoalForm({...goalForm, target: e.target.value})} style={{ padding:14, borderRadius:14, background:TH.bgInner, color:TH.text, border:"none", outline:"none", fontWeight:600, fontSize:14 }} />
              <button onClick={()=>{ 
                if(!goalForm.name || !goalForm.target) return showToast("Enter info", "error"); 
                const newGoal = { id: goalForm.id || genId(), name: goalForm.name, target: Number(goalForm.target), note: goalForm.note, saved: goalForm.saved || 0 }; 
                setData({ ...data, goals: goalForm.id ? data.goals.map(g=>g.id===goalForm.id?newGoal:g) : [newGoal, ...data.goals] }); 
                setGoalForm({ show: false, name: "", target: "", note: "", id: null }); 
              }} style={{ padding:14, background:TH.primary, color:"#000", border:"none", borderRadius:14, fontWeight:800, fontSize:14 }}>Save Goal</button>
            </div>
          )}

          {data.goals.map(g => (
            <div key={g.id} className="tx-card" style={{ padding:24, background:TH.bgCard, borderRadius:28, border:`1px solid ${TH.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:15 }}>
                <h4 style={{ fontWeight:700, fontSize:16, color:TH.text }}>🎯 {g.name}</h4>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={()=>setGoalForm({show:true, ...g})} style={{ color:TH.textMid, background:"none", border:"none" }}><Edit3 size={18}/></button>
                  <button onClick={()=>setConfirmDialog({show:true, msg:"Delete Goal?", onConfirm:()=>setData({...data, goals: data.goals.filter(x=>x.id!==g.id)})})} style={{ color:"#ef4444", background:"none", border:"none" }}><Trash2 size={18}/></button>
                </div>
              </div>
              <div style={{ height:12, background:TH.bgInner, borderRadius:10, overflow:"hidden", marginBottom:10 }}>
                <div style={{ width:`${Math.min((g.saved/g.target)*100, 100)}%`, height:"100%", background:TH.primary, transition:"width 1s cubic-bezier(0.4, 0, 0.2, 1)", borderRadius: 10 }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:700, marginBottom:20 }}>
                <span style={{color:TH.text}}>{fmt(g.saved)}</span>
                <span style={{color:TH.textMid}}>{fmt(g.target)}</span>
              </div>
              
              {addCashId === g.id ? (
                <div className="animate-scale" style={{ display:"flex", gap:8 }}>
                  <select value={addCashWallet} onChange={e=>setAddCashWallet(e.target.value)} style={{ padding:12, borderRadius:12, background:TH.bgInner, border:"none", color:TH.text, outline:"none", flex:1, fontWeight:600, fontSize:13 }}>{data.wallets.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select>
                  <input type="number" placeholder="Amt" value={addCashAmt} onChange={e=>setAddCashAmt(e.target.value)} style={{ flex:1, padding:12, borderRadius:12, background:TH.bgInner, border:"none", color:TH.text, outline:"none", fontWeight:600, fontSize:13 }}/>
                  <button onClick={()=>handleAddGoalCash(g.id)} style={{ padding:12, borderRadius:12, background:"#10b981", color:"#fff", border:"none", fontWeight:800 }}><Check size={16}/></button>
                  <button onClick={()=>{setAddCashId(null); setAddCashAmt("");}} style={{ padding:12, borderRadius:12, background:TH.bgInner, color:TH.textMid, border:"none", fontWeight:800 }}><X size={16}/></button>
                </div>
              ) : (
                <button onClick={()=>setAddCashId(g.id)} style={{ width:"100%", padding:14, borderRadius:14, background:TH.bgInner, color:TH.text, fontWeight:700, border:"none", fontSize:13 }}>Add Cash</button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {subTab === "budgets" && (
        <div className="animate-slide" style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ padding:24, background:TH.bgCard, borderRadius:28, border:`1px solid ${TH.border}` }}>
            <p style={{ fontWeight:700, marginBottom:15, color:TH.textMid, fontSize:13, textTransform:"uppercase" }}>{settings.lang==='bn'?'বাজেট সেট করুন':'Set Limit'}</p>
            <div style={{ display:"flex", gap:10, marginBottom:15 }}>
              <select value={budgetCat} onChange={e=>setBudgetCat(e.target.value)} style={{ flex:1, padding:14, borderRadius:14, background:TH.bgInner, color:TH.text, border:"none", fontWeight:600, outline:"none", fontSize:14 }}>
                <option value="">{settings.lang==='bn'?'ক্যাটাগরি':'Category'}</option>
                {getCategories("expense").map(c => <option key={c.id} value={c.id}>{c.icon} {c.label[settings.lang] || c.label['en']}</option>)}
              </select>
              <input type="number" placeholder="Limit" value={limitVal} onChange={e=>setLimitVal(e.target.value)} style={{ width:100, padding:14, borderRadius:14, background:TH.bgInner, color:TH.text, border:"none", textAlign:"center", fontWeight:700, outline:"none", fontSize:14 }} />
            </div>
            <button onClick={()=>{ const val=Number(limitVal); if(budgetCat && val){ setData({...data, budgets:{...data.budgets, [budgetCat]:val}}); setLimitVal(""); showToast("Updated", "success"); } }} style={{ width:"100%", padding:14, borderRadius:14, background:TH.primary, color:"#000", border:"none", fontWeight:800, fontSize:14 }}>Save Budget</button>
          </div>
          
          {Object.entries(data.budgets).map(([id, lim]) => { 
            const cat = getCategories("expense").find(c => c.id === id); if(!cat) return null; 
            const spent = data.txs.filter(x => x.type === "expense" && x.category === id && x.date.startsWith(TODAY().slice(0, 7))).reduce((s, e) => s + e.amount, 0); 
            const percent = Math.min((spent / lim) * 100, 100); 
            const isOver = spent > lim; 
            return (
              <div key={id} className="tx-card" style={{ padding:20, background:TH.bgCard, borderRadius:24, border:`1px solid ${isOver ? 'rgba(239,68,68,0.3)' : TH.border}`, display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <span style={{ fontSize:24 }}>{cat.icon}</span>
                    <div><p style={{ fontWeight:700, fontSize:15, color:TH.text }}>{cat.label[settings.lang] || cat.label['en']}</p><p style={{ fontSize:12, color:TH.textMid, fontWeight:600 }}>{fmt(spent)} / {fmt(lim)}</p></div>
                  </div>
                  <button onClick={()=>setConfirmDialog({show:true, msg:"Delete Budget?", onConfirm:() => { const n={...data.budgets}; delete n[id]; setData({...data, budgets:n}); }})} style={{ color:TH.textMid, background:"none", border:"none" }}><Trash2 size={18}/></button>
                </div>
                <div style={{ height:8, background:TH.bgInner, borderRadius:10, overflow:"hidden", marginTop:2 }}>
                  <div style={{ width:`${percent}%`, height:"100%", background: isOver ? "#ef4444" : TH.primary, transition:"width 1s ease", borderRadius: 10 }} />
                </div>
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
    const y = new Date().getFullYear(); const mStr = `${y}-${String(i+1).padStart(2, '0')}`; 
    const inc = data.txs.filter(t => t.type === "income" && t.date.startsWith(mStr)).reduce((s, t) => s + t.amount, 0); 
    const exp = data.txs.filter(t => t.type === "expense" && t.date.startsWith(mStr)).reduce((s, t) => s + t.amount, 0); 
    return { name: m, income: inc, expense: exp }; 
  }), [data.txs]);

  const totalWalletBalance = data.wallets.reduce((s, w) => s + w.balance, 0);
  const totalLent = data.debts.filter(d => d.type === 'lend').reduce((s, d) => s + d.amount, 0);
  const totalBorrowed = data.debts.filter(d => d.type === 'borrow').reduce((s, d) => s + d.amount, 0);
  const totalAssets = totalWalletBalance + totalLent;
  const totalLiabilities = totalBorrowed;
  const netWorth = totalAssets - totalLiabilities;
  
  return (
    <div className="animate-slide" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", background: TH.bgCard, padding: 6, borderRadius: 20, border: `1px solid ${TH.border}` }}>
        {['breakdown', 'weekly', 'monthly', 'net worth'].map(t => (
          <button key={t} onClick={()=>setGType(t)} style={{ flex: 1, padding: "12px 2px", borderRadius: 16, background: gType===t ? TH.bgInner : "transparent", color: gType===t ? TH.text : TH.textMid, fontWeight: 700, border: "none", fontSize: 11, textTransform:"uppercase", transition: "0.3s" }}>{t}</button>
        ))}
      </div>
      
      {gType === 'net worth' ? (
         <div className="animate-scale" style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"flex", gap:14 }}>
               <div style={{ flex:1, padding:20, background:TH.bgCard, borderRadius:24, border:`1px solid rgba(16,185,129,0.3)` }}>
                  <p style={{fontSize:12, fontWeight:700, color:"#10b981"}}>{lang==='bn'?'মোট সম্পদ':'Total Assets'}</p>
                  <p style={{fontSize:20, fontWeight:800, marginTop:6, color:TH.text}}>{fmt(totalAssets)}</p>
               </div>
               <div style={{ flex:1, padding:20, background:TH.bgCard, borderRadius:24, border:`1px solid rgba(239,68,68,0.3)` }}>
                  <p style={{fontSize:12, fontWeight:700, color:"#ef4444"}}>{lang==='bn'?'মোট দায়':'Total Liabilities'}</p>
                  <p style={{fontSize:20, fontWeight:800, marginTop:6, color:TH.text}}>{fmt(totalLiabilities)}</p>
               </div>
            </div>
            <div style={{ padding:35, background:TH.bgCard, borderRadius:28, textAlign:"center", border:`1px solid ${TH.border}`, position:"relative", overflow:"hidden" }}>
               <p style={{fontSize:13, fontWeight:700, color:TH.textMid}}>{lang==='bn'?'নেট ওয়ার্থ (আসল সম্পদ)':'Net Worth'}</p>
               <h2 style={{fontSize:40, fontWeight:800, margin:"10px 0", color: netWorth >= 0 ? "#10b981" : "#ef4444"}}>{fmt(netWorth)}</h2>
               <p style={{fontSize:11, fontWeight:600, color:TH.textMid}}>{lang==='bn'?'সম্পদ - দায় = আসল মূল্য':'Assets - Liabilities'}</p>
            </div>
         </div>
      ) : (
        <div style={{ padding: 20, background: TH.bgCard, borderRadius: 28, border: `1px solid ${TH.border}`, minHeight: 400 }}>
          {gType === "breakdown" ? (
            <ResponsiveContainer width="100%" height={360}>
              <PieChart>
                <Pie data={getCategories("expense").map(cat => ({ name: cat.label[lang] || cat.label['en'], value: data.txs.filter(x=>x.type==="expense" && x.category===cat.id).reduce((s,e)=>s+e.amount,0), color: cat.color })).filter(x=>x.value>0)} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                  {getCategories("expense").map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius: 16, border:`1px solid ${TH.border}`, background: TH.bgCard, fontWeight:700, color:TH.text}}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={gType === "weekly" ? weeklyData : monthlyData} margin={{top:20}}>
                <XAxis dataKey="name" stroke={TH.textMid} fontSize={11} tickLine={false} axisLine={false}/>
                <Tooltip cursor={{fill: TH.bgInner}} formatter={v=>fmt(v)} contentStyle={{borderRadius: 16, border:`1px solid ${TH.border}`, background: TH.bgCard, fontWeight:700, color:TH.text}}/>
                <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{fontSize:12, fontWeight:600}}/>
                <Bar dataKey="income" fill="#10b981" radius={[4,4,0,0]} name={lang==='bn'?'আয়':'Income'} barSize={12} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} name={lang==='bn'?'ব্যয়':'Expense'} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}



function PinScreen({ settings, setSettings, onSuccess, TH, showToast, onLogout }) {
  const [input, setInput] = useState(""); 
  const [isForgot, setIsForgot] = useState(false); 
  const [recIn, setRecIn] = useState("");
  
  const handleKey = (num) => { 
    if (input.length < 4) { 
      const newVal = input + num; setInput(newVal); 
      if (btoa(newVal) === settings.pinLock || newVal === settings.pinLock) setTimeout(onSuccess, 250); 
      else if (newVal.length === 4) { setInput(""); showToast("ভুল পিন!", "error"); } 
    } 
  };
  
  if (isForgot) return (
    <div className="animate-fade" style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: TH.bg, padding: 30 }}>
      <KeyRound size={60} color={TH.primary} style={{marginBottom: 20}}/>
      <h2 style={{ fontWeight: 800, color: TH.text }}>Restore Access</h2>
      <input type="text" placeholder="Secret Word" value={recIn} onChange={e=>setRecIn(e.target.value)} style={{ width:"100%", maxWidth:300, padding:18, borderRadius:16, marginTop:30, background:TH.bgCard, border:`1px solid ${TH.border}`, color:TH.text, textAlign:"center", fontWeight:700, outline:"none" }} />
      <button onClick={()=>{ if(btoa(recIn.toLowerCase()) === settings.recoveryWord || recIn.toLowerCase() === settings.recoveryWord){ setSettings({...settings, pinLock:""}); onSuccess(); } else showToast("ভুল শব্দ!", "error"); }} style={{ width:"100%", maxWidth:300, padding:18, background:TH.primary, color:"#000", border:"none", borderRadius:16, fontWeight:800, marginTop:15 }}>Unlock</button>
      <button onClick={()=>setIsForgot(false)} style={{ marginTop: 20, color: TH.textMid, background: "none", border: "none", fontWeight: 700, fontSize:14 }}>Cancel</button>
    </div>
  );
  
  return (
    <div className="animate-fade" style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: TH.bg }}>
      <Lock size={50} color={TH.primary} style={{marginBottom: 30}}/>
      <div style={{ display: "flex", gap: 20, marginBottom: 40 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: input.length >= i ? TH.primary : TH.border, transition:"0.2s" }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {[1,2,3,4,5,6,7,8,9, "C", 0, "×"].map(k => (<button key={k} onClick={() => { if(k==="C") setInput(""); else if(k==="×") setInput(input.slice(0,-1)); else handleKey(k.toString()); }} style={{ width: 75, height: 75, borderRadius: "50%", background: TH.bgCard, border: `1px solid ${TH.border}`, color: TH.text, fontSize: 24, fontWeight: 800 }}>{k}</button>))}
      </div>
      <div style={{ display: "flex", gap: 30, marginTop: 40 }}>
        <button onClick={()=>setIsForgot(true)} style={{ color: TH.textMid, background: "none", border: "none", fontWeight: 700, fontSize:14 }}>Forgot PIN?</button>
        <button onClick={onLogout} style={{ color: "#ef4444", background: "none", border: "none", fontWeight: 700, fontSize:14, display: "flex", alignItems: "center", gap: 5 }}><LogOut size={16}/> Logout</button>
      </div>
    </div>
  );
}


function NavBtn({ active, icon: Icon, label, onClick, TH }) { 
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ padding: "8px 16px", borderRadius: 16, background: active ? TH.primaryBg : "transparent", transition:"0.2s" }}>
        <Icon size={22} color={active ? TH.primary : TH.textMid} strokeWidth={active ? 2.5 : 2}/>
      </div>
      <span style={{ fontSize: 10, fontWeight: 800, color: active ? TH.primary : TH.textMid, letterSpacing: "0.5px" }}>{label}</span>
    </button>
  ); 
}