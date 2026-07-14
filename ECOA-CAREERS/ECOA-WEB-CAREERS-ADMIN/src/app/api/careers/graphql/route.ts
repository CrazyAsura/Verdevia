import { NextRequest, NextResponse } from 'next/server';

function getCareersAdminGraphqlUrl() {
  return (
    process.env.CAREERS_ADMIN_GRAPHQL_URL ||
    process.env.BACKEND_CAREERS_ADMIN_GRAPHQL_URL ||
    'http://localhost:3339/graphql'
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const authorization = request.headers.get('authorization');

  const response = await fetch(getCareersAdminGraphqlUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authorization ? { Authorization: authorization } : {}),
    },
    body,
    cache: 'no-store',
  });

  const payload = await response.text();

  return new NextResponse(payload, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
    },
  });
}
