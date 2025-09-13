import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

  interface Customer {
    id: string;
    name: string;
    value: number;
  }
  
  interface RecentCustomersProps {
    customers: Customer[];
    currencyCode: string;
  }
  
  export function RecentCustomers({ customers, currencyCode }: RecentCustomersProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currencyCode,
        }).format(amount);
      }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
                {customers.map((customer) => (
                <div key={customer.id} className="flex items-center gap-4">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={`/avatars/${customer.id}.png`} alt="Avatar" />
                        <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">{customer.name}</p>
                    </div>
                    <div className="ml-auto font-medium">{formatCurrency(customer.value)}</div>
                </div>
                ))}
            </CardContent>
        </Card>
    )
  }
  