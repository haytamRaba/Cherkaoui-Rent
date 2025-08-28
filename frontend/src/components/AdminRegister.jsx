import React, { useState } from "react";
import { registerAdmin } from "../services/api";
import { useTranslation } from "react-i18next";

export default function AdminRegister() {
  const { t } = useTranslation();
  // const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [form, setForm] = useState({
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "admin" 
});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await registerAdmin(form);
      setSuccess(true);
      setForm({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "admin"
    });
    } catch (err) {
      setError(err?.response?.data?.message || t("Erreur lors de la création"));
    }
    setLoading(false);
  };

  return (
    <div className="contents max-w-md w-full mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6  text-gray-700 flex items-center justify-between">
        {t("ajouter un utilisateur admin")}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
  <label className="block mb-1 text-sm font-medium text-gray-700">
    {t("Nom d’utilisateur")}
  </label>
  <input
    name="username"
    value={form.username}
    onChange={handleChange}
    placeholder={t("Nom utilisateur ")}
    required
    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
</div>

<div>
  <label className="block mb-1 text-sm font-medium text-gray-700">
    {t("Prénom")}
  </label>
  <input
    name="firstName"
    value={form.firstName}
    onChange={handleChange}
    placeholder={t("Prénom")}
    required
    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
</div>

<div>
  <label className="block mb-1 text-sm font-medium text-gray-700">
    {t("Nom")}
  </label>
  <input
    name="lastName"
    value={form.lastName}
    onChange={handleChange}
    placeholder={t("Nom")}
    required
    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
</div>


        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {t("Email")}
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t("Email")}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {t("Mot de passe")}
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t("Mot de passe")}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-150"
        >
          {loading ? t("Création...") : t("ajout")}
        </button>
        {error && (
          <div className="text-red-600 text-sm text-center mt-2">{error}</div>
        )}
        {success && (
          <div className="text-green-600 text-sm text-center mt-2">
            {t("Compte admin créé avec succès")}
          </div>
        )}
      </form>
    </div>
  );
}
