import { Platform } from 'react-native';
import i18n from 'i18next';

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
  language?: string; // Add language parameter
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
  language?: string; // Add language parameter
};

// Add this type at the top with other types
type SupplierMessageData = {
  type: 'message';
  sender: {
    name: string;
    email: string;
  };
  supplier: {
    email: string;
    phoneNumber: string;
  };
  product: {
    id: string;
    name: string;
  };
  message: string;
  language?: string; // Add language parameter
};

class EmailService {
  private isInitialized = false;
  private tokenClient: any = null;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
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
    // Try to load token from localStorage
    const storedToken = localStorage.getItem('gmail_access_token');
    const storedExpiry = localStorage.getItem('gmail_token_expiry');
    
    if (storedToken && storedExpiry && Number(storedExpiry) > Date.now()) {
      this.accessToken = storedToken;
      this.tokenExpiry = Number(storedExpiry);
      window.gapi.client.setToken({ access_token: this.accessToken });
      console.log('Using stored token');
      return;
    }
    
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: this.SCOPES,
      callback: (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          this.accessToken = tokenResponse.access_token;
          // Store token with expiry (default expiry is 1 hour)
          const expiresIn = tokenResponse.expires_in || 3600;
          this.tokenExpiry = Date.now() + (expiresIn * 1000);
          localStorage.setItem('gmail_access_token', this.accessToken);
          localStorage.setItem('gmail_token_expiry', this.tokenExpiry.toString());
          window.gapi.client.setToken({ access_token: this.accessToken });
        }
      },
      error_callback: (error: any) => {
        console.error("Error getting access token:", error);
        this.accessToken = null;
        localStorage.removeItem('gmail_access_token');
        localStorage.removeItem('gmail_token_expiry');
      }
    });
  }

  // Get authorization and access token
  async authorize(): Promise<boolean> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    // Check if we already have a valid token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > Date.now()) {
      console.log('Using existing token');
      return true;
    }

    if (!this.tokenClient) {
      console.error("Token client not initialized");
      return false;
    }

    return new Promise((resolve) => {
      try {
        // Request access token with 'none' prompt if possible
        const hasToken = !!localStorage.getItem('gmail_access_token');
        this.tokenClient.requestAccessToken({
          prompt: hasToken ? 'none' : 'consent'
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

  // Helper method to get translation
  private getTranslation(key: string, language: string, replacements: Record<string, string> = {}): string {
    // Set language for i18n
    const currentLanguage = i18n.language;
    i18n.changeLanguage(language);
    
    // Get translation
    let translation = i18n.t(key);
    
    // Apply replacements
    Object.entries(replacements).forEach(([key, value]) => {
      translation = translation.replace(`{${key}}`, value);
    });
    
    // Restore original language
    i18n.changeLanguage(currentLanguage);
    
    return translation;
  }

  // Send order confirmation email - updated to send to both customer and supplier
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
      // Determine language to use - default to English if not specified
      const language = orderData.language || 'en';
      
      // Send email to customer
      const customerSubject = this.getTranslation('emails.orderConfirmation.title', language);
      const customerEmailBody = this.createCustomerOrderConfirmationBody(orderData, language);
      
      // Create RFC 822 formatted message for customer
      const customerMessage =
        `From: Магазин Колбасы <me@example.com>\r\n` +
        `To: ${orderData.customer.email}\r\n` +
        `Subject: ${customerSubject}\r\n` +
        `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
        customerEmailBody;

      // Base64url encode the customer message
      const encodedCustomerMessage = btoa(unescape(encodeURIComponent(customerMessage)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send the email to customer using Gmail API
      await window.gapi.client.gmail.users.messages.send({
        'userId': 'me',
        'resource': {
          'raw': encodedCustomerMessage
        }
      });
      
      // Send email to supplier - ALWAYS IN RUSSIAN regardless of user language
      const supplierEmail = "sasyktumoo@gmail.com";
      const supplierSubject = `Новый заказ от ${orderData.customer.name}`;
      const supplierEmailBody = this.createSupplierOrderNotificationBody(orderData);
      
      // Create RFC 822 formatted message for supplier
      const supplierMessage =
        `From: Магазин Колбасы <me@example.com>\r\n` +
        `To: ${supplierEmail}\r\n` +
        `Subject: ${supplierSubject}\r\n` +
        `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
        supplierEmailBody;

      // Base64url encode the supplier message
      const encodedSupplierMessage = btoa(unescape(encodeURIComponent(supplierMessage)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send the email to supplier using Gmail API
      await window.gapi.client.gmail.users.messages.send({
        'userId': 'me',
        'resource': {
          'raw': encodedSupplierMessage
        }
      });
      
      console.log('Order confirmation emails sent successfully to customer and supplier');
      return true;
    } catch (error) {
      console.error("Error sending order confirmation emails:", error);
      return false;
    }
  }

  // Updated method for customer email with language support
  private createCustomerOrderConfirmationBody(orderData: OrderEmailData, language: string): string {
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
    
    // Get translations
    const title = this.getTranslation('emails.orderConfirmation.title', language);
    const greeting = this.getTranslation('emails.orderConfirmation.greeting', language, { name: orderData.customer.name });
    const thankYouMessage = this.getTranslation('emails.orderConfirmation.thankYouMessage', language);
    const orderSummary = this.getTranslation('emails.orderConfirmation.orderSummary', language);
    const product = this.getTranslation('emails.orderConfirmation.product', language);
    const quantity = this.getTranslation('emails.orderConfirmation.quantity', language);
    const price = this.getTranslation('emails.orderConfirmation.price', language);
    const total = this.getTranslation('emails.orderConfirmation.total', language);
    const shippingInfo = this.getTranslation('emails.orderConfirmation.shippingInfo', language);
    const questionsContact = this.getTranslation('emails.orderConfirmation.questionsContact', language);
    const thankYouClosing = this.getTranslation('emails.orderConfirmation.thankYouClosing', language);
    const sincerely = this.getTranslation('emails.orderConfirmation.sincerely', language);
    const teamName = this.getTranslation('emails.orderConfirmation.teamName', language);
    const copyright = this.getTranslation('emails.common.copyright', language, { year: new Date().getFullYear().toString() });

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
              <h1>${title}</h1>
            </div>
            <div class="content">
              <p>${greeting}</p>
              <p>${thankYouMessage}</p>
              
              <h2>${orderSummary}</h2>
              <table class="order-table">
                <tr>
                  <th>${product}</th>
                  <th>${quantity}</th>
                  <th>${price}</th>
                </tr>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">${total}:</td>
                  <td style="padding: 10px; font-weight: bold;">${orderData.totalAmount} ₽</td>
                </tr>
              </table>
              
              <h2>${shippingInfo}</h2>
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
              
              <p>${questionsContact}</p>
              <p>${thankYouClosing}</p>
              
              <p>${sincerely}<br>${teamName}</p>
            </div>
            <div class="footer">
              <p>${copyright}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Supplier notification email - ALWAYS IN RUSSIAN
  private createSupplierOrderNotificationBody(orderData: OrderEmailData): string {
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
            .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .info-table th { background-color: #f2f2f2; text-align: left; padding: 10px; width: 30%; }
            .info-table td { padding: 10px; border-bottom: 1px solid #f2f2f2; }
            .address-box { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 4px; }
            .message-box { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Новый заказ получен</h1>
            </div>
            <div class="content">
              <p>Новый заказ был размещен на сайте Магазин Колбасы. Пожалуйста, обработайте этот заказ как можно скорее.</p>
              
              <h2>Информация о клиенте</h2>
              <table class="info-table">
                <tr>
                  <th>Имя</th>
                  <td>${orderData.customer.name}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>${orderData.customer.email}</td>
                </tr>
                <tr>
                  <th>Телефон</th>
                  <td>${orderData.customer.phone}</td>
                </tr>
              </table>
              
              <h2>Адрес доставки</h2>
              <div class="address-box">
                <p>
                  ${orderData.address.fullName}<br>
                  ${orderData.address.streetAddress}<br>
                  ${orderData.address.apartment ? orderData.address.apartment + '<br>' : ''}
                  ${orderData.address.city}, ${orderData.address.state} ${orderData.address.postalCode}<br>
                  ${orderData.address.country}<br>
                  Телефон: ${orderData.address.phoneNumber}
                </p>
              </div>
              
              <h2>Детали заказа</h2>
              <table class="order-table">
                <tr>
                  <th>Товар</th>
                  <th>Количество</th>
                  <th>Цена</th>
                </tr>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Итого:</td>
                  <td style="padding: 10px; font-weight: bold;">${orderData.totalAmount} ₽</td>
                </tr>
              </table>
              
              <p>Пожалуйста, свяжитесь с клиентом для подтверждения заказа и согласования доставки.</p>
              <p>Спасибо,<br>Система Магазина Колбасы</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Магазин Колбасы. Все права защищены.</p>
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
      // Determine language to use - default to English if not specified
      const language = requestData.language || 'en';
      
      // Create the customer confirmation email
      const customerEmail = requestData.customer.email;
      const customerSubject = this.getTranslation('emails.callbackRequest.title', language);
      const customerEmailBody = this.createCallbackCustomerConfirmation(requestData, language);
      
      // Create and send customer confirmation if an email is provided
      if (customerEmail) {
        // Create RFC 822 formatted message
        const customerMessage =
          `From: Магазин Колбасы <me@example.com>\r\n` +
          `To: ${customerEmail}\r\n` +
          `Subject: ${customerSubject}\r\n` +
          `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
          customerEmailBody;

        // Base64url encode the message
        const encodedCustomerMessage = btoa(unescape(encodeURIComponent(customerMessage)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        // Send the email using Gmail API
        await window.gapi.client.gmail.users.messages.send({
          'userId': 'me',
          'resource': {
            'raw': encodedCustomerMessage
          }
        });
      }
      
      // Create the supplier notification email - ALWAYS IN RUSSIAN
      const supplierEmail = "sasyktumoo@gmail.com";
      const supplierSubject = "Запрос обратного звонка - Магазин Колбасы";
      const supplierEmailBody = this.createCallbackRequestBody(requestData);
      
      // Create RFC 822 formatted message
      const supplierMessage =
        `From: Магазин Колбасы <me@example.com>\r\n` +
        `To: ${supplierEmail}\r\n` +
        `Subject: ${supplierSubject}\r\n` +
        `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
        supplierEmailBody;

      // Base64url encode the message
      const encodedSupplierMessage = btoa(unescape(encodeURIComponent(supplierMessage)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send the email using Gmail API
      await window.gapi.client.gmail.users.messages.send({
        'userId': 'me',
        'resource': {
          'raw': encodedSupplierMessage
        }
      });
      
      console.log('Callback request emails sent successfully');
      return true;
    } catch (error) {
      console.error("Error sending callback request emails:", error);
      return false;
    }
  }

  // Create HTML email body for customer callback confirmation
  private createCallbackCustomerConfirmation(requestData: CallbackRequestData, language: string): string {
    // Get translations
    const title = this.getTranslation('emails.callbackRequest.title', language);
    const greeting = this.getTranslation('emails.callbackRequest.greeting', language);
    const thankYouMessage = this.getTranslation('emails.callbackRequest.thankYouMessage', language, 
      { productName: requestData.product.name });
    const weWillContact = this.getTranslation('emails.callbackRequest.weWillContact', language, 
      { phone: requestData.customer.phone });
    const additionalInfo = this.getTranslation('emails.callbackRequest.additionalInfo', language);
    const comments = this.getTranslation('emails.callbackRequest.comments', language);
    const noComments = this.getTranslation('emails.callbackRequest.noComments', language);
    const questionsContact = this.getTranslation('emails.callbackRequest.questionsContact', language);
    const sincerely = this.getTranslation('emails.callbackRequest.sincerely', language);
    const teamName = this.getTranslation('emails.callbackRequest.teamName', language);
    const copyright = this.getTranslation('emails.common.copyright', language, { year: new Date().getFullYear().toString() });

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background-color: #FF3B30; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; }
            .comment-box { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${title}</h1>
            </div>
            <div class="content">
              <p>${greeting}</p>
              <p>${thankYouMessage}</p>
              <p>${weWillContact}</p>
              
              ${requestData.comments ? `
              <h2>${additionalInfo}</h2>
              <div class="comment-box">
                <h3>${comments}</h3>
                <p>${requestData.comments}</p>
              </div>
              ` : `
              <p>${noComments}</p>
              `}
              
              <p>${questionsContact}</p>
              
              <p>${sincerely}<br>${teamName}</p>
            </div>
            <div class="footer">
              <p>${copyright}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Create HTML email body for supplier callback request - ALWAYS IN RUSSIAN
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
              <h1>Запрос обратного звонка</h1>
            </div>
            <div class="content">
              <p>Клиент запросил обратный звонок по одному из ваших товаров.</p>
              
              <h2>Детали запроса</h2>
              <table class="info-table">
                <tr>
                  <th>Дата запроса</th>
                  <td>${currentDate}</td>
                </tr>
                <tr>
                  <th>Номер телефона</th>
                  <td>${requestData.customer.phone}</td>
                </tr>
                <tr>
                  <th>Товар</th>
                  <td>${requestData.product.name} (ID: ${requestData.product.id})</td>
                </tr>
              </table>
              
              ${requestData.comments ? `
              <h2>Комментарии клиента</h2>
              <div class="comment-box">
                <p>${requestData.comments}</p>
              </div>
              ` : ''}
              
              <p>Пожалуйста, свяжитесь с этим клиентом как можно скорее.</p>
              
              <p>Спасибо,<br>Система Магазина Колбасы</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Магазин Колбасы. Все права защищены.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Update supplier message method to support language
  async sendSupplierMessage(messageData: SupplierMessageData): Promise<boolean> {
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
      // Determine language to use - default to English if not specified
      const language = messageData.language || 'en';
      
      // Create the customer confirmation email if we have sender email
      if (messageData.sender.email) {
        const customerSubject = this.getTranslation('emails.messageConfirmation.title', language);
        const customerEmailBody = this.createMessageCustomerConfirmation(messageData, language);
        
        // Create RFC 822 formatted message
        const customerMessage =
          `From: Магазин Колбасы <me@example.com>\r\n` +
          `To: ${messageData.sender.email}\r\n` +
          `Subject: ${customerSubject}\r\n` +
          `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
          customerEmailBody;

        // Base64url encode the message
        const encodedCustomerMessage = btoa(unescape(encodeURIComponent(customerMessage)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        // Send the customer confirmation email using Gmail API
        await window.gapi.client.gmail.users.messages.send({
          'userId': 'me',
          'resource': {
            'raw': encodedCustomerMessage
          }
        });
      }
      
      // Create the supplier notification - ALWAYS IN RUSSIAN
      const supplierEmail = "sasyktumoo@gmail.com";
      const supplierSubject = `Сообщение от клиента о товаре: ${messageData.product.name}`;
      const supplierEmailBody = this.createSupplierMessageBody(messageData);
      
      // Create RFC 822 formatted message
      const supplierMessage =
        `From: Магазин Колбасы <me@example.com>\r\n` +
        `Reply-To: ${messageData.sender.email}\r\n` +
        `To: ${supplierEmail}\r\n` +
        `Subject: ${supplierSubject}\r\n` +
        `Content-Type: text/html; charset=UTF-8\r\n\r\n` +
        supplierEmailBody;

      // Base64url encode the message
      const encodedSupplierMessage = btoa(unescape(encodeURIComponent(supplierMessage)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send the supplier notification email using Gmail API
      await window.gapi.client.gmail.users.messages.send({
        'userId': 'me',
        'resource': {
          'raw': encodedSupplierMessage
        }
      });
      
      console.log('Supplier message emails sent successfully');
      return true;
    } catch (error) {
      console.error("Error sending supplier message emails:", error);
      return false;
    }
  }
  
  // Create HTML email body for customer message confirmation
  private createMessageCustomerConfirmation(messageData: SupplierMessageData, language: string): string {
    // Get translations
    const title = this.getTranslation('emails.messageConfirmation.title', language);
    const greeting = this.getTranslation('emails.messageConfirmation.greeting', language, 
      { name: messageData.sender.name });
    const thankYouMessage = this.getTranslation('emails.messageConfirmation.thankYouMessage', language, 
      { productName: messageData.product.name });
    const weWillContact = this.getTranslation('emails.messageConfirmation.weWillContact', language);
    const messageCopy = this.getTranslation('emails.messageConfirmation.messageCopy', language);
    const questionsContact = this.getTranslation('emails.messageConfirmation.questionsContact', language);
    const sincerely = this.getTranslation('emails.messageConfirmation.sincerely', language);
    const teamName = this.getTranslation('emails.messageConfirmation.teamName', language);
    const copyright = this.getTranslation('emails.common.copyright', language, { year: new Date().getFullYear().toString() });

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background-color: #FF3B30; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; }
            .message-box { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${title}</h1>
            </div>
            <div class="content">
              <p>${greeting}</p>
              <p>${thankYouMessage}</p>
              <p>${weWillContact}</p>
              
              <h2>${messageCopy}</h2>
              <div class="message-box">
                <p>${messageData.message.replace(/\n/g, '<br>')}</p>
              </div>
              
              <p>${questionsContact}</p>
              
              <p>${sincerely}<br>${teamName}</p>
            </div>
            <div class="footer">
              <p>${copyright}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Create HTML email body for supplier - ALWAYS IN RUSSIAN
  private createSupplierMessageBody(messageData: SupplierMessageData): string {
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
            .message-box { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Сообщение от клиента</h1>
            </div>
            <div class="content">
              <p>Вы получили сообщение от клиента о вашем товаре.</p>
              
              <h2>Детали сообщения</h2>
              <table class="info-table">
                <tr>
                  <th>Дата</th>
                  <td>${currentDate}</td>
                </tr>
                <tr>
                  <th>От</th>
                  <td>${messageData.sender.name} (${messageData.sender.email})</td>
                </tr>
                <tr>
                  <th>Товар</th>
                  <td>${messageData.product.name} (ID: ${messageData.product.id})</td>
                </tr>
              </table>
              
              <h2>Сообщение клиента</h2>
              <div class="message-box">
                <p>${messageData.message.replace(/\n/g, '<br>')}</p>
              </div>
              
              <p>Вы можете ответить на это письмо, чтобы связаться с клиентом.</p>
              
              <p>Спасибо,<br>Система Магазина Колбасы</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Магазин Колбасы. Все права защищены.</p>
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