import { SignupForm } from "@/app/signup/SignupForm";

export default function SignupPage() {
  return (
    <main className="relative overflow-hidden py-16 md:py-24">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 right-0 top-0 m-auto h-[300px] w-[300px] rounded-full bg-[#F2A7A7]/30 blur-[100px]" />
      </div>

      <div className="pp-container">
        <div className="mx-auto max-w-3xl">
          <div className="flex justify-end">
            <p className="text-sm text-[#6B6B6B]">
              Already have an account? <a href="/login" className="font-semibold text-[#D96C6C] hover:text-[#C95A5A]">Log in</a>
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-xl text-center">
            <h1 className="text-4xl font-black tracking-tight text-[#2B2B2B] md:text-5xl">Create your account</h1>
            <p className="mt-3 text-lg text-[#6B6B6B]">Start free and finish your profile after signup.</p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl rounded-[1.75rem] border border-[#E6E9EF] bg-white p-6 shadow-[0_18px_50px_rgba(43,43,43,0.08)] md:p-9">
            <SignupForm />
          </div>
        </div>
      </div>
    </main>
  );
}
