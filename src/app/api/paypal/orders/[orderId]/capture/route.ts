import { NextResponse } from "next/server";
import {
  ApiError,
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
  environment:
    process.env.NODE_ENV === "production"
      ? Environment.Production
      : Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
  },
});

const ordersController = new OrdersController(client);

export async function POST(
  _request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;

  try {
    const { body: rawBody, statusCode } = await ordersController.captureOrder({
      id: orderId,
      prefer: "return=minimal",
    });

    const bodyString =
      typeof rawBody === "string"
        ? rawBody
        : ((rawBody as any)?.toString?.() ?? "");
    const jsonResponse = JSON.parse(bodyString as string);

    return NextResponse.json(jsonResponse, { status: statusCode });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode ?? 500 }
      );
    }
    console.error("Failed to capture PayPal order:", error);
    return NextResponse.json(
      { error: "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}
