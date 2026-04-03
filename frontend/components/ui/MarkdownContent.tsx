'use client'

import ReactMarkdown from 'react-markdown'

type ColorScheme = 'slate' | 'emerald'

interface MarkdownContentProps {
  content: string
  colorScheme?: ColorScheme
}

const colorSchemes = {
  slate: {
    h: 'text-slate-900 dark:text-white',
    p: 'text-slate-700 dark:text-slate-300',
    code: 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white',
    pre: 'bg-slate-100 dark:bg-slate-700',
  },
  emerald: {
    h: 'text-emerald-900 dark:text-emerald-300',
    p: 'text-emerald-800 dark:text-emerald-200',
    code: 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-300',
    pre: 'bg-emerald-200 dark:bg-emerald-800',
  },
}

export function MarkdownContent({ content, colorScheme = 'slate' }: MarkdownContentProps) {
  const colors = colorSchemes[colorScheme]

  return (
    <ReactMarkdown
      components={{
        h1: ({ ...props }) => <h1 className={`text-lg font-semibold ${colors.h} mt-4 mb-2`} {...props} />,
        h2: ({ ...props }) => <h2 className={`text-base font-semibold ${colors.h} mt-4 mb-2`} {...props} />,
        h3: ({ ...props }) => <h3 className={`text-sm font-semibold ${colors.h} mt-3 mb-2`} {...props} />,
        p: ({ ...props }) => <p className={`mb-3 ${colors.p}`} {...props} />,
        ul: ({ ...props }) => <ul className="list-disc list-inside ml-2 mb-3" {...props} />,
        ol: ({ ...props }) => <ol className="list-decimal list-inside ml-2 mb-3" {...props} />,
        li: ({ ...props }) => <li className={`mb-1 ${colors.p}`} {...props} />,
        strong: ({ ...props }) => <strong className={`font-semibold ${colors.h}`} {...props} />,
        em: ({ ...props }) => <em className={`italic ${colors.p}`} {...props} />,
        code: ({ ...props }) => <code className={`${colors.code} px-1.5 py-0.5 rounded text-xs font-mono`} {...props} />,
        pre: ({ ...props }) => <pre className={`${colors.pre} p-3 rounded-lg overflow-x-auto mb-3`} {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
