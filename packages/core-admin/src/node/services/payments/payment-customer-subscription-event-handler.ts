import { injectable } from 'inversify'
import { StripePaymentEventHandlerContribution } from './payments'
import { Stripe } from 'stripe'

@injectable()
export class StripeCustomerSubscriptionHandler implements StripePaymentEventHandlerContribution {
    
    private readonly eventTypes: Array<string> = [
        'customer.subscription.created',
        'customer.subscription.deleted',
        'customer.subscription.paused',
        'customer.subscription.resumed',
        'customer.subscription.trial_will_end',
        'customer.subscription.updated',
    ]

    canHandle(event: Stripe.Event): boolean {
        return this.eventTypes.includes(event.type)
    }

    async handle(event: Stripe.Event): Promise<void> {
        console.log('StripeCustomerSubscriptionHandler', event.type)
    }
}
