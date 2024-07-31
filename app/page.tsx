import { db } from "@/lib/db";

export default function Home() {

  db.set('hi', 'hi')

  return (
    <main className='text-red-500'>
      hi
    </main>
  );
}
