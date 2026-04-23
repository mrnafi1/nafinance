import { useState, useEffect, useMemo, useRef } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, Legend } from "recharts";
import { Plus, Trash2, MessageCircle, Home, BarChart2, Settings, Users, X, Download, Eye, EyeOff, Search, AlertTriangle, Landmark, Wallet, Lock, Sun, Moon, KeyRound, Edit3, Check, FileText, Edit, ArrowRightLeft, TrendingUp, TrendingDown, Activity, Mail, LogOut, DownloadCloud, Zap, Hash, Paperclip, Loader2, Image as ImageIcon } from "lucide-react";
import TxModal from './components/TxModal';
import SettingsModal from './components/SettingsModal';
import ChallengesView from './components/ChallengesView';

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// 🚀 Premium Global Styles
const PREMIUM_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Hind+Siliguri:wght@500;600;700&display=swap');

.amount-font { 
    font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif !important; 
    letter-spacing: -0.5px;
    font-variant-numeric: tabular-nums;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; } 
  
  :root {
    --bg-main: #080c14;
    --bg-secondary: #0d1220;
    --card-bg: rgba(255,255,255,0.04);
    --card-border: rgba(255,255,255,0.08);
    --gold-primary: #f0b429;
    --gold-secondary: #ffd166;
    --gold-bg: rgba(240,180,41,0.15);
    --gold-glow: rgba(240,180,41,0.25);
    --text-main: #f0f4ff;
    --text-muted: rgba(240,244,255,0.45);
    --balance-bg: linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
    --balance-border: rgba(255,255,255,0.1);
    --balance-text: #ffffff;
    --btn-text: #1a1610;
    --glass-shadow: 0 8px 32px 0 rgba(0,0,0,0.3);
  }

  [data-theme="light"] {
    --bg-main: #f5f3ee;
    --bg-secondary: #ede9e2;
    --card-bg: #ffffff;
    --card-border: rgba(0,0,0,0.07);
    --gold-primary: #c8820a;
    --gold-secondary: #f5a623;
    --gold-bg: #fff8ed;
    --gold-glow: rgba(200,130,10,0.2);
    --text-main: #1a1610;
    --text-muted: #9e9890;
    --balance-bg: linear-gradient(145deg, #1a1610 0%, #2d2418 100%);
    --balance-border: rgba(0,0,0,0.1);
    --balance-text: #ffffff;
    --btn-text: #ffffff;
    --glass-shadow: 0 4px 16px rgba(0,0,0,0.06);
  }

  body { font-size: 16px; overscroll-behavior-y: none; background: var(--bg-main); color: var(--text-main); transition: background 0.3s ease, color 0.3s ease; } 
  input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; } 
  input[type=number] { -moz-appearance: textfield; }
  select, input, button { font-family: 'DM Sans', sans-serif; }
  
  @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideDownFade { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulseGlow { 0% { box-shadow: 0 0 15px var(--gold-glow); } 100% { box-shadow: 0 0 30px var(--gold-glow); } }
  @keyframes spin { 100% { transform: rotate(360deg); } }
  
  .animate-spin { animation: spin 1s linear infinite; }
  .animate-slide { animation: slideUpFade 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
  .animate-slide-down { animation: slideDownFade 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
  .animate-scale { animation: scaleIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
  .animate-fade { animation: fadeIn 0.2s ease forwards; }
  
  button { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
  button:active { transform: scale(0.94); }
  
  .tx-card { transition: all 0.2s ease; }
  .tx-card:hover { transform: translateY(-2px); box-shadow: var(--glass-shadow); border-color: var(--gold-glow); }
  .tx-card:active { transform: scale(0.97); }

  .blob1 { position: fixed; top: -60px; right: -60px; width: 280px; height: 280px; border-radius: 50%; background: radial-gradient(circle, var(--gold-glow) 0%, transparent 70%); pointer-events: none; z-index: 0; }
  .blob2 { position: fixed; bottom: 120px; left: -80px; width: 260px; height: 260px; border-radius: 50%; background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%); pointer-events: none; z-index: 0; }
  
  .glass-panel { background: var(--card-bg); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid var(--card-border); box-shadow: var(--glass-shadow); }
  
  .premium-btn { background: linear-gradient(135deg, var(--gold-secondary), var(--gold-primary)); color: var(--btn-text); border: none; font-weight: 800; box-shadow: 0 4px 15px var(--gold-glow); transition: 0.3s; }
  .premium-btn:hover { box-shadow: 0 6px 20px var(--gold-glow); transform: translateY(-1px); }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--gold-primary); border-radius: 10px; opacity: 0.5; }
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


// 🔴 ফিক্স: ল্যাঙ্গুয়েজ ইংলিশ হলে 1,2,3 এবং বাংলা হলে ১,২,৩ দেখাবে
const fmtMoney = (n, curr, lang) => {
  const c = CURRENCIES.find(x => x.code === curr) || CURRENCIES[0];
  const locale = lang === 'bn' ? 'bn-BD' : 'en-US';
  const numStr = new Intl.NumberFormat(locale, { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
    numberingSystem: lang === 'bn' ? 'beng' : 'latn' 
  }).format(n || 0);
  
  return lang === 'bn' ? `${numStr}${c.sym}` : `${c.sym}${numStr}`;
};

const formatDate = (isoDate) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
};

const DEFAULT_DATA = { 
  txs: [], wallets: [{ id: "w1", name: "Cash", balance: 0, icon: "💵" }, { id: "w2", name: "Bank", balance: 0, icon: "🏦" }], 
  debts: [], goals: [], budgets: {}, savings: { balance: 0, history: [] }, customCategories: { expense: [], income: [] }, dismissedAlerts: [], recurring: [], templates: [] ,challenges: [],
};

const DEFAULT_SETTINGS = { lang: "bn", curr: "BDT", theme: "dark", hideBalance: false, pinLock: "", recoveryWord: "",budgetAlertThreshold: 80 };
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
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

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
      setModal(null);
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
            if (dbData.data) {
            // 🔥 আপনার দেওয়া লজিক: পুরনো মাসের Alert Key গুলো ক্লিন করা
            const currentMonth = TODAY().slice(0, 7);
            const cleanedAlerts = (dbData.data.dismissedAlerts || []).filter(key => key.endsWith(currentMonth));
            
            setData({ 
              ...DEFAULT_DATA, 
              ...dbData.data, 
              dismissedAlerts: cleanedAlerts 
            });
          }
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

  // 🔥 ১. Firestore Debounce (১ সেকেন্ড পর পর সেভ হবে)
  useEffect(() => {
    if (firebaseUser && isDbLoaded) {
      const timeoutId = setTimeout(() => {
        setDoc(doc(db, "users", firebaseUser.uid), { data, settings })
          .catch(e => {
            console.error("Firebase Sync Error:", e);
          });
      }, 1000); // ১ সেকেন্ড ডিলয় (Debounce)
      
      return () => clearTimeout(timeoutId); // ইউজার টাইপ করলে আগের টাইমার বাতিল হবে
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

  const TH = { 
    bg: "var(--bg-main)", bgCard: "var(--card-bg)", bgInner: "var(--bg-secondary)", 
    border: "var(--card-border)", text: "var(--text-main)", textMid: "var(--text-muted)", 
    primary: "var(--gold-primary)", primaryBg: "var(--gold-bg)", glow: "var(--gold-glow)", mode: settings.theme
  };
  
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
    // 🔥 বাগ ফিক্স ১: ক্যাটাগরি সিলেক্ট না করলে সেভ হবে না
    if (!tx.category) {
      showToast(settings.lang === 'bn' ? "দয়া করে ক্যাটাগরি সিলেক্ট করুন!" : "Please select a category!", "error");
      return false;
    }

    let ws = [...data.wallets];
    
    // এডিট মোড: আগের ব্যালেন্স আন্ডু (Undo) করা
    if (oldTx) { 
      ws = ws.map(w => w.id === oldTx.walletId ? { ...w, balance: oldTx.type === "income" ? w.balance - oldTx.amount : w.balance + oldTx.amount } : w); 
    }
    
    const isInc = tx.type === "income"; 
    const targetW = ws.find(w => w.id === tx.walletId);
    
    if (!targetW) { showToast("Wallet error", "error"); return false; }
    
    // ব্যালেন্স চেক
    if (!isInc && targetW.balance < tx.amount) { 
      showToast(settings.lang === 'bn' ? "ব্যালেন্স নেই!" : "Insufficient Balance", "error"); 
      return false; 
    }
    
    // নতুন ব্যালেন্স আপডেট
    ws = ws.map(w => w.id === tx.walletId ? { ...w, balance: isInc ? w.balance + tx.amount : w.balance - tx.amount } : w);
    
    let newRecs = [...(data.recurring || [])];
    if(isRecurring && !oldTx) { 
      const d = new Date(tx.date); d.setMonth(d.getMonth() + 1); 
      newRecs.push({ ...tx, nextDate: d.toISOString().split("T")[0] }); 
    }
    
    let newTemplates = [...(data.templates || [])];
    if(saveAsTemplate && !oldTx) {
       newTemplates.push({ id: genId(), type: tx.type, amount: tx.amount, category: tx.category, walletId: tx.walletId, note: tx.note || "Template", tags: tx.tags || [] });
    }

    // 🔥 বাগ ফিক্স ২: ডেটাবেস আপডেট (ডাবল হওয়া ফিক্সড)
    setData({ 
      ...data, 
      txs: oldTx ? data.txs.map(t => t.id === oldTx.id ? tx : t) : [tx, ...data.txs], 
      wallets: ws, 
      recurring: newRecs, 
      templates: newTemplates 
    });
    
    showToast(settings.lang === 'bn' ? "সফল!" : "Success!", "success"); 
    return true;
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
    <div ref={appRef} style={{ minHeight: "100vh", background: TH.bg, color: TH.text, position: "relative", overflowX: "hidden" }}>
      <style>{PREMIUM_STYLE}</style>
      <div className="blob1" /><div className="blob2" />
      
      {showInstallPrompt && (
        <div className="animate-slide-down glass-panel" style={{ position: "fixed", top: 15, left: "50%", transform: "translateX(-50%)", width: "90%", maxWidth: 440, padding: "16px 20px", borderRadius: 24, zIndex: 7000, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, background: TH.primary, borderRadius: 12, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--btn-text)", fontWeight:900, fontSize: 20 }}>N</div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15, color: TH.text, marginBottom: 2 }}>Install NaFinance</p>
              <p style={{ fontSize: 11, color: TH.textMid, fontWeight: 600 }}>Get the full app experience</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={handleInstallApp} className="premium-btn" style={{ padding: "10px 18px", borderRadius: 12, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><DownloadCloud size={16}/> Install</button>
            <button onClick={() => setShowInstallPrompt(false)} style={{ background: "none", border: "none", color: TH.textMid }}><X size={20}/></button>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="animate-scale glass-panel" style={{ position: "fixed", top: showInstallPrompt ? 90 : 30, left: "50%", transform: "translateX(-50%)", padding: "14px 24px", borderRadius: 30, zIndex: 5000, display: "flex", alignItems: "center", gap: 12, fontWeight: 700, fontSize: 14, border: `1px solid ${toastMsg.type === 'success' ? '#10b981' : '#ef4444'}` }}>
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
      
      <header className="glass-panel" style={{ position: "sticky", top: 0, zIndex: 50, borderTop: "none", borderLeft: "none", borderRight: "none", padding: "16px 20px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {firebaseUser?.photoURL ? (
              <img src={firebaseUser.photoURL} alt="Profile" style={{ width: 40, height: 40, borderRadius: 12, border: `2px solid var(--gold-primary)`, boxShadow: `0 5px 15px var(--gold-glow)`, objectFit: "cover" }} />
            ) : (
              <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, var(--gold-primary), var(--gold-secondary))", borderRadius: 12, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--btn-text)", fontWeight:900, fontSize: 18, boxShadow: `0 5px 15px var(--gold-glow)` }}>{firebaseUser?.displayName?.charAt(0) || "N"}</div>
            )}
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px" }}>
               <span style={{color: "var(--gold-primary)"}}>  NaFinance</span>
            </span>
          </div>
          <button onClick={() => setModal("settings")} style={{ padding: 10, background: TH.bgInner, border: `1px solid ${TH.border}`, borderRadius: 14, color: TH.textMid, boxShadow: "var(--glass-shadow)", cursor:"pointer" }}><Settings size={20}/></button>
        </div>
      </header>

      <main className="animate-slide" style={{ maxWidth: 480, margin: "0 auto", padding: "15px 20px 140px", position:"relative", zIndex:1 }}>
        {tab === "home" && <HomeView data={data} setData={setData} fmt={fmt} TH={TH} settings={settings} setSettings={setSettings} getCategories={getCategories} deleteTx={deleteTx} setEditTxData={setEditTxData} setModal={setModal} setConfirmDialog={setConfirmDialog} deleteTemplate={deleteTemplate} saveTx={saveTx} />}
        {tab === "assets" && <AssetsView data={data} setData={setData} fmt={fmt} TH={TH} showToast={showToast} settings={settings} setConfirmDialog={setConfirmDialog} />}
        {tab === "planning" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
            {/* আপনার আগের প্ল্যানিং ভিউ */}
            <PlanningView data={data} setData={setData} fmt={fmt} TH={TH} settings={settings} getCategories={getCategories} showToast={showToast} setConfirmDialog={setConfirmDialog} />
            
            {/* 🔥 নতুন চ্যালেঞ্জ ভিউ */}
            <ChallengesView data={data} setData={setData} fmt={fmt} TH={TH} lang={settings.lang} showToast={showToast} />
          </div>
        )}
        {tab === "graphs" && <GraphsView data={data} fmt={fmt} TH={TH} lang={settings.lang} getCategories={getCategories} />}
      </main>

      <div style={{ position: "fixed", bottom: 25, left: 0, right: 0, zIndex: 100, pointerEvents: "none" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px", position: "relative" }}>
          <nav className="glass-panel" style={{ borderRadius: 35, padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems:"center", pointerEvents: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
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
          
          <button onClick={() => { setEditTxData(null); setModal("tx"); }} className="premium-btn" style={{ position: "absolute", left: "50%", transform: "translateX(-50%) rotate(45deg)", bottom: 20, width: 64, height: 64, borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "auto" }}>
            <Plus size={32} strokeWidth={2.5} style={{transform: "rotate(-45deg)"}}/>
          </button>
        </div>
      </div>

      {modal === "tx" && <TxModal data={data} saveTx={saveTx} deleteTx={deleteTx} onClose={() => setModal(null)} TH={TH} editData={editTxData} getCategories={getCategories} lang={settings.lang} showToast={showToast} firebaseUser={auth.currentUser} storage={storage} />}
{modal === "settings" && (<SettingsModal settings={settings} setSettings={setSettings} data={data} setData={setData} onClose={() => setModal(null)} TH={TH} showToast={showToast}  AUTHOR={AUTHOR}
  setConfirmDialog={setConfirmDialog} onLogout={onLogout}  genId={genId}  CURRENCIES={CURRENCIES}  DEFAULT_DATA={DEFAULT_DATA}  DEFAULT_SETTINGS={DEFAULT_SETTINGS}  /> )}

    </div>
  );
}

function LoadingScreen({ TH }) {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: TH.bg }}>
      <style>{PREMIUM_STYLE}</style>
      <div style={{ width: 64, height: 64, background: "var(--gold-primary)", borderRadius: 20, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--btn-text)", fontWeight:900, fontSize: 28, animation: "pulseGlow 1s infinite alternate" }}>N</div>
      <p style={{ marginTop: 25, color: TH.textMid, fontWeight: 700, fontSize: 14 }}>Connecting securely...</p>
    </div>
  );
}

function AuthScreen({ TH, onLogin }) {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: TH.bg, padding: 20 }}>
      <style>{PREMIUM_STYLE}</style>
      <div className="animate-scale glass-panel" style={{ padding: 40, borderRadius: 32, textAlign: "center", width: "100%", maxWidth: 360 }}>
        <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, var(--gold-primary), var(--gold-secondary))", borderRadius: 20, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--btn-text)", fontWeight:900, fontSize: 28, margin: "0 auto 20px", boxShadow: `0 10px 25px var(--gold-glow)` }}>N</div>
        <h2 style={{ fontFamily:"Syne", fontSize: 26, fontWeight: 900, color: "var(--gold-primary)", marginBottom: 10 }}>NaFinance</h2>
        <p style={{ color: TH.textMid, fontSize: 14, fontWeight: 600, marginBottom: 35 }}>Premium Wealth Management</p>
        <button onClick={onLogin} style={{ width: "100%", padding: 18, background: "#fff", color: "#000", borderRadius: 16, border: "none", fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 10px 25px rgba(255,255,255,0.1)", cursor:"pointer" }}>
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
  
 // 🔥 ৩. Monthly Budget Alert Logic
  // 🔥 ৩. Monthly Budget Alert Logic (Dynamic Threshold)
  const alertThreshold = settings.budgetAlertThreshold || 80;
  const activeAlerts = getCategories("expense").filter(cat => {
    const alertKey = `${cat.id}-${currentMonth}`; 
    if (data.dismissedAlerts?.includes(alertKey)) return false; 
    
    const lim = data.budgets[cat.id]; 
    if (!lim) return false;
    const spent = data.txs.filter(x => x.type === "expense" && x.category === cat.id && x.date.startsWith(currentMonth)).reduce((s, e) => s + e.amount, 0);
    return spent >= lim * (alertThreshold / 100); // 🔴 ডায়নামিক পার্সেন্টেজ
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
  // 🔥 Transaction Statistics (সর্বোচ্চ খরচ এবং দৈনিক গড়)
  const currentMonthExpTxs = data.txs.filter(x => x.type === "expense" && x.date.startsWith(currentMonth));
  const catSums = {};
  currentMonthExpTxs.forEach(tx => { catSums[tx.category] = (catSums[tx.category] || 0) + tx.amount; });
  const topCatId = Object.keys(catSums).reduce((a, b) => catSums[a] > catSums[b] ? a : b, null);
  const topCategory = topCatId ? getCategories("expense").find(c => c.id === topCatId) : null;
  
  const currentDay = new Date(TODAY()).getDate() || 1; 
  const avgDailyExp = monthlyExp / currentDay;

// 🔥 ২. CSV Export with BOM
  const exportCSV = () => {
    const headers = "Date,Type,Category,Amount,Note,Tags,Receipt\n";
    const rows = data.txs.map(t => { 
      const cat = getCategories(t.type).find(c => c.id === t.category); 
      return `${formatDate(t.date)},${t.type},${cat ? (cat.label.bn || cat.label.en) : t.category},${t.amount},"${t.note||''}","${t.tags?t.tags.join(' '):''}","${t.imageUrl||''}"`; 
    }).join("\n");
    
    // \uFEFF যোগ করা হলো যাতে Excel ঠিকমতো বাংলা রিড করতে পারে
    const blob = new Blob(["\uFEFF" + headers + rows], {type: "text/csv;charset=utf-8;"}); 
    const link = document.createElement("a"); 
    link.href = URL.createObjectURL(blob); 
    link.download = `NaFinance_${TODAY()}.csv`; 
    link.click();
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
      {activeAlerts.map(cat => {
        const alertKey = `${cat.id}-${currentMonth}`; // ইউনিক কী
        return (
          <div key={cat.id} className="animate-scale" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", padding: "14px 18px", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{display:"flex", alignItems:"center", gap: 12}}>
              <AlertTriangle size={18} color="#f59e0b"/> 
              <span style={{fontSize:13, fontWeight:700, color:TH.text}}>
  {cat.icon} {cat.label[settings.lang] || cat.label['en']} {settings.lang==='bn'? `বাজেট ${alertThreshold}% শেষ!` : `${alertThreshold}% budget used!`}
</span>
            </div>
            <button 
              onClick={() => setData({ ...data, dismissedAlerts: [...(data.dismissedAlerts || []), alertKey] })} 
              style={{background:"none", border:"none", color: TH.textMid, cursor:"pointer"}}>
              <X size={18}/>
            </button>
          </div>
        );
      })}
      
      <div style={{ padding: "28px 24px", borderRadius: 28, background: "var(--balance-bg)", border: `1px solid var(--balance-border)`, position: "relative", overflow: "hidden", boxShadow: `0 15px 40px rgba(0,0,0,0.2)` }}>
        <div style={{ position: "absolute", top: -70, right: -70, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, var(--gold-glow) 0%, transparent 65%)" }}/>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
          <div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>{settings.lang==='bn'?'মোট ব্যালেন্স':'Total Balance'}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif", fontSize: 44, fontWeight: 900, color: "var(--balance-text)", letterSpacing: "-1px" }}>{fmt(total)}</h2>
            </div>
          </div>
          <button onClick={()=>setSettings({...settings, hideBalance: !settings.hideBalance})} style={{ padding: 12, background: "rgba(255,255,255,0.1)", border: `1px solid rgba(255,255,255,0.15)`, borderRadius: 14, color: "#fff", cursor:"pointer" }}>
            {settings.hideBalance ? <Eye size={20}/> : <EyeOff size={20}/>}
          </button>
        </div>

        <div style={{ display: "flex", gap: 15, marginTop: 35, position: "relative", zIndex: 1 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", padding: "10px", borderRadius: "14px" }}>
             <p style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600, display:"flex", alignItems:"center", gap:6 }}><TrendingUp size={12} color="#4ade80"/> {settings.lang==='bn'?'আয়':'INCOME'}</p>
             <p style={{ fontFamily: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif", fontSize: 15, fontWeight: 700, color: "#4ade80", marginTop: 4 }}>{fmt(monthlyInc)}</p>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", padding: "10px", borderRadius: "14px" }}>
             <p style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600, display:"flex", alignItems:"center", gap:6 }}><TrendingDown size={12} color="#f87171"/> {settings.lang==='bn'?'ব্যয়':'EXPENSE'}</p>
             <p style={{ fontFamily: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif", fontSize: 15, fontWeight: 700, color: "#f87171", marginTop: 4 }}>{fmt(monthlyExp)}</p>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", padding: "10px", borderRadius: "14px" }}>
             <p style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600, display:"flex", alignItems:"center", gap:6 }}><Activity size={12} color="#93c5fd"/> {settings.lang==='bn'?'সঞ্চয়':'SAVINGS'}</p>
             <p style={{ fontFamily: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif", fontSize: 15, fontWeight: 700, color: "#93c5fd", marginTop: 4 }}>{fmt(monthlySav)}</p>
          </div>
        </div>
      </div>
{/* 🔥 Transaction Stats Card */}
      <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
        <div className="glass-panel animate-scale" style={{ flex: 1, padding: "16px 14px", borderRadius: 20, display: "flex", alignItems: "center", gap: 12 }}>
           <div style={{ width: 42, height: 42, borderRadius: 14, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingDown size={20} color="#ef4444" />
           </div>
           <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: TH.textMid, textTransform: "uppercase" }}>{settings.lang==='bn'?'সর্বোচ্চ খরচ':'Top Expense'}</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: TH.text, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                {topCategory ? <>{topCategory.icon} {topCategory.label[settings.lang] || topCategory.label['en']}</> : '-'}
              </p>
           </div>
        </div>
        
        <div className="glass-panel animate-scale" style={{ flex: 1, padding: "16px 14px", borderRadius: 20, display: "flex", alignItems: "center", gap: 12 }}>
           <div style={{ width: 42, height: 42, borderRadius: 14, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={20} color="#3b82f6" />
           </div>
           <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: TH.textMid, textTransform: "uppercase" }}>{settings.lang==='bn'?'দৈনিক গড়':'Daily Avg'}</p>
              <p className="amount-font" style={{ fontSize: 16, fontWeight: 800, color: TH.text, marginTop: 2 }}>{fmt(avgDailyExp)}</p>
           </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={exportCSV} className="glass-panel" style={{ flex:1, padding:"12px", borderRadius:16, color:TH.text, fontWeight:700, border:"none", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer" }}><Download size={16} color="#10b981"/> CSV</button>
        <button onClick={exportPDF} className="glass-panel" style={{ flex:1, padding:"12px", borderRadius:16, color:TH.text, fontWeight:700, border:"none", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer" }}><FileText size={16} color="#ef4444"/> PDF</button>
        <select value={dateRange} onChange={e=>setDateRange(e.target.value)} className="glass-panel" style={{ padding: "0 14px", borderRadius: 16, color: TH.textMid, fontWeight: 700, fontSize:13, outline:"none", flex:1.2, cursor:"pointer" }}>
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
                  <div key={tmp.id} className="animate-scale glass-panel" style={{ flexShrink: 0, display:"flex", alignItems:"center", borderRadius: 16, padding: "8px 12px", gap: 8 }}>
                    <button onClick={() => {
                        const defaultWalletId = data.wallets.find(w => w.id === tmp.walletId)?.id || (data.wallets.length > 0 ? data.wallets[0].id : "");
                        const newTx = { id: genId(), type: tmp.type, date: TODAY(), amount: tmp.amount, category: tmp.category, walletId: defaultWalletId, note: tmp.note, tags: tmp.tags || [], imageUrl: null };
                        saveTx(newTx, null, false, false);
                    }} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", color:TH.text, fontWeight:700, fontSize:13, cursor:"pointer" }}>
                       <span style={{fontSize:16}}>{cat.icon}</span> {tmp.note} ({fmt(tmp.amount)})
                    </button>
                    <button onClick={()=>deleteTemplate(tmp.id)} style={{ background:"none", border:"none", color:TH.textMid, marginLeft: 5, padding:2, cursor:"pointer" }}><X size={14}/></button>
                  </div>
                )
             })}
           </div>
         </div>
      )}
      
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <div className="glass-panel" style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 20 }}>
          <Search size={18} color={TH.textMid} style={{ flexShrink: 0 }}/>
          <input type="text" placeholder={settings.lang==='bn'?'নোট বা #ট্যাগ খুঁজুন...':'Search notes or #tags...'} value={search} onChange={e=>setSearch(e.target.value)} style={{ background:"none", border:"none", color:TH.text, outline:"none", width:"100%", fontSize:14, fontWeight:600 }}/>
        </div>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="glass-panel" style={{ width: "115px", flexShrink: 0, padding: "0 14px", borderRadius: 20, color: TH.text, fontWeight: 700, outline:"none", fontSize:13, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", cursor:"pointer" }}>
          <option value="all">All</option>
          {getCategories("expense").map(c => <option key={c.id} value={c.id}>{c.icon} {c.label[settings.lang] || c.label['en']}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredTxs.slice(0, 30).map(tx => {
          const cat = getCategories(tx.type).find(c => c.id === tx.category) || {icon:"📝", bg:"rgba(148,163,184,0.1)", label:{bn:"অন্যান্য", en:"Other"}};
          return (
            <div key={tx.id} className="tx-card glass-panel" style={{ padding: "16px 18px", borderRadius: 20, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => { setEditTxData(tx); setModal("tx"); }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{cat.icon}</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: TH.text, marginBottom: 2, display:"flex", alignItems:"center", gap:6 }}>
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
                <p style={{ fontFamily: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif", fontWeight: 800, fontSize: 15, color: tx.type === "income" ? "#10b981" : TH.text }}>{tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}</p>
                <button onClick={(e) => { e.stopPropagation(); deleteTx(tx); }} style={{ background: "none", border: "none", color: "#ef4444", padding: "4px 0 4px 8px", cursor:"pointer" }}><Trash2 size={18}/></button>
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
    const msg = settings.lang === 'bn' ? `ভাই ${debt.person}, আপনার কাছে আমার ${debt.amount}৳ পাওয়া ছিল। সময় করে পাঠিয়ে দিলে খুব উপকার হতো। ধন্যবাদ!` : `Hey ${debt.person}, just a friendly reminder about the ${debt.amount} BDT. Please send it over when you can. Thanks!`;
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
        <h3 style={{ fontWeight: 700, fontSize:14, color: TH.textMid, letterSpacing:1 }}>{settings.lang==='bn'?'ওয়ালেট':'WALLETS'}</h3>
        <div style={{ display: "flex", gap: 8 }}>
           <button onClick={()=>setTransferForm({...transferForm, show:!transferForm.show})} className="glass-panel" style={{ padding: "8px 14px", borderRadius: 12, color: TH.text, fontWeight: 700, fontSize:13, cursor:"pointer" }}><ArrowRightLeft size={14} style={{marginBottom:-2}}/> Transfer</button>
           <button onClick={()=>setWalletForm({...walletForm, show:true})} className="premium-btn" style={{ padding: "8px 14px", borderRadius: 12, fontSize:13 }}>+ Add</button>
        </div>
      </div>
      
      {transferForm.show && (
         <div className="animate-scale glass-panel" style={{ padding: 20, borderRadius: 24, display: "flex", flexDirection: "column", gap: 12 }}>
           <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
             <select value={transferForm.from} onChange={e=>setTransferForm({...transferForm, from: e.target.value})} style={{ flex:1, padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:600, fontSize:14 }}>{data.wallets.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select>
             <span style={{fontSize: 16}}>➡️</span>
             <select value={transferForm.to} onChange={e=>setTransferForm({...transferForm, to: e.target.value})} style={{ flex:1, padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:600, fontSize:14 }}>{data.wallets.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select>
           </div>
           <input type="number" placeholder={settings.lang==='bn'?'টাকার পরিমাণ':'Amount'} value={transferForm.amount} onChange={e=>setTransferForm({...transferForm, amount: e.target.value})} style={{ padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:600, fontSize:14 }} />
           <input type="text" placeholder={settings.lang==='bn'?'নোট (ঐচ্ছিক)':'Note (Optional)'} value={transferForm.note} onChange={e=>setTransferForm({...transferForm, note: e.target.value})} style={{ padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:600, fontSize:14 }} />
           <button onClick={handleTransfer} className="premium-btn" style={{ padding: 14, borderRadius: 14, fontSize: 14 }}>{settings.lang==='bn'?'ট্রান্সফার করুন':'Transfer Now'}</button>
         </div>
      )}

      {walletForm.show && (
         <div className="animate-scale glass-panel" style={{ padding: 20, borderRadius: 24, display: "flex", flexDirection: "column", gap: 12 }}>
           <div style={{ display:"flex", gap:10 }}>
             <input type="text" placeholder="Icon" value={walletForm.icon} onChange={e=>setWalletForm({...walletForm, icon: e.target.value})} style={{ width:55, padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, textAlign:"center", outline:"none", fontSize:18 }} />
             <input type="text" placeholder="Wallet Name" value={walletForm.name} onChange={e=>setWalletForm({...walletForm, name: e.target.value})} style={{ flex:1, padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:600, fontSize:14 }} />
           </div>
           <input type="number" placeholder="Initial Balance" value={walletForm.balance} onChange={e=>setWalletForm({...walletForm, balance: e.target.value})} style={{ padding: 14, borderRadius: 14, background: TH.bgInner, border: "none", color: TH.text, outline:"none", fontWeight:600, fontSize:14 }} />
           <div style={{ display:"flex", gap:10 }}>
             <button onClick={handleWalletSave} className="premium-btn" style={{ flex:1, padding: 14, borderRadius: 14, fontSize:14 }}>Save</button>
             <button onClick={()=>setWalletForm({ show: false, name: "", balance: "", icon: "💳", id: null })} style={{ flex:1, padding: 14, background: TH.bgInner, color: TH.textMid, border: "none", borderRadius: 14, fontWeight: 800, fontSize:14, cursor:"pointer" }}>Cancel</button>
           </div>
         </div>
      )}
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {data.wallets.map(w => (
          <div key={w.id} className="tx-card glass-panel" style={{ padding: "20px", borderRadius: 20, position:"relative", overflow: "hidden" }}>
            <div style={{ position:"absolute", top:-20, right:-20, width:60, height:60, background:"var(--gold-primary)", opacity:0.1, filter:"blur(20px)", borderRadius:"50%" }}></div>
            <div style={{ position:"absolute", top:14, right:14, display:"flex", gap:8, zIndex:1 }}>
              <button onClick={()=>setWalletForm({show:true, ...w})} style={{background:"none", border:"none", color:TH.textMid, cursor:"pointer"}}><Edit size={16}/></button>
              <button onClick={()=>deleteWalletSafe(w)} style={{background:"none", border:"none", color:"#ef4444", cursor:"pointer"}}><Trash2 size={16}/></button>
            </div>
            <span style={{ fontSize: 26, zIndex:1, position:"relative" }}>{w.icon}</span>
            <p style={{ fontSize: 12, fontWeight: 600, color: TH.textMid, marginTop: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{w.name}</p>
            <p style={{ fontFamily: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif", fontSize: 18, fontWeight: 800, marginTop: 2, color: TH.text, zIndex:1, position:"relative" }}>{fmt(w.balance)}</p>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
        <h3 style={{ fontWeight: 700, fontSize:14, color: TH.textMid, letterSpacing:1 }}>{settings.lang==='bn'?'ধার-দেনা':'DEBTS'}</h3>
        <button onClick={()=>setDebtForm({...debtForm, show: !debtForm.show})} className="glass-panel" style={{ padding: "8px 14px", borderRadius: 12, color: TH.text, fontWeight: 700, border:"none", fontSize:13, cursor:"pointer" }}>+ {settings.lang==='bn'?'নতুন':'New'}</button>
      </div>
      
      {debtForm.show && (
          <div className="animate-scale glass-panel" style={{ padding: 20, borderRadius: 24, display: "flex", flexDirection: "column", gap: 12 }}>
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
            <button onClick={handleAddDebt} className="premium-btn" style={{ padding: 14, borderRadius: 14, fontSize:14 }}>Save</button>
          </div>
      )}
      
      {data.debts.map(d => (
        <div key={d.id} className="tx-card glass-panel" style={{ padding: 16, borderRadius: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:42, height:42, borderRadius:12, background: d.type==='lend'?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)', display:"flex", alignItems:"center", justifyContent:"center" }}><Users size={20} color={d.type==='lend'?'#10b981':'#ef4444'}/></div>
            <div>
              <p style={{ fontWeight: 700, fontSize:15, color:TH.text, marginBottom:2 }}>{d.person}</p>
              <p style={{ fontSize: 11, color: TH.textMid, fontWeight:600 }}>{settings.lang==='bn'?'ফেরত:':'Return:'} {d.returnDate ? formatDate(d.returnDate) : 'N/A'}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif", fontWeight: 800, fontSize:15, color: TH.text }}>{fmt(d.amount)}</p>
            <button onClick={(e) => { e.stopPropagation(); sendReminder(d); }} style={{ color: "#25D366", display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              <MessageCircle size={16} />
            </button>
            <button onClick={()=>{ setConfirmDialog({ show: true, msg: settings.lang==='bn'?"হিসাব ক্লিয়ার করবেন?":"Settle this debt?", onConfirm: () => { const ws = data.wallets.map(w => w.id === d.sourceId ? { ...w, balance: d.type==='lend'? w.balance+d.amount : w.balance-d.amount } : w); setData({...data, wallets: ws, debts: data.debts.filter(x=>x.id!==d.id)}); showToast(settings.lang==='bn'?"ক্লিয়ার!":"Settled!", "success"); }}); }} style={{ padding: "6px 12px", background: TH.bgInner, color: TH.textMid, borderRadius: 10, border: `1px solid ${TH.border}`, fontWeight: 700, fontSize: 11, cursor:"pointer" }}>Settle</button>
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
      <div className="glass-panel" style={{ display: "flex", padding: 6, borderRadius: 20 }}>
        {['vault', 'goals', 'budgets'].map(t => (
          <button key={t} onClick={()=>setSubTab(t)} style={{ flex: 1, padding: "12px", borderRadius: 16, background: subTab===t ? "var(--gold-bg)" : "transparent", color: subTab===t ? "var(--gold-primary)" : TH.textMid, fontWeight: 700, border: "none", fontSize: 13, textTransform:"uppercase", transition: "0.3s", cursor:"pointer" }}>{t}</button>
        ))}
      </div>
      
      {subTab === "vault" && (
        <div className="animate-slide" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="animate-scale glass-panel" style={{ padding: 40, borderRadius: 32, textAlign: "center", position: "relative", overflow: "hidden", boxShadow: `0 15px 40px rgba(0,0,0,0.2)` }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, var(--gold-glow) 0%, transparent 70%)" }}/>
            <Landmark size={36} style={{margin:"0 auto 15px", color:TH.primary, position:"relative", zIndex:1}}/>
            <p style={{ fontWeight: 700, color: TH.textMid, letterSpacing:1.5, fontSize:10, position:"relative", zIndex:1 }}>SAVINGS VAULT</p>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif", fontSize: 42, fontWeight: 800, margin:"10px 0 25px", color: TH.text, position:"relative", zIndex:1 }}>{fmt(data.savings.balance)}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, position:"relative", zIndex:1 }}>
              <select value={vaultWallet} onChange={e=>setVaultWallet(e.target.value)} style={{ padding: 14, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, fontWeight: 700, outline:"none", fontSize:14 }}>{data.wallets.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select>
              <input type="number" placeholder="Amount" value={saveAmt} onChange={e=>setSaveAmt(e.target.value)} style={{ padding: 14, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, textAlign:"center", outline:"none", fontWeight:700, fontSize:16 }} />
              <input type="text" placeholder="Note (Optional)" value={saveNote} onChange={e=>setSaveNote(e.target.value)} style={{ padding: 14, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, textAlign:"center", outline:"none", fontWeight:600, fontSize:14 }} />
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button onClick={()=>handleVault('deposit')} className="premium-btn" style={{ flex: 1, padding: 14, borderRadius: 16, fontSize:14 }}>Deposit</button>
                <button onClick={()=>handleVault('withdraw')} style={{ flex: 1, padding: 14, background: TH.bgInner, color: TH.text, border: `1px solid ${TH.border}`, borderRadius: 16, fontWeight: 800, fontSize:14, cursor:"pointer" }}>Withdraw</button>
              </div>
            </div>
          </div>

          {(data.savings.history && data.savings.history.length > 0) && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontWeight: 700, marginBottom: 12, color: TH.textMid, fontSize: 13, textTransform: "uppercase" }}>{settings.lang==='bn'?'সাম্প্রতিক হিস্ট্রি':'Recent History'}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.savings.history.map(sv => (
                  <div key={sv.id} className="tx-card glass-panel" style={{ padding: "16px 20px", borderRadius: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ textAlign: "left" }}>
                       <p style={{ fontWeight: 700, fontSize: 15, color: TH.text }}>{sv.note}</p>
                       <p style={{ fontSize: 12, color: TH.textMid, fontWeight: 500 }}>{formatDate(sv.date)}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                       <p style={{ fontFamily: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif", fontWeight: 800, fontSize: 16, color: sv.type === 'deposit' ? "#10b981" : "#ef4444" }}>{sv.type === 'deposit' ? "+" : "-"}{fmt(sv.amount)}</p>
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
                       }} style={{ background: "none", border: "none", color: "#ef4444", padding: "4px 0 4px 8px", cursor:"pointer" }}><Trash2 size={18}/></button>
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
          {!goalForm.show && (
            <button onClick={()=>setGoalForm({...goalForm, show: true})} style={{ padding:18, background:"var(--gold-bg)", borderRadius:20, border:`1px dashed var(--gold-primary)`, color:"var(--gold-primary)", fontWeight:700, fontSize:14, cursor:"pointer" }}>+ {settings.lang==='bn'?'নতুন লক্ষ্য':'New Goal'}</button>
          )}
          
          {goalForm.show && (
            <div className="animate-scale glass-panel" style={{ padding:20, borderRadius:24, display:"flex", flexDirection:"column", gap:12, border:`1px solid var(--gold-primary)` }}>
              <input type="text" placeholder={settings.lang==='bn'?'নাম':'Name'} value={goalForm.name} onChange={e=>setGoalForm({...goalForm, name: e.target.value})} style={{ padding:14, borderRadius:14, background:TH.bgInner, color:TH.text, border:"none", outline:"none", fontWeight:600, fontSize:14 }} />
              <input type="number" placeholder={settings.lang==='bn'?'টার্গেট':'Target Amount'} value={goalForm.target} onChange={e=>setGoalForm({...goalForm, target: e.target.value})} style={{ padding:14, borderRadius:14, background:TH.bgInner, color:TH.text, border:"none", outline:"none", fontWeight:600, fontSize:14 }} />
              
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={()=>{ 
                  if(!goalForm.name || !goalForm.target) return showToast("Enter info", "error"); 
                  const newGoal = { id: goalForm.id || genId(), name: goalForm.name, target: Number(goalForm.target), note: goalForm.note, saved: goalForm.saved || 0 }; 
                  setData({ ...data, goals: goalForm.id ? data.goals.map(g=>g.id===goalForm.id?newGoal:g) : [newGoal, ...data.goals] }); 
                  setGoalForm({ show: false, name: "", target: "", note: "", id: null }); 
                }} className="premium-btn" style={{ flex: 1, padding:14, borderRadius:14, fontSize:14 }}>Save Goal</button>
                <button onClick={()=>setGoalForm({ show: false, name: "", target: "", note: "", id: null })} style={{ flex: 1, padding: 14, background: TH.bgInner, color: TH.textMid, border: "none", borderRadius: 14, fontWeight: 800, fontSize:14, cursor:"pointer" }}>Cancel</button>
              </div>
            </div>
          )}

          {data.goals.map(g => (
            <div key={g.id} className="tx-card glass-panel" style={{ padding:24, borderRadius:28 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:15 }}>
                <h4 style={{ fontWeight:700, fontSize:16, color:TH.text }}>🎯 {g.name}</h4>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={()=>setGoalForm({show:true, ...g})} style={{ color:TH.textMid, background:"none", border:"none", cursor:"pointer" }}><Edit3 size={18}/></button>
                  <button onClick={()=>setConfirmDialog({show:true, msg:"Delete Goal?", onConfirm:()=>setData({...data, goals: data.goals.filter(x=>x.id!==g.id)})})} style={{ color:"#ef4444", background:"none", border:"none", cursor:"pointer" }}><Trash2 size={18}/></button>
                </div>
              </div>
              <div style={{ height:12, background:TH.bgInner, borderRadius:10, overflow:"hidden", marginBottom:10 }}>
                <div style={{ width:`${Math.min((g.saved/g.target)*100, 100)}%`, height:"100%", background:"var(--gold-primary)", transition:"width 1s cubic-bezier(0.4, 0, 0.2, 1)", borderRadius: 10 }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:700, marginBottom:20 }}>
                <span style={{color:TH.text}}>{fmt(g.saved)}</span>
                <span style={{color:TH.textMid}}>{fmt(g.target)}</span>
              </div>
              
              {addCashId === g.id ? (
                <div className="animate-scale" style={{ display:"flex", gap:8 }}>
                  <select value={addCashWallet} onChange={e=>setAddCashWallet(e.target.value)} style={{ padding:12, borderRadius:12, background:TH.bgInner, border:"none", color:TH.text, outline:"none", flex:1, fontWeight:600, fontSize:13 }}>{data.wallets.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select>
                  <input type="number" placeholder="Amt" value={addCashAmt} onChange={e=>setAddCashAmt(e.target.value)} style={{ flex:1, padding:12, borderRadius:12, background:TH.bgInner, border:"none", color:TH.text, outline:"none", fontWeight:600, fontSize:13 }}/>
                  <button onClick={()=>handleAddGoalCash(g.id)} className="premium-btn" style={{ padding:12, borderRadius:12 }}><Check size={16}/></button>
                  <button onClick={()=>{setAddCashId(null); setAddCashAmt("");}} style={{ padding:12, borderRadius:12, background:TH.bgInner, color:TH.textMid, border:"none", fontWeight:800, cursor:"pointer" }}><X size={16}/></button>
                </div>
              ) : (
                <button onClick={()=>setAddCashId(g.id)} style={{ width:"100%", padding:14, borderRadius:14, background:"var(--gold-bg)", color:"var(--gold-primary)", fontWeight:700, border:"1px dashed var(--gold-primary)", fontSize:13, cursor:"pointer" }}>Add Cash</button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {subTab === "budgets" && (
        <div className="animate-slide" style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="glass-panel" style={{ padding:24, borderRadius:28 }}>
            <p style={{ fontWeight:700, marginBottom:15, color:TH.textMid, fontSize:13, textTransform:"uppercase" }}>{settings.lang==='bn'?'বাজেট সেট করুন':'Set Limit'}</p>
            <div style={{ display:"flex", gap:10, marginBottom:15 }}>
              <select value={budgetCat} onChange={e=>setBudgetCat(e.target.value)} style={{ flex:1, padding:14, borderRadius:14, background:TH.bgInner, color:TH.text, border:"none", fontWeight:600, outline:"none", fontSize:14 }}>
                <option value="">{settings.lang==='bn'?'ক্যাটাগরি':'Category'}</option>
                {getCategories("expense").map(c => <option key={c.id} value={c.id}>{c.icon} {c.label[settings.lang] || c.label['en']}</option>)}
              </select>
              <input type="number" placeholder="Limit" value={limitVal} onChange={e=>setLimitVal(e.target.value)} style={{ width:100, padding:14, borderRadius:14, background:TH.bgInner, color:TH.text, border:"none", textAlign:"center", fontWeight:700, outline:"none", fontSize:14 }} />
            </div>
            <button onClick={()=>{ const val=Number(limitVal); if(budgetCat && val){ setData({...data, budgets:{...data.budgets, [budgetCat]:val}}); setLimitVal(""); setBudgetCat(""); showToast("Updated", "success"); } }} className="premium-btn" style={{ width:"100%", padding:14, borderRadius:14, fontSize:14 }}>Save Budget</button>
          </div>
          
          {Object.entries(data.budgets).map(([id, lim]) => { 
            const cat = getCategories("expense").find(c => c.id === id); if(!cat) return null; 
            const spent = data.txs.filter(x => x.type === "expense" && x.category === id && x.date.startsWith(TODAY().slice(0, 7))).reduce((s, e) => s + Number(e.amount || 0), 0); 
            const percent = Math.min((spent / lim) * 100, 100); 
            const isOver = spent > lim; 
            return (
              <div key={id} className="tx-card glass-panel" style={{ padding:20, borderRadius:24, border:`1px solid ${isOver ? 'rgba(239,68,68,0.3)' : TH.border}`, display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <span style={{ fontSize:24 }}>{cat.icon}</span>
                    <div><p style={{ fontWeight:700, fontSize:15, color:TH.text }}>{cat.label[settings.lang] || cat.label['en']}</p><p style={{ fontSize:12, color:TH.textMid, fontWeight:600 }}>{fmt(spent)} / {fmt(lim)}</p></div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => { setBudgetCat(id); setLimitVal(lim); window.scrollTo({top: 0, behavior: 'smooth'}); }} style={{ color:TH.textMid, background:"none", border:"none", cursor:"pointer" }}><Edit3 size={18}/></button>
                    <button onClick={()=>setConfirmDialog({show:true, msg:"Delete Budget?", onConfirm:() => { const n={...data.budgets}; delete n[id]; setData({...data, budgets:n}); }})} style={{ color:"#ef4444", background:"none", border:"none", cursor:"pointer" }}><Trash2 size={18}/></button>
                  </div>
                </div>
                <div style={{ height:8, background:TH.bgInner, borderRadius:10, overflow:"hidden", marginTop:2 }}>
                  <div style={{ width:`${percent}%`, height:"100%", background: isOver ? "#ef4444" : "var(--gold-primary)", transition:"width 1s ease", borderRadius: 10 }} />
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
    const inc = data.txs.filter(t => t.type === "income" && t.date === s).reduce((sum, t) => sum + Number(t.amount || 0), 0); 
    const exp = data.txs.filter(t => t.type === "expense" && t.date === s).reduce((sum, t) => sum + Number(t.amount || 0), 0); 
    return { name: d.toLocaleDateString(lang==='bn'?'bn-BD':'en-US', {weekday:'short'}), income: inc, expense: exp }; 
  }), [data.txs, lang]);
  
  const monthlyData = useMemo(() => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => { 
    const y = new Date().getFullYear(); const mStr = `${y}-${String(i+1).padStart(2, '0')}`; 
    const inc = data.txs.filter(t => t.type === "income" && t.date.startsWith(mStr)).reduce((s, t) => s + Number(t.amount || 0), 0); 
    const exp = data.txs.filter(t => t.type === "expense" && t.date.startsWith(mStr)).reduce((s, t) => s + Number(t.amount || 0), 0); 
    return { name: m, income: inc, expense: exp }; 
  }), [data.txs]);

  // 🔥 নতুন হিটম্যাপ লজিক (গত ৬০ দিনের খরচ)
  const heatmapData = useMemo(() => {
    const days = [];
    const today = new Date();
    let maxExp = 0;
    const expByDate = {};
    
    // দিনের হিসেবে খরচ গ্রুপ করা
    data.txs.filter(t => t.type === 'expense').forEach(t => {
      expByDate[t.date] = (expByDate[t.date] || 0) + Number(t.amount);
    });
    
    for (let i = 59; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const exp = expByDate[dateStr] || 0;
      if(exp > maxExp) maxExp = exp;
      days.push({ date: dateStr, amount: exp });
    }
    
    // খরচের ওপর ভিত্তি করে লেভেল (০ থেকে ৪) সেট করা
    return days.map(d => {
      let level = 0;
      if (d.amount > 0) {
        if (d.amount > maxExp * 0.75) level = 4; // ডেঞ্জার জোন (সবচেয়ে গাঢ়)
        else if (d.amount > maxExp * 0.5) level = 3;
        else if (d.amount > maxExp * 0.25) level = 2;
        else level = 1; // অল্প খরচ
      }
      return { ...d, level };
    });
  }, [data.txs]);

  // Asset & Liability Calculation
  const positiveWallets = (data.wallets || []).filter(w => Number(w.balance) > 0).reduce((s, w) => s + Number(w.balance), 0);
  const negativeWallets = (data.wallets || []).filter(w => Number(w.balance) < 0).reduce((s, w) => s + Math.abs(Number(w.balance)), 0);

  const totalLent = (data.debts || []).filter(d => d.type !== 'borrow').reduce((s, d) => s + Number(d.amount || 0), 0);
  const totalBorrowed = (data.debts || []).filter(d => d.type === 'borrow').reduce((s, d) => s + Number(d.amount || 0), 0);

  const totalAssets = positiveWallets + totalLent;
  const totalLiabilities = totalBorrowed + negativeWallets;
  const netWorth = totalAssets - totalLiabilities;

  const totalIncAllTime = (data.txs || []).filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalExpAllTime = (data.txs || []).filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount || 0), 0);
  
  return (
    <div className="animate-slide" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 🔥 নতুন Heatmap অপশন মেনুতে যোগ করা হলো */}
      <div className="glass-panel" style={{ display: "flex", padding: 6, borderRadius: 20, flexWrap: "wrap" }}>
        {['breakdown', 'weekly', 'monthly', 'heatmap', 'net worth'].map(t => (
          <button key={t} onClick={()=>setGType(t)} style={{ flex: 1, minWidth: "18%", padding: "12px 2px", borderRadius: 16, background: gType===t ? "var(--gold-bg)" : "transparent", color: gType===t ? "var(--gold-primary)" : TH.textMid, fontWeight: 700, border: "none", fontSize: 11, textTransform:"uppercase", transition: "0.3s", cursor:"pointer" }}>
            {t}
          </button>
        ))}
      </div>
      
      {gType === 'net worth' ? (
         <div className="animate-scale" style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"flex", gap:14 }}>
               <div className="glass-panel" style={{ flex:1, padding:20, borderRadius:24, border:`1px solid rgba(16,185,129,0.3)` }}>
                  <p style={{fontSize:12, fontWeight:700, color:"#10b981"}}>{lang==='bn'?'মোট সম্পদ':'Total Assets'}</p>
                  <p style={{fontFamily: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif", fontSize:20, fontWeight:800, marginTop:6, color:TH.text}}>{fmt(totalAssets)}</p>
               </div>
               <div className="glass-panel" style={{ flex:1, padding:20, borderRadius:24, border:`1px solid rgba(239,68,68,0.3)` }}>
                  <p style={{fontSize:12, fontWeight:700, color:"#ef4444"}}>{lang==='bn'?'মোট দায়':'Liabilities'}</p>
                  <p style={{fontFamily:"'Plus Jakarta Sans', 'Hind Siliguri', sans-serif", fontSize:20, fontWeight:800, marginTop:6, color:TH.text}}>{fmt(totalLiabilities)}</p>
               </div>
            </div>
            <div style={{ display:"flex", gap:14 }}>
               <div className="glass-panel" style={{ flex:1, padding:16, borderRadius:20, border:`1px solid rgba(59,130,246,0.3)` }}>
                  <p style={{fontSize:11, fontWeight:700, color:"#3b82f6"}}>{lang==='bn'?'মোট আয় (সব মিলিয়ে)':'Total Income'}</p>
                  <p style={{fontFamily: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif", fontSize:16, fontWeight:800, marginTop:4, color:TH.text}}>{fmt(totalIncAllTime)}</p>
               </div>
               <div className="glass-panel" style={{ flex:1, padding:16, borderRadius:20, border:`1px solid rgba(245,158,11,0.3)` }}>
                  <p style={{fontSize:11, fontWeight:700, color:"#f59e0b"}}>{lang==='bn'?'মোট খরচ (সব মিলিয়ে)':'Total Expense'}</p>
                  <p style={{fontFamily: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif", fontSize:16, fontWeight:800, marginTop:4, color:TH.text}}>{fmt(totalExpAllTime)}</p>
               </div>
            </div>
            <div className="glass-panel" style={{ padding:30, borderRadius:28, textAlign:"center", position:"relative", overflow:"hidden" }}>
               <p style={{fontSize:13, fontWeight:700, color:TH.textMid}}>{lang==='bn'?'নেট ওয়ার্থ (আসল সম্পদ)':'Net Worth'}</p>
               <h2 style={{fontFamily: "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif", fontSize:36, fontWeight:800, margin:"10px 0", color: netWorth >= 0 ? "#10b981" : "#ef4444"}}>{fmt(netWorth)}</h2>
               <p style={{fontSize:11, fontWeight:600, color:TH.textMid}}>{lang==='bn'?'সম্পদ - দায় = আসল মূল্য':'Assets - Liabilities'}</p>
            </div>
         </div>
      ) : gType === 'heatmap' ? (
         // 🔥 হিটম্যাপ UI ডিজাইন 
         <div className="glass-panel animate-scale" style={{ padding: 25, borderRadius: 28, display:"flex", flexDirection:"column", alignItems:"center", minHeight: 400 }}>
            <h3 style={{fontSize: 15, fontWeight: 800, color: TH.text, marginBottom: 25, textAlign:"center"}}>
               {lang === 'bn' ? 'গত ৬০ দিনের খরচের চিত্র' : 'Last 60 Days Spending Heatmap'}
            </h3>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 320, width: "100%" }}>
              {heatmapData.map((d, i) => {
                const colors = [
                   TH.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', // Level 0 (খালি)
                   'rgba(239, 68, 68, 0.3)', // Level 1 (হালকা)
                   'rgba(239, 68, 68, 0.5)', // Level 2
                   'rgba(239, 68, 68, 0.8)', // Level 3
                   '#ef4444'                 // Level 4 (সবচেয়ে গাঢ়)
                ];
                return (
                  <div 
                    key={i} 
                    title={`${d.date} • ${fmt(d.amount)}`} // হোভার করলে বা চাপ দিলে ডেটা দেখাবে
                    style={{
                      width: 22, 
                      height: 22, 
                      borderRadius: 6, 
                      background: colors[d.level],
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.2)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  />
                )
              })}
            </div>
            
            {/* কালার ইনডেক্স (বুঝার সুবিধার জন্য) */}
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap: 10, marginTop: 40, fontSize: 12, color: TH.textMid, fontWeight: 700 }}>
               <span>{lang==='bn'?'কম':'Less'}</span>
               <div style={{width:14, height:14, borderRadius:4, background:TH.mode==='dark'?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'}}></div>
               <div style={{width:14, height:14, borderRadius:4, background:'rgba(239, 68, 68, 0.3)'}}></div>
               <div style={{width:14, height:14, borderRadius:4, background:'rgba(239, 68, 68, 0.5)'}}></div>
               <div style={{width:14, height:14, borderRadius:4, background:'rgba(239, 68, 68, 0.8)'}}></div>
               <div style={{width:14, height:14, borderRadius:4, background:'#ef4444'}}></div>
               <span>{lang==='bn'?'বেশি':'More'}</span>
            </div>
         </div>
      ) : (
        <div className="glass-panel" style={{ padding: 20, borderRadius: 28, minHeight: 400 }}>
          {gType === "breakdown" ? (
            <ResponsiveContainer width="100%" height={360}>
              <PieChart>
                <Pie data={getCategories("expense").map(cat => ({ name: cat.label[lang] || cat.label['en'], value: data.txs.filter(x=>x.type==="expense" && x.category===cat.id).reduce((s,e)=>s+Number(e.amount||0),0), color: cat.color })).filter(x=>x.value>0)} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
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
      <button onClick={()=>{ if(btoa(recIn.toLowerCase()) === settings.recoveryWord || recIn.toLowerCase() === settings.recoveryWord){ setSettings({...settings, pinLock:""}); onSuccess(); } else showToast("ভুল শব্দ!", "error"); }} className="premium-btn" style={{ width:"100%", maxWidth:300, padding:18, borderRadius:16, marginTop:15 }}>Unlock</button>
      <button onClick={()=>setIsForgot(false)} style={{ marginTop: 20, color: TH.textMid, background: "none", border: "none", fontWeight: 700, fontSize:14, cursor:"pointer" }}>Cancel</button>
    </div>
  );
  
  return (
    <div className="animate-fade" style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: TH.bg }}>
      <Lock size={50} color={TH.primary} style={{marginBottom: 30}}/>
      <div style={{ display: "flex", gap: 20, marginBottom: 40 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: input.length >= i ? TH.primary : TH.border, transition:"0.2s" }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {[1,2,3,4,5,6,7,8,9, "C", 0, "×"].map(k => (<button key={k} onClick={() => { if(k==="C") setInput(""); else if(k==="×") setInput(input.slice(0,-1)); else handleKey(k.toString()); }} className="glass-panel" style={{ width: 75, height: 75, borderRadius: "50%", color: TH.text, fontSize: 24, fontWeight: 800, cursor:"pointer" }}>{k}</button>))}
      </div>
      <div style={{ display: "flex", gap: 30, marginTop: 40 }}>
        <button onClick={()=>setIsForgot(true)} style={{ color: TH.textMid, background: "none", border: "none", fontWeight: 700, fontSize:14, cursor:"pointer" }}>Forgot PIN?</button>
        <button onClick={onLogout} style={{ color: "#ef4444", background: "none", border: "none", fontWeight: 700, fontSize:14, display: "flex", alignItems: "center", gap: 5, cursor:"pointer" }}><LogOut size={16}/> Logout</button>
      </div>
    </div>
  );
}

function NavBtn({ active, icon: Icon, label, onClick, TH }) { 
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor:"pointer" }}>
      <div style={{ padding: "8px 16px", borderRadius: 16, background: active ? "var(--gold-bg)" : "transparent", transition:"0.2s" }}>
        <Icon size={22} color={active ? "var(--gold-primary)" : TH.textMid} strokeWidth={active ? 2.5 : 2}/>
      </div>
      <span style={{ fontSize: 10, fontWeight: 800, color: active ? "var(--gold-primary)" : TH.textMid, letterSpacing: "0.5px" }}>{label}</span>
    </button>
  ); 
}