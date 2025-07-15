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
import { ListingService } from '../listing/services/listing.service'
import { DEVELOPMENT_CONFIG } from '../../shared/config/development.config'

interface Category {
  label: string
  value: string
}

interface Condition {
  label: string
  value: string
}

interface ProductCondition {
  label: string
  value: 'NEW' | 'USED'
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
  private listingService = inject(ListingService)

  createListingForm!: FormGroup
  isLoading = signal(false)
  uploadedFiles = signal<File[]>([])

  // Usar o sellerId da configuração de desenvolvimento
  private readonly sellerId = DEVELOPMENT_CONFIG.DEFAULT_USER_ID
  categories: Category[] = [
    { label: 'Eletrônicos', value: 'ELECTRONICS' },
    { label: 'Roupas e Acessórios', value: 'CLOTHING' },
    { label: 'Casa e Jardim', value: 'HOME_GARDEN' },
    { label: 'Esportes e Lazer', value: 'SPORTS' },
    { label: 'Livros e Educação', value: 'BOOKS' },
    { label: 'Beleza e Saúde', value: 'BEAUTY' },
    { label: 'Automóveis', value: 'AUTOMOTIVE' },
    { label: 'Outros', value: 'OTHERS' },
  ]

  conditions: ProductCondition[] = [
    { label: 'Novo', value: 'NEW' },
    { label: 'Usado', value: 'USED' },
  ]

  ngOnInit() {
    this.initForm()
  }

  private initForm() {
    this.createListingForm = this.fb.group({
      sku: ['', [Validators.required, Validators.minLength(3)]],
      productRecommendation: [[]],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [null, [Validators.required, Validators.min(0.01)]],
      rating: [0],
      imagesUrl: [[]],
      category: ['', Validators.required],
      stock: [1, [Validators.required, Validators.min(1)]],
      productCondition: ['', Validators.required],
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

      const formData = this.createListingForm.value

      // Simular URLs das imagens enviadas (na implementação real, isso seria feito via upload)
      const imagesUrl = this.uploadedFiles().map(
        file => `https://placeholder.com/images/${file.name}`,
      )

      const listing = {
        sellerId: this.sellerId,
        sku: formData.sku,
        productRecommendation: formData.productRecommendation || [],
        title: formData.title,
        description: formData.description,
        price: formData.price,
        rating: formData.rating || 0,
        reviewsId: [],
        imagesUrl: imagesUrl,
        category: formData.category,
        stock: formData.stock,
        productCondition: formData.productCondition,
      }

      console.log('Criando listing com dados completos:', listing)

      // Criar anúncio usando o backend real
      this.listingService.createListing(listing).subscribe({
        next: createdListing => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Anúncio criado com sucesso!',
          })

          this.isLoading.set(false)

          // Redirecionar para a página do anúncio criado após 2 segundos
          setTimeout(() => {
            this.router.navigate(['/listing', createdListing.listingId])
          }, 2000)
        },
        error: error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao criar anúncio. Tente novamente.',
          })
          this.isLoading.set(false)
          console.error('Erro ao criar listing:', error)
        },
      })
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
}
