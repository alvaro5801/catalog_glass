// src/components/onboarding-wizard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowRight, CheckCircle, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link"; // 1. A importação do 'Link' é necessária.

type OnboardingData = {
  businessName: string;
  logoFile: File | null;
  categories: string[];
  product: { name: string; imageFile: File | null; price: string; };
};

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    businessName: "",
    logoFile: null,
    categories: [],
    product: { name: "", imageFile: null, price: "" },
  });
  
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
        setData(prev => ({ ...prev, product: {...prev.product, imageFile: file}}));
        setProductImagePreview(URL.createObjectURL(file));
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = () => {
    console.log("Dados Finais a serem enviados para a base de dados:", data);
    nextStep();
  };

  const handleFinishOnboarding = () => {
    localStorage.setItem('onboardingComplete', 'true');
    router.push('/');
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted">
      <div className="w-full max-w-xl rounded-lg bg-background p-8 shadow-lg">
        
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold">Bem-vindo! Vamos começar.</h2>
            <p className="text-muted-foreground mb-6">Qual é a identidade do seu negócio?</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Nome do Negócio</Label>
                <Input id="businessName" value={data.businessName} onChange={e => setData({...data, businessName: e.target.value})} />
              </div>
              <div>
                <Label>Logótipo</Label>
                <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} className="mb-2" />
                {logoPreview && <Image src={logoPreview} alt="Pré-visualização do logótipo" width={100} height={100} className="rounded-md" />}
              </div>
            </div>
            <Button onClick={nextStep} className="mt-6 w-full">Continuar <ArrowRight className="ml-2 h-4 w-4"/></Button>
          </div>
        )}

        {step === 2 && (
             <div>
                <h2 className="text-2xl font-bold">Crie as suas Categorias</h2>
                <p className="text-muted-foreground mb-6">Organize os seus produtos. Pode adicionar mais depois.</p>
                <div className="flex gap-2">
                <Input placeholder="Ex: Bebidas" value={categoryInput} onChange={e => setCategoryInput(e.target.value)} />
                <Button onClick={handleAddCategory}>Adicionar</Button>
                </div>
                <div className="mt-4 space-y-2">
                {data.categories.map(cat => (
                    <div key={cat} className="flex items-center justify-between rounded-md bg-muted p-2 text-sm">
                    <span>{cat}</span>
                    <Button variant="ghost" size="sm" onClick={() => setData({...data, categories: data.categories.filter(c => c !== cat)})}><X className="h-4 w-4"/></Button>
                    </div>
                ))}
                </div>
                <div className="flex w-full gap-2 mt-6">
                    <Button variant="outline" onClick={prevStep} className="w-1/2">Voltar</Button>
                    <Button onClick={nextStep} className="w-1/2">Continuar <ArrowRight className="ml-2 h-4 w-4"/></Button>
                </div>
            </div>
        )}
        
        {step === 3 && (
            <div>
                <h2 className="text-2xl font-bold">Adicione o seu Primeiro Produto</h2>
                <p className="text-muted-foreground mb-6">Vamos adicionar um item para começar.</p>
                 <div className="space-y-4">
                    <div>
                        <Label htmlFor="productName">Nome do Produto</Label>
                        <Input id="productName" value={data.product.name} onChange={e => setData(prev => ({...prev, product: {...prev.product, name: e.target.value}}))} />
                    </div>
                     <div>
                        <Label htmlFor="productPrice">Preço Inicial (Ex: 9.99)</Label>
                        <Input id="productPrice" type="number" value={data.product.price} onChange={e => setData(prev => ({...prev, product: {...prev.product, price: e.target.value}}))} />
                    </div>
                    <div>
                        <Label>Imagem do Produto</Label>
                        <Input id="productImage" type="file" accept="image/*" onChange={handleProductImageChange} className="mb-2" />
                        {productImagePreview && <Image src={productImagePreview} alt="Preview do produto" width={100} height={100} className="rounded-md" />}
                    </div>
                </div>
                <div className="flex w-full gap-2 mt-6">
                    <Button variant="outline" onClick={prevStep} className="w-1/2">Voltar</Button>
                    <Button onClick={handleSubmit} className="w-1/2">Finalizar <ArrowRight className="ml-2 h-4 w-4"/></Button>
                </div>
            </div>
        )}

        {step === 4 && (
            <div className="text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold">Tudo pronto!</h2>
                <p className="text-muted-foreground mt-2">O seu catálogo foi criado com sucesso.</p>
                <div className="my-6">
                    <p className="text-sm">O seu link público é:</p>
                    {/* 2. ✅ CORREÇÃO: A tag <a> foi substituída pelo componente <Link> */}
                    <Link href="#" className="font-mono text-primary hover:underline">
                        seusite.com/{data.businessName.toLowerCase().replace(/\s+/g, '-')}
                    </Link>
                </div>
                <Button 
                  className="w-full"
                  onClick={handleFinishOnboarding}
                >
                    Concluir e Ver meu Catálogo
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}