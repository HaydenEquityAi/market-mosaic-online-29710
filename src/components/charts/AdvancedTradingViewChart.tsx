import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  HistogramData,
} from 'lightweight-charts';

interface AdvancedTradingViewChartProps {
  symbol: string;
  candlestickData: CandlestickData[];
  volumeData?: HistogramData[];
  indicators?: {
    sma20?: LineData[];
    sma50?: LineData[];
    sma200?: LineData[];
    ema?: LineData[];
  };
  height?: number;
}

export const AdvancedTradingViewChart: React.FC<AdvancedTradingViewChartProps> = ({
  symbol,
  candlestickData,
  volumeData,
  indicators,
  height = 500,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<{
    candlestick: ISeriesApi<'Candlestick'> | null;
    volume: ISeriesApi<'Histogram'> | null;
    sma20: ISeriesApi<'Line'> | null;
    sma50: ISeriesApi<'Line'> | null;
    sma200: ISeriesApi<'Line'> | null;
    ema: ISeriesApi<'Line'> | null;
  }>({
    candlestick: null,
    volume: null,
    sma20: null,
    sma50: null,
    sma200: null,
    ema: null,
  });

  const [visibleIndicators, setVisibleIndicators] = useState({
    sma20: true,
    sma50: true,
    sma200: true,
    ema: false,
    volume: true,
  });

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create main chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height - (volumeData ? 100 : 0),
      layout: {
        background: { color: '#1e222d' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.6)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.6)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: 'rgba(224, 227, 235, 0.1)',
          style: 0,
        },
        horzLine: {
          width: 1,
          color: 'rgba(224, 227, 235, 0.1)',
          style: 0,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.4)',
        scaleMargins: {
          top: 0.1,
          bottom: volumeData ? 0.3 : 0.1,
        },
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.4)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    seriesRef.current.candlestick = candlestickSeries;
    candlestickSeries.setData(candlestickData);

    // Add volume series if provided
    if (volumeData && visibleIndicators.volume) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      });
      seriesRef.current.volume = volumeSeries;
      volumeSeries.setData(volumeData);
    }

    // Add indicator lines
    if (indicators?.sma20 && visibleIndicators.sma20) {
      const sma20Series = chart.addLineSeries({
        color: '#2196F3',
        lineWidth: 2,
        title: 'SMA 20',
      });
      seriesRef.current.sma20 = sma20Series;
      sma20Series.setData(indicators.sma20);
    }

    if (indicators?.sma50 && visibleIndicators.sma50) {
      const sma50Series = chart.addLineSeries({
        color: '#FF9800',
        lineWidth: 2,
        title: 'SMA 50',
      });
      seriesRef.current.sma50 = sma50Series;
      sma50Series.setData(indicators.sma50);
    }

    if (indicators?.sma200 && visibleIndicators.sma200) {
      const sma200Series = chart.addLineSeries({
        color: '#9C27B0',
        lineWidth: 2,
        title: 'SMA 200',
      });
      seriesRef.current.sma200 = sma200Series;
      sma200Series.setData(indicators.sma200);
    }

    if (indicators?.ema && visibleIndicators.ema) {
      const emaSeries = chart.addLineSeries({
        color: '#00BCD4',
        lineWidth: 2,
        title: 'EMA',
        lineStyle: 2, // Dashed
      });
      seriesRef.current.ema = emaSeries;
      emaSeries.setData(indicators.ema);
    }

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [candlestickData, volumeData, indicators, visibleIndicators]);

  const toggleIndicator = (indicator: keyof typeof visibleIndicators) => {
    setVisibleIndicators((prev) => ({
      ...prev,
      [indicator]: !prev[indicator],
    }));
  };

  return (
    <div className="relative">
      {/* Chart Controls */}
      <div className="absolute top-2 left-2 z-10 bg-[#1e222d] rounded-lg p-2 space-x-2">
        <span className="text-white font-semibold">{symbol}</span>
        <button
          onClick={() => toggleIndicator('sma20')}
          className={`px-2 py-1 rounded text-xs ${
            visibleIndicators.sma20
              ? 'bg-[#2196F3] text-white'
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          SMA 20
        </button>
        <button
          onClick={() => toggleIndicator('sma50')}
          className={`px-2 py-1 rounded text-xs ${
            visibleIndicators.sma50
              ? 'bg-[#FF9800] text-white'
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          SMA 50
        </button>
        <button
          onClick={() => toggleIndicator('sma200')}
          className={`px-2 py-1 rounded text-xs ${
            visibleIndicators.sma200
              ? 'bg-[#9C27B0] text-white'
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          SMA 200
        </button>
        <button
          onClick={() => toggleIndicator('volume')}
          className={`px-2 py-1 rounded text-xs ${
            visibleIndicators.volume
              ? 'bg-[#26a69a] text-white'
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          Volume
        </button>
      </div>

      {/* Chart Container */}
      <div ref={chartContainerRef} className="tradingview-advanced-chart" />
    </div>
  );
};

export default AdvancedTradingViewChart;
