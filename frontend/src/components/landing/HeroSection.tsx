import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Brain, Sparkles } from "lucide-react";
import { useUser } from "@/context/UserContext";

export function HeroSection() {
  const { isAuthenticated } = useUser();
  
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-accent opacity-5" />
      
      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-powered рекомендации</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
            Найди свой{" "}
            <span className="gradient-text">идеальный ВУЗ</span>
            {" "}в Казахстане
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up stagger-1">
            UniSmart анализирует твои ЕНТ/IELTS баллы и интересы, 
            чтобы дать обоснованное, data-driven решение
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up stagger-2">
            <Link to="/auth?mode=register">
              <Button variant="hero" size="xl" className="gap-2 group w-full sm:w-auto">
                Начать бесплатно
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/auth">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  У меня есть аккаунт
                </Button>
              </Link>
            )}
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-6 animate-slide-up stagger-3">
            <FeatureCard
              icon={Brain}
              title="Smart Match"
              description="AI-алгоритм подбора на основе 15+ факторов"
            />
            <FeatureCard
              icon={BarChart3}
              title="Big Data"
              description="Анализ данных 35+ университетов РК"
            />
            <FeatureCard
              icon={Sparkles}
              title="What If?"
              description="Симуляция изменения параметров в реальном времени"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="glass-card rounded-2xl p-6 hover-lift">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent mb-4 mx-auto">
        <Icon className="h-6 w-6 text-primary-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
