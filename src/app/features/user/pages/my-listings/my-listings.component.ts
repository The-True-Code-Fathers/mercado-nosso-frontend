import { Component, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'

// PrimeNG imports
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'
import { TagModule } from 'primeng/tag'
import { BadgeModule } from 'primeng/badge'
import { MenuModule } from 'primeng/menu'
import { SkeletonModule } from 'primeng/skeleton'
import { ToastModule } from 'primeng/toast'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api'

export interface MyListing {
  id: string
  title: string
  price: number
  image: string
  status: 'active' | 'outOfStock'
  sold: number
  stock: number
  createdAt: Date
  category: string
}

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TagModule,
    BadgeModule,
    MenuModule,
    SkeletonModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './my-listings.component.html',
  styleUrls: ['./my-listings.component.scss'],
})
export class MyListingsComponent implements OnInit {
  listings = signal<MyListing[]>([])
  isLoading = signal<boolean>(false)
  selectedTab = signal<string>('all')

  // Menu items para cada anúncio
  getMenuItems(listing: MyListing): MenuItem[] {
    return [
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.editListing(listing.id),
      },
      {
        label: listing.status === 'active' ? 'Marcar como Esgotado' : 'Ativar',
        icon: listing.status === 'active' ? 'pi pi-times' : 'pi pi-check',
        command: () => this.toggleListingStatus(listing.id),
      },
      {
        label: 'Duplicar',
        icon: 'pi pi-copy',
        command: () => this.duplicateListing(listing.id),
      },
      {
        separator: true,
      },
      {
        label: 'Excluir',
        icon: 'pi pi-trash',
        styleClass: 'text-red-500',
        command: () => this.confirmDelete(listing.id),
      },
    ]
  }

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit() {
    this.loadMyListings()
  }

  loadMyListings() {
    this.isLoading.set(true)

    // Simular dados mockados - substituir por chamada real da API
    setTimeout(() => {
      const mockListings: MyListing[] = [
        {
          id: '1',
          title: 'Processador Intel Core i7-12700K 12ª Geração',
          price: 999.99,
          image: '/images/banner.png',
          status: 'active',
          sold: 23,
          stock: 15,
          createdAt: new Date('2024-01-15'),
          category: 'Eletrônicos',
        },
        {
          id: '2',
          title: 'Memória RAM DDR4 16GB Corsair Vengeance',
          price: 299.99,
          image: '/images/banner-lg.jpg',
          status: 'active',
          sold: 12,
          stock: 8,
          createdAt: new Date('2024-01-10'),
          category: 'Eletrônicos',
        },
        {
          id: '3',
          title: 'SSD NVMe 1TB Samsung 980 Pro',
          price: 549.99,
          image: '/images/banner.png',
          status: 'outOfStock',
          sold: 45,
          stock: 0,
          createdAt: new Date('2024-01-05'),
          category: 'Eletrônicos',
        },
        {
          id: '4',
          title: 'Placa de Vídeo RTX 4070 Ti',
          price: 2499.99,
          image: '/images/banner-lg.jpg',
          status: 'active',
          sold: 8,
          stock: 3,
          createdAt: new Date('2023-12-20'),
          category: 'Eletrônicos',
        },
      ]

      this.listings.set(mockListings)
      this.isLoading.set(false)
    }, 1000)
  }

  getFilteredListings() {
    const tab = this.selectedTab()
    if (tab === 'all') return this.listings()
    return this.listings().filter(listing => listing.status === tab)
  }

  getActiveCount() {
    return this.listings().filter(l => l.status === 'active').length
  }

  getSoldCount() {
    return this.listings().filter(l => l.status === 'outOfStock').length
  }

  getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    switch (status) {
      case 'active':
        return 'success'
      case 'outOfStock':
        return 'info'
      default:
        return 'info'
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'outOfStock':
        return 'Esgotado'
      default:
        return status
    }
  }

  selectTab(tab: string) {
    this.selectedTab.set(tab)
  }

  createNewListing() {
    this.router.navigate(['/create-listing'])
  }

  editListing(id: string) {
    this.router.navigate(['/edit-listing', id])
  }

  viewListing(id: string) {
    this.router.navigate(['/listing', id])
  }

  toggleListingStatus(id: string) {
    const listing = this.listings().find(l => l.id === id)
    if (listing) {
      const newStatus = listing.status === 'active' ? 'outOfStock' : 'active'
      const action =
        newStatus === 'active' ? 'ativado' : 'marcado como esgotado'

      // Atualizar status localmente
      this.listings.update(listings =>
        listings.map(l =>
          l.id === id ? { ...l, status: newStatus as any } : l,
        ),
      )

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: `Anúncio ${action} com sucesso`,
      })
    }
  }

  duplicateListing(id: string) {
    this.router.navigate(['/create-listing'], {
      queryParams: { duplicate: id },
    })
  }

  confirmDelete(id: string) {
    this.confirmationService.confirm({
      message:
        'Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.deleteListing(id)
      },
    })
  }

  deleteListing(id: string) {
    this.listings.update(listings => listings.filter(l => l.id !== id))
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Anúncio excluído com sucesso',
    })
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }
}
