import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem("ff_username");
    
    if (username) {
      // In a real app, you'd verify the user exists via API call
      // For now, just redirect to dashboard
      navigate("/dashboard");
    } else {
      // No username found, redirect to entry screen
      navigate("/username");
    }
  }, [navigate]);

  // Loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <div className="text-center animate-fade-in">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading FoodFrame...</p>
      </div>
    </div>
  );
};

export default Index;
