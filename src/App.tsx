import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import './App.css'
import { inventoryItems } from './data/inventory'
import type { InventoryItem, InventoryStatus } from './data/inventory'

type StatusFilter = 'All' | InventoryStatus

const statusOptions: StatusFilter[] = ['All', 'Operational', 'Monitoring', 'Offline']

const formatRelativeTime = (isoString: string) => {
  const target = new Date(isoString)
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()
  const diffMinutes = Math.round(Math.abs(diffMs) / 60000)

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (diffMinutes < 60) {
    const value = Math.round(diffMs / 60000)
    return formatter.format(value, 'minute')
  }

  const diffHours = Math.round(diffMs / 3600000)
  if (Math.abs(diffHours) < 48) {
    return formatter.format(diffHours, 'hour')
  }

  const diffDays = Math.round(diffMs / 86400000)
  return formatter.format(diffDays, 'day')
}

const formatDate = (isoString: string) => {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(isoString))
}

const describeHealth = (value: number) => {
  if (value >= 90) return 'Excellent stability'
  if (value >= 75) return 'Within watch range'
  if (value >= 50) return 'Needs follow-up'
  return 'Critical attention'
}

const activityTotal = (item: InventoryItem) =>
  item.activity.reduce((sum, snapshot) => sum + snapshot.value, 0)

function App() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [locationFilter, setLocationFilter] = useState<string>('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [focusCritical, setFocusCritical] = useState(false)
  const [selectedId, setSelectedId] = useState<string>(inventoryItems[0]?.id ?? '')

  const totals = useMemo(() => {
    const total = inventoryItems.length
    const operational = inventoryItems.filter((item) => item.status === 'Operational').length
    const monitoring = inventoryItems.filter((item) => item.status === 'Monitoring').length
    const offline = inventoryItems.filter((item) => item.status === 'Offline').length
    const critical = inventoryItems.filter((item) => item.critical || item.status === 'Offline').length
    const avgHealth =
      total === 0
        ? 0
        : Math.round(
            inventoryItems.reduce((sum, item) => sum + item.health, 0) / total,
          )

    return {
      total,
      operational,
      monitoring,
      offline,
      critical,
      avgHealth,
      operationalRatio: total === 0 ? 0 : Math.round((operational / total) * 100),
    }
  }, [])

  const locations = useMemo(() => {
    const set = new Set<string>()
    inventoryItems.forEach((item) => set.add(item.location))
    return ['All', ...Array.from(set).sort()]
  }, [])

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return inventoryItems.filter((item) => {
      if (statusFilter !== 'All' && item.status !== statusFilter) {
        return false
      }

      if (locationFilter !== 'All' && item.location !== locationFilter) {
        return false
      }

      if (focusCritical && !item.critical && item.status !== 'Offline') {
        return false
      }

      if (query) {
        const haystack = `${item.id} ${item.name} ${item.category} ${item.location}`.toLowerCase()
        if (!haystack.includes(query)) {
          return false
        }
      }

      return true
    })
  }, [statusFilter, locationFilter, searchTerm, focusCritical])

  useEffect(() => {
    if (!filteredItems.some((item) => item.id === selectedId)) {
      const fallback = filteredItems[0]?.id ?? inventoryItems[0]?.id ?? ''
      setSelectedId(fallback)
    }
  }, [filteredItems, selectedId])

  const selectedItem = useMemo(() => {
    return inventoryItems.find((item) => item.id === selectedId) ?? filteredItems[0] ?? null
  }, [selectedId, filteredItems])

  const totalActivity = selectedItem ? activityTotal(selectedItem) : 0

  const upcomingMaintenance = useMemo(() => {
    return [...inventoryItems]
      .sort(
        (a, b) => new Date(a.nextMaintenance).getTime() - new Date(b.nextMaintenance).getTime(),
      )
      .slice(0, 4)
  }, [])

  const locationPulse = useMemo(() => {
    const summary = new Map<
      string,
      { operational: number; monitoring: number; offline: number; total: number }
    >()

    inventoryItems.forEach((item) => {
      const current = summary.get(item.location) ?? {
        operational: 0,
        monitoring: 0,
        offline: 0,
        total: 0,
      }

      if (item.status === 'Operational') current.operational += 1
      if (item.status === 'Monitoring') current.monitoring += 1
      if (item.status === 'Offline') current.offline += 1
      current.total += 1

      summary.set(item.location, current)
    })

    return Array.from(summary.entries())
      .map(([location, counts]) => ({ location, ...counts }))
      .sort((a, b) => b.total - a.total)
  }, [])

  const readyShare = totals.total === 0 ? 0 : Math.round((totals.operational / totals.total) * 100)
  const offlineShare = totals.total === 0 ? 0 : Math.round((totals.offline / totals.total) * 100)

  const radialStyle = useMemo(
    () =>
      ({
        '--progress': `${readyShare}%`,
      }) as CSSProperties,
    [readyShare],
  )

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__intro">
          <p className="hero__eyebrow">Ground Systems Command</p>
          <h1>Bird&apos;s-eye Fleet Inventory</h1>
          <p className="hero__description">
            Monitor the entire ground support equipment stack in one sweep. Track operational
            readiness, pinpoint outages, and queue maintenance teams without leaving this screen.
          </p>
          <div className="hero__badges">
            <span className="badge badge--accent">{totals.operational} ready assets</span>
            <span className="badge badge--muted">{totals.offline} offline</span>
            <span className="badge badge--muted">{totals.monitoring} on watch</span>
          </div>
        </div>
        <div className="hero__panel">
          <div className="radial-progress" style={radialStyle}>
            <div className="radial-progress__inner">
              <span className="radial-progress__label">Operational</span>
              <strong>{readyShare}%</strong>
              <span className="radial-progress__hint">fleet readiness</span>
            </div>
          </div>
          <div className="hero__panel-metrics">
            <div>
              <span>Average health</span>
              <strong>{totals.avgHealth}%</strong>
            </div>
            <div>
              <span>Critical watches</span>
              <strong>{totals.critical}</strong>
            </div>
            <div>
              <span>Offline share</span>
              <strong>{offlineShare}%</strong>
            </div>
          </div>
        </div>
      </header>

      <section className="overview-grid">
        <article className="glass-card">
          <header className="glass-card__header">
            <h2>Mission pulse</h2>
            <p>Live signal of what&apos;s humming and what needs intervention right now.</p>
          </header>
          <div className="pulse-grid">
            <div className="pulse-stat">
              <span>Operational</span>
              <strong>{totals.operational}</strong>
              <small>{readyShare}% of fleet</small>
            </div>
            <div className="pulse-stat">
              <span>Monitoring</span>
              <strong>{totals.monitoring}</strong>
              <small>heightened observation</small>
            </div>
            <div className="pulse-stat">
              <span>Offline</span>
              <strong>{totals.offline}</strong>
              <small>awaiting action</small>
            </div>
            <div className="pulse-stat">
              <span>Avg. Health</span>
              <strong>{totals.avgHealth}%</strong>
              <small>{describeHealth(totals.avgHealth)}</small>
            </div>
          </div>
        </article>

        <article className="glass-card">
          <header className="glass-card__header">
            <h2>Location signal map</h2>
            <p>Swipe through the pads and hangars to see where issues cluster.</p>
          </header>
          <div className="location-grid">
            {locationPulse.map((location) => {
              const ready = location.total === 0 ? 0 : Math.round((location.operational / location.total) * 100)
              return (
                <div className="location-row" key={location.location}>
                  <div className="location-row__meta">
                    <strong>{location.location}</strong>
                    <span>{location.total} assets</span>
                  </div>
                  <div className="location-row__bar">
                    <span
                      className="location-row__segment location-row__segment--operational"
                      style={{ flexGrow: location.operational || 0 }}
                    />
                    <span
                      className="location-row__segment location-row__segment--monitoring"
                      style={{ flexGrow: location.monitoring || 0 }}
                    />
                    <span
                      className="location-row__segment location-row__segment--offline"
                      style={{ flexGrow: location.offline || 0 }}
                    />
                  </div>
                  <div className="location-row__badge">{ready}% ready</div>
                </div>
              )
            })}
          </div>
        </article>

        <article className="glass-card">
          <header className="glass-card__header">
            <h2>Next maintenance windows</h2>
            <p>Keep crews ahead of the wrench-turning curve.</p>
          </header>
          <ul className="maintenance-list">
            {upcomingMaintenance.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.category}</span>
                </div>
                <div className="maintenance-list__date">
                  <span>{formatDate(item.nextMaintenance)}</span>
                  <small>{formatRelativeTime(item.nextMaintenance)}</small>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="inventory-grid">
        <article className="inventory-panel glass-card">
          <header className="inventory-panel__header">
            <div>
              <h2>Asset inventory</h2>
              <p>Filter, search, and click to deep dive any support system.</p>
            </div>
            <div className="inventory-panel__controls">
              <div className="input-group">
                <span className="input-group__label">Search</span>
                <input
                  type="search"
                  placeholder="Search by name, id, or location"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="input-row">
                <label className="select">
                  <span>Status</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="select">
                  <span>Location</span>
                  <select
                    value={locationFilter}
                    onChange={(event) => setLocationFilter(event.target.value)}
                  >
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={focusCritical}
                    onChange={(event) => setFocusCritical(event.target.checked)}
                  />
                  <span>Critical focus</span>
                </label>
              </div>
            </div>
          </header>
          <div className="inventory-list">
            {filteredItems.length === 0 ? (
              <div className="empty-state">
                <h3>No assets match that view.</h3>
                <p>Try clearing filters or adjusting your search query.</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`inventory-row${selectedId === item.id ? ' is-active' : ''}`}
                >
                  <div className="inventory-row__header">
                    <div>
                      <p className="inventory-row__title">{item.name}</p>
                      <p className="inventory-row__meta">
                        #{item.id} · {item.category}
                      </p>
                    </div>
                    <span className={`status-pill status-pill--${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="inventory-row__body">
                    <span>{item.location}</span>
                    <span>Health {item.health}%</span>
                    <span>Last check {formatRelativeTime(item.lastChecked)}</span>
                  </div>
                  {item.critical && <span className="inventory-row__flag">Flagged</span>}
                </button>
              ))
            )}
          </div>
        </article>

        <aside className="detail-panel glass-card">
          {selectedItem ? (
            <>
              <header className="detail-panel__header">
                <span className="badge badge--outline">Focused asset</span>
                <h2>{selectedItem.name}</h2>
                <p>
                  #{selectedItem.id} · {selectedItem.category} · {selectedItem.location}
                </p>
              </header>
              <div className="detail-panel__metrics">
                <div>
                  <span>Status</span>
                  <span className={`status-pill status-pill--${selectedItem.status.toLowerCase()}`}>
                    {selectedItem.status}
                  </span>
                </div>
                <div>
                  <span>System health</span>
                  <strong>{selectedItem.health}%</strong>
                  <small>{describeHealth(selectedItem.health)}</small>
                </div>
                <div>
                  <span>Owner</span>
                  <strong>{selectedItem.owner}</strong>
                </div>
                <div>
                  <span>Activity this cycle</span>
                  <strong>{totalActivity}</strong>
                  <small>combined operations</small>
                </div>
              </div>
              <div className="detail-panel__notes">
                <h3>Operator notes</h3>
                <p>{selectedItem.notes}</p>
              </div>
              <div className="detail-panel__activity">
                <h3>Utilization mix</h3>
                <ul>
                  {selectedItem.activity.map((snapshot) => (
                    <li key={snapshot.label}>
                      <span>{snapshot.label}</span>
                      <div className="activity-bar">
                        <div
                          className="activity-bar__fill"
                          style={{
                            width: `${totalActivity === 0 ? 0 : Math.min(100, (snapshot.value / totalActivity) * 100)}%`,
                          }}
                        />
                      </div>
                      <span>{snapshot.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="detail-panel__issues">
                <h3>Issue timeline</h3>
                <ul>
                  {selectedItem.issues.map((issue) => (
                    <li key={`${issue.title}-${issue.timestamp}`}>
                      <div>
                        <strong>{issue.title}</strong>
                        <span>{issue.impact} impact</span>
                      </div>
                      <div>
                        <span>{formatDate(issue.timestamp)}</span>
                        <small>{formatRelativeTime(issue.timestamp)}</small>
                      </div>
                      <span className={`acknowledge-tag${issue.acknowledged ? ' is-acknowledged' : ''}`}>
                        {issue.acknowledged ? 'Acknowledged' : 'Unacknowledged'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <footer className="detail-panel__footer">
                <div>
                  <span>Next maintenance window</span>
                  <strong>{formatDate(selectedItem.nextMaintenance)}</strong>
                  <small>{formatRelativeTime(selectedItem.nextMaintenance)}</small>
                </div>
                <button type="button" className="cta-button">
                  Launch service checklist
                </button>
              </footer>
            </>
          ) : (
            <div className="empty-state">
              <h3>Select an asset to see its telemetry.</h3>
              <p>The detail panel updates live as you move through the fleet.</p>
            </div>
          )}
        </aside>
      </section>
    </div>
  )
}

export default App
