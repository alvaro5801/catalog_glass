// src/app/api/upload/route.ts
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, /* clientPayload */) => {
        // 1. Segurança: Verificar se o utilizador está autenticado
        const user = await getAuthenticatedUser();
        if (!user) {
          throw new Error('Não autorizado');
        }

        // 2. Configuração: Definir restrições (opcional)
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          tokenPayload: JSON.stringify({
            userId: user.id, // Podemos guardar quem fez o upload
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Aqui podes executar lógica após o upload (ex: logs)
        console.log('Upload concluído:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // Bad Request
    );
  }
}