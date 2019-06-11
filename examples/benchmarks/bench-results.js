import React, {Component} from 'react';

import ReactTable from 'react-table';
import 'react-table/react-table.css';

function getPercent(score) {
  // Log scale between 100K - 100M, 0-3
  const logScore = Math.min(Math.max(Math.log10(score) - 5, 0), 5);
  const percent = Math.min(Math.max(logScore * 33.3333333, 5), 100);
  return percent;
}

const GREEN = '#85cc00';
const ORANGE = '#ffbf00';
const RED = '#ff2e00';

function Star() {
  return <span style={{fontSize: '100%', color: 'yellow'}}>★</span>;
}

// eslint-disable-next-line react/prop-types
function BarCell({color, percent, stars = 0, children}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#dadada',
        borderRadius: '2px'
      }}
    >
      <div
        style={{
          width: `${percent}%`, // ` workaround chrome devtools formatting issue
          height: '100%',
          backgroundColor: color,
          borderRadius: '2px',
          transition: 'all .2s ease-out'
        }}
      >
        {new Array(stars).fill(null).map((_, i) => (
          <Star key={`${i}`} />
        ))}
        {children}
      </div>
    </div>
  );
}

// eslint-disable-next-line react/prop-types
function PerformanceBarCell({row}) {
  const {score} = row;
  const percent = getPercent(score);
  // 1 star per 100M
  const stars = Math.floor((score || 0) / 5e7);

  let color = GREEN;
  if (percent < getPercent(1e7)) {
    color = ORANGE;
  }
  if (percent < getPercent(1e6)) {
    color = RED;
  }

  return percent ? <BarCell color={color} percent={percent} stars={stars} /> : null;
}

export default class BenchResults extends Component {
  _renderTable() {
    // eslint-disable-next-line react/prop-types
    const {log} = this.props;
    return (
      <div>
        <div style={{display: 'flex', height: 16}}>
          <BarCell color={RED} percent={100}>
            {' '}
            &lt; 1M iterations/s
          </BarCell>
          <div style={{width: 20}} />
          <BarCell color={ORANGE} percent={100}>
            1M - 10M iterations/s
          </BarCell>
          <div style={{width: 20}} />
          <BarCell color={GREEN} percent={100}>
            &gt; 10M iterations/s
          </BarCell>
          <div style={{width: 20}} />
          <BarCell color={GREEN} percent={100}>
            <Star />
            50M iterations/s
          </BarCell>
        </div>
        <ReactTable
          data={log}
          columns={[
            {
              Header: 'Id',
              accessor: 'id',
              Cell: ({row}) => (row.score > 0 ? row.id : <b>{row.id}</b>)
            },
            {
              Header: 'Iterations/Second',
              accessor: 'formattedValue'
            },
            {
              Header: 'Score',
              accessor: 'value',
              id: 'score',
              Cell: PerformanceBarCell
            }
          ]}
          showPagination={false}
          manual
          className="-striped -highlight"
        />
      </div>
    );
  }

  render() {
    return <div>{this._renderTable()}</div>;
  }
}