import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';

import { CreateAccountComponent } from './create-account.component';

describe('CreateAccountComponent', () => {
  let component: CreateAccountComponent;
  let fixture: ComponentFixture<CreateAccountComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockConfirmationService: jasmine.SpyObj<ConfirmationService>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    const confirmationServiceSpy = jasmine.createSpyObj('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [CreateAccountComponent, ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: ConfirmationService, useValue: confirmationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAccountComponent);
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
    expect(component.createAccountForm.get('nome')?.value).toBe('');
    expect(component.createAccountForm.get('sobrenome')?.value).toBe('');
    expect(component.createAccountForm.get('dataNascimento')?.value).toBe('');
    expect(component.createAccountForm.get('cpf')?.value).toBe('');
    expect(component.createAccountForm.get('email')?.value).toBe('');
    expect(component.createAccountForm.get('senha')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const form = component.createAccountForm;
    
    expect(form.valid).toBeFalsy();
    
    form.get('nome')?.setValue('João');
    form.get('sobrenome')?.setValue('Silva');
    form.get('dataNascimento')?.setValue('01/01/1990');
    form.get('cpf')?.setValue('123.456.789-00');
    form.get('email')?.setValue('joao@email.com');
    form.get('senha')?.setValue('123456');
    
    expect(form.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.createAccountForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();
    
    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBeFalsy();
  });

  it('should validate password minimum length', () => {
    const senhaControl = component.createAccountForm.get('senha');
    
    senhaControl?.setValue('12345');
    expect(senhaControl?.hasError('minlength')).toBeTruthy();
    
    senhaControl?.setValue('123456');
    expect(senhaControl?.hasError('minlength')).toBeFalsy();
  });

  it('should call onSubmit when form is valid', () => {
    spyOn(component, 'onSubmit');
    
    const form = component.createAccountForm;
    form.get('nome')?.setValue('João');
    form.get('sobrenome')?.setValue('Silva');
    form.get('dataNascimento')?.setValue('01/01/1990');
    form.get('cpf')?.setValue('123.456.789-00');
    form.get('email')?.setValue('joao@email.com');
    form.get('senha')?.setValue('123456');
    
    const formElement = fixture.nativeElement.querySelector('form');
    formElement.dispatchEvent(new Event('submit'));
    
    expect(component.onSubmit).toHaveBeenCalled();
  });

  it('should format CPF on blur', () => {
    const cpfControl = component.createAccountForm.get('cpf');
    cpfControl?.setValue('12345678900');
    
    component.onCpfBlur();
    
    expect(cpfControl?.value).toBe('123.456.789-00');
  });

  it('should format date on blur', () => {
    const dataControl = component.createAccountForm.get('dataNascimento');
    dataControl?.setValue('01011990');
    
    component.onDataNascimentoBlur();
    
    expect(dataControl?.value).toBe('01/01/1990');
  });
});
