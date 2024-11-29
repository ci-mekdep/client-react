import { useEffect } from 'react'

const useKeyboardSubmit = (
  submitCallback: () => void,
  submitAndListCallback: () => void,
  ignoredElements: string[] = [
    'input',
    'select',
    'textarea',
    '[role="combobox"]',
    '[type="checkbox"]',
    '[role="button"]',
    '[data-ignore="true"]'
  ]
) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const activeElement = document.activeElement
      const activeElementClasses = document.activeElement?.classList.value || ''

      if (event.key === 'Enter' && activeElement) {
        const shouldIgnore =
          ignoredElements.some(selector => activeElement.matches(selector)) ||
          activeElementClasses.includes('MuiSelect-select')

        if (!shouldIgnore) {
          event.preventDefault()
          if (event.ctrlKey) {
            submitCallback()
          } else {
            submitAndListCallback()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [submitCallback, submitAndListCallback, ignoredElements])
}

export default useKeyboardSubmit
