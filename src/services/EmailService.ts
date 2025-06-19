import { Platform } from 'react-native';

// Types for order email data
type OrderEmailData = {
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  address: {
    fullName: string;
    streetAddress: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phoneNumber: string;
  };
};

// Add type for callback request data
type CallbackRequestData = {
  type: 'callback';
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  product: {
    id: string;
    name: string;
  };
  comments?: string;
};

class EmailService {
  private isInitialized = false;
  private tokenClient: any = null;
  private accessToken: string | null = null;
  private CLIENT_ID = "663465018429-i64u55mqo79qr3t7eusfb1h979onjhgk.apps.googleusercontent.com";
  private API_KEY = ""; // Add your API key if needed for Gmail API
  private SCOPES = "https://www.googleapis.com/auth/gmail.send";
  
  // Initialize the Google API client with new Identity Services
  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'web') {
      console.log('Email service is only available on web platform');
      return false;
    }

    try {
      return new Promise((resolve) => {
        // Load the Google API script
        const gapiScript = document.createElement("script");
        gapiScript.src = "https://apis.google.com/js/api.js";
        gapiScript.onload = () => this.loadGapiModules(resolve);
        document.head.appendChild(gapiScript);
        
        // Load the Google Identity Services script
        const gisScript = document.createElement("script");
        gisScript.src = "https://accounts.google.com/gsi/client";
        document.head.appendChild(gisScript);
      });
    } catch (error) {
      console.error("Error loading Google API scripts:", error);
      return false;
    }
  }

  private async loadGapiModules(resolve: (value: boolean) => void): Promise<void> {
    window.gapi.load('client', async () => {
      try {
        await window.gapi.client.init({
          apiKey: this.API_KEY,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
        });
        
        // Initialize GIS token client after GAPI is loaded
        this.initTokenClient();
        this.isInitialized = true;
        resolve(true);
      } catch (error) {
        console.error("Error initializing GAPI client:", error);
        resolve(false);
      }
    });
  }

  private initTokenClient(): void {
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: this.SCOPES,
      callback: (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          this.accessToken = tokenResponse.access_token;
          window.gapi.client.setToken({ access_token: this.accessToken });
        }
      },
      error_callback: (error: any) => {
        console.error("Error getting access token:", error);
        this.accessToken = null;
      }
    });
  }

  // Get authorization and access token
  async authorize(): Promise<boolean> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    if (!this.tokenClient) {
      console.error("Token client not initialized");
      return false;
    }

    return new Promise((resolve) => {
      try {
        // Request access token
        this.tokenClient.requestAccessToken({
          prompt: 'consent',
          hint: ''
        });
        
        // We'll resolve in the callback after token is received
        const checkToken = setInterval(() => {
          if (this.accessToken) {
            clearInterval(checkToken);
            resolve(true);
          }
        }, 500);
        
        // Timeout after 1 minute
        setTimeout(() => {
          clearInterval(checkToken);
          if (!this.accessToken) {
            console.error("Timeout waiting for authorization");
            resolve(false);
          }
        }, 60000);
      } catch (error) {
        console.error("Error requesting access token:", error);
        resolve(false);
      }
    });
  }

  // Send order confirmation email
  async sendOrderConfirmation(orderData: OrderEmailData): Promise<boolean> {
    if (Platform.OS !== 'web') {
      console.log('Email sending is only available on web platform');
      return false;
    }

    // Make sure we're authorized
    const isAuthorized = await this.authorize();
    if (!isAuthorized) {
      console.log('User not authorized for Gmail');
      return false;
    }

    try {
      // Create the email content
      const subject = 'Your Order Confirmation - Магазин Колбасы';
      const emailBody = this.createOrderConfirmationBody(orderData);
      
      // Create RFC 822 formatted message
      // We don't have access to the user's email directly with the new GIS flow
      // So we'll use "me" as a placeholder, Gmail API will use the authenticated user's email
      const message =
        `From: Магазин Колбасы <me@example.com>\r\n` +
        `To: ${orderData.customer.email}\r\n` +
        `Subject: ${subject}\r\n` +
        `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
        emailBody;

      // Base64url encode the message
      const encodedMessage = btoa(unescape(encodeURIComponent(message)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send the email using Gmail API
      const response = await window.gapi.client.gmail.users.messages.send({
        'userId': 'me',
        'resource': {
          'raw': encodedMessage
        }
      });
      
      console.log('Order confirmation email sent successfully');
      return true;
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      return false;
    }
  }

  // Create HTML email body for order confirmation
  private createOrderConfirmationBody(orderData: OrderEmailData): string {
    // Format items for the email
    let itemsHtml = '';
    orderData.items.forEach(item => {
      itemsHtml += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.price * item.quantity} ₽</td>
        </tr>
      `;
    });

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background-color: #FF3B30; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .order-table th { background-color: #f2f2f2; text-align: left; padding: 10px; }
            .footer { background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; }
            .total-row { font-weight: bold; }
            .address-box { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmation</h1>
            </div>
            <div class="content">
              <p>Dear ${orderData.customer.name},</p>
              <p>Thank you for your order from Магазин Колбасы! We're processing your order and will notify you when it ships.</p>
              
              <h2>Order Summary</h2>
              <table class="order-table">
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                  <td style="padding: 10px; font-weight: bold;">${orderData.totalAmount} ₽</td>
                </tr>
              </table>
              
              <h2>Shipping Information</h2>
              <div class="address-box">
                <p>
                  ${orderData.address.fullName}<br>
                  ${orderData.address.streetAddress}<br>
                  ${orderData.address.apartment ? orderData.address.apartment + '<br>' : ''}
                  ${orderData.address.city}, ${orderData.address.state} ${orderData.address.postalCode}<br>
                  ${orderData.address.country}<br>
                  Phone: ${orderData.address.phoneNumber}
                </p>
              </div>
              
              <p>If you have any questions, please contact our customer service team.</p>
              <p>Thank you for shopping with us!</p>
              
              <p>Sincerely,<br>Магазин Колбасы Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Магазин Колбасы. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Send callback request email
  async sendCallbackRequest(requestData: CallbackRequestData): Promise<boolean> {
    if (Platform.OS !== 'web') {
      console.log('Email sending is only available on web platform');
      return false;
    }

    // Make sure we're authorized
    const isAuthorized = await this.authorize();
    if (!isAuthorized) {
      console.log('User not authorized for Gmail');
      return false;
    }

    try {
      // Create the email content
      const subject = 'New Callback Request - Магазин Колбасы';
      const emailBody = this.createCallbackRequestBody(requestData);
      
      // Create RFC 822 formatted message
      const message =
        `From: Магазин Колбасы <me@example.com>\r\n` +
        `To: ${requestData.customer.email}\r\n` +
        `Subject: ${subject}\r\n` +
        `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
        emailBody;

      // Base64url encode the message
      const encodedMessage = btoa(unescape(encodeURIComponent(message)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send the email using Gmail API
      const response = await window.gapi.client.gmail.users.messages.send({
        'userId': 'me',
        'resource': {
          'raw': encodedMessage
        }
      });
      
      console.log('Callback request email sent successfully');
      return true;
    } catch (error) {
      console.error("Error sending callback request email:", error);
      return false;
    }
  }

  // Create HTML email body for callback request
  private createCallbackRequestBody(requestData: CallbackRequestData): string {
    const currentDate = new Date().toLocaleString();
    
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background-color: #FF3B30; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .info-table th { background-color: #f2f2f2; text-align: left; padding: 10px; width: 40%; }
            .info-table td { padding: 10px; border-bottom: 1px solid #f2f2f2; }
            .footer { background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; }
            .comment-box { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Callback Request</h1>
            </div>
            <div class="content">
              <p>A customer has requested a callback about one of your products.</p>
              
              <h2>Request Details</h2>
              <table class="info-table">
                <tr>
                  <th>Date Requested</th>
                  <td>${currentDate}</td>
                </tr>
                <tr>
                  <th>Phone Number</th>
                  <td>${requestData.customer.phone}</td>
                </tr>
                <tr>
                  <th>Product</th>
                  <td>${requestData.product.name} (ID: ${requestData.product.id})</td>
                </tr>
              </table>
              
              ${requestData.comments ? `
              <h2>Customer Comments</h2>
              <div class="comment-box">
                <p>${requestData.comments}</p>
              </div>
              ` : ''}
              
              <p>Please contact this customer as soon as possible.</p>
              
              <p>Thank you,<br>Магазин Колбасы System</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Магазин Колбасы. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

// Create and export a singleton instance
const emailService = new EmailService();
export default emailService;