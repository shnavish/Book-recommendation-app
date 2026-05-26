"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

type DnaItem = {
  subject: string;
  A: number;
  fullMark: number;
};

interface ReadingDnaChartProps {
  data: DnaItem[];
}

export default function ReadingDnaChart({ data }: ReadingDnaChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="55%" data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar name="DNA" dataKey="A" stroke="#c8a96b" fill="#c8a96b" fillOpacity={0.3} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
