import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/UserContext";
import { GraduationCap, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа").max(50, "Максимум 50 символов"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useUser();
  const { toast } = useToast();
  
  const [isRegister, setIsRegister] = useState(searchParams.get("mode") === "register");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/quiz");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setIsRegister(searchParams.get("mode") === "register");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const schema = isRegister ? registerSchema : loginSchema;
      const data = isRegister ? formData : { email: formData.email, password: formData.password };

      schema.parse(data);

      let ok = false;
      if (isRegister) {
        ok = await register(formData.name, formData.email, formData.password);
      } else {
        ok = await login(formData.email, formData.password);
      }

      if (ok) {
        toast({ title: isRegister ? "Добро пожаловать!" : "С возвращением!" });
        navigate("/quiz");
      } else {
        toast({ title: "Ошибка авторизации", description: "Проверьте данные и попробуйте снова." });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold gradient-text">UniSmart</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {isRegister ? "Создать аккаунт" : "Войти в аккаунт"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isRegister
              ? "Начни путь к идеальному университету"
              : "С возвращением! Продолжай поиск"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <Label htmlFor="name">Имя</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Ваше имя"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                  />
                </div>
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                />
              </div>
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="password">Пароль</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10"
                />
              </div>
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full gap-2" disabled={isLoading}>
              {isLoading ? "Загрузка..." : isRegister ? "Создать аккаунт" : "Войти"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isRegister ? "Уже есть аккаунт?" : "Нет аккаунта?"}{" "}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-primary font-medium hover:underline"
            >
              {isRegister ? "Войти" : "Создать"}
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-accent p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative z-10 text-center text-primary-foreground max-w-md">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/10 mx-auto mb-8 animate-float">
            <GraduationCap className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Data-driven решения для вашего будущего
          </h2>
          <p className="text-primary-foreground/80">
            UniSmart анализирует ваши баллы и интересы, чтобы найти идеальный университет из 35+ ВУЗов Казахстана
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
