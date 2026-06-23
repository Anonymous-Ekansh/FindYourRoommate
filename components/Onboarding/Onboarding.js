"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import styles from "./Onboarding.module.css";

export default function Onboarding() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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
    share_pref: "",
    phone: "",
    instagram: "",
  });

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Pre-fill name if available
        setFormData((prev) => ({ ...prev, name: user.user_metadata?.full_name || "" }));
      } else {
        router.push("/login");
      }
    }
    getUser();
  }, [supabase, router]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(""); // clear errors on change
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !userId) return;

    try {
      setLoading(true);
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
      setError("Failed to upload photo. Make sure the bucket exists and allows uploads.");
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.gender || !formData.year || !formData.branch) {
        setError("Please fill out all fields.");
        return false;
      }
    } else if (step === 2) {
      if (!formData.about_me) {
        setError("Please tell us a bit about yourself.");
        return false;
      }
    } else if (step === 3) {
      if (!formData.sleep_schedule || !formData.study_habits) {
        setError("Please select both options.");
        return false;
      }
    } else if (step === 5) {
      if (!formData.food_preference) {
        setError("Please select a food preference.");
        return false;
      }
    } else if (step === 6) {
      if (!formData.share_pref) {
        setError("Please select a contact preference.");
        return false;
      }
      if (formData.share_pref === "phone" || formData.share_pref === "both") {
        if (!formData.phone) {
          setError("Phone number is required.");
          return false;
        }
      }
      if (formData.share_pref === "instagram" || formData.share_pref === "both") {
        if (!formData.instagram) {
          setError("Instagram handle is required.");
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
    setError("");
  };

  const handleSubmit = async () => {
    if (!validateStep() || !userId) return;
    
    setLoading(true);
    try {
      // Upsert into profiles
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        name: formData.name,
        gender: formData.gender,
        year: formData.year,
        branch: formData.branch,
        about_me: formData.about_me,
        photo_url: formData.photo_url,
        sleep_schedule: formData.sleep_schedule,
        study_habits: formData.study_habits,
        cleanliness: formData.cleanliness,
        noise_tolerance: formData.noise_tolerance,
        social_battery: formData.social_battery,
        guest_frequency: formData.guest_frequency,
        smoking: formData.smoking,
        drinking: formData.drinking,
        food_preference: formData.food_preference,
        share_pref: formData.share_pref,
        updated_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      // Upsert into contact_info
      const { error: contactError } = await supabase.from('contact_info').upsert({
        user_id: userId,
        phone: (formData.share_pref === 'phone' || formData.share_pref === 'both') ? formData.phone : null,
        instagram: (formData.share_pref === 'instagram' || formData.share_pref === 'both') ? formData.instagram : null,
      });

      if (contactError) throw contactError;

      router.push('/browse');
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong saving your profile.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h1 className={styles.stepTitle}>The basics</h1>
            <p className={styles.stepSubtitle}>who are you again?</p>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Name</label>
              <input type="text" className={styles.input} value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Your full name" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Gender</label>
              <div className={styles.tapCardGroup}>
                {['Male', 'Female'].map(opt => (
                  <div key={opt} className={`${styles.tapCard} ${formData.gender === opt ? styles.tapCardSelected : ''}`} onClick={() => handleChange('gender', opt)}>
                    <span className={styles.tapCardText}>{opt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Year</label>
              <div className={styles.pillGroup}>
                {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Masters'].map(y => (
                  <button key={y} className={`${styles.pill} ${formData.year === y ? styles.pillSelected : ''}`} onClick={() => handleChange('year', y)}>
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Branch / Major</label>
              <input type="text" className={styles.input} value={formData.branch} onChange={(e) => handleChange("branch", e.target.value)} placeholder="e.g. Computer Science" />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h1 className={styles.stepTitle}>Your vibe</h1>
            <p className={styles.stepSubtitle}>make yourself sound cool</p>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Profile Photo (optional)</label>
              <div className={styles.dropZone}>
                {formData.photo_url ? (
                  <img src={formData.photo_url} alt="Profile" className={styles.photoPreview} />
                ) : (
                  <div className={styles.dropZoneText}>
                    {loading ? "Uploading..." : (
                      <>
                        <img src={formData.gender === 'Female' ? '/avatar-female.png' : '/avatar-male.png'} alt="Default Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 10px', display: 'block', border: '3px solid var(--ink-black)', objectFit: 'cover', objectPosition: 'top' }} />
                        drop your face here
                      </>
                    )}
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className={styles.dropZoneInput} disabled={loading} />
              </div>
            </div>

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
          </>
        );
      case 3:
        return (
          <>
            <h1 className={styles.stepTitle}>Night owl or 7am warrior?</h1>
            <p className={styles.stepSubtitle}>be honest about your alarms</p>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Sleep Schedule</label>
              <div className={styles.tapCardGroup}>
                {['Early Bird', 'Night Owl', 'Flexible'].map(opt => (
                  <div key={opt} className={`${styles.tapCard} ${formData.sleep_schedule === opt ? styles.tapCardSelected : ''}`} onClick={() => handleChange('sleep_schedule', opt)}>
                    <span className={styles.tapCardText}>{opt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Study Habits</label>
              <div className={styles.tapCardGroup}>
                {['Silent Mode', 'Music OK', 'Group Study', 'Flexible'].map(opt => (
                  <div key={opt} className={`${styles.tapCard} ${formData.study_habits === opt ? styles.tapCardSelected : ''}`} onClick={() => handleChange('study_habits', opt)}>
                    <span className={styles.tapCardText}>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h1 className={styles.stepTitle}>The real questions</h1>
            <p className={styles.stepSubtitle}>we're not judging. okay maybe a little.</p>
            
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
          </>
        );
      case 5:
        return (
          <>
            <h1 className={styles.stepTitle}>Habits (no judgment)</h1>
            <p className={styles.stepSubtitle}>just keep it outside the room</p>
            
            <div className={styles.toggleGroup}>
              <label className={styles.toggleLabel}>
                <input type="checkbox" checked={formData.smoking} onChange={(e) => handleChange('smoking', e.target.checked)} className={styles.toggleCheckbox} />
                Smoking
              </label>
              
              <label className={styles.toggleLabel}>
                <input type="checkbox" checked={formData.drinking} onChange={(e) => handleChange('drinking', e.target.checked)} className={styles.toggleCheckbox} />
                Drinking
              </label>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
              <label className={styles.label}>Food Preference</label>
              <div className={styles.pillGroup}>
                {['Veg', 'Non-Veg', 'Eggetarian', 'Jain', 'Vegan'].map(opt => (
                  <button key={opt} className={`${styles.pill} ${formData.food_preference === opt ? styles.pillSelected : ''}`} onClick={() => handleChange('food_preference', opt)}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </>
        );
      case 6:
        return (
          <>
            <h1 className={styles.stepTitle}>Contact details</h1>
            <p className={styles.stepSubtitle}>how do we reach you?</p>

            <div className={styles.formGroup}>
              <label className={styles.label}>Share Contact Preference</label>
              <div className={styles.pillGroup}>
                {['phone', 'instagram', 'both'].map(opt => (
                  <button key={opt} className={`${styles.pill} ${formData.share_pref === opt ? styles.pillSelected : ''}`} onClick={() => handleChange('share_pref', opt)}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {(formData.share_pref === 'phone' || formData.share_pref === 'both') && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <input type="tel" className={styles.input} value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+91..." />
              </div>
            )}

            {(formData.share_pref === 'instagram' || formData.share_pref === 'both') && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Instagram Handle</label>
                <input type="text" className={styles.input} value={formData.instagram} onChange={(e) => handleChange("instagram", e.target.value)} placeholder="@handle" />
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  const getBgClass = () => {
    return styles[`bg-step-${step}`] || styles['bg-step-1'];
  };

  return (
    <section className={styles.onboardingSection}>
      <div className={styles.progressContainer}>
        <div className={styles.progressHeader}>
          <span className={styles.stepLabel}>Step {step} of 6</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${(step / 6) * 100}%` }}></div>
        </div>
      </div>

      <div className={styles.cardContainer}>
        <div className={`${styles.card} ${getBgClass()}`}>
          {renderStep()}
          
          {error && <div className={styles.errorText}>{error}</div>}

          <div className={styles.buttonRow}>
            {step > 1 && (
              <button className={`${styles.btn} ${styles.btnBack}`} onClick={handleBack} disabled={loading}>
                Back
              </button>
            )}
            
            {step < 6 ? (
              <button className={`${styles.btn} ${styles.btnNext}`} onClick={handleNext} disabled={loading}>
                Next
              </button>
            ) : (
              <button className={`${styles.btn} ${styles.btnNext}`} onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : "Finish"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
