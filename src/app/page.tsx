import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'


const page = () => {
  return (
    <div className='flex flex-col gap-6 items-center justify-center h-screen overflow-y-auto' >
      <section  className='flex items-center justify-center gap-6' >
      <h1 className='heading-2' >ER Diagram for Auth Standard</h1>
        <Button asChild variant="glossy-inverted" color='info' size="48" >
          <Link href="/signup" >
          See the Demo
          </Link>
          </Button>
      </section>
      <Image alt='ER Diagram' height={1500} width={1200} src="/er.png" />
    </div>
  )
}

export default page
