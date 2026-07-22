'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaMapMarkerAlt, FaTrash, FaPlus } from 'react-icons/fa';
import {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useDeleteAddressMutation,
} from '@/store/api/commerceApi';
import AccountShell from '@/components/account/AccountShell';
import Button from '@/components/ui/Button';
import { Field } from '../../login/page';

export default function AddressesPage() {
  const { data } = useGetAddressesQuery();
  const [createAddress] = useCreateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const addresses = data?.data || [];

  const onSubmit = async (values) => {
    try {
      await createAddress(values).unwrap();
      toast.success('Address saved');
      reset();
      setShowForm(false);
    } catch {
      toast.error('Could not save address');
    }
  };

  return (
    <AccountShell title="My Addresses">
      <div className="mb-6 flex justify-end">
        <Button variant={showForm ? 'ghost' : 'gold'} onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : <><FaPlus size={12} /> Add Address</>}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="card-luxe mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <Field label="Full Name" error={errors.fullName?.message}>
            <input className="input-luxe" {...register('fullName', { required: 'Required' })} />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <input className="input-luxe" {...register('phone', { required: 'Required' })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address Line 1" error={errors.line1?.message}>
              <input className="input-luxe" {...register('line1', { required: 'Required' })} />
            </Field>
          </div>
          <Field label="City" error={errors.city?.message}>
            <input className="input-luxe" {...register('city', { required: 'Required' })} />
          </Field>
          <Field label="State" error={errors.state?.message}>
            <input className="input-luxe" {...register('state', { required: 'Required' })} />
          </Field>
          <Field label="Postal Code" error={errors.postalCode?.message}>
            <input className="input-luxe" {...register('postalCode', { required: 'Required' })} />
          </Field>
          <Field label="Country" error={errors.country?.message}>
            <input className="input-luxe" defaultValue="India" {...register('country', { required: 'Required' })} />
          </Field>
          <div className="sm:col-span-2">
            <Button variant="gold" type="submit" loading={isSubmitting} className="w-full">
              Save Address
            </Button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <FaMapMarkerAlt className="mb-3 text-4xl text-slate-300" />
          <p className="text-slate-500">No saved addresses</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr._id} className="card-luxe relative p-5">
              {addr.isDefault && (
                <span className="absolute right-4 top-4 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent-dark">
                  Default
                </span>
              )}
              <p className="font-semibold text-primary">{addr.fullName}</p>
              <p className="text-sm text-slate-500">{addr.phone}</p>
              <p className="mt-2 text-sm text-slate-500">
                {addr.line1}, {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
              </p>
              <button
                onClick={() => deleteAddress(addr._id).unwrap().then(() => toast.success('Deleted'))}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-red-500 hover:underline"
              >
                <FaTrash size={11} /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
