export const getContinentFromCountry = (country) => {
  const map = {
    // Asia
    India: 'Asia', China: 'Asia', Japan: 'Asia', Thailand: 'Asia',
    Indonesia: 'Asia', Vietnam: 'Asia', Nepal: 'Asia', Maldives: 'Asia',
    'Sri Lanka': 'Asia', Philippines: 'Asia', Malaysia: 'Asia',
    Singapore: 'Asia', Cambodia: 'Asia', UAE: 'Asia', Jordan: 'Asia',
    Turkey: 'Asia', Israel: 'Asia', Bali: 'Asia',
    // Europe
    France: 'Europe', Italy: 'Europe', Spain: 'Europe', Greece: 'Europe',
    Germany: 'Europe', UK: 'Europe', Portugal: 'Europe', Switzerland: 'Europe',
    Netherlands: 'Europe', Croatia: 'Europe', Iceland: 'Europe',
    Norway: 'Europe', Sweden: 'Europe', Austria: 'Europe', Czech: 'Europe',
    Hungary: 'Europe', Poland: 'Europe', Scotland: 'Europe', Ireland: 'Europe',
    // Americas
    USA: 'Americas', Canada: 'Americas', Mexico: 'Americas', Brazil: 'Americas',
    Argentina: 'Americas', Peru: 'Americas', Colombia: 'Americas',
    Chile: 'Americas', Cuba: 'Americas', Costa: 'Americas',
    // Africa
    Morocco: 'Africa', Egypt: 'Africa', Kenya: 'Africa', Tanzania: 'Africa',
    'South Africa': 'Africa', Ethiopia: 'Africa', Ghana: 'Africa',
    Tunisia: 'Africa', Madagascar: 'Africa',
    // Oceania
    Australia: 'Oceania', 'New Zealand': 'Oceania', Fiji: 'Oceania',
    // Antarctica
    Antarctica: 'Antarctica',
  }
  for (const [key, continent] of Object.entries(map)) {
    if (country?.toLowerCase().includes(key.toLowerCase())) return continent
  }
  return 'Other'
}

export const CONTINENT_COLORS = {
  Asia: '#c1440e',
  Europe: '#4ecdc4',
  Americas: '#fbbf24',
  Africa: '#f472b6',
  Oceania: '#a78bfa',
  Other: '#6b7280',
  Antarctica: '#93c5fd',
}