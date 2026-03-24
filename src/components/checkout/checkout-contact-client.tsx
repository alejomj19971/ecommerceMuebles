"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const FORM_ID = "checkout-contacto";

type FormValues = {
  nombre: string;
  apellido: string;
  email: string;
  direccion: string;
  ciudad: string;
  telefono: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initial: FormValues = {
  nombre: "",
  apellido: "",
  email: "",
  direccion: "",
  ciudad: "",
  telefono: "",
};

function validate(values: FormValues): FieldErrors {
  const e: FieldErrors = {};
  const nombre = values.nombre.trim();
  const apellido = values.apellido.trim();
  const email = values.email.trim();
  const direccion = values.direccion.trim();
  const ciudad = values.ciudad.trim();
  const telefono = values.telefono.trim();

  if (!nombre) e.nombre = "El nombre es obligatorio.";
  else if (nombre.length < 2) e.nombre = "Indica al menos 2 caracteres.";

  if (!apellido) e.apellido = "El apellido es obligatorio.";
  else if (apellido.length < 2) e.apellido = "Indica al menos 2 caracteres.";

  if (!email) e.email = "El correo es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) {
    e.email = "Introduce un correo electrónico válido.";
  }

  if (!direccion) e.direccion = "La dirección de entrega es obligatoria.";
  else if (direccion.length < 5) e.direccion = "La dirección parece demasiado corta.";

  if (!ciudad) e.ciudad = "La ciudad es obligatoria.";
  else if (ciudad.length < 2) e.ciudad = "Indica una ciudad válida.";

  const digitosTel = telefono.replace(/\D/g, "");
  if (!telefono) e.telefono = "El teléfono es obligatorio.";
  else if (digitosTel.length < 7) e.telefono = "Introduce un número de teléfono válido (mín. 7 dígitos).";
  else if (digitosTel.length > 15) e.telefono = "El número de teléfono es demasiado largo.";

  return e;
}

function fieldClass(hasError: boolean) {
  return [
    "mt-1 w-full rounded-xl border px-3 py-2 outline-none transition-colors",
    hasError
      ? "border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-2 focus:ring-red-200"
      : "border-[#ddd] focus:border-[#1f1f1f] focus:ring-2 focus:ring-[#1f1f1f]/15",
  ].join(" ");
}

type Props = {
  subtotalLabel: string;
  envioLabel: string;
  totalLabel: string;
};

export function CheckoutContactClient({
  subtotalLabel,
  envioLabel,
  totalLabel,
}: Props) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>(
    {}
  );

  function update<K extends keyof FormValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function blurField(key: keyof FormValues) {
    setTouched((t) => ({ ...t, [key]: true }));
    const all = validate(values);
    setErrors((prev) => {
      const next = { ...prev };
      if (all[key]) next[key] = all[key];
      else delete next[key];
      return next;
    });
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    const keys = Object.keys(nextErrors) as (keyof FormValues)[];
    if (keys.length > 0) {
      setTouched({
        nombre: true,
        apellido: true,
        email: true,
        direccion: true,
        ciudad: true,
        telefono: true,
      });
      const el = document.getElementById(`${FORM_ID}-${keys[0]}`);
      el?.focus();
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    router.push("/checkout/confirmacion");
  }

  const showError = (key: keyof FormValues) =>
    Boolean(errors[key] && (touched[key] || Object.keys(errors).length > 0));

  return (
    <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
        <h2 className="mb-5 text-xl font-semibold">Informacion de contacto</h2>
        <form id={FORM_ID} className="grid gap-4 sm:grid-cols-2" noValidate onSubmit={onSubmit}>
          <div className="text-sm sm:col-span-1">
            <label htmlFor={`${FORM_ID}-nombre`} className="font-medium text-[#1f1f1f]">
              Nombre <span className="text-red-600">*</span>
            </label>
            <input
              id={`${FORM_ID}-nombre`}
              name="nombre"
              autoComplete="given-name"
              value={values.nombre}
              onChange={(ev) => update("nombre", ev.target.value)}
              onBlur={() => blurField("nombre")}
              className={fieldClass(showError("nombre"))}
              placeholder="Ej. Alejandro"
              aria-invalid={showError("nombre")}
              aria-describedby={showError("nombre") ? `${FORM_ID}-nombre-err` : undefined}
            />
            {showError("nombre") ? (
              <p id={`${FORM_ID}-nombre-err`} className="mt-1 text-xs text-red-600" role="alert">
                {errors.nombre}
              </p>
            ) : null}
          </div>

          <div className="text-sm sm:col-span-1">
            <label htmlFor={`${FORM_ID}-apellido`} className="font-medium text-[#1f1f1f]">
              Apellido <span className="text-red-600">*</span>
            </label>
            <input
              id={`${FORM_ID}-apellido`}
              name="apellido"
              autoComplete="family-name"
              value={values.apellido}
              onChange={(ev) => update("apellido", ev.target.value)}
              onBlur={() => blurField("apellido")}
              className={fieldClass(showError("apellido"))}
              placeholder="Ej. Munera"
              aria-invalid={showError("apellido")}
              aria-describedby={showError("apellido") ? `${FORM_ID}-apellido-err` : undefined}
            />
            {showError("apellido") ? (
              <p id={`${FORM_ID}-apellido-err`} className="mt-1 text-xs text-red-600" role="alert">
                {errors.apellido}
              </p>
            ) : null}
          </div>

          <div className="text-sm sm:col-span-2">
            <label htmlFor={`${FORM_ID}-email`} className="font-medium text-[#1f1f1f]">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              id={`${FORM_ID}-email`}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={values.email}
              onChange={(ev) => update("email", ev.target.value)}
              onBlur={() => blurField("email")}
              className={fieldClass(showError("email"))}
              placeholder="correo@ejemplo.com"
              aria-invalid={showError("email")}
              aria-describedby={showError("email") ? `${FORM_ID}-email-err` : undefined}
            />
            {showError("email") ? (
              <p id={`${FORM_ID}-email-err`} className="mt-1 text-xs text-red-600" role="alert">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="text-sm sm:col-span-2">
            <label htmlFor={`${FORM_ID}-direccion`} className="font-medium text-[#1f1f1f]">
              Direccion de entrega <span className="text-red-600">*</span>
            </label>
            <input
              id={`${FORM_ID}-direccion`}
              name="direccion"
              autoComplete="street-address"
              value={values.direccion}
              onChange={(ev) => update("direccion", ev.target.value)}
              onBlur={() => blurField("direccion")}
              className={fieldClass(showError("direccion"))}
              placeholder="Calle, número, barrio"
              aria-invalid={showError("direccion")}
              aria-describedby={showError("direccion") ? `${FORM_ID}-direccion-err` : undefined}
            />
            {showError("direccion") ? (
              <p id={`${FORM_ID}-direccion-err`} className="mt-1 text-xs text-red-600" role="alert">
                {errors.direccion}
              </p>
            ) : null}
          </div>

          <div className="text-sm">
            <label htmlFor={`${FORM_ID}-ciudad`} className="font-medium text-[#1f1f1f]">
              Ciudad <span className="text-red-600">*</span>
            </label>
            <input
              id={`${FORM_ID}-ciudad`}
              name="ciudad"
              autoComplete="address-level2"
              value={values.ciudad}
              onChange={(ev) => update("ciudad", ev.target.value)}
              onBlur={() => blurField("ciudad")}
              className={fieldClass(showError("ciudad"))}
              placeholder="Ej. Medellín"
              aria-invalid={showError("ciudad")}
              aria-describedby={showError("ciudad") ? `${FORM_ID}-ciudad-err` : undefined}
            />
            {showError("ciudad") ? (
              <p id={`${FORM_ID}-ciudad-err`} className="mt-1 text-xs text-red-600" role="alert">
                {errors.ciudad}
              </p>
            ) : null}
          </div>

          <div className="text-sm">
            <label htmlFor={`${FORM_ID}-telefono`} className="font-medium text-[#1f1f1f]">
              Telefono <span className="text-red-600">*</span>
            </label>
            <input
              id={`${FORM_ID}-telefono`}
              name="telefono"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={values.telefono}
              onChange={(ev) => update("telefono", ev.target.value)}
              onBlur={() => blurField("telefono")}
              className={fieldClass(showError("telefono"))}
              placeholder="+57 300 000 0000"
              aria-invalid={showError("telefono")}
              aria-describedby={showError("telefono") ? `${FORM_ID}-telefono-err` : undefined}
            />
            {showError("telefono") ? (
              <p id={`${FORM_ID}-telefono-err`} className="mt-1 text-xs text-red-600" role="alert">
                {errors.telefono}
              </p>
            ) : null}
          </div>

          <p className="text-xs text-[#666] sm:col-span-2">
            Los campos marcados con <span className="text-red-600">*</span> son obligatorios.
          </p>
        </form>
      </div>

      <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
        <h2 className="text-xl font-semibold">Resumen de orden</h2>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{subtotalLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Envio</span>
            <span>{envioLabel}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[#ece8df] pt-3 text-base font-semibold">
            <span>Total</span>
            <span>{totalLabel}</span>
          </div>
        </div>
        <button
          type="submit"
          form={FORM_ID}
          className="mt-6 w-full rounded-full bg-[#1f1f1f] px-6 py-3 text-center text-sm font-semibold text-white"
        >
          Finalizar compra
        </button>
        <p className="mt-3 text-xs text-[#666]">
          Este checkout es visual. No procesa pagos reales en esta etapa.
        </p>
      </aside>
    </section>
  );
}
