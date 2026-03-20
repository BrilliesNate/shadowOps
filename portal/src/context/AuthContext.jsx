// CRITICAL PATTERNS (from working POS — do not change):
// 1. getSession() on mount to restore existing session
// 2. onAuthStateChange listener keeps auth in sync
// 3. Fetch userProfile AFTER user is confirmed
// 4. loading state prevents route flicker
// 5. signOut uses scope:'local' to avoid 403 on hosted deployments

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading,     setLoading]     = useState(true)

  // Fetch extended profile from the `profiles` table
  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) {
      console.error('fetchProfile error:', error.message)
      return null
    }
    return data
  }

  useEffect(() => {
    // 1. Check for an existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        const profile = await fetchProfile(session.user.id)
        setUserProfile(profile)
      }
      setLoading(false)
    })

    // 2. Subscribe to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          const profile = await fetchProfile(session.user.id)
          setUserProfile(profile)
        } else {
          setUser(null)
          setUserProfile(null)
        }
        // Only clear loading after initial check is done
        if (event !== 'INITIAL_SESSION') setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (err) {
      console.error('signOut error:', err)
    } finally {
      setUser(null)
      setUserProfile(null)
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signOut,
    role: userProfile?.role ?? null,
    isAdmin:   userProfile?.role === 'admin',
    isManager: ['admin','manager'].includes(userProfile?.role),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
