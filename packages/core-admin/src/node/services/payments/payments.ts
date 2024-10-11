import { Stripe } from 'stripe'

export const StripePaymentEventHandlerContribution = Symbol('StripePaymentEventHandlerContribution')
export interface StripePaymentEventHandlerContribution {
    canHandle(event: Stripe.Event): boolean
    handle(event: Stripe.Event): Promise<void>
}
