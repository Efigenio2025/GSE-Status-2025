import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

import './App.css'
import type { BulkTank, DeiceTruck, TruckStatus } from './data/inventory'
import { initialBulkTanks, initialDeiceTrucks } from './data/inventory'

const gallonsFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

const timeFormatter = new Intl.DateTimeFormat('en', {
  hour: 'numeric',
  minute: '2-digit',
})

const formatGallons = (value: number) => `${gallonsFormatter.format(Math.round(value))} gal`

const percentOf = (value: number, capacity: number) => {
  if (capacity <= 0) return 0
  return Math.round((value / capacity) * 100)
}

const shareOf = (value: number, total: number) => {
  if (total <= 0) return 0
  return Math.round((value / total) * 100)
}

const formatRelativeTime = (isoString: string) => {
  const target = new Date(isoString)
  const diffMs = target.getTime() - Date.now()
  const diffMinutes = Math.round(Math.abs(diffMs) / 60000)
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (diffMinutes < 60) {
    return formatter.format(Math.round(diffMs / 60000), 'minute')
  }

  const diffHours = Math.round(diffMs / 3600000)
  if (Math.abs(diffHours) < 48) {
    return formatter.format(diffHours, 'hour')
  }

  const diffDays = Math.round(diffMs / 86400000)
  return formatter.format(diffDays, 'day')
}

const getLevelClass = (percent: number) => {
  if (percent <= 25) return ' is-critical'
  if (percent <= 45) return ' is-warning'
  return ''
}

type ViewMode = 'dashboard' | 'portal'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [trucks, setTrucks] = useState<DeiceTruck[]>(() =>
    initialDeiceTrucks.map((truck) => ({ ...truck })),
  )
  const [tanks, setTanks] = useState<BulkTank[]>(() =>
    initialBulkTanks.map((tank) => ({ ...tank })),
  )
  const [activeTruckIndex, setActiveTruckIndex] = useState(0)
  const [activeTankIndex, setActiveTankIndex] = useState(0)

  const updateTruck = (id: string, mutator: (truck: DeiceTruck) => DeiceTruck) => {
    const stampedAt = new Date().toISOString()
    setTrucks((previous) =>
      previous.map((truck) => {
        if (truck.id !== id) return truck
        const next = mutator(truck)
        return { ...next, lastUpdated: stampedAt }
      }),
    )
  }

  const updateTank = (id: string, mutator: (tank: BulkTank) => BulkTank) => {
    const stampedAt = new Date().toISOString()
    setTanks((previous) =>
      previous.map((tank) => {
        if (tank.id !== id) return tank
        const next = mutator(tank)
        return { ...next, lastSampled: stampedAt }
      }),
    )
  }

  const runningCount = trucks.filter((truck) => truck.status === 'Running').length
  const heaterCount = trucks.filter((truck) => truck.heaterOn).length
  const avgFuel =
    trucks.length === 0
      ? 0
      : Math.round(trucks.reduce((sum, truck) => sum + truck.fuelPercent, 0) / trucks.length)

  const type1TruckCapacity = trucks.reduce((sum, truck) => sum + truck.type1Capacity, 0)
  const type1TruckLevel = trucks.reduce((sum, truck) => sum + truck.type1Level, 0)
  const type4TruckCapacity = trucks.reduce((sum, truck) => sum + truck.type4Capacity, 0)
  const type4TruckLevel = trucks.reduce((sum, truck) => sum + truck.type4Level, 0)

  const type1BulkCapacity = tanks
    .filter((tank) => tank.fluidType === 'Type I')
    .reduce((sum, tank) => sum + tank.capacity, 0)
  const type1BulkLevel = tanks
    .filter((tank) => tank.fluidType === 'Type I')
    .reduce((sum, tank) => sum + tank.level, 0)

  const type4BulkCapacity = tanks
    .filter((tank) => tank.fluidType === 'Type IV')
    .reduce((sum, tank) => sum + tank.capacity, 0)
  const type4BulkLevel = tanks
    .filter((tank) => tank.fluidType === 'Type IV')
    .reduce((sum, tank) => sum + tank.level, 0)

  const type1TotalCapacity = type1TruckCapacity + type1BulkCapacity
  const type4TotalCapacity = type4TruckCapacity + type4BulkCapacity

  const type1TotalLevel = type1TruckLevel + type1BulkLevel
  const type4TotalLevel = type4TruckLevel + type4BulkLevel

  const lowType1Trucks = trucks.filter(
    (truck) => percentOf(truck.type1Level, truck.type1Capacity) <= 40,
  ).length
  const lowType4Trucks = trucks.filter(
    (truck) => percentOf(truck.type4Level, truck.type4Capacity) <= 40,
  ).length

  const updateTimes = [
    ...trucks.map((truck) => new Date(truck.lastUpdated).getTime()),
    ...tanks.map((tank) => new Date(tank.lastSampled).getTime()),
  ]
  const lastUpdate = updateTimes.length ? new Date(Math.max(...updateTimes)) : null

  const lastUpdateIso = lastUpdate?.toISOString() ?? new Date().toISOString()
  const truckStatusOptions: TruckStatus[] = ['Running', 'Not Running']
  const fluidTypeOptions: BulkTank['fluidType'][] = ['Type I', 'Type IV']

  useEffect(() => {
    setActiveTruckIndex((current) => {
      if (trucks.length === 0) return 0
      return Math.min(current, trucks.length - 1)
    })
  }, [trucks.length])

  useEffect(() => {
    setActiveTankIndex((current) => {
      if (tanks.length === 0) return 0
      return Math.min(current, tanks.length - 1)
    })
  }, [tanks.length])

  const goToPreviousTruck = () => {
    if (trucks.length <= 1) return
    setActiveTruckIndex((current) =>
      (current - 1 + trucks.length) % trucks.length,
    )
  }

  const goToNextTruck = () => {
    if (trucks.length <= 1) return
    setActiveTruckIndex((current) => (current + 1) % trucks.length)
  }

  const goToPreviousTank = () => {
    if (tanks.length <= 1) return
    setActiveTankIndex((current) => (current - 1 + tanks.length) % tanks.length)
  }

  const goToNextTank = () => {
    if (tanks.length <= 1) return
    setActiveTankIndex((current) => (current + 1) % tanks.length)
  }

  return (
    <div className="app-shell">
      <div className="view-toggle" role="tablist" aria-label="Deice operations views">
        <button
          type="button"
          className={viewMode === 'dashboard' ? 'is-active' : ''}
          aria-pressed={viewMode === 'dashboard'}
          onClick={() => setViewMode('dashboard')}
        >
          Command Deck
        </button>
        <button
          type="button"
          className={viewMode === 'portal' ? 'is-active' : ''}
          aria-pressed={viewMode === 'portal'}
          onClick={() => setViewMode('portal')}
        >
          Field Portal
        </button>
      </div>

      {viewMode === 'dashboard' ? (
        <>
          <header className="hero glass-card">
            <div className="hero__content">
              <p className="hero__eyebrow">Deice Command Deck</p>
              <h1>Bird&apos;s-eye readiness for deice support</h1>
              <p className="hero__description">
                Four dedicated trucks and two bulk tanks tracked in one glance. Monitor fluid levels, fuel
                status, and heater posture before the next departure wave.
              </p>
              <div className="hero__metrics">
                <div className="metric-card">
                  <span>Trucks running</span>
                  <strong>{runningCount}</strong>
                  <small>of {trucks.length} assets</small>
                </div>
                <div className="metric-card">
                  <span>Type I ready</span>
                  <strong>{formatGallons(type1TotalLevel)}</strong>
                  <small>of {formatGallons(type1TotalCapacity)}</small>
                </div>
                <div className="metric-card">
                  <span>Type IV ready</span>
                  <strong>{formatGallons(type4TotalLevel)}</strong>
                  <small>of {formatGallons(type4TotalCapacity)}</small>
                </div>
              </div>
            </div>
            <div className="hero__summary">
              <div className="summary-grid">
                <div>
                  <span>Heaters engaged</span>
                  <strong>{heaterCount}</strong>
                  <small>{trucks.length - heaterCount} on standby</small>
                </div>
                <div>
                  <span>Average fuel</span>
                  <strong>{avgFuel}%</strong>
                  <small>across all trucks</small>
                </div>
                <div>
                  <span>Type I low alerts</span>
                  <strong>{lowType1Trucks}</strong>
                  <small>{lowType1Trucks === 1 ? 'truck below 40%' : 'trucks below 40%'}</small>
                </div>
                <div>
                  <span>Type IV low alerts</span>
                  <strong>{lowType4Trucks}</strong>
                  <small>{lowType4Trucks === 1 ? 'truck below 40%' : 'trucks below 40%'}</small>
                </div>
              </div>
              <footer>
                <span>Data sync</span>
                <strong>{timeFormatter.format(new Date(lastUpdateIso))}</strong>
                <small>{formatRelativeTime(lastUpdateIso)}</small>
              </footer>
            </div>
          </header>

          <main className="dashboard">
            <section className="glass-card fluid-summary">
              <header>
                <h2>Fluid availability</h2>
                <p>Combined loads across trucks and bulk storage.</p>
              </header>
              <div className="fluid-summary__grid">
                <article>
                  <div className="fluid-summary__header">
                    <span>Type I deice</span>
                    <strong>{formatGallons(type1TotalLevel)}</strong>
                  </div>
                  <p>Capacity {formatGallons(type1TotalCapacity)}</p>
                  <div className="fluid-bar">
                    <div
                      className="fluid-bar__segment fluid-bar__segment--truck"
                      style={{ width: `${shareOf(type1TruckLevel, type1TotalCapacity)}%` }}
                    />
                    <div
                      className="fluid-bar__segment fluid-bar__segment--bulk"
                      style={{ width: `${shareOf(type1BulkLevel, type1TotalCapacity)}%` }}
                    />
                  </div>
                  <ul>
                    <li>
                      <span>Trucks</span>
                      <span>{formatGallons(type1TruckLevel)}</span>
                    </li>
                    <li>
                      <span>Bulk storage</span>
                      <span>{formatGallons(type1BulkLevel)}</span>
                    </li>
                    <li>
                      <span>Utilization</span>
                      <span>{percentOf(type1TotalLevel, type1TotalCapacity)}%</span>
                    </li>
                  </ul>
                </article>
                <article>
                  <div className="fluid-summary__header">
                    <span>Type IV anti-ice</span>
                    <strong>{formatGallons(type4TotalLevel)}</strong>
                  </div>
                  <p>Capacity {formatGallons(type4TotalCapacity)}</p>
                  <div className="fluid-bar">
                    <div
                      className="fluid-bar__segment fluid-bar__segment--truck"
                      style={{ width: `${shareOf(type4TruckLevel, type4TotalCapacity)}%` }}
                    />
                    <div
                      className="fluid-bar__segment fluid-bar__segment--bulk"
                      style={{ width: `${shareOf(type4BulkLevel, type4TotalCapacity)}%` }}
                    />
                  </div>
                  <ul>
                    <li>
                      <span>Trucks</span>
                      <span>{formatGallons(type4TruckLevel)}</span>
                    </li>
                    <li>
                      <span>Bulk storage</span>
                      <span>{formatGallons(type4BulkLevel)}</span>
                    </li>
                    <li>
                      <span>Utilization</span>
                      <span>{percentOf(type4TotalLevel, type4TotalCapacity)}%</span>
                    </li>
                  </ul>
                </article>
              </div>
            </section>

            <section className="truck-section">
              <div className="section-heading">
                <h2>Deice trucks</h2>
                <p>Live fluid and fuel status for assets DS032 through DS035.</p>
              </div>
              <div className="truck-grid">
                {trucks.map((truck) => {
                  const type1Percent = percentOf(truck.type1Level, truck.type1Capacity)
                  const type4Percent = percentOf(truck.type4Level, truck.type4Capacity)
                  const fuelPercent = Math.round(truck.fuelPercent)

                  return (
                    <article
                      key={truck.id}
                      className={`truck-card glass-card${
                        truck.status === 'Running' ? ' truck-card--running' : ' truck-card--staged'
                      }`}
                    >
                      <header>
                        <div>
                          <span className="truck-card__asset">{truck.assetNumber}</span>
                          <h3>{truck.name}</h3>
                          <p>{truck.location}</p>
                        </div>
                        <span
                          className={`status-pill ${
                            truck.status === 'Running' ? 'status-pill--running' : 'status-pill--stopped'
                          }`}
                        >
                          {truck.status}
                        </span>
                      </header>

                      <div className="truck-card__levels">
                        <div>
                          <span>Type I fluid</span>
                          <div className={`level-bar${getLevelClass(type1Percent)}`}>
                            <div className="level-bar__fill" style={{ width: `${type1Percent}%` }} />
                          </div>
                          <small>
                            {formatGallons(truck.type1Level)} / {formatGallons(truck.type1Capacity)} · {type1Percent}%
                          </small>
                        </div>
                        <div>
                          <span>Type IV fluid</span>
                          <div className={`level-bar${getLevelClass(type4Percent)}`}>
                            <div className="level-bar__fill" style={{ width: `${type4Percent}%` }} />
                          </div>
                          <small>
                            {formatGallons(truck.type4Level)} / {formatGallons(truck.type4Capacity)} · {type4Percent}%
                          </small>
                        </div>
                        <div>
                          <span>Fuel reserve</span>
                          <div className={`level-bar level-bar--fuel${getLevelClass(fuelPercent)}`}>
                            <div className="level-bar__fill" style={{ width: `${fuelPercent}%` }} />
                          </div>
                          <small>{fuelPercent}% tank</small>
                        </div>
                      </div>

                      <div className="truck-card__status">
                        <span className={`heater-tag${truck.heaterOn ? ' is-on' : ''}`}>
                          Heater {truck.heaterOn ? 'On' : 'Off'}
                        </span>
                        <span>Updated {formatRelativeTime(truck.lastUpdated)}</span>
                      </div>

                      <p className="truck-card__notes">{truck.notes}</p>
                    </article>
                  )
                })}
              </div>
            </section>

            <section className="bulk-section glass-card">
              <div className="section-heading">
                <h2>Bulk storage</h2>
                <p>Monitor the tank farm that feeds the trucks.</p>
              </div>
              <div className="tank-grid">
                {tanks.map((tank) => {
                  const percent = percentOf(tank.level, tank.capacity)

                  return (
                    <article key={tank.id} className="tank-card">
                      <header>
                        <span className="tank-card__fluid">{tank.fluidType}</span>
                        <h3>{tank.name}</h3>
                        <p>{tank.location}</p>
                      </header>
                      <div className="tank-card__meter">
                        <div className={`level-bar${getLevelClass(percent)}`}>
                          <div className="level-bar__fill" style={{ width: `${percent}%` }} />
                        </div>
                        <div className="tank-card__figures">
                          <strong>{formatGallons(tank.level)}</strong>
                          <span>of {formatGallons(tank.capacity)}</span>
                        </div>
                      </div>
                      <div className="tank-card__footer">
                        <span>Updated {formatRelativeTime(tank.lastSampled)}</span>
                        <span>{percent}% full</span>
                      </div>
                      <p>{tank.notes}</p>
                    </article>
                  )
                })}
              </div>
            </section>
          </main>
        </>
      ) : (
        <main className="mobile-portal">
          <section className="glass-card portal-overview">
            <p className="portal-overview__eyebrow">Deice field portal</p>
            <h1>Update assets on the go</h1>
            <p>
              Set fluid loads, heater posture, and ramp notes without leaving the truck cab. Updates feed the
              command deck instantly.
            </p>
            <div className="portal-overview__stats">
              <div>
                <span>Last sync</span>
                <strong>{timeFormatter.format(new Date(lastUpdateIso))}</strong>
                <small>{formatRelativeTime(lastUpdateIso)}</small>
              </div>
              <div>
                <span>Running trucks</span>
                <strong>{runningCount}</strong>
                <small>of {trucks.length} assets</small>
              </div>
              <div>
                <span>Fluid ready</span>
                <strong>{formatGallons(type1TotalLevel + type4TotalLevel)}</strong>
                <small>Type I &amp; IV combined</small>
              </div>
            </div>
          </section>

          <section className="portal-section">
            <header className="portal-section__heading">
              <h2>Deice trucks</h2>
              <p>Adjust fluid loads, fuel reserve, assignments, and heater settings.</p>
            </header>
            <div className="portal-coverflow">
              <button
                type="button"
                className="portal-coverflow__nav is-prev"
                onClick={goToPreviousTruck}
                disabled={trucks.length <= 1}
              >
                <span aria-hidden="true">‹</span>
                <span className="sr-only">Previous truck</span>
              </button>
              <div className="portal-coverflow__viewport">
                {trucks.map((truck, index) => {
                  const type1Percent = percentOf(truck.type1Level, truck.type1Capacity)
                  const type4Percent = percentOf(truck.type4Level, truck.type4Capacity)
                  const fuelPercent = Math.round(truck.fuelPercent)
                  const offset = index - activeTruckIndex
                  const absOffset = Math.abs(offset)
                  const translateX = offset * 32
                  const depth = Math.max(0, 72 - absOffset * 24)
                  const rotation = Math.max(Math.min(offset * -16, 28), -28)
                  const scale = Math.max(0.68, 1 - Math.min(absOffset * 0.08, 0.36))
                  const opacity = Math.max(
                    0.28,
                    1 - Math.min(absOffset * 0.22, 0.72),
                  )
                  const zIndex = 100 - absOffset
                  const isActive = offset === 0

                  const style = {
                    '--offset-x': `${translateX}%`,
                    '--depth': `${depth}px`,
                    '--rotate-y': `${rotation}deg`,
                    '--scale': scale,
                    '--card-opacity': opacity,
                    '--card-index': zIndex,
                  } as CSSProperties

                  return (
                    <article
                      key={truck.id}
                      className={`portal-card glass-card${
                        isActive ? ' is-active' : ''
                      }`}
                      style={style}
                      onMouseEnter={() => setActiveTruckIndex(index)}
                      onFocusCapture={() => setActiveTruckIndex(index)}
                      onClick={() => setActiveTruckIndex(index)}
                    >
                    <header className="portal-card__header">
                      <div>
                        <span className="portal-card__asset">{truck.assetNumber}</span>
                        <h3>{truck.name}</h3>
                        <p>Last update {formatRelativeTime(truck.lastUpdated)}</p>
                      </div>
                      <div className="portal-card__status-controls">
                        <label className="portal-select">
                          <span>Status</span>
                          <select
                            className="portal-input"
                            value={truck.status}
                            onChange={(event) =>
                              updateTruck(truck.id, (current) => ({
                                ...current,
                                status: event.target.value as TruckStatus,
                              }))
                            }
                          >
                            {truckStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          className={`portal-toggle${truck.heaterOn ? ' is-active' : ''}`}
                          onClick={() =>
                            updateTruck(truck.id, (current) => ({
                              ...current,
                              heaterOn: !current.heaterOn,
                            }))
                          }
                        >
                          Heater {truck.heaterOn ? 'On' : 'Off'}
                        </button>
                      </div>
                    </header>

                    <div className="portal-grid">
                      <div className="portal-field">
                        <div className="portal-field__label">
                          <label htmlFor={`type1-level-${truck.id}`}>Type I level</label>
                          <span>{type1Percent}% full</span>
                        </div>
                        <div className="portal-range">
                          <input
                            id={`type1-level-${truck.id}`}
                            type="range"
                            min={0}
                            max={Math.max(truck.type1Capacity, 0)}
                            value={truck.type1Level}
                            onChange={(event) => {
                              const value = Number(event.target.value)
                              updateTruck(truck.id, (current) => {
                                const capped = Math.max(0, Math.min(value, current.type1Capacity))
                                return { ...current, type1Level: capped }
                              })
                            }}
                          />
                          <output>
                            {formatGallons(truck.type1Level)} / {formatGallons(truck.type1Capacity)}
                          </output>
                        </div>
                        <div className="portal-inline-field">
                          <label htmlFor={`type1-capacity-${truck.id}`}>Capacity (gal)</label>
                          <input
                            id={`type1-capacity-${truck.id}`}
                            className="portal-input portal-input--compact"
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={truck.type1Capacity}
                            onChange={(event) => {
                              const raw = Number(event.target.value)
                              const nextValue = Number.isFinite(raw) ? Math.max(0, raw) : 0
                              updateTruck(truck.id, (current) => {
                                const adjustedLevel = Math.min(current.type1Level, nextValue)
                                return { ...current, type1Capacity: nextValue, type1Level: adjustedLevel }
                              })
                            }}
                          />
                        </div>
                        <div className="portal-quick-actions">
                          <button
                            type="button"
                            onClick={() =>
                              updateTruck(truck.id, (current) => ({
                                ...current,
                                type1Level: 0,
                              }))
                            }
                          >
                            Empty
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateTruck(truck.id, (current) => ({
                                ...current,
                                type1Level: current.type1Capacity,
                              }))
                            }
                          >
                            Fill
                          </button>
                        </div>
                      </div>

                      <div className="portal-field">
                        <div className="portal-field__label">
                          <label htmlFor={`type4-level-${truck.id}`}>Type IV level</label>
                          <span>{type4Percent}% full</span>
                        </div>
                        <div className="portal-range">
                          <input
                            id={`type4-level-${truck.id}`}
                            type="range"
                            min={0}
                            max={Math.max(truck.type4Capacity, 0)}
                            value={truck.type4Level}
                            onChange={(event) => {
                              const value = Number(event.target.value)
                              updateTruck(truck.id, (current) => {
                                const capped = Math.max(0, Math.min(value, current.type4Capacity))
                                return { ...current, type4Level: capped }
                              })
                            }}
                          />
                          <output>
                            {formatGallons(truck.type4Level)} / {formatGallons(truck.type4Capacity)}
                          </output>
                        </div>
                        <div className="portal-inline-field">
                          <label htmlFor={`type4-capacity-${truck.id}`}>Capacity (gal)</label>
                          <input
                            id={`type4-capacity-${truck.id}`}
                            className="portal-input portal-input--compact"
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={truck.type4Capacity}
                            onChange={(event) => {
                              const raw = Number(event.target.value)
                              const nextValue = Number.isFinite(raw) ? Math.max(0, raw) : 0
                              updateTruck(truck.id, (current) => {
                                const adjustedLevel = Math.min(current.type4Level, nextValue)
                                return { ...current, type4Capacity: nextValue, type4Level: adjustedLevel }
                              })
                            }}
                          />
                        </div>
                        <div className="portal-quick-actions">
                          <button
                            type="button"
                            onClick={() =>
                              updateTruck(truck.id, (current) => ({
                                ...current,
                                type4Level: 0,
                              }))
                            }
                          >
                            Empty
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateTruck(truck.id, (current) => ({
                                ...current,
                                type4Level: current.type4Capacity,
                              }))
                            }
                          >
                            Fill
                          </button>
                        </div>
                      </div>

                      <div className="portal-field">
                        <div className="portal-field__label">
                          <label htmlFor={`fuel-${truck.id}`}>Fuel reserve</label>
                          <span>{fuelPercent}%</span>
                        </div>
                        <div className="portal-range">
                          <input
                            id={`fuel-${truck.id}`}
                            type="range"
                            min={0}
                            max={100}
                            value={truck.fuelPercent}
                            onChange={(event) => {
                              const value = Number(event.target.value)
                              updateTruck(truck.id, (current) => ({
                                ...current,
                                fuelPercent: Math.max(0, Math.min(100, value)),
                              }))
                            }}
                          />
                          <output>{fuelPercent}%</output>
                        </div>
                        <div className="portal-quick-actions">
                          <button
                            type="button"
                            onClick={() =>
                              updateTruck(truck.id, (current) => ({
                                ...current,
                                fuelPercent: 0,
                              }))
                            }
                          >
                            Empty
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateTruck(truck.id, (current) => ({
                                ...current,
                                fuelPercent: 100,
                              }))
                            }
                          >
                            Full
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="portal-grid portal-grid--info">
                      <div className="portal-field">
                        <label htmlFor={`name-${truck.id}`}>Assignment</label>
                        <input
                          id={`name-${truck.id}`}
                          className="portal-input"
                          value={truck.name}
                          onChange={(event) =>
                            updateTruck(truck.id, (current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="portal-field">
                        <label htmlFor={`location-${truck.id}`}>Location</label>
                        <input
                          id={`location-${truck.id}`}
                          className="portal-input"
                          value={truck.location}
                          onChange={(event) =>
                            updateTruck(truck.id, (current) => ({
                              ...current,
                              location: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="portal-field">
                        <label htmlFor={`asset-${truck.id}`}>Asset tag</label>
                        <input
                          id={`asset-${truck.id}`}
                          className="portal-input"
                          value={truck.assetNumber}
                          onChange={(event) =>
                            updateTruck(truck.id, (current) => ({
                              ...current,
                              assetNumber: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="portal-field">
                      <label htmlFor={`notes-${truck.id}`}>Notes</label>
                      <textarea
                        id={`notes-${truck.id}`}
                        className="portal-textarea"
                        value={truck.notes}
                        onChange={(event) =>
                          updateTruck(truck.id, (current) => ({
                            ...current,
                            notes: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="portal-card__footer">
                      <span>
                        {formatGallons(truck.type1Level + truck.type4Level)} on board · Fuel {fuelPercent}%
                      </span>
                      <button
                        type="button"
                        className="portal-action-button"
                        onClick={() =>
                          updateTruck(truck.id, (current) => ({
                            ...current,
                          }))
                        }
                      >
                        Stamp update
                      </button>
                    </div>
                    </article>
                  )
                })}
              </div>
              <button
                type="button"
                className="portal-coverflow__nav is-next"
                onClick={goToNextTruck}
                disabled={trucks.length <= 1}
              >
                <span aria-hidden="true">›</span>
                <span className="sr-only">Next truck</span>
              </button>
            </div>
          </section>

          <section className="portal-section">
            <header className="portal-section__heading">
              <h2>Bulk tanks</h2>
              <p>Log farm inventory, sample times, and transfer notes.</p>
            </header>
            <div className="portal-coverflow">
              <button
                type="button"
                className="portal-coverflow__nav is-prev"
                onClick={goToPreviousTank}
                disabled={tanks.length <= 1}
              >
                <span aria-hidden="true">‹</span>
                <span className="sr-only">Previous tank</span>
              </button>
              <div className="portal-coverflow__viewport">
                {tanks.map((tank, index) => {
                  const percent = percentOf(tank.level, tank.capacity)
                  const offset = index - activeTankIndex
                  const absOffset = Math.abs(offset)
                  const translateX = offset * 32
                  const depth = Math.max(0, 68 - absOffset * 24)
                  const rotation = Math.max(Math.min(offset * -16, 28), -28)
                  const scale = Math.max(0.7, 1 - Math.min(absOffset * 0.08, 0.36))
                  const opacity = Math.max(
                    0.28,
                    1 - Math.min(absOffset * 0.22, 0.72),
                  )
                  const zIndex = 100 - absOffset
                  const isActive = offset === 0
                  const typeColorClass =
                    tank.fluidType === 'Type I' ? ' is-type-one' : ' is-type-four'

                  const style = {
                    '--offset-x': `${translateX}%`,
                    '--depth': `${depth}px`,
                    '--rotate-y': `${rotation}deg`,
                    '--scale': scale,
                    '--card-opacity': opacity,
                    '--card-index': zIndex,
                  } as CSSProperties

                  return (
                    <article
                      key={tank.id}
                      className={`portal-card glass-card${typeColorClass}${
                        isActive ? ' is-active' : ''
                      }`}
                      style={style}
                      onMouseEnter={() => setActiveTankIndex(index)}
                      onFocusCapture={() => setActiveTankIndex(index)}
                      onClick={() => setActiveTankIndex(index)}
                    >
                    <header className="portal-card__header">
                      <div>
                        <span className="portal-card__asset">{tank.fluidType}</span>
                        <h3>{tank.name}</h3>
                        <p>Last sampled {formatRelativeTime(tank.lastSampled)}</p>
                      </div>
                      <button
                        type="button"
                        className="portal-action-button"
                        onClick={() =>
                          updateTank(tank.id, (current) => ({
                            ...current,
                          }))
                        }
                      >
                        Stamp sample
                      </button>
                    </header>

                    <div className="portal-grid">
                      <div className="portal-field">
                        <label htmlFor={`tank-name-${tank.id}`}>Tank name</label>
                        <input
                          id={`tank-name-${tank.id}`}
                          className="portal-input"
                          value={tank.name}
                          onChange={(event) =>
                            updateTank(tank.id, (current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="portal-field">
                        <label htmlFor={`tank-location-${tank.id}`}>Location</label>
                        <input
                          id={`tank-location-${tank.id}`}
                          className="portal-input"
                          value={tank.location}
                          onChange={(event) =>
                            updateTank(tank.id, (current) => ({
                              ...current,
                              location: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="portal-field">
                        <label htmlFor={`tank-fluid-${tank.id}`}>Fluid type</label>
                        <select
                          id={`tank-fluid-${tank.id}`}
                          className="portal-input"
                          value={tank.fluidType}
                          onChange={(event) =>
                            updateTank(tank.id, (current) => ({
                              ...current,
                              fluidType: event.target.value as BulkTank['fluidType'],
                            }))
                          }
                        >
                          {fluidTypeOptions.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="portal-field">
                      <div className="portal-field__label">
                        <label htmlFor={`tank-level-${tank.id}`}>Inventory level</label>
                        <span>{percent}% full</span>
                      </div>
                      <div className="portal-range">
                        <input
                          id={`tank-level-${tank.id}`}
                          type="range"
                          min={0}
                          max={Math.max(tank.capacity, 0)}
                          value={tank.level}
                          onChange={(event) => {
                            const value = Number(event.target.value)
                            updateTank(tank.id, (current) => {
                              const capped = Math.max(0, Math.min(value, current.capacity))
                              return { ...current, level: capped }
                            })
                          }}
                        />
                        <output>
                          {formatGallons(tank.level)} / {formatGallons(tank.capacity)}
                        </output>
                      </div>
                      <div className="portal-inline-field">
                        <label htmlFor={`tank-capacity-${tank.id}`}>Capacity (gal)</label>
                        <input
                          id={`tank-capacity-${tank.id}`}
                          className="portal-input portal-input--compact"
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={tank.capacity}
                          onChange={(event) => {
                            const raw = Number(event.target.value)
                            const nextValue = Number.isFinite(raw) ? Math.max(0, raw) : 0
                            updateTank(tank.id, (current) => {
                              const adjustedLevel = Math.min(current.level, nextValue)
                              return { ...current, capacity: nextValue, level: adjustedLevel }
                            })
                          }}
                        />
                      </div>
                      <div className="portal-quick-actions">
                        <button
                          type="button"
                          onClick={() =>
                            updateTank(tank.id, (current) => ({
                              ...current,
                              level: 0,
                            }))
                          }
                        >
                          Empty
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateTank(tank.id, (current) => ({
                              ...current,
                              level: current.capacity,
                            }))
                          }
                        >
                          Fill
                        </button>
                      </div>
                    </div>

                    <div className="portal-field">
                      <label htmlFor={`tank-notes-${tank.id}`}>Notes</label>
                      <textarea
                        id={`tank-notes-${tank.id}`}
                        className="portal-textarea"
                        value={tank.notes}
                        onChange={(event) =>
                          updateTank(tank.id, (current) => ({
                            ...current,
                            notes: event.target.value,
                          }))
                        }
                      />
                    </div>
                    </article>
                  )
                })}
              </div>
              <button
                type="button"
                className="portal-coverflow__nav is-next"
                onClick={goToNextTank}
                disabled={tanks.length <= 1}
              >
                <span aria-hidden="true">›</span>
                <span className="sr-only">Next tank</span>
              </button>
            </div>
          </section>
        </main>
      )}
    </div>
  )
}

export default App
