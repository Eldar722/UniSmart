import { University } from "@/data/mockData";
import { Globe, Award } from "lucide-react";

interface PartnersSectionProps {
  university: University;
}

export function PartnersSection({ university }: PartnersSectionProps) {
  return (
    <section id="partners" className="py-8 border-t border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
          <Globe className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Международное сотрудничество</h2>
          <p className="text-sm text-muted-foreground">
            Программы обмена и вузы-партнеры
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {university.partners.map((partner, index) => (
          <div key={index} className="glass-card rounded-xl p-5 hover-lift">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted shrink-0">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{partner.name}</h3>
                <p className="text-sm text-muted-foreground">{partner.country}</p>
                <div className="mt-2 inline-flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                  IELTS {partner.exchangeIELTS}+
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {university.partners.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Информация о партнерах скоро появится
        </p>
      )}
    </section>
  );
}
