import { Users, GraduationCap, Award, TrendingUp } from "lucide-react";

const stats = [
  { icon: GraduationCap, value: "35+", label: "Университетов" },
  { icon: Users, value: "150K+", label: "Студентов" },
  { icon: Award, value: "95%", label: "Точность" },
  { icon: TrendingUp, value: "10K+", label: "Рекомендаций" },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-primary-dark to-primary">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/10 mx-auto mb-4">
                <stat.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-primary-foreground/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
