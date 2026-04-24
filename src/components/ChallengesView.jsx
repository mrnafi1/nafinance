import React, { useState } from 'react';
import { Plus, Trash2, Trophy, Target, X, ArrowDownCircle } from 'lucide-react';

export default function ChallengesView({ data, setData, fmt, TH, lang, showToast, setConfirmDialog }) {
  const [showForm, setShowForm] = useState(false);
  const [cName, setCName] = useState("");
  const [cTarget, setCTarget] = useState("");
  const [cWeeks, setCWeeks] = useState("");

  // টাকা জমার জন্য স্টেট
  const [depoId, setDepoId] = useState(null);
  const [depoAmt, setDepoAmt] = useState("");

  const [depoWallet, setDepoWallet] = useState(data.wallets?.[0]?.id || "");

  const challenges = data.challenges || [];

  const handleAdd = () => {
    if (!cName || !cTarget || !cWeeks) {
      showToast(lang === 'bn' ? "সব তথ্য দিন!" : "Fill all fields!", "error");
      return;
    }

    const newChallenge = {
      id: Date.now().toString(),
      title: cName,
      target: Number(cTarget),
      weeks: Number(cWeeks),
      saved: 0, // 🔥 শুরু হবে শূন্য থেকে
      startDate: new Date().toISOString()
    };

    setData({ ...data, challenges: [newChallenge, ...challenges] });
    setShowForm(false);
    setCName(""); setCTarget(""); setCWeeks("");
    showToast(lang === 'bn' ? "নতুন চ্যালেঞ্জ শুরু হয়েছে!" : "New Challenge Started!", "success");
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      show: true,
      msg: lang === 'bn' ? "চ্যালেঞ্জটি ডিলিট করতে চান?" : "Are you sure you want to delete this challenge?",
      onConfirm: () => {
        // ডিলিট করার লজিক
        setData({ ...data, challenges: challenges.filter(c => c.id !== id) });
        showToast(lang === 'bn' ? "মুছে ফেলা হয়েছে" : "Deleted", "success");

        // কাজ শেষ হলে ডায়ালগ বন্ধ করা
        setConfirmDialog({ show: false });
      }
    });
  };

  // 🔥 চ্যালেঞ্জে টাকা জমা দেওয়ার ফাংশন
  const handleDeposit = (c) => {
    const amt = Number(depoAmt);
    if (!amt || amt <= 0) {
      showToast(lang === 'bn' ? "সঠিক এমাউন্ট দিন!" : "Enter valid amount!", "error");
      return;
    }

    const walletIdx = data.wallets.findIndex(w => w.id === depoWallet);
    if (walletIdx === -1 || data.wallets[walletIdx].balance < amt) {
      showToast(lang === 'bn' ? "ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!" : "Insufficient balance in wallet!", "error");
      return;
    }

    // ১. ওয়ালেট থেকে টাকা কাটা
    const updatedWallets = [...data.wallets];
    updatedWallets[walletIdx] = {
      ...updatedWallets[walletIdx],
      balance: Number(updatedWallets[walletIdx].balance) - Number(amt)
    };

    // ২. হিসাব মেলানোর জন্য ট্রানজেকশনে একটা এন্ট্রি করা (Expense হিসেবে)
    const newTx = {
      id: Date.now().toString(),
      type: 'expense',
      amount: Number(amt),
      walletId: depoWallet,
      category: 'other_ex',
      date: new Date().toISOString().split('T')[0],
      note: `চ্যালেঞ্জে জমা: ${c.title}`
    };

    // ৩. চ্যালেঞ্জের জমানো টাকা (saved) আপডেট করা
    const updatedChallenges = challenges.map(ch =>
      ch.id === c.id ? { ...ch, saved: (ch.saved || 0) + amt } : ch
    );

    // সব ডেটা একসাথে সেভ করা
    setData({
      ...data,
      wallets: updatedWallets,
      txs: [newTx, ...data.txs],
      challenges: updatedChallenges
    });

    setDepoId(null);
    setDepoAmt("");
    showToast(lang === 'bn' ? `সফলভাবে ${fmt(amt)} জমা হয়েছে!` : `Deposited ${fmt(amt)} successfully!`, "success");
  }; // <--- handleDeposit ঠিক এখানে শেষ হলো

  // মেইন ফাংশনের রিটার্ন শুরু
  return (
    <div className="animate-slide" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ color: TH.text, fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <Trophy size={20} color="#fbbf24" />
          {lang === 'bn' ? 'সেভিংস চ্যালেঞ্জ' : 'Savings Challenges'}
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ background: TH.primary, color: "#000", border: "none", padding: "8px 16px", borderRadius: 14, fontWeight: 800, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? (lang === 'bn' ? 'বাতিল' : 'Cancel') : (lang === 'bn' ? 'নতুন' : 'Add New')}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel animate-scale" style={{ padding: 20, borderRadius: 24, border: `1px solid ${TH.primary}50` }}>
          <p style={{ fontWeight: 800, color: TH.text, marginBottom: 15 }}>{lang === 'bn' ? 'কাস্টম চ্যালেঞ্জ তৈরি করুন' : 'Create Custom Challenge'}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="text" placeholder={lang === 'bn' ? 'চ্যালেঞ্জের নাম (যেমন: ল্যাপটপ ফান্ড)' : 'Challenge Name'} value={cName} onChange={(e) => setCName(e.target.value)} style={{ width: "100%", padding: 14, borderRadius: 14, background: TH.bgInner, color: TH.text, border: "none", outline: "none", fontWeight: 600, fontSize: 14 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <input type="number" placeholder={lang === 'bn' ? 'লক্ষ্য (টাকা)' : 'Target Amount'} value={cTarget} onChange={(e) => setCTarget(e.target.value)} style={{ flex: 1, padding: 14, borderRadius: 14, background: TH.bgInner, color: TH.text, border: "none", outline: "none", fontWeight: 600, fontSize: 14 }} />
              <input type="number" placeholder={lang === 'bn' ? 'কত সপ্তাহ?' : 'How many weeks?'} value={cWeeks} onChange={(e) => setCWeeks(e.target.value)} style={{ flex: 1, padding: 14, borderRadius: 14, background: TH.bgInner, color: TH.text, border: "none", outline: "none", fontWeight: 600, fontSize: 14 }} />
            </div>
            <button onClick={handleAdd} style={{ width: "100%", padding: 14, borderRadius: 14, background: "#10b981", color: "#fff", border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer", marginTop: 5 }}>
              {lang === 'bn' ? 'চ্যালেঞ্জ শুরু করুন 🚀' : 'Start Challenge 🚀'}
            </button>
          </div>
        </div>
      )}

      {challenges.length === 0 && !showForm ? (
        <div style={{ textAlign: "center", padding: "40px 20px", background: TH.bgCard, borderRadius: 24, border: `1px dashed ${TH.border}` }}>
          <Target size={40} color={TH.textMid} style={{ marginBottom: 10, opacity: 0.5 }} />
          <p style={{ color: TH.textMid, fontWeight: 600 }}>{lang === 'bn' ? 'কোনো চ্যালেঞ্জ নেই। নতুন একটি শুরু করুন!' : 'No active challenges. Start one!'}</p>
        </div>
      ) : (
        challenges.map((c) => {
          const savedAmt = c.saved || 0;
          const progressPercent = Math.min((savedAmt / c.target) * 100, 100);
          const weeklyAmount = c.target / c.weeks;

          return (
            <div key={c.id} className="glass-panel animate-scale" style={{ padding: 20, borderRadius: 24, position: "relative" }}>
              <button onClick={() => handleDelete(c.id)} style={{ position: "absolute", top: 15, right: 15, background: "rgba(239,68,68,0.1)", border: "none", color: "#ef4444", padding: 8, borderRadius: 10, cursor: "pointer" }}>
                <Trash2 size={16} />
              </button>

              <div style={{ marginBottom: 12 }}>
                <p style={{ fontWeight: 800, color: TH.text, fontSize: 16 }}>{c.title}</p>
                <p style={{ fontSize: 12, color: TH.textMid, marginTop: 4, display: "flex", gap: 10 }}>
                  <span>🎯 {lang === 'bn' ? 'লক্ষ্য:' : 'Target:'} {fmt(c.target)}</span>
                  <span>⏳ {c.weeks} {lang === 'bn' ? 'সপ্তাহ' : 'Weeks'}</span>
                </p>
                <p style={{ fontSize: 11, color: TH.textMid, marginTop: 4, fontStyle: "italic" }}>
                   {lang === 'bn' ? 'সাপ্তাহিক লক্ষ্য:' : 'Weekly Target:'} {fmt(weeklyAmount)}
                </p>
              </div>

              <div style={{ height: 8, background: TH.bgInner, borderRadius: 10, overflow: "hidden", margin: "15px 0" }}>
                <div style={{ width: `${Math.max(progressPercent, 0)}%`, height: '100%', background: progressPercent >= 100 ? '#10b981' : 'linear-gradient(90deg, #fbbf24, #f59e0b)', borderRadius: 10, transition: "width 0.5s ease" }}></div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: progressPercent >= 100 ? "#10b981" : TH.textMid }}>
                  {progressPercent >= 100
                    ? (lang === 'bn' ? '🎉 চ্যালেঞ্জ সম্পন্ন!' : '🎉 Completed!')
                    : `${fmt(savedAmt)} ${lang === 'bn' ? 'জমা হয়েছে' : 'Saved'}`
                  }
                </p>

                {progressPercent < 100 && (
                  <button
                    onClick={() => setDepoId(depoId === c.id ? null : c.id)}
                    style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(16,185,129,0.1)", color: "#10b981", border: "none", padding: "6px 12px", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                  >
                    <ArrowDownCircle size={14} /> {lang === 'bn' ? 'জমা দিন' : 'Deposit'}
                  </button>
                )}
              </div>

              {depoId === c.id && (
                <div style={{ marginTop: 15, padding: 15, background: TH.bgInner, borderRadius: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: TH.text }}>{lang === 'bn' ? 'কত টাকা জমা দিবেন?' : 'Enter Amount to Deposit:'}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="number" placeholder={lang === 'bn' ? 'এমাউন্ট' : 'Amount'} value={depoAmt} onChange={e => setDepoAmt(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", background: TH.bgCard, color: TH.text, outline: "none", fontWeight: 600 }} />
                    <select value={depoWallet} onChange={e => setDepoWallet(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", background: TH.bgCard, color: TH.text, outline: "none", fontWeight: 600 }}>
                      {data.wallets.map(w =>(<option key={w.id} value={w.id} style={{ background: TH.bgCard }}>{w.name} ({fmt(w.balance)}) </option>))}
                    </select>
                  </div>
                  <button onClick={() => handleDeposit(c)} style={{ width: "100%", padding: 10, borderRadius: 10, background: "#10b981", color: "#fff", border: "none", fontWeight: 800, cursor: "pointer" }}>
                    {lang === 'bn' ? 'নিশ্চিত করুন' : 'Confirm Deposit'}
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
} // <--- মেইন ফাংশন ChallengesView এখানে শেষ