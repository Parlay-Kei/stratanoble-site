import { useState } from 'react';

interface UseFormSubmitOptions<T> {
  initialData: T;
  formType: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useFormSubmit<T>({ initialData, formType, onSuccess, onError }: UseFormSubmitOptions<T>) {
  const [formData, setFormData] = useState<T>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType, ...formData }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Something went wrong');
      
      onSuccess?.(result);
      setFormData(initialData); // Reset form
    } catch (err: any) {
      setError(err.message);
      onError?.(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { formData, isSubmitting, error, handleChange, handleSubmit };
}