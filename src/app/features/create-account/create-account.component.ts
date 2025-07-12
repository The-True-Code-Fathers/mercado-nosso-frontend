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
    ButtonModule
  ],
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class CreateAccountComponent implements OnInit {
  createAccountForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

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

  onSubmit() {
    if (this.createAccountForm.valid) {
      const formData = this.createAccountForm.value;
      
      console.log('Dados do cadastro:', formData);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Conta criada com sucesso!'
      });
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
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
}
