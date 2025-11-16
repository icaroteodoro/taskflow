"use client";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { login } from "@/services/auth-service";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");


  const [visiblePass, setVisiblePass] = useState(false);
  const changeVisiblePass = () => {
    setVisiblePass(!visiblePass);
  };

  const handleLogin = async () => {
    setIsLoading(true)
    setError('');
    try {
      await login({email, password});
      setIsLoading(false);
    }catch(error) {
      console.error(error);
      setError("Usuário ou senha inválidos!")
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-accent-foreground w-full h-screen flex items-center justify-center">
      <div className="bg-white w-80 rounded-md p-5">
        <div className="flex justify-center mb-5">
          {/* <Image className="w-full" alt="Logo" src={Logo} /> */}
        </div>

        <form className="mb-5" action="">
          <div className={`border border-red-500 p-3 bg-red-100 rounded-md mb-3 ${error ? 'flex': 'hidden'}`}>
            <p className="text-red-500 text-sm">
              {error}
            </p>
          </div>
          <div className="flex flex-col mb-3">
            <label className="text-sm" htmlFor="email">
              E-mail
            </label>
            <Input
              onChange={(e) => setEmail(e.target.value)}
              name="email"
              id="email"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm" htmlFor="password">
              Senha
            </label>
            <div className="relative">
              <Input
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                id="password"
                type={visiblePass ? "text" : "password"}
              />
              <Button
                type="button"
                onClick={() => changeVisiblePass()}
                className="bg-transparent hover:bg-transparent absolute right-1 top-[50%] translate-y-[-50%] text-zinc-400"
              >
                {visiblePass ? <EyeClosed /> : <Eye />}
              </Button>
            </div>
          </div>
          <Link className="text-xs underline" href="/">
            Esqueceu sua senha?
          </Link>
          <Button
            type="button"
            onClick={() => handleLogin()}
            className="w-full mt-5 hover:cursor-pointer"
          >
            {
              isLoading ?<div className="w-6 h-6 border-3 border-white border-t-primary rounded-full animate-spin"></div> : 'Login via e-mail'
            }
          </Button>
        </form>

        <div className="flex items-center justify-between mb-5">
          <div className="bg-zinc-300 h-0.5 w-15 rounded-2xl"></div>
          <p className="text-sm">Ou faça login com</p>
          <div className="bg-zinc-300 h-0.5 w-15 rounded-2xl"></div>
        </div>

        <Button className="w-full bg-red-600 hover:bg-red-500 mb-3 hover:cursor-pointer">
          GOOGLE
        </Button>
        <Link href="/register">
          <Button className="w-full bg-white hover:bg-zinc-100 text-black shadow-none hover:cursor-pointer">
            Crie sua conta grátis
          </Button>
        </Link>
      </div>
    </section>
  );
}