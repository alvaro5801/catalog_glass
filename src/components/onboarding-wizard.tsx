// src/components/onboarding-wizard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowRight, CheckCircle, X, Loader2, AlertCircle } from "lucide-react"; // 1. Importar Loader2 e AlertCircle
import Image from "next/image";

type OnboardingData = {
  businessName: string;
  logoFile: File | null; // Nota: O upload de ficheiros ainda não está implementado na API
  categories: string[];
  product: { name: string; imageFile: File | null; price: string; };
};

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    businessName: "Minha Loja",
    logoFile: null,
    categories: ["Copos", "Canecas"],
    product: { name: "Copo Long Drink", imageFile: null, price: "9.99" },
  });

  // 2. Novos estados para feedback da API
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [categoryInput, setCategoryInput] = useState("");

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData({ ...data, logoFile: file });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddCategory = () => {
    if (categoryInput && !data.categories.includes(categoryInput)) {
      setData({ ...data, categories: [...data.categories, categoryInput] });
      setCategoryInput("");
    }
  };

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData(prev => ({ ...prev, product: { ...prev.product, imageFile: file } }));
      setProductImagePreview(URL.createObjectURL(file));
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  // 3. Função handleSubmit ATUALIZADA
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    console.log("A enviar dados do onboarding para a API:", data);

    try {
      // 4. Chamar a nossa nova API
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: data.businessName,
          categories: data.categories,
          product: data.product,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao guardar os dados.");
      }

      // Se correu bem, avança para o ecrã de sucesso
      nextStep();

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Função de finalização ATUALIZADA
  const handleFinishOnboarding = () => {
    // A API já marcou o onboarding como completo.
    // ✅ REMOVIDA a linha: localStorage.setItem('onboardingComplete', 'true');
    // Redireciona para o Dashboard, pois é o destino lógico após o onboarding.
    router.push('/admin/dashboard');
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted">
      <div className="w-full max-w-xl rounded-lg bg-background p-8 shadow-lg">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold">Bem-vindo! Vamos começar.</h2>
            <p className="text-muted-foreground mb-6">Qual é a identidade do seu negócio?</p>
            <div className="space-y-4">
              <div><Label htmlFor="businessName">Nome do Negócio</Label><Input id="businessName" value={data.businessName} onChange={e => setData({ ...data, businessName: e.target.value })} /></div>
              <div><Label>Logótipo (Upload será implementado em RF08)</Label><Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} className="mb-2" disabled />{logoPreview && <Image src={logoPreview} alt="Pré-visualização do logótipo" width={100} height={100} className="rounded-md" />}</div>
            </div>
            <Button onClick={nextStep} className="mt-6 w-full">Continuar <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        )}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold">Crie as suas Categorias</h2>
            <p className="text-muted-foreground mb-6">Organize os seus produtos. Pode adicionar mais depois.</p>
            <div className="flex gap-2"><Input placeholder="Ex: Bebidas" value={categoryInput} onChange={e => setCategoryInput(e.target.value)} /><Button onClick={handleAddCategory}>Adicionar</Button></div>
            <div className="mt-4 space-y-2">{data.categories.map(cat => (<div key={cat} className="flex items-center justify-between rounded-md bg-muted p-2 text-sm"><span>{cat}</span><Button variant="ghost" size="sm" onClick={() => setData({ ...data, categories: data.categories.filter(c => c !== cat) })}><X className="h-4 w-4" /></Button></div>))}</div>
            <div className="flex w-full gap-2 mt-6"><Button variant="outline" onClick={prevStep} className="w-1/2">Voltar</Button><Button onClick={nextStep} className="w-1/2">Continuar <ArrowRight className="ml-2 h-4 w-4" /></Button></div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold">Adicione o seu Primeiro Produto</h2>
            <p className="text-muted-foreground mb-6">Vamos adicionar um item para começar.</p>
            <div className="space-y-4">
              <div><Label htmlFor="productName">Nome do Produto</Label><Input id="productName" value={data.product.name} onChange={e => setData(prev => ({ ...prev, product: { ...prev.product, name: e.target.value } }))} /></div>
              <div><Label htmlFor="productPrice">Preço Inicial (Ex: 9.99)</Label><Input id="productPrice" type="number" value={data.product.price} onChange={e => setData(prev => ({ ...prev, product: { ...prev.product, price: e.target.value } }))} /></div>
              <div><Label>Imagem do Produto (Upload será implementado em RF08)</Label><Input id="productImage" type="file" accept="image/*" onChange={handleProductImageChange} className="mb-2" disabled />{productImagePreview && <Image src={productImagePreview} alt="Preview do produto" width={100} height={100} className="rounded-md" />}</div>
            </div>

            {/* 6. Exibir mensagem de erro da API */}
            {error && (
              <div role="alert" className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive mt-4">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex w-full gap-2 mt-6">
              <Button variant="outline" onClick={prevStep} className="w-1/2" disabled={isLoading}>Voltar</Button>
              {/* 7. Botão de Finalizar com estado de loading */}
              <Button onClick={handleSubmit} className="w-1/2" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Finalizar'}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold">Tudo pronto!</h2>
            <p className="text-muted-foreground mt-2">O seu catálogo foi criado com sucesso.</p>
            <p className="text-muted-foreground mt-2">Pode agora aceder ao seu painel de controlo.</p>
            <Button className="w-full mt-8" onClick={handleFinishOnboarding}>Aceder ao Painel</Button>
          </div>
        )}
      </div>
    </div>
  );
}