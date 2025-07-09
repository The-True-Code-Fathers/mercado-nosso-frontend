import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationService, MessageService } from 'primeng/api';

import { CartComponent } from './cart.component';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [ConfirmationService, MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total items correctly', () => {
    const initialItemCount = component.totalItems();
    expect(initialItemCount).toBeGreaterThan(0);
  });

  it('should update quantity correctly', () => {
    const itemId = '1';
    const newQuantity = 5;
    component.updateQuantity(itemId, newQuantity);

    const updatedItem = component
      .cartItems()
      .find((item) => item.id === itemId);
    expect(updatedItem?.quantity).toBe(newQuantity);
  });

  it('should calculate subtotal correctly', () => {
    const subtotal = component.subtotal();
    expect(subtotal).toBeGreaterThan(0);
  });
});
