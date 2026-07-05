import { UpdatePasswordForm } from "@/app/update-password/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <main className="relative overflow-hidden py-16 md:py-24">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 right-0 top-0 m-auto h-[300px] w-[300px] rounded-full bg-[#F2A7A7]/30 blur-[100px]" />
      </div>

      <div className="pp-container">
        <div className="mx-auto max-w-md rounded-[2rem] border border-[#E8DADA] bg-white p-7 shadow-xl md:p-8">
          <p className="inline-flex rounded-full bg-[#FCEEEE] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#B85C5C]">
            Security Update
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-[#2B2B2B]">Set New Password</h1>
          <p className="mt-2 text-sm text-[#6B6B6B]">Choose a secure new password for your account.</p>
          <UpdatePasswordForm />
        </div>
      </div>
    </main>
  );
}
