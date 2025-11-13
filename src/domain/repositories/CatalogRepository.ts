// src/domain/repositories/CatalogRepository.ts
import { prisma } from "@/lib/prisma";

export class CatalogRepository {
  async findBySlug(slug: string) {
    return await prisma.catalog.findUnique({
      where: { slug },
      include: {
        products: {
            include: {
                priceTable: true, // Precisamos dos preços
                specifications: true, // ✅ ADICIONADO: Agora trazemos as especificações também!
            }
        },
        categories: true,
      }
    });
  }

  // Útil para o onboarding: verificar se o slug já existe
  async checkSlugExists(slug: string): Promise<boolean> {
    const count = await prisma.catalog.count({
      where: { slug },
    });
    return count > 0;
  }
}