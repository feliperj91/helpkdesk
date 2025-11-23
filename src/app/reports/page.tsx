'use client';

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            {/* Under Development Notice */}
            <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="h-6 w-6 text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-semibold text-amber-400 mb-2">
                                Funcionalidade em Desenvolvimento
                            </h4>
                            <p className="text-slate-300 mb-4">
                                A página de relatórios está sendo desenvolvida e estará disponível em breve.
                                Em breve você poderá acessar análises detalhadas, gráficos e exportação de dados.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    Em breve
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
