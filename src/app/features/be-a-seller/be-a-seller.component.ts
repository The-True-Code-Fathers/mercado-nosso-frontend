import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '../user/services/user.service';

@Component({
  selector: 'be-a-seller',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule,
    ConfirmDialogModule,
    DividerModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: './be-a-seller.component.html',
  styleUrls: ['./be-a-seller.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class BeASellerComponent implements OnInit {
  beASellerForm!: FormGroup;
  isLoading: boolean = false;
  currentUserId: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.initializeForm();
    this.loadCurrentUser();
  }

  private loadCurrentUser() {
    this.currentUserId = localStorage.getItem('currentUserId') || '';

    if (!this.currentUserId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Você precisa estar logado para continuar'
      });
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    this.userService.getUserById(this.currentUserId).subscribe({
      next: (user) => {
        this.beASellerForm.patchValue({
          nome: user.fullName,
          email: user.email
        });
      },
      error: (error) => {
        console.error('Erro ao carregar usuário:', error);
      }
    });
  }

  private initializeForm() {
    this.beASellerForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      socialReason: ['', [Validators.required, Validators.minLength(2)]],
      cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    console.log('=== BE A SELLER DEBUG ===');
    console.log('Current User ID:', this.currentUserId);
    const formData = this.beASellerForm.value;
    console.log('Form Data:', formData);

    const updateRequest = {
      fullName: formData.nome,
      email: formData.email,
      cnpj: this.cleanCnpj(formData.cnpj),
      socialReason: formData.socialReason,
      isSeller: true
    };
    console.log('Update Request:', updateRequest);
    console.log('========================');

    if (this.beASellerForm.valid) {
      this.isLoading = true;

      this.userService.updateUser(this.currentUserId, updateRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Usuário atualizado com sucesso:', response);

          localStorage.setItem('currentUserName', response.fullName);
          localStorage.setItem('currentUserEmail', response.email);
          localStorage.setItem('currentUserIsSeller', 'true');

          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso!',
            detail: 'Parabéns! Você agora é um vendedor!'
          });

          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erro ao tornar-se vendedor:', error);

          let errorMessage = 'Não foi possível completar o cadastro. Tente novamente.';

          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 400) {
            errorMessage = 'Dados inválidos. Verifique as informações e tente novamente.';
          } else if (error.status === 409) {
            errorMessage = 'CNPJ já cadastrado no sistema.';
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: errorMessage
          });
        }
      });
    } else {
      this.markFormGroupTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Por favor, preencha todos os campos obrigatórios.'
      });
    }
  }

  private cleanCnpj(cnpj: string): string {
    return cnpj.replace(/\D/g, '');
  }

  formatCnpj(event: any) {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 14) {
      value = value.substring(0, 14);
    }

    if (value.length > 12) {
      value = value.substring(0, 2) + '.' +
        value.substring(2, 5) + '.' +
        value.substring(5, 8) + '/' +
        value.substring(8, 12) + '-' +
        value.substring(12);
    } else if (value.length > 8) {
      value = value.substring(0, 2) + '.' +
        value.substring(2, 5) + '.' +
        value.substring(5, 8) + '/' +
        value.substring(8);
    } else if (value.length > 5) {
      value = value.substring(0, 2) + '.' +
        value.substring(2, 5) + '.' +
        value.substring(5);
    } else if (value.length > 2) {
      value = value.substring(0, 2) + '.' + value.substring(2);
    }

    event.target.value = value;

  }

  private markFormGroupTouched() {
    Object.keys(this.beASellerForm.controls).forEach(key => {
      const control = this.beASellerForm.get(key);
      control?.markAsTouched();
    });
  }

  onCnpjBlur() {
    const cnpjControl = this.beASellerForm.get('cnpj');
    if (cnpjControl?.value) {
      const cnpj = cnpjControl.value.replace(/\D/g, '');
      if (cnpj.length === 14) {
        const formattedCnpj = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        cnpjControl.setValue(formattedCnpj);
      }
    }
  }

  onlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.beASellerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.beASellerForm.get(fieldName);

    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} é obrigatório`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['email']) {
        return 'E-mail deve ter um formato válido';
      }
      if (field.errors['pattern']) {
        return 'CNPJ deve ter o formato 00.000.000/0000-00';
      }
    }

    return '';
  }
}