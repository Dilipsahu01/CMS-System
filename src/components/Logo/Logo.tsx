import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
}

export const Logo = (props: Props) => {
  const { className } = props

  return (
    <span className={clsx('text-xl font-bold', className)}>
      Business Site
    </span>
  )
}
