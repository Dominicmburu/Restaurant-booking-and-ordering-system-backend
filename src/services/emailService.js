const createTransporter = require('../config/email');
const { logger } = require('../utils/logger');

exports.sendOrderConfirmation = async (order, customer) => {
  try {
    const transporter = await createTransporter();

    // Format items for email
    const itemsList = order.orderItems.map(item => 
      `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}x ${item.menuItem.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">£${item.price.toFixed(2)}</td>
      </tr>`
    ).join('');

    // Create HTML email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FFC107; padding: 20px; text-align: center; color: #333;">
          <h1>Order Confirmation</h1>
          <p>Order #${order.orderNumber}</p>
        </div>
        
        <div style="padding: 20px;">
          <h2>Thank you for your order, ${customer.name}!</h2>
          <p>We've received your order and are working on it right away.</p>
          
          <div style="background-color: #f9f9f9; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Restaurant:</strong> ${order.restaurant.name}</p>
            <p><strong>Order Type:</strong> ${order.orderType}</p>
            <p><strong>Estimated Time:</strong> ${order.orderType === 'DELIVERY' ? '30-45 minutes' : '15-20 minutes'}</p>
            ${order.orderType === 'DELIVERY' ? `<p><strong>Delivery Address:</strong> ${order.address}, ${order.city} ${order.postcode}</p>` : ''}
            ${order.scheduledTime ? `<p><strong>Scheduled For:</strong> ${new Date(order.scheduledTime).toLocaleString()}</p>` : ''}
          </div>
          
          <h3>Your Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: left;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
                <td style="padding: 10px;">£${(order.total - (order.deliveryFee || 0) - (order.tip || 0)).toFixed(2)}</td>
              </tr>
              ${order.deliveryFee ? `
              <tr>
                <td style="padding: 10px; text-align: right;">Delivery Fee:</td>
                <td style="padding: 10px;">£${order.deliveryFee.toFixed(2)}</td>
              </tr>` : ''}
              ${order.tip ? `
              <tr>
                <td style="padding: 10px; text-align: right;">Tip:</td>
                <td style="padding: 10px;">£${order.tip.toFixed(2)}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px;">Total:</td>
                <td style="padding: 10px; font-weight: bold; font-size: 18px;">£${order.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin-top: 30px; text-align: center;">
            <p>If you have any questions about your order, please contact us at: <br />
            <a href="tel:+441234567890">0121 XXX XXXX</a></p>
          </div>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
          <p>TurkNazz Restaurant</p>
          <p>Authentic Turkish Cuisine in Birmingham</p>
        </div>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: customer.email,
      subject: `TurkNazz Order Confirmation #${order.orderNumber}`,
      html: htmlContent
    });

    logger.info(`Order confirmation email sent to ${customer.email}`);
    return true;
  } catch (error) {
    logger.error(`Email sending failed: ${error.message}`);
    return false;
  }
};

exports.sendBookingConfirmation = async (booking, customer) => {
  try {
    const transporter = await createTransporter();

    // Create HTML email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FFC107; padding: 20px; text-align: center; color: #333;">
          <h1>Booking Confirmation</h1>
          <p>Booking #${booking.bookingNumber}</p>
        </div>
        
        <div style="padding: 20px;">
          <h2>Your table is reserved, ${customer.name}!</h2>
          <p>We're looking forward to welcoming you to TurkNazz.</p>
          
          <div style="background-color: #f9f9f9; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h3>Booking Details</h3>
            <p><strong>Restaurant:</strong> ${booking.restaurant.name}</p>
            <p><strong>Address:</strong> ${booking.restaurant.address}, ${booking.restaurant.city} ${booking.restaurant.postcode}</p>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Number of Guests:</strong> ${booking.guests}</p>
            ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
          </div>
          
          <div style="background-color: #f9f9f9; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h3>Need to Change Your Reservation?</h3>
            <p>If you need to modify or cancel your booking, please call us at <a href="tel:+441234567890">0121 XXX XXXX</a> at least 2 hours before your reservation time.</p>
          </div>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
          <p>TurkNazz Restaurant</p>
          <p>Authentic Turkish Cuisine in Birmingham</p>
        </div>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: customer.email,
      subject: `TurkNazz Booking Confirmation #${booking.bookingNumber}`,
      html: htmlContent
    });

    logger.info(`Booking confirmation email sent to ${customer.email}`);
    return true;
  } catch (error) {
    logger.error(`Email sending failed: ${error.message}`);
    return false;
  }
};