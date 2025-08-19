import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
        
        toast({
          title: `Welcome back, ${userData.user.username}!`,
          description: "Loading your dashboard...",
        });
        
        navigate(`/dashboard/${userData.user.id}`);
      } else {
        // Create new user
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
            body_fat_percentage: "20.00",
            gender: "other",
            goals: "maintenance",
            allergies: ["none"],
            conditions: ["none"],
            notes: []
          })
        });
        
        if (!createResponse.ok) {
          throw new Error('Failed to create user');
        }
        
        const newUserResponse: UserResponse = await createResponse.json();
        const newUser = newUserResponse.user;
        
        // Store user data in localStorage
        localStorage.setItem("ff_user", JSON.stringify(newUser));
        localStorage.setItem("ff_user_id", newUser.id);
        localStorage.setItem("ff_username", newUser.username);
        
        toast({
          title: `Welcome to FoodFrame, ${newUser.username}!`,
          description: "Let's set up your profile...",
        });
        
        navigate("/onboarding");
      }
    } catch (error) {
      console.error("Error checking user:", error);
      toast({
        title: "Error",
        description: "Failed to check user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* App Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4 shadow-medium">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">FoodFrame</h1>
          <p className="text-muted-foreground">Track your nutrition journey</p>
        </div>

        {/* Username Form */}
        <Card className="shadow-medium border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome to FoodFrame</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Enter your username to continue
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 text-base border-border/50 focus:border-primary bg-background/50"
                  disabled={isLoading}
                />
              </div>
              
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full h-12"
                disabled={!username.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}