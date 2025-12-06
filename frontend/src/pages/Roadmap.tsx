import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { universities } from "@/data/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const RoadmapPage = () => {
  const { token, user } = useUser();
  const navigate = useNavigate();
  const query = useQuery();
  const uni = query.get("uni");
  const program = query.get("program");

  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedUni, setSelectedUni] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");

  const selectedUniversity = universities.find(u => u.id === selectedUni);
  const programs = selectedUniversity?.programs || [];

  useEffect(() => {
    if (uni && program && token && user?.id) {
      // Auto-generate if params are present
      createRoadmap(uni, program);
    } else {
      fetchRoadmap();
    }
  }, [token, user?.id]);

  const fetchRoadmap = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/roadmap`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data.roadmap || []);
      } else {
        setRoadmap([]);
      }
    } catch (e) {
      setError("Не удалось загрузить roadmap");
    } finally {
      setLoading(false);
    }
  };

  const createRoadmap = async (uniId?: string, programId?: string) => {
    const actualUni = uniId || uni;
    const actualProgram = programId || program;
    if (!token || !user || !user.id || !actualUni || !actualProgram) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        user_id: user.id,
        university_id: actualUni,
        program_id: actualProgram,
        start_date: null,
        deadline: null,
        preferences: {}
      };

      const res = await fetch(`${API_BASE}/roadmap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setRoadmap(data.roadmap || []);
    } catch (e: any) {
      setError(e.message || "Ошибка генерации roadmap");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Ваш персональный Roadmap</h1>
          <p className="text-sm text-muted-foreground">План задач и дедлайнов для поступления</p>
        </div>

        {/* Add Program Section */}
        <div className="mb-6 p-4 border rounded-lg bg-accent/5">
          <h3 className="font-semibold mb-4">Добавить программу в Roadmap</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Select value={selectedUni} onValueChange={(val) => {
                setSelectedUni(val);
                setSelectedProgram("");
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите университет" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Select value={selectedProgram} onValueChange={setSelectedProgram} disabled={!selectedUni}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedUni ? "Выберите программу" : "Сначала выберите университет"} />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={() => {
                if (selectedUni && selectedProgram) {
                  createRoadmap(selectedUni, selectedProgram);
                }
              }}
              disabled={!selectedUni || !selectedProgram || loading}
            >
              {loading ? "Генерируем..." : "Добавить в Roadmap"}
            </Button>
          </div>
        </div>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 rounded-md mb-4">{error}</div>}

        <div className="space-y-4">
          {loading && <div className="flex justify-center py-8"><p className="text-muted-foreground">Генерируем roadmap...</p></div>}
          {!loading && roadmap.length === 0 && <p className="text-muted-foreground">Roadmap пуст. Сгенерируйте план для выбранной программы.</p>}
          {roadmap.map((item) => (
            <div key={item.id} className="p-4 border rounded-md bg-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  <div>{item.due_date ? new Date(item.due_date).toLocaleDateString() : "—"}</div>
                  <div>Приоритет: {item.priority}</div>
                </div>
              </div>

              {item.subtasks && item.subtasks.length > 0 && (
                <ul className="mt-3 text-sm list-disc list-inside">
                  {item.subtasks.map((st: any, idx: number) => (
                    <li key={idx}>{st.title} — {st.due_date ? new Date(st.due_date).toLocaleDateString() : "—"}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default RoadmapPage;
