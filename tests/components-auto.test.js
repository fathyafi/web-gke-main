import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

// Auto-import semua file Vue dari folder src/components/
const components = import.meta.glob('../src/components/*.vue', { eager: true })

describe('🧪 Auto test components rendering', () => {
  for (const [path, component] of Object.entries(components)) {
    it(`should render ${path}`, () => {
      const wrapper = mount(component.default)
      expect(wrapper.exists()).toBe(true)
    })
  }
})
