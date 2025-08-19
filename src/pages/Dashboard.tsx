import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NutritionRing } from "@/components/NutritionRing";
import { Plus, Edit3, Minus, User, Flame, Beef, Wheat, Droplets, Home, BarChart3, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { toast } = useToast();
  const username = localStorage.getItem("ff_username") || "User";
  
  // Initialize with empty data for new accounts
  const [todayIntake] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    water: 0
  });

  const targets = {
    calories: 2200,
    protein: 120,
    fiber: 25,
    water: 2.5
  };

  const [quickAdd, setQuickAdd] = useState({
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    fiber: "",
    water: "",
    date: new Date().toISOString().split('T')[0]
  });

  const handleQuickAdd = (scope: 'daily' | 'weekly') => {
    const values = Object.fromEntries(
      Object.entries(quickAdd).filter(([key, value]) => value !== "" && key !== "date")
    );
    
    if (Object.keys(values).length === 0) {
      toast({
        title: "No data to add",
        description: "Please enter at least one nutrition value.",
        variant: "destructive"
      });
      return;
    }

    // Here you would call your API
    console.log(`Adding to ${scope}:`, { ...values, date: quickAdd.date });
    
    toast({
      title: `Added to ${scope}!`,
      description: `Successfully updated your ${scope} intake.`,
    });

    // Clear form
    setQuickAdd({
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
      fiber: "",
      water: "",
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    const calorieProgress = Math.min((todayIntake.calories / targets.calories) * 100, 100);
    const proteinProgress = Math.min((todayIntake.protein / targets.protein) * 100, 100);
    const fiberProgress = Math.min((todayIntake.fiber / targets.fiber) * 100, 100);
    const waterProgress = Math.min((todayIntake.water / targets.water) * 100, 100);
    
    return (calorieProgress + proteinProgress + fiberProgress + waterProgress) / 4;
  };

  const overallProgress = calculateOverallProgress();
  const getProgressColor = (progress: number) => {
    if (progress < 15) return "bg-red-500";
    if (progress < 70) return "bg-orange-500";
    return "bg-green-500";
  };

  const getMotivationalMessage = (progress: number) => {
    if (progress < 15) return "You're way far from your achievement... Let's get started! 💪";
    if (progress < 30) return "Just getting started - keep pushing forward! 🚀";
    if (progress < 50) return "Making progress! You're on the right track 📈";
    if (progress < 70) return "Great work! You're more than halfway there! 🔥";
    if (progress < 85) return "Almost there! Push through to the finish! ⭐";
    if (progress < 100) return "So close! Just a little more to reach your goals! 🎯";
    return "Amazing! You've crushed your nutrition goals today! 🏆";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-card/80 backdrop-blur-sm border-b border-border shadow-soft z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-primary">🥗</div>
            <h1 className="text-lg font-bold text-card-foreground">FoodFrame</h1>
          </div>
          <Link to="/profile">
            <Button variant="ghost" size="sm" className="text-card-foreground hover:text-primary">
              <span className="mr-2">{username}</span>
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 animate-fade-in">
        {/* Overall Progress Bar */}
        <Card className="shadow-medium border-0 bg-card backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-card-foreground">Daily Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(overallProgress)}`}
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center italic">
                {getMotivationalMessage(overallProgress)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Today's Overview */}
        <Card className="shadow-medium border-0 bg-card backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-card-foreground">Today's Progress</CardTitle>
            <CardDescription>Your main nutrition targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center space-y-2">
                <Flame className="w-6 h-6 text-calories" />
                <NutritionRing
                  label="Calories"
                  value={todayIntake.calories}
                  target={targets.calories}
                  color="calories"
                  size="md"
                />
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Beef className="w-6 h-6 text-protein" />
                <NutritionRing
                  label="Protein"
                  value={todayIntake.protein}
                  target={targets.protein}
                  color="protein"
                  size="md"
                />
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Wheat className="w-6 h-6 text-fiber" />
                <NutritionRing
                  label="Fiber"
                  value={todayIntake.fiber}
                  target={targets.fiber}
                  color="fiber"
                  size="md"
                />
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Droplets className="w-6 h-6 text-water" />
                <NutritionRing
                  label="Water"
                  value={todayIntake.water}
                  target={targets.water}
                  color="water"
                  size="md"
                />
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Weekly Overview */}
        <Card className="shadow-medium border-0 bg-card backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-card-foreground">This Week</CardTitle>
            <CardDescription>Monday to Sunday overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                const isToday = index === new Date().getDay() - 1;
                const mockCalories = Math.floor(Math.random() * 500) + 1800;
                const mockProtein = Math.floor(Math.random() * 40) + 80;
                
                return (
                  <div 
                    key={day} 
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isToday 
                        ? 'bg-primary/10 border-primary/30 text-card-foreground' 
                        : 'bg-muted/20 border-border/30 text-card-foreground'
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`font-medium ${isToday ? 'text-primary' : 'text-card-foreground'}`}>
                        {day} {isToday && '(Today)'}
                      </p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{mockCalories} cal</span>
                        <span>{mockProtein}g protein</span>
                      </div>
                    </div>
                    {isToday && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-sm border-t border-border shadow-strong">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 text-primary">
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 text-muted-foreground">
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs">Stats</span>
            </Button>
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 text-muted-foreground">
                <User className="w-5 h-5" />
                <span className="text-xs">Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}