import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms'
import { DialogModule } from 'primeng/dialog'
import { ButtonModule } from 'primeng/button'
import { RatingModule } from 'primeng/rating'
import { InputTextarea } from 'primeng/inputtextarea'
import { ToastModule } from 'primeng/toast'
import { MessageService } from 'primeng/api'
import {
  ReviewService,
  CreateReviewRequest,
  ReviewResponse,
} from '../services/review.service'
import { MyPurchase } from '../pages/my-purchases/my-purchases.component'
import { DEVELOPMENT_CONFIG } from '../../../shared/config/development.config'

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    RatingModule,
    InputTextarea,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <p-dialog
      [visible]="visible"
      [modal]="true"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      [dismissableMask]="true"
      styleClass="review-modal"
      header="Avaliar Produto"
      [style]="{ width: '600px', maxWidth: '95vw' }"
      (onHide)="closeModal()"
    >
      <div class="review-content" *ngIf="purchase">
        <!-- Product Info -->
        <div class="product-info">
          <img
            [src]="purchase.imagesUrl[0] || '/images/no-image.png'"
            [alt]="purchase.title"
            class="product-image"
          />
          <div class="product-details">
            <h3 class="product-title">{{ purchase.title }}</h3>
            <p class="product-price">
              {{ purchase.price | currency : 'BRL' : 'symbol' : '1.2-2' }}
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoadingReview" class="loading-state">
          <p>Verificando avaliação existente...</p>
        </div>

        <!-- Existing Review Display -->
        <div *ngIf="existingReview && !isLoadingReview" class="existing-review">
          <h4 class="existing-review-title">Sua Avaliação</h4>

          <!-- Only show rating for real reviews (not cache) -->
          <div
            *ngIf="existingReview.id !== 'local-cache'"
            class="existing-rating"
          >
            <div class="stars-display">
              <span
                *ngFor="let star of [1, 2, 3, 4, 5]"
                class="star"
                [class.filled]="star <= existingReview.rating"
              >
                ★
              </span>
            </div>
            <span class="rating-text">{{ existingReview.rating }}/5</span>
          </div>

          <div
            class="existing-comment"
            *ngIf="
              existingReview.message && existingReview.id !== 'local-cache'
            "
          >
            <p>{{ existingReview.message }}</p>
          </div>

          <div *ngIf="existingReview.id !== 'local-cache'" class="review-date">
            <small
              >Avaliado em
              {{ existingReview.createdAt | date : 'dd/MM/yyyy' }}</small
            >
          </div>

          <p class="review-blocked-message">
            <i class="pi pi-info-circle"></i>
            Você já avaliou este produto. Não é possível fazer uma nova
            avaliação.
          </p>
        </div>

        <!-- Review Form (only shown if no existing review) -->
        <form
          *ngIf="!existingReview && !isLoadingReview"
          [formGroup]="reviewForm"
          (ngSubmit)="onSubmit()"
          class="review-form"
        >
          <div class="form-group">
            <label for="rating" class="form-label">Avaliação *</label>
            <p-rating
              formControlName="rating"
              [stars]="5"
              styleClass="rating-input"
            ></p-rating>
            <small
              *ngIf="
                reviewForm.get('rating')?.invalid &&
                reviewForm.get('rating')?.touched
              "
              class="error-message"
            >
              Por favor, selecione uma avaliação
            </small>
          </div>

          <div class="form-group">
            <label for="message" class="form-label"
              >Comentário (opcional)</label
            >
            <textarea
              pInputTextarea
              formControlName="message"
              rows="4"
              placeholder="Conte sua experiência com este produto..."
              class="comment-input"
            ></textarea>
          </div>
        </form>
      </div>

      <ng-template pTemplate="footer">
        <!-- Buttons for existing review -->
        <p-button
          *ngIf="existingReview"
          label="Fechar"
          icon="pi pi-times"
          (onClick)="closeModal()"
          styleClass="cancel-button"
        ></p-button>

        <!-- Buttons for new review -->
        <ng-container *ngIf="!existingReview && !isLoadingReview">
          <p-button
            label="Cancelar"
            icon="pi pi-times"
            [outlined]="true"
            severity="secondary"
            (onClick)="closeModal()"
            styleClass="cancel-button"
          ></p-button>
          <p-button
            label="Enviar Avaliação"
            icon="pi pi-check"
            (onClick)="onSubmit()"
            [disabled]="reviewForm.invalid || isSubmitting"
            [loading]="isSubmitting"
            styleClass="submit-button"
          ></p-button>
        </ng-container>
      </ng-template>
    </p-dialog>

    <p-toast position="top-right"></p-toast>
  `,
  styles: [
    `
      .review-content {
        padding: 0;
      }

      .loading-state {
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--color-text-muted);
      }

      .existing-review {
        padding: var(--spacing-lg);
        background: var(--color-elevation-1);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-border);
        margin-bottom: var(--spacing-lg);
      }

      .existing-review-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0 0 var(--spacing-md) 0;
      }

      .existing-rating {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-md);
      }

      .stars-display {
        display: flex;
        gap: 2px;
      }

      .star {
        font-size: 1.8rem;
        color: #e0e0e0;
        transition: color 0.3s ease;

        &.filled {
          color: #ffd700;
        }
      }

      .rating-text {
        font-weight: 600;
        color: var(--color-text-primary);
        font-size: 1rem;
      }

      .existing-comment {
        margin-bottom: var(--spacing-md);

        p {
          background: var(--color-surface);
          padding: var(--spacing-md);
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
          margin: 0;
          line-height: 1.5;
        }
      }

      .review-date {
        margin-bottom: var(--spacing-md);

        small {
          color: var(--color-text-muted);
          font-size: 0.85rem;
        }
      }

      .review-blocked-message {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: var(--radius-sm);
        padding: var(--spacing-md);
        color: #856404;
        margin: 0;
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: 0.9rem;

        .pi {
          font-size: 1rem;
        }
      }

      .product-info {
        display: flex;
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);
        padding: var(--spacing-lg);
        background: var(--color-elevation-1);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-border);
      }

      .product-image {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: var(--radius-sm);
        flex-shrink: 0;
      }

      .product-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .product-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0 0 var(--spacing-xs) 0;
        line-height: 1.4;
      }

      .product-price {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--color-primary);
        margin: 0;
      }

      .review-form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
      }

      .form-label {
        font-weight: 600;
        color: var(--color-text-primary);
        font-size: 0.95rem;
      }

      ::ng-deep .rating-input {
        margin: var(--spacing-sm) 0;

        .p-rating-icon {
          font-size: 2.5rem;
          color: #e0e0e0;
          transition: color 0.3s ease;
          margin-right: var(--spacing-sm);

          &.p-rating-icon-active {
            color: #ffd700 !important;
          }

          &:hover {
            color: #ffed4e;
          }
        }
      }

      .comment-input {
        width: 100%;
        padding: var(--spacing-md);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        background: var(--color-surface);
        color: var(--color-text-primary);
        font-family: inherit;
        font-size: 1rem;
        resize: vertical;
        min-height: 120px;
        box-sizing: border-box;

        &:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
        }

        &::placeholder {
          color: var(--color-text-muted);
        }
      }

      ::ng-deep .p-inputtextarea {
        width: 100%;
        padding: var(--spacing-md);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        background: var(--color-surface);
        color: var(--color-text-primary);
        font-family: inherit;
        font-size: 1rem;
        resize: vertical;
        min-height: 120px;
        box-sizing: border-box;

        &:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
        }

        &::placeholder {
          color: var(--color-text-muted);
        }
      }

      .error-message {
        color: var(--color-error);
        font-size: 0.8rem;
        margin-top: var(--spacing-xs);
      }

      ::ng-deep .review-modal {
        .p-dialog-header {
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          border-radius: 6px 6px 0 0;
          padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-lg)
            var(--spacing-lg);
          margin: 0;

          .p-dialog-title {
            color: var(--color-text-primary);
            font-weight: 600;
            margin: 0;
            padding: 0;
          }
        }

        .p-dialog-content {
          background: var(--color-surface);
          color: var(--color-text-primary);
          padding: var(--spacing-lg);
          margin: 0;
        }

        .p-dialog-footer {
          background: var(--color-surface);
          border-top: 1px solid var(--color-border);
          padding: var(--spacing-lg);
          border-radius: 0 0 6px 6px;
          margin: 0;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: var(--spacing-md);
        }
      }

      ::ng-deep .cancel-button.p-button {
        background: transparent;
        color: var(--color-text-secondary);
        border-color: var(--color-border);
        padding: var(--spacing-md) var(--spacing-xl);
        font-size: 1rem;

        &:hover {
          background: var(--color-elevation-1);
        }
      }

      ::ng-deep .submit-button.p-button {
        background: #4caf50;
        border-color: #4caf50;
        padding: var(--spacing-md) var(--spacing-xl);
        font-size: 1rem;

        &:hover {
          background: #45a049;
        }
      }

      @media (max-width: 600px) {
        .product-info {
          flex-direction: column;
          text-align: center;
          gap: var(--spacing-sm);
        }

        .product-image {
          align-self: center;
        }

        ::ng-deep .review-modal .p-dialog-footer {
          flex-direction: column;

          .p-button {
            width: 100%;
          }
        }
      }
    `,
  ],
})
export class ReviewModalComponent implements OnInit {
  @Input() set visible(value: boolean) {
    this._visible = value
    if (value && this.purchase) {
      this.checkExistingReview()
    }
  }
  get visible(): boolean {
    return this._visible
  }
  private _visible = false

  @Input() purchase: MyPurchase | null = null
  @Output() visibleChange = new EventEmitter<boolean>()
  @Output() reviewSubmitted = new EventEmitter<void>()

  reviewForm: FormGroup
  isSubmitting = false
  isLoadingReview = false
  existingReview: ReviewResponse | null = null

  constructor(
    private formBuilder: FormBuilder,
    private reviewService: ReviewService,
    private messageService: MessageService,
  ) {
    this.reviewForm = this.formBuilder.group({
      rating: [
        null,
        [Validators.required, Validators.min(1), Validators.max(5)],
      ],
      message: [''],
    })
  }

  ngOnInit() {
    this.checkExistingReview()
  }

  checkExistingReview() {
    if (this.purchase) {
      // Verificar primeiro o cache local
      if (
        this.reviewService.hasSubmittedReview(
          this.purchase.listingId,
          DEVELOPMENT_CONFIG.DEFAULT_USER_ID,
        )
      ) {
        this.existingReview = {
          id: 'local-cache',
          listingId: this.purchase.listingId,
          buyerId: DEVELOPMENT_CONFIG.DEFAULT_USER_ID,
          rating: 0,
          message: 'Você já avaliou este produto nesta sessão.',
          createdAt: new Date().toISOString(),
          sellerId: '',
          imagesUrls: [],
        }
        this.isLoadingReview = false
        return
      }

      this.isLoadingReview = true
      this.reviewService
        .getUserReviewForListing(
          this.purchase.listingId,
          DEVELOPMENT_CONFIG.DEFAULT_USER_ID,
        )
        .subscribe({
          next: review => {
            this.existingReview = review
            this.isLoadingReview = false
          },
          error: error => {
            console.error('Erro ao verificar avaliação existente:', error)
            this.existingReview = null
            this.isLoadingReview = false
          },
        })
    }
  }

  closeModal() {
    this.visible = false
    this.visibleChange.emit(false)
    this.reviewForm.reset()
    this.existingReview = null
    this.isLoadingReview = false
  }

  onSubmit() {
    if (this.reviewForm.valid && this.purchase) {
      // Verificação adicional para evitar dupla submissão
      if (
        this.reviewService.hasSubmittedReview(
          this.purchase.listingId,
          DEVELOPMENT_CONFIG.DEFAULT_USER_ID,
        )
      ) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Atenção',
          detail: 'Você já enviou uma avaliação para este produto.',
        })
        return
      }

      this.isSubmitting = true

      const reviewData: CreateReviewRequest = {
        listingId: this.purchase.listingId,
        buyerId: DEVELOPMENT_CONFIG.DEFAULT_USER_ID,
        rating: this.reviewForm.value.rating,
        message: this.reviewForm.value.message || undefined,
      }

      this.reviewService.createReview(reviewData).subscribe({
        next: response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Avaliação enviada com sucesso!',
          })
          // Atualizar o estado para mostrar que já foi avaliado
          this.existingReview = response
          this.reviewSubmitted.emit()
          this.isSubmitting = false
        },
        error: error => {
          console.error('Erro ao enviar avaliação:', error)
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao enviar avaliação. Tente novamente.',
          })
          this.isSubmitting = false
        },
      })
    } else {
      this.markFormGroupTouched()
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.reviewForm.controls).forEach(key => {
      const control = this.reviewForm.get(key)
      control?.markAsTouched()
    })
  }
}
