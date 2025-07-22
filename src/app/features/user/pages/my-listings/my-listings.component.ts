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

// Services
import {
  ListingService,
  Listing,
} from '../../../listing/services/listing.service'
import { DEVELOPMENT_CONFIG } from '../../../../shared/config/development.config'

export interface MyListing extends Listing {
  status: 'active' | 'outOfStock'
  sold: number
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
    private listingService: ListingService,
  ) {}

  ngOnInit() {
    this.loadMyListings()
  }

  loadMyListings() {
    this.isLoading.set(true)

    // Usar o ID do vendedor da configuração de desenvolvimento
    const sellerId = DEVELOPMENT_CONFIG.DEFAULT_USER_ID

    // Buscar anúncios específicos do vendedor
    this.listingService.getListingsBySellerId(sellerId).subscribe({
      next: listings => {
        const myListings: MyListing[] = listings.map(listing => ({
          ...listing,
          status:
            listing.stock === 0 ? ('outOfStock' as const) : ('active' as const),
          sold: listing.salesCount || 0,
        }))

        this.listings.set(myListings)
        this.isLoading.set(false)
      },
      error: error => {
        console.error('Erro ao carregar anúncios:', error)
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar seus anúncios',
        })
        this.isLoading.set(false)
      },
    })
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
    // Resetar scroll para o topo antes de navegar
    window.scrollTo(0, 0)
    this.router.navigate(['/create-listing'])
  }

  editListing(id: string) {
    // Resetar scroll para o topo antes de navegar
    window.scrollTo(0, 0)
    this.router.navigate(['/edit-listing', id])
  }

  viewListing(id: string) {
    // Resetar scroll para o topo antes de navegar
    window.scrollTo(0, 0)
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
    // Resetar scroll para o topo antes de navegar
    window.scrollTo(0, 0)
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
