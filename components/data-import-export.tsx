"use client"

import type React from "react"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Download, Upload, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { exportData, importData } from "@/lib/data-actions"
import { toast } from "@/components/ui/use-toast"

const exportFormSchema = z.object({
  passkey: z.string().min(1, {
    message: "Passkey is required to export data.",
  }),
})

const importFormSchema = z.object({
  importFile: z.instanceof(FileList).refine((files) => files.length === 1, {
    message: "Please select a file to import.",
  }),
  passkey: z.string().min(1, {
    message: "Passkey is required to import data.",
  }),
})

export function DataImportExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const exportForm = useForm<z.infer<typeof exportFormSchema>>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      passkey: "",
    },
  })

  const importForm = useForm<z.infer<typeof importFormSchema>>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      passkey: "",
    },
  })

  async function onExport(values: z.infer<typeof exportFormSchema>) {
    setIsExporting(true)
    try {
      const result = await exportData(values.passkey)
      if (result.success && result.data) {
        // Create a blob and download it
        const blob = new Blob([result.data], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `secure-data-export-${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "Data exported successfully",
          description: "Your encrypted data has been exported to a file",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Failed to export data",
          description: result.error || "Invalid passkey or no data to export",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again later",
      })
    } finally {
      setIsExporting(false)
    }
  }

  async function onImport(values: z.infer<typeof importFormSchema>) {
    setIsImporting(true)
    try {
      const file = values.importFile[0]
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const fileContent = e.target?.result as string
          const result = await importData(fileContent, values.passkey)

          if (result.success) {
            toast({
              title: "Data imported successfully",
              description: `${result.count || 0} items have been imported to your secure storage`,
            })
            importForm.reset()
            setSelectedFileName(null)
          } else {
            toast({
              variant: "destructive",
              title: "Failed to import data",
              description: result.error || "Invalid file format or passkey",
            })
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Import failed",
            description: "The file format is invalid or corrupted",
          })
        } finally {
          setIsImporting(false)
        }
      }

      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "File read error",
          description: "Failed to read the import file",
        })
        setIsImporting(false)
      }

      reader.readAsText(file)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again later",
      })
      setIsImporting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFileName(files[0].name)
    } else {
      setSelectedFileName(null)
    }
  }

  return (
    <Tabs defaultValue="export" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="export">Export Data</TabsTrigger>
        <TabsTrigger value="import">Import Data</TabsTrigger>
      </TabsList>

      <TabsContent value="export">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Export Your Encrypted Data</h3>
              <p className="text-sm text-muted-foreground">
                Export all your encrypted data to a file. You'll need your passkey to verify your identity.
              </p>
            </div>

            <Form {...exportForm}>
              <form onSubmit={exportForm.handleSubmit(onExport)} className="space-y-4">
                <FormField
                  control={exportForm.control}
                  name="passkey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Passkey</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="password" placeholder="Enter your passkey to export data" {...field} />
                          <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isExporting}>
                  {isExporting ? (
                    "Exporting..."
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Encrypted Data
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="import">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Import Encrypted Data</h3>
              <p className="text-sm text-muted-foreground">
                Import previously exported data. You'll need the same passkey that was used for export.
              </p>
            </div>

            <Form {...importForm}>
              <form onSubmit={importForm.handleSubmit(onImport)} className="space-y-4">
                <FormField
                  control={importForm.control}
                  name="importFile"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Import File</FormLabel>
                      <FormControl>
                        <div className="grid w-full gap-2">
                          <Input
                            type="file"
                            accept=".json"
                            className="hidden"
                            id="import-file"
                            onChange={(e) => {
                              onChange(e.target.files)
                              handleFileChange(e)
                            }}
                            {...rest}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("import-file")?.click()}
                            className="w-full"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Select File
                          </Button>
                          {selectedFileName && (
                            <p className="text-sm text-muted-foreground">Selected: {selectedFileName}</p>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={importForm.control}
                  name="passkey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Passkey</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="password" placeholder="Enter your passkey to import data" {...field} />
                          <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isImporting || !selectedFileName}>
                  {isImporting ? (
                    "Importing..."
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Encrypted Data
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
