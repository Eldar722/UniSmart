import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { UniversityCard } from "@/components/recommendations/UniversityCard";
import { WhatIfWidget } from "@/components/recommendations/WhatIfWidget";
import { useUser } from "@/context/UserContext";
import { universities, calculateMatchScore } from "@/data/mockData";
import { Sparkles, ArrowUpDown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ExplanationStructure {
  summary: string;
  key_factors?: Array<{ factor: string; value: any; contribution: number }>;
  explanation?: string;
}

interface RecommendationItem {
  university_id: string;
  program_id: string;
  university_name: string;
  program_name: string;
  score: number;
  explanation?: ExplanationStructure | string;
}

interface ScoredUniversity {
  university: typeof universities[0];
  score: number;
  explanation?: ExplanationStructure | string;
  program_id?: string;
}

const Recommendations = () => {
  const { isAuthenticated, profile } = useUser();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<"match" | "rank" | "ent">("match");
  const [simulatedProfile, setSimulatedProfile] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";
  const { token } = useUser();

  // Argumentation modal state
  const [argOpen, setArgOpen] = useState(false);
  const [argumentation, setArgumentation] = useState<any>(null);

  const fetchArgumentation = async (compoundId: string) => {
    setArgumentation(null);
    setArgOpen(true);
    try {
      const res = await fetch(`${API_BASE}/argumentation/${compoundId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setArgumentation(data);
    } catch (e) {
      console.error("Argumentation fetch error:", e);
      setArgumentation({ error: true });
    }
  };

  // Fetch recommendations for a given profile (used for simulation)
  const fetchRecommendationsForProfile = async (profileOverride: any | null) => {
    if (!profile && !profileOverride) return;
    setLoading(true);
    setError(null);
    try {
      const bodyProfile = profileOverride || profile;
      // When fetching for a simulated profile, indicate simulate=true to backend
      const simulateParam = profileOverride ? "?simulate=true" : "";
      const response = await fetch(`${API_BASE}/recommendations${simulateParam}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({ profile: bodyProfile, top_k: 20 }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${response.status}`);
      }
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("Recommendations fetch error:", err);
      setError(`Ошибка загрузки: ${err instanceof Error ? err.message : "неизвестная ошибка"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    } else if (!profile) {
      navigate("/quiz");
    } else {
      fetchRecommendations();
    }
  }, [isAuthenticated, profile, navigate]);

  // When simulatedProfile changes, request recommendations for that profile from backend
  useEffect(() => {
    if (simulatedProfile === null) {
      // exit simulation: load real recommendations
      fetchRecommendations();
    } else {
      // load recommendations for simulated profile (do not overwrite real profile)
      fetchRecommendationsForProfile(simulatedProfile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulatedProfile]);

  const fetchRecommendations = async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({
          profile: {
            entScore: profile.entScore,
            ieltsScore: profile.ieltsScore || 0,
            profileSubjects: profile.profileSubjects || [],
            interests: profile.interests || [],
            budget: profile.budget || 0,
            preferredCity: profile.preferredCity || "Любой",
          },
          top_k: 5,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("Recommendations fetch error:", err);
      setError(`Ошибка загрузки: ${err instanceof Error ? err.message : "неизвестная ошибка"}`);
    } finally {
      setLoading(false);
    }
  };

  const scoredUniversities: ScoredUniversity[] = useMemo(() => {
    if (!profile) return [];

    // Перенос логики scoring на бэкенд: если сервер вернул рекомендации — используем их,
    // иначе не выполняем локальную эвристику (чтобы избежать расхождений).
    if (recommendations.length > 0) {
      return recommendations
        .map((rec) => ({
          university: universities.find((u) => u.id === rec.university_id)!,
          score: rec.score,
          explanation: rec.explanation,
          program_id: rec.program_id,
          entMismatch: !!(rec as any).factors && (rec as any).factors.ent && (rec as any).factors.ent.status === 'below',
        }))
        .filter((item) => item.university);
    }

    // Если рекомендаций от сервера нет — показываем пустой список и даём пользователю возможность
    // повторно запросить рекомендации. Локальная эвристика отключена в пользу серверной логики.
    return [];
  }, [profile, simulatedProfile, recommendations]);

  // Visual marker when simulation is active
  const isSimulationActive = simulatedProfile !== null;

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

        {error && (
          <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/5">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-flex h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
              <p className="mt-2 text-muted-foreground">Загружаем рекомендации...</p>
            </div>
          </div>
        )}

        <WhatIfWidget onSimulate={setSimulatedProfile} />

        {isSimulationActive && (
          <div className="mb-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-between">
            <div className="text-sm">
              <strong>Режим симуляции</strong> — вы просматриваете результаты «что если». Изменения не сохраняются в профиле.
            </div>
            <div>
              <Button size="sm" variant="outline" onClick={() => setSimulatedProfile(null)}>Выйти из симуляции</Button>
            </div>
          </div>
        )}

        {/* Общая рекомендация ИИ над списком */}
        {sortedUniversities.length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-accent/5 border border-accent/10">
            <p className="font-semibold">Общая рекомендация ИИ</p>
            <p className="text-sm text-muted-foreground mt-2">
              {isSimulationActive ? (
                <>
                  Режим симуляции активен — показаны временные результаты. Лучшее текущее предложение: <strong>{sortedUniversities[0].university.name}</strong> — <strong>{sortedUniversities[0].score}%</strong>.
                </>
              ) : (
                <>
                  Лучшее предложение для вашего профиля: <strong>{sortedUniversities[0].university.name}</strong> — <strong>{sortedUniversities[0].score}%</strong>.
                </>
              )}
            </p>
            {sortedUniversities[0].explanation && (
              <p className="text-xs text-muted-foreground mt-2">{(sortedUniversities[0].explanation as any).summary}</p>
            )}
          </div>
        )}

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
                <DropdownMenuItem onClick={() => setSortBy("match")}>По соответствию</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("rank")}>По рейтингу</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("ent")}>По мин. ЕНТ</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedUniversities.length > 0 ? (
            sortedUniversities.map((item, index) => {
              const explanation = item.explanation;
              const isStructured = explanation && typeof explanation === "object" && "summary" in explanation;

              return (
                <div key={`${item.university.id}-${item.program_id || index}`}>
                  <UniversityCard
                    university={item.university}
                    matchScore={item.score}
                    rank={index + 1}
                    programId={item.program_id}
                    onWhyClick={(compoundId) => fetchArgumentation(compoundId)}
                    entMismatch={(item as any).entMismatch}
                  />
                  {explanation && (
                    <div className="mt-2 p-4 rounded-lg bg-accent/5 border border-accent/20 text-sm">
                      {isStructured ? (
                        <div className="space-y-3">
                          <div>
                            <p className="font-semibold text-accent mb-2">Почему этот вуз?</p>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                              {(explanation as ExplanationStructure).summary}
                            </p>
                          </div>
                          {(explanation as ExplanationStructure).key_factors?.length ? (
                            <div>
                              <p className="font-semibold text-accent mb-2 text-xs">Ключевые факторы:</p>
                              <div className="space-y-1">
                                {(explanation as ExplanationStructure).key_factors!.slice(0, 4).map((factor, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground capitalize">{factor.factor}</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-accent rounded-full"
                                          style={{ width: `${Math.min(100, (factor.contribution || 0) / 40 * 100)}%` }}
                                        />
                                      </div>
                                      <span className="text-accent font-semibold w-6 text-right">{(factor.contribution || 0).toFixed(1)}</span>
                                    </div>

                                {/* Argumentation dialog */}
                                <Dialog open={argOpen} onOpenChange={(v) => { if (!v) setArgumentation(null); setArgOpen(v); }}>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Почему эта рекомендация?</DialogTitle>
                                      <DialogDescription>Краткий разбор соответствия программы вашему профилю.</DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 pt-2">
                                      {!argumentation && (
                                        <p className="text-sm text-muted-foreground">Загружаем анализ…</p>
                                      )}

                                      {argumentation && argumentation.error && (
                                        <p className="text-sm text-destructive">Не удалось загрузить анализ.</p>
                                      )}

                                      {argumentation && !argumentation.error && (
                                        <div>
                                          <div className="mb-3">
                                            <h4 className="font-semibold">{argumentation.program_name} — {argumentation.university_name}</h4>
                                            <div className="flex items-center gap-3 mt-2">
                                              <div className={argumentation.score_match >= 75 ? 'badge bg-accent-success' : argumentation.score_match >= 50 ? 'badge bg-primary' : 'badge bg-muted'}>
                                                {argumentation.score_match}% соответствие
                                              </div>
                                              <div className="badge">Интересы: {argumentation.interest_match}%</div>
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-1 gap-3">
                                            <div className="p-3 bg-muted/5 rounded-lg">
                                              <p className="text-sm font-semibold mb-2">Сильные стороны</p>
                                              <ul className="list-disc pl-5 text-sm">
                                                {argumentation.strong_points.length ? argumentation.strong_points.map((s: any, idx: number) => (
                                                  <li key={idx}>{s.title}: {s.detail}</li>
                                                )) : <li>Нет явно выраженных сильных сторон</li>}
                                              </ul>
                                            </div>

                                            <div className="p-3 bg-muted/5 rounded-lg">
                                              <p className="text-sm font-semibold mb-2">Риски и компромиссы</p>
                                              <ul className="list-disc pl-5 text-sm">
                                                {argumentation.risks.length ? argumentation.risks.map((r: any, idx: number) => (
                                                  <li key={idx}>{r.title}: {r.detail}</li>
                                                )) : <li>Риски минимальны</li>}
                                              </ul>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <DialogFooter>
                                      <div className="flex items-center justify-between w-full">
                                        <div className="text-xs text-muted-foreground">Сформировано локально (rule-based) для демо.</div>
                                        <div className="flex gap-2">
                                          <Button variant="outline" size="sm" onClick={() => { setArgOpen(false); setArgumentation(null); }}>Закрыть</Button>
                                        </div>
                                      </div>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          {(explanation as ExplanationStructure).explanation && (
                            <p className="text-muted-foreground text-xs italic border-t border-accent/20 pt-2 mt-2">
                              {(explanation as ExplanationStructure).explanation}
                            </p>
                          )}
                        </div>
                      ) : typeof explanation === "string" ? (
                        <div>
                          <p className="font-semibold text-accent mb-1">Почему этот вуз?</p>
                          <p className="text-muted-foreground text-xs">{explanation}</p>
                        </div>
                      ) : null}
                    <div className="mt-2 flex gap-2">
                      {item.program_id && (
                        <Button size="sm" onClick={() => navigate(`/roadmap?uni=${item.university.id}&program=${item.program_id}`)}>
                          Сгенерировать Roadmap
                        </Button>
                      )}
                    </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            !loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-2">Рекомендации не найдены</p>
                <Button onClick={fetchRecommendations} variant="outline">
                  Повторить
                </Button>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default Recommendations;
