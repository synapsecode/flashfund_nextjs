'use client'
import { useParams } from 'next/navigation'

const loans = [
  {
    'loan_amount': 100_000,
    'deployedAddress': '0x00000000000000',
  }
]

export default function Home() {
  const params = useParams();
  return (
    <div className='p-5'>
      <h1 className="center text-2xl">Company {params.id}</h1>
      <h1 className="center text-5xl">My Loans</h1>
      <br />
    </div>
  );
}
