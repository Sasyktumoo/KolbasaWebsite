import { Platform } from 'react-native';
import i18n from 'i18next';

// Firebase function URL - replace with your actual deployed function URL
const EMAIL_FUNCTION_URL = 'https://sendmail-fegyr7vchq-uc.a.run.app';

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
  language?: string;
};

// Type for callback request data
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
  language?: string;
};

// Type for supplier message data
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
  language?: string;
};

class EmailService {
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

  // New method to send emails via Cloud Function
  private async sendEmail(to: string, subject: string, html: string, options: {
    from?: string;
    cc?: string;
    replyTo?: string;
  } = {}): Promise<boolean> {
    if (Platform.OS !== 'web') {
      console.log('Email sending is only available on web platform');
      return false;
    }

    try {
      const response = await fetch(EMAIL_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html,
          from: options.from || 'Магазин Колбасы <noreply@kolbasa-shop.com>',
          cc: options.cc,
          replyTo: options.replyTo
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }
      
      console.log('Email sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Initialization is simplified - no need for OAuth setup
  async initialize(): Promise<boolean> {
    // Nothing to initialize with the server approach
    return true;
  }

  // Send order confirmation email - updated to use Cloud Function
  async sendOrderConfirmation(orderData: OrderEmailData): Promise<boolean> {
    if (Platform.OS !== 'web') {
      console.log('Email sending is only available on web platform');
      return false;
    }

    try {
      // Determine language to use - default to English if not specified
      const language = orderData.language || 'en';
      
      // Send email to customer
      const customerSubject = this.getTranslation('emails.orderConfirmation.title', language);
      const customerEmailBody = this.createCustomerOrderConfirmationBody(orderData, language);
      
      // Send customer email via Cloud Function
      await this.sendEmail(
        orderData.customer.email,
        customerSubject,
        customerEmailBody
      );
      
      // Send email to supplier - ALWAYS IN RUSSIAN
      const supplierEmail = "post@ulus.cz@gmail.com";
      const supplierSubject = `Новый заказ от ${orderData.customer.name}`;
      const supplierEmailBody = this.createSupplierOrderNotificationBody(orderData);
      
      // Send supplier email via Cloud Function
      await this.sendEmail(
        supplierEmail,
        supplierSubject,
        supplierEmailBody,
        { replyTo: orderData.customer.email }
      );
      
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

    // HTML template remains the same
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

    // HTML template remains the same
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

    try {
      // Determine language to use - default to English if not specified
      const language = requestData.language || 'en';
      
      // Create the customer confirmation email
      const customerEmail = requestData.customer.email;
      if (customerEmail) {
        const customerSubject = this.getTranslation('emails.callbackRequest.title', language);
        const customerEmailBody = this.createCallbackCustomerConfirmation(requestData, language);
        
        // Send customer email via Cloud Function
        await this.sendEmail(
          customerEmail,
          customerSubject,
          customerEmailBody
        );
      }
      
      // Create the supplier notification email - ALWAYS IN RUSSIAN
      const supplierEmail = "post@ulus.cz@gmail.com";
      const supplierSubject = "Запрос обратного звонка - Магазин Колбасы";
      const supplierEmailBody = this.createCallbackRequestBody(requestData);
      
      // Send supplier email via Cloud Function
      await this.sendEmail(
        supplierEmail,
        supplierSubject,
        supplierEmailBody
      );
      
      console.log('Callback request emails sent successfully');
      return true;
    } catch (error) {
      console.error("Error sending callback request emails:", error);
      return false;
    }
  }

  // Create HTML email body for customer callback confirmation
  private createCallbackCustomerConfirmation(requestData: CallbackRequestData, language: string): string {
    // HTML template with translations remains the same
    // ... existing code ...
    // I'm keeping the same HTML template, but now it's sent via Cloud Function
    
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
    
    // HTML template remains the same
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

    try {
      // Determine language to use - default to English if not specified
      const language = messageData.language || 'en';
      
      // Create the customer confirmation email if we have sender email
      if (messageData.sender.email) {
        const customerSubject = this.getTranslation('emails.messageConfirmation.title', language);
        const customerEmailBody = this.createMessageCustomerConfirmation(messageData, language);
        
        // Send customer email via Cloud Function
        await this.sendEmail(
          messageData.sender.email,
          customerSubject,
          customerEmailBody
        );
      }
      
      // Create the supplier notification - ALWAYS IN RUSSIAN
      const supplierEmail = "post@ulus.cz@gmail.com";
      const supplierSubject = `Сообщение от клиента о товаре: ${messageData.product.name}`;
      const supplierEmailBody = this.createSupplierMessageBody(messageData);
      
      // Send supplier email via Cloud Function
      await this.sendEmail(
        supplierEmail,
        supplierSubject,
        supplierEmailBody,
        { replyTo: messageData.sender.email }
      );
      
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

    // HTML template remains the same
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
    
    // HTML template remains the same
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