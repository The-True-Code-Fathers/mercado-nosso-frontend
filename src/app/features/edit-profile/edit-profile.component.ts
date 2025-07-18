import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { PasswordModule } from 'primeng/password'
import { CardModule } from 'primeng/card'
import { Router } from '@angular/router'
import { ToastModule } from 'primeng/toast'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { DividerModule } from 'primeng/divider'
import { MessageService, ConfirmationService } from 'primeng/api'
import { HttpClient } from '@angular/common/http'
import { InputMaskModule } from 'primeng/inputmask'
import { UpdateUserRequest } from '../user/services/user.service'
import { UserService } from '../user/services/user.service'
import { DEVELOPMENT_CONFIG } from '../../shared/config/development.config'

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    DividerModule,
    InputMaskModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss',
})
export class EditProfileComponent implements OnInit {
  editProfileForm: FormGroup
  selectedFileName: string = ''
  selectedFile: File | null = null
  cepLoading: boolean = false
  cepError: string | null = null
  currentUserId: string = ''
  isLoading: boolean = false

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private http: HttpClient,
    private userService: UserService,
  ) {
    this.editProfileForm = this.formBuilder.group({
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefone: [''],
      cep: [''],
      endereco: [''],
      cidade: [''],
      estado: [''],
    })
  }

  ngOnInit() {
    this.currentUserId = DEVELOPMENT_CONFIG.DEFAULT_USER_ID
    if (this.currentUserId && this.currentUserId !== '0') {
      this.loadUserData()
    }
  }

  private loadUserData() {
    this.isLoading = true
    this.userService.getUserById(this.currentUserId).subscribe({
      next: userData => {
        this.isLoading = false
        this.editProfileForm.patchValue({
          nome: userData.fullName,
          email: userData.email,
          telefone: userData.telephoneNumber || '',
        })
      },
      error: error => {
        this.isLoading = false
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar dados do usuário',
        })
      },
    })
  }

  sejaVendedor() {
    this.router.navigate(['/sellerRegister'])
  }

  salvarAlteracoes() {
    if (this.editProfileForm.valid) {
      console.log('Dados do formulário:', this.editProfileForm.value)

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Perfil atualizado com sucesso!',
      })
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Por favor, preencha todos os campos obrigatórios.',
      })
    }
  }

  onCepBlur() {
    const cep = this.editProfileForm.get('cep')?.value
    if (cep && cep.length >= 8) {
      this.buscarCepAutomatico(cep)
    }
  }

  onCepComplete(event: any) {
    const cep = event.target.value
    console.log('CEP completo:', cep)

    if (cep && cep.replace(/\D/g, '').length === 8) {
      this.buscarCepAutomatico(cep)
    }
  }

  onCancel() {
    this.confirmationService.confirm({
      message:
        'Deseja realmente cancelar? As alterações não salvas serão perdidas.',
      header: 'Confirmar Cancelamento',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.router.navigate(['/profile'])
      },
    })
  }

  onSubmit() {
    if (this.editProfileForm.valid) {
      this.isLoading = true
      const formData = this.editProfileForm.value

      const updatePayload: UpdateUserRequest = {
        fullName: formData.nome,
        email: formData.email,
        telephoneNumber: this.cleanFormat(formData.telefone),
        profilePictureUrl: this.selectedFile ? 'URL_DA_IMAGEM' : undefined,
      }

      this.userService.updateUser(this.currentUserId, updatePayload).subscribe({
        next: response => {
          this.isLoading = false
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Perfil atualizado com sucesso!',
          })
        },
        error: error => {
          this.isLoading = false
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao atualizar perfil',
          })
        },
      })
    }
  }

  onFileSelect(event: any) {
    const file = event.target.files[0]

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Arquivo muito grande. Tamanho máximo 5Mb',
        })
        return
      }
    }

    if (!file.type.startsWith('image/')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Apenas imagens são permitidas.',
      })
      return
    }

    this.selectedFile = file
    this.selectedFileName = file.name

    console.log('Arquivo selecionado:', file)
  }

  formatCep(event: any) {
    let value = event.target.value.replace(/\D/g, '')

    if (value.length > 8) {
      value = value.substring(0, 8)
    }

    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5)
    }

    event.target.value = value

    this.editProfileForm.patchValue({ cep: value })

    if (value.replace('-', '').length === 8) {
      this.buscarCepAutomatico(value)
    }
  }

  private buscarCepAutomatico(cep: string) {
    const cepLimpo = cep.replace(/\D/g, '')

    if (cepLimpo.length !== 8) {
      return
    }

    this.cepLoading = true
    this.cepError = null

    this.http
      .get<any>(`https://brasilapi.com.br/api/cep/v2/${cepLimpo}`)
      .subscribe({
        next: cepData => {
          this.cepLoading = false

          this.editProfileForm.patchValue({
            endereco: cepData.street || '',
            cidade: cepData.city || '',
            estado: cepData.state || '',
          })

          this.messageService.add({
            severity: 'success',
            summary: 'CEP encontrado',
            detail: `${cepData.city} - ${cepData.state}`,
            life: 3000,
          })
        },
        error: error => {
          this.cepLoading = false
          this.cepError =
            error.status === 404
              ? 'CEP não encontrado'
              : 'Erro ao consultar CEP'

          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: this.cepError,
            life: 3000,
          })
        },
      })
  }

  debugForm() {
    console.log('=== DEBUG FORMULÁRIO ===')
    console.log('Form válido?', this.editProfileForm.valid)
    console.log('Form value:', this.editProfileForm.value)
    console.log('Form errors:', this.editProfileForm.errors)

    // Verificar cada campo
    Object.keys(this.editProfileForm.controls).forEach(key => {
      const control = this.editProfileForm.get(key)
      console.log(`${key}:`, {
        value: control?.value,
        valid: control?.valid,
        errors: control?.errors,
      })
    })

    console.log('========================')

    this.salvarAlteracoes()
  }

  formatTelefone(event: any) {
    let value = event.target.value.replace(/\D/g, '')

    if (value.length > 11) {
      value = value.substring(0, 11)
    }

    if (value.length > 7) {
      value =
        '(' +
        value.substring(0, 2) +
        ') ' +
        value.substring(2, 7) +
        '-' +
        value.substring(7)
    } else if (value.length > 2) {
      value = '(' + value.substring(0, 2) + ') ' + value.substring(2)
    } else if (value.length > 0) {
      value = '(' + value
    }

    event.target.value = value

    this.editProfileForm.patchValue({ telefone: value })
  }

  cleanFormat(value: string): string {
    return value.replace(/\D/g, '')
  }
}
