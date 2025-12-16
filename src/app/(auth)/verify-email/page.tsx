import { Suspense } from 'react'
import VerifyEmailForm from '@/components/verify-email-form'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex justify-center items-center bg-bg px-5">
        <div className="w-100 flex bg-bg">
          <div className="flex-1 flex flex-col gap-8">
            <div className="h-8 w-32 bg-fill2 animate-pulse rounded" />
            <div className="flex gap-2 flex-col">
              <div className="h-8 w-48 bg-fill2 animate-pulse rounded" />
              <div className="h-4 w-full bg-fill2 animate-pulse rounded" />
            </div>
            <div className="flex flex-col gap-3">
              <div className="h-10 bg-fill2 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}