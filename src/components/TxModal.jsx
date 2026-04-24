import React, { useState } from 'react';
import { Loader2, Hash, X, Calendar, LayoutGrid, Wallet, FileText } from 'lucide-react'; // 🔥 FileText আইকন অ্যাড করা হয়েছে
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function TxModal({ 
  data, saveTx, deleteTx, onClose, TH, editData, 
  getCategories, lang, showToast, firebaseUser, storage 
}) {
  const [type, setType] = useState(editData?.type || "expense");
  const [f, setF] = useState(editData || { 
    date: new Date().toISOString().split('T')[0], category: "", amount: "", walletId: data.wallets?.[0]?.id || "", note: "" // 🔥 note ডিফাইন করা আছে
  });
  const [tagInput, setTagInput] = useState(editData?.tags ? editData.tags.join(', ') : "");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFinalSave = async () => {
    if (!f.amount || Number(f.amount) <= 0) {
      showToast(lang === 'bn' ? "সঠিক পরিমাণ দিন!" : "Enter a valid amount", "error");
      return;
    }
    setUploading(true);
    let finalUrl = f.imageUrl || null;
    try {
      if (file && firebaseUser && storage) {
        const fileRef = ref(storage, `receipts/${firebaseUser.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        finalUrl = await getDownloadURL(fileRef);
      }
      const parsedTags = tagInput ? tagInput.split(',').map(t => t.trim()).filter(Boolean) : [];
      // 🔥 f (যার ভেতর note আছে) সেটা সহ সব ডেটা সেভ হচ্ছে
    // যদি editData থাকে তবে তার আইডি ব্যবহার হবে, না থাকলে নতুন আইডি তৈরি হবে
      const finalId = editData?.id ? editData.id : Date.now().toString();
      saveTx({
        ...f,
        type,
        amount: Number(f.amount),
        id: finalId,
        tags: parsedTags,
        imageUrl: finalUrl,
        date: f.date 
      }, editData);

      // ডেটা সেভ হওয়ার পর ফর্ম খালি করে উইন্ডো বন্ধ করার কমান্ড
      setF({ amount: "", note: "" }); 
      setTagInput("");
      setFile(null);
      onClose();

    } catch (err) {
      showToast(lang === 'bn' ? "ব্যর্থ হয়েছে!" : "Failed!", "error");
    } finally {
      setUploading(false);
    }
  }
  
  return (
    <div className="animate-fade notranslate" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div className="animate-slide glass-panel" style={{ background: TH.bgCard, width: "100%", maxWidth: 400, borderRadius: 28, padding: 24, position: "relative", boxShadow: '0 25px 50px rgba(0,0,0,0.5)', border: `1px solid ${TH.border}` }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ color: TH.text, fontWeight: 800, fontSize: 18 }}>{editData ? (lang === 'bn' ? 'এডিট করুন' : 'Edit Transaction') : (lang === 'bn' ? 'নতুন হিসাব' : 'New Entry')}</h2>
          <button onClick={onClose} style={{ color: TH.textMid, background: TH.bgInner, border: "none", borderRadius: "50%", padding: 6, cursor: "pointer", display: "flex" }}><X size={20}/></button>
        </div>

        <div style={{ display: "flex", background: TH.bgInner, borderRadius: 16, padding: 6, marginBottom: 20, border: `1px solid ${TH.border}` }}>
          <button onClick={() => { setType("expense"); setF({...f, amount: "", category: ""}); }} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "none", background: type === "expense" ? "#ef4444" : "transparent", color: type === "expense" ? "#fff" : TH.textMid, fontWeight: 700, fontSize: "14px", transition: "0.3s" }}>
            {lang === 'bn' ? 'ব্যয় (Expense)' : 'Expense'}
          </button>
          <button onClick={() => { setType("income"); setF({...f, amount: "", category: ""}); }} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "none", background: type === "income" ? "#10b981" : "transparent", color: type === "income" ? "#fff" : TH.textMid, fontWeight: 700, fontSize: "14px", transition: "0.3s" }}>
            {lang === 'bn' ? 'আয় (Income)' : 'Income'}
          </button>
        </div>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <input type="number" placeholder="0" value={f.amount} onChange={(e) => setF({...f, amount: e.target.value})} style={{ width: "100%", fontSize: 42, fontFamily: "'DM Sans', sans-serif", fontWeight: 800, textAlign: "center", background: "none", border: "none", color: type === "income" ? "#10b981" : "#ef4444", outline: "none" }} />
          <p style={{ color: TH.textMid, fontSize: 12, fontWeight: 600 }}>{lang === 'bn' ? 'পরিমাণ (BDT)' : 'Amount (BDT)'}</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", background: TH.bgInner, padding: "14px 16px", borderRadius: 16, marginBottom: 15, border: `1px solid ${TH.border}` }}>
          <Calendar size={18} style={{ color: TH.primary, marginRight: 12 }} />
          <input type="date" value={f.date} onChange={(e) => setF({...f, date: e.target.value})} style={{ background: "none", border: "none", color: TH.text, outline: "none", width: "100%", fontSize: "15px", fontWeight: 600, colorScheme: TH.mode === 'dark' ? 'dark' : 'light' }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 15 }}>
          <div style={{ display: "flex", alignItems: "center", background: TH.bgInner, padding: "8px 12px", borderRadius: 16, border: `1px solid ${TH.border}` }}>
            <LayoutGrid size={16} style={{ color: "#8b5cf6", marginRight: 8, flexShrink: 0 }} />
            <select value={f.category || ""} onChange={(e) => setF({...f, category: e.target.value})} style={{ width: "100%", padding: "6px 0", background: "transparent", color: TH.text, border: "none", fontSize: "14px", fontWeight: 600, outline: "none" }}>
              <option value="" disabled style={{ background: TH.mode === 'dark' ? '#0B1121' : '#ffffff', color: TH.textMid }}>{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</option>
              {getCategories && getCategories(type)?.map(c => <option key={c.id} value={c.id} style={{background: TH.mode === 'dark' ? '#0B1121' : '#ffffff', color: TH.text}}>{c.icon} {c.label?.[lang] || c.id}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", background: TH.bgInner, padding: "8px 12px", borderRadius: 16, border: `1px solid ${TH.border}` }}>
            <Wallet size={16} style={{ color: "#3b82f6", marginRight: 8, flexShrink: 0 }} />
            <select value={f.walletId || ""} onChange={(e) => setF({...f, walletId: e.target.value})} style={{ width: "100%", padding: "6px 0", background: "transparent", color: TH.text, border: "none", fontSize: "14px", fontWeight: 600, outline: "none" }}>
              <option value="" disabled style={{ background: TH.mode === 'dark' ? '#0B1121' : '#ffffff', color: TH.textMid }}>{lang === 'bn' ? 'ওয়ালেট' : 'Wallet'}</option>
              {data.wallets && data.wallets.map(w => <option key={w.id} value={w.id} style={{background: TH.mode === 'dark' ? '#0B1121' : '#ffffff', color: TH.text}}>{w.icon} {w.name}</option>)}
            </select>
          </div>
        </div>
      
        {/* 🔥 নতুন নোট (Note) ফিল্ড বসানো হলো */}
        <div style={{ display: "flex", alignItems: "center", background: TH.bgInner, padding: "14px 16px", borderRadius: 16, marginBottom: 15, border: `1px solid ${TH.border}` }}>
          <FileText size={18} style={{ color: "#ec4899", marginRight: 12 }} />
          <input placeholder={lang === 'bn' ? "বিবরণ বা নোট লিখুন (ঐচ্ছিক)" : "Add a note (optional)"} value={f.note || ""} onChange={(e) => setF({...f, note: e.target.value})} style={{ background: "none", border: "none", color: TH.text, outline: "none", width: "100%", fontSize: "15px", fontWeight: 500 }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", background: TH.bgInner, padding: "14px 16px", borderRadius: 16, marginBottom: 24, border: `1px solid ${TH.border}` }}>
          <Hash size={18} style={{ color: "#f59e0b", marginRight: 12 }} />
          <input placeholder={lang === 'bn' ? "ট্যাগ লিখুন (কমা দিয়ে)" : "Tags (comma separated)"} value={tagInput} onChange={(e) => setTagInput(e.target.value)} style={{ background: "none", border: "none", color: TH.text, outline: "none", width: "100%", fontSize: "15px", fontWeight: 500 }} />
        </div>

        <button onClick={handleFinalSave} disabled={uploading} className="premium-btn" style={{ width: "100%", padding: 16, borderRadius: 16, fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          {uploading ? <Loader2 className="animate-spin" color="var(--btn-text)" /> : (lang === 'bn' ? "সংরক্ষণ করুন" : "Save Transaction")}
        </button>

      </div>
    </div>
  );
}