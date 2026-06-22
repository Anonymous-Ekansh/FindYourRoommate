"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Settings.module.css";

export default function Settings() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [accountData, setAccountData] = useState({
    name: "",
    email: "",
    photo_url: "",
  });

  const [contactData, setContactData] = useState({
    share_pref: "",
    phone: "",
    instagram: "",
  });

  const [savingContact, setSavingContact] = useState(false);
  const [savedContact, setSavedContact] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      // Fetch profile for share_pref, name, photo_url
      const { data: profile } = await supabase
        .from('profiles')
        .select('share_pref, name, photo_url')
        .eq('id', user.id)
        .single();

      // Fetch contact_info for phone, instagram
      const { data: contact } = await supabase
        .from('contact_info')
        .select('phone, instagram')
        .eq('user_id', user.id)
        .single();

      setAccountData({
        name: profile?.name || "Your Name",
        email: user.email,
        photo_url: profile?.photo_url || "",
      });

      setContactData({
        share_pref: profile?.share_pref || "",
        phone: contact?.phone || "",
        instagram: contact?.instagram || "",
      });

      setLoading(false);
    }
    fetchData();
  }, [supabase, router]);

  const handleContactChange = (field, value) => {
    setContactData(prev => ({ ...prev, [field]: value }));
    setSavedContact(false);
  };

  const saveContactInfo = async () => {
    if (!userId) return;
    setSavingContact(true);
    setError("");

    try {
      // Update share_pref in profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ share_pref: contactData.share_pref })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Upsert contact_info
      const { error: contactError } = await supabase
        .from('contact_info')
        .upsert({
          user_id: userId,
          phone: (contactData.share_pref === 'phone' || contactData.share_pref === 'both') ? contactData.phone : null,
          instagram: (contactData.share_pref === 'instagram' || contactData.share_pref === 'both') ? contactData.instagram : null,
        });

      if (contactError) throw contactError;

      setSavedContact(true);
      setTimeout(() => setSavedContact(false), 2000);
    } catch (err) {
      console.error(err);
      setError("Failed to save contact settings.");
    } finally {
      setSavingContact(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
    setDeleting(true);

    try {
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;

      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete account.");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return null;

  return (
    <div className={styles.pageContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <Link href="/profile/me" className={styles.backBtn}>
          ← back to my profile
        </Link>
      </div>

      <h1 className={styles.pageTitle}>Settings</h1>

      <div className={styles.content}>
        
        {/* 1. Who sees what */}
        <section className={`${styles.card} ${styles.cardRotate1}`}>
          <h2 className={styles.sectionTitle}>Who sees what</h2>
          <p className={styles.explainerText}>
            only people you match with can see this. nobody else. pinky promise. 🤙
          </p>

          <div className={styles.pillGroup}>
            {['phone', 'instagram', 'both'].map(opt => (
              <button
                key={opt}
                className={`${styles.pill} ${contactData.share_pref === opt ? styles.pillSelected : ''}`}
                onClick={() => handleContactChange('share_pref', opt)}
              >
                {opt === 'phone' ? 'Phone Number' : opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>

          {(contactData.share_pref === 'phone' || contactData.share_pref === 'both') && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Phone Number</label>
              <input
                type="tel"
                className={styles.input}
                value={contactData.phone}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                placeholder="+91..."
              />
            </div>
          )}

          {(contactData.share_pref === 'instagram' || contactData.share_pref === 'both') && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Instagram Handle</label>
              <input
                type="text"
                className={styles.input}
                value={contactData.instagram}
                onChange={(e) => handleContactChange('instagram', e.target.value)}
                placeholder="@handle"
              />
            </div>
          )}

          <div className={styles.saveRow}>
            <button className={styles.saveBtn} onClick={saveContactInfo} disabled={savingContact}>
              {savingContact ? 'Saving...' : 'Save'}
            </button>
            <span className={`${styles.savedText} ${savedContact ? styles.savedTextVisible : ''}`}>
              saved ✓
            </span>
          </div>
          {error && <div className={styles.errorText}>{error}</div>}
        </section>

        {/* 2. Account */}
        <section className={`${styles.card} ${styles.cardRotate2}`}>
          <h2 className={styles.sectionTitle}>Account</h2>
          
          <div className={styles.accountRow}>
            {accountData.photo_url ? (
              <img src={accountData.photo_url} alt="Profile" className={styles.accountAvatar} />
            ) : (
              <div className={styles.accountAvatarPlaceholder}></div>
            )}
            <div className={styles.accountDetails}>
              <span className={styles.accountName}>{accountData.name}</span>
              <span className={styles.accountEmail}>{accountData.email}</span>
            </div>
          </div>

          <div className={styles.accountActions}>
            <Link href="/profile/me" className={styles.editProfileLink}>
              Edit full profile →
            </Link>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Log out
            </button>
          </div>
        </section>

        {/* 3. Danger Zone */}
        <section className={`${styles.dangerCard} ${styles.cardRotate3}`}>
          <h2 className={styles.dangerTitle}>Danger Zone</h2>
          <p className={styles.dangerText}>
            your future roommate will never know what could have been
          </p>
          <button className={styles.deleteBtn} onClick={() => setShowDeleteModal(true)}>
            Delete my account
          </button>
        </section>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>are you sure?</h3>
            <p className={styles.modalText}>
              this deletes everything. your future roommate will be devastated (maybe).
            </p>
            <div className={styles.modalButtons}>
              <button
                className={`${styles.modalBtn} ${styles.modalBtnCancel}`}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className={`${styles.modalBtn} ${styles.modalBtnDelete}`}
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete it all"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}