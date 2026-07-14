import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_PUBLIC_OPERATIONS = new Set(['GetJobs', 'ApplyForJob']);

function getCareersGraphqlUrl() {
  return (
    process.env.CAREERS_GRAPHQL_URL ||
    process.env.BACKEND_CAREERS_GRAPHQL_URL ||
    'http://localhost:3340/graphql'
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: [{ message: 'Corpo da requisicao invalido.' }] },
      { status: 400 },
    );
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { errors: [{ message: 'Corpo da requisicao invalido.' }] },
      { status: 400 },
    );
  }

  const operationName = (body as { operationName?: string }).operationName;

  if (!operationName || !ALLOWED_PUBLIC_OPERATIONS.has(operationName as string)) {
    return NextResponse.json(
      { errors: [{ message: 'Operacao nao permitida no portal publico de carreiras.' }] },
      { status: 403 },
    );
  }

  let response: Response;
  try {
    response = await fetch(getCareersGraphqlUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || 'unknown',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return NextResponse.json(
      { errors: [{ message: 'Servico de carreiras temporariamente indisponivel.' }] },
      { status: 503 },
    );
  }

  const payload = await response.text();

  return new NextResponse(payload, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
    },
  });
}
