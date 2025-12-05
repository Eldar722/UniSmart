import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <HowItWorksSection />
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary-dark to-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          <div className="container relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Готов найти свой ВУЗ?
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Присоединяйся к тысячам абитуриентов, которые уже нашли своё место в лучших университетах Казахстана
            </p>
            <Link to="/auth?mode=register">
              <Button variant="glass" size="xl" className="gap-2 group bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Начать сейчас
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border">
          <div className="container">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 UniSmart. Все права защищены.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">О нас</a>
                <a href="#" className="hover:text-foreground transition-colors">Контакты</a>
                <a href="#" className="hover:text-foreground transition-colors">Политика</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
