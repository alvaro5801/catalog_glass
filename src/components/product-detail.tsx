// src/components/product-detail.tsx
"use client";

import { useState } from "react";
import type { Product } from "@/lib/types"; 
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button"; 
import { ArrowLeft } from "lucide-react";

interface ProductDetailProps {
  product: Product;
}

type PriceTier = {
    quantity: string;
    price: number;
};

export function ProductDetail({ product }: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(product.images[0]);
  
  const whatsappMessage = encodeURIComponent(
    `Olá! Vi o produto "${product.name}" no site e gostaria de mais informações.`
  );
  const whatsappLink = `https://wa.me/SEUNUMERODEWHATSAPP?text=${whatsappMessage}`;

  return (
    <main className="container mx-auto py-12 px-4">
      <Button asChild variant="outline" className="mb-8 w-fit">
        <Link href="/catalogo">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o Catálogo
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="flex flex-col gap-4">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              className="object-cover transition-opacity duration-300"
            />
          </div>
          <div className="grid grid-cols-5 gap-4">
            {product.images.map((image: string, index: number) => (
              <button
                key={image}
                onClick={() => setActiveImage(image)}
                className={`aspect-square bg-muted rounded-md overflow-hidden relative border-2 ${
                  activeImage === image ? "border-primary" : "border-transparent"
                }`}
              >
                <Image
                  src={image}
                  // ✅ O 'alt' text único e numerado está correto aqui
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-lg text-muted-foreground mt-4">{product.description}</p>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Tabela de Preços</h2>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 font-medium">Quantidade</th>
                    <th className="p-3 font-medium text-right">Preço Unitário</th>
                  </tr>
                </thead>
                <tbody>
                  {product.priceTable.map((tier: PriceTier) => (
                    <tr key={tier.quantity} className="border-t">
                      <td className="p-3">{tier.quantity}</td>
                      <td className="p-3 text-right">
                        R$ {tier.price.toFixed(2).replace(".", ",")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{product.priceInfo}</p>
          </div>
          <div className="mt-8">
             <h2 className="text-2xl font-semibold mb-3">Especificações</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Material:</strong> {product.specifications.material}</li>
                <li><strong>Capacidade:</strong> {product.specifications.capacidade}</li>
                <li><strong>Dimensões:</strong> {product.specifications.dimensoes}</li>
              </ul>
          </div>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center justify-center w-full h-12 px-6 font-semibold text-lg text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors"
          >
            Chamar no WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}