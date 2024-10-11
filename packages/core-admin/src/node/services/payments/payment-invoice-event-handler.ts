import { injectable } from 'inversify'
import { StripePaymentEventHandlerContribution } from './payments'
import { Stripe } from 'stripe'

@injectable()
export class StripeInvoiceChangeHandler implements StripePaymentEventHandlerContribution {

    private readonly eventTypes: Array<string> = [
        'customer.created',
        'customer.updated',
        'customer.deleted',
    ]

    canHandle(event: Stripe.Event): boolean {
        return this.eventTypes.includes(event.type)
    }
    
    async handle(event: Stripe.Event): Promise<void> {
        console.log('StripeInvoiceChangeHandler', event.type)
        return Promise.resolve()
    }

}
