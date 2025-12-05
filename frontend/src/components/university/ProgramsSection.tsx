import { useState } from "react";
import { University, Program } from "@/data/mockData";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Scale, Search, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProgramsSectionProps {
  university: University;
}

export function ProgramsSection({ university }: ProgramsSectionProps) {
  const { profile, comparisonList, addToComparison, removeFromComparison } = useUser();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const filteredPrograms = university.programs.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.faculty.toLowerCase().includes(search.toLowerCase())
  );

  const calculateChance = (program: Program): { label: string; class: string } => {
    if (!profile) return { label: "—", class: "text-muted-foreground" };
    
    const entOk = profile.entScore >= program.minENT;
    const ieltsOk = !program.minIELTS || profile.ieltsScore >= program.minIELTS;

    if (entOk && ieltsOk) return { label: "Высокий", class: "text-accent-success" };
    if (entOk || ieltsOk) return { label: "Средний", class: "text-primary" };
    return { label: "Низкий", class: "text-destructive" };
  };

  const handleCompare = (programId: string) => {
    const fullId = `${university.id}-${programId}`;
    if (comparisonList.includes(fullId)) {
      removeFromComparison(fullId);
      toast({ title: "Удалено из сравнения" });
    } else {
      if (comparisonList.length >= 3) {
        toast({ title: "Максимум 3 программы", description: "Удалите одну для добавления новой", variant: "destructive" });
        return;
      }
      addToComparison(fullId);
      toast({ title: "Добавлено к сравнению", description: "Перейдите в раздел сравнения для анализа" });
    }
  };

  return (
    <section id="programs" className="py-8 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Академические программы</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск программы..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Программа</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Степень</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Мин. ЕНТ</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Стоимость</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  Ваш шанс
                  <TrendingUp className="h-3 w-3" />
                </div>
              </th>
              <th className="text-right py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.map((program) => {
              const chance = calculateChance(program);
              const fullId = `${university.id}-${program.id}`;
              const isInComparison = comparisonList.includes(fullId);

              return (
                <tr key={program.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium">{program.name}</p>
                      <p className="text-sm text-muted-foreground">{program.faculty}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="secondary">{program.degree}</Badge>
                  </td>
                  <td className="py-4 px-4 font-medium">{program.minENT}</td>
                  <td className="py-4 px-4">
                    {program.tuition === 0 ? (
                      <span className="text-accent-success font-medium">Грант</span>
                    ) : (
                      `${(program.tuition / 1000000).toFixed(1)}М тг`
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`font-medium ${chance.class}`}>{chance.label}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Button
                      variant={isInComparison ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCompare(program.id)}
                      className="gap-1"
                    >
                      <Scale className="h-3 w-3" />
                      {isInComparison ? "В сравнении" : "Сравнить"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredPrograms.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Программы не найдены</p>
      )}
    </section>
  );
}
