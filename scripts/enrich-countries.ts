// One-off enrichment: infer a country for every channel in data/catalog.json
// that lacks one, using the same detection logic as the aggregation pipeline.
// Run: npx tsx scripts/enrich-countries.ts

import fs from 'fs'
import path from 'path'
import { resolveCountryCode, countryCodeToName } from '../app/lib/iptv/countryDetect'

const CATALOG_FILE = path.join(process.cwd(), 'data', 'catalog.json')

function main() {
  if (!fs.existsSync(CATALOG_FILE)) {
    console.error('catalog.json introuvable dans data/')
    process.exit(1)
  }

  const catalog = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8')) as Array<{
    id?: string
    name?: string
    country?: string
    countryCode?: string
    epgId?: string
    categories?: string[]
    languages?: string[]
    streams?: { url: string }[]
  }>

  let updated = 0
  let withCountry = 0

  for (const ch of catalog) {
    if (!ch.countryCode) {
      const code = resolveCountryCode({
        country: ch.country,
        countryCode: ch.countryCode,
        epgId: ch.epgId,
        id: ch.id,
        url: ch.streams?.[0]?.url,
        group: ch.categories?.[0],
        language: ch.languages?.[0],
        name: ch.name,
      })
      ch.countryCode = code
      ch.country = countryCodeToName(code)
      updated++
    }
    withCountry++
  }

  fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog))
  console.log(`Mis à jour: ${updated} chaînes.`)
  console.log(`Total avec un pays: ${withCountry}/${catalog.length}`)
  console.log(`Sans pays (signal manquant): ${catalog.length - withCountry}`)
}

main()
