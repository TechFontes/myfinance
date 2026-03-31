import type { ComponentType, ReactElement, ReactNode } from "react"
import { render, type RenderOptions } from "@testing-library/react"

type WrapperProps = {
  children: ReactNode
}

type ExtendedRenderOptions = Omit<RenderOptions, "wrapper"> & {
  wrapper?: ComponentType<WrapperProps>
}

function DefaultWrapper({ children }: WrapperProps) {
  return <>{children}</>
}

export function renderWithProviders(
  ui: ReactElement,
  options?: ExtendedRenderOptions,
) {
  const { wrapper = DefaultWrapper, ...rest } = options ?? {}
  return render(ui, { wrapper, ...rest })
}

export * from "@testing-library/react"
