import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../api/axiosInstance";
import { Button } from "./ui/button";

export function AdminLink() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    axiosInstance
      .get("/api/user", {
        signal: controller.signal,
        validateStatus: (s) => (s >= 200 && s < 300) || s === 401,
      })
      .then((res) => {
        if (res.status === 401) {
          setUser(null); 
          return;
        }
        setUser(res.data);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  if (loading) return null;
  if (!user || !user.is_admin) return null;

  return (
    <div>
      <Button
        asChild
        variant="ghost"
        className="text-xl text-red-500 font-medium hover:text-red-500 hover:underline"
      >
        <Link to="/admin/dashboard">Admin</Link>
      </Button>
    </div>
  );
}
