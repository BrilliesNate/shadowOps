import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading,     setLoading]     = useState(true)

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) {
        console.warn('fetchProfile:', error.message)
        return null
      }
      return data
    } catch (err) {
      console.warn('fetchProfile threw:', err)
      return null
    }
  }

  useEffect(() => {
    let settled = false

    function done() {
      if (!settled) {
        settled = true
        setLoading(false)
      }
    }

    // Hard fallback — loading can never stay stuck longer than 6 seconds
    const fallback = setTimeout(done, 6000)

    // 1. Restore existing session on mount
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user)
          const profile = await fetchProfile(session.user.id)
          setUserProfile(profile)
        }
      })
      .catch(err => console.warn('getSession error:', err))
      .finally(done)   // always clear loading, even on error

    // 2. Keep auth state in sync after login / logout / token refresh
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
        // SIGNED_IN fires after a successful login — also clear loading here
        if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'].includes(event)) {
          done()
        }
      }
    )

    return () => {
      clearTimeout(fallback)
      subscription.unsubscribe()
    }
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
      console.warn('signOut error:', err)
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
    role:      userProfile?.role ?? null,
    isAdmin:   userProfile?.role === 'admin',
    isManager: ['admin', 'manager'].includes(userProfile?.role),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
