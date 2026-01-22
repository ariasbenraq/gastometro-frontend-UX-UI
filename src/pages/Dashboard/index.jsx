import { useEffect, useMemo, useState } from 'react';
import { fetchBalanceTotals } from '../../api/balanceApi';
import { fetchDashboardSummary } from '../../api/dashboardApi';
import { fetchUsuarios } from '../../api/usuariosApi';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatDate } from '../../utils/formatters';

const fallbackDashboardData = {
  totals: {
    totalIngresos: 25000,
    totalGastos: 12500,
    totalMovilidades: 48,
    balance: 12500,
  },
  latestMovilidades: [
    {
      id: 'mov-1001',
      fecha: '2024-06-02',
      motivo: 'Combustible',
      detalle: 'Carga semanal',
      monto: 48.5,
    },
    {
      id: 'mov-1002',
      fecha: '2024-06-01',
      motivo: 'Peajes',
      detalle: 'Ruta Interurbana',
      monto: 12.75,
    },
    {
      id: 'mov-1003',
      fecha: '2024-05-29',
      motivo: 'Mantenimiento',
      detalle: 'Cambio de aceite',
      monto: 90.0,
    },
  ],
  topDistritos: [
    { id: 1, nombre: 'Miraflores', total: 4200 },
    { id: 2, nombre: 'San Isidro', total: 3800 },
    { id: 3, nombre: 'Barranco', total: 2900 },
  ],
  movilidadesByMonth: [
    { month: 1, total: 950 },
    { month: 2, total: 1200 },
    { month: 3, total: 860 },
    { month: 4, total: 1460 },
    { month: 5, total: 1320 },
    { month: 6, total: 980 },
    { month: 7, total: 1110 },
    { month: 8, total: 1050 },
    { month: 9, total: 990 },
    { month: 10, total: 1370 },
    { month: 11, total: 910 },
    { month: 12, total: 1180 },
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

const MONTH_LABELS = MONTH_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const buildYearOptions = (currentYear) =>
  Array.from({ length: 7 }, (_, index) => currentYear - 3 + index);

export default function Dashboard() {
  const { logout, user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.role === 'ADMIN';
  const [dashboardData, setDashboardData] = useState(fallbackDashboardData);
  const [dashboardStatus, setDashboardStatus] = useState({
    type: '',
    message: '',
  });
  const [users, setUsers] = useState([]);
  const [dashboardFilters, setDashboardFilters] = useState(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      topLimit: 3,
      latestLimit: 5,
      userId: '',
    };
  });

  const userLabel =
    user?.nombre_apellido || user?.usuario || user?.email || 'Usuario actual';
  const userId = user?.id || user?.usuario || user?.email || '';

  useEffect(() => {
    setDashboardFilters((prev) => {
      if (isAdmin) {
        if (prev.userId === '') {
          return prev;
        }
        return {
          ...prev,
          userId: '',
        };
      }

      if (prev.userId === userId) {
        return prev;
      }

      return {
        ...prev,
        userId,
      };
    });
  }, [isAdmin, userId]);

  useEffect(() => {
    if (!isAdmin) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        const data = await fetchUsuarios();
        const list = Array.isArray(data) ? data : data?.data || [];
        setUsers(list);
      } catch (error) {
        setDashboardStatus({
          type: 'warning',
          message:
            error?.message ||
            'No fue posible cargar los usuarios, mostramos solo Global.',
        });
        setUsers([]);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setDashboardStatus({ type: '', message: '' });
      const userIdParam = isAdmin ? dashboardFilters.userId || undefined : undefined;

      try {
        const [totals, summary, summaryByYear] = await Promise.all([
          fetchBalanceTotals({ userId: userIdParam }),
          fetchDashboardSummary({
            year: dashboardFilters.year,
            month: dashboardFilters.month,
            topLimit: dashboardFilters.topLimit,
            latestLimit: dashboardFilters.latestLimit,
            userId: userIdParam,
          }),
          fetchDashboardSummary({
            year: dashboardFilters.year,
            userId: userIdParam,
          }),
        ]);

        setDashboardData({
          totals,
          latestMovilidades: summary?.latestMovilidades || [],
          topDistritos: summary?.topDistritos || [],
          movilidadesByMonth: summaryByYear?.movilidadesByMonth || [],
        });
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
  }, [dashboardFilters, isAdmin]);

  const filteredMovilidades = useMemo(() => {
    const monthPivot = dashboardFilters.month;
    const start = monthPivot <= 6 ? 1 : 7;
    const end = start + 5;
    return (dashboardData.movilidadesByMonth || [])
      .filter((item) => item.month >= start && item.month <= end)
      .map((item) => ({
        ...item,
        label: MONTH_LABELS[item.month] || `Mes ${item.month}`,
      }));
  }, [dashboardData.movilidadesByMonth, dashboardFilters.month]);

  const maxGastosValue = useMemo(
    () =>
      Math.max(
        ...filteredMovilidades.map((item) => item.total),
        1,
      ),
    [filteredMovilidades],
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

  const userOptions = useMemo(() => {
    const options = [{ value: 'global', label: 'Global' }];
    users.forEach((item) => {
      const id = item.id || item.usuario || item.email;
      const label = item.nombre_apellido || item.usuario || item.email;
      if (id && label) {
        options.push({ value: String(id), label });
      }
    });
    if (options.length === 1 && userId) {
      options.push({ value: String(userId), label: userLabel });
    }
    return options;
  }, [users, userId, userLabel]);

  const handleUserSelection = (event) => {
    const value = event.target.value;
    setDashboardFilters((prev) => ({
      ...prev,
      userId: value === 'global' ? '' : value,
    }));
  };

  const selectedUserLabel = useMemo(() => {
    if (!isAdmin) {
      return userLabel;
    }

    if (!dashboardFilters.userId) {
      return 'Global';
    }

    return (
      userOptions.find((option) => option.value === dashboardFilters.userId)
        ?.label || userLabel
    );
  }, [dashboardFilters.userId, isAdmin, userLabel, userOptions]);

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
        {isAdmin ? (
          <div className="filter-card">
            <div className="filter-header">
              <span className="filter-label">Usuario</span>
              <span className="filter-value">{selectedUserLabel}</span>
            </div>
            <div className="filter-controls">
              <label className="filter-control">
                <span>Selecciona</span>
                <select
                  name="userScope"
                  value={dashboardFilters.userId || 'global'}
                  onChange={handleUserSelection}
                >
                  {userOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ) : null}
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
          <span className="metric-user">Usuario: {selectedUserLabel}</span>
        </article>
        <article className="metric-card">
          <p>Gastos</p>
          <h2>{formatCurrency(dashboardData.totals.totalGastos)}</h2>
          <span className="metric-user">Usuario: {selectedUserLabel}</span>
        </article>
        <article className="metric-card">
          <p>Movilidades</p>
          <h2>{dashboardData.totals.totalMovilidades}</h2>
          <span className="metric-user">Usuario: {selectedUserLabel}</span>
        </article>
        <article className="metric-card highlight">
          <p>Balance</p>
          <h2>{formatCurrency(dashboardData.totals.balance)}</h2>
          <span className="metric-user">Usuario: {selectedUserLabel}</span>
        </article>
      </section>

      <section className="dashboard-chart card">
        <div className="chart-header">
          <div>
            <h3>Gastos por mes · {dashboardFilters.year}</h3>
            <p>Registro de movilidades</p>
          </div>
          <span className="chart-total">
            {formatCurrency(
              filteredMovilidades.reduce(
                (sum, item) => sum + item.total,
                0,
              ),
            )}
          </span>
        </div>
        <div className="chart-bars">
          {filteredMovilidades.map((item) => (
            <div key={item.month} className="chart-bar">
              <span
                style={{ height: `${(item.total / maxGastosValue) * 100}%` }}
              />
              <small>{item.label}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="card dashboard-panel">
          <div className="panel-header">
            <h3>Últimas movilidades</h3>
            <span>Mes seleccionado</span>
          </div>
          <ul className="panel-list">
            {dashboardData.latestMovilidades.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.motivo}</strong>
                  <span>{item.detalle}</span>
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
              <li key={item.id || item.nombre || index}>
                <div className="district">
                  <span className="district-rank">{index + 1}</span>
                  <strong>{item.nombre}</strong>
                </div>
                <strong>{formatCurrency(item.total)}</strong>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <footer className="dashboard-footer">
        <button className="btn-secondary" type="button" onClick={logout}>
          Cerrar sesión
        </button>
      </footer>
    </section>
  );
}
