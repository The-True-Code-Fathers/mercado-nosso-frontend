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
import { HttpClientModule } from '@angular/common/http'; 
import { UserService } from '../user/services/user.service';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule,
    ConfirmDialogModule,
    DividerModule,
    InputTextModule,
    ButtonModule,
    HttpClientModule
  ],
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class CreateAccountComponent implements OnInit {
  createAccountForm!: FormGroup;
  selectedFileName: string = '';
  selectedFile: File | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.createAccountForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      sobrenome: ['', [Validators.required, Validators.minLength(2)]],
      dataNascimento: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}\/\d{4}$/)]], // CORRIGIDO
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  formatCpf(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    
    if (value.length > 9) {
      value = value.substring(0, 3) + '.' + 
              value.substring(3, 6) + '.' + 
              value.substring(6, 9) + '-' + 
              value.substring(9);
    } else if (value.length > 6) {
      value = value.substring(0, 3) + '.' + 
              value.substring(3, 6) + '.' + 
              value.substring(6);
    } else if (value.length > 3) {
      value = value.substring(0, 3) + '.' + value.substring(3);
    }
    
    event.target.value = value;
    this.createAccountForm.patchValue({ cpf: value });
  }

  formatDataNascimento(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length > 8) {
      value = value.substring(0, 8);
    }
    
    if (value.length > 4) {
      value = value.substring(0, 2) + '/' + 
              value.substring(2, 4) + '/' + 
              value.substring(4);
    } else if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    
    event.target.value = value;
    this.createAccountForm.patchValue({ dataNascimento: value });
  }

  cleanFormat(value: string): string {
    return value.replace(/\D/g, '');
  }

  convertDateToISO(dateString: string): string {
    const cleanDate = dateString.replace(/\D/g, '');
    if (cleanDate.length === 8) {
      const day = cleanDate.substring(0, 2);
      const month = cleanDate.substring(2, 4);
      const year = cleanDate.substring(4, 8);
      return `${year}-${month}-${day}`;
    }
    return dateString;
  }

  onSubmit() {
    if (this.createAccountForm.valid) {
      this.isLoading = true; 
      const formData = this.createAccountForm.value;

      const userPayload = {
        fullName: `${formData.nome} ${formData.sobrenome}`,
        email: formData.email,
        passwordHash: formData.senha,
        cpf: this.cleanFormat(formData.cpf),
        cnpj: '',
        dataDeNascimento: formData.dataNascimento,  
        isSeller: false 
      };

      console.log('Payload para API:', userPayload);

      this.userService.createUser(userPayload).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Usuário criado:', response);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Conta criada com sucesso!'
          });

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erro ao criar usuário:', error);
          
          let errorMessage = 'Erro interno do servidor';
          
          if (error.status === 400) {
            errorMessage = 'Dados inválidos. Verifique os campos.';
          } else if (error.status === 409) {
            errorMessage = 'E-mail ou CPF já cadastrado.';
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

  private markFormGroupTouched() {
    Object.keys(this.createAccountForm.controls).forEach(key => {
      const control = this.createAccountForm.get(key);
      control?.markAsTouched();
    });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Arquivo muito grande. Tamanho máximo 5Mb'
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Apenas imagens são permitidas.'
        });
        return;
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;
      console.log('Arquivo selecionado:', file);
    }
  }
}