import { Routes } from "@angular/router";
import { CheckoutComponent } from "./checkout.component";
import { CheckoutSuccessComponent } from "./components/checkout-success/checkout-success.component";

export const checkoutRoutes: Routes = [
    {
        path: '',
        component: CheckoutComponent
    },
    {
        path: 'success',
        component: CheckoutSuccessComponent
    }
];