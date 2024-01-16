'use server'
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { z } from 'zod';

const FormSchema = z.object({ //esquema de validación general
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true }); // esta constante validará todo menos el id y date
const EditInvoice = FormSchema.omit({ id: true, date: true  })

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({ //extraigo los tres elementos y los valido
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    const amountInCents = amount * 100;  //pasamos a centavos por buenas practicas
    const date = new Date().toISOString().split('T')[0]; // porque debemos llegar al formato 'AAAA-MM-DD'

    //ahora que ya estan validados los datos los podemos enviar a la base de datos para rellenar la tabla invoices
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

    //ahora hacemos un revalidate y asi nos aseguramos que se envie una nueva petición al servidor, de lo contrario el cache será el que se muestre
    revalidatePath('/dashboard/invoices');

    //por ultimo hacemos un redirect y dirigimos al cliente a ver la tabla actualizada invoices
    redirect('/dashboard/invoices')
}

export async function editeInvoices(id:string,formData: FormData) {
    const { customerId, amount, status } = EditInvoice.parse({ //extraigo los tres elementos y los valido       
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    const amountInCents = amount * 100;  //pasamos a centavos por buenas practicas   

    // Utilizamos la sentencia UPDATE para actualizar el registro existente en la tabla
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId},
            amount = ${amountInCents},
            status = ${status}            
        WHERE id = ${id}
    `;

    //ahora hacemos un revalidate y asi nos aseguramos que se envie una nueva petición al servidor, de lo contrario el cache será el que se muestre
    revalidatePath('/dashboard/invoices');

    //por ultimo hacemos un redirect y dirigimos al cliente a ver la tabla actualizada invoices
    redirect('/dashboard/invoices')
}