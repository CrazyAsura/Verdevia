import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_PUBLIC_OPERATIONS = new Set(['GetJobs', 'ApplyForJob']);

function getCareersAdminGraphqlUrl() {
  return (
    process.env.CAREERS_ADMIN_GRAPHQL_URL ||
    process.env.BACKEND_CAREERS_ADMIN_GRAPHQL_URL ||
    'http://localhost:3339/graphql'
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const operationName = body?.operationName;

  if (!ALLOWED_PUBLIC_OPERATIONS.has(operationName)) {
    return NextResponse.json(
      { errors: [{ message: 'Operacao nao permitida no portal publico de carreiras.' }] },
      { status: 403 },
    );
  }

  const response = await fetch(getCareersAdminGraphqlUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
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
