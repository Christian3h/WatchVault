import { useState } from 'react';
import styles from './StatisticsPanel.module.css';

function StatisticsPanel({ stats, loading, error }) {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3>Estadísticas</h3>
          <button className={styles.toggleButton} disabled>
            ...
          </button>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3>Estadísticas</h3>
          <button className={styles.toggleButton} disabled>
            ...
          </button>
        </div>
        <div className={styles.error}>
          <p>Error al cargar estadísticas</p>
          <small>{error}</small>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalVideos === 0) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3>Estadísticas</h3>
          <button 
            className={styles.toggleButton}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? '−' : '+'}
          </button>
        </div>
        
        {expanded && (
          <div className={styles.content}>
            <div className={styles.emptyState}>
              <p>Aún no hay videos vistos</p>
              <small>Marca algunos videos como vistos para ver estadísticas</small>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Calcular porcentaje para barras de actividad semanal
  const maxWeeklyCount = Math.max(...stats.weeklyActivity.map(d => d.count), 1);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>📊 Estadísticas</h3>
        <button 
          className={styles.toggleButton}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label={expanded ? "Contraer estadísticas" : "Expandir estadísticas"}
        >
          {expanded ? '−' : '+'}
        </button>
      </div>
      
      {expanded && (
        <div className={styles.content}>
          {/* Resumen rápido */}
          <div className={styles.quickStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>TOTAL</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.totalVideos}</div>
                <div className={styles.statLabel}>Videos</div>
                {stats.totalWatchTime > 0 && (
                  <div className={styles.statSubtext}>
                    {stats.totalWatchTime}
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>HOY</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.videosToday}</div>
                <div className={styles.statLabel}>Videos</div>
                {stats.todayWatchTime > 0 && (
                  <div className={styles.statSubtext}>
                    {stats.todayWatchTime}
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>SEM</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.videosThisWeek}</div>
                <div className={styles.statLabel}>Videos</div>
                {stats.weekWatchTime > 0 && (
                  <div className={styles.statSubtext}>
                    {stats.weekWatchTime}
                  </div>
                )}
              </div>
            </div>
            
            {stats.streak > 0 && (
              <div className={styles.statCard}>
                <div className={styles.statIcon}>RACHA</div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{stats.streak}</div>
                  <div className={styles.statLabel}>Días</div>
                </div>
              </div>
            )}
          </div>

          {/* Top canales */}
          {stats.topChannels.length > 0 && (
            <div className={styles.section}>
              <h4>Canales más vistos</h4>
              <div className={styles.channelsList}>
                {stats.topChannels.map((channel, index) => (
                  <div key={channel.name} className={styles.channelItem}>
                    <div className={styles.channelRank}>{index + 1}</div>
                    <div className={styles.channelInfo}>
                      <div className={styles.channelName}>{channel.name}</div>
                      <div className={styles.channelCount}>
                        {channel.count} video{channel.count !== 1 ? 's' : ''}
                        {channel.watchTime && ` • ${channel.watchTime}`}
                      </div>
                    </div>
                    <div className={styles.channelBar}>
                      <div 
                        className={styles.channelBarFill}
                        style={{ 
                          width: `${(channel.count / stats.totalVideos) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actividad semanal */}
          <div className={styles.section}>
            <h4>Actividad semanal</h4>
            <div className={styles.weeklyChart}>
              {stats.weeklyActivity.map(day => (
                <div key={day.day} className={styles.weekDay}>
                  <div className={styles.dayLabel}>{day.day}</div>
                  <div className={styles.dayBar}>
                    <div 
                      className={styles.dayBarFill}
                      style={{ 
                        height: `${(day.count / maxWeeklyCount) * 100}%` 
                      }}
                    />
                  </div>
                  <div className={styles.dayCount}>{day.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Última actividad */}
          {stats.lastActive && (
            <div className={styles.footer}>
              <small>
                Última actividad: {new Date(stats.lastActive).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </small>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StatisticsPanel;