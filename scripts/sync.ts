// Standalone Free Stream aggregator runner.
// Usage:  npx tsx scripts/sync.ts
// Env:    FS_VALIDATE=true FS_VALIDATE_MAX=400 FS_VALIDATE_CONCURRENCY=20
//
// Fetches every enabled source, deduplicates, optionally validates a bounded
// sample of streams, then writes data/catalog.json and data/sync-status.json.

import { aggregateAll } from '../app/lib/iptv/aggregate'
import fs from 'fs'
import path from 'path'

async function main() {
  const validate = process.env.FS_VALIDATE === 'true'
  const validateMax = process.env.FS_VALIDATE_MAX ? parseInt(process.env.FS_VALIDATE_MAX, 10) : 500
  const concurrency = process.env.FS_VALIDATE_CONCURRENCY
    ? parseInt(process.env.FS_VALIDATE_CONCURRENCY, 10)
    : 16

  console.log('Free Stream — démarrage de l’agrégation...')
  console.log(
    `Validation des flux : ${validate ? `activée (max ${validateMax}, concurrence ${concurrency})` : 'désactivée'}`,
  )

  const { catalog, stats } = await aggregateAll({
    validate,
    validateMax,
    validateConcurrency: concurrency,
  })

  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  fs.writeFileSync(path.join(dataDir, 'catalog.json'), JSON.stringify(catalog))
  fs.writeFileSync(
    path.join(dataDir, 'sync-status.json'),
    JSON.stringify({ state: 'done', lastSuccessAt: stats.finishedAt, stats }, null, 2),
  )

  console.log('\n================ RAPPORT FREE STREAM ================')
  console.log('Démarré  :', stats.startedAt)
  console.log('Terminé  :', stats.finishedAt)
  console.log('Sources actives   :', stats.sourcesEnabled)
  console.log('Sources en échec  :', stats.sourcesFailed.length ? stats.sourcesFailed.join(', ') : 'aucune')
  console.log('\nPar source (chaînes récupérées) :')
  for (const [id, s] of Object.entries(stats.perSource)) {
    console.log(`  - ${id}: ${s.fetched}${s.errors.length ? `  (erreurs: ${s.errors.join('; ')})` : ''}`)
  }
  console.log('\nEntrées brutes        :', stats.totalRaw)
  console.log('Après déduplication  :', stats.afterDedup)
  console.log('Doublons supprimés   :', stats.duplicatesRemoved)
  console.log('Flux totaux          :', stats.streamsTotal)
  if (validate) {
    console.log('Flux validés         :', stats.streamsValidated, stats.validationCapped ? '(échantillon plafonné)' : '')
    console.log('Flux fonctionnels    :', stats.streamsWorking)
    console.log('Flux invalides       :', stats.streamsInvalid)
  }
  console.log('Flux non vérifiés    :', stats.streamsUnverified)
  console.log('\nCatalogue écrit dans data/catalog.json')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
