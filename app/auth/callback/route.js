import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/browse';

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.session?.user) {
      const user = data.session.user;
      
      // Check profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, year, branch, about_me, sleep_schedule, cleanliness, noise_tolerance, food_preference, study_habits')
        .eq('id', user.id)
        .single();
        
      if (profileError || !profile) {
        // No profile exists, redirect to onboarding
        return NextResponse.redirect(`${origin}/onboarding`);
      }
      
      // Check if all required fields are filled
      const requiredFields = [
        'name', 'year', 'branch', 'about_me', 'sleep_schedule', 
        'cleanliness', 'noise_tolerance', 'food_preference', 'study_habits'
      ];
      
      const isComplete = requiredFields.every(field => {
        const val = profile[field];
        return val !== null && val !== undefined && val !== '';
      });
      
      if (isComplete) {
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        return NextResponse.redirect(`${origin}/onboarding`);
      }
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
