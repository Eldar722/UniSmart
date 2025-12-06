import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/UserContext";
import { UserProfile, universities, calculateMatchScore, entScoreHistory } from "@/data/mockData";
import { Sparkles, RefreshCw } from "lucide-react";
import { set } from "date-fns";

interface WhatIfWidgetProps {
  // теперь возвращаем симулированный профиль (или null для сброса)
  onSimulate: (simulatedProfile: UserProfile | null) => void;
}

export function WhatIfWidget({ onSimulate }: WhatIfWidgetProps) {
  const { profile, clearProfile } = useUser();
  const [tempProfile, setTempProfile] = useState<{
    entScore: number | "";
    ieltsScore: number | "";
    budget: number | "";
  }>({
    entScore: profile?.entScore ?? "",
    ieltsScore: profile?.ieltsScore ?? "",
    budget: profile?.budget ?? "",
  });

  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = () => {
    if (!profile) return;
    
    setIsSimulating(true);
    
    // Simulate "AI processing"
    setTimeout(() => {
      const simulatedProfile: UserProfile = {
        ...profile,
        entScore: (tempProfile.entScore === "" ? profile.entScore : (tempProfile.entScore as number)),
        ieltsScore: (tempProfile.ieltsScore === "" ? profile.ieltsScore : (tempProfile.ieltsScore as number)),
        budget: (tempProfile.budget === "" ? profile.budget : (tempProfile.budget as number)),
      };

      // Передаём симулированный профиль родителю — он пересчитает рекомендации
      onSimulate(simulatedProfile);
      setIsSimulating(false);
    }, 500);
  };

  const handleReset = () => {
    setTempProfile({
      entScore: "",
      ieltsScore: "",
      budget: "",
    });

    // очистка результатов
    onSimulate(null);
  };

  const handleClear = () => {
    // Сброс локальных полей ввода
    setTempProfile({
      entScore: "",
      ieltsScore: "",
      budget: "",
    });

    // Очистка результатов симуляции в родителе
    onSimulate(null);

    // Очистка профиля пользователя в контексте (сброс данных квиза)
    if (typeof clearProfile === "function") {
      clearProfile();
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold">Что, если?</h3>
          <p className="text-xs text-muted-foreground">Симулятор изменения параметров</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        <div>
          <Label htmlFor="sim-ent" className="text-sm">Балл ЕНТ</Label>
          <Input
            id="sim-ent"
            type="number"
            min={50}
            max={140}
            value={tempProfile.entScore || ""}
            onChange={(e) => setTempProfile({ ...tempProfile, entScore: Number(e.target.value) })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="sim-ielts" className="text-sm">Балл IELTS</Label>
          <Input
            id="sim-ielts"
            type="number"
            min={0}
            max={9}
            step={0.5}
            value={tempProfile.ieltsScore || ""}
            onChange={(e) => setTempProfile({ ...tempProfile, ieltsScore: Number(e.target.value) })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="sim-budget" className="text-sm">Бюджет (тг)</Label>
          <Input
            id="sim-budget"
            type="number"
            min={0}
            step={100000}
            value={tempProfile.budget || ""}
            onChange={(e) => setTempProfile({ ...tempProfile, budget: Number(e.target.value) })}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="accent"
          size="sm"
          onClick={handleSimulate}
          disabled={isSimulating}
          className="gap-2"
        >
          {isSimulating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Симулировать
        </Button>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Сбросить
        </Button>
        <Button variant="outline" size="sm" type="button" onClick={handleClear} className="gap-3">
          <RefreshCw className="h-4 w-4" />
          Очистить
        </Button>

      </div>
    </div>
  );
}