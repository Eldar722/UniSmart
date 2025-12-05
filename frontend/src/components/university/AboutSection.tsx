import { University } from "@/data/mockData";
import { Calendar, Users, Trophy, Globe } from "lucide-react";

interface AboutSectionProps {
  university: University;
}

export function AboutSection({ university }: AboutSectionProps) {
  const stats = [
    { icon: Calendar, label: "Основан", value: university.yearFounded },
    { icon: Users, label: "Студентов", value: university.studentsCount.toLocaleString() },
    { icon: Trophy, label: "Рейтинг РК", value: `#${university.nationalRank}` },
    { icon: Globe, label: "Мировой рейтинг", value: university.worldRank ? `#${university.worldRank}` : "—" },
  ];

  return (
    <section id="about" className="py-8">
      <h2 className="text-2xl font-bold mb-6">Об университете</h2>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {university.description}
          </p>
          
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-semibold mb-2">Миссия</h3>
            <p className="text-sm text-muted-foreground">{university.mission}</p>
          </div>

          <div className="glass-card rounded-xl p-4">
            <h3 className="font-semibold mb-3">Ключевые достижения</h3>
            <ul className="space-y-2">
              {university.achievements.map((achievement, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-accent">✓</span>
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-4 text-center">
              <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
