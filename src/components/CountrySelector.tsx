'use client'

import { useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import type { Country } from '../domain/models'

type CountrySelectorProps = {
  id: string
  label: string
  value: Country
  countries: Country[]
  onChange: (country: Country) => void
}

export default function CountrySelector({ id, label, value, countries, onChange }: CountrySelectorProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const matches = countries.filter((country) =>
    `${country.name} ${country.iso2} ${country.currencyCodes.join(' ')}`.toLowerCase().includes(normalizedQuery),
  )
  const popular = matches.filter((country) => country.popular)
  const other = matches.filter((country) => !country.popular)

  const choose = (country: Country) => {
    onChange(country)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className={`country-picker ${id === 'to-country' ? 'country-picker-right' : ''}`}>
      <span className="picker-label" id={`${id}-label`}>{label}</span>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label ${id}-value`}
        className="country-picker-trigger"
        id={`${id}-value`}
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="picker-flag" aria-hidden="true">{value.flag}</span>
        <span className="picker-value"><strong>{value.name}</strong><small>{value.currencyCodes[0]}</small></span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      {open && (
        <div className="country-picker-popover">
          <label className="country-search" htmlFor={`${id}-search`}>
            <Search size={15} aria-hidden="true" />
            <input
              autoComplete="off"
              autoFocus
              id={`${id}-search`}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country or currency"
              value={query}
            />
          </label>
          <div className="country-options" role="listbox" aria-labelledby={`${id}-label`}>
            {popular.length > 0 && <div className="country-group-label">FREQUENTLY USED</div>}
            {[...popular, ...other].map((country) => (
              <button
                aria-selected={country.id === value.id}
                className="country-option"
                key={country.id}
                onClick={() => choose(country)}
                role="option"
                type="button"
              >
                <span className="picker-flag" aria-hidden="true">{country.flag}</span>
                <span className="country-option-name">{country.name}<small>{country.iso2}</small></span>
                <span className="country-option-currency">{country.currencyCodes.join(', ')}</span>
                {country.id === value.id && <Check size={14} className="country-option-check" aria-hidden="true" />}
              </button>
            ))}
            {matches.length === 0 && <p className="country-no-results">No countries match “{query}”.</p>}
          </div>
        </div>
      )}
    </div>
  )
}