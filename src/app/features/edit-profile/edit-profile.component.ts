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
import { HttpClient } from '@angular/common/http';

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
  selectedFileName: string = '';
  selectedFile: File | null = null;
  cepLoading: boolean = false;
  cepError: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private http: HttpClient
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

  onCepBlur() {
    const cep = this.editProfileForm.get('cep')?.value;
    if (cep && cep.length >= 8) {
      this.buscarCepAutomatico(cep);
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
    this.salvarAlteracoes();
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

  formatCep(event: any) {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 8) {
      value = value.substring(0,8);
    }

    if (value.length > 5) {
      value = value.substring(0,5) + '-' + value.substring(5);
    }

    event.target.value = value;


    if (value.replace('-','').length === 8) {
      this.buscarCepAutomatico(value);
    }
  }

  private buscarCepAutomatico(cep: string) {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length != 8) {
      return;
    }

    this.cepLoading = true;
    this.cepError = null;

    this.http.get<any>(`https://brasilapi.com.br/api/cep/v2/${cepLimpo}`)
      .subscribe({
        next: (cepData) => {
          this.cepLoading = false;
          
          console.log('CEP encontrado:', cepData);
          
          // Preenche automaticamente os campos
          this.editProfileForm.patchValue({
            endereco: cepData.street || '',
            cidade: cepData.city || '',
            estado: cepData.state || ''
          });
          
          this.messageService.add({
            severity: 'success',
            summary: 'CEP encontrado',
            detail: `${cepData.city} - ${cepData.state}`,
            life: 3000
          });
        },
        error: (error) => {
          this.cepLoading = false;
          console.error('Erro ao buscar CEP:', error);
          
          if (error.status === 404) {
            this.cepError = 'CEP não encontrado';
          } else {
            this.cepError = 'Erro ao consultar CEP';
          }
          
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: this.cepError,
            life: 3000
          });
        }
      });
  }
}
