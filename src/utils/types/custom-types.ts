export interface _InitiatePayment {
  merchant_id: string;
  order_id: string;
  currency: string;
  amount: string;
  redirect_url: string;
  cancel_url: string;
  language: string;
  billing_name: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  billing_country: string;
  billing_tel: string;
  billing_email: string;
}

export interface _OrderResponse {
  success: boolean;
  paymentId: string;
  orderId: string;
  amount: string;
  errorMessage?: string | null;
}
