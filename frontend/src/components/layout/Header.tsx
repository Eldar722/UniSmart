import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { GraduationCap, Menu, X, BarChart3, Scale, LogOut, User } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { isAuthenticated, user, logout, comparisonList } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: "/recommendations", label: "Рекомендации", icon: BarChart3 },
    { href: "/compare", label: `Сравнение${comparisonList.length > 0 ? ` (${comparisonList.length})` : ""}`, icon: Scale },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold gradient-text">UniSmart</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {isAuthenticated && navLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Button
                variant={isActive(link.href) ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {user?.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout} className="gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">Войти</Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button variant="hero" size="sm">Начать</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="container py-4 space-y-2">
            {isAuthenticated && navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={isActive(link.href) ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
            <div className="pt-2 border-t border-border">
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-destructive"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Выйти
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">Войти</Button>
                  </Link>
                  <Link to="/auth?mode=register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="hero" className="w-full">Начать</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
