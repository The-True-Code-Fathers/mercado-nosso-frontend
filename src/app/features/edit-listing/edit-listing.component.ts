import { Component, inject, signal, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
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
import { SkeletonModule } from 'primeng/skeleton'
import { MessageService } from 'primeng/api'
import { ListingService, Listing } from '../listing/services/listing.service'
import { DEVELOPMENT_CONFIG } from '../../shared/config/development.config'

interface Category {
  label: string
  value: string
}

interface ProductCondition {
  label: string
  value: 'NEW' | 'USED'
}

@Component({
  selector: 'app-edit-listing',
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
    SkeletonModule,
  ],
  providers: [MessageService],
  templateUrl: './edit-listing.component.html',
  styleUrl: './edit-listing.component.scss',
})
export class EditListingComponent implements OnInit {
  private fb = inject(FormBuilder)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private messageService = inject(MessageService)
  private listingService = inject(ListingService)

  editListingForm!: FormGroup
  isLoading = signal(false)
  isLoadingListing = signal(false)
  uploadedFiles = signal<File[]>([])
  listingId = signal<string>('')
  currentListing = signal<Listing | null>(null)

  // Usar o sellerId da configuração de desenvolvimento
  private readonly sellerId = DEVELOPMENT_CONFIG.DEFAULT_USER_ID

  categories: Category[] = [
    { label: 'Eletrônicos', value: 'Eletrônicos' },
    { label: 'Roupas e Acessórios', value: 'Roupas e Acessórios' },
    { label: 'Casa e Jardim', value: 'Casa e Jardim' },
    { label: 'Esportes e Lazer', value: 'Esportes e Lazer' },
    { label: 'Livros e Educação', value: 'Livros e Educação' },
    { label: 'Beleza e Saúde', value: 'Beleza e Saúde' },
    { label: 'Automóveis', value: 'Automóveis' },
    { label: 'Outros', value: 'Outros' },
  ]

  conditions: ProductCondition[] = [
    { label: 'Novo', value: 'NEW' },
    { label: 'Usado', value: 'USED' },
  ]

  ngOnInit() {
    this.initForm()
    this.loadListingData()
  }

  private initForm() {
    this.editListingForm = this.fb.group({
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

  private loadListingData() {
    this.isLoadingListing.set(true)

    // Obter o ID do anúncio da rota
    const id = this.route.snapshot.paramMap.get('id')
    if (!id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'ID do anúncio não encontrado',
      })
      this.router.navigate(['/user/my-listings'])
      return
    }

    this.listingId.set(id)

    // Carregar dados do anúncio
    this.listingService.getListingById(id).subscribe({
      next: listing => {
        this.currentListing.set(listing)
        this.populateForm(listing)
        this.isLoadingListing.set(false)
      },
      error: error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar dados do anúncio',
        })
        this.isLoadingListing.set(false)
        console.error('Erro ao carregar listing:', error)
      },
    })
  }

  private populateForm(listing: Listing) {
    console.log('Populando formulário com listing:', listing)
    console.log('Categoria do listing:', listing.category)
    console.log('Categorias disponíveis:', this.categories)

    // Aguardar um tick antes de popular o formulário para garantir que os dropdowns estejam prontos
    setTimeout(() => {
      this.editListingForm.patchValue({
        sku: listing.sku,
        productRecommendation: listing.productRecommendation || [],
        title: listing.title,
        description: listing.description,
        price: listing.price,
        rating: listing.rating || 0,
        imagesUrl: listing.imagesUrl || [],
        stock: listing.stock,
      })

      // Definir categoria e condição separadamente para garantir que sejam aplicadas
      this.editListingForm.get('category')?.setValue(listing.category)
      this.editListingForm
        .get('productCondition')
        ?.setValue(listing.productCondition)

      console.log('Formulário após população:', this.editListingForm.value)
      console.log(
        'Valor da categoria no form:',
        this.editListingForm.get('category')?.value,
      )
    }, 150)
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
    if (this.editListingForm.valid) {
      this.isLoading.set(true)

      const formData = this.editListingForm.value
      const listing = this.currentListing()

      if (!listing) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Dados do anúncio não encontrados',
        })
        this.isLoading.set(false)
        return
      }

      // Simular URLs das imagens enviadas (usar as atuais + novas)
      const currentListing = this.currentListing()
      const newImagesUrl = this.uploadedFiles().map(
        file => `https://placeholder.com/images/${file.name}`,
      )
      const allImagesUrl = [
        ...(currentListing?.imagesUrl || []),
        ...newImagesUrl,
      ]

      const updatedListing = {
        ...listing,
        sku: formData.sku,
        productRecommendation: formData.productRecommendation || [],
        title: formData.title,
        description: formData.description,
        price: formData.price,
        rating: formData.rating || 0,
        imagesUrl: allImagesUrl,
        category: formData.category,
        stock: formData.stock,
        productCondition: formData.productCondition,
      }

      console.log('Atualizando listing com dados completos:', updatedListing)

      // Atualizar anúncio usando o backend real
      this.listingService.updateListing(updatedListing).subscribe({
        next: updatedListing => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Anúncio atualizado com sucesso!',
          })

          this.isLoading.set(false)

          // Redirecionar para a página do anúncio após 2 segundos
          setTimeout(() => {
            this.router.navigate(['/listing', this.listingId()])
          }, 2000)
        },
        error: error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao atualizar anúncio. Tente novamente.',
          })
          this.isLoading.set(false)
          console.error('Erro ao atualizar listing:', error)
        },
      })
    } else {
      this.markFormGroupTouched()
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.editListingForm.controls).forEach(key => {
      const control = this.editListingForm.get(key)
      control?.markAsTouched()
    })
  }

  goBack() {
    this.router.navigate(['/user/my-listings'])
  }

  removeExistingImage(index: number) {
    const listing = this.currentListing()
    if (listing && listing.imagesUrl) {
      const updatedImages = [...listing.imagesUrl]
      updatedImages.splice(index, 1)

      this.currentListing.update(currentListing =>
        currentListing ? { ...currentListing, imagesUrl: updatedImages } : null,
      )

      this.messageService.add({
        severity: 'info',
        summary: 'Imagem removida',
        detail: 'A imagem será removida quando você salvar as alterações',
      })
    }
  }
}
