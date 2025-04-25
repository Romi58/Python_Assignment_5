"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { storeData } from "@/lib/data-actions"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  dataKey: z.string().min(1, {
    message: "Data key is required.",
  }),
  dataValue: z.string().min(1, {
    message: "Data value is required.",
  }),
  passkey: z.string().min(1, {
    message: "Passkey is required to encrypt data.",
  }),
})

export function DataStorageForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataKey: "",
      dataValue: "",
      passkey: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const result = await storeData(values.dataKey, values.dataValue, values.passkey)
      if (result.success) {
        toast({
          title: "Data stored successfully",
          description: `Your data with key "${values.dataKey}" has been securely stored.`,
        })
        // Reset form except for passkey
        form.reset({
          dataKey: "",
          dataValue: "",
          passkey: values.passkey,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Failed to store data",
          description: result.error,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="dataKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Key</FormLabel>
              <FormControl>
                <Input placeholder="e.g., credit-card, secret-note" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Value</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter the data you want to encrypt" className="min-h-[120px]" {...field} />
              </FormControl>
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
                  <Input type="password" placeholder="Enter your passkey to encrypt data" {...field} />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Encrypting and storing..." : "Encrypt & Store Data"}
        </Button>
      </form>
    </Form>
  )
}
