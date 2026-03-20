import { NextResponse } from "next/server";
import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OrdersController,
} from "@paypal/paypal-server-sdk";

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_API_KEY ?? "",
    oAuthClientSecret: process.env.PAYPAL_KEY ?? "",
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
  },
});

const ordersController = new OrdersController(client);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cart } = body as {
      cart: Array<{
        price: number;
      }>;
    };

    const total = cart.reduce((sum, item) => sum + (item.price ?? 0), 0);
    const amount = total > 0 ? total.toFixed(2) : "0.01";

    const collect = {
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: "USD",
              value: amount,
            },
          },
        ],
      },
      prefer: "return=minimal" as const,
    };

    const { body: rawBody, statusCode } =
      await ordersController.createOrder(collect);

    const bodyString =
      typeof rawBody === "string"
        ? rawBody
        : ((rawBody as { toString?: () => string })?.toString?.() ?? "");
    const jsonResponse = JSON.parse(bodyString);
    return NextResponse.json(jsonResponse, { status: statusCode });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode ?? 500 }
      );
    }
    console.error("Failed to create PayPal order:", error);
    return NextResponse.json(
      { error: "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}
