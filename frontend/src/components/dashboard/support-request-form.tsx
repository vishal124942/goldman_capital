import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle } from "lucide-react";

const supportRequestSchema = z.object({
  type: z.string().min(1, "Please select a request type"),
  subject: z.string().min(5, "Subject is required"),
  description: z.string().min(20, "Please provide more details"),
});

type SupportRequestFormData = z.infer<typeof supportRequestSchema>;

const requestTypes = [
  { value: "additional_investment", label: "Additional Investment" },
  { value: "statement_request", label: "Request Statement" },
  { value: "general_inquiry", label: "General Inquiry" },
  { value: "technical_support", label: "Technical Support" },
  { value: "account_update", label: "Account Update" },
];

interface SupportRequestFormProps {
  defaultType?: string;
}

export function SupportRequestForm({ defaultType }: SupportRequestFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SupportRequestFormData>({
    resolver: zodResolver(supportRequestSchema),
    defaultValues: {
      type: defaultType || "",
      subject: defaultType === "additional_investment" ? "Request for Additional Investment" : "",
      description: "",
    },
  });

  useEffect(() => {
    form.reset({
      type: defaultType || "",
      subject: defaultType === "additional_investment" ? "Request for Additional Investment" : "",
      description: "",
    });
  }, [defaultType, form]);

  const mutation = useMutation({
    mutationFn: async (data: SupportRequestFormData) => {
      return apiRequest("POST", "/api/support-requests", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/investor/support-requests"] });
      toast({
        title: "Request Submitted",
        description: "Our team will respond within 24 hours.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SupportRequestFormData) => {
    mutation.mutate(data);
  };

  const handleNewRequest = () => {
    setSubmitted(false);
    form.reset({
      type: "",
      subject: "",
      description: "",
    });
  };

  if (submitted) {
    return (
      <Card className="bg-card">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Request Submitted</h3>
          <p className="text-muted-foreground mb-6">
            Your support request has been received. Our team will respond within 24 hours.
          </p>
          <Button onClick={handleNewRequest} variant="outline" data-testid="button-new-request">
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Submit a Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="type">Request Type *</Label>
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger data-testid="select-request-type">
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.type && (
              <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Brief description of your request"
              {...form.register("subject")}
              data-testid="input-subject"
            />
            {form.formState.errors.subject && (
              <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about your request..."
              rows={5}
              {...form.register("description")}
              data-testid="input-description"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
            data-testid="button-submit-request"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
