import { Component, OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { DecimalPipe, CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { HttpClient } from '@angular/common/http'
import { ListingService, Listing } from '../../services/listing.service'

// PrimeNG imports
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { CardModule } from 'primeng/card'
import { RatingModule } from 'primeng/rating'
import { TagModule } from 'primeng/tag'
import { DividerModule } from 'primeng/divider'
import { BadgeModule } from 'primeng/badge'
import { PanelModule } from 'primeng/panel'
import { SkeletonModule } from 'primeng/skeleton'
import { BreadcrumbModule } from 'primeng/breadcrumb'
import { MenuItem } from 'primeng/api'

export interface ShippingOption {
  type: string
  cost: number
  days: number
  description: string
  icon: string
}

export interface CepResponse {
  cep: string
  state: string
  city: string
  district: string
  street: string
  service: string
  location?: {
    coordinates: {
      longitude: string
      latitude: string
    }
  }
}

export interface DistanceResponse {
  routes: Array<{
    legs: Array<{
      distance: {
        value: number // distância em metros
        text: string
      }
      duration: {
        value: number // tempo em segundos
        text: string
      }
    }>
  }>
}

export interface ShippingCalculation {
  origin: string
  destination: string
  distance: number
  estimatedDays: {
    sedex: number
    pac: number
  }
}

@Component({
  selector: 'app-listing-detail',
  templateUrl: './listing-detail.component.html',
  styleUrls: ['./listing-detail.component.scss'],
  standalone: true,
  imports: [
    DecimalPipe,
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    RatingModule,
    TagModule,
    DividerModule,
    BadgeModule,
    PanelModule,
    SkeletonModule,
    BreadcrumbModule,
  ],
})
export class ListingDetailComponent implements OnInit {
  listingId: string | null = null
  cep: string = ''
  freteCalculado: boolean = false
  freteError: string | null = null
  shippingOptions: ShippingOption[] = []
  productRating: number = 4.8

  // Gallery images for PrimeNG Galleria
  galleriaImages: any[] = []

  // Zoom functionality properties
  selectedImageIndex: number = 0
  showZoom: boolean = false
  lensPosition = { x: 0, y: 0 }
  zoomBackgroundPosition: string = '0% 0%'
  zoomTranslateX: number = 0
  zoomTranslateY: number = 0

  // Breadcrumb
  breadcrumbItems: MenuItem[] = []
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' }

  // Description
  descriptionCharLimit: number = 500

  // Description expansion properties
  isDescriptionExpanded: boolean = false
  maxDescriptionHeight: number = 200 // pixels

  // Using signal for reactive state management
  listing = signal<Listing | null>(null)
  isLoading = signal<boolean>(false)
  error = signal<string | null>(null)

  // Propriedades mockadas para exibição quando não há dados da API
  defaultProduct = {
    id: 1,
    images: ['/images/banner.png', '/images/banner-lg.jpg'],
    rating: 4.8,
    reviews: 120,
    comments: [
      { user: 'João', comment: 'Produto excelente!' },
      { user: 'Maria', comment: 'Chegou rápido e bem embalado.' },
    ],
    sold: 320,
    shipping: 'Frete grátis para todo o Brasil',
    deliveryEstimate: 'Receba em até 5 dias úteis',
    installments: '12x de R$ 83,33 sem juros',
    description: `
      <h3>Processador Intel Core i7-12700K</h3>
      <p>O processador Intel Core i7-12700K da 12ª geração oferece desempenho excepcional para jogos, criação de conteúdo e multitarefa intensiva. Com arquitetura híbrida inovadora, combina núcleos de performance e eficiência para otimizar cada tarefa.</p>
      
      <h4>Especificações Técnicas:</h4>
      <ul>
        <li><strong>Núcleos:</strong> 12 núcleos (8P + 4E)</li>
        <li><strong>Threads:</strong> 20 threads</li>
        <li><strong>Frequência Base:</strong> 3.6 GHz (P-cores) / 2.7 GHz (E-cores)</li>
        <li><strong>Frequência Turbo:</strong> Até 5.0 GHz</li>
        <li><strong>Cache:</strong> 25 MB Intel Smart Cache</li>
        <li><strong>Socket:</strong> LGA 1700</li>
        <li><strong>Processo:</strong> Intel 7 (10nm Enhanced SuperFin)</li>
        <li><strong>TDP:</strong> 125W (Base) / 190W (Turbo)</li>
      </ul>

      <h4>Recursos Principais:</h4>
      <ul>
        <li>Suporte à memória DDR5-4800 e DDR4-3200</li>
        <li>20 linhas PCIe 5.0 + 4 linhas PCIe 4.0</li>
        <li>Gráficos Intel UHD 770 integrados</li>
        <li>Tecnologia Intel Thread Director</li>
        <li>Overclocking desbloqueado (multiplicador K)</li>
        <li>Suporte a Intel Optane Memory</li>
      </ul>

      <h4>Compatibilidade:</h4>
      <p>Compatible com placas-mãe chipset Z690, B660, H670 e H610. Para máximo desempenho, recomendamos placas Z690 com suporte a DDR5 e PCIe 5.0.</p>
      
      <h4>O que inclui:</h4>
      <ul>
        <li>1x Processador Intel Core i7-12700K</li>
        <li>Manual de instalação</li>
        <li>Garantia de 3 anos Intel</li>
      </ul>

      <p><strong>Importante:</strong> Este processador não inclui cooler. É necessário adquirir um sistema de refrigeração compatível com socket LGA 1700 separadamente.</p>
    `,
    seller: {
      name: 'Loja Oficial Intel',
      reputation: 'Ótima',
      sales: 1500,
    },
  }

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService,
    private http: HttpClient,
  ) {
    this.initializeGalleryImages()
  }

  ngOnInit(): void {
    this.listingId = this.route.snapshot.paramMap.get('id')
    this.initializeBreadcrumb()
    if (this.listingId) {
      this.loadListing(this.listingId)
    }
  }

  private initializeGalleryImages(): void {
    this.galleriaImages = this.defaultProduct.images.map((img, index) => ({
      itemImageSrc: img,
      thumbnailImageSrc: img,
      alt: `Imagem ${index + 1}`,
      title: `Produto - Imagem ${index + 1}`,
    }))
  }

  loadListing(id: string): void {
    this.isLoading.set(true)
    this.error.set(null)

    this.listingService.getListingById(id).subscribe({
      next: listing => {
        this.listing.set(listing)
        this.updateBreadcrumb(listing.title)
        this.isLoading.set(false)
      },
      error: err => {
        this.error.set('Erro ao carregar o produto')
        this.isLoading.set(false)
        console.error('Erro ao carregar listing:', err)
      },
    })
  }

  private initializeBreadcrumb(): void {
    this.breadcrumbItems = [
      { label: 'Produtos', routerLink: '/products' },
      { label: 'Carregando...', disabled: true }
    ]
  }

  private updateBreadcrumb(productTitle: string): void {
    this.breadcrumbItems = [
      { label: 'Produtos', routerLink: '/products' },
      { label: productTitle, disabled: true }
    ]
  }

  formatCep(event: any) {
    let value = event.target.value.replace(/\D/g, '') // Remove todos os caracteres não numéricos

    // Limita a 8 dígitos
    if (value.length > 8) {
      value = value.substring(0, 8)
    }

    // Adiciona o hífen após o 5º caractere
    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5)
    }

    // Atualiza o valor no input e no modelo
    event.target.value = value
    this.cep = value
  }

  calcularFrete() {
    if (!this.cep || this.cep.length < 9) {
      return
    }

    // Reset estados anteriores
    this.freteCalculado = false
    this.freteError = null
    this.shippingOptions = []

    // Remove o hífen para fazer a consulta na API
    const cepLimpo = this.cep.replace('-', '')

    // Consulta o CEP na Brasil API para obter informações de localização
    this.http
      .get<CepResponse>(`https://brasilapi.com.br/api/cep/v2/${cepLimpo}`)
      .subscribe({
        next: cepData => {
          // Tenta primeiro obter coordenadas do CEP
          if (cepData.location?.coordinates) {
            this.calculateDistanceFromCoordinates(cepData)
          } else {
            // Fallback: usar coordenadas aproximadas da cidade
            this.calculateDistanceFromCity(cepData)
          }
        },
        error: error => {
          console.error('Erro ao consultar CEP:', error)
          // Verifica se é erro 404 (CEP não encontrado) ou outro erro
          if (error.status === 404) {
            this.freteError = 'CEP não encontrado'
          } else {
            this.freteError =
              'Erro ao consultar CEP. Tente novamente em alguns instantes.'
          }
          this.shippingOptions = [] // Limpa as opções de frete em caso de erro
          this.freteCalculado = true // Para exibir a mensagem de erro
        },
      })
  }

  private calculateDistanceFromCoordinates(cepData: CepResponse) {
    const londinaPR = { lat: -23.3045, lng: -51.1696 } // Coordenadas de Londrina-PR

    // Verifica se as coordenadas existem e são válidas
    if (
      !cepData.location?.coordinates?.latitude ||
      !cepData.location?.coordinates?.longitude
    ) {
      console.log('Coordenadas não disponíveis, usando fallback por cidade')
      this.calculateDistanceFromCity(cepData)
      return
    }

    const destLat = parseFloat(cepData.location.coordinates.latitude)
    const destLng = parseFloat(cepData.location.coordinates.longitude)

    // Verifica se a conversão foi bem-sucedida
    if (isNaN(destLat) || isNaN(destLng)) {
      console.log('Erro ao converter coordenadas, usando fallback por cidade')
      this.calculateDistanceFromCity(cepData)
      return
    }

    // Calcula distância em linha reta e aplica fator de 1.3 para rota real
    const distance =
      this.calculateHaversineDistance(
        londinaPR.lat,
        londinaPR.lng,
        destLat,
        destLng,
      ) * 1.3 // Fator para compensar rotas não lineares

    console.log(
      `Distância calculada: ${distance}km para ${cepData.city}-${cepData.state}`,
    )
    this.generateShippingOptions(cepData, distance)
  }

  private calculateDistanceFromCity(cepData: CepResponse) {
    // Usa coordenadas aproximadas das capitais/cidades principais
    const cityCoordinates = this.getCityCoordinates(cepData.city, cepData.state)

    console.log(`Procurando coordenadas para: ${cepData.city}-${cepData.state}`)

    if (cityCoordinates) {
      const londinaPR = { lat: -23.3045, lng: -51.1696 }
      const distance =
        this.calculateHaversineDistance(
          londinaPR.lat,
          londinaPR.lng,
          cityCoordinates.lat,
          cityCoordinates.lng,
        ) * 1.3

      console.log(`Distância calculada por cidade: ${distance}km`)
      this.generateShippingOptions(cepData, distance)
    } else {
      console.log('Cidade não encontrada na base, usando estimativa por estado')
      // Fallback para estimativa por estado
      this.calculateShippingEstimate(cepData)
    }
  }

  private calculateHaversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371 // Raio da Terra em km
    const dLat = this.toRadians(lat2 - lat1)
    const dLng = this.toRadians(lng2 - lng1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distância em km
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  private getCityCoordinates(
    city: string,
    state: string,
  ): { lat: number; lng: number } | null {
    // Coordenadas aproximadas das principais cidades brasileiras
    const coordinates: { [key: string]: { lat: number; lng: number } } = {
      // Capitais e principais cidades
      'São Paulo': { lat: -23.5505, lng: -46.6333 },
      'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
      'Belo Horizonte': { lat: -19.9167, lng: -43.9345 },
      Salvador: { lat: -12.9714, lng: -38.5014 },
      Brasília: { lat: -15.8267, lng: -47.9218 },
      Fortaleza: { lat: -3.7319, lng: -38.5267 },
      Manaus: { lat: -3.119, lng: -60.0217 },
      Curitiba: { lat: -25.4284, lng: -49.2733 },
      Recife: { lat: -8.0476, lng: -34.877 },
      'Porto Alegre': { lat: -30.0346, lng: -51.2177 },
      Belém: { lat: -1.4558, lng: -48.5044 },
      Goiânia: { lat: -16.6869, lng: -49.2648 },
      Guarulhos: { lat: -23.4628, lng: -46.5338 },
      Campinas: { lat: -22.9099, lng: -47.0626 },
      'São Luís': { lat: -2.5387, lng: -44.2825 },
      Maceió: { lat: -9.6658, lng: -35.7353 },
      Natal: { lat: -5.7945, lng: -35.211 },
      'João Pessoa': { lat: -7.1195, lng: -34.845 },
      Teresina: { lat: -5.0892, lng: -42.8019 },
      'Campo Grande': { lat: -20.4697, lng: -54.6201 },
      Cuiabá: { lat: -15.6014, lng: -56.0979 },
      Aracaju: { lat: -10.9472, lng: -37.0731 },
      Florianópolis: { lat: -27.5954, lng: -48.548 },
      Vitória: { lat: -20.3155, lng: -40.3128 },
      Palmas: { lat: -10.1689, lng: -48.3317 },
      Macapá: { lat: 0.0389, lng: -51.0664 },
      'Rio Branco': { lat: -9.9754, lng: -67.8249 },
      'Boa Vista': { lat: 2.8235, lng: -60.6758 },
      Londrina: { lat: -23.3045, lng: -51.1696 },
    }

    // Primeira tentativa: busca exata por nome da cidade
    if (coordinates[city]) {
      console.log(
        `Coordenadas encontradas para ${city}: ${coordinates[city].lat}, ${coordinates[city].lng}`,
      )
      return coordinates[city]
    }

    // Segunda tentativa: busca por nome da cidade + estado
    const cityStateKey = `${city}-${state}`
    const cityState = coordinates[cityStateKey]
    if (cityState) {
      console.log(`Coordenadas encontradas para ${cityStateKey}`)
      return cityState
    }

    // Terceira tentativa: busca flexível (case insensitive e parcial)
    const cityLower = city.toLowerCase()
    for (const [key, coords] of Object.entries(coordinates)) {
      if (
        key.toLowerCase().includes(cityLower) ||
        cityLower.includes(key.toLowerCase())
      ) {
        console.log(`Coordenadas encontradas por busca flexível: ${key}`)
        return coords
      }
    }

    console.log(`Nenhuma coordenada encontrada para ${city}-${state}`)
    return null
  }

  private generateShippingOptions(cepData: CepResponse, distanceKm: number) {
    // Validação para evitar NaN
    if (isNaN(distanceKm) || distanceKm <= 0) {
      console.error(
        'Distância inválida:',
        distanceKm,
        'usando fallback por estado',
      )
      this.calculateShippingEstimate(cepData)
      return
    }

    const precoAtual = this.currentListing?.price || 1000
    const freteBase = precoAtual * 0.05

    // Cálculo baseado na velocidade real dos transportes
    const sedexDays = Math.ceil(distanceKm / 1000) // SEDEX: 1000km/dia
    const pacDays = Math.ceil(distanceKm / 500) // PAC: 500km/dia

    // Mínimos e máximos realistas
    const sedexFinalDays = Math.max(1, Math.min(sedexDays, 7)) // 1-7 dias
    const pacFinalDays = Math.max(2, Math.min(pacDays, 15)) // 2-15 dias

    // Validação dos dias calculados
    if (isNaN(sedexFinalDays) || isNaN(pacFinalDays)) {
      console.error('Erro no cálculo de dias:', {
        sedexDays,
        pacDays,
        distanceKm,
      })
      this.calculateShippingEstimate(cepData)
      return
    }

    // SEDEX (mais caro, mais rápido)
    const sedexCost = freteBase * 1.5

    // PAC (mais barato, mais devagar)
    const pacCost = freteBase

    console.log(
      `Opções geradas: SEDEX ${sedexFinalDays} dias, PAC ${pacFinalDays} dias, distância: ${Math.round(
        distanceKm,
      )}km`,
    )

    this.shippingOptions = [
      {
        type: 'SEDEX',
        cost: sedexCost,
        days: sedexFinalDays,
        description: `Entrega expressa para ${cepData.city}-${
          cepData.state
        } (${Math.round(distanceKm)}km)`,
        icon: 'pi pi-bolt',
      },
      {
        type: 'PAC',
        cost: pacCost,
        days: pacFinalDays,
        description: `Entrega econômica para ${cepData.city}-${
          cepData.state
        } (${Math.round(distanceKm)}km)`,
        icon: 'pi pi-truck',
      },
    ]

    this.freteCalculado = true
    this.freteError = null // Limpa qualquer erro anterior
  }

  private calculateShippingEstimate(cepData: CepResponse) {
    // Fallback usando distâncias estimadas por estado
    const stateDistances = this.getStateDistances()
    const estimatedDistance = stateDistances[cepData.state] || 1500 // Default 1500km

    this.generateShippingOptions(cepData, estimatedDistance)
  }

  private getStateDistances(): { [key: string]: number } {
    // Distâncias aproximadas de Londrina-PR para cada estado (em km)
    return {
      PR: 200, // Mesmo estado, distância média
      SP: 400, // Estados próximos
      SC: 350,
      RS: 650,
      RJ: 800,
      MG: 700,
      ES: 900,
      MS: 600,
      MT: 900,
      GO: 700,
      DF: 800,
      BA: 1300,
      PE: 1800,
      CE: 2000,
      RN: 2100,
      PB: 1900,
      AL: 1700,
      SE: 1400,
      MA: 2200,
      PI: 1800,
      AM: 2800,
      PA: 2300,
      AC: 3200,
      RO: 2100,
      RR: 3500,
      AP: 2800,
      TO: 1200,
    }
  }

  private calculateFallbackShipping() {
    // Fallback caso a API falhe - usa estimativa conservadora
    const precoAtual = this.currentListing?.price || 1000
    const freteBase = precoAtual * 0.05

    // Estimativas conservadoras quando não conseguimos dados da API
    const sedexCost = freteBase * 1.5
    const sedexDays = 5 // 5 dias para SEDEX

    const pacCost = freteBase
    const pacDays = 10 // 10 dias para PAC

    this.shippingOptions = [
      {
        type: 'SEDEX',
        cost: sedexCost,
        days: sedexDays,
        description: 'Entrega expressa (estimativa)',
        icon: 'pi pi-bolt',
      },
      {
        type: 'PAC',
        cost: pacCost,
        days: pacDays,
        description: 'Entrega econômica (estimativa)',
        icon: 'pi pi-truck',
      },
    ]

    this.freteCalculado = true
  }

  get currentListing() {
    return this.listing() || null
  }

  get displayImages() {
    return this.defaultProduct.images
  }

  get displayTitle() {
    return (
      this.currentListing?.title ||
      'Processador Intel Core i7-12700K - 12 Núcleos, 3.6GHz até 5.0GHz, Cache 25MB'
    )
  }

  get displayPrice() {
    return this.currentListing?.price || 1000
  }

  get displayDescription() {
    const description = this.listing()?.description || 'Carregando descrição do produto...'
    
    // Se não há dados do backend ainda, mostrar mensagem de carregamento
    if (!this.listing()) {
      return 'Carregando descrição do produto...'
    }
    
    // Se não há descrição, mostrar mensagem padrão
    if (!description || description.trim() === '') {
      return 'Descrição não disponível para este produto.'
    }
    
    // Se está expandido ou a descrição é pequena, mostrar completa
    if (this.isDescriptionExpanded || description.length <= this.descriptionCharLimit) {
      return description
    }
    
    // Caso contrário, truncar
    return description.substring(0, this.descriptionCharLimit) + '...'
  }

  get displayStock() {
    return this.currentListing?.stock || 0
  }

  get displayCondition() {
    return this.currentListing?.productCondition || 'Novo'
  }

  get starsArray() {
    return Array(5).fill(0)
  }

  get filledStars() {
    return Math.round(this.defaultProduct.rating)
  }

  // Zoom and Gallery Methods
  selectImage(index: number): void {
    this.selectedImageIndex = index
  }

  get showExpandButton(): boolean {
    const description = this.listing()?.description || ''
    return description.length > this.descriptionCharLimit && description.trim() !== ''
  }

  toggleDescription(): void {
    this.isDescriptionExpanded = !this.isDescriptionExpanded
  }

  onMouseMove(event: MouseEvent): void {
    const container = event.currentTarget as HTMLElement
    const rect = container.getBoundingClientRect()

    // Calcular posição do mouse relativa ao container
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    // Tamanho da lente de zoom (160x201px)
    const lensWidth = 160
    const lensHeight = 201

    // Posição da lente centrada no mouse, mas limitada pelas bordas
    const halfLensWidth = lensWidth / 2
    const halfLensHeight = lensHeight / 2

    let lensX = mouseX - halfLensWidth
    let lensY = mouseY - halfLensHeight

    // Limitar a posição da lens para não sair da imagem
    lensX = Math.max(0, Math.min(lensX, rect.width - lensWidth))
    lensY = Math.max(0, Math.min(lensY, rect.height - lensHeight))

    this.lensPosition = {
      x: lensX,
      y: lensY,
    }

    // Calcular posição para o preview de zoom
    // O preview viewport é 400x502px e mostra uma área ampliada 2.5x
    // O container ampliado é 1700x1260px (680x504 * 2.5)
    
    const zoomFactor = 2.5
    
    // A área da lens (160x201) no container original (680x504)
    // deve aparecer centralizada no viewport do preview (400x502)
    
    // Posição onde a lens aparece no container ampliado
    const lensXInZoom = lensX * zoomFactor  // posição da lens no container ampliado
    const lensYInZoom = lensY * zoomFactor
    
    // Para centralizar a área da lens no viewport, precisamos mover o container ampliado
    // de forma que a área da lens apareça no centro do viewport (200, 251)
    const viewportCenterX = 400 / 2  // 200px
    const viewportCenterY = 502 / 2  // 251px
    
    // A área da lens ampliada tem tamanho (160*2.5, 201*2.5) = (400, 502.5)
    // Queremos que o centro desta área apareça no centro do viewport
    const lensWidthInZoom = lensWidth * zoomFactor
    const lensHeightInZoom = lensHeight * zoomFactor
    
    const lensCenterXInZoom = lensXInZoom + lensWidthInZoom / 2
    const lensCenterYInZoom = lensYInZoom + lensHeightInZoom / 2
    
    // Calcular quanto mover o container para centralizar a lens no viewport
    this.zoomTranslateX = viewportCenterX - lensCenterXInZoom
    this.zoomTranslateY = viewportCenterY - lensCenterYInZoom

    // Manter a implementação anterior para compatibilidade
    const percentX = (lensX + halfLensWidth) / rect.width * 100
    const percentY = (lensY + halfLensHeight) / rect.height * 100
    this.zoomBackgroundPosition = `${percentX}% ${percentY}%`
  }
}
