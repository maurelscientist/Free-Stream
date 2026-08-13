export type Stream = {
  url: string
}

export type Channel = {
  id: string
  name: string
  country?: string
  countryCode?: string
  languages?: string[]
  logo?: string
  categories?: string[]
  streams?: Stream[]
}
