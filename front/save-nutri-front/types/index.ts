export interface School {
  id: string
  type: "Feature"
  geometry: {
    type: "Point"
    coordinates: [number, number]
  }
  properties: {
    name: string
    students: number
    address?: string
    category?: string
  }
}

export interface Farmer {
  id: string
  type: "Feature"
  geometry: {
    type: "Point"
    coordinates: [number, number]
  }
  properties: {
    name: string
    products?: string[]
    production_capacity?: number
    address?: string
  }
}

export interface MatchResult {
  farmer: Farmer
  distance: number
  potential_supply: number
}

export interface MatchResponse {
  school: School
  matches: MatchResult[]
  total_savings: number
  logistics_cost: number
}

export interface GeoJSONResponse {
  type: "FeatureCollection"
  features: Array<School | Farmer>
}
