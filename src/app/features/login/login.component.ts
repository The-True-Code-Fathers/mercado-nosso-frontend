// Copie e cole TODO este conteúdo no seu arquivo.
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../user/services/user.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { InputNumber } from "primeng/inputnumber"; 


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
]
})
export class LoginComponent implements OnInit {
  exampleForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.exampleForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]] 
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.exampleForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.exampleForm.invalid) {
      this.exampleForm.markAllAsTouched();
      return;
    }

    const {email, password} = this.exampleForm.value;

    console.log('=== LOGIN FRONTEND ===');
    console.log('Email:', email, '| typeof:', typeof email);
    console.log('Password:', password, '| typeof:', typeof password);
    console.log('======================');

    this.userService.login(email, password).subscribe({
      next: (user) => {
        console.log('Login sucesso:', user);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.log('Erro', err);
      }
    })
  }
}
