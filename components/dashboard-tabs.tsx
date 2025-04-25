"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataStorageForm } from "@/components/data-storage-form"
import { DataRetrievalForm } from "@/components/data-retrieval-form"
import { DataImportExport } from "@/components/data-import-export"

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("store")

  return (
    <Tabs defaultValue="store" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="store">Store Data</TabsTrigger>
        <TabsTrigger value="retrieve">Retrieve Data</TabsTrigger>
        <TabsTrigger value="import-export">Import/Export</TabsTrigger>
      </TabsList>

      <TabsContent value="store" className="space-y-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Store Encrypted Data</h2>
          <p className="text-muted-foreground mb-6">
            Enter a key and the data you want to encrypt. Your data will be securely encrypted with your passkey.
          </p>
          <DataStorageForm />
        </div>
      </TabsContent>

      <TabsContent value="retrieve" className="space-y-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Retrieve Your Data</h2>
          <p className="text-muted-foreground mb-6">
            Select a key and enter your passkey to decrypt and retrieve your stored data.
          </p>
          <DataRetrievalForm />
        </div>
      </TabsContent>

      <TabsContent value="import-export" className="space-y-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Import & Export Data</h2>
          <p className="text-muted-foreground mb-6">
            Securely export your encrypted data or import previously exported data.
          </p>
          <DataImportExport />
        </div>
      </TabsContent>
    </Tabs>
  )
}
