import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center flex-1 px-20 py-10">
        <h1>Main Content Here</h1>
      </main>
      <Footer />
    </>
  )
}
