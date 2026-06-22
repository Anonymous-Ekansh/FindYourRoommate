"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import styles from "./Connections.module.css";
import Link from "next/link";

export default function Connections() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("interested"); // "interested" | "matches"
  const [loading, setLoading] = useState(true);
  
  const [interestedProfiles, setInterestedProfiles] = useState([]);
  const [matchProfiles, setMatchProfiles] = useState([]);
  const [expandedContacts, setExpandedContacts] = useState({}); // { profileId: contactData }

  useEffect(() => {
    async function fetchData() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }
      setCurrentUser(user);

      // 1. Fetch Interested in Me
      // First get the interest records
      const { data: interestsData } = await supabase
        .from('interests')
        .select('sender_id')
        .eq('receiver_id', user.id);
        
      if (interestsData && interestsData.length > 0) {
        const senderIds = interestsData.map(i => i.sender_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', senderIds);
          
        if (profilesData) {
          // Check if any of these are already matches
          const { data: matchesCheck } = await supabase
            .from('matches')
            .select('user_a_id, user_b_id')
            .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`);
            
          const matchedSet = new Set();
          if (matchesCheck) {
            matchesCheck.forEach(m => {
              matchedSet.add(m.user_a_id === user.id ? m.user_b_id : m.user_a_id);
            });
          }
          
          const enrichedProfiles = profilesData.map(p => ({
            ...p,
            isMutual: matchedSet.has(p.id)
          }));
          setInterestedProfiles(enrichedProfiles);
        }
      }

      // 2. Fetch Your Matches
      const { data: matchesData } = await supabase
        .from('matches')
        .select('user_a_id, user_b_id')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`);
        
      if (matchesData && matchesData.length > 0) {
        const matchIds = matchesData.map(m => m.user_a_id === user.id ? m.user_b_id : m.user_a_id);
        const { data: matchedProfilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', matchIds);
          
        if (matchedProfilesData) {
          setMatchProfiles(matchedProfilesData);
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [supabase, router]);

  const handleSendInterestBack = async (profileId) => {
    // Insert into matches
    // Technically we should also insert into interests to complete the loop, but inserting into matches confirms it.
    // Optimistic update
    setInterestedProfiles(prev => prev.map(p => p.id === profileId ? { ...p, isMutual: true } : p));
    setMatchProfiles(prev => {
      const newlyMatched = interestedProfiles.find(p => p.id === profileId);
      if (newlyMatched && !prev.find(p => p.id === profileId)) {
        return [...prev, { ...newlyMatched, isMutual: true }];
      }
      return prev;
    });

    await supabase.from('interests').insert({ sender_id: currentUser.id, receiver_id: profileId });
    await supabase.from('matches').insert({ user_a_id: currentUser.id, user_b_id: profileId });
  };

  const handleViewContact = async (profileId) => {
    // Toggle off if already open
    if (expandedContacts[profileId]) {
      const newExpanded = { ...expandedContacts };
      delete newExpanded[profileId];
      setExpandedContacts(newExpanded);
      return;
    }

    // Fetch contact info
    const { data: contactData } = await supabase
      .from('contact_info')
      .select('*')
      .eq('user_id', profileId)
      .single();

    if (contactData) {
      setExpandedContacts(prev => ({ ...prev, [profileId]: contactData }));
    } else {
      // In case they don't have contact info set up
      setExpandedContacts(prev => ({ ...prev, [profileId]: { phone: "Not provided", instagram: "Not provided" } }));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) return null;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.tabs}>
        <div 
          className={`${styles.tab} ${activeTab === 'interested' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('interested')}
        >
          Interested in You
        </div>
        <div 
          className={`${styles.tab} ${activeTab === 'matches' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          Your Matches
        </div>
      </div>

      {activeTab === 'interested' && (
        <>
          {interestedProfiles.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>your fan club is still loading... tell more people about the app</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {interestedProfiles.map(profile => (
                <div key={profile.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.photoWrapper}>
                      {profile.photo_url ? (
                        <img src={profile.photo_url} alt={profile.name} className={styles.photo} />
                      ) : null}
                    </div>
                    <div className={styles.info}>
                      <h3 className={styles.name}>{profile.name}</h3>
                      <span className={styles.chip}>{profile.year} • {profile.branch}</span>
                    </div>
                  </div>
                  
                  {profile.isMutual ? (
                    <button className={`${styles.actionBtn} ${styles.btnMatched}`}>
                      Matched ✓
                    </button>
                  ) : (
                    <button 
                      className={`${styles.actionBtn} ${styles.btnDefault}`}
                      onClick={() => handleSendInterestBack(profile.id)}
                    >
                      Send Interest Back ✦
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'matches' && (
        <>
          {matchProfiles.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>you both swiped right, now figure out who pays rent first... oh wait, no matches yet.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {matchProfiles.map(profile => (
                <div key={profile.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.photoWrapper}>
                      {profile.photo_url ? (
                        <img src={profile.photo_url} alt={profile.name} className={styles.photo} />
                      ) : null}
                    </div>
                    <div className={styles.info}>
                      <h3 className={styles.name}>{profile.name}</h3>
                      <span className={styles.chip}>{profile.year} • {profile.branch}</span>
                    </div>
                  </div>
                  
                  <button 
                    className={`${styles.actionBtn} ${styles.btnDefault}`}
                    onClick={() => handleViewContact(profile.id)}
                  >
                    {expandedContacts[profile.id] ? "Hide Contact" : "View Contact"}
                  </button>

                  {expandedContacts[profile.id] && (
                    <div className={styles.contactExpand}>
                      {expandedContacts[profile.id].phone && (
                        <div className={styles.contactRow}>
                          <span>{expandedContacts[profile.id].phone}</span>
                          <button className={styles.copyBtn} onClick={() => copyToClipboard(expandedContacts[profile.id].phone)}>
                            Copy
                          </button>
                        </div>
                      )}
                      {expandedContacts[profile.id].instagram && (
                        <div className={styles.contactRow}>
                          <span>{expandedContacts[profile.id].instagram}</span>
                          <button className={styles.copyBtn} onClick={() => copyToClipboard(expandedContacts[profile.id].instagram)}>
                            Copy
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
