import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const { authUser, setAuthUser } = useAuthContext();

  const signup = async ({
    username,
    email,
    password,
    confirmPassword,
    faceDescriptor,
  }) => {
    const success = handleInputErrors({
      username,
      email,
      password,
      confirmPassword,
    });
    if (!success) return { error: true };

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirmpassword", confirmPassword);

    if (faceDescriptor) {
      formData.append("faceDescriptor", JSON.stringify(faceDescriptor));
    }

    setLoading(true);

    try {
      const apiEndpoint = faceDescriptor
        ? "/api/auth/signupFacial"
        : "/api/auth/signup";

      const res = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });

      const responseText = await res.text();
      let data = {};
      
      // Intentar parsear la respuesta como JSON
      try {
        if (responseText) {
          data = JSON.parse(responseText);
        }
      } catch (parseError) {
        // Si no es JSON válido, usar el texto como mensaje de error
        throw new Error(responseText || `Error ${res.status}: ${res.statusText}`);
      }

      // Si hay un error en la respuesta o el status no es OK
      if (!res.ok || data.error) {
        const errorMessage = data.error || data.message || `Error ${res.status}: ${res.statusText}`;
        toast.error(errorMessage);
        // NO actualizar authUser ni navegar si hay error
        return { error: true };
      }

      // Solo si llegamos aquí, el registro fue exitoso
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.sessionId) {
        localStorage.setItem("sessionId", data.sessionId);
      }

      localStorage.setItem("chat-user", JSON.stringify(data));
      setAuthUser(data);
      toast.success("Signup successful");
      return { success: true, data };
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error(error.message || "Error during registration. Please try again.");
      // Asegurarse de que NO se actualice authUser si hay error
      // El usuario permanecerá en la pantalla de registro
      return { error: true };
    } finally {
      setLoading(false);
    }
  };

  return { loading, signup };
};

function handleInputErrors({ username, password, confirmPassword }) {
  if (!username || !password || !confirmPassword) {
    toast.error("Please fill all the fields");
    return false;
  }

  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return false;
  }

  if (password.length < 6) {
    toast.error("Password must be at least 6 characters long");
    return false;
  }

  return true;
}

export default useSignup;
