import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import './DashboardCharts.css';

const BRAND_GREEN = '#173528';
const BRAND_GOLD = '#D8B07A';

const STATUS_COLORS = {
  Approved: '#173528',
  'Under Review': '#D8B07A',
  Pending: '#D8B07A',
  Rejected: '#c0392b',
  Draft: '#8a8a8a',
};

function ChartEmpty({ label }) {
  return <div className="chart-empty">{label}</div>;
}

function statusLegend(entries) {
  return (props) => {
    const { payload } = props;
    return (
      <ul className="chart-legend">
        {payload.map((entry, index) => (
          <li key={entry.value}>
            <span className="chart-legend-swatch" style={{ background: entry.color }} />
            {entry.value} ({entries[index]?.count ?? 0})
          </li>
        ))}
      </ul>
    );
  };
}

export function DecisionStatusChart({ data }) {
  const hasData = data && data.some((d) => d.count > 0);

  return (
    <div className="chart-card">
      <h3 className="chart-title">Decision Status Distribution</h3>
      {!hasData ? (
        <ChartEmpty label="No decisions recorded yet." />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#8a8a8a'} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
            <Legend content={statusLegend(data)} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function CategoryChart({ data }) {
  const hasData = data && data.some((d) => d.count > 0);

  return (
    <div className="chart-card">
      <h3 className="chart-title">Decisions by Category</h3>
      {!hasData ? (
        <ChartEmpty label="No categorized decisions yet." />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid horizontal={false} stroke="#f0efec" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#777777' }} />
            <YAxis
              type="category"
              dataKey="category"
              width={80}
              tick={{ fontSize: 12, fill: '#444444' }}
            />
            <Tooltip cursor={{ fill: 'rgba(23, 53, 40, 0.05)' }} />
            <Bar dataKey="count" fill={BRAND_GREEN} radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function MonthlyTrendChart({ data }) {
  const hasData = data && data.some((d) => d.count > 0);

  return (
    <div className="chart-card">
      <h3 className="chart-title">Monthly Decisions</h3>
      {!hasData ? (
        <ChartEmpty label="No decisions in the last 6 months." />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ left: 0, right: 16, top: 8 }}>
            <CartesianGrid vertical={false} stroke="#f0efec" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#777777' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#777777' }} width={30} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke={BRAND_GREEN}
              strokeWidth={2}
              dot={{ r: 4, fill: BRAND_GREEN }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function ApprovalStatsChart({ data }) {
  const hasData = data && data.some((d) => d.count > 0);

  return (
    <div className="chart-card">
      <h3 className="chart-title">Approval Statistics</h3>
      {!hasData ? (
        <ChartEmpty label="No approval activity yet." />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ left: 0, right: 16 }}>
            <CartesianGrid vertical={false} stroke="#f0efec" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#777777' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#777777' }} width={30} />
            <Tooltip cursor={{ fill: 'rgba(23, 53, 40, 0.05)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
              {data.map((entry) => (
                <Cell key={entry.label} fill={STATUS_COLORS[entry.label] || BRAND_GOLD} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
