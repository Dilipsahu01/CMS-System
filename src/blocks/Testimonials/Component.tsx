import React from 'react'

export type TestimonialsBlockProps = {
  title: string
  testimonials: {
    quote: string
    author: string
    role?: string
    id?: string
  }[]
}

export const TestimonialsBlock: React.FC<TestimonialsBlockProps> = ({ title, testimonials }) => {
  return (
    <div className="container py-16 bg-muted/30">
      <h2 className="text-3xl font-bold mb-12 text-center">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials?.map((t, i) => (
          <div key={t.id || i} className="p-6 bg-card rounded-lg border border-border shadow-sm flex flex-col justify-between">
            <p className="text-muted-foreground italic mb-6">"{t.quote}"</p>
            <div>
              <div className="font-semibold">{t.author}</div>
              {t.role && <div className="text-sm text-muted-foreground">{t.role}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
