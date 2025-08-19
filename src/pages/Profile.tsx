import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit3, Save, UserX, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  height: z.number().min(100, "Height must be at least 100cm").max(250, "Height must be less than 250cm"),
  weight: z.number().min(30, "Weight must be at least 30kg").max(300, "Weight must be less than 300kg"),
  body_fat_percentage: z.number().min(0, "Body fat must be at least 0%").max(70, "Body fat must be less than 70%"),
  age: z.number().min(10, "Age must be at least 10").max(120, "Age must be less than 120"),
  gender: z.enum(["male", "female", "other"]),
  goals: z.enum(["weight_loss", "maintenance", "muscle_gain"]),
  allergies: z.array(z.string()),
  conditions: z.array(z.string()),
  notes: z.string()
});

type ProfileData = z.infer<typeof profileSchema>;

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [allergies, setAllergies] = useState<string[]>(["Nuts", "Dairy"]);
  const [conditions, setConditions] = useState<string[]>(["Type 2 Diabetes"]);
  const [allergyInput, setAllergyInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");
  
  const username = localStorage.getItem("ff_username") || "User";

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      height: 175,
      weight: 75,
      body_fat_percentage: 18,
      age: 28,
      gender: "male",
      goals: "maintenance",
      allergies,
      conditions,
      notes: "Trying to maintain current weight while building muscle. Prefer plant-based proteins when possible."
    }
  });

  const addAllergy = () => {
    if (allergyInput.trim() && !allergies.includes(allergyInput.trim())) {
      const newAllergies = [...allergies, allergyInput.trim()];
      setAllergies(newAllergies);
      form.setValue("allergies", newAllergies);
      setAllergyInput("");
    }
  };

  const removeAllergy = (allergy: string) => {
    const newAllergies = allergies.filter(a => a !== allergy);
    setAllergies(newAllergies);
    form.setValue("allergies", newAllergies);
  };

  const addCondition = () => {
    if (conditionInput.trim() && !conditions.includes(conditionInput.trim())) {
      const newConditions = [...conditions, conditionInput.trim()];
      setConditions(newConditions);
      form.setValue("conditions", newConditions);
      setConditionInput("");
    }
  };

  const removeCondition = (condition: string) => {
    const newConditions = conditions.filter(c => c !== condition);
    setConditions(newConditions);
    form.setValue("conditions", newConditions);
  };

  const onSubmit = async (data: ProfileData) => {
    try {
      // Here you would call your API to update the user
      console.log("Updated profile data:", data);
      
      toast({
        title: "Profile updated!",
        description: "Your information has been saved successfully.",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSwitchUser = () => {
    localStorage.removeItem("ff_username");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 shadow-soft">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/dashboard")}
              className="h-10 w-10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Profile</h1>
              <p className="text-sm text-muted-foreground">@{username}</p>
            </div>
          </div>
          {!isEditing && (
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
              <Edit3 className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 animate-fade-in">
        <Card className="shadow-medium border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              {isEditing ? "Update your profile details" : "Your current profile information"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Physical Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="body_fat_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Fat (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Gender & Goals */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
                        <FormControl>
                          <SelectTrigger className={!isEditing ? "bg-muted" : ""}>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Goal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isEditing}>
                        <FormControl>
                          <SelectTrigger className={!isEditing ? "bg-muted" : ""}>
                            <SelectValue placeholder="Select your goal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weight_loss">Weight Loss</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Allergies */}
                <div className="space-y-2">
                  <FormLabel>Allergies</FormLabel>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add allergy"
                        value={allergyInput}
                        onChange={(e) => setAllergyInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                      />
                      <Button type="button" onClick={addAllergy} variant="outline" size="sm">
                        Add
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {allergies.map((allergy) => (
                      <Badge key={allergy} variant="secondary" className="flex items-center gap-1">
                        {allergy}
                        {isEditing && (
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeAllergy(allergy)}
                          />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Conditions */}
                <div className="space-y-2">
                  <FormLabel>Medical Conditions</FormLabel>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add condition"
                        value={conditionInput}
                        onChange={(e) => setConditionInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                      />
                      <Button type="button" onClick={addCondition} variant="outline" size="sm">
                        Add
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {conditions.map((condition) => (
                      <Badge key={condition} variant="secondary" className="flex items-center gap-1">
                        {condition}
                        {isEditing && (
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeCondition(condition)}
                          />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Any additional information about your health, diet preferences, etc."
                          className={`min-h-[80px] ${!isEditing ? "bg-muted" : ""}`}
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEditing && (
                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      variant="hero" 
                      className="flex-1 h-11"
                      disabled={form.formState.isSubmitting}
                    >
                      <Save className="w-4 h-4" />
                      {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 h-11"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </Form>

            {!isEditing && (
              <div className="mt-6 pt-6 border-t border-border/50">
                <Button 
                  variant="outline" 
                  onClick={handleSwitchUser}
                  className="w-full h-11 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                >
                  <UserX className="w-4 h-4" />
                  Switch User
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}