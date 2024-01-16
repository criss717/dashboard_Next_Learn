import { fetchCustomers, fetchInvoiceById } from "@/app/lib/data";
import EditInvoiceForm from "@/app/ui/invoices/edit-form";

export default async function EditInvoicePage({
    params, // los server components aceptan un parametro llamado params para sacar los params [id] que pusimos en la carpeta
  }: {
    params: {
      id: string,      
    }
  }) {    
    const id = params.id
    

    // Asegúrate de que id existe antes de utilizarlo
    const invoice = await fetchInvoiceById(id)
    const customers = await fetchCustomers()

    return (
        <EditInvoiceForm invoice={invoice} customers={customers} />
    )
}
