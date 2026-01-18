import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

const companySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    gstin: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']),
})

type CompanyFormValues = z.infer<typeof companySchema>

interface CompanyFormProps {
    initialValues?: Partial<CompanyFormValues>
    onSubmit: (values: CompanyFormValues) => Promise<void>
    isLoading?: boolean
}

export function CompanyForm({ initialValues, onSubmit, isLoading }: CompanyFormProps) {
    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            name: initialValues?.name || '',
            gstin: initialValues?.gstin || '',
            status: initialValues?.status || 'ACTIVE',
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                                <Input placeholder='Enter company name' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='gstin'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>GSTIN</FormLabel>
                            <FormControl>
                                <Input placeholder='Enter GST number' {...field} />
                            </FormControl>
                            <FormDescription>Optional GST identification number.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select status' />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value='ACTIVE'>Active</SelectItem>
                                    <SelectItem value='INACTIVE'>Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className='flex justify-end gap-4 pt-4'>
                    <Button type='submit' disabled={isLoading}>
                        {isLoading ? 'Processing...' : initialValues ? 'Update Company' : 'Create Company'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
