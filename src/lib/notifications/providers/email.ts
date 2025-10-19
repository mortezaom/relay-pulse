/**
 * Email Notification Provider using Resend
 * 
 * Resend is a modern email API built for developers, optimized for serverless/edge environments
 * Sign up at: https://resend.com/signup
 * 
 * Pricing (as of 2025):
 * - Free tier: 100 emails/day, 3,000 emails/month (perfect for personal projects)
 * - Pro tier: $20/month for 50,000 emails/month
 * - Scale tier: Custom pricing for higher volumes
 * 
 * Features:
 * - Native fetch API support (perfect for Cloudflare Workers)
 * - No SMTP dependencies
 * - Built-in domain verification
 * - Detailed delivery analytics
 * - Supports custom domains
 * 
 * Requirements:
 * - Verify your sending domain in Resend dashboard
 * - Use a verified domain email as fromEmail
 * - Get your API key from https://resend.com/api-keys
 */

import { formatMessage } from "../formatter";
import type {
    EmailCredentials,
    INotificationProvider,
    NotificationPayload,
    NotificationResult,
} from "../types";

export class EmailProvider implements INotificationProvider<EmailCredentials> {
    private readonly RESEND_API_URL = "https://api.resend.com/emails";

    async send(
        payload: NotificationPayload,
        credentials: EmailCredentials,
    ): Promise<NotificationResult> {
        try {
            const message = formatMessage("email", payload);
            return await this.sendViaResend(credentials, message);
        } catch (error) {
            return {
                success: false,
                provider: "email",
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString(),
            };
        }
    }

    private async sendViaResend(
        credentials: EmailCredentials,
        message: any,
    ): Promise<NotificationResult> {
        const { resendApiKey, fromEmail, toEmails } = credentials;

        if (!resendApiKey || !fromEmail || !toEmails || toEmails.length === 0) {
            throw new Error("Resend API key, from email, and at least one recipient are required");
        }

        try {
            // Send email via Resend API using fetch
            const response = await fetch(this.RESEND_API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${resendApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: fromEmail,
                    to: toEmails,
                    subject: message.subject,
                    html: message.html,
                    text: message.text,
                }),
            });

            const data = await response.json() as any;

            if (!response.ok) {
                // Resend returns detailed error messages
                const errorMessage = data?.message || data?.error || `HTTP ${response.status}`;
                throw new Error(`Resend API error: ${errorMessage}`);
            }

            return {
                success: true,
                provider: "email",
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            // Provide helpful error messages for common issues
            let errorMsg = error instanceof Error ? error.message : String(error);

            if (errorMsg.includes("403") || errorMsg.includes("unauthorized")) {
                errorMsg = "Invalid Resend API key. Get your key from https://resend.com/api-keys";
            } else if (errorMsg.includes("domain") || errorMsg.includes("verify")) {
                errorMsg = "Domain not verified. Verify your domain at https://resend.com/domains";
            } else if (errorMsg.includes("rate limit")) {
                errorMsg = "Rate limit exceeded. Free tier: 100 emails/day, 3,000/month";
            }

            throw new Error(errorMsg);
        }
    }

    validate(credentials: any): credentials is EmailCredentials {
        // Validate email addresses
        const hasValidEmails =
            typeof credentials.fromEmail === "string" &&
            credentials.fromEmail.includes("@") &&
            Array.isArray(credentials.toEmails) &&
            credentials.toEmails.length > 0 &&
            credentials.toEmails.every(
                (email: any) => typeof email === "string" && email.includes("@"),
            );

        if (!hasValidEmails) {
            return false;
        }

        // Validate Resend API key
        return (
            typeof credentials.resendApiKey === "string" &&
            credentials.resendApiKey.length > 0 &&
            credentials.resendApiKey.startsWith("re_") // Resend API keys start with "re_"
        );
    }

    async test(credentials: EmailCredentials): Promise<boolean> {
        try {
            // Test Resend by sending actual test email
            const result = await this.send(
                {
                    serviceId: 0,
                    serviceName: "Test Service",
                    status: "up",
                    message: "Test notification - your Resend configuration is working! 🎉",
                    timestamp: new Date().toISOString(),
                },
                credentials,
            );
            return result.success;
        } catch (error) {
            console.error("Email test failed:", error);
            return false;
        }
    }
}
