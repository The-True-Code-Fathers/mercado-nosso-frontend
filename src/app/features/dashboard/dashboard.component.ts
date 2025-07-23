import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { DashboardService } from './dashboard.service';
import { DEVELOPMENT_CONFIG } from '../../shared/config/development.config';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardModule,
    ChartModule,
    TableModule,
    DropdownModule,
    DialogModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  totalVendas = '';
  totalVendasMes = '';
  produtosAtivos = 0;
  mediaAvaliacoes = '';
  dateFilterOptions = [
    { label: 'Últimos 7 dias', value: '7d' },
    { label: 'Últimos 30 dias', value: '30d' },
    { label: 'Últimos 3 meses', value: '3m' },
    { label: 'Último ano', value: '1y' }
  ];
  selectedDateFilter = '30d';
  chartData: any;
  chartOptions: any;
  barChartData: any;
  barChartOptions: any;
  itensMaisVendidos: any[] = [];
  dashboardRawData: any; 
  showExportModal = false; 

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    const period = this.selectedDateFilter;
    const sellerId = DEVELOPMENT_CONFIG.DEFAULT_USER_ID;
    console.log('DEBUG sellerId:', sellerId, 'period:', period);

    this.dashboardService.getDashboardData(sellerId, period).subscribe({
      next: (data) => {
        console.log('DEBUG dashboard response:', data);
        this.dashboardRawData = data;
        this.processData(data);
      },
      error: (err) => {
        console.error('DEBUG erro ao buscar dashboard:', err);
      }
    });
  }

  processData(data: any) {
    this.totalVendasMes = data.totalSalesMonth || data.totalSales;
    this.mediaAvaliacoes = data.averageRating;

    interface TopProduct {
      productName: string;
      quantitySold: number;
      totalRevenue: number;
    }

    interface ItemMaisVendido {
      nome: string;
      quantidade: number;
      valorAcumulado: number;
      performance: string;
    }

    this.itensMaisVendidos = (data.topProducts as TopProduct[] || []).map((prod: TopProduct): ItemMaisVendido => ({
      nome: prod.productName,
      quantidade: prod.quantitySold,
      valorAcumulado: prod.totalRevenue,
      performance: this.calculatePerformance(prod.quantitySold)
    }));

    this.produtosAtivos = this.itensMaisVendidos.length;

    this.updateBarChart();
    this.updateLineChart();
  }

  calculatePerformance(quantity: number): string {
    if (quantity >= 10) return 'high';
    if (quantity >= 5) return 'medium';
    return 'low';
  }

  updateBarChart() {
    if (!this.itensMaisVendidos || this.itensMaisVendidos.length === 0) {
      this.barChartData = {
        labels: ['Sem dados'],
        datasets: [{
          label: 'Quantidade Vendida',
          data: [0],
          backgroundColor: ['rgba(158, 158, 158, 0.5)'],
          borderColor: ['#9E9E9E'],
          borderWidth: 2
        }]
      };
    } else {
      const topProducts = [...this.itensMaisVendidos]
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5);

      this.barChartData = {
        labels: topProducts.map(item => item.nome),
        datasets: [
          {
            label: 'Quantidade Vendida',
            data: topProducts.map(item => item.quantidade),
            backgroundColor: [
              'rgba(27, 94, 32, 0.8)',
              'rgba(255, 179, 0, 0.8)',
              'rgba(33, 150, 243, 0.8)',
              'rgba(76, 175, 80, 0.8)',
              'rgba(255, 152, 0, 0.8)'
            ],
            borderColor: [
              '#1B5E20',
              '#FFB300',
              '#2196F3',
              '#4CAF50',
              '#FF9800'
            ],
            borderWidth: 2,
            borderRadius: 4,
            borderSkipped: false,
            barThickness: 30,
            maxBarThickness: 35
          }
        ]
      };
    }

    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#212121',
          bodyColor: '#212121',
          borderColor: '#1B5E20',
          borderWidth: 1,
          callbacks: {
            label: (context: any) => `Vendidos: ${context.parsed.y} unidades`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#757575',
            font: { size: 10 },
            maxRotation: 45,
            minRotation: 0
          },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#757575',
            font: { size: 11 },
            callback: (value: any) => value + ' un'
          },
          grid: { color: '#E0E0E0', display: true }
        }
      }
    };
  }

  updateLineChart() {
    const { labels, data } = this.generateChartDataByPeriod();

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Vendas',
          data: data,
          fill: true,
          borderColor: '#1B5E20',
          backgroundColor: 'rgba(27, 94, 32, 0.1)',
          tension: 0.4,
          pointBackgroundColor: '#1B5E20',
          pointBorderColor: '#1B5E20',
          pointHoverBackgroundColor: '#FFB300',
          pointHoverBorderColor: '#FFB300'
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#212121',
            font: { size: 12, weight: 'bold' }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#212121',
          bodyColor: '#212121',
          borderColor: '#1B5E20',
          borderWidth: 1,
          callbacks: {
            label: function(context: any) {
              return `Vendas: R$ ${context.parsed.y.toLocaleString('pt-BR')}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#757575', font: { size: 11 } },
          grid: { color: '#E0E0E0', display: true }
        },
        y: {
          ticks: {
            color: '#757575',
            font: { size: 11 },
            callback: function(value: any) {
              return 'R$ ' + value.toLocaleString('pt-BR');
            }
          },
          grid: { color: '#E0E0E0', display: true }
        }
      },
      interaction: { intersect: false, mode: 'index' }
    };
  }

  generateChartDataByPeriod(): { labels: string[], data: number[] } {
    const currentTotal = parseFloat(this.totalVendasMes) || 0;

    switch(this.selectedDateFilter) {
      case '7d':
        return {
          labels: ['6 dias', '5 dias', '4 dias', '3 dias', '2 dias', 'Ontem', 'Hoje'],
          data: this.generateDataPoints(7, currentTotal, 0.3)
        };

      case '30d':
        return {
          labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
          data: this.generateDataPoints(4, currentTotal, 0.4)
        };

      case '3m':
        const last3Months = this.getLast3MonthsLabels();
        return {
          labels: last3Months,
          data: this.generateDataPoints(3, currentTotal, 0.6)
        };

      case '1y':
        const last12Months = this.getLast12MonthsLabels();
        return {
          labels: last12Months,
          data: this.generateDataPoints(12, currentTotal, 0.8)
        };

      default:
        return {
          labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
          data: this.generateDataPoints(4, currentTotal, 0.4)
        };
    }
  }

  generateDataPoints(count: number, total: number, variance: number): number[] {
    const data: number[] = [];
    const baseValue = total / count;

    for (let i = 0; i < count; i++) {
      const growthFactor = (i + 1) / count; // 0.2, 0.4, 0.6, 0.8, 1.0
      const randomVariance = (Math.random() - 0.5) * variance;
      const value = Math.max(0, baseValue * (0.5 + growthFactor + randomVariance));
      data.push(Math.round(value));
    }

    return data;
  }

  getLast3MonthsLabels(): string[] {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                   'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonth = new Date().getMonth();
    const labels = [];

    for (let i = 2; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      labels.push(months[monthIndex]);
    }

    return labels;
  }

  getLast12MonthsLabels(): string[] {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                   'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonth = new Date().getMonth();
    const labels = [];

    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      labels.push(months[monthIndex]);
    }

    return labels;
  }

  onDateFilterChange() {
    console.log('DEBUG: Filtro alterado para:', this.selectedDateFilter);
    this.loadDashboardData();
  }

  initChartData(chartBackendData?: any) {
  }

  initBarChartData() {
  }

  getPerformanceClass(performance: string): string {
    switch(performance) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  }

  getPerformanceText(performance: string): string {
    switch(performance) {
      case 'high': return 'Excelente';
      case 'medium': return 'Bom';
      case 'low': return 'Regular';
      default: return 'Bom';
    }
  }

  getPerformanceIcon(performance: string): string {
    switch(performance) {
      case 'high': return 'pi-trending-up';
      case 'medium': return 'pi-minus';
      case 'low': return 'pi-trending-down';
      default: return 'pi-minus';
    }
  }

  getPerformanceChange(): number {
    switch(this.selectedDateFilter) {
      case '7d': return 12.5;
      case '30d': return 18.3;
      case '3m': return 24.7;
      case '1y': return 35.2;
      default: return 18.3;
    }
  }

  exportReport(type: 'pdf' | 'excel') {
  const sellerId = DEVELOPMENT_CONFIG.DEFAULT_USER_ID;
  this.dashboardService.exportReport(sellerId, type).subscribe(blob => {
    const fileType = type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileExtension = type === 'pdf' ? 'pdf' : 'xlsx';
    const url = window.URL.createObjectURL(new Blob([blob], { type: fileType }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio.${fileExtension}`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.showExportModal = false;
  });
}
}