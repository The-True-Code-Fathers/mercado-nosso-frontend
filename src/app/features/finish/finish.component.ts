import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { RatingModule } from 'primeng/rating';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-finish',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    BadgeModule,
    RatingModule,
    DividerModule
  ],
  templateUrl: './finish.component.html',
  styleUrl: './finish.component.scss',
})
export class FinishComponent {
  searchTerm: string = '';

  orderInfo = [
    {
    orderNumber: '12345',
    userName: 'Nome do Usuário',
    itemName: 'Nome do item',
    itemPhoto: 'pi pi-desktop',
    itemQuantity: '5',
    itemPrice: "R$XXXX",
    deliveryTime: "dd e dd de mm"
  }
]

}

