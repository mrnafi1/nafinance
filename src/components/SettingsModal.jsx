import React, { useState } from 'react';
import { X, Sun, Moon, LogOut, Mail } from 'lucide-react'; 

export default function SettingsModal({ 
  settings, setSettings, data, setData, onClose, TH, showToast, AUTHOR, setConfirmDialog, onLogout,
  genId, CURRENCIES, DEFAULT_DATA, DEFAULT_SETTINGS 
}) {
  // 🔥 ফিক্সড: আগের কোডে এখানে টাইপিং মিস্টেক ছিল
  const [newPin, setNewPin] = useState(""); 
  const [recovery, setRecovery] = useState(""); 
  const [newCat, setNewCat] = useState({ type: "expense", name: "", icon: "📦", color: "#8b5cf6" }); 
  
  const addCategory = () => { 
    if(!newCat.name) return showToast(settings.lang==='bn'?"নাম দিন":"Enter Name", "error"); 
    const n = { id: genId(), label: { bn: newCat.name, en: newCat.name }, icon: newCat.icon, color: newCat.color, bg: `${newCat.color}20` }; 
    setData({ ...data, customCategories: { ...data.customCategories, [newCat.type]: [...(data.customCategories[newCat.type] || []), n] } }); 
    setNewCat({ type: "expense", name: "", icon: "📦", color: "#8b5cf6" }); showToast(settings.lang==='bn'?"সফল!":"Added!", "success"); 
  };

  return (
    <div className="animate-fade" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 2000, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(8px)" }}>
      <div className="animate-slide" style={{ background: TH.bgCard, padding: "30px 25px 40px", borderRadius: "35px 35px 0 0", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", borderTop:`1px solid ${TH.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 25 }}><h2 style={{ fontWeight: 800, color:TH.text }}>{settings.lang==='bn'?'সেটিংস':'Settings'}</h2><button onClick={onClose} style={{ background: "none", border: "none", color: TH.textMid }}><X size={26}/></button></div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 15 }}>
          <button onClick={()=>setSettings({...settings, theme: "light"})} style={{ padding: 14, borderRadius: 16, background: settings.theme==='light'?TH.primary:TH.bgInner, color: settings.theme==='light'?'#000':TH.text, border: "none", fontWeight:700, fontSize:14, cursor:"pointer" }}><Sun size={16} style={{marginBottom:-3}}/> Light</button>
          <button onClick={()=>setSettings({...settings, theme: "dark"})} style={{ padding: 14, borderRadius: 16, background: settings.theme==='dark'?TH.primary:TH.bgInner, color: settings.theme==='dark'?'#000':TH.text, border: "none", fontWeight:700, fontSize:14, cursor:"pointer" }}><Moon size={16} style={{marginBottom:-3}}/> Dark</button>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 15 }}>
          <button onClick={()=>setSettings({...settings, lang: "bn"})} style={{ padding: 14, borderRadius: 16, background: settings.lang==='bn'?TH.primary:TH.bgInner, color: settings.lang==='bn'?'#000':TH.text, border: "none", fontWeight:700, fontSize:14, cursor:"pointer" }}>বাংলা</button>
          <button onClick={()=>setSettings({...settings, lang: "en"})} style={{ padding: 14, borderRadius: 16, background: settings.lang==='en'?TH.primary:TH.bgInner, color: settings.lang==='en'?'#000':TH.text, border: "none", fontWeight:700, fontSize:14, cursor:"pointer" }}>English</button>
        </div>
        
        <select value={settings.curr} onChange={e=>setSettings({...settings, curr: e.target.value})} style={{ width: "100%", padding: 16, borderRadius: 16, background: TH.bgInner, border: "none", color: TH.text, fontWeight: 700, marginBottom: 25, outline:"none", fontSize:14, cursor:"pointer" }}>
          {CURRENCIES.map(c => <option key={c.code} value={c.code} style={{ background: TH.mode === 'dark' ? '#0B1121' : '#ffffff', color: TH.text }}>{c.code} ({c.sym})</option>)}
        </select>
        
        <div style={{ padding:20, background:TH.bgInner, borderRadius:24, marginBottom:20 }}>
          <p style={{ fontWeight:700, marginBottom:12, color:TH.textMid, fontSize:12, textTransform:"uppercase" }}>{settings.lang==='bn'?'নতুন ক্যাটাগরি':'Custom Category'}</p>
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <select value={newCat.type} onChange={e=>setNewCat({...newCat, type:e.target.value})} style={{ flex: 1, padding:14, borderRadius:14, background:TH.bgCard, color:TH.text, border:"none", outline:"none", fontWeight:600, fontSize:13, cursor:"pointer" }}>
              <option value="expense" style={{ background: TH.mode === 'dark' ? '#0B1121' : '#ffffff', color: TH.text }}>{settings.lang==='bn'?'ব্যয়':'Expense'}</option>
              <option value="income" style={{ background: TH.mode === 'dark' ? '#0B1121' : '#ffffff', color: TH.text }}>{settings.lang==='bn'?'আয়':'Income'}</option>
            </select>
            <input type="text" placeholder="🍔" value={newCat.icon} onChange={e=>setNewCat({...newCat, icon:e.target.value})} style={{ width:55, padding:14, borderRadius:14, background:TH.bgCard, color:TH.text, border:"none", textAlign:"center", outline:"none" }} />
            <input type="color" value={newCat.color} onChange={e=>setNewCat({...newCat, color:e.target.value})} style={{ width:50, height:48, padding:0, border:"none", borderRadius:14, background:"none", cursor:"pointer" }} />
          </div>
          <input type="text" placeholder={settings.lang==='bn'?'নাম':'Name'} value={newCat.name} onChange={e=>setNewCat({...newCat, name:e.target.value})} style={{ width:"100%", padding:14, borderRadius:14, background:TH.bgCard, color:TH.text, border:"none", marginBottom:12, outline:"none", fontWeight:600, fontSize:14 }} />
          <button onClick={addCategory} className="premium-btn" style={{ width:"100%", padding:14, borderRadius:14, fontSize:14 }}>Add Category</button>
        </div>
        
        <div style={{ padding:20, background:TH.bgInner, borderRadius:24, marginBottom:20 }}>
          <p style={{ fontWeight:700, marginBottom:12, color:TH.textMid, fontSize:12, textTransform:"uppercase" }}>{settings.lang==='bn'?'বাজেট অ্যালার্ট লেভেল':'Budget Alert Level'}</p>
          <select 
            value={settings.budgetAlertThreshold || 80} 
            onChange={e=>setSettings({...settings, budgetAlertThreshold: Number(e.target.value)})} 
            style={{ width: "100%", padding: 14, borderRadius: 14, background: TH.bgCard, color: TH.text, border: "none", outline: "none", fontWeight: 700, fontSize: 14, cursor:"pointer" }}
          >
            {[50, 60, 70, 80, 90].map(val => (
              <option key={val} value={val} style={{ background: TH.mode === 'dark' ? '#0B1121' : '#ffffff', color: TH.text }}>
                {val}%
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ padding:20, background:TH.bgInner, borderRadius:24, marginBottom:20 }}>
          <p style={{ fontWeight:700, marginBottom:12, color:TH.textMid, fontSize:12, textTransform:"uppercase" }}>PIN SECURITY</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:12 }}>
            <input type="number" placeholder="4-Digit PIN" value={newPin} onChange={e=>setNewPin(e.target.value.slice(0,4))} style={{ width:"100%", padding:14, borderRadius:14, background:TH.bgCard, color:TH.text, border:"none", textAlign:"center", fontWeight:700, outline:"none" }} />
            <input type="text" placeholder="Secret Recovery Word" value={recovery} onChange={e=>setRecovery(e.target.value)} style={{ width:"100%", padding:14, borderRadius:14, background:TH.bgCard, color:TH.text, border:"none", textAlign:"center", fontWeight:700, outline:"none" }} />
          </div>
          <button onClick={()=>{ if(newPin.length===4 && recovery){ setSettings({...settings, pinLock: btoa(newPin), recoveryWord: btoa(recovery.toLowerCase())}); showToast("PIN Set", "success"); } }} style={{ width:"100%", padding:14, background:"#10b981", color:"#fff", border:"none", borderRadius:14, fontWeight:800, fontSize:14, cursor:"pointer" }}>Enable PIN</button>
          {settings.pinLock && <button onClick={()=>setSettings({...settings, pinLock:"", recoveryWord:""})} style={{ width:"100%", marginTop:10, color:"#ef4444", fontWeight:700, background:"none", border:"none", fontSize:14, cursor:"pointer" }}>Disable PIN</button>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 15 }}>
          <button onClick={()=>{ const blob = new Blob([JSON.stringify({data, settings})], {type: "application/json"}); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `NaFinance_Backup.json`; link.click(); showToast("Backup Success", "success"); }} style={{ padding: 14, borderRadius: 16, background: TH.bgInner, color: TH.text, fontWeight: 700, border:"none", fontSize:14, cursor:"pointer" }}>Backup</button>
          <label style={{ padding: 14, borderRadius: 16, background: TH.bgInner, color: TH.text, fontWeight: 700, textAlign:"center", cursor:"pointer", fontSize:14 }}>Restore <input type="file" style={{display:"none"}} onChange={(e)=>{ const reader = new FileReader(); reader.onload = (ev) => { try { const p = JSON.parse(ev.target.result); if(p.data) setData({...DEFAULT_DATA, ...p.data}); if(p.settings) setSettings({...DEFAULT_SETTINGS, ...p.settings}); showToast("Restore Success", "success"); } catch(err) { showToast("Invalid File", "error"); } }; reader.readAsText(e.target.files[0]); }}/></label>
        </div>
        
        <button onClick={onLogout} style={{ width: "100%", padding: 16, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: 16, fontWeight: 800, fontSize:14, marginBottom: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor:"pointer" }}><LogOut size={18}/> Log Out (Google)</button>
        
        {/* 🔥 আপডেট হওয়া Factory Reset বাটন */}
        <button 
          onClick={() => { 
            setConfirmDialog({
              show: true, 
              msg: settings.lang === 'bn' ? "সব ডেটা মুছে যাবে! নিশ্চিত?" : "Are you sure to Reset?", 
              onConfirm: () => {
                setData(DEFAULT_DATA); // ডেটাবেস জিরো করে দিবে
                setSettings(DEFAULT_SETTINGS); // সেটিংস ডিফল্ট করে দিবে
                onClose(); // পপ-আপ বন্ধ করবে
                showToast(settings.lang === 'bn' ? "সব ডেটা সফলভাবে মুছে ফেলা হয়েছে!" : "Factory reset successful!", "success");
              }
            });
          }} 
          style={{ width: "100%", padding: 16, background: "transparent", color: TH.textMid, border: `1px solid ${TH.border}`, borderRadius: 16, fontWeight: 700, fontSize:14, cursor:"pointer" }}
        >
          Factory Reset
        </button>
        
        <div className="animate-scale" style={{ marginTop: 30, padding: 20, background: "linear-gradient(145deg, rgba(251,191,36,0.1), rgba(251,191,36,0.02))", borderRadius: 24, border: `1px solid rgba(251,191,36,0.3)`, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 55, height: 55, borderRadius: 18, background: TH.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: "0 8px 20px rgba(251,191,36,0.4)" }}>
            👨‍💻
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: TH.primary, fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>Developer & Creator</p>
            <h3 style={{ fontSize: 17, fontWeight: 900, color: TH.text, letterSpacing: "-0.5px" }}>{AUTHOR}</h3>
            <a href="mailto:mushfiqurnafi@gmail.com" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: TH.textMid, fontWeight: 600, marginTop: 4, textDecoration: "none" }}>
              <Mail size={14} color={TH.primary} /> mushfiqurnafi@gmail.com
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}