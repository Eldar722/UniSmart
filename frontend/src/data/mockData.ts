export interface University {
  id: string;
  name: string;
  nameKz: string;
  city: string;
  description: string;
  mission: string;
  yearFounded: number;
  studentsCount: number;
  nationalRank: number;
  worldRank?: number;
  minENT: number;
  minIELTS: number;
  tuitionRange: { min: number; max: number };
  image: string;
  logo: string;
  mapEmbedLink: string;
  achievements: string[];
  partners: Partner[];
  programs: Program[];
  admissionDeadline: string;
  scholarships: Scholarship[];
}

export interface Program {
  id: string;
  name: string;
  nameKz: string;
  faculty: string;
  degree: "Бакалавриат" | "Магистратура" | "Докторантура";
  duration: number;
  minENT: number;
  minIELTS?: number;
  tuition: number;
  language: "Казахский" | "Русский" | "Английский";
  employmentRate: number;
  avgSalary: number;
}

export interface Partner {
  name: string;
  country: string;
  logo: string;
  exchangeIELTS: number;
}

export interface Scholarship {
  name: string;
  coverage: string;
  requirements: string;
}

export interface UserProfile {
  entScore: number;
  ieltsScore: number;
  profileSubjects: string[];
  interests: string[];
  budget: number;
  preferredCity: string;
}

export const profileSubjects = [
  "Математика",
  "Физика",
  "Химия",
  "Биология",
  "История",
  "География",
  "Иностранный язык",
  "Информатика",
  "Литература",
];

export const interests = [
  { id: "tech", name: "Технологии и IT", icon: "💻" },
  { id: "medicine", name: "Медицина и здоровье", icon: "🏥" },
  { id: "business", name: "Бизнес и экономика", icon: "📈" },
  { id: "engineering", name: "Инженерия", icon: "⚙️" },
  { id: "creative", name: "Креатив и дизайн", icon: "🎨" },
  { id: "law", name: "Право и юриспруденция", icon: "⚖️" },
  { id: "education", name: "Образование", icon: "📚" },
  { id: "science", name: "Естественные науки", icon: "🔬" },
];

export const cities = [
  "Алматы",
  "Астана",
  "Шымкент",
  "Караганда",
  "Актобе",
  "Павлодар",
  "Семей",
  "Атырау",
  "Любой",
];

export const universities: University[] = [
  {
    id: "nu",
    name: "Назарбаев Университет",
    nameKz: "Назарбаев Университеті",
    city: "Астана",
    description: "Ведущий исследовательский университет Казахстана с международными стандартами образования.",
    mission: "Стать исследовательским университетом мирового класса, способствующим развитию Казахстана.",
    yearFounded: 2010,
    studentsCount: 6500,
    nationalRank: 1,
    worldRank: 207,
    minENT: 120,
    minIELTS: 6.5,
    tuitionRange: { min: 0, max: 0 },
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800",
    logo: "https://nu.edu.kz/images/logo.png",
    mapEmbedLink: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2503.8!2d71.4!3d51.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDA2JzAwLjAiTiA3McKwMjQnMDAuMCJF!5e0!3m2!1sen!2skz!4v1",
    achievements: [
      "Топ-200 университетов мира (QS)",
      "100% грантовое обучение",
      "Партнерство с MIT, Cambridge, Duke",
    ],
    partners: [
      { name: "MIT", country: "США", logo: "", exchangeIELTS: 7.0 },
      { name: "Cambridge", country: "Великобритания", logo: "", exchangeIELTS: 7.0 },
      { name: "Duke University", country: "США", logo: "", exchangeIELTS: 6.5 },
    ],
    programs: [
      {
        id: "nu-cs",
        name: "Computer Science",
        nameKz: "Компьютерлік ғылымдар",
        faculty: "School of Engineering",
        degree: "Бакалавриат",
        duration: 4,
        minENT: 125,
        minIELTS: 6.5,
        tuition: 0,
        language: "Английский",
        employmentRate: 98,
        avgSalary: 800000,
      },
      {
        id: "nu-medicine",
        name: "Medicine",
        nameKz: "Медицина",
        faculty: "School of Medicine",
        degree: "Бакалавриат",
        duration: 5,
        minENT: 130,
        minIELTS: 7.0,
        tuition: 0,
        language: "Английский",
        employmentRate: 100,
        avgSalary: 600000,
      },
    ],
    admissionDeadline: "15 марта 2025",
    scholarships: [
      { name: "Полный грант", coverage: "100% обучения + стипендия", requirements: "Все студенты" },
    ],
  },
  {
    id: "kaznu",
    name: "Казахский национальный университет им. аль-Фараби",
    nameKz: "Әл-Фараби атындағы Қазақ ұлттық университеті",
    city: "Алматы",
    description: "Старейший и крупнейший университет Казахстана с богатой историей и традициями.",
    mission: "Подготовка высококвалифицированных специалистов и развитие фундаментальной науки.",
    yearFounded: 1934,
    studentsCount: 25000,
    nationalRank: 2,
    worldRank: 175,
    minENT: 75,
    minIELTS: 5.5,
    tuitionRange: { min: 800000, max: 1500000 },
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800",
    logo: "",
    mapEmbedLink: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2906.5!2d76.9!3d43.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z0JrQsNC30J3Qow!5e0!3m2!1sru!2skz!4v1",
    achievements: [
      "Топ-200 QS World Rankings",
      "120+ партнерских университетов",
      "Крупнейшая научная библиотека ЦА",
    ],
    partners: [
      { name: "MSU", country: "Россия", logo: "", exchangeIELTS: 5.5 },
      { name: "Peking University", country: "Китай", logo: "", exchangeIELTS: 6.0 },
    ],
    programs: [
      {
        id: "kaznu-it",
        name: "Информационные системы",
        nameKz: "Ақпараттық жүйелер",
        faculty: "Факультет информационных технологий",
        degree: "Бакалавриат",
        duration: 4,
        minENT: 80,
        tuition: 900000,
        language: "Русский",
        employmentRate: 85,
        avgSalary: 450000,
      },
      {
        id: "kaznu-economics",
        name: "Экономика",
        nameKz: "Экономика",
        faculty: "Экономический факультет",
        degree: "Бакалавриат",
        duration: 4,
        minENT: 75,
        tuition: 850000,
        language: "Русский",
        employmentRate: 82,
        avgSalary: 400000,
      },
    ],
    admissionDeadline: "25 июля 2025",
    scholarships: [
      { name: "Государственный грант", coverage: "100% обучения", requirements: "ЕНТ от 100 баллов" },
      { name: "Ректорский грант", coverage: "50% обучения", requirements: "ЕНТ от 90 баллов" },
    ],
  },
  {
    id: "kbtu",
    name: "Казахстанско-Британский технический университет",
    nameKz: "Қазақстан-Британ техникалық университеті",
    city: "Алматы",
    description: "Технический университет с британскими стандартами образования в сфере IT и инженерии.",
    mission: "Подготовка инженеров и IT-специалистов мирового уровня.",
    yearFounded: 2001,
    studentsCount: 3500,
    nationalRank: 5,
    worldRank: 450,
    minENT: 85,
    minIELTS: 5.5,
    tuitionRange: { min: 1800000, max: 2500000 },
    image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800",
    logo: "",
    mapEmbedLink: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2906.5!2d76.9!3d43.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zS0JUVQ!5e0!3m2!1sru!2skz!4v1",
    achievements: [
      "Лучший IT-университет Казахстана",
      "Партнер Google, Microsoft, IBM",
      "95% трудоустройство выпускников",
    ],
    partners: [
      { name: "University of London", country: "Великобритания", logo: "", exchangeIELTS: 6.5 },
      { name: "TU Delft", country: "Нидерланды", logo: "", exchangeIELTS: 6.0 },
    ],
    programs: [
      {
        id: "kbtu-se",
        name: "Software Engineering",
        nameKz: "Бағдарламалық жасақтама",
        faculty: "Faculty of Information Technologies",
        degree: "Бакалавриат",
        duration: 4,
        minENT: 90,
        minIELTS: 5.5,
        tuition: 2200000,
        language: "Английский",
        employmentRate: 95,
        avgSalary: 700000,
      },
    ],
    admissionDeadline: "20 июля 2025",
    scholarships: [
      { name: "Merit Scholarship", coverage: "До 50% обучения", requirements: "ЕНТ от 110 баллов" },
    ],
  },
  {
    id: "kimep",
    name: "KIMEP University",
    nameKz: "КИМЭП Университеті",
    city: "Алматы",
    description: "Первый независимый бизнес-университет в СНГ с американской системой образования.",
    mission: "Подготовка лидеров для бизнеса и государственного управления.",
    yearFounded: 1992,
    studentsCount: 3000,
    nationalRank: 4,
    minENT: 80,
    minIELTS: 6.0,
    tuitionRange: { min: 2500000, max: 3500000 },
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
    logo: "",
    mapEmbedLink: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2906.5!2d76.9!3d43.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zS0lNRVA!5e0!3m2!1sru!2skz!4v1",
    achievements: [
      "AACSB аккредитация",
      "Лучшая бизнес-школа ЦА",
      "Международный преподавательский состав",
    ],
    partners: [
      { name: "Thunderbird", country: "США", logo: "", exchangeIELTS: 6.5 },
      { name: "ESSEC", country: "Франция", logo: "", exchangeIELTS: 6.5 },
    ],
    programs: [
      {
        id: "kimep-ba",
        name: "Business Administration",
        nameKz: "Бизнес әкімшілігі",
        faculty: "Bang College of Business",
        degree: "Бакалавриат",
        duration: 4,
        minENT: 85,
        minIELTS: 6.0,
        tuition: 3200000,
        language: "Английский",
        employmentRate: 92,
        avgSalary: 550000,
      },
    ],
    admissionDeadline: "15 августа 2025",
    scholarships: [
      { name: "Academic Excellence", coverage: "До 100%", requirements: "IELTS 7.0+, ЕНТ 120+" },
    ],
  },
  {
    id: "sdu",
    name: "Suleyman Demirel University",
    nameKz: "Сүлейман Демирел атындағы университет",
    city: "Алматы",
    description: "Международный университет с турецкими традициями качественного образования.",
    mission: "Воспитание конкурентоспособных специалистов с международным мышлением.",
    yearFounded: 1996,
    studentsCount: 7000,
    nationalRank: 8,
    minENT: 65,
    minIELTS: 5.0,
    tuitionRange: { min: 1200000, max: 2000000 },
    image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800",
    logo: "",
    mapEmbedLink: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2906.5!2d76.9!3d43.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zU0RV!5e0!3m2!1sru!2skz!4v1",
    achievements: [
      "Современный кампус",
      "Программы двойного диплома",
      "Сильная IT-школа",
    ],
    partners: [
      { name: "Istanbul University", country: "Турция", logo: "", exchangeIELTS: 5.5 },
    ],
    programs: [
      {
        id: "sdu-cs",
        name: "Computer Science",
        nameKz: "Компьютерлік ғылымдар",
        faculty: "Engineering Faculty",
        degree: "Бакалавриат",
        duration: 4,
        minENT: 70,
        minIELTS: 5.0,
        tuition: 1500000,
        language: "Английский",
        employmentRate: 88,
        avgSalary: 500000,
      },
    ],
    admissionDeadline: "30 июля 2025",
    scholarships: [
      { name: "Founders Grant", coverage: "25-50%", requirements: "ЕНТ от 90 баллов" },
    ],
  },
];

// Calculate match score based on user profile
export function calculateMatchScore(university: University, profile: UserProfile): number {
  let score = 0;
  let factors = 0;

  // ENT Score factor (40% weight)
  if (profile.entScore >= university.minENT) {
    const entBonus = Math.min(30, (profile.entScore - university.minENT) * 1.5);
    score += 40 + entBonus;
  } else {
    const entPenalty = (university.minENT - profile.entScore) * 2;
    score += Math.max(0, 40 - entPenalty);
  }
  factors += 70;

  // IELTS Score factor (20% weight)
  if (profile.ieltsScore >= university.minIELTS) {
    score += 20;
  } else {
    const ieltsPenalty = (university.minIELTS - profile.ieltsScore) * 10;
    score += Math.max(0, 20 - ieltsPenalty);
  }
  factors += 20;

  // Budget factor (20% weight)
  if (university.tuitionRange.max === 0 || profile.budget >= university.tuitionRange.min) {
    score += 20;
  } else {
    score += Math.max(0, 10);
  }
  factors += 20;

  // City preference (10% weight)
  if (profile.preferredCity === "Любой" || profile.preferredCity === university.city) {
    score += 10;
  }
  factors += 10;

  // Random "AI" factor for variety (0-5%)
  score += Math.random() * 5;

  return Math.min(100, Math.round((score / factors) * 100));
}

// Historical ENT score data (mock)
export const entScoreHistory = [
  { year: "2020", score: 85 },
  { year: "2021", score: 88 },
  { year: "2022", score: 92 },
  { year: "2023", score: 95 },
  { year: "2024", score: 98 },
];
