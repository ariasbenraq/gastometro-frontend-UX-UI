import { useEffect, useMemo, useState } from 'react';
import { fetchDashboardSummary } from '../../api/dashboardApi';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatDate } from '../../utils/formatters';

const fallbackDashboardData = {
  totals: {
    totalIngresos: 25000,
    totalGastos: 12500,
    totalMovilidades: 48,
    balance: 12500,
  },
  latestGastos: [
    {
      id: 'mov-1001',
      categoria: 'Combustible',
      descripcion: 'Carga semanal',
      monto: 48.5,
      fecha: '2024-06-02',
    },
    {
      id: 'mov-1002',
      categoria: 'Peajes',
      descripcion: 'Ruta Interurbana',
      monto: 12.75,
      fecha: '2024-06-01',
    },
    {
      id: 'mov-1003',
      categoria: 'Mantenimiento',
      descripcion: 'Cambio de aceite',
      monto: 90.0,
      fecha: '2024-05-29',
    },
  ],
  topDistritos: [
    { distrito: 'Miraflores', monto: 4200 },
    { distrito: 'San Isidro', monto: 3800 },
    { distrito: 'Barranco', monto: 2900 },
  ],
  gastosByMonth: [
    { mes: 'Ene', monto: 950 },
    { mes: 'Feb', monto: 1200 },
    { mes: 'Mar', monto: 860 },
    { mes: 'Abr', monto: 1460 },
    { mes: 'May', monto: 1320 },
    { mes: 'Jun', monto: 980 },
  ],
};

export default function Dashboard({ onNavigate }) {
  const { logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(fallbackDashboardData);
  const [dashboardStatus, setDashboardStatus] = useState({
    type: '',
    message: '',
  });
  const [dashboardFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    topLimit: 3,
    latestLimit: 3,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      setDashboardStatus({ type: '', message: '' });
      try {
        const data = await fetchDashboardSummary(dashboardFilters);
        setDashboardData(data);
      } catch (error) {
        setDashboardStatus({
          type: 'warning',
          message:
            error?.message ||
            'No fue posible cargar el tablero, mostramos datos de ejemplo.',
        });
        setDashboardData(fallbackDashboardData);
      }
    };

    fetchDashboard();
  }, [dashboardFilters]);

  const maxGastosValue = useMemo(
    () =>
      Math.max(
        ...dashboardData.gastosByMonth.map((item) => item.monto),
        1,
      ),
    [dashboardData.gastosByMonth],
  );

  return (
    <section className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Bienvenido</p>
          <h1 className="dashboard-title">Tablero</h1>
        </div>
        <div className="dashboard-actions">
          <button className="btn-secondary" type="button" onClick={logout}>
            Cerrar sesión
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => onNavigate('login')}
          >
            Volver a acceso
          </button>
        </div>
      </header>

      <div className="dashboard-filters">
        <div className="filter-field">
          <span className="filter-label">Año</span>
          <span className="filter-value">{dashboardFilters.year}</span>
        </div>
        <div className="filter-field">
          <span className="filter-label">Mes</span>
          <span className="filter-value">{dashboardFilters.month}</span>
        </div>
        <div className="filter-field">
          <span className="filter-label">Top</span>
          <span className="filter-value">
            {dashboardFilters.topLimit} distritos
          </span>
        </div>
        <div className="filter-field">
          <span className="filter-label">Últimos</span>
          <span className="filter-value">
            {dashboardFilters.latestLimit} gastos
          </span>
        </div>
      </div>

      {dashboardStatus.message ? (
        <div
          className={
            dashboardStatus.type === 'error' ? 'alert-error' : 'alert-warning'
          }
          role="alert"
        >
          {dashboardStatus.message}
        </div>
      ) : null}

      <section className="dashboard-cards">
        <article className="metric-card">
          <p>Ingresos</p>
          <h2>{formatCurrency(dashboardData.totals.totalIngresos)}</h2>
        </article>
        <article className="metric-card">
          <p>Gastos</p>
          <h2>{formatCurrency(dashboardData.totals.totalGastos)}</h2>
        </article>
        <article className="metric-card">
          <p>Movilidades</p>
          <h2>{dashboardData.totals.totalMovilidades}</h2>
        </article>
        <article className="metric-card highlight">
          <p>Balance</p>
          <h2>{formatCurrency(dashboardData.totals.balance)}</h2>
        </article>
      </section>

      <section className="dashboard-chart card">
        <div className="chart-header">
          <div>
            <h3>Gastos por mes</h3>
            <p>Registro de movilidades</p>
          </div>
          <span className="chart-total">
            {formatCurrency(
              dashboardData.gastosByMonth.reduce(
                (sum, item) => sum + item.monto,
                0,
              ),
            )}
          </span>
        </div>
        <div className="chart-bars">
          {dashboardData.gastosByMonth.map((item) => (
            <div key={item.mes} className="chart-bar">
              <span
                style={{ height: `${(item.monto / maxGastosValue) * 100}%` }}
              />
              <small>{item.mes}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="card dashboard-panel">
          <div className="panel-header">
            <h3>Últimos gastos</h3>
            <span>Movilidades</span>
          </div>
          <ul className="panel-list">
            {dashboardData.latestGastos.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.categoria}</strong>
                  <span>{item.descripcion}</span>
                </div>
                <div className="panel-meta">
                  <strong>{formatCurrency(item.monto)}</strong>
                  <small>{formatDate(item.fecha)}</small>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="card dashboard-panel">
          <div className="panel-header">
            <h3>Top distritos</h3>
            <span>Ranking mensual</span>
          </div>
          <ul className="panel-list">
            {dashboardData.topDistritos.map((item, index) => (
              <li key={item.distrito}>
                <div className="district">
                  <span className="district-rank">{index + 1}</span>
                  <strong>{item.distrito}</strong>
                </div>
                <strong>{formatCurrency(item.monto)}</strong>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </section>
  );
}
