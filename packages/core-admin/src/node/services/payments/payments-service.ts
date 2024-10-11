import express from 'express'
import { injectable, inject, named } from 'inversify'
import { ApplicationConfigProvider, ContributionProvider } from '@loop/core/lib'
import { Stripe } from 'stripe'
import cors from 'cors'
import { StripePaymentEventHandlerContribution } from './payments'

@injectable()
export class PaymentsService {
    protected stripe: Stripe
    private rootAppUrl: string

    constructor(
        @inject(ContributionProvider)
        @named(StripePaymentEventHandlerContribution)
        protected readonly paymentEventsContributionsProvider: ContributionProvider<StripePaymentEventHandlerContribution>,
        @inject(ApplicationConfigProvider) protected readonly appConfig: ApplicationConfigProvider
    ) {
        const stripeKey = this.appConfig.config.stripeSecretKey ? this.appConfig.config.stripeSecretKey : ''
        this.stripe = new Stripe(stripeKey, {
            apiVersion: '2024-09-30.acacia',
        })
        this.rootAppUrl = this.appConfig.config.rootAppUrl ? this.appConfig.config.rootAppUrl : ''
    }

    public async configure(app: express.Application): Promise<void> {
        await this.verifyStripeWebhookConfig()
        const corsOptions = {
            origin: (origin: any, callback: any) => {
                callback(undefined, true)
            },
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        }
        app.use(cors(corsOptions))
        app.post('/api/v1/checkout-session', this.createCheckoutSession.bind(this))
        app.post('/api/v1/payment-session', this.createPaymentSession.bind(this))
        app.post('/api/v1/stripe/webhook', this.handleStripeWebhook.bind(this))
    }

    private async handleStripeWebhook(req: express.Request, resp: express.Response): Promise<void> {
        this.paymentEventsContributionsProvider
            .getContributions()
            .forEach(async (next: StripePaymentEventHandlerContribution) => {
                try {
                    if (next.canHandle(req.body)) {
                        next.handle(req.body)
                    }
                } catch (error) {
                    console.log(error)
                }
            })
        resp.json({ received: true })
    }

    private async createPaymentSession(req: express.Request, resp: express.Response): Promise<void> {
        try {
            const { session_id } = req.body
            const checkoutSession = await this.stripe.checkout.sessions.retrieve(session_id)

            const returnUrl: string = this.appConfig.config.rootAppUrl ? this.appConfig.config.rootAppUrl : ''
            const portalSession = await this.stripe.billingPortal.sessions.create({
                customer: checkoutSession.customer as any,
                return_url: returnUrl,
            })

            resp.json({
                url: portalSession.url,
            })
        } catch (error) {
            console.log(error)
            resp.status(500).json({ error: error.message })
        }
    }

    private async createCheckoutSession(req: express.Request, resp: express.Response): Promise<void> {
        try {
            const prices = await this.stripe.prices.list({
                lookup_keys: [req.body.lookup_key],
                expand: ['data.product'],
            })
            console.log(prices.data)

            const session = await this.stripe.checkout.sessions.create({
                billing_address_collection: 'auto',
                line_items: [
                    {
                        price: prices.data[0].id,
                        // For metered billing, do not pass quantity
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: `${this.rootAppUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${this.rootAppUrl}/payment/cancel`,
            })
            resp.json({
                url: session.url,
            })
        } catch (error) {
            console.log(error)
            resp.status(500).json({ error: error.message })
        }
    }

    private async verifyStripeWebhookConfig(): Promise<void> {
        const stripeWebHookKey = this.appConfig.config.stripeWebhookSecret
            ? this.appConfig.config.stripeWebhookSecret
            : ''
        const stripeWebHookBaseUrl = this.appConfig.config.stripeWebhookBaseUrl
            ? this.appConfig.config.stripeWebhookBaseUrl
            : ''
        if (stripeWebHookBaseUrl === '') {
            console.log('Stripe Webhook Base URL is not configured')
            process.exit(1)
        }
        if (stripeWebHookKey === '') {
            const list = await this.stripe.webhookEndpoints.list()
            let shouldCreate = true
            for (const webhook of list.data) {
                if (webhook.url === stripeWebHookBaseUrl + '/api/v1/stripe/webhook') {
                    shouldCreate = false
                    break
                }
            }
            if (shouldCreate) {
                const ednpoint = await this.stripe.webhookEndpoints.create({
                    url: stripeWebHookBaseUrl + '/api/v1/stripe/webhook',
                    enabled_events: [
                        'customer.subscription.created',
                        'customer.subscription.deleted',
                        'customer.subscription.paused',
                        'customer.subscription.resumed',
                        'customer.subscription.trial_will_end',
                        'customer.subscription.updated',
                        'customer.updated',
                        'customer.created',
                        'customer.deleted',
                        'invoice.created',
                        'invoice.paid',
                        'invoice.overdue',
                        'invoice.payment_failed',
                        'invoice.payment_succeeded',
                    ],
                })
                if (ednpoint.created) {
                    console.log('Stripe Webhook created')
                }
                process.exit(1)
            } else {
                console.log('Stripe Webhook already exists, and no secret key is configured')
                process.exit(1)
            }
        }
    }
}
