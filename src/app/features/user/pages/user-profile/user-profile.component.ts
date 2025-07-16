import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'
import { TabViewModule } from 'primeng/tabview'

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    TabViewModule,
  ],
  template: `
    <div class="user-profile-container">
      <h1><i class="pi pi-user mr-2"></i>Minha Conta</h1>

      <p-tabView>
        <p-tabPanel header="Perfil" leftIcon="pi pi-user">
          <p-card>
            <h3>Informações do Usuário</h3>
            <p>Esta funcionalidade está em desenvolvimento.</p>
            <p-button
              label="Voltar para Home"
              icon="pi pi-home"
              routerLink="/home"
            >
            </p-button>
          </p-card>
        </p-tabPanel>

        <p-tabPanel header="Pedidos" leftIcon="pi pi-shopping-bag">
          <p-card>
            <h3>Meus Pedidos</h3>
            <p>Visualize o histórico das suas compras.</p>
            <p-button
              label="Ver Minhas Compras"
              icon="pi pi-shopping-bag"
              routerLink="/user/my-purchases"
              styleClass="p-button-outlined"
            >
            </p-button>
          </p-card>
        </p-tabPanel>

        <p-tabPanel header="Anúncios" leftIcon="pi pi-list">
          <p-card>
            <h3>Meus Anúncios</h3>
            <p>Gerencie seus produtos e anúncios.</p>
            <p-button
              label="Ver Meus Anúncios"
              icon="pi pi-list"
              routerLink="/user/my-listings"
              styleClass="p-button-outlined"
            >
            </p-button>
          </p-card>
        </p-tabPanel>

        <p-tabPanel header="Configurações" leftIcon="pi pi-cog">
          <p-card>
            <h3>Configurações da Conta</h3>
            <p>Gerencie suas preferências e configurações.</p>
            <p-button
              label="Editar informações"
              icon="pi pi-home"
              routerLink="/edit-profile"
            >
            </p-button>
          </p-card>
        </p-tabPanel>
      </p-tabView>
    </div>
  `,
  styles: [
    `
      .user-profile-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: var(--spacing-xl) var(--spacing-lg);

        h1 {
          display: flex;
          align-items: center;
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-xl);
        }
      }
    `,
  ],
})
export class UserProfileComponent {}
