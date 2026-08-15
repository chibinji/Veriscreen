import { useCallback } from 'react';
import { fetchFees } from '../api/student';
import AsyncPanel from '../components/AsyncPanel';
import PageHeader from '../components/PageHeader';
import type { Fee } from '../types';

function formatCurrency(value: number): string {
  return `K ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

export default function FeesPage() {
  const load = useCallback(() => fetchFees(), []);

  return (
    <div className="page">
      <PageHeader
        title="Fees"
        description="Payment history and outstanding balances."
      />

      <AsyncPanel<Fee[]>
        title="Fee records"
        load={load}
        render={(rows) => (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Payment date</th>
                  <th>Amount</th>
                  <th>Receipt</th>
                  <th>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.paymentDate}</td>
                    <td>{formatCurrency(row.amount)}</td>
                    <td>{row.receiptNo}</td>
                    <td>
                      <span className={row.outstandingBalance > 0 ? 'text-warning' : 'text-success'}>
                        {formatCurrency(row.outstandingBalance)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      />
    </div>
  );
}
