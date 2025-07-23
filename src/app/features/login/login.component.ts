import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { UserService } from '../user/services/user.service'
import { setDevelopmentUserId } from '../../shared/config/development.config'
import { AuthService } from '../../shared/services/auth.service'
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms'

import { InputTextModule } from 'primeng/inputtext'
import { ButtonModule } from 'primeng/button'
import { MessageModule } from 'primeng/message'

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
  ],
})
export class LoginComponent implements OnInit {
  exampleForm!: FormGroup
  hidePassword = true

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.exampleForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    })
  }

  isInvalid(controlName: string): boolean {
    const control = this.exampleForm.get(controlName)
    return !!control && control.invalid && (control.dirty || control.touched)
  }

  onSubmit(): void {
    if (this.exampleForm.invalid) {
      this.exampleForm.markAllAsTouched()
      return
    }

    const { email, password } = this.exampleForm.value

    this.userService.login(email, password).subscribe({
      next: user => {
        localStorage.setItem('currentUserName', user.fullName)
        localStorage.setItem('currentUserEmail', user.email)
        setDevelopmentUserId(user.id)
        window.dispatchEvent(new StorageEvent('storage', { key: 'devUserId' }))
        this.auth.setUserId(user.id)
      },
      error: err => {
        console.log('Erro', err)
      },
    })

    this.loginRedirect()
  }

  loginRedirect() {
    this.router.navigate(['/home'])
  }
}
