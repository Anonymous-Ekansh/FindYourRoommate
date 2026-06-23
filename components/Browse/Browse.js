"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import styles from "./Browse.module.css";
import Link from "next/link";

export default function Browse() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [sentInterests, setSentInterests] = useState(new Set());

  // Filters state
  const [filters, setFilters] = useState({
    year: [],
    gender: "",
    branch: "",
    sleep: "",
    food: "",
    smoking: "",
    drinking: "",
  });

  useEffect(() => {
    async function fetchData() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }
      setCurrentUser(user);

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id);

      if (!profilesError && profilesData) {
        setProfiles(profilesData);
      }

      // Fetch sent interests
      const { data: interestsData, error: interestsError } = await supabase
        .from('interests')
        .select('receiver_id')
        .eq('sender_id', user.id);

      if (!interestsError && interestsData) {
        setSentInterests(new Set(interestsData.map(i => i.receiver_id)));
      }

      setLoading(false);
    }

    fetchData();
  }, [supabase, router]);

  const handleInterest = async (e, profileId) => {
    e.preventDefault();
    e.stopPropagation();

    if (sentInterests.has(profileId)) return;

    // Optimistic update
    setSentInterests(prev => new Set(prev).add(profileId));

    const { error } = await supabase
      .from('interests')
      .insert({ sender_id: currentUser.id, receiver_id: profileId });

    if (error && error.code !== '23505') {
      console.error('Error sending interest:', error);
      // Revert if it's a real error (not duplicate)
      setSentInterests(prev => {
        const next = new Set(prev);
        next.delete(profileId);
        return next;
      });
    }
  };

  const toggleFilter = (category, value) => {
    setFilters(prev => {
      if (category === 'year') {
        const current = prev.year;
        if (current.includes(value)) {
          return { ...prev, year: current.filter(v => v !== value) };
        } else {
          return { ...prev, year: [...current, value] };
        }
      }
      return { ...prev, [category]: prev[category] === value ? "" : value };
    });
  };

  // Client-side filtering
  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      if (filters.year.length > 0 && !filters.year.includes(p.year)) return false;
      if (filters.gender && p.gender !== filters.gender) return false;
      if (filters.branch && !p.branch.toLowerCase().includes(filters.branch.toLowerCase())) return false;
      if (filters.sleep && p.sleep_schedule !== filters.sleep) return false;
      if (filters.food && p.food_preference !== filters.food) return false;
      
      if (filters.smoking === 'yes' && p.smoking !== true) return false;
      if (filters.smoking === 'no' && p.smoking !== false) return false;
      
      if (filters.drinking === 'yes' && p.drinking !== true) return false;
      if (filters.drinking === 'no' && p.drinking !== false) return false;

      return true;
    });
  }, [profiles, filters]);

  const rotations = [-2, 1, -1, 2, 0];

  return (
    <div className={styles.browseSection}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.navLogo}>Roomy</Link>
        <div className={styles.navActions}>
          <Link href="/connections" className={styles.connectionsBtn}>
            Who's interested?
          </Link>
          <Link href="/profile/me" className={styles.navProfile}>
            My Profile
          </Link>
        </div>
      </nav>

      {/* Filter Bar */}
      <div className={styles.filterWrapper}>
        <span className={styles.filterLabel}>Filters</span>
        <div className={styles.filterScroll}>
          {/* Gender Filter */}
          <div className={styles.filterGroup}>
            {['Male', 'Female'].map(opt => (
              <button
                key={opt}
                className={`${styles.filterPill} ${filters.gender === opt ? styles.filterPillActive : ''}`}
                onClick={() => toggleFilter('gender', opt)}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Year Filter */}
          <div className={styles.filterGroup}>
            {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Masters'].map(yr => (
              <button 
                key={yr} 
                className={`${styles.filterPill} ${filters.year.includes(yr) ? styles.filterPillActive : ''}`}
                onClick={() => toggleFilter('year', yr)}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Branch Filter */}
          <div className={styles.filterGroup}>
            <input 
              type="text" 
              placeholder="Search branch..." 
              className={styles.filterInput} 
              value={filters.branch}
              onChange={(e) => setFilters(prev => ({ ...prev, branch: e.target.value }))}
            />
          </div>

          {/* Sleep Filter */}
          <div className={styles.filterGroup}>
            {['Early Bird', 'Night Owl', 'Flexible'].map(opt => (
              <button 
                key={opt} 
                className={`${styles.filterPill} ${filters.sleep === opt ? styles.filterPillActive : ''}`}
                onClick={() => toggleFilter('sleep', opt)}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Food Filter */}
          <div className={styles.filterGroup}>
            {['Veg', 'Non-Veg', 'Eggetarian', 'Jain', 'Vegan'].map(opt => (
              <button 
                key={opt} 
                className={`${styles.filterPill} ${filters.food === opt ? styles.filterPillActive : ''}`}
                onClick={() => toggleFilter('food', opt)}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Smoking */}
          <div className={styles.filterGroup}>
            <button 
              className={`${styles.filterPill} ${filters.smoking === 'yes' ? styles.filterPillActive : ''}`}
              onClick={() => toggleFilter('smoking', 'yes')}
            >
              Smoker
            </button>
            <button 
              className={`${styles.filterPill} ${filters.smoking === 'no' ? styles.filterPillActive : ''}`}
              onClick={() => toggleFilter('smoking', 'no')}
            >
              Non-Smoker
            </button>
          </div>

          {/* Drinking */}
          <div className={styles.filterGroup}>
            <button 
              className={`${styles.filterPill} ${filters.drinking === 'yes' ? styles.filterPillActive : ''}`}
              onClick={() => toggleFilter('drinking', 'yes')}
            >
              Drinks
            </button>
            <button 
              className={`${styles.filterPill} ${filters.drinking === 'no' ? styles.filterPillActive : ''}`}
              onClick={() => toggleFilter('drinking', 'no')}
            >
              No Drinks
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className={styles.mainContent}>
        {loading ? (
          <div className={styles.grid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonImg}></div>
                <div className={styles.skeletonLine}></div>
                <div className={styles.skeletonLine} style={{ width: '50%' }}></div>
                <div className={styles.skeletonBtn}></div>
              </div>
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>nobody matches your vibe... yet.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredProfiles.map((profile, i) => {
              const rotation = rotations[i % rotations.length];
              const isSent = sentInterests.has(profile.id);

              return (
                <div 
                  key={profile.id} 
                  className={styles.card} 
                  style={{ transform: `rotate(${rotation}deg)` }}
                  onClick={() => router.push(`/profile/${profile.id}`)}
                >
                  <div className={styles.cardHeader}>
                    {profile.photo_url ? (
                      <img src={profile.photo_url} alt={profile.name} className={styles.cardPhoto} />
                    ) : (
                      <img src={profile.gender === 'Female' ? '/avatar-female.png' : '/avatar-male.png'} alt={profile.name} className={styles.cardPhoto} style={{ backgroundColor: 'var(--soft-yellow)' }} />
                    )}
                  </div>
                  
                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardName}>{profile.name}</h3>
                    
                    <div className={styles.chipGroup}>
                      <span className={`${styles.chip} ${styles.chipYellow}`}>
                        {profile.year} • {profile.branch}
                      </span>
                      {profile.sleep_schedule && (
                        <span className={`${styles.chip} ${styles.chipWhite}`}>
                          {profile.sleep_schedule}
                        </span>
                      )}
                      {profile.food_preference && (
                        <span className={`${styles.chip} ${styles.chipMint}`}>
                          {profile.food_preference}
                        </span>
                      )}
                    </div>
                  </div>

                  <button 
                    className={`${styles.interestBtn} ${isSent ? styles.interestBtnSent : ''}`}
                    onClick={(e) => handleInterest(e, profile.id)}
                  >
                    {isSent ? "Interested ✓" : "Interested ✦"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
