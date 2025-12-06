import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { University } from "@/data/mockData";
import { MapPin, Users, Trophy, ArrowRight, Info, Heart } from "lucide-react";
import { useUser } from "@/context/UserContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UniversityCardProps {
  university: University;
  matchScore: number;
  rank: number;
  programId?: string;
  onWhyClick?: (compoundId: string) => void;
  entMismatch?: boolean;
  unavailableReason?: string | null;
}

export function UniversityCard({ university, matchScore, rank, programId, onWhyClick, entMismatch = false }: UniversityCardProps) {
  const { favorites, toggleFavorite } = useUser();
  const isFav = favorites.includes(university.id);
  const getMatchClass = () => {
    if (matchScore >= 80) return "match-high";
    if (matchScore >= 60) return "match-medium";
    return "match-low";
  };

  const getMatchLabel = () => {
    if (matchScore >= 80) return "Отличный выбор";
    if (matchScore >= 60) return "Хороший вариант";
    return "Рассмотрите";
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden hover-lift animate-slide-up" style={{ animationDelay: `${rank * 0.1}s` }}>
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={university.image}
          alt={university.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
        
        {/* Rank badge */}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            #{rank} рекомендация
          </Badge>
        </div>

        {/* Match score */}
        <div className="absolute top-4 right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`match-indicator ${getMatchClass()} cursor-help`}>
                {matchScore}%
                <Info className="h-3 w-3 ml-1" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{getMatchLabel()}</p>
              <p className="text-xs text-muted-foreground">Индекс соответствия вашему профилю</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-primary-foreground line-clamp-2">
            {university.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {university.city}
            </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {university.studentsCount.toLocaleString()} студентов
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            #{university.nationalRank} в РК
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {university.description}
        </p>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl" style={{ background: entMismatch ? 'rgba(255,230,230,0.6)' : undefined, border: entMismatch ? '1px solid rgba(220,38,38,0.15)' : undefined }}>
          <div>
            <p className="text-xs text-muted-foreground">Мин. ЕНТ</p>
            <p className={`font-semibold ${entMismatch ? 'text-destructive' : 'text-primary'}`}>{university.minENT}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Мин. IELTS</p>
            <p className="font-semibold text-primary">{university.minIELTS}</p>
          </div>
        </div>

        {entMismatch && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-100 text-sm text-red-800">
            <strong>Недоступно по ЕНТ</strong>
            <div className="text-xs text-red-700">Ваш текущий ЕНТ ниже минимального требования — вероятность поступления снижена.</div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link to={`/university/${university.id}`} className="flex-1">
            <Button variant="hero" className="w-full gap-2">
              Подробнее
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          {onWhyClick ? (
            <Button
              variant="outline"
              className="px-3"
              onClick={() => {
                const pid = programId || university.programs?.[0]?.id;
                if (!pid) return;
                onWhyClick(`${university.id}-${pid}`);
              }}
            >
              Почему?
            </Button>
          ) : (
            <Link to={`/university/${university.id}#why`}>
              <Button variant="outline" className="px-3">
                Почему?
              </Button>
            </Link>
          )}
          <Button
            variant={isFav ? "default" : "outline"}
            className="px-3"
            onClick={() => toggleFavorite(university.id)}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
