"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import styles from "./NotificationBanner.module.css";

// Helper to extract initials from full name
function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Predefined set of background colors from Roomy brand theme variables
const AVATAR_COLORS = [
  "var(--coral-red, #F75F5C)",
  "var(--lime-mint, #D2E77C)",
  "var(--soft-yellow, #FFDE65)",
  "var(--sticky-pink, #FF8FB3)"
];

// Hash function to choose a deterministic color based on user's name
function getAvatarBg(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default function NotificationBanner() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [interestedUsers, setInterestedUsers] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchInterests() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          if (isMounted) setLoading(false);
          return;
        }

        // 1. Fetch total count of interests received
        const { count: interestsCount, error: countError } = await supabase
          .from("interests")
          .select("*", { count: "exact", head: true })
          .eq("receiver_id", user.id);

        if (countError) throw countError;

        if (interestsCount === 0) {
          if (isMounted) {
            setCount(0);
            setLoading(false);
          }
          return;
        }

        // 2. Fetch latest 3 records to populate the avatar stack
        let latestInterests = [];
        const { data: orderedData, error: orderError } = await supabase
          .from("interests")
          .select("sender_id")
          .eq("receiver_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (orderError) {
          console.warn("Failed to fetch ordered interests, falling back to unordered select:", orderError.message);
          // Fallback to unordered query in case 'created_at' does not exist in schema
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("interests")
            .select("sender_id")
            .eq("receiver_id", user.id)
            .limit(3);

          if (fallbackError) throw fallbackError;
          latestInterests = fallbackData || [];
        } else {
          latestInterests = orderedData || [];
        }

        if (latestInterests.length > 0) {
          const senderIds = latestInterests.map((interest) => interest.sender_id);
          
          // 3. Fetch profiles corresponding to the sender IDs
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, name, photo_url, gender")
            .in("id", senderIds);

          if (profilesError) throw profilesError;

          // Re-order profiles to match the latestInterests order
          const orderedProfiles = senderIds
            .map((id) => profilesData?.find((profile) => profile.id === id))
            .filter(Boolean);

          if (isMounted) {
            setInterestedUsers(orderedProfiles);
            setCount(interestsCount || 0);
          }
        }
      } catch (err) {
        console.error("Error fetching notification banner data:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchInterests();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // Loading state handled gracefully: return null to avoid flash
  if (loading || count === 0) {
    return null;
  }

  const handleNavigation = () => {
    router.push("/connections");
  };

  return (
    <div
      onClick={handleNavigation}
      className={`${styles.bannerContainer} rounded-2xl flex items-center justify-between cursor-pointer`}
      id="notification-banner"
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleNavigation();
        }
      }}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Avatars Stack (Far Left) */}
        <div className={`${styles.avatarStack} flex items-center`}>
          {interestedUsers.map((user, idx) => (
            <div
              key={user.id}
              className={`${styles.avatarItem} flex items-center justify-center`}
              style={{
                zIndex: 10 - idx,
                backgroundColor: !user.photo_url ? getAvatarBg(user.name) : undefined,
              }}
              title={user.name}
            >
              {user.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={user.name}
                  className={styles.avatarImg}
                  onError={(e) => {
                    // Fallback to initials if image loading fails
                    e.currentTarget.style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.style.backgroundColor = getAvatarBg(user.name);
                      const initialsSpan = document.createElement("span");
                      initialsSpan.className = styles.avatarInitials;
                      initialsSpan.innerText = getInitials(user.name);
                      parent.appendChild(initialsSpan);
                    }
                  }}
                />
              ) : (
                <span className={styles.avatarInitials}>
                  {getInitials(user.name)}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Text Notification (Middle) */}
        <div className={`${styles.textNotification} flex-1`}>
          <span className={styles.boldText}>{count}</span>{" "}
          {count === 1 ? "person" : "people"} tapped interested on your profile.{" "}
          <span className={styles.ctaHighlight}>See who they are!</span>
        </div>
      </div>

      {/* CTA Button (Far Right) */}
      <button
        className={`${styles.ctaButton} rounded-full flex items-center gap-1.5`}
        onClick={(e) => {
          e.stopPropagation(); // Prevent duplicate navigation triggers
          handleNavigation();
        }}
        id="banner-cta-button"
      >
        <span>Check now</span>
        <span className={styles.sparkleIcon}>✦</span>
      </button>
    </div>
  );
}
