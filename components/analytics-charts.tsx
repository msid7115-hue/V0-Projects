"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts"
import type { TaskAnalytics } from "@/hooks/use-analytics"

interface AnalyticsChartsProps {
  analytics: TaskAnalytics
}

const COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))",
  muted: "hsl(var(--muted-foreground))",
  chart1: "hsl(var(--chart-1))",
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
  chart4: "hsl(var(--chart-4))",
  chart5: "hsl(var(--chart-5))",
}

const PIE_COLORS = [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5]

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Progress Chart */}
      <Card className="glass lg:col-span-2">
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>Tasks created vs completed this week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="created"
                stackId="1"
                stroke={COLORS.chart1}
                fill={COLORS.chart1}
                fillOpacity={0.6}
                name="Created"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="2"
                stroke={COLORS.chart2}
                fill={COLORS.chart2}
                fillOpacity={0.8}
                name="Completed"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Priority Distribution</CardTitle>
          <CardDescription>Tasks by priority level</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.priorityDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                nameKey="priority"
              >
                {analytics.priorityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {analytics.priorityDistribution.map((item, index) => (
              <div key={item.priority} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span>{item.priority}</span>
                </div>
                <span className="font-medium">
                  {item.count} ({Math.round(item.percentage)}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Task Status</CardTitle>
          <CardDescription>Current status breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.statusDistribution} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="status" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill={COLORS.chart1} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Productivity Trend */}
      <Card className="glass lg:col-span-2">
        <CardHeader>
          <CardTitle>Productivity Trend</CardTitle>
          <CardDescription>4-week productivity and efficiency analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.productivityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar yAxisId="left" dataKey="completed" fill={COLORS.chart2} name="Completed" />
              <Bar yAxisId="left" dataKey="created" fill={COLORS.chart1} name="Created" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="efficiency"
                stroke={COLORS.chart3}
                strokeWidth={3}
                name="Efficiency %"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Project Progress */}
      <Card className="glass lg:col-span-2">
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
          <CardDescription>Completion status by project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.projectProgress.map((project) => (
              <div key={project.project} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{project.project}</span>
                  <span className="text-muted-foreground">
                    {project.completed}/{project.total} tasks ({Math.round(project.percentage)}%)
                  </span>
                </div>
                <Progress value={project.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
