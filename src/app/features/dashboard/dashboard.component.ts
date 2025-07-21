import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { DashboardService } from './dashboard.service';

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

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.dashboardService.getDashboardData().subscribe(data => {
      this.totalVendas = data.totalVendas;
      this.totalVendasMes = data.totalVendasMes;
      this.produtosAtivos = data.produtosAtivos;
      this.mediaAvaliacoes = data.mediaAvaliacoes;
      this.itensMaisVendidos = data.itensMaisVendidos;
      this.chartData = data.chartData;
      this.chartOptions = data.chartOptions;
      this.barChartData = data.barChartData;
      this.barChartOptions = data.barChartOptions;
    });
  }

  onDateFilterChange() {
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
}