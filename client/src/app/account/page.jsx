'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { selectUser, setUser } from '@/store/slices/authSlice';
import { useUpdateProfileMutation } from '@/store/api/authApi';
import AccountShell from '@/components/account/AccountShell';
import Button from '@/components/ui/Button';
import { Field } from '@/components/auth/Field';

export default function AccountPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [updateProfile] = useUpdateProfileMutation();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (user) reset({ name: user.name, phone: user.phone });
  }, [user, reset]);

  const onSubmit = async (values) => {
    try {
      const res = await updateProfile(values).unwrap();
      dispatch(setUser(res.data));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  return (
    <AccountShell title="My Profile">
      <div className="max-w-lg space-y-6">
        <div className="card-luxe flex items-center gap-4 p-6">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-primary font-display text-2xl font-bold text-accent">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-display text-xl font-bold text-primary">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs">
              {user?.isEmailVerified ? (
                <span className="flex items-center gap-1 text-green-600">
                  <FaCheckCircle size={11} /> Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600">
                  <FaExclamationCircle size={11} /> Email not verified
                </span>
              )}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card-luxe space-y-4 p-6">
          <h2 className="font-display text-lg font-bold text-primary">Edit Details</h2>
          <Field label="Full Name" error={errors.name?.message}>
            <input className="input-luxe" {...register('name', { required: 'Name is required' })} />
          </Field>
          <Field label="Phone">
            <input className="input-luxe" {...register('phone')} placeholder="+1 555 000 0000" />
          </Field>
          <Field label="Email">
            <input className="input-luxe bg-slate-50" value={user?.email || ''} disabled />
          </Field>
          <Button variant="gold" type="submit" loading={isSubmitting}>
            Save Changes
          </Button>
        </form>
      </div>
    </AccountShell>
  );
}
