import { useState } from 'react';
import { Grid, Table, Card, Pagination, Empty } from 'antd';

const { useBreakpoint } = Grid;

const getValue = (row, col) => {
  const { dataIndex } = col || {};
  if (dataIndex == null) return undefined;
  return Array.isArray(dataIndex) ? dataIndex.reduce((acc, k) => acc?.[k], row) : row[dataIndex];
};

const isActionsColumn = (col) => {
  const t = (col.title ?? '').toString().trim().toLowerCase();
  return t === '' || t === 'actions';
};

/**
 * Drop-in replacement for antd's <Table>: renders the normal table on tablet/desktop,
 * and a stacked card-per-row list on phone screens (< md, 768px) using the SAME
 * `columns` definition — no per-page markup duplication.
 *
 * Convention (matches every list page in this admin): the first column is the row's
 * "identity" (name/photo/etc, often already has a rich `render`) and becomes the card
 * header; a column titled '' or 'Actions' (if present) becomes the card's action row;
 * everything else renders as a label/value row in the card body.
 *
 * Props mirror antd's <Table columns dataSource rowKey loading pagination onRow scroll />.
 * `pagination` follows antd's own contract: an object for server-side paging, `false` to
 * disable, or omitted to fall back to antd's default client-side paging (pageSize 10) —
 * replicated here in card mode so behavior matches the desktop table exactly.
 */
export default function ResponsiveTable({ columns = [], dataSource = [], rowKey, loading, pagination, onRow, scroll, cardPageSize = 10, ...rest }) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (!isMobile) {
    return (
      <Table
        rowKey={rowKey}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination}
        onRow={onRow}
        scroll={scroll}
        {...rest}
      />
    );
  }

  return (
    <CardList
      columns={columns}
      dataSource={dataSource}
      rowKey={rowKey}
      loading={loading}
      pagination={pagination}
      onRow={onRow}
      defaultPageSize={cardPageSize}
    />
  );
}

function CardList({ columns, dataSource, rowKey, loading, pagination, onRow, defaultPageSize }) {
  const getKey = (row, i) => (typeof rowKey === 'function' ? rowKey(row) : row?.[rowKey] ?? i);

  const headerCol = columns[0];
  const actionCol = columns.find((c) => c !== headerCol && isActionsColumn(c));
  const bodyCols = columns.filter((c) => c !== headerCol && c !== actionCol);

  // Server-paginated pages pass a pagination object already sliced to the current page —
  // render as-is. Pages that pass nothing rely on antd Table's own client-side paging
  // (default pageSize 10), so replicate that here with local state.
  const serverPaginated = pagination && pagination !== false;
  const [clientPage, setClientPage] = useState(1);
  const clientPageSize = defaultPageSize;

  const pageRows = serverPaginated
    ? dataSource
    : pagination === false
      ? dataSource
      : dataSource.slice((clientPage - 1) * clientPageSize, clientPage * clientPageSize);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} size="small" loading />
        ))}
      </div>
    );
  }

  if (!dataSource.length) {
    return (
      <Card size="small">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pageRows.map((row, i) => {
          const rowProps = onRow?.(row) || {};
          return (
            <Card
              key={getKey(row, i)}
              size="small"
              onClick={rowProps.onClick}
              style={{ cursor: rowProps.onClick ? 'pointer' : 'default', ...rowProps.style }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {headerCol?.render
                    ? headerCol.render(getValue(row, headerCol), row, i)
                    : getValue(row, headerCol)}
                </div>
                {actionCol && (
                  <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
                    {actionCol.render ? actionCol.render(getValue(row, actionCol), row, i) : null}
                  </div>
                )}
              </div>

              {bodyCols.length > 0 && (
                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: '1px solid #f0f0f0',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    rowGap: 10,
                    columnGap: 10,
                  }}
                >
                  {bodyCols.map((col, ci) => (
                    <div key={ci} style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                        {col.title || '—'}
                      </div>
                      <div style={{ marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {col.render ? col.render(getValue(row, col), row, i) : (getValue(row, col) ?? '—')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {serverPaginated && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <Pagination
            size="small"
            current={pagination.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onChange={pagination.onChange}
          />
        </div>
      )}
      {!serverPaginated && pagination !== false && dataSource.length > clientPageSize && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <Pagination
            size="small"
            current={clientPage}
            total={dataSource.length}
            pageSize={clientPageSize}
            onChange={setClientPage}
          />
        </div>
      )}
    </div>
  );
}
