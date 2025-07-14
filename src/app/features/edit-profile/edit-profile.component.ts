import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    DividerModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent {
  editProfileForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.editProfileForm = this.formBuilder.group({
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(8)]],
      cep: [''],
      endereco: [''],
      cidade: [''],
      estado: ['']
    });
  }

  sejaVendedor() {
    this.router.navigate(['/sellerRegister']);
  }

  salvarAlteracoes() {
    if (this.editProfileForm.valid) {
      console.log('Dados do formulário:', this.editProfileForm.value);

      // ADICIONE ESTA MENSAGEM DE SUCESSO:
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Perfil atualizado com sucesso!'
      });
    } else {
      // ADICIONE ESTA MENSAGEM DE ERRO:
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Por favor, preencha todos os campos obrigatórios.'
      });
    }
  }

  // ADICIONE ESTES MÉTODOS:
  onCepBlur() {
    const cep = this.editProfileForm.get('cep')?.value;
    if (cep && cep.length === 8) {
      console.log('Buscando CEP:', cep);
      // Aqui você pode integrar com ViaCEP depois
    }
  }

  onCancel() {
    this.confirmationService.confirm({
      message: 'Deseja realmente cancelar? As alterações não salvas serão perdidas.',
      header: 'Confirmar Cancelamento',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.router.navigate(['/profile']);
      }
    });
  }

  onSubmit() {
    this.salvarAlteracoes(); // Chama seu método existente
  }
}