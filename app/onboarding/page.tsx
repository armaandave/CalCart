'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useUserStore } from '@/lib/stores/userStore'
import { ChefHat, ArrowRight, ArrowLeft } from 'lucide-react'
import { GoalType } from '@prisma/client'

type OnboardingData = {
  // Health Goals
  goalType: GoalType
  targetCalories: number | null
  targetProtein: number | null
  targetCarbs: number | null
  targetFats: number | null
  
  // Dietary Info
  allergies: string[]
  restrictions: string[]
  preferences: string[]
}

const commonAllergies = ['Peanuts', 'Tree nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish']
const commonRestrictions = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Keto', 'Paleo', 'Low-carb', 'Halal', 'Kosher']
const commonPreferences = ['Organic', 'Low-sodium', 'Sugar-free', 'High-protein', 'Whole-foods', 'Mediterranean']

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const updateProfile = useUserStore((state) => state.updateProfile)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const [data, setData] = useState<OnboardingData>({
    goalType: 'MAINTAIN',
    targetCalories: null,
    targetProtein: null,
    targetCarbs: null,
    targetFats: null,
    allergies: [],
    restrictions: [],
    preferences: []
  })

  const [customAllergy, setCustomAllergy] = useState('')
  const [customRestriction, setCustomRestriction] = useState('')

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !data.allergies.includes(customAllergy.trim())) {
      setData({ ...data, allergies: [...data.allergies, customAllergy.trim()] })
      setCustomAllergy('')
    }
  }

  const addCustomRestriction = () => {
    if (customRestriction.trim() && !data.restrictions.includes(customRestriction.trim())) {
      setData({ ...data, restrictions: [...data.restrictions, customRestriction.trim()] })
      setCustomRestriction('')
    }
  }

  const removeAllergy = (allergy: string) => {
    setData({ ...data, allergies: data.allergies.filter(a => a !== allergy) })
  }

  const removeRestriction = (restriction: string) => {
    setData({ ...data, restrictions: data.restrictions.filter(r => r !== restriction) })
  }

  const toggleItem = (list: string[], item: string) => {
    if (list.includes(item)) {
      return list.filter(i => i !== item)
    } else {
      return [...list, item]
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await updateProfile(data)
      toast({
        title: 'Profile updated!',
        description: 'Your health preferences have been saved.'
      })
      router.push('/dashboard')
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <ChefHat className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-primary">Recipe Optimizer</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Let's personalize your experience</CardTitle>
            <CardDescription>Step {step} of 2</CardDescription>
            <div className="flex gap-2 mt-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i <= step ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {/* Step 1: Health Goals */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">What's your primary health goal?</h3>
                  <div className="space-y-3">
                    {[
                      { value: 'LOSE_WEIGHT', label: 'Lose Weight', desc: 'Reduce calories, increase protein' },
                      { value: 'BUILD_MUSCLE', label: 'Build Muscle', desc: 'High protein, moderate carbs' },
                      { value: 'MAINTAIN', label: 'Maintain Health', desc: 'Balanced nutrition' },
                      { value: 'CUSTOM', label: 'Custom Goals', desc: 'Set your own targets' }
                    ].map((goal) => (
                      <button
                        key={goal.value}
                        onClick={() => setData({ ...data, goalType: goal.value as GoalType })}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                          data.goalType === goal.value
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

                {data.goalType === 'CUSTOM' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Custom Targets (per serving)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="calories">Calories</Label>
                        <Input
                          id="calories"
                          type="number"
                          placeholder="500"
                          value={data.targetCalories || ''}
                          onChange={(e) => setData({ ...data, targetCalories: parseInt(e.target.value) || null })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="protein">Protein (g)</Label>
                        <Input
                          id="protein"
                          type="number"
                          placeholder="30"
                          value={data.targetProtein || ''}
                          onChange={(e) => setData({ ...data, targetProtein: parseInt(e.target.value) || null })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="carbs">Carbs (g)</Label>
                        <Input
                          id="carbs"
                          type="number"
                          placeholder="50"
                          value={data.targetCarbs || ''}
                          onChange={(e) => setData({ ...data, targetCarbs: parseInt(e.target.value) || null })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="fats">Fats (g)</Label>
                        <Input
                          id="fats"
                          type="number"
                          placeholder="20"
                          value={data.targetFats || ''}
                          onChange={(e) => setData({ ...data, targetFats: parseInt(e.target.value) || null })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Dietary Restrictions & Preferences */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Do you have any food allergies?</h3>
                  <p className="text-sm text-gray-500 mb-4">Select all that apply or add your own</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {commonAllergies.map((allergy) => (
                      <button
                        key={allergy}
                        onClick={() => setData({ ...data, allergies: toggleItem(data.allergies, allergy) })}
                        className={`px-4 py-2 rounded-full border-2 transition-colors ${
                          data.allergies.includes(allergy)
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {allergy}
                      </button>
                    ))}
                  </div>
                  
                  {/* Selected allergies */}
                  {data.allergies.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-2">Selected:</p>
                      <div className="flex flex-wrap gap-2">
                        {data.allergies.map((allergy) => (
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
                  <h3 className="text-lg font-semibold mb-2">Any dietary restrictions?</h3>
                  <p className="text-sm text-gray-500 mb-4">Select all that apply or add your own</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {commonRestrictions.map((restriction) => (
                      <button
                        key={restriction}
                        onClick={() => setData({ ...data, restrictions: toggleItem(data.restrictions, restriction) })}
                        className={`px-4 py-2 rounded-full border-2 transition-colors ${
                          data.restrictions.includes(restriction)
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {restriction}
                      </button>
                    ))}
                  </div>
                  
                  {/* Selected restrictions */}
                  {data.restrictions.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-2">Selected:</p>
                      <div className="flex flex-wrap gap-2">
                        {data.restrictions.map((restriction) => (
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
                  <h3 className="text-lg font-semibold mb-2">Food preferences</h3>
                  <p className="text-sm text-gray-500 mb-4">Optional - helps us personalize better</p>
                  <div className="flex flex-wrap gap-2">
                    {commonPreferences.map((preference) => (
                      <button
                        key={preference}
                        onClick={() => setData({ ...data, preferences: toggleItem(data.preferences, preference) })}
                        className={`px-4 py-2 rounded-full border-2 transition-colors ${
                          data.preferences.includes(preference)
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


            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}
              
              {step < 2 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

