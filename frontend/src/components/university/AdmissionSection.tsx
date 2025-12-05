import { University } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Calendar, FileCheck, Award, ExternalLink, CheckCircle2 } from "lucide-react";

interface AdmissionSectionProps {
  university: University;
}

export function AdmissionSection({ university }: AdmissionSectionProps) {
  const requirements = [
    { icon: FileCheck, label: "Аттестат о среднем образовании", done: true },
    { icon: FileCheck, label: `Сертификат ЕНТ (мин. ${university.minENT} баллов)`, done: false },
    { icon: FileCheck, label: `Сертификат IELTS (мин. ${university.minIELTS})`, done: false },
    { icon: FileCheck, label: "Медицинская справка 086-У", done: false },
    { icon: FileCheck, label: "Фотографии 3x4", done: false },
  ];

  return (
    <section id="admission" className="py-8 border-t border-border">
      <h2 className="text-2xl font-bold mb-6">Приём и поступление</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Requirements checklist */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Необходимые документы
          </h3>
          <ul className="space-y-3">
            {requirements.map((req, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  req.done ? "bg-accent-success/10 text-accent-success" : "bg-muted text-muted-foreground"
                }`}>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-sm">{req.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Timeline & Scholarships */}
        <div className="space-y-4">
          {/* Deadline */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Сроки подачи
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Дедлайн:</span>
              <span className="text-lg font-semibold text-destructive">{university.admissionDeadline}</span>
            </div>
          </div>

          {/* Scholarships */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              Стипендии и гранты
            </h3>
            <div className="space-y-3">
              {university.scholarships.map((scholarship, index) => (
                <div key={index} className="p-3 bg-accent/5 rounded-lg border border-accent/20">
                  <p className="font-medium text-sm">{scholarship.name}</p>
                  <p className="text-xs text-accent">{scholarship.coverage}</p>
                  <p className="text-xs text-muted-foreground mt-1">{scholarship.requirements}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button variant="hero" size="lg" className="gap-2">
          Начать подачу документов
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
