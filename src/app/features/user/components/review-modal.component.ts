import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms'
import { DialogModule } from 'primeng/dialog'
import { ButtonModule } from 'primeng/button'
import { RatingModule } from 'primeng/rating'
import { InputTextarea } from 'primeng/inputtextarea'
import { ToastModule } from 'primeng/toast'
import { MessageService } from 'primeng/api'
import { ReviewService, CreateReviewRequest } from '../services/review.service'
import { MyPurchase } from '../pages/my-purchases/my-purchases.component'
import { DEVELOPMENT_CONFIG } from '../../../shared/config/development.config'

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
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

        <!-- Review Form -->
        <form
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
        <div class="modal-footer">
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
        </div>
      </ng-template>
    </p-dialog>

    <p-toast position="top-right"></p-toast>
  `,
  styles: [
    `
      .review-content {
        padding: var(--spacing-lg) 0;
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

      .modal-footer {
        display: flex;
        gap: var(--spacing-md);
        justify-content: flex-end;
        align-items: center;
        padding-top: var(--spacing-xl);
      }

      ::ng-deep .review-modal {
        .p-dialog-header {
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          border-radius: 6px 6px 0 0;

          .p-dialog-title {
            color: var(--color-text-primary);
            font-weight: 600;
          }
        }

        .p-dialog-content {
          background: var(--color-surface);
          color: var(--color-text-primary);
        }

        .p-dialog-footer {
          background: var(--color-surface);
          border-top: none;
          padding: 0;
          border-radius: 0 0 6px 6px;
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

        .modal-footer {
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
  @Input() visible = false
  @Input() purchase: MyPurchase | null = null
  @Output() visibleChange = new EventEmitter<boolean>()
  @Output() reviewSubmitted = new EventEmitter<void>()

  reviewForm: FormGroup
  isSubmitting = false

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

  ngOnInit() {}

  closeModal() {
    this.visible = false
    this.visibleChange.emit(false)
    this.reviewForm.reset()
  }

  onSubmit() {
    if (this.reviewForm.valid && this.purchase) {
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
          this.reviewSubmitted.emit()
          this.closeModal()
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
