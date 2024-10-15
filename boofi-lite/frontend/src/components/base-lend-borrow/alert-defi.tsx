import React from 'react'
import { InfoIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function AlertDefi() {
  return (
    <Alert>
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>New to DeFi?</AlertTitle>
      <AlertDescription>
        DeFi (Decentralized Finance) allows you to lend, borrow, and earn
        interest on your crypto assets without traditional banks. Start
        small, learn as you go, and always research before investing.
      </AlertDescription>
    </Alert>
  )
}