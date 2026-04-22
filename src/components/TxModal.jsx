import React, { useState } from 'react';
import { Loader2, Hash, X, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function TxModal({ 
  data, saveTx, deleteTx, onClose, TH, editData, 
  getCategories, lang, showToast, firebaseUser, storage 
}) {
  const [type, setType] = useState(editData?.type || "expense");
  const [f, setF] = useState(editData || { 
    date: new Date().toISOString().split('T')[0], 
    category: "", 
    amount: "", 
    walletId: data.wallets?.[0]?.id || "", 
    note: "" 
  });
  const [tagInput, setTagInput] = useState(editData?.tags ? editData.tags.join(', ') : "");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  console.log("চেক করছি ক্যাটাগরি:", getCategories ? getCategories(type) : "ফাংশনটাই নাই!");

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

      const parsedTags = tagInput
        ? tagInput.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      const success = saveTx({
        ...f,
        type: type,
        amount: Number(f.amount),
        id: editData?.id || Date.now().toString(),
        tags: parsedTags,
        imageUrl: finalUrl,
        date: f.date || new Date().toISOString()
      });

      if (success) onClose();
    } catch (err) {
      console.error(err);
      showToast(lang === 'bn' ? "ব্যর্থ হয়েছে!" : "Failed!", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade notranslate" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <div className="animate-slide" style={{ background: TH.bgCard, width: "100%", maxWidth: 400, borderRadius: 24, padding: 24, position: "relative" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ color: TH.textMain, fontWeight: 700 }}>
            {editData ? (lang === 'bn' ? 'এডিট করুন' : 'Edit') : (lang === 'bn' ? 'নতুন হিসাব' : 'New Entry')}
          </h2>
          <button onClick={onClose} style={{ color: TH.textMid, background: "none", border: "none", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {/* Type Toggle (Income / Expense) */}
        <div style={{ display: "flex", background: TH.bgInner, borderRadius: 12, padding: 4, marginBottom: 20 }}>
          <button
            onClick={() => setType("expense")}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
              background: type === "expense" ? "#ef4444" : "transparent",
              color: type === "expense" ? "#fff" : TH.textMid,
              fontWeight: 600, fontSize: "14px", cursor: "pointer", transition: "0.3s"
            }}
          >
            {lang === 'bn' ? 'ব্যয়' : 'Expense'}
          </button>
          <button
            onClick={() => setType("income")}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
              background: type === "income" ? "#22c55e" : "transparent",
              color: type === "income" ? "#fff" : TH.textMid,
              fontWeight: 600, fontSize: "14px", cursor: "pointer", transition: "0.3s"
            }}
          >
            {lang === 'bn' ? 'আয়' : 'Income'}
          </button>
        </div>

        {/* Amount Input */}
        <input 
          type="number" 
          placeholder="0"
          value={f.amount}
          onChange={(e) => setF({...f, amount: e.target.value})}
          style={{ width: "100%", fontSize: 32, fontWeight: 800, textAlign: "center", background: "none", border: "none", color: TH.primary, outline: "none", marginBottom: 20 }}
        />

        {/* Category & Wallet Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          
          {/* Category Select */}
          <select 
            value={f.category || ""} 
            onChange={(e) => setF({...f, category: e.target.value})}
            style={{ 
              padding: "14px 12px", 
              borderRadius: 12, 
              background: TH.bgInner, 
              color: TH.textMain || "#FFFFFF", 
              border: `1.5px solid ${TH.border || "#444"}`,
              fontSize: "15px",
              fontWeight: 500,
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="" disabled style={{ background: "#1E1E2D", color: "#999" }}>-- ক্যাটাগরি --</option>
            {getCategories && getCategories(type)?.map(c => (
              <option key={c.id} value={c.id} style={{ background: "#1E1E2D", color: "#FFFFFF", padding: "10px" }}>
                {c.icon} {c.label?.[lang] || c.id}
              </option>
            ))}
          </select>

          {/* Wallet Select */}
          <select 
            value={f.walletId || ""} 
            onChange={(e) => setF({...f, walletId: e.target.value})}
            style={{ 
              padding: "14px 12px", 
              borderRadius: 12, 
              background: TH.bgInner, 
              color: TH.textMain || "#FFFFFF", 
              border: `1.5px solid ${TH.border || "#444"}`,
              fontSize: "15px",
              fontWeight: 500,
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="" disabled style={{ background: "#1E1E2D", color: "#999" }}>-- ওয়ালেট --</option>
            {data.wallets && data.wallets.map(w => (
              <option key={w.id} value={w.id} style={{ background: "#1E1E2D", color: "#FFFFFF", padding: "10px" }}>
                💳 {w.name} 
              </option>
            ))}
          </select>
        </div>
      
        {/* Tags Input */}
        <div style={{ display: "flex", alignItems: "center", background: TH.bgInner, padding: "10px 15px", borderRadius: 12, marginBottom: 15 }}>
          <Hash size={16} style={{ color: TH.textMid, marginRight: 10 }} />
          <input 
            placeholder={lang === 'bn' ? "ট্যাগ (কমা দিয়ে লিখুন)" : "Tags (comma separated)"}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            style={{ background: "none", border: "none", color: TH.textMain || "#fff", outline: "none", width: "100%" }}
          />
        </div>

        {/* Save Button */}
        <button 
          onClick={handleFinalSave}
          disabled={uploading}
          style={{ width: "100%", padding: 15, borderRadius: 15, background: TH.primary, color: "#000", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", border: "none" }}
        >
          {uploading ? <Loader2 className="animate-spin" /> : (lang === 'bn' ? "সেভ করুন" : "Save Transaction")}
        </button>

      </div>
    </div>
  );
}