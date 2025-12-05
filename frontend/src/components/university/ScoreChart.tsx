import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { entScoreHistory } from "@/data/mockData";
import { TrendingUp } from "lucide-react";

interface ScoreChartProps {
  universityName: string;
}

export function ScoreChart({ universityName }: ScoreChartProps) {
  // Add some randomization to make each university chart unique
  const data = entScoreHistory.map((item) => ({
    ...item,
    score: item.score + Math.floor(Math.random() * 10 - 5),
  }));

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Динамика проходного балла ЕНТ</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Исторические данные за последние 5 лет
      </p>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="year" 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']}
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "hsl(var(--accent))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
