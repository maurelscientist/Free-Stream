"use client"

import { useState } from 'react'
import BackButton from '../components/BackButton'

export default function ReportPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        <h1 className="text-2xl font-semibold">Signaler un contenu</h1>
      <p className="mt-4 text-slate-600">Remplissez le formulaire ci-dessous pour signaler un contenu litigieux.</p>

      <form
        action="https://api.web3forms.com/submit"
        method="POST"
        className="mt-8 max-w-3xl space-y-6"
        onSubmit={() => setStatus('sending')}
      >
        <input type="hidden" name="access_key" value="3e8f7586-466c-41f8-875e-32b62c3d08c4" />
        <input type="hidden" name="subject" value="Signalement de contenu Free Stream" />
        <input type="hidden" name="template_id" value="contact_form" />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Identité et coordonnées du demandeur</label>
          <input
            type="text"
            name="name"
            required
            placeholder="Nom et prénom"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="E-mail"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Téléphone (optionnel)"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Contenu concerné</label>
          <textarea
            name="content_description"
            required
            placeholder="Décrivez le contenu concerné"
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">URL ou emplacement précis du contenu</label>
          <input
            type="url"
            name="content_url"
            required
            placeholder="https://..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Nature des droits invoqués</label>
          <input
            type="text"
            name="rights_nature"
            required
            placeholder="Exemple : droit d'auteur, droit à l'image, marque..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Éléments justificatifs</label>
          <textarea
            name="justification"
            required
            placeholder="Expliquez pourquoi ce contenu doit être retiré ou modifié"
            rows={5}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              name="consent"
              required
              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>
              Je consens au traitement de mes données personnelles pour le traitement de ce signalement conformément à la réglementation RGPD. Je reconnais avoir lu la <a href="/privacy" className="font-medium text-indigo-600 hover:underline">politique de confidentialité</a>.
            </span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Envoyer le signalement
          </button>
          {status === 'sending' && <span className="text-slate-500">Envoi en cours...</span>}
        </div>

        <div>
          {status === 'success' && <p className="text-sm text-green-600">Votre signalement a été envoyé avec succès.</p>}
          {status === 'error' && <p className="text-sm text-red-600">Une erreur est survenue lors de l'envoi.</p>}
        </div>
      </form>
      </div>
    </main>
  )
}
