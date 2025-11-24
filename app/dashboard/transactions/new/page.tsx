"use client";

import { z } from "zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

import { ArrowLeft } from "lucide-react";

// Schema de validação
const schema = z.object({
    type: z.enum(["INCOME", "EXPENSE"], {
        message: "Selecione o tipo",
    }),
    categoryId: z.string().min(1, "Selecione a categoria"),
    accountId: z.string().min(1, "Selecione a conta"),
    amount: z.string().min(1, "Informe o valor"),
    description: z.string().min(1, "Descreva a transação"),
    date: z.string().min(1, "Informe a data"),
});

type FormValues = z.infer<typeof schema>;

// MOCK TEMPORÁRIO — depois puxamos do banco
const MOCK_CATEGORIES = [
    { id: "food", name: "Alimentação", type: "EXPENSE" },
    { id: "salary", name: "Salário", type: "INCOME" },
    { id: "transport", name: "Transporte", type: "EXPENSE" },
];

const MOCK_ACCOUNTS = [
    { id: "1", name: "Banco Inter" },
    { id: "2", name: "Nubank" },
    { id: "3", name: "Carteira Física" },
];

export default function NewTransactionPage() {
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            type: "EXPENSE",
            categoryId: "",
            accountId: "",
            amount: "",
            description: "",
            date: new Date().toISOString().split("T")[0],
        },
    });

    async function onSubmit(values: FormValues) {
        const res = await fetch("/api/transactions", {
            method: "POST",
            body: JSON.stringify(values),
        });

        if (!res.ok) {
            alert("Erro ao salvar transação");
            return;
        }

        router.push("/dashboard/transactions");
    }

    return (
        <div className="space-y-6">

            {/* Header da página */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Nova Transação</h1>
                    <p className="text-muted-foreground">
                        Registre uma nova receita ou despesa
                    </p>
                </div>

                <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                    onClick={() => router.back()}
                >
                    <ArrowLeft size={18} />
                    Voltar
                </Button>
            </div>

            {/* Card com formulário */}
            <Card className="p-6">
                <Form {...form}>
                    <form
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        {/* Tipo */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INCOME">Receita</SelectItem>
                                            <SelectItem value="EXPENSE">Despesa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Categoria */}
                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoria</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a categoria" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MOCK_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Conta */}
                        <FormField
                            control={form.control}
                            name="accountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Conta</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a conta" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MOCK_ACCOUNTS.map((acc) => (
                                                <SelectItem key={acc.id} value={acc.id}>
                                                    {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Valor */}
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor</FormLabel>
                                    <FormControl>
                                        <Input placeholder="0,00" type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Data */}
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Data</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Descrição */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Pagamento de luz, Uber, Salário..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Botão salvar */}
                        <div className="md:col-span-2 flex justify-end">
                            <Button type="submit" className="px-6">
                                Salvar transação
                            </Button>
                        </div>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
