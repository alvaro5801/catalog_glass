// src/app/page.tsx

// 1. Removemos todas as importações de cliente (motion, ProductCard, Carousel, etc.)
import PageLayout from "./page-layout";

// 2. Mantemos as importações de LÓGICA de servidor
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ProductService } from "@/domain/services/ProductService";
import { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { CategoryService } from "@/domain/services/CategoryService";
import type { Product as PrismaProduct, Specification, PriceTier, Category } from '@prisma/client';
import type { Product as CardProductType } from "@/lib/types";

// 3. Importamos o NOVO componente de cliente que criámos
import { HomeContent } from "./home-content";

// 4. A página continua a ser 'dynamic' (para aceder à BD)
export const dynamic = 'force-dynamic';

// Tipo helper (como estava antes)
type ProductWithRelations = PrismaProduct & {
    specifications: Specification | null;
    priceTable: PriceTier[];
};

// 5. A página continua a ser um Server Component (async)
export default async function Home() {
  
  // 6. Toda a lógica de busca de dados permanece aqui no servidor
  const productRepository = new ProductRepository();
  const productService = new ProductService(productRepository);
  const categoryRepository = new CategoryRepository();
  const categoryService = new CategoryService(categoryRepository);

  const MOCK_CATALOG_ID = "clxrz8hax00003b6khe69046c";

  // Usamos Promise.all para buscar dados em paralelo (mais rápido)
  const [allProducts, allCategories] = await Promise.all([
    productService.getProducts(MOCK_CATALOG_ID),
    categoryService.getAllCategories(MOCK_CATALOG_ID)
  ]);

  const featuredProducts = allProducts.filter(product => product.isFeatured);

  // 7. A lógica de formatação de dados também fica aqui
  const formatProductForCard = (product: ProductWithRelations, categories: Category[]): CardProductType => {
    const categoryName = categories.find(c => c.id === product.categoryId)?.name || 'N/A';
    
    return {
      id: product.id, 
      slug: product.slug,
      name: product.name,
      images: product.images,
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      category: categoryName, // Usamos o nome da categoria
      // Garantimos que specifications nunca é null
      specifications: product.specifications ?? { material: '', capacidade: '', dimensoes: '' },
      priceTable: product.priceTable,
      priceInfo: product.priceInfo || '',
      isFeatured: product.isFeatured,
    };
  };

  // 8. ✅ --- A MUDANÇA PRINCIPAL ---
  // O Server Component agora só renderiza o PageLayout e passa os dados
  // (já formatados) para o HomeContent (Componente de Cliente).
  return (
    <PageLayout>
      <HomeContent 
        featuredProducts={featuredProducts.map(p => formatProductForCard(p as ProductWithRelations, allCategories))} 
        allCategories={allCategories}
      />
    </PageLayout>
  );
}