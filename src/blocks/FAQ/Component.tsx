import React from 'react'

export type FAQBlockProps = {
  title: string
  questions: {
    question: string
    answer: string
    id?: string
  }[]
}

export const FAQBlock: React.FC<FAQBlockProps> = ({ title, questions }) => {
  return (
    <div className="container py-16">
      <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>
      <div className="max-w-3xl mx-auto space-y-6">
        {questions?.map((q, i) => (
          <div key={q.id || i} className="border border-border p-6 rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">{q.question}</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{q.answer}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
