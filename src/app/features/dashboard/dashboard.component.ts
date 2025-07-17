import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardModule,
    ChartModule,
    TableModule,
    DropdownModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  
  // Propriedades principais
  totalVendas = 'R$ 125.450';
  totalVendasMes = 'R$ 28.900';
  produtosAtivos = 8;
  mediaAvaliacoes = '4.7';

  // Filtros de data
  dateFilterOptions = [
    { label: 'Últimos 7 dias', value: '7d' },
    { label: 'Últimos 30 dias', value: '30d' },
    { label: 'Últimos 3 meses', value: '3m' },
    { label: 'Último ano', value: '1y' }
  ];
  selectedDateFilter = '30d';

  // Dados do gráfico
  chartData: any;
  chartOptions: any;
  barChartData: any;
  barChartOptions: any;

  // Dados da tabela - ordenados por quantidade decrescente
  itensMaisVendidos = [
    { 
      id: 5, 
      nome: 'Mouse Gamer Logitech', 
      quantidade: 156, 
      valorAcumulado: '9.360',
      performance: 'high'
    },
    { 
      id: 3, 
      nome: 'Fone Bluetooth JBL', 
      quantidade: 78, 
      valorAcumulado: '15.600',
      performance: 'high'
    },
    { 
      id: 1, 
      nome: 'Smartphone Galaxy S24', 
      quantidade: 45, 
      valorAcumulado: '67.500',
      performance: 'high'
    },
    { 
      id: 2, 
      nome: 'Notebook Dell Inspiron', 
      quantidade: 32, 
      valorAcumulado: '48.000',
      performance: 'high'
    },
    { 
      id: 4, 
      nome: 'Tablet Samsung Tab A8', 
      quantidade: 23, 
      valorAcumulado: '11.500',
      performance: 'medium'
    }
  ];

  ngOnInit() {
    this.initChartData();
    this.initBarChartData();
    this.updateMetrics();
  }

  // Inicializa os dados do gráfico com cores do design system
  initChartData() {
    this.chartData = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
      datasets: [
        {
          label: 'Vendas Mensais',
          data: [12500, 15800, 18900, 22300, 19500, 25600, 28900],
          fill: true,
          borderColor: '#1B5E20', // cor primária do design system
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
            font: {
              size: 12,
              weight: 'bold'
            }
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
          ticks: {
            color: '#757575',
            font: {
              size: 11
            }
          },
          grid: {
            color: '#E0E0E0',
            display: true
          }
        },
        y: {
          ticks: {
            color: '#757575',
            font: {
              size: 11
            },
            callback: function(value: any) {
              return 'R$ ' + value.toLocaleString('pt-BR');
            }
          },
          grid: {
            color: '#E0E0E0',
            display: true
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    };
  }

  // Inicializa o gráfico de barras dos produtos mais vendidos
  initBarChartData() {
    const topProducts = this.itensMaisVendidos.slice(0, 5);
    
    this.barChartData = {
      labels: topProducts.map(item => item.nome.length > 15 ? item.nome.substring(0, 15) + '...' : item.nome),
      datasets: [
        {
          label: 'Quantidade Vendida',
          data: topProducts.map(item => item.quantidade),
          backgroundColor: [
            'rgba(27, 94, 32, 0.8)',    // Verde primário
            'rgba(255, 179, 0, 0.8)',   // Amarelo secundário
            'rgba(33, 150, 243, 0.8)',  // Azul
            'rgba(76, 175, 80, 0.8)',   // Verde claro
            'rgba(255, 152, 0, 0.8)'    // Laranja
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

    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#212121',
          bodyColor: '#212121',
          borderColor: '#1B5E20',
          borderWidth: 1,
          callbacks: {
            label: (context: any) => {
              return `Vendidos: ${context.parsed.y} unidades`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#757575',
            font: {
              size: 10
            },
            maxRotation: 45,
            minRotation: 0
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#757575',
            font: {
              size: 11
            },
            callback: function(value: any) {
              return value + ' un';
            }
          },
          grid: {
            color: '#E0E0E0',
            display: true
          }
        }
      }
    };
  }

  // Método para mudança de filtro de data
  onDateFilterChange() {
    // Aqui você implementaria a lógica para filtrar os dados baseado no período selecionado
    console.log('Filtro de data alterado para:', this.selectedDateFilter);
    // Por enquanto, apenas atualiza os gráficos com dados mock
    this.updateChartsForDateFilter();
  }

  // Atualiza gráficos baseado no filtro de data
  updateChartsForDateFilter() {
    // Mock data baseado no filtro selecionado
    let mockData: number[] = [];
    let labels: string[] = [];

    switch(this.selectedDateFilter) {
      case '7d':
        labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        mockData = [4200, 3800, 5100, 4600, 5800, 6200, 4900];
        this.totalVendasMes = 'R$ 34.700';
        break;
      case '30d':
        labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
        mockData = [22300, 25600, 28900, 31200];
        this.totalVendasMes = 'R$ 108.000';
        break;
      case '3m':
        labels = ['Mês 1', 'Mês 2', 'Mês 3'];
        mockData = [78500, 85200, 94800];
        this.totalVendasMes = 'R$ 258.500';
        break;
      case '1y':
        labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        mockData = [185000, 220000, 195000, 240000];
        this.totalVendasMes = 'R$ 840.000';
        break;
      default:
        labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
        mockData = [12500, 15800, 18900, 22300, 19500, 25600, 28900];
        this.totalVendasMes = 'R$ 143.500';
    }

    this.chartData = {
      ...this.chartData,
      labels: labels,
      datasets: [{
        ...this.chartData.datasets[0],
        data: mockData
      }]
    };
  }

  // Atualiza métricas calculadas
  updateMetrics() {
    // Aqui você pode calcular métricas baseadas nos dados
    this.produtosAtivos = this.itensMaisVendidos.length;
    
    // Calcular total de vendas baseado nos produtos
    const totalCalculado = this.itensMaisVendidos.reduce((total, item) => {
      return total + parseFloat(item.valorAcumulado.replace('.', ''));
    }, 0);
    
    this.totalVendas = `R$ ${totalCalculado.toLocaleString('pt-BR')}`;
  }

  // Método para determinar classe de performance
  getPerformanceClass(performance: string): string {
    switch(performance) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  }

  // Método para texto da performance
  getPerformanceText(performance: string): string {
    switch(performance) {
      case 'high': return 'Excelente';
      case 'medium': return 'Bom';
      case 'low': return 'Regular';
      default: return 'Bom';
    }
  }

  // Método para ícone da performance
  getPerformanceIcon(performance: string): string {
    switch(performance) {
      case 'high': return 'pi-trending-up';
      case 'medium': return 'pi-minus';
      case 'low': return 'pi-trending-down';
      default: return 'pi-minus';
    }
  }

  // Método para calcular mudança de performance
  getPerformanceChange(): number {
    // Mock calculation baseado no período selecionado
    switch(this.selectedDateFilter) {
      case '7d': return 12.5;
      case '30d': return 18.3;
      case '3m': return 24.7;
      case '1y': return 35.2;
      default: return 18.3;
    }
  }
}