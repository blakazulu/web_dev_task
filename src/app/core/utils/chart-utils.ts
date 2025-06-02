// Register Chart.js components that are required by the application
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  PointElement,
  SubTitle,
  TimeScale,
  TimeSeriesScale,
  Title,
  Tooltip
} from 'chart.js';

// Register controllers
Chart.register(
  LineController,
  BarController,
  PieController,

  // Elements
  LineElement,
  PointElement,
  BarElement,
  ArcElement,

  // Scales
  LinearScale,
  CategoryScale,
  TimeScale,
  TimeSeriesScale,

  // Plugins
  Tooltip,
  Legend,
  Title,
  SubTitle
);

export default Chart;
