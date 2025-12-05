import { University } from "@/data/mockData";
import { MapPin, Compass } from "lucide-react";

interface VirtualTourSectionProps {
  university: University;
}

export function VirtualTourSection({ university }: VirtualTourSectionProps) {
  return (
    <section id="tour" className="py-8 border-t border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
          <Compass className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">3D Тур по кампусу</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {university.city}
          </p>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="aspect-video w-full">
          <iframe
            src={university.mapEmbedLink}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Виртуальный тур по ${university.name}`}
            className="w-full h-full min-h-[300px] md:min-h-[450px]"
          />
        </div>
        <div className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Используйте мышь или жесты для навигации по кампусу. Нажмите на стрелки для перемещения.
          </p>
        </div>
      </div>
    </section>
  );
}
