import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  resendOtpRequest,
  sendLogin,
  sendSignup,
  verifyOtp,
} from "@/services/auth";
import type { User } from "@/types/types";
import { DialogTitle } from "@radix-ui/react-dialog";
import { AlertModal } from "./AlertModal";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
}

export const AuthModal = ({
  open,
  onClose,
  onLoginSuccess,
}: AuthModalProps) => {
  const [step, setStep] = useState<"login" | "signup" | "otp">("login");
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    code: "",
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    title: "Error",
    desc: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await sendLogin({
        email: form.email,
        password: form.password,
      });
      if (!res.success) {
        setAlert({
          open: true,
          title: "Error",
          desc: "Access token not found. Please try logging in again",
        });
        return;
      }
      onLoginSuccess(res.data.user, res.data.accessToken);
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.data?.requiresOtp) {
        setStep("login");
        setAlert({
          open: true,
          title: "Error",
          desc: "OTP not verified",
        });
        return;
      }
      setAlert({
        open: true,
        title: "Error",
        desc: err?.message || "Invalid username or password",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      const res = await resendOtpRequest({
        email: form.email,
      });

      if (!res?.success) {
        setAlert({
          open: true,
          title: "Error",
          desc: "Error: " + res?.message,
        });
        return;
      }

      setAlert({
        open: true,
        title: "Success",
        desc: res?.message,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log(err);
      setAlert({
        open: true,
        title: "Error",
        desc: "Unexpected error occured: " + err?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    try {
      setLoading(true);
      const res = await sendSignup({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
      });

      if (res?.message === "User created. Please verify with OTP.") {
        setStep("otp");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.log(e);
      setAlert({
        open: true,
        title: "Error",
        desc: "Unexpected error occured " + e?.message || "",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const res = await verifyOtp({ email: form.email, code: form.code });
      console.log(res);

      if (res?.message !== "User successfully verified. Please login") {
        setAlert({
          open: true,
          title: "Error",
          desc: "Unexpected issue: " + res?.message,
        });
        return;
      }
      setStep("login");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.log(e);
      setAlert({
        open: true,
        title: "Error",
        desc: e?.message || "OTP verification failure",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          showCloseButton={false}
        >
          <DialogTitle>
            {step === "login" && "Welcome Back 👋"}
            {step === "signup" && "Create Your Account"}
            {step === "otp" && "Verify Your Email"}
          </DialogTitle>

          <DialogDescription className="space-y-4">
            {step === "login" && (
              <>
                <Input
                  placeholder="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
                <Input
                  placeholder="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                />
              </>
            )}

            {step === "signup" && (
              <>
                <Input
                  placeholder="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                />
                <Input
                  placeholder="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                />
                <Input
                  placeholder="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
              </>
            )}

            {step === "otp" && (
              <Input
                placeholder="Enter OTP Code"
                name="code"
                value={form.code}
                onChange={handleChange}
              />
            )}
          </DialogDescription>

          <DialogFooter className="flex flex-col gap-2">
            {step === "login" && (
              <>
                <Button onClick={handleLogin} disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <p className="text-sm text-center">
                  Don’t have an account?{" "}
                  <Button onClick={() => setStep("signup")}>Sign up</Button>
                </p>
              </>
            )}

            {step === "signup" && (
              <>
                <Button onClick={handleSignup} disabled={loading}>
                  {loading ? "Signing up..." : "Sign Up"}
                </Button>
                <p className="text-sm text-center">
                  Already have an account?{" "}
                  <Button onClick={() => setStep("login")}>Log in</Button>
                </p>
              </>
            )}

            {step === "otp" && (
              <>
                <Button onClick={handleVerifyOtp} disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
                <p className="text-sm text-center">
                  Didn’t get the code?{" "}
                  <Button onClick={handleResend} disabled={loading}>
                    Resend
                  </Button>
                </p>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertModal
        open={alert.open}
        onOpenChange={(open) => setAlert((prev) => ({ ...prev, open }))}
        title={alert.title}
        description={alert.desc}
      />
    </>
  );
};
