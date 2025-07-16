import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    TableModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  // Dados para os cards
  totalVendas = 'R$ 125.450';
  novasVendas = 127;

  // Dados para o gráfico
  chartData: any;
  chartOptions: any;

  // Dados para a tabela de itens mais vendidos
  itensMaisVendidos = [
    { id: 1, nome: 'Smartphone Galaxy S24', quantidade: 45, valorAcumulado: 'R$ 67.500' },
    { id: 2, nome: 'Notebook Dell Inspiron', quantidade: 32, valorAcumulado: 'R$ 48.000' },
    { id: 3, nome: 'Fone Bluetooth JBL', quantidade: 78, valorAcumulado: 'R$ 15.600' },
    { id: 4, nome: 'Tablet Samsung Tab A8', quantidade: 23, valorAcumulado: 'R$ 11.500' }
  ];

  ngOnInit() {
    this.initChartData();
  }

  initChartData() {
    this.chartData = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
      datasets: [
        {
          label: 'Vendas',
          data: [65, 59, 80, 81, 56, 89, 95],
          fill: false,
          borderColor: '#42A5F5',
          backgroundColor: 'rgba(66, 165, 245, 0.1)',
          tension: 0.4
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#6c757d'
          },
          grid: {
            color: '#e9ecef'
          }
        },
        y: {
          ticks: {
            color: '#6c757d'
          },
          grid: {
            color: '#e9ecef'
          }
        }
      }
    };
  }
}
