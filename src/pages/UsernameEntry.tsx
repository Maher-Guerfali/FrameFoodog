import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCodeScreen from "@/components/QRCodeScreen";

// API base URL - replace with your actual API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface User {
  id: string;
  username: string;
  age?: number;
  weight?: string;
  height?: string;
  body_fat_percentage?: string;
  gender?: string;
  goals?: string;
  allergies?: string[];
  conditions?: string[];
  notes?: string[];
  created_at: string;
  updated_at: string;
}

interface UserResponse {
  user: User;
  dailyIntakeToday: any | null;
  weeklyIntakeThisWeek: any[];
}

export default function UsernameEntry() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsLoading(true);
    const trimmedUsername = username.trim();
    
    try {
      // First, check if user exists by username
      const checkResponse = await fetch(`${API_URL}/api/users`);
      
      if (!checkResponse.ok) {
        throw new Error('Failed to check user');
      }
      
      const users: User[] = await checkResponse.json();
      const existingUser = users.find(user => user.username.toLowerCase() === trimmedUsername.toLowerCase());
      
      if (existingUser) {
        // Get full user data including profile information
        const userResponse = await fetch(`${API_URL}/api/users/${existingUser.id}`);
        
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData: UserResponse = await userResponse.json();
        
        // Store user data in localStorage
        localStorage.setItem("ff_user", JSON.stringify(userData.user));
        localStorage.setItem("ff_user_id", userData.user.id);
        localStorage.setItem("ff_username", userData.user.username);
        
        // Show QR code screen
        setUserId(userData.user.id);
        setShowQRCode(true);
        
        toast({
          title: `Welcome back, ${userData.user.username}!`,
          description: "Please sync your device",
        });
      } else {
        // Create new user
        console.log('Creating new user:', trimmedUsername);
        const createResponse = await fetch(`${API_URL}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            username: trimmedUsername,
            // Default values for new user
            age: 25,
            weight: "70.00",
            height: "175.00",
            gender: "other",
            goals: "maintenance",
            allergies: ["none"],
            conditions: ["none"],
            notes: []
          })
        });
        
        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({}));
          console.error('Failed to create user:', errorData);
          throw new Error(errorData.error || 'Failed to create user');
        }
        
        const newUserResponse: UserResponse = await createResponse.json();
        console.log('User created:', newUserResponse);
        
        if (!newUserResponse || !newUserResponse.user) {
          throw new Error('Invalid response from server');
        }
        
        const newUser = newUserResponse.user;
        
        // Store user data in localStorage
        localStorage.setItem("ff_user", JSON.stringify(newUser));
        localStorage.setItem("ff_user_id", newUser.id);
        localStorage.setItem("ff_username", newUser.username);
        
        toast({
          title: `Welcome to FoodFrame, ${newUser.username}!`,
          description: "Let's set up your profile...",
        });
        
        // Redirect to onboarding without the user ID in the URL
        navigate('/onboarding', { state: { newUser: true } });
      }
    } catch (error) {
      console.error("Error in user flow:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    navigate('/dashboard');
  };

  if (showQRCode && userId) {
    return <QRCodeScreen userId={userId} onProceed={handleProceed} />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Utensils className="h-8 w-8 mr-2 text-primary" />
            <span className="text-2xl font-bold">Frame</span>
          </div>
          <CardTitle className="text-2xl text-center">
            {isLoading ? 'Checking...' : 'Welcome to Frame'}
          </CardTitle>
          <p className="text-sm text-center text-muted-foreground">
            {isLoading 
              ? 'Checking your account...' 
              : 'Enter your username to continue'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
                className="text-base h-12"
              />
            </div>
            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}