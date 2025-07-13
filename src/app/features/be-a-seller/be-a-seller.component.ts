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
  selector: 'be-a-seller',
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
  templateUrl: './be-a-seller.component.html',
  styleUrls: ['./be-a-seller.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class BeASellerComponent implements OnInit {
  beASellerForm!: FormGroup;

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
    this.beASellerForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      socialReason: ['', [Validators.required, Validators.minLength(2)]],
      cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.beASellerForm.valid) {
      const formData = this.beASellerForm.value;
      
      console.log('Dados do cadastro:', formData);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Você agora é um vendedor!'
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
    Object.keys(this.beASellerForm.controls).forEach(key => {
      const control = this.beASellerForm.get(key);
      control?.markAsTouched();
    });
  }

  onCnpjBlur() {
    const cnpjControl = this.beASellerForm.get('cnpj');
    if (cnpjControl?.value) {
      const cnpj = cnpjControl.value.replace(/\D/g, '');
      if (cnpj.length === 14) {
        const formattedCnpj = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        cnpjControl.setValue(formattedCnpj);
      }
    }
  }

  onlyNumbers(event: KeyboardEvent): boolean {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    event.preventDefault();
    return false;
  }
  return true;
}
}
