import BackButton from '../components/BackButton'

export default function ContactPage() {
  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        <h1 className="text-2xl font-semibold">Contact</h1>
        <p className="mt-4">Pour nous contacter : contact@freestream.example (exemple).</p>
      </div>
    </main>
  )
}
