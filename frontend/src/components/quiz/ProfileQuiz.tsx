import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/UserContext";
import { profileSubjects, interests, cities, UserProfile } from "@/data/mockData";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ProfileQuiz() {
  const navigate = useNavigate();
  const { setProfile } = useUser();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    entScore: 0,
    ieltsScore: 0,
    profileSubjects: [],
    interests: [],
    budget: 2000000,
    preferredCity: "Любой",
  });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.entScore || formData.entScore < 50 || formData.entScore > 140) {
        toast({ title: "Ошибка", description: "Введите корректный балл ЕНТ (50-140)", variant: "destructive" });
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = () => {
    const profile: UserProfile = {
      entScore: formData.entScore || 0,
      ieltsScore: formData.ieltsScore || 0,
      profileSubjects: formData.profileSubjects || [],
      interests: formData.interests || [],
      budget: formData.budget || 2000000,
      preferredCity: formData.preferredCity || "Любой",
    };
    setProfile(profile);
    toast({ title: "Отлично!", description: "Ваш профиль сохранен. Загружаем рекомендации..." });
    navigate("/recommendations");
  };

  const toggleSubject = (subject: string) => {
    const current = formData.profileSubjects || [];
    if (current.includes(subject)) {
      setFormData({ ...formData, profileSubjects: current.filter((s) => s !== subject) });
    } else if (current.length < 3) {
      setFormData({ ...formData, profileSubjects: [...current, subject] });
    }
  };

  const toggleInterest = (interestId: string) => {
    const current = formData.interests || [];
    if (current.includes(interestId)) {
      setFormData({ ...formData, interests: current.filter((i) => i !== interestId) });
    } else if (current.length < 3) {
      setFormData({ ...formData, interests: [...current, interestId] });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Шаг {step} из 2</span>
            <span className="text-sm font-medium">{step === 1 ? "Баллы" : "Интересы"}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8 animate-scale-in">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Ваши баллы</h2>
                <p className="text-muted-foreground">
                  Укажите результаты экзаменов для точных рекомендаций
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="ent" className="text-base font-medium">
                    Балл ЕНТ <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ent"
                    type="number"
                    min={50}
                    max={140}
                    placeholder="Например: 110"
                    value={formData.entScore || ""}
                    onChange={(e) => setFormData({ ...formData, entScore: Number(e.target.value) })}
                    className="mt-2 h-12 text-lg"
                  />
                  <p className="text-sm text-muted-foreground mt-1">От 50 до 140 баллов</p>
                </div>

                <div>
                  <Label htmlFor="ielts" className="text-base font-medium">
                    Балл IELTS (необязательно)
                  </Label>
                  <Input
                    id="ielts"
                    type="number"
                    min={0}
                    max={9}
                    step={0.5}
                    placeholder="Например: 6.5"
                    value={formData.ieltsScore || ""}
                    onChange={(e) => setFormData({ ...formData, ieltsScore: Number(e.target.value) })}
                    className="mt-2 h-12 text-lg"
                  />
                  <p className="text-sm text-muted-foreground mt-1">От 0 до 9 баллов</p>
                </div>

                <div>
                  <Label className="text-base font-medium">
                    Профильные предметы ЕНТ (до 3)
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {profileSubjects.map((subject) => (
                      <Button
                        key={subject}
                        type="button"
                        variant={formData.profileSubjects?.includes(subject) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSubject(subject)}
                        className="justify-start"
                      >
                        {formData.profileSubjects?.includes(subject) && (
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                        )}
                        {subject}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Ваши интересы</h2>
                <p className="text-muted-foreground">
                  Выберите направления и укажите предпочтения
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    Интересующие направления (до 3)
                  </Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {interests.map((interest) => (
                      <Button
                        key={interest.id}
                        type="button"
                        variant={formData.interests?.includes(interest.id) ? "default" : "outline"}
                        className="h-auto py-3 px-4 justify-start gap-3"
                        onClick={() => toggleInterest(interest.id)}
                      >
                        <span className="text-xl">{interest.icon}</span>
                        <span className="text-sm">{interest.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="budget" className="text-base font-medium">
                    Бюджет на обучение (тг/год)
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    min={0}
                    step={100000}
                    placeholder="2000000"
                    value={formData.budget || ""}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label className="text-base font-medium">Предпочтительный город</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {cities.map((city) => (
                      <Button
                        key={city}
                        type="button"
                        variant={formData.preferredCity === city ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData({ ...formData, preferredCity: city })}
                      >
                        {city}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <Button variant="hero" onClick={handleNext} className="gap-2">
                Далее
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="hero" onClick={handleSubmit} className="gap-2">
                Получить рекомендации
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
