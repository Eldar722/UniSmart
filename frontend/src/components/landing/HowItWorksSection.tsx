import { ClipboardList, Cpu, Target, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Введите данные",
    description: "Укажите баллы ЕНТ, IELTS и выберите интересующие направления",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI-анализ",
    description: "Наш алгоритм сопоставляет ваш профиль с требованиями университетов",
  },
  {
    icon: Target,
    step: "03",
    title: "Персональные рекомендации",
    description: "Получите ТОП-3 подходящих ВУЗа с индексом соответствия",
  },
  {
    icon: CheckCircle2,
    step: "04",
    title: "Сравните и решите",
    description: "Используйте инструменты сравнения для финального выбора",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Как это <span className="gradient-text">работает</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Четыре простых шага к осознанному выбору университета
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}

              <div className="relative z-10 glass-card rounded-2xl p-6 hover-lift h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                    <step.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <span className="text-4xl font-bold text-primary/20">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
