import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { UniversityCard } from "@/components/recommendations/UniversityCard";
import { WhatIfWidget } from "@/components/recommendations/WhatIfWidget";
import { useUser } from "@/context/UserContext";
import { universities, calculateMatchScore } from "@/data/mockData";
import { Sparkles, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Recommendations = () => {
  const { isAuthenticated, profile } = useUser();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<"match" | "rank" | "ent">("match");
  const [simulatedScores, setSimulatedScores] = useState<{ id: string; score: number }[] | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    } else if (!profile) {
      navigate("/quiz");
    }
  }, [isAuthenticated, profile, navigate]);

  const scoredUniversities = useMemo(() => {
    if (!profile) return [];

    return universities.map((uni) => ({
      university: uni,
      score: simulatedScores?.find((s) => s.id === uni.id)?.score ?? calculateMatchScore(uni, profile),
    }));
  }, [profile, simulatedScores]);

  const sortedUniversities = useMemo(() => {
    const sorted = [...scoredUniversities];
    
    switch (sortBy) {
      case "match":
        sorted.sort((a, b) => b.score - a.score);
        break;
      case "rank":
        sorted.sort((a, b) => a.university.nationalRank - b.university.nationalRank);
        break;
      case "ent":
        sorted.sort((a, b) => a.university.minENT - b.university.minENT);
        break;
    }
    
    return sorted;
  }, [scoredUniversities, sortBy]);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-accent mb-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">AI-рекомендации</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Ваши <span className="gradient-text">персональные</span> рекомендации
          </h1>
          <p className="text-muted-foreground">
            На основе ваших баллов ЕНТ ({profile.entScore}), IELTS ({profile.ieltsScore || "не указан"}) и интересов
          </p>
        </div>

        {/* What-If Widget */}
        <WhatIfWidget onSimulate={setSimulatedScores} />

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Найдено {sortedUniversities.length} университетов
          </p>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Сортировка
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("match")}>
                  По соответствию
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("rank")}>
                  По рейтингу
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("ent")}>
                  По мин. ЕНТ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* University Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedUniversities.map((item, index) => (
            <UniversityCard
              key={item.university.id}
              university={item.university}
              matchScore={item.score}
              rank={index + 1}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Recommendations;
