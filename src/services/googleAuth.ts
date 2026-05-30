interface GoogleCredentialResponse {
  credential?: string
}

interface GoogleIdentityConfig {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
}

interface GoogleIdentity {
  initialize: (config: GoogleIdentityConfig) => void
  renderButton: (parent: HTMLElement, options: Record<string, string>) => void
}

interface GoogleAccounts {
  id: GoogleIdentity
}

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts
    }
  }
}

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.id) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Google')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleIdentity = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar Google'))
    document.head.appendChild(script)
  })
}

export async function requestGoogleIdToken(clientId: string): Promise<string> {
  await loadGoogleIdentityScript()

  if (!window.google?.accounts?.id) {
    throw new Error('Google Sign-In no disponible')
  }

  return new Promise((resolve, reject) => {
    const wrapper = document.createElement('div')
    wrapper.setAttribute('aria-hidden', 'true')
    wrapper.style.cssText = 'position:fixed;opacity:0;pointer-events:none;inset:0;'
    document.body.appendChild(wrapper)

    const cleanup = () => wrapper.remove()

    window.google!.accounts.id.initialize({
      client_id: clientId,
      callback: ({ credential }) => {
        cleanup()
        if (credential) resolve(credential)
        else reject(new Error('Autenticación con Google cancelada'))
      },
    })

    window.google!.accounts.id.renderButton(wrapper, {
      theme: 'outline',
      size: 'large',
    })

    requestAnimationFrame(() => {
      const button = wrapper.querySelector('[role="button"]') as HTMLElement | null
      if (!button) {
        cleanup()
        reject(new Error('Google Sign-In no disponible'))
        return
      }
      button.click()
    })
  })
}
