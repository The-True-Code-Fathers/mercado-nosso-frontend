import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-navigation.component.html',
  styleUrls: ['./checkout-navigation.component.scss']
})
export class CheckoutNavigationComponent {
  @Input() showBack = true;
  @Input() showContinue = true;
  @Input() backLabel = 'Voltar';
  @Input() continueLabel = 'Continuar';
  @Input() continueDisabled = false;
  @Input() backIcon = 'pi pi-chevron-left';
  @Input() continueIcon = 'pi pi-chevron-right';
  @Input() isLoading = false;
  @Input() step: 'shipping' | 'payment' | 'confirmation' = 'shipping';

  @Output() onBack = new EventEmitter<void>();
  @Output() onContinue = new EventEmitter<void>();

  handleBack(): void {
    if (!this.isLoading) {
      this.onBack.emit();
    }
  }

  handleContinue(): void {
    if (!this.continueDisabled && !this.isLoading) {
      this.onContinue.emit();
    }
  }
}
