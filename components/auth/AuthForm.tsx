"use client";

import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { AiFillLinkedin } from "react-icons/ai"
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";

import Input from "./Input";
import AuthSocialButton from "./AuthSocialButton";
import { Button } from "../ui/button";
import { toast } from "react-hot-toast";

type Variant =
  | "LOGIN"
  | "REGISTER"
  | "FORGOTPASSWORD"
  | "VERIFYOTP"
  | "NEWPASSWORD";

const SubmitButtonValue = {
  LOGIN: "Login",
  REGISTER: "Register",
  FORGOTPASSWORD: "Send OTP",
  VERIFYOTP: "Verify OTP",
  NEWPASSWORD: "Update Passowrd",
};

interface SendOtp {
  msg: string | null | undefined;
  data: string | null | undefined;
  status: number;
}

const AuthForm = () => {
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>("LOGIN");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const toggleVariant = useCallback(() => {
    if (variant === "LOGIN") {
      setVariant("REGISTER");
    } else {
      setVariant("LOGIN");
    }
  }, [variant]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      otp: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    const { email, password } = data;

    if (variant === "FORGOTPASSWORD") {
      if (email.trim() === "") {
        toast.error("Fill in your email");
        setIsLoading(false);
        return;
      }
      try {
        const res = await axios.post("/api/forgotPassword/sendOtp", { email });
        const data = res.data as SendOtp;
        if (data.status === 500 && data.msg) {
          toast.error(data.msg);
          setIsLoading(false);
          return;
        } else if (data.status === 200 && data.msg) {
          setEmail(email);
          toast.success("OTP SENT");
          setVariant("VERIFYOTP");
        }
      } catch (error) {
        const e = error as unknown as any;
        console.log(e);
      }

      setIsLoading(false);
      return;
    }

    if (variant === "VERIFYOTP") {
      setIsLoading(true);
      const { email, otp } = data;
      if (email.trim() === "") {
        window.location.reload();
        setIsLoading(false);
        return;
      }
      if (otp.trim() === "") {
        toast.error("Fill in the otp");
      }
      const regex = /^\d{4}$/;
      if (!regex.test(otp)) {
        toast.error("The otp is of the wrong format");
        setIsLoading(false);
        return;
      }
      const res = await axios.post("/api/forgotPassword/verifyOtp", {
        email,
        otp,
      });
      const resData = res.data;
      if (resData?.status === 400) {
        toast.error(resData?.msg);
      }
      if (resData?.status === 200) {
        toast.success(resData?.msg);
        setVariant("NEWPASSWORD");
      }
      setIsLoading(false);
      return;
    }

    if (variant === "NEWPASSWORD") {
      const { email, password, confirmPassword } = data;
      if (email.trim() === "") {
        window.location.reload();
        setIsLoading(false);
        return;
      }
      if (
        password.trim() === "" ||
        confirmPassword.trim() === "" ||
        password !== confirmPassword
      ) {
        toast.error("Passwords aren't matching");
        setIsLoading(false);
        return;
      }

      const res = await axios.post("/api/forgotPassword/updatePassword", {
        email,
        password,
        confirmPassword,
      });
      const resData = res.data;
      if (resData?.status !== 200) {
        toast.error(resData?.msg);
        setIsLoading(false);
        return;
      }
      if (resData?.status === 200) {
        toast.success(resData?.msg);
        setIsLoading(false);
        window.location.reload();
        // return;
      }
    }
    if (email.trim() === "" || password.trim() === "") {
      toast.error("Fill all fields");
      setIsLoading(false);
      return;
    }

    if (variant === "REGISTER") {
      const { confirmPassword, name } = data;
      if (confirmPassword.trim() === "" || name.trim() === "") {
        toast.error("Fill all fields");
        setIsLoading(false);
        return;
      }
      const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!regex.test(password)) {
        toast.error(
          "Password must contain minimum 8 characters, 1 number and a special character"
        );
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords don't match");
        setIsLoading(false);
        return;
      }
      signIn("credentials", {
        ...data,
        redirect: false,
        register: "TRUE",
      })
        .then((callback) => {
          if (callback?.error) {
            toast.error(callback.error);
            return;
          }
          if (callback?.ok) {
            toast.success("Signed Up");
            router.push("/creator/profile");
          }
        })
        .finally(() => setIsLoading(false));
    }

    if (variant === "LOGIN") {
      signIn("credentials", {
        ...data,
        register: "FALSE",
        redirect: false,
      })
        .then((callback) => {
          if (callback?.error) {
            console.log(callback.error);
            toast.error(callback.error);
            return;
          }

          if (callback?.ok) {
            // router.push("/conversations");
            router.push("/creator/home");
            toast.success("Logged In");
          }
        })
        .finally(() => setIsLoading(false));
    }
  };

  const resendOtp = async () => {
    if (variant === "VERIFYOTP") {
      try {
        const res = await axios.post("/api/forgotPassword/sendOtp", { email });
        const data = res.data as SendOtp;
        if (data.status === 500 && data.msg) {
          toast.error(data.msg);
          setIsLoading(false);
          return;
        } else if (data.status === 200 && data.msg) {
          toast.success("OTP SENT");
          setVariant("VERIFYOTP");
        }
      } catch (error) {
        const e = error as unknown as any;
        console.log(e);
      }

      setIsLoading(false);
      return;
    }
  };

  const socialAction = (action: string) => {
    setIsLoading(true);

    signIn(action, { redirect: false })
      .then((callback) => {
        if (callback?.error) {
          toast.error("Invalid credentials!");
        }

        if (callback?.ok) {
          router.push("/creator/home");
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div
        className="
        bg-white
          px-4
          py-8
          shadow
          sm:rounded-lg
          sm:px-10
        "
      >
        {/* <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === "REGISTER" && (
            <Input
              disabled={isLoading}
              register={register}
              errors={errors}
              id="name"
              placeholder="Name"
              label="Name"
            />
          )}
          {(variant === "LOGIN" ||
            variant === "REGISTER" ||
            variant === "FORGOTPASSWORD") && (
              <Input
                disabled={isLoading}
                register={register}
                errors={errors}
                id="email"
                placeholder="Email"
                label="Email address"
                type="email"
              />
            )}
          {variant === "VERIFYOTP" && (
            <Input
              disabled={isLoading}
              register={register}
              errors={errors}
              id="otp"
              placeholder="OTP"
              label="OTP"
              type="text"
            />
          )}
          {(variant === "LOGIN" ||
            variant === "REGISTER" ||
            variant === "NEWPASSWORD") && (
              <Input
                disabled={isLoading}
                register={register}
                errors={errors}
                placeholder="Password"
                id="password"
                label="Password"
                type="password"
              />
            )}
          {(variant === "REGISTER" || variant === "NEWPASSWORD") && (
            <Input
              disabled={isLoading}
              register={register}
              errors={errors}
              placeholder="Confirm Password"
              id="confirmPassword"
              label="Confirm Password"
              type="password"
            />
          )}
          <div className="flex items-center flex-col justify-center">
            <Button disabled={isLoading} type="submit">
              {SubmitButtonValue[variant]}
            </Button>
            {variant === "VERIFYOTP" && (
              <div className="mt-[10px]">
                <Button
                  disabled={isLoading}
                  onClick={() => resendOtp()}
                  // fullWidth
                  type="button"
                >
                  Resend OTP
                </Button>
              </div>
            )}
          </div>
          <div
            className="
            flex 
            gap-2 
            justify-center 
            text-sm 
            mt-6 
            px-2 
            text-gray-500
            underline cursor-pointer
          "
          >
            <div
              onClick={() => {
                setVariant("FORGOTPASSWORD");
              }}
            >
              {variant === "LOGIN" ? "Forgot your password?" : ""}
            </div>
          </div>
        </form> */}

        <div className="mt-6">
          {/* <div className="relative">
            <div
              className="
                absolute 
                inset-0 
                flex 
                items-center
                
              "
            >
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div> */}

          <div className="mt-6 flex  items-center justify-center gap-2">
            <AuthSocialButton
              icon={FcGoogle}
              onClick={() => socialAction("google")}
            />
            {/* <AuthSocialButton
              icon={AiFillLinkedin}
              onClick={() => socialAction("linkedin")}
            /> */}
          </div>
        </div>
        <div
          className="
            flex 
            gap-2 
            justify-center 
            text-sm 
            mt-6 
            px-2 
            text-gray-500
          "
        >
          {/* <div>
            {variant === "LOGIN"
              ? "New to JOI?"
              : "Already have an account?"}
          </div>
          <div onClick={toggleVariant} className="underline cursor-pointer">
            {variant === "LOGIN" ? "Create an account" : "Login"}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
