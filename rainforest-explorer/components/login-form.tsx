"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Leaf } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function LoginForm() {
  const router = useRouter()
  const { signIn, signUp, setGuestUser } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Signup form state
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")

  // Effect to notify parent component about background zoom
  useEffect(() => {
    // This would communicate with the parent component in a real app
    const body = document.body
    if (isDropdownOpen) {
      body.classList.add("dropdown-open")
    } else {
      body.classList.remove("dropdown-open")
    }

    return () => {
      body.classList.remove("dropdown-open")
    }
  }, [isDropdownOpen])

  // Update the handleSignup function to better handle validation and errors
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate inputs
    if (!signupName || !signupEmail || !signupPassword) {
      toast({
        title: "Signup failed",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!userType) {
      toast({
        title: "Signup failed",
        description: "Please select who you are.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const result = await signUp(signupEmail, signupPassword, {
        name: signupName,
        userType,
      })

      if (result.success) {
        toast({
          title: "Signup successful",
          description: "Welcome to Rainforest Explorer! Please check your email to confirm your account.",
        })
        router.push("/explorer")
      } else {
        toast({
          title: "Signup failed",
          description: result.error || "Please check your information and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Update the handleLogin function to better handle authentication errors
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!loginEmail || !loginPassword) {
        toast({
          title: "Login failed",
          description: "Please enter both email and password.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const result = await signIn(loginEmail, loginPassword)

      if (result.success) {
        toast({
          title: "Login successful",
          description: "Welcome back to Rainforest Explorer!",
        })
        router.push("/explorer")
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Please check your credentials and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle guest login
  const handleGuestLogin = () => {
    setGuestUser()
    toast({
      title: "Guest access granted",
      description: "You are now browsing as a guest.",
    })
    router.push("/explorer")
  }

  return (
    <Card className="border-green-600 bg-gradient-to-b from-black to-gray-800 text-white shadow-xl backdrop-blur-sm">
      <CardHeader className="space-y-1 border-b border-gray-700">
        <div className="flex items-center justify-center mb-2">
          <div className="bg-green-900 p-3 rounded-full">
            <Leaf className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center text-white">DORA THE EXPLORER</CardTitle>
        <CardDescription className="text-center text-gray-300">Join Dora on her rainforest adventures</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-800">
            <TabsTrigger value="login" className="data-[state=active]:bg-green-800 data-[state=active]:text-white">
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-green-800 data-[state=active]:text-white">
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-300">
                      Password
                    </Label>
                    <Link href="#" className="text-sm text-green-400 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-password" className="text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-gray-300">I am a:</Label>
                  <RadioGroup value={userType} onValueChange={setUserType} className="flex flex-col space-y-1" required>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dora" id="dora" className="border-gray-500 text-green-400" />
                      <Label htmlFor="dora" className="cursor-pointer text-gray-300">
                        DORA
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="researcher" id="researcher" className="border-gray-500 text-green-400" />
                      <Label htmlFor="researcher" className="cursor-pointer text-gray-300">
                        Researcher
                      </Label>
                    </div>
                  </RadioGroup>
                  {!userType && <p className="text-xs text-amber-400">Please select who you are</p>}
                </div>

                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                  disabled={isLoading || !userType}
                  size="lg"
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-gray-700 pt-4">
        <Button variant="link" className="text-green-400 hover:text-green-300 text-lg" onClick={handleGuestLogin}>
          Continue as guest
        </Button>
      </CardFooter>
    </Card>
  )
}
