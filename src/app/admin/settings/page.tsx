// src/app/admin/settings/page.tsx
"use client";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Configurações</h2>
            </div>

            <div className="p-6 border bg-card rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Configurações da Conta</h3>
                <p className="text-sm text-muted-foreground">
                    Formulários para alterar o nome do negócio, e-mail, senha e outras
                    configurações da conta aparecerão aqui.
                </p>
            </div>

            <div className="p-6 border bg-card rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Configurações do Catálogo</h3>
                <p className="text-sm text-muted-foreground">
                    Opções para personalizar a aparência do catálogo público, como cores,
                    fontes e informações de contacto, aparecerão aqui.
                </p>
            </div>
        </div>
    );
}