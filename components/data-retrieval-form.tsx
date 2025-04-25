"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock, Copy, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { getDataKeys, retrieveData } from "@/lib/data-actions"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  dataKey: z.string().min(1, {
    message: "Please select a data key.",
  }),
  passkey: z.string().min(1, {
    message: "Passkey is required to decrypt data.",
  }),
})

export function DataRetrievalForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [dataKeys, setDataKeys] = useState<string[]>([])
  const [retrievedData, setRetrievedData] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataKey: "",
      passkey: "",
    },
  })

  useEffect(() => {
    async function fetchDataKeys() {
      try {
        const keys = await getDataKeys()
        setDataKeys(keys)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch data keys",
          description: "Please try again later",
        })
      }
    }

    fetchDataKeys()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setRetrievedData(null)

    try {
      const result = await retrieveData(values.dataKey, values.passkey)
      if (result.success && result.data) {
        setRetrievedData(result.data)
        toast({
          title: "Data retrieved successfully",
          description: `Your data with key "${values.dataKey}" has been decrypted.`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Failed to retrieve data",
          description: result.error || "Invalid passkey or data key",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again later",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (retrievedData) {
      navigator.clipboard.writeText(retrievedData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied to clipboard",
        description: "The decrypted data has been copied to your clipboard",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="dataKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Data Key</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a data key" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dataKeys.length > 0 ? (
                      dataKeys.map((key) => (
                        <SelectItem key={key} value={key}>
                          {key}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        No data stored yet
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passkey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Passkey</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="password" placeholder="Enter your passkey to decrypt data" {...field} />
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading || dataKeys.length === 0}>
            {isLoading ? "Decrypting..." : "Decrypt & Retrieve Data"}
          </Button>
        </form>
      </Form>

      {retrievedData && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Decrypted Data</h3>
              <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 px-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="p-3 bg-muted rounded-md whitespace-pre-wrap break-words">{retrievedData}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
