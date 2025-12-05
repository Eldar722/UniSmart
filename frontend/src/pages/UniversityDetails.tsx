import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { AboutSection } from "@/components/university/AboutSection";
import { ProgramsSection } from "@/components/university/ProgramsSection";
import { AdmissionSection } from "@/components/university/AdmissionSection";
import { VirtualTourSection } from "@/components/university/VirtualTourSection";
import { PartnersSection } from "@/components/university/PartnersSection";
import { ScoreChart } from "@/components/university/ScoreChart";
import { universities, calculateMatchScore } from "@/data/mockData";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Trophy, ExternalLink, Heart, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UniversityDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { profile, comparisonList, addToComparison, removeFromComparison, favorites, toggleFavorite, addToFavorites, removeFromFavorites } = useUser();
  const { toast } = useToast();
  
  const university = universities.find((u) => u.id === id);

  if (!university) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Университет не найден</h1>
          <Link to="/recommendations">
            <Button variant="outline">Вернуться к рекомендациям</Button>
          </Link>
        </div>
      </div>
    );
  }

  const matchScore = profile ? calculateMatchScore(university, profile) : null;

  const navItems = [
    { id: "about", label: "О ВУЗе" },
    { id: "programs", label: "Программы" },
    { id: "admission", label: "Поступление" },
    { id: "tour", label: "3D Тур" },
    { id: "partners", label: "Партнёры" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src={university.image}
          alt={university.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container">
            <Link to="/recommendations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Назад к рекомендациям
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold mb-2">{university.name}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {university.city}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Trophy className="h-3 w-3" />
                    #{university.nationalRank} в РК
                  </Badge>
                  {matchScore && (
                    <Badge className={`${matchScore >= 80 ? "bg-accent-success" : matchScore >= 60 ? "bg-primary" : "bg-muted"}`}>
                      {matchScore}% соответствие
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={favorites.includes(university.id) ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    toggleFavorite(university.id);
                    toast({ title: favorites.includes(university.id) ? "Удалено из избранного" : "Добавлено в избранное" });
                  }}
                >
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">{favorites.includes(university.id) ? "В избранном" : "В избранное"}</span>
                </Button>
                <Button variant="hero" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Сайт ВУЗа
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky nav */}
      <nav className="sticky top-16 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container">
          <div className="flex gap-1 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AboutSection university={university} />
            <ProgramsSection university={university} />
            <AdmissionSection university={university} />
            <VirtualTourSection university={university} />
            <PartnersSection university={university} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-36">
              {/* Match explanation */}
              {matchScore && profile && (
                <div id="why" className="glass-card rounded-xl p-5 mb-6">
                  <h3 className="font-semibold mb-3">Почему этот ВУЗ?</h3>
                  <ul className="space-y-2 text-sm">
                    {profile.entScore >= university.minENT ? (
                      <li className="flex items-start gap-2 text-accent-success">
                        <span>✓</span>
                        Ваш ЕНТ ({profile.entScore}) выше минимального ({university.minENT})
                      </li>
                    ) : (
                      <li className="flex items-start gap-2 text-destructive">
                        <span>✗</span>
                        Ваш ЕНТ ({profile.entScore}) ниже минимального ({university.minENT})
                      </li>
                    )}
                    {profile.ieltsScore >= university.minIELTS ? (
                      <li className="flex items-start gap-2 text-accent-success">
                        <span>✓</span>
                        Ваш IELTS ({profile.ieltsScore}) соответствует требованиям
                      </li>
                    ) : profile.ieltsScore > 0 ? (
                      <li className="flex items-start gap-2 text-destructive">
                        <span>✗</span>
                        Рекомендуется повысить IELTS до {university.minIELTS}
                      </li>
                    ) : null}
                    {(profile.preferredCity === "Любой" || profile.preferredCity === university.city) && (
                      <li className="flex items-start gap-2 text-accent-success">
                        <span>✓</span>
                        Расположен в предпочтительном городе
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Score chart */}
              <ScoreChart universityName={university.name} />

              {/* Quick actions */}
              <div className="glass-card rounded-xl p-5 mt-6">
                <h3 className="font-semibold mb-3">Быстрые действия</h3>
                <div className="space-y-2">
                  <Button
                    variant={comparisonList.includes(`${university.id}-${university.programs[0]?.id}`) ? "default" : "outline"}
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      const firstProgramId = university.programs[0]?.id;
                      if (!firstProgramId) return;
                      const fullId = `${university.id}-${firstProgramId}`;
                      if (comparisonList.includes(fullId)) {
                        removeFromComparison(fullId);
                        toast({ title: "Удалено из сравнения" });
                      } else {
                        if (comparisonList.length >= 3) {
                          toast({ title: "Максимум 3 программы", description: "Удалите одну для добавления новой", variant: "destructive" });
                          return;
                        }
                        addToComparison(fullId);
                        toast({ title: "Добавлено к сравнению" });
                      }
                    }}
                  >
                    <Scale className="h-4 w-4" />
                    Добавить к сравнению
                  </Button>
                  <Button
                    variant={favorites.includes(university.id) ? "default" : "outline"}
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      toggleFavorite(university.id);
                      toast({ title: favorites.includes(university.id) ? "Удалено из избранного" : "Добавлено в избранное" });
                    }}
                  >
                    <Heart className="h-4 w-4" />
                    {favorites.includes(university.id) ? "В избранном" : "Добавить в избранное"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UniversityDetails;
