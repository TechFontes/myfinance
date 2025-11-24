"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

export function NewTransactionButton() {
    const router = useRouter()

    return (
        <Button
            className="flex items-center gap-2"
            onClick={() => router.push("/dashboard/transactions/new")}
        >
            <PlusIcon size={16} />
            Nova transação
        </Button>
    )
}