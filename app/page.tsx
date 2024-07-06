import ButtonsSections from './component/buttonsSections'
import Footer from './component/footer'
import Header from './component/header'

export default function Home() {
  return (
    <main className="h-full w-full flex flex-col bg-gradient-to-r from-yellow-500 to-red-500">
      <Header />
      <ButtonsSections />
      <Footer />
    </main>
  )
}
