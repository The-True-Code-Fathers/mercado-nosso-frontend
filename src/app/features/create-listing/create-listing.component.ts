import { Component, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms'
import { Router } from '@angular/router'
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { InputTextarea } from 'primeng/inputtextarea'
import { InputNumberModule } from 'primeng/inputnumber'
import { DropdownModule } from 'primeng/dropdown'
import { FileUploadModule } from 'primeng/fileupload'
import { DividerModule } from 'primeng/divider'
import { CardModule } from 'primeng/card'
import { MessageModule } from 'primeng/message'
import { ToastModule } from 'primeng/toast'
import { MessageService } from 'primeng/api'

interface Category {
  label: string
  value: string
}

interface Condition {
  label: string
  value: string
}

@Component({
  selector: 'app-create-listing',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputTextarea,
    InputNumberModule,
    DropdownModule,
    FileUploadModule,
    DividerModule,
    CardModule,
    MessageModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './create-listing.component.html',
  styleUrl: './create-listing.component.scss',
})
export class CreateListingComponent {
  private fb = inject(FormBuilder)
  private router = inject(Router)
  private messageService = inject(MessageService)

  createListingForm!: FormGroup
  isLoading = signal(false)
  uploadedFiles = signal<File[]>([])

  categories: Category[] = [
    { label: 'Eletrônicos', value: 'electronics' },
    { label: 'Roupas e Acessórios', value: 'clothing' },
    { label: 'Casa e Jardim', value: 'home' },
    { label: 'Esportes e Lazer', value: 'sports' },
    { label: 'Livros e Educação', value: 'books' },
    { label: 'Beleza e Saúde', value: 'beauty' },
    { label: 'Automóveis', value: 'automotive' },
    { label: 'Outros', value: 'others' },
  ]

  conditions: Condition[] = [
    { label: 'Novo', value: 'new' },
    { label: 'Usado - Como Novo', value: 'like-new' },
    { label: 'Usado - Bom Estado', value: 'good' },
    { label: 'Usado - Estado Regular', value: 'fair' },
  ]

  ngOnInit() {
    this.initForm()
  }

  private initForm() {
    this.createListingForm = this.fb.group({
      productName: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      condition: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [null, [Validators.required, Validators.min(0.01)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      shippingDeadline: ['', Validators.required],
    })
  }

  onFileSelect(event: any) {
    const files = event.files
    this.uploadedFiles.set([...this.uploadedFiles(), ...files])
  }

  onFileRemove(event: any) {
    const removedFile = event.file
    this.uploadedFiles.update(files =>
      files.filter(file => file !== removedFile),
    )
  }

  onSubmit() {
    if (this.createListingForm.valid) {
      this.isLoading.set(true)

      // Simular envio
      setTimeout(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Anúncio criado com sucesso!',
        })

        this.isLoading.set(false)

        // Redirecionar após 2 segundos
        setTimeout(() => {
          this.router.navigate(['/user/listings'])
        }, 2000)
      }, 2000)
    } else {
      this.markFormGroupTouched()
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.createListingForm.controls).forEach(key => {
      const control = this.createListingForm.get(key)
      control?.markAsTouched()
    })
  }

  goBack() {
    this.router.navigate(['/user'])
  }
}
