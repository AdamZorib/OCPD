'use client';

import {
  FileText,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import {
  mockDashboardStats,
  mockPolicies,
  mockClaims,
  mockQuotes,
  mockPremiumHistory,
} from '@/lib/mock-data';
import styles from './page.module.css';

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Days until expiry
const daysUntilExpiry = (date: Date) => {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

// Status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'EXPIRED': return 'danger';
    case 'CANCELLED': return 'danger';
    case 'DRAFT': return 'default';
    case 'QUOTED': return 'info';
    case 'UNDER_REVIEW': return 'warning';
    case 'PAID': return 'success';
    default: return 'default';
  }
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Aktywna',
  EXPIRED: 'Wygasła',
  CANCELLED: 'Anulowana',
  DRAFT: 'Szkic',
  QUOTED: 'Wyceniona',
  UNDER_REVIEW: 'W trakcie',
  PAID: 'Wypłacona',
  CALCULATED: 'Obliczona',
  SENT: 'Wysłana',
};

export default function Dashboard() {
  const stats = mockDashboardStats;
  const recentPolicies = mockPolicies.slice(0, 5);
  const openClaims = mockClaims.filter(c => c.status === 'UNDER_REVIEW' || c.status === 'REPORTED');
  const pendingQuotes = mockQuotes.filter(q => q.status !== 'ACCEPTED' && q.status !== 'REJECTED');

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Przegląd portfela ubezpieczeń OCPD</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/quotes/new">
            <Button leftIcon={<Calculator size={18} />}>
              Nowa wycena
            </Button>
          </Link>
        </div>
      </header>

      {/* KPI Cards */}
      <section className={styles.kpiGrid}>
        <Card className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-accent-primary)' }}>
            <FileText size={24} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Aktywne polisy</span>
            <span className={styles.kpiValue}>{stats.activePolicies}</span>
            <span className={styles.kpiChange} data-positive="true">
              <ArrowUpRight size={14} /> +2 w tym miesiącu
            </span>
          </div>
        </Card>

        <Card className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' }}>
            <Clock size={24} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Wygasające (30 dni)</span>
            <span className={styles.kpiValue}>{stats.expiringPolicies30Days}</span>
            <span className={styles.kpiSubtext}>
              {stats.expiringPolicies60Days} w ciągu 60 dni
            </span>
          </div>
        </Card>

        <Card className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Składka roczna</span>
            <span className={styles.kpiValue}>{formatCurrency(stats.totalPremium)}</span>
            <span className={styles.kpiChange} data-positive="true">
              <ArrowUpRight size={14} /> +12% r/r
            </span>
          </div>
        </Card>

        <Card className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Otwarte szkody</span>
            <span className={styles.kpiValue}>{stats.openClaims}</span>
            <span className={styles.kpiChange} data-positive="false">
              <ArrowDownRight size={14} /> Szkodowość: {(stats.claimsRatio * 100).toFixed(0)}%
            </span>
          </div>
        </Card>
      </section>

      {/* Charts */}
      <section className={styles.chartsGrid}>
        <Card className={styles.chartCard} padding="lg">
          <CardHeader>
            <CardTitle>Składki vs Szkody</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockPremiumHistory}>
                  <defs>
                    <linearGradient id="premiumGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="claimsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="month"
                    stroke="var(--color-text-tertiary)"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="var(--color-text-tertiary)"
                    fontSize={12}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'var(--color-text-primary)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="premium"
                    name="Składki"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#premiumGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="claims"
                    name="Szkody"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#claimsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.chartCard} padding="lg">
          <CardHeader>
            <CardTitle>Top Klienci</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topClients} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    type="number"
                    stroke="var(--color-text-tertiary)"
                    fontSize={12}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="var(--color-text-tertiary)"
                    fontSize={11}
                    width={150}
                    tick={{ fill: 'var(--color-text-secondary)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'var(--color-text-primary)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar
                    dataKey="premium"
                    name="Składka"
                    fill="#6366f1"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tables */}
      <section className={styles.tablesGrid}>
        {/* Recent Policies */}
        <Card padding="none">
          <div className={styles.tableHeader}>
            <h3>Ostatnie polisy</h3>
            <Link href="/policies" className={styles.viewAllLink}>
              Zobacz wszystkie <ChevronRight size={16} />
            </Link>
          </div>
          <div className={styles.tableContent}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nr polisy</th>
                  <th>Klient</th>
                  <th>Składka</th>
                  <th>Wygasa</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPolicies.map((policy) => (
                  <tr key={policy.id}>
                    <td>
                      <Link href={`/policies/${policy.id}`} className={styles.policyLink}>
                        {policy.policyNumber}
                      </Link>
                    </td>
                    <td className={styles.clientName}>{policy.client?.name}</td>
                    <td>{formatCurrency(policy.totalPremium)}</td>
                    <td>
                      <span className={daysUntilExpiry(policy.validTo) <= 30 ? styles.expiringWarning : ''}>
                        {formatDate(policy.validTo)}
                      </span>
                    </td>
                    <td>
                      <Badge variant={getStatusVariant(policy.status)} dot>
                        {statusLabels[policy.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Open Claims & Pending Quotes */}
        <div className={styles.sideCards}>
          <Card padding="none">
            <div className={styles.tableHeader}>
              <h3>Otwarte szkody</h3>
              <Link href="/claims" className={styles.viewAllLink}>
                Zobacz <ChevronRight size={16} />
              </Link>
            </div>
            <div className={styles.listContent}>
              {openClaims.length > 0 ? openClaims.map((claim) => (
                <div key={claim.id} className={styles.listItem}>
                  <div className={styles.listItemMain}>
                    <span className={styles.listItemTitle}>{claim.claimNumber}</span>
                    <span className={styles.listItemSubtitle}>{claim.description.slice(0, 50)}...</span>
                  </div>
                  <div className={styles.listItemEnd}>
                    <span className={styles.listItemValue}>{formatCurrency(claim.claimedAmount)}</span>
                    <Badge variant={getStatusVariant(claim.status)} size="sm">
                      {statusLabels[claim.status]}
                    </Badge>
                  </div>
                </div>
              )) : (
                <div className={styles.emptyState}>Brak otwartych szkód</div>
              )}
            </div>
          </Card>

          <Card padding="none">
            <div className={styles.tableHeader}>
              <h3>Oczekujące wyceny</h3>
              <Link href="/quotes" className={styles.viewAllLink}>
                Zobacz <ChevronRight size={16} />
              </Link>
            </div>
            <div className={styles.listContent}>
              {pendingQuotes.map((quote) => (
                <div key={quote.id} className={styles.listItem}>
                  <div className={styles.listItemMain}>
                    <span className={styles.listItemTitle}>NIP: {quote.clientNIP}</span>
                    <span className={styles.listItemSubtitle}>
                      {formatCurrency(quote.requestedSumInsured)} • {quote.requestedScope}
                    </span>
                  </div>
                  <div className={styles.listItemEnd}>
                    {quote.calculatedPremium && (
                      <span className={styles.listItemValue}>{formatCurrency(quote.calculatedPremium)}</span>
                    )}
                    <Badge variant={getStatusVariant(quote.status)} size="sm">
                      {statusLabels[quote.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
