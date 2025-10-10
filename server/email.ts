import nodemailer from 'nodemailer';
import type { Order, Restaurant, User } from '@shared/schema';

// Brevo SMTP configuration
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER || '',
    pass: process.env.BREVO_SMTP_PASSWORD || '',
  },
});

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@westrowkitchen.com';
const FROM_NAME = 'West Row Kitchen';

// Email templates
const generateOrderConfirmationEmail = (order: any, restaurant: Restaurant, user: User) => {
  const orderItems = order.items.map((item: any) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #16a34a; margin: 0;">West Row Kitchen</h1>
        <p style="color: #666; margin: 5px 0;">Order Confirmation</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 10px 0; color: #333;">Hi ${user.firstName}!</h2>
        <p style="margin: 0; color: #666;">Your order has been confirmed and is being prepared.</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; border-bottom: 2px solid #16a34a; padding-bottom: 5px;">Order Details</h3>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Restaurant:</strong> ${restaurant.name}</p>
        <p><strong>Estimated Delivery:</strong> ${order.estimatedDeliveryTime || '30-45 minutes'}</p>
        <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; border-bottom: 2px solid #16a34a; padding-bottom: 5px;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems}
          </tbody>
        </table>
      </div>
      
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; text-align: right;">
        <p style="margin: 5px 0;"><strong>Subtotal: $${order.subtotal?.toFixed(2) || '0.00'}</strong></p>
        <p style="margin: 5px 0;">Delivery Fee: $${order.deliveryFee?.toFixed(2) || '0.00'}</p>
        <p style="margin: 5px 0;">Service Fee: $${order.serviceFee?.toFixed(2) || '0.00'}</p>
        <p style="margin: 5px 0;">Tax: $${order.tax?.toFixed(2) || '0.00'}</p>
        <h3 style="margin: 10px 0 0 0; color: #16a34a;">Total: $${order.total?.toFixed(2) || '0.00'}</h3>
      </div>
      
      <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
        <p>Thank you for choosing West Row Kitchen!</p>
        <p>You can track your order status in your account.</p>
      </div>
    </div>
  `;
};

const generateOrderStatusEmail = (order: any, restaurant: Restaurant, user: User, status: string) => {
  const statusMessages = {
    confirmed: 'Your order has been confirmed and the restaurant is preparing it.',
    preparing: 'Your order is being prepared with care.',
    ready: 'Your order is ready for pickup/delivery!',
    out_for_delivery: 'Your order is on its way to you.',
    delivered: 'Your order has been delivered. Enjoy your meal!',
    cancelled: 'Your order has been cancelled.'
  };

  const statusColors = {
    confirmed: '#f59e0b',
    preparing: '#3b82f6',
    ready: '#10b981',
    out_for_delivery: '#8b5cf6',
    delivered: '#16a34a',
    cancelled: '#ef4444'
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #16a34a; margin: 0;">West Row Kitchen</h1>
        <p style="color: #666; margin: 5px 0;">Order Update</p>
      </div>
      
      <div style="background: ${statusColors[status as keyof typeof statusColors] || '#f59e0b'}; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
        <h2 style="margin: 0 0 10px 0;">Order ${status.replace('_', ' ').toUpperCase()}</h2>
        <p style="margin: 0;">${statusMessages[status as keyof typeof statusMessages] || 'Your order status has been updated.'}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333;">Order Details</h3>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Restaurant:</strong> ${restaurant.name}</p>
        <p><strong>Customer:</strong> ${user.firstName} ${user.lastName}</p>
      </div>
      
      <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
        <p>Thank you for choosing West Row Kitchen!</p>
      </div>
    </div>
  `;
};

const generateWelcomeEmail = (user: User) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #16a34a; margin: 0;">Welcome to West Row Kitchen!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #333;">Hi ${user.firstName}!</h2>
        <p style="margin: 0 0 15px 0; color: #666;">Welcome to West Row Kitchen! We're excited to have you join our community of food lovers.</p>
        <p style="margin: 0; color: #666;">Start exploring amazing local restaurants and get your favorite meals delivered right to your door.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/restaurants" 
           style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Browse Restaurants
        </a>
      </div>
      
      <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
        <p>Happy ordering!</p>
        <p>The West Row Kitchen Team</p>
      </div>
    </div>
  `;
};

// Email sending functions
export const sendOrderConfirmationEmail = async (order: any, restaurant: Restaurant, user: User) => {
  try {
    const mailOptions = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: user.email,
      subject: `Order Confirmed - ${restaurant.name} | West Row Kitchen`,
      html: generateOrderConfirmationEmail(order, restaurant, user),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', result.messageId);
    return result;
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('⚠️ Error sending order confirmation email:', error.message);
    }
    return false; // Don’t throw — continue gracefully
  }
};

export const sendOrderStatusEmail = async (order: any, restaurant: Restaurant, user: User, status: string) => {
  try {
    const mailOptions = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: user.email,
      subject: `Order ${status.replace('_', ' ').toUpperCase()} - ${restaurant.name} | West Row Kitchen`,
      html: generateOrderStatusEmail(order, restaurant, user, status),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order status email sent:', result.messageId);
    return result;
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('⚠️ Error sending order status email:', error.message);
    }
    return false;
  }
};

export const sendWelcomeEmail = async (user: User) => {
  try {
    const mailOptions = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: user.email,
      subject: 'Welcome to West Row Kitchen!',
      html: generateWelcomeEmail(user),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', result.messageId);
    return result;
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('⚠️ Error sending welcome email:', error.message);
    }
    return false;
  }
};

// Test email function
export const testEmailConnection = async () => {
  // Skip email verification if credentials are not provided
  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASSWORD) {
    console.log('Email credentials not configured - skipping email service verification');
    return false;
  }
  
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
};