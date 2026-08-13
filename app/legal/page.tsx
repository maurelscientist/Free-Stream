import Link from 'next/link'
import BackButton from '../components/BackButton'

export default function LegalPage() {
  return (
    <main className="py-8 space-y-4">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        <h1 className="text-2xl font-semibold">Mentions légales</h1>

      <section>
        <h2 className="font-semibold">Éditeur</h2>
        <p>Site : Free Stream</p>
        <p>Contact e‑mail : contact@freestream.example</p>
      </section>

      <section>
        <h2 className="font-semibold">Directeur de la publication</h2>
        <p>Nom : Brou Ange-Maurel</p>
      </section>

      <section>
        <h2 className="font-semibold">Hébergement</h2>
        <p>Hébergeur : (à préciser)</p>
      </section>

      <section>
        <h2 className="font-semibold">Sources et dépôt</h2>
        <p>
          Le code source du projet est disponible sur GitHub :
          {' '}
          <a href="https://github.com/USERNAME/REPO" className="text-indigo-600 hover:underline">https://github.com/USERNAME/REPO</a>
          {' '}(remplacez par l'URL du dépôt).
        </p>
        <p>
          La source des données chaînes / API utilisée pour récupérer les listes de chaînes provient de :
          {' '}
          <a href="https://dearbulut.github.io/iptv" className="text-indigo-600 hover:underline">https://dearbulut.github.io/iptv</a>
        </p>
      </section>

      <section>
        <h2 className="font-semibold">Propriété intellectuelle</h2>
        <p>
          Tous les contenus publiés sur ce site (textes, éléments graphiques, logos, etc.) sont protégés par le droit d'auteur.
          Toute reproduction totale ou partielle est interdite sans autorisation préalable.
        </p>
      </section>

      <section>
        <h2 className="font-semibold">Signalement</h2>
        <p>Pour signaler un contenu : voir la page <Link href="/report" className="text-indigo-600 hover:underline">Signaler un contenu</Link>.</p>
      </section>

      <section>
        <h2 className="font-semibold">Données personnelles</h2>
        <p>Pour la gestion des données personnelles, consultez la <Link href="/privacy" className="text-indigo-600 hover:underline">Politique de confidentialité</Link>.</p>
      </section>

      <section>
        <h2 className="font-semibold">Cookies</h2>
        <p>Informations sur les cookies : <Link href="/cookies" className="text-indigo-600 hover:underline">Politique de cookies</Link>.</p>
      </section>

      <section>
        <p className="text-sm text-slate-600">Dernière mise à jour : 2026 — Ces mentions sont fournies à titre informatif, complétez-les avec vos informations légales (hébergeur, directeur de publication, URL GitHub exacte).</p>
      </section>
      </div>
    </main>
  )
}
