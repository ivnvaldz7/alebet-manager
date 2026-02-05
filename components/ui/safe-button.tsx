'use client'

import { Button, ButtonProps } from './button'
import { useState } from 'react'

interface SafeButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClickAsync?: () => Promise<void>
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  cooldown?: number // ms
}

export function SafeButton({
  onClick,
  onClickAsync,
  cooldown = 1000,
  disabled,
  children,
  ...props
}: SafeButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isProcessing) return

    setIsProcessing(true)

    try {
      if (onClickAsync) {
        await onClickAsync()
      } else if (onClick) {
        onClick(e)
      }
    } finally {
      // Esperar cooldown antes de permitir otro click
      setTimeout(() => {
        setIsProcessing(false)
      }, cooldown)
    }
  }

  return (
    <Button
      {...props}
      disabled={disabled || isProcessing}
      isLoading={isProcessing}
      onClick={handleClick}
    >
      {children}
    </Button>
  )
}
