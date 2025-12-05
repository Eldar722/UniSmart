import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useUser } from "@/context/UserContext";
import { universities, Program } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, X, ArrowRight, Trophy, DollarSign, Briefcase, Clock } from "lucide-react";

const Compare = () => {
  const { comparisonList, removeFromComparison, clearComparison, profile } = useUser();

  const programsToCompare = useMemo(() => {
    return comparisonList.map((fullId) => {
      const parts = fullId.split("-");
      const uniId = parts[0];
      const programId = parts.slice(1).join("-");
      const university = universities.find((u) => u.id === uniId);
      const program = university?.programs.find((p) => p.id === programId);
      return { university, program, fullId };
    }).filter((item) => item.university && item.program) as {
      university: typeof universities[0];
      program: Program;
      fullId: string;
    }[];
  }, [comparisonList]);

  const getBestValue = (key: keyof Program, higher: boolean = true) => {
    if (programsToCompare.length < 2) return null;
    
    const values = programsToCompare.map((p) => p.program[key] as number);
    return higher ? Math.max(...values) : Math.min(...values);
  };

  const compareRows: { key: keyof Program; label: string; icon: any; format: (v: any) => string; higherIsBetter: boolean }[] = [
    { key: "minENT", label: "Мин. ЕНТ", icon: Trophy, format: (v) => `${v} баллов`, higherIsBetter: false },
    { key: "tuition", label: "Стоимость", icon: DollarSign, format: (v) => v === 0 ? "Грант" : `${(v / 1000000).toFixed(1)}М тг`, higherIsBetter: false },
    { key: "duration", label: "Длительность", icon: Clock, format: (v) => `${v} года`, higherIsBetter: false },
    { key: "employmentRate", label: "Трудоустройство", icon: Briefcase, format: (v) => `${v}%`, higherIsBetter: true },
    { key: "avgSalary", label: "Средняя ЗП", icon: DollarSign, format: (v) => `${(v / 1000).toFixed(0)}К тг`, higherIsBetter: true },
  ];

  if (comparisonList.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted mx-auto mb-6">
            <Scale className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Нет программ для сравнения</h1>
          <p className="text-muted-foreground mb-6">
            Добавьте программы из страниц университетов для сравнения
          </p>
          <Link to="/recommendations">
            <Button variant="hero" className="gap-2">
              К рекомендациям
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Сравнение программ</h1>
            <p className="text-muted-foreground">
              {programsToCompare.length} программ для сравнения
            </p>
          </div>
          {programsToCompare.length > 0 && (
            <Button variant="outline" onClick={clearComparison}>
              Очистить все
            </Button>
          )}
        </div>

        {/* Comparison table - horizontal scroll on mobile */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground w-48">Параметр</th>
                  {programsToCompare.map(({ university, program, fullId }) => (
                    <th key={fullId} className="p-4 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{program.name}</p>
                          <p className="text-sm text-muted-foreground">{university.name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => removeFromComparison(fullId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Basic info */}
                <tr className="border-b border-border/50">
                  <td className="p-4 text-muted-foreground">Степень</td>
                  {programsToCompare.map(({ program, fullId }) => (
                    <td key={fullId} className="p-4">
                      <Badge variant="secondary">{program.degree}</Badge>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-4 text-muted-foreground">Язык</td>
                  {programsToCompare.map(({ program, fullId }) => (
                    <td key={fullId} className="p-4">{program.language}</td>
                  ))}
                </tr>

                {/* Comparison rows */}
                {compareRows.map((row) => {
                  const bestValue = getBestValue(row.key, row.higherIsBetter);
                  
                  return (
                    <tr key={row.key} className="border-b border-border/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <row.icon className="h-4 w-4" />
                          {row.label}
                        </div>
                      </td>
                      {programsToCompare.map(({ program, fullId }) => {
                        const value = program[row.key] as number;
                        const isBest = bestValue !== null && value === bestValue;
                        
                        return (
                          <td key={fullId} className="p-4">
                            <span className={isBest ? "text-accent-success font-semibold" : ""}>
                              {row.format(value)}
                              {isBest && " ✓"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* User's chance */}
                {profile && (
                  <tr className="bg-muted/30">
                    <td className="p-4 font-medium">Ваш шанс</td>
                    {programsToCompare.map(({ program, fullId }) => {
                      const entOk = profile.entScore >= program.minENT;
                      const ieltsOk = !program.minIELTS || profile.ieltsScore >= program.minIELTS;
                      const chance = entOk && ieltsOk ? "Высокий" : entOk || ieltsOk ? "Средний" : "Низкий";
                      const color = entOk && ieltsOk ? "text-accent-success" : entOk || ieltsOk ? "text-primary" : "text-destructive";
                      
                      return (
                        <td key={fullId} className="p-4">
                          <span className={`font-semibold ${color}`}>{chance}</span>
                        </td>
                      );
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile hint */}
        <p className="text-sm text-muted-foreground text-center mt-4 sm:hidden">
          ← Прокрутите таблицу для просмотра всех программ →
        </p>
      </main>
    </div>
  );
};

export default Compare;
