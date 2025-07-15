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
      dataNascimento: ['', [Validators.required]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private cleanCpf(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  private generateTempCnpj(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString().slice(2, 8);
  return `${timestamp}${random}`.padStart(14, '0').slice(0, 14);
}

  onSubmit() {
    if (this.createAccountForm.valid) {
      this.isLoading = true; 
      const formData = this.createAccountForm.value;

      console.log('Form data bruto:', formData);
      console.log('Nome:', formData.nome);
      console.log('Sobrenome:', formData.sobrenome);
      console.log('Email:', formData.email);
      console.log('CPF:', formData.cpf);
      console.log('Senha:', formData.senha);
      
      const userPayload = {
        fullName: `${formData.nome} ${formData.sobrenome}`,
        email: formData.email,
        passwordHash: formData.senha,
        cpf: this.cleanCpf(formData.cpf),
        cnpj: '',
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

  onCpfBlur() {
    const cpfControl = this.createAccountForm.get('cpf');
    if (cpfControl?.value) {
      const cpf = cpfControl.value.replace(/\D/g, '');
      if (cpf.length === 11) {
        const formattedCpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        cpfControl.setValue(formattedCpf);
      }
    }
  }

  onDataNascimentoBlur() {
    const dataControl = this.createAccountForm.get('dataNascimento');
    if (dataControl?.value) {
      const data = dataControl.value.replace(/\D/g, '');
      if (data.length === 8) {
        const formattedData = data.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
        dataControl.setValue(formattedData);
      }
    }
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
    }

    if (!file.type.startsWith('image/')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Apenas imagens são permitidas.'
      });
      return
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;

    console.log('Arquivo selecionado:', file);
  }
}
