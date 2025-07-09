import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';

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
            <p>Aqui você verá o histórico dos seus pedidos.</p>
          </p-card>
        </p-tabPanel>

        <p-tabPanel header="Configurações" leftIcon="pi pi-cog">
          <p-card>
            <h3>Configurações da Conta</h3>
            <p>Gerencie suas preferências e configurações.</p>
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
