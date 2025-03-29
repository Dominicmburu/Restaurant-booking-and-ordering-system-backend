const stripe = require('../config/stripe').stripe;
const { logger } = require('../utils/logger');


exports.createCheckoutSession = async (orderData, successUrl, cancelUrl) => {
  try {
    const { items, customer, summary, orderId } = orderData;
    const { orderType, total, deliveryFee, tip, location } = summary;
    
    const lineItems = items.map(item => ({
      price_data: {
        currency: process.env.STRIPE_CURRENCY || 'gbp',
        product_data: {
          name: item.name,
          description: item.description || '',
          metadata: {
            id: item.id
          }
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity
    }));
    
    if (orderType === 'DELIVERY' && deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: process.env.STRIPE_CURRENCY || 'gbp',
          product_data: {
            name: 'Delivery Fee',
            description: 'Fee for delivery service'
          },
          unit_amount: Math.round(deliveryFee * 100), 
        },
        quantity: 1
      });
    }
    
    if (tip > 0) {
      lineItems.push({
        price_data: {
          currency: process.env.STRIPE_CURRENCY || 'gbp',
          product_data: {
            name: 'Tip',
            description: 'Gratuity for staff'
          },
          unit_amount: Math.round(tip * 100), 
        },
        quantity: 1
      });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cancelUrl}?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: customer.email,
      metadata: {
        orderId: orderId,
        restaurantId: location.id,
        restaurantName: location.name,
        orderType,
        customer_name: customer.name,
        customer_phone: customer.phone
      }
    });
    
    logger.info(`Payment session created for order: ${orderId}, email: ${customer.email}`);
    return session;
  } catch (error) {
    logger.error(`Error creating payment session: ${error.message}`);
    throw new Error('Payment session creation failed');
  }
};


exports.verifyCheckoutSession = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      paymentStatus: session.payment_status,
      isComplete: session.payment_status === 'paid',
      customer: session.customer_details,
      orderId: session.metadata.orderId
    };
  } catch (error) {
    logger.error(`Error verifying session: ${error.message}`);
    throw new Error('Session verification failed');
  }
};


exports.createPaymentIntent = async (orderData) => {
  try {
    const { total, customer, orderId } = orderData;
    
    const amount = Math.round(total * 100);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: process.env.STRIPE_CURRENCY || 'gbp',
      payment_method_types: ['card'],
      metadata: {
        orderId: orderId,
        customerEmail: customer.email,
        customerName: customer.name
      }
    });
    
    logger.info(`Payment intent created for order: ${orderId}`);
    return paymentIntent;
  } catch (error) {
    logger.error(`Error creating payment intent: ${error.message}`);
    throw new Error('Payment intent creation failed');
  }
};

exports.checkPaymentIntentStatus = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      status: paymentIntent.status,
      isSuccess: paymentIntent.status === 'succeeded',
      amount: paymentIntent.amount / 100,
      customer: paymentIntent.metadata
    };
  } catch (error) {
    logger.error(`Error checking payment intent: ${error.message}`);
    throw new Error('Payment check failed');
  }
};