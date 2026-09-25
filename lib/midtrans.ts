/**
 * Server-Side Midtrans Payment Gateway Integration Service
 * Supporting Snap Token creation, Virtual Account, QRIS, Credit Card, and B2B Invoice payments.
 */

export interface MidtransCustomerDetails {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
}

export interface MidtransItemDetail {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface CreateSnapTransactionParams {
  orderId: string;
  grossAmount: number;
  customerDetails: MidtransCustomerDetails;
  items: MidtransItemDetail[];
  isB2B?: boolean;
}

export async function createMidtransSnapTransaction(params: CreateSnapTransactionParams) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  const authHeader = Buffer.from(`${serverKey}:`).toString('base64');
  
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true' || serverKey.startsWith('Mid-server-');
  const snapApiUrl = process.env.MIDTRANS_SNAP_API_URL || 
    (isProduction 
      ? 'https://app.midtrans.com/snap/v1/transactions' 
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions');

  const payload = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: Math.round(params.grossAmount),
    },
    credit_card: {
      secure: true,
    },
    customer_details: {
      first_name: params.customerDetails.first_name,
      email: params.customerDetails.email || 'teguhpras30@gmail.com',
      phone: params.customerDetails.phone || '08961656039',
      billing_address: {
        first_name: params.customerDetails.first_name,
        phone: params.customerDetails.phone || '08961656039',
        address: params.customerDetails.address || 'Wisma tengger 17 No 21, Kandangan, Benowo, Surabaya',
        country_code: 'IDN'
      },
      shipping_address: {
        first_name: params.customerDetails.first_name,
        phone: params.customerDetails.phone || '08961656039',
        address: params.customerDetails.address || 'Wisma tengger 17 No 21, Kandangan, Benowo, Surabaya',
        country_code: 'IDN'
      }
    },
    item_details: params.items.map(item => ({
      id: String(item.id).substring(0, 50),
      price: Math.round(item.price),
      quantity: item.quantity,
      name: item.name.substring(0, 50),
    })),
  };

  console.log('Posting to Midtrans API with ServerKey:', serverKey.substring(0, 12) + '...');

  const response = await fetch(snapApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${authHeader}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.error_messages ? data.error_messages.join(', ') : (data.message || 'Midtrans API Error');
    console.error('Midtrans API Error Response:', data);
    throw new Error(`Midtrans API Error: ${errorMsg}`);
  }

  return {
    token: data.token,
    redirect_url: data.redirect_url,
    isSandboxDummy: false
  };
}
