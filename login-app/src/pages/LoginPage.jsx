import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const loadGoogleScript = () => {
      if (document.getElementById("google-oauth")) return;

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.id = "google-oauth";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleLogin;
      document.body.appendChild(script);
    };

    const initializeGoogleLogin = () => {
      if (!window.google) return;

      google.accounts.id.initialize({
        client_id: "932448113843-5ljndtq6d6okfo7gm340jvkflmlfso1e.apps.googleusercontent.com",  
        callback: handleGoogleResponse,
      });

      google.accounts.id.renderButton(
        document.getElementById("google-signin"),
        { theme: "outline", size: "large", width: "330" }
      );
    };

    loadGoogleScript();
  }, []);

  const handleGoogleResponse = async (response) => {
  try {
    const res = await fetch("http://localhost:5275/api/auth/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential }),
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!res.ok) {
      alert(data);
      return;
    }

    localStorage.setItem("token", data.token);
    alert("Google login successful!");

  } catch (err) {
    alert("Google login failed: " + err.message);
  }
};

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5275/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, password }),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }

    if (!res.ok) {
      alert(data);
      return;
    }

    localStorage.setItem("token", data.token);
    alert("Login successful!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md rounded-3xl shadow-xl bg-white">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Login to your account
          </h2>

          <div className="mb-6">
            <div className="flex items-center gap-2 border rounded-xl px-4 py-3 bg-gray-50">
              <Mail className="w-5 h-5 text-gray-500" />
              <Input
                placeholder="Enter your email or username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-none shadow-none bg-transparent focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 border rounded-xl px-4 py-3 bg-gray-50">
              <Lock className="w-5 h-5 text-gray-500" />
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-none shadow-none bg-transparent focus-visible:ring-0"
              />
            </div>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 text-[15px] rounded-xl hover:bg-blue-700 transition"
          >
            Continue
          </Button>

          <div className="my-6 flex items-center">
            <Separator className="flex-1" />
            <span className="px-4 text-sm text-gray-500">or</span>
            <Separator className="flex-1" />
          </div>

          <div id="google-signin" className="w-full flex justify-center"></div>
        </CardContent>
      </Card>
    </div>
  );
}
