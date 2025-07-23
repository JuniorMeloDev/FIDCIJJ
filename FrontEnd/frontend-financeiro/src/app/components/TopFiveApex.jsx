'use client'

import React from 'react'
import Chart from 'react-apexcharts'
import { formatBRLNumber } from '@/app/utils/formatters'

export default function TopFiveApex({ data = [], title }) {
  if (!data.length) {
    return (
      <div className="bg-gray-700 p-6 rounded-lg shadow-lg flex items-center justify-center">
        <p className="text-gray-300">Nenhum dado...</p>
      </div>
    )
  }

  const categories = data.map(item => item.nome)
  const values     = data.map(item => item.valorTotal)

  // Abrevia valores: 1k, 100k, 1.5M
  const abbreviate = val => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
    if (val >= 1_000)     return `${Math.round(val / 1_000)}k`
    return `${val}`
  }

  const options = {
    chart: {
      id: title,
      toolbar: { show: false },
      zoom:    { enabled: false },
      background: 'transparent',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '50%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: val => formatBRLNumber(val),
      style: {
        colors: ['#f7fafc'],
        fontSize: '12px',
        fontWeight: '500',
      },
    },
    xaxis: {
      categories,
      tickAmount: 2,
      labels: {
        show: true,
        rotate: 0,
        offsetY: 10,
        style: {
          colors: '#f7fafc',
          fontSize: '13px',
          fontWeight: '500',
        },
        formatter: val => abbreviate(val),
      },
      axisBorder: { show: false },
      axisTicks:  { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#ccc',
          fontSize: '12px',
        },
      },
    },
    grid: {
      show: false,
      padding: {
        left: 20,
        right: 20,
        top: 10,
        bottom: 50,
      },
    },
    theme: { mode: 'dark' },
    tooltip: {
      theme: 'dark',
      y: { formatter: val => formatBRLNumber(val) },
    },
    colors: ['#f97316'],
  }

  const series = [{ name: title, data: values }]

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">{title}</h3>
      <Chart options={options} series={series} type="bar" height={260} />
    </div>
  )
}