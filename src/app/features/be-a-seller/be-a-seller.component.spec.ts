import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';

import { BeASellerComponent } from './be-a-seller.component';

describe('BeASellerComponent', () => {
  let component: BeASellerComponent;
  let fixture: ComponentFixture<BeASellerComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockConfirmationService: jasmine.SpyObj<ConfirmationService>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    const confirmationServiceSpy = jasmine.createSpyObj('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [BeASellerComponent, ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: ConfirmationService, useValue: confirmationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BeASellerComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockMessageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    mockConfirmationService = TestBed.inject(ConfirmationService) as jasmine.SpyObj<ConfirmationService>;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.beASellerForm.get('nome')?.value).toBe('');
    expect(component.beASellerForm.get('socialReason')?.value).toBe('');
    expect(component.beASellerForm.get('cpf')?.value).toBe('');
    expect(component.beASellerForm.get('email')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const form = component.beASellerForm;
    
    expect(form.valid).toBeFalsy();
    
    form.get('nome')?.setValue('João');
    form.get('socialReason')?.setValue('Empresa A');
    form.get('cnpj')?.setValue('58.423.459/0001-30');
    form.get('email')?.setValue('joao@email.com');
    form.get('senha')?.setValue('123456');
    
    expect(form.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.beASellerForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();
    
    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBeFalsy();
  });

  it('should validate password minimum length', () => {
    const senhaControl = component.beASellerForm.get('senha');
    
    senhaControl?.setValue('12345');
    expect(senhaControl?.hasError('minlength')).toBeTruthy();
    
    senhaControl?.setValue('123456');
    expect(senhaControl?.hasError('minlength')).toBeFalsy();
  });

  it('should call onSubmit when form is valid', () => {
    spyOn(component, 'onSubmit');
    
    const form = component.beASellerForm;
    form.get('nome')?.setValue('João');
    form.get('socialReason')?.setValue('Empresa A');
    form.get('cnpj')?.setValue('58.423.459/0001-30');
    form.get('email')?.setValue('joao@email.com');
    form.get('senha')?.setValue('123456');
    
    const formElement = fixture.nativeElement.querySelector('form');
    formElement.dispatchEvent(new Event('submit'));
    
    expect(component.onSubmit).toHaveBeenCalled();
  });

  it('should format CNPJ on blur', () => {
    const cnpjControl = component.beASellerForm.get('cpf');
    cnpjControl?.setValue('584234590000130');
    
    component.onCnpjBlur();
    
    expect(cnpjControl?.value).toBe('58.423.459/0001-30');
  });
});