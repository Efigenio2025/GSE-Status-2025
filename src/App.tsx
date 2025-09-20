import './App.css'
import { bulkTanks, deiceTrucks } from './data/inventory'

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

function App() {
  const runningCount = deiceTrucks.filter((truck) => truck.status === 'Running').length
  const heaterCount = deiceTrucks.filter((truck) => truck.heaterOn).length
  const avgFuel =
    deiceTrucks.length === 0
      ? 0
      : Math.round(
          deiceTrucks.reduce((sum, truck) => sum + truck.fuelPercent, 0) / deiceTrucks.length,
        )

  const type1TruckCapacity = deiceTrucks.reduce((sum, truck) => sum + truck.type1Capacity, 0)
  const type1TruckLevel = deiceTrucks.reduce((sum, truck) => sum + truck.type1Level, 0)
  const type4TruckCapacity = deiceTrucks.reduce((sum, truck) => sum + truck.type4Capacity, 0)
  const type4TruckLevel = deiceTrucks.reduce((sum, truck) => sum + truck.type4Level, 0)

  const type1BulkCapacity = bulkTanks
    .filter((tank) => tank.fluidType === 'Type I')
    .reduce((sum, tank) => sum + tank.capacity, 0)
  const type1BulkLevel = bulkTanks
    .filter((tank) => tank.fluidType === 'Type I')
    .reduce((sum, tank) => sum + tank.level, 0)

  const type4BulkCapacity = bulkTanks
    .filter((tank) => tank.fluidType === 'Type IV')
    .reduce((sum, tank) => sum + tank.capacity, 0)
  const type4BulkLevel = bulkTanks
    .filter((tank) => tank.fluidType === 'Type IV')
    .reduce((sum, tank) => sum + tank.level, 0)

  const type1TotalCapacity = type1TruckCapacity + type1BulkCapacity
  const type4TotalCapacity = type4TruckCapacity + type4BulkCapacity

  const type1TotalLevel = type1TruckLevel + type1BulkLevel
  const type4TotalLevel = type4TruckLevel + type4BulkLevel

  const lowType1Trucks = deiceTrucks.filter(
    (truck) => percentOf(truck.type1Level, truck.type1Capacity) <= 40,
  ).length
  const lowType4Trucks = deiceTrucks.filter(
    (truck) => percentOf(truck.type4Level, truck.type4Capacity) <= 40,
  ).length

  const updateTimes = [
    ...deiceTrucks.map((truck) => new Date(truck.lastUpdated).getTime()),
    ...bulkTanks.map((tank) => new Date(tank.lastSampled).getTime()),
  ]
  const lastUpdate = updateTimes.length ? new Date(Math.max(...updateTimes)) : null

  const lastUpdateIso = lastUpdate?.toISOString() ?? new Date().toISOString()

  return (
    <div className="app-shell">
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
              <small>of {deiceTrucks.length} assets</small>
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
              <small>{deiceTrucks.length - heaterCount} on standby</small>
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
            {deiceTrucks.map((truck) => {
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
            {bulkTanks.map((tank) => {
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
    </div>
  )
}

export default App
