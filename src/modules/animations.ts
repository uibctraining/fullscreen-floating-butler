/**
 * 99Pages Agentic OS - Animation Utilities
 * ==========================================
 * 
 * Smooth animations and transitions for the UI
 */

export interface AnimationConfig {
  duration: number
  easing: string
  delay?: number
}

export const ANIMATIONS = {
  // Fade animations
  fadeIn: {
    duration: 300,
    easing: 'ease-out'
  },
  fadeOut: {
    duration: 200,
    easing: 'ease-in'
  },
  
  // Slide animations
  slideInLeft: {
    duration: 300,
    easing: 'ease-out'
  },
  slideInRight: {
    duration: 300,
    easing: 'ease-out'
  },
  slideInUp: {
    duration: 300,
    easing: 'ease-out'
  },
  slideInDown: {
    duration: 300,
    easing: 'ease-out'
  },
  
  // Scale animations
  scaleIn: {
    duration: 200,
    easing: 'ease-out'
  },
  scaleOut: {
    duration: 150,
    easing: 'ease-in'
  },
  
  // Bounce
  bounce: {
    duration: 500,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  
  // Spring
  spring: {
    duration: 400,
    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  }
}

export class AnimationManager {
  /**
   * Animate element with CSS transition
   */
  static animate(
    element: HTMLElement,
    properties: Record<string, string | number>,
    config: AnimationConfig = ANIMATIONS.fadeIn
  ): Promise<void> {
    return new Promise((resolve) => {
      const { duration, easing, delay = 0 } = config
      
      element.style.transition = `all ${duration}ms ${easing} ${delay}ms`
      
      Object.entries(properties).forEach(([key, value]) => {
        element.style[key as any] = String(value)
      })
      
      setTimeout(() => {
        resolve()
      }, duration + delay)
    })
  }

  /**
   * Fade in element
   */
  static fadeIn(element: HTMLElement, duration = 300): Promise<void> {
    element.style.opacity = '0'
    element.style.display = 'block'
    
    return this.animate(element, { opacity: '1' }, { duration, easing: 'ease-out' })
  }

  /**
   * Fade out element
   */
  static fadeOut(element: HTMLElement, duration = 200): Promise<void> {
    return new Promise((resolve) => {
      this.animate(element, { opacity: '0' }, { duration, easing: 'ease-in' })
        .then(() => {
          element.style.display = 'none'
          resolve()
        })
    })
  }

  /**
   * Slide in from direction
   */
  static slideIn(
    element: HTMLElement,
    direction: 'left' | 'right' | 'up' | 'down' = 'right',
    duration = 300
  ): Promise<void> {
    const transforms: Record<string, string> = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      up: 'translateY(-100%)',
      down: 'translateY(100%)'
    }
    
    element.style.transform = transforms[direction]
    element.style.display = 'block'
    
    return this.animate(element, { transform: 'translate(0)' }, { duration, easing: 'ease-out' })
  }

  /**
   * Scale in element
   */
  static scaleIn(element: HTMLElement, duration = 200): Promise<void> {
    element.style.transform = 'scale(0.8)'
    element.style.opacity = '0'
    element.style.display = 'block'
    
    return this.animate(
      element,
      { transform: 'scale(1)', opacity: '1' },
      { duration, easing: 'ease-out' }
    )
  }

  /**
   * Bounce animation
   */
  static bounce(element: HTMLElement): Promise<void> {
    element.style.display = 'block'
    
    return this.animate(
      element,
      { transform: 'scale(1)' },
      ANIMATIONS.bounce
    )
  }

  /**
   * Pulse animation
   */
  static pulse(element: HTMLElement, count = 3): Promise<void> {
    return new Promise(async (resolve) => {
      for (let i = 0; i < count; i++) {
        await this.animate(element, { transform: 'scale(1.05)' }, { duration: 150, easing: 'ease-in' })
        await this.animate(element, { transform: 'scale(1)' }, { duration: 150, easing: 'ease-out' })
      }
      resolve()
    })
  }

  /**
   * Shake animation
   */
  static shake(element: HTMLElement): Promise<void> {
    return new Promise(async (resolve) => {
      const original = element.style.transform
      
      await this.animate(element, { transform: 'translateX(-5px)' }, { duration: 50, easing: 'ease-in-out' })
      await this.animate(element, { transform: 'translateX(5px)' }, { duration: 50, easing: 'ease-in-out' })
      await this.animate(element, { transform: 'translateX(-5px)' }, { duration: 50, easing: 'ease-in-out' })
      await this.animate(element, { transform: 'translateX(0)' }, { duration: 50, easing: 'ease-in-out' })
      
      element.style.transform = original
      resolve()
    })
  }
}

// CSS Animation classes
export const CSS_ANIMATIONS = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes slideInRight {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  
  @keyframes slideInLeft {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
  
  @keyframes slideInUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  
  @keyframes slideInDown {
    from { transform: translateY(-100%); }
    to { transform: translateY(0); }
  }
  
  @keyframes scaleIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-20px); }
    60% { transform: translateY(-10px); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  
  @keyframes glow {
    0% { box-shadow: 0 0 5px rgba(0, 200, 255, 0.2); }
    50% { box-shadow: 0 0 20px rgba(0, 200, 255, 0.4); }
    100% { box-shadow: 0 0 5px rgba(0, 200, 255, 0.2); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  .animate-fade-in { animation: fadeIn 0.3s ease-out; }
  .animate-fade-out { animation: fadeOut 0.2s ease-in; }
  .animate-slide-in-right { animation: slideInRight 0.3s ease-out; }
  .animate-slide-in-left { animation: slideInLeft 0.3s ease-out; }
  .animate-slide-in-up { animation: slideInUp 0.3s ease-out; }
  .animate-slide-in-down { animation: slideInDown 0.3s ease-out; }
  .animate-scale-in { animation: scaleIn 0.2s ease-out; }
  .animate-bounce { animation: bounce 0.5s; }
  .animate-pulse { animation: pulse 2s infinite; }
  .animate-shake { animation: shake 0.5s; }
  .animate-glow { animation: glow 2s infinite; }
  .animate-float { animation: float 3s ease-in-out infinite; }
`
