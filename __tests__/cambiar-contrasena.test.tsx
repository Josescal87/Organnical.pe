import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      updateUser: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: { user_metadata: { role: "doctor" } } },
      }),
      signOut: vi.fn().mockResolvedValue({}),
    },
  }),
}))

const { default: CambiarContrasenaPage } = await import(
  "@/app/dashboard/cambiar-contrasena/page"
)

describe("CambiarContrasenaPage — validaciones cliente", () => {
  beforeEach(() => {
    render(<CambiarContrasenaPage />)
  })

  it("muestra error si la contraseña tiene menos de 8 caracteres", async () => {
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), {
      target: { value: "abc123" },
    })
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: "abc123" },
    })
    fireEvent.click(screen.getByRole("button", { name: /guardar contraseña/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/al menos 8 caracteres/i)
      ).toBeInTheDocument()
    })
  })

  it("muestra error si las contraseñas no coinciden", async () => {
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), {
      target: { value: "contraseña123" },
    })
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: "contraseña456" },
    })
    fireEvent.click(screen.getByRole("button", { name: /guardar contraseña/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/no coinciden/i)
      ).toBeInTheDocument()
    })
  })

  it("muestra el botón de cerrar sesión", () => {
    expect(
      screen.getByRole("button", { name: /cerrar sesión/i })
    ).toBeInTheDocument()
  })
})
