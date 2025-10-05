'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useUserStore } from '@/lib/stores/userStore'
import { Heart, Target } from 'lucide-react'
import { GoalType } from '@prisma/client'

const commonAllergies = ['Peanuts', 'Tree nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish']
const commonRestrictions = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Keto', 'Paleo', 'Low-carb', 'Halal', 'Kosher']
const commonPreferences = ['Organic', 'Low-sodium', 'Sugar-free', 'High-protein', 'Whole-foods', 'Mediterranean']

export default function ProfilePage() {
  const { toast } = useToast()
  const { user, updateProfile } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<'goals' | 'dietary'>('goals')

  // Form state
  const [goalType, setGoalType] = useState<GoalType>('MAINTAIN')
  const [targetCalories, setTargetCalories] = useState<number | null>(null)
  const [targetProtein, setTargetProtein] = useState<number | null>(null)
  const [targetCarbs, setTargetCarbs] = useState<number | null>(null)
  const [targetFats, setTargetFats] = useState<number | null>(null)
  const [allergies, setAllergies] = useState<string[]>([])
  const [restrictions, setRestrictions] = useState<string[]>([])
  const [preferences, setPreferences] = useState<string[]>([])
  
  const [customAllergy, setCustomAllergy] = useState('')
  const [customRestriction, setCustomRestriction] = useState('')

  // Initialize form with user profile data
  useEffect(() => {
    if (user?.profile) {
      setGoalType(user.profile.goalType)
      setTargetCalories(user.profile.targetCalories)
      setTargetProtein(user.profile.targetProtein)
      setTargetCarbs(user.profile.targetCarbs)
      setTargetFats(user.profile.targetFats)
      setAllergies(user.profile.allergies)
      setRestrictions(user.profile.restrictions)
      setPreferences(user.profile.preferences)
    }
  }, [user])

  const toggleItem = (list: string[], item: string, setter: (list: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item))
    } else {
      setter([...list, item])
    }
  }

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies([...allergies, customAllergy.trim()])
      setCustomAllergy('')
    }
  }

  const addCustomRestriction = () => {
    if (customRestriction.trim() && !restrictions.includes(customRestriction.trim())) {
      setRestrictions([...restrictions, customRestriction.trim()])
      setCustomRestriction('')
    }
  }

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy))
  }

  const removeRestriction = (restriction: string) => {
    setRestrictions(restrictions.filter(r => r !== restriction))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateProfile({
        goalType,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFats,
        allergies,
        restrictions,
        preferences
      })
      toast({
        title: 'Profile updated!',
        description: 'Your preferences have been saved successfully.'
      })
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user?.profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-gray-500 mt-2">Manage your health preferences and dietary settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('goals')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activeSection === 'goals'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Target className="h-5 w-5" />
                  <span>Health Goals</span>
                </button>
                <button
                  onClick={() => setActiveSection('dietary')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activeSection === 'dietary'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Heart className="h-5 w-5" />
                  <span>Dietary Info</span>
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeSection === 'goals' && 'Health Goals'}
                {activeSection === 'dietary' && 'Dietary Information'}
              </CardTitle>
              <CardDescription>
                {activeSection === 'goals' && 'Set your health and nutrition targets'}
                {activeSection === 'dietary' && 'Manage allergies, restrictions, and preferences'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Health Goals Section */}
              {activeSection === 'goals' && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Primary Goal</Label>
                    <div className="space-y-3">
                      {[
                        { value: 'LOSE_WEIGHT', label: 'Lose Weight', desc: 'Reduce calories, increase protein' },
                        { value: 'BUILD_MUSCLE', label: 'Build Muscle', desc: 'High protein, moderate carbs' },
                        { value: 'MAINTAIN', label: 'Maintain Health', desc: 'Balanced nutrition' },
                        { value: 'CUSTOM', label: 'Custom Goals', desc: 'Set your own targets' }
                      ].map((goal) => (
                        <button
                          key={goal.value}
                          onClick={() => setGoalType(goal.value as GoalType)}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                            goalType === goal.value
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{goal.label}</div>
                          <div className="text-sm text-gray-500">{goal.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {goalType === 'CUSTOM' && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                      <h4 className="font-medium">Custom Targets (per serving)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="calories">Calories</Label>
                          <Input
                            id="calories"
                            type="number"
                            placeholder="500"
                            value={targetCalories || ''}
                            onChange={(e) => setTargetCalories(parseInt(e.target.value) || null)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="protein">Protein (g)</Label>
                          <Input
                            id="protein"
                            type="number"
                            placeholder="30"
                            value={targetProtein || ''}
                            onChange={(e) => setTargetProtein(parseInt(e.target.value) || null)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="carbs">Carbs (g)</Label>
                          <Input
                            id="carbs"
                            type="number"
                            placeholder="50"
                            value={targetCarbs || ''}
                            onChange={(e) => setTargetCarbs(parseInt(e.target.value) || null)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="fats">Fats (g)</Label>
                          <Input
                            id="fats"
                            type="number"
                            placeholder="20"
                            value={targetFats || ''}
                            onChange={(e) => setTargetFats(parseInt(e.target.value) || null)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dietary Information Section */}
              {activeSection === 'dietary' && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Food Allergies</Label>
                    <p className="text-sm text-gray-500 mb-3">Select all that apply or add your own</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {commonAllergies.map((allergy) => (
                        <button
                          key={allergy}
                          onClick={() => toggleItem(allergies, allergy, setAllergies)}
                          className={`px-4 py-2 rounded-full border-2 transition-colors ${
                            allergies.includes(allergy)
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {allergy}
                        </button>
                      ))}
                    </div>
                    
                    {/* Selected allergies */}
                    {allergies.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-2">Selected:</p>
                        <div className="flex flex-wrap gap-2">
                          {allergies.map((allergy) => (
                            <span
                              key={allergy}
                              className="px-3 py-1 rounded-full bg-primary text-white text-sm flex items-center gap-2"
                            >
                              {allergy}
                              <button
                                onClick={() => removeAllergy(allergy)}
                                className="hover:bg-white/20 rounded-full p-0.5"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Add custom allergy */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add custom allergy..."
                        value={customAllergy}
                        onChange={(e) => setCustomAllergy(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addCustomAllergy()
                          }
                        }}
                      />
                      <Button type="button" onClick={addCustomAllergy} variant="outline">
                        Add
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-3 block">Dietary Restrictions</Label>
                    <p className="text-sm text-gray-500 mb-3">Select all that apply or add your own</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {commonRestrictions.map((restriction) => (
                        <button
                          key={restriction}
                          onClick={() => toggleItem(restrictions, restriction, setRestrictions)}
                          className={`px-4 py-2 rounded-full border-2 transition-colors ${
                            restrictions.includes(restriction)
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {restriction}
                        </button>
                      ))}
                    </div>
                    
                    {/* Selected restrictions */}
                    {restrictions.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-2">Selected:</p>
                        <div className="flex flex-wrap gap-2">
                          {restrictions.map((restriction) => (
                            <span
                              key={restriction}
                              className="px-3 py-1 rounded-full bg-primary text-white text-sm flex items-center gap-2"
                            >
                              {restriction}
                              <button
                                onClick={() => removeRestriction(restriction)}
                                className="hover:bg-white/20 rounded-full p-0.5"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Add custom restriction */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add custom restriction..."
                        value={customRestriction}
                        onChange={(e) => setCustomRestriction(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addCustomRestriction()
                          }
                        }}
                      />
                      <Button type="button" onClick={addCustomRestriction} variant="outline">
                        Add
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-3 block">Food Preferences</Label>
                    <p className="text-sm text-gray-500 mb-3">Optional preferences</p>
                    <div className="flex flex-wrap gap-2">
                      {commonPreferences.map((preference) => (
                        <button
                          key={preference}
                          onClick={() => toggleItem(preferences, preference, setPreferences)}
                          className={`px-4 py-2 rounded-full border-2 transition-colors ${
                            preferences.includes(preference)
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {preference}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}


              {/* Save Button */}
              <div className="pt-4 border-t">
                <Button onClick={handleSave} disabled={isLoading} className="w-full">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

