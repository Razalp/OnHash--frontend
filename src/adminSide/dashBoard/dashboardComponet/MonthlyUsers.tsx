import { useState, useEffect } from 'react';
import { AgChartsReact } from 'ag-charts-react';
import { AgLineSeriesOptions } from 'ag-charts-community';

interface MonthlyUserData {
  month: string;
  count: number;
}

const MonthlyUsers = ({ data }: { data: MonthlyUserData[] }) => {
  const [chartOptions, setChartOptions] = useState({
    data: [] as MonthlyUserData[],
    title: {
      text: 'Monthly users',
    },
    width:1199,
    background: {
      fill: '#000000', // Black background color
    },
    series: [{
      type: 'line',
      xKey: 'month',
      yKey: 'count',
      marker: {
        enabled: true,
      },
      stroke: '#FF0010', 
      strokeWidth: 2, 
    } as AgLineSeriesOptions], 
  });

  useEffect(() => {
    if (data.length > 0) {
      setChartOptions({ ...chartOptions, data });
    }
  }, [data]);

  return (
    <div className='flex h-80 justify-center ml-3'>
      <AgChartsReact options={chartOptions} />
    </div>
  );
};

export default MonthlyUsers;
