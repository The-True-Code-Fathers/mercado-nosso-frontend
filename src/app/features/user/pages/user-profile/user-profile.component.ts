import { Component } from '@angular/core'
import { DEVELOPMENT_CONFIG } from '../../../../shared/config/development.config'
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
            <h3>Perfil</h3>
            <ng-container *ngIf="isLoggedIn(); else createAccount">
              <p>Gerencie seu perfil e informações pessoais.</p>
              <p-button
                label="Editar Perfil"
                icon="pi pi-user-edit"
                routerLink="/edit-profile"
                styleClass="p-button-primary"
              ></p-button>
            </ng-container>
            <ng-template #createAccount>
              <div style="margin-bottom: 1.5rem;">
                <p>Já possui uma conta?</p>
                <p-button
                  label="Fazer Login"
                  icon="pi pi-sign-in"
                  routerLink="/login"
                  styleClass="p-button-primary mb-2"
                ></p-button>
              </div>
              <div>
                <p>Não possui uma conta? Crie uma!</p>
                <p-button
                  label="Criar Conta"
                  icon="pi pi-user-plus"
                  routerLink="/register"
                  styleClass="p-button-success"
                ></p-button>
              </div>
            </ng-template>
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
export class UserProfileComponent {
  isLoggedIn(): boolean {
    return (
      !!DEVELOPMENT_CONFIG.DEFAULT_USER_ID &&
      DEVELOPMENT_CONFIG.DEFAULT_USER_ID.length > 10
    )
  }
}
