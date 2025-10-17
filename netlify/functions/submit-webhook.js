/**
 * Netlify Function: Submit Webhook Relay
 * 
 * This function receives form submissions from Netlify Forms and forwards them
 * to an external webhook endpoint (e.g., Zapier, Make, Airtable, Notion).
 * 
 * SETUP:
 * 1. Add WEBHOOK_URL environment variable in Netlify dashboard
 * 2. Configure Netlify Forms notification to call this function
 * 3. Point notification to: https://your-site.netlify.app/.netlify/functions/submit-webhook
 * 
 * Environment Variables:
 * - WEBHOOK_URL: The external webhook endpoint to forward submissions to
 */

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Check if webhook URL is configured
    const webhookUrl = process.env.WEBHOOK_URL;
    
    if (!webhookUrl) {
        console.warn('WEBHOOK_URL environment variable not set. Skipping webhook relay.');
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Webhook not configured. Set WEBHOOK_URL environment variable to enable.' 
            })
        };
    }

    try {
        // Parse the incoming submission data
        const submission = JSON.parse(event.body);
        
        // Extract relevant data
        const payload = {
            submissionId: submission.id || 'unknown',
            formName: submission.form_name || 'disc-assessment',
            timestamp: submission.created_at || new Date().toISOString(),
            data: submission.data || {}
        };

        console.log('Forwarding submission to webhook:', {
            submissionId: payload.submissionId,
            webhookUrl: webhookUrl.substring(0, 30) + '...' // Log partial URL for security
        });

        // Forward to external webhook
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Netlify-Function-Webhook-Relay/1.0'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Webhook responded with status: ${response.status}`);
        }

        console.log('Successfully forwarded submission to webhook');

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Submission forwarded successfully',
                submissionId: payload.submissionId
            })
        };

    } catch (error) {
        console.error('Error forwarding submission:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to forward submission',
                message: error.message
            })
        };
    }
};
