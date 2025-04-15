"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { upsertUserProfile, getUserProfile } from "@/lib/actions"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

type User = {
  id: string
  email: string
  name?: string
  userType: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (
    email: string,
    password: string,
    userData: Omit<User, "id" | "email">,
  ) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  setGuestUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          try {
            // Get user profile from database
            const { success, data, error } = await getUserProfile(session.user.id)

            if (success && data) {
              setUser({
                id: session.user.id,
                email: session.user.email!,
                name: data.name || undefined,
                userType: data.userType || "guest", // Add fallback
              })
            } else {
              console.log("Creating new profile for user:", session.user.id)
              // If no profile exists, create a basic one
              const result = await upsertUserProfile({
                id: session.user.id,
                email: session.user.email!,
                userType: "guest",
              })

              if (result.success) {
                setUser({
                  id: session.user.id,
                  email: session.user.email!,
                  userType: "guest",
                })
              } else {
                console.error("Failed to create user profile:", result.error)
                setUser(null)
              }
            }
          } catch (error) {
            console.error("Error processing user profile:", error)
            setUser(null)
          }
        } else {
          // Check for guest user in localStorage
          const guestUser = localStorage.getItem("guestUser")
          if (guestUser) {
            setUser(JSON.parse(guestUser))
          } else {
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          // Get user profile from database
          const { success, data, error } = await getUserProfile(session.user.id)

          if (success && data) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: data.name || undefined,
              userType: data.userType || "guest", // Add fallback
            })
          } else {
            console.log("Creating new profile for user:", session.user.id)
            // If no profile exists, create a basic one
            const result = await upsertUserProfile({
              id: session.user.id,
              email: session.user.email!,
              userType: "guest",
            })

            if (result.success) {
              setUser({
                id: session.user.id,
                email: session.user.email!,
                userType: "guest",
              })
            } else {
              console.error("Failed to create user profile:", result.error)
              setUser(null)
            }
          }
        } catch (error) {
          console.error("Error processing user profile:", error)
          setUser(null)
        }
      } else {
        // Check for guest user in localStorage
        const guestUser = localStorage.getItem("guestUser")
        if (guestUser) {
          setUser(JSON.parse(guestUser))
        } else {
          setUser(null)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Add this useEffect to ensure the users table exists
  useEffect(() => {
    const ensureUsersTable = async () => {
      try {
        await fetch("/api/ensure-users-table", {
          method: "POST",
        })
      } catch (error) {
        console.error("Error ensuring users table:", error)
      }
    }

    ensureUsersTable()
  }, [])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Fetch user profile from Neon database
        const { success, data: profileData, error: profileError } = await getUserProfile(data.user.id)

        if (success && profileData) {
          setUser({
            id: data.user.id,
            email: data.user.email!,
            name: profileData.name || undefined,
            userType: profileData.user_type || "guest",
          })
        } else {
          console.error("Failed to fetch user profile:", profileError)
          // Create a basic profile if none exists
          const result = await upsertUserProfile({
            id: data.user.id,
            email: data.user.email!,
            userType: "guest",
          })

          if (result.success) {
            setUser({
              id: data.user.id,
              email: data.user.email!,
              userType: "guest",
            })
          } else {
            console.error("Failed to create user profile:", result.error)
          }
        }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Error signing in:", error)
      return { success: false, error: error.message || "Failed to sign in" }
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData: Omit<User, "id" | "email">) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Create user profile in Neon database
        const result = await upsertUserProfile({
          id: data.user.id,
          email: data.user.email!,
          name: userData.name,
          userType: userData.userType,
        })

        if (!result.success) {
          console.error("Failed to create user profile in database:", result.error)
          // Continue anyway since auth was successful
        }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Error signing up:", error)
      return { success: false, error: error.message || "Failed to sign up" }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem("guestUser")
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Set guest user
  const setGuestUser = () => {
    const guestUser = {
      id: `guest-${Date.now()}`,
      email: "guest@example.com",
      userType: "guest",
    }

    localStorage.setItem("guestUser", JSON.stringify(guestUser))
    setUser(guestUser)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, setGuestUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
