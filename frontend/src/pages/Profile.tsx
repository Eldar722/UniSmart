import React, { useMemo, useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/context/UserContext";
import { entScoreHistory } from "@/data/mockData";

type ApplicationStatus = "Draft" | "Submitted" | "Interview" | "Accepted" | "Rejected";

interface ApplicationItem {
  id: string;
  university: string;
  program: string;
  appliedOn: string;
  status: ApplicationStatus;
}

const sampleApplications = (): ApplicationItem[] => [
  { id: "app-1", university: "Назарбаев Университет", program: "Computer Science", appliedOn: "2025-03-10", status: "Submitted" },
  { id: "app-2", university: "Казахский национальный университет", program: "Информационные системы", appliedOn: "2025-04-02", status: "Interview" },
  { id: "app-3", university: "KIMEP University", program: "Business Administration", appliedOn: "2025-05-11", status: "Draft" },
];

const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

const Profile: React.FC = () => {
  const { profile, user, token } = useUser();
  const [applications, setApplications] = useState<ApplicationItem[]>(() => sampleApplications());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ApplicationItem>>({});

  // Load applications from localStorage and sync with server
  useEffect(() => {
    const loadApps = async () => {
      // Try to load from server if authenticated
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/user/applications`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.applications) {
              setApplications(data.applications);
              return;
            }
          }
        } catch (err) {
          console.warn("Failed to load applications from server", err);
        }
      }

      // Fallback to localStorage
      try {
        const raw = localStorage.getItem("user_applications");
        if (raw) {
          const parsed: ApplicationItem[] = JSON.parse(raw);
          if (Array.isArray(parsed)) setApplications(parsed);
        }
      } catch (err) {
        console.warn("Failed to load applications from localStorage", err);
      }
    };

    loadApps();
  }, [token]);

  // Sync applications to localStorage and server
  useEffect(() => {
    try {
      localStorage.setItem("user_applications", JSON.stringify(applications));
    } catch (err) {
      console.warn("Failed to save applications to localStorage", err);
    }

    // Sync to server if authenticated
    if (token) {
      (async () => {
        try {
          await fetch(`${API_BASE}/user/applications`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ applications }),
          });
        } catch (err) {
          console.warn("Failed to sync applications to server", err);
        }
      })();
    }
  }, [applications, token]);

  const entProgress = useMemo(() => Math.min(100, Math.round(((profile?.entScore || 0) / 140) * 100)), [profile]);
  const ieltsProgress = useMemo(() => Math.min(100, Math.round(((profile?.ieltsScore || 0) / 9) * 100)), [profile]);

  const addDummyApplication = () => {
    const next: ApplicationItem = {
      id: `app-${Date.now()}`,
      university: "Новый университет",
      program: "Новая программа",
      appliedOn: new Date().toISOString().slice(0, 10),
      status: "Draft",
    };
    setApplications((s) => [next, ...s]);
  };

  const deleteApplication = (id: string) => {
    setApplications((s) => s.filter((a) => a.id !== id));
  };

  const startEdit = (app: ApplicationItem) => {
    setEditingId(app.id);
    setEditData(app);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = () => {
    if (editingId) {
      setApplications((s) =>
        s.map((a) =>
          a.id === editingId ? { ...a, ...editData } : a
        )
      );
      setEditingId(null);
      setEditData({});
    }
  };

  const exportICS = () => {
    // Basic ICS exporter for applications (MVP)
    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//UniSmart//EN",
      "CALSCALE:GREGORIAN",
    ];

    applications.forEach((app) => {
      const date = new Date(app.appliedOn);
      // set event time to 09:00 local
      date.setHours(9, 0, 0, 0);
      const dt = date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${app.id}@unismart`);
      lines.push(`DTSTAMP:${dt}`);
      lines.push(`DTSTART:${dt}`);
      lines.push(`SUMMARY:Application to ${escapeICS(app.university)} - ${escapeICS(app.program)}`);
      lines.push(`DESCRIPTION:Status: ${app.status}`);
      lines.push("END:VEVENT");
    });

    lines.push("END:VCALENDAR");

    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unismart_applications_${new Date().toISOString().slice(0,10)}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const escapeICS = (s: string) => {
    return String(s).replace(/\\n/g, "\\n").replace(/[,;\\]/g, "\\$&");
  };

  const updateStatus = (id: string, status: ApplicationStatus) => {
    setApplications((s) => s.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Профиль</h1>
        <div className="text-sm text-muted-foreground">{user?.name ? `Привет, ${user.name}` : "Гость"}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Academic Snapshot</CardTitle>
            <CardDescription>Краткое представление ваших академических показателей и предпочтений</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">ЕНТ</span>
                  <span className="text-sm text-muted-foreground">{profile?.entScore ?? "—"} / 140</span>
                </div>
                <Progress value={entProgress} />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">IELTS</span>
                  <span className="text-sm text-muted-foreground">{profile?.ieltsScore ?? "—"} / 9</span>
                </div>
                <Progress value={ieltsProgress} />
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Интересы</div>
                <div className="flex flex-wrap gap-2">
                  {(profile?.interests?.length ? profile.interests : ["—"]).map((i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-muted rounded">{i}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Предпочитаемый город</div>
                <div className="text-sm text-muted-foreground">{profile?.preferredCity ?? "Любой"}</div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Бюджет</div>
                <div className="text-sm text-muted-foreground">{profile?.budget ? `${profile.budget} ₸` : "Не указан"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Applications aggregator</CardTitle>
              <CardDescription>Отслеживайте статусы ваших заявок в одном месте</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">Синхронизация с сервером (если авторизованы)</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={addDummyApplication}>Добавить заявку</Button>
                  <Button variant="default" size="sm" onClick={exportICS}>Экспорт .ics</Button>
                </div>
              </div>

              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className={`p-3 rounded-md border ${editingId === app.id ? "bg-accent/10" : "bg-background"}`}>
                    {editingId === app.id ? (
                      // Edit mode
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Университет"
                          value={editData.university || ""}
                          onChange={(e) => setEditData({ ...editData, university: e.target.value })}
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                        <input
                          type="text"
                          placeholder="Программа"
                          value={editData.program || ""}
                          onChange={(e) => setEditData({ ...editData, program: e.target.value })}
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                        <input
                          type="date"
                          value={editData.appliedOn || ""}
                          onChange={(e) => setEditData({ ...editData, appliedOn: e.target.value })}
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                        <select
                          value={editData.status || ""}
                          onChange={(e) => setEditData({ ...editData, status: e.target.value as ApplicationStatus })}
                          className="w-full px-2 py-1 text-sm border rounded"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Interview">Interview</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" onClick={saveEdit}>Сохранить</Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>Отмена</Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{app.university} — {app.program}</div>
                          <div className="text-sm text-muted-foreground">Подано: {formatDate(app.appliedOn)}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-muted-foreground">{app.status}</div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => startEdit(app)}>Править</Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteApplication(app.id)}>Удалить</Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Timeline</CardTitle>
              <CardDescription>История ваших оценок и прогресса</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {entScoreHistory.map((h) => (
                  <div key={h.year} className="flex items-center justify-between">
                    <div className="text-sm">{h.year}</div>
                    <div className="w-2/3">
                      <Progress value={(h.score / 140) * 100} />
                    </div>
                    <div className="text-sm w-12 text-right">{h.score}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
