"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./MyProfile.module.css";

const DotsDisplay = ({ value }) => {
  return (
    <div className={styles.dotsWrapper}>
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          className={`${styles.dot} ${dot <= value ? styles.dotFilled : ''}`}
        />
      ))}
    </div>
  );
};

const SquigglyLine = () => (
  <svg className={styles.squigglyUnderline} viewBox="0 0 200 8" preserveAspectRatio="none">
    <path
      d="M0 4 Q10 0 20 4 T40 4 T60 4 T80 4 T100 4 T120 4 T140 4 T160 4 T180 4 T200 4"
      fill="none"
      stroke="var(--coral-red)"
      strokeWidth="2.5"
    />
  </svg>
);

export default function MyProfile() {
  const router = useRouter();
  const photoInputRef = useRef(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    year: "",
    branch: "",
    about_me: "",
    photo_url: "",
    sleep_schedule: "",
    study_habits: "",
    cleanliness: 3,
    noise_tolerance: 3,
    social_battery: 3,
    guest_frequency: 3,
    smoking: false,
    drinking: false,
    food_preference: "",
    budget_min: "",
    budget_max: "",
    share_pref: "",
    phone: "",
    instagram: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Fetch contact info
      const { data: contactData } = await supabase
        .from('contact_info')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setFormData({
          name: profileData.name || "",
          gender: profileData.gender || "",
          year: profileData.year || "",
          branch: profileData.branch || "",
          about_me: profileData.about_me || "",
          photo_url: profileData.photo_url || "",
          sleep_schedule: profileData.sleep_schedule || "",
          study_habits: profileData.study_habits || "",
          cleanliness: profileData.cleanliness || 3,
          noise_tolerance: profileData.noise_tolerance || 3,
          social_battery: profileData.social_battery || 3,
          guest_frequency: profileData.guest_frequency || 3,
          smoking: profileData.smoking || false,
          drinking: profileData.drinking || false,
          food_preference: profileData.food_preference || "",
          budget_min: profileData.budget_min || "",
          budget_max: profileData.budget_max || "",
          share_pref: profileData.share_pref || "",
          phone: contactData?.phone || "",
          instagram: contactData?.instagram || "",
        });
      }

      setLoading(false);
    }

    fetchProfile();
  }, [supabase, router]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !userId) return;

    try {
      setSaving(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('profile-photos').getPublicUrl(filePath);
      handleChange("photo_url", data.publicUrl);
    } catch (err) {
      console.error(err);
      setError("Failed to upload photo.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError("");

    try {
      const profileUpdate = {
        name: formData.name,
        gender: formData.gender,
        year: formData.year,
        branch: formData.branch,
        about_me: formData.about_me,
        photo_url: formData.photo_url,
        sleep_schedule: formData.sleep_schedule,
        study_habits: formData.study_habits,
        cleanliness: Number(formData.cleanliness),
        noise_tolerance: Number(formData.noise_tolerance),
        social_battery: Number(formData.social_battery),
        guest_frequency: Number(formData.guest_frequency),
        smoking: formData.smoking,
        drinking: formData.drinking,
        food_preference: formData.food_preference,
        budget_min: formData.budget_min ? Number(formData.budget_min) : null,
        budget_max: formData.budget_max ? Number(formData.budget_max) : null,
        share_pref: formData.share_pref,
        updated_at: new Date().toISOString(),
      };

      const contactUpsert = {
        user_id: userId,
        phone: (formData.share_pref === 'phone' || formData.share_pref === 'both') ? formData.phone : null,
        instagram: (formData.share_pref === 'instagram' || formData.share_pref === 'both') ? formData.instagram : null,
      };

      const [profileRes, contactRes] = await Promise.all([
        supabase.from('profiles').update(profileUpdate).eq('id', userId),
        supabase.from('contact_info').upsert(contactUpsert),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (contactRes.error) throw contactRes.error;

      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong saving your profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userId) return;
    setSaving(true);

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
      setSaving(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return null;

  return (
    <div className={styles.pageContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <Link href="/browse" className={styles.backBtn}>
          ← back to browse
        </Link>
      </div>

      {/* ── Preview Section ── */}
      <div className={styles.previewSection}>
        <span className={styles.previewLabel}>This is how others see you</span>
        <div className={styles.previewCard}>
          <div className={styles.previewHero}>
            <div className={styles.previewPhotoWrapper}>
              {formData.photo_url ? (
                <img src={formData.photo_url} alt={formData.name} className={styles.previewPhoto} />
              ) : (
                <div className={styles.previewPhoto} style={{ backgroundColor: 'var(--soft-yellow)' }}></div>
              )}
            </div>
            <div className={styles.previewInfo}>
              <h1 className={styles.previewName}>{formData.name || "Your Name"}</h1>
              <div className={styles.chipGroup}>
                <span className={`${styles.chip} ${styles.chipYellow}`}>
                  {formData.year || "Year"} {formData.branch ? `• ${formData.branch}` : ""}
                </span>
                {(formData.budget_min || formData.budget_max) && (
                  <span className={`${styles.chip} ${styles.chipMint}`}>
                    {formData.budget_min ? `₹${formData.budget_min}` : "?"} – {formData.budget_max ? `₹${formData.budget_max}` : "?"}/mo
                  </span>
                )}
              </div>
              <p className={styles.previewAbout}>{formData.about_me || "Your bio will appear here..."}</p>
            </div>
          </div>

          {/* Preview Info Grid */}
          <div className={styles.previewGrid}>
            <div className={styles.previewStatCard}>
              <span className={styles.previewStatLabel}>Lifestyle</span>
              <div className={styles.chipGroup}>
                {formData.sleep_schedule && <span className={`${styles.chip} ${styles.chipWhite}`}>{formData.sleep_schedule}</span>}
                {formData.study_habits && <span className={`${styles.chip} ${styles.chipWhite}`}>{formData.study_habits}</span>}
                {formData.food_preference && <span className={`${styles.chip} ${styles.chipWhite}`}>{formData.food_preference}</span>}
              </div>
            </div>
            <div className={styles.previewStatCard}>
              <span className={styles.previewStatLabel}>Cleanliness</span>
              <DotsDisplay value={formData.cleanliness} />
            </div>
            <div className={styles.previewStatCard}>
              <span className={styles.previewStatLabel}>Social Battery</span>
              <DotsDisplay value={formData.social_battery} />
            </div>
            <div className={styles.previewStatCard}>
              <span className={styles.previewStatLabel}>Noise Tolerance</span>
              <DotsDisplay value={formData.noise_tolerance} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Form Section ── */}
      <div className={styles.editSection}>
        <div className={styles.editCard}>

          {/* The Basics */}
          <h2 className={styles.sectionHeader}>
            The Basics
            <SquigglyLine />
          </h2>

          {/* Photo Upload */}
          <div className={styles.photoUploadArea}>
            <div className={styles.currentPhotoWrapper} onClick={() => photoInputRef.current?.click()}>
              {formData.photo_url ? (
                <img src={formData.photo_url} alt="Profile" className={styles.currentPhoto} />
              ) : (
                <div className={styles.photoPlaceholder}>
                  <img src={formData.gender === 'Female' ? '/avatar-female.png' : '/avatar-male.png'} alt="Default Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
              )}
              <div className={styles.photoOverlay}>change photo</div>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className={styles.photoHiddenInput}
            />
            <span className={styles.uploadHelpText}>click to change your photo</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Name</label>
            <input
              type="text"
              className={styles.input}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Gender</label>
            <div className={styles.tapCardGroup}>
              {['Male', 'Female'].map(opt => (
                <div
                  key={opt}
                  className={`${styles.tapCard} ${formData.gender === opt ? styles.tapCardSelected : ''}`}
                  onClick={() => handleChange('gender', opt)}
                >
                  <span className={styles.tapCardText}>{opt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Year</label>
            <div className={styles.pillGroup}>
              {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Masters'].map(y => (
                <button
                  key={y}
                  className={`${styles.pill} ${formData.year === y ? styles.pillSelected : ''}`}
                  onClick={() => handleChange('year', y)}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Branch / Major</label>
            <input
              type="text"
              className={styles.input}
              value={formData.branch}
              onChange={(e) => handleChange("branch", e.target.value)}
              placeholder="e.g. Computer Science"
            />
          </div>

          {/* Your Vibe */}
          <h2 className={styles.sectionHeader}>
            Your Vibe
            <SquigglyLine />
          </h2>

          <div className={styles.formGroup}>
            <label className={styles.label}>About Me</label>
            <textarea
              className={styles.textarea}
              value={formData.about_me}
              onChange={(e) => handleChange("about_me", e.target.value.slice(0, 200))}
              placeholder="ex-hostel survivor, mild chai addict..."
            />
            <div className={styles.charCount}>{formData.about_me.length} / 200</div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Sleep Schedule</label>
            <div className={styles.tapCardGroup}>
              {['Early Bird', 'Night Owl', 'Flexible'].map(opt => (
                <div
                  key={opt}
                  className={`${styles.tapCard} ${formData.sleep_schedule === opt ? styles.tapCardSelected : ''}`}
                  onClick={() => handleChange('sleep_schedule', opt)}
                >
                  <span className={styles.tapCardText}>{opt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Study Habits</label>
            <div className={styles.tapCardGroup}>
              {['Silent Mode', 'Music OK', 'Group Study', 'Flexible'].map(opt => (
                <div
                  key={opt}
                  className={`${styles.tapCard} ${formData.study_habits === opt ? styles.tapCardSelected : ''}`}
                  onClick={() => handleChange('study_habits', opt)}
                >
                  <span className={styles.tapCardText}>{opt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* The Real Questions */}
          <h2 className={styles.sectionHeader}>
            The Real Questions
            <SquigglyLine />
          </h2>

          <div className={styles.sliderContainer}>
            <div className={styles.sliderLabels}><span>Messy</span><span>Cleanliness</span><span>Spotless</span></div>
            <input type="range" min="1" max="5" value={formData.cleanliness} onChange={(e) => handleChange('cleanliness', e.target.value)} className={styles.slider} />
          </div>

          <div className={styles.sliderContainer}>
            <div className={styles.sliderLabels}><span>Silence</span><span>Noise Tolerance</span><span>Loud</span></div>
            <input type="range" min="1" max="5" value={formData.noise_tolerance} onChange={(e) => handleChange('noise_tolerance', e.target.value)} className={styles.slider} />
          </div>

          <div className={styles.sliderContainer}>
            <div className={styles.sliderLabels}><span>Introvert</span><span>Social Battery</span><span>Extrovert</span></div>
            <input type="range" min="1" max="5" value={formData.social_battery} onChange={(e) => handleChange('social_battery', e.target.value)} className={styles.slider} />
          </div>

          <div className={styles.sliderContainer}>
            <div className={styles.sliderLabels}><span>Never</span><span>Guest Frequency</span><span>Always</span></div>
            <input type="range" min="1" max="5" value={formData.guest_frequency} onChange={(e) => handleChange('guest_frequency', e.target.value)} className={styles.slider} />
          </div>

          {/* Habits */}
          <h2 className={styles.sectionHeader}>
            Habits
            <SquigglyLine />
          </h2>

          <div className={styles.toggleGroup}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={formData.smoking}
                onChange={(e) => handleChange('smoking', e.target.checked)}
                className={styles.toggleCheckbox}
              />
              Smoking
            </label>

            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={formData.drinking}
                onChange={(e) => handleChange('drinking', e.target.checked)}
                className={styles.toggleCheckbox}
              />
              Drinking
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Food Preference</label>
            <div className={styles.pillGroup}>
              {['Veg', 'Non-Veg', 'Eggetarian', 'Jain', 'Vegan'].map(opt => (
                <button
                  key={opt}
                  className={`${styles.pill} ${formData.food_preference === opt ? styles.pillSelected : ''}`}
                  onClick={() => handleChange('food_preference', opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Budget & Contact */}
          <h2 className={styles.sectionHeader}>
            Budget & Contact
            <SquigglyLine />
          </h2>

          <div className={styles.formGroup}>
            <label className={styles.label}>Budget Range (per month)</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="number"
                className={styles.input}
                value={formData.budget_min}
                onChange={(e) => handleChange("budget_min", e.target.value)}
                placeholder="Min"
              />
              <input
                type="number"
                className={styles.input}
                value={formData.budget_max}
                onChange={(e) => handleChange("budget_max", e.target.value)}
                placeholder="Max"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Share Contact Preference</label>
            <div className={styles.pillGroup}>
              {['phone', 'instagram', 'both'].map(opt => (
                <button
                  key={opt}
                  className={`${styles.pill} ${formData.share_pref === opt ? styles.pillSelected : ''}`}
                  onClick={() => handleChange('share_pref', opt)}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {(formData.share_pref === 'phone' || formData.share_pref === 'both') && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Phone Number</label>
              <input
                type="tel"
                className={styles.input}
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+91..."
              />
            </div>
          )}

          {(formData.share_pref === 'instagram' || formData.share_pref === 'both') && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Instagram Handle</label>
              <input
                type="text"
                className={styles.input}
                value={formData.instagram}
                onChange={(e) => handleChange("instagram", e.target.value)}
                placeholder="@handle"
              />
            </div>
          )}

          {error && <div className={styles.errorText}>{error}</div>}
        </div>
      </div>

      {/* Delete Account */}
      <div className={styles.deleteSection}>
        <button className={styles.deleteLink} onClick={() => setShowDeleteModal(true)}>
          delete my account
        </button>
      </div>

      {/* ── Sticky Bottom Action Bar ── */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* ── Success Toast ── */}
      <div className={`${styles.toast} ${toastVisible ? styles.toastVisible : ''}`}>
        Profile saved successfully
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
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? "Deleting..." : "Delete it all"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
