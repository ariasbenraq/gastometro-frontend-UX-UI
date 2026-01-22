import { useEffect, useMemo, useState } from 'react';
import { fetchDashboardSummary } from '../../api/dashboardApi';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatters';

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

const MONTH_OPTIONS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

const buildYearOptions = (currentYear) =>
  Array.from({ length: 7 }, (_, index) => currentYear - 3 + index);

export default function Dashboard() {
  const { logout, user } = useAuth();
  const [dashboardData, setDashboardData] = useState(fallbackDashboardData);
  const [dashboardStatus, setDashboardStatus] = useState({
    type: '',
    message: '',
  });
  const [dashboardFilters, setDashboardFilters] = useState(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      topLimit: 3,
      latestLimit: 3,
    };
  });

  const userLabel =
    user?.nombre_apellido || user?.usuario || user?.email || 'Usuario actual';

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

  const yearOptions = useMemo(
    () => buildYearOptions(new Date().getFullYear()),
    [],
  );

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setDashboardFilters((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  return (
    <section className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Bienvenido</p>
          <h1 className="dashboard-title">Tablero</h1>
        </div>
      </header>

      <div className="dashboard-filters">
        <div className="filter-card">
          <div className="filter-header">
            <span className="filter-label">Periodo</span>
            <span className="filter-value">
              {dashboardFilters.year} ·{' '}
              {
                MONTH_OPTIONS.find(
                  (option) => option.value === dashboardFilters.month,
                )?.label
              }
            </span>
          </div>
          <div className="filter-controls">
            <label className="filter-control">
              <span>Año</span>
              <select
                name="year"
                value={dashboardFilters.year}
                onChange={handleFilterChange}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label className="filter-control">
              <span>Mes</span>
              <select
                name="month"
                value={dashboardFilters.month}
                onChange={handleFilterChange}
              >
                {MONTH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
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
          <span className="metric-user">Usuario: {userLabel}</span>
        </article>
        <article className="metric-card">
          <p>Gastos</p>
          <h2>{formatCurrency(dashboardData.totals.totalGastos)}</h2>
          <span className="metric-user">Usuario: {userLabel}</span>
        </article>
        <article className="metric-card">
          <p>Movilidades</p>
          <h2>{dashboardData.totals.totalMovilidades}</h2>
          <span className="metric-user">Usuario: {userLabel}</span>
        </article>
        <article className="metric-card highlight">
          <p>Balance</p>
          <h2>{formatCurrency(dashboardData.totals.balance)}</h2>
          <span className="metric-user">Usuario: {userLabel}</span>
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

      <footer className="dashboard-footer">
        <button className="btn-secondary" type="button" onClick={logout}>
          Cerrar sesión
        </button>
      </footer>
    </section>
  );
}
