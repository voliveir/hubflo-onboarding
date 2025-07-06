import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			brand: {
  				DEFAULT: '#070720',   // navy
  				foreground: '#F9FAFB',
  				gold: '#EAB308',
  				'gold-hover': '#D4A029',
  				'gold-light': '#F4E4A3',
  				'gold-lighter': '#FDF8E7',
  				'navy-light': '#0A0A2A',
  				'navy-lighter': '#0F0F3A',
  				'navy-dark': '#050515',
  				'navy-darker': '#030310',
  			},
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'2xl': '1rem',
  			'3xl': '1.5rem',
  			'4xl': '2rem',
  		},
  		fontFamily: {
  			sans: ['Inter', 'var(--font-inter)', 'system-ui', 'sans-serif'],
  		},
  		fontSize: {
  			'2xs': ['0.625rem', { lineHeight: '0.75rem' }],
  			'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  			'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  			'5xl': ['3rem', { lineHeight: '1' }],
  			'6xl': ['3.75rem', { lineHeight: '1' }],
  			'7xl': ['4.5rem', { lineHeight: '1' }],
  			'8xl': ['6rem', { lineHeight: '1' }],
  			'9xl': ['8rem', { lineHeight: '1' }],
  		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  			'128': '32rem',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'float': {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-20px)'
  				}
  			},
  			'portal-drift': {
  				'0%': {
  					transform: 'translate(0, 0) rotate(0deg)'
  				},
  				'25%': {
  					transform: 'translate(10px, -10px) rotate(90deg)'
  				},
  				'50%': {
  					transform: 'translate(0, -20px) rotate(180deg)'
  				},
  				'75%': {
  					transform: 'translate(-10px, -10px) rotate(270deg)'
  				},
  				'100%': {
  					transform: 'translate(0, 0) rotate(360deg)'
  				}
  			},
  			'bounce-subtle': {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-4px)'
  				}
  			},
  			'fade-in-up': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(30px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'scale-in': {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.9)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			'slide-in-left': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(-30px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'slide-in-right': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(30px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'pulse-glow': {
  				'0%, 100%': {
  					boxShadow: '0 0 20px rgba(234, 179, 8, 0.3)'
  				},
  				'50%': {
  					boxShadow: '0 0 40px rgba(234, 179, 8, 0.6)'
  				}
  			},
  			'gradient-shift': {
  				'0%, 100%': {
  					backgroundPosition: '0% 50%'
  				},
  				'50%': {
  					backgroundPosition: '100% 50%'
  				}
  			},
  			'text-glow': {
  				'0%, 100%': {
  					textShadow: '0 0 20px rgba(234, 179, 8, 0.5)'
  				},
  				'50%': {
  					textShadow: '0 0 40px rgba(234, 179, 8, 0.8)'
  				}
  			},
  			'ripple': {
  				'0%': {
  					transform: 'scale(0)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'scale(4)',
  					opacity: '0'
  				}
  			},
  			'wiggle': {
  				'0%, 100%': {
  					transform: 'rotate(-3deg)'
  				},
  				'50%': {
  					transform: 'rotate(3deg)'
  				}
  			},
  			'heartbeat': {
  				'0%, 100%': {
  					transform: 'scale(1)'
  				},
  				'50%': {
  					transform: 'scale(1.05)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'float': 'float 6s ease-in-out infinite',
  			'portal-drift': 'portal-drift 15s ease-in-out infinite',
  			'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
  			'fade-in-up': 'fade-in-up 0.6s ease-out',
  			'scale-in': 'scale-in 0.4s ease-out',
  			'slide-in-left': 'slide-in-left 0.6s ease-out',
  			'slide-in-right': 'slide-in-right 0.6s ease-out',
  			'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
  			'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
  			'text-glow': 'text-glow 2s ease-in-out infinite',
  			'ripple': 'ripple 0.6s ease-out',
  			'wiggle': 'wiggle 1s ease-in-out infinite',
  			'heartbeat': 'heartbeat 2s ease-in-out infinite'
  		},
  		backdropBlur: {
  			xs: '2px',
  		},
  		boxShadow: {
  			'glow': '0 0 20px rgba(234, 179, 8, 0.3)',
  			'glow-lg': '0 0 40px rgba(234, 179, 8, 0.5)',
  			'glow-xl': '0 0 60px rgba(234, 179, 8, 0.7)',
  			'inner-glow': 'inset 0 0 20px rgba(234, 179, 8, 0.2)',
  			'neumorphism': '20px 20px 60px #d1d9e6, -20px -20px 60px #ffffff',
  			'neumorphism-dark': '20px 20px 60px #0a0a2a, -20px -20px 60px #0f0f3a',
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			'gradient-premium': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  			'gradient-gold': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  			'gradient-sunset': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
