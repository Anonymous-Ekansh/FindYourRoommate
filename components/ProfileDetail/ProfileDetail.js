"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./ProfileDetail.module.css";

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

export default function ProfileDetail({ profileId }) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [interestSent, setInterestSent] = useState(false);
  const [isMatch, setIsMatch] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    async function fetchData() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }
      setCurrentUser(user);

      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (!profileData) {
        router.push("/browse");
        return;
      }
      setProfile(profileData);

      // 2. Fetch sent interest
      const { data: sentData } = await supabase
        .from('interests')
        .select('id')
        .eq('sender_id', user.id)
        .eq('receiver_id', profileId);

      if (sentData && sentData.length > 0) {
        setInterestSent(true);
      }

      // 3. Fetch match
      const { data: matchData } = await supabase
        .from('matches')
        .select('*')
        .or(`and(user_a_id.eq.${user.id},user_b_id.eq.${profileId}),and(user_a_id.eq.${profileId},user_b_id.eq.${user.id})`);

      if (matchData && matchData.length > 0) {
        setIsMatch(true);

        // 4. Fetch contact info if matched
        const { data: contactData } = await supabase
          .from('contact_info')
          .select('*')
          .eq('user_id', profileId)
          .single();

        if (contactData) {
          setContactInfo(contactData);
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [supabase, profileId, router]);

  const handleSendInterest = async () => {
    if (interestSent) return;

    // Optimistic update
    setInterestSent(true);

    const { error } = await supabase
      .from('interests')
      .insert({ sender_id: currentUser.id, receiver_id: profileId });

    if (error && error.code !== '23505') {
      console.error('Error sending interest:', error);
      setInterestSent(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(type);
    setTimeout(() => setCopyStatus(""), 2000);
  };

  if (loading) return null;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.topBar}>
        <Link href="/browse" className={styles.backBtn}>
          ← back to browse
        </Link>
      </div>

      <div className={styles.content}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <div className={styles.heroPhotoWrapper}>
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.name} className={styles.heroPhoto} />
            ) : (
              <img src={profile.gender === 'Female' ? '/avatar-female.png' : '/avatar-male.png'} alt={profile.name} className={styles.heroPhoto} style={{ backgroundColor: 'var(--soft-yellow)' }} />
            )}
          </div>

          <div className={styles.heroInfo}>
            <h1 className={styles.name}>{profile.name}</h1>
            <div className={styles.chipGroup}>
              <span className={`${styles.chip} ${styles.chipYellow}`}>
                {profile.year} • {profile.branch}
              </span>
            </div>
            <p className={styles.about}>{profile.about_me}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className={styles.infoGrid}>
          {/* Lifestyle Chips */}
          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>Lifestyle</span>
            <div className={styles.chipGroup}>
              {profile.sleep_schedule && <span className={`${styles.chip} ${styles.chipWhite}`}>{profile.sleep_schedule}</span>}
              {profile.study_habits && <span className={`${styles.chip} ${styles.chipWhite}`}>{profile.study_habits}</span>}
              {profile.food_preference && <span className={`${styles.chip} ${styles.chipWhite}`}>{profile.food_preference}</span>}
              {profile.smoking && <span className={`${styles.chip} ${styles.chipCoral}`}>Smoker</span>}
              {!profile.smoking && <span className={`${styles.chip} ${styles.chipCoral}`}>Non-Smoker</span>}
              {profile.drinking && <span className={`${styles.chip} ${styles.chipCoral}`}>Drinks</span>}
              {!profile.drinking && <span className={`${styles.chip} ${styles.chipCoral}`}>No Drinks</span>}
            </div>
          </div>

          {/* Scores */}
          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>Cleanliness</span>
            <DotsDisplay value={profile.cleanliness || 3} />
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>Noise Tolerance</span>
            <DotsDisplay value={profile.noise_tolerance || 3} />
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>Social Battery</span>
            <DotsDisplay value={profile.social_battery || 3} />
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>Guest Frequency</span>
            <DotsDisplay value={profile.guest_frequency || 3} />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.actionWrapper}>
          {isMatch ? (
            <>
              <div className={styles.matchBanner}>
                You Matched!
                <svg width="24" height="24" viewBox="0 0 24 24" className={styles.confettiSvg} xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15 8L22 9L17 14L18 21L12 17L6 21L7 14L2 9L9 8L12 2Z" stroke="var(--ink-black)" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>

              {contactInfo && (
                <div className={styles.contactCard}>
                  {contactInfo.phone && (
                    <div className={styles.contactRow}>
                      <span>Phone: {contactInfo.phone}</span>
                      <button className={styles.copyBtn} onClick={() => copyToClipboard(contactInfo.phone, 'phone')}>
                        {copyStatus === 'phone' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  )}
                  {contactInfo.instagram && (
                    <div className={styles.contactRow}>
                      <span>Insta: {contactInfo.instagram}</span>
                      <button className={styles.copyBtn} onClick={() => copyToClipboard(contactInfo.instagram, 'insta')}>
                        {copyStatus === 'insta' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : interestSent ? (
            <>
              <button className={`${styles.actionBtn} ${styles.btnSent}`}>
                Interest Sent ✓
              </button>
              <span className={styles.sentSubtext}>waiting for them to match you back</span>
            </>
          ) : (
            <button className={`${styles.actionBtn} ${styles.btnDefault}`} onClick={handleSendInterest}>
              Send Interest ✦
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
