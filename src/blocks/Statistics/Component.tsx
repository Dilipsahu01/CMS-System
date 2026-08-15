import React from 'react'

export type StatisticsBlockProps = {
  stats: {
    value: string
    label: string
    id?: string
  }[]
}

export const StatisticsBlock: React.FC<StatisticsBlockProps> = ({ stats }) => {
  return (
    <div className="container py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats?.map((stat, i) => (
          <div key={stat.id || i} className="text-center p-6 bg-card rounded-lg border border-border">
            <div className="text-4xl font-bold mb-2 text-primary">{stat.value}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
