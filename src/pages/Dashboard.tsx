import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NutritionRing } from "@/components/NutritionRing";
import { Plus, Edit3, Minus, Flame, Beef, Wheat, Droplets, Settings, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams } from "react-router-dom";

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'https://foodframeapi.onrender.com';

interface IntakeData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  water: number;
  date: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const username = localStorage.getItem("ff_username") || "User";
  const userId = localStorage.getItem("ff_user_id");
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize with empty data
  const [todayIntake, setTodayIntake] = useState<IntakeData>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    water: 0,
    date: new Date().toISOString().split('T')[0]
  });
  
  // State for weekly intake data
  const [weeklyIntake, setWeeklyIntake] = useState<Array<IntakeData>>([]);
  
  // Fetch user data including daily and weekly intake
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        console.error('No user ID found in localStorage');
        toast({
          title: "Error",
          description: "User not authenticated. Please log in again.",
          variant: "destructive"
        });
        return;
      }
      
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch user data which includes both daily and weekly intake
        const response = await fetch(`${API_URL}/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        console.log('User data received:', data);
        
        // Set today's intake if available
        if (data.dailyIntakeToday) {
          setTodayIntake(prev => ({
            ...prev,
            ...data.dailyIntakeToday,
            date: today
          }));
        }
        
        // Set weekly intake if available
        if (data.weeklyIntakeThisWeek && Array.isArray(data.weeklyIntakeThisWeek)) {
          console.log('Setting weekly intake data:', data.weeklyIntakeThisWeek);
          setWeeklyIntake(data.weeklyIntakeThisWeek);
        } else {
          console.log('No weeklyIntakeThisWeek in response, using empty array');
          setWeeklyIntake([]);
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId, toast]);
  
  // Helper function to get day name from date string
  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };
  
  // Generate array of last 7 days with intake data
  const getLastSevenDays = () => {
    const days = [];
    const today = new Date();
    
    // Create a map of date to intake data for faster lookup
    const intakeMap = new Map();
    weeklyIntake.forEach(item => {
      intakeMap.set(item.date, item);
    });
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = intakeMap.get(dateStr);
      
      days.push({
        date: dateStr,
        dayName: i === 0 ? 'Today' : getDayName(dateStr),
        calories: dayData?.calories || 0,
        protein: dayData?.protein || 0,
        carbs: dayData?.carbs || 0,
        fats: dayData?.fats || 0,
        fiber: dayData?.fiber || 0,
        water: dayData?.water || 0
      });
    }
    
    return days;
  };
  
  const lastSevenDays = getLastSevenDays();

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

  const handleQuickAdd = async (scope: 'daily' | 'weekly') => {
    const values = Object.fromEntries(
      Object.entries(quickAdd)
        .filter(([key, value]) => value !== "" && key !== "date")
        .map(([key, value]) => [key, Number(value)])
    );
    
    if (Object.keys(values).length === 0) {
      toast({
        title: "No data to add",
        description: "Please enter at least one nutrition value.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/intake/add/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scope,
          date: quickAdd.date,
          ...values
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add intake');
      }
      
      // Refresh the intake data
      const updatedData = await response.json();
      setTodayIntake(prev => ({
        ...prev,
        ...updatedData.intake
      }));
      
      toast({
        title: "Intake added",
        description: `Successfully added ${scope} nutrition data.`,
      });
      
      // Reset the form
      setQuickAdd({
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
        fiber: "",
        water: "",
        date: new Date().toISOString().split('T')[0]
      });
      
    } catch (error) {
      console.error('Error adding intake:', error);
      toast({
        title: "Error",
        description: "Failed to add nutrition data. Please try again.",
        variant: "destructive"
      });
    }
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
          <CardContent className="pt-0 pb-8">
            <div className="grid grid-cols-2 gap-8 pt-2">
              <div className="flex flex-col items-center space-y-3">
                <Flame className="w-7 h-7 text-calories mb-1" />
                <NutritionRing
                  label="Calories"
                  value={todayIntake.calories}
                  target={targets.calories}
                  color="calories"
                  size="md"
                />
              </div>
              <div className="flex flex-col items-center space-y-3">
                <Beef className="w-7 h-7 text-protein mb-1" />
                <NutritionRing
                  label="Protein"
                  value={todayIntake.protein}
                  target={targets.protein}
                  color="protein"
                  size="md"
                />
              </div>
              <div className="flex flex-col items-center space-y-3">
                <Wheat className="w-7 h-7 text-fiber mb-1" />
                <NutritionRing
                  label="Fiber"
                  value={todayIntake.fiber}
                  target={targets.fiber}
                  color="fiber"
                  size="md"
                />
              </div>
              <div className="flex flex-col items-center space-y-3">
                <Droplets className="w-7 h-7 text-water mb-1" />
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
            <CardTitle className="text-card-foreground">Weekly Intake</CardTitle>
            <CardDescription>Your nutrition data for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : weeklyIntake.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No weekly data available. Start tracking your nutrition to see your progress.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2">Date</th>
                      <th className="text-right py-2 px-2">
                        <div className="flex items-center justify-end gap-1">
                          <Flame className="w-3.5 h-3.5 text-calories" />
                          <span>Calories</span>
                        </div>
                      </th>
                      <th className="text-right py-2 px-2">
                        <div className="flex items-center justify-end gap-1">
                          <Beef className="w-3.5 h-3.5 text-protein" />
                          <span>Protein</span>
                        </div>
                      </th>
                      <th className="text-right py-2 px-2">
                        <div className="flex items-center justify-end gap-1">
                          <Droplets className="w-3.5 h-3.5 text-water" />
                          <span>Water</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyIntake.map((dayData, index) => {
                      const date = new Date(dayData.date);
                      const isToday = date.toDateString() === new Date().toDateString();
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                      
                      return (
                        <tr 
                          key={dayData.date}
                          className={`border-b border-border/30 ${isToday ? 'bg-primary/5' : ''}`}
                        >
                          <td className="py-2 px-2 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className={`font-medium ${isToday ? 'text-primary' : ''}`}>
                                {date.getDate()} {date.toLocaleString('default', { month: 'short' })}
                              </span>
                              <span className="text-xs text-muted-foreground">{dayName} {isToday && '(Today)'}</span>
                            </div>
                          </td>
                          <td className="text-right py-2 px-2">
                            {Math.round(dayData.calories)} cal
                          </td>
                          <td className="text-right py-2 px-2">
                            {Math.round(dayData.protein)}g
                          </td>
                          <td className="text-right py-2 px-2">
                            {Number(dayData.water || 0).toFixed(1)}L
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}