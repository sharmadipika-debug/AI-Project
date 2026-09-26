import type { Country } from '../domain/models'

const flagFor = (iso2: string) =>
  String.fromCodePoint(...Array.from(iso2.toUpperCase(), (letter) => 127397 + letter.charCodeAt(0)))

const country = (id: string, slug: string, name: string, currency: string, popular = false): Country => ({
  id,
  slug,
  name,
  iso2: id,
  currencyCodes: [currency],
  flag: flagFor(id),
  popular,
})

const additionalCountries: Array<[string, string, string, string]> = [
  ['AF','afghanistan','Afghanistan','AFN'],['AL','albania','Albania','ALL'],['DZ','algeria','Algeria','DZD'],['AD','andorra','Andorra','EUR'],['AO','angola','Angola','AOA'],['AG','antigua-and-barbuda','Antigua and Barbuda','XCD'],['AR','argentina','Argentina','ARS'],['AM','armenia','Armenia','AMD'],['AT','austria','Austria','EUR'],['AZ','azerbaijan','Azerbaijan','AZN'],['BS','bahamas','Bahamas','BSD'],['BH','bahrain','Bahrain','BHD'],['BB','barbados','Barbados','BBD'],['BY','belarus','Belarus','BYN'],['BE','belgium','Belgium','EUR'],['BZ','belize','Belize','BZD'],['BJ','benin','Benin','XOF'],['BT','bhutan','Bhutan','BTN'],['BO','bolivia','Bolivia','BOB'],['BA','bosnia-and-herzegovina','Bosnia and Herzegovina','BAM'],['BW','botswana','Botswana','BWP'],['BR','brazil','Brazil','BRL'],['BN','brunei','Brunei','BND'],['BG','bulgaria','Bulgaria','BGN'],['BF','burkina-faso','Burkina Faso','XOF'],['BI','burundi','Burundi','BIF'],['CV','cabo-verde','Cabo Verde','CVE'],['KH','cambodia','Cambodia','KHR'],['CM','cameroon','Cameroon','XAF'],['CF','central-african-republic','Central African Republic','XAF'],['TD','chad','Chad','XAF'],['CL','chile','Chile','CLP'],['CO','colombia','Colombia','COP'],['KM','comoros','Comoros','KMF'],['CG','republic-of-the-congo','Republic of the Congo','XAF'],['CD','democratic-republic-of-the-congo','Democratic Republic of the Congo','CDF'],['CR','costa-rica','Costa Rica','CRC'],['CI','cote-d-ivoire','Côte d’Ivoire','XOF'],['HR','croatia','Croatia','EUR'],['CU','cuba','Cuba','CUP'],['CY','cyprus','Cyprus','EUR'],['CZ','czechia','Czechia','CZK'],['DK','denmark','Denmark','DKK'],['DJ','djibouti','Djibouti','DJF'],['DM','dominica','Dominica','XCD'],['DO','dominican-republic','Dominican Republic','DOP'],['EC','ecuador','Ecuador','USD'],['EG','egypt','Egypt','EGP'],['SV','el-salvador','El Salvador','USD'],['GQ','equatorial-guinea','Equatorial Guinea','XAF'],['ER','eritrea','Eritrea','ERN'],['EE','estonia','Estonia','EUR'],['SZ','eswatini','Eswatini','SZL'],['ET','ethiopia','Ethiopia','ETB'],['FJ','fiji','Fiji','FJD'],['FI','finland','Finland','EUR'],['FR','france','France','EUR'],['GA','gabon','Gabon','XAF'],['GM','gambia','Gambia','GMD'],['GE','georgia','Georgia','GEL'],['GH','ghana','Ghana','GHS'],['GR','greece','Greece','EUR'],['GD','grenada','Grenada','XCD'],['GT','guatemala','Guatemala','GTQ'],['GN','guinea','Guinea','GNF'],['GW','guinea-bissau','Guinea-Bissau','XOF'],['GY','guyana','Guyana','GYD'],['HT','haiti','Haiti','HTG'],['HN','honduras','Honduras','HNL'],['HU','hungary','Hungary','HUF'],['IS','iceland','Iceland','ISK'],['ID','indonesia','Indonesia','IDR'],['IR','iran','Iran','IRR'],['IQ','iraq','Iraq','IQD'],['IE','ireland','Ireland','EUR'],['IL','israel','Israel','ILS'],['IT','italy','Italy','EUR'],['JM','jamaica','Jamaica','JMD'],['JP','japan','Japan','JPY'],['JO','jordan','Jordan','JOD'],['KZ','kazakhstan','Kazakhstan','KZT'],['KE','kenya','Kenya','KES'],['KI','kiribati','Kiribati','AUD'],['KW','kuwait','Kuwait','KWD'],['KG','kyrgyzstan','Kyrgyzstan','KGS'],['LA','laos','Laos','LAK'],['LV','latvia','Latvia','EUR'],['LB','lebanon','Lebanon','LBP'],['LS','lesotho','Lesotho','LSL'],['LR','liberia','Liberia','LRD'],['LY','libya','Libya','LYD'],['LI','liechtenstein','Liechtenstein','CHF'],['LT','lithuania','Lithuania','EUR'],['LU','luxembourg','Luxembourg','EUR'],['MG','madagascar','Madagascar','MGA'],['MW','malawi','Malawi','MWK'],['MY','malaysia','Malaysia','MYR'],['MV','maldives','Maldives','MVR'],['ML','mali','Mali','XOF'],['MT','malta','Malta','EUR'],['MH','marshall-islands','Marshall Islands','USD'],['MR','mauritania','Mauritania','MRU'],['MU','mauritius','Mauritius','MUR'],['MX','mexico','Mexico','MXN'],['FM','micronesia','Micronesia','USD'],['MD','moldova','Moldova','MDL'],['MC','monaco','Monaco','EUR'],['MN','mongolia','Mongolia','MNT'],['ME','montenegro','Montenegro','EUR'],['MA','morocco','Morocco','MAD'],['MZ','mozambique','Mozambique','MZN'],['MM','myanmar','Myanmar','MMK'],['NA','namibia','Namibia','NAD'],['NR','nauru','Nauru','AUD'],['NL','netherlands','Netherlands','EUR'],['NZ','new-zealand','New Zealand','NZD'],['NI','nicaragua','Nicaragua','NIO'],['NE','niger','Niger','XOF'],['KP','north-korea','North Korea','KPW'],['MK','north-macedonia','North Macedonia','MKD'],['NO','norway','Norway','NOK'],['OM','oman','Oman','OMR'],['PW','palau','Palau','USD'],['PA','panama','Panama','USD'],['PG','papua-new-guinea','Papua New Guinea','PGK'],['PY','paraguay','Paraguay','PYG'],['PE','peru','Peru','PEN'],['PL','poland','Poland','PLN'],['PT','portugal','Portugal','EUR'],['QA','qatar','Qatar','QAR'],['RO','romania','Romania','RON'],['RU','russia','Russia','RUB'],['RW','rwanda','Rwanda','RWF'],['KN','saint-kitts-and-nevis','Saint Kitts and Nevis','XCD'],['LC','saint-lucia','Saint Lucia','XCD'],['VC','saint-vincent-and-the-grenadines','Saint Vincent and the Grenadines','XCD'],['WS','samoa','Samoa','WST'],['SM','san-marino','San Marino','EUR'],['ST','sao-tome-and-principe','São Tomé and Príncipe','STN'],['SA','saudi-arabia','Saudi Arabia','SAR'],['SN','senegal','Senegal','XOF'],['RS','serbia','Serbia','RSD'],['SC','seychelles','Seychelles','SCR'],['SL','sierra-leone','Sierra Leone','SLE'],['SG','singapore','Singapore','SGD'],['SK','slovakia','Slovakia','EUR'],['SI','slovenia','Slovenia','EUR'],['SB','solomon-islands','Solomon Islands','SBD'],['SO','somalia','Somalia','SOS'],['ZA','south-africa','South Africa','ZAR'],['KR','south-korea','South Korea','KRW'],['SS','south-sudan','South Sudan','SSP'],['ES','spain','Spain','EUR'],['LK','sri-lanka','Sri Lanka','LKR'],['SD','sudan','Sudan','SDG'],['SR','suriname','Suriname','SRD'],['SE','sweden','Sweden','SEK'],['CH','switzerland','Switzerland','CHF'],['SY','syria','Syria','SYP'],['TW','taiwan','Taiwan','TWD'],['TJ','tajikistan','Tajikistan','TJS'],['TZ','tanzania','Tanzania','TZS'],['TH','thailand','Thailand','THB'],['TL','timor-leste','Timor-Leste','USD'],['TG','togo','Togo','XOF'],['TO','tonga','Tonga','TOP'],['TT','trinidad-and-tobago','Trinidad and Tobago','TTD'],['TN','tunisia','Tunisia','TND'],['TR','turkey','Turkey','TRY'],['TM','turkmenistan','Turkmenistan','TMT'],['TV','tuvalu','Tuvalu','AUD'],['UG','uganda','Uganda','UGX'],['UA','ukraine','Ukraine','UAH'],['AE','united-arab-emirates','United Arab Emirates','AED'],['UY','uruguay','Uruguay','UYU'],['UZ','uzbekistan','Uzbekistan','UZS'],['VU','vanuatu','Vanuatu','VUV'],['VA','vatican-city','Vatican City','EUR'],['VE','venezuela','Venezuela','VES'],['YE','yemen','Yemen','YER'],['ZM','zambia','Zambia','ZMW'],['ZW','zimbabwe','Zimbabwe','ZWG'],
]

export const countries: Country[] = [
  country('CA', 'canada', 'Canada', 'CAD', true),
  country('US', 'usa', 'United States', 'USD', true),
  country('GB', 'uk', 'United Kingdom', 'GBP', true),
  country('AU', 'australia', 'Australia', 'AUD', true),
  country('NP', 'nepal', 'Nepal', 'NPR'),
  country('IN', 'india', 'India', 'INR'),
  country('PH', 'philippines', 'Philippines', 'PHP'),
  country('PK', 'pakistan', 'Pakistan', 'PKR'),
  country('BD', 'bangladesh', 'Bangladesh', 'BDT'),
  country('MX', 'mexico', 'Mexico', 'MXN'),
  country('NG', 'nigeria', 'Nigeria', 'NGN'),
  country('VN', 'vietnam', 'Vietnam', 'VND'),
  country('LK', 'sri-lanka', 'Sri Lanka', 'LKR'),
  country('CN', 'china', 'China', 'CNY'),
  country('DE', 'germany', 'Germany', 'EUR'),
  ...additionalCountries.filter(([id]) => !['CA','US','GB','AU','NP','IN','PH','PK','BD','MX','NG','VN','LK','CN','DE'].includes(id)).map(([id, slug, name, currency]) => country(id, slug, name, currency)),
]

export const currencies = [...new Set(countries.flatMap((item) => item.currencyCodes))]

export const popularCorridors = [
  ['CA', 'IN'], ['CA', 'NP'], ['CA', 'PH'], ['CA', 'PK'],
  ['US', 'IN'], ['US', 'NP'], ['US', 'MX'], ['GB', 'IN'], ['AU', 'IN'], ['AU', 'NP'],
] as const

export const countryById = (id: string) => countries.find((item) => item.id === id)
export const countryBySlug = (slug: string) => countries.find((item) => item.slug === slug)

export const corridors = popularCorridors.map(([fromCountryId, toCountryId]) => {
  const from = countryById(fromCountryId)!
  const to = countryById(toCountryId)!
  return {
    fromCountryId,
    toCountryId,
    fromCurrency: from.currencyCodes[0],
    toCurrency: to.currencyCodes[0],
    enabled: true,
    featured: true,
  }
})
