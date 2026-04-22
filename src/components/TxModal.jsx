import React, { useState, useEffect } from 'react';
import { Trash2, Loader2, Hash, MessageCircle, X, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function TxModal({ 
  data, saveTx, deleteTx, onClose, TH, editData, 
  getCategories, lang, showToast, firebaseUser, storage 
}) {
  const [type, setType] = useState(editData?.type || "expense");
  const [f, setF] = useState(editData || { 
    date: new Date().toISOString().split('T')[0], 
    category: "Food", 
    amount: "", 
    walletId: data.wallets[0]?.id, 
    note: "" 
  });
  const [tagInput, setTagInput] = useState(editData?.tags ? editData.tags.join(', ') : "");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFinalSave = async () => {
    // ফিক্স ৩: এমাউন্ট চেক
    if (!f.amount || Number(f.amount) <= 0) {
      showToast(lang === 'bn' ? "সঠিক পরিমাণ দিন!" : "Enter a valid amount", "error");
      return;
    }

    setUploading(true);
    let finalUrl = f.imageUrl || null;

    try {
      // ফিক্স ২: ছবি আপলোড
      if (file && firebaseUser && storage) {
        const fileRef = ref(storage, `receipts/${firebaseUser.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        finalUrl = await getDownloadURL(fileRef);
      }

      // ফিক্স ১: ট্যাগগুলোকে আলাদা করা
      const parsedTags = tagInput
        ? tagInput.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      // সব ডাটা একসাথে সেভ
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
      showToast(lang === 'bn' ? "ব্যর্থ হয়েছে!" : "Failed!", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade notranslate" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <div className="animate-slide" style={{ background: TH.bgCard, width: "100%", maxWidth: 400, borderRadius: 24, padding: 24, position: "relative" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ color: TH.textMain, fontWeight: 700 }}>{editData ? (lang === 'bn' ? 'এডিট করুন' : 'Edit') : (lang === 'bn' ? 'নতুন হিসাব' : 'New Entry')}</h2>
          <button onClick={onClose} style={{ color: TH.textMid }}><X size={20}/></button>
        </div>

        {/* Amount Input */}
        <input 
          type="number" 
          placeholder="0"
          value={f.amount}
          onChange={(e) => setF({...f, amount: e.target.value})}
          style={{ width: "100%", fontSize: 32, fontWeight: 800, textAlign: "center", background: "none", border: "none", color: TH.primary, outline: "none", marginBottom: 20 }}
        />

        {/* Category & Wallet */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 15 }}>
          <select 
            value={f.category} 
            onChange={(e) => setF({...f, category: e.target.value})}
            style={{ padding: 12, borderRadius: 12, background: TH.bgInner, color: TH.textMain, border: "none" }}
          >
            {getCategories(type).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select 
            value={f.walletId} 
            onChange={(e) => setF({...f, walletId: e.target.value})}
            style={{ padding: 12, borderRadius: 12, background: TH.bgInner, color: TH.textMain, border: "none" }}
          >
            {data.wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>

        {/* Tags Input */}
        <div style={{ display: "flex", alignItems: "center", background: TH.bgInner, padding: "10px 15px", borderRadius: 12, marginBottom: 15 }}>
          <Hash size={16} style={{ color: TH.textMid, marginRight: 10 }} />
          <input 
            placeholder={lang === 'bn' ? "ট্যাগ (কমা দিয়ে লিখুন)" : "Tags (comma separated)"}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            style={{ background: "none", border: "none", color: TH.textMain, outline: "none", width: "100%" }}
          />
        </div>

        {/* File Upload UI */}
        <label style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, background: TH.bgInner, borderRadius: 12, cursor: "pointer", marginBottom: 20 }}>
          <ImageIcon size={18} style={{ color: file ? TH.primary : TH.textMid }} />
          <span style={{ fontSize: 13, color: file ? TH.primary : TH.textMid }}>
            {file ? file.name : (lang === 'bn' ? "রিসিট যোগ করুন (ঐচ্ছিক)" : "Add Receipt")}
          </span>
          <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} accept="image/*" />
        </label>

        {/* Save Button */}
        <button 
          onClick={handleFinalSave}
          disabled={uploading}
          style={{ width: "100%", padding: 15, borderRadius: 15, background: TH.primary, color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
        >
          {uploading ? <Loader2 className="animate-spin" /> : (lang === 'bn' ? "সেভ করুন" : "Save Transaction")}
        </button>

      </div>
    </div>
  );
}