import { NextRequest, NextResponse } from "next/server";
import { getPlatformConfig, getToolUrls } from "@/lib/lti/config";

export async function POST(request: NextRequest) {
  return handleLogin(request);
}

export async function GET(request: NextRequest) {
  return handleLogin(request);
}

async function handleLogin(request: NextRequest) {
  const params =
    request.method === "POST"
      ? Object.fromEntries(await request.formData())
      : Object.fromEntries(request.nextUrl.searchParams);

  const iss = params.iss as string;
  const loginHint = params.login_hint as string;
  const targetLinkUri = params.target_link_uri as string;
  const ltiMessageHint = params.lti_message_hint as string | undefined;
  const clientId = params.client_id as string | undefined;

  if (!iss || !loginHint || !targetLinkUri) {
    return NextResponse.json(
      { error: "Missing required parameters: iss, login_hint, target_link_uri" },
      { status: 400 }
    );
  }

  const platform = getPlatformConfig();

  if (iss !== platform.issuer) {
    return NextResponse.json(
      { error: `Unknown issuer: ${iss}` },
      { status: 403 }
    );
  }

  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();

  const toolUrls = getToolUrls();

  const authParams = new URLSearchParams({
    scope: "openid",
    response_type: "id_token",
    client_id: clientId || platform.clientId,
    redirect_uri: toolUrls.launchUrl,
    login_hint: loginHint,
    state,
    nonce,
    response_mode: "form_post",
    prompt: "none",
  });

  if (ltiMessageHint) {
    authParams.set("lti_message_hint", ltiMessageHint);
  }

  const response = NextResponse.redirect(
    `${platform.authorizationEndpoint}?${authParams.toString()}`
  );

  response.cookies.set("lti_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 300,
    path: "/",
  });

  response.cookies.set("lti_nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 300,
    path: "/",
  });

  return response;
}
