/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  EuiBasicTableColumn,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiTitle,
  RIGHT_ALIGNMENT,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import React from 'react';
import { ConnectionStatsItemWithComparisonData } from '../../../../common/connections';
import {
  asMillisecondDuration,
  asPercent,
  asTransactionRate,
} from '../../../../common/utils/formatters';
import { useBreakpoints } from '../../../hooks/use_breakpoints';
import { FETCH_STATUS } from '../../../hooks/use_fetcher';
import { ImpactBar } from '../ImpactBar';
import { ListMetric } from '../list_metric';
import { OverviewTableContainer } from '../overview_table_container';
import { TableFetchWrapper } from '../table_fetch_wrapper';
import { TruncateWithTooltip } from '../truncate_with_tooltip';

export type DependenciesItem = Omit<
  ConnectionStatsItemWithComparisonData,
  'location'
> & {
  name: string;
  link: React.ReactElement;
};

interface Props {
  dependencies: DependenciesItem[];
  fixedHeight?: boolean;
  isSingleColumn?: boolean;
  link?: React.ReactNode;
  title: React.ReactNode;
  nameColumnTitle: React.ReactNode;
  status: FETCH_STATUS;
  compact?: boolean;
}

export function DependenciesTable(props: Props) {
  const {
    dependencies,
    fixedHeight,
    isSingleColumn = true,
    link,
    title,
    nameColumnTitle,
    status,
    compact = true,
  } = props;

  const pagination = compact
    ? {
        initialPageSize: 5,
        pageSizeOptions: [5],
        hidePerPageOptions: true,
      }
    : {};

  // SparkPlots should be hidden if we're in two-column view and size XL (1200px)
  const { isXl } = useBreakpoints();
  const shouldShowSparkPlots = isSingleColumn || !isXl;

  const columns: Array<EuiBasicTableColumn<DependenciesItem>> = [
    {
      field: 'name',
      name: nameColumnTitle,
      render: (_, item) => {
        const { name, link: itemLink } = item;
        return <TruncateWithTooltip text={name} content={itemLink} />;
      },
      sortable: true,
    },
    {
      field: 'latencyValue',
      name: i18n.translate('xpack.apm.dependenciesTable.columnLatency', {
        defaultMessage: 'Latency (avg.)',
      }),
      align: RIGHT_ALIGNMENT,
      render: (_, { currentStats, previousStats }) => {
        return (
          <ListMetric
            compact
            color="euiColorVis1"
            hideSeries={!shouldShowSparkPlots}
            series={currentStats.latency.timeseries}
            comparisonSeries={previousStats?.latency.timeseries}
            valueLabel={asMillisecondDuration(currentStats.latency.value)}
          />
        );
      },
      sortable: true,
    },
    {
      field: 'throughputValue',
      name: i18n.translate('xpack.apm.dependenciesTable.columnThroughput', {
        defaultMessage: 'Throughput',
      }),
      align: RIGHT_ALIGNMENT,
      render: (_, { currentStats, previousStats }) => {
        return (
          <ListMetric
            compact
            color="euiColorVis0"
            hideSeries={!shouldShowSparkPlots}
            series={currentStats.throughput.timeseries}
            comparisonSeries={previousStats?.throughput.timeseries}
            valueLabel={asTransactionRate(currentStats.throughput.value)}
          />
        );
      },
      sortable: true,
    },
    {
      field: 'errorRateValue',
      name: i18n.translate('xpack.apm.dependenciesTable.columnErrorRate', {
        defaultMessage: 'Failed transaction rate',
      }),
      align: RIGHT_ALIGNMENT,
      render: (_, { currentStats, previousStats }) => {
        return (
          <ListMetric
            compact
            color="euiColorVis7"
            hideSeries={!shouldShowSparkPlots}
            series={currentStats.errorRate.timeseries}
            comparisonSeries={previousStats?.errorRate.timeseries}
            valueLabel={asPercent(currentStats.errorRate.value, 1)}
          />
        );
      },
      sortable: true,
    },
    {
      field: 'impactValue',
      name: i18n.translate('xpack.apm.dependenciesTable.columnImpact', {
        defaultMessage: 'Impact',
      }),
      align: RIGHT_ALIGNMENT,
      render: (_, { currentStats, previousStats }) => {
        return (
          <EuiFlexGroup alignItems="flexEnd" gutterSize="xs" direction="column">
            <EuiFlexItem>
              <ImpactBar value={currentStats.impact} size="m" />
            </EuiFlexItem>
            {previousStats?.impact !== undefined && (
              <EuiFlexItem>
                <ImpactBar
                  value={previousStats?.impact}
                  size="s"
                  color="subdued"
                />
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        );
      },
      sortable: true,
    },
  ];

  // need top-level sortable fields for the managed table
  const items =
    dependencies.map((item) => ({
      ...item,
      errorRateValue: item.currentStats.errorRate.value,
      latencyValue: item.currentStats.latency.value,
      throughputValue: item.currentStats.throughput.value,
      impactValue: item.currentStats.impact,
    })) ?? [];

  return (
    <EuiFlexGroup direction="column" gutterSize="s">
      <EuiFlexItem>
        <EuiFlexGroup responsive={false} justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiTitle size="xs">
              <h2>{title}</h2>
            </EuiTitle>
          </EuiFlexItem>
          {link && <EuiFlexItem grow={false}>{link}</EuiFlexItem>}
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        <TableFetchWrapper status={status}>
          <OverviewTableContainer
            fixedHeight={fixedHeight}
            isEmptyAndLoading={
              items.length === 0 && status === FETCH_STATUS.LOADING
            }
          >
            <EuiInMemoryTable
              columns={columns}
              items={items}
              allowNeutralSort={false}
              loading={status === FETCH_STATUS.LOADING}
              pagination={pagination}
              sorting={{
                sort: {
                  direction: 'desc',
                  field: 'impactValue',
                },
              }}
            />
          </OverviewTableContainer>
        </TableFetchWrapper>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
